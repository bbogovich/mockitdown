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
``data-mkd-node`` / ``data-mkd-derived``  edit mode only (R-EDIT-004), directly after ``data-el``: the
                    ordinal of the view node the view came from, and of the innermost ``ForEach``, ``if``
                    or struct call that produced it

No markup is interactive: controls are spans with ARIA roles, links do not navigate, and
nothing needs JavaScript.

The ``r_<role>`` methods live in role-family mixins under :mod:`mockitdown.render.roles`
(layout, content, controls, navigation, containers, components, annotations); this module keeps
the infrastructure and the helpers several families share, and :class:`Renderer` inherits the
families. The escaping and inline-Markdown helpers are in :mod:`mockitdown.render._util` and
re-exported here.
"""

from __future__ import annotations

import re

from .. import icons
from ..assets import AssetResolver
from ..diagnostics import Diagnostics
from ..model import EnumValue, Thunk, View, ViewList
from ..packs import Pack
from ._util import PH, _bool, _cursor_svg, _fmt, _name, _num, esc, initials, text_html
from .roles import (AnnotationRoles, ComponentRoles, ContainerRoles, ContentRoles, ControlRoles, LayoutRoles,
                    NavigationRoles)
from .style import StyleBuilder, css_color, style_attr

# esc, text_html, _fmt, _num, _name, _bool, initials and PH are re-exported from _util for the modules
# that import them from here (render/__init__, menubar, chrome, api, cli).

#: Element attributes copied verbatim to ``data-<name>`` when they are simple values.
PASSTHROUGH = ("variant", "size", "color", "shape", "density", "elevation", "placement", "orientation",
               "emphasis", "design", "severity", "kind", "labelStyle", "position", "level", "side",
               "withHandle", "direction", "labelPlacement", "rowsPerPage")
_SAFE_TOKEN = re.compile(r"^[A-Za-z0-9_. -]{1,40}$")
PRESENTATIONS = ("alert", "sheet", "confirmationDialog", "fullScreenCover", "popover", "inspector")


class Renderer(LayoutRoles, ContentRoles, ControlRoles, NavigationRoles,
               ContainerRoles, ComponentRoles, AnnotationRoles):
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
        #: Edit mode (R-EDIT-004): write ``data-mkd-node`` and ``data-mkd-derived`` on role roots.
        self.edit = False

    # --- infrastructure ---------------------------------------------------------------------------

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
        parts = [f'<{tag} class="{esc(" ".join(classes))}" data-el="{esc(v.name)}"{self.edit_attrs(v)}']
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

    def edit_attrs(self, v: View) -> str:
        """``data-mkd-node`` then ``data-mkd-derived`` in edit mode (R-EDIT-004.C4-C6), else ""."""
        if not self.edit:
            return ""
        return ((f' data-mkd-node="{esc(v.node)}"' if v.node else "")
                + (f' data-mkd-derived="{esc(v.derived)}"' if v.derived else ""))

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

    def _marks(self, v: View, out: str) -> tuple[str, str]:
        """``out`` decorated with the marks of ``v``, and the anchored layer drawing them (or ``out``, "").

        Marks are drawn twice (R-ANN-003.C2): in a screen-level layer tied to the element by CSS anchor
        positioning (unclipped; used where supported) and inside the element itself (fallback).
        """
        deco = self._decorations(v)
        if not deco or not out:
            return out, ""
        self.anchor_seq += 1
        name = f"--mkd-{self.anchor_prefix}-{self.anchor_seq}"
        anchored = f'<div class="mkd-anchored" style="position-anchor:{name}">{deco}</div>'
        return _decorate(out, name, f'<div class="mkd-deco__layer">{deco}</div>'), anchored

    def present(self, v: View | None, open_: str, markup: str, close: str = "</div>",
                inner: list[str] | None = None) -> None:
        """Add an overlay layer ``open_ markup close`` to the screen (R-ANN-001.C6, R-ANN-003.C3).

        ``markup`` is the overlay ``v`` itself (a dialog, toast or floating action button), decorated with
        its own marks; ``inner`` are the layers its contents added (their anchored marks among them). The
        anchored marks follow the layer, so their anchors precede them.
        """
        markup, anchored = self._marks(v, markup) if v is not None else (markup, "")
        self.overlays.append(open_ + markup + close)
        if anchored:
            self.overlays.append(anchored)
        self.overlays.extend(inner or [])

    def _wrap_overlays(self, v: View, out: str) -> str:
        out, anchored = self._marks(v, out)
        if anchored:
            self.overlays.append(anchored)
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
            mark = len(self.overlays)  # the layers and marks of the presented views follow this layer
            body = self.views(m.content or [])
            if m.name == "alert" or m.name == "confirmationDialog":
                message = self.views(m.slots.get("message", []))
                kind = "alert" if m.name == "alert" else "action-sheet"
                saved = self.in_menu
                self.in_menu = False
                actions = body or '<span class="mkd-button" role="button" data-variant="primary">' \
                                  '<span class="mkd-button__label">OK</span></span>'
                self.in_menu = saved
                inner = self.overlays[mark:]
                del self.overlays[mark:]
                self.present(None, f'<div class="mkd-layer" data-kind="{kind}"><div class="mkd-scrim"></div>',
                             f'<div class="mkd-dialog" data-variant="{kind}" role="alertdialog">'
                             + (f'<div class="mkd-dialog__title">{text_html(title)}</div>' if title else "")
                             + (f'<div class="mkd-dialog__body">{message}</div>' if message else "")
                             + f'<div class="mkd-dialog__actions">{actions}</div></div>', inner=inner)
            else:
                kind = {"sheet": "sheet", "fullScreenCover": "cover", "popover": "popover",
                        "inspector": "inspector"}[m.name]
                inner = self.overlays[mark:]
                del self.overlays[mark:]
                self.present(None, f'<div class="mkd-layer" data-kind="{kind}">'
                             + ('<div class="mkd-scrim"></div>' if kind == "sheet" else ""),
                             f'<div class="mkd-presented" data-kind="{kind}">'
                             + ('<div class="mkd-presented__grabber"></div>' if kind == "sheet" else "")
                             + ('<span class="mkd-presented__arrow"></span>' if kind == "popover" else "")
                             + f"{body}</div>", inner=inner)

    # --- fallback ---------------------------------------------------------------------------------

    def r_unknown(self, v: View) -> str:
        return (f'<div class="mkd-unknown" data-el="{esc(v.name)}"{self.edit_attrs(v)}><span class="mkd-unknown__name">{esc(v.name)}</span>'
                f"{self.views(v.children)}</div>")


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
