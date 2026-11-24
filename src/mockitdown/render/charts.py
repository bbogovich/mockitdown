"""Chart rendering: data → inline SVG.

Every chart is drawn in a fixed logical canvas (``width`` × ``height``, default 360 × 200) and
scales uniformly with its container, so text and strokes keep their proportions. Colours come from
the pack's ``--mkd-chart-1…6`` tokens, text from ``--mkd-fg-2``, grid lines from ``--mkd-divider``.

Kinds: bar (vertical; ``horizontal``, ``stacked``, grouped when several series), line, area
(``stacked``), sparkline, pie, donut, scatter, bubble, radar, heatmap, funnel, treemap, gauge,
candlestick, histogram (alias of bar), combo (bars + a line series).
"""

from __future__ import annotations

import math
from dataclasses import dataclass, field
from html import escape

FONT = 10.5


def _num(v: object, default: float = 0.0) -> float:
    if isinstance(v, bool):
        return default
    if isinstance(v, (int, float)):
        return float(v)
    try:
        return float(str(v))
    except (TypeError, ValueError):
        return default


def _fmt(n: float) -> str:
    if abs(n) >= 1_000_000:
        return f"{n / 1_000_000:g}M"
    if abs(n) >= 10_000:
        return f"{n / 1000:g}k"
    return f"{n:g}" if n != int(n) else str(int(n))


def color(i: int) -> str:
    return f"var(--mkd-chart-{i % 6 + 1})"


def nice_ticks(lo: float, hi: float, count: int = 5) -> list[float]:
    if hi <= lo:
        hi = lo + 1
    raw = (hi - lo) / max(count - 1, 1)
    mag = 10 ** math.floor(math.log10(raw))
    step = next(m * mag for m in (1, 2, 2.5, 5, 10) if m * mag >= raw)
    start = math.floor(lo / step) * step
    ticks, t = [], start
    while t <= hi + step * 0.5 and len(ticks) < 12:
        ticks.append(round(t, 10))
        t += step
    return ticks


@dataclass
class ChartSpec:
    kind: str
    series: list[list[float]] = field(default_factory=list)
    names: list[str] = field(default_factory=list)
    labels: list[str] = field(default_factory=list)
    points: list[list[float]] = field(default_factory=list)
    matrix: list[list[float]] = field(default_factory=list)
    y_labels: list[str] = field(default_factory=list)
    width: float = 360
    height: float = 200
    stacked: bool = False
    horizontal: bool = False
    legend: bool | None = None
    grid: bool = True
    show_values: bool = False
    x_label: str = ""
    y_label: str = ""
    from_zero: bool | None = None
    value: float = 0
    minimum: float = 0
    maximum: float = 100
    unit: str = ""
    line_series: int = -1  # combo: index of the series drawn as a line


def _text(x: float, y: float, s: str, anchor: str = "middle", size: float = FONT, cls: str = "mkd-chart__label",
          extra: str = "") -> str:
    return (f'<text class="{cls}" x="{x:.1f}" y="{y:.1f}" text-anchor="{anchor}" font-size="{size}"{extra}>'
            f"{escape(s)}</text>")


def _legend(spec: ChartSpec, names: list[str]) -> str:
    if not names or spec.legend is False:
        return ""
    items = "".join(
        f'<span class="mkd-chart__key"><span class="mkd-chart__swatch" style="background:{color(i)}"></span>'
        f"{escape(n)}</span>" for i, n in enumerate(names))
    return f'<div class="mkd-chart__legend">{items}</div>'


def _svg(spec: ChartSpec, body: str) -> str:
    return (f'<svg class="mkd-chart__svg" viewBox="0 0 {spec.width:g} {spec.height:g}" role="img" '
            f'aria-hidden="true" preserveAspectRatio="xMidYMid meet">{body}</svg>')


