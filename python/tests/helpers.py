"""Shared test helpers."""

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "src"))

from mockitdown import RenderOptions, render  # noqa: E402,F401
from mockitdown.syntax import parse  # noqa: E402,F401


def html(src: str, **kw) -> str:
    r = render(src, RenderOptions(**kw))
    errors = [str(d) for d in r.errors]
    assert not errors, errors
    return r.html


def diags(src: str, **kw) -> list[str]:
    return [str(d) for d in render(src, RenderOptions(**kw)).diagnostics]
