import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from app.core.dataset import load_conllu
from app.core.hmm import POSModel

app = FastAPI(title="HMM POS Tagger")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, "data")
MODEL_PATH = os.path.join(BASE_DIR, "models", "hmm_model.pkl")


def load_or_train_model():
    if os.path.exists(MODEL_PATH):
        print("Loading saved model...")
        return POSModel.load(MODEL_PATH)

    print("No saved model found. Training from scratch...")
    train = load_conllu(os.path.join(DATA_DIR, "en_ewt-ud-train.conllu"))
    model = POSModel()
    model.train(train)
    os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)
    model.save(MODEL_PATH)
    print(f"Model saved to {MODEL_PATH}")
    return model


print("Initializing model...")
model = load_or_train_model()
print(f"  Vocabulary size: {len(model.hmm.vocab)}")
print(f"  Tag set: {model.hmm.tag_list}")

dev_accuracy = None
dev_path = os.path.join(DATA_DIR, "en_ewt-ud-dev.conllu")
if os.path.exists(dev_path):
    dev = load_conllu(dev_path)
    dev_accuracy = model.evaluate(dev)
    print(f"  Dev accuracy: {dev_accuracy * 100:.2f}%")


class Sentence(BaseModel):
    text: str


@app.get("/")
def root():
    return {
        "model": "HMM POS Tagger",
        "vocab_size": len(model.hmm.vocab),
        "tags": model.hmm.tag_list,
        "dev_accuracy": dev_accuracy,
    }


@app.post("/tag")
def tag(sentence: Sentence):
    words = sentence.text.strip().split()
    if not words:
        return {"result": []}
    tags = model.predict(sentence.text)
    return {"result": list(zip(words, tags)), "accuracy": dev_accuracy}


@app.post("/evaluate")
def evaluate(sentence: Sentence):
    words = sentence.text.strip().split()
    if not words:
        return {"result": []}
    tags = model.predict(sentence.text)
    tag_probs = []
    for word, tag in zip(words, tags):
        prob = model.hmm.emission_of(tag, word)
        tag_probs.append({"word": word, "tag": tag, "confidence": round(prob, 4)})
    return {"result": tag_probs, "accuracy": dev_accuracy}


@app.get("/info")
def info():
    return {
        "vocab_size": len(model.hmm.vocab),
        "num_tags": len(model.hmm.tag_list),
        "tags": model.hmm.tag_list,
        "tag_counts": dict(model.hmm.tag_counts.most_common()),
        "dev_accuracy": dev_accuracy,
    }


@app.get("/review")
def get_review():
    REVIEW_PATH = os.path.join(BASE_DIR, "reviews", "paper-review.md")
    if os.path.exists(REVIEW_PATH):
        with open(REVIEW_PATH, "r", encoding="utf-8") as f:
            content = f.read()
        return {"content": content}
    return {"content": ""}
