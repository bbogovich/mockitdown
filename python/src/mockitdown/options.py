"""Render options: what a fence, the Markdown extension or the CLI can set for one mockup."""

from __future__ import annotations

from dataclasses import dataclass, field, fields, replace
from pathlib import Path

APPEARANCES = ("light", "dark", "auto", "both")

#: Logical device sizes in CSS points (width, height). A pack may override them.
DEVICES: dict[str, tuple[int, int]] = {
    "phone": (393, 852),
    "phone-landscape": (852, 393),
    "tablet": (1180, 820),
    "tablet-portrait": (820, 1180),
    "desktop": (1280, 800),
    "wide": (1440, 900),
}

#: Fence attributes accepted on a ```mockitdown fence, with their types.
FENCE_OPTIONS: dict[str, type] = {
    "pack": str, "device": str, "appearance": str, "width": int, "height": int, "chrome": str,
    "title": str, "id": str, "caption": bool, "elements": bool, "url": str, "source": bool, "window": str,
    "windowed": bool, "menubar": str, "app": str,
}


@dataclass(frozen=True)
class RenderOptions:
    #: Pack id; overrides `import <Module>` and @Screen(pack:).
    pack: str | None = None
    #: Pack used when neither the options nor the source name one.
    default_pack: str = "base"
    device: str | None = None
    #: Device used when neither the options nor @Screen(device:) name one (before the pack's default).
    default_device: str | None = None
    #: light | dark | auto (follow the page) | both (side by side). None: the source's or the default.
    appearance: str | None = None
    default_appearance: str = "light"
    width: int | None = None
    height: int | None = None
    #: Chrome kind or "auto" (the pack's chrome for the device) or "none".
    chrome: str = "auto"
    title: str | None = None
    id: str | None = None
    caption: bool = True
    elements: bool = False
    #: Append the block's source in a collapsible <details> under the figure.
    source: bool = False
    #: Window kind for packs that draw window frames (e.g. "dialog", "inactive"); emitted as data-window.
    window: str | None = None
    #: Address shown by browser chrome.
    url: str | None = None
    #: Draw the app as a window over a wallpaper (iPadOS chrome, R-DEV-010.C4). None: @Screen(windowed:) or off.
    windowed: bool | None = None
    #: The macOS menu bar (R-DEV-009.C1): True, False or the title of the menu drawn open ("true"/"false"/""
    #: as text). None: @Screen(menubar:) or off.
    menubar: bool | str | None = None
    #: The application name in the menu bar (R-DEV-009.C4). None: @Screen(app:), the title, then "App".
    app: str | None = None
    import_paths: tuple[Path, ...] = ()
    asset_paths: tuple[Path, ...] = ()
    pack_paths: tuple[Path, ...] = ()
    embed_assets: bool = True
    max_embed_bytes: int = 2_000_000
    #: File the source came from (resolves relative imports and assets), if any.
    source_path: Path | None = None
    show_warnings: bool = False
    #: Edit-mode rendering (R-EDIT-004): `data-mkd-node` and `data-mkd-derived` on role roots. A library
    #: option only: the fence and the command line do not offer it.
    edit: bool = False

    def with_overrides(self, **values: object) -> RenderOptions:
        known = {f.name for f in fields(self)}
        clean = {k: v for k, v in values.items() if k in known and v is not None}
        return replace(self, **clean)


def parse_bool(value: object) -> bool:
    if isinstance(value, bool):
        return value
    return str(value).strip().lower() in ("1", "true", "yes", "on")


def coerce_fence_options(raw: dict[str, str]) -> tuple[dict[str, object], list[str]]:
    """Convert fence attribute strings to typed values. Returns (values, problems)."""
    out: dict[str, object] = {}
    problems: list[str] = []
    for key, val in raw.items():
        kind = FENCE_OPTIONS.get(key)
        if kind is None:
            problems.append(f"unknown fence option {key!r} (known: {', '.join(FENCE_OPTIONS)})")
            continue
        try:
            out[key] = parse_bool(val) if kind is bool else kind(val)
        except ValueError:
            problems.append(f"fence option {key}={val!r} is not a valid {kind.__name__}")
    if "appearance" in out and out["appearance"] not in APPEARANCES:
        problems.append(f"appearance must be one of {', '.join(APPEARANCES)}")
        del out["appearance"]
    return out, problems


__all__ = ["RenderOptions", "DEVICES", "APPEARANCES", "FENCE_OPTIONS", "coerce_fence_options", "field"]
