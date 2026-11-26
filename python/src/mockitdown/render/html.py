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
SEL = ' data-sel="true"'
HL = ' data-hl="true"'
PRESENTATIONS = ("alert", "sheet", "confirmationDialog", "fullScreenCover", "popover", "inspector")
#: The anchor of a tooltip written without content (R-DEV-008.C5).
TOOLTIP_PLACEHOLDER = ('<span class="mkd-button" data-placeholder="true" role="button">'
                       '<span class="mkd-button__label">Button</span></span>')
#: Roles a picker takes its options from (any other child counts when it has a ``.tag``).
OPTION_ROLES = ("text", "label", "button", "listitem", "menuitem", "tab", "radio")
#: SwiftUI picker styles showing one value: without ``selection:`` they show the first option (R-PACK-014.C6).
PICKER_FIRST = ("automatic", "menu", "navigationLink", "palette", "wheel")
#: SwiftUI picker styles drawing their options; without options they fall back to the menu style.
PICKER_OPTIONS = ("segmented", "palette", "inline", "radioGroup", "radio", "wheel")
#: SwiftUI date picker styles (R-PACK-014.C2): they always show a selection, 23 Nov 2026 9:41 AM by default.
DATE_STYLES = ("automatic", "compact", "graphical", "wheel", "field", "stepperField")
DEFAULT_DATE = _dt.date(2026, 11, 23)
DEFAULT_TIME = (9, 41)
WEEKDAY_ABBR = ("Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun")
#: The open 240-degree arc of an accessoryCircular gauge (centre 12,12, radius 9, gap at the bottom).
GAUGE_ARC = "M4.21 16.5A9 9 0 1 1 19.79 16.5"


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


