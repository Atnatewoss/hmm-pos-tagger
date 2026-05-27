# HMM POS Tagger - Server

Python backend for the HMM part-of-speech tagger.

## Architecture

```
server/
├── app/
│   ├── main.py               # FastAPI entry point (loads model, exposes endpoints)
│   ├── core/
│   │   ├── hmm.py            # HMM, Viterbi decoder, POSModel
│   │   ├── dataset.py        # CoNLL-U parser & downloader
│   │   └── evaluate.py       # Accuracy evaluation & confusion analysis
│   └── api/
│       └── routes.py         # API route definitions (APIRouter)
├── scripts/
│   ├── train.py              # Training CLI
│   └── download_model.py     # Vercel Blob model download
├── models/
│   └── hmm_model.pkl         # Pre-trained model
├── data/                     # CoNLL-U datasets (train/dev/test)
├── reviews/
│   └── paper-review.md       # Paper review: Hidden Markov Neural Networks
└── pyproject.toml            # Dependencies
```

## Deploying on Vercel

The model file is not tracked in git. To deploy on Vercel, upload it to Vercel Blob:

```bash
# Install Vercel CLI and log in
npx vercel login
npx vercel blob upload server/models/hmm_model.pkl
```

Copy the returned URL and set it as `BLOB_MODEL_URL` in your Vercel project's environment variables. The build command in `vercel.json` downloads the model automatically.

## Setup

## Usage

```powershell
# Train the model
python scripts\train.py

# Start the API server
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

# Download datasets
python -c "from app.core.dataset import download_data; download_data('data')"
```

## API Endpoints

| Method | Path         | Description                                |
|--------|--------------|--------------------------------------------|
| GET    | `/`          | Model overview (vocab, tags, accuracy)     |
| GET    | `/info`      | Detailed model info (tag counts, etc.)     |
| GET    | `/review`    | Paper review markdown content              |
| POST   | `/tag`       | Tag a sentence -> `[(word, tag), ...]`      |
| POST   | `/evaluate`  | Tag with per-word confidence scores        |

## Model

- Transitions: MLE with add-1 Laplace smoothing
- Emissions: MLE with add-1 smoothing; OOV → marginal tag distribution
- Decoding: Log-space Viterbi with backpointers
- Dev accuracy: ~83.9%
