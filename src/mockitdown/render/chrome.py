"""Device chrome: the status bars, title bars and browser bars drawn around a screen.

A pack maps each device form to a chrome kind (``pack.json`` ``chrome``); a fence may force one
with ``chrome=…``. Chrome is static markup styled by the base stylesheet and the pack.
"""

from __future__ import annotations

from .. import icons
from .html import esc

CHROME_KINDS = ("none", "ios", "ipados", "macos", "windows", "android", "browser", "gnome", "kde", "win31")


def _i(name: str) -> str:
    return icons.svg(name, "mkd-icon")[0]


def top(kind: str, title: str, url: str | None) -> str:
    if kind == "ios":
        return ('<div class="mkd-chrome mkd-chrome--status" data-chrome="ios"><span class="mkd-chrome__time">9:41</span>'
                '<span class="mkd-chrome__island"></span><span class="mkd-chrome__icons">'
                f'{_i("cellularbars")}{_i("wifi")}{_i("battery")}</span></div>')
    if kind == "ipados":
        return ('<div class="mkd-chrome mkd-chrome--status" data-chrome="ipados"><span class="mkd-chrome__time">'
                '9:41 Mon Nov 23</span><span class="mkd-chrome__icons">'
                f'{_i("wifi")}<span class="mkd-chrome__pct">100%</span>{_i("battery")}</span></div>')
    if kind == "android":
        return ('<div class="mkd-chrome mkd-chrome--status" data-chrome="android"><span class="mkd-chrome__time">'
                f'9:30</span><span class="mkd-chrome__icons">{_i("wifi")}{_i("cellularbars")}{_i("battery")}'
                "</span></div>")
    if kind == "macos":
        return ('<div class="mkd-chrome mkd-chrome--titlebar" data-chrome="macos"><span class="mkd-chrome__lights">'
                '<i data-light="close"></i><i data-light="min"></i><i data-light="max"></i></span>'
                f'<span class="mkd-chrome__title">{esc(title)}</span><span class="mkd-chrome__spacer"></span></div>')
    if kind == "windows":
        return ('<div class="mkd-chrome mkd-chrome--titlebar" data-chrome="windows"><span class="mkd-chrome__app">'
                f'{_i("app")}</span><span class="mkd-chrome__title">{esc(title)}</span>'
                '<span class="mkd-chrome__controls"><i data-control="min"></i><i data-control="max"></i>'
                '<i data-control="close"></i></span></div>')
    if kind == "gnome":
        # libadwaita apps draw their own header bar (HeaderBar element); the window is just rounded.
        return ""
    if kind == "kde":
        return ('<div class="mkd-chrome mkd-chrome--titlebar" data-chrome="kde"><span class="mkd-chrome__app">'
                f'{_i("app")}</span><span class="mkd-chrome__title">{esc(title)}</span>'
                '<span class="mkd-chrome__controls"><i data-control="min"></i><i data-control="max"></i>'
                '<i data-control="close"></i></span></div>')
    if kind == "win31":
        return ('<div class="mkd-chrome mkd-chrome--titlebar" data-chrome="win31"><span class="mkd-chrome__sysmenu">'
                f'<i></i></span><span class="mkd-chrome__title">{esc(title)}</span>'
                '<span class="mkd-chrome__controls"><i data-control="min"></i><i data-control="max"></i></span></div>')
    if kind == "browser":
        address = url or "https://app.example.com"
        return ('<div class="mkd-chrome mkd-chrome--browser" data-chrome="browser"><span class="mkd-chrome__lights">'
                '<i data-light="close"></i><i data-light="min"></i><i data-light="max"></i></span>'
                f'<span class="mkd-chrome__nav">{_i("chevron.left")}{_i("chevron.right")}{_i("arrow.clockwise")}</span>'
                f'<span class="mkd-chrome__address">{_i("lock")}<span>{esc(address)}</span></span>'
                f'<span class="mkd-chrome__menu">{_i("ellipsis.vertical")}</span></div>')
    return ""


def bottom(kind: str) -> str:
    if kind == "ios":
        return '<div class="mkd-chrome mkd-chrome--home" data-chrome="ios"><span class="mkd-chrome__indicator"></span></div>'
    if kind == "android":
        return ('<div class="mkd-chrome mkd-chrome--home" data-chrome="android"><span class="mkd-chrome__indicator">'
                "</span></div>")
    return ""
