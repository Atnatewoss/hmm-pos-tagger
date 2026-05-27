from fastapi import FastAPI
from pydantic import BaseModel

from hmm.dataset import load_conllu
from hmm.model import POSModel

app = FastAPI()

DATA_PATH = "data/en_ewt-ud-train.conllu"

print("Loading data...")
data = load_conllu(DATA_PATH)

print("Training model...")
model = POSModel()
model.train(data)

class Sentence(BaseModel):
    text: str

@app.post("/tag")
def tag(sentence: Sentence):
    tags = model.predict(sentence.text)

    words = sentence.text.split()

    return {
        "result": list(zip(words, tags))
    }