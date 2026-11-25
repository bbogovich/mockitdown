"""Built-in icon set: 24×24 line glyphs drawn for mockitdown, with aliases for the icon names used
by SF Symbols, Material Symbols, Fluent UI System Icons and SAP icons.

Icons are emitted as inline SVG using ``currentColor``; a pack styles them through the
``--mkd-icon-stroke`` token. The glyphs are original drawings (no third-party icon font is
bundled), so names map to the closest glyph rather than to an exact copy of the framework icon.

The glyphs and aliases are data, written once in the repository's ``shared/icons/icons.json`` and
copied into this package at build time as ``icons.json`` (R-REPO-002).
"""

from __future__ import annotations

import json
import re
from pathlib import Path

_DATA = json.loads((Path(__file__).resolve().parent / "icons.json").read_text(encoding="utf-8"))

#: Glyph name → SVG inner markup (24×24 viewBox), from the shared icon table ``shared/icons/icons.json``.
ICONS: dict[str, str] = dict(_DATA["glyphs"])
#: Framework icon name → glyph name.
ALIASES: dict[str, str] = dict(_DATA["aliases"])

_DROP = {"16", "20", "24", "28", "32", "48", "regular", "filled", "outline", "outlined", "rounded", "sharp",
         "ic", "fluent", "symbol", "symbols", "light", "color"}


def normalize(name: str) -> str:
    """``ChevronRight24Regular`` → ``chevron.right``; ``more_vert`` → ``more.vert``."""
    s = name.strip()
    if s.lower().startswith("sap-icon://"):
        s = s[len("sap-icon://"):]
    s = re.sub(r"(?<=[a-z0-9])(?=[A-Z])", ".", s)
    s = re.sub(r"(?<=[A-Za-z])(?=\d)", ".", s)
    tokens = [t for t in re.split(r"[._\-\s/]+", s.lower()) if t and t not in _DROP]
    return ".".join(tokens)


def resolve(name: str) -> str | None:
    """The canonical glyph for ``name``, or None when nothing matches."""
    if name in ICONS:
        return name
    if name in ALIASES:
        return ALIASES[name]
    key = normalize(name)
    for cand in (key, key.removesuffix(".fill"), key.removesuffix(".circle"), key.removesuffix(".fill.circle")):
        if cand in ICONS:
            return cand
        if cand in ALIASES:
            return ALIASES[cand]
    head = key.split(".")[0] if key else ""
    if head in ICONS:
        return head
    if head in ALIASES:
        return ALIASES[head]
    return None


def svg(name: str, cls: str = "mkd-icon") -> tuple[str, bool]:
    """``(<svg …>, found)``. An unknown name renders a neutral placeholder glyph."""
    glyph = resolve(name)
    body = ICONS[glyph] if glyph else ICONS["questionmark"]
    return (
        f'<svg class="{cls}" data-icon="{glyph or "unknown"}" viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" '
        f'stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">{body}</svg>',
        glyph is not None,
    )
