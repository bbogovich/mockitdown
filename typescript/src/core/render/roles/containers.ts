/**
 * Container roles: card, list, section, form, table, toolbar, accordion, dialog, menu, tooltip, toast, alert.
 *
 * One role family of the HTML renderer (port of `mockitdown.render.roles.containers`): its role functions are
 * called with `this` bound to the {@link Renderer} and rely on its infrastructure (`open`, `views`, `content`,
 * `slot`, `icon`, …); `ROLES` in `../html.ts` assembles the families and dispatches by role.
 */

import { CallValue, View, ViewList } from "../../model.js";
import { isList, isSeq, pyBool, PyDict } from "../../values.js";
import { u } from "../style.js";
import { at, bool, esc, fmt, has, int, isNum, isNumOrBool, iter, name, num, numValue, or, textHtml } from "../util.js";
import type { RoleFn } from "../html.js";

/** The anchor of a tooltip written without content (R-DEV-008.C5). */
const TOOLTIP_PLACEHOLDER = '<span class="mkd-button" data-placeholder="true" role="button">'
  + '<span class="mkd-button__label">Button</span></span>';

/** Dialog variants whose Button children are their actions, as in SwiftUI's alert and confirmation dialog. */
const ACTION_DIALOGS = ["alert", "action-sheet"];

