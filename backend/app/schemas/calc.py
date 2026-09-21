"""Esquemas Pydantic para los endpoints de cálculo (§9 de definicion-inicial.md)."""

from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

TextureFormatLiteral = Literal["RGBA32", "BC7", "ASTC_4x4", "ASTC_6x6", "ASTC_8x8"]
LengthUnitLiteral = Literal["m", "unity", "inch"]
ShaderFunctionLiteral = Literal["lerp", "remap", "smoothstep"]


class TextureMemoryRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")
    width: int = Field(ge=1)
    height: int = Field(ge=1)
    format: TextureFormatLiteral
    mipmaps: bool = False
    count: int = Field(default=1, ge=1)


class TextureMemoryResponse(BaseModel):
    perTextureBytes: int
    perTextureWithMipmapsBytes: int
    totalBytes: int
    formula: str
    warnings: list[str] = Field(default_factory=list)


class TextureCompareRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")
    width: int = Field(ge=1)
    height: int = Field(ge=1)
    mipmaps: bool = False
    count: int = Field(default=1, ge=1)


class TextureCompareEntry(BaseModel):
    perTextureBytes: int
    perTextureWithMipmapsBytes: int
    totalBytes: int
    formula: str
    warnings: list[str] = Field(default_factory=list)


class TextureCompareResponse(BaseModel):
    results: dict[str, TextureCompareEntry]


class TexelDensityRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")
    textureResolution: float | None = Field(default=None, gt=0)
    objectSize: float = Field(gt=0)
    unit: LengthUnitLiteral
    targetDensity: float | None = Field(default=None, gt=0)


class TexelDensityResponse(BaseModel):
    texelDensityPxPerUnit: float | None = None
    texelDensityPxPerMeter: float | None = None
    texelDensityPxPerInch: float | None = None
    recommendedResolution: int | None = None
    resultingDensityPxPerUnit: float | None = None


class ShaderMathRequest(BaseModel):
    model_config = ConfigDict(extra="allow")
    function: ShaderFunctionLiteral


class ShaderMathResponse(BaseModel):
    result: float
