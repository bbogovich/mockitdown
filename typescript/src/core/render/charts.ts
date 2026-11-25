/**
 * Chart rendering: data → inline SVG (port of `mockitdown.render.charts`).
 *
 * Every chart is drawn in a fixed logical canvas (`width` × `height`, default 360 × 200). Colours come
 * from the pack's `--mkd-chart-1…6` tokens. Kinds: bar (horizontal, stacked, grouped), line, area,
 * sparkline, pie, donut, scatter, bubble, radar, heatmap, funnel, treemap, gauge, candlestick,
 * histogram (alias of bar), combo (bars + a line series).
 */

import { pyFixed, pyFormatG, pyMax, pyMin, pyMod, pyRound, pyRoundTo } from "../pyformat.js";
import { floatRepr, intStr } from "../values.js";
import { esc } from "./util.js";

const FONT = "10.5";

function f1(x: number): string {
  return pyFixed(x, 1);
}

function fmt(n: number): string {
  if (Math.abs(n) >= 1_000_000) return `${pyFormatG(n / 1_000_000)}M`;
  if (Math.abs(n) >= 10_000) return `${pyFormatG(n / 1000)}k`;
  return n !== Math.trunc(n) ? pyFormatG(n) : intStr(Math.trunc(n) || 0);
}

export function color(i: number): string {
  return `var(--mkd-chart-${pyMod(i, 6) + 1})`;
}

function minOf(xs: number[]): number {
  return pyMin(...xs);
}

function maxOf(xs: number[]): number {
  return pyMax(...xs);
}

function sum(xs: number[]): number {
  let s = 0;
  for (const x of xs) s += x;
  return s;
}

export function niceTicks(lo: number, hi: number, count = 5): number[] {
  if (hi <= lo) hi = lo + 1;
  const raw = (hi - lo) / Math.max(count - 1, 1);
  const mag = 10 ** Math.floor(Math.log10(raw));
  let step = 0;
  for (const m of [1, 2, 2.5, 5, 10]) {
    if (m * mag >= raw) {
      step = m * mag;
      break;
    }
  }
  const start = Math.floor(lo / step) * step;
  const ticks: number[] = [];
  let t = start;
  while ((t <= hi + step * 0.5 || ticks.length === 0 || ticks[ticks.length - 1] < hi) && ticks.length < 12) {
    ticks.push(pyRoundTo(t, 10));
    t += step;
  }
  return ticks;
}

export interface ChartSpec {
  kind: string;
  series: number[][];
  names: string[];
  labels: string[];
  points: number[][];
  matrix: number[][];
  y_labels: string[];
  width: number;
  height: number;
  /** Whether width and height are Python ints (they print as `118`, not `118.0`). */
  int_dims: boolean;
  stacked: boolean;
  horizontal: boolean;
  legend: boolean | null;
  grid: boolean;
  show_values: boolean;
  x_label: string;
  y_label: string;
  from_zero: boolean | null;
  value: number;
  minimum: number;
  maximum: number;
  unit: string;
  /** combo: index of the series drawn as a line. */
  line_series: number;
}

export function chartSpec(kind: string, init: Partial<ChartSpec> = {}): ChartSpec {
  return {
    kind, series: [], names: [], labels: [], points: [], matrix: [], y_labels: [], width: 360, height: 200,
    int_dims: true, stacked: false, horizontal: false, legend: null, grid: true, show_values: false, x_label: "",
    y_label: "", from_zero: null, value: 0, minimum: 0, maximum: 100, unit: "", line_series: -1, ...init,
  };
}

function dim(spec: ChartSpec, x: number): string {
  return spec.int_dims && Number.isInteger(x) ? intStr(x) : floatRepr(x);
}

function text(x: number, y: number, s: string, anchor = "middle", size = FONT, cls = "mkd-chart__label", extra = ""): string {
  return `<text class="${cls}" x="${f1(x)}" y="${f1(y)}" text-anchor="${anchor}" font-size="${size}"${extra}>${esc(s)}</text>`;
}

