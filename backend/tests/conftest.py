"""Fixtures compartidos."""

from __future__ import annotations

import json
import os
import sys
from pathlib import Path

import pytest

# Asegura que la app se importa con `import app.*` sin instalar el paquete.
BACKEND_ROOT = Path(__file__).resolve().parents[1]
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

# En tests locales no queremos rate limiting real; slowapi respeta variables.
os.environ.setdefault("API_RATE_LIMIT_PER_MINUTE", "10000")


CASES_PATH = BACKEND_ROOT.parent / "shared-tests" / "cases.json"


@pytest.fixture(scope="session")
def cases() -> dict:
    with CASES_PATH.open() as f:
        return json.load(f)
