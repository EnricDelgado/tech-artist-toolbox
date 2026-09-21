"""Color utilities: RGB/HEX/HSL + linear/sRGB (IEC 61966-2-1). Port de calc-core."""

from __future__ import annotations

import re
from dataclasses import dataclass

from app.errors import InvalidInputError

_HEX_RE = re.compile(r"^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$")


@dataclass(frozen=True)
class Rgb:
    r: int
    g: int
    b: int


@dataclass(frozen=True)
class Hsl:
    h: float  # grados [0, 360)
    s: float  # porcentaje [0, 100]
    l: float  # porcentaje [0, 100]


def _assert_channel(value: int, field_name: str) -> None:
    if not isinstance(value, int) or isinstance(value, bool) or value < 0 or value > 255:
        raise InvalidInputError(
            f"{field_name} must be an integer between 0 and 255", field_name
        )


def _assert_unit(value: float, field_name: str) -> None:
    if not isinstance(value, (int, float)) or isinstance(value, bool):
        raise InvalidInputError(f"{field_name} must be a number between 0 and 1", field_name)
    fv = float(value)
    if fv < 0 or fv > 1 or fv != fv or fv in (float("inf"), float("-inf")):
        raise InvalidInputError(f"{field_name} must be a number between 0 and 1", field_name)


def rgb_to_hex(rgb: Rgb) -> str:
    _assert_channel(rgb.r, "r")
    _assert_channel(rgb.g, "g")
    _assert_channel(rgb.b, "b")
    return f"#{rgb.r:02X}{rgb.g:02X}{rgb.b:02X}"


def hex_to_rgb(hex_str: str) -> Rgb:
    match = _HEX_RE.match(hex_str.strip() if isinstance(hex_str, str) else "")
    if not match:
        raise InvalidInputError("hex must be #RGB or #RRGGBB", "hex")
    digits = match.group(1)
    if len(digits) == 3:
        digits = "".join(c + c for c in digits)
    return Rgb(int(digits[0:2], 16), int(digits[2:4], 16), int(digits[4:6], 16))


def rgb_to_hsl(rgb: Rgb) -> Hsl:
    _assert_channel(rgb.r, "r")
    _assert_channel(rgb.g, "g")
    _assert_channel(rgb.b, "b")
    r, g, b = rgb.r / 255.0, rgb.g / 255.0, rgb.b / 255.0
    mx, mn = max(r, g, b), min(r, g, b)
    d = mx - mn
    l = (mx + mn) / 2

    if d == 0:
        return Hsl(0.0, 0.0, l * 100)

    s = d / (1 - abs(2 * l - 1))
    if mx == r:
        h = ((g - b) / d) % 6
    elif mx == g:
        h = (b - r) / d + 2
    else:
        h = (r - g) / d + 4
    h *= 60
    if h < 0:
        h += 360

    return Hsl(h, s * 100, l * 100)


def hsl_to_rgb(hsl: Hsl) -> Rgb:
    if not (0 <= hsl.s <= 100):
        raise InvalidInputError("s must be between 0 and 100", "s")
    if not (0 <= hsl.l <= 100):
        raise InvalidInputError("l must be between 0 and 100", "l")
    h = hsl.h % 360
    if h < 0:
        h += 360
    s = hsl.s / 100
    l = hsl.l / 100

    c = (1 - abs(2 * l - 1)) * s
    x = c * (1 - abs(((h / 60) % 2) - 1))
    m = l - c / 2

    if h < 60:
        r1, g1, b1 = c, x, 0
    elif h < 120:
        r1, g1, b1 = x, c, 0
    elif h < 180:
        r1, g1, b1 = 0, c, x
    elif h < 240:
        r1, g1, b1 = 0, x, c
    elif h < 300:
        r1, g1, b1 = x, 0, c
    else:
        r1, g1, b1 = c, 0, x

    return Rgb(round((r1 + m) * 255), round((g1 + m) * 255), round((b1 + m) * 255))


def linear_to_srgb(linear: float) -> float:
    """IEC 61966-2-1."""
    _assert_unit(linear, "linear")
    if linear <= 0.0031308:
        return linear * 12.92
    return 1.055 * (linear ** (1 / 2.4)) - 0.055


def srgb_to_linear(srgb: float) -> float:
    """IEC 61966-2-1."""
    _assert_unit(srgb, "srgb")
    if srgb <= 0.04045:
        return srgb / 12.92
    return ((srgb + 0.055) / 1.055) ** 2.4
