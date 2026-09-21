"""Paridad numérica con calc-core, contrastada contra shared-tests/cases.json."""

from __future__ import annotations

import math

import pytest

from app.calc.color import (
    Rgb,
    hex_to_rgb,
    linear_to_srgb,
    rgb_to_hex,
    rgb_to_hsl,
    srgb_to_linear,
)
from app.calc.shader import lerp, remap, smoothstep
from app.calc.texture import calculate_texture_memory, compare_formats
from app.calc.uv import calculate_texel_density


_DEFAULT_TOLERANCE = 1e-9


def _close(actual: float, expected: float, tol: float | None) -> None:
    assert math.isclose(actual, expected, abs_tol=tol if tol is not None else _DEFAULT_TOLERANCE)


# ---------- texture.memory ----------


def test_texture_memory_all_cases(cases: dict) -> None:
    for c in cases["texture.memory"]:
        i = c["input"]
        e = c["expected"]
        r = calculate_texture_memory(
            width=i["width"],
            height=i["height"],
            format=i["format"],
            mipmaps=i["mipmaps"],
            count=i["count"],
        )
        assert r.per_texture_bytes == e["perTextureBytes"], c["id"]
        assert r.per_texture_with_mipmaps_bytes == e["perTextureWithMipmapsBytes"], c["id"]
        assert r.total_bytes == e["totalBytes"], c["id"]
        assert r.warnings == e["warnings"], c["id"]
        assert isinstance(r.formula, str) and r.formula


# ---------- texture.compare ----------


def test_texture_compare_all_cases(cases: dict) -> None:
    for c in cases["texture.compare"]:
        i = c["input"]
        e = c["expected"]
        r = compare_formats(width=i["width"], height=i["height"], mipmaps=i["mipmaps"], count=i["count"])
        assert set(r.keys()) == set(e.keys()), c["id"]
        for fmt, exp in e.items():
            got = r[fmt]
            assert got.per_texture_bytes == exp["perTextureBytes"], f"{c['id']}/{fmt}"
            if "perTextureWithMipmapsBytes" in exp:
                assert got.per_texture_with_mipmaps_bytes == exp["perTextureWithMipmapsBytes"], f"{c['id']}/{fmt}"
            assert got.total_bytes == exp["totalBytes"], f"{c['id']}/{fmt}"
            assert got.warnings == exp.get("warnings", []), f"{c['id']}/{fmt}"


# ---------- uv.texelDensity ----------


def test_texel_density_all_cases(cases: dict) -> None:
    for c in cases["uv.texelDensity"]:
        i = c["input"]
        r = calculate_texel_density(
            unit=i["unit"],
            object_size=i["objectSize"],
            texture_resolution=i.get("textureResolution"),
            target_density=i.get("targetDensity"),
        )
        result_dict = {
            "texelDensityPxPerUnit": r.texel_density_px_per_unit,
            "texelDensityPxPerMeter": r.texel_density_px_per_meter,
            "texelDensityPxPerInch": r.texel_density_px_per_inch,
            "recommendedResolution": r.recommended_resolution,
            "resultingDensityPxPerUnit": r.resulting_density_px_per_unit,
        }
        for key, expected in c["expected"].items():
            actual = result_dict[key]
            assert actual is not None, f"{c['id']}: {key} debe existir"
            _close(actual, expected, c.get("tolerance"))


# ---------- shader.math ----------


def test_shader_math_all_cases(cases: dict) -> None:
    for c in cases["shader.math"]:
        i = c["input"]
        fn = i["function"]
        if fn == "lerp":
            got = lerp(i["a"], i["b"], i["t"])
        elif fn == "remap":
            got = remap(i["value"], i["inMin"], i["inMax"], i["outMin"], i["outMax"])
        elif fn == "smoothstep":
            got = smoothstep(i["edge0"], i["edge1"], i["x"])
        else:  # pragma: no cover
            pytest.fail(f"función desconocida en cases.json: {fn}")
        _close(got, c["expected"]["result"], c.get("tolerance"))


# ---------- color.convert ----------


def test_color_convert_all_cases(cases: dict) -> None:
    for c in cases["color.convert"]:
        i = c["input"]
        e = c["expected"]
        if i.get("direction") == "linearToSrgb":
            _close(linear_to_srgb(i["linear"]), e["srgb"], c.get("tolerance"))
        elif i.get("direction") == "srgbToLinear":
            _close(srgb_to_linear(i["srgb"]), e["linear"], c.get("tolerance"))
        else:
            rgb = Rgb(**i["rgb"]) if "rgb" in i else hex_to_rgb(i["hex"])
            if "rgb" in e:
                assert (rgb.r, rgb.g, rgb.b) == (e["rgb"]["r"], e["rgb"]["g"], e["rgb"]["b"]), c["id"]
            if "hex" in e:
                assert rgb_to_hex(rgb) == e["hex"], c["id"]
            hsl = rgb_to_hsl(rgb)
            _close(hsl.h, e["hsl"]["h"], 1e-9)
            _close(hsl.s, e["hsl"]["s"], 1e-9)
            _close(hsl.l, e["hsl"]["l"], 1e-9)
