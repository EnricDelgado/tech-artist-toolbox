"""Esquemas de perfiles de proyecto (§4.6 y §8 de definicion-inicial.md)."""

from __future__ import annotations

from datetime import datetime
from typing import Any, Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

EngineLiteral = Literal["unity", "unreal", "other"]
PlatformLiteral = Literal["windows", "macos", "android", "ios", "quest", "other"]


class ProjectConfig(BaseModel):
    """Contenido del JSONB `config`. Abierto (permite extensiones sin migración)."""

    model_config = ConfigDict(extra="allow")

    textureMaxSize: int | None = Field(default=None, ge=1)
    compression: str | None = None
    mipmaps: bool | None = None
    colorSpace: Literal["linear", "srgb"] | None = None


class ProjectCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")
    name: str = Field(min_length=1, max_length=200)
    engine: EngineLiteral
    platform: PlatformLiteral
    config: ProjectConfig = Field(default_factory=ProjectConfig)


class ProjectUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")
    name: str | None = Field(default=None, min_length=1, max_length=200)
    engine: EngineLiteral | None = None
    platform: PlatformLiteral | None = None
    config: ProjectConfig | None = None


class ProjectRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    name: str
    engine: EngineLiteral
    platform: PlatformLiteral
    config: dict[str, Any]
    created_at: datetime
    updated_at: datetime