function legend(spec: ChartSpec, names: string[]): string {
  if (!names.length || spec.legend === false) return "";
  const items = names.map((n, i) => `<span class="mkd-chart__key"><span class="mkd-chart__swatch" style="background:${color(i)}"></span>`
    + `${esc(n)}</span>`).join("");
  return `<div class="mkd-chart__legend">${items}</div>`;
}

function svg(spec: ChartSpec, body: string): string {
  return `<svg class="mkd-chart__svg" viewBox="0 0 ${pyFormatG(spec.width)} ${pyFormatG(spec.height)}" role="img" `
    + `aria-hidden="true" preserveAspectRatio="xMidYMid meet">${body}</svg>`;
}

export function renderChart(spec: ChartSpec): string {
  const fns: Record<string, (s: ChartSpec) => string> = {
    bar: bars, histogram: bars, column: bars, line: lines, area: lines, sparkline: spark,
    pie, donut: pie, doughnut: pie, scatter, bubble: scatter, radar, heatmap, funnel, treemap, gauge,
    candlestick: candles, combo: bars,
  };
  const fn = Object.prototype.hasOwnProperty.call(fns, spec.kind) ? fns[spec.kind] : bars;
  return fn(spec);
}

// --- cartesian helpers ---------------------------------------------------------------------------

class Plot {
  constructor(readonly x0: number, readonly y0: number, readonly x1: number, readonly y1: number,
    readonly lo: number, readonly hi: number) {}

  y(v: number): number {
    return this.y1 - (v - this.lo) / ((this.hi - this.lo) || 1) * (this.y1 - this.y0);
  }

  x(v: number): number {
    return this.x0 + (v - this.lo) / ((this.hi - this.lo) || 1) * (this.x1 - this.x0);
  }
}

function valueRange(spec: ChartSpec, values: number[], stackedTotals: number[] | null = null, zero = true): [number, number] {
  const vals = [...(stackedTotals && stackedTotals.length ? stackedTotals : []), ...values];
  let lo: number, hi: number;
  if (vals.length) {
    lo = minOf(vals);
    hi = maxOf(vals);
  } else {
    lo = 0.0;
    hi = 1.0;
  }
  if (zero || spec.from_zero === true) lo = pyMin(0.0, lo);
  const ticks = niceTicks(lo, hi);
  return [ticks[0], ticks[ticks.length - 1]];
}

function axes(spec: ChartSpec, plot: Plot, horizontal = false): string {
  const out: string[] = [];
  for (const t of niceTicks(plot.lo, plot.hi)) {
    if (t < plot.lo - 1e-9 || t > plot.hi + 1e-9) continue;
    if (horizontal) {
      const x = plot.x(t);
      if (spec.grid) out.push(`<line class="mkd-chart__grid" x1="${f1(x)}" y1="${f1(plot.y0)}" x2="${f1(x)}" y2="${f1(plot.y1)}"/>`);
      out.push(text(x, plot.y1 + 13, fmt(t)));
    } else {
      const y = plot.y(t);
      if (spec.grid) out.push(`<line class="mkd-chart__grid" x1="${f1(plot.x0)}" y1="${f1(y)}" x2="${f1(plot.x1)}" y2="${f1(y)}"/>`);
      out.push(text(plot.x0 - 6, y + 3.5, fmt(t), "end"));
    }
  }
  out.push(`<line class="mkd-chart__axis" x1="${f1(plot.x0)}" y1="${f1(plot.y1)}" x2="${f1(plot.x1)}" y2="${f1(plot.y1)}"/>`);
  if (spec.y_label) {
    out.push(text(10, (plot.y0 + plot.y1) / 2, spec.y_label, "middle", FONT, "mkd-chart__label",
      ` transform="rotate(-90 10 ${f1((plot.y0 + plot.y1) / 2)})"`));
  }
  if (spec.x_label) out.push(text((plot.x0 + plot.x1) / 2, spec.height - 3, spec.x_label));
  return out.join("");
}

