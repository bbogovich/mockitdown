"""Stylesheet assembly.

The stylesheet for a set of packs is::

    page.css                      figure, caption, error box, Elements table (not scaled)
    for each pack, root first:    its pack.css with px lengths scaled, then its token rules

**Scaling.** Inside a frame every length is expressed in the frame unit ``--u``, which is
``min(1px, 100cqw / <device width>)``: a frame never grows past its logical size and shrinks to fit
its column. Pack authors write plain ``px``; lengths above 1px are rewritten to
``calc(N * var(--u))`` here, so hairlines stay crisp.

**Tokens.** ``pack.json`` tokens become ``--mkd-<name>`` custom properties on the pack's frames.
Dark tokens apply to ``data-appearance="dark"`` frames, and to ``"auto"`` frames when the page is
dark — Material/Zensical's ``data-md-color-scheme="slate"``, or ``prefers-color-scheme: dark`` on a
page without a scheme attribute. Pack CSS never branches on appearance itself; it uses tokens.
"""

from __future__ import annotations

import re
from functools import lru_cache
from pathlib import Path

from .packs import Pack, PackRegistry

_PX = re.compile(r"(?<![\w.#-])(-?\d*\.?\d+)px\b")
_PAGE_CSS = Path(__file__).resolve().parent / "page.css"


def scale_px(css: str) -> str:
    def rep(m: re.Match) -> str:
        n = float(m.group(1))
        if abs(n) <= 1:
            return m.group(0)
        text = m.group(1).lstrip("+")
        return f"calc({text} * var(--u))"

    return _PX.sub(rep, css)


def _decls(tokens: dict[str, str]) -> str:
    out = []
    for k, v in tokens.items():
        if not re.fullmatch(r"[A-Za-z0-9_-]+", k) or any(c in str(v) for c in "{};<>"):
            continue
        out.append(f"--mkd-{k}:{scale_px(str(v))};")
    return "".join(out)


def token_css(pack: Pack) -> str:
    scope = f".mkd-pack-{pack.id} .mkd-frame"
    light = _decls(pack.tokens.get("light", {}))
    dark_tokens = {**pack.tokens.get("light", {}), **pack.tokens.get("dark", {})}
    dark = _decls(dark_tokens)
    return (
        f"{scope}{{color-scheme:light;{light}}}\n"
        f'{scope}[data-appearance="dark"]{{color-scheme:dark;{dark}}}\n'
        f'[data-md-color-scheme="slate"] {scope}[data-appearance="auto"]{{color-scheme:dark;{dark}}}\n'
        f"@media (prefers-color-scheme: dark){{body:not([data-md-color-scheme]) "
        f'{scope}[data-appearance="auto"]{{color-scheme:dark;{dark}}}}}\n'
    )


@lru_cache(maxsize=64)
def _pack_css_cached(directory: str, mtime: float, pack_id: str) -> str:
    css = (Path(directory) / "pack.css").read_text(encoding="utf-8")
    return f"/* mockitdown pack: {pack_id} */\n" + scale_px(css)


def pack_css(pack: Pack) -> str:
    if pack.directory is None or not (pack.directory / "pack.css").exists():
        return ""
    f = pack.directory / "pack.css"
    return _pack_css_cached(str(pack.directory), f.stat().st_mtime, pack.id)


def stylesheet(pack_ids: list[str], registry: PackRegistry, *, minify: bool = True) -> str:
    """The complete CSS for the given packs (their ancestors are included once, in order)."""
    seen: list[str] = []
    parts = [_PAGE_CSS.read_text(encoding="utf-8")]
    for pid in pack_ids:
        for p in registry.get(pid).lineage():
            if p.id in seen:
                continue
            seen.append(p.id)
            parts.append(pack_css(p))
            parts.append(token_css(p))
    css = "\n".join(parts)
    return minify_css(css) if minify else css


def minify_css(css: str) -> str:
    css = re.sub(r"/\*.*?\*/", "", css, flags=re.S)
    css = re.sub(r"\s+", " ", css)
    css = re.sub(r"\s*([{};,>])\s*", r"\1", css)
    css = css.replace(";}", "}")
    return css.strip()
