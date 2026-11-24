"""Modifier → CSS translation.

Every length emitted inline is scaled by the frame unit: ``calc(N * var(--u))``, the same unit the
stylesheets use after their ``px`` values are converted, so a mockup scales as one picture.
Colours are validated (named, semantic, hex or rgb/hsl) before they reach a style attribute.
"""

from __future__ import annotations

import re

from ..diagnostics import Diagnostics
from ..model import CallValue, EnumValue, Modifier, View, ViewList

NAMED_COLORS = {"red", "orange", "yellow", "green", "mint", "teal", "cyan", "blue", "indigo", "purple",
                "pink", "brown", "gray", "grey"}
SEMANTIC_COLORS = {
    "primary": "var(--mkd-fg)", "secondary": "var(--mkd-fg-2)", "tertiary": "var(--mkd-fg-3)",
    "quaternary": "var(--mkd-fg-3)", "accentColor": "var(--mkd-accent)", "accent": "var(--mkd-accent)",
    "tint": "var(--mkd-accent)", "background": "var(--mkd-bg)", "surface": "var(--mkd-surface)",
    "white": "#ffffff", "black": "#000000", "clear": "transparent", "danger": "var(--mkd-danger)",
    "error": "var(--mkd-danger)", "destructive": "var(--mkd-danger)", "success": "var(--mkd-success)",
    "warning": "var(--mkd-warning)", "info": "var(--mkd-info)", "separator": "var(--mkd-divider)",
}
MATERIALS = {"ultraThinMaterial", "thinMaterial", "regularMaterial", "thickMaterial", "ultraThickMaterial", "bar"}
_HEX = re.compile(r"^#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$")
_FUNC = re.compile(r"^(?:rgb|rgba|hsl|hsla)\(\s*[0-9.,%\s/]+\)$")

FONT_WEIGHTS = {"ultraLight": 100, "thin": 200, "light": 300, "regular": 400, "medium": 500, "semibold": 600,
                "bold": 700, "heavy": 800, "black": 900}
#: Canonical font styles every pack styles (``data-font``). Aliases map framework names onto them.
FONT_STYLES = ("display", "largeTitle", "title", "title2", "title3", "headline", "subheadline", "body",
               "callout", "footnote", "caption", "caption2", "overline")
FONT_ALIASES = {
    "h1": "display", "h2": "largeTitle", "h3": "title", "h4": "title2", "h5": "title3", "h6": "headline",
    "subtitle": "subheadline", "subtitle1": "headline", "subtitle2": "subheadline", "body1": "body",
    "body2": "callout", "bodyStrong": "headline", "bodyLarge": "body", "bodyMedium": "callout",
    "bodySmall": "footnote", "titleLarge": "title2", "titleMedium": "headline", "titleSmall": "subheadline",
    "headlineLarge": "largeTitle", "headlineMedium": "title", "headlineSmall": "title2",
    "displayLarge": "display", "displayMedium": "display", "displaySmall": "largeTitle", "labelLarge": "callout",
    "labelMedium": "footnote", "labelSmall": "caption", "lead": "title3", "small": "footnote", "muted": "footnote",
    "large": "title3", "heading": "title", "caption1": "caption", "captionStrong": "caption", "subtitle3": "headline",
}


def u(n: object) -> str | None:
    """A scaled length for a number, or None."""
    if isinstance(n, bool) or not isinstance(n, (int, float)):
        return None
    n = round(float(n), 2)
    if n == 0:
        return "0"
    text = str(int(n)) if n.is_integer() else str(n)
    return f"calc({text} * var(--u))"


def css_color(v: object) -> str | None:
    """A safe CSS colour for a value, or None when it is not one."""
    opacity = None
    if isinstance(v, EnumValue):
        opacity = v.kw("opacity")
        name = v.name
        if name == "opacity" and v.namespace:  # .red.opacity(0.3) evaluates as namespace red, name opacity
            name, opacity = v.namespace, (v.args[0] if v.args else None)
        base = _color_name(name)
    elif isinstance(v, CallValue) and v.name == "Color":
        if v.args and isinstance(v.args[0], str):
            base = css_color(v.args[0])
        elif v.kw("red") is not None:
            try:
                r, g, b = (float(v.kw(k, 0)) for k in ("red", "green", "blue"))
            except (TypeError, ValueError):
                return None
            base = f"rgb({round(r * 255)} {round(g * 255)} {round(b * 255)})"
        elif v.kw("hex") is not None:
            base = css_color(str(v.kw("hex")))
        else:
            base = None
    elif isinstance(v, str):
        s = v.strip()
        if _HEX.match(s) or _FUNC.match(s):
            base = s
        else:
            base = _color_name(s)
    else:
        return None
    if base and isinstance(opacity, (int, float)):
        return f"color-mix(in srgb, {base} {max(0, min(100, round(opacity * 100)))}%, transparent)"
    return base


