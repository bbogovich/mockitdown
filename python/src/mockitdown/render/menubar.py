"""The macOS menu bar (R-DEV-009): the bar above a ``macos`` window and its one open menu.

Structure (classes are the stable styling contract)::

    div.mkd-menubar[role=menubar]
      span.mkd-menubar__apple                    the Apple menu glyph
      span.mkd-menubar__menu[data-menu=app][data-open=true]
        span.mkd-menubar__title                  the application name (bold), then each menu's title
        span.mkd-menubar__dropdown[role=menu]    the open menu only
          span.mkd-menubar__item[role=menuitem][data-state=disabled][data-checked][data-submenu][data-open]
            span.mkd-menubar__check  span.mkd-menubar__icon  span.mkd-menubar__label
            span.mkd-menubar__key    span.mkd-menubar__chevron
            span.mkd-menubar__dropdown.mkd-menubar__dropdown--sub   an open submenu
          span.mkd-menubar__sep[role=separator]  span.mkd-menubar__header
      span.mkd-menubar__gap
      span.mkd-menubar__status                   battery, Wi-Fi, Control Center, span.mkd-menubar__clock

The standard menus (App, File, Edit, View, Window, Help) are data in ``vocabulary.json`` (``menubar``);
``.commands { CommandMenu … CommandGroup … }`` on the root view adds menus and edits placements.
"""

from __future__ import annotations

from dataclasses import dataclass, field

from .. import icons, vocabulary
from ..diagnostics import Diagnostics
from ..model import EnumValue, View
from .html import Renderer, _bool, _fmt, _name, esc

#: Modifier glyphs in the order macOS draws them.
MODIFIER_GLYPHS = (("control", "⌃"), ("option", "⌥"), ("shift", "⇧"), ("command", "⌘"))
_MODIFIER_NAMES = {"control": "control", "ctrl": "control", "option": "option", "alt": "option",
                   "shift": "shift", "command": "command", "cmd": "command"}
#: KeyEquivalent members and KeyboardShortcut presets → the glyph macOS draws.
KEY_GLYPHS = {
    "return": "↩", "defaultAction": "↩", "escape": "⎋", "cancelAction": "⎋", "delete": "⌫",
    "deleteForward": "⌦", "tab": "⇥", "space": "Space", "upArrow": "↑", "downArrow": "↓", "leftArrow": "←",
    "rightArrow": "→", "home": "↖", "end": "↘", "pageUp": "⇞", "pageDown": "⇟", "clear": "⌧",
}
#: Presets that carry no modifier.
_BARE = ("defaultAction", "cancelAction")


@dataclass
class Row:
    kind: str  # item | sep | header
    label: str = ""  # HTML
    key: str = ""
    icon: str = ""
    checked: bool = False
    disabled: bool = False
    submenu: list[Row] | None = None
    open: bool = False


@dataclass
class Menu:
    title: str  # plain text
    title_html: str
    rows: list[Row] = field(default_factory=list)
    app: bool = False
    open: bool = False


def option(value: object) -> tuple[bool, str]:
    """The ``menubar`` option (C1) → (shown, title of the menu drawn open)."""
    if value is None or value is False:
        return False, ""
    if value is True:
        return True, ""
    text = _fmt(value).strip()
    if text.lower() in ("", "true"):
        return True, ""
    if text.lower() == "false":
        return False, ""
    return True, text


def shortcut(key: object, modifiers: object = None) -> str:
    """``.keyboardShortcut("c", modifiers: [.shift, .command])`` → ``⇧⌘C`` (C7): ⌃⌥⇧⌘, then the key."""
    name = _name(key)
    glyph = KEY_GLYPHS.get(name, name.upper()) if isinstance(key, EnumValue) else name.upper()
    if not glyph:
        return ""
    if modifiers is None:
        mods = [] if name in _BARE else ["command"]
    else:
        items = modifiers if isinstance(modifiers, (list, tuple)) else [modifiers]
        mods = [_MODIFIER_NAMES.get(_name(m), "") for m in items]
    return "".join(g for n, g in MODIFIER_GLYPHS if n in mods) + glyph


def _std_shortcut(item: dict) -> str:
    if "key" not in item:
        return ""
    return shortcut(item["key"], item.get("modifiers"))


