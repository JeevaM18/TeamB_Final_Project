# src/components/gemini_nlu.py
import json
import re
from google import genai
from google.genai import types
from src.components.llm_base import BaseNLUModel
from src.utils.prompt_template import build_nlu_prompt


class GeminiNLU(BaseNLUModel):

    def __init__(self, model_name: str, api_key: str, temperature: float = 0.3):
        super().__init__(model_name)
        self.client = genai.Client(api_key=api_key)
        self.model_name = model_name
        self.temperature = temperature

    def predict(self, text, intents_schema):
        prompt = build_nlu_prompt(text, intents_schema)

        try:
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=prompt,
                config=types.GenerateContentConfig(temperature=self.temperature)
            )
            raw_output = response.text
            return self._safe_parse(raw_output)

        except Exception as e:
            # Graceful handling for Quota Exceeded or other API errors
            return {
                "intent": "unknown",
                "confidence": 0.0,
                "entities": {},
                "error": f"Gemini error: {str(e)}"
            }

    def _safe_parse(self, raw_output: str) -> dict:
        match = re.search(r"\{.*\}", raw_output, re.DOTALL)

        if not match:
            return self._fallback()

        try:
            parsed = json.loads(match.group())
            return self._normalize(parsed)
        except Exception:
            return self._fallback()

    def _normalize(self, parsed: dict) -> dict:
        return {
            "intent": parsed.get("intent", "unknown"),
            "confidence": float(parsed.get("confidence", 0.5)),
            "entities": parsed.get("entities", {})
        }

    def _fallback(self):
        return {
            "intent": "unknown",
            "confidence": 0.0,
            "entities": {}
        }
