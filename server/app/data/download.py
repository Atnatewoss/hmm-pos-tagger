import os
import requests

BASE_DIR = "data"

FILES = {
    "train": "https://raw.githubusercontent.com/UniversalDependencies/UD_English-EWT/master/en_ewt-ud-train.conllu",
    "dev":   "https://raw.githubusercontent.com/UniversalDependencies/UD_English-EWT/master/en_ewt-ud-dev.conllu",
    "test":  "https://raw.githubusercontent.com/UniversalDependencies/UD_English-EWT/master/en_ewt-ud-test.conllu",
}

os.makedirs(BASE_DIR, exist_ok=True)

def download_file(name, url):
    print(f"Downloading {name}...")

    r = requests.get(url)

    if r.status_code != 200:
        print(f"FAILED {name}: {r.status_code}")
        return

    path = os.path.join(BASE_DIR, f"en_ewt-ud-{name}.conllu")

    with open(path, "wb") as f:
        f.write(r.content)

    print(f"Saved → {path}")

def main():
    for name, url in FILES.items():
        download_file(name, url)

    print("\nDone. Dataset ready.")

if __name__ == "__main__":
    main()