def _std_rows(items: list, app: str) -> list[Row]:
    return [Row("item", esc(str(i["title"]).replace("{app}", app)), _std_shortcut(i),
                submenu=[] if i.get("submenu") else None) for i in items]


def _view_shortcut(v: View) -> str:
    m = v.mod("keyboardShortcut")
    if m is not None and m.args:
        return shortcut(m.arg(), m.kwargs.get("modifiers"))
    s = v.attr("shortcut", "keyboardShortcut")
    return _fmt(s) if s not in (None, "") else ""


def view_rows(views: list[View], r: Renderer) -> list[Row]:
    """The rows a menu's views draw (C7): Button, Divider, Menu (submenu), Toggle (checkmark), disabled."""
    out: list[Row] = []
    for v in views:
        role = v.role
        if role == "divider":
            out.append(Row("sep"))
        elif role == "group":
            out.extend(view_rows(v.children, r))
        elif role == "section":
            header = r.text_or_slot(v, "title", "header", "label")
            if header:
                out.append(Row("header", header))
            out.extend(view_rows(v.children, r))
        elif role == "menu":
            label = r.text_or_slot(v, "label", "title")
            icon = v.attr("systemImage", "icon")
            out.append(Row("item", label, icon=r.icon(icon, v=v) if icon else "", disabled=_bool(v.attr("disabled")),
                           submenu=view_rows(v.children, r),
                           open=_bool(v.attr("open", "isOpen", "isPresented", "expanded"))))
        elif role == "toggle":
            label = r.text_or_slot(v, "label", "title") or r.views(v.children)
            out.append(Row("item", label, _view_shortcut(v),
                           checked=_bool(v.attr("isOn", "on", "checked", "value", "selected")),
                           disabled=_bool(v.attr("disabled"))))
        elif role in ("button", "menuitem", "link"):
            label = r.text_or_slot(v, "label", "title", "text") or r.views(v.children)
            icon = v.attr("systemImage", "icon")
            out.append(Row("item", label, _view_shortcut(v), icon=r.icon(icon, v=v) if icon else "",
                           checked=_bool(v.attr("checked")), disabled=_bool(v.attr("disabled"))))
    return out


def _tidy(rows: list[Row]) -> list[Row]:
    """No separator first, last or twice in a row."""
    out: list[Row] = []
    for row in rows:
        if row.kind == "sep" and (not out or out[-1].kind == "sep"):
            continue
        out.append(row)
    while out and out[-1].kind == "sep":
        out.pop()
    return out


def _has_open(rows: list[Row]) -> bool:
    return any(row.open or (row.submenu and _has_open(row.submenu)) for row in rows)


def placements() -> list[str]:
    """Every placement a CommandGroup may name (C5)."""
    return [e["placement"] for m in vocabulary.MENUBAR.get("menus", []) for e in m["entries"]
            if isinstance(e, dict) and e.get("placement")]


def _commands(views: list[View], r: Renderer) -> list[View]:
    holder = r._find_mod(views, "commands")
    if holder is None:
        return []
    out: list[View] = []
    for m in holder.modifiers:
        if m.name == "commands" and m.content:
            out.extend(m.content)
    return out


def build(views: list[View], r: Renderer, app: str, diags: Diagnostics) -> list[Menu]:
    """The menus of the bar, left to right (C5, C6): the standard menus with the commands merged in."""
    known = set(placements())
    edits: dict[str, dict] = {}
    custom: list[Menu] = []

    def collect(vs: list[View]) -> None:
        for v in vs:
            if v.name == "CommandGroup":
                kind, placement = "", ""
                for k in ("replacing", "before", "after"):
                    if v.attr(k) is not None:
                        kind, placement = k, _name(v.attr(k))
                        break
                if not kind:
                    diags.warning("CommandGroup needs replacing:, before: or after:; ignored", v.loc, "chrome")
                    continue
                if placement not in known:
                    diags.warning(f'CommandGroup placement ".{placement}" is unknown; ignored', v.loc, "chrome")
                    continue
                e = edits.setdefault(placement, {"replacing": None, "before": [], "after": []})
                rows = view_rows(v.children, r)
                if kind == "replacing":
                    e["replacing"] = rows
                else:
                    e[kind].extend(rows)
            elif v.role == "menu":
                title = _fmt(v.attr("label", "title"))
                rows = view_rows(v.children, r)
                custom.append(Menu(title, r.text_or_slot(v, "label", "title"), rows,
                                   open=_bool(v.attr("open", "isOpen", "isPresented", "expanded"))))
            elif v.role == "group":
                collect(v.children)

    collect(_commands(views, r))
    menus: list[Menu] = []
    for spec in vocabulary.MENUBAR.get("menus", []):
        if spec.get("id") == "window":
            menus.extend(custom)
        rows: list[Row] = []
        for entry in spec["entries"]:
            if entry == "-":
                rows.append(Row("sep"))
                continue
            e = edits.get(entry.get("placement", ""))
            base = _std_rows(entry.get("items", []), app)
            if e is None:
                rows.extend(base)
            else:
                rows.extend(e["before"])
                rows.extend(base if e["replacing"] is None else e["replacing"])
                rows.extend(e["after"])
        title = str(spec["title"]).replace("{app}", app)
        menus.append(Menu(title, esc(title), _tidy(rows), app=spec.get("id") == "app"))
    for m in menus:
        m.rows = _tidy(m.rows)
    return menus


