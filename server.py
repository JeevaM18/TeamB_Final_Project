from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
import yaml
import os
from dotenv import load_dotenv
import random

load_dotenv()
from src.components.json_loader import load_intents
from src.components.gemma_nlu import GemmaNLU
from src.components.qwen_nlu import QwenNLU
from src.components.evaluator import Evaluator
from src.utils.logger import log_query, read_logs, LOG_FILE

app = FastAPI(title="NLU Engine API")
# Trigger reload

# Enable CORS for the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify the frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load Config & Data
def load_config():
    try:
        with open("config/config.yaml", "r") as f:
            return yaml.safe_load(f)
    except FileNotFoundError:
        return {}

config = load_config()
intents_path = "data/raw_data/intents.json"
intents_data = load_intents(intents_path)

class AnalysisRequest(BaseModel):
    message: str
    model_type: str  # "gemma" or "qwen"
    model_name: Optional[str] = None
    api_key: Optional[str] = None
    temperature: Optional[float] = 0.3

class EvaluateRequest(BaseModel):
    samples_per_intent: int = 5
    model_type: Optional[str] = None
    model_name: Optional[str] = None
    api_key: Optional[str] = None
    temperature: Optional[float] = 0.3

class BatchTestRequest(BaseModel):
    intent: str
    num_samples: int
    model_type: Optional[str] = None
    model_name: Optional[str] = None
    api_key: Optional[str] = None
    temperature: Optional[float] = 0.3

class CompareRequest(BaseModel):
    num_intents: Optional[int] = None
    samples_per_intent: int = 5
    
def get_model_instance(model_type, model_name=None, api_key=None, temperature=0.3):
    """Helper to initialize model instance."""
    actual_model_name = None
    model = None

    # Default to gemma if not specified
    if not model_type:
        model_type = config.get("llm", {}).get("default_model", "gemma")

    if model_type == "gemma":
        actual_model_name = model_name or config.get("ollama", {}).get("model_name", "gemma")
        model = GemmaNLU(actual_model_name)
    elif model_type == "qwen":
        actual_model_name = model_name or config.get("qwen", {}).get("model_name", "qwen2.5:3b")
        # Qwen via Ollama doesn't need API key
        model = QwenNLU(actual_model_name)
    else:
        raise HTTPException(status_code=400, detail="Unknown model type")
    
    return model, actual_model_name

def transform_classification_report(report):
    """Transform sklearn report to match frontend expectations"""
    transformed = {}
    for key, value in report.items():
        if isinstance(value, dict):
            transformed[key] = {
                "precision": value.get("precision", 0),
                "recall": value.get("recall", 0),
                "f1": value.get("f1-score", 0),
                "support": value.get("support", 0)
            }
    return transformed

@app.get("/config")
def get_config():
    return config

@app.get("/intents")
def get_intents():
    return intents_data

@app.get("/history")
def get_history(limit: int = 200):
    """Return recent history entries (newest first)."""
    return read_logs(limit)

