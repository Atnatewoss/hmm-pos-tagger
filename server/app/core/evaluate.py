from collections import defaultdict

import numpy as np
import pandas as pd

from app.core.dataset import load_conllu
from app.core.hmm import POSModel


def evaluate_model(model, sentences, label="dev"):
    correct = 0
    total = 0
    tag_correct = defaultdict(int)
    tag_total = defaultdict(int)
    confusion = defaultdict(lambda: defaultdict(int))

    for sent in sentences:
        words = [w for w, _ in sent]
        gold_tags = [t for _, t in sent]
        pred_tags = model.predict(" ".join(words))

        for g, p in zip(gold_tags, pred_tags):
            tag_total[g] += 1
            confusion[g][p] += 1
            if g == p:
                correct += 1
                tag_correct[g] += 1
            total += 1

    accuracy = correct / total if total > 0 else 0.0

    rows = []
    for tag in sorted(tag_total.keys()):
        prec = tag_correct[tag] / tag_total[tag] * 100 if tag_total[tag] > 0 else 0.0
        rows.append({"tag": tag, "count": tag_total[tag], "accuracy": f"{prec:.1f}%"})

    print(f"\n{'=' * 60}")
    print(f"  EVALUATION ON {label.upper()} SET")
    print(f"{'=' * 60}")
    print(f"  Overall Accuracy: {accuracy * 100:.2f}% ({correct}/{total} words)")
    print(f"{'=' * 60}")
    print(pd.DataFrame(rows).to_string(index=False))
    print()

    top_confusions = []
    for gt in confusion:
        for pt in confusion[gt]:
            if gt != pt and confusion[gt][pt] > 0:
                top_confusions.append((confusion[gt][pt], gt, pt))
    top_confusions.sort(reverse=True)

    if top_confusions:
        print("  TOP CONFUSIONS:")
        for count, gt, pt in top_confusions[:10]:
            pct = count / tag_total[gt] * 100 if tag_total[gt] > 0 else 0
            print(f"    {gt} -> {pt}: {count} ({pct:.1f}%)")

    print(f"{'=' * 60}\n")
    return accuracy