function frame(spec: ChartSpec, labelsBelow = true): [number, number, number, number] {
  const left = 34 + (spec.y_label ? 12 : 0);
  const bottom = (labelsBelow ? 18 : 6) + (spec.x_label ? 12 : 0);
  return [left, 8, spec.width - 8, spec.height - bottom];
}

function strLen(s: string): number {
  return Array.from(s).length;
}

function bars(spec: ChartSpec): string {
  const series = spec.series.length ? spec.series : [[]];
  const n = series.length ? maxOf(series.map((s) => s.length)) : 0;
  const labels = [...spec.labels, ...Array(Math.max(0, n - spec.labels.length)).fill("")];
  const barSeries = series.filter((_, i) => i !== spec.line_series);
  const totals = spec.stacked
    ? Array.from({ length: n }, (_, i) => sum(barSeries.filter((s) => i < s.length).map((s) => pyMax(0.0, s[i]))))
    : null;
  const [lo, hi] = valueRange(spec, series.flat(), totals);
  const out: string[] = [];
  if (spec.horizontal) {
    const left = 8 + pyMin(90, 6 * (labels.length ? maxOf(labels.map(strLen)) : 4));
    const plot = new Plot(left, 6, spec.width - 10, spec.height - 18, lo, hi);
    out.push(axes(spec, plot, true));
    const band = (plot.y1 - plot.y0) / Math.max(n, 1);
    for (let i = 0; i < n; i++) {
      const yb = plot.y0 + i * band;
      out.push(text(plot.x0 - 6, yb + band / 2 + 3.5, labels[i], "end"));
      const groups = spec.stacked ? 1 : barSeries.length;
      const h = band * 0.7 / groups;
      let acc = 0.0;
      barSeries.forEach((s, si) => {
        if (i >= s.length) return;
        const v = s[i];
        let x0: number, x1: number, y: number;
        if (spec.stacked) {
          x0 = plot.x(acc);
          x1 = plot.x(acc + v);
          acc += v;
          y = yb + band * 0.15;
        } else {
          x0 = plot.x(0);
          x1 = plot.x(v);
          y = yb + band * 0.15 + si * h;
        }
        out.push(`<rect class="mkd-chart__bar" x="${f1(pyMin(x0, x1))}" y="${f1(y)}" width="${f1(Math.abs(x1 - x0))}" `
          + `height="${f1(h)}" rx="2" style="fill:${color(si)};--mkd-series:${color(si)}"/>`);
        if (spec.show_values && !spec.stacked) out.push(text(pyMax(x0, x1) + 4, y + h / 2 + 3.5, fmt(v), "start"));
      });
    }
    return svg(spec, out.join("")) + legend(spec, series.length > 1 ? spec.names : []);
  }
  const [x0, y0, x1, y1] = frame(spec);
  const plot = new Plot(x0, y0, x1, y1, lo, hi);
  out.push(axes(spec, plot));
  const band = (x1 - x0) / Math.max(n, 1);
  const groups = spec.stacked ? 1 : Math.max(barSeries.length, 1);
  const w = band * 0.68 / groups;
  for (let i = 0; i < n; i++) {
    const xb = x0 + i * band;
    out.push(text(xb + band / 2, y1 + 13, labels[i]));
    let acc = 0.0;
    barSeries.forEach((s, si) => {
      if (i >= s.length) return;
      const v = s[i];
      let ya: number, yb: number, x: number, ww: number;
      if (spec.stacked) {
        ya = plot.y(acc);
        yb = plot.y(acc + v);
        acc += v;
        x = xb + band * 0.16;
        ww = band * 0.68;
      } else {
        ya = plot.y(0);
        yb = plot.y(v);
        x = xb + band * 0.16 + si * w;
        ww = w;
      }
      out.push(`<rect class="mkd-chart__bar" x="${f1(x)}" y="${f1(pyMin(ya, yb))}" width="${f1(pyMax(ww - 1, 1))}" `
        + `height="${f1(Math.abs(yb - ya))}" rx="2" style="fill:${color(si)};--mkd-series:${color(si)}"/>`);
      if (spec.show_values && !spec.stacked) out.push(text(x + ww / 2, pyMin(ya, yb) - 3, fmt(v), "middle", "9"));
    });
  }
  if (spec.line_series >= 0 && spec.line_series < series.length) {
    const s = series[spec.line_series];
    const c = color(spec.line_series);
    const pts = s.map((v, i) => `${f1(x0 + (i + 0.5) * band)},${f1(plot.y(v))}`).join(" ");
    out.push(`<polyline class="mkd-chart__line" points="${pts}" style="stroke:${c};--mkd-series:${c}"/>`);
    for (let i = 0; i < s.length; i++) {
      out.push(`<circle cx="${f1(x0 + (i + 0.5) * band)}" cy="${f1(plot.y(s[i]))}" r="2.6" style="fill:${c};--mkd-series:${c}"/>`);
    }
  }
  return svg(spec, out.join("")) + legend(spec, series.length > 1 ? spec.names : []);
}

