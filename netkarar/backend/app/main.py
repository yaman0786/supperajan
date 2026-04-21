"""FastAPI application entry point for NETKARAR."""

from __future__ import annotations

import logging
import os
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from . import __version__
from .analyzer import analyze
from .db import init_db
from .schemas import AnalyzeRequest, AnalyzeResponse, HealthResponse

log = logging.getLogger("netkarar")
logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s")


@asynccontextmanager
async def lifespan(_: FastAPI):
    init_db()
    log.info("NETKARAR backend ready (v%s)", __version__)
    yield


def _cors_origins() -> list[str]:
    raw = os.environ.get("NETKARAR_CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173")
    return [origin.strip() for origin in raw.split(",") if origin.strip()]


app = FastAPI(
    title="NETKARAR API",
    version=__version__,
    description="Duyguyla değil, net kararla. Text-risk analysis endpoint.",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins(),
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)


@app.get("/health", response_model=HealthResponse, tags=["system"])
def health() -> HealthResponse:
    return HealthResponse(status="ok", version=__version__)


@app.post("/analyze", response_model=AnalyzeResponse, tags=["analysis"])
def analyze_text(payload: AnalyzeRequest) -> AnalyzeResponse:
    try:
        result = analyze(payload.text)
    except Exception as exc:  # defensive — keep API stable
        log.exception("analysis failed")
        raise HTTPException(status_code=500, detail="analysis_failed") from exc

    try:
        from .db import record_analysis

        record_analysis(payload.text, result.model_dump())
    except Exception:  # pragma: no cover
        log.warning("failed to persist analysis", exc_info=True)

    return result