class Renderer:
    def __init__(self, pack: Pack, diags: Diagnostics, assets: AssetResolver) -> None:
        self.pack = pack
        self.diags = diags
        self.assets = assets
        self.styles = StyleBuilder(pack.font, diags)
        self.overlays: list[str] = []
        self.row_wrap: str | None = None  # "list" | "form" while rendering rows
        self.list_selection: str | None = None  # the selection of the List being rendered
        self.in_menu = False
        self.chart_seq = 0
        #: Prefix making anchor names unique per figure on a page (set by the document assembler).
        self.anchor_prefix = "a"
        self.anchor_seq = 0

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

    DECORATIONS = ("callout", "annotation", "pointer", "cursor", "marquee", "dragSelect", "highlight", "tap")

    def _decorations(self, v: View) -> str:
        items = []
        for m in v.modifiers:
            if m.name not in self.DECORATIONS:
                continue
            align = m.kwargs.get("alignment", m.kwargs.get("at"))
            a = align.name if isinstance(align, EnumValue) else ""
            c = css_color(m.kwargs.get("color"))
            cstyle = f' style="--mkd-callout:{esc(c)}"' if c else ""
            if m.name in ("callout", "annotation"):
                n = _fmt(m.arg(0, ""))
                label = m.arg(1) if len(m.args) > 1 else m.kwargs.get("text", m.kwargs.get("label"))
                inset = ' data-inset="true"' if _bool(m.kwargs.get("inset")) else ""
                side = _name(m.kwargs.get("labelSide"))
                side_attr = f' data-side="{esc(side)}"' if side in ("leading", "trailing") else ""
                items.append(f'<span class="mkd-deco__callout" data-align="{esc(a or "topLeading")}"{inset}{side_attr}{cstyle}>'
                             f'<span class="mkd-callout__badge">{esc(n)}</span>'
                             + (f'<span class="mkd-callout__text">{text_html(_fmt(label))}</span>' if label else "")
                             + "</span>")
            elif m.name in ("pointer", "cursor"):
                kind = _name(m.arg(0)) or _name(m.kwargs.get("kind")) or "arrow"
                items.append(f'<span class="mkd-deco__pointer" data-align="{esc(a or "center")}">'
                             f'<span class="mkd-pointer" data-kind="{esc(kind)}">{_cursor_svg(kind)}</span></span>')
            elif m.name in ("marquee", "dragSelect"):
                c2 = css_color(m.arg()) or c
                st = f' style="--mkd-marquee:{esc(c2)}"' if c2 else ""
                items.append(f'<span class="mkd-deco__marquee"{st}></span>')
            elif m.name == "highlight":
                c2 = css_color(m.arg()) or c
                st = f' style="--mkd-highlight:{esc(c2)}"' if c2 else ""
                items.append(f'<span class="mkd-deco__highlight"{st}></span>')
            elif m.name == "tap":
                items.append(f'<span class="mkd-deco__tap" data-align="{esc(a or "center")}"></span>')
        return "".join(items)

    def _wrap_overlays(self, v: View, out: str) -> str:
        deco = self._decorations(v)
        if deco and out:
            self.anchor_seq += 1
            name = f"--mkd-{self.anchor_prefix}-{self.anchor_seq}"
            # Marks are drawn twice: in a screen-level layer tied to the element by CSS anchor positioning
            # (unclipped; used where supported) and inside the element itself (fallback).
            self.overlays.append(f'<div class="mkd-anchored" style="position-anchor:{name}">{deco}</div>')
            layer = f'<div class="mkd-deco__layer">{deco}</div>'
            out = _decorate(out, name, layer)
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
        from . import charts

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
                if c.role in OPTION_ROLES or c.attr("tag") is not None:
                    lab = _fmt(c.attr("content", "title", "label", "text"))
                    saved = self.in_menu
                    self.in_menu = False
                    markup = text_html(lab) if c.role in OPTION_ROLES and c.role != "label" else self.view(c)
                    self.in_menu = saved
                    out.append((lab, markup))
        return out

    def _option_tags(self, v: View) -> list[str | None]:
        """The ``.tag`` of each option taken from the children (parallel to `_options`)."""
        if isinstance(v.attr("options", "items", "choices", "segments"), (list, tuple)):
            return []
        return [None if c.attr("tag") is None else _fmt(c.attr("tag"))
                for c in v.children if c.role in OPTION_ROLES or c.attr("tag") is not None]

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
        if sel is not None and name in (tags := self._option_tags(v)):
            return tags.index(name)
        return -1 if sel is not None else 0

    def r_segmented(self, v: View) -> str:
        options = self._options(v)
        sel = self._selected_index(v, options)
        chosen = {i for i, c in enumerate(c for c in v.children if c.role in OPTION_ROLES or c.attr("tag") is not None)
                  if _bool(c.attr("selected"))}
        if chosen and v.attr("selection", "selected", "value") is None:
            sel = -1
        label = self.content(v.attr("label", "title"))
        items = "".join(
            f'<span class="mkd-segmented__item" role="tab" aria-selected="{"true" if i == sel or i in chosen else "false"}">'
            f"{markup}</span>" for i, (_, markup) in enumerate(options))
        return self.open(v, "segmented", attrs={"role": "tablist"}) + (
            f'<span class="mkd-segmented__label">{label}</span>' if label and not v.has_mod("labelsHidden") else "") \
            + f'<span class="mkd-segmented__items">{items}</span></div>'

    def _field(self, v: View, role: str, value_html: str, *, placeholder: bool, kind: str = "",
               end_icon: str = "", popup: str = "", control_extra: str = "",
               style: dict | None = None, attrs: dict | None = None) -> str:
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
        return self.open(v, role, cls="mkd-field", data=data, style=style, attrs=attrs) + "".join(parts) + popup + "</div>"

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
        # A filled field still has a title: its placeholder names it (a Form's columns style shows it).
        named = not is_ph and isinstance(placeholder_text, str) and placeholder_text \
            and not self.has(v, "label", "title", "header")
        return self._field(v, "textfield", inner, placeholder=is_ph, kind=kind, end_icon=end, style=style,
                           attrs={"aria-label": placeholder_text} if named else None)

    def r_select(self, v: View) -> str:
        variant = _name(v.attr("variant"))
        options = self._options(v)
        if variant in PICKER_OPTIONS and not options and not v.children:
            pass  # nothing to draw the options of: the label and an empty value (R-PACK-014.C6)
        elif variant in ("segmented", "palette"):
            return self.r_segmented(v)
        elif variant in ("radioGroup", "inline", "radio"):
            return self.r_radiogroup(v)
        elif variant == "wheel":
            sel = self._selected_index(v, options)
            return self.open(v, "wheel", attrs={"role": "listbox"}) + self._wheel([([m for _, m in options], sel)]) \
                + "</div>"
        sel = self._selected_index(v, options)
        value = v.attr("selection", "value", "selected")
        tags = self._option_tags(v)
        if isinstance(value, (int, float)) and not isinstance(value, bool) and 0 <= int(value) < len(options):
            shown = options[int(value)][1]
        elif isinstance(value, str) and value and value in tags:
            shown = options[tags.index(value)][1]
        elif isinstance(value, str) and value:
            shown = text_html(value)
        elif isinstance(value, list):
            shown = "".join(f'<span class="mkd-chip" data-el="Chip" data-size="small"><span class="mkd-chip__label">'
                            f"{esc(_fmt(x))}</span></span>" for x in value)
        elif value is None and options and variant in PICKER_FIRST:
            shown = options[0][1]
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
        menu_like = variant in ("menu", "automatic") or (variant in PICKER_OPTIONS and not options)
        chevron = "chevron.up.down" if menu_like and self.pack.id == "swiftui" else "chevron.down"
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

    def _wheel(self, columns: list[tuple[list[str], int]]) -> str:
        """Wheel columns (markup items, selected index), two neighbours each side, under a selection band."""
        out = ['<span class="mkd-wheel__band"></span>']
        for items, sel in columns:
            cells = "".join(
                f'<span class="mkd-wheel__item" data-offset="{i - sel}"'
                + (' aria-selected="true"' if i == sel else "") + f">{item}</span>"
                for i, item in enumerate(items) if abs(i - sel) <= 2)
            out.append(f'<span class="mkd-wheel__column">{cells}</span>')
        return "".join(out)

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
        label = self.text_or_slot(v, "label", "title") or self.views(v.children)
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
        if variant in DATE_STYLES:
            return self._date_style(v, variant)
        value = v.attr("selection", "date", "value", "text")
        shown = _format_date(value, _name(v.attr("format")) or "medium") if value else ""
        kind = _name(v.attr("kind")) or "date"
        end = {"time": "clock", "datetime": "calendar"}.get(kind, "calendar")
        return self._field(v, "datepicker", text_html(shown) if shown else self.content(v.attr("placeholder")),
                           placeholder=not shown, kind=kind, end_icon=end)

    def _date_style(self, v: View, variant: str) -> str:
        """A SwiftUI date picker style (R-PACK-014.C2); without a selection, 23 Nov 2026 9:41 AM."""
        value = v.attr("selection", "date", "value", "text")
        d = _parse_date(value) or DEFAULT_DATE
        hh, mm = _parse_time(value) or DEFAULT_TIME
        if variant == "graphical":
            return self._calendar(v, d.isoformat())
        comps = v.attr("displayedComponents", "components")
        names = [_name(c) for c in comps] if isinstance(comps, (list, tuple)) else [_name(comps)] if comps else []
        show_date = not names or "date" in names or "hourAndMinute" not in names
        show_time = not names or "hourAndMinute" in names
        h12, ampm = (hh % 12 or 12), ("AM" if hh < 12 else "PM")
        time = f"{h12}:{mm:02d} {ampm}"
        if variant == "wheel":
            cols: list[tuple[list[str], int]] = []
            if show_date and show_time:
                days = [d + _dt.timedelta(days=k) for k in range(-2, 3)]
                cols.append(([f"{WEEKDAY_ABBR[x.weekday()]} {calendar.month_abbr[x.month]} {x.day}" for x in days], 2))
            elif show_date:
                last = calendar.monthrange(d.year, d.month)[1]
                cols.append(([calendar.month_name[(d.month - 1 + k) % 12 + 1] for k in range(-2, 3)], 2))
                cols.append(([str((d.day - 1 + k) % last + 1) for k in range(-2, 3)], 2))
                cols.append(([str(d.year + k) for k in range(-2, 3)], 2))
            if show_time:
                cols.append(([str((h12 - 1 + k) % 12 + 1) for k in range(-2, 3)], 2))
                cols.append(([f"{(mm + k) % 60:02d}" for k in range(-2, 3)], 2))
                cols.append((["AM", "PM"], 0 if ampm == "AM" else 1))
            return self.open(v, "wheel", attrs={"role": "group"}) + self._wheel(cols) + "</div>"
        if variant in ("field", "stepperField"):
            text = f"{d.month}/{d.day}/{d.year}" if show_date else ""
            text = ", ".join(t for t in (text, time if show_time else "") if t)
            stepper = (f'<span class="mkd-datepicker__stepper">{self.icon("chevron.up")}{self.icon("chevron.down")}'
                       "</span>") if variant == "stepperField" else ""
            return self._field(v, "datepicker", text_html(text), placeholder=False, kind="field", control_extra=stepper)
        inner = (f'<span class="mkd-datepicker__date">{esc(_format_date(d.isoformat(), "medium"))}</span>'
                 if show_date else "") \
            + (f'<span class="mkd-datepicker__time">{esc(time)}</span>' if show_time else "")
        return self._field(v, "datepicker", inner, placeholder=False, kind="compact")

    def r_calendar(self, v: View) -> str:
        return self._calendar(v, v.attr("selection", "date", "value"))

    def _calendar(self, v: View, sel: object) -> str:
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
                if c.role in ("navitem", "listitem") and _fmt(c.attr("label", "title", "text")) == _fmt(sel):
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
        title = self.text_or_slot(v, "title", "label")
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
            if header:
                parts.append(f'<div class="mkd-card__band">{header}</div>')
            if visual or title or subtitle or status or head_actions:
                parts.append('<div class="mkd-card__header">' + visual + (
                f'<div class="mkd-card__titles"><span class="mkd-card__title">{title}</span>'
                + (f'<span class="mkd-card__subtitle">{subtitle}</span>' if subtitle else "") + "</div>"
                if title or subtitle else "")
                + (f'<span class="mkd-card__status">{status}</span>' if status else "")
                    + (f'<div class="mkd-card__header-actions">{head_actions}</div>' if head_actions else "")
                    + "</div>")
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
                sel = ' data-selected="true"' if wrap == "list" and self.list_selection is not None and \
                    _fmt(c.attr("tag", "content", "title", "label", "text")) == self.list_selection else ""
                out.append(f'<div class="{cls}" data-child="{esc(c.role)}"{sel}>{inner}</div>' if inner else "")
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
        saved = self.list_selection
        sel = v.attr("selection")
        self.list_selection = _fmt(sel) if isinstance(sel, (str, int)) and not isinstance(sel, bool) else None
        body = self._rows(v.children, "list")
        self.list_selection = saved
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
        def flat(views):  # TableHead { … } / TableBody { … } wrappers (role group) are transparent
            for c in views:
                yield from (flat(c.children) if c.role == "group" else (c,))
        kids = list(flat(v.children))
        for c in kids:
            if c.role == "tablecolumn":
                headers.append((_fmt(c.attr("title", "label")), _name(c.attr("alignment", ""))))
        selectable = _bool(v.attr("selectable", "checkboxSelection", "multiSelect"))
        selected = v.attr("selectedRows", "selection") or []
        selected_set = {int(x) for x in selected if isinstance(x, (int, float)) and not isinstance(x, bool)} \
            if isinstance(selected, list) else set()
        sort_col = v.attr("sortColumn")
        rows_html: list[str] = []
        rows = v.attr("rows", "data", "items") or []
        row_views = [c for c in kids if c.role == "tablerow"]
        for i, row in enumerate(rows if isinstance(rows, list) else []):
            cells = row if isinstance(row, (list, tuple)) else ([row.get(h[0], "") for h in headers]
                                                                if isinstance(row, dict) else [row])
            tds = "".join(self._cell(cell, headers[j][1] if j < len(headers) else "") for j, cell in enumerate(cells))
            rows_html.append(self._tr(tds, i in selected_set, selectable))
        for i, rv in enumerate(row_views, start=len(rows_html)):
            tds = "".join(
                f'<td class="mkd-table__cell"'
                + (f' data-align="{esc(headers[j][1])}"' if j < len(headers) and headers[j][1] else "")
                + f">{self.view(c)}</td>" for j, c in enumerate(rv.children))
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
        if _name(v.attr("variant")) in ("compactMenu", "menu"):  # one button standing for a menu (R-PACK-014.C1)
            title = self.text_or_slot(v, "title", "label")
            icon = v.attr("systemImage", "icon")
            inner = (f'<span class="mkd-toolbar__menu-icon">{self.icon(icon, v=v)}</span>' if icon else "") + (
                f'<span class="mkd-toolbar__menu-label">{title}</span>' if title else "")
            if not inner:
                inner = f'<span class="mkd-toolbar__menu-icon">{self.icon("ellipsis")}</span>'
            if _name(v.attr("variant")) == "menu":
                inner += f'<span class="mkd-toolbar__menu-chevron">{self.icon("chevron.down")}</span>'
            return self.open(v, "toolbar", attrs={"role": "toolbar"}) + \
                f'<span class="mkd-toolbar__menu" role="button" aria-haspopup="menu">{inner}</span></div>'
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
        actions = "".join(self.slot(v, n) for n in ("dismissButton", "actions", "buttons", "footer", "confirmButton"))
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
        mark = len(self.overlays)
        body = self.views(v.children)
        self.in_menu = saved
        inner_layers = self.overlays[mark:]
        del self.overlays[mark:]
        markup = (self.open(v, "dialog", attrs={"role": "dialog"})
                  + (f'<div class="mkd-dialog__icon">{self.icon(icon, v=v)}</div>' if icon else "")
                  + (f'<div class="mkd-dialog__header"><span class="mkd-dialog__title">{title}</span>'
                     + (f'<span class="mkd-dialog__close">{self.icon("xmark")}</span>' if closable else "")
                     + "</div>" if title or closable else "")
                  + (f'<div class="mkd-dialog__message">{message}</div>' if message else "")
                  + (f'<div class="mkd-dialog__body">{body}</div>' if body else "")
                  + (f'<div class="mkd-dialog__actions">{actions}</div>' if actions else "") + "</div>")
        if not _bool(v.attr("modal", "presented", "open"), True) or _bool(v.attr("inline")):
            self.overlays.extend(inner_layers)
            return markup
        self.overlays.append(f'<div class="mkd-layer" data-kind="{esc(variant)}"><div class="mkd-scrim"></div>'
                             f"{markup}</div>")
        self.overlays.extend(inner_layers)  # anchored marks after the dialog they point into
        return ""

    def r_menu(self, v: View) -> str:
        label = self.slot(v, "label", "trigger") or self.content(v.attr("label", "title"))
        icon = v.attr("systemImage", "icon")
        open_ = _bool(v.attr("open", "isOpen", "expanded"))
        trigger = ""
        if label or icon:
            variant = _name(v.attr("variant")) or ""
            size = _name(v.attr("size")) or ""
            trigger = (f'<span class="mkd-button mkd-menu__trigger" data-el="MenuButton"'
                       + (f' data-variant="{esc(variant)}"' if variant else "")
                       + (f' data-size="{esc(size)}"' if size else "")
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
                  '<span class="mkd-tooltip__arrow"></span>'
                  f'<span class="mkd-tooltip__title">{text}</span>'
                  + (f'<span class="mkd-tooltip__message">{message}</span>' if message else "")
                  + self.slot(v, "actions") + "</span>") if open_ else ""
        # The anchor: the content, or a placeholder button when there is none (R-DEV-008.C5).
        anchor = self.views(v.children) or TOOLTIP_PLACEHOLDER
        return (self.open(v, "tooltip", "span") + f'<span class="mkd-tooltip__anchor">{anchor}</span>'
                + bubble + "</span>")

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
        sev = (_name(v.attr("severity", "type", "status", "intent")) or "info").lower()
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

    # --- non-standard components -------------------------------------------------------------------

    def r_spreadsheet(self, v: View) -> str:
        rows = [r if isinstance(r, (list, tuple)) else [r] for r in (v.attr("rows", "data", "cells") or [])]
        ncols = int(_num(v.attr("columnCount"), 0) or 0) or max((len(r) for r in rows), default=5)
        cols = v.attr("columns", "headers")
        letters = [_col_name(i) for i in range(ncols)]
        start_row = int(_num(v.attr("startRow", "firstRow"), 1) or 1)
        min_rows = int(_num(v.attr("rowCount", "minRows"), 0) or 0)
        while len(rows) < min_rows:
            rows.append([])
        sel = _parse_range(_fmt(v.attr("selection", "range") or ""))
        active = _parse_range(_fmt(v.attr("active", "activeCell") or "")) or (sel[:2] + sel[:2] if sel else None)
        highlights = v.attr("highlight", "fills") or {}
        widths = v.attr("columnWidths", "widths") or []
        header_row = _bool(v.attr("headerRow"))
        parts = []
        formula = v.attr("formula", "formulaBar")
        if formula is not None or _bool(v.attr("showFormulaBar")):
            ref = _fmt(v.attr("active", "activeCell") or (v.attr("selection") or "A1")).split(":")[0]
            parts.append(f'<div class="mkd-spreadsheet__formula"><span class="mkd-spreadsheet__ref">{esc(ref)}</span>'
                         f'<span class="mkd-spreadsheet__fx">fx</span><span class="mkd-spreadsheet__expr">'
                         f'{esc(_fmt(formula or ""))}</span></div>')
        colgroup = '<col class="mkd-spreadsheet__rowhead-col">' + "".join(
            f'<col style="width:{u(_num(widths[i]))}">' if i < len(widths) and u(_num(widths[i])) else "<col>"
            for i in range(ncols))
        head = '<th class="mkd-spreadsheet__corner"></th>' + "".join(
            f'<th class="mkd-spreadsheet__colhead"{SEL if sel and sel[0] <= i <= sel[2] else ""}>'
            f"{esc(letters[i])}</th>" for i in range(ncols))
        body = []
        if isinstance(cols, list) and cols:
            rows = [[_fmt(c) for c in cols]] + rows
            header_row = True
        for ri, row in enumerate(rows):
            rnum = start_row + ri
            in_rows = sel and sel[1] <= rnum <= sel[3]
            cells = [f'<th class="mkd-spreadsheet__rowhead"{SEL if in_rows else ""}>{rnum}</th>']
            for ci in range(ncols):
                val = row[ci] if ci < len(row) else ""
                attrs = []
                if sel and sel[0] <= ci <= sel[2] and sel[1] <= rnum <= sel[3]:
                    attrs.append('data-in-sel="true"')
                    edges = [e for e, c in (("t", rnum == sel[1]), ("b", rnum == sel[3]), ("l", ci == sel[0]),
                                            ("r", ci == sel[2])) if c]
                    if edges:
                        attrs.append(f'data-edge="{"".join(edges)}"')
                if active and active[0] == ci and active[1] == rnum:
                    attrs.append('data-active="true"')
                fill = highlights.get(f"{letters[ci]}{rnum}") if isinstance(highlights, dict) else None
                if fill is not None and css_color(fill):
                    attrs.append(f'style="background:color-mix(in srgb, {esc(css_color(fill))} 28%, transparent)"')
                if isinstance(val, (int, float)) and not isinstance(val, bool):
                    attrs.append('data-num="true"')
                if header_row and ri == 0:
                    attrs.append('data-header="true"')
                content = self.views(val.views) if isinstance(val, ViewList) else text_html(_fmt(val))
                cells.append(f'<td class="mkd-spreadsheet__cell" {" ".join(attrs)}>{content}</td>')
            body.append("<tr>" + "".join(cells) + "</tr>")
        parts.append(f'<div class="mkd-spreadsheet__grid"><table class="mkd-spreadsheet__table"><colgroup>{colgroup}'
                     f'</colgroup><thead><tr>{head}</tr></thead><tbody>{"".join(body)}</tbody></table></div>')
        sheets = v.attr("sheets")
        if isinstance(sheets, list) and sheets:
            cur = _fmt(v.attr("sheet", "selectedSheet") or sheets[0])
            parts.append('<div class="mkd-spreadsheet__sheets"><span class="mkd-spreadsheet__add">'
                         + self.icon("plus") + "</span>" + "".join(
                             f'<span class="mkd-spreadsheet__sheet" aria-selected="{"true" if _fmt(s) == cur else "false"}">'
                             f"{esc(_fmt(s))}</span>" for s in sheets) + "</div>")
        return self.open(v, "spreadsheet") + "".join(parts) + "</div>"

    def r_stickynote(self, v: View) -> str:
        c = css_color(v.attr("color", "fill") or EnumValue("yellow")) or "var(--mkd-color-yellow)"
        rot = _num(v.attr("rotation", "angle"), 0) or 0
        style = {"--mkd-note": c}
        if rot:
            style["transform"] = f"rotate({rot:g}deg)"
        title = self.text_or_slot(v, "title")
        text = self.text_or_slot(v, "text", "content")
        footer = self.text_or_slot(v, "author", "footer", "date")
        return (self.open(v, "stickynote", style=style)
                + (f'<div class="mkd-stickynote__title">{title}</div>' if title else "")
                + (f'<div class="mkd-stickynote__text">{text}</div>' if text else "") + self.views(v.children)
                + (f'<div class="mkd-stickynote__footer">{footer}</div>' if footer else "") + "</div>")

    def r_board(self, v: View) -> str:
        return self.open(v, "board") + self.views(v.children) + "</div>"

    def r_boardcolumn(self, v: View) -> str:
        title = self.text_or_slot(v, "title", "label")
        count = v.attr("count")
        if count is None:
            count = len(v.children)
        dot = css_color(v.attr("color"))
        head = (f'<div class="mkd-boardcolumn__header">'
                + (f'<span class="mkd-boardcolumn__dot" style="background:{esc(dot)}"></span>' if dot else "")
                + f'<span class="mkd-boardcolumn__title">{title}</span><span class="mkd-boardcolumn__count">'
                f'{esc(_fmt(count))}</span><span class="mkd-boardcolumn__more">{self.icon("ellipsis")}</span></div>')
        add = f'<div class="mkd-boardcolumn__add">{self.icon("plus")} Add card</div>' if _bool(v.attr("addButton"), True) else ""
        return self.open(v, "boardcolumn") + head + f'<div class="mkd-boardcolumn__cards">{self.views(v.children)}' \
            f"</div>{add}</div>"

    def r_kanbancard(self, v: View) -> str:
        title = self.text_or_slot(v, "title")
        desc = self.text_or_slot(v, "description", "subtitle")
        tags = v.attr("tags", "labels") or []
        tag_html = "".join(f'<span class="mkd-kanbancard__tag" data-hue="{sum(map(ord, _fmt(t))) % 8 + 1}">'
                           f"{esc(_fmt(t))}</span>" for t in tags)
        meta = []
        if v.attr("due"):
            meta.append(f'<span class="mkd-kanbancard__meta">{self.icon("clock")}{esc(_fmt(v.attr("due")))}</span>')
        if v.attr("comments"):
            meta.append(f'<span class="mkd-kanbancard__meta">{self.icon("message")}{esc(_fmt(v.attr("comments")))}</span>')
        if v.attr("attachments"):
            meta.append(f'<span class="mkd-kanbancard__meta">{self.icon("paperclip")}{esc(_fmt(v.attr("attachments")))}</span>')
        assignees = v.attr("assignees", "assignee") or []
        if isinstance(assignees, str):
            assignees = [assignees]
        avs = "".join(self.avatar_html(_fmt(a), None, v, "small", " mkd-kanbancard__avatar") for a in assignees)
        img = v.attr("image", "cover")
        cover = ""
        if isinstance(img, str) and img:
            src = self.assets.resolve(img, v.loc)
            cover = f'<img class="mkd-kanbancard__cover" src="{esc(src)}" alt="">' if src else ""
        prio = v.attr("priority")
        return (self.open(v, "kanbancard", data={"priority": _name(prio)} if prio else None) + cover
                + (f'<div class="mkd-kanbancard__tags">{tag_html}</div>' if tag_html else "")
                + f'<div class="mkd-kanbancard__title">{title}</div>'
                + (f'<div class="mkd-kanbancard__desc">{desc}</div>' if desc else "") + self.views(v.children)
                + (f'<div class="mkd-kanbancard__footer"><span class="mkd-kanbancard__metas">{"".join(meta)}</span>'
                   f'<span class="mkd-kanbancard__avatars">{avs}</span></div>' if meta or avs else "") + "</div>")

    def r_code(self, v: View) -> str:
        code = _fmt(v.attr("code", "text", "content", "source") or "")
        lang = (_name(v.attr("language", "lang")) or "").lower()
        terminal = _name(v.attr("variant")) == "terminal" or v.role == "terminal"
        numbers = _bool(v.attr("lineNumbers", "showLineNumbers"), not terminal)
        hl = {int(x) for x in (v.attr("highlight", "highlightLines") or []) if isinstance(x, int)}
        start = int(_num(v.attr("startLine"), 1) or 1)
        lines = code.split("\n") if code else [""]
        out = []
        for i, line in enumerate(lines):
            n = start + i
            body = _highlight(line, lang) if not terminal else _terminal_line(line)
            out.append(f'<div class="mkd-code__line"{HL if n in hl else ""}>'
                       + (f'<span class="mkd-code__num">{n}</span>' if numbers else "")
                       + f'<span class="mkd-code__text">{body or "&#8203;"}</span></div>')
        tabs = v.attr("tabs", "files")
        title = self.text_or_slot(v, "title", "filename")
        head = ""
        if terminal:
            head = ('<div class="mkd-code__bar"><span class="mkd-chrome__lights"><i data-light="close"></i><i '
                    'data-light="min"></i><i data-light="max"></i></span>'
                    f'<span class="mkd-code__title">{title or "Terminal"}</span></div>')
        elif isinstance(tabs, list) and tabs:
            cur = _fmt(v.attr("selectedTab") or tabs[0])
            head = '<div class="mkd-code__tabs">' + "".join(
                f'<span class="mkd-code__tab" aria-selected="{"true" if _fmt(t) == cur else "false"}">{esc(_fmt(t))}</span>'
                for t in tabs) + "</div>"
        elif title:
            head = f'<div class="mkd-code__bar"><span class="mkd-code__title">{title}</span></div>'
        return self.open(v, "code", data={"kind": "terminal" if terminal else "editor", "lang": lang or None}) + head \
            + f'<div class="mkd-code__body">{"".join(out)}</div></div>'

    def r_message(self, v: View) -> str:
        sender = _name(v.attr("from", "sender", "direction")) or "them"
        mine = sender in ("me", "outgoing", "self", "sent", "user")
        text = self.text_or_slot(v, "text", "content", "message")
        author = self.text_or_slot(v, "author", "name")
        time = self.text_or_slot(v, "time", "timestamp")
        status = v.attr("status")
        img = v.attr("image")
        media = ""
        if isinstance(img, str) and img:
            src = self.assets.resolve(img, v.loc)
            media = f'<img class="mkd-message__image" src="{esc(src)}" alt="">' if src else ""
        av = ""
        if not mine and (v.attr("avatar") or author):
            av = self.avatar_html(_fmt(v.attr("avatar") or re.sub(r"<[^>]+>", "", author)), v.attr("avatarImage"), v,
                                  "small", " mkd-message__avatar")
        reactions = v.attr("reactions") or []
        react = "".join(f'<span class="mkd-message__reaction">{esc(_fmt(r))}</span>' for r in reactions)
        return (self.open(v, "message", data={"from": "me" if mine else "them",
                                              "kind": _name(v.attr("variant", "kind")) or None}) + av
                + '<div class="mkd-message__stack">'
                + (f'<span class="mkd-message__author">{author}</span>' if author and not mine else "")
                + f'<div class="mkd-message__bubble">{media}{text}{self.views(v.children)}</div>'
                + (f'<div class="mkd-message__reactions">{react}</div>' if react else "")
                + (f'<span class="mkd-message__time">{time}'
                   + (f' · {esc(_fmt(status))}' if status else "") + "</span>" if time or status else "")
                + "</div></div>")

    def r_tree(self, v: View) -> str:
        return self.open(v, "tree", attrs={"role": "tree"}) + self.views(v.children) + "</div>"

    def r_treeitem(self, v: View) -> str:
        label = self.text_or_slot(v, "label", "title", "text")
        kids = [c for c in v.children if c.role == "treeitem"]
        others = [c for c in v.children if c.role != "treeitem"]
        expanded = _bool(v.attr("expanded", "isExpanded"), bool(kids))
        icon = v.attr("systemImage", "icon")
        if not icon and _bool(v.attr("folder")):
            icon = "folder"
        chevron = (f'<span class="mkd-treeitem__chevron">{self.icon("chevron.down" if expanded else "chevron.right")}'
                   "</span>") if kids or _bool(v.attr("hasChildren")) else '<span class="mkd-treeitem__chevron"></span>'
        detail = self.text_or_slot(v, "detail", "badge")
        row = (f'<div class="mkd-treeitem__row">{chevron}'
               + (f'<span class="mkd-treeitem__icon">{self.icon(icon, v=v)}</span>' if icon else "")
               + f'<span class="mkd-treeitem__label">{label}</span>{self.views(others)}'
               + (f'<span class="mkd-treeitem__detail">{detail}</span>' if detail else "") + "</div>")
        children = f'<div class="mkd-treeitem__children" role="group">{self.views(kids)}</div>' if kids and expanded else ""
        return self.open(v, "treeitem", data={"expanded": "true" if expanded else "false"} if kids else None,
                         attrs={"role": "treeitem"}) + row + children + "</div>"

    def r_timeline(self, v: View) -> str:
        return self.open(v, "timeline", data={"orientation": _name(v.attr("orientation")) or "vertical"}) \
            + self.views(v.children) + "</div>"

    def r_timelineitem(self, v: View) -> str:
        title = self.text_or_slot(v, "title", "label")
        desc = self.text_or_slot(v, "description", "subtitle", "text")
        time = self.text_or_slot(v, "time", "date", "timestamp")
        icon = v.attr("systemImage", "icon")
        status = _name(v.attr("status", "color", "severity")) or ""
        dot = f'<span class="mkd-timelineitem__dot">{self.icon(icon, v=v) if icon else ""}</span>'
        return (self.open(v, "timelineitem", data={"status": status or None, "icon": "true" if icon else None})
                + f'<div class="mkd-timelineitem__rail">{dot}<span class="mkd-timelineitem__line"></span></div>'
                + '<div class="mkd-timelineitem__content">'
                + (f'<div class="mkd-timelineitem__time">{time}</div>' if time else "")
                + f'<div class="mkd-timelineitem__title">{title}</div>'
                + (f'<div class="mkd-timelineitem__desc">{desc}</div>' if desc else "")
                + self.views(v.children) + "</div></div>")

    def r_gantt(self, v: View) -> str:
        scale = [_fmt(x) for x in (v.attr("scale", "columns", "periods") or [])]
        tasks = v.attr("tasks", "rows") or []
        n = len(scale) or max((int(_num(t[1], 0) + _num(t[2], 1)) for t in tasks if isinstance(t, (list, tuple))
                               and len(t) >= 3), default=6)
        if not scale:
            scale = [str(i + 1) for i in range(n)]
        today = _num(v.attr("today", "now"), None)
        rows = []
        for i, t in enumerate(tasks):
            if isinstance(t, dict):
                name, start, length = t.get("name", ""), t.get("start", 0), t.get("length", t.get("duration", 1))
                prog, grp = t.get("progress"), t.get("milestone")
            elif isinstance(t, (list, tuple)) and len(t) >= 3:
                name, start, length = t[0], t[1], t[2]
                prog = t[3] if len(t) > 3 else None
                grp = False
            else:
                continue
            left = (_num(start, 0) or 0) / n * 100
            width = (_num(length, 1) or 0) / n * 100
            milestone = (_num(length, 1) or 0) == 0 or _bool(grp)
            bar = (f'<span class="mkd-gantt__milestone" style="left:{left:.2f}%"></span>' if milestone else
                   f'<span class="mkd-gantt__bar" style="left:{left:.2f}%;width:{width:.2f}%;--mkd-bar:var(--mkd-chart-'
                   f'{i % 6 + 1})">' + (f'<span class="mkd-gantt__progress" style="width:{max(0, min(100, _num(prog, 0) * (100 if _num(prog, 0) <= 1 else 1))):.0f}%"></span>'
                                        if prog is not None else "") + "</span>")
            rows.append(f'<div class="mkd-gantt__row"><span class="mkd-gantt__name">{esc(_fmt(name))}</span>'
                        f'<span class="mkd-gantt__track">{bar}</span></div>')
        head = "".join(f"<span>{esc(s)}</span>" for s in scale)
        now = f'<span class="mkd-gantt__today" style="left:{today / n * 100:.2f}%"></span>' if today is not None else ""
        return (self.open(v, "gantt", style={"--mkd-gantt-cols": str(n)})
                + f'<div class="mkd-gantt__head"><span class="mkd-gantt__name"></span><span class="mkd-gantt__scale">'
                  f"{head}</span></div>"
                + f'<div class="mkd-gantt__body"><div class="mkd-gantt__grid"><span class="mkd-gantt__name"></span>'
                  f'<span class="mkd-gantt__lines">{"<i></i>" * n}{now}</span></div>{"".join(rows)}</div></div>')

    def r_schedule(self, v: View) -> str:
        days = [_fmt(d) for d in (v.attr("days", "columns") or ["Mon", "Tue", "Wed", "Thu", "Fri"])]
        h0 = int(_num(v.attr("startHour"), 8) or 8)
        h1 = int(_num(v.attr("endHour"), 18) or 18)
        span = max(h1 - h0, 1)
        events = v.attr("events") or []
        cols = []
        for di, d in enumerate(days):
            evs = []
            for i, e in enumerate(events):
                if isinstance(e, dict):
                    title, day, s, en, col = e.get("title", ""), e.get("day"), e.get("start"), e.get("end"), e.get("color")
                elif isinstance(e, (list, tuple)) and len(e) >= 4:
                    title, day, s, en = e[0], e[1], e[2], e[3]
                    col = e[4] if len(e) > 4 else None
                else:
                    continue
                if _fmt(day) != d and day != di:
                    continue
                top = ((_num(s, h0) or h0) - h0) / span * 100
                hgt = ((_num(en, h0 + 1) or h0 + 1) - (_num(s, h0) or h0)) / span * 100
                c = css_color(col) or f"var(--mkd-chart-{i % 6 + 1})"
                evs.append(f'<span class="mkd-schedule__event" style="top:{top:.2f}%;height:{hgt:.2f}%;--mkd-ev:{esc(c)}">'
                           f'<span class="mkd-schedule__event-title">{esc(_fmt(title))}</span>'
                           f'<span class="mkd-schedule__event-time">{_hour(s)}–{_hour(en)}</span></span>')
            sel = ' aria-selected="true"' if _fmt(v.attr("today") or "") == d else ""
            cols.append(f'<div class="mkd-schedule__day"{sel}><div class="mkd-schedule__dayhead">{esc(d)}</div>'
                        f'<div class="mkd-schedule__slots">{"<i></i>" * span}{"".join(evs)}</div></div>')
        hours = "".join(f"<span>{_hour(h)}</span>" for h in range(h0, h1))
        now = _num(v.attr("now"), None)
        now_html = (f'<span class="mkd-schedule__now" style="top:{(now - h0) / span * 100:.2f}%"></span>'
                    if now is not None else "")
        return (self.open(v, "schedule", style={"--mkd-hours": str(span)})
                + f'<div class="mkd-schedule__hours"><div class="mkd-schedule__dayhead"></div>'
                  f'<div class="mkd-schedule__hourlist">{hours}</div></div>'
                + f'<div class="mkd-schedule__days">{"".join(cols)}{now_html}</div></div>')

    def r_kbd(self, v: View) -> str:
        keys = v.attr("keys", "shortcut", "text", "key")
        parts = keys if isinstance(keys, list) else [keys]
        return self.open(v, "kbd", "span") + "".join(f'<kbd class="mkd-kbd__key">{esc(_fmt(k))}</kbd>'
                                                       for k in parts if k is not None) + "</span>"

    def r_skeleton(self, v: View) -> str:
        lines = int(_num(v.attr("lines", "rows"), 3) or 0)
        avatar = _bool(v.attr("avatar"))
        image = _bool(v.attr("image", "media"))
        shape = _name(v.attr("shape"))
        if shape in ("circle", "rectangle", "text"):
            return self.open(v, "skeleton", data={"shape": shape}) + '<span class="mkd-skeleton__block"></span></div>'
        widths = [100, 92, 76, 84, 60]
        bars = "".join(f'<span class="mkd-skeleton__line" style="width:{widths[i % 5]}%"></span>' for i in range(lines))
        return (self.open(v, "skeleton")
                + ('<span class="mkd-skeleton__image"></span>' if image else "")
                + '<div class="mkd-skeleton__row">'
                + ('<span class="mkd-skeleton__avatar"></span>' if avatar else "")
                + f'<div class="mkd-skeleton__lines">{bars}</div></div></div>')

    def r_swatches(self, v: View) -> str:
        colors = v.attr("colors", "palette") or []
        sel = v.attr("selection", "selected")
        out = []
        for i, c in enumerate(colors):
            css = css_color(c) or "transparent"
            on = (isinstance(sel, int) and not isinstance(sel, bool) and sel == i) or _fmt(sel) == _fmt(c)
            out.append(f'<span class="mkd-swatches__swatch" style="--mkd-swatch:{esc(css)}" '
                       f'aria-selected="{"true" if on else "false"}"></span>')
        label = self.content(v.attr("label", "title"))
        return self.open(v, "swatches") + (f'<span class="mkd-swatches__label">{label}</span>' if label else "") \
            + f'<span class="mkd-swatches__items">{"".join(out)}</span></div>'

    def r_canvas(self, v: View) -> str:
        style = {}
        if (length := u(_num(v.attr("height")))) is not None:
            style["height"] = length
        grid = _name(v.attr("grid", "background")) or ""
        return self.open(v, "canvas", data={"grid": grid or None}, style=style) + self.views(v.children) + "</div>"

    def r_media(self, v: View) -> str:
        img = v.attr("image", "poster", "thumbnail", "url")
        src = self.assets.resolve(img, v.loc) if isinstance(img, str) and img else None
        prog = _num(v.attr("progress", "value"), None)
        dur = _fmt(v.attr("duration") or "")
        cur = _fmt(v.attr("time", "currentTime") or "")
        playing = _bool(v.attr("playing"))
        poster = f'<img class="mkd-media__poster" src="{esc(src)}" alt="">' if src else \
            f'<span class="mkd-media__poster mkd-media__poster--empty">{self.icon("video")}</span>'
        bar = (f'<div class="mkd-media__controls"><span class="mkd-media__btn">{self.icon("pause" if playing else "play")}'
               f'</span><span class="mkd-media__time">{esc(cur)}</span><span class="mkd-media__scrub"><span '
               f'class="mkd-media__fill" style="width:{(prog if prog is not None and prog <= 1 else (prog or 0) / 100) * 100:.1f}%">'
               f'</span></span><span class="mkd-media__time">{esc(dur)}</span><span class="mkd-media__btn">'
               f'{self.icon("speaker")}</span></div>')
        center = "" if playing else f'<span class="mkd-media__play">{self.icon("play")}</span>'
        return self.open(v, "media") + poster + center + bar + "</div>"

    def r_emptystate(self, v: View) -> str:
        icon = v.attr("systemImage", "icon") or "tray"
        title = self.text_or_slot(v, "title", "label")
        desc = self.text_or_slot(v, "description", "message", "subtitle")
        actions = self.views(v.children) + self.slot(v, "actions")
        return (self.open(v, "emptystate") + f'<span class="mkd-emptystate__icon">{self.icon(icon, v=v)}</span>'
                + f'<span class="mkd-emptystate__title">{title}</span>'
                + (f'<span class="mkd-emptystate__desc">{desc}</span>' if desc else "")
                + (f'<div class="mkd-emptystate__actions">{actions}</div>' if actions else "") + "</div>")

    def r_stat(self, v: View) -> str:
        label = self.text_or_slot(v, "label", "title")
        value = self.text_or_slot(v, "value")
        change = v.attr("change", "delta", "trendValue")
        positive = v.attr("positive")
        if positive is None and isinstance(change, str):
            positive = not change.strip().startswith(("-", "−", "–"))
        icon = v.attr("systemImage", "icon")
        trend = v.attr("trend", "sparkline")
        spark = ""
        if isinstance(trend, list) and trend:
            from . import charts
            spark = charts.render(charts.ChartSpec("sparkline", series=[[_num(x, 0) or 0.0 for x in trend]],
                                                   width=120, height=32))
        return (self.open(v, "stat")
                + '<div class="mkd-stat__head">'
                + f'<span class="mkd-stat__label">{label}</span>'
                + (f'<span class="mkd-stat__icon">{self.icon(icon, v=v)}</span>' if icon else "") + "</div>"
                + f'<div class="mkd-stat__value">{value}</div>'
                + (f'<div class="mkd-stat__foot"><span class="mkd-stat__change" data-positive='
                   f'"{"true" if _bool(positive, True) else "false"}">{esc(_fmt(change))}</span>'
                   + (f'<span class="mkd-stat__caption">{self.content(v.attr("caption"))}</span>' if v.attr("caption") else "")
                   + "</div>" if change is not None else "")
                + (f'<div class="mkd-stat__spark">{spark}</div>' if spark else "") + "</div>")

    def r_map(self, v: View) -> str:
        pins = v.attr("pins", "markers") or []
        style = {}
        if (length := u(_num(v.attr("height")))) is not None:
            style["height"] = length
        out = []
        for i, p in enumerate(pins):
            if isinstance(p, (list, tuple)) and len(p) >= 2:
                x, y = _num(p[0], 50), _num(p[1], 50)
                lab = _fmt(p[2]) if len(p) > 2 else ""
            elif isinstance(p, dict):
                x, y, lab = _num(p.get("x"), 50), _num(p.get("y"), 50), _fmt(p.get("label", ""))
            else:
                x, y, lab = 30 + i * 17 % 60, 35 + i * 23 % 40, _fmt(p)
            out.append(f'<span class="mkd-map__pin" style="left:{x:.1f}%;top:{y:.1f}%">{self.icon("mappin")}'
                       + (f'<span class="mkd-map__label">{esc(lab)}</span>' if lab else "") + "</span>")
        route = ""
        if _bool(v.attr("route")) and len(pins) >= 2:
            pts = []
            for p in pins:
                if isinstance(p, (list, tuple)) and len(p) >= 2:
                    pts.append(f"{_num(p[0], 50):.1f},{_num(p[1], 50):.1f}")
            route = (f'<svg class="mkd-map__route" viewBox="0 0 100 100" preserveAspectRatio="none">'
                     f'<polyline points="{" ".join(pts)}"/></svg>')
        return (self.open(v, "map", style=style) + _MAP_SVG + route + "".join(out)
                + (f'<span class="mkd-map__me" style="left:{_num(v.attr("userX"), 50):.1f}%;top:{_num(v.attr("userY"), 55):.1f}%"></span>'
                   if _bool(v.attr("showsUserLocation", "userLocation")) else "") + "</div>")

    # --- annotation and overlay elements (free placement with .position / inside a Canvas or ZStack) ---

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


