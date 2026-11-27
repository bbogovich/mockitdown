"""Declared element samples (R-PACK-013, IT-18): TC-1 (declared samples used verbatim, failing loudly) and
TC-2 (the base samples carry content), in the Python variant.

The browser half of TC-2 — every chart card of the base gallery draws at least one mark — is in
`typescript/tests/browser/gallery-render.spec.mjs`.
"""

import importlib.util
import json
import re
import unittest

from tests.helpers import ROOT, render  # noqa: F401  (puts src on sys.path)
from mockitdown import RenderOptions
from mockitdown.packs import ElementDef, registry

REFERENCE = ROOT.parent / "shared" / "reference"
PACKS = ROOT.parent / "shared" / "packs"
MARK = re.compile(r'<(circle|rect|path|polygon|polyline)\b(?![^>]*class="mkd-chart__(?:grid|axis|track)")[^>]*>')
#: The swiftui elements styled by R-PACK-014 and R-PACK-015, each needing a declared sample (C4).
SWIFTUI_DECLARED = ["ControlGroup", "DatePicker", "Form", "Gauge", "List", "Picker", "Toggle", "Button", "Alert",
                    "ConfirmationDialog", "Popover", "Sheet", "Tab", "TabView", "NavigationSplitView"]
#: Chart kinds whose data is categorical: their samples name the categories (C3).
CATEGORICAL = ["AreaChart", "BarChart", "Chart", "ComboChart", "DonutChart", "FunnelChart", "Histogram",
               "LineChart", "PieChart", "RadarChart", "Treemap"]


def _gen():
    spec = importlib.util.spec_from_file_location("gen_reference", ROOT / "tools" / "gen_reference.py")
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


def _reference(pid: str) -> dict[str, dict]:
    data = json.loads((REFERENCE / f"{pid}.json").read_text(encoding="utf-8"))
    return {e["name"]: e for e in data["elements"]}


def _children(src: str) -> list[str]:
    """Top-level calls inside the first trailing closure of `src`."""
    i = src.index("{")
    depth, start, out = 0, i + 1, []
    for j, ch in enumerate(src[i:], i):
        if ch == "{":
            depth += 1
        elif ch == "}":
            depth -= 1
            if depth == 0:
                out.append(src[start:j])
                break
        elif ch in ";\n" and depth == 1:
            out.append(src[start:j])
            start = j + 1
    return [c.strip() for c in out if c.strip()]


class DeclaredSampleTests(unittest.TestCase):
    """TC-1: a declared sample is used verbatim, builds the variants sample, and fails loudly (C1, C2, C4)."""

    @classmethod
    def setUpClass(cls):
        cls.gen = _gen()

    def test_registry_reads_sample(self):
        e = registry().get("base").elements["Picker"]
        self.assertTrue(e.sample.startswith("Picker("), e.sample)
        self.assertEqual(ElementDef("X", "text").sample, "")

    def test_declared_sample_used_verbatim(self):
        src = 'Picker("Size", selection: "M") { Text("S"); Text("M"); Text("L") }'
        e = ElementDef("Picker", "select", ("label",), sample=src)
        self.assertEqual(self.gen.sample("Picker", e, "base"), src)

    def test_variants_built_from_declared_sample(self):
        src = 'Picker("Size", selection: "M") { Text("S"); Text("M"); Text("L") }'
        e = ElementDef("Picker", "select", ("label",), variants=("menu", "segmented"), sample=src)
        var = self.gen.variants_sample("Picker", e, "swiftui", src)
        self.assertTrue(var.startswith("HStack(alignment: .top, spacing: 24) {"), var)
        self.assertIn(src + '.variant("segmented")', var)
        self.assertIn('Text("segmented").font(.caption)', var)

    def test_declared_sample_with_diagnostic_fails_naming_pack_and_element(self):
        e = ElementDef("Picker", "select", ("label",), sample='Picker("Size") { NoSuchView() }')
        with self.assertRaises(self.gen.SampleError) as cm:
            self.gen.sample("Picker", e, "base")
        msg = str(cm.exception)
        self.assertIn("base", msg)
        self.assertIn("Picker", msg)

    def test_declared_variants_need_a_call_of_the_element(self):
        e = ElementDef("Tab", "tab", ("label",), variants=("a",), sample='TabView { Tab("One") { Text("1") } }')
        with self.assertRaises(self.gen.SampleError) as cm:
            self.gen.variants_sample("Tab", e, "base", e.sample)
        self.assertIn("Tab", str(cm.exception))

    def test_swiftui_declares_the_styled_elements(self):
        raw = json.loads((PACKS / "swiftui" / "pack.json").read_text(encoding="utf-8"))["elements"]
        missing = [n for n in SWIFTUI_DECLARED if not raw[n].get("sample")]
        self.assertEqual(missing, [])

    def test_swiftui_picker_has_three_options(self):
        s = _reference("swiftui")["Picker"]["sample"]
        self.assertEqual(len([c for c in _children(s) if c.startswith("Text(")]), 3, s)
        self.assertIn("selection:", s)

    def test_no_pack_shows_a_content_role_without_content(self):
        """C4 audit: pickers, radio groups, segmented controls, tabs, date pickers and charts carry content."""
        bad = []
        for f in sorted(REFERENCE.glob("*.json")):
            if f.name == "index.json":
                continue
            for e in json.loads(f.read_text(encoding="utf-8"))["elements"]:
                s, role = e["sample"], e["role"]
                if role in ("select", "radiogroup", "segmented") and not ("[" in s or "{" in s):
                    bad.append(f"{f.stem}:{e['name']}")
                elif role == "tab" and "{" not in s:
                    bad.append(f"{f.stem}:{e['name']}")
                elif role == "datepicker" and not re.search(r"\d{4}-\d\d-\d\d", s):
                    bad.append(f"{f.stem}:{e['name']}")
                elif role == "chart" and not re.search(r"(values?|points|matrix|series):|\[", s):
                    bad.append(f"{f.stem}:{e['name']}")
        self.assertEqual(bad, [])


