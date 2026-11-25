/**
 * Modifier → CSS translation (port of `mockitdown.render.style`).
 *
 * Every length emitted inline is scaled by the frame unit: `calc(N * var(--u))`. Colours are
 * validated (named, semantic, hex or rgb/hsl) before they reach a style attribute.
 */

import type { Diagnostics } from "../diagnostics.js";
import { CallValue, EnumValue, Modifier, View, ViewList } from "../model.js";
import { parsePyFloat, pyFormatG, pyMax, pyMin, pyRound, pyRoundTo } from "../pyformat.js";
import { floatRepr, intStr, isSeq, pyStr, strRepr } from "../values.js";
import { isNum, isNumOrBool, numValue, PY_WS } from "./util.js";

export const NAMED_COLORS = new Set(["red", "orange", "yellow", "green", "mint", "teal", "cyan", "blue", "indigo",
  "purple", "pink", "brown", "gray", "grey"]);
export const SEMANTIC_COLORS: ReadonlyMap<string, string> = new Map([
  ["primary", "var(--mkd-fg)"], ["secondary", "var(--mkd-fg-2)"], ["tertiary", "var(--mkd-fg-3)"],
  ["quaternary", "var(--mkd-fg-3)"], ["accentColor", "var(--mkd-accent)"], ["accent", "var(--mkd-accent)"],
  ["tint", "var(--mkd-accent)"], ["background", "var(--mkd-bg)"], ["surface", "var(--mkd-surface)"],
  ["white", "#ffffff"], ["black", "#000000"], ["clear", "transparent"], ["danger", "var(--mkd-danger)"],
  ["error", "var(--mkd-danger)"], ["destructive", "var(--mkd-danger)"], ["success", "var(--mkd-success)"],
  ["warning", "var(--mkd-warning)"], ["info", "var(--mkd-info)"], ["separator", "var(--mkd-divider)"],
]);
const MATERIALS = new Set(["ultraThinMaterial", "thinMaterial", "regularMaterial", "thickMaterial", "ultraThickMaterial", "bar"]);
const HEX = /^#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})\n?$/;
const FUNC = new RegExp(`^(?:rgb|rgba|hsl|hsla)\\([${PY_WS}]*[0-9.,%${PY_WS}/]+\\)\\n?$`, "u");

export const FONT_WEIGHTS: ReadonlyMap<string, number> = new Map([
  ["ultraLight", 100], ["thin", 200], ["light", 300], ["regular", 400], ["medium", 500], ["semibold", 600],
  ["bold", 700], ["heavy", 800], ["black", 900],
]);
export const FONT_STYLES = ["display", "largeTitle", "title", "title2", "title3", "headline", "subheadline", "body",
  "callout", "footnote", "caption", "caption2", "overline"] as const;
const FONT_ALIASES: ReadonlyMap<string, string> = new Map([
  ["h1", "display"], ["h2", "largeTitle"], ["h3", "title"], ["h4", "title2"], ["h5", "title3"], ["h6", "headline"],
  ["subtitle", "subheadline"], ["subtitle1", "headline"], ["subtitle2", "subheadline"], ["body1", "body"],
  ["body2", "callout"], ["bodyStrong", "headline"], ["bodyLarge", "body"], ["bodyMedium", "callout"],
  ["bodySmall", "footnote"], ["titleLarge", "title2"], ["titleMedium", "headline"], ["titleSmall", "subheadline"],
  ["headlineLarge", "largeTitle"], ["headlineMedium", "title"], ["headlineSmall", "title2"],
  ["displayLarge", "display"], ["displayMedium", "display"], ["displaySmall", "largeTitle"], ["labelLarge", "callout"],
  ["labelMedium", "footnote"], ["labelSmall", "caption"], ["lead", "title3"], ["small", "footnote"], ["muted", "footnote"],
  ["large", "title3"], ["heading", "title"], ["caption1", "caption"], ["captionStrong", "caption"], ["subtitle3", "headline"],
]);

/** A scaled length for a number, or null. */
export function u(n: unknown): string | null {
  if (typeof n === "boolean" || !isNum(n)) return null;
  const r = pyRoundTo(numValue(n), 2);
  if (r === 0) return "0";
  const text = Number.isInteger(r) ? intStr(r) : floatRepr(r);
  return `calc(${text} * var(--u))`;
}

/** Python's `float(v)`; throws where Python raises (TypeError, ValueError). */
function toFloat(v: unknown): number {
  if (isNumOrBool(v)) return numValue(v);
  if (typeof v === "string") {
    const f = parsePyFloat(v);
    if (f === null) throw new Error("ValueError");
    return f;
  }
  throw new Error("TypeError");
}

