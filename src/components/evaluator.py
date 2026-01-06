"""
Evaluator Component
-------------------
Evaluates NLU model predictions using standard metrics.
Designed to be model-agnostic and reusable across LLM backends.
"""

from typing import List, Dict
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix


class Evaluator:
    """
    Evaluator class for assessing model predictions.
    """

    def __init__(self):
        pass

    def evaluate(self, y_true: List[str], y_pred: List[str]) -> Dict:
        """
        Evaluate predicted labels against ground truth labels.

        Args:
            y_true (List[str]): Actual intent labels
            y_pred (List[str]): Predicted intent labels

        Returns:
            Dict: Evaluation results including accuracy and reports
        """

        if len(y_true) != len(y_pred):
            raise ValueError("y_true and y_pred must be of the same length")

        results = {
            "accuracy": accuracy_score(y_true, y_pred),
            "classification_report": classification_report(y_true, y_pred, output_dict=True),
            "confusion_matrix": confusion_matrix(y_true, y_pred).tolist()
        }

        return results
