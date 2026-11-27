"""Design packs: the element vocabulary, tokens, chrome and stylesheet of one UI framework.

A pack is a directory holding ``pack.json`` (data) and ``pack.css`` (styles). Packs inherit:
every built-in pack ``extends`` ``base``, which defines the portable core vocabulary (stacks,
text, images, buttons …) and the structural CSS of every render role. A pack adds its native
element names, maps them onto roles with default attributes, and restyles the roles.

``pack.json`` keys::

    id, name            identifier used in fences (pack="fluent") and its display name
    framework, version  what it imitates, e.g. "Fluent 2 · WinUI 3", "Windows App SDK 1.8"
    extends             parent pack id (default "base"; base itself has none)
    modules             names accepted by `import <Module>` to select the pack
    device              default device form: phone | tablet | desktop
    chrome              device form → chrome kind (ios, ipados, macos, windows, android, browser, none)
    hidden              true for packs left out of listings (they still work when named)
    tokens              {"light": {name: value}, "dark": {name: value}} → --mkd-<name> CSS properties
    elements            Name → {role, params, defaults, variants, doc, attrs, sample}
    modifiers           modifier name → {"attr": attribute it sets, "value": optional fixed value}
    fonts               font style aliases → canonical font style (e.g. "h4": "title2")
    sizes               device form → [width, height] in CSS points
    icons               icon name → built-in glyph name (pack-specific meaning of a name)
    attrs               argument label → attribute name it stands for (e.g. "placeholderText": "placeholder")

Site-defined packs are loaded from extra directories (``pack_paths``) with the same layout.
"""

from __future__ import annotations

import json
import re
from dataclasses import dataclass, field
from functools import lru_cache
from pathlib import Path

from ..diagnostics import MockitdownError

BUILTIN_DIR = Path(__file__).resolve().parent


@dataclass(frozen=True)
class ElementDef:
    name: str
    role: str
    #: Names given, in order, to positional arguments.
    params: tuple[str, ...] = ()
    #: Attribute values applied before the call's own arguments.
    defaults: tuple[tuple[str, object], ...] = ()
    #: Documented values of the ``variant`` attribute (empty: not validated).
    variants: tuple[str, ...] = ()
    doc: str = ""
    #: Argument label → attribute name for this element only (e.g. SAP `type:` → `variant`).
    attrs: tuple[tuple[str, str], ...] = ()
    #: mockitdown source of one call showing the element doing its job, for the reference gallery (R-PACK-013).
    sample: str = ""

    @property
    def default_attrs(self) -> dict[str, object]:
        return dict(self.defaults)


@dataclass
class Pack:
    id: str
    name: str
    framework: str = ""
    version: str = ""
    parent: Pack | None = None
    modules: tuple[str, ...] = ()
    device: str = "desktop"
    chrome: dict[str, str] = field(default_factory=dict)
    tokens: dict[str, dict[str, str]] = field(default_factory=lambda: {"light": {}, "dark": {}})
    elements: dict[str, ElementDef] = field(default_factory=dict)
    modifiers: dict[str, dict] = field(default_factory=dict)
    fonts: dict[str, str] = field(default_factory=dict)
    #: Device form → (width, height) overriding the default sizes.
    sizes: dict[str, tuple[int, int]] = field(default_factory=dict)
    #: Icon name → built-in glyph name, consulted before the global aliases.
    icons: dict[str, str] = field(default_factory=dict)
    #: Argument label → canonical attribute name, applied to every element's labelled arguments.
    attrs: dict[str, str] = field(default_factory=dict)
    directory: Path | None = None
    #: Hidden packs (easter eggs) work everywhere but are left out of listings.
    hidden: bool = False
    #: Element names defined by this pack itself (not inherited), for documentation.
    own_elements: tuple[str, ...] = ()

    def element(self, name: str) -> ElementDef | None:
        return self.elements.get(name)

    def lineage(self) -> list[Pack]:
        """This pack and its ancestors, root first."""
        chain: list[Pack] = []
        p: Pack | None = self
        while p is not None:
            chain.append(p)
            p = p.parent
        return list(reversed(chain))

    def css_text(self) -> str:
        """This pack's own stylesheet (not its ancestors')."""
        if self.directory is None:
            return ""
        f = self.directory / "pack.css"
        return f.read_text(encoding="utf-8") if f.exists() else ""

    def chrome_for(self, device: str) -> str:
        return self.chrome.get(device, "none")

    def font(self, name: str) -> str:
        for p in reversed(self.lineage()):
            if name in p.fonts:
                return p.fonts[name]
        return name