/** A safe CSS colour for a value, or null when it is not one. */
export function cssColor(v: unknown): string | null {
  let opacity: unknown = null;
  let base: string | null;
  if (v instanceof EnumValue) {
    opacity = v.kw("opacity");
    let colorName = v.name;
    if (colorName === "opacity" && v.namespace) { // .red.opacity(0.3) evaluates as namespace red, name opacity
      colorName = v.namespace;
      opacity = v.args.length ? v.args[0] : null;
    }
    base = colorName_(colorName) || tokenColor(colorName);
  } else if (v instanceof CallValue && v.name === "Color") {
    if (v.args.length && typeof v.args[0] === "string") base = cssColor(v.args[0]);
    else if (v.kw("red") !== null) {
      let r: number, g: number, b: number;
      try {
        [r, g, b] = ["red", "green", "blue"].map((k) => toFloat(v.kw(k, 0)));
      } catch {
        return null;
      }
      base = `rgb(${pyRound(r * 255)} ${pyRound(g * 255)} ${pyRound(b * 255)})`;
    } else if (v.kw("hex") !== null) base = cssColor(pyStr(v.kw("hex")));
    else base = null;
  } else if (typeof v === "string") {
    const s = v.replace(new RegExp(`^[${PY_WS}]+|[${PY_WS}]+$`, "gu"), "");
    base = HEX.test(s) || FUNC.test(s) ? s : colorName_(s);
  } else return null;
  if (base && isNumOrBool(opacity)) {
    const pct = pyMax(0, pyMin(100, pyRound(numValue(opacity) * 100)));
    return `color-mix(in srgb, ${base} ${pct}%, transparent)`;
  }
  return base;
}

function colorName_(n: string): string | null {
  if (SEMANTIC_COLORS.has(n)) return SEMANTIC_COLORS.get(n)!;
  if (NAMED_COLORS.has(n)) return `var(--mkd-color-${n === "grey" ? "gray" : n})`;
  return null;
}

/** `.primaryContainer` → var(--mkd-primary-container): a colour token the pack defines. */
function tokenColor(n: string): string | null {
  if (!/^[a-z][A-Za-z0-9]{1,40}$/.test(n || "")) return null;
  const kebab = n.replace(/(?<=[a-z0-9])([A-Z])/g, "-$1").toLowerCase();
  return `var(--mkd-${kebab}, var(--mkd-color-${kebab}, currentColor))`;
}

export type PackFont = (name: string) => unknown;

export function fontStyle(styleName: string, packFont: PackFont): unknown {
  const alias = packFont(styleName);
  return typeof alias === "string" && FONT_ALIASES.has(alias) ? FONT_ALIASES.get(alias)! : alias;
}

const EDGES: Record<string, string[]> = {
  all: ["top", "bottom", "left", "right"], horizontal: ["left", "right"], vertical: ["top", "bottom"], top: ["top"],
  bottom: ["bottom"], leading: ["left"], trailing: ["right"], left: ["left"], right: ["right"],
};

function edges(value: unknown): Set<string> {
  let names: string[] = [];
  if (value instanceof EnumValue) names = [value.name];
  else if (isSeq(value)) names = value.filter((x): x is EnumValue => x instanceof EnumValue).map((x) => x.name);
  const out = new Set<string>();
  for (const n of names) {
    if (Object.prototype.hasOwnProperty.call(EDGES, n)) for (const e of EDGES[n]) out.add(e);
  }
  return out;
}

export type StyleMap = Map<string, string>;
export type DataMap = Map<string, unknown>;

type Handler = (b: StyleBuilder, m: Modifier, style: StyleMap, data: DataMap, classes: string[], pad: Map<string, string>,
  view: View) => void;

/** A `Circle` shape view: drawn inside its frame, so its stroke and shadow follow the circle (R-REND-014). */
function isCircle(view: View | null | undefined): boolean {
  return !!view && view.role === "shape" && view.attr("shape") === "circle";
}

function shapeRadius(shape: View, style: StyleMap): void {
  const kind = shape.attr("shape", "");
  let length: string | null;
  if (kind === "ellipse") style.set("border-radius", "50%"); // R-REND-014.C2: a true ellipse, never a capsule
  else if (kind === "circle" || kind === "capsule") style.set("border-radius", "9999px");
  else if ((length = u(shape.attr("cornerRadius"))) !== null) style.set("border-radius", length);
}

