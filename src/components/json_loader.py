import json
from pathlib import Path


def load_intents(json_path: str) -> dict:
    path = Path(json_path)

    if not path.exists():
        raise FileNotFoundError(f"File not found: {json_path}")

    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)

    if "intents" not in data:
        raise ValueError("Invalid schema: 'intents' key missing")

    for intent in data["intents"]:
        if "name" not in intent:
            raise ValueError("Each intent must have a 'name'")
        if "examples" not in intent or len(intent["examples"]) < 1:
            raise ValueError(f"Intent '{intent['name']}' has no examples")

    return data