def render(spec: ChartSpec) -> str:
    k = spec.kind
    fn = {
        "bar": _bars, "histogram": _bars, "column": _bars, "line": _lines, "area": _lines, "sparkline": _spark,
        "pie": _pie, "donut": _pie, "doughnut": _pie, "scatter": _scatter, "bubble": _scatter, "radar": _radar,
        "heatmap": _heatmap, "funnel": _funnel, "treemap": _treemap, "gauge": _gauge, "candlestick": _candles,
        "combo": _bars,
    }.get(k, _bars)
    return fn(spec)


# --- cartesian helpers -----------------------------------------------------------------------------

@dataclass
class _Plot:
    x0: float
    y0: float
    x1: float
    y1: float
    lo: float
    hi: float

    def y(self, v: float) -> float:
        return self.y1 - (v - self.lo) / ((self.hi - self.lo) or 1) * (self.y1 - self.y0)

    def x(self, v: float) -> float:  # value axis horizontal (bar charts laid sideways)
        return self.x0 + (v - self.lo) / ((self.hi - self.lo) or 1) * (self.x1 - self.x0)


def _value_range(spec: ChartSpec, values: list[float], stacked_totals: list[float] | None = None,
                 zero: bool = True) -> tuple[float, float]:
    vals = (stacked_totals or []) + values
    lo, hi = (min(vals), max(vals)) if vals else (0.0, 1.0)
    if zero or (spec.from_zero is True):
        lo = min(0.0, lo)
    ticks = nice_ticks(lo, hi)
    return ticks[0], ticks[-1]


def _axes(spec: ChartSpec, plot: _Plot, horizontal: bool = False) -> str:
    out = []
    for t in nice_ticks(plot.lo, plot.hi):
        if t < plot.lo - 1e-9 or t > plot.hi + 1e-9:
            continue
        if horizontal:
            x = plot.x(t)
            if spec.grid:
                out.append(f'<line class="mkd-chart__grid" x1="{x:.1f}" y1="{plot.y0:.1f}" x2="{x:.1f}" y2="{plot.y1:.1f}"/>')
            out.append(_text(x, plot.y1 + 13, _fmt(t)))
        else:
            y = plot.y(t)
            if spec.grid:
                out.append(f'<line class="mkd-chart__grid" x1="{plot.x0:.1f}" y1="{y:.1f}" x2="{plot.x1:.1f}" y2="{y:.1f}"/>')
            out.append(_text(plot.x0 - 6, y + 3.5, _fmt(t), "end"))
    out.append(f'<line class="mkd-chart__axis" x1="{plot.x0:.1f}" y1="{plot.y1:.1f}" x2="{plot.x1:.1f}" y2="{plot.y1:.1f}"/>')
    if spec.y_label:
        out.append(_text(10, (plot.y0 + plot.y1) / 2, spec.y_label, extra=f' transform="rotate(-90 10 {(plot.y0 + plot.y1) / 2:.1f})"'))
    if spec.x_label:
        out.append(_text((plot.x0 + plot.x1) / 2, spec.height - 3, spec.x_label))
    return "".join(out)


def _frame(spec: ChartSpec, labels_below: bool = True) -> tuple[float, float, float, float]:
    left = 34 + (12 if spec.y_label else 0)
    bottom = (18 if labels_below else 6) + (12 if spec.x_label else 0)
    return left, 8, spec.width - 8, spec.height - bottom


