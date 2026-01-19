# src/components/gemma_nlu.py
import json
import subprocess
import re
from src.components.llm_base import BaseNLUModel
from src.utils.prompt_template import build_nlu_prompt


class GemmaNLU(BaseNLUModel):

    def __init__(self, model_name: str):
        super().__init__(model_name)

    def predict(self, text, intents_schema):
        prompt = build_nlu_prompt(text, intents_schema)

        process = subprocess.Popen(
            ["ollama", "run", self.model_name],
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=False
        )

        prompt_bytes = prompt.encode('utf-8')
        stdout_data, stderr_data = process.communicate(input=prompt_bytes)
        
        output = stdout_data.decode('utf-8', errors='replace')

        return self._safe_parse(output)

    def _safe_parse(self, raw_output: str) -> dict:
        """
        Extract JSON safely to avoid hallucinated text
        """
        # Extract JSON from potential markdown or extra text
        match = re.search(r"\{.*\}", raw_output, re.DOTALL)

        if not match:
            # If no JSON object found, treat the whole raw output as a response if it's text
            if raw_output and len(raw_output.strip()) > 5:
                 return {
                    "intent": "general_conversation",
                    "confidence": 0.5,
                    "entities": {},
                    "response": raw_output.strip()
                }
            return self._fallback()

        try:
            # Clean up potential markdown JSON markers if the match included them
            json_str = match.group()
            parsed = json.loads(json_str)
            return self._normalize(parsed)
        except Exception:
            return self._fallback()

    def _normalize(self, parsed: dict) -> dict:
        return {
            "intent": parsed.get("intent", "unknown"),
            "confidence": float(parsed.get("confidence", 0.5)),
            "entities": parsed.get("entities", {}),
            "response": parsed.get("response", "I'm sorry, I couldn't generate a specific response. How can I help you?")
        }

    def _fallback(self):
        return {
            "intent": "unknown",
            "confidence": 0.0,
            "entities": {},
            "response": "I'm here to help! Could you please clarify your request or provide more details?"
        }
