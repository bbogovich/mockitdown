"""Helpers shared by the HTML renderer (:mod:`mockitdown.render.html`) and its role families
(:mod:`mockitdown.render.roles`): escaping, inline Markdown, value coercion and shared markup."""

from __future__ import annotations

import html
import re

from ..model import EnumValue, Thunk, ViewList

_INLINE_MD = [
    (re.compile(r"\*\*(.+?)\*\*"), r"<strong>\1</strong>"),
    (re.compile(r"(?<![*\w])\*(?!\s)(.+?)(?<!\s)\*(?![*\w])"), r"<em>\1</em>"),
    (re.compile(r"`(.+?)`"), r'<code class="mkd-code">\1</code>'),
    (re.compile(r"~~(.+?)~~"), r"<s>\1</s>"),
    (re.compile(r"\[(.+?)\]\((?:[^)\s]+)\)"), r'<span class="mkd-link" role="link">\1</span>'),
]
PH = ' data-placeholder="true"'
_CURSORS = {
    "arrow": '<path d="M5 3v16l4.2-4 2.9 6.6 2.6-1.1-2.8-6.5H18z"/>',
    "hand": ('<path d="M9.5 21c-2-1.6-3.6-3.6-4.6-5.6-.5-1 .3-2 1.3-1.6l1.8.8V5.2a1.4 1.4 0 0 1 2.8 0v5.3V9.2a1.4 1.4 0 0 1'
             ' 2.8 0v1.6-.9a1.4 1.4 0 0 1 2.8 0v1.3-.5a1.4 1.4 0 0 1 2.8 0v4.6c0 2.6-1.1 4.5-2.6 5.7z"/>'),
    "ibeam": '<path d="M9 4h6M9 20h6M12 4v16"/>',
    "crosshair": '<path d="M12 3v18M3 12h18"/>',
    "grab": ('<path d="M7 12V9.5a1.4 1.4 0 0 1 2.8 0V11V8.2a1.4 1.4 0 0 1 2.8 0V11V8.7a1.4 1.4 0 0 1 2.8 0V11.5V10a1.4 '
             '1.4 0 0 1 2.8 0v4.5c0 3.5-2.4 6.5-6 6.5-2.6 0-4.3-1.3-5.6-3.4L5 14.8c-.6-1 .6-2 1.5-1.3z"/>'),
    "touch": '<circle cx="12" cy="12" r="7"/>',
}


def esc(s: object) -> str:
    return html.escape("" if s is None else str(s), quote=True)


def text_html(s: object) -> str:
    """Escape text and apply the inline Markdown that SwiftUI ``Text`` supports."""
    out = esc(s).replace("\\*", "\x00").replace("\\_", "\x01").replace("\\`", "\x02")
    for pat, rep in _INLINE_MD:
        out = pat.sub(rep, out)
    return out.replace("\x00", "*").replace("\x01", "_").replace("\x02", "`").replace("\n", "<br>")


def _fmt(v: object) -> str:
    if isinstance(v, bool):
        return "true" if v else "false"
    if isinstance(v, float):
        return str(int(v)) if v.is_integer() else f"{v:g}"
    if isinstance(v, EnumValue):
        return v.name
    return "" if v is None else str(v)


def _num(v: object, default: float | None = None) -> float | None:
    if isinstance(v, bool):
        return default
    if isinstance(v, (int, float)):
        return float(v)
    if isinstance(v, str):
        try:
            return float(v)
        except ValueError:
            return default
    return default


def _name(v: object) -> str:
    if isinstance(v, EnumValue):
        return v.name
    return "" if v is None or isinstance(v, (ViewList, Thunk)) else str(v)


def _bool(v: object, default: bool = False) -> bool:
    if v is None:
        return default
    if isinstance(v, EnumValue):
        return v.name not in ("false", "off", "no", "hidden")
    if isinstance(v, str):
        return v.lower() not in ("", "false", "off", "no", "0")
    return bool(v)


def initials(name: str) -> str:
    parts = [p for p in re.split(r"[\s._-]+", name.strip()) if p]
    if not parts:
        return ""
    if len(parts) == 1:
        return parts[0][:2].upper()
    return (parts[0][0] + parts[-1][0]).upper()


def _cursor_svg(kind: str) -> str:
    body = _CURSORS.get(kind, _CURSORS["arrow"])
    return (f'<svg class="mkd-pointer__svg" viewBox="0 0 24 24" aria-hidden="true" data-kind="{esc(kind)}">'
            f"{body}</svg>")