def _bars(spec: ChartSpec) -> str:
    series = spec.series or [[]]
    n = max((len(s) for s in series), default=0)
    labels = spec.labels + [""] * (n - len(spec.labels))
    bar_series = [s for i, s in enumerate(series) if i != spec.line_series]
    totals = [sum(max(0.0, s[i]) for s in bar_series if i < len(s)) for i in range(n)] if spec.stacked else None
    lo, hi = _value_range(spec, [v for s in series for v in s], totals)
    out = []
    if spec.horizontal:
        left = 8 + min(90, 6 * max((len(lab) for lab in labels), default=4))
        plot = _Plot(left, 6, spec.width - 10, spec.height - 18, lo, hi)
        out.append(_axes(spec, plot, horizontal=True))
        band = (plot.y1 - plot.y0) / max(n, 1)
        for i in range(n):
            yb = plot.y0 + i * band
            out.append(_text(plot.x0 - 6, yb + band / 2 + 3.5, labels[i], "end"))
            groups = 1 if spec.stacked else len(bar_series)
            h = band * 0.7 / groups
            acc = 0.0
            for si, s in enumerate(bar_series):
                if i >= len(s):
                    continue
                v = s[i]
                if spec.stacked:
                    x0, x1 = plot.x(acc), plot.x(acc + v)
                    acc += v
                    y = yb + band * 0.15
                else:
                    x0, x1 = plot.x(0), plot.x(v)
                    y = yb + band * 0.15 + si * h
                out.append(f'<rect class="mkd-chart__bar" x="{min(x0, x1):.1f}" y="{y:.1f}" width="{abs(x1 - x0):.1f}" '
                           f'height="{h:.1f}" rx="2" style="fill:{color(si)}"/>')
                if spec.show_values and not spec.stacked:
                    out.append(_text(max(x0, x1) + 4, y + h / 2 + 3.5, _fmt(v), "start"))
        return _svg(spec, "".join(out)) + _legend(spec, spec.names if len(series) > 1 else [])
    x0, y0, x1, y1 = _frame(spec)
    plot = _Plot(x0, y0, x1, y1, lo, hi)
    out.append(_axes(spec, plot))
    band = (x1 - x0) / max(n, 1)
    groups = 1 if spec.stacked else max(len(bar_series), 1)
    w = band * 0.68 / groups
    for i in range(n):
        xb = x0 + i * band
        out.append(_text(xb + band / 2, y1 + 13, labels[i]))
        acc = 0.0
        for si, s in enumerate(bar_series):
            if i >= len(s):
                continue
            v = s[i]
            if spec.stacked:
                ya, yb = plot.y(acc), plot.y(acc + v)
                acc += v
                x = xb + band * 0.16
                ww = band * 0.68
            else:
                ya, yb = plot.y(0), plot.y(v)
                x = xb + band * 0.16 + si * w
                ww = w
            out.append(f'<rect class="mkd-chart__bar" x="{x:.1f}" y="{min(ya, yb):.1f}" width="{max(ww - 1, 1):.1f}" '
                       f'height="{abs(yb - ya):.1f}" rx="2" style="fill:{color(si)}"/>')
            if spec.show_values and not spec.stacked:
                out.append(_text(x + ww / 2, min(ya, yb) - 3, _fmt(v), size=9))
    if 0 <= spec.line_series < len(series):
        s = series[spec.line_series]
        pts = " ".join(f"{x0 + (i + .5) * band:.1f},{plot.y(v):.1f}" for i, v in enumerate(s))
        out.append(f'<polyline class="mkd-chart__line" points="{pts}" style="stroke:{color(spec.line_series)}"/>')
        out += [f'<circle cx="{x0 + (i + .5) * band:.1f}" cy="{plot.y(v):.1f}" r="2.6" '
                f'style="fill:{color(spec.line_series)}"/>' for i, v in enumerate(s)]
    return _svg(spec, "".join(out)) + _legend(spec, spec.names if len(series) > 1 else [])


