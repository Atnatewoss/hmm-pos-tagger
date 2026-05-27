def load_conllu(path):
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