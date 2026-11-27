"""Layout roles: stacks, scroll, grid, spacer, divider, shape and colour.

A mixin of :class:`mockitdown.render.html.Renderer`: the methods rely on its infrastructure
(``open``, ``views``, ``content``, ``slot``, ``icon``, …) and are dispatched by role through
``getattr(self, "r_" + role)``.
"""

from __future__ import annotations

from ...model import CallValue, EnumValue, View
from .._util import _bool, _name, _num
from ..style import css_color, u


class LayoutRoles:
    """Layout roles: stacks, scroll, grid, spacer, divider, shape and colour."""

    def _stack(self, v: View, role: str) -> str:
        style: dict[str, str] = {}
        spacing = v.attr("spacing", "gap")
        if (length := u(_num(spacing))) is not None:
            style["gap"] = length
        align = v.attr("alignment", "align")
        data = {"align": _name(align)} if align else {}
        if _bool(v.attr("wrap")):
            data["wrap"] = "true"
        return self.open(v, role, data=data, style=style) + self.views(v.children) + "</div>"

    def r_vstack(self, v: View) -> str:
        return self._stack(v, "vstack")

    def r_hstack(self, v: View) -> str:
        return self._stack(v, "hstack")

    def r_zstack(self, v: View) -> str:
        return self._stack(v, "zstack")

    def r_group(self, v: View) -> str:
        return self.open(v, "group") + self.views(v.children) + "</div>"

    def r_scroll(self, v: View) -> str:
        axis = v.attr("axes", "axis")
        data = {"axis": "horizontal"} if _name(axis) == "horizontal" or (
            isinstance(axis, list) and any(_name(a) == "horizontal" for a in axis)) else {}
        return self.open(v, "scroll", data=data) + self.views(v.children) + "</div>"

    def r_grid(self, v: View) -> str:
        cols = v.attr("columns", "count", "cols")
        template = ""
        if isinstance(cols, (int, float)) and not isinstance(cols, bool):
            template = f"repeat({int(cols)}, minmax(0, 1fr))"
        elif isinstance(cols, list) and cols:
            items = []
            for c in cols:
                spec = c.args[0] if isinstance(c, CallValue) and c.args else None
                if isinstance(spec, EnumValue) and spec.name == "adaptive":
                    mn = u(_num(spec.kw("minimum"), 100)) or "100px"
                    template = f"repeat(auto-fill, minmax({mn}, 1fr))"
                    break
                if isinstance(spec, EnumValue) and spec.name == "fixed" and spec.args:
                    items.append(u(_num(spec.args[0], 100)) or "auto")
                else:
                    items.append("minmax(0, 1fr)")
            template = template or " ".join(items)
        else:
            rows = [c for c in v.children if c.role == "gridrow"]
            n = max((len(r.children) for r in rows), default=0)
            if n:
                template = f"repeat({n}, auto)"
        style = {"grid-template-columns": template} if template else {}
        spacing = v.attr("spacing", "horizontalSpacing", "gap")
        if (length := u(_num(spacing))) is not None:
            style["gap"] = length
        return self.open(v, "grid", style=style) + self.views(v.children) + "</div>"

    def r_gridrow(self, v: View) -> str:
        return self.open(v, "gridrow") + self.views(v.children) + "</div>"

    def r_spacer(self, v: View) -> str:
        style = {}
        if (length := u(_num(v.attr("minLength")))) is not None:
            style["min-width"] = length
            style["min-height"] = length
        return self.open(v, "spacer", style=style) + "</div>"

    def r_divider(self, v: View) -> str:
        label = v.attr("label", "text")
        inner = f'<span class="mkd-divider__label">{self.content(label)}</span>' if label else ""
        return self.open(v, "divider", attrs={"role": "separator"}) + inner + "</div>"

    def r_shape(self, v: View) -> str:
        style = {}
        if (length := u(_num(v.attr("cornerRadius")))) is not None:
            style["border-radius"] = length
        return self.open(v, "shape", data={"shape": _name(v.attr("shape")) or "rectangle"}, style=style) + "</div>"

    def r_color(self, v: View) -> str:
        c = css_color(v.attr("color"))
        return self.open(v, "color", style={"background": c} if c else {}) + "</div>"