class BaseSampleTests(unittest.TestCase):
    """TC-2: the base pack's samples carry content suited to the element (C3, C5)."""

    @classmethod
    def setUpClass(cls):
        cls.ref = _reference("base")
        cls.raw = json.loads((PACKS / "base" / "pack.json").read_text(encoding="utf-8"))["elements"]

    def s(self, name: str) -> str:
        self.assertTrue(self.raw[name].get("sample"), f"base {name} declares no sample")
        return self.ref[name]["sample"]

    def test_point_charts_use_points(self):
        for n in ("ScatterChart", "BubbleChart", "CandlestickChart"):
            self.assertIn("points:", self.s(n), n)

    def test_heatmap_uses_a_labelled_matrix(self):
        s = self.s("Heatmap")
        self.assertIn("matrix:", s)
        self.assertIn("labels:", s)
        self.assertIn("yLabels:", s)

    def test_categorical_charts_name_their_labels(self):
        for n in CATEGORICAL:
            self.assertIn("labels:", self.s(n), n)

    def test_every_chart_sample_draws_marks(self):
        for n, e in self.ref.items():
            if e["role"] != "chart":
                continue
            res = render(e["sample"], RenderOptions(pack="base", device="fit"))
            self.assertEqual(res.diagnostics, [], n)
            self.assertTrue(MARK.search(res.html), n)

    def test_presentations_have_title_message_and_actions(self):
        for n in ("Alert", "Dialog", "Sheet"):
            s = self.s(n)
            self.assertRegex(s, rf'^{n}\("[^"]+"', n)
            self.assertIn("message:", s, n)
            self.assertGreaterEqual(s.count("Button("), 2 if n == "Alert" else 1, n)
        toast = self.s("Toast")
        self.assertIn("description:", toast)
        self.assertIn("action:", toast)

    def test_picker_has_three_options_and_a_selection(self):
        s = self.s("Picker")
        self.assertIn("selection:", s)
        self.assertEqual(len([c for c in _children(s) if c.startswith("Text(")]), 3, s)

    def test_tab_sits_in_a_tabview(self):
        s = self.s("Tab")
        self.assertTrue(s.startswith("TabView"), s)
        self.assertGreaterEqual(s.count("Tab("), 2, s)

    def test_split_view_has_sidebar_list_and_detail(self):
        s = self.s("NavigationSplitView")
        self.assertIn("List", s)
        self.assertIn("detail:", s)

    def test_tooltip_has_an_anchor_button(self):
        self.assertIn("Button(", _children(self.s("Tooltip"))[0])

    def test_message_bubble_has_a_sentence(self):
        text = re.match(r'MessageBubble\("([^"]+)"', self.s("MessageBubble")).group(1)
        self.assertGreaterEqual(len(text.split()), 15, text)

    def test_date_picker_has_a_selection(self):
        self.assertRegex(self.s("DatePicker"), r'selection: "\d{4}-\d\d-\d\d"')

    def test_variants_side_by_side(self):
        """C5, over every pack: variants in one top-aligned row, 24 points apart, each captioned."""
        for f in sorted(REFERENCE.glob("*.json")):
            if f.name == "index.json":
                continue
            for e in json.loads(f.read_text(encoding="utf-8"))["elements"]:
                var = e.get("variants_sample")
                if var:
                    self.assertTrue(var.startswith("HStack(alignment: .top, spacing: 24) {"), f"{f.stem}:{e['name']}")
                    self.assertIn(".font(.caption)", var)


if __name__ == "__main__":
    unittest.main()
