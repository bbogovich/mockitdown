"""HTML renderer: resolved view tree → markup.

Every element renders through its *role*. A role fixes the markup — the class ``mkd-<role>`` on
the root and BEM-style ``mkd-<role>__<part>`` children — and packs only restyle it. The common
root attributes are:

``data-el``         the element name as written (``InfoBar``, ``Button``) — packs may style it
``data-component``  the user struct the view is the root of
``data-variant``, ``data-size``, ``data-color``, ``data-shape``, ``data-placement``, …
                    string attributes copied from the element's arguments
``data-state``      ``disabled`` | ``error`` | ``hover`` | ``focused`` | ``pressed`` | …
``data-selected``   ``true`` when selected
``data-mkd-id`` / ``data-ref``  from ``.id()`` / ``.ref()`` (the Elements table)

No markup is interactive: controls are spans with ARIA roles, links do not navigate, and
nothing needs JavaScript.
"""

from __future__ import annotations

import calendar
import datetime as _dt
import html
import re

from .. import icons
from ..assets import AssetResolver
from ..diagnostics import Diagnostics
from ..model import CallValue, EnumValue, Thunk, View, ViewList
from ..packs import Pack
from .style import StyleBuilder, css_color, style_attr, u

#: Element attributes copied verbatim to ``data-<name>`` when they are simple values.
PASSTHROUGH = ("variant", "size", "color", "shape", "density", "elevation", "placement", "orientation",
               "emphasis", "design", "severity", "kind", "labelStyle", "position", "level", "side",
               "withHandle", "direction", "labelPlacement", "rowsPerPage")
_SAFE_TOKEN = re.compile(r"^[A-Za-z0-9_. -]{1,40}$")
_INLINE_MD = [
    (re.compile(r"\*\*(.+?)\*\*"), r"<strong>\1</strong>"),
    (re.compile(r"(?<![*\w])\*(?!\s)(.+?)(?<!\s)\*(?![*\w])"), r"<em>\1</em>"),
    (re.compile(r"`(.+?)`"), r'<code class="mkd-code">\1</code>'),
    (re.compile(r"~~(.+?)~~"), r"<s>\1</s>"),
    (re.compile(r"\[(.+?)\]\((?:[^)\s]+)\)"), r'<span class="mkd-link" role="link">\1</span>'),
]
PH = ' data-placeholder="true"'
PRESENTATIONS = ("alert", "sheet", "confirmationDialog", "fullScreenCover", "popover", "inspector")


def esc(s: object) -> str:
    return html.escape("" if s is None else str(s), quote=True)


def text_html(s: object) -> str:
    """Escape text and apply the inline Markdown that SwiftUI ``Text`` supports."""
    out = esc(s)
    for pat, rep in _INLINE_MD:
        out = pat.sub(rep, out)
    return out.replace("\n", "<br>")


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


