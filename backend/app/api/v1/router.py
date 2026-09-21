"""Router v1: agrupa todos los endpoints bajo /api/v1."""

from __future__ import annotations

from fastapi import APIRouter

from app.api.v1 import calc as calc_routes
from app.api.v1 import projects as projects_routes

router = APIRouter(prefix="/api/v1")
router.include_router(calc_routes.router)
router.include_router(projects_routes.router)