function lines(spec: ChartSpec): string {
  const series = spec.series.length ? spec.series : [[]];
  const n = series.length ? maxOf(series.map((s) => s.length)) : 0;
  let totals: number[] | null = null;
  if (spec.stacked) totals = Array.from({ length: n }, (_, i) => sum(series.filter((s) => i < s.length).map((s) => s[i])));
  const zero = spec.from_zero === null ? spec.kind === "area" : spec.from_zero;
  const [lo, hi] = valueRange(spec, series.flat(), totals, zero);
  const [x0, y0, x1, y1] = frame(spec);
  const plot = new Plot(x0, y0, x1, y1, lo, hi);
  const out = [axes(spec, plot)];
  const step = (x1 - x0) / Math.max(n - 1, 1);
  const labels = spec.labels;
  const every = Math.max(1, Math.ceil(labels.length / 8));
  labels.slice(0, n).forEach((lab, i) => {
    if (i % every === 0) out.push(text(x0 + i * step, y1 + 13, lab));
  });
  let base: number[] = Array(n).fill(0.0);
  const layers: string[] = [];
  series.forEach((s, si) => {
    const tops = s.map((v, i) => (spec.stacked ? base[i] + v : v));
    const pts = tops.map((v, i) => [x0 + i * step, plot.y(v)]);
    const line = pts.map(([x, y]) => `${f1(x)},${f1(y)}`).join(" ");
    const c = color(si);
    if (spec.kind === "area") {
      const bottom = s.map((_, i) => [x0 + i * step, plot.y(spec.stacked ? base[i] : pyMax(lo, 0))]);
      const poly = line + " " + bottom.reverse().map(([x, y]) => `${f1(x)},${f1(y)}`).join(" ");
      layers.push(`<polygon class="mkd-chart__area" points="${poly}" style="fill:${c};--mkd-series:${c}"/>`);
    }
    layers.push(`<polyline class="mkd-chart__line" points="${line}" style="stroke:${c};--mkd-series:${c}"/>`);
    if (spec.kind === "line" && n <= 16) {
      for (const [x, y] of pts) layers.push(`<circle cx="${f1(x)}" cy="${f1(y)}" r="2.4" style="fill:${c};--mkd-series:${c}"/>`);
    }
    if (spec.stacked) base = [...tops, ...base.slice(tops.length)];
  });
  out.push(...layers);
  return svg(spec, out.join("")) + legend(spec, series.length > 1 ? spec.names : []);
}

