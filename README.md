# HMM Part-of-Speech Tagger

A from-scratch implementation of a **Hidden Markov Model (HMM)** for part-of-speech tagging using Python, NumPy, and Pandas — no ML libraries used. Trained on the **Universal Dependencies English Web Treebank (UD_English-EWT)**.

Includes a **FastAPI** backend and a **Next.js** frontend for interactive demonstration, plus a **paper review** as required by Task 2.

---

## Project Structure

```
hmm-pos-tagger/
├── Makefile                             # Top-level commands (macOS/Linux)
├── make.ps1                             # Top-level commands (Windows PowerShell)
├── .vscode/
│   └── settings.json                    # Editor config (venv, ruff, formatter)
├── server/                              # Python backend
│   ├── venv/                            # Virtual environment (gitignored)
│   ├── models/                          # Trained artifacts (gitignored)
│   │   └── hmm_model.pkl                # Pickled HMM (84% accuracy)
│   ├── data/                            # UD_English-EWT dataset (gitignored)
│   │   ├── en_ewt-ud-train.conllu       # 12,544 sentences
│   │   ├── en_ewt-ud-dev.conllu         # 2,001 sentences
│   │   └── en_ewt-ud-test.conllu        # 2,077 sentences
│   ├── scripts/
│   │   └── train.py                     # Training CLI
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                      # FastAPI entry point
│   │   ├── api/
│   │   │   ├── __init__.py
│   │   │   └── routes.py                # API route definitions
│   │   └── core/
│   │       ├── __init__.py
│   │       ├── hmm.py                   # HMM + Viterbi + POSModel
│   │       ├── dataset.py               # CoNLL-U parser + downloader
│   │       └── evaluate.py              # Accuracy + confusion analysis
│   └── pyproject.toml                   # Dependencies (replaces requirements.txt)
├── client/                              # Next.js frontend
│   ├── app/
│   │   ├── page.tsx                     # POS tagger UI with color-coded output
│   │   ├── layout.tsx
│   │   └── globals.css
│   └── package.json
├── reviews/
│   └── paper-review.md                  # Task 2: paper review with 8 future directions
└── README.md
```

---

## Task 1: HMM Implementation

### Model

| Component | Description |
|-----------|-------------|
| **Transition** `P(tagᵢ|tagᵢ₋₁)` | MLE with add-1 Laplace smoothing |
| **Emission** `P(wordᵢ|tagᵢ)` | MLE with add-1 smoothing; unknown words → marginal tag distribution |
| **Decoding** | Log-space Viterbi with backpointers |
| **OOV handling** | Known words use smoothed emission; OOV words fall back to `P(tag)` |

### Results

| Set  | Accuracy |
|------|----------|
| Dev  | 83.94%   |
| Test | 84.13%   |

Top confusions are linguistically interpretable:
| Error | Rate | Reason |
|-------|------|--------|
| PROPN → NOUN | 32.6% | Proper nouns share distribution with common nouns |
| SCONJ → ADP | 30.7% | Subordinating conjunctions overlap with adpositions |
| NUM → NOUN | 27.7% | Numbers often fill noun positions |

### Getting Started

#### Quick Start

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

#### Backend (manual)

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

#### Frontend

```bash
cd client
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The frontend calls the backend at `http://localhost:8000`.

#### API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | Model overview |
| GET | `/info` | Vocab size, tags, accuracy, tag counts |
| POST | `/tag` | Tag a sentence → `[(word, tag), ...]` |
| POST | `/evaluate` | Tag with per-word confidence |

#### Downloading the Dataset

```python
from app.core.dataset import download_data
download_data("data")   # Downloads train/dev/test to data/
```

---

## Task 2: Paper Review

A review of **"Hidden Markov Neural Networks"** by Rimella & Whiteley (Entropy, 2025) is at [`reviews/paper-review.md`](reviews/paper-review.md).

**Sections:** Summary → Strengths (5) → Weaknesses (5) → **8 Future Research Directions** → Connection to provided references → Overall assessment (7.5/10)

The 8 directions:
1. Subspace methods for scaling
2. Self-attention weight transitions
3. Application to POS tagging / sequence labeling
4. Federated continual learning
5. Amortized variational inference
6. Theoretical guarantees (forgetting bounds, regret)
7. Structured sparsity via transition kernel
8. Uncertainty-guided data acquisition

All three provided reference materials are connected to the review.

---

## References

- Rimella, L. & Whiteley, N. (2025). Hidden Markov Neural Networks. *Entropy*, 27(2), 168. [DOI](https://doi.org/10.3390/e27020168)
- Jurafsky, D. & Martin, J. H. (2025). *Speech and Language Processing* (3rd ed. draft), Appendix A. [PDF](https://web.stanford.edu/~jurafsky/slp3/A.pdf)
- Bishop, C. M. (2006). *Pattern Recognition and Machine Learning*. Springer.
- Universal Dependencies. English-EWT Treebank. [GitHub](https://github.com/UniversalDependencies/UD_English-EWT)

---

## License

Built for educational purposes — iCog Group 1 Training.
