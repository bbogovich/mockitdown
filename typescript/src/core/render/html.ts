/**
 * HTML renderer: resolved view tree → markup (port of `mockitdown.render.html`).
 *
 * Every element renders through its *role*. A role fixes the markup — the class `mkd-<role>` on the
 * root and BEM-style `mkd-<role>__<part>` children — and packs only restyle it. No markup is
 * interactive: controls are spans with ARIA roles, links do not navigate, and nothing needs
 * JavaScript.
 */

import type { AssetResolver } from "../asset-resolver.js";
import type { Diagnostics } from "../diagnostics.js";
import { iconSvg } from "../icons.js";
import { CallValue, EnumValue, Thunk, View, ViewList } from "../model.js";
import type { Pack } from "../packs/registry.js";
import { pyFormatG, pyMax, pyMin, pyRoundTo } from "../pyformat.js";
import { intStr, isList, isSeq, isTuple, PyDict, pyBool, pyEq, pyRepr, pyStr, PyFloat } from "../values.js";
import { chartHasData, chartSpec, renderChart } from "./charts.js";
import { cssColor, fontStyle, StyleBuilder, styleAttr, u, type DataMap, type StyleMap } from "./style.js";
import {
  addDays, bool, colName, cursorSvg, DATE_MIN, dateKey, decorate, esc, fmt, formatDate, fx, highlight, hour, initials, int, isIn,
  isNum, isNumOrBool, isoDate, iter, len, MAP_SVG, monthAbbr, monthDates, monthLen, monthName, name, num, numValue, or, or0,
  ordSum, parseDate, parseRange, parseTime, PY_WS, pyRound, terminalLine, textHtml, weekday, type PyDate,
} from "./util.js";

/** Element attributes copied verbatim to `data-<name>` when they are simple values. */
const PASSTHROUGH = ["variant", "size", "color", "shape", "density", "elevation", "placement", "orientation",
  "emphasis", "design", "severity", "kind", "labelStyle", "position", "level", "side",
  "withHandle", "direction", "labelPlacement", "rowsPerPage"];
const SAFE_TOKEN = /^[A-Za-z0-9_. -]{1,40}\n?$/;
const LEADING_WS = new RegExp(`^[${PY_WS}]+`, "u");
const PH = ' data-placeholder="true"';
const SEL = ' data-sel="true"';
const HL = ' data-hl="true"';
const PRESENTATIONS = ["alert", "sheet", "confirmationDialog", "fullScreenCover", "popover", "inspector"];
/** The anchor of a tooltip written without content (R-DEV-008.C5). */
const TOOLTIP_PLACEHOLDER = '<span class="mkd-button" data-placeholder="true" role="button">'
  + '<span class="mkd-button__label">Button</span></span>';
const DECORATIONS = ["callout", "annotation", "pointer", "cursor", "marquee", "dragSelect", "highlight", "tap"];
/** Dialog variants whose Button children are their actions, as in SwiftUI's alert and confirmation dialog. */
const ACTION_DIALOGS = ["alert", "action-sheet"];
const OPTION_ROLES = ["text", "label", "button", "listitem", "menuitem", "tab", "radio"];
/** SwiftUI picker styles showing one value: without `selection:` they show the first option (R-PACK-014.C6). */
const PICKER_FIRST = ["automatic", "menu", "navigationLink", "palette", "wheel"];
/** SwiftUI picker styles drawing their options; without options they fall back to the menu style. */
const PICKER_OPTIONS = ["segmented", "palette", "inline", "radioGroup", "radio", "wheel"];
/** SwiftUI date picker styles (R-PACK-014.C2): they always show a selection, 23 Nov 2026 9:41 AM by default. */
const DATE_STYLES = ["automatic", "compact", "graphical", "wheel", "field", "stepperField"];
const DEFAULT_DATE: PyDate = { year: 2026, month: 11, day: 23 };
const DEFAULT_TIME: [number, number] = [9, 41];
const WEEKDAY_ABBR = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
/** The open 240-degree arc of an accessoryCircular gauge (centre 12,12, radius 9, gap at the bottom). */
const GAUGE_ARC = "M4.21 16.5A9 9 0 1 1 19.79 16.5";

/** Whether `c` is one of a picker's options. */
function isOption(c: View): boolean {
  return OPTION_ROLES.includes(c.role) || at(c, "tag") !== null;
}

const PLACEMENT: Record<string, string> = {
  topBarLeading: "leading", navigationBarLeading: "leading", cancellationAction: "leading",
  navigation: "leading", topBarTrailing: "trailing", navigationBarTrailing: "trailing",
  primaryAction: "trailing", confirmationAction: "trailing", automatic: "trailing",
  principal: "principal", bottomBar: "bottom", status: "bottom", secondaryAction: "trailing",
  destructiveAction: "trailing", keyboard: "bottom", title: "principal", largeTitle: "principal",
};

function has(o: object, k: string): boolean {
  return Object.prototype.hasOwnProperty.call(o, k);
}

/** `v.attr(*names)`. */
function at(v: View, ...names: string[]): unknown {
  return v.attr(names);
}

/** `v.attrs.get(name)`. */
function raw(v: View, key: string): unknown {
  return v.attrs.get(key, null);
}

function stripTags(s: string): string {
  return s.replace(/<[^>]+>/g, "");
}

type Options = [string, string][];

interface Tab {
  label: unknown;
  icon: unknown;
  badge: unknown;
  content: View[];
  selected: boolean;
  disabled: boolean;
}

interface OpenOpts {
  cls?: string;
  data?: Record<string, unknown> | Map<string, unknown> | null;
  style?: Record<string, string> | Map<string, string> | null;
  attrs?: Record<string, unknown> | null;
}

function entries<V>(o: Record<string, V> | Map<string, V> | null | undefined): [string, V][] {
  if (!o) return [];
  return o instanceof Map ? [...o] : Object.entries(o);
}

export class Renderer {
  readonly pack: Pack;
  readonly diags: Diagnostics;
  readonly assets: AssetResolver;
  readonly styles: StyleBuilder;
  overlays: string[] = [];
  /** "list" | "form" while rendering rows. */
  rowWrap: string | null = null;
  /** The selection of the List being rendered. */
  listSelection: string | null = null;
  inMenu = false;
  chartSeq = 0;
  /** Prefix making anchor names unique per figure on a page (set by the document assembler). */
  anchorPrefix = "a";
  anchorSeq = 0;

  constructor(pack: Pack, diags: Diagnostics, assets: AssetResolver) {
    this.pack = pack;
    this.diags = diags;
    this.assets = assets;
    this.styles = new StyleBuilder((n) => pack.font(n), diags);
  }

  // --- infrastructure ---------------------------------------------------------------------------

  views(views: readonly View[]): string {
    return views.map((v) => this.view(v)).join("");
  }

  view(v: View): string {
    const key = v.role.split("-").join("_");
    let handler = has(ROLES, key) ? ROLES[key] : undefined;
    if (handler === undefined) {
      this.diags.error(`pack ${pyRepr(this.pack.id)}: element ${pyRepr(v.name)} has unknown role ${pyRepr(v.role)}`, v.loc, "role");
      handler = ROLES.unknown;
    }
    const savedMenu = this.inMenu;
    let out = handler.call(this, v);
    this.inMenu = savedMenu;
    out = this.wrapOverlays(v, out);
    this.collectPresentations(v);
    return out;
  }

  open(v: View, role: string, tag = "div", opts: OpenOpts = {}): string {
    const [mstyle, mdata, mcls] = this.styles.build(v);
    const classes = [`mkd-${role}`, ...(opts.cls ? [opts.cls] : []), ...mcls];
    const parts = [`<${tag} class="${esc(classes.join(" "))}" data-el="${esc(v.name)}"`];
    if (v.component) parts.push(` data-component="${esc(v.component)}"`);
    const d: DataMap = new Map();
    for (const key of PASSTHROUGH) {
      let val = raw(v, key);
      if (val instanceof EnumValue) val = val.name;
      if (typeof val === "boolean") val = val ? "true" : "false";
      if ((typeof val === "string" || isNum(val)) && SAFE_TOKEN.test(pyStr(val))) d.set(key, pyStr(val));
    }
    let state = at(v, "state");
    if (bool(at(v, "disabled"))) state = "disabled";
    else if (!isIn(at(v, "error"), [null, false, ""])) state = or(state, "error");
    if (pyBool(state)) d.set("state", name(state));
    if (bool(at(v, "selected"))) d.set("selected", "true");
    for (const [k, val] of entries(opts.data)) d.set(k, val);
    for (const [k, val] of mdata) d.set(k, val);
    for (const [k, val] of d) {
      if (val !== null && val !== undefined) parts.push(` data-${k}="${esc(val)}"`);
    }
    const st: StyleMap = new Map(entries(opts.style));
    for (const [k, val] of mstyle) st.set(k, val);
    if (st.size) parts.push(` style="${esc(styleAttr(st))}"`);
    const helpMod = v.mod("help");
    if (helpMod && helpMod.arg() !== null) parts.push(` title="${esc(fmt(helpMod.arg()))}"`);
    for (const [k, val] of entries(opts.attrs)) {
      if (val !== null && val !== undefined) parts.push(` ${k}="${esc(val)}"`);
    }
    return parts.join("") + ">";
  }

