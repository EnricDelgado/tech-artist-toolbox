"""Errores de dominio y su traducción a respuestas HTTP.

El formato coincide con el contrato definido en definicion-inicial.md §4.7:

    {"error": {"code": "INVALID_INPUT", "message": "...", "field": "width"}}

y con la clase equivalente en calc-core (`InvalidInputError`).
"""

from __future__ import annotations

from fastapi import Request
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError


class InvalidInputError(Exception):
    """Error de validación de una entrada de una calculadora."""

    code = "INVALID_INPUT"

    def __init__(self, message: str, field: str) -> None:
        super().__init__(message)
        self.message = message
        self.field = field


def _error_body(code: str, message: str, field: str | None = None) -> dict:
    body: dict = {"code": code, "message": message}
    if field is not None:
        body["field"] = field
    return {"error": body}


async def invalid_input_handler(_: Request, exc: InvalidInputError) -> JSONResponse:
    return JSONResponse(status_code=422, content=_error_body(exc.code, exc.message, exc.field))


async def request_validation_handler(_: Request, exc: RequestValidationError) -> JSONResponse:
    # Toma el primer error para dar `field`; los demás detalles se agrupan en `message`.
    first = exc.errors()[0] if exc.errors() else None
    field = None
    if first and first.get("loc"):
        # Salta "body"/"query"/"path" del prefijo.
        loc = [str(p) for p in first["loc"] if p not in ("body", "query", "path")]
        field = ".".join(loc) if loc else None
    message = first.get("msg", "invalid input") if first else "invalid input"
    return JSONResponse(status_code=422, content=_error_body("INVALID_INPUT", message, field))