def _parse_time(value: object) -> tuple[int, int] | None:
    """The ``HH:MM`` after the date of an ISO date-time string (``2026-11-23T14:05``), or None."""
    if isinstance(value, str):
        m = re.match(r"^\d{4}-\d{2}-\d{2}[T ](\d{1,2}):(\d{2})", value)
        if m and int(m.group(1)) < 24 and int(m.group(2)) < 60:
            return int(m.group(1)), int(m.group(2))
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


# --- helpers for the non-standard components ---------------------------------------------------------

def _decorate(out: str, anchor: str, layer: str) -> str:
    """Make the root element of ``out`` an anchor and append the fallback layer inside it.

    The element stays the parent's direct child (so stack and grid rules still apply to it); only a void
    root (an ``<img>``) is wrapped.
    """
    m = re.match(r"<([a-zA-Z][\w-]*)([^>]*)>", out)
    if not m or m.group(1).lower() == "img" or not out.rstrip().endswith(f"</{m.group(1)}>"):
        return (f'<div class="mkd-deco" data-deco="true" style="anchor-name:{anchor}">{out}{layer}</div>')
    tag, attrs = m.group(1), m.group(2)
    if ' style="' in attrs:
        attrs = attrs.replace(' style="', f' style="anchor-name:{anchor};', 1)
    else:
        attrs += f' style="anchor-name:{anchor}"'
    attrs += ' data-deco="true"'
    close = f"</{tag}>"
    body = out[m.end():out.rstrip().rfind(close)]
    return f"<{tag}{attrs}>{body}{layer}{close}"


