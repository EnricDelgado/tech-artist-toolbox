"""Shader Math Playground (port de calc-core)."""

from __future__ import annotations

from app.errors import InvalidInputError


def _assert_finite(value: float, field_name: str) -> None:
    if not isinstance(value, (int, float)) or isinstance(value, bool):
        raise InvalidInputError(f"{field_name} must be a finite number", field_name)
    fv = float(value)
    if fv != fv or fv in (float("inf"), float("-inf")):  # NaN / Inf
        raise InvalidInputError(f"{field_name} must be a finite number", field_name)


def lerp(a: float, b: float, t: float) -> float:
    """lerp(a, b, t) = a + (b - a) * t.  Sin clamp (igual que HLSL/GLSL)."""
    _assert_finite(a, "a")
    _assert_finite(b, "b")
    _assert_finite(t, "t")
    return a + (b - a) * t


def remap(
    value: float, in_min: float, in_max: float, out_min: float, out_max: float
) -> float:
    """remap(v, i0, i1, o0, o1) = o0 + (v - i0)/(i1 - i0) * (o1 - o0). Sin clamp."""
    for name, v in [
        ("value", value),
        ("inMin", in_min),
        ("inMax", in_max),
        ("outMin", out_min),
        ("outMax", out_max),
    ]:
        _assert_finite(v, name)
    if in_min == in_max:
        raise InvalidInputError("inMin and inMax must differ", "inMax")
    return out_min + (value - in_min) / (in_max - in_min) * (out_max - out_min)


def smoothstep(edge0: float, edge1: float, x: float) -> float:
    """Hermite: t = clamp((x - e0)/(e1 - e0), 0, 1); return t*t*(3 - 2*t)."""
    _assert_finite(edge0, "edge0")
    _assert_finite(edge1, "edge1")
    _assert_finite(x, "x")
    if edge0 == edge1:
        raise InvalidInputError("edge0 and edge1 must differ", "edge1")
    t = max(0.0, min(1.0, (x - edge0) / (edge1 - edge0)))
    return t * t * (3 - 2 * t)