  icon(nameValue: unknown, cls = "mkd-icon", v: View | null = null): string {
    const n0 = name(nameValue);
    if (!n0) return "";
    const n = this.pack.icons.get(n0, n0);
    const [markup, found] = iconSvg(pyStr(n), cls);
    if (!found) this.diags.warning(`unknown icon ${pyRepr(n)}`, v ? v.loc : null, "icon");
    return markup;
  }

  /** Markup for a text-or-views attribute value. */
  content(value: unknown): string {
    if (value instanceof ViewList) return this.views(value.views);
    if (value === null || value === undefined || value instanceof Thunk) return "";
    return textHtml(fmt(value));
  }

  slot(v: View, ...names: string[]): string {
    for (const n of names) if (v.slots.has(n)) return this.views(v.slots.get(n)!);
    return "";
  }

  textOrSlot(v: View, ...names: string[]): string {
    for (const n of names) {
      if (v.slots.has(n)) return this.views(v.slots.get(n)!);
      const val = raw(v, n);
      if (!isIn(val, [null, ""])) return this.content(val);
    }
    return "";
  }

  badgeHtml(value: unknown, cls = "mkd-badge"): string {
    if (isIn(value, [null, false, ""]) || value instanceof ViewList || value instanceof Thunk) return "";
    const text = value === true ? "" : fmt(value);
    const dot = !text ? ' data-dot="true"' : "";
    return `<span class="${cls}"${dot}>${esc(text)}</span>`;
  }

  /** Icon, image or avatar named by the common attributes, or ''. */
  leadingVisual(v: View, sizeCls = ""): string {
    const icon = at(v, "systemImage", "icon", "systemName", "leadingIcon", "startIcon");
    if (pyBool(icon)) {
      const tint = cssColor(at(v, "iconColor"));
      const style = tint ? ` style="--mkd-icon-tint:${esc(tint)}"` : "";
      const tinted = tint ? ' data-tinted="true"' : "";
      return `<span class="mkd-leading-icon${sizeCls}"${tinted}${style}>${this.icon(icon, "mkd-icon", v)}</span>`;
    }
    const img = at(v, "image", "thumbnail");
    if (typeof img === "string" && img) {
      const src = this.assets.resolve(img, v.loc);
      if (src) return `<img class="mkd-thumb" src="${esc(src)}" alt="">`;
      return `<span class="mkd-thumb mkd-thumb--missing">${this.icon("photo")}</span>`;
    }
    const av = at(v, "avatar");
    if (pyBool(av)) return this.avatarHtml(!(av instanceof ViewList) ? fmt(av) : "", null, v);
    return "";
  }

  avatarHtml(nameText: string, image: unknown, v: View, size = "", extra = ""): string {
    const src = typeof image === "string" && image ? this.assets.resolve(image, v.loc) : null;
    const hue = nameText ? (ordSum(nameText) % 8) + 1 : 1;
    const sizeAttr = size ? ` data-size="${esc(size)}"` : "";
    const inner = src ? `<img src="${esc(src)}" alt="">` : (esc(initials(nameText)) || this.icon("person"));
    return `<span class="mkd-avatar${extra}" data-hue="${hue}"${sizeAttr}>${inner}</span>`;
  }

  decorations(v: View): string {
    const items: string[] = [];
    for (const m of v.modifiers) {
      if (!DECORATIONS.includes(m.name)) continue;
      const align = m.kwargs.get("alignment", m.kwargs.get("at", null));
      const a = align instanceof EnumValue ? align.name : "";
      const c = cssColor(m.kwargs.get("color", null));
      const cstyle = c ? ` style="--mkd-callout:${esc(c)}"` : "";
      if (m.name === "callout" || m.name === "annotation") {
        const n = fmt(m.arg(0, ""));
        const label = m.args.length > 1 ? m.arg(1) : m.kwargs.get("text", m.kwargs.get("label", null));
        const inset = bool(m.kwargs.get("inset", null)) ? ' data-inset="true"' : "";
        const side = name(m.kwargs.get("labelSide", null));
        const sideAttr = side === "leading" || side === "trailing" ? ` data-side="${esc(side)}"` : "";
        items.push(`<span class="mkd-deco__callout" data-align="${esc(a || "topLeading")}"${inset}${sideAttr}${cstyle}>`
          + `<span class="mkd-callout__badge">${esc(n)}</span>`
          + (pyBool(label) ? `<span class="mkd-callout__text">${textHtml(fmt(label))}</span>` : "")
          + "</span>");
      } else if (m.name === "pointer" || m.name === "cursor") {
        const kind = name(m.arg()) || name(m.kwargs.get("kind", null)) || "arrow";
        items.push(`<span class="mkd-deco__pointer" data-align="${esc(a || "center")}">`
          + `<span class="mkd-pointer" data-kind="${esc(kind)}">${cursorSvg(kind)}</span></span>`);
      } else if (m.name === "marquee" || m.name === "dragSelect") {
        const c2 = cssColor(m.arg()) || c;
        const st = c2 ? ` style="--mkd-marquee:${esc(c2)}"` : "";
        items.push(`<span class="mkd-deco__marquee"${st}></span>`);
      } else if (m.name === "highlight") {
        const c2 = cssColor(m.arg()) || c;
        const st = c2 ? ` style="--mkd-highlight:${esc(c2)}"` : "";
        items.push(`<span class="mkd-deco__highlight"${st}></span>`);
      } else if (m.name === "tap") {
        items.push(`<span class="mkd-deco__tap" data-align="${esc(a || "center")}"></span>`);
      }
    }
    return items.join("");
  }

  wrapOverlays(v: View, outIn: string): string {
    let out = outIn;
    const deco = this.decorations(v);
    if (deco && out) {
      this.anchorSeq += 1;
      const anchor = `--mkd-${this.anchorPrefix}-${this.anchorSeq}`;
      this.overlays.push(`<div class="mkd-anchored" style="position-anchor:${anchor}">${deco}</div>`);
      const layer = `<div class="mkd-deco__layer">${deco}</div>`;
      out = decorate(out, anchor, layer);
    }
    for (const m of v.modifiers) {
      if (m.name === "overlay" && m.content && m.content.length) {
        const align = m.kwargs.get("alignment", m.arg());
        const a = align instanceof EnumValue ? align.name : "center";
        out = `<div class="mkd-overlay-host"><div class="mkd-overlay-host__base">${out}</div>`
          + `<div class="mkd-overlay-host__layer" data-align="${esc(a)}">${this.views(m.content)}`
          + "</div></div>";
      } else if (m.name === "background" && m.content && m.content.length) {
        out = `<div class="mkd-overlay-host"><div class="mkd-overlay-host__under">${this.views(m.content)}`
          + `</div><div class="mkd-overlay-host__base">${out}</div></div>`;
      }
    }
    return out;
  }

  collectPresentations(v: View): void {
    for (const m of v.modifiers) {
      if (!PRESENTATIONS.includes(m.name)) continue;
      const presented = m.kwargs.get("isPresented", m.kwargs.get("item", true));
      if (!bool(presented, true)) continue;
      const title = m.args.length && !(m.arg() instanceof ViewList) ? fmt(m.arg()) : "";
      const body = this.views(m.content ?? []);
      if (m.name === "alert" || m.name === "confirmationDialog") {
        const message = this.views(m.slots.get("message") ?? []);
        const kind = m.name === "alert" ? "alert" : "action-sheet";
        const actions = body || '<span class="mkd-button" role="button" data-variant="primary">'
          + '<span class="mkd-button__label">OK</span></span>';
        this.overlays.push(
          `<div class="mkd-layer" data-kind="${kind}"><div class="mkd-scrim"></div>`
          + `<div class="mkd-dialog" data-variant="${kind}" role="alertdialog">`
          + (title ? `<div class="mkd-dialog__title">${textHtml(title)}</div>` : "")
          + (message ? `<div class="mkd-dialog__body">${message}</div>` : "")
          + `<div class="mkd-dialog__actions">${actions}</div></div></div>`);
      } else {
        const kind = ({ sheet: "sheet", fullScreenCover: "cover", popover: "popover", inspector: "inspector" } as Record<string, string>)[m.name];
        this.overlays.push(`<div class="mkd-layer" data-kind="${kind}">`
          + (kind === "sheet" ? '<div class="mkd-scrim"></div>' : "")
          + `<div class="mkd-presented" data-kind="${kind}">`
          + (kind === "sheet" ? '<div class="mkd-presented__grabber"></div>' : "")
          + (kind === "popover" ? '<span class="mkd-presented__arrow"></span>' : "")
          + `${body}</div></div>`);
      }
    }
  }

