"""Annotation and overlay roles, freely placed with ``.position`` or inside a Canvas or ZStack.

A mixin of :class:`mockitdown.render.html.Renderer`: the methods rely on its infrastructure
(``open``, ``views``, ``content``, ``slot``, ``icon``, …) and are dispatched by role through
``getattr(self, "r_" + role)``.
"""

from __future__ import annotations

from ...model import View
from .._util import _cursor_svg, _fmt, _name, esc
from ..style import css_color


class AnnotationRoles:
    """Annotation and overlay roles, freely placed with ``.position`` or inside a Canvas or ZStack."""

    def r_callout(self, v: View) -> str:
        n = _fmt(v.attr("number", "index", "label") or "")
        text = self.text_or_slot(v, "text", "title", "message")
        c = css_color(v.attr("color"))
        style = {"--mkd-callout": c} if c else {}
        return self.open(v, "callout", "span", style=style) + f'<span class="mkd-callout__badge">{esc(n)}</span>' + (
            f'<span class="mkd-callout__text">{text}</span>' if text else "") + "</span>"

    def r_pointer(self, v: View) -> str:
        kind = _name(v.attr("kind", "style", "cursor")) or "arrow"
        return self.open(v, "pointer", "span", data={"kind": kind}) + _cursor_svg(kind) + "</span>"

    def r_marquee(self, v: View) -> str:
        return self.open(v, "marquee") + self.views(v.children) + "</div>"
