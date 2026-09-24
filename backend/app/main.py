"""Factory de la aplicación FastAPI."""

from __future__ import annotations

from fastapi import FastAPI
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from slowapi.util import get_remote_address
from starlette.requests import Request
from starlette.responses import JSONResponse

from app.api.v1.router import router as v1_router
from app.config import get_settings
from app.errors import (
    InvalidInputError,
    invalid_input_handler,
    request_validation_handler,
)


def create_app() -> FastAPI:
    settings = get_settings()

    limiter = Limiter(
        key_func=get_remote_address,
        default_limits=[f"{settings.api_rate_limit_per_minute}/minute"],
    )

    app = FastAPI(
        title="Tech Artist Toolbox API",
        version="0.1.0",
        docs_url="/docs",
        redoc_url="/redoc",
    )

    # Rate limiting.
    app.state.limiter = limiter
    app.add_middleware(SlowAPIMiddleware)
    app.add_exception_handler(
        RateLimitExceeded,
        lambda request, exc: JSONResponse(  # type: ignore[arg-type]
            status_code=429,
            content={
                "error": {
                    "code": "RATE_LIMITED",
                    "message": "rate limit exceeded",
                }
            },
        ),
    )

    # CORS.
    # `allow_credentials=False` porque la API no usa cookies ni auth basada en
    # navegador. Esto permite además usar `allow_origins=["*"]` sin que el
    # navegador rechace la respuesta (regla del CORS spec: credentials +
    # wildcard es incompatible). En producción se sustituye el "*" por la URL
    # exacta del frontend vía la env var API_CORS_ORIGINS.
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins_list,
        allow_credentials=False,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Errores en el formato del contrato.
    app.add_exception_handler(InvalidInputError, invalid_input_handler)
    app.add_exception_handler(RequestValidationError, request_validation_handler)

    @app.get("/healthz", tags=["meta"])
    def healthz() -> dict[str, str]:
        return {"status": "ok"}

    app.include_router(v1_router)
    return app


app = create_app()