def _element(name: str, raw: dict, where: str) -> ElementDef:
    if "role" not in raw:
        raise MockitdownError(f"{where}: element {name!r} has no 'role'")
    return ElementDef(
        name=name,
        role=raw["role"],
        params=tuple(raw.get("params", ())),
        defaults=tuple(sorted(raw.get("defaults", {}).items())),
        variants=tuple(raw.get("variants", ())),
        doc=raw.get("doc", ""),
        attrs=tuple(sorted(raw.get("attrs", {}).items())),
        sample=raw.get("sample", ""),
    )


def _refuse_import(pack_id: str, css_file: Path) -> None:
    """A site pack's stylesheet may not include partials: the built-in packs' `@import` lines are
    resolved when the package is built, a site pack's never are (R-PACK-018.C8)."""
    if css_file.is_file() and "@import" in re.sub(r"/\*.*?(\*/|$)", "", css_file.read_text(encoding="utf-8"), flags=re.S):
        raise MockitdownError(f"pack {pack_id!r}: @import is resolved only in built-in packs")


class PackRegistry:
    """Finds and loads packs from the built-in directory and any extra directories."""

    def __init__(self, extra_dirs: tuple[str | Path, ...] = ()) -> None:
        self.dirs = [Path(d) for d in extra_dirs] + [BUILTIN_DIR]
        self._cache: dict[str, Pack] = {}
        self._module_index: dict[str, str] | None = None

    def _find_dir(self, pack_id: str) -> Path | None:
        for d in self.dirs:
            cand = d / pack_id
            if (cand / "pack.json").is_file():
                return cand
        return None

    def ids(self) -> list[str]:
        seen: list[str] = []
        for d in self.dirs:
            if d.is_dir():
                for sub in sorted(d.iterdir()):
                    if (sub / "pack.json").is_file() and sub.name not in seen:
                        seen.append(sub.name)
        return seen

    def get(self, pack_id: str) -> Pack:
        if pack_id in self._cache:
            return self._cache[pack_id]
        d = self._find_dir(pack_id)
        if d is None:
            raise MockitdownError(f"unknown pack {pack_id!r}; known packs: {', '.join(self.ids())}")
        where = str(d / "pack.json")
        if d.parent.resolve() != BUILTIN_DIR:
            _refuse_import(pack_id, d / "pack.css")
        try:
            raw = json.loads((d / "pack.json").read_text(encoding="utf-8"))
        except ValueError as e:
            raise MockitdownError(f"{where}: invalid JSON: {e}") from None
        parent_id = raw.get("extends", None if pack_id == "base" else "base")
        if parent_id == pack_id:
            raise MockitdownError(f"{where}: a pack cannot extend itself")
        parent = self.get(parent_id) if parent_id else None
        own = {n: _element(n, e, where) for n, e in raw.get("elements", {}).items()}
        tokens = {"light": {}, "dark": {}}
        if parent:
            tokens = {k: dict(v) for k, v in parent.tokens.items()}
        for mode in ("light", "dark"):
            tokens[mode].update(raw.get("tokens", {}).get(mode, {}))
        pack = Pack(
            id=raw.get("id", pack_id),
            name=raw.get("name", pack_id),
            framework=raw.get("framework", ""),
            version=raw.get("version", ""),
            parent=parent,
            modules=tuple(raw.get("modules", ())),
            device=raw.get("device", parent.device if parent else "desktop"),
            chrome={**(parent.chrome if parent else {}), **raw.get("chrome", {})},
            tokens=tokens,
            elements={**(parent.elements if parent else {}), **own},
            modifiers={**(parent.modifiers if parent else {}), **raw.get("modifiers", {})},
            fonts=raw.get("fonts", {}),
            sizes={**(parent.sizes if parent else {}),
                   **{k: (int(v[0]), int(v[1])) for k, v in raw.get("sizes", {}).items()}},
            icons={**(parent.icons if parent else {}), **raw.get("icons", {})},
            attrs={**(parent.attrs if parent else {}), **raw.get("attrs", {})},
            directory=d,
            hidden=bool(raw.get("hidden", False)),
            own_elements=tuple(own),
        )
        self._cache[pack_id] = pack
        return pack

    def for_module(self, module: str) -> str | None:
        """The pack id that ``import <module>`` selects, if any (case-insensitive)."""
        if self._module_index is None:
            idx: dict[str, str] = {}
            for pid in self.ids():
                try:
                    pack = self.get(pid)
                except (MockitdownError, ValueError, OSError):
                    continue  # a broken pack must not break blocks that use other packs
                for m in pack.modules:
                    idx.setdefault(m.lower(), pid)
            self._module_index = idx
        return self._module_index.get(module.lower())


@lru_cache(maxsize=16)
def registry(extra_dirs: tuple[str, ...] = ()) -> PackRegistry:
    return PackRegistry(extra_dirs)
