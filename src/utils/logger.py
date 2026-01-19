import json
from datetime import datetime
from pathlib import Path
from typing import Optional

LOG_FILE = Path("logs/history.jsonl")


def log_query(message: str, model_type: str, result: dict, model_name: Optional[str] = None):
    """Write a log entry. We include model and confidence (if available) for easier frontend consumption."""
    LOG_FILE.parent.mkdir(exist_ok=True)

    # Try extracting intent safely
    intent = result.get("intent", "unknown") if isinstance(result, dict) else "unknown"

    # Extract confidence when present
    confidence = None
    if isinstance(result, dict):
        confidence = result.get("confidence")

    model = model_name if model_name else model_type

    log_entry = {
        "timestamp": datetime.now().isoformat(),
        "message": message,
        "model_type": model_type,
        "model": model,
        "intent": intent,
        "confidence": confidence,
        "result": result
    }

    with open(LOG_FILE, "a", encoding="utf-8") as f:
        f.write(json.dumps(log_entry, ensure_ascii=False) + "\n")


def read_logs(limit: int = 200):
    """Return logs in a frontend-friendly shape: newest first and with fields
    `timestamp`, `input`, `model`, `intent`, `confidence`.
    """
    if not LOG_FILE.exists():
        return []

    with open(LOG_FILE, "r", encoding="utf-8") as f:
        lines = f.readlines()

    logs = [json.loads(line) for line in lines]

    def to_item(l: dict):
        return {
            "timestamp": l.get("timestamp"),
            "input": l.get("message") or l.get("input"),
            "model": l.get("model") or l.get("model_type"),
            "intent": l.get("intent"),
            "confidence": l.get("confidence") if l.get("confidence") is not None else (l.get("result") or {}).get("confidence")
        }

    items = [to_item(l) for l in logs]
    return items[-limit:][::-1]  # newest first
