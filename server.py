from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any
import yaml
import os
from src.components.json_loader import load_intents
from src.components.gemma_nlu import GemmaNLU
from src.components.gemini_nlu import GeminiNLU

app = FastAPI(title="NLU Engine API")

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
    model_type: str  # "gemma" or "gemini"
    model_name: Optional[str] = None
    api_key: Optional[str] = None
    temperature: Optional[float] = 0.3

@app.get("/config")
def get_config():
    return config

@app.get("/intents")
def get_intents():
    return intents_data

@app.post("/analyze")
def analyze_query(req: AnalysisRequest):
    model = None
    try:
        if req.model_type == "gemma":
            name = req.model_name or config.get("ollama", {}).get("model_name", "gemma")
            model = GemmaNLU(name)
        elif req.model_type == "gemini":
            name = req.model_name or config.get("gemini", {}).get("model_name", "gemini-1.5-flash")
            key = req.api_key or config.get("gemini", {}).get("api_key")
            
            if not key or key == "YOUR_GEMINI_API_KEY":
                 raise HTTPException(status_code=400, detail="Invalid Gemini API Key")
            
            model = GeminiNLU(name, key, temperature=req.temperature)
        else:
            raise HTTPException(status_code=400, detail="Unknown model type")
            
        # Run prediction
        result = model.predict(req.message, intents_data)
        
        if "error" in result:
            # GemmaNLU might return a dict with "error" key
            raise HTTPException(status_code=500, detail=result["error"])
            
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
