def nlu_prompt(user_query, intents_data):

    intents = [item["name"] for item in intents_data["intents"]]
    entities = intents_data.get("entities", {})

    prompt = f"""
You are a strict Natural Language Understanding (NLU) engine.

Your task is to classify user input into a single intent and extract structured entities.

Allowed intents:
{intents}

Allowed entities and their descriptions:
{entities}

Strict rules:
- Select exactly ONE intent from the allowed intents list.
- If no intent matches, return "unknown".
- Extract only entities that are defined in the allowed entities schema.
- Do not create, guess, or hallucinate any entity.
- Do not return null values.
- All entity values must be strings.
- Return a confidence score between 0.0 and 1.0.
- Output must be valid JSON only — no commentary, no markdown, no text outside JSON.

Output JSON format:
{{
  "intent": "<intent_name_or_unknown>",
  "confidence": <float_between_0_and_1>,
  "entities": {{
    "<entity_name>": "<entity_value>"
  }}
}}

User input:
"{user_query}"
"""

    return prompt.strip()
