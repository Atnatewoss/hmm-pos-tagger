# HMM POS Tagger

A from-scratch implementation of a **Hidden Markov Model (HMM)** for part-of-speech tagging using Python, NumPy, and Pandas - no ML libraries used. Trained on the **Universal Dependencies English Web Treebank (UD_English-EWT)**.

Includes a **FastAPI** backend and a **Next.js** frontend for interactive demonstration, plus a **paper review** of the Hidden Markov Neural Networks paper.

---

## Architecture

```
                          ┌─────────────────────┐
                          │    Next.js Client    │
                          │  (localhost:3000)    │
                          └──────┬──────────────┘
                                 │ HTTP (fetch)
                          ┌──────▼──────────────┐
                          │  FastAPI Server      │
                          │  (localhost:8000)    │
                          └──────┬──────────────┘
                    ┌─────────────┼──────────────┐
              ┌─────▼─────┐ ┌────▼────┐ ┌───────▼──┐
              │  Core     │ │  API    │ │  Data    │
              │  HMM      │ │ Routes  │ │  CoNLL-U │
              │  Viterbi  │ │         │ │  files   │
              │  Evaluator│ │         │ │          │
              └───────────┘ └─────────┘ └──────────┘
```

### Project structure

```
hmm-pos-tagger/
  Makefile                          # Top-level commands (macOS/Linux)
  make.ps1                          # Top-level commands (Windows PowerShell)
  .vscode/settings.json             # Editor config (venv, ruff, formatter)
  server/                           # Python backend
    venv/                           #   Virtual environment (gitignored)
    models/                         #   Trained artifacts (gitignored)
      hmm_model.pkl                 #     Pickled HMM (84% accuracy)
    data/                           #   UD_English-EWT dataset (gitignored)
      en_ewt-ud-train.conllu        #     12,544 sentences
      en_ewt-ud-dev.conllu          #     2,001 sentences
      en_ewt-ud-test.conllu         #     2,077 sentences
    scripts/
      train.py                      #   Training CLI
    app/
      __init__.py
      main.py                       #   FastAPI entry point
      api/
        __init__.py
        routes.py                   #   API route definitions
      core/
        __init__.py
        hmm.py                      #   HMM + Viterbi + POSModel
        dataset.py                  #   CoNLL-U parser + downloader
        evaluate.py                 #   Accuracy evaluation
    pyproject.toml                  #   Dependencies
  client/                           # Next.js frontend
    app/
      page.tsx                      #   POS tagger UI
      layout.tsx                    #   Root layout
      globals.css                   #   Tailwind + custom styles
    public/
    package.json
  reviews/
    paper-review.md                 # Paper review: Hidden Markov Neural Networks
```

### Data flow

1. **Training:** `scripts/train.py` loads the CoNLL-U training data, trains the HMM (transition + emission probabilities with add-1 smoothing), and serializes the model to `models/hmm_model.pkl`.
2. **Serving:** `app/main.py` loads the pickled model on startup. It exposes a FastAPI server with REST endpoints.
3. **Tagging:** The frontend sends a sentence via POST to `/evaluate`. The server runs log-space Viterbi decoding and returns token-tag pairs with confidence scores.
4. **Display:** The frontend renders each tagged token as a color-coded chip, grouped by POS category.

### API endpoints

| Method | Path         | Description                                |
|--------|--------------|--------------------------------------------|
| GET    | `/`          | Model overview (vocab, tags, accuracy)     |
| GET    | `/info`      | Vocab size, tags, tag counts, accuracy     |
| GET    | `/review`    | Paper review markdown content              |
| POST   | `/tag`       | Tag a sentence -> `[(word, tag), ...]`      |
| POST   | `/evaluate`  | Tag with per-word confidence scores         |

---

## HMM implementation

### Model

| Component | Description |
|-----------|-------------|
| **Transition** `P(tag_i|tag_i-1)` | MLE with add-1 Laplace smoothing |
| **Emission** `P(word_i|tag_i)` | MLE with add-1 smoothing; unknown words fall back to marginal tag distribution |
| **Decoding** | Log-space Viterbi with backpointers |
| **OOV handling** | Known words use smoothed emission; OOV words use `P(tag)` |

### Results

| Set  | Accuracy |
|------|----------|
| Dev  | 83.94%   |
| Test | 84.13%   |

Top confusions are linguistically interpretable:

| Error          | Rate  | Reason                                       |
|----------------|-------|----------------------------------------------|
| PROPN -> NOUN  | 32.6% | Proper nouns share distribution with common nouns |
| SCONJ -> ADP   | 30.7% | Subordinating conjunctions overlap with adpositions |
| NUM -> NOUN    | 27.7% | Numbers often fill noun positions            |

### Design decisions

- **Add-1 smoothing** prevents zero probabilities for unseen tag-word pairs and tag transitions.
- **Log-space Viterbi** avoids floating-point underflow when multiplying many small probabilities.
- **Marginal fallback** for unknown words uses the tag's prior probability, which preserves the tag distribution for unseen vocabulary.

---

## Getting started

### Quick start

**macOS / Linux:**
```bash
make install      # Install all dependencies (Python venv + npm)
make train        # Train the model
make serve        # Start API server (http://localhost:8000)
make client       # Start frontend (http://localhost:3000)
make data         # Download CoNLL-U datasets
```

**Windows (PowerShell):**
```powershell
.\make.ps1 install     # Install all dependencies
.\make.ps1 train       # Train the model
.\make.ps1 serve       # Start API server
.\make.ps1 client      # Start frontend
.\make.ps1 data        # Download CoNLL-U datasets
.\make.ps1 help        # Show all available targets
```

### Backend (manual)

```bash
cd server
python -m venv venv
.\venv\Scripts\Activate.ps1        # Windows
pip install -e .

# Train + evaluate + save model
python scripts/train.py

# Start API server
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### Frontend

```bash
cd client
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The frontend calls the backend at `http://localhost:8000`.

### Downloading the dataset

```python
from app.core.dataset import download_data
download_data("data")   # Downloads train/dev/test to data/
```

---

## Paper review

A review of **"Hidden Markov Neural Networks"** by Rimella & Whiteley (Entropy, 2025) is at [`reviews/paper-review.md`](reviews/paper-review.md) and available interactively in the frontend under the **Paper Review** section.

**Sections:** Summary - Strengths (5) - Weaknesses (5) - 8 Future Research Directions - Connection to references - Overall assessment (7.5/10)

The 8 directions:
1. Subspace methods for scaling
2. Self-attention weight transitions
3. Application to POS tagging / sequence labeling
4. Federated continual learning
5. Amortized variational inference
6. Theoretical guarantees (forgetting bounds, regret)
7. Structured sparsity via transition kernel
8. Uncertainty-guided data acquisition

---

## References

- Rimella, L. & Whiteley, N. (2025). Hidden Markov Neural Networks. *Entropy*, 27(2), 168. [DOI](https://doi.org/10.3390/e27020168)
- Jurafsky, D. & Martin, J. H. (2025). *Speech and Language Processing* (3rd ed. draft), Appendix A. [PDF](https://web.stanford.edu/~jurafsky/slp3/A.pdf)
- Bishop, C. M. (2006). *Pattern Recognition and Machine Learning*. Springer.
- Universal Dependencies. English-EWT Treebank. [GitHub](https://github.com/UniversalDependencies/UD_English-EWT)

---

## License

Built for educational purposes.
