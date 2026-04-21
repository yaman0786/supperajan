"""Minimal SQLite store for analysis history.

Kept tiny on purpose: a single table, no ORM. Writes are best-effort; a DB
failure never blocks the /analyze response.
"""

from __future__ import annotations

import json
import os
import sqlite3
import threading
from contextlib import contextmanager
from pathlib import Path
from typing import Iterator

_DEFAULT_PATH = Path(__file__).resolve().parents[2] / "data" / "netkarar.db"
_DB_PATH = Path(os.environ.get("NETKARAR_DB_PATH", _DEFAULT_PATH))
_LOCK = threading.Lock()


def db_path() -> Path:
    return _DB_PATH


def init_db() -> None:
    _DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    with _connect() as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS analyses (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                text TEXT NOT NULL,
                decision TEXT NOT NULL,
                risk INTEGER NOT NULL,
                category TEXT NOT NULL,
                payload TEXT NOT NULL
            )
            """
        )
        conn.commit()


@contextmanager
def _connect() -> Iterator[sqlite3.Connection]:
    conn = sqlite3.connect(_DB_PATH)
    try:
        yield conn
    finally:
        conn.close()


def record_analysis(text: str, payload: dict) -> None:
    try:
        with _LOCK, _connect() as conn:
            conn.execute(
                "INSERT INTO analyses (text, decision, risk, category, payload) VALUES (?, ?, ?, ?, ?)",
                (
                    text,
                    payload["decision"],
                    int(payload["risk"]),
                    payload["category"],
                    json.dumps(payload, ensure_ascii=False),
                ),
            )
            conn.commit()
    except sqlite3.Error:
        # Analytics storage is non-critical; swallow to keep API responsive.
        pass
