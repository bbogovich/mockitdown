"""Navigation roles: navigation stack, split view, tabs, app bar, sidebar, breadcrumb, pagination, steps.

A mixin of :class:`mockitdown.render.html.Renderer`: the methods rely on its infrastructure
(``open``, ``views``, ``content``, ``slot``, ``icon``, …) and are dispatched by role through
``getattr(self, "r_" + role)``.
"""

from __future__ import annotations

from ...model import View
from .._util import PH, _bool, _fmt, _name, _num, esc, text_html
from ..style import u


class NavigationRoles:
    """Navigation roles: navigation stack, split view, tabs, app bar, sidebar, breadcrumb, pagination, steps."""

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
        if v.slots:
            cols.append(("sidebar", v.children))
            for key in ("content", "detail", "inspector"):
                if key in v.slots:
                    cols.append((key, v.slots[key]))
        else:
            # Unlabelled columns: the first child is the sidebar, the last the detail, a middle one the content.
            n = len(v.children)
            for i, c in enumerate(v.children):
                name = "sidebar" if i == 0 else "detail" if i == n - 1 else "content" if i == 1 else f"col{i}"
                cols.append((name, [c]))
        widths = v.attr("columnWidths", "widths")
        out = []
        for i, (name, views) in enumerate(cols):
            st = ""
            if isinstance(widths, list) and i < len(widths) and (length := u(_num(widths[i]))) is not None:
                st = f' style="flex:0 0 {length};width:{length}"'
            # A column's own navigation title and toolbar, when it is not a NavigationStack drawing its bar
            # (R-PACK-015.C7, R-DEV-010.C2).
            header = ""
            if not any(c.role == "navstack" for c in views):
                title_html = ""
                title_view = self._find_mod(views, "navigationTitle")
                if title_view is not None:
                    m = title_view.mod("navigationTitle")
                    title_html = self.content(m.arg()) if m.args else self.views(m.content or [])
                tb_views: list[View] = []
                holder = self._find_mod(views, "toolbar")
                if holder is not None:
                    for m in holder.modifiers:
                        if m.name == "toolbar" and m.content:
                            tb_views.extend(m.content)
                groups = self._toolbar_items(tb_views)
                items = self.views(groups["leading"] + groups["principal"] + groups["trailing"])
                if title_html or items:
                    header = ('<div class="mkd-split__header">'
                              + (f'<span class="mkd-split__title">{title_html}</span>' if title_html else "")
                              + (f'<span class="mkd-split__toolbar">{items}</span>' if items else "") + "</div>")
            out.append(f'<div class="mkd-split__col" data-col="{esc(name)}"{st}>{header}{self.views(views)}</div>')
        # The sidebar toggle: hidden by the base pack, shown in the toolbar with macOS and iPadOS chrome (R-DEV-010.C3, C6).
        toggle = (f'<span class="mkd-split__toggle" role="button" aria-label="Toggle Sidebar">'
                  f'{self.icon("sidebar.left")}</span>')
        return self.open(v, "split", data={"columns": str(len(cols))}) + "".join(out) + toggle + "</div>"

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
        """A ``Tab`` outside a ``TabView``: one selected item of a tab bar (R-PACK-015.C5)."""
        tab_view = self.pack.element("TabView")
        placement = _name(v.attr("placement")) or _name(dict(tab_view.defaults).get("placement") if tab_view
                                                           else None) or "top"
        icon_name = v.attr("systemImage", "icon", "image")
        label = v.attr("label", "title", "text")
        icon = f'<span class="mkd-tabs__icon">{self.icon(icon_name, v=v)}</span>' if icon_name else ""
        lab = f'<span class="mkd-tabs__label">{self.content(label)}</span>' if label is not None else ""
        badge = self.badge_html(v.attr("badge"), "mkd-badge mkd-tabs__badge")
        return (self.open(v, "tabs", data={"placement": placement, "standalone": "true"})
                + '<div class="mkd-tabs__bar" role="tablist"><span class="mkd-tabs__tab" role="tab" aria-selected="true">'
                + f"{icon}{lab}{badge}</span></div></div>")

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