function spark(spec: ChartSpec): string {
  const s = spec.series.length ? spec.series[0] : [];
  if (!s.length) return "";
  let lo = minOf(s);
  const hi = maxOf(s);
  if (spec.from_zero) lo = pyMin(0.0, lo);
  const span = (hi - lo) || 1;
  const w = spec.width;
  const h = spec.height;
  const pts = s.map((v, i) => `${f1(i / Math.max(s.length - 1, 1) * (w - 4) + 2)},${f1(h - 3 - (v - lo) / span * (h - 6))}`).join(" ");
  const c = color(0);
  return svg(spec, `<polygon class="mkd-chart__area" points="2,${dim(spec, h - 1)} ${pts} ${dim(spec, w - 2)},${dim(spec, h - 1)}" `
    + `style="fill:${c};--mkd-series:${c}"/><polyline class="mkd-chart__line" points="${pts}" `
    + `style="stroke:${c};--mkd-series:${c}"/>`);
}

function pie(spec: ChartSpec): string {
  const vals = (spec.series.length ? spec.series[0] : []).map((v) => pyMax(0.0, v));
  const total = sum(vals) || 1;
  const cx = spec.height / 2;
  const cy = spec.height / 2;
  const r = spec.height / 2 - 6;
  const inner = spec.kind === "donut" || spec.kind === "doughnut" ? r * 0.58 : 0;
  const out: string[] = [];
  let a = -Math.PI / 2;
  const p = (ang: number, rr: number): [number, number] => [cx + rr * Math.cos(ang), cy + rr * Math.sin(ang)];
  vals.forEach((v, i) => {
    const da = v / total * 2 * Math.PI;
    if (da <= 0) return;
    const a2 = a + da;
    const large = da > Math.PI ? 1 : 0;
    const [xa, ya] = p(a, r);
    const [xb, yb] = p(a2, r);
    let d: string;
    if (da >= 2 * Math.PI - 1e-6) {
      d = `M${f1(cx - r)},${f1(cy)}a${f1(r)},${f1(r)} 0 1,0 ${f1(2 * r)},0a${f1(r)},${f1(r)} 0 1,0 ${f1(-2 * r)},0`;
    } else if (inner) {
      const [xc, yc] = p(a2, inner);
      const [xd, yd] = p(a, inner);
      d = `M${f1(xa)},${f1(ya)}A${f1(r)},${f1(r)} 0 ${large},1 ${f1(xb)},${f1(yb)}L${f1(xc)},${f1(yc)}`
        + `A${f1(inner)},${f1(inner)} 0 ${large},0 ${f1(xd)},${f1(yd)}Z`;
    } else {
      d = `M${f1(cx)},${f1(cy)}L${f1(xa)},${f1(ya)}A${f1(r)},${f1(r)} 0 ${large},1 ${f1(xb)},${f1(yb)}Z`;
    }
    out.push(`<path class="mkd-chart__slice" d="${d}" style="fill:${color(i)};--mkd-series:${color(i)}"/>`);
    if (spec.show_values && da > 0.35) {
      const [mx, my] = p(a + da / 2, inner ? (r + inner) / 2 : r * 0.62);
      out.push(text(mx, my + 3.5, `${pyRound(v / total * 100)}%`, "middle", FONT, "mkd-chart__label mkd-chart__label--on"));
    }
    a = a2;
  });
  if (inner && spec.unit) out.push(text(cx, cy + 5, spec.unit, "middle", "14", "mkd-chart__center"));
  // legend at the right of the pie
  const lx = spec.height + 12;
  const labs = spec.labels.slice(0, vals.length);
  for (let i = 0; i < labs.length; i++) {
    const y = 18 + i * 18;
    if (y > spec.height - 6) break;
    const pct = i < vals.length ? ` · ${pyRound(vals[i] / total * 100)}%` : "";
    out.push(`<rect x="${f1(lx)}" y="${f1(y - 8)}" width="10" height="10" rx="2" style="fill:${color(i)};--mkd-series:${color(i)}"/>`);
    out.push(text(lx + 16, y + 1, labs[i] + pct, "start"));
  }
  return svg(spec, out.join(""));
}

