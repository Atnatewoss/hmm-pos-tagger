from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse

from ..core.hmm import POSModel
from ..core.dataset import download_data
from ..core.evaluate import evaluate_model

router = APIRouter()

# Load the trained model at startup
model = None

@router.on_event("startup")
async def startup_event():
    global model
    model = POSModel.load("models/hmm_model.pkl")
    download_data("data")

@router.get("/")
async def root():
    return JSONResponse({
        "message": "HMM POS Tagger API",
        "version": "1.0.0",
        "endpoints": [
            "/info",
            "/tag",
            "/evaluate"
        ]
    })