class Renderer:
    def __init__(self, pack: Pack, diags: Diagnostics, assets: AssetResolver) -> None:
        self.pack = pack
        self.diags = diags
        self.assets = assets
        self.styles = StyleBuilder(pack.font, diags)
        self.overlays: list[str] = []
        self.row_wrap: str | None = None  # "list" | "form" while rendering rows
        self.in_menu = False
        self.chart_seq = 0

    # --- infrastructure --------------------------------------------------------------------------

    def views(self, views: list[View]) -> str:
        return "".join(self.view(v) for v in views)

    def view(self, v: View) -> str:
        handler = getattr(self, "r_" + v.role.replace("-", "_"), None)
        if handler is None:
            self.diags.error(f"pack {self.pack.id!r}: element {v.name!r} has unknown role {v.role!r}", v.loc, "role")
            handler = self.r_unknown
        saved_menu = self.in_menu
        out = handler(v)
        self.in_menu = saved_menu
        out = self._wrap_overlays(v, out)
        self._collect_presentations(v)
        return out

    def open(self, v: View, role: str, tag: str = "div", *, cls: str = "", data: dict | None = None,
             style: dict | None = None, attrs: dict | None = None) -> str:
        mstyle, mdata, mcls = self.styles.build(v)
        classes = [f"mkd-{role}"] + ([cls] if cls else []) + mcls
        parts = [f'<{tag} class="{esc(" ".join(classes))}" data-el="{esc(v.name)}"']
        if v.component:
            parts.append(f' data-component="{esc(v.component)}"')
        d: dict[str, str] = {}
        for key in PASSTHROUGH:
            val = v.attrs.get(key)
            if isinstance(val, EnumValue):
                val = val.name
            if isinstance(val, bool):
                val = "true" if val else "false"
            if isinstance(val, (str, int, float)) and _SAFE_TOKEN.match(str(val)):
                d[key] = str(val)
        state = v.attr("state")
        if _bool(v.attr("disabled")):
            state = "disabled"
        elif v.attr("error") not in (None, False, ""):
            state = state or "error"
        if state:
            d["state"] = _name(state)
        if _bool(v.attr("selected")):
            d["selected"] = "true"
        d.update(data or {})
        d.update(mdata)
        for k, val in d.items():
            if val is not None:
                parts.append(f' data-{k}="{esc(val)}"')
        st = dict(style or {})
        st.update(mstyle)
        if st:
            parts.append(f' style="{esc(style_attr(st))}"')
        help_mod = v.mod("help")
        if help_mod and help_mod.arg() is not None:
            parts.append(f' title="{esc(_fmt(help_mod.arg()))}"')
        for k, val in (attrs or {}).items():
            if val is not None:
                parts.append(f' {k}="{esc(val)}"')
        return "".join(parts) + ">"

    def icon(self, name: object, cls: str = "mkd-icon", v: View | None = None) -> str:
        n = _name(name)
        if not n:
            return ""
        n = self.pack.icons.get(n, n)
        markup, found = icons.svg(n, cls)
        if not found:
            self.diags.warning(f"unknown icon {n!r}", v.loc if v else None, "icon")
        return markup

    def content(self, value: object) -> str:
        """Markup for a text-or-views attribute value."""
        if isinstance(value, ViewList):
            return self.views(value.views)
        if value is None or isinstance(value, Thunk):
            return ""
        return text_html(_fmt(value))

    def slot(self, v: View, *names: str) -> str:
        for n in names:
            if n in v.slots:
                return self.views(v.slots[n])
        return ""

    def has(self, v: View, *names: str) -> bool:
        return any(n in v.slots for n in names) or any(v.attrs.get(n) not in (None, "", False) for n in names)

    def text_or_slot(self, v: View, *names: str) -> str:
        for n in names:
            if n in v.slots:
                return self.views(v.slots[n])
            val = v.attrs.get(n)
            if val not in (None, ""):
                return self.content(val)
        return ""

    def badge_html(self, value: object, cls: str = "mkd-badge") -> str:
        if value in (None, False, "") or isinstance(value, (ViewList, Thunk)):
            return ""
        text = "" if value is True else _fmt(value)
        dot = ' data-dot="true"' if not text else ""
        return f'<span class="{cls}"{dot}>{esc(text)}</span>'

    def leading_visual(self, v: View, size_cls: str = "") -> str:
        """Icon, image or avatar named by the common attributes, or ''."""
        icon = v.attr("systemImage", "icon", "systemName", "leadingIcon", "startIcon")
        if icon:
            tint = css_color(v.attr("iconColor"))
            style = f' style="--mkd-icon-tint:{esc(tint)}"' if tint else ""
            tinted = ' data-tinted="true"' if tint else ""
            return f'<span class="mkd-leading-icon{size_cls}"{tinted}{style}>{self.icon(icon, v=v)}</span>'
        img = v.attr("image", "thumbnail")
        if isinstance(img, str) and img:
            src = self.assets.resolve(img, v.loc)
            if src:
                return f'<img class="mkd-thumb" src="{esc(src)}" alt="">'
            return f'<span class="mkd-thumb mkd-thumb--missing">{self.icon("photo")}</span>'
        av = v.attr("avatar")
        if av:
            return self.avatar_html(_fmt(av) if not isinstance(av, ViewList) else "", None, v)
        return ""

    def avatar_html(self, name: str, image: object, v: View, size: str = "", extra: str = "") -> str:
        src = self.assets.resolve(image, v.loc) if isinstance(image, str) and image else None
        hue = sum(ord(c) for c in name) % 8 + 1 if name else 1
        size_attr = f' data-size="{esc(size)}"' if size else ""
        inner = f'<img src="{esc(src)}" alt="">' if src else (esc(initials(name)) or self.icon("person"))
        return f'<span class="mkd-avatar{extra}" data-hue="{hue}"{size_attr}>{inner}</span>'

    def _wrap_overlays(self, v: View, out: str) -> str:
        for m in v.modifiers:
            if m.name == "overlay" and m.content:
                align = m.kwargs.get("alignment", m.arg())
                a = align.name if isinstance(align, EnumValue) else "center"
                out = (f'<div class="mkd-overlay-host"><div class="mkd-overlay-host__base">{out}</div>'
                       f'<div class="mkd-overlay-host__layer" data-align="{esc(a)}">{self.views(m.content)}'
                       f"</div></div>")
            elif m.name == "background" and m.content:
                out = (f'<div class="mkd-overlay-host"><div class="mkd-overlay-host__under">{self.views(m.content)}'
                       f'</div><div class="mkd-overlay-host__base">{out}</div></div>')
        return out

    def _collect_presentations(self, v: View) -> None:
        for m in v.modifiers:
            if m.name not in PRESENTATIONS:
                continue
            presented = m.kwargs.get("isPresented", m.kwargs.get("item", True))
            if not _bool(presented, True):
                continue
            title = _fmt(m.arg()) if m.args and not isinstance(m.arg(), ViewList) else ""
            body = self.views(m.content or [])
            if m.name == "alert" or m.name == "confirmationDialog":
                message = self.views(m.slots.get("message", []))
                kind = "alert" if m.name == "alert" else "action-sheet"
                saved = self.in_menu
                self.in_menu = False
                actions = body or '<span class="mkd-button" role="button" data-variant="primary">' \
                                  '<span class="mkd-button__label">OK</span></span>'
                self.in_menu = saved
                self.overlays.append(
                    f'<div class="mkd-layer" data-kind="{kind}"><div class="mkd-scrim"></div>'
                    f'<div class="mkd-dialog" data-variant="{kind}" role="alertdialog">'
                    + (f'<div class="mkd-dialog__title">{text_html(title)}</div>' if title else "")
                    + (f'<div class="mkd-dialog__body">{message}</div>' if message else "")
                    + f'<div class="mkd-dialog__actions">{actions}</div></div></div>')
            else:
                kind = {"sheet": "sheet", "fullScreenCover": "cover", "popover": "popover",
                        "inspector": "inspector"}[m.name]
                self.overlays.append(f'<div class="mkd-layer" data-kind="{kind}">'
                                     + ('<div class="mkd-scrim"></div>' if kind == "sheet" else "")
                                     + f'<div class="mkd-presented" data-kind="{kind}">'
                                     + ('<div class="mkd-presented__grabber"></div>' if kind == "sheet" else "")
                                     + f"{body}</div></div>")

    # --- layout roles ----------------------------------------------------------------------------

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

    # --- content roles ---------------------------------------------------------------------------

    def r_text(self, v: View) -> str:
        data = {}
        style_name = v.attr("font", "style", "typography", "textStyle")
        if style_name and not v.has_mod("font"):
            from .style import font_style
            data["font"] = font_style(_name(style_name), self.pack.font)
        text = v.attr("content", "text", "verbatim")
        body = self.content(text) if text is not None else ""
        if v.extra_args:  # Text("a") + Text("b") is not supported; extra args are joined
            body += "".join(self.content(a) for a in v.extra_args)
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
        if text not in (None, True):
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
        variant = _name(v.attr("variant", "kind", "style")) or "linear"
        circular = variant in ("circular", "ring", "spinner", "gauge", "accessoryCircular", "radial")
        label = self.text_or_slot(v, "label", "title")
        current = self.text_or_slot(v, "currentValueLabel", "valueLabel")
        if _bool(v.attr("showValue")) and frac is not None and not current:
            current = f"{round(frac * 100)}%"
        data = {"kind": "circular" if circular else "linear"}
        if frac is None:
            data["indeterminate"] = "true"
        parts = [f'<span class="mkd-progress__label">{label}</span>'] if label else []
        if circular:
            r = 9.0
            circ = 2 * 3.14159 * r
            dash = f"{(frac if frac is not None else 0.3) * circ:.2f} {circ:.2f}"
            parts.append(f'<span class="mkd-progress__ring"><svg viewBox="0 0 24 24" aria-hidden="true">'
                         f'<circle class="mkd-progress__track" cx="12" cy="12" r="{r}"/>'
                         f'<circle class="mkd-progress__bar" cx="12" cy="12" r="{r}" stroke-dasharray="{dash}"/>'
                         f"</svg></span>")
        else:
            width = f"{(frac if frac is not None else 0.35) * 100:.1f}%"
            parts.append(f'<span class="mkd-progress__track"><span class="mkd-progress__bar" '
                         f'style="width:{width}"></span></span>')
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
        kind = _name(v.attr("kind", "type", "variant")) or "bar"
        values = [x for x in (v.attr("values", "data") or []) if _num(x) is not None]
        series = v.attr("series")
        labels = [_fmt(x) for x in (v.attr("labels", "categories") or [])]
        title = self.content(v.attr("title"))
        style = {}
        if (length := u(_num(v.attr("height")))) is not None:
            style["height"] = length
            style["min-height"] = "0"
        sized = {"sized": "true"} if "height" in style else {}
        all_series = [list(values)] if values else []
        if isinstance(series, list) and series and isinstance(series[0], list):
            all_series = [[_num(x, 0) for x in s] for s in series]
        nums = [_num(x, 0) or 0 for s in all_series for x in s] or [0]
        top = max(max(nums), 1e-9)
        body = ""
        if kind in ("pie", "donut"):
            vals = [_num(x, 0) or 0 for x in (all_series[0] if all_series else [])]
            total = sum(vals) or 1
            acc = 0.0
            stops = []
            for i, x in enumerate(vals):
                start, acc = acc, acc + x / total * 100
                stops.append(f"var(--mkd-chart-{i % 6 + 1}) {start:.2f}% {acc:.2f}%")
            body = (f'<div class="mkd-chart__pie" data-donut="{"true" if kind == "donut" else "false"}" '
                    f'style="background:conic-gradient({", ".join(stops)})"></div>')
            if labels:
                body += '<div class="mkd-chart__legend">' + "".join(
                    f'<span class="mkd-chart__key"><span class="mkd-chart__swatch" '
                    f'style="background:var(--mkd-chart-{i % 6 + 1})"></span>{esc(lab)}</span>'
                    for i, lab in enumerate(labels)) + "</div>"
        elif kind in ("line", "area", "sparkline"):
            polys = []
            lo = 0.0 if _bool(v.attr("fromZero")) else min(nums)
            span = (top - lo) or 1.0
            for si, s in enumerate(all_series):
                n = max(len(s) - 1, 1)
                pts = " ".join(f"{i / n * 100:.2f},{38 - ((_num(x, 0) or 0) - lo) / span * 34:.2f}"
                               for i, x in enumerate(s))
                if kind == "area":
                    polys.append(f'<polygon class="mkd-chart__area" points="0,40 {pts} 100,40" '
                                 f'style="fill:var(--mkd-chart-{si % 6 + 1})"/>')
                polys.append(f'<polyline class="mkd-chart__line" points="{pts}" '
                             f'style="stroke:var(--mkd-chart-{si % 6 + 1})"/>')
            body = (f'<svg class="mkd-chart__plot" viewBox="0 0 100 40" preserveAspectRatio="none" '
                    f'aria-hidden="true">{"".join(polys)}</svg>')
            if labels and kind != "sparkline":
                body += '<div class="mkd-chart__axis">' + "".join(f"<span>{esc(lab)}</span>" for lab in labels) + "</div>"
        else:
            groups = []
            count = max((len(s) for s in all_series), default=0)
            for i in range(count):
                bars = "".join(
                    f'<span class="mkd-chart__bar" style="height:{(_num(s[i], 0) or 0) / top * 100:.1f}%;'
                    f'background:var(--mkd-chart-{si % 6 + 1})"></span>'
                    for si, s in enumerate(all_series) if i < len(s))
                lab = f'<span class="mkd-chart__tick">{esc(labels[i])}</span>' if i < len(labels) else ""
                groups.append(f'<span class="mkd-chart__group"><span class="mkd-chart__bars">{bars}</span>{lab}</span>')
            body = f'<div class="mkd-chart__plot mkd-chart__plot--bars">{"".join(groups)}</div>'
        head = f'<div class="mkd-chart__title">{title}</div>' if title else ""
        return self.open(v, "chart", data={"kind": kind, **sized}, style=style) + head + body + "</div>"

    # --- controls --------------------------------------------------------------------------------

    def r_button(self, v: View) -> str:
        if self.in_menu:
            return self.r_menuitem(v)
        label = self.text_or_slot(v, "label", "title", "text")
        if v.children:
            label = self.views(v.children)
        icon = v.attr("systemImage", "icon", "startIcon", "leadingIcon")
        icon_only = _bool(v.attr("iconOnly")) or _name(v.attr("labelStyle")) == "iconOnly" or (not label and icon)
        data = {}
        role = v.attr("role")
        if role:
            data["role"] = _name(role)
        if icon_only:
            data["icon-only"] = "true"
        parts = []
        if icon:
            parts.append(f'<span class="mkd-button__icon">{self.icon(icon, v=v)}</span>')
        if label and not (icon_only and icon):
            parts.append(f'<span class="mkd-button__label">{label}</span>')
        end = v.attr("trailingIcon", "endIcon")
        if end:
            parts.append(f'<span class="mkd-button__icon mkd-button__icon--end">{self.icon(end, v=v)}</span>')
        if _bool(v.attr("dropdown", "menu", "split")):
            parts.append(f'<span class="mkd-button__caret">{self.icon("chevron.down")}</span>')
        if _bool(v.attr("loading")):
            parts.insert(0, '<span class="mkd-button__spinner"></span>')
        parts.append(self.badge_html(v.attr("badge"), "mkd-badge mkd-button__badge"))
        aria = {"role": "button"}
        if icon_only and label:
            aria["aria-label"] = re.sub(r"<[^>]+>", "", label)
        return self.open(v, "button", "span", data=data, attrs=aria) + "".join(parts) + "</span>"

    def r_fab(self, v: View) -> str:
        icon = v.attr("systemImage", "icon") or "plus"
        label = self.content(v.attr("label", "text", "title"))
        inner = f'<span class="mkd-fab__icon">{self.icon(icon, v=v)}</span>' + (
            f'<span class="mkd-fab__label">{label}</span>' if label else "")
        markup = self.open(v, "fab", "span", data={"extended": "true"} if label else {}, attrs={"role": "button"}) \
            + inner + "</span>"
        if _bool(v.attr("inline")):
            return markup
        pos = _name(v.attr("position", "placement")) or "bottomTrailing"
        self.overlays.append(f'<div class="mkd-layer" data-kind="fab" data-position="{esc(pos)}">{markup}</div>')
        return ""

    def r_toggle(self, v: View) -> str:
        variant = _name(v.attr("variant"))
        if variant in ("checkbox", "check"):
            return self.r_checkbox(v)
        on = _bool(v.attr("isOn", "on", "checked", "value", "selected"))
        label = self.text_or_slot(v, "label", "title") or self.views(v.children)
        desc = self.content(v.attr("description", "subtitle"))
        if variant == "button":
            return self.open(v, "button", "span", data={"pressed": "true" if on else "false"},
                             attrs={"role": "button"}) + f'<span class="mkd-button__label">{label}</span></span>'
        text = ""
        if label or desc:
            text = (f'<span class="mkd-toggle__text"><span class="mkd-toggle__label">{label}</span>'
                    + (f'<span class="mkd-toggle__description">{desc}</span>' if desc else "") + "</span>")
        state_text = v.attr("onText" if on else "offText")
        st = f'<span class="mkd-toggle__state">{esc(_fmt(state_text))}</span>' if state_text else ""
        return (self.open(v, "toggle", "span", data={"on": "true" if on else "false"},
                          attrs={"role": "switch", "aria-checked": "true" if on else "false"})
                + text + '<span class="mkd-toggle__track"><span class="mkd-toggle__thumb"></span></span>' + st
                + "</span>")

    def r_checkbox(self, v: View) -> str:
        raw = v.attr("checked", "isOn", "on", "value", "selected", "state")
        state = "mixed" if _name(raw) in ("indeterminate", "mixed") else ("true" if _bool(raw) else "false")
        label = self.text_or_slot(v, "label", "title") or self.views(v.children)
        mark = self.icon("minus" if state == "mixed" else "checkmark") if state != "false" else ""
        return (self.open(v, "checkbox", "span", data={"checked": state},
                          attrs={"role": "checkbox", "aria-checked": state})
                + f'<span class="mkd-checkbox__box">{mark}</span>'
                + (f'<span class="mkd-checkbox__label">{label}</span>' if label else "") + "</span>")

    def r_radio(self, v: View) -> str:
        on = _bool(v.attr("checked", "selected", "isOn", "value"))
        label = self.text_or_slot(v, "label", "title") or self.views(v.children)
        return (self.open(v, "radio", "span", data={"checked": "true" if on else "false"},
                          attrs={"role": "radio", "aria-checked": "true" if on else "false"})
                + '<span class="mkd-radio__dot"></span>'
                + (f'<span class="mkd-radio__label">{label}</span>' if label else "") + "</span>")

    def _options(self, v: View) -> list[tuple[str, str]]:
        """(plain label, markup) pairs from `options`/`items` or children."""
        opts = v.attr("options", "items", "choices", "segments")
        out: list[tuple[str, str]] = []
        if isinstance(opts, (list, tuple)):
            for o in opts:
                if isinstance(o, dict):
                    lab = _fmt(o.get("label", o.get("title", "")))
                    icon = o.get("icon", o.get("systemImage"))
                    out.append((lab, (f'<span class="mkd-option__icon">{self.icon(icon, v=v)}</span>' if icon else "")
                                + text_html(lab)))
                else:
                    out.append((_fmt(o), text_html(_fmt(o))))
        else:
            for c in v.children:
                if c.role in ("text", "label", "button", "listitem", "menuitem", "tab", "radio"):
                    lab = _fmt(c.attr("content", "title", "label", "text"))
                    saved = self.in_menu
                    self.in_menu = False
                    markup = self.view(c) if c.role in ("label",) else text_html(lab)
                    self.in_menu = saved
                    out.append((lab, markup))
        return out

    def _selected_index(self, v: View, options: list[tuple[str, str]]) -> int:
        sel = v.attr("selection", "selected", "value", "current", "active")
        if isinstance(sel, bool):
            return -1
        if isinstance(sel, (int, float)):
            return int(sel)
        name = _fmt(sel)
        for i, (lab, _) in enumerate(options):
            if lab == name:
                return i
        return -1 if sel is not None else 0

    def r_segmented(self, v: View) -> str:
        options = self._options(v)
        sel = self._selected_index(v, options)
        label = self.content(v.attr("label", "title"))
        items = "".join(
            f'<span class="mkd-segmented__item" role="tab" aria-selected="{"true" if i == sel else "false"}">'
            f"{markup}</span>" for i, (_, markup) in enumerate(options))
        return self.open(v, "segmented", attrs={"role": "tablist"}) + (
            f'<span class="mkd-segmented__label">{label}</span>' if label and not v.has_mod("labelsHidden") else "") \
            + f'<span class="mkd-segmented__items">{items}</span></div>'

    def _field(self, v: View, role: str, value_html: str, *, placeholder: bool, kind: str = "",
               end_icon: str = "", popup: str = "", control_extra: str = "",
               style: dict | None = None) -> str:
        label = self.text_or_slot(v, "label", "title", "header")
        helper = self.text_or_slot(v, "helper", "helperText", "supportingText", "description", "hint", "footer")
        err = v.attr("error", "errorMessage")
        if isinstance(err, str) and err:
            helper = text_html(err)
        data = {"filled": "false" if placeholder else "true"}
        if kind:
            data["kind"] = kind
        if label:
            data["labeled"] = "true"
        icon = v.attr("systemImage", "icon", "leadingIcon", "startIcon")
        if not icon and kind == "search":
            icon = "magnifyingglass"
        parts = []
        if label:
            req = '<span class="mkd-field__required">*</span>' if _bool(v.attr("required")) else ""
            parts.append(f'<label class="mkd-field__label">{label}{req}</label>')
        ctrl = []
        if icon:
            ctrl.append(f'<span class="mkd-field__icon">{self.icon(icon, v=v)}</span>')
        prefix = v.attr("prefix")
        if prefix:
            ctrl.append(f'<span class="mkd-field__prefix">{esc(_fmt(prefix))}</span>')
        ctrl.append(f'<span class="mkd-field__input"{PH if placeholder else ""}>'
                    f"{value_html}</span>")
        suffix = v.attr("suffix", "unit")
        if suffix:
            ctrl.append(f'<span class="mkd-field__suffix">{esc(_fmt(suffix))}</span>')
        ctrl.append(control_extra)
        if _bool(v.attr("clearButton", "clearable")) and not placeholder:
            ctrl.append(f'<span class="mkd-field__icon mkd-field__icon--end">{self.icon("xmark.circle")}</span>')
        trailing = v.attr("trailingIcon", "endIcon")
        if trailing:
            ctrl.append(f'<span class="mkd-field__icon mkd-field__icon--end">{self.icon(trailing, v=v)}</span>')
        if end_icon:
            ctrl.append(f'<span class="mkd-field__icon mkd-field__icon--end">{self.icon(end_icon)}</span>')
        parts.append(f'<div class="mkd-field__control">{"".join(ctrl)}</div>')
        if helper:
            parts.append(f'<div class="mkd-field__helper">{helper}</div>')
        count = v.attr("counter", "maxLength")
        if count:
            parts.append(f'<div class="mkd-field__counter">{esc(_fmt(count))}</div>')
        return self.open(v, role, cls="mkd-field", data=data, style=style) + "".join(parts) + popup + "</div>"

    def r_textfield(self, v: View) -> str:
        kind = _name(v.attr("kind", "type", "axis")) or ""
        if kind == "vertical":
            kind = "multiline"
        value = v.attr("text", "value")
        placeholder_text = v.attr("placeholder", "prompt")
        if isinstance(value, (int, float)) and not isinstance(value, bool):
            value = _fmt(value)
        if isinstance(value, str) and value:
            shown = "•" * min(len(value), 12) if kind == "password" else value
            inner, is_ph = text_html(shown), False
        else:
            inner, is_ph = self.content(placeholder_text), True
        style = {}
        if kind == "multiline":
            style["--mkd-rows"] = str(int(_num(v.attr("rows", "lineLimit"), 3) or 3))
        end = "eye.slash" if kind == "password" and _bool(v.attr("reveal"), False) else ""
        return self._field(v, "textfield", inner, placeholder=is_ph, kind=kind, end_icon=end, style=style)

    def r_select(self, v: View) -> str:
        variant = _name(v.attr("variant"))
        if variant == "segmented":
            return self.r_segmented(v)
        if variant in ("radioGroup", "inline", "radio"):
            return self.r_radiogroup(v)
        options = self._options(v)
        sel = self._selected_index(v, options)
        value = v.attr("selection", "value", "selected")
        if isinstance(value, (int, float)) and not isinstance(value, bool) and 0 <= int(value) < len(options):
            shown = options[int(value)][1]
        elif isinstance(value, str) and value:
            shown = text_html(value)
        elif isinstance(value, list):
            shown = "".join(f'<span class="mkd-chip" data-el="Chip" data-size="small"><span class="mkd-chip__label">'
                            f"{esc(_fmt(x))}</span></span>" for x in value)
        else:
            shown = ""
        placeholder = not shown
        if placeholder:
            shown = self.content(v.attr("placeholder", "prompt"))
        popup = ""
        if _bool(v.attr("open", "expanded")) and options:
            popup = '<div class="mkd-select__popup" role="listbox">' + "".join(
                f'<div class="mkd-select__option" role="option" aria-selected="{"true" if i == sel else "false"}">'
                f"{markup}</div>" for i, (_, markup) in enumerate(options)) + "</div>"
        chevron = "chevron.up.down" if variant in ("menu", "automatic") and self.pack.id == "swiftui" else "chevron.down"
        return self._field(v, "select", shown, placeholder=placeholder, end_icon=chevron, popup=popup)

    def r_radiogroup(self, v: View) -> str:
        options = self._options(v)
        sel = self._selected_index(v, options)
        label = self.text_or_slot(v, "label", "title")
        if options:
            radios = "".join(
                f'<span class="mkd-radio" data-el="RadioButton" data-checked="{"true" if i == sel else "false"}" '
                f'role="radio"><span class="mkd-radio__dot"></span><span class="mkd-radio__label">{markup}</span></span>'
                for i, (_, markup) in enumerate(options))
        else:
            radios = self.views(v.children)
        return self.open(v, "radiogroup", attrs={"role": "radiogroup"}) + (
            f'<div class="mkd-radiogroup__label">{label}</div>' if label else "") + \
            f'<div class="mkd-radiogroup__items">{radios}</div></div>'

    def r_slider(self, v: View) -> str:
        rng = v.attr("in", "range", "bounds")
        lo = _num(v.attr("min", "minimumValue"), None)
        hi = _num(v.attr("max", "maximumValue"), None)
        if isinstance(rng, list) and rng:
            lo, hi = (_num(rng[0], 0), _num(rng[-1], 1)) if lo is None else (lo, hi)
        lo = 0.0 if lo is None else lo
        hi = (1.0 if (_num(v.attr("value"), 0) or 0) <= 1 else 100.0) if hi is None else hi
        val = v.attr("value")
        if isinstance(val, list) and len(val) == 2:  # range slider
            a, b = (_num(val[0], lo) or 0, _num(val[1], hi) or 0)
        else:
            a, b = lo, _num(val, lo) or lo
        span = (hi - lo) or 1
        fa, fb = (a - lo) / span * 100, (b - lo) / span * 100
        label = self.text_or_slot(v, "label", "title")
        parts = [f'<div class="mkd-slider__label">{label}</div>'] if label else []
        track = (f'<span class="mkd-slider__track"><span class="mkd-slider__fill" style="left:{fa:.1f}%;'
                 f'width:{fb - fa:.1f}%"></span>')
        steps = v.attr("ticks", "steps", "step")
        if _bool(v.attr("ticks")) or isinstance(v.attr("ticks"), int):
            n = int(_num(steps, 0) or 0) if isinstance(steps, (int, float)) and not isinstance(steps, bool) else 0
            n = n or 5
            track += '<span class="mkd-slider__ticks">' + "<i></i>" * (n + 1) + "</span>"
        if isinstance(val, list) and len(val) == 2:
            track += f'<span class="mkd-slider__thumb" style="left:{fa:.1f}%"></span>'
        track += f'<span class="mkd-slider__thumb" style="left:{fb:.1f}%"></span></span>'
        mn = self.slot(v, "minimumValueLabel") or (self.content(v.attr("minLabel")) if v.attr("minLabel") else "")
        mx = self.slot(v, "maximumValueLabel") or (self.content(v.attr("maxLabel")) if v.attr("maxLabel") else "")
        ctrl = (f'<span class="mkd-slider__min">{mn}</span>' if mn else "") + track + (
            f'<span class="mkd-slider__max">{mx}</span>' if mx else "")
        if _bool(v.attr("showValue")):
            ctrl += f'<span class="mkd-slider__value">{esc(_fmt(round(b, 2)))}</span>'
        parts.append(f'<div class="mkd-slider__control">{ctrl}</div>')
        return self.open(v, "slider", attrs={"role": "slider"}) + "".join(parts) + "</div>"

    def r_stepper(self, v: View) -> str:
        label = self.text_or_slot(v, "label", "title") or self.views(v.children)
        value = v.attr("value")
        val_html = f'<span class="mkd-stepper__value">{esc(_fmt(value))}</span>' if value is not None else ""
        btns = (f'<span class="mkd-stepper__buttons"><span class="mkd-stepper__button" data-step="down">'
                f'{self.icon("minus")}</span><span class="mkd-stepper__divider"></span>'
                f'<span class="mkd-stepper__button" data-step="up">{self.icon("plus")}</span></span>')
        return self.open(v, "stepper") + (f'<span class="mkd-stepper__label">{label}</span>' if label else "") \
            + val_html + btns + "</div>"

    def r_datepicker(self, v: View) -> str:
        variant = _name(v.attr("variant", "style"))
        if variant == "graphical":
            return self.r_calendar(v)
        value = v.attr("selection", "date", "value", "text")
        shown = _format_date(value, _name(v.attr("format")) or "medium") if value else ""
        kind = _name(v.attr("kind")) or "date"
        end = {"time": "clock", "datetime": "calendar"}.get(kind, "calendar")
        return self._field(v, "datepicker", text_html(shown) if shown else self.content(v.attr("placeholder")),
                           placeholder=not shown, kind=kind, end_icon=end)

    def r_calendar(self, v: View) -> str:
        sel = v.attr("selection", "date", "value")
        d = _parse_date(sel) or _dt.date(2026, 11, 23)
        year = int(_num(v.attr("year"), d.year) or d.year)
        month = int(_num(v.attr("month"), d.month) or d.month)
        first = int(_num(v.attr("firstWeekday"), 0) or 0)  # 0 = Sunday
        cal = calendar.Calendar(firstweekday=(first - 1) % 7)
        marked = {(_parse_date(x) or _dt.date.min) for x in (v.attr("events", "marked") or [])}
        rng = v.attr("range")
        r0 = _parse_date(rng[0]) if isinstance(rng, list) and len(rng) == 2 else None
        r1 = _parse_date(rng[1]) if isinstance(rng, list) and len(rng) == 2 else None
        days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
        order = [days[(first + i) % 7] for i in range(7)]
        head = "".join(f'<span class="mkd-calendar__weekday">{w[:1] if self.pack.id == "swiftui" else w[:2]}</span>'
                       for w in order)
        cells = []
        for day in cal.itermonthdates(year, month):
            attrs = []
            if day.month != month:
                attrs.append('data-outside="true"')
            if sel and day == d:
                attrs.append('aria-selected="true"')
            if r0 and r1 and r0 <= day <= r1:
                attrs.append('data-in-range="true"')
            if day in marked:
                attrs.append('data-marked="true"')
            if day == _dt.date(2026, 11, 23) and _bool(v.attr("showToday"), False):
                attrs.append('data-today="true"')
            cells.append(f'<span class="mkd-calendar__day" {" ".join(attrs)}>{day.day}</span>')
        title = f"{calendar.month_name[month]} {year}"
        label = self.content(v.attr("label", "title"))
        return (self.open(v, "calendar")
                + (f'<div class="mkd-calendar__label">{label}</div>' if label else "")
                + f'<div class="mkd-calendar__header"><span class="mkd-calendar__title">{esc(title)}'
                f'<span class="mkd-calendar__title-chevron">{self.icon("chevron.right")}</span></span>'
                f'<span class="mkd-calendar__nav">{self.icon("chevron.left")}{self.icon("chevron.right")}</span></div>'
                f'<div class="mkd-calendar__grid">{head}{"".join(cells)}</div></div>')

    def r_dropzone(self, v: View) -> str:
        label = self.content(v.attr("label", "title", "text")) or "Drop files here"
        hint = self.content(v.attr("hint", "description"))
        icon = v.attr("systemImage", "icon") or "arrow.up.to.line"
        return self.open(v, "dropzone") + f'<span class="mkd-dropzone__icon">{self.icon(icon, v=v)}</span>' \
            + f'<span class="mkd-dropzone__label">{label}</span>' \
            + (f'<span class="mkd-dropzone__hint">{hint}</span>' if hint else "") + self.views(v.children) + "</div>"

    # --- navigation ------------------------------------------------------------------------------

    def _find_mod(self, views: list[View], name: str, depth: int = 0) -> View | None:
        for c in views:
            if c.mod(name):
                return c
            if c.role in ("navstack", "split", "tabs") or depth > 6:
                continue
            found = self._find_mod(c.children, name, depth + 1)
            if found:
                return found
        return None

    _PLACEMENT = {
        "topBarLeading": "leading", "navigationBarLeading": "leading", "cancellationAction": "leading",
        "navigation": "leading", "topBarTrailing": "trailing", "navigationBarTrailing": "trailing",
        "primaryAction": "trailing", "confirmationAction": "trailing", "automatic": "trailing",
        "principal": "principal", "bottomBar": "bottom", "status": "bottom", "secondaryAction": "trailing",
        "destructiveAction": "trailing", "keyboard": "bottom", "title": "principal", "largeTitle": "principal",
    }

    def _toolbar_items(self, views: list[View]) -> dict[str, list[View]]:
        groups: dict[str, list[View]] = {"leading": [], "trailing": [], "principal": [], "bottom": []}
        for item in views:
            if item.role == "toolbaritem":
                where = self._PLACEMENT.get(_name(item.attr("placement")) or "automatic", "trailing")
                groups[where].extend(item.children)
            else:
                groups["trailing"].append(item)
        return groups

    def r_navstack(self, v: View) -> str:
        content = v.children
        title_view = self._find_mod(content, "navigationTitle")
        title = v.attr("title")
        title_html = self.content(title) if title else ""
        if title_view is not None:
            m = title_view.mod("navigationTitle")
            title_html = self.content(m.arg()) if m.args else self.views(m.content or [])
        subtitle_view = self._find_mod(content, "navigationSubtitle")
        subtitle = self.content(subtitle_view.mod("navigationSubtitle").arg()) if subtitle_view else \
            self.content(v.attr("subtitle"))
        mode_view = self._find_mod(content, "navigationBarTitleDisplayMode")
        mode = _name(mode_view.mod("navigationBarTitleDisplayMode").arg()) if mode_view else \
            (_name(v.attr("titleDisplayMode")) or "large")
        if mode == "automatic":
            mode = "large"
        if not title_html:
            mode = "inline"
        tb_views: list[View] = []
        tb_holder = self._find_mod(content, "toolbar")
        while tb_holder is not None:
            for m in tb_holder.modifiers:
                if m.name == "toolbar" and m.content:
                    tb_views.extend(m.content)
            break
        groups = self._toolbar_items(tb_views)
        back = v.attr("back", "backTitle")
        leading = ""
        if back:
            label = "" if back is True else f'<span class="mkd-navbar__back-label">{esc(_fmt(back))}</span>'
            leading += f'<span class="mkd-navbar__back">{self.icon("chevron.left")}{label}</span>'
        leading += self.views(groups["leading"])
        principal = self.views(groups["principal"])
        trailing = self.views(groups["trailing"])
        search_view = self._find_mod(content, "searchable")
        search = ""
        if search_view is not None:
            sm = search_view.mod("searchable")
            prompt = sm.kwargs.get("prompt", "Search")
            text = sm.kwargs.get("text")
            ph = not (isinstance(text, str) and text)
            search = (f'<div class="mkd-navbar__search"><span class="mkd-field mkd-textfield" data-el="SearchField" '
                      f'data-kind="search" data-filled="{"false" if ph else "true"}"><span class="mkd-field__control">'
                      f'<span class="mkd-field__icon">{self.icon("magnifyingglass")}</span>'
                      f'<span class="mkd-field__input"{PH if ph else ""}>'
                      f"{esc(_fmt(text if not ph else prompt))}</span>"
                      f'<span class="mkd-field__icon mkd-field__icon--end" data-mic="true">{self.icon("mic")}</span>'
                      f"</span></span></div>")
        hidden = _bool(v.attr("hideNavigationBar"))
        bar = ""
        if not hidden:
            bar_title = principal or (f'<span class="mkd-navbar__title-text">{title_html}</span>' if title_html else "")
            if subtitle and mode == "inline":
                bar_title += f'<span class="mkd-navbar__subtitle">{subtitle}</span>'
            bar = (f'<div class="mkd-navbar" data-title-mode="{esc(mode)}">'
                   f'<div class="mkd-navbar__bar"><div class="mkd-navbar__leading">{leading}</div>'
                   f'<div class="mkd-navbar__title">{bar_title}</div>'
                   f'<div class="mkd-navbar__trailing">{trailing}</div></div>'
                   + (f'<div class="mkd-navbar__large">{title_html}'
                      + (f'<span class="mkd-navbar__subtitle">{subtitle}</span>' if subtitle else "") + "</div>"
                      if mode == "large" else "")
                   + search + "</div>")
        bottom = self.views(groups["bottom"])
        bottom_html = f'<div class="mkd-bottombar">{bottom}</div>' if bottom else ""
        return self.open(v, "navstack") + bar + f'<div class="mkd-navstack__content">{self.views(content)}</div>' \
            + bottom_html + "</div>"

    def r_split(self, v: View) -> str:
        cols: list[tuple[str, list[View]]] = []
        names = ["sidebar", "content", "detail"]
        if v.slots:
            cols.append(("sidebar", v.children))
            for key in ("content", "detail", "inspector"):
                if key in v.slots:
                    cols.append((key, v.slots[key]))
        else:
            for i, c in enumerate(v.children):
                cols.append((names[i] if i < 3 else f"col{i}", [c]))
        widths = v.attr("columnWidths", "widths")
        out = []
        for i, (name, views) in enumerate(cols):
            st = ""
            if isinstance(widths, list) and i < len(widths) and (length := u(_num(widths[i]))) is not None:
                st = f' style="flex:0 0 {length};width:{length}"'
            out.append(f'<div class="mkd-split__col" data-col="{esc(name)}"{st}>{self.views(views)}</div>')
        return self.open(v, "split", data={"columns": str(len(cols))}) + "".join(out) + "</div>"

    def r_tabs(self, v: View) -> str:
        tabs: list[dict] = []
        for c in v.children:
            if c.role == "tab":
                tabs.append({"label": c.attr("label", "title", "text"), "icon": c.attr("systemImage", "icon", "image"),
                             "badge": c.attr("badge"), "content": c.children, "view": c,
                             "selected": _bool(c.attr("selected")), "disabled": _bool(c.attr("disabled"))})
            elif c.mod("tabItem"):
                m = c.mod("tabItem")
                lab_view = next((x for x in (m.content or []) if x.role in ("label", "text", "image")), None)
                label = icon = None
                if lab_view is not None:
                    label = lab_view.attr("title", "content", "text")
                    icon = lab_view.attr("systemImage", "icon", "systemName")
                    for x in m.content or []:
                        if x.role in ("image", "icon") and not icon:
                            icon = x.attr("systemName", "name")
                        if x.role == "text" and not label:
                            label = x.attr("content")
                tabs.append({"label": label, "icon": icon, "badge": c.attr("badge"), "content": [c], "view": c,
                             "selected": False, "disabled": False})
            else:
                tabs.append({"label": None, "icon": None, "badge": None, "content": [c], "view": c,
                             "selected": False, "disabled": False})
        items = v.attr("items", "tabs")
        if isinstance(items, list) and not tabs:
            for it in items:
                if isinstance(it, dict):
                    tabs.append({"label": it.get("label", it.get("title")), "icon": it.get("icon", it.get("systemImage")),
                                 "badge": it.get("badge"), "content": [], "view": None, "selected": False,
                                 "disabled": False})
                else:
                    tabs.append({"label": it, "icon": None, "badge": None, "content": [], "view": None,
                                 "selected": False, "disabled": False})
        sel = v.attr("selection", "selected", "value", "active")
        index = 0
        if isinstance(sel, (int, float)) and not isinstance(sel, bool):
            index = int(sel)
        elif sel is not None:
            for i, t in enumerate(tabs):
                if _fmt(t["label"]) == _fmt(sel):
                    index = i
        for i, t in enumerate(tabs):
            if t["selected"]:
                index = i
        bar = []
        for i, t in enumerate(tabs):
            icon = f'<span class="mkd-tabs__icon">{self.icon(t["icon"], v=v)}</span>' if t["icon"] else ""
            lab = f'<span class="mkd-tabs__label">{self.content(t["label"])}</span>' if t["label"] is not None else ""
            badge = self.badge_html(t["badge"], "mkd-badge mkd-tabs__badge")
            dis = ' data-state="disabled"' if t["disabled"] else ""
            bar.append(f'<span class="mkd-tabs__tab" role="tab" aria-selected="{"true" if i == index else "false"}"'
                       f'{dis}>{icon}{lab}{badge}</span>')
        trailing = self.slot(v, "trailing", "actions")
        if trailing:
            bar.append(f'<span class="mkd-tabs__actions">{trailing}</span>')
        panel_views = tabs[index]["content"] if 0 <= index < len(tabs) else []
        panel = f'<div class="mkd-tabs__panel" role="tabpanel">{self.views(panel_views)}</div>' \
            if any(t["content"] for t in tabs) else ""
        placement = _name(v.attr("placement")) or "top"
        return self.open(v, "tabs", data={"placement": placement}) + \
            f'<div class="mkd-tabs__bar" role="tablist">{"".join(bar)}</div>' + panel + "</div>"

    def r_tab(self, v: View) -> str:
        return self.open(v, "group") + self.views(v.children) + "</div>"

    def r_appbar(self, v: View) -> str:
        leading = self.slot(v, "leading", "navigation", "start")
        if not leading:
            if _bool(v.attr("menu", "menuButton", "hamburger")):
                leading += f'<span class="mkd-appbar__nav">{self.icon("line.3.horizontal")}</span>'
            back = v.attr("back")
            if back:
                leading += f'<span class="mkd-appbar__nav">{self.icon("arrow.left")}</span>'
            nav_icon = v.attr("navigationIcon")
            if nav_icon:
                leading += f'<span class="mkd-appbar__nav">{self.icon(nav_icon, v=v)}</span>'
        logo = v.attr("logo")
        if isinstance(logo, str) and logo:
            src = self.assets.resolve(logo, v.loc) if "." in logo or "/" in logo else None
            leading += (f'<img class="mkd-appbar__logo" src="{esc(src)}" alt="">' if src else
                        f'<span class="mkd-appbar__logo mkd-appbar__logo--icon">{self.icon(logo, v=v)}</span>')
        title = self.text_or_slot(v, "title", "primaryTitle", "brand")
        subtitle = self.text_or_slot(v, "subtitle", "secondaryTitle")
        title_html = (f'<div class="mkd-appbar__titles"><span class="mkd-appbar__title">{title}</span>'
                      + (f'<span class="mkd-appbar__subtitle">{subtitle}</span>' if subtitle else "") + "</div>") \
            if title or subtitle else ""
        center = self.slot(v, "center", "content", "middle")
        search = v.attr("search", "searchPrompt")
        if search and not center:
            prompt = "Search" if search is True else _fmt(search)
            center = (f'<span class="mkd-field mkd-textfield mkd-appbar__search" data-el="Search" data-kind="search" '
                      f'data-filled="false"><span class="mkd-field__control"><span class="mkd-field__icon">'
                      f'{self.icon("magnifyingglass")}</span><span class="mkd-field__input" data-placeholder="true">'
                      f"{esc(prompt)}</span></span></span>")
        actions = self.views(v.children) + self.slot(v, "actions", "trailing", "end")
        notif = v.attr("notifications", "notificationsCount")
        if notif not in (None, False):
            actions += (f'<span class="mkd-appbar__action">{self.icon("bell")}'
                        f'{self.badge_html(notif if notif is not True else True, "mkd-badge mkd-appbar__badge")}</span>')
        avatar = v.attr("avatar", "profile", "user")
        if avatar:
            actions += self.avatar_html(_fmt(avatar), v.attr("avatarImage"), v, "small", " mkd-appbar__avatar")
        return self.open(v, "appbar", attrs={"role": "banner"}) + \
            f'<div class="mkd-appbar__leading">{leading}</div>{title_html}' + \
            f'<div class="mkd-appbar__center">{center}</div><div class="mkd-appbar__actions">{actions}</div>' + "</div>"

    def r_sidebar(self, v: View) -> str:
        title = self.text_or_slot(v, "title")
        header = self.slot(v, "header")
        footer = self.slot(v, "footer")
        sel = v.attr("selection", "selected")
        body_views = v.children
        if sel is not None:
            for c in body_views:
                if c.role in ("navitem", "listitem") and _fmt(c.attr("label", "title")) == _fmt(sel):
                    c.attrs["selected"] = True
        style = {}
        if (length := u(_num(v.attr("width")))) is not None:
            style["width"] = length
            style["flex"] = f"0 0 {length}"
        return self.open(v, "sidebar", "nav", style=style) + (
            f'<div class="mkd-sidebar__header">{header}'
            + (f'<span class="mkd-sidebar__title">{title}</span>' if title else "") + "</div>"
            if header or title else "") + f'<div class="mkd-sidebar__items">{self.views(body_views)}</div>' + (
            f'<div class="mkd-sidebar__footer">{footer}</div>' if footer else "") + "</nav>"

    def r_navitem(self, v: View) -> str:
        icon = v.attr("systemImage", "icon")
        label = self.text_or_slot(v, "label", "title", "text")
        if not label and v.children and not v.attr("expanded"):
            label = self.views([c for c in v.children if c.role != "navitem"])
        sub = [c for c in v.children if c.role == "navitem"]
        expanded = _bool(v.attr("expanded"), bool(sub) and any(_bool(c.attr("selected")) for c in sub))
        parts = [f'<span class="mkd-navitem__icon">{self.icon(icon, v=v)}</span>' if icon else ""]
        parts.append(f'<span class="mkd-navitem__label">{label}</span>')
        parts.append(self.badge_html(v.attr("badge", "count"), "mkd-badge mkd-navitem__badge"))
        if sub:
            parts.append(f'<span class="mkd-navitem__chevron">{self.icon("chevron.down" if expanded else "chevron.right")}'
                         f"</span>")
        row = f'<span class="mkd-navitem__row">{"".join(parts)}</span>'
        children = f'<div class="mkd-navitem__children">{self.views(sub)}</div>' if sub and expanded else ""
        return self.open(v, "navitem", data={"expanded": "true" if expanded else None} if sub else None,
                         attrs={"role": "link", "aria-current": "page" if _bool(v.attr("selected")) else None}) \
            + row + children + "</div>"

    def r_breadcrumb(self, v: View) -> str:
        items = v.attr("items", "path")
        crumbs: list[str] = []
        if isinstance(items, list):
            crumbs = [text_html(_fmt(i)) for i in items]
        else:
            crumbs = [self.view(c) for c in v.children]
        out = []
        for i, c in enumerate(crumbs):
            cur = ' aria-current="page"' if i == len(crumbs) - 1 else ""
            out.append(f'<span class="mkd-breadcrumb__item"{cur}>{c}</span>')
            if i < len(crumbs) - 1:
                out.append(f'<span class="mkd-breadcrumb__sep">{self.icon("chevron.right")}</span>')
        return self.open(v, "breadcrumb", "nav") + "".join(out) + "</nav>"

    def r_pagination(self, v: View) -> str:
        count = int(_num(v.attr("count", "pages", "total"), 5) or 5)
        page = int(_num(v.attr("page", "current", "selection"), 1) or 1)
        nums: list[object] = []
        if count <= 7:
            nums = list(range(1, count + 1))
        else:
            nums = [1]
            lo, hi = max(2, page - 1), min(count - 1, page + 1)
            if lo > 2:
                nums.append("…")
            nums += list(range(lo, hi + 1))
            if hi < count - 1:
                nums.append("…")
            nums.append(count)
        cells = [f'<span class="mkd-pagination__item" data-nav="prev">{self.icon("chevron.left")}</span>']
        for n in nums:
            if n == "…":
                cells.append('<span class="mkd-pagination__gap">…</span>')
            else:
                sel = ' aria-current="page"' if n == page else ""
                cells.append(f'<span class="mkd-pagination__item"{sel}>{n}</span>')
        cells.append(f'<span class="mkd-pagination__item" data-nav="next">{self.icon("chevron.right")}</span>')
        summary = v.attr("summary", "label")
        if summary:
            cells.insert(0, f'<span class="mkd-pagination__summary">{esc(_fmt(summary))}</span>')
        return self.open(v, "pagination", "nav") + "".join(cells) + "</nav>"

    def r_steps(self, v: View) -> str:
        steps = v.attr("steps", "items")
        labels: list[tuple[str, str]] = []
        if isinstance(steps, int) and not isinstance(steps, bool):
            steps = [""] * steps
        if isinstance(steps, list):
            for s in steps:
                if isinstance(s, dict):
                    labels.append((_fmt(s.get("title", s.get("label", ""))), _fmt(s.get("description", ""))))
                else:
                    labels.append((_fmt(s), ""))
        else:
            labels = [(_fmt(c.attr("title", "label", "content")), _fmt(c.attr("description", "subtitle") or ""))
                      for c in v.children]
        current = int(_num(v.attr("current", "active", "selection", "activeStep"), 0) or 0)
        errors = {int(x) for x in (v.attr("errors") or []) if isinstance(x, int)}
        out = []
        for i, (title, desc) in enumerate(labels):
            status = "error" if i in errors else ("done" if i < current else ("current" if i == current else "todo"))
            marker = self.icon("checkmark") if status == "done" else (self.icon("exclamationmark.circle")
                                                                     if status == "error" else str(i + 1))
            out.append(f'<div class="mkd-steps__step" data-status="{status}"><span class="mkd-steps__marker">{marker}'
                       f'</span><span class="mkd-steps__text"><span class="mkd-steps__title">{esc(title)}</span>'
                       + (f'<span class="mkd-steps__description">{esc(desc)}</span>' if desc else "")
                       + "</span></div>")
            if i < len(labels) - 1:
                out.append(f'<span class="mkd-steps__connector" data-done="{"true" if i < current else "false"}">'
                           "</span>")
        return self.open(v, "steps", data={"orientation": _name(v.attr("orientation")) or "horizontal"}) + \
            "".join(out) + "</div>"

    # --- containers ------------------------------------------------------------------------------

    def r_card(self, v: View) -> str:
        parts = []
        media = v.attr("image", "media", "cover")
        if isinstance(media, str) and media:
            src = self.assets.resolve(media, v.loc)
            h = u(_num(v.attr("mediaHeight"), 140)) or ""
            parts.append(f'<img class="mkd-card__media" src="{esc(src)}" alt="" style="height:{h}">' if src else
                         f'<div class="mkd-card__media mkd-card__media--missing" style="height:{h}">'
                         f'{self.icon("photo")}</div>')
        title = self.text_or_slot(v, "title")
        subtitle = self.text_or_slot(v, "subtitle", "subheader", "description")
        header = self.slot(v, "header")
        visual = ""
        if v.attr("avatar"):
            visual = self.avatar_html(_fmt(v.attr("avatar")), v.attr("avatarImage"), v)
        elif v.attr("systemImage", "icon"):
            visual = f'<span class="mkd-card__icon">{self.icon(v.attr("systemImage", "icon"), v=v)}</span>'
        head_actions = self.slot(v, "headerAction", "action", "menu", "extra")
        status = self.text_or_slot(v, "status", "value")
        if header or title or subtitle or visual or head_actions:
            parts.append('<div class="mkd-card__header">' + visual + (header or (
                f'<div class="mkd-card__titles"><span class="mkd-card__title">{title}</span>'
                + (f'<span class="mkd-card__subtitle">{subtitle}</span>' if subtitle else "") + "</div>"))
                + (f'<span class="mkd-card__status">{status}</span>' if status else "")
                + (f'<div class="mkd-card__header-actions">{head_actions}</div>' if head_actions else "") + "</div>")
        if v.children:
            parts.append(f'<div class="mkd-card__body">{self.views(v.children)}</div>')
        actions = self.slot(v, "actions", "footer")
        if actions:
            parts.append(f'<div class="mkd-card__actions">{actions}</div>')
        return self.open(v, "card") + "".join(parts) + "</div>"

    def _rows(self, views: list[View], wrap: str) -> str:
        out = []
        saved = self.row_wrap
        for c in views:
            self.row_wrap = None
            if c.role in ("section", "listitem", "navitem", "labeled") or (wrap == "form" and c.role in ("form",)):
                self.row_wrap = wrap if c.role == "section" else None
                out.append(self.view(c))
            elif c.role == "group" and c.children:
                out.append(self._rows(c.children, wrap))
            elif c.role == "divider" and wrap == "form":
                out.append(self.view(c))
            else:
                cls = "mkd-listitem mkd-listitem--wrap" if wrap == "list" else "mkd-form__row"
                inner = self.view(c)
                out.append(f'<div class="{cls}" data-child="{esc(c.role)}">{inner}</div>' if inner else "")
        self.row_wrap = saved
        return "".join(out)

    def r_section(self, v: View) -> str:
        wrap = self.row_wrap
        title = self.text_or_slot(v, "title", "header", "label")
        footer = self.text_or_slot(v, "footer", "description")
        body = self._rows(v.children, wrap) if wrap else self.views(v.children)
        actions = self.slot(v, "actions", "trailing")
        head = ""
        if title or actions:
            head = (f'<div class="mkd-section__header"><span class="mkd-section__title">{title}</span>'
                    + (f'<span class="mkd-section__actions">{actions}</span>' if actions else "") + "</div>")
        return self.open(v, "section", data={"context": wrap} if wrap else None) + head + \
            f'<div class="mkd-section__body">{body}</div>' + (
            f'<div class="mkd-section__footer">{footer}</div>' if footer else "") + "</div>"

    def r_list(self, v: View) -> str:
        header = self.text_or_slot(v, "header", "title")
        body = self._rows(v.children, "list")
        has_sections = any(c.role == "section" for c in v.children)
        return self.open(v, "list", data={"sections": "true" if has_sections else None},
                         attrs={"role": "list"}) + (
            f'<div class="mkd-list__header">{header}</div>' if header else "") + body + "</div>"

    def r_form(self, v: View) -> str:
        title = self.text_or_slot(v, "title")
        actions = self.slot(v, "actions", "footer")
        return self.open(v, "form") + (f'<div class="mkd-form__title">{title}</div>' if title else "") + \
            self._rows(v.children, "form") + (f'<div class="mkd-form__actions">{actions}</div>' if actions else "") \
            + "</div>"

    def r_listitem(self, v: View) -> str:
        title = self.text_or_slot(v, "title", "label", "text", "primary")
        content_children = v.children
        trailing_children: list[View] = []
        if title:
            trailing_children, content_children = v.children, []
        subtitle = self.text_or_slot(v, "subtitle", "description", "secondary", "secondaryText")
        overline = self.text_or_slot(v, "overline")
        detail = self.text_or_slot(v, "detail", "value", "trailingText", "info", "meta")
        leading = self.slot(v, "leading") or self.leading_visual(v)
        if _bool(v.attr("checkbox")) or v.attr("checked") is not None:
            st = "true" if _bool(v.attr("checked")) else "false"
            leading = (f'<span class="mkd-checkbox" data-el="Checkbox" data-checked="{st}"><span class="mkd-checkbox__box">'
                       f'{self.icon("checkmark") if st == "true" else ""}</span></span>') + leading
        text_parts = []
        if overline:
            text_parts.append(f'<span class="mkd-listitem__overline">{overline}</span>')
        if title:
            text_parts.append(f'<span class="mkd-listitem__title">{title}</span>')
        if subtitle:
            text_parts.append(f'<span class="mkd-listitem__subtitle">{subtitle}</span>')
        if content_children:
            text_parts.append(self.views(content_children))
        trailing = []
        if detail:
            trailing.append(f'<span class="mkd-listitem__detail">{detail}</span>')
        b = self.badge_html(v.attr("badge", "count"), "mkd-badge mkd-listitem__badge")
        if b:
            trailing.append(b)
        trailing.append(self.slot(v, "trailing", "accessory", "actions"))
        trailing.append(self.views(trailing_children))
        if _bool(v.attr("chevron", "disclosure", "navigation")):
            trailing.append(f'<span class="mkd-listitem__chevron">{self.icon("chevron.right")}</span>')
        trailing_html = "".join(trailing)
        status = v.attr("status", "highlight")
        data = {"status": _name(status)} if status else {}
        if subtitle:
            data["lines"] = "2"
        return self.open(v, "listitem", data=data, attrs={"role": "listitem"}) + (
            f'<span class="mkd-listitem__leading">{leading}</span>' if leading else "") + \
            f'<span class="mkd-listitem__text">{"".join(text_parts)}</span>' + (
            f'<span class="mkd-listitem__trailing">{trailing_html}</span>' if trailing_html else "") + "</div>"

    def r_labeled(self, v: View) -> str:
        label = self.text_or_slot(v, "label", "title", "key")
        value = self.text_or_slot(v, "value", "content", "text")
        if v.children:
            value = self.views(v.children)
        return self.open(v, "labeled") + f'<span class="mkd-labeled__label">{label}</span>' + \
            f'<span class="mkd-labeled__value">{value}</span></div>'

    def r_table(self, v: View) -> str:
        cols = v.attr("columns", "headers") or []
        headers: list[tuple[str, str]] = []
        for c in cols:
            if isinstance(c, CallValue):
                headers.append((_fmt(c.args[0] if c.args else c.kw("title", "")), _name(c.kw("alignment", ""))))
            elif isinstance(c, dict):
                headers.append((_fmt(c.get("title", c.get("label", ""))), _fmt(c.get("align", ""))))
            elif isinstance(c, ViewList):
                for cv in c.views:
                    headers.append((_fmt(cv.attr("title", "label", "content")), _name(cv.attr("alignment", ""))))
            else:
                headers.append((_fmt(c), ""))
        for c in v.children:
            if c.role == "tablecolumn":
                headers.append((_fmt(c.attr("title", "label")), _name(c.attr("alignment", ""))))
        selectable = _bool(v.attr("selectable", "checkboxSelection", "multiSelect"))
        selected = v.attr("selectedRows", "selection") or []
        selected_set = {int(x) for x in selected if isinstance(x, (int, float)) and not isinstance(x, bool)} \
            if isinstance(selected, list) else set()
        sort_col = v.attr("sortColumn")
        rows_html: list[str] = []
        rows = v.attr("rows", "data", "items") or []
        row_views = [c for c in v.children if c.role == "tablerow"]
        for i, row in enumerate(rows if isinstance(rows, list) else []):
            cells = row if isinstance(row, (list, tuple)) else ([row.get(h[0], "") for h in headers]
                                                                if isinstance(row, dict) else [row])
            tds = "".join(self._cell(cell, headers[j][1] if j < len(headers) else "") for j, cell in enumerate(cells))
            rows_html.append(self._tr(tds, i in selected_set, selectable))
        for i, rv in enumerate(row_views, start=len(rows_html)):
            tds = "".join(f'<td class="mkd-table__cell">{self.view(c)}</td>' for c in rv.children)
            rows_html.append(self._tr(tds, i in selected_set or _bool(rv.attr("selected")), selectable,
                                      rv.attr("status")))
        ths = []
        if selectable:
            all_on = rows_html and len(selected_set) == len(rows_html)
            ths.append(f'<th class="mkd-table__select"><span class="mkd-checkbox" data-checked='
                       f'"{"true" if all_on else ("mixed" if selected_set else "false")}"><span class="mkd-checkbox__box">'
                       f'{self.icon("checkmark" if all_on else "minus") if selected_set else ""}</span></span></th>')
        for j, (h, align) in enumerate(headers):
            sort = ""
            if sort_col is not None and (isinstance(sort_col, (int, float)) and int(sort_col) == j
                                         or _fmt(sort_col) == h):
                sort = f'<span class="mkd-table__sort">{self.icon("arrow.up")}</span>'
            al = f' data-align="{esc(align)}"' if align else ""
            ths.append(f'<th class="mkd-table__head"{al}>{text_html(h)}{sort}</th>')
        toolbar = self.slot(v, "toolbar", "header")
        title = self.text_or_slot(v, "title")
        if title and not toolbar:
            toolbar = f'<span class="mkd-table__title">{title}</span>'
        elif title:
            toolbar = f'<span class="mkd-table__title">{title}</span>' + toolbar
        footer = self.slot(v, "footer")
        pag = v.attr("pagination")
        if pag and not footer:
            footer = f'<span class="mkd-table__pagination">{esc("1–10 of 100" if pag is True else _fmt(pag))}' \
                     f'{self.icon("chevron.left")}{self.icon("chevron.right")}</span>'
        thead = f"<thead><tr>{''.join(ths)}</tr></thead>" if ths else ""
        return self.open(v, "table-wrap") + (f'<div class="mkd-table__toolbar">{toolbar}</div>' if toolbar else "") \
            + f'<table class="mkd-table">{thead}<tbody>{"".join(rows_html)}</tbody></table>' + (
            f'<div class="mkd-table__footer">{footer}</div>' if footer else "") + "</div>"

    def _tr(self, tds: str, selected: bool, selectable: bool, status: object = None) -> str:
        sel = ""
        if selectable:
            sel = (f'<td class="mkd-table__select"><span class="mkd-checkbox" data-checked="{"true" if selected else "false"}">'
                   f'<span class="mkd-checkbox__box">{self.icon("checkmark") if selected else ""}</span></span></td>')
        st = f' data-status="{esc(_name(status))}"' if status else ""
        return f'<tr class="mkd-table__row" aria-selected="{"true" if selected else "false"}"{st}>{sel}{tds}</tr>'

    def _cell(self, cell: object, align: str) -> str:
        al = f' data-align="{esc(align)}"' if align else ""
        if isinstance(cell, ViewList):
            return f'<td class="mkd-table__cell"{al}>{self.views(cell.views)}</td>'
        if isinstance(cell, (int, float)) and not isinstance(cell, bool) and not align:
            al = ' data-align="trailing"'
        return f'<td class="mkd-table__cell"{al}>{text_html(_fmt(cell))}</td>'

    def r_tablerow(self, v: View) -> str:
        return self.open(v, "hstack") + self.views(v.children) + "</div>"

    def r_tablecolumn(self, v: View) -> str:
        return ""

    def r_toolbar(self, v: View) -> str:
        title = self.text_or_slot(v, "title")
        return self.open(v, "toolbar", attrs={"role": "toolbar"}) + (
            f'<span class="mkd-toolbar__title">{title}</span>' if title else "") + self.views(v.children) + "</div>"

    def r_toolbaritem(self, v: View) -> str:
        return self.open(v, "group") + self.views(v.children) + "</div>"

    def r_accordion(self, v: View) -> str:
        expanded = _bool(v.attr("expanded", "isExpanded", "open"))
        title = self.text_or_slot(v, "title", "label", "header")
        subtitle = self.text_or_slot(v, "subtitle", "description")
        icon = v.attr("systemImage", "icon")
        head = (f'<div class="mkd-accordion__header">'
                + (f'<span class="mkd-accordion__icon">{self.icon(icon, v=v)}</span>' if icon else "")
                + f'<span class="mkd-accordion__titles"><span class="mkd-accordion__title">{title}</span>'
                + (f'<span class="mkd-accordion__subtitle">{subtitle}</span>' if subtitle else "") + "</span>"
                + self.slot(v, "trailing", "actions")
                + f'<span class="mkd-accordion__chevron">{self.icon("chevron.down" if expanded else "chevron.right")}'
                  f"</span></div>")
        body = f'<div class="mkd-accordion__body">{self.views(v.children)}</div>' if expanded else ""
        return self.open(v, "accordion", data={"expanded": "true" if expanded else "false"}) + head + body + "</div>"

    def r_dialog(self, v: View) -> str:
        title = self.text_or_slot(v, "title")
        message = self.text_or_slot(v, "message", "description", "subtitle")
        icon = v.attr("systemImage", "icon")
        actions = self.slot(v, "actions", "buttons", "footer")
        buttons = v.attr("buttons")
        if isinstance(buttons, list) and not actions:
            primary = _fmt(v.attr("primary") or (buttons[-1] if buttons else ""))
            destructive = {_fmt(x) for x in (v.attr("destructive") or [])} if isinstance(v.attr("destructive"), list) \
                else ({_fmt(v.attr("destructive"))} if v.attr("destructive") else set())
            btns = []
            for b in buttons:
                name = _fmt(b)
                variant = "primary" if name == primary else "secondary"
                role = ' data-role="destructive"' if name in destructive else ""
                btns.append(f'<span class="mkd-button" data-el="Button" data-variant="{variant}"{role} role="button">'
                            f'<span class="mkd-button__label">{esc(name)}</span></span>')
            actions = "".join(btns)
        closable = _bool(v.attr("closable", "closeButton", "dismissible"))
        variant = _name(v.attr("variant")) or "dialog"
        saved = self.in_menu
        self.in_menu = False
        body = self.views(v.children)
        self.in_menu = saved
        markup = (self.open(v, "dialog", attrs={"role": "dialog"})
                  + (f'<div class="mkd-dialog__icon">{self.icon(icon, v=v)}</div>' if icon else "")
                  + (f'<div class="mkd-dialog__header"><span class="mkd-dialog__title">{title}</span>'
                     + (f'<span class="mkd-dialog__close">{self.icon("xmark")}</span>' if closable else "")
                     + "</div>" if title or closable else "")
                  + (f'<div class="mkd-dialog__message">{message}</div>' if message else "")
                  + (f'<div class="mkd-dialog__body">{body}</div>' if body else "")
                  + (f'<div class="mkd-dialog__actions">{actions}</div>' if actions else "") + "</div>")
        if not _bool(v.attr("modal", "presented", "open"), True) or _bool(v.attr("inline")):
            return markup
        self.overlays.append(f'<div class="mkd-layer" data-kind="{esc(variant)}"><div class="mkd-scrim"></div>'
                             f"{markup}</div>")
        return ""

    def r_menu(self, v: View) -> str:
        label = self.slot(v, "label", "trigger") or self.content(v.attr("label", "title"))
        icon = v.attr("systemImage", "icon")
        open_ = _bool(v.attr("open", "isOpen", "expanded"))
        trigger = ""
        if label or icon:
            variant = _name(v.attr("variant")) or ""
            trigger = (f'<span class="mkd-button mkd-menu__trigger" data-el="MenuButton"'
                       + (f' data-variant="{esc(variant)}"' if variant else "")
                       + (' data-icon-only="true"' if icon and not label else "") + ' role="button">'
                       + (f'<span class="mkd-button__icon">{self.icon(icon, v=v)}</span>' if icon else "")
                       + (f'<span class="mkd-button__label">{label}</span>' if label else "")
                       + (f'<span class="mkd-button__caret">{self.icon("chevron.down")}</span>'
                          if label and _bool(v.attr("caret"), True) else "") + "</span>")
        popup = ""
        if open_ or not trigger:
            self.in_menu = True
            items = self.views(v.children)
            self.in_menu = False
            popup = f'<div class="mkd-menu__popup" role="menu">{items}</div>'
        return self.open(v, "menu", data={"open": "true" if open_ else "false",
                                          "standalone": "true" if not trigger else None}) + trigger + popup + "</div>"

    def r_menuitem(self, v: View) -> str:
        label = self.text_or_slot(v, "label", "title", "text")
        if v.children and not label:
            saved = self.in_menu
            self.in_menu = False
            label = self.views([c for c in v.children if c.role not in ("menuitem", "button")])
            self.in_menu = saved
        icon = v.attr("systemImage", "icon")
        checked = v.attr("checked", "isOn")
        sub = [c for c in v.children if c.role in ("menuitem", "button")]
        data = {}
        role = v.attr("role")
        if role:
            data["role"] = _name(role)
        if _bool(v.attr("destructive")):
            data["role"] = "destructive"
        parts = []
        if checked is not None:
            parts.append(f'<span class="mkd-menuitem__check">{self.icon("checkmark") if _bool(checked) else ""}</span>')
        parts.append(f'<span class="mkd-menuitem__icon">{self.icon(icon, v=v)}</span>' if icon else "")
        parts.append(f'<span class="mkd-menuitem__label">{label}</span>')
        shortcut = v.attr("shortcut", "keyboardShortcut", "accelerator")
        if shortcut:
            parts.append(f'<span class="mkd-menuitem__shortcut">{esc(_fmt(shortcut))}</span>')
        if sub:
            parts.append(f'<span class="mkd-menuitem__chevron">{self.icon("chevron.right")}</span>')
        return self.open(v, "menuitem", data=data, attrs={"role": "menuitem"}) + "".join(parts) + "</div>"

    def r_tooltip(self, v: View) -> str:
        text = self.text_or_slot(v, "text", "title", "content", "label")
        message = self.text_or_slot(v, "message", "subtitle")
        open_ = _bool(v.attr("open", "isOpen"), True)
        placement = _name(v.attr("placement")) or "top"
        bubble = (f'<span class="mkd-tooltip__bubble" data-placement="{esc(placement)}" role="tooltip">'
                  f'<span class="mkd-tooltip__title">{text}</span>'
                  + (f'<span class="mkd-tooltip__message">{message}</span>' if message else "")
                  + self.slot(v, "actions") + "</span>") if open_ else ""
        return self.open(v, "tooltip", "span") + self.views(v.children) + bubble + "</span>"

    def r_toast(self, v: View) -> str:
        msg = self.text_or_slot(v, "message", "text", "title")
        desc = self.text_or_slot(v, "description", "subtitle")
        action = v.attr("action", "actionLabel")
        icon = v.attr("systemImage", "icon")
        markup = (self.open(v, "toast", attrs={"role": "status"})
                  + (f'<span class="mkd-toast__icon">{self.icon(icon, v=v)}</span>' if icon else "")
                  + f'<span class="mkd-toast__text"><span class="mkd-toast__message">{msg}</span>'
                  + (f'<span class="mkd-toast__description">{desc}</span>' if desc else "")
                  + self.views(v.children) + "</span>"
                  + (f'<span class="mkd-toast__action">{esc(_fmt(action))}</span>' if isinstance(action, str) else "")
                  + self.slot(v, "actions")
                  + (f'<span class="mkd-toast__close">{self.icon("xmark")}</span>' if _bool(v.attr("closable")) else "")
                  + "</div>")
        if _bool(v.attr("inline")):
            return markup
        pos = _name(v.attr("position", "placement")) or "bottom"
        self.overlays.append(f'<div class="mkd-layer" data-kind="toast" data-position="{esc(pos)}">{markup}</div>')
        return ""

    def r_alert(self, v: View) -> str:
        sev = _name(v.attr("severity", "type", "status", "intent")) or "info"
        sev = {"information": "info", "danger": "error", "negative": "error", "critical": "error", "positive":
               "success", "critical-warning": "warning", "caution": "warning"}.get(sev, sev)
        icon = v.attr("systemImage", "icon") or {"info": "info.circle", "success": "checkmark.circle",
                                                  "warning": "exclamationmark.triangle",
                                                  "error": "exclamationmark.circle"}.get(sev, "info.circle")
        title = self.text_or_slot(v, "title")
        message = self.text_or_slot(v, "message", "text", "description", "content")
        body = self.views(v.children)
        actions = self.slot(v, "actions", "action")
        show_icon = _bool(v.attr("showIcon"), True)
        return (self.open(v, "alert", data={"severity": sev}, attrs={"role": "alert"})
                + (f'<span class="mkd-alert__icon">{self.icon(icon, v=v)}</span>' if show_icon else "")
                + '<span class="mkd-alert__content">'
                + (f'<span class="mkd-alert__title">{title}</span>' if title else "")
                + (f'<span class="mkd-alert__message">{message}</span>' if message else "") + body + "</span>"
                + (f'<span class="mkd-alert__actions">{actions}</span>' if actions else "")
                + (f'<span class="mkd-alert__close">{self.icon("xmark")}</span>'
                   if _bool(v.attr("closable", "dismissible", "isClosable")) else "")
                + "</div>")

    def r_unknown(self, v: View) -> str:
        return (f'<div class="mkd-unknown" data-el="{esc(v.name)}"><span class="mkd-unknown__name">{esc(v.name)}</span>'
                f"{self.views(v.children)}</div>")


def _parse_date(value: object) -> _dt.date | None:
    if isinstance(value, str):
        m = re.match(r"^(\d{4})-(\d{2})-(\d{2})", value)
        if m:
            try:
                return _dt.date(int(m.group(1)), int(m.group(2)), int(m.group(3)))
            except ValueError:
                return None
    return None


def _format_date(value: object, style: str) -> str:
    d = _parse_date(value)
    if d is None:
        return _fmt(value)
    rest = str(value)[10:].strip(" T")
    if style == "numeric":
        out = f"{d.month}/{d.day}/{d.year}"
    elif style == "long":
        out = f"{calendar.month_name[d.month]} {d.day}, {d.year}"
    elif style == "iso":
        out = d.isoformat()
    else:
        out = f"{calendar.month_abbr[d.month]} {d.day}, {d.year}"
    return f"{out} {rest}" if rest else out