function scatter(spec: ChartSpec): string {
  const pts = spec.points.filter((p) => p.length >= 2);
  if (!pts.length) return svg(spec, "");
  const xs = pts.map((p) => p[0]);
  const ys = pts.map((p) => p[1]);
  const xt = niceTicks(minOf(xs), maxOf(xs));
  const yt = niceTicks(minOf(ys), maxOf(ys));
  const [x0, y0, x1, y1] = frame(spec);
  const plot = new Plot(x0, y0, x1, y1, yt[0], yt[yt.length - 1]);
  const out = [axes(spec, plot)];
  const sx = (v: number): number => x0 + (v - xt[0]) / ((xt[xt.length - 1] - xt[0]) || 1) * (x1 - x0);
  for (const t of xt) out.push(text(sx(t), y1 + 13, fmt(t)));
  const sizes = pts.filter((p) => p.length > 2).map((p) => p[2]);
  const smax = (sizes.length ? maxOf(sizes) : 1) || 1;
  for (const p of pts) {
    const r = spec.kind === "scatter" || p.length < 3 ? 3.2 : 3 + 14 * Math.sqrt(p[2] / smax);
    const group = p.length > 3 ? Math.trunc(p[3]) : 0;
    out.push(`<circle class="mkd-chart__dot" cx="${f1(sx(p[0]))}" cy="${f1(plot.y(p[1]))}" r="${f1(r)}" `
      + `style="fill:${color(group)};--mkd-series:${color(group)}"/>`);
  }
  return svg(spec, out.join("")) + legend(spec, spec.names);
}

function radar(spec: ChartSpec): string {
  const labels = spec.labels;
  const n = pyMax(labels.length, spec.series.length ? maxOf(spec.series.map((s) => s.length)) : 0, 3);
  const cx = spec.width / 2;
  const cy = spec.height / 2 + 4;
  const r = spec.height / 2 - 22;
  const all = spec.series.flat();
  const top = (all.length ? maxOf(all) : 1) || 1;
  const ticks = niceTicks(0, top);
  const hi = ticks[ticks.length - 1];
  const ang = (i: number): number => -Math.PI / 2 + i * 2 * Math.PI / n;
  const out: string[] = [];
  for (const level of [0.25, 0.5, 0.75, 1.0]) {
    const pts = Array.from({ length: n }, (_, i) => `${f1(cx + r * level * Math.cos(ang(i)))},${f1(cy + r * level * Math.sin(ang(i)))}`).join(" ");
    out.push(`<polygon class="mkd-chart__grid" points="${pts}" fill="none"/>`);
  }
  for (let i = 0; i < n; i++) {
    out.push(`<line class="mkd-chart__grid" x1="${f1(cx)}" y1="${f1(cy)}" x2="${f1(cx + r * Math.cos(ang(i)))}" `
      + `y2="${f1(cy + r * Math.sin(ang(i)))}"/>`);
    if (i < labels.length) {
      const lx = cx + (r + 12) * Math.cos(ang(i));
      const ly = cy + (r + 12) * Math.sin(ang(i));
      const anchor = Math.abs(Math.cos(ang(i))) < 0.3 ? "middle" : (Math.cos(ang(i)) > 0 ? "start" : "end");
      out.push(text(lx, ly + 3.5, labels[i], anchor));
    }
  }
  spec.series.forEach((s, si) => {
    const pts = s.slice(0, n).map((v, i) => `${f1(cx + r * (v / hi) * Math.cos(ang(i)))},${f1(cy + r * (v / hi) * Math.sin(ang(i)))}`).join(" ");
    const c = color(si);
    out.push(`<polygon class="mkd-chart__area" points="${pts}" style="fill:${c};--mkd-series:${c}"/>`
      + `<polygon class="mkd-chart__line" points="${pts}" style="stroke:${c};--mkd-series:${c}"/>`);
  });
  return svg(spec, out.join("")) + legend(spec, spec.names);
}