def _color_name(name: str) -> str | None:
    if name in SEMANTIC_COLORS:
        return SEMANTIC_COLORS[name]
    if name in NAMED_COLORS:
        return f"var(--mkd-color-{'gray' if name == 'grey' else name})"
    return None


def font_style(name: str, pack_font) -> str:
    alias = pack_font(name)
    return FONT_ALIASES.get(alias, alias)


def _edges(value: object) -> set[str]:
    names: list[str] = []
    if isinstance(value, EnumValue):
        names = [value.name]
    elif isinstance(value, (list, tuple)):
        names = [x.name for x in value if isinstance(x, EnumValue)]
    edges: set[str] = set()
    for n in names:
        edges |= {"all": {"top", "bottom", "left", "right"}, "horizontal": {"left", "right"},
                  "vertical": {"top", "bottom"}, "top": {"top"}, "bottom": {"bottom"}, "leading": {"left"},
                  "trailing": {"right"}, "left": {"left"}, "right": {"right"}}.get(n, set())
    return edges


class StyleBuilder:
    """Collects inline style, data attributes and extra classes for one view's modifiers."""

    def __init__(self, pack_font, diags: Diagnostics) -> None:
        self.pack_font = pack_font
        self.diags = diags

    def build(self, view: View) -> tuple[dict[str, str], dict[str, str], list[str]]:
        style: dict[str, str] = {}
        data: dict[str, str] = {}
        classes: list[str] = []
        pad: dict[str, str] = {}
        for m in view.modifiers:
            h = getattr(self, "_m_" + m.name, None)
            if h is not None:
                h(m, style, data, classes, pad, view)
        if pad:
            for side in ("top", "right", "bottom", "left"):
                if side in pad:
                    style[f"padding-{side}"] = pad[side]
        return style, data, classes

    # --- layout ---
    def _m_padding(self, m, style, data, classes, pad, view):
        amount: object = 16
        edges = {"top", "bottom", "left", "right"}
        if m.args:
            first = m.args[0]
            if isinstance(first, (int, float)) and not isinstance(first, bool):
                amount = first
            else:
                edges = _edges(first) or edges
                if len(m.args) > 1:
                    amount = m.args[1]
        for key in ("all", "horizontal", "vertical", "top", "bottom", "leading", "trailing"):
            if key in m.kwargs:  # .padding(top: 4) style variants
                edges, amount = _edges(EnumValue(key)), m.kwargs[key]
        length = u(amount) or u(16)
        for e in edges:
            pad[e] = length

    def _m_frame(self, m, style, data, classes, pad, view):
        kw = m.kwargs
        fill: list[str] = []
        for key, prop in (("width", "width"), ("height", "height"), ("minWidth", "min-width"),
                          ("minHeight", "min-height"), ("maxWidth", "max-width"), ("maxHeight", "max-height"),
                          ("idealWidth", "width"), ("idealHeight", "height")):
            val = kw.get(key)
            if isinstance(val, EnumValue) and val.name == "infinity":
                fill.append("x" if "Width" in key else "y")
            elif (length := u(val)) is not None:
                style[prop] = length
                if prop == "width":
                    style["flex"] = "0 0 auto"
                elif prop == "height":
                    style["flex-shrink"] = "0"
                    style["flex-grow"] = "0"
        if fill:
            data["fill"] = " ".join(sorted(set(fill)))
        align = kw.get("alignment")
        if isinstance(align, EnumValue):
            data["frame-align"] = align.name

    def _m_offset(self, m, style, data, classes, pad, view):
        x, y = u(m.kwargs.get("x", 0)) or "0", u(m.kwargs.get("y", 0)) or "0"
        style["transform"] = f"translate({x}, {y})"

    def _m_position(self, m, style, data, classes, pad, view):
        """SwiftUI .position(x:y:): the view's centre at (x, y) in its container (Canvas, ZStack, screen)."""
        x, y = u(m.kwargs.get("x")), u(m.kwargs.get("y"))
        style["position"] = "absolute"
        if x is not None:
            style["left"] = x
        if y is not None:
            style["top"] = y
        style["translate"] = "-50% -50%"
        data["positioned"] = "true"

    def _m_rotationEffect(self, m, style, data, classes, pad, view):
        a = m.arg()
        deg = a.kw("degrees") if isinstance(a, EnumValue) else a
        if isinstance(a, EnumValue) and a.name == "degrees" and a.args:
            deg = a.args[0]
        if isinstance(deg, (int, float)) and not isinstance(deg, bool):
            style["rotate"] = f"{deg:g}deg"

    def _m_zIndex(self, m, style, data, classes, pad, view):
        if isinstance(m.arg(), (int, float)):
            style["position"] = "relative"
            style["z-index"] = str(int(m.arg()))

    # --- typography ---
    def _m_font(self, m, style, data, classes, pad, view):
        f = m.arg()
        if isinstance(f, EnumValue):
            if f.name in ("system", "custom"):
                size = f.kw("size") if f.kw("size") is not None else (f.args[1] if len(f.args) > 1 else None)
                if f.name == "system" and f.args and isinstance(f.args[0], (int, float)):
                    size = f.args[0]
                if (length := u(size)) is not None:
                    style["font-size"] = length
                w = f.kw("weight")
                if isinstance(w, EnumValue) and w.name in FONT_WEIGHTS:
                    style["font-weight"] = str(FONT_WEIGHTS[w.name])
                d = f.kw("design")
                if isinstance(d, EnumValue) and d.name == "monospaced":
                    style["font-family"] = "var(--mkd-font-mono)"
                if isinstance(d, EnumValue) and d.name == "rounded":
                    data["design"] = "rounded"
            elif f.name in ("bold", "italic"):  # .font(.title.bold()) arrives as namespace/name pair
                data["font"] = font_style(f.namespace, self.pack_font) if f.namespace else data.get("font", "body")
                style["font-weight" if f.name == "bold" else "font-style"] = "700" if f.name == "bold" else "italic"
            elif f.name == "weight" and f.namespace:
                data["font"] = font_style(f.namespace, self.pack_font)
                if f.args and isinstance(f.args[0], EnumValue):
                    style["font-weight"] = str(FONT_WEIGHTS.get(f.args[0].name, 400))
            else:
                data["font"] = font_style(f.name, self.pack_font)
        elif isinstance(f, str):
            data["font"] = font_style(f, self.pack_font)

    def _m_fontWeight(self, m, style, data, classes, pad, view):
        w = m.arg()
        if isinstance(w, EnumValue) and w.name in FONT_WEIGHTS:
            style["font-weight"] = str(FONT_WEIGHTS[w.name])

    def _m_bold(self, m, style, data, classes, pad, view):
        if m.arg(0, True) is not False:
            style["font-weight"] = "700"

    def _m_italic(self, m, style, data, classes, pad, view):
        if m.arg(0, True) is not False:
            style["font-style"] = "italic"

    def _m_underline(self, m, style, data, classes, pad, view):
        if m.arg(0, True) is not False:
            style["text-decoration"] = "underline"

    def _m_strikethrough(self, m, style, data, classes, pad, view):
        if m.arg(0, True) is not False:
            style["text-decoration"] = "line-through"

    def _m_monospaced(self, m, style, data, classes, pad, view):
        style["font-family"] = "var(--mkd-font-mono)"

    def _m_fontDesign(self, m, style, data, classes, pad, view):
        d = m.arg()
        if isinstance(d, EnumValue):
            if d.name == "monospaced":
                style["font-family"] = "var(--mkd-font-mono)"
            else:
                data["design"] = d.name

    def _m_multilineTextAlignment(self, m, style, data, classes, pad, view):
        a = m.arg()
        if isinstance(a, EnumValue):
            style["text-align"] = {"leading": "left", "center": "center", "trailing": "right"}.get(a.name, "left")

    def _m_textCase(self, m, style, data, classes, pad, view):
        a = m.arg()
        if isinstance(a, EnumValue):
            style["text-transform"] = {"uppercase": "uppercase", "lowercase": "lowercase"}.get(a.name, "none")

    def _m_lineLimit(self, m, style, data, classes, pad, view):
        n = m.arg()
        if isinstance(n, int) and not isinstance(n, bool) and n > 0:
            style["display"] = "-webkit-box"
            style["-webkit-line-clamp"] = str(n)
            style["-webkit-box-orient"] = "vertical"
            style["overflow"] = "hidden"

    # --- colour and shape ---
    def _m_foregroundStyle(self, m, style, data, classes, pad, view):
        c = css_color(m.arg())
        if c:
            style["color"] = c
            style["--mkd-current"] = c

    _m_foregroundColor = _m_foregroundStyle

    def _m_background(self, m, style, data, classes, pad, view):
        v = m.arg()
        if isinstance(v, EnumValue) and v.name in MATERIALS:
            data["material"] = v.name
            return
        c = css_color(v)
        if c:
            style["background"] = c
        r = m.kwargs.get("in")
        if isinstance(r, ViewList) and r.views:
            self._shape_radius(r.views[0], style)
        elif isinstance(r, EnumValue):
            self._enum_radius(r, style)

    def _m_tint(self, m, style, data, classes, pad, view):
        c = css_color(m.arg())
        if c:
            style["--mkd-accent"] = c
            style["--mkd-accent-soft"] = f"color-mix(in srgb, {c} 16%, transparent)"
            style["--mkd-chart-1"] = c  # a tinted chart draws its first series in the tint

    _m_accentColor = _m_tint

    def _m_fill(self, m, style, data, classes, pad, view):
        c = css_color(m.arg())
        if c:
            style["--mkd-shape-fill"] = c

    def _m_stroke(self, m, style, data, classes, pad, view):
        c = css_color(m.arg()) or "currentColor"
        w = u(m.kwargs.get("lineWidth", 1)) or "1px"
        style["--mkd-shape-fill"] = "transparent"
        style["border"] = f"{w} solid {c}"

    def _m_opacity(self, m, style, data, classes, pad, view):
        v = m.arg()
        if isinstance(v, (int, float)) and not isinstance(v, bool):
            style["opacity"] = str(max(0.0, min(1.0, float(v))))

    def _m_cornerRadius(self, m, style, data, classes, pad, view):
        if (length := u(m.arg())) is not None:
            style["border-radius"] = length
            style["overflow"] = "hidden"

    def _shape_radius(self, shape: View, style: dict[str, str]) -> None:
        kind = shape.attr("shape", default="")
        if kind in ("circle", "capsule", "ellipse"):
            style["border-radius"] = "9999px"
        elif (length := u(shape.attr("cornerRadius"))) is not None:
            style["border-radius"] = length

    def _enum_radius(self, e: EnumValue, style: dict[str, str]) -> None:
        if e.name in ("circle", "capsule", "ellipse"):
            style["border-radius"] = "9999px"
        elif e.name in ("rect", "roundedRectangle") and (length := u(e.kw("cornerRadius"))) is not None:
            style["border-radius"] = length

    def _m_clipShape(self, m, style, data, classes, pad, view):
        v = m.arg() if m.args else (ViewList(m.content) if m.content else None)
        if isinstance(v, ViewList) and v.views:
            self._shape_radius(v.views[0], style)
        elif isinstance(v, EnumValue):
            self._enum_radius(v, style)
        style["overflow"] = "hidden"

    def _m_shadow(self, m, style, data, classes, pad, view):
        r = m.kwargs.get("radius", m.arg(0, 8))
        length = u(r) or u(8)
        c = css_color(m.kwargs.get("color")) or "rgb(0 0 0 / 0.18)"
        y = u(m.kwargs.get("y", 2)) or "0"
        style["box-shadow"] = f"0 {y} {length} {c}"

    def _m_border(self, m, style, data, classes, pad, view):
        c = css_color(m.arg()) or "var(--mkd-border)"
        w = u(m.kwargs.get("width", 1)) or "1px"
        style["border"] = f"{w} solid {c}"

    def _m_imageScale(self, m, style, data, classes, pad, view):
        v = m.arg()
        if isinstance(v, EnumValue):
            data["scale"] = v.name

    def _m_resizable(self, m, style, data, classes, pad, view):
        data["resizable"] = "true"

    def _m_aspectRatio(self, m, style, data, classes, pad, view):
        ratio = m.arg()
        if isinstance(ratio, (int, float)) and not isinstance(ratio, bool):
            style["aspect-ratio"] = str(ratio)
        mode = m.kwargs.get("contentMode", m.arg(1) if isinstance(ratio, (int, float)) else ratio)
        if isinstance(mode, EnumValue):
            data["content-mode"] = mode.name

    def _m_scaledToFit(self, m, style, data, classes, pad, view):
        data["content-mode"] = "fit"

    def _m_scaledToFill(self, m, style, data, classes, pad, view):
        data["content-mode"] = "fill"

    def _m_hidden(self, m, style, data, classes, pad, view):
        if m.arg(0, True) is not False:
            style["visibility"] = "hidden"

    # --- semantics ---
    def _m_id(self, m, style, data, classes, pad, view):
        if m.arg() is not None:
            data["mkd-id"] = str(m.arg())

    def _m_ref(self, m, style, data, classes, pad, view):
        if m.args:
            data["ref"] = " ".join(str(a) for a in m.args)

    def _m_class(self, m, style, data, classes, pad, view):
        for a in m.args:
            for c in str(a).split():
                if re.fullmatch(r"[A-Za-z_][A-Za-z0-9_-]*", c):
                    classes.append(c)
                else:
                    self.diags.warning(f"invalid class name {c!r}", m.loc, "modifier")

    def _m_labelsHidden(self, m, style, data, classes, pad, view):
        data["labels-hidden"] = "true"


def style_attr(style: dict[str, str]) -> str:
    return ";".join(f"{k}:{v}" for k, v in style.items())


__all__ = ["StyleBuilder", "css_color", "u", "font_style", "FONT_STYLES", "Modifier", "style_attr"]