def _lines(spec: ChartSpec) -> str:
    series = spec.series or [[]]
    n = max((len(s) for s in series), default=0)
    totals = None
    if spec.stacked:
        totals = [sum(s[i] for s in series if i < len(s)) for i in range(n)]
    zero = spec.kind == "area" if spec.from_zero is None else spec.from_zero
    lo, hi = _value_range(spec, [v for s in series for v in s], totals, zero=zero)
    x0, y0, x1, y1 = _frame(spec)
    plot = _Plot(x0, y0, x1, y1, lo, hi)
    out = [_axes(spec, plot)]
    step = (x1 - x0) / max(n - 1, 1)
    labels = spec.labels
    every = max(1, math.ceil(len(labels) / 8))
    for i, lab in enumerate(labels[:n]):
        if i % every == 0:
            out.append(_text(x0 + i * step, y1 + 13, lab))
    base = [0.0] * n
    layers = []
    for si, s in enumerate(series):
        tops = [(base[i] + s[i]) if spec.stacked else s[i] for i in range(len(s))]
        pts = [(x0 + i * step, plot.y(v)) for i, v in enumerate(tops)]
        line = " ".join(f"{x:.1f},{y:.1f}" for x, y in pts)
        if spec.kind == "area":
            bottom = [(x0 + i * step, plot.y(base[i] if spec.stacked else max(lo, 0))) for i in range(len(s))]
            poly = line + " " + " ".join(f"{x:.1f},{y:.1f}" for x, y in reversed(bottom))
            layers.append(f'<polygon class="mkd-chart__area" points="{poly}" style="fill:{color(si)}"/>')
        layers.append(f'<polyline class="mkd-chart__line" points="{line}" style="stroke:{color(si)}"/>')
        if spec.kind == "line" and n <= 16:
            layers += [f'<circle cx="{x:.1f}" cy="{y:.1f}" r="2.4" style="fill:{color(si)}"/>' for x, y in pts]
        if spec.stacked:
            base = tops + base[len(tops):]
    out += layers
    return _svg(spec, "".join(out)) + _legend(spec, spec.names if len(series) > 1 else [])


def _spark(spec: ChartSpec) -> str:
    s = spec.series[0] if spec.series else []
    if not s:
        return ""
    lo, hi = min(s), max(s)
    if spec.from_zero:
        lo = min(0.0, lo)
    span = (hi - lo) or 1
    w, h = spec.width, spec.height
    pts = " ".join(f"{i / max(len(s) - 1, 1) * (w - 4) + 2:.1f},{h - 3 - (v - lo) / span * (h - 6):.1f}"
                   for i, v in enumerate(s))
    return _svg(spec, f'<polygon class="mkd-chart__area" points="2,{h - 1} {pts} {w - 2},{h - 1}" '
                      f'style="fill:{color(0)}"/><polyline class="mkd-chart__line" points="{pts}" '
                      f'style="stroke:{color(0)}"/>')


def _pie(spec: ChartSpec) -> str:
    vals = [max(0.0, v) for v in (spec.series[0] if spec.series else [])]
    total = sum(vals) or 1
    cx, cy = spec.height / 2, spec.height / 2
    r = spec.height / 2 - 6
    inner = r * 0.58 if spec.kind in ("donut", "doughnut") else 0
    out, a = [], -math.pi / 2
    for i, v in enumerate(vals):
        da = v / total * 2 * math.pi
        if da <= 0:
            continue
        a2 = a + da
        large = 1 if da > math.pi else 0
        p = lambda ang, rr: (cx + rr * math.cos(ang), cy + rr * math.sin(ang))  # noqa: E731
        (xa, ya), (xb, yb) = p(a, r), p(a2, r)
        if da >= 2 * math.pi - 1e-6:
            d = f"M{cx - r:.1f},{cy:.1f}a{r:.1f},{r:.1f} 0 1,0 {2 * r:.1f},0a{r:.1f},{r:.1f} 0 1,0 {-2 * r:.1f},0"
        elif inner:
            (xc, yc), (xd, yd) = p(a2, inner), p(a, inner)
            d = (f"M{xa:.1f},{ya:.1f}A{r:.1f},{r:.1f} 0 {large},1 {xb:.1f},{yb:.1f}L{xc:.1f},{yc:.1f}"
                 f"A{inner:.1f},{inner:.1f} 0 {large},0 {xd:.1f},{yd:.1f}Z")
        else:
            d = f"M{cx:.1f},{cy:.1f}L{xa:.1f},{ya:.1f}A{r:.1f},{r:.1f} 0 {large},1 {xb:.1f},{yb:.1f}Z"
        out.append(f'<path class="mkd-chart__slice" d="{d}" style="fill:{color(i)}"/>')
        if spec.show_values and da > 0.35:
            mx, my = p(a + da / 2, (r + inner) / 2 if inner else r * 0.62)
            out.append(_text(mx, my + 3.5, f"{round(v / total * 100)}%", cls="mkd-chart__label mkd-chart__label--on"))
        a = a2
    if inner and spec.unit:
        out.append(_text(cx, cy + 5, spec.unit, size=14, cls="mkd-chart__center"))
    # legend at the right of the pie
    lx = spec.height + 12
    for i, lab in enumerate(spec.labels[:len(vals)]):
        y = 18 + i * 18
        if y > spec.height - 6:
            break
        pct = f" · {round(vals[i] / total * 100)}%" if i < len(vals) else ""
        out.append(f'<rect x="{lx:.1f}" y="{y - 8:.1f}" width="10" height="10" rx="2" style="fill:{color(i)}"/>')
        out.append(_text(lx + 16, y + 1, lab + pct, "start"))
    return _svg(spec, "".join(out))


