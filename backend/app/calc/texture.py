"""Texture Memory Calculator + Compression Comparator (port de calc-core)."""

from __future__ import annotations

import math
from dataclasses import dataclass, field
from typing import Literal

from app.errors import InvalidInputError

TextureFormat = Literal["RGBA32", "BC7", "ASTC_4x4", "ASTC_6x6", "ASTC_8x8"]

TEXTURE_FORMATS: tuple[TextureFormat, ...] = ("RGBA32", "BC7", "ASTC_4x4", "ASTC_6x6", "ASTC_8x8")


@dataclass(frozen=True)
class _FormatSpec:
    block_width: int
    block_height: int
    bytes_per_block: int


# Tabla equivalente a la de calc-core/src/texture/memory.ts.
_FORMAT_SPECS: dict[TextureFormat, _FormatSpec] = {
    "RGBA32": _FormatSpec(1, 1, 4),
    "BC7": _FormatSpec(4, 4, 16),
    "ASTC_4x4": _FormatSpec(4, 4, 16),
    "ASTC_6x6": _FormatSpec(6, 6, 16),
    "ASTC_8x8": _FormatSpec(8, 8, 16),
}

_FORMULAS: dict[TextureFormat, str] = {
    "RGBA32": "w * h * 4 bytes",
    "BC7": "ceil(w/4) * ceil(h/4) * 16 bytes",
    "ASTC_4x4": "ceil(w/4) * ceil(h/4) * 16 bytes",
    "ASTC_6x6": "ceil(w/6) * ceil(h/6) * 16 bytes",
    "ASTC_8x8": "ceil(w/8) * ceil(h/8) * 16 bytes",
}


@dataclass
class TextureMemoryResult:
    per_texture_bytes: int
    per_texture_with_mipmaps_bytes: int
    total_bytes: int
    formula: str
    warnings: list[str] = field(default_factory=list)


def _assert_positive_int(value: int, field_name: str) -> None:
    if not isinstance(value, int) or isinstance(value, bool) or value < 1:
        raise InvalidInputError(f"{field_name} must be a positive integer", field_name)


def calculate_texture_memory(
    *,
    width: int,
    height: int,
    format: TextureFormat,
    mipmaps: bool,
    count: int,
) -> TextureMemoryResult:
    """Memoria estimada de una o varias texturas.

    Fórmula por textura (sin mipmaps):
        bytes = ceil(width / blockW) * ceil(height / blockH) * bytesPerBlock
    Con mipmaps (cadena completa, factor geométrico 4/3):
        bytesConMips = floor(bytes * 4 / 3)
    Total:
        total = (mipmaps ? bytesConMips : bytes) * count

    Idéntica a calc-core (TypeScript). Cualquier cambio aquí debe pasar por
    shared-tests/cases.json y ser reflejado también en calc-core.
    """
    _assert_positive_int(width, "width")
    _assert_positive_int(height, "height")
    _assert_positive_int(count, "count")
    if format not in _FORMAT_SPECS:
        raise InvalidInputError(
            f"format must be one of {', '.join(TEXTURE_FORMATS)}", "format"
        )

    spec = _FORMAT_SPECS[format]
    blocks_x = math.ceil(width / spec.block_width)
    blocks_y = math.ceil(height / spec.block_height)
    per_texture_bytes = blocks_x * blocks_y * spec.bytes_per_block
    per_texture_with_mipmaps_bytes = (
        (per_texture_bytes * 4) // 3 if mipmaps else per_texture_bytes
    )
    total_bytes = per_texture_with_mipmaps_bytes * count

    warnings: list[str] = []
    padded_w = blocks_x * spec.block_width
    padded_h = blocks_y * spec.block_height
    if padded_w != width or padded_h != height:
        warnings.append(f"dimensions padded to {padded_w}x{padded_h} block-aligned size")

    formula = f"{_FORMULAS[format]}; mipmaps ≈ ×4/3" if mipmaps else _FORMULAS[format]
    return TextureMemoryResult(
        per_texture_bytes=per_texture_bytes,
        per_texture_with_mipmaps_bytes=per_texture_with_mipmaps_bytes,
        total_bytes=total_bytes,
        formula=formula,
        warnings=warnings,
    )


def compare_formats(
    *, width: int, height: int, mipmaps: bool, count: int
) -> dict[TextureFormat, TextureMemoryResult]:
    """Devuelve el resultado para cada formato soportado en el MVP."""
    return {
        fmt: calculate_texture_memory(
            width=width, height=height, format=fmt, mipmaps=mipmaps, count=count
        )
        for fmt in TEXTURE_FORMATS
    }