function enumRadius(e: EnumValue, style: StyleMap): void {
  let length: string | null;
  if (e.name === "ellipse") style.set("border-radius", "50%"); // R-REND-014.C2
  else if (["circle", "capsule"].includes(e.name)) style.set("border-radius", "9999px");
  else if ((e.name === "rect" || e.name === "roundedRectangle") && (length = u(e.kw("cornerRadius"))) !== null) {
    style.set("border-radius", length);
  }
}

const notFalse = (m: Modifier): boolean => m.arg(0, true) !== false;

const foregroundStyle: Handler = (_b, m, style) => {
  const c = cssColor(m.arg());
  if (c) {
    style.set("color", c);
    style.set("--mkd-current", c);
  }
};

const tint: Handler = (_b, m, style) => {
  const c = cssColor(m.arg());
  if (c) {
    style.set("--mkd-accent", c);
    style.set("--mkd-accent-soft", `color-mix(in srgb, ${c} 16%, transparent)`);
    style.set("--mkd-chart-1", c); // a tinted chart draws its first series in the tint
  }
};

const HANDLERS: Record<string, Handler> = {
  // --- layout ---
  padding(_b, m, _style, _data, _classes, pad) {
    let amount: unknown = 16;
    let es = new Set(["top", "bottom", "left", "right"]);
    if (m.args.length) {
      const first = m.args[0];
      if (isNum(first)) amount = first;
      else {
        const got = edges(first);
        if (got.size) es = got;
        if (m.args.length > 1) amount = m.args[1];
      }
    }
    for (const key of ["all", "horizontal", "vertical", "top", "bottom", "leading", "trailing"]) {
      if (m.kwargs.has(key)) { // .padding(top: 4) style variants
        es = edges(new EnumValue(key));
        amount = m.kwargs.get(key);
      }
    }
    const length = u(amount) || u(16)!;
    for (const e of es) pad.set(e, length);
  },
  frame(_b, m, style, data) {
    const kw = m.kwargs;
    const fill: string[] = [];
    for (const [key, prop] of [["width", "width"], ["height", "height"], ["minWidth", "min-width"],
      ["minHeight", "min-height"], ["maxWidth", "max-width"], ["maxHeight", "max-height"],
      ["idealWidth", "width"], ["idealHeight", "height"]]) {
      const val = kw.get(key);
      let length: string | null;
      if (val instanceof EnumValue && val.name === "infinity") fill.push(key.includes("Width") ? "x" : "y");
      else if ((length = u(val)) !== null) {
        style.set(prop, length);
        if (prop === "width") style.set("flex", "0 0 auto");
        else if (prop === "height") {
          style.set("flex-shrink", "0");
          style.set("flex-grow", "0");
        }
      }
    }
    if (fill.length) data.set("fill", [...new Set(fill)].sort().join(" "));
    const align = kw.get("alignment");
    if (align instanceof EnumValue) data.set("frame-align", align.name);
  },
  offset(_b, m, style) {
    const x = u(m.kwargs.get("x", 0)) || "0";
    const y = u(m.kwargs.get("y", 0)) || "0";
    style.set("transform", `translate(${x}, ${y})`);
  },
  position(b, m, style, data) {
    const x = u(m.kwargs.get("x"));
    const y = u(m.kwargs.get("y"));
    if (x === null && y === null) {
      b.diags.warning(".position needs x: and/or y: (use an element argument for a named position)", m.loc, "modifier");
      return;
    }
    style.set("position", "absolute");
    if (x !== null) style.set("left", x);
    if (y !== null) style.set("top", y);
    style.set("translate", "-50% -50%");
    data.set("positioned", "true");
  },
  rotationEffect(_b, m, style) {
    const a = m.arg();
    let deg: unknown = a instanceof EnumValue ? a.kw("degrees") : a;
    if (a instanceof EnumValue && a.name === "degrees" && a.args.length) deg = a.args[0];
    if (isNum(deg)) style.set("rotate", `${pyFormatG(numValue(deg))}deg`);
  },
  zIndex(_b, m, style) {
    const a = m.arg();
    if (isNumOrBool(a)) {
      style.set("position", "relative");
      style.set("z-index", intStr(Math.trunc(numValue(a)) || 0));
    }
  },
  // --- typography ---
  font(b, m, style, data) {
    const f = m.arg();
    if (f instanceof EnumValue) {
      if (f.name === "system" || f.name === "custom") {
        let size: unknown = f.kw("size") !== null ? f.kw("size") : (f.args.length > 1 ? f.args[1] : null);
        if (f.name === "system" && f.args.length && isNumOrBool(f.args[0])) size = f.args[0];
        const length = u(size);
        if (length !== null) style.set("font-size", length);
        const w = f.kw("weight");
        if (w instanceof EnumValue && FONT_WEIGHTS.has(w.name)) style.set("font-weight", String(FONT_WEIGHTS.get(w.name)));
        const d = f.kw("design");
        if (d instanceof EnumValue && d.name === "monospaced") style.set("font-family", "var(--mkd-font-mono)");
        if (d instanceof EnumValue && d.name === "rounded") data.set("design", "rounded");
      } else if (f.name === "bold" || f.name === "italic") { // .font(.title.bold()) arrives as namespace/name pair
        data.set("font", f.namespace ? fontStyle(f.namespace, b.packFont) : (data.has("font") ? data.get("font") : "body"));
        if (f.name === "bold") style.set("font-weight", "700");
        else style.set("font-style", "italic");
      } else if (f.name === "weight" && f.namespace) {
        data.set("font", fontStyle(f.namespace, b.packFont));
        if (f.args.length && f.args[0] instanceof EnumValue) {
          style.set("font-weight", String(FONT_WEIGHTS.get(f.args[0].name) ?? 400));
        }
      } else data.set("font", fontStyle(f.name, b.packFont));
    } else if (typeof f === "string") data.set("font", fontStyle(f, b.packFont));
  },
  fontWeight(_b, m, style) {
    const w = m.arg();
    if (w instanceof EnumValue && FONT_WEIGHTS.has(w.name)) style.set("font-weight", String(FONT_WEIGHTS.get(w.name)));
  },
  bold(_b, m, style) {
    if (notFalse(m)) style.set("font-weight", "700");
  },
  italic(_b, m, style) {
    if (notFalse(m)) style.set("font-style", "italic");
  },
  underline(_b, m, style) {
    if (notFalse(m)) style.set("text-decoration", "underline");
  },
  strikethrough(_b, m, style) {
    if (notFalse(m)) style.set("text-decoration", "line-through");
  },
  monospaced(_b, _m, style) {
    style.set("font-family", "var(--mkd-font-mono)");
  },
  fontDesign(_b, m, style, data) {
    const d = m.arg();
    if (d instanceof EnumValue) {
      if (d.name === "monospaced") style.set("font-family", "var(--mkd-font-mono)");
      else data.set("design", d.name);
    }
  },
  multilineTextAlignment(_b, m, style) {
    const a = m.arg();
    if (a instanceof EnumValue) {
      const map: Record<string, string> = { leading: "left", center: "center", trailing: "right" };
      style.set("text-align", Object.prototype.hasOwnProperty.call(map, a.name) ? map[a.name] : "left");
    }
  },
  textCase(_b, m, style) {
    const a = m.arg();
    if (a instanceof EnumValue) {
      style.set("text-transform", a.name === "uppercase" || a.name === "lowercase" ? a.name : "none");
    }
  },
  lineLimit(_b, m, style) {
    const n = m.arg();
    if (typeof n === "number" && n > 0) {
      style.set("display", "-webkit-box");
      style.set("-webkit-line-clamp", intStr(n));
      style.set("-webkit-box-orient", "vertical");
      style.set("overflow", "hidden");
    }
  },
  // --- colour and shape ---
  foregroundStyle,
  foregroundColor: foregroundStyle,
  background(_b, m, style, data) {
    const v = m.arg();
    if (v instanceof EnumValue && MATERIALS.has(v.name)) {
      data.set("material", v.name);
      return;
    }
    const c = cssColor(v);
    if (c) style.set("background", c);
    const r = m.kwargs.get("in");
    if (r instanceof ViewList && r.views.length) shapeRadius(r.views[0], style);
    else if (r instanceof EnumValue) enumRadius(r, style);
  },
  tint,
  accentColor: tint,
  fill(_b, m, style) {
    const c = cssColor(m.arg());
    if (c) style.set("--mkd-shape-fill", c);
  },
  stroke(_b, m, style, _data, _classes, _pad, view) {
    const c = cssColor(m.arg()) || "currentColor";
    const w = u(m.kwargs.get("lineWidth", 1)) || "1px";
    style.set("--mkd-shape-fill", "transparent");
    // R-REND-014.C1, C4: drawn on the circle inside the frame, not on the frame
    if (isCircle(view)) style.set("--mkd-shape-stroke", `${w} solid ${c}`);
    else style.set("border", `${w} solid ${c}`);
  },
  opacity(_b, m, style) {
    const v = m.arg();
    if (isNum(v)) style.set("opacity", floatRepr(pyMax(0.0, pyMin(1.0, numValue(v)))));
  },
  cornerRadius(_b, m, style) {
    const length = u(m.arg());
    if (length !== null) {
      style.set("border-radius", length);
      style.set("overflow", "hidden");
    }
  },
  clipShape(_b, m, style) {
    const v = m.args.length ? m.arg() : (m.content && m.content.length ? new ViewList(m.content) : null);
    if (v instanceof ViewList && v.views.length) shapeRadius(v.views[0], style);
    else if (v instanceof EnumValue) enumRadius(v, style);
    style.set("overflow", "hidden");
  },
  shadow(_b, m, style, _data, _classes, _pad, view) {
    const r = m.kwargs.get("radius", m.arg(0, 8));
    const length = u(r) || u(8)!;
    const c = cssColor(m.kwargs.get("color")) || "rgb(0 0 0 / 0.18)";
    const y = u(m.kwargs.get("y", 2)) || "0";
    // R-REND-014.C4: the shadow follows the circle drawn inside the frame
    if (isCircle(view)) style.set("filter", `drop-shadow(0 ${y} ${length} ${c})`);
    else style.set("box-shadow", `0 ${y} ${length} ${c}`);
  },
  border(_b, m, style) {
    const c = cssColor(m.arg()) || "var(--mkd-border)";
    const w = u(m.kwargs.get("width", 1)) || "1px";
    style.set("border", `${w} solid ${c}`);
  },
  imageScale(_b, m, _style, data) {
    const v = m.arg();
    if (v instanceof EnumValue) data.set("scale", v.name);
  },
  resizable(_b, _m, _style, data) {
    data.set("resizable", "true");
  },
  aspectRatio(_b, m, style, data) {
    const ratio = m.arg();
    if (isNum(ratio)) style.set("aspect-ratio", pyStr(ratio));
    const mode = m.kwargs.get("contentMode", isNumOrBool(ratio) ? m.arg(1) : ratio);
    if (mode instanceof EnumValue) data.set("content-mode", mode.name);
  },
  scaledToFit(_b, _m, _style, data) {
    data.set("content-mode", "fit");
  },
  scaledToFill(_b, _m, _style, data) {
    data.set("content-mode", "fill");
  },
  hidden(_b, m, style) {
    if (notFalse(m)) style.set("visibility", "hidden");
  },
  // --- semantics ---
  id(_b, m, _style, data) {
    if (m.arg() !== null) data.set("mkd-id", pyStr(m.arg()));
  },
  ref(_b, m, _style, data) {
    if (m.args.length) data.set("ref", m.args.map((a) => pyStr(a)).join(" "));
  },
  class(b, m, _style, _data, classes) {
    for (const a of m.args) {
      for (const c of pyStr(a).split(new RegExp(`[${PY_WS}]+`, "u")).filter((x) => x)) {
        if (/^[A-Za-z_][A-Za-z0-9_-]*$/.test(c)) classes.push(c);
        else b.diags.warning(`invalid class name ${strRepr(c)}`, m.loc, "modifier");
      }
    }
  },
  labelsHidden(_b, _m, _style, data) {
    data.set("labels-hidden", "true");
  },
};

/** Collects inline style, data attributes and extra classes for one view's modifiers. */
export class StyleBuilder {
  readonly packFont: PackFont;
  readonly diags: Diagnostics;

  constructor(packFont: PackFont, diags: Diagnostics) {
    this.packFont = packFont;
    this.diags = diags;
  }

  build(view: View): [StyleMap, DataMap, string[]] {
    const style: StyleMap = new Map();
    const data: DataMap = new Map();
    const classes: string[] = [];
    const pad = new Map<string, string>();
    for (const m of view.modifiers) {
      if (Object.prototype.hasOwnProperty.call(HANDLERS, m.name)) HANDLERS[m.name](this, m, style, data, classes, pad, view);
    }
    if (pad.size) {
      for (const side of ["top", "right", "bottom", "left"]) {
        if (pad.has(side)) style.set(`padding-${side}`, pad.get(side)!);
      }
    }
    return [style, data, classes];
  }
}

export function styleAttr(style: ReadonlyMap<string, string>): string {
  return [...style].map(([k, v]) => `${k}:${v}`).join(";");
}