def _scatter(spec: ChartSpec) -> str:
    pts = [p for p in spec.points if len(p) >= 2]
    if not pts:
        return _svg(spec, "")
    xs, ys = [p[0] for p in pts], [p[1] for p in pts]
    xt, yt = nice_ticks(min(xs), max(xs)), nice_ticks(min(ys), max(ys))
    x0, y0, x1, y1 = _frame(spec)
    plot = _Plot(x0, y0, x1, y1, yt[0], yt[-1])
    out = [_axes(spec, plot)]
    sx = lambda v: x0 + (v - xt[0]) / ((xt[-1] - xt[0]) or 1) * (x1 - x0)  # noqa: E731
    for t in xt:
        out.append(_text(sx(t), y1 + 13, _fmt(t)))
    smax = max((p[2] for p in pts if len(p) > 2), default=1) or 1
    for p in pts:
        r = 3.2 if spec.kind == "scatter" or len(p) < 3 else 3 + 14 * math.sqrt(p[2] / smax)
        group = int(p[3]) if len(p) > 3 else 0
        out.append(f'<circle class="mkd-chart__dot" cx="{sx(p[0]):.1f}" cy="{plot.y(p[1]):.1f}" r="{r:.1f}" '
                   f'style="fill:{color(group)}"/>')
    return _svg(spec, "".join(out)) + _legend(spec, spec.names)


def _radar(spec: ChartSpec) -> str:
    labels = spec.labels
    n = max(len(labels), max((len(s) for s in spec.series), default=0), 3)
    cx, cy = spec.width / 2, spec.height / 2 + 4
    r = spec.height / 2 - 22
    top = max((v for s in spec.series for v in s), default=1) or 1
    hi = nice_ticks(0, top)[-1]
    ang = lambda i: -math.pi / 2 + i * 2 * math.pi / n  # noqa: E731
    out = []
    for level in (0.25, 0.5, 0.75, 1.0):
        pts = " ".join(f"{cx + r * level * math.cos(ang(i)):.1f},{cy + r * level * math.sin(ang(i)):.1f}"
                       for i in range(n))
        out.append(f'<polygon class="mkd-chart__grid" points="{pts}" fill="none"/>')
    for i in range(n):
        out.append(f'<line class="mkd-chart__grid" x1="{cx:.1f}" y1="{cy:.1f}" x2="{cx + r * math.cos(ang(i)):.1f}" '
                   f'y2="{cy + r * math.sin(ang(i)):.1f}"/>')
        if i < len(labels):
            lx, ly = cx + (r + 12) * math.cos(ang(i)), cy + (r + 12) * math.sin(ang(i))
            anchor = "middle" if abs(math.cos(ang(i))) < 0.3 else ("start" if math.cos(ang(i)) > 0 else "end")
            out.append(_text(lx, ly + 3.5, labels[i], anchor))
    for si, s in enumerate(spec.series):
        pts = " ".join(f"{cx + r * (v / hi) * math.cos(ang(i)):.1f},{cy + r * (v / hi) * math.sin(ang(i)):.1f}"
                       for i, v in enumerate(s[:n]))
        out.append(f'<polygon class="mkd-chart__area" points="{pts}" style="fill:{color(si)}"/>'
                   f'<polygon class="mkd-chart__line" points="{pts}" style="stroke:{color(si)}"/>')
    return _svg(spec, "".join(out)) + _legend(spec, spec.names)