def _col_name(i: int) -> str:
    name = ""
    i += 1
    while i:
        i, r = divmod(i - 1, 26)
        name = chr(65 + r) + name
    return name


def _col_index(letters: str) -> int:
    n = 0
    for ch in letters.upper():
        n = n * 26 + (ord(ch) - 64)
    return n - 1


def _parse_range(text: str) -> tuple[int, int, int, int] | None:
    """'B2:D5' → (col0, row0, col1, row1) with 0-based columns and 1-based rows."""
    m = re.fullmatch(r"\s*([A-Za-z]+)(\d+)(?::([A-Za-z]+)(\d+))?\s*", text or "")
    if not m:
        return None
    c0, r0 = _col_index(m.group(1)), int(m.group(2))
    c1, r1 = (_col_index(m.group(3)), int(m.group(4))) if m.group(3) else (c0, r0)
    return min(c0, c1), min(r0, r1), max(c0, c1), max(r0, r1)


def _hour(h: object) -> str:
    x = _num(h, 0) or 0.0
    hh, mm = int(x), int(round((x - int(x)) * 60))
    return f"{hh}:{mm:02d}"


_KEYWORDS = {
    "swift": "import struct class enum protocol extension func var let if else guard return for in while switch case "
             "default some any self Self true false nil private public static async await throws try init",
    "js": "import export from const let var function return if else for of in while class extends new this true "
          "false null undefined async await try catch switch case default typeof interface type",
    "python": "import from def class return if elif else for in while with as try except finally True False None "
              "lambda yield async await pass raise and or not is",
    "go": "package import func var const type struct interface return if else for range go defer map chan nil true false",
    "rust": "use fn let mut pub struct enum impl trait match if else for in while loop return Some None Ok Err self",
    "css": "",
    "html": "",
    "json": "true false null",
    "sql": "SELECT FROM WHERE JOIN LEFT RIGHT INNER ON GROUP BY ORDER LIMIT INSERT INTO VALUES UPDATE SET DELETE "
           "CREATE TABLE AND OR NOT AS COUNT SUM",
    "shell": "cd ls export echo sudo git npm pip python cargo make",
}
_ALIASES = {"javascript": "js", "ts": "js", "typescript": "js", "tsx": "js", "jsx": "js", "py": "python",
            "sh": "shell", "bash": "shell", "zsh": "shell", "rs": "rust", "kt": "swift", "kotlin": "swift",
            "java": "js", "csharp": "js", "cs": "js", "c": "js", "cpp": "js"}