def _rows_html(rows: list[Row], r: Renderer) -> str:
    out = []
    sub_open = False
    for row in rows:
        if row.kind == "sep":
            out.append('<span class="mkd-menubar__sep" role="separator"></span>')
            continue
        if row.kind == "header":
            out.append(f'<span class="mkd-menubar__header">{row.label}</span>')
            continue
        opened = row.submenu is not None and not sub_open and (row.open or _has_open(row.submenu))
        sub_open = sub_open or opened
        attrs = ((' data-state="disabled"' if row.disabled else "") + (' data-checked="true"' if row.checked else "")
                 + (' data-submenu="true"' if row.submenu is not None else "")
                 + (' data-open="true"' if opened else ""))
        check = r.icon("checkmark") if row.checked else ""
        out.append(f'<span class="mkd-menubar__item" role="menuitem"{attrs}>'
                   f'<span class="mkd-menubar__check">{check}</span>'
                   + (f'<span class="mkd-menubar__icon">{row.icon}</span>' if row.icon else "")
                   + f'<span class="mkd-menubar__label">{row.label}</span>'
                   + (f'<span class="mkd-menubar__key">{esc(row.key)}</span>' if row.key else "")
                   + (f'<span class="mkd-menubar__chevron">{r.icon("chevron.right")}</span>'
                      if row.submenu is not None else "")
                   + (f'<span class="mkd-menubar__dropdown mkd-menubar__dropdown--sub" role="menu">'
                      f'{_rows_html(_tidy(row.submenu), r)}</span>' if opened else "")
                   + "</span>")
    return "".join(out)


def _i(name: str) -> str:
    return icons.svg(name, "mkd-icon")[0]


def render(views: list[View], r: Renderer, app: str, title: str, diags: Diagnostics) -> str:
    """The menu bar's markup (C3): the Apple glyph, the menus (the first one asked for drawn open, C8), the
    status items and the clock."""
    menus = build(views, r, app, diags)
    if title and not any(m.title == title for m in menus):
        diags.warning(f'menubar names no menu "{title}" (menus: {", ".join(m.title for m in menus)})', None, "chrome")
    opened = next((m for m in menus if (title and m.title == title) or m.open or _has_open(m.rows)), None)
    parts = ['<div class="mkd-menubar" role="menubar">', f'<span class="mkd-menubar__apple">{_i("apple.logo")}</span>']
    for m in menus:
        is_open = m is opened
        parts.append('<span class="mkd-menubar__menu"' + (' data-menu="app"' if m.app else "")
                     + (' data-open="true"' if is_open else "") + f'><span class="mkd-menubar__title">{m.title_html}</span>'
                     + (f'<span class="mkd-menubar__dropdown" role="menu">{_rows_html(m.rows, r)}</span>' if is_open else "")
                     + "</span>")
    clock = esc(str(vocabulary.MENUBAR.get("clock", "")))
    parts.append('<span class="mkd-menubar__gap"></span><span class="mkd-menubar__status">'
                 f'{_i("battery")}{_i("wifi")}{_i("switch.2")}<span class="mkd-menubar__clock">{clock}</span></span></div>')
    return "".join(parts)
