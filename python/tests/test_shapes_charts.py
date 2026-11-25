"""Shape framing (R-REND-014 TC-1) and charts drawn from values (R-REND-012 TC-3), in the Python variant.

The geometry itself (a 96 × 96 circle centred in a 160 × 96 frame, the ellipse's 50% radii) is measured in a
browser in every shipped pack (`typescript/tests/browser/gallery.spec.mjs`); here the markup and the base
stylesheet rules those measurements rely on.
"""

import re
import unittest

from tests.helpers import ROOT, render  # noqa: F401  (puts src on sys.path)
from mockitdown import RenderOptions

BASE_CSS = ROOT.parent / "shared" / "packs" / "base" / "pack.css"
#: Every kind of R-REND-012.C1, by its base element.
KINDS = {
    "BarChart": "bar", "Histogram": "histogram", "LineChart": "line", "AreaChart": "area", "ComboChart": "combo",
    "Sparkline": "sparkline", "PieChart": "pie", "DonutChart": "donut", "ScatterChart": "scatter",
    "BubbleChart": "bubble", "RadarChart": "radar", "Heatmap": "heatmap", "FunnelChart": "funnel",
    "Treemap": "treemap", "GaugeChart": "gauge", "CandlestickChart": "candlestick",
}
#: A mark: a drawn element that is not a grid line, an axis or a gauge track.
MARK = re.compile(r'<(circle|rect|path|polygon|polyline)\b(?![^>]*class="mkd-chart__(?:grid|axis|track)")[^>]*>')


def _svg(html: str) -> str:
    m = re.search(r"<svg class=\"mkd-chart__svg\".*?</svg>", html)
    return m.group(0) if m else ""


class ShapeFramingTests(unittest.TestCase):  # R-REND-014 TC-1
    def _shape(self, src: str) -> str:
        r = render(src, RenderOptions(device="fit"))
        self.assertEqual([str(d) for d in r.diagnostics], [])
        m = re.search(r'<div class="mkd-shape"[^>]*>', r.html)
        self.assertIsNotNone(m, r.html)
        return m.group(0)

    def test_circle_keeps_its_frame_for_layout(self):  # C1
        tag = self._shape("Circle().frame(width: 160, height: 96)")
        self.assertIn('data-shape="circle"', tag)
        self.assertIn("width:calc(160 * var(--u))", tag)
        self.assertIn("height:calc(96 * var(--u))", tag)

    def test_circle_stroke_is_drawn_on_the_circle(self):  # C1, C4: the stroke follows the circle, not the frame
        tag = self._shape("Circle().stroke(Color.red, lineWidth: 2).frame(width: 160, height: 96)")
        self.assertIn("--mkd-shape-stroke:calc(2 * var(--u)) solid var(--mkd-color-red)", tag)
        self.assertNotIn(";border:", tag)

    def test_circle_shadow_follows_the_circle(self):  # C4
        tag = self._shape("Circle().shadow(radius: 4).frame(width: 160, height: 96)")
        self.assertIn("filter:drop-shadow(", tag)
        self.assertNotIn("box-shadow", tag)

    def test_base_stylesheet_draws_a_centred_circle_and_a_true_ellipse(self):  # C1–C3
        css = BASE_CSS.read_text(encoding="utf-8")
        rule = lambda sel: " ".join(re.findall(re.escape(sel) + r"\s*\{([^}]*)\}", css))  # noqa: E731
        circle = rule('.mkd-frame .mkd-shape:where([data-shape="circle"])::before')
        self.assertIn("width: min(100cqw, 100cqh)", circle)
        self.assertIn("border-radius: 50%", circle)
        self.assertIn("border-radius: 50%", rule('.mkd-frame .mkd-shape:where([data-shape="ellipse"])'))
        self.assertIn("border-radius: 9999px", rule('.mkd-frame .mkd-shape:where([data-shape="capsule"])'))
        self.assertNotIn('[data-shape="ellipse"], [data-shape="capsule"]) { border-radius: 9999px', css)

    def test_ellipse_in_clip_and_background_shapes_is_a_true_ellipse(self):  # C2
        html = render('Text("A").background(Color.blue, in: Ellipse())', RenderOptions(device="fit")).html
        self.assertIn("border-radius:50%", html)
        html = render('Text("A").background(Color.blue, in: Capsule())', RenderOptions(device="fit")).html
        self.assertIn("border-radius:9999px", html)

    def test_rounded_rectangle_uses_its_corner_radius(self):  # C2
        self.assertIn("border-radius:calc(12 * var(--u))", self._shape("RoundedRectangle(cornerRadius: 12)"))


class ChartFromValuesTests(unittest.TestCase):  # R-REND-012 TC-3
    def test_every_kind_draws_marks_from_values(self):  # C6
        missing = []
        for element, kind in KINDS.items():
            r = render(f"{element}(values: [3, 5, 2, 6, 4])", RenderOptions(device="fit"))
            self.assertIn(f'data-kind="{kind}"', r.html, element)
            if not MARK.search(_svg(r.html)):
                missing.append(element)
            self.assertEqual([d for d in r.diagnostics if d.code == "chart"], [], element)
        self.assertEqual(missing, [])

    def test_scatter_plots_index_and_value(self):  # C6
        svg = _svg(render("ScatterChart(values: [3, 5, 2, 6, 4])", RenderOptions(device="fit")).html)
        self.assertEqual(len(re.findall(r'class="mkd-chart__dot"', svg)), 5)

    def test_bubble_areas_are_proportional_to_the_values(self):  # C6
        svg = _svg(render("BubbleChart(values: [1, 4])", RenderOptions(device="fit")).html)
        radii = [float(r) for r in re.findall(r'class="mkd-chart__dot"[^>]* r="([\d.]+)"', svg)]
        self.assertEqual(len(radii), 2)
        self.assertAlmostEqual(radii[1] / radii[0], 2.0, delta=0.05)

    def test_heatmap_draws_one_row_of_cells(self):  # C6
        svg = _svg(render("Heatmap(values: [3, 5, 2, 6, 4])", RenderOptions(device="fit")).html)
        cells = re.findall(r'<rect x="[\d.]+" y="([\d.]+)"', svg)
        self.assertEqual(len(cells), 5)
        self.assertEqual(len(set(cells)), 1)

    def test_candlestick_draws_one_candle_per_value_after_the_first(self):  # C6
        svg = _svg(render("CandlestickChart(values: [3, 5, 2, 6, 4])", RenderOptions(device="fit")).html)
        self.assertEqual(len(re.findall(r'class="mkd-chart__candle"', svg)), 4)
        self.assertEqual(len(re.findall(r"var\(--mkd-success\)", svg)), 4)  # 3→5 and 2→6 rise: wick and body each
        self.assertEqual(len(re.findall(r"var\(--mkd-danger\)", svg)), 4)

    def test_a_chart_without_data_warns_and_draws_its_frame(self):  # C7
        for element in KINDS:
            if element == "GaugeChart":
                continue  # a gauge always has a value (its minimum by default)
            r = render(f"{element}()", RenderOptions(device="fit"))
            codes = [(d.code, d.message) for d in r.diagnostics]
            self.assertIn(("chart", f"{element} has no data"), codes, element)
            svg = _svg(r.html)
            self.assertRegex(svg, r'class="mkd-chart__(axis|grid)"', element)

    def test_a_gauge_without_a_value_does_not_warn(self):  # C7: the gauge draws its minimum
        r = render("GaugeChart()", RenderOptions(device="fit"))
        self.assertEqual([d for d in r.diagnostics if d.code == "chart"], [])


if __name__ == "__main__":
    unittest.main()
