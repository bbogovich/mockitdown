"""Content roles: text, label, image, icon, avatar, badge, chip, link, progress, rating, placeholder, chart.

A mixin of :class:`mockitdown.render.html.Renderer`: the methods rely on its infrastructure
(``open``, ``views``, ``content``, ``slot``, ``icon``, …) and are dispatched by role through
``getattr(self, "r_" + role)``.
"""

from __future__ import annotations

from ...model import EnumValue, Thunk, View, ViewList
from .._util import _bool, _fmt, _name, _num, esc, initials, text_html
from ..style import u


#: The open 240-degree arc of an accessoryCircular gauge (centre 12,12, radius 9, gap at the bottom).
GAUGE_ARC = "M4.21 16.5A9 9 0 1 1 19.79 16.5"


class ContentRoles:
    """Content roles: text, label, image, icon, avatar, badge, chip, link, progress, rating, placeholder, chart."""

    def r_text(self, v: View) -> str:
        data = {}
        style_name = v.attr("font", "style", "typography", "textStyle")
        if style_name and not v.has_mod("font"):
            from ..style import font_style
            data["font"] = font_style(_name(style_name), self.pack.font)
        text = v.attr("content", "text", "verbatim")
        body = self.content(text) if text is not None else ""
        if v.extra_args:  # Text("a") + Text("b") is not supported; extra args are joined
            body += "".join(self.content(a) for a in v.extra_args)
        if text is not None and not str(text).strip() and not v.extra_args and not v.children:
            body = "&#160;"  # Text("") keeps one line's height, as a blank line in SwiftUI does
        return self.open(v, "text", "span", data=data) + body + self.views(v.children) + "</span>"

    def r_label(self, v: View) -> str:
        style = _name(v.attr("labelStyle"))
        icon = self.slot(v, "icon") or (self.icon(v.attr("systemImage", "icon", "image"), v=v)
                                        if v.attr("systemImage", "icon", "image") else "")
        title = self.slot(v, "title") or self.content(v.attr("title"))
        if v.children and not title:
            title = self.views(v.children)
        parts = []
        if icon and style != "titleOnly":
            parts.append(f'<span class="mkd-label__icon">{icon}</span>')
        if title and style != "iconOnly":
            parts.append(f'<span class="mkd-label__title">{title}</span>')
        parts.append(self.badge_html(v.attr("badge"), "mkd-badge mkd-label__badge"))
        return self.open(v, "label", "span") + "".join(parts) + "</span>"

    def r_image(self, v: View) -> str:
        sys_name = v.attr("systemName", "icon", "symbol")
        if sys_name:
            return self.open(v, "symbol", "span") + self.icon(sys_name, v=v) + "</span>"
        ref = v.attr("name", "url", "src", "source", "decorative")
        alt = _fmt(v.attr("alt", "label", "accessibilityLabel")) or ""
        if isinstance(ref, str) and ref:
            src = self.assets.resolve(ref, v.loc)
            if src:
                return self.open(v, "image", "img", attrs={"src": src, "alt": alt})
        label = esc(alt or (_fmt(ref) if ref else ""))
        return (self.open(v, "image", "span", cls="mkd-image--placeholder") + self.icon("photo")
                + (f'<span class="mkd-image__label">{label}</span>' if label else "") + "</span>")

    def r_icon(self, v: View) -> str:
        style = {}
        if (length := u(_num(v.attr("size", "fontSize")))) is not None:
            style["font-size"] = length
        return self.open(v, "symbol", "span", style=style) + self.icon(v.attr("name", "systemName", "icon"), v=v) \
            + "</span>"

    def r_avatar(self, v: View) -> str:
        name = _fmt(v.attr("name", "initials", "title", "label") or "")
        image = v.attr("image", "src", "url")
        src = self.assets.resolve(image, v.loc) if isinstance(image, str) and image else None
        hue = sum(ord(c) for c in name) % 8 + 1 if name else 1
        if src:
            inner = f'<img src="{esc(src)}" alt="{esc(name)}">'
        elif v.attr("systemImage", "icon"):
            inner = self.icon(v.attr("systemImage", "icon"), v=v)
        elif _fmt(v.attr("initials")):
            inner = esc(_fmt(v.attr("initials")))
        else:
            inner = esc(initials(name)) or self.icon("person")
        status = v.attr("status", "presence")
        st = f'<span class="mkd-avatar__status" data-status="{esc(_name(status))}"></span>' if status else ""
        return self.open(v, "avatar", "span", data={"hue": str(hue)}) + inner + st \
            + self.badge_html(v.attr("badge")) + "</span>"

    def r_badge(self, v: View) -> str:
        text = v.attr("text", "count", "value", "label", "content")
        is_dot = text is None or text is True or (isinstance(text, str) and text == "")
        data = {"dot": "true"} if is_dot and not v.children else {}
        icon = v.attr("systemImage", "icon")
        body = (f'<span class="mkd-badge__icon">{self.icon(icon, v=v)}</span>' if icon else "")
        if not (text is None or text is True):  # `in (None, True)` would treat 1 as True
            max_v = _num(v.attr("max"))
            n = _num(text)
            shown = f"{int(max_v)}+" if (max_v is not None and n is not None and n > max_v) else _fmt(text)
            body += f'<span class="mkd-badge__label">{text_html(shown)}</span>'
        body += self.views(v.children)
        return self.open(v, "badge", "span", data=data) + body + "</span>"

    def r_chip(self, v: View) -> str:
        parts = []
        av = v.attr("avatar")
        if av:
            parts.append(self.avatar_html(_fmt(av), v.attr("avatarImage"), v, "small", " mkd-chip__avatar"))
        icon = v.attr("systemImage", "icon")
        if icon:
            parts.append(f'<span class="mkd-chip__icon">{self.icon(icon, v=v)}</span>')
        if _bool(v.attr("selected")) and not icon and _bool(v.attr("checkmark"), True) and \
                _name(v.attr("variant")) in ("filter", ""):
            parts.append(f'<span class="mkd-chip__check">{self.icon("checkmark")}</span>')
        parts.append(f'<span class="mkd-chip__label">{self.content(v.attr("label", "text", "title"))}</span>')
        parts.append(self.views(v.children))
        if _bool(v.attr("removable", "closable", "onDelete", "deletable")):
            parts.append(f'<span class="mkd-chip__remove">{self.icon("xmark")}</span>')
        return self.open(v, "chip", "span") + "".join(parts) + "</span>"

    def r_link(self, v: View) -> str:
        label = self.content(v.attr("label", "title", "text")) or self.views(v.children)
        icon = v.attr("systemImage", "icon")
        ic = f'<span class="mkd-link__icon">{self.icon(icon, v=v)}</span>' if icon else ""
        return self.open(v, "link", "span", attrs={"role": "link"}) + ic + label + "</span>"

    def r_progress(self, v: View) -> str:
        value = _num(v.attr("value", "progress", "percent"))
        total = _num(v.attr("total", "max"), None)
        if total is None:
            total = 100.0 if value is not None and value > 1 else 1.0
        frac = None if value is None else max(0.0, min(1.0, value / total if total else 0.0))
        variant = _name(v.attr("kind", "variant", "style")) or "linear"
        circular = variant in ("circular", "ring", "spinner", "gauge", "accessoryCircular", "accessoryCircularCapacity",
                               "radial", "circle", "dashboard")
        label = self.text_or_slot(v, "label", "title") or self.views(v.children)
        current = self.text_or_slot(v, "currentValueLabel", "valueLabel")
        low = self.text_or_slot(v, "minimumValueLabel", "minLabel")
        high = self.text_or_slot(v, "maximumValueLabel", "maxLabel")
        if _bool(v.attr("showValue")) and frac is not None and not current:
            current = f"{round(frac * 100)}%"
        data = {"kind": "circular" if circular else "linear"}
        if frac is None:
            data["indeterminate"] = "true"
        parts = [f'<span class="mkd-progress__label">{label}</span>'] if label else []
        if variant == "accessoryCircular":  # an open 240-degree ring (R-PACK-014.C4)
            dash = f"{(frac if frac is not None else 0.3) * 100:.2f} 100"
            parts.append(f'<span class="mkd-progress__ring" data-open="true"><svg viewBox="0 0 24 24" aria-hidden="true">'
                         f'<path class="mkd-progress__track" d="{GAUGE_ARC}" pathLength="100"/>'
                         f'<path class="mkd-progress__bar" d="{GAUGE_ARC}" pathLength="100" stroke-dasharray="{dash}"/>'
                         f"</svg></span>")
        elif circular:
            r = 9.0
            circ = 2 * 3.14159 * r
            dash = f"{(frac if frac is not None else 0.3) * circ:.2f} {circ:.2f}"
            parts.append(f'<span class="mkd-progress__ring"><svg viewBox="0 0 24 24" aria-hidden="true">'
                         f'<circle class="mkd-progress__track" cx="12" cy="12" r="{r}"/>'
                         f'<circle class="mkd-progress__bar" cx="12" cy="12" r="{r}" stroke-dasharray="{dash}"/>'
                         f"</svg></span>")
        else:
            width = f"{(frac if frac is not None else 0.35) * 100:.1f}%"
            marker = f'<span class="mkd-progress__marker" style="left:{width}"></span>' \
                if variant == "accessoryLinear" else ""
            parts.append(f'<span class="mkd-progress__track"><span class="mkd-progress__bar" '
                         f'style="width:{width}"></span>{marker}</span>')
        if low:
            parts.append(f'<span class="mkd-progress__min">{low}</span>')
        if high:
            parts.append(f'<span class="mkd-progress__max">{high}</span>')
        if current:
            parts.append(f'<span class="mkd-progress__value">{current}</span>')
        return self.open(v, "progress", data=data, attrs={"role": "progressbar"}) + "".join(parts) + "</div>"

    def r_rating(self, v: View) -> str:
        value = _num(v.attr("value", "rating"), 0) or 0
        mx = int(_num(v.attr("max", "maxValue", "count"), 5) or 5)
        stars = []
        for i in range(1, mx + 1):
            filled = "full" if value >= i else ("half" if value >= i - 0.5 else "empty")
            stars.append(f'<span class="mkd-rating__star" data-fill="{filled}">'
                         f'{self.icon("star.fill" if filled != "empty" else "star")}</span>')
        label = self.content(v.attr("label"))
        return self.open(v, "rating", "span") + "".join(stars) + (
            f'<span class="mkd-rating__label">{label}</span>' if label else "") + "</span>"

    def r_placeholder(self, v: View) -> str:
        style = {}
        if (length := u(_num(v.attr("height")))) is not None:
            style["height"] = length
        icon = v.attr("systemImage", "icon")
        label = self.content(v.attr("label", "title", "text"))
        return self.open(v, "placeholder", style=style) + (
            f'<span class="mkd-placeholder__icon">{self.icon(icon, v=v)}</span>' if icon else "") + (
            f'<span class="mkd-placeholder__label">{label}</span>' if label else "") + self.views(v.children) + "</div>"

    def r_chart(self, v: View) -> str:
        from .. import charts

        kind = (_name(v.attr("kind", "type", "variant")) or "bar").lower()
        raw_values = v.attr("values", "data", "value") if not isinstance(v.attr("value"), (int, float)) \
            else v.attr("values", "data")
        series_attr = v.attr("series")
        labels = [_fmt(x) for x in (v.attr("labels", "categories", "x") or []) if not isinstance(x, (ViewList, Thunk))]
        series: list[list[float]] = []
        names: list[str] = [_fmt(x) for x in (v.attr("seriesNames", "names", "legendLabels") or [])]
        if isinstance(series_attr, list) and series_attr:
            for i, s in enumerate(series_attr):
                if isinstance(s, dict):
                    names.append(_fmt(s.get("name", s.get("label", f"Series {i + 1}"))))
                    s = s.get("values", s.get("data", []))
                elif isinstance(s, tuple) and len(s) == 2 and isinstance(s[1], list):
                    names.append(_fmt(s[0]))
                    s = s[1]
                if isinstance(s, (list, tuple)):
                    series.append([_num(x, 0) or 0.0 for x in s])
        elif isinstance(raw_values, (list, tuple)):
            if raw_values and all(isinstance(x, (list, tuple)) for x in raw_values) and kind not in (
                    "scatter", "bubble", "candlestick"):
                series = [[_num(x, 0) or 0.0 for x in s] for s in raw_values]
            else:
                series = [[_num(x, 0) or 0.0 for x in raw_values if not isinstance(x, (list, tuple))]]
        marks = [c for c in v.children if c.name.endswith("Mark")]
        if marks and not series:  # Swift Charts: Chart { BarMark(x: .value("Day", "Mon"), y: .value("Steps", 7)) }
            def _mark_val(x):
                return x.args[-1] if isinstance(x, EnumValue) and x.name == "value" and x.args else x
            series = [[_num(_mark_val(c.attr("y", "angle", "value")), 0) or 0.0 for c in marks]]
            labels = [_fmt(_mark_val(c.attr("x", "label"))) for c in marks]
            if kind == "bar":
                kind = {"LineMark": "line", "AreaMark": "area", "SectorMark": "pie",
                        "PointMark": "scatter"}.get(marks[0].name, "bar")
        points = []
        for p in (v.attr("points", "ohlc", "candles") or (raw_values if kind in ("scatter", "bubble", "candlestick")
                                                           else []) or []):
            if isinstance(p, (list, tuple)):
                points.append([_num(x, 0) or 0.0 for x in p])
            elif isinstance(p, dict):
                points.append([_num(p.get(k), 0) or 0.0 for k in ("x", "y", "size", "group") if k in p])
        matrix = [[_num(x, 0) or 0.0 for x in row] for row in (v.attr("matrix", "grid") or []) if isinstance(row, list)]
        width = _num(v.attr("chartWidth", "plotWidth"), None) or 360.0
        height = _num(v.attr("chartHeight", "plotHeight"), None)
        if height is None:
            height = {"sparkline": 44.0, "gauge": 150.0, "pie": 170.0, "donut": 170.0, "doughnut": 170.0}.get(kind, 200.0)
        h_attr = _num(v.attr("height"), None)
        if h_attr is not None and kind == "sparkline":
            height = h_attr
        spec = charts.ChartSpec(
            kind=kind, series=series, names=names, labels=labels, points=points, matrix=matrix,
            y_labels=[_fmt(x) for x in (v.attr("yLabels", "rowLabels") or [])], width=width, height=height,
            stacked=_bool(v.attr("stacked")), horizontal=_bool(v.attr("horizontal")) or _name(v.attr(
                "orientation")) == "horizontal",
            legend=None if v.attr("legend", "showLegend") is None else _bool(v.attr("legend", "showLegend")),
            grid=_bool(v.attr("grid", "showGrid"), True), show_values=_bool(v.attr("showValues", "valueLabels")),
            x_label=_fmt(v.attr("xLabel", "xAxisLabel") or ""), y_label=_fmt(v.attr("yLabel", "yAxisLabel") or ""),
            from_zero=None if v.attr("fromZero") is None else _bool(v.attr("fromZero")),
            value=_num(v.attr("value"), 0) or 0.0, minimum=_num(v.attr("min", "minimum"), 0) or 0.0,
            maximum=_num(v.attr("max", "maximum"), 100) or 100.0, unit=_fmt(v.attr("unit", "centerLabel") or ""),
            line_series=int(_num(v.attr("lineSeries"), -1)) if kind == "combo" else -1,
        )
        if kind == "combo" and spec.line_series < 0 and len(series) > 1:
            spec.line_series = len(series) - 1
        if not charts.has_data(spec):  # R-REND-012.C7: drawn as axes or an outline, never silently empty
            self.diags.warning(f"{v.name} has no data", v.loc, "chart")
        title = self.text_or_slot(v, "title")
        subtitle = self.text_or_slot(v, "subtitle", "description")
        style = {}
        if kind != "sparkline" and (length := u(_num(v.attr("height")))) is not None:
            style["height"] = length
        head = ""
        if title or subtitle:
            head = (f'<div class="mkd-chart__head"><span class="mkd-chart__title">{title}</span>'
                    + (f'<span class="mkd-chart__subtitle">{subtitle}</span>' if subtitle else "") + "</div>")
        return self.open(v, "chart", data={"kind": kind}, style=style) + head + charts.render(spec) + "</div>"
