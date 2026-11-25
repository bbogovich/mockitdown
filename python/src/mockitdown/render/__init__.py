"""Document assembly: an evaluated screen → the figure HTML placed in the page.

Structure (classes are the stable styling contract)::

    div.mkd-figure.mkd-pack-<id>[role=figure][data-pack][data-device][data-appearance]
      div.mkd-stage                        one cell per rendered appearance
        div.mkd-cell
          div.mkd-frame[data-appearance=light|dark|auto][data-device][data-chrome]
              style="--mkd-w:<points>;--mkd-h:<points>"   (absent in fit mode: data-fit)
            div.mkd-chrome …                  top chrome (status bar, title bar, browser bar)
            div.mkd-screen                    the views, then div.mkd-layer overlays
            div.mkd-chrome …                  bottom chrome (home indicator)
          div.mkd-cell__label                 "Light" / "Dark" when appearance=both
      div.mkd-caption                         "<id> · <title>"
      table.mkd-elements                      optional Elements table
"""

from __future__ import annotations

import hashlib

from ..diagnostics import Diagnostics
from ..model import Screen, walk
from ..options import DEVICES, RenderOptions
from . import chrome as chrome_mod
from .html import Renderer, esc

__all__ = ["render_screen", "Renderer"]


def _resolve_device(screen: Screen, opts: RenderOptions, diags: Diagnostics) -> tuple[str, tuple[int, int] | None]:
    device = (opts.device or (str(screen.meta["device"]) if screen.meta.get("device") else None)
              or opts.default_device or screen.pack.device)
    if device == "fit":
        return "fit", None
    if opts.width and opts.height:
        return device, (opts.width, opts.height)
    size = screen.pack.sizes.get(device) or DEVICES.get(device)
    if size is None:
        diags.warning(f"unknown device {device!r}; using desktop (known: {', '.join([*DEVICES, 'fit'])})",
                      None, "device")
        device = "desktop"
        size = screen.pack.sizes.get(device) or DEVICES[device]
    if opts.width or opts.height:
        size = (opts.width or size[0], opts.height or size[1])
    return device, size


def render_screen(screen: Screen, renderer: Renderer, opts: RenderOptions, diags: Diagnostics,
                  source: str = "") -> str:
    pack = screen.pack
    device, size = _resolve_device(screen, opts, diags)
    appearance = opts.appearance or (str(screen.meta["appearance"]) if screen.meta.get("appearance") else None) \
        or opts.default_appearance
    if appearance not in ("light", "dark", "auto", "both"):
        diags.warning(f"unknown appearance {appearance!r}; using light", None, "appearance")
        appearance = "light"
    chrome = opts.chrome if opts.chrome not in ("", "auto") else str(screen.meta.get("chrome", "auto"))
    if chrome == "auto":
        chrome = pack.chrome_for(device)
    if chrome not in chrome_mod.CHROME_KINDS:
        diags.warning(f"unknown chrome {chrome!r} (known: {', '.join(chrome_mod.CHROME_KINDS)})", None, "chrome")
        chrome = "none"
    title = opts.title or str(screen.meta.get("title") or "")
    sid = opts.id or str(screen.meta.get("id") or "")
    url = opts.url or (str(screen.meta["url"]) if screen.meta.get("url") else None)
    window = opts.window or (str(screen.meta["window"]) if screen.meta.get("window") else None)
    window_attr = f' data-window="{esc(window)}"' if window else ""

    renderer.anchor_prefix = anchor_prefix(pack.id, source)
    body = renderer.views(screen.views)
    overlays = "".join(renderer.overlays)
    screen_html = f'<div class="mkd-screen">{body}{overlays}</div>'
    frame_inner = chrome_mod.top(chrome, title, url) + screen_html + chrome_mod.bottom(chrome)

    if size is None:
        dims = ' data-fit="true"'
    else:
        dims = f' style="--mkd-w:{int(size[0])};--mkd-h:{int(size[1])}"'
    modes = ["light", "dark"] if appearance == "both" else [appearance]
    cells = []
    for mode in modes:
        label = f'<div class="mkd-cell__label">{mode.title()}</div>' if appearance == "both" else ""
        cells.append(f'<div class="mkd-cell"><div class="mkd-frame" data-appearance="{mode}" '
                     f'data-device="{esc(device)}" data-chrome="{esc(chrome)}"{window_attr}{dims}>{frame_inner}</div>{label}</div>')
    caption = ""
    if opts.caption and (title or sid):
        caption = f'<div class="mkd-caption">{esc(" · ".join(x for x in (sid, title) if x))}</div>'
    table = elements_table(screen) if opts.elements else ""
    aria = f' aria-label="{esc(title or sid or pack.name + " mockup")}"'
    return (f'<div class="mkd-figure mkd-pack-{esc(pack.id)}" role="figure"{aria} data-pack="{esc(pack.id)}" '
            f'data-device="{esc(device)}" data-appearance="{esc(appearance)}">'
            f'<div class="mkd-stage" data-count="{len(cells)}">{"".join(cells)}</div>{caption}{table}</div>')


def anchor_prefix(pack_id: str, source: str) -> str:
    """The figure's CSS anchor prefix (R-ANN-003): the first six hex digits of the SHA-1 of the pack id,
    a line feed and the block source, as UTF-8 — portable, so every variant names anchors alike."""
    return hashlib.sha1(f"{pack_id}\n{source}".encode("utf-8")).hexdigest()[:6]


def elements_table(screen: Screen) -> str:
    """The Elements table: one row per view carrying ``.id()``, with its element, struct and refs."""
    rows = []
    for v in walk(screen.views):
        m = v.mod("id")
        if m is None or m.arg() is None:
            continue
        ref = v.mod("ref")
        refs = " ".join(str(a) for a in ref.args) if ref else ""
        rows.append(f"<tr><td><code>{esc(m.arg())}</code></td><td>{esc(v.name)}</td>"
                    f"<td>{esc(v.component)}</td><td>{esc(refs)}</td></tr>")
    if not rows:
        return ""
    return ('<table class="mkd-elements"><thead><tr><th>ID</th><th>Element</th><th>Component</th><th>Refs</th>'
            f'</tr></thead><tbody>{"".join(rows)}</tbody></table>')
