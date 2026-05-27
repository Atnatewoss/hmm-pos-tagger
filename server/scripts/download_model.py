import os
import sys
import urllib.request

MODEL_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "models")
MODEL_PATH = os.path.join(MODEL_DIR, "hmm_model.pkl")
BLOB_URL = os.environ.get("BLOB_MODEL_URL")

if not BLOB_URL:
    print("BLOB_MODEL_URL not set, skipping model download")
    sys.exit(0)

os.makedirs(MODEL_DIR, exist_ok=True)

if os.path.exists(MODEL_PATH):
    print(f"Model already exists at {MODEL_PATH}, skipping download")
    sys.exit(0)

print(f"Downloading model from Vercel Blob...")
try:
    urllib.request.urlretrieve(BLOB_URL, MODEL_PATH)
    size_mb = os.path.getsize(MODEL_PATH) / (1024 * 1024)
    print(f"Model downloaded ({size_mb:.1f} MB) to {MODEL_PATH}")
except Exception as e:
    print(f"Failed to download model: {e}")
    sys.exit(1)
