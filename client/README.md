# HMM POS Tagger - Client

Next.js frontend for the HMM part-of-speech tagger.

## Setup

```bash
cp .env.example .env
npm install
npm run dev
```

Opens at [http://localhost:3000](http://localhost:3000).

### Environment variables

| Variable              | Default               | Description      |
|-----------------------|-----------------------|------------------|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000` | Backend API URL |

## Usage

1. Ensure the backend is running at `http://localhost:8000` (see `server/README.md`).
2. Type or paste a sentence in the textarea.
3. Click **Tag Sentence** to see color-coded POS tags with confidence tooltips.
4. Click any sample sentence to try it instantly.

## Features

- Color-coded tags by POS category
- Confidence score on hover
- Model info panel (vocab size, tag set, dev accuracy)
- Connection error handling

## API Integration

The client calls these backend endpoints:

| Endpoint       | When                          |
|----------------|-------------------------------|
| `GET /info`    | On page load (stats)          |
| `POST /evaluate` | On each tagging request    |
| `GET /review`  | On "Paper Review" toggle      |

Backend URL is configured via the `NEXT_PUBLIC_API_URL` environment variable (see `.env`), defaulting to `http://localhost:8000`. All API calls live in `app/lib/api.ts`.
