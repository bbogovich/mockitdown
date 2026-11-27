"""Container roles: card, list, section, form, table, toolbar, accordion, dialog, menu, tooltip, toast, alert.

A mixin of :class:`mockitdown.render.html.Renderer`: the methods rely on its infrastructure
(``open``, ``views``, ``content``, ``slot``, ``icon``, …) and are dispatched by role through
``getattr(self, "r_" + role)``.
"""

from __future__ import annotations

from ...model import CallValue, View, ViewList
from .._util import _bool, _fmt, _name, _num, esc, text_html
from ..style import u


#: The anchor of a tooltip written without content (R-DEV-008.C5).
TOOLTIP_PLACEHOLDER = ('<span class="mkd-button" data-placeholder="true" role="button">'
                       '<span class="mkd-button__label">Button</span></span>')
#: Dialog variants whose Button children are their actions, as in SwiftUI's alert and confirmation dialog.
ACTION_DIALOGS = ("alert", "action-sheet")


class ContainerRoles:
    """Container roles: card, list, section, form, table, toolbar, accordion, dialog, menu, tooltip, toast, alert."""

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
        children = v.children
        if variant in ACTION_DIALOGS and not actions and any(c.role == "button" for c in children):
            # SwiftUI's alert and confirmation dialog take their buttons from the closure (R-PACK-015.C9).
            actions = self.views([c for c in children if c.role == "button"])
            children = [c for c in children if c.role != "button"]
        body = self.views(children)
        self.in_menu = saved
        inner_layers = self.overlays[mark:]
        del self.overlays[mark:]
        markup = (self.open(v, "dialog", attrs={"role": "dialog"})
                  + ('<span class="mkd-dialog__arrow"></span>' if variant == "popover" else "")
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
        # A popover written on its own points at a placeholder anchor above it (R-PACK-015.C3).
        anchor = f'<div class="mkd-popover__anchor">{TOOLTIP_PLACEHOLDER}</div>' if variant == "popover" else ""
        self.overlays.append(f'<div class="mkd-layer" data-kind="{esc(variant)}"><div class="mkd-scrim"></div>'
                             f"{anchor}{markup}</div>")
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
