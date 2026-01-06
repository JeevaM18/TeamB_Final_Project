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
            text=True
        )

        output, _ = process.communicate(prompt)

        return self._safe_parse(output)

    def _safe_parse(self, raw_output: str) -> dict:
        """
        Extract JSON safely to avoid hallucinated text
        """
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
