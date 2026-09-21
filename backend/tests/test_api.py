"""Tests de los endpoints de la API v1 (los que no dependen de BD)."""

from __future__ import annotations

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_healthz() -> None:
    r = client.get("/healthz")
    assert r.status_code == 200
    assert r.json() == {"status": "ok"}


def test_openapi_available() -> None:
    r = client.get("/openapi.json")
    assert r.status_code == 200
    paths = r.json()["paths"]
    for endpoint in [
        "/api/v1/texture/memory",
        "/api/v1/texture/compare",
        "/api/v1/uv/texel-density",
        "/api/v1/shader/math",
        "/api/v1/projects",
        "/api/v1/projects/{project_id}",
    ]:
        assert endpoint in paths, endpoint


def test_texture_memory_ok() -> None:
    r = client.post(
        "/api/v1/texture/memory",
        json={"width": 1024, "height": 1024, "format": "RGBA32", "mipmaps": False, "count": 1},
    )
    assert r.status_code == 200
    body = r.json()
    assert body["perTextureBytes"] == 4194304
    assert body["totalBytes"] == 4194304
    assert body["warnings"] == []
    assert "formula" in body


def test_texture_memory_astc_padding_warns() -> None:
    r = client.post(
        "/api/v1/texture/memory",
        json={"width": 1024, "height": 1024, "format": "ASTC_6x6", "mipmaps": False, "count": 1},
    )
    assert r.status_code == 200
    body = r.json()
    assert body["perTextureBytes"] == 467856
    assert body["warnings"] == ["dimensions padded to 1026x1026 block-aligned size"]


def test_texture_memory_bad_input_shape_matches_contract() -> None:
    r = client.post(
        "/api/v1/texture/memory",
        json={"width": 0, "height": 1024, "format": "RGBA32", "mipmaps": False, "count": 1},
    )
    assert r.status_code == 422
    body = r.json()
    assert body["error"]["code"] == "INVALID_INPUT"
    assert body["error"]["field"] == "width"
    assert isinstance(body["error"]["message"], str)


def test_texture_memory_unknown_format() -> None:
    r = client.post(
        "/api/v1/texture/memory",
        json={"width": 1024, "height": 1024, "format": "PVRTC", "mipmaps": False, "count": 1},
    )
    assert r.status_code == 422
    assert r.json()["error"]["code"] == "INVALID_INPUT"


def test_texture_compare_has_all_formats() -> None:
    r = client.post(
        "/api/v1/texture/compare",
        json={"width": 1024, "height": 1024, "mipmaps": False, "count": 1},
    )
    assert r.status_code == 200
    results = r.json()["results"]
    assert set(results.keys()) == {"RGBA32", "BC7", "ASTC_4x4", "ASTC_6x6", "ASTC_8x8"}
    assert results["ASTC_6x6"]["warnings"] == ["dimensions padded to 1026x1026 block-aligned size"]


def test_texel_density_basic() -> None:
    r = client.post(
        "/api/v1/uv/texel-density",
        json={"textureResolution": 1024, "objectSize": 2, "unit": "m"},
    )
    assert r.status_code == 200
    body = r.json()
    assert body["texelDensityPxPerUnit"] == 512
    assert body["texelDensityPxPerMeter"] == 512


def test_texel_density_target_pow2() -> None:
    r = client.post(
        "/api/v1/uv/texel-density",
        json={"objectSize": 4, "unit": "m", "targetDensity": 100},
    )
    assert r.status_code == 200
    body = r.json()
    assert body["recommendedResolution"] == 512


def test_shader_math_lerp() -> None:
    r = client.post("/api/v1/shader/math", json={"function": "lerp", "a": 0, "b": 10, "t": 0.25})
    assert r.status_code == 200
    assert r.json()["result"] == 2.5


def test_shader_math_remap_missing_param() -> None:
    r = client.post("/api/v1/shader/math", json={"function": "remap", "value": 5, "inMin": 0})
    assert r.status_code == 422
    assert r.json()["error"]["code"] == "INVALID_INPUT"


def test_shader_math_degenerate_range() -> None:
    r = client.post(
        "/api/v1/shader/math",
        json={"function": "remap", "value": 1, "inMin": 5, "inMax": 5, "outMin": 0, "outMax": 1},
    )
    assert r.status_code == 422
    assert r.json()["error"]["field"] == "inMax"


def test_projects_returns_503_without_db() -> None:
    """Sin DATABASE_URL, el endpoint devuelve 503 en lugar de crashear."""
    r = client.get("/api/v1/projects")
    assert r.status_code == 503
