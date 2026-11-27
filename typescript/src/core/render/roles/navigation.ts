/**
 * Navigation roles: navigation stack, split view, tabs, app bar, sidebar, breadcrumb, pagination, steps.
 *
 * One role family of the HTML renderer (port of `mockitdown.render.roles.navigation`): its role functions are
 * called with `this` bound to the {@link Renderer} and rely on its infrastructure (`open`, `views`, `content`,
 * `slot`, `icon`, …); `ROLES` in `../html.ts` assembles the families and dispatches by role.
 */

import { View } from "../../model.js";
import { isList, pyBool, PyDict } from "../../values.js";
import { u } from "../style.js";
import { at, bool, esc, fmt, int, isIn, isNum, iter, name, num, numValue, or, or0, PH, textHtml } from "../util.js";
import type { RoleFn } from "../html.js";

interface Tab {
  label: unknown;
  icon: unknown;
  badge: unknown;
  content: View[];
  selected: boolean;
  disabled: boolean;
}

export const NavigationRoles: Record<string, RoleFn> = {
  navstack(v) {
    const content = v.children;
    const titleView = this.findMod(content, "navigationTitle");
    const title = at(v, "title");
    let titleHtml = pyBool(title) ? this.content(title) : "";
    if (titleView !== null) {
      const m = titleView.mod("navigationTitle")!;
      titleHtml = m.args.length ? this.content(m.arg()) : this.views(m.content ?? []);
    }
    const subtitleView = this.findMod(content, "navigationSubtitle");
    const subtitle = subtitleView ? this.content(subtitleView.mod("navigationSubtitle")!.arg()) : this.content(at(v, "subtitle"));
    const modeView = this.findMod(content, "navigationBarTitleDisplayMode");
    let mode = modeView ? name(modeView.mod("navigationBarTitleDisplayMode")!.arg()) : (name(at(v, "titleDisplayMode")) || "large");
    if (mode === "automatic") mode = "large";
    if (!titleHtml) mode = "inline";
    const tbViews: View[] = [];
    const tbHolder = this.findMod(content, "toolbar");
    if (tbHolder !== null) {
      for (const m of tbHolder.modifiers) if (m.name === "toolbar" && m.content && m.content.length) tbViews.push(...m.content);
    }
    const groups = this.toolbarItems(tbViews);
    const back = at(v, "back", "backTitle");
    let leading = "";
    if (pyBool(back)) {
      const label = back === true ? "" : `<span class="mkd-navbar__back-label">${esc(fmt(back))}</span>`;
      leading += `<span class="mkd-navbar__back">${this.icon("chevron.left")}${label}</span>`;
    }
    leading += this.views(groups.leading);
    const principal = this.views(groups.principal);
    const trailing = this.views(groups.trailing);
    const searchView = this.findMod(content, "searchable");
    let search = "";
    if (searchView !== null) {
      const sm = searchView.mod("searchable")!;
      const prompt = sm.kwargs.get("prompt", "Search");
      const text = sm.kwargs.get("text", null);
      const ph = !(typeof text === "string" && text);
      search = '<div class="mkd-navbar__search"><span class="mkd-field mkd-textfield" data-el="SearchField" '
        + `data-kind="search" data-filled="${ph ? "false" : "true"}"><span class="mkd-field__control">`
        + `<span class="mkd-field__icon">${this.icon("magnifyingglass")}</span>`
        + `<span class="mkd-field__input"${ph ? PH : ""}>`
        + `${esc(fmt(!ph ? text : prompt))}</span>`
        + `<span class="mkd-field__icon mkd-field__icon--end" data-mic="true">${this.icon("mic")}</span>`
        + "</span></span></div>";
    }
    const hidden = bool(at(v, "hideNavigationBar"));
    let bar = "";
    if (!hidden) {
      let barTitle = principal || (titleHtml ? `<span class="mkd-navbar__title-text">${titleHtml}</span>` : "");
      if (subtitle && mode === "inline") barTitle += `<span class="mkd-navbar__subtitle">${subtitle}</span>`;
      bar = `<div class="mkd-navbar" data-title-mode="${esc(mode)}">`
        + `<div class="mkd-navbar__bar"><div class="mkd-navbar__leading">${leading}</div>`
        + `<div class="mkd-navbar__title">${barTitle}</div>`
        + `<div class="mkd-navbar__trailing">${trailing}</div></div>`
        + (mode === "large" ? `<div class="mkd-navbar__large">${titleHtml}`
          + (subtitle ? `<span class="mkd-navbar__subtitle">${subtitle}</span>` : "") + "</div>" : "")
        + search + "</div>";
    }
    const bottom = this.views(groups.bottom);
    const bottomHtml = bottom ? `<div class="mkd-bottombar">${bottom}</div>` : "";
    return this.open(v, "navstack") + bar + `<div class="mkd-navstack__content">${this.views(content)}</div>` + bottomHtml + "</div>";
  },
  split(v) {
    const cols: [string, View[]][] = [];
    if (v.slots.size) {
      cols.push(["sidebar", v.children]);
      for (const key of ["content", "detail", "inspector"]) if (v.slots.has(key)) cols.push([key, v.slots.get(key)!]);
    } else {
      // Unlabelled columns: the first child is the sidebar, the last the detail, a middle one the content.
      const n = v.children.length;
      v.children.forEach((c, i) => cols.push([i === 0 ? "sidebar" : i === n - 1 ? "detail" : i === 1 ? "content" : `col${i}`, [c]]));
    }
    const widths = at(v, "columnWidths", "widths");
    const out = cols.map(([nm, views], i) => {
      let st = "";
      if (isList(widths) && i < widths.length) {
        const length = u(num(widths[i]));
        if (length !== null) st = ` style="flex:0 0 ${length};width:${length}"`;
      }
      // A column's own navigation title and toolbar, when it is not a NavigationStack drawing its bar
      // (R-PACK-015.C7, R-DEV-010.C2).
      let header = "";
      if (!views.some((c) => c.role === "navstack")) {
        let titleHtml = "";
        const titleView = this.findMod(views, "navigationTitle");
        if (titleView !== null) {
          const m = titleView.mod("navigationTitle")!;
          titleHtml = m.args.length ? this.content(m.arg()) : this.views(m.content ?? []);
        }
        const tbViews: View[] = [];
        const holder = this.findMod(views, "toolbar");
        if (holder !== null) {
          for (const m of holder.modifiers) if (m.name === "toolbar" && m.content && m.content.length) tbViews.push(...m.content);
        }
        const groups = this.toolbarItems(tbViews);
        const items = this.views([...groups.leading, ...groups.principal, ...groups.trailing]);
        if (titleHtml || items) {
          header = '<div class="mkd-split__header">'
            + (titleHtml ? `<span class="mkd-split__title">${titleHtml}</span>` : "")
            + (items ? `<span class="mkd-split__toolbar">${items}</span>` : "") + "</div>";
        }
      }
      return `<div class="mkd-split__col" data-col="${esc(nm)}"${st}>${header}${this.views(views)}</div>`;
    });
    // The sidebar toggle: hidden by the base pack, shown in the toolbar with macOS and iPadOS chrome (R-DEV-010.C3, C6).
    const toggle = '<span class="mkd-split__toggle" role="button" aria-label="Toggle Sidebar">'
      + `${this.icon("sidebar.left")}</span>`;
    return this.open(v, "split", "div", { data: { columns: String(cols.length) } }) + out.join("") + toggle + "</div>";
  },
  tabs(v) {
    const tabs: Tab[] = [];
    for (const c of v.children) {
      if (c.role === "tab") {
        tabs.push({
          label: at(c, "label", "title", "text"), icon: at(c, "systemImage", "icon", "image"), badge: at(c, "badge"),
          content: c.children, selected: bool(at(c, "selected")), disabled: bool(at(c, "disabled")),
        });
      } else if (c.mod("tabItem")) {
        const m = c.mod("tabItem")!;
        const mc = m.content ?? [];
        const labView = mc.find((x) => ["label", "text", "image"].includes(x.role)) ?? null;
        let label: unknown = null;
        let icon: unknown = null;
        if (labView !== null) {
          label = at(labView, "title", "content", "text");
          icon = at(labView, "systemImage", "icon", "systemName");
          for (const x of mc) {
            if ((x.role === "image" || x.role === "icon") && !pyBool(icon)) icon = at(x, "systemName", "name");
            if (x.role === "text" && !pyBool(label)) label = at(x, "content");
          }
        }
        tabs.push({ label, icon, badge: at(c, "badge"), content: [c], selected: false, disabled: false });
      } else {
        tabs.push({ label: null, icon: null, badge: null, content: [c], selected: false, disabled: false });
      }
    }
    const items = at(v, "items", "tabs");
    if (isList(items) && !tabs.length) {
      for (const it of items) {
        if (it instanceof PyDict) {
          tabs.push({
            label: it.get("label", it.get("title", null)), icon: it.get("icon", it.get("systemImage", null)),
            badge: it.get("badge", null), content: [], selected: false, disabled: false,
          });
        } else tabs.push({ label: it, icon: null, badge: null, content: [], selected: false, disabled: false });
      }
    }
    const sel = at(v, "selection", "selected", "value", "active");
    let index = 0;
    if (isNum(sel)) index = int(numValue(sel));
    else if (sel !== null) tabs.forEach((t, i) => { if (fmt(t.label) === fmt(sel)) index = i; });
    tabs.forEach((t, i) => { if (t.selected) index = i; });
    const bar = tabs.map((t, i) => {
      const icon = pyBool(t.icon) ? `<span class="mkd-tabs__icon">${this.icon(t.icon, "mkd-icon", v)}</span>` : "";
      const lab = t.label !== null ? `<span class="mkd-tabs__label">${this.content(t.label)}</span>` : "";
      const badge = this.badgeHtml(t.badge, "mkd-badge mkd-tabs__badge");
      const dis = t.disabled ? ' data-state="disabled"' : "";
      return `<span class="mkd-tabs__tab" role="tab" aria-selected="${i === index ? "true" : "false"}"${dis}>${icon}${lab}${badge}</span>`;
    });
    const trailing = this.slot(v, "trailing", "actions");
    if (trailing) bar.push(`<span class="mkd-tabs__actions">${trailing}</span>`);
    const panelViews = index >= 0 && index < tabs.length ? tabs[index].content : [];
    const panel = tabs.some((t) => t.content.length) ? `<div class="mkd-tabs__panel" role="tabpanel">${this.views(panelViews)}</div>` : "";
    const placement = name(at(v, "placement")) || "top";
    return this.open(v, "tabs", "div", { data: { placement } })
      + `<div class="mkd-tabs__bar" role="tablist">${bar.join("")}</div>` + panel + "</div>";
  },
  /** A `Tab` outside a `TabView`: one selected item of a tab bar (R-PACK-015.C5). */
  tab(v) {
    const tabView = this.pack.element("TabView");
    const dflt = tabView ? tabView.defaults.find(([k]) => k === "placement") : undefined;
    const placement = name(at(v, "placement")) || name(dflt ? dflt[1] : null) || "top";
    const iconName = at(v, "systemImage", "icon", "image");
    const label = at(v, "label", "title", "text");
    const icon = pyBool(iconName) ? `<span class="mkd-tabs__icon">${this.icon(iconName, "mkd-icon", v)}</span>` : "";
    const lab = label !== null ? `<span class="mkd-tabs__label">${this.content(label)}</span>` : "";
    const badge = this.badgeHtml(at(v, "badge"), "mkd-badge mkd-tabs__badge");
    return this.open(v, "tabs", "div", { data: { placement, standalone: "true" } })
      + '<div class="mkd-tabs__bar" role="tablist"><span class="mkd-tabs__tab" role="tab" aria-selected="true">'
      + `${icon}${lab}${badge}</span></div></div>`;
  },
  appbar(v) {
    let leading = this.slot(v, "leading", "navigation", "start");
    if (!leading) {
      if (bool(at(v, "menu", "menuButton", "hamburger"))) leading += `<span class="mkd-appbar__nav">${this.icon("line.3.horizontal")}</span>`;
      if (pyBool(at(v, "back"))) leading += `<span class="mkd-appbar__nav">${this.icon("arrow.left")}</span>`;
      const navIcon = at(v, "navigationIcon");
      if (pyBool(navIcon)) leading += `<span class="mkd-appbar__nav">${this.icon(navIcon, "mkd-icon", v)}</span>`;
    }
    const logo = at(v, "logo");
    if (typeof logo === "string" && logo) {
      const src = logo.includes(".") || logo.includes("/") ? this.assets.resolve(logo, v.loc) : null;
      leading += src ? `<img class="mkd-appbar__logo" src="${esc(src)}" alt="">`
        : `<span class="mkd-appbar__logo mkd-appbar__logo--icon">${this.icon(logo, "mkd-icon", v)}</span>`;
    }
    const title = this.textOrSlot(v, "title", "primaryTitle", "brand");
    const subtitle = this.textOrSlot(v, "subtitle", "secondaryTitle");
    const titleHtml = title || subtitle ? `<div class="mkd-appbar__titles"><span class="mkd-appbar__title">${title}</span>`
      + (subtitle ? `<span class="mkd-appbar__subtitle">${subtitle}</span>` : "") + "</div>" : "";
    let center = this.slot(v, "center", "content", "middle");
    const search = at(v, "search", "searchPrompt");
    if (pyBool(search) && !center) {
      const prompt = search === true ? "Search" : fmt(search);
      center = '<span class="mkd-field mkd-textfield mkd-appbar__search" data-el="Search" data-kind="search" '
        + 'data-filled="false"><span class="mkd-field__control"><span class="mkd-field__icon">'
        + `${this.icon("magnifyingglass")}</span><span class="mkd-field__input" data-placeholder="true">`
        + `${esc(prompt)}</span></span></span>`;
    }
    let actions = this.views(v.children) + this.slot(v, "actions", "trailing", "end");
    const notif = at(v, "notifications", "notificationsCount");
    if (!isIn(notif, [null, false])) {
      actions += `<span class="mkd-appbar__action">${this.icon("bell")}`
        + `${this.badgeHtml(notif !== true ? notif : true, "mkd-badge mkd-appbar__badge")}</span>`;
    }
    const avatar = at(v, "avatar", "profile", "user");
    if (pyBool(avatar)) actions += this.avatarHtml(fmt(avatar), at(v, "avatarImage"), v, "small", " mkd-appbar__avatar");
    return this.open(v, "appbar", "div", { attrs: { role: "banner" } })
      + `<div class="mkd-appbar__leading">${leading}</div>${titleHtml}`
      + `<div class="mkd-appbar__center">${center}</div><div class="mkd-appbar__actions">${actions}</div>` + "</div>";
  },
  sidebar(v) {
    const title = this.textOrSlot(v, "title");
    const header = this.slot(v, "header");
    const footer = this.slot(v, "footer");
    const sel = at(v, "selection", "selected");
    const bodyViews = v.children;
    if (sel !== null) {
      for (const c of bodyViews) {
        if ((c.role === "navitem" || c.role === "listitem") && fmt(at(c, "label", "title", "text")) === fmt(sel)) c.attrs.set("selected", true);
      }
    }
    const style: Record<string, string> = {};
    const length = u(num(at(v, "width")));
    if (length !== null) {
      style.width = length;
      style.flex = `0 0 ${length}`;
    }
    return this.open(v, "sidebar", "nav", { style })
      + (header || title ? `<div class="mkd-sidebar__header">${header}`
        + (title ? `<span class="mkd-sidebar__title">${title}</span>` : "") + "</div>" : "")
      + `<div class="mkd-sidebar__items">${this.views(bodyViews)}</div>`
      + (footer ? `<div class="mkd-sidebar__footer">${footer}</div>` : "") + "</nav>";
  },
  navitem(v) {
    const icon = at(v, "systemImage", "icon");
    let label = this.textOrSlot(v, "label", "title", "text");
    if (!label && v.children.length && !pyBool(at(v, "expanded"))) label = this.views(v.children.filter((c) => c.role !== "navitem"));
    const sub = v.children.filter((c) => c.role === "navitem");
    const expanded = bool(at(v, "expanded"), sub.length > 0 && sub.some((c) => bool(at(c, "selected"))));
    const parts = [pyBool(icon) ? `<span class="mkd-navitem__icon">${this.icon(icon, "mkd-icon", v)}</span>` : ""];
    parts.push(`<span class="mkd-navitem__label">${label}</span>`);
    parts.push(this.badgeHtml(at(v, "badge", "count"), "mkd-badge mkd-navitem__badge"));
    if (sub.length) parts.push(`<span class="mkd-navitem__chevron">${this.icon(expanded ? "chevron.down" : "chevron.right")}</span>`);
    const row = `<span class="mkd-navitem__row">${parts.join("")}</span>`;
    const children = sub.length && expanded ? `<div class="mkd-navitem__children">${this.views(sub)}</div>` : "";
    return this.open(v, "navitem", "div", {
      data: sub.length ? { expanded: expanded ? "true" : null } : null,
      attrs: { role: "link", "aria-current": bool(at(v, "selected")) ? "page" : null },
    }) + row + children + "</div>";
  },
  breadcrumb(v) {
    const items = at(v, "items", "path");
    const crumbs = isList(items) ? items.map((i) => textHtml(fmt(i))) : v.children.map((c) => this.view(c));
    const out: string[] = [];
    crumbs.forEach((c, i) => {
      const cur = i === crumbs.length - 1 ? ' aria-current="page"' : "";
      out.push(`<span class="mkd-breadcrumb__item"${cur}>${c}</span>`);
      if (i < crumbs.length - 1) out.push(`<span class="mkd-breadcrumb__sep">${this.icon("chevron.right")}</span>`);
    });
    return this.open(v, "breadcrumb", "nav") + out.join("") + "</nav>";
  },
  pagination(v) {
    const count = int(or0(num(at(v, "count", "pages", "total"), 5), 5));
    const page = int(or0(num(at(v, "page", "current", "selection"), 1), 1));
    let nums: (number | string)[] = [];
    if (count <= 7) {
      for (let i = 1; i <= count; i++) nums.push(i);
    } else {
      nums = [1];
      const lo = Math.max(2, page - 1);
      const hi = Math.min(count - 1, page + 1);
      if (lo > 2) nums.push("…");
      for (let i = lo; i <= hi; i++) nums.push(i);
      if (hi < count - 1) nums.push("…");
      nums.push(count);
    }
    const cells = [`<span class="mkd-pagination__item" data-nav="prev">${this.icon("chevron.left")}</span>`];
    for (const n of nums) {
      if (n === "…") cells.push('<span class="mkd-pagination__gap">…</span>');
      else cells.push(`<span class="mkd-pagination__item"${n === page ? ' aria-current="page"' : ""}>${n}</span>`);
    }
    cells.push(`<span class="mkd-pagination__item" data-nav="next">${this.icon("chevron.right")}</span>`);
    const summary = at(v, "summary", "label");
    if (pyBool(summary)) cells.unshift(`<span class="mkd-pagination__summary">${esc(fmt(summary))}</span>`);
    return this.open(v, "pagination", "nav") + cells.join("") + "</nav>";
  },
  steps(v) {
    let steps = at(v, "steps", "items");
    let labels: [string, string][] = [];
    if (typeof steps === "number") steps = Array(Math.max(0, steps)).fill("");
    if (isList(steps)) {
      for (const s of steps) {
        if (s instanceof PyDict) labels.push([fmt(s.get("title", s.get("label", ""))), fmt(s.get("description", ""))]);
        else labels.push([fmt(s), ""]);
      }
    } else {
      labels = v.children.map((c) => [fmt(at(c, "title", "label", "content")), fmt(or(at(c, "description", "subtitle"), ""))]);
    }
    const current = int(or0(num(at(v, "current", "active", "selection", "activeStep"), 0), 0));
    const errors = new Set(iter(or(at(v, "errors"), [])).filter((x) => typeof x === "number" || typeof x === "boolean")
      .map((x) => numValue(x as number | boolean)));
    const out: string[] = [];
    labels.forEach(([title, desc], i) => {
      const status = errors.has(i) ? "error" : (i < current ? "done" : (i === current ? "current" : "todo"));
      const marker = status === "done" ? this.icon("checkmark") : (status === "error" ? this.icon("exclamationmark.circle") : String(i + 1));
      out.push(`<div class="mkd-steps__step" data-status="${status}"><span class="mkd-steps__marker">${marker}`
        + `</span><span class="mkd-steps__text"><span class="mkd-steps__title">${esc(title)}</span>`
        + (desc ? `<span class="mkd-steps__description">${esc(desc)}</span>` : "")
        + "</span></div>");
      if (i < labels.length - 1) out.push(`<span class="mkd-steps__connector" data-done="${i < current ? "true" : "false"}"></span>`);
    });
    return this.open(v, "steps", "div", { data: { orientation: name(at(v, "orientation")) || "horizontal" } }) + out.join("") + "</div>";
  },
};
