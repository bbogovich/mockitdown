/**
 * Non-standard component roles: spreadsheet, board, code, message, tree, timeline, gantt, schedule and the rest.
 *
 * One role family of the HTML renderer (port of `mockitdown.render.roles.components`): its role functions are
 * called with `this` bound to the {@link Renderer} and rely on its infrastructure (`open`, `views`, `content`,
 * `slot`, `icon`, …); `ROLES` in `../html.ts` assembles the families and dispatches by role.
 */

import { EnumValue, ViewList } from "../../model.js";
import { pyFormatG, pyMax, pyMin } from "../../pyformat.js";
import { isList, isSeq, pyBool, PyDict, pyEq } from "../../values.js";
import { chartSpec, renderChart } from "../charts.js";
import { cssColor, u } from "../style.js";
import {
  at, bool, colName, esc, fmt, fx, highlight, hour, int, isNum, iter, LEADING_WS, MAP_SVG, name, num, numValue, or,
  or0, ordSum, parseRange, stripTags, terminalLine, textHtml,
} from "../util.js";
import type { RoleFn } from "../html.js";

const SEL = ' data-sel="true"';

const HL = ' data-hl="true"';

export const ComponentRoles: Record<string, RoleFn> = {
  spreadsheet(v) {
    let rows: unknown[][] = iter(or(at(v, "rows", "data", "cells"), [])).map((r) => (isSeq(r) ? [...r] : [r]));
    const ncols = int(or0(num(at(v, "columnCount"), 0), 0)) || (rows.length ? Math.max(...rows.map((r) => r.length)) : 5);
    const cols = at(v, "columns", "headers");
    const letters = Array.from({ length: ncols }, (_, i) => colName(i));
    const startRow = int(or0(num(at(v, "startRow", "firstRow"), 1), 1));
    const minRows = int(or0(num(at(v, "rowCount", "minRows"), 0), 0));
    while (rows.length < minRows) rows.push([]);
    const sel = parseRange(fmt(or(at(v, "selection", "range"), "")));
    const active = parseRange(fmt(or(at(v, "active", "activeCell"), ""))) ?? (sel ? [sel[0], sel[1], sel[0], sel[1]] : null);
    const highlights = or(at(v, "highlight", "fills"), new PyDict());
    const widths = iter(or(at(v, "columnWidths", "widths"), []));
    let headerRow = bool(at(v, "headerRow"));
    const parts: string[] = [];
    const formula = at(v, "formula", "formulaBar");
    if (formula !== null || bool(at(v, "showFormulaBar"))) {
      const ref = fmt(or(at(v, "active", "activeCell"), or(at(v, "selection"), "A1"))).split(":")[0];
      parts.push(`<div class="mkd-spreadsheet__formula"><span class="mkd-spreadsheet__ref">${esc(ref)}</span>`
        + '<span class="mkd-spreadsheet__fx">fx</span><span class="mkd-spreadsheet__expr">'
        + `${esc(fmt(or(formula, "")))}</span></div>`);
    }
    const colgroup = '<col class="mkd-spreadsheet__rowhead-col">' + Array.from({ length: ncols }, (_, i) => {
      const w = i < widths.length ? u(num(widths[i])) : null;
      return w ? `<col style="width:${w}">` : "<col>";
    }).join("");
    const head = '<th class="mkd-spreadsheet__corner"></th>' + letters.map((l, i) =>
      `<th class="mkd-spreadsheet__colhead"${sel && sel[0] <= i && i <= sel[2] ? SEL : ""}>${esc(l)}</th>`).join("");
    const body: string[] = [];
    if (isList(cols) && cols.length) {
      rows = [cols.map(fmt), ...rows];
      headerRow = true;
    }
    rows.forEach((row, ri) => {
      const rnum = startRow + ri;
      const inRows = sel && sel[1] <= rnum && rnum <= sel[3];
      const cells = [`<th class="mkd-spreadsheet__rowhead"${inRows ? SEL : ""}>${rnum}</th>`];
      for (let ci = 0; ci < ncols; ci++) {
        const val = ci < row.length ? row[ci] : "";
        const attrs: string[] = [];
        if (sel && sel[0] <= ci && ci <= sel[2] && sel[1] <= rnum && rnum <= sel[3]) {
          attrs.push('data-in-sel="true"');
          const edges = ([["t", rnum === sel[1]], ["b", rnum === sel[3]], ["l", ci === sel[0]], ["r", ci === sel[2]]] as [string, boolean][])
            .filter(([, c]) => c).map(([e]) => e);
          if (edges.length) attrs.push(`data-edge="${edges.join("")}"`);
        }
        if (active && active[0] === ci && active[1] === rnum) attrs.push('data-active="true"');
        const fill = highlights instanceof PyDict ? highlights.get(`${letters[ci]}${rnum}`, null) : null;
        if (fill !== null && cssColor(fill)) attrs.push(`style="background:color-mix(in srgb, ${esc(cssColor(fill))} 28%, transparent)"`);
        if (isNum(val)) attrs.push('data-num="true"');
        if (headerRow && ri === 0) attrs.push('data-header="true"');
        const contentHtml = val instanceof ViewList ? this.views(val.views) : textHtml(fmt(val));
        cells.push(`<td class="mkd-spreadsheet__cell" ${attrs.join(" ")}>${contentHtml}</td>`);
      }
      body.push("<tr>" + cells.join("") + "</tr>");
    });
    parts.push(`<div class="mkd-spreadsheet__grid"><table class="mkd-spreadsheet__table"><colgroup>${colgroup}`
      + `</colgroup><thead><tr>${head}</tr></thead><tbody>${body.join("")}</tbody></table></div>`);
    const sheets = at(v, "sheets");
    if (isList(sheets) && sheets.length) {
      const cur = fmt(or(at(v, "sheet", "selectedSheet"), sheets[0]));
      parts.push('<div class="mkd-spreadsheet__sheets"><span class="mkd-spreadsheet__add">'
        + this.icon("plus") + "</span>" + sheets.map((s) =>
        `<span class="mkd-spreadsheet__sheet" aria-selected="${fmt(s) === cur ? "true" : "false"}">${esc(fmt(s))}</span>`).join("") + "</div>");
    }
    return this.open(v, "spreadsheet") + parts.join("") + "</div>";
  },
  stickynote(v) {
    const c = cssColor(or(at(v, "color", "fill"), new EnumValue("yellow"))) || "var(--mkd-color-yellow)";
    const rot = or0(num(at(v, "rotation", "angle"), 0), 0);
    const style: Record<string, string> = { "--mkd-note": c };
    if (rot) style.transform = `rotate(${pyFormatG(rot)}deg)`;
    const title = this.textOrSlot(v, "title");
    const text = this.textOrSlot(v, "text", "content");
    const footer = this.textOrSlot(v, "author", "footer", "date");
    return this.open(v, "stickynote", "div", { style })
      + (title ? `<div class="mkd-stickynote__title">${title}</div>` : "")
      + (text ? `<div class="mkd-stickynote__text">${text}</div>` : "") + this.views(v.children)
      + (footer ? `<div class="mkd-stickynote__footer">${footer}</div>` : "") + "</div>";
  },
  board(v) { return this.open(v, "board") + this.views(v.children) + "</div>"; },
  boardcolumn(v) {
    const title = this.textOrSlot(v, "title", "label");
    let count = at(v, "count");
    if (count === null) count = v.children.length;
    const dot = cssColor(at(v, "color"));
    const head = '<div class="mkd-boardcolumn__header">'
      + (dot ? `<span class="mkd-boardcolumn__dot" style="background:${esc(dot)}"></span>` : "")
      + `<span class="mkd-boardcolumn__title">${title}</span><span class="mkd-boardcolumn__count">`
      + `${esc(fmt(count))}</span><span class="mkd-boardcolumn__more">${this.icon("ellipsis")}</span></div>`;
    const add = bool(at(v, "addButton"), true) ? `<div class="mkd-boardcolumn__add">${this.icon("plus")} Add card</div>` : "";
    return this.open(v, "boardcolumn") + head + `<div class="mkd-boardcolumn__cards">${this.views(v.children)}</div>${add}</div>`;
  },
  kanbancard(v) {
    const title = this.textOrSlot(v, "title");
    const desc = this.textOrSlot(v, "description", "subtitle");
    const tags = iter(or(at(v, "tags", "labels"), []));
    const tagHtml = tags.map((t) => `<span class="mkd-kanbancard__tag" data-hue="${(ordSum(fmt(t)) % 8) + 1}">${esc(fmt(t))}</span>`).join("");
    const meta: string[] = [];
    if (pyBool(at(v, "due"))) meta.push(`<span class="mkd-kanbancard__meta">${this.icon("clock")}${esc(fmt(at(v, "due")))}</span>`);
    if (pyBool(at(v, "comments"))) meta.push(`<span class="mkd-kanbancard__meta">${this.icon("message")}${esc(fmt(at(v, "comments")))}</span>`);
    if (pyBool(at(v, "attachments"))) meta.push(`<span class="mkd-kanbancard__meta">${this.icon("paperclip")}${esc(fmt(at(v, "attachments")))}</span>`);
    let assignees = or(at(v, "assignees", "assignee"), []);
    if (typeof assignees === "string") assignees = [assignees];
    const avs = iter(assignees).map((a) => this.avatarHtml(fmt(a), null, v, "small", " mkd-kanbancard__avatar")).join("");
    const img = at(v, "image", "cover");
    let cover = "";
    if (typeof img === "string" && img) {
      const src = this.assets.resolve(img, v.loc);
      cover = src ? `<img class="mkd-kanbancard__cover" src="${esc(src)}" alt="">` : "";
    }
    const prio = at(v, "priority");
    return this.open(v, "kanbancard", "div", { data: pyBool(prio) ? { priority: name(prio) } : null }) + cover
      + (tagHtml ? `<div class="mkd-kanbancard__tags">${tagHtml}</div>` : "")
      + `<div class="mkd-kanbancard__title">${title}</div>`
      + (desc ? `<div class="mkd-kanbancard__desc">${desc}</div>` : "") + this.views(v.children)
      + (meta.length || avs ? `<div class="mkd-kanbancard__footer"><span class="mkd-kanbancard__metas">${meta.join("")}</span>`
        + `<span class="mkd-kanbancard__avatars">${avs}</span></div>` : "") + "</div>";
  },
  code(v) {
    const code = fmt(or(at(v, "code", "text", "content", "source"), ""));
    const lang = (name(at(v, "language", "lang")) || "").toLowerCase();
    const terminal = name(at(v, "variant")) === "terminal" || v.role === "terminal";
    const numbers = bool(at(v, "lineNumbers", "showLineNumbers"), !terminal);
    const hl = new Set(iter(or(at(v, "highlight", "highlightLines"), [])).filter((x) => typeof x === "number" || typeof x === "boolean")
      .map((x) => numValue(x as number | boolean)));
    const start = int(or0(num(at(v, "startLine"), 1), 1));
    const lines = code ? code.split("\n") : [""];
    const out = lines.map((line, i) => {
      const n = start + i;
      const body = !terminal ? highlight(line, lang) : terminalLine(line);
      return `<div class="mkd-code__line"${hl.has(n) ? HL : ""}>`
        + (numbers ? `<span class="mkd-code__num">${n}</span>` : "")
        + `<span class="mkd-code__text">${body || "&#8203;"}</span></div>`;
    });
    const tabs = at(v, "tabs", "files");
    const title = this.textOrSlot(v, "title", "filename");
    let head = "";
    if (terminal) {
      head = '<div class="mkd-code__bar"><span class="mkd-chrome__lights"><i data-light="close"></i><i '
        + 'data-light="min"></i><i data-light="max"></i></span>'
        + `<span class="mkd-code__title">${title || "Terminal"}</span></div>`;
    } else if (isList(tabs) && tabs.length) {
      const cur = fmt(or(at(v, "selectedTab"), tabs[0]));
      head = '<div class="mkd-code__tabs">' + tabs.map((t) =>
        `<span class="mkd-code__tab" aria-selected="${fmt(t) === cur ? "true" : "false"}">${esc(fmt(t))}</span>`).join("") + "</div>";
    } else if (title) {
      head = `<div class="mkd-code__bar"><span class="mkd-code__title">${title}</span></div>`;
    }
    return this.open(v, "code", "div", { data: { kind: terminal ? "terminal" : "editor", lang: lang || null } }) + head
      + `<div class="mkd-code__body">${out.join("")}</div></div>`;
  },
  message(v) {
    const sender = name(at(v, "from", "sender", "direction")) || "them";
    const mine = ["me", "outgoing", "self", "sent", "user"].includes(sender);
    const text = this.textOrSlot(v, "text", "content", "message");
    const author = this.textOrSlot(v, "author", "name");
    const time = this.textOrSlot(v, "time", "timestamp");
    const status = at(v, "status");
    const img = at(v, "image");
    let media = "";
    if (typeof img === "string" && img) {
      const src = this.assets.resolve(img, v.loc);
      media = src ? `<img class="mkd-message__image" src="${esc(src)}" alt="">` : "";
    }
    let av = "";
    if (!mine && (pyBool(at(v, "avatar")) || author)) {
      av = this.avatarHtml(fmt(or(at(v, "avatar"), stripTags(author))), at(v, "avatarImage"), v, "small", " mkd-message__avatar");
    }
    const reactions = iter(or(at(v, "reactions"), []));
    const react = reactions.map((r) => `<span class="mkd-message__reaction">${esc(fmt(r))}</span>`).join("");
    return this.open(v, "message", "div", { data: { from: mine ? "me" : "them", kind: name(at(v, "variant", "kind")) || null } }) + av
      + '<div class="mkd-message__stack">'
      + (author && !mine ? `<span class="mkd-message__author">${author}</span>` : "")
      + `<div class="mkd-message__bubble">${media}${text}${this.views(v.children)}</div>`
      + (react ? `<div class="mkd-message__reactions">${react}</div>` : "")
      + (time || pyBool(status) ? `<span class="mkd-message__time">${time}`
        + (pyBool(status) ? ` · ${esc(fmt(status))}` : "") + "</span>" : "")
      + "</div></div>";
  },
  tree(v) { return this.open(v, "tree", "div", { attrs: { role: "tree" } }) + this.views(v.children) + "</div>"; },
  treeitem(v) {
    const label = this.textOrSlot(v, "label", "title", "text");
    const kids = v.children.filter((c) => c.role === "treeitem");
    const others = v.children.filter((c) => c.role !== "treeitem");
    const expanded = bool(at(v, "expanded", "isExpanded"), kids.length > 0);
    let icon = at(v, "systemImage", "icon");
    if (!pyBool(icon) && bool(at(v, "folder"))) icon = "folder";
    const chevron = kids.length || bool(at(v, "hasChildren"))
      ? `<span class="mkd-treeitem__chevron">${this.icon(expanded ? "chevron.down" : "chevron.right")}</span>`
      : '<span class="mkd-treeitem__chevron"></span>';
    const detail = this.textOrSlot(v, "detail", "badge");
    const row = `<div class="mkd-treeitem__row">${chevron}`
      + (pyBool(icon) ? `<span class="mkd-treeitem__icon">${this.icon(icon, "mkd-icon", v)}</span>` : "")
      + `<span class="mkd-treeitem__label">${label}</span>${this.views(others)}`
      + (detail ? `<span class="mkd-treeitem__detail">${detail}</span>` : "") + "</div>";
    const children = kids.length && expanded ? `<div class="mkd-treeitem__children" role="group">${this.views(kids)}</div>` : "";
    return this.open(v, "treeitem", "div", { data: kids.length ? { expanded: expanded ? "true" : "false" } : null, attrs: { role: "treeitem" } })
      + row + children + "</div>";
  },
  timeline(v) {
    return this.open(v, "timeline", "div", { data: { orientation: name(at(v, "orientation")) || "vertical" } }) + this.views(v.children) + "</div>";
  },
  timelineitem(v) {
    const title = this.textOrSlot(v, "title", "label");
    const desc = this.textOrSlot(v, "description", "subtitle", "text");
    const time = this.textOrSlot(v, "time", "date", "timestamp");
    const icon = at(v, "systemImage", "icon");
    const status = name(at(v, "status", "color", "severity")) || "";
    const dot = `<span class="mkd-timelineitem__dot">${pyBool(icon) ? this.icon(icon, "mkd-icon", v) : ""}</span>`;
    return this.open(v, "timelineitem", "div", { data: { status: status || null, icon: pyBool(icon) ? "true" : null } })
      + `<div class="mkd-timelineitem__rail">${dot}<span class="mkd-timelineitem__line"></span></div>`
      + '<div class="mkd-timelineitem__content">'
      + (time ? `<div class="mkd-timelineitem__time">${time}</div>` : "")
      + `<div class="mkd-timelineitem__title">${title}</div>`
      + (desc ? `<div class="mkd-timelineitem__desc">${desc}</div>` : "")
      + this.views(v.children) + "</div></div>";
  },
  gantt(v) {
    let scale = iter(or(at(v, "scale", "columns", "periods"), [])).map(fmt);
    const tasks = iter(or(at(v, "tasks", "rows"), []));
    const spans = tasks.filter((t) => isSeq(t) && t.length >= 3).map((t) => int(num((t as unknown[])[1], 0)! + num((t as unknown[])[2], 1)!));
    const n = scale.length || (spans.length ? Math.max(...spans) : 6);
    if (!scale.length) scale = Array.from({ length: n }, (_, i) => String(i + 1));
    const today = num(at(v, "today", "now"), null);
    const rows: string[] = [];
    tasks.forEach((t, i) => {
      let nm: unknown, start: unknown, length: unknown, prog: unknown, grp: unknown;
      if (t instanceof PyDict) {
        nm = t.get("name", "");
        start = t.get("start", 0);
        length = t.get("length", t.get("duration", 1));
        prog = t.get("progress", null);
        grp = t.get("milestone", null);
      } else if (isSeq(t) && t.length >= 3) {
        [nm, start, length] = [t[0], t[1], t[2]];
        prog = t.length > 3 ? t[3] : null;
        grp = false;
      } else return;
      const left = or0(num(start, 0), 0) / n * 100;
      const width = or0(num(length, 1), 0) / n * 100;
      const milestone = or0(num(length, 1), 0) === 0 || bool(grp);
      let bar: string;
      if (milestone) bar = `<span class="mkd-gantt__milestone" style="left:${fx(left, 2)}%"></span>`;
      else {
        let progHtml = "";
        if (prog !== null) {
          const p = num(prog, 0)!;
          progHtml = `<span class="mkd-gantt__progress" style="width:${fx(pyMax(0, pyMin(100, p * (p <= 1 ? 100 : 1))), 0)}%"></span>`;
        }
        bar = `<span class="mkd-gantt__bar" style="left:${fx(left, 2)}%;width:${fx(width, 2)}%;--mkd-bar:var(--mkd-chart-`
          + `${(i % 6) + 1})">` + progHtml + "</span>";
      }
      rows.push(`<div class="mkd-gantt__row"><span class="mkd-gantt__name">${esc(fmt(nm))}</span>`
        + `<span class="mkd-gantt__track">${bar}</span></div>`);
    });
    const head = scale.map((s) => `<span>${esc(s)}</span>`).join("");
    const now = today !== null ? `<span class="mkd-gantt__today" style="left:${fx(today / n * 100, 2)}%"></span>` : "";
    return this.open(v, "gantt", "div", { style: { "--mkd-gantt-cols": String(n) } })
      + `<div class="mkd-gantt__head"><span class="mkd-gantt__name"></span><span class="mkd-gantt__scale">${head}</span></div>`
      + `<div class="mkd-gantt__body"><div class="mkd-gantt__grid"><span class="mkd-gantt__name"></span>`
      + `<span class="mkd-gantt__lines">${"<i></i>".repeat(n)}${now}</span></div>${rows.join("")}</div></div>`;
  },
  schedule(v) {
    const days = iter(or(at(v, "days", "columns"), ["Mon", "Tue", "Wed", "Thu", "Fri"])).map(fmt);
    const h0 = int(or0(num(at(v, "startHour"), 8), 8));
    const h1 = int(or0(num(at(v, "endHour"), 18), 18));
    const span = Math.max(h1 - h0, 1);
    const events = iter(or(at(v, "events"), []));
    const cols = days.map((d, di) => {
      const evs: string[] = [];
      events.forEach((e, i) => {
        let title: unknown, day: unknown, s: unknown, en: unknown, col: unknown;
        if (e instanceof PyDict) {
          [title, day, s, en, col] = [e.get("title", ""), e.get("day", null), e.get("start", null), e.get("end", null), e.get("color", null)];
        } else if (isSeq(e) && e.length >= 4) {
          [title, day, s, en] = [e[0], e[1], e[2], e[3]];
          col = e.length > 4 ? e[4] : null;
        } else return;
        if (fmt(day) !== d && !pyEq(day, di)) return;
        const top = (or0(num(s, h0), h0) - h0) / span * 100;
        const hgt = (or0(num(en, h0 + 1), h0 + 1) - or0(num(s, h0), h0)) / span * 100;
        const c = cssColor(col) || `var(--mkd-chart-${(i % 6) + 1})`;
        evs.push(`<span class="mkd-schedule__event" style="top:${fx(top, 2)}%;height:${fx(hgt, 2)}%;--mkd-ev:${esc(c)}">`
          + `<span class="mkd-schedule__event-title">${esc(fmt(title))}</span>`
          + `<span class="mkd-schedule__event-time">${hour(s)}–${hour(en)}</span></span>`);
      });
      const sel = fmt(or(at(v, "today"), "")) === d ? ' aria-selected="true"' : "";
      return `<div class="mkd-schedule__day"${sel}><div class="mkd-schedule__dayhead">${esc(d)}</div>`
        + `<div class="mkd-schedule__slots">${"<i></i>".repeat(span)}${evs.join("")}</div></div>`;
    });
    const hours: string[] = [];
    for (let h = h0; h < h1; h++) hours.push(`<span>${hour(h)}</span>`);
    const now = num(at(v, "now"), null);
    const nowHtml = now !== null ? `<span class="mkd-schedule__now" style="top:${fx((now - h0) / span * 100, 2)}%"></span>` : "";
    return this.open(v, "schedule", "div", { style: { "--mkd-hours": String(span) } })
      + '<div class="mkd-schedule__hours"><div class="mkd-schedule__dayhead"></div>'
      + `<div class="mkd-schedule__hourlist">${hours.join("")}</div></div>`
      + `<div class="mkd-schedule__days">${cols.join("")}${nowHtml}</div></div>`;
  },
  kbd(v) {
    const keys = at(v, "keys", "shortcut", "text", "key");
    const parts = isList(keys) ? keys : [keys];
    return this.open(v, "kbd", "span") + parts.filter((k) => k !== null).map((k) => `<kbd class="mkd-kbd__key">${esc(fmt(k))}</kbd>`).join("") + "</span>";
  },
  skeleton(v) {
    const lines = int(or0(num(at(v, "lines", "rows"), 3), 0));
    const avatar = bool(at(v, "avatar"));
    const image = bool(at(v, "image", "media"));
    const shape = name(at(v, "shape"));
    if (["circle", "rectangle", "text"].includes(shape)) {
      return this.open(v, "skeleton", "div", { data: { shape } }) + '<span class="mkd-skeleton__block"></span></div>';
    }
    const widths = [100, 92, 76, 84, 60];
    const bars = Array.from({ length: Math.max(0, lines) }, (_, i) => `<span class="mkd-skeleton__line" style="width:${widths[i % 5]}%"></span>`).join("");
    return this.open(v, "skeleton")
      + (image ? '<span class="mkd-skeleton__image"></span>' : "")
      + '<div class="mkd-skeleton__row">'
      + (avatar ? '<span class="mkd-skeleton__avatar"></span>' : "")
      + `<div class="mkd-skeleton__lines">${bars}</div></div></div>`;
  },
  swatches(v) {
    const colors = iter(or(at(v, "colors", "palette"), []));
    const sel = at(v, "selection", "selected");
    const out = colors.map((c, i) => {
      const css = cssColor(c) || "transparent";
      const on = (typeof sel === "number" && sel === i) || fmt(sel) === fmt(c);
      return `<span class="mkd-swatches__swatch" style="--mkd-swatch:${esc(css)}" aria-selected="${on ? "true" : "false"}"></span>`;
    });
    const label = this.content(at(v, "label", "title"));
    return this.open(v, "swatches") + (label ? `<span class="mkd-swatches__label">${label}</span>` : "")
      + `<span class="mkd-swatches__items">${out.join("")}</span></div>`;
  },
  canvas(v) {
    const style: Record<string, string> = {};
    const length = u(num(at(v, "height")));
    if (length !== null) style.height = length;
    const grid = name(at(v, "grid", "background")) || "";
    return this.open(v, "canvas", "div", { data: { grid: grid || null }, style }) + this.views(v.children) + "</div>";
  },
  media(v) {
    const img = at(v, "image", "poster", "thumbnail", "url");
    const src = typeof img === "string" && img ? this.assets.resolve(img, v.loc) : null;
    const prog = num(at(v, "progress", "value"), null);
    const dur = fmt(or(at(v, "duration"), ""));
    const cur = fmt(or(at(v, "time", "currentTime"), ""));
    const playing = bool(at(v, "playing"));
    const poster = src ? `<img class="mkd-media__poster" src="${esc(src)}" alt="">`
      : `<span class="mkd-media__poster mkd-media__poster--empty">${this.icon("video")}</span>`;
    const frac = prog !== null && prog <= 1 ? prog : or0(prog, 0) / 100;
    const bar = `<div class="mkd-media__controls"><span class="mkd-media__btn">${this.icon(playing ? "pause" : "play")}`
      + `</span><span class="mkd-media__time">${esc(cur)}</span><span class="mkd-media__scrub"><span `
      + `class="mkd-media__fill" style="width:${fx(frac * 100, 1)}%">`
      + `</span></span><span class="mkd-media__time">${esc(dur)}</span><span class="mkd-media__btn">`
      + `${this.icon("speaker")}</span></div>`;
    const center = playing ? "" : `<span class="mkd-media__play">${this.icon("play")}</span>`;
    return this.open(v, "media") + poster + center + bar + "</div>";
  },
  emptystate(v) {
    const icon = or(at(v, "systemImage", "icon"), "tray");
    const title = this.textOrSlot(v, "title", "label");
    const desc = this.textOrSlot(v, "description", "message", "subtitle");
    const actions = this.views(v.children) + this.slot(v, "actions");
    return this.open(v, "emptystate") + `<span class="mkd-emptystate__icon">${this.icon(icon, "mkd-icon", v)}</span>`
      + `<span class="mkd-emptystate__title">${title}</span>`
      + (desc ? `<span class="mkd-emptystate__desc">${desc}</span>` : "")
      + (actions ? `<div class="mkd-emptystate__actions">${actions}</div>` : "") + "</div>";
  },
  stat(v) {
    const label = this.textOrSlot(v, "label", "title");
    const value = this.textOrSlot(v, "value");
    const change = at(v, "change", "delta", "trendValue");
    let positive = at(v, "positive");
    if (positive === null && typeof change === "string") {
      const s = change.replace(LEADING_WS, "");
      positive = !(s.startsWith("-") || s.startsWith("−") || s.startsWith("–"));
    }
    const icon = at(v, "systemImage", "icon");
    const trend = at(v, "trend", "sparkline");
    let spark = "";
    if (isList(trend) && trend.length) {
      spark = renderChart(chartSpec("sparkline", { series: [trend.map((x) => or0(num(x, 0), 0.0))], width: 120, height: 32 }));
    }
    return this.open(v, "stat")
      + '<div class="mkd-stat__head">'
      + `<span class="mkd-stat__label">${label}</span>`
      + (pyBool(icon) ? `<span class="mkd-stat__icon">${this.icon(icon, "mkd-icon", v)}</span>` : "") + "</div>"
      + `<div class="mkd-stat__value">${value}</div>`
      + (change !== null ? '<div class="mkd-stat__foot"><span class="mkd-stat__change" data-positive='
        + `"${bool(positive, true) ? "true" : "false"}">${esc(fmt(change))}</span>`
        + (pyBool(at(v, "caption")) ? `<span class="mkd-stat__caption">${this.content(at(v, "caption"))}</span>` : "")
        + "</div>" : "")
      + (spark ? `<div class="mkd-stat__spark">${spark}</div>` : "") + "</div>";
  },
  map(v) {
    const pins = iter(or(at(v, "pins", "markers"), []));
    const style: Record<string, string> = {};
    const length = u(num(at(v, "height")));
    if (length !== null) style.height = length;
    const out = pins.map((p, i) => {
      let x: number | null, y: number | null, lab: string;
      if (isSeq(p) && p.length >= 2) {
        x = num(p[0], 50);
        y = num(p[1], 50);
        lab = p.length > 2 ? fmt(p[2]) : "";
      } else if (p instanceof PyDict) {
        x = num(p.get("x", null), 50);
        y = num(p.get("y", null), 50);
        lab = fmt(p.get("label", ""));
      } else {
        x = 30 + (i * 17) % 60;
        y = 35 + (i * 23) % 40;
        lab = fmt(p);
      }
      return `<span class="mkd-map__pin" style="left:${fx(x!, 1)}%;top:${fx(y!, 1)}%">${this.icon("mappin")}`
        + (lab ? `<span class="mkd-map__label">${esc(lab)}</span>` : "") + "</span>";
    });
    let route = "";
    if (bool(at(v, "route")) && pins.length >= 2) {
      const pts: string[] = [];
      for (const p of pins) if (isSeq(p) && p.length >= 2) pts.push(`${fx(num(p[0], 50)!, 1)},${fx(num(p[1], 50)!, 1)}`);
      route = '<svg class="mkd-map__route" viewBox="0 0 100 100" preserveAspectRatio="none">'
        + `<polyline points="${pts.join(" ")}"/></svg>`;
    }
    return this.open(v, "map", "div", { style }) + MAP_SVG + route + out.join("")
      + (bool(at(v, "showsUserLocation", "userLocation"))
        ? `<span class="mkd-map__me" style="left:${fx(num(at(v, "userX"), 50)!, 1)}%;top:${fx(num(at(v, "userY"), 55)!, 1)}%"></span>` : "")
      + "</div>";
  },
};
