import pandas as pd
from json_loader import load_intents


def generate_csv(
    json_path="data/raw_data/intents.json",
    output_csv="data/raw_data/full_nlu_dataset_325.csv"
):
    data = load_intents(json_path)

    rows = []
    for intent in data["intents"]:
        for example in intent["examples"]:
            rows.append({
                "text": example,
                "intent": intent["name"]
            })

    df = pd.DataFrame(rows)
    df.to_csv(output_csv, index=False, encoding="utf-8")

    print("CSV generated successfully")
    print(f"Total samples: {len(df)}")


if __name__ == "__main__":
    generate_csv()