  // --- helpers shared by roles -------------------------------------------------------------------

  stack(v: View, role: string): string {
    const style: Record<string, string> = {};
    const length = u(num(at(v, "spacing", "gap")));
    if (length !== null) style.gap = length;
    const align = at(v, "alignment", "align");
    const data: Record<string, unknown> = pyBool(align) ? { align: name(align) } : {};
    if (bool(at(v, "wrap"))) data.wrap = "true";
    return this.open(v, role, "div", { data, style }) + this.views(v.children) + "</div>";
  }

  /** (plain label, markup) pairs from `options`/`items` or children. */
  options(v: View): Options {
    const opts = at(v, "options", "items", "choices", "segments");
    const out: Options = [];
    if (isSeq(opts)) {
      for (const o of opts) {
        if (o instanceof PyDict) {
          const lab = fmt(o.get("label", o.get("title", "")));
          const icon = o.get("icon", o.get("systemImage", null));
          out.push([lab, (pyBool(icon) ? `<span class="mkd-option__icon">${this.icon(icon, "mkd-icon", v)}</span>` : "") + textHtml(lab)]);
        } else out.push([fmt(o), textHtml(fmt(o))]);
      }
    } else {
      for (const c of v.children) {
        if (isOption(c)) {
          const lab = fmt(at(c, "content", "title", "label", "text"));
          const saved = this.inMenu;
          this.inMenu = false;
          const markup = OPTION_ROLES.includes(c.role) && c.role !== "label" ? textHtml(lab) : this.view(c);
          this.inMenu = saved;
          out.push([lab, markup]);
        }
      }
    }
    return out;
  }

  /** The `.tag` of each option taken from the children (parallel to `options`). */
  optionTags(v: View): (string | null)[] {
    if (isSeq(at(v, "options", "items", "choices", "segments"))) return [];
    return v.children.filter(isOption).map((c) => (at(c, "tag") === null ? null : fmt(at(c, "tag"))));
  }

  selectedIndex(v: View, options: Options): number {
    const sel = at(v, "selection", "selected", "value", "current", "active");
    if (typeof sel === "boolean") return -1;
    if (isNum(sel)) return int(numValue(sel));
    const n = fmt(sel);
    for (let i = 0; i < options.length; i++) if (options[i][0] === n) return i;
    if (sel !== null) {
      const tags = this.optionTags(v);
      if (tags.includes(n)) return tags.indexOf(n);
    }
    return sel !== null ? -1 : 0;
  }

  field(v: View, role: string, valueHtml: string, o: {
    placeholder: boolean; kind?: string; endIcon?: string; popup?: string; controlExtra?: string; style?: Record<string, string> | null;
    attrs?: Record<string, unknown> | null;
  }): string {
    const label = this.textOrSlot(v, "label", "title", "header");
    let helper = this.textOrSlot(v, "helper", "helperText", "supportingText", "description", "hint", "footer");
    const err = at(v, "error", "errorMessage");
    if (typeof err === "string" && err) helper = textHtml(err);
    const data: Record<string, unknown> = { filled: o.placeholder ? "false" : "true" };
    const kind = o.kind ?? "";
    if (kind) data.kind = kind;
    if (label) data.labeled = "true";
    let icon = at(v, "systemImage", "icon", "leadingIcon", "startIcon");
    if (!pyBool(icon) && kind === "search") icon = "magnifyingglass";
    const parts: string[] = [];
    if (label) {
      const req = bool(at(v, "required")) ? '<span class="mkd-field__required">*</span>' : "";
      parts.push(`<label class="mkd-field__label">${label}${req}</label>`);
    }
    const ctrl: string[] = [];
    if (pyBool(icon)) ctrl.push(`<span class="mkd-field__icon">${this.icon(icon, "mkd-icon", v)}</span>`);
    const prefix = at(v, "prefix");
    if (pyBool(prefix)) ctrl.push(`<span class="mkd-field__prefix">${esc(fmt(prefix))}</span>`);
    ctrl.push(`<span class="mkd-field__input"${o.placeholder ? PH : ""}>${valueHtml}</span>`);
    const suffix = at(v, "suffix", "unit");
    if (pyBool(suffix)) ctrl.push(`<span class="mkd-field__suffix">${esc(fmt(suffix))}</span>`);
    ctrl.push(o.controlExtra ?? "");
    if (bool(at(v, "clearButton", "clearable")) && !o.placeholder) {
      ctrl.push(`<span class="mkd-field__icon mkd-field__icon--end">${this.icon("xmark.circle")}</span>`);
    }
    const trailing = at(v, "trailingIcon", "endIcon");
    if (pyBool(trailing)) ctrl.push(`<span class="mkd-field__icon mkd-field__icon--end">${this.icon(trailing, "mkd-icon", v)}</span>`);
    if (o.endIcon) ctrl.push(`<span class="mkd-field__icon mkd-field__icon--end">${this.icon(o.endIcon)}</span>`);
    parts.push(`<div class="mkd-field__control">${ctrl.join("")}</div>`);
    if (helper) parts.push(`<div class="mkd-field__helper">${helper}</div>`);
    const count = at(v, "counter", "maxLength");
    if (pyBool(count)) parts.push(`<div class="mkd-field__counter">${esc(fmt(count))}</div>`);
    return this.open(v, role, "div", { cls: "mkd-field", data, style: o.style ?? null, attrs: o.attrs ?? null })
      + parts.join("") + (o.popup ?? "") + "</div>";
  }

  calendarOf(v: View, sel: unknown): string {
    const today: PyDate = { year: 2026, month: 11, day: 23 };
      const d = parseDate(sel) ?? today;
      const year = int(or0(num(at(v, "year"), d.year), d.year));
      const month = int(or0(num(at(v, "month"), d.month), d.month));
      const first = int(or0(num(at(v, "firstWeekday"), 0), 0)); // 0 = Sunday
      const marked = new Set(iter(or(at(v, "events", "marked"), [])).map((x) => dateKey(parseDate(x) ?? DATE_MIN)));
      const rng = at(v, "range");
      const r0 = isList(rng) && rng.length === 2 ? parseDate(rng[0]) : null;
      const r1 = isList(rng) && rng.length === 2 ? parseDate(rng[1]) : null;
      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const order = Array.from({ length: 7 }, (_, i) => days[(((first + i) % 7) + 7) % 7]);
      const head = order.map((w) => `<span class="mkd-calendar__weekday">${this.pack.id === "swiftui" ? w.slice(0, 1) : w.slice(0, 2)}</span>`).join("");
      const cells: string[] = [];
      const dk = dateKey(d);
      for (const day of monthDates(year, month, (((first - 1) % 7) + 7) % 7)) {
        const attrs: string[] = [];
        const k = dateKey(day);
        if (day.month !== month) attrs.push('data-outside="true"');
        if (pyBool(sel) && k === dk) attrs.push('aria-selected="true"');
        if (r0 && r1 && dateKey(r0) <= k && k <= dateKey(r1)) attrs.push('data-in-range="true"');
        if (marked.has(k)) attrs.push('data-marked="true"');
        if (k === dateKey(today) && bool(at(v, "showToday"), false)) attrs.push('data-today="true"');
        cells.push(`<span class="mkd-calendar__day" ${attrs.join(" ")}>${day.day}</span>`);
      }
      const title = `${monthName(month)} ${year}`;
      const label = this.content(at(v, "label", "title"));
      return this.open(v, "calendar")
        + (label ? `<div class="mkd-calendar__label">${label}</div>` : "")
        + `<div class="mkd-calendar__header"><span class="mkd-calendar__title">${esc(title)}`
        + `<span class="mkd-calendar__title-chevron">${this.icon("chevron.right")}</span></span>`
        + `<span class="mkd-calendar__nav">${this.icon("chevron.left")}${this.icon("chevron.right")}</span></div>`
        + `<div class="mkd-calendar__grid">${head}${cells.join("")}</div></div>`;
  }

