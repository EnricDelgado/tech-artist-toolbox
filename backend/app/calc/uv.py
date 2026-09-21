"""Texel Density Calculator (port de calc-core)."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Literal

from app.errors import InvalidInputError

LengthUnit = Literal["m", "unity", "inch"]

LENGTH_UNITS: tuple[LengthUnit, ...] = ("m", "unity", "inch")

# Metros por unidad. Coincidir con calc-core: 1 unidad Unity = 1 m; 1 inch = 0.0254 m.
_METERS_PER_UNIT: dict[LengthUnit, float] = {"m": 1.0, "unity": 1.0, "inch": 0.0254}


@dataclass
class TexelDensityResult:
    texel_density_px_per_unit: float | None = None
    texel_density_px_per_meter: float | None = None
    texel_density_px_per_inch: float | None = None
    recommended_resolution: int | None = None
    resulting_density_px_per_unit: float | None = None


def _assert_positive_number(value: float, field_name: str) -> None:
    if not isinstance(value, (int, float)) or isinstance(value, bool) or value <= 0:
        raise InvalidInputError(f"{field_name} must be a positive number", field_name)


def _nearest_power_of_two(x: float) -> int:
    """Potencia de dos más cercana en distancia lineal; los empates suben."""
    if x <= 1:
        return 1
    lower = 1
    while lower * 2 <= x:
        lower *= 2
    upper = lower * 2
    return lower if (x - lower) < (upper - x) else upper


def calculate_texel_density(
    *,
    unit: LengthUnit,
    object_size: float,
    texture_resolution: float | None = None,
    target_density: float | None = None,
) -> TexelDensityResult:
    """Texel Density (mismas fórmulas que calc-core)."""
    if unit not in _METERS_PER_UNIT:
        raise InvalidInputError(
            f"unit must be one of {', '.join(LENGTH_UNITS)}", "unit"
        )
    _assert_positive_number(object_size, "objectSize")
    if texture_resolution is None and target_density is None:
        raise InvalidInputError(
            "textureResolution or targetDensity is required", "textureResolution"
        )

    result = TexelDensityResult()

    if texture_resolution is not None:
        _assert_positive_number(texture_resolution, "textureResolution")
        per_unit = texture_resolution / object_size
        meters_per_unit = _METERS_PER_UNIT[unit]
        result.texel_density_px_per_unit = per_unit
        result.texel_density_px_per_meter = per_unit / meters_per_unit
        result.texel_density_px_per_inch = per_unit * (_METERS_PER_UNIT["inch"] / meters_per_unit)

    if target_density is not None:
        _assert_positive_number(target_density, "targetDensity")
        recommended = _nearest_power_of_two(target_density * object_size)
        result.recommended_resolution = recommended
        result.resulting_density_px_per_unit = recommended / object_size

    return result
