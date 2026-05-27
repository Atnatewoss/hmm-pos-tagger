import os
import requests


def load_conllu(path):
    if not os.path.exists(path):
        raise FileNotFoundError(f"Dataset not found at {path}")

    sentences = []
    sentence = []

    with open(path, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()

            if line == "":
                if sentence:
                    sentences.append(sentence)
                    sentence = []
                continue

            if line.startswith("#"):
                continue

            parts = line.split("\t")
            if len(parts) != 10:
                continue

            word = parts[1]
            tag = parts[3]

            sentence.append((word, tag))

    return sentences


def download_data(output_dir="data"):
    urls = {
        "train": "https://raw.githubusercontent.com/UniversalDependencies/UD_English-EWT/master/en_ewt-ud-train.conllu",
        "dev": "https://raw.githubusercontent.com/UniversalDependencies/UD_English-EWT/master/en_ewt-ud-dev.conllu",
        "test": "https://raw.githubusercontent.com/UniversalDependencies/UD_English-EWT/master/en_ewt-ud-test.conllu",
    }

    os.makedirs(output_dir, exist_ok=True)

    for name, url in urls.items():
        path = os.path.join(output_dir, f"en_ewt-ud-{name}.conllu")
        print(f"Downloading {name}...")

        r = requests.get(url)
        if r.status_code != 200:
            print(f"  FAILED ({r.status_code})")
            continue

        with open(path, "wb") as f:
            f.write(r.content)

        print(f"  Saved -> {path}")