  /** A SwiftUI date picker style (R-PACK-014.C2); without a selection, 23 Nov 2026 9:41 AM. */
  dateStyle(v: View, variant: string): string {
    const value = at(v, "selection", "date", "value", "text");
    const d = parseDate(value) ?? DEFAULT_DATE;
    const [hh, mm] = parseTime(value) ?? DEFAULT_TIME;
    if (variant === "graphical") return this.calendarOf(v, isoDate(d));
    const comps = at(v, "displayedComponents", "components");
    const names = isSeq(comps) ? [...comps].map((c) => name(c)) : pyBool(comps) ? [name(comps)] : [];
    const showDate = !names.length || names.includes("date") || !names.includes("hourAndMinute");
    const showTime = !names.length || names.includes("hourAndMinute");
    const h12 = hh % 12 || 12;
    const ampm = hh < 12 ? "AM" : "PM";
    const time = `${h12}:${String(mm).padStart(2, "0")} ${ampm}`;
    const range = [-2, -1, 0, 1, 2];
    if (variant === "wheel") {
      const cols: [string[], number][] = [];
      if (showDate && showTime) {
        cols.push([range.map((k) => {
          const x = addDays(d, k);
          return `${WEEKDAY_ABBR[weekday(x.year, x.month, x.day)]} ${monthAbbr(x.month)} ${x.day}`;
        }), 2]);
      } else if (showDate) {
        const last = monthLen(d.year, d.month);
        cols.push([range.map((k) => monthName((((d.month - 1 + k) % 12) + 12) % 12 + 1)), 2]);
        cols.push([range.map((k) => String((((d.day - 1 + k) % last) + last) % last + 1)), 2]);
        cols.push([range.map((k) => String(d.year + k)), 2]);
      }
      if (showTime) {
        cols.push([range.map((k) => String((((h12 - 1 + k) % 12) + 12) % 12 + 1)), 2]);
        cols.push([range.map((k) => String((((mm + k) % 60) + 60) % 60).padStart(2, "0")), 2]);
        cols.push([["AM", "PM"], ampm === "AM" ? 0 : 1]);
      }
      return this.open(v, "wheel", "div", { attrs: { role: "group" } }) + this.wheel(cols) + "</div>";
    }
    if (variant === "field" || variant === "stepperField") {
      const text = [showDate ? `${d.month}/${d.day}/${d.year}` : "", showTime ? time : ""].filter((t) => t).join(", ");
      const stepper = variant === "stepperField"
        ? `<span class="mkd-datepicker__stepper">${this.icon("chevron.up")}${this.icon("chevron.down")}</span>` : "";
      return this.field(v, "datepicker", textHtml(text), { placeholder: false, kind: "field", controlExtra: stepper });
    }
    const inner = (showDate ? `<span class="mkd-datepicker__date">${esc(formatDate(isoDate(d), "medium"))}</span>` : "")
      + (showTime ? `<span class="mkd-datepicker__time">${esc(time)}</span>` : "");
    return this.field(v, "datepicker", inner, { placeholder: false, kind: "compact" });
  }

  /** Wheel columns (markup items, selected index), two neighbours each side, under a selection band. */
  wheel(columns: [string[], number][]): string {
    const out = ['<span class="mkd-wheel__band"></span>'];
    for (const [items, sel] of columns) {
      const cells = items.map((item, i) => (Math.abs(i - sel) <= 2
        ? `<span class="mkd-wheel__item" data-offset="${i - sel}"${i === sel ? ' aria-selected="true"' : ""}>${item}</span>` : ""))
        .join("");
      out.push(`<span class="mkd-wheel__column">${cells}</span>`);
    }
    return out.join("");
  }

  findMod(views: readonly View[], modName: string, depth = 0): View | null {
    for (const c of views) {
      if (c.mod(modName)) return c;
      if (["navstack", "split", "tabs"].includes(c.role) || depth > 6) continue;
      const found = this.findMod(c.children, modName, depth + 1);
      if (found) return found;
    }
    return null;
  }

  toolbarItems(views: readonly View[]): Record<string, View[]> {
    const groups: Record<string, View[]> = { leading: [], trailing: [], principal: [], bottom: [] };
    for (const item of views) {
      if (item.role === "toolbaritem") {
        const key = name(at(item, "placement")) || "automatic";
        const where = has(PLACEMENT, key) ? PLACEMENT[key] : "trailing";
        groups[where].push(...item.children);
      } else groups.trailing.push(item);
    }
    return groups;
  }

  rows(views: readonly View[], wrap: string | null): string {
    const out: string[] = [];
    const saved = this.rowWrap;
    for (const c of views) {
      this.rowWrap = null;
      if (["section", "listitem", "navitem", "labeled"].includes(c.role) || (wrap === "form" && c.role === "form")) {
        this.rowWrap = c.role === "section" ? wrap : null;
        out.push(this.view(c));
      } else if (c.role === "group" && c.children.length) {
        out.push(this.rows(c.children, wrap));
      } else if (c.role === "divider" && wrap === "form") {
        out.push(this.view(c));
      } else {
        const cls = wrap === "list" ? "mkd-listitem mkd-listitem--wrap" : "mkd-form__row";
        const inner = this.view(c);
        const sel = wrap === "list" && this.listSelection !== null
          && fmt(at(c, "tag", "content", "title", "label", "text")) === this.listSelection ? ' data-selected="true"' : "";
        out.push(inner ? `<div class="${cls}" data-child="${esc(c.role)}"${sel}>${inner}</div>` : "");
      }
    }
    this.rowWrap = saved;
    return out.join("");
  }

  tr(tds: string, selected: boolean, selectable: boolean, status: unknown = null): string {
    let sel = "";
    if (selectable) {
      sel = `<td class="mkd-table__select"><span class="mkd-checkbox" data-checked="${selected ? "true" : "false"}">`
        + `<span class="mkd-checkbox__box">${selected ? this.icon("checkmark") : ""}</span></span></td>`;
    }
    const st = pyBool(status) ? ` data-status="${esc(name(status))}"` : "";
    return `<tr class="mkd-table__row" aria-selected="${selected ? "true" : "false"}"${st}>${sel}${tds}</tr>`;
  }

  cell(cellValue: unknown, align: string): string {
    let al = align ? ` data-align="${esc(align)}"` : "";
    if (cellValue instanceof ViewList) return `<td class="mkd-table__cell"${al}>${this.views(cellValue.views)}</td>`;
    if (isNum(cellValue) && !align) al = ' data-align="trailing"';
    return `<td class="mkd-table__cell"${al}>${textHtml(fmt(cellValue))}</td>`;
  }
}

type RoleFn = (this: Renderer, v: View) => string;

