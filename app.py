import streamlit as st
import yaml
import os
import pandas as pd
from src.components.json_loader import load_intents
from src.components.gemma_nlu import GemmaNLU
from src.components.gemini_nlu import GeminiNLU
from src.components.evaluator import Evaluator
from src.utils.prompt_template import build_nlu_prompt

# Page Configuration
st.set_page_config(page_title="NLU Engine Demo", layout="wide", page_icon="🤖")

def load_config():
    try:
        with open("config/config.yaml", "r") as f:
            return yaml.safe_load(f)
    except FileNotFoundError:
        # Fallback config
        return {
            "llm": {"available_models": ["gemma", "gemini"]},
            "ollama": {"model_name": "gemma"},
            "gemini": {"model_name": "gemini-1.5-flash", "temperature": 0.3}
        }

config = load_config()

# Sidebar
st.sidebar.title("🛠️ Configuration")
model_type = st.sidebar.selectbox("Select Model", config["llm"]["available_models"], index=0)

if model_type == "gemma":
    model_name = st.sidebar.text_input("Ollama Model Name", value=config["ollama"].get("model_name", "gemma"))
    model = GemmaNLU(model_name)
elif model_type == "gemini":
    model_name = st.sidebar.text_input("Gemini Model Name", value=config["gemini"].get("model_name", "gemini-1.5-flash"))
    api_key = st.sidebar.text_input("Gemini API Key", type="password", value=config["gemini"].get("api_key", ""))
    temp = st.sidebar.slider("Temperature", 0.0, 1.0, config["gemini"].get("temperature", 0.3))
    if not api_key or api_key == "YOUR_GEMINI_API_KEY":
        st.sidebar.warning("⚠️ Please enter a valid Gemini API Key")
        model = None
    else:
        model = GeminiNLU(model_name, api_key, temperature=temp)

st.sidebar.markdown("---")
show_prompt = st.sidebar.checkbox("Show Raw Prompt", value=False)

# Load Intents
intents_path = "data/raw_data/intents.json"
try:
    intents_data = load_intents(intents_path)
except Exception as e:
    st.error(f"❌ Error loading intents: {e}")
    st.stop()

st.title("🚀 LLM-based NLU Engine")
st.markdown("""
This application uses Large Language Models to perform **Intent Classification** and **Entity Extraction**. 
You can switch between local models (via Ollama) and cloud models (via Google Gemini).
""")

# Main Tabs
tab1, tab2, tab3, tab4, tab5 = st.tabs(
    [
        "🔍 Single Query",
        "📊 Batch Test",
        "📈 Evaluation",
        "📚 Intent Schema",
        "⚖️ Performance"
    ]
)

with tab1:
    st.header("Test a Single Query")
    user_input = st.text_input("Enter your message:", placeholder="e.g., Book a flight to Delhi tomorrow")
    
    if st.button("Analyze Query", key="predict_btn"):
        if model is None:
            st.error("Model not configured correctly. Please check the sidebar settings.")
        elif user_input:
            with st.spinner("LLM is thinking..."):
                if show_prompt:
                    with st.expander("View Prompt"):
                        st.code(build_nlu_prompt(user_input, intents_data))
                
                result = model.predict(user_input, intents_data)
                
                if "error" in result:
                    st.error(result["error"])
                else:
                    col1, col2 = st.columns(2)
                    with col1:
                        st.success(f"**Intent:** {result.get('intent', 'unknown')}")
                        st.info(f"**Confidence:** {result.get('confidence', 0.0):.2f}")
                    
                    with col2:
                        st.subheader("Extracted Entities")
                        if result.get("entities"):
                            st.json(result["entities"])
                        else:
                            st.write("No entities found.")
        else:
            st.warning("Please enter a message to analyze.")

with tab2:
    st.header("Batch Testing")
    st.write("Run predictions on multiple examples from a specific intent.")
    
    selected_intent = st.selectbox("Select Intent to test", [i["name"] for i in intents_data["intents"]])
    intent_obj = next(i for i in intents_data["intents"] if i["name"] == selected_intent)
    examples = intent_obj["examples"]
    
    num_samples = st.slider("Number of samples to test", 1, len(examples), min(5, len(examples)))
    
    if st.button("Run Batch Test"):
        if model is None:
            st.error("Model not configured.")
        else:
            test_samples = examples[:num_samples]
            results = []
            progress_bar = st.progress(0)
            
            for idx, text in enumerate(test_samples):
                res = model.predict(text, intents_data)
                results.append({
                    "Text": text,
                    "Predicted Intent": res.get("intent"),
                    "Confidence": res.get("confidence"),
                    "Entities": res.get("entities")
                })
                progress_bar.progress((idx + 1) / len(test_samples))
            
            df = pd.DataFrame(results)
            st.dataframe(df, use_container_width=True)