function heatmap(spec: ChartSpec): string {
  const m = spec.matrix;
  const rows = m.length;
  const cols = rows ? maxOf(m.map((r) => r.length)) : 0;
  if (!rows || !cols) return svg(spec, "");
  const vals = m.flat();
  const lo = minOf(vals);
  const hi = maxOf(vals);
  const left = spec.y_labels.length ? 8 + pyMin(70, 6 * maxOf(spec.y_labels.map(strLen))) : 6;
  const top = 4;
  const bottom = spec.labels.length ? 16 : 4;
  const cw = (spec.width - left - 4) / cols;
  const ch = (spec.height - top - bottom) / rows;
  const out: string[] = [];
  m.forEach((row, ri) => {
    row.forEach((v, ci) => {
      const t = (v - lo) / ((hi - lo) || 1);
      out.push(`<rect x="${f1(left + ci * cw + 1)}" y="${f1(top + ri * ch + 1)}" width="${f1(cw - 2)}" `
        + `height="${f1(ch - 2)}" rx="2" style="fill:color-mix(in srgb, var(--mkd-chart-1) `
        + `${pyFixed(8 + t * 92, 0)}%, var(--mkd-surface-2))"/>`);
      if (spec.show_values) out.push(text(left + (ci + 0.5) * cw, top + (ri + 0.5) * ch + 3.5, fmt(v), "middle", "9"));
    });
    if (ri < spec.y_labels.length) out.push(text(left - 6, top + (ri + 0.5) * ch + 3.5, spec.y_labels[ri], "end"));
  });
  spec.labels.slice(0, cols).forEach((lab, ci) => out.push(text(left + (ci + 0.5) * cw, spec.height - 4, lab)));
  return svg(spec, out.join(""));
}

function funnel(spec: ChartSpec): string {
  const vals = spec.series.length ? spec.series[0] : [];
  if (!vals.length) return svg(spec, "");
  const top = maxOf(vals) || 1;
  const h = (spec.height - 4) / vals.length;
  const cx = spec.width * 0.42;
  const maxw = spec.width * 0.8;
  const out: string[] = [];
  vals.forEach((v, i) => {
    const w = maxw * v / top;
    const nxt = maxw * (i + 1 < vals.length ? vals[i + 1] / top : v / top * 0.8);
    const y = 2 + i * h;
    out.push(`<polygon points="${f1(cx - w / 2)},${f1(y)} ${f1(cx + w / 2)},${f1(y)} ${f1(cx + nxt / 2)},`
      + `${f1(y + h - 2)} ${f1(cx - nxt / 2)},${f1(y + h - 2)}" style="fill:${color(i)};--mkd-series:${color(i)}"/>`);
    const lab = i < spec.labels.length ? spec.labels[i] : "";
    out.push(text(cx + maxw / 2 + 8, y + h / 2 + 3.5, `${lab}  ${fmt(v)}`, "start"));
  });
  return svg(spec, out.join(""));
}

type Item = [number, string, number];

function treemap(spec: ChartSpec): string {
  const vals: Item[] = (spec.series.length ? spec.series[0] : []).map((v, i) => [pyMax(0.0, v), i < spec.labels.length ? spec.labels[i] : "", i]);
  vals.sort((a, b) => (-a[0] < -b[0] ? -1 : -b[0] < -a[0] ? 1 : 0));
  const out: string[] = [];
  const layout = (items: Item[], x: number, y: number, w: number, h: number, vertical: boolean): void => {
    if (!items.length) return;
    if (items.length === 1) {
      const [v, lab, i] = items[0];
      out.push(`<rect x="${f1(x + 1)}" y="${f1(y + 1)}" width="${f1(pyMax(w - 2, 0))}" height="${f1(pyMax(h - 2, 0))}" `
        + `rx="3" style="fill:${color(i)};--mkd-series:${color(i)}"/>`);
      if (w > 30 && h > 16) {
        out.push(text(x + 6, y + 14, lab, "start", FONT, "mkd-chart__label mkd-chart__label--on"));
        out.push(text(x + 6, y + 26, fmt(v), "start", "9", "mkd-chart__label mkd-chart__label--on"));
      }
      return;
    }
    const total = sum(items.map((t) => t[0])) || 1;
    let acc = 0.0;
    let split = 1;
    for (let k = 0; k < items.length; k++) {
      acc += items[k][0];
      if (acc >= total / 2) {
        split = Math.max(1, k + 1 < items.length ? k + 1 : k);
        break;
      }
    }
    const a = items.slice(0, split);
    const b = items.slice(split);
    const fa = sum(a.map((t) => t[0])) / total;
    if (vertical) {
      layout(a, x, y, w * fa, h, !vertical);
      layout(b, x + w * fa, y, w * (1 - fa), h, !vertical);
    } else {
      layout(a, x, y, w, h * fa, !vertical);
      layout(b, x, y + h * fa, w, h * (1 - fa), !vertical);
    }
  };
  layout(vals, 0, 0, spec.width, spec.height, true);
  return svg(spec, out.join(""));
}