_TOKEN = re.compile(r'(?P<comment>//.*$|#(?!\w*\{).*$|--.*$)|(?P<string>"(?:[^"\\]|\\.)*"|\'(?:[^\'\\]|\\.)*\'|`[^`]*`)'
                    r"|(?P<number>\b\d+(?:\.\d+)?\b)|(?P<word>[A-Za-z_@][A-Za-z0-9_]*)|(?P<tag></?[a-zA-Z][\w-]*)")


def _highlight(line: str, lang: str) -> str:
    lang = _ALIASES.get(lang, lang)
    if lang not in _KEYWORDS:
        return esc(line)
    kws = set(_KEYWORDS[lang].split())
    out, pos = [], 0
    for m in _TOKEN.finditer(line):
        kind = m.lastgroup
        text = m.group(0)
        if kind == "comment" and lang in ("python", "shell") and not text.startswith("#"):
            kind = None
        if kind == "comment" and text.startswith("#") and lang not in ("python", "shell"):
            kind = None
        if kind == "comment" and text.startswith("--") and lang != "sql":
            kind = None
        out.append(esc(line[pos:m.start()]))
        if kind == "word":
            if text in kws or (lang == "sql" and text.upper() in kws):
                out.append(f'<span class="mkd-code__kw">{esc(text)}</span>')
            elif text[:1].isupper() or text.startswith("@"):
                out.append(f'<span class="mkd-code__type">{esc(text)}</span>')
            elif line[m.end():m.end() + 1] == "(":
                out.append(f'<span class="mkd-code__fn">{esc(text)}</span>')
            else:
                out.append(esc(text))
        elif kind == "tag" and lang == "html":
            out.append(f'<span class="mkd-code__kw">{esc(text)}</span>')
        elif kind in ("comment", "string", "number"):
            out.append(f'<span class="mkd-code__{"str" if kind == "string" else ("num" if kind == "number" else "comment")}">'
                       f"{esc(text)}</span>")
        else:
            out.append(esc(text))
        pos = m.end()
        if kind == "comment":
            break
    out.append(esc(line[pos:]))
    return "".join(out)


