/**
 * HTML renderer: resolved view tree → markup (port of `mockitdown.render.html`).
 *
 * Every element renders through its *role*. A role fixes the markup — the class `mkd-<role>` on the
 * root and BEM-style `mkd-<role>__<part>` children — and packs only restyle it. No markup is
 * interactive: controls are spans with ARIA roles, links do not navigate, and nothing needs
 * JavaScript.
 *
 * The role functions live in role-family modules under `./roles/` (layout, content, controls, navigation,
 * containers, components, annotations), as in Python's `mockitdown.render.roles`; this module keeps the
 * {@link Renderer} with its infrastructure and the helpers several families share, and assembles `ROLES`.
 */

import type { AssetResolver } from "../asset-resolver.js";
import type { Diagnostics } from "../diagnostics.js";
import { iconSvg } from "../icons.js";
import { EnumValue, Thunk, View, ViewList } from "../model.js";
import type { Pack } from "../packs/registry.js";
import { isList, isSeq, pyBool, PyDict, pyRepr, pyStr } from "../values.js";
import { cssColor, type DataMap, styleAttr, StyleBuilder, type StyleMap, u } from "./style.js";
import {
  addDays, at, bool, cursorSvg, DATE_MIN, dateKey, decorate, esc, fmt, formatDate, has, initials, int, isIn, isNum,
  isoDate, isOption, iter, monthAbbr, monthDates, monthLen, monthName, name, num, numValue, OPTION_ROLES, or, or0,
  ordSum, parseDate, parseTime, PH, type PyDate, raw, textHtml, weekday,
} from "./util.js";
import {
  AnnotationRoles, ComponentRoles, ContainerRoles, ContentRoles, ControlRoles, LayoutRoles, NavigationRoles,
} from "./roles/index.js";

/** Element attributes copied verbatim to `data-<name>` when they are simple values. */
const PASSTHROUGH = ["variant", "size", "color", "shape", "density", "elevation", "placement", "orientation",
  "emphasis", "design", "severity", "kind", "labelStyle", "position", "level", "side",
  "withHandle", "direction", "labelPlacement", "rowsPerPage"];
const SAFE_TOKEN = /^[A-Za-z0-9_. -]{1,40}\n?$/;
const PRESENTATIONS = ["alert", "sheet", "confirmationDialog", "fullScreenCover", "popover", "inspector"];
const DECORATIONS = ["callout", "annotation", "pointer", "cursor", "marquee", "dragSelect", "highlight", "tap"];
const DEFAULT_DATE: PyDate = { year: 2026, month: 11, day: 23 };
const DEFAULT_TIME: [number, number] = [9, 41];
const WEEKDAY_ABBR = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const PLACEMENT: Record<string, string> = {
  topBarLeading: "leading", navigationBarLeading: "leading", cancellationAction: "leading",
  navigation: "leading", topBarTrailing: "trailing", navigationBarTrailing: "trailing",
  primaryAction: "trailing", confirmationAction: "trailing", automatic: "trailing",
  principal: "principal", bottomBar: "bottom", status: "bottom", secondaryAction: "trailing",
  destructiveAction: "trailing", keyboard: "bottom", title: "principal", largeTitle: "principal",
};

type Options = [string, string][];

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
  /** Edit mode (R-EDIT-004): write `data-mkd-node` and `data-mkd-derived` on role roots. */
  edit = false;

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
    const parts = [`<${tag} class="${esc(classes.join(" "))}" data-el="${esc(v.name)}"${this.editAttrs(v)}`];
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

  /** `data-mkd-node` then `data-mkd-derived` in edit mode (R-EDIT-004.C4-C6), else "". */
  editAttrs(v: View): string {
    if (!this.edit) return "";
    return (v.node ? ` data-mkd-node="${esc(v.node)}"` : "") + (v.derived ? ` data-mkd-derived="${esc(v.derived)}"` : "");
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

export type RoleFn = (this: Renderer, v: View) => string;

const ROLES: Record<string, RoleFn> = {
  ...LayoutRoles,
  ...ContentRoles,
  ...ControlRoles,
  ...NavigationRoles,
  ...ContainerRoles,
  ...ComponentRoles,
  ...AnnotationRoles,
  unknown(v) {
    return `<div class="mkd-unknown" data-el="${esc(v.name)}"${this.editAttrs(v)}><span class="mkd-unknown__name">${esc(v.name)}</span>`
      + `${this.views(v.children)}</div>`;
  },
};

/** The render roles: one handler each (the role catalogue, REF.2; each has a rule in roles.json, R-PACK-016.C1). */
export const RENDER_ROLES: readonly string[] = Object.freeze(Object.keys(ROLES));