function gauge(spec: ChartSpec): string {
  const w = spec.width;
  const h = spec.height;
  const cx = w / 2;
  const cy = h * 0.86;
  const r = pyMin(w / 2 - 10, h * 0.78);
  const frac = pyMax(0.0, pyMin(1.0, (spec.value - spec.minimum) / ((spec.maximum - spec.minimum) || 1)));
  const arc = (f: number): [number, number] => [cx - r * Math.cos(f * Math.PI), cy - r * Math.sin(f * Math.PI)];
  const [sx, sy] = arc(0);
  const [ex, ey] = arc(1);
  const [vx, vy] = arc(frac);
  const sw = r * 0.2;
  const out = [
    `<path class="mkd-chart__track" d="M${f1(sx)},${f1(sy)}A${f1(r)},${f1(r)} 0 0,1 ${f1(ex)},${f1(ey)}" `
    + `style="stroke-width:${f1(sw)}"/>`,
    `<path d="M${f1(sx)},${f1(sy)}A${f1(r)},${f1(r)} 0 0,1 ${f1(vx)},${f1(vy)}" fill="none" `
    + `style="stroke:${color(0)};stroke-width:${f1(sw)};stroke-linecap:round"/>`,
    text(cx, cy - r * 0.25, fmt(spec.value) + spec.unit, "middle", floatRepr(r * 0.32), "mkd-chart__center"),
    text(sx, cy + 13, fmt(spec.minimum)), text(ex, cy + 13, fmt(spec.maximum)),
  ];
  return svg(spec, out.join(""));
}

function candles(spec: ChartSpec): string {
  const rows = spec.points.filter((r) => r.length >= 4);
  if (!rows.length) return svg(spec, "");
  const ticks = niceTicks(minOf(rows.map((r) => r[2])), maxOf(rows.map((r) => r[1])));
  const [x0, y0, x1, y1] = frame(spec);
  const plot = new Plot(x0, y0, x1, y1, ticks[0], ticks[ticks.length - 1]);
  const out = [axes(spec, plot)];
  const band = (x1 - x0) / rows.length;
  rows.forEach(([o, h, low, c], i) => {
    const x = x0 + (i + 0.5) * band;
    const up = c >= o;
    const col = up ? "var(--mkd-success)" : "var(--mkd-danger)";
    out.push(`<line x1="${f1(x)}" y1="${f1(plot.y(h))}" x2="${f1(x)}" y2="${f1(plot.y(low))}" style="stroke:${col}"/>`);
    const top = plot.y(pyMax(o, c));
    const bot = plot.y(pyMin(o, c));
    out.push(`<rect x="${f1(x - band * 0.3)}" y="${f1(top)}" width="${f1(band * 0.6)}" height="${f1(pyMax(bot - top, 1))}" `
      + `style="fill:${col}"/>`);
    if (i < spec.labels.length && i % Math.max(1, Math.ceil(rows.length / 8)) === 0) out.push(text(x, y1 + 13, spec.labels[i]));
  });
  return svg(spec, out.join(""));
}
