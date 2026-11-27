/**
 * Content roles: text, label, image, icon, avatar, badge, chip, link, progress, rating, placeholder, chart.
 *
 * One role family of the HTML renderer (port of `mockitdown.render.roles.content`): its role functions are
 * called with `this` bound to the {@link Renderer} and rely on its infrastructure (`open`, `views`, `content`,
 * `slot`, `icon`, …); `ROLES` in `../html.ts` assembles the families and dispatches by role.
 */

import { EnumValue, Thunk, ViewList } from "../../model.js";
import { pyMax, pyMin } from "../../pyformat.js";
import { intStr, isList, isSeq, isTuple, pyBool, PyDict, pyStr } from "../../values.js";
import { chartHasData, chartSpec, renderChart } from "../charts.js";
import { fontStyle, u } from "../style.js";
import {
  at, bool, esc, fmt, fx, has, initials, int, isNumOrBool, iter, LEADING_WS, name, num, or, or0, ordSum, pyRound,
  textHtml,
} from "../util.js";
import type { RoleFn } from "../html.js";

/** The open 240-degree arc of an accessoryCircular gauge (centre 12,12, radius 9, gap at the bottom). */
const GAUGE_ARC = "M4.21 16.5A9 9 0 1 1 19.79 16.5";

export const ContentRoles: Record<string, RoleFn> = {
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
};