def _terminal_line(line: str) -> str:
    m = re.match(r"^(\S*[$%#>]) (.*)$", line)
    if m:
        return f'<span class="mkd-code__prompt">{esc(m.group(1))}</span> <span class="mkd-code__cmd">{esc(m.group(2))}</span>'
    return f'<span class="mkd-code__out">{esc(line)}</span>'


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


def _cursor_svg(kind: str) -> str:
    body = _CURSORS.get(kind, _CURSORS["arrow"])
    return (f'<svg class="mkd-pointer__svg" viewBox="0 0 24 24" aria-hidden="true" data-kind="{esc(kind)}">'
            f"{body}</svg>")


_MAP_SVG = (
    '<svg class="mkd-map__art" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" aria-hidden="true">'
    '<rect class="mkd-map__land" width="400" height="300"/>'
    '<path class="mkd-map__park" d="M40 40h90v70H40zM260 190h80v70h-80z"/>'
    '<path class="mkd-map__water" d="M0 220c60-30 110 20 180-10s120-50 220-20v110H0z"/>'
    '<g class="mkd-map__roads"><path d="M0 130h400M150 0v300M0 30l400 230M300 0v220"/></g>'
    '<g class="mkd-map__minor"><path d="M0 80h400M0 180h400M60 0v300M230 0v300M360 0v300"/></g></svg>')