def _heatmap(spec: ChartSpec) -> str:
    m = spec.matrix
    rows, cols = len(m), max((len(r) for r in m), default=0)
    if not rows or not cols:
        return _svg(spec, "")
    vals = [v for r in m for v in r]
    lo, hi = min(vals), max(vals)
    left = 8 + min(70, 6 * max((len(y) for y in spec.y_labels), default=0)) if spec.y_labels else 6
    top = 4
    bottom = 16 if spec.labels else 4
    cw = (spec.width - left - 4) / cols
    ch = (spec.height - top - bottom) / rows
    out = []
    for ri, row in enumerate(m):
        for ci, v in enumerate(row):
            t = (v - lo) / ((hi - lo) or 1)
            out.append(f'<rect x="{left + ci * cw + 1:.1f}" y="{top + ri * ch + 1:.1f}" width="{cw - 2:.1f}" '
                       f'height="{ch - 2:.1f}" rx="2" style="fill:color-mix(in srgb, var(--mkd-chart-1) '
                       f'{8 + t * 92:.0f}%, var(--mkd-surface-2))"/>')
            if spec.show_values:
                out.append(_text(left + (ci + .5) * cw, top + (ri + .5) * ch + 3.5, _fmt(v), size=9))
        if ri < len(spec.y_labels):
            out.append(_text(left - 6, top + (ri + .5) * ch + 3.5, spec.y_labels[ri], "end"))
    for ci, lab in enumerate(spec.labels[:cols]):
        out.append(_text(left + (ci + .5) * cw, spec.height - 4, lab))
    return _svg(spec, "".join(out))


def _funnel(spec: ChartSpec) -> str:
    vals = spec.series[0] if spec.series else []
    if not vals:
        return _svg(spec, "")
    top = max(vals) or 1
    h = (spec.height - 4) / len(vals)
    cx = spec.width * 0.42
    maxw = spec.width * 0.8
    out = []
    for i, v in enumerate(vals):
        w = maxw * v / top
        nxt = maxw * (vals[i + 1] / top if i + 1 < len(vals) else v / top * 0.8)
        y = 2 + i * h
        out.append(f'<polygon points="{cx - w / 2:.1f},{y:.1f} {cx + w / 2:.1f},{y:.1f} {cx + nxt / 2:.1f},'
                   f'{y + h - 2:.1f} {cx - nxt / 2:.1f},{y + h - 2:.1f}" style="fill:{color(i)}"/>')
        lab = spec.labels[i] if i < len(spec.labels) else ""
        out.append(_text(cx + maxw / 2 + 8, y + h / 2 + 3.5, f"{lab}  {_fmt(v)}", "start"))
    return _svg(spec, "".join(out))