const ROLES: Record<string, RoleFn> = {
  // --- layout roles ------------------------------------------------------------------------------
  vstack(v) { return this.stack(v, "vstack"); },
  hstack(v) { return this.stack(v, "hstack"); },
  zstack(v) { return this.stack(v, "zstack"); },
  group(v) { return this.open(v, "group") + this.views(v.children) + "</div>"; },
  scroll(v) {
    const axis = at(v, "axes", "axis");
    const data = name(axis) === "horizontal" || (isList(axis) && axis.some((a) => name(a) === "horizontal"))
      ? { axis: "horizontal" } : {};
    return this.open(v, "scroll", "div", { data }) + this.views(v.children) + "</div>";
  },
  grid(v) {
    const cols = at(v, "columns", "count", "cols");
    let template = "";
    if (isNum(cols)) template = `repeat(${int(numValue(cols))}, minmax(0, 1fr))`;
    else if (isList(cols) && cols.length) {
      const items: string[] = [];
      for (const c of cols) {
        const spec = c instanceof CallValue && c.args.length ? c.args[0] : null;
        if (spec instanceof EnumValue && spec.name === "adaptive") {
          const mn = u(num(spec.kw("minimum"), 100)) || "100px";
          template = `repeat(auto-fill, minmax(${mn}, 1fr))`;
          break;
        }
        if (spec instanceof EnumValue && spec.name === "fixed" && spec.args.length) items.push(u(num(spec.args[0], 100)) || "auto");
        else items.push("minmax(0, 1fr)");
      }
      template = template || items.join(" ");
    } else {
      const rows = v.children.filter((c) => c.role === "gridrow");
      const n = rows.length ? Math.max(...rows.map((r) => r.children.length)) : 0;
      if (n) template = `repeat(${n}, auto)`;
    }
    const style: Record<string, string> = template ? { "grid-template-columns": template } : {};
    const length = u(num(at(v, "spacing", "horizontalSpacing", "gap")));
    if (length !== null) style.gap = length;
    return this.open(v, "grid", "div", { style }) + this.views(v.children) + "</div>";
  },
  gridrow(v) { return this.open(v, "gridrow") + this.views(v.children) + "</div>"; },
  spacer(v) {
    const style: Record<string, string> = {};
    const length = u(num(at(v, "minLength")));
    if (length !== null) {
      style["min-width"] = length;
      style["min-height"] = length;
    }
    return this.open(v, "spacer", "div", { style }) + "</div>";
  },
  divider(v) {
    const label = at(v, "label", "text");
    const inner = pyBool(label) ? `<span class="mkd-divider__label">${this.content(label)}</span>` : "";
    return this.open(v, "divider", "div", { attrs: { role: "separator" } }) + inner + "</div>";
  },
  shape(v) {
    const style: Record<string, string> = {};
    const length = u(num(at(v, "cornerRadius")));
    if (length !== null) style["border-radius"] = length;
    return this.open(v, "shape", "div", { data: { shape: name(at(v, "shape")) || "rectangle" }, style }) + "</div>";
  },
  color(v) {
    const c = cssColor(at(v, "color"));
    return this.open(v, "color", "div", { style: c ? { background: c } : {} }) + "</div>";
  },

  // --- content roles -----------------------------------------------------------------------------
  text(v) {
    const data: Record<string, unknown> = {};
    const styleName = at(v, "font", "style", "typography", "textStyle");
    if (pyBool(styleName) && !v.hasMod("font")) data.font = fontStyle(name(styleName), (n) => this.pack.font(n));
    const text = at(v, "content", "text", "verbatim");
    let body = text !== null ? this.content(text) : "";
    if (v.extra_args.length) body += v.extra_args.map((a) => this.content(a)).join("");
    if (text !== null && !pyStr(text).replace(LEADING_WS, "")
      && !v.extra_args.length && !v.children.length) {
      body = "&#160;"; // Text("") keeps one line's height, as a blank line in SwiftUI does
    }
    return this.open(v, "text", "span", { data }) + body + this.views(v.children) + "</span>";
  },
  label(v) {
    const style = name(at(v, "labelStyle"));
    const iconName = at(v, "systemImage", "icon", "image");
    const icon = this.slot(v, "icon") || (pyBool(iconName) ? this.icon(iconName, "mkd-icon", v) : "");
    let title = this.slot(v, "title") || this.content(at(v, "title"));
    if (v.children.length && !title) title = this.views(v.children);
    const parts: string[] = [];
    if (icon && style !== "titleOnly") parts.push(`<span class="mkd-label__icon">${icon}</span>`);
    if (title && style !== "iconOnly") parts.push(`<span class="mkd-label__title">${title}</span>`);
    parts.push(this.badgeHtml(at(v, "badge"), "mkd-badge mkd-label__badge"));
    return this.open(v, "label", "span") + parts.join("") + "</span>";
  },
  image(v) {
    const sysName = at(v, "systemName", "icon", "symbol");
    if (pyBool(sysName)) return this.open(v, "symbol", "span") + this.icon(sysName, "mkd-icon", v) + "</span>";
    const ref = at(v, "name", "url", "src", "source", "decorative");
    const alt = fmt(at(v, "alt", "label", "accessibilityLabel")) || "";
    if (typeof ref === "string" && ref) {
      const src = this.assets.resolve(ref, v.loc);
      if (src) return this.open(v, "image", "img", { attrs: { src, alt } });
    }
    const label = esc(alt || (pyBool(ref) ? fmt(ref) : ""));
    return this.open(v, "image", "span", { cls: "mkd-image--placeholder" }) + this.icon("photo")
      + (label ? `<span class="mkd-image__label">${label}</span>` : "") + "</span>";
  },
  icon(v) {
    const style: Record<string, string> = {};
    const length = u(num(at(v, "size", "fontSize")));
    if (length !== null) style["font-size"] = length;
    return this.open(v, "symbol", "span", { style }) + this.icon(at(v, "name", "systemName", "icon"), "mkd-icon", v) + "</span>";
  },
  avatar(v) {
    const nm = fmt(or(at(v, "name", "initials", "title", "label"), ""));
    const image = at(v, "image", "src", "url");
    const src = typeof image === "string" && image ? this.assets.resolve(image, v.loc) : null;
    const hue = nm ? (ordSum(nm) % 8) + 1 : 1;
    let inner: string;
    if (src) inner = `<img src="${esc(src)}" alt="${esc(nm)}">`;
    else if (pyBool(at(v, "systemImage", "icon"))) inner = this.icon(at(v, "systemImage", "icon"), "mkd-icon", v);
    else if (fmt(at(v, "initials"))) inner = esc(fmt(at(v, "initials")));
    else inner = esc(initials(nm)) || this.icon("person");
    const status = at(v, "status", "presence");
    const st = pyBool(status) ? `<span class="mkd-avatar__status" data-status="${esc(name(status))}"></span>` : "";
    return this.open(v, "avatar", "span", { data: { hue: String(hue) } }) + inner + st + this.badgeHtml(at(v, "badge")) + "</span>";
  },
  badge(v) {
    const text = at(v, "text", "count", "value", "label", "content");
    const isDot = text === null || text === true || (typeof text === "string" && text === "");
    const data = isDot && !v.children.length ? { dot: "true" } : {};
    const icon = at(v, "systemImage", "icon");
    let body = pyBool(icon) ? `<span class="mkd-badge__icon">${this.icon(icon, "mkd-icon", v)}</span>` : "";
    if (!(text === null || text === true)) {
      const maxV = num(at(v, "max"));
      const n = num(text);
      const shown = maxV !== null && n !== null && n > maxV ? `${intStr(int(maxV))}+` : fmt(text);
      body += `<span class="mkd-badge__label">${textHtml(shown)}</span>`;
    }
    body += this.views(v.children);
    return this.open(v, "badge", "span", { data }) + body + "</span>";
  },
  chip(v) {
    const parts: string[] = [];
    const av = at(v, "avatar");
    if (pyBool(av)) parts.push(this.avatarHtml(fmt(av), at(v, "avatarImage"), v, "small", " mkd-chip__avatar"));
    const icon = at(v, "systemImage", "icon");
    if (pyBool(icon)) parts.push(`<span class="mkd-chip__icon">${this.icon(icon, "mkd-icon", v)}</span>`);
    if (bool(at(v, "selected")) && !pyBool(icon) && bool(at(v, "checkmark"), true)
      && ["filter", ""].includes(name(at(v, "variant")))) {
      parts.push(`<span class="mkd-chip__check">${this.icon("checkmark")}</span>`);
    }
    parts.push(`<span class="mkd-chip__label">${this.content(at(v, "label", "text", "title"))}</span>`);
    parts.push(this.views(v.children));
    if (bool(at(v, "removable", "closable", "onDelete", "deletable"))) parts.push(`<span class="mkd-chip__remove">${this.icon("xmark")}</span>`);
    return this.open(v, "chip", "span") + parts.join("") + "</span>";
  },
  link(v) {
    const label = this.content(at(v, "label", "title", "text")) || this.views(v.children);
    const icon = at(v, "systemImage", "icon");
    const ic = pyBool(icon) ? `<span class="mkd-link__icon">${this.icon(icon, "mkd-icon", v)}</span>` : "";
    return this.open(v, "link", "span", { attrs: { role: "link" } }) + ic + label + "</span>";
  },
  progress(v) {
    const value = num(at(v, "value", "progress", "percent"));
    let total = num(at(v, "total", "max"), null);
    if (total === null) total = value !== null && value > 1 ? 100.0 : 1.0;
    const frac = value === null ? null : pyMax(0.0, pyMin(1.0, total ? value / total : 0.0));
    const variant = name(at(v, "kind", "variant", "style")) || "linear";
    const circular = ["circular", "ring", "spinner", "gauge", "accessoryCircular", "accessoryCircularCapacity",
      "radial", "circle", "dashboard"].includes(variant);
    const label = this.textOrSlot(v, "label", "title") || this.views(v.children);
    let current = this.textOrSlot(v, "currentValueLabel", "valueLabel");
    const low = this.textOrSlot(v, "minimumValueLabel", "minLabel");
    const high = this.textOrSlot(v, "maximumValueLabel", "maxLabel");
    if (bool(at(v, "showValue")) && frac !== null && !current) current = `${pyRound(frac * 100)}%`;
    const data: Record<string, unknown> = { kind: circular ? "circular" : "linear" };
    if (frac === null) data.indeterminate = "true";
    const parts = label ? [`<span class="mkd-progress__label">${label}</span>`] : [];
    if (variant === "accessoryCircular") { // an open 240-degree ring (R-PACK-014.C4)
      const dash = `${fx((frac !== null ? frac : 0.3) * 100, 2)} 100`;
      parts.push('<span class="mkd-progress__ring" data-open="true"><svg viewBox="0 0 24 24" aria-hidden="true">'
        + `<path class="mkd-progress__track" d="${GAUGE_ARC}" pathLength="100"/>`
        + `<path class="mkd-progress__bar" d="${GAUGE_ARC}" pathLength="100" stroke-dasharray="${dash}"/>`
        + "</svg></span>");
    } else if (circular) {
      const r = 9.0;
      const circ = 2 * 3.14159 * r;
      const dash = `${fx((frac !== null ? frac : 0.3) * circ, 2)} ${fx(circ, 2)}`;
      parts.push('<span class="mkd-progress__ring"><svg viewBox="0 0 24 24" aria-hidden="true">'
        + '<circle class="mkd-progress__track" cx="12" cy="12" r="9.0"/>'
        + `<circle class="mkd-progress__bar" cx="12" cy="12" r="9.0" stroke-dasharray="${dash}"/>`
        + "</svg></span>");
    } else {
      const width = `${fx((frac !== null ? frac : 0.35) * 100, 1)}%`;
      const marker = variant === "accessoryLinear" ? `<span class="mkd-progress__marker" style="left:${width}"></span>` : "";
      parts.push(`<span class="mkd-progress__track"><span class="mkd-progress__bar" style="width:${width}"></span>${marker}</span>`);
    }
    if (low) parts.push(`<span class="mkd-progress__min">${low}</span>`);
    if (high) parts.push(`<span class="mkd-progress__max">${high}</span>`);
    if (current) parts.push(`<span class="mkd-progress__value">${current}</span>`);
    return this.open(v, "progress", "div", { data, attrs: { role: "progressbar" } }) + parts.join("") + "</div>";
  },
  rating(v) {
    const value = or0(num(at(v, "value", "rating"), 0), 0);
    const mx = int(or0(num(at(v, "max", "maxValue", "count"), 5), 5));
    const stars: string[] = [];
    for (let i = 1; i <= mx; i++) {
      const filled = value >= i ? "full" : (value >= i - 0.5 ? "half" : "empty");
      stars.push(`<span class="mkd-rating__star" data-fill="${filled}">${this.icon(filled !== "empty" ? "star.fill" : "star")}</span>`);
    }
    const label = this.content(at(v, "label"));
    return this.open(v, "rating", "span") + stars.join("") + (label ? `<span class="mkd-rating__label">${label}</span>` : "") + "</span>";
  },
  placeholder(v) {
    const style: Record<string, string> = {};
    const length = u(num(at(v, "height")));
    if (length !== null) style.height = length;
    const icon = at(v, "systemImage", "icon");
    const label = this.content(at(v, "label", "title", "text"));
    return this.open(v, "placeholder", "div", { style })
      + (pyBool(icon) ? `<span class="mkd-placeholder__icon">${this.icon(icon, "mkd-icon", v)}</span>` : "")
      + (label ? `<span class="mkd-placeholder__label">${label}</span>` : "") + this.views(v.children) + "</div>";
  },
  chart(v) {
    let kind = (name(at(v, "kind", "type", "variant")) || "bar").toLowerCase();
    const rawValues = !isNumOrBool(at(v, "value")) ? at(v, "values", "data", "value") : at(v, "values", "data");
    const seriesAttr = at(v, "series");
    const nz = (x: unknown): number => or0(num(x, 0), 0.0);
    let labels = iter(or(at(v, "labels", "categories", "x"), [])).filter((x) => !(x instanceof ViewList || x instanceof Thunk)).map(fmt);
    let series: number[][] = [];
    const names = iter(or(at(v, "seriesNames", "names", "legendLabels"), [])).map(fmt);
    if (isList(seriesAttr) && seriesAttr.length) {
      seriesAttr.forEach((s0, i) => {
        let s: unknown = s0;
        if (s instanceof PyDict) {
          names.push(fmt(s.get("name", s.get("label", `Series ${i + 1}`))));
          s = s.get("values", s.get("data", []));
        } else if (isTuple(s) && s.length === 2 && isList(s[1])) {
          names.push(fmt(s[0]));
          s = s[1];
        }
        if (isSeq(s)) series.push(s.map(nz));
      });
    } else if (isSeq(rawValues)) {
      if (rawValues.length && rawValues.every((x) => isSeq(x)) && !["scatter", "bubble", "candlestick"].includes(kind)) {
        series = rawValues.map((s) => (s as unknown[]).map(nz));
      } else series = [rawValues.filter((x) => !isSeq(x)).map(nz)];
    }
    const marks = v.children.filter((c) => c.name.endsWith("Mark"));
    if (marks.length && !series.length) { // Swift Charts: Chart { BarMark(x: .value("Day", "Mon"), y: .value("Steps", 7)) }
      const markVal = (x: unknown): unknown => (x instanceof EnumValue && x.name === "value" && x.args.length ? x.args[x.args.length - 1] : x);
      series = [marks.map((c) => nz(markVal(at(c, "y", "angle", "value"))))];
      labels = marks.map((c) => fmt(markVal(at(c, "x", "label"))));
      if (kind === "bar") {
        const map: Record<string, string> = { LineMark: "line", AreaMark: "area", SectorMark: "pie", PointMark: "scatter" };
        kind = has(map, marks[0].name) ? map[marks[0].name] : "bar";
      }
    }
    const points: number[][] = [];
    const ptsSrc = or(or(at(v, "points", "ohlc", "candles"), ["scatter", "bubble", "candlestick"].includes(kind) ? rawValues : []), []);
    for (const p of iter(ptsSrc)) {
      if (isSeq(p)) points.push(p.map(nz));
      else if (p instanceof PyDict) points.push(["x", "y", "size", "group"].filter((k) => p.has(k)).map((k) => nz(p.get(k))));
    }
    const matrix = iter(or(at(v, "matrix", "grid"), [])).filter((row) => isList(row)).map((row) => (row as unknown[]).map(nz));
    const width = or0(num(at(v, "chartWidth", "plotWidth"), null), 360.0);
    let height = num(at(v, "chartHeight", "plotHeight"), null);
    if (height === null) {
      const dh: Record<string, number> = { sparkline: 44.0, gauge: 150.0, pie: 170.0, donut: 170.0, doughnut: 170.0 };
      height = has(dh, kind) ? dh[kind] : 200.0;
    }
    const hAttr = num(at(v, "height"), null);
    if (hAttr !== null && kind === "sparkline") height = hAttr;
    const spec = chartSpec(kind, {
      series, names, labels, points, matrix, int_dims: false,
      y_labels: iter(or(at(v, "yLabels", "rowLabels"), [])).map(fmt), width, height,
      stacked: bool(at(v, "stacked")), horizontal: bool(at(v, "horizontal")) || name(at(v, "orientation")) === "horizontal",
      legend: at(v, "legend", "showLegend") === null ? null : bool(at(v, "legend", "showLegend")),
      grid: bool(at(v, "grid", "showGrid"), true), show_values: bool(at(v, "showValues", "valueLabels")),
      x_label: fmt(or(at(v, "xLabel", "xAxisLabel"), "")), y_label: fmt(or(at(v, "yLabel", "yAxisLabel"), "")),
      from_zero: at(v, "fromZero") === null ? null : bool(at(v, "fromZero")),
      value: nz(at(v, "value")), minimum: or0(num(at(v, "min", "minimum"), 0), 0.0),
      maximum: or0(num(at(v, "max", "maximum"), 100), 100.0), unit: fmt(or(at(v, "unit", "centerLabel"), "")),
      line_series: kind === "combo" ? int(num(at(v, "lineSeries"), -1)!) : -1,
    });
    if (kind === "combo" && spec.line_series < 0 && series.length > 1) spec.line_series = series.length - 1;
    // R-REND-012.C7: drawn as axes or an outline, never silently empty
    if (!chartHasData(spec)) this.diags.warning(`${v.name} has no data`, v.loc, "chart");
    const title = this.textOrSlot(v, "title");
    const subtitle = this.textOrSlot(v, "subtitle", "description");
    const style: Record<string, string> = {};
    const length = kind !== "sparkline" ? u(num(at(v, "height"))) : null;
    if (length !== null) style.height = length;
    let head = "";
    if (title || subtitle) {
      head = `<div class="mkd-chart__head"><span class="mkd-chart__title">${title}</span>`
        + (subtitle ? `<span class="mkd-chart__subtitle">${subtitle}</span>` : "") + "</div>";
    }
    return this.open(v, "chart", "div", { data: { kind }, style }) + head + renderChart(spec) + "</div>";
  },

  // --- controls ----------------------------------------------------------------------------------
  button(v) {
    if (this.inMenu) return ROLES.menuitem.call(this, v);
    let label = this.textOrSlot(v, "label", "title", "text");
    if (v.children.length) label = this.views(v.children);
    const icon = at(v, "systemImage", "icon", "startIcon", "leadingIcon");
    const iconOnly = bool(at(v, "iconOnly")) || name(at(v, "labelStyle")) === "iconOnly" || (!label && pyBool(icon));
    const data: Record<string, unknown> = {};
    const role = at(v, "role");
    if (pyBool(role)) data.role = name(role);
    if (iconOnly) data["icon-only"] = "true";
    const parts: string[] = [];
    if (pyBool(icon)) parts.push(`<span class="mkd-button__icon">${this.icon(icon, "mkd-icon", v)}</span>`);
    if (label && !(iconOnly && pyBool(icon))) parts.push(`<span class="mkd-button__label">${label}</span>`);
    const end = at(v, "trailingIcon", "endIcon");
    if (pyBool(end)) parts.push(`<span class="mkd-button__icon mkd-button__icon--end">${this.icon(end, "mkd-icon", v)}</span>`);
    if (bool(at(v, "dropdown", "menu", "split"))) parts.push(`<span class="mkd-button__caret">${this.icon("chevron.down")}</span>`);
    if (bool(at(v, "loading"))) parts.unshift('<span class="mkd-button__spinner"></span>');
    parts.push(this.badgeHtml(at(v, "badge"), "mkd-badge mkd-button__badge"));
    const aria: Record<string, unknown> = { role: "button" };
    if (iconOnly && label) aria["aria-label"] = stripTags(label);
    return this.open(v, "button", "span", { data, attrs: aria }) + parts.join("") + "</span>";
  },
  fab(v) {
    const icon = or(at(v, "systemImage", "icon"), "plus");
    const label = this.content(at(v, "label", "text", "title"));
    const inner = `<span class="mkd-fab__icon">${this.icon(icon, "mkd-icon", v)}</span>` + (label ? `<span class="mkd-fab__label">${label}</span>` : "");
    const markup = this.open(v, "fab", "span", { data: label ? { extended: "true" } : {}, attrs: { role: "button" } }) + inner + "</span>";
    if (bool(at(v, "inline"))) return markup;
    const pos = name(at(v, "position", "placement")) || "bottomTrailing";
    this.overlays.push(`<div class="mkd-layer" data-kind="fab" data-position="${esc(pos)}">${markup}</div>`);
    return "";
  },
  toggle(v) {
    const variant = name(at(v, "variant"));
    if (variant === "checkbox" || variant === "check") return ROLES.checkbox.call(this, v);
    const on = bool(at(v, "isOn", "on", "checked", "value", "selected"));
    const label = this.textOrSlot(v, "label", "title") || this.views(v.children);
    const desc = this.content(at(v, "description", "subtitle"));
    if (variant === "button") {
      return this.open(v, "button", "span", { data: { pressed: on ? "true" : "false" }, attrs: { role: "button" } })
        + `<span class="mkd-button__label">${label}</span></span>`;
    }
    let text = "";
    if (label || desc) {
      text = `<span class="mkd-toggle__text"><span class="mkd-toggle__label">${label}</span>`
        + (desc ? `<span class="mkd-toggle__description">${desc}</span>` : "") + "</span>";
    }
    const stateText = at(v, on ? "onText" : "offText");
    const st = pyBool(stateText) ? `<span class="mkd-toggle__state">${esc(fmt(stateText))}</span>` : "";
    return this.open(v, "toggle", "span", { data: { on: on ? "true" : "false" }, attrs: { role: "switch", "aria-checked": on ? "true" : "false" } })
      + text + '<span class="mkd-toggle__track"><span class="mkd-toggle__thumb"></span></span>' + st + "</span>";
  },
  checkbox(v) {
    const r = at(v, "checked", "isOn", "on", "value", "selected", "state");
    const state = ["indeterminate", "mixed"].includes(name(r)) ? "mixed" : (bool(r) ? "true" : "false");
    const label = this.textOrSlot(v, "label", "title") || this.views(v.children);
    const mark = state !== "false" ? this.icon(state === "mixed" ? "minus" : "checkmark") : "";
    return this.open(v, "checkbox", "span", { data: { checked: state }, attrs: { role: "checkbox", "aria-checked": state } })
      + `<span class="mkd-checkbox__box">${mark}</span>`
      + (label ? `<span class="mkd-checkbox__label">${label}</span>` : "") + "</span>";
  },
  radio(v) {
    const on = bool(at(v, "checked", "selected", "isOn", "value"));
    const label = this.textOrSlot(v, "label", "title") || this.views(v.children);
    return this.open(v, "radio", "span", { data: { checked: on ? "true" : "false" }, attrs: { role: "radio", "aria-checked": on ? "true" : "false" } })
      + '<span class="mkd-radio__dot"></span>'
      + (label ? `<span class="mkd-radio__label">${label}</span>` : "") + "</span>";
  },
  segmented(v) {
    const options = this.options(v);
    let sel = this.selectedIndex(v, options);
    const chosen = new Set<number>();
    v.children.filter(isOption).forEach((c, i) => {
      if (bool(at(c, "selected"))) chosen.add(i);
    });
    if (chosen.size && at(v, "selection", "selected", "value") === null) sel = -1;
    const label = this.content(at(v, "label", "title"));
    const items = options.map(([, markup], i) => `<span class="mkd-segmented__item" role="tab" aria-selected="${i === sel || chosen.has(i) ? "true" : "false"}">`
      + `${markup}</span>`).join("");
    return this.open(v, "segmented", "div", { attrs: { role: "tablist" } })
      + (label && !v.hasMod("labelsHidden") ? `<span class="mkd-segmented__label">${label}</span>` : "")
      + `<span class="mkd-segmented__items">${items}</span></div>`;
  },
  textfield(v) {
    let kind = name(at(v, "kind", "type", "axis")) || "";
    if (kind === "vertical") kind = "multiline";
    let value = at(v, "text", "value");
    const placeholderText = at(v, "placeholder", "prompt");
    if (isNum(value)) value = fmt(value);
    let inner: string;
    let isPh: boolean;
    if (typeof value === "string" && value) {
      const shown = kind === "password" ? "•".repeat(Math.min(len(value), 12)) : value;
      inner = textHtml(shown);
      isPh = false;
    } else {
      inner = this.content(placeholderText);
      isPh = true;
    }
    const style: Record<string, string> = {};
    if (kind === "multiline") style["--mkd-rows"] = intStr(int(or0(num(at(v, "rows", "lineLimit"), 3), 3)));
    const end = kind === "password" && bool(at(v, "reveal"), false) ? "eye.slash" : "";
    // A filled field still has a title: its placeholder names it (a Form's columns style shows it).
    const titled = ["label", "title", "header"].some((n) => v.slots.has(n) || ![null, "", false].includes(raw(v, n) as never));
    const named = !isPh && typeof placeholderText === "string" && placeholderText !== "" && !titled;
    return this.field(v, "textfield", inner, { placeholder: isPh, kind, endIcon: end, style,
      attrs: named ? { "aria-label": placeholderText } : null });
  },
  select(v) {
    const variant = name(at(v, "variant"));
    const options = this.options(v);
    if (PICKER_OPTIONS.includes(variant) && !options.length && !v.children.length) {
      // nothing to draw the options of: the label and an empty value (R-PACK-014.C6)
    } else if (variant === "segmented" || variant === "palette") return ROLES.segmented.call(this, v);
    else if (["radioGroup", "inline", "radio"].includes(variant)) return ROLES.radiogroup.call(this, v);
    else if (variant === "wheel") {
      const s = this.selectedIndex(v, options);
      return this.open(v, "wheel", "div", { attrs: { role: "listbox" } }) + this.wheel([[options.map(([, m]) => m), s]]) + "</div>";
    }
    const sel = this.selectedIndex(v, options);
    const value = at(v, "selection", "value", "selected");
    const tags = this.optionTags(v);
    let shown: string;
    if (isNum(value) && int(numValue(value)) >= 0 && int(numValue(value)) < options.length) shown = options[int(numValue(value))][1];
    else if (typeof value === "string" && value && tags.includes(value)) shown = options[tags.indexOf(value)][1];
    else if (typeof value === "string" && value) shown = textHtml(value);
    else if (isList(value)) {
      shown = value.map((x) => '<span class="mkd-chip" data-el="Chip" data-size="small"><span class="mkd-chip__label">'
        + `${esc(fmt(x))}</span></span>`).join("");
    } else if (value === null && options.length && PICKER_FIRST.includes(variant)) shown = options[0][1];
    else shown = "";
    const placeholder = !shown;
    if (placeholder) shown = this.content(at(v, "placeholder", "prompt"));
    let popup = "";
    if (bool(at(v, "open", "expanded")) && options.length) {
      popup = '<div class="mkd-select__popup" role="listbox">' + options.map(([, markup], i) =>
        `<div class="mkd-select__option" role="option" aria-selected="${i === sel ? "true" : "false"}">${markup}</div>`).join("") + "</div>";
    }
    const menuLike = variant === "menu" || variant === "automatic" || (PICKER_OPTIONS.includes(variant) && !options.length);
    const chevron = menuLike && this.pack.id === "swiftui" ? "chevron.up.down" : "chevron.down";
    return this.field(v, "select", shown, { placeholder, endIcon: chevron, popup });
  },
  radiogroup(v) {
    const options = this.options(v);
    const sel = this.selectedIndex(v, options);
    const label = this.textOrSlot(v, "label", "title");
    let radios: string;
    if (options.length) {
      radios = options.map(([, markup], i) => `<span class="mkd-radio" data-el="RadioButton" data-checked="${i === sel ? "true" : "false"}" `
        + `role="radio"><span class="mkd-radio__dot"></span><span class="mkd-radio__label">${markup}</span></span>`).join("");
    } else radios = this.views(v.children);
    return this.open(v, "radiogroup", "div", { attrs: { role: "radiogroup" } })
      + (label ? `<div class="mkd-radiogroup__label">${label}</div>` : "")
      + `<div class="mkd-radiogroup__items">${radios}</div></div>`;
  },
  slider(v) {
    const rng = at(v, "in", "range", "bounds");
    let lo = num(at(v, "min", "minimumValue"), null);
    let hi = num(at(v, "max", "maximumValue"), null);
    if (isList(rng) && rng.length && lo === null) {
      lo = num(rng[0], 0);
      hi = num(rng[rng.length - 1], 1);
    }
    const loV = lo === null ? 0.0 : lo;
    const hiV = hi === null ? (or0(num(at(v, "value"), 0), 0) <= 1 ? 1.0 : 100.0) : hi;
    const val = at(v, "value");
    let a: number, b: number;
    if (isList(val) && val.length === 2) { // range slider
      a = or0(num(val[0], loV), 0);
      b = or0(num(val[1], hiV), 0);
    } else {
      a = loV;
      b = or0(num(val, loV), loV);
    }
    const span = (hiV - loV) || 1;
    const fa = (a - loV) / span * 100;
    const fb = (b - loV) / span * 100;
    const label = this.textOrSlot(v, "label", "title") || this.views(v.children);
    const parts = label ? [`<div class="mkd-slider__label">${label}</div>`] : [];
    let track = `<span class="mkd-slider__track"><span class="mkd-slider__fill" style="left:${fx(fa, 1)}%;width:${fx(fb - fa, 1)}%"></span>`;
    const steps = at(v, "ticks", "steps", "step");
    const ticks = at(v, "ticks");
    if (bool(ticks) || isNumOrBool(ticks) && !(ticks instanceof PyFloat)) {
      let n = isNum(steps) ? int(or0(num(steps, 0), 0)) : 0;
      n = n || 5;
      track += '<span class="mkd-slider__ticks">' + "<i></i>".repeat(n + 1) + "</span>";
    }
    if (isList(val) && val.length === 2) track += `<span class="mkd-slider__thumb" style="left:${fx(fa, 1)}%"></span>`;
    track += `<span class="mkd-slider__thumb" style="left:${fx(fb, 1)}%"></span></span>`;
    const mn = this.slot(v, "minimumValueLabel") || (pyBool(at(v, "minLabel")) ? this.content(at(v, "minLabel")) : "");
    const mx = this.slot(v, "maximumValueLabel") || (pyBool(at(v, "maxLabel")) ? this.content(at(v, "maxLabel")) : "");
    let ctrl = (mn ? `<span class="mkd-slider__min">${mn}</span>` : "") + track + (mx ? `<span class="mkd-slider__max">${mx}</span>` : "");
    if (bool(at(v, "showValue"))) ctrl += `<span class="mkd-slider__value">${esc(fmt(new PyFloat(pyRoundTo(b, 2))))}</span>`;
    parts.push(`<div class="mkd-slider__control">${ctrl}</div>`);
    return this.open(v, "slider", "div", { attrs: { role: "slider" } }) + parts.join("") + "</div>";
  },
  stepper(v) {
    const label = this.textOrSlot(v, "label", "title") || this.views(v.children);
    const value = at(v, "value");
    const valHtml = value !== null ? `<span class="mkd-stepper__value">${esc(fmt(value))}</span>` : "";
    const btns = '<span class="mkd-stepper__buttons"><span class="mkd-stepper__button" data-step="down">'
      + `${this.icon("minus")}</span><span class="mkd-stepper__divider"></span>`
      + `<span class="mkd-stepper__button" data-step="up">${this.icon("plus")}</span></span>`;
    return this.open(v, "stepper") + (label ? `<span class="mkd-stepper__label">${label}</span>` : "") + valHtml + btns + "</div>";
  },
  datepicker(v) {
    const variant = name(at(v, "variant", "style"));
    if (DATE_STYLES.includes(variant)) return this.dateStyle(v, variant);
    const value = at(v, "selection", "date", "value", "text");
    const shown = pyBool(value) ? formatDate(value, name(at(v, "format")) || "medium") : "";
    const kind = name(at(v, "kind")) || "date";
    const end = kind === "time" ? "clock" : "calendar";
    return this.field(v, "datepicker", shown ? textHtml(shown) : this.content(at(v, "placeholder")),
      { placeholder: !shown, kind, endIcon: end });
  },
  calendar(v) { return this.calendarOf(v, at(v, "selection", "date", "value")); },
  dropzone(v) {
    const label = this.content(at(v, "label", "title", "text")) || "Drop files here";
    const hint = this.content(at(v, "hint", "description"));
    const icon = or(at(v, "systemImage", "icon"), "arrow.up.to.line");
    return this.open(v, "dropzone") + `<span class="mkd-dropzone__icon">${this.icon(icon, "mkd-icon", v)}</span>`
      + `<span class="mkd-dropzone__label">${label}</span>`
      + (hint ? `<span class="mkd-dropzone__hint">${hint}</span>` : "") + this.views(v.children) + "</div>";
  },

  // --- navigation --------------------------------------------------------------------------------
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
      // A column's own navigation title, when it is not a NavigationStack drawing its bar (R-PACK-015.C7).
      let header = "";
      if (!views.some((c) => c.role === "navstack")) {
        const titleView = this.findMod(views, "navigationTitle");
        if (titleView !== null) {
          const m = titleView.mod("navigationTitle")!;
          const titleHtml = m.args.length ? this.content(m.arg()) : this.views(m.content ?? []);
          if (titleHtml) header = `<div class="mkd-split__header"><span class="mkd-split__title">${titleHtml}</span></div>`;
        }
      }
      return `<div class="mkd-split__col" data-col="${esc(nm)}"${st}>${header}${this.views(views)}</div>`;
    });
    return this.open(v, "split", "div", { data: { columns: String(cols.length) } }) + out.join("") + "</div>";
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

  // --- containers --------------------------------------------------------------------------------
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
    this.overlays.push(`<div class="mkd-layer" data-kind="${esc(variant)}"><div class="mkd-scrim"></div>${anchor}${markup}</div>`);
    this.overlays.push(...innerLayers); // anchored marks after the dialog they point into
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
    this.overlays.push(`<div class="mkd-layer" data-kind="toast" data-position="${esc(pos)}">${markup}</div>`);
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

  // --- non-standard components -------------------------------------------------------------------
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

  // --- annotation and overlay elements -----------------------------------------------------------
  callout(v) {
    const n = fmt(or(at(v, "number", "index", "label"), ""));
    const text = this.textOrSlot(v, "text", "title", "message");
    const c = cssColor(at(v, "color"));
    const style: Record<string, string> = c ? { "--mkd-callout": c } : {};
    return this.open(v, "callout", "span", { style }) + `<span class="mkd-callout__badge">${esc(n)}</span>`
      + (text ? `<span class="mkd-callout__text">${text}</span>` : "") + "</span>";
  },
  pointer(v) {
    const kind = name(at(v, "kind", "style", "cursor")) || "arrow";
    return this.open(v, "pointer", "span", { data: { kind } }) + cursorSvg(kind) + "</span>";
  },
  marquee(v) { return this.open(v, "marquee") + this.views(v.children) + "</div>"; },
  unknown(v) {
    return `<div class="mkd-unknown" data-el="${esc(v.name)}"><span class="mkd-unknown__name">${esc(v.name)}</span>`
      + `${this.views(v.children)}</div>`;
  },
};