with tab3:
    st.header("Evaluation Dashboard")
    st.write("This will run a sample prediction across all intents to calculate overall performance metrics.")
    
    samples_per_intent = st.number_input("Samples per intent", 1, 10, 2)
    
    if st.button("Start Full Evaluation"):
        if model is None:
            st.error("Model not configured.")
        else:
            all_tests = []
            for intent in intents_data["intents"]:
                samples = intent["examples"][:samples_per_intent]
                for text in samples:
                    all_tests.append({"text": text, "true_intent": intent["name"]})
            
            y_true = []
            y_pred = []
            
            progress_bar = st.progress(0)
            status_text = st.empty()
            
            for idx, test in enumerate(all_tests):
                status_text.text(f"Processing {idx+1}/{len(all_tests)}: {test['text'][:50]}...")
                res = model.predict(test["text"], intents_data)
                y_true.append(test["true_intent"])
                y_pred.append(res.get("intent", "unknown"))
                progress_bar.progress((idx + 1) / len(all_tests))
            
            status_text.text("Evaluation Complete!")
            
            try:
                evaluator = Evaluator()
                metrics = evaluator.evaluate(y_true, y_pred)
                
                col1, col2 = st.columns(2)
                col1.metric("Overall Accuracy", f"{metrics['accuracy']:.2%}")
                
                st.subheader("Classification Report")
                st.dataframe(pd.DataFrame(metrics["classification_report"]).transpose())
                
                st.subheader("Confusion Matrix")
                labels = sorted(list(set(y_true) | set(y_pred)))
                cm_df = pd.DataFrame(metrics["confusion_matrix"], index=labels, columns=labels)
                st.dataframe(cm_df)
            except Exception as e:
                st.error(f"Error calculating metrics: {e}")
                st.write("Raw Predictions:", y_pred)
                st.write("True Labels:", y_true)

with tab4:
    st.header("Intent Schema")
    st.write("Currently defined intents and entities in the system.")
    
    for intent in intents_data["intents"]:
        with st.expander(f"Intent: {intent['name']}"):
            st.write(f"**Entities:** {', '.join(intent.get('entities', []))}")
            st.write("**Examples:**")
            for ex in intent["examples"][:10]:
                st.write(f"- {ex}")
            if len(intent["examples"]) > 10:
                st.write(f"... and {len(intent['examples']) - 10} more.")

    st.header("Global Entities")
    st.json(intents_data.get("entities", {}))
with tab5:
    st.header("⚖️ Model Performance Comparison")
    st.write(
        "This section evaluates **both Gemma and Gemini** on the same set of intents "
        "and compares their overall performance using standard metrics and plots."
    )

    num_intents = st.slider(
        "Number of intents to evaluate",
        5,
        len(intents_data["intents"]),
        20
    )

    samples_per_intent = st.slider(
        "Samples per intent",
        1,
        5,
        2
    )

    if st.button("Run Model Comparison"):
        with st.spinner("Running inference on both models..."):

            # Initialize BOTH models
            gemma_model = GemmaNLU(config["ollama"]["model_name"])

            gemini_api_key = config["gemini"].get("api_key")
            if not gemini_api_key:
                st.error("Gemini API Key missing in config.yaml")
                st.stop()

            gemini_model = GeminiNLU(
                config["gemini"]["model_name"],
                gemini_api_key,
                temperature=config["gemini"]["temperature"]
            )

            selected_intents = intents_data["intents"][:num_intents]

            y_true, gemma_preds, gemini_preds = [], [], []

            progress = st.progress(0)
            total = num_intents * samples_per_intent
            count = 0

            for intent in selected_intents:
                for text in intent["examples"][:samples_per_intent]:
                    y_true.append(intent["name"])

                    gemma_preds.append(
                        gemma_model.predict(text, intents_data).get("intent", "unknown")
                    )
                    gemini_preds.append(
                        gemini_model.predict(text, intents_data).get("intent", "unknown")
                    )

                    count += 1
                    progress.progress(count / total)

            evaluator = Evaluator()
            gemma_metrics = evaluator.evaluate(y_true, gemma_preds)
            gemini_metrics = evaluator.evaluate(y_true, gemini_preds)

        # -------- METRICS --------
        st.subheader("📊 Overall Metrics")

        c1, c2, c3, c4 = st.columns(4)
        c1.metric("Accuracy (Gemma)", f"{gemma_metrics['accuracy']*100:.2f}%")
        c2.metric("Precision (Gemma)", f"{gemma_metrics['precision']*100:.2f}%")
        c3.metric("Recall (Gemma)", f"{gemma_metrics['recall']*100:.2f}%")
        c4.metric("F1 (Gemma)", f"{gemma_metrics['f1_score']*100:.2f}%")

        st.markdown("---")

        c1, c2, c3, c4 = st.columns(4)
        c1.metric("Accuracy (Gemini)", f"{gemini_metrics['accuracy']*100:.2f}%")
        c2.metric("Precision (Gemini)", f"{gemini_metrics['precision']*100:.2f}%")
        c3.metric("Recall (Gemini)", f"{gemini_metrics['recall']*100:.2f}%")
        c4.metric("F1 (Gemini)", f"{gemini_metrics['f1_score']*100:.2f}%")

        # -------- COMPARISON PLOT --------
        st.subheader("📈 Metric Comparison")

        df = pd.DataFrame({
            "Metric": ["Accuracy", "Precision", "Recall", "F1"],
            "Gemma": [
                gemma_metrics["accuracy"],
                gemma_metrics["precision"],
                gemma_metrics["recall"],
                gemma_metrics["f1_score"]
            ],
            "Gemini": [
                gemini_metrics["accuracy"],
                gemini_metrics["precision"],
                gemini_metrics["recall"],
                gemini_metrics["f1_score"]
            ]
        })

        st.dataframe(df, use_container_width=True)


        import matplotlib.pyplot as plt
        fig, ax = plt.subplots()

        x = range(len(df))
        ax.bar(x, df["Gemma"], width=0.35, label="Gemma")
        ax.bar([i + 0.35 for i in x], df["Gemini"], width=0.35, label="Gemini")

        ax.set_xticks([i + 0.17 for i in x])
        ax.set_xticklabels(df["Metric"])
        ax.set_ylabel("Score")
        ax.set_title("Gemma vs Gemini – NLU Performance")
        ax.legend()

        st.pyplot(fig)