def _treemap(spec: ChartSpec) -> str:
    vals = [(max(0.0, v), spec.labels[i] if i < len(spec.labels) else "", i)
            for i, v in enumerate(spec.series[0] if spec.series else [])]
    vals.sort(key=lambda t: -t[0])
    out = []

    def layout(items, x, y, w, h, vertical):
        if not items:
            return
        if len(items) == 1:
            v, lab, i = items[0]
            out.append(f'<rect x="{x + 1:.1f}" y="{y + 1:.1f}" width="{max(w - 2, 0):.1f}" height="{max(h - 2, 0):.1f}" '
                       f'rx="3" style="fill:{color(i)}"/>')
            if w > 30 and h > 16:
                out.append(_text(x + 6, y + 14, lab, "start", cls="mkd-chart__label mkd-chart__label--on"))
                out.append(_text(x + 6, y + 26, _fmt(v), "start", size=9, cls="mkd-chart__label mkd-chart__label--on"))
            return
        total = sum(t[0] for t in items) or 1
        acc, split = 0.0, 1
        for k, t in enumerate(items):
            acc += t[0]
            if acc >= total / 2:
                split = max(1, k + 1 if k + 1 < len(items) else k)
                break
        a, b = items[:split], items[split:]
        fa = sum(t[0] for t in a) / total
        if vertical:
            layout(a, x, y, w * fa, h, not vertical)
            layout(b, x + w * fa, y, w * (1 - fa), h, not vertical)
        else:
            layout(a, x, y, w, h * fa, not vertical)
            layout(b, x, y + h * fa, w, h * (1 - fa), not vertical)

    layout(vals, 0, 0, spec.width, spec.height, True)
    return _svg(spec, "".join(out))


def _gauge(spec: ChartSpec) -> str:
    w, h = spec.width, spec.height
    cx, cy = w / 2, h * 0.86
    r = min(w / 2 - 10, h * 0.78)
    frac = max(0.0, min(1.0, (spec.value - spec.minimum) / ((spec.maximum - spec.minimum) or 1)))
    arc = lambda f: (cx - r * math.cos(f * math.pi), cy - r * math.sin(f * math.pi))  # noqa: E731
    (sx, sy), (ex, ey), (vx, vy) = arc(0), arc(1), arc(frac)
    sw = r * 0.2
    out = [f'<path class="mkd-chart__track" d="M{sx:.1f},{sy:.1f}A{r:.1f},{r:.1f} 0 0,1 {ex:.1f},{ey:.1f}" '
           f'style="stroke-width:{sw:.1f}"/>',
           f'<path d="M{sx:.1f},{sy:.1f}A{r:.1f},{r:.1f} 0 0,1 {vx:.1f},{vy:.1f}" fill="none" '
           f'style="stroke:{color(0)};stroke-width:{sw:.1f};stroke-linecap:round"/>',
           _text(cx, cy - r * 0.25, _fmt(spec.value) + spec.unit, size=r * 0.32, cls="mkd-chart__center"),
           _text(sx, cy + 13, _fmt(spec.minimum)), _text(ex, cy + 13, _fmt(spec.maximum))]
    return _svg(spec, "".join(out))


def _candles(spec: ChartSpec) -> str:
    rows = [r for r in spec.points if len(r) >= 4]
    if not rows:
        return _svg(spec, "")
    ticks = nice_ticks(min(r[2] for r in rows), max(r[1] for r in rows))
    x0, y0, x1, y1 = _frame(spec)
    plot = _Plot(x0, y0, x1, y1, ticks[0], ticks[-1])
    out = [_axes(spec, plot)]
    band = (x1 - x0) / len(rows)
    for i, (o, h, low, c, *_rest) in enumerate(rows):
        x = x0 + (i + .5) * band
        up = c >= o
        col = "var(--mkd-success)" if up else "var(--mkd-danger)"
        out.append(f'<line x1="{x:.1f}" y1="{plot.y(h):.1f}" x2="{x:.1f}" y2="{plot.y(low):.1f}" style="stroke:{col}"/>')
        top, bot = plot.y(max(o, c)), plot.y(min(o, c))
        out.append(f'<rect x="{x - band * .3:.1f}" y="{top:.1f}" width="{band * .6:.1f}" height="{max(bot - top, 1):.1f}" '
                   f'style="fill:{col}"/>')
        if i < len(spec.labels) and i % max(1, math.ceil(len(rows) / 8)) == 0:
            out.append(_text(x, y1 + 13, spec.labels[i]))
    return _svg(spec, "".join(out))
