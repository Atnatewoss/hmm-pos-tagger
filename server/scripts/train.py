import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.dataset import load_conllu
from app.core.hmm import POSModel
from app.core.evaluate import evaluate_model

DATA_PATH = "data/en_ewt-ud-train.conllu"
DEV_PATH = "data/en_ewt-ud-dev.conllu"
MODEL_PATH = os.path.join(os.path.dirname(__file__), "..", "models", "hmm_model.pkl")


def main():
    print("Loading training data...")
    train = load_conllu(DATA_PATH)
    print(f"  {len(train)} sentences loaded")

    print("Training HMM (this may take a minute)...")
    model = POSModel()
    model.train(train)
    print("  Training complete!")

    os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)
    print(f"Saving model to {MODEL_PATH}...")
    model.save(MODEL_PATH)

    print("Evaluating on dev set...")
    dev = load_conllu(DEV_PATH)
    evaluate_model(model, dev, "dev")

    sample = "I love natural language processing"
    tags = model.predict(sample)
    print(f"  Sample: {sample}")
    print(f"  Tags:   {tags}")


if __name__ == "__main__":
    main()
