from hmm.dataset import load_conllu
from hmm.model import POSModel

DATA_PATH = "data/en_ewt-ud-train.conllu"

def main():
    print("Loading dataset...")
    data = load_conllu(DATA_PATH)

    print("Training HMM...")
    model = POSModel()
    model.train(data)

    print("Training complete!")

    # test
    print(model.predict("I love movies"))

if __name__ == "__main__":
    main()