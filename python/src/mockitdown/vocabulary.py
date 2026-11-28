"""Modifier vocabulary shared by every pack.

* RENDERED: modifiers the HTML renderer interprets (layout, typography, colour, navigation …).
* MODIFIERS: the group and argument types of each rendered modifier (R-PACK-017.C5), for the design tools.
* IGNORED: behaviour-only SwiftUI modifiers accepted silently so real SwiftUI code can be pasted.
* MENUBAR: the standard menus of the macOS menu bar (R-DEV-009).

A pack adds attribute-setting modifiers in its ``pack.json`` ``modifiers`` map (for instance
``buttonStyle`` → ``variant``). Any other modifier draws a warning and is ignored.

The lists are data, written once in the repository's ``shared/language/vocabulary.json`` and copied
into this package at build time as ``vocabulary.json`` (R-REPO-002).
"""

from __future__ import annotations

import json
from pathlib import Path

_DATA = json.loads((Path(__file__).resolve().parent / "vocabulary.json").read_text(encoding="utf-8"))

RENDERED = frozenset(_DATA["rendered"])
IGNORED = frozenset(_DATA["ignored"])

#: Rendered modifier → ``{"group": str, "args": [{"label": str | None, "type": …}]}``; rendering never reads it.
MODIFIERS: dict = _DATA.get("modifiers", {})

#: The macOS menu bar's standard menus and clock (R-DEV-009.C3, C6): ``{"clock": str, "menus": [{"title",
#: "id"?, "entries": ["-" | {"placement"?, "items": [{"title", "key"?, "modifiers"?, "submenu"?}]}]}]}``.
MENUBAR: dict = _DATA.get("menubar", {"clock": "", "menus": []})

#: Import names that select no pack but are legal in pasted Swift code.
NEUTRAL_MODULES = frozenset(_DATA["neutral_modules"])
