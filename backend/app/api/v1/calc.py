"""Endpoints de cálculo (calculadoras) — §9 de definicion-inicial.md."""

from __future__ import annotations

from fastapi import APIRouter

from app.calc import shader as shader_calc
from app.calc import texture as texture_calc
from app.calc import uv as uv_calc
from app.errors import InvalidInputError
from app.schemas.calc import (
    ShaderMathRequest,
    ShaderMathResponse,
    TexelDensityRequest,
    TexelDensityResponse,
    TextureCompareEntry,
    TextureCompareRequest,
    TextureCompareResponse,
    TextureMemoryRequest,
    TextureMemoryResponse,
)

router = APIRouter(tags=["calc"])


def _texture_result_to_response(result) -> TextureMemoryResponse:
    return TextureMemoryResponse(
        perTextureBytes=result.per_texture_bytes,
        perTextureWithMipmapsBytes=result.per_texture_with_mipmaps_bytes,
        totalBytes=result.total_bytes,
        formula=result.formula,
        warnings=result.warnings,
    )


@router.post("/texture/memory", response_model=TextureMemoryResponse)
def texture_memory(payload: TextureMemoryRequest) -> TextureMemoryResponse:
    result = texture_calc.calculate_texture_memory(
        width=payload.width,
        height=payload.height,
        format=payload.format,
        mipmaps=payload.mipmaps,
        count=payload.count,
    )
    return _texture_result_to_response(result)


@router.post("/texture/compare", response_model=TextureCompareResponse)
def texture_compare(payload: TextureCompareRequest) -> TextureCompareResponse:
    by_format = texture_calc.compare_formats(
        width=payload.width,
        height=payload.height,
        mipmaps=payload.mipmaps,
        count=payload.count,
    )
    return TextureCompareResponse(
        results={
            fmt: TextureCompareEntry(
                perTextureBytes=r.per_texture_bytes,
                perTextureWithMipmapsBytes=r.per_texture_with_mipmaps_bytes,
                totalBytes=r.total_bytes,
                formula=r.formula,
                warnings=r.warnings,
            )
            for fmt, r in by_format.items()
        }
    )


@router.post("/uv/texel-density", response_model=TexelDensityResponse)
def texel_density(payload: TexelDensityRequest) -> TexelDensityResponse:
    result = uv_calc.calculate_texel_density(
        unit=payload.unit,
        object_size=payload.objectSize,
        texture_resolution=payload.textureResolution,
        target_density=payload.targetDensity,
    )
    return TexelDensityResponse(
        texelDensityPxPerUnit=result.texel_density_px_per_unit,
        texelDensityPxPerMeter=result.texel_density_px_per_meter,
        texelDensityPxPerInch=result.texel_density_px_per_inch,
        recommendedResolution=result.recommended_resolution,
        resultingDensityPxPerUnit=result.resulting_density_px_per_unit,
    )


@router.post("/shader/math", response_model=ShaderMathResponse)
def shader_math(payload: ShaderMathRequest) -> ShaderMathResponse:
    """Playground: lerp, remap, smoothstep.

    Los parámetros específicos de cada función viajan por `extra` (Pydantic
    `extra="allow"`) para mantener un único endpoint. Se validan aquí.
    """
    data = payload.model_dump()
    fn = data.pop("function")

    def _num(key: str) -> float:
        if key not in data:
            raise InvalidInputError(f"{key} is required for function={fn}", key)
        return data[key]

    if fn == "lerp":
        r = shader_calc.lerp(_num("a"), _num("b"), _num("t"))
    elif fn == "remap":
        r = shader_calc.remap(
            _num("value"), _num("inMin"), _num("inMax"), _num("outMin"), _num("outMax")
        )
    elif fn == "smoothstep":
        r = shader_calc.smoothstep(_num("edge0"), _num("edge1"), _num("x"))
    else:  # pragma: no cover — Literal ya lo filtra
        raise InvalidInputError(f"unknown function {fn}", "function")
    return ShaderMathResponse(result=r)