export const ContainerRoles: Record<string, RoleFn> = {
  card(v) {
    const parts: string[] = [];
    const media = at(v, "image", "media", "cover");
    if (typeof media === "string" && media) {
      const src = this.assets.resolve(media, v.loc);
      const h = u(num(at(v, "mediaHeight"), 140)) || "";
      parts.push(src ? `<img class="mkd-card__media" src="${esc(src)}" alt="" style="height:${h}">`
        : `<div class="mkd-card__media mkd-card__media--missing" style="height:${h}">${this.icon("photo")}</div>`);
    }
    const title = this.textOrSlot(v, "title", "label");
    const subtitle = this.textOrSlot(v, "subtitle", "subheader", "description");
    const header = this.slot(v, "header");
    let visual = "";
    if (pyBool(at(v, "avatar"))) visual = this.avatarHtml(fmt(at(v, "avatar")), at(v, "avatarImage"), v);
    else if (pyBool(at(v, "systemImage", "icon"))) visual = `<span class="mkd-card__icon">${this.icon(at(v, "systemImage", "icon"), "mkd-icon", v)}</span>`;
    const headActions = this.slot(v, "headerAction", "action", "menu", "extra");
    const status = this.textOrSlot(v, "status", "value");
    if (header || title || subtitle || visual || headActions) {
      if (header) parts.push(`<div class="mkd-card__band">${header}</div>`);
      if (visual || title || subtitle || status || headActions) {
        parts.push('<div class="mkd-card__header">' + visual
          + (title || subtitle ? `<div class="mkd-card__titles"><span class="mkd-card__title">${title}</span>`
            + (subtitle ? `<span class="mkd-card__subtitle">${subtitle}</span>` : "") + "</div>" : "")
          + (status ? `<span class="mkd-card__status">${status}</span>` : "")
          + (headActions ? `<div class="mkd-card__header-actions">${headActions}</div>` : "")
          + "</div>");
      }
    }
    if (v.children.length) parts.push(`<div class="mkd-card__body">${this.views(v.children)}</div>`);
    const actions = this.slot(v, "actions", "footer");
    if (actions) parts.push(`<div class="mkd-card__actions">${actions}</div>`);
    return this.open(v, "card") + parts.join("") + "</div>";
  },
  section(v) {
    const wrap = this.rowWrap;
    const title = this.textOrSlot(v, "title", "header", "label");
    const footer = this.textOrSlot(v, "footer", "description");
    const body = wrap ? this.rows(v.children, wrap) : this.views(v.children);
    const actions = this.slot(v, "actions", "trailing");
    let head = "";
    if (title || actions) {
      head = `<div class="mkd-section__header"><span class="mkd-section__title">${title}</span>`
        + (actions ? `<span class="mkd-section__actions">${actions}</span>` : "") + "</div>";
    }
    return this.open(v, "section", "div", { data: wrap ? { context: wrap } : null }) + head
      + `<div class="mkd-section__body">${body}</div>` + (footer ? `<div class="mkd-section__footer">${footer}</div>` : "") + "</div>";
  },
  list(v) {
    const header = this.textOrSlot(v, "header", "title");
    const saved = this.listSelection;
    const sel = at(v, "selection");
    this.listSelection = typeof sel === "string" || typeof sel === "number" ? fmt(sel) : null;
    const body = this.rows(v.children, "list");
    this.listSelection = saved;
    const hasSections = v.children.some((c) => c.role === "section");
    return this.open(v, "list", "div", { data: { sections: hasSections ? "true" : null }, attrs: { role: "list" } })
      + (header ? `<div class="mkd-list__header">${header}</div>` : "") + body + "</div>";
  },
  form(v) {
    const title = this.textOrSlot(v, "title");
    const actions = this.slot(v, "actions", "footer");
    return this.open(v, "form") + (title ? `<div class="mkd-form__title">${title}</div>` : "")
      + this.rows(v.children, "form") + (actions ? `<div class="mkd-form__actions">${actions}</div>` : "") + "</div>";
  },
  listitem(v) {
    const title = this.textOrSlot(v, "title", "label", "text", "primary");
    let contentChildren = v.children;
    let trailingChildren: View[] = [];
    if (title) {
      trailingChildren = v.children;
      contentChildren = [];
    }
    const subtitle = this.textOrSlot(v, "subtitle", "description", "secondary", "secondaryText");
    const overline = this.textOrSlot(v, "overline");
    const detail = this.textOrSlot(v, "detail", "value", "trailingText", "info", "meta");
    let leading = this.slot(v, "leading") || this.leadingVisual(v);
    if (bool(at(v, "checkbox")) || at(v, "checked") !== null) {
      const st = bool(at(v, "checked")) ? "true" : "false";
      leading = `<span class="mkd-checkbox" data-el="Checkbox" data-checked="${st}"><span class="mkd-checkbox__box">`
        + `${st === "true" ? this.icon("checkmark") : ""}</span></span>` + leading;
    }
    const textParts: string[] = [];
    if (overline) textParts.push(`<span class="mkd-listitem__overline">${overline}</span>`);
    if (title) textParts.push(`<span class="mkd-listitem__title">${title}</span>`);
    if (subtitle) textParts.push(`<span class="mkd-listitem__subtitle">${subtitle}</span>`);
    if (contentChildren.length) textParts.push(this.views(contentChildren));
    const trailing: string[] = [];
    if (detail) trailing.push(`<span class="mkd-listitem__detail">${detail}</span>`);
    const b = this.badgeHtml(at(v, "badge", "count"), "mkd-badge mkd-listitem__badge");
    if (b) trailing.push(b);
    trailing.push(this.slot(v, "trailing", "accessory", "actions"));
    trailing.push(this.views(trailingChildren));
    if (bool(at(v, "chevron", "disclosure", "navigation"))) trailing.push(`<span class="mkd-listitem__chevron">${this.icon("chevron.right")}</span>`);
    const trailingHtml = trailing.join("");
    const status = at(v, "status", "highlight");
    const data: Record<string, unknown> = pyBool(status) ? { status: name(status) } : {};
    if (subtitle) data.lines = "2";
    return this.open(v, "listitem", "div", { data, attrs: { role: "listitem" } })
      + (leading ? `<span class="mkd-listitem__leading">${leading}</span>` : "")
      + `<span class="mkd-listitem__text">${textParts.join("")}</span>`
      + (trailingHtml ? `<span class="mkd-listitem__trailing">${trailingHtml}</span>` : "") + "</div>";
  },
  labeled(v) {
    const label = this.textOrSlot(v, "label", "title", "key");
    let value = this.textOrSlot(v, "value", "content", "text");
    if (v.children.length) value = this.views(v.children);
    return this.open(v, "labeled") + `<span class="mkd-labeled__label">${label}</span>`
      + `<span class="mkd-labeled__value">${value}</span></div>`;
  },
  table(v) {
    const cols = or(at(v, "columns", "headers"), []);
    const headers: [string, string][] = [];
    for (const c of iter(cols)) {
      if (c instanceof CallValue) headers.push([fmt(c.args.length ? c.args[0] : c.kw("title", "")), name(c.kw("alignment", ""))]);
      else if (c instanceof PyDict) headers.push([fmt(c.get("title", c.get("label", ""))), fmt(c.get("align", ""))]);
      else if (c instanceof ViewList) {
        for (const cv of c.views) headers.push([fmt(at(cv, "title", "label", "content")), name(at(cv, "alignment", ""))]);
      } else headers.push([fmt(c), ""]);
    }
    const flat = (views: readonly View[]): View[] => views.flatMap((c) => (c.role === "group" ? flat(c.children) : [c]));
    const kids = flat(v.children);
    for (const c of kids) if (c.role === "tablecolumn") headers.push([fmt(at(c, "title", "label")), name(at(c, "alignment", ""))]);
    const selectable = bool(at(v, "selectable", "checkboxSelection", "multiSelect"));
    const selected = or(at(v, "selectedRows", "selection"), []);
    const selectedSet = new Set(isList(selected) ? selected.filter((x) => isNum(x)).map((x) => int(numValue(x as number))) : []);
    const sortCol = at(v, "sortColumn");
    const rowsHtml: string[] = [];
    const rows = or(at(v, "rows", "data", "items"), []);
    const rowViews = kids.filter((c) => c.role === "tablerow");
    (isList(rows) ? rows : []).forEach((row, i) => {
      const cells = isSeq(row) ? [...row] : (row instanceof PyDict ? headers.map((h) => row.get(h[0], "")) : [row]);
      const tds = cells.map((cellValue, j) => this.cell(cellValue, j < headers.length ? headers[j][1] : "")).join("");
      rowsHtml.push(this.tr(tds, selectedSet.has(i), selectable));
    });
    const start = rowsHtml.length;
    rowViews.forEach((rv, k) => {
      const i = start + k;
      const tds = rv.children.map((c, j) => '<td class="mkd-table__cell"'
        + (j < headers.length && headers[j][1] ? ` data-align="${esc(headers[j][1])}"` : "")
        + `>${this.view(c)}</td>`).join("");
      rowsHtml.push(this.tr(tds, selectedSet.has(i) || bool(at(rv, "selected")), selectable, at(rv, "status")));
    });
    const ths: string[] = [];
    if (selectable) {
      const allOn = rowsHtml.length > 0 && selectedSet.size === rowsHtml.length;
      ths.push('<th class="mkd-table__select"><span class="mkd-checkbox" data-checked='
        + `"${allOn ? "true" : (selectedSet.size ? "mixed" : "false")}"><span class="mkd-checkbox__box">`
        + `${selectedSet.size ? this.icon(allOn ? "checkmark" : "minus") : ""}</span></span></th>`);
    }
    headers.forEach(([h, align], j) => {
      let sort = "";
      if (sortCol !== null && ((isNumOrBool(sortCol) && int(numValue(sortCol)) === j) || fmt(sortCol) === h)) {
        sort = `<span class="mkd-table__sort">${this.icon("arrow.up")}</span>`;
      }
      const al = align ? ` data-align="${esc(align)}"` : "";
      ths.push(`<th class="mkd-table__head"${al}>${textHtml(h)}${sort}</th>`);
    });
    let toolbar = this.slot(v, "toolbar", "header");
    const title = this.textOrSlot(v, "title");
    if (title && !toolbar) toolbar = `<span class="mkd-table__title">${title}</span>`;
    else if (title) toolbar = `<span class="mkd-table__title">${title}</span>` + toolbar;
    let footer = this.slot(v, "footer");
    const pag = at(v, "pagination");
    if (pyBool(pag) && !footer) {
      footer = `<span class="mkd-table__pagination">${esc(pag === true ? "1–10 of 100" : fmt(pag))}`
        + `${this.icon("chevron.left")}${this.icon("chevron.right")}</span>`;
    }
    const thead = ths.length ? `<thead><tr>${ths.join("")}</tr></thead>` : "";
    return this.open(v, "table-wrap") + (toolbar ? `<div class="mkd-table__toolbar">${toolbar}</div>` : "")
      + `<table class="mkd-table">${thead}<tbody>${rowsHtml.join("")}</tbody></table>`
      + (footer ? `<div class="mkd-table__footer">${footer}</div>` : "") + "</div>";
  },
  tablerow(v) { return this.open(v, "hstack") + this.views(v.children) + "</div>"; },
  tablecolumn() { return ""; },
  toolbar(v) {
    const variant = name(at(v, "variant"));
    if (variant === "compactMenu" || variant === "menu") { // one button standing for a menu (R-PACK-014.C1)
      const title = this.textOrSlot(v, "title", "label");
      const icon = at(v, "systemImage", "icon");
      let inner = (pyBool(icon) ? `<span class="mkd-toolbar__menu-icon">${this.icon(icon, "mkd-icon", v)}</span>` : "")
        + (title ? `<span class="mkd-toolbar__menu-label">${title}</span>` : "");
      if (!inner) inner = `<span class="mkd-toolbar__menu-icon">${this.icon("ellipsis")}</span>`;
      if (variant === "menu") inner += `<span class="mkd-toolbar__menu-chevron">${this.icon("chevron.down")}</span>`;
      return this.open(v, "toolbar", "div", { attrs: { role: "toolbar" } })
        + `<span class="mkd-toolbar__menu" role="button" aria-haspopup="menu">${inner}</span></div>`;
    }
    const title = this.textOrSlot(v, "title");
    return this.open(v, "toolbar", "div", { attrs: { role: "toolbar" } })
      + (title ? `<span class="mkd-toolbar__title">${title}</span>` : "") + this.views(v.children) + "</div>";
  },
  toolbaritem(v) { return this.open(v, "group") + this.views(v.children) + "</div>"; },
  accordion(v) {
    const expanded = bool(at(v, "expanded", "isExpanded", "open"));
    const title = this.textOrSlot(v, "title", "label", "header");
    const subtitle = this.textOrSlot(v, "subtitle", "description");
    const icon = at(v, "systemImage", "icon");
    const head = '<div class="mkd-accordion__header">'
      + (pyBool(icon) ? `<span class="mkd-accordion__icon">${this.icon(icon, "mkd-icon", v)}</span>` : "")
      + `<span class="mkd-accordion__titles"><span class="mkd-accordion__title">${title}</span>`
      + (subtitle ? `<span class="mkd-accordion__subtitle">${subtitle}</span>` : "") + "</span>"
      + this.slot(v, "trailing", "actions")
      + `<span class="mkd-accordion__chevron">${this.icon(expanded ? "chevron.down" : "chevron.right")}</span></div>`;
    const body = expanded ? `<div class="mkd-accordion__body">${this.views(v.children)}</div>` : "";
    return this.open(v, "accordion", "div", { data: { expanded: expanded ? "true" : "false" } }) + head + body + "</div>";
  },
  dialog(v) {
    const title = this.textOrSlot(v, "title");
    const message = this.textOrSlot(v, "message", "description", "subtitle");
    const icon = at(v, "systemImage", "icon");
    let actions = ["dismissButton", "actions", "buttons", "footer", "confirmButton"].map((n) => this.slot(v, n)).join("");
    const buttons = at(v, "buttons");
    if (isList(buttons) && !actions) {
      const primary = fmt(or(at(v, "primary"), buttons.length ? buttons[buttons.length - 1] : ""));
      const destr = at(v, "destructive");
      const destructive = isList(destr) ? new Set(destr.map(fmt)) : (pyBool(destr) ? new Set([fmt(destr)]) : new Set<string>());
      actions = buttons.map((b) => {
        const nm = fmt(b);
        const variant = nm === primary ? "primary" : "secondary";
        const role = destructive.has(nm) ? ' data-role="destructive"' : "";
        return `<span class="mkd-button" data-el="Button" data-variant="${variant}"${role} role="button">`
          + `<span class="mkd-button__label">${esc(nm)}</span></span>`;
      }).join("");
    }
    const closable = bool(at(v, "closable", "closeButton", "dismissible"));
    const variant = name(at(v, "variant")) || "dialog";
    const saved = this.inMenu;
    this.inMenu = false;
    const mark = this.overlays.length;
    let children = v.children;
    if (ACTION_DIALOGS.includes(variant) && !actions && children.some((c) => c.role === "button")) {
      // SwiftUI's alert and confirmation dialog take their buttons from the closure (R-PACK-015.C9).
      actions = this.views(children.filter((c) => c.role === "button"));
      children = children.filter((c) => c.role !== "button");
    }
    const body = this.views(children);
    this.inMenu = saved;
    const innerLayers = this.overlays.slice(mark);
    this.overlays.length = mark;
    const markup = this.open(v, "dialog", "div", { attrs: { role: "dialog" } })
      + (variant === "popover" ? '<span class="mkd-dialog__arrow"></span>' : "")
      + (pyBool(icon) ? `<div class="mkd-dialog__icon">${this.icon(icon, "mkd-icon", v)}</div>` : "")
      + (title || closable ? `<div class="mkd-dialog__header"><span class="mkd-dialog__title">${title}</span>`
        + (closable ? `<span class="mkd-dialog__close">${this.icon("xmark")}</span>` : "") + "</div>" : "")
      + (message ? `<div class="mkd-dialog__message">${message}</div>` : "")
      + (body ? `<div class="mkd-dialog__body">${body}</div>` : "")
      + (actions ? `<div class="mkd-dialog__actions">${actions}</div>` : "") + "</div>";
    if (!bool(at(v, "modal", "presented", "open"), true) || bool(at(v, "inline"))) {
      this.overlays.push(...innerLayers);
      return markup;
    }
    // A popover written on its own points at a placeholder anchor above it (R-PACK-015.C3).
    const anchor = variant === "popover" ? `<div class="mkd-popover__anchor">${TOOLTIP_PLACEHOLDER}</div>` : "";
    // The dialog's own marks and those of its contents follow its layer (R-ANN-001.C6, R-ANN-003.C3).
    this.present(v, `<div class="mkd-layer" data-kind="${esc(variant)}"><div class="mkd-scrim"></div>${anchor}`,
      markup, "</div>", innerLayers);
    return "";
  },
  menu(v) {
    const label = this.slot(v, "label", "trigger") || this.content(at(v, "label", "title"));
    const icon = at(v, "systemImage", "icon");
    const open = bool(at(v, "open", "isOpen", "expanded"));
    let trigger = "";
    if (label || pyBool(icon)) {
      const variant = name(at(v, "variant")) || "";
      const size = name(at(v, "size")) || "";
      trigger = '<span class="mkd-button mkd-menu__trigger" data-el="MenuButton"'
        + (variant ? ` data-variant="${esc(variant)}"` : "")
        + (size ? ` data-size="${esc(size)}"` : "")
        + (pyBool(icon) && !label ? ' data-icon-only="true"' : "") + ' role="button">'
        + (pyBool(icon) ? `<span class="mkd-button__icon">${this.icon(icon, "mkd-icon", v)}</span>` : "")
        + (label ? `<span class="mkd-button__label">${label}</span>` : "")
        + (label && bool(at(v, "caret"), true) ? `<span class="mkd-button__caret">${this.icon("chevron.down")}</span>` : "")
        + "</span>";
    }
    let popup = "";
    if (open || !trigger) {
      this.inMenu = true;
      const items = this.views(v.children);
      this.inMenu = false;
      popup = `<div class="mkd-menu__popup" role="menu">${items}</div>`;
    }
    return this.open(v, "menu", "div", { data: { open: open ? "true" : "false", standalone: !trigger ? "true" : null } })
      + trigger + popup + "</div>";
  },
  menuitem(v) {
    let label = this.textOrSlot(v, "label", "title", "text");
    if (v.children.length && !label) {
      const saved = this.inMenu;
      this.inMenu = false;
      label = this.views(v.children.filter((c) => c.role !== "menuitem" && c.role !== "button"));
      this.inMenu = saved;
    }
    const icon = at(v, "systemImage", "icon");
    const checked = at(v, "checked", "isOn");
    const sub = v.children.filter((c) => c.role === "menuitem" || c.role === "button");
    const data: Record<string, unknown> = {};
    const role = at(v, "role");
    if (pyBool(role)) data.role = name(role);
    if (bool(at(v, "destructive"))) data.role = "destructive";
    const parts: string[] = [];
    if (checked !== null) parts.push(`<span class="mkd-menuitem__check">${bool(checked) ? this.icon("checkmark") : ""}</span>`);
    parts.push(pyBool(icon) ? `<span class="mkd-menuitem__icon">${this.icon(icon, "mkd-icon", v)}</span>` : "");
    parts.push(`<span class="mkd-menuitem__label">${label}</span>`);
    const shortcut = at(v, "shortcut", "keyboardShortcut", "accelerator");
    if (pyBool(shortcut)) parts.push(`<span class="mkd-menuitem__shortcut">${esc(fmt(shortcut))}</span>`);
    if (sub.length) parts.push(`<span class="mkd-menuitem__chevron">${this.icon("chevron.right")}</span>`);
    return this.open(v, "menuitem", "div", { data, attrs: { role: "menuitem" } }) + parts.join("") + "</div>";
  },
  tooltip(v) {
    const text = this.textOrSlot(v, "text", "title", "content", "label");
    const message = this.textOrSlot(v, "message", "subtitle");
    const open = bool(at(v, "open", "isOpen"), true);
    const placement = name(at(v, "placement")) || "top";
    const bubble = open ? `<span class="mkd-tooltip__bubble" data-placement="${esc(placement)}" role="tooltip">`
      + '<span class="mkd-tooltip__arrow"></span>'
      + `<span class="mkd-tooltip__title">${text}</span>`
      + (message ? `<span class="mkd-tooltip__message">${message}</span>` : "")
      + this.slot(v, "actions") + "</span>" : "";
    // The anchor: the content, or a placeholder button when there is none (R-DEV-008.C5).
    const anchor = this.views(v.children) || TOOLTIP_PLACEHOLDER;
    return this.open(v, "tooltip", "span") + `<span class="mkd-tooltip__anchor">${anchor}</span>` + bubble + "</span>";
  },
  toast(v) {
    const msg = this.textOrSlot(v, "message", "text", "title");
    const desc = this.textOrSlot(v, "description", "subtitle");
    const action = at(v, "action", "actionLabel");
    const icon = at(v, "systemImage", "icon");
    const markup = this.open(v, "toast", "div", { attrs: { role: "status" } })
      + (pyBool(icon) ? `<span class="mkd-toast__icon">${this.icon(icon, "mkd-icon", v)}</span>` : "")
      + `<span class="mkd-toast__text"><span class="mkd-toast__message">${msg}</span>`
      + (desc ? `<span class="mkd-toast__description">${desc}</span>` : "")
      + this.views(v.children) + "</span>"
      + (typeof action === "string" ? `<span class="mkd-toast__action">${esc(fmt(action))}</span>` : "")
      + this.slot(v, "actions")
      + (bool(at(v, "closable")) ? `<span class="mkd-toast__close">${this.icon("xmark")}</span>` : "")
      + "</div>";
    if (bool(at(v, "inline"))) return markup;
    const pos = name(at(v, "position", "placement")) || "bottom";
    this.present(v, `<div class="mkd-layer" data-kind="toast" data-position="${esc(pos)}">`, markup);
    return "";
  },
  alert(v) {
    let sev = (name(at(v, "severity", "type", "status", "intent")) || "info").toLowerCase();
    const sevMap: Record<string, string> = {
      information: "info", danger: "error", negative: "error", critical: "error", positive: "success",
      "critical-warning": "warning", caution: "warning",
    };
    if (has(sevMap, sev)) sev = sevMap[sev];
    const iconMap: Record<string, string> = {
      info: "info.circle", success: "checkmark.circle", warning: "exclamationmark.triangle", error: "exclamationmark.circle",
    };
    const icon = or(at(v, "systemImage", "icon"), has(iconMap, sev) ? iconMap[sev] : "info.circle");
    const title = this.textOrSlot(v, "title");
    const message = this.textOrSlot(v, "message", "text", "description", "content");
    const body = this.views(v.children);
    const actions = this.slot(v, "actions", "action");
    const showIcon = bool(at(v, "showIcon"), true);
    return this.open(v, "alert", "div", { data: { severity: sev }, attrs: { role: "alert" } })
      + (showIcon ? `<span class="mkd-alert__icon">${this.icon(icon, "mkd-icon", v)}</span>` : "")
      + '<span class="mkd-alert__content">'
      + (title ? `<span class="mkd-alert__title">${title}</span>` : "")
      + (message ? `<span class="mkd-alert__message">${message}</span>` : "") + body + "</span>"
      + (actions ? `<span class="mkd-alert__actions">${actions}</span>` : "")
      + (bool(at(v, "closable", "dismissible", "isClosable")) ? `<span class="mkd-alert__close">${this.icon("xmark")}</span>` : "")
      + "</div>";
  },
};