@app.delete("/history")
def clear_history():
    """Clear the history log file."""
    try:
        LOG_FILE.unlink(missing_ok=True)
        return {"status": "ok"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/analyze")
def analyze_query(req: AnalysisRequest):
    try:
        # Measure word count
        word_count = len(req.message.split())
        
        # Safely handle long inputs: truncate if exceeded
        processed_message = req.message
        if len(processed_message) > 4000:
            # Keep start (for context) and end (for the latest query)
            processed_message = processed_message[:500] + "\n... [truncated] ...\n" + processed_message[-3500:]

        model, model_name = get_model_instance(req.model_type, req.model_name, req.api_key, req.temperature)
            
        # Run prediction
        result = model.predict(processed_message, intents_data)
        
        # Ensure a valid response is always returned
        if not result or not isinstance(result, dict):
            result = {
                "intent": "unknown",
                "confidence": 0.0,
                "entities": {},
                "response": "I'm here to help! Could you please provide more details?"
            }
        
        if "response" not in result or not result["response"]:
            result["response"] = "I processed your request but couldn't generate a specific answer. How else can I assist you?"

        if "error" in result:
             if not result.get("response") or result.get("response").startswith("I'm here to help"):
                result["response"] = f"I encountered an issue: {result['error']}. However, I'm still here to help with other queries!"
        
        # Persist query to history (best-effort)
        try:
            log_query(req.message, req.model_type, result, model_name=model_name)
        except Exception:
            pass

        return result
    except Exception as e:
        return {
            "intent": "unknown",
            "confidence": 0.0,
            "entities": {},
            "response": f"I'm sorry, I encountered an error: {str(e)}. Please try again later.",
            "error": str(e)
        }

@app.post("/evaluate")
def evaluate_model(req: EvaluateRequest):
    try:
        model, _ = get_model_instance(req.model_type, req.model_name, req.api_key, req.temperature)
        evaluator = Evaluator()

        y_true = []
        y_pred = []
        test_samples = []

        # Prepare dataset
        for intent in intents_data.get("intents", []):
            intent_name = intent["name"]
            examples = intent.get("examples", [])
            
            # Sample examples
            count = min(len(examples), req.samples_per_intent)
            selected_examples = random.sample(examples, count)

            for example in selected_examples:
                test_samples.append((example, intent_name))

        # Run evaluation
        if not test_samples:
             return {
                "overall_accuracy": 0.0,
                "classification_report": {}
            }

        # Run evaluation
        print(f"Starting evaluation with {len(test_samples)} samples...")
        for i, (text, true_intent) in enumerate(test_samples):
            print(f"Processing sample {i+1}/{len(test_samples)}: {text[:50]}...")
            result = model.predict(text, intents_data)
            predicted_intent = result.get("intent", "unknown")
            
            y_true.append(true_intent)
            y_pred.append(predicted_intent)
        print("Evaluation complete.")

        metrics = evaluator.evaluate(y_true, y_pred)
        
        return {
            "overall_accuracy": metrics["accuracy"],
            "classification_report": transform_classification_report(metrics["classification_report"])
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/batch_test")
def batch_test(req: BatchTestRequest):
    try:
        model, _ = get_model_instance(req.model_type, req.model_name, req.api_key, req.temperature)
        results = []

        # Find the intent data
        target_intent = next((i for i in intents_data.get("intents", []) if i["name"] == req.intent), None)
        if not target_intent:
             raise HTTPException(status_code=404, detail=f"Intent '{req.intent}' not found")

        examples = target_intent.get("examples", [])
        count = min(len(examples), req.num_samples)
        selected_examples = random.sample(examples, count)

        for query in selected_examples:
            prediction = model.predict(query, intents_data)
            results.append({
                "text": query,
                "predicted_intent": prediction.get("intent", "unknown"),
                "confidence": prediction.get("confidence", 0.0),
                "entities": prediction.get("entities", {})
            })
        
        return results
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/compare_models")
def compare_models(req: CompareRequest):
    try:
        # Initialize both models (Gemma and Qwen default comparison)
        model_1, start_name_1 = get_model_instance("gemma")
        
        try:
            model_2, start_name_2 = get_model_instance("qwen")
        except Exception:
            model_2 = None
            start_name_2 = "qwen (Not Configured)"

        evaluator = Evaluator()
        
        test_samples = []
         # Prepare common dataset
        for intent in intents_data.get("intents", []):
            intent_name = intent["name"]
            examples = intent.get("examples", [])
            count = min(len(examples), req.samples_per_intent)
            selected_examples = random.sample(examples, count)
            for example in selected_examples:
                 test_samples.append((example, intent_name))

        y_true = [t[1] for t in test_samples]
        y_pred_1 = []
        y_pred_2 = []

        # Predict Model 1
        for text, _ in test_samples:
            res1 = model_1.predict(text, intents_data)
            y_pred_1.append(res1.get("intent", "unknown"))
            
        metrics_1 = evaluator.evaluate(y_true, y_pred_1)
        
        if model_2:
             for text, _ in test_samples:
                res2 = model_2.predict(text, intents_data)
                y_pred_2.append(res2.get("intent", "unknown"))
             metrics_2 = evaluator.evaluate(y_true, y_pred_2)
        else:
             metrics_2 = {"accuracy": 0, "classification_report": {}, "f1_score": 0, "precision": 0, "recall": 0}

        def get_model_metrics(m):
             return {
                 "accuracy": m["accuracy"],
                 "precision": m["precision"],
                 "recall": m["recall"],
                 "f1": m["f1_score"]
             }

        return {
            "gemma": get_model_metrics(metrics_1),
            "qwen": get_model_metrics(metrics_2)
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
