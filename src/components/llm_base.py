# src/components/llm_base.py
from abc import ABC, abstractmethod

class BaseNLUModel(ABC):
    """
    Abstract base class for all LLM-based NLU models
    """

    def __init__(self, model_name: str):
        self.model_name = model_name

    @abstractmethod
    def predict(self, text: str, intents_schema: dict) -> dict:
        """
        Must return:
        {
            "intent": str,
            "confidence": float,
            "entities": dict
        }
        """
        pass
