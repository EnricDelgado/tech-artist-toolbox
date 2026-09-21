"""Sesión de SQLAlchemy. La conexión se crea perezosamente para permitir arranque sin BD."""

from __future__ import annotations

from collections.abc import Iterator

from sqlalchemy import create_engine
from sqlalchemy.engine import Engine
from sqlalchemy.orm import Session, sessionmaker

from app.config import get_settings

_engine: Engine | None = None
_SessionLocal: sessionmaker[Session] | None = None


def _init() -> None:
    global _engine, _SessionLocal
    if _engine is not None:
        return
    settings = get_settings()
    if not settings.database_url:
        return
    _engine = create_engine(settings.database_url, pool_pre_ping=True)
    _SessionLocal = sessionmaker(bind=_engine, autoflush=False, autocommit=False)


def get_engine() -> Engine | None:
    _init()
    return _engine


def get_session() -> Iterator[Session]:
    """Dependencia FastAPI. 503 si no hay BD configurada (o si falla la conexión)."""
    _init()
    if _SessionLocal is None:
        from fastapi import HTTPException

        raise HTTPException(status_code=503, detail="database not configured")
    session = _SessionLocal()
    try:
        yield session
    finally:
        session.close()
