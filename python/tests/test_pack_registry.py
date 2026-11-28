"""The pack registry: directory layout and lookup, pack.json keys, inheritance, and the core vocabulary
(R-PACK-001, R-PACK-002, R-PACK-003, R-PACK-009).

Each test names the test case (TC-n) and the clauses it verifies. The shipped packs (R-PACK-008.TC-1)
are in test_packs.py and test_site_nav.py.
"""

import json
import re
import tempfile
import unittest
from pathlib import Path

from tests.helpers import ROOT  # noqa: F401  (puts src/ on sys.path)
from mockitdown import RenderOptions, render
from mockitdown.diagnostics import MockitdownError
from mockitdown.packs import BUILTIN_DIR, PackRegistry
from mockitdown.styles import stylesheet

#: R-PACK-009.C1, the core vocabulary by family.
CORE = {
    "layout": ["VStack", "HStack", "ZStack", "LazyVStack", "LazyHStack", "Grid", "GridRow", "LazyVGrid", "LazyHGrid",
               "ScrollView", "Group", "Spacer", "Divider"],
    "shapes": ["Rectangle", "RoundedRectangle", "Circle", "Capsule", "Ellipse", "Color"],
    "content": ["Text", "Label", "Image", "AsyncImage", "Icon", "Avatar", "Badge", "Chip", "Tag", "Link", "ProgressView",
                "Gauge", "Rating", "Placeholder", "Chart"],
    "controls": ["Button", "IconButton", "FloatingActionButton", "Toggle", "Checkbox", "RadioButton", "RadioGroup",
                 "TextField", "SecureField", "TextEditor", "SearchField", "Picker", "SegmentedControl", "Slider",
                 "Stepper", "DatePicker", "Calendar", "Dropzone"],
    "navigation": ["NavigationStack", "NavigationView", "NavigationSplitView", "TabView", "Tab", "Tabs", "AppBar",
                   "Sidebar", "NavItem", "Breadcrumb", "Pagination", "Steps"],
    "containers": ["Card", "GroupBox", "Section", "List", "Row", "ListItem", "NavigationLink", "LabeledContent", "Form",
                   "Table", "TableRow", "TableColumn", "Toolbar", "ToolbarItem", "ToolbarItemGroup", "ControlGroup",
                   "DisclosureGroup", "Accordion"],
    "overlays": ["Dialog", "Alert", "Sheet", "Menu", "MenuItem", "Tooltip", "Toast", "Banner"],
}
#: Elements other requirements add to base: R-REND-011.C1, R-ANN-001.C5, R-ANN-002, R-REND-012.C1.
ADDED = ["Spreadsheet", "StickyNote", "Board", "BoardColumn", "KanbanCard", "CodeEditor", "CodeBlock", "Terminal",
         "MessageBubble", "Comment", "Tree", "TreeItem", "Timeline", "TimelineItem", "Gantt", "Schedule", "Kbd",
         "Skeleton", "ColorSwatches", "Canvas", "Whiteboard", "VideoPlayer", "EmptyState", "Stat", "Map",
         "Callout", "Pointer", "SelectionRect",
         "BarChart", "LineChart", "AreaChart", "PieChart", "DonutChart", "ScatterChart", "BubbleChart", "RadarChart",
         "Heatmap", "FunnelChart", "Treemap", "GaugeChart", "CandlestickChart", "Histogram", "ComboChart", "Sparkline"]


class PackDirTest(unittest.TestCase):
    def setUp(self):
        self._tmp = tempfile.TemporaryDirectory()
        self.dir = Path(self._tmp.name)

    def tearDown(self):
        self._tmp.cleanup()

    def pack(self, pid, data=None, css=None, root=None):
        d = (root or self.dir) / pid
        d.mkdir(parents=True)
        if data is not None:
            (d / "pack.json").write_text(json.dumps(data), encoding="utf-8")
        if css is not None:
            (d / "pack.css").write_text(css, encoding="utf-8")
        return d


class LayoutAndLookupTests(PackDirTest):
    """R-PACK-001 TC-1."""

    def test_a_pack_is_a_directory_with_pack_json(self):  # TC-1 (C1)
        self.pack("acme", {"name": "Acme"})                         # no pack.css: optional
        self.pack("styled", {}, css=".mkd-button{color:red}")
        self.pack("empty")                                          # no pack.json: not a pack
        reg = PackRegistry((self.dir,))
        self.assertEqual(reg.get("acme").id, "acme")                # the identifier is the directory name
        self.assertEqual(reg.get("acme").css_text(), "")
        self.assertIn("color:red", reg.get("styled").css_text())
        self.assertNotIn("empty", reg.ids())
        with self.assertRaises(MockitdownError):
            reg.get("empty")
        for d in BUILTIN_DIR.iterdir():
            if (d / "pack.json").is_file():
                raw = json.loads((d / "pack.json").read_text(encoding="utf-8"))
                self.assertEqual(raw.get("id", d.name), d.name, d)

    def test_lookup_order(self):  # TC-1 (C2, V1)
        first, second = self.dir / "first", self.dir / "second"
        self.pack("fluent", {"name": "Site Fluent"}, root=first)
        self.pack("fluent", {"name": "Other Fluent"}, root=second)
        self.pack("only2", {"name": "Second only"}, root=second)
        reg = PackRegistry((first, second))
        self.assertEqual(reg.get("fluent").name, "Site Fluent")
        self.assertEqual(reg.get("fluent").directory, first / "fluent")
        self.assertEqual(reg.get("only2").directory, second / "only2")
        self.assertEqual(reg.get("swiftui").directory, BUILTIN_DIR / "swiftui")
        out = render('Text("x")', RenderOptions(pack="fluent", pack_paths=(first,))).html
        self.assertIn('data-pack="fluent"', out)
        self.assertEqual(PackRegistry().get("fluent").directory, BUILTIN_DIR / "fluent")

    def test_listing(self):  # TC-1 (C3)
        first, second = self.dir / "first", self.dir / "second"
        for pid in ("zeta", "alpha", "fluent"):
            self.pack(pid, {}, root=first)
        self.pack("beta", {}, root=second)
        self.pack("alpha", {}, root=second)                          # a duplicate of first/alpha
        self.pack("nojson", root=second)
        ids = PackRegistry((first, second)).ids()
        builtin = sorted(d.name for d in BUILTIN_DIR.iterdir() if (d / "pack.json").is_file())
        self.assertEqual(ids[:4], ["alpha", "fluent", "zeta", "beta"])
        self.assertEqual(ids[4:], [b for b in builtin if b not in ("alpha", "fluent", "zeta", "beta")])
        self.assertEqual(len(ids), len(set(ids)))

    def test_unknown_pack(self):  # TC-1 (C4, V1)
        reg = PackRegistry()
        with self.assertRaises(MockitdownError) as cm:
            reg.get("nope")
        self.assertEqual(cm.exception.diagnostic.message, f"unknown pack 'nope'; known packs: {', '.join(reg.ids())}")
        r = render('Text("x")', RenderOptions(pack="nope"))
        self.assertTrue(any("unknown pack 'nope'; known packs: android" in str(d) for d in r.errors),
                        [str(d) for d in r.errors])

    def test_each_pack_loaded_once(self):  # TC-1 (C5)
        self.pack("acme", {"extends": "fluent"})
        reg = PackRegistry((self.dir,))
        acme = reg.get("acme")
        self.assertIs(reg.get("acme"), acme)
        self.assertIs(reg.get("fluent"), acme.parent)
        (self.dir / "acme" / "pack.json").write_text(json.dumps({"name": "Changed"}), encoding="utf-8")
        self.assertIs(reg.get("acme"), acme)                         # not read again
        self.assertNotEqual(PackRegistry((self.dir,)).get("acme").name, acme.name)   # a new registry reads it


class PackJsonKeyTests(PackDirTest):
    """R-PACK-002 TC-1."""

    FULL = {
        "id": "acme", "name": "Acme UI", "framework": "Acme Toolkit", "version": "3.1", "extends": "base",
        "modules": ["Acme", "AcmeKit"], "device": "phone", "chrome": {"phone": "ios"},
        "tokens": {"light": {"accent": "#ff0000"}, "dark": {"accent": "#00ff00"}},
        "elements": {"Fancy": {"role": "button", "params": ["title"], "defaults": {"variant": "fancy"},
                               "variants": ["fancy"], "doc": "A fancy button"}},
        "modifiers": {"fancyStyle": {"attr": "variant"}, "loud": {"attr": "emphasis", "value": "high"}},
        "fonts": {"h4": "title2"}, "sizes": {"phone": [390, 844]}, "icons": {"home": "house"},
        "hidden": True, "attrs": {"caption": "title"},
        "colour": "ignored", "future": {"x": 1},
    }

    def test_keys(self):  # TC-1 (C1, C2, C3, C4, C5, C6, C7, C8, C9, C10)
        self.pack("acme-dir", self.FULL)
        p = PackRegistry((self.dir,)).get("acme-dir")
        self.assertEqual((p.id, p.name, p.framework, p.version), ("acme", "Acme UI", "Acme Toolkit", "3.1"))
        self.assertEqual(p.parent.id, "base")
        self.assertEqual(p.modules, ("Acme", "AcmeKit"))                                   # C2
        self.assertEqual(p.device, "phone")                                                 # C3
        self.assertEqual((p.chrome_for("phone"), p.chrome_for("tablet"), p.chrome_for("watch")),
                         ("ios", "none", "none"))                                           # C4
        self.assertEqual((p.tokens["light"]["accent"], p.tokens["dark"]["accent"]), ("#ff0000", "#00ff00"))  # C5
        fancy = p.element("Fancy")                                                          # C6
        self.assertEqual((fancy.role, fancy.params, fancy.default_attrs, fancy.variants, fancy.doc),
                         ("button", ("title",), {"variant": "fancy"}, ("fancy",), "A fancy button"))
        self.assertEqual(p.modifiers["loud"], {"attr": "emphasis", "value": "high"})        # C7
        self.assertEqual(p.font("h4"), "title2")                                            # C8
        self.assertEqual(p.sizes["phone"], (390, 844))                                      # C9
        self.assertEqual(p.icons["home"], "house")                                          # C10
        self.assertTrue(p.hidden)                                                           # C1 (R-PACK-010)
        self.assertEqual(p.attrs["caption"], "title")                                       # C1 (R-PACK-011)
        self.assertFalse(hasattr(p, "colour") or hasattr(p, "future"))                      # other keys ignored

    def test_defaults(self):  # TC-1 (C1, C3)
        self.pack("bare", {})
        self.pack("child", {"extends": "bare"})
        self.pack("phoney", {"device": "phone"})
        self.pack("child2", {"extends": "phoney"})
        reg = PackRegistry((self.dir,))
        bare = reg.get("bare")
        self.assertEqual((bare.id, bare.name, bare.framework, bare.version, bare.modules), ("bare", "bare", "", "", ()))
        self.assertEqual(bare.device, "desktop")                                            # base's device
        self.assertEqual(reg.get("base").device, "desktop")                                 # a root pack
        self.assertEqual(reg.get("child2").device, "phone")                                 # the parent's

    def test_modules_select_the_pack(self):  # TC-1 (C2)
        self.pack("acme", {"modules": ["AcmeKit"]})
        r = render('import AcmeKit\nText("x")', RenderOptions(pack_paths=(self.dir,)))
        self.assertIn('data-pack="acme"', r.html)

    def test_style_modifier_sets_its_attribute(self):  # TC-1 (C7)
        self.pack("acme", self.FULL)
        out = render('Button("Go").fancyStyle(.outlined).loud()', RenderOptions(pack="acme", pack_paths=(self.dir,))).html
        self.assertIn('data-variant="outlined"', out)
        self.assertIn('data-emphasis="high"', out)

    def test_minimal_pack_extending_mui(self):  # TC-1 (V1)
        self.pack("acme", {"id": "acme", "extends": "mui"})
        reg = PackRegistry((self.dir,))
        acme, mui = reg.get("acme"), reg.get("mui")
        self.assertEqual(acme.elements, mui.elements)
        self.assertEqual(acme.tokens, mui.tokens)
        self.assertEqual(acme.modifiers, mui.modifiers)
        self.assertEqual(acme.chrome, mui.chrome)
        self.assertEqual(acme.sizes, mui.sizes)


class InheritanceTests(PackDirTest):
    """R-PACK-003 TC-1."""

    def test_parent(self):  # TC-1 (C1)
        self.pack("a", {})
        self.pack("b", {"extends": "a"})
        reg = PackRegistry((self.dir,))
        self.assertIsNone(reg.get("base").parent)
        self.assertEqual(reg.get("a").parent.id, "base")
        self.assertEqual(reg.get("b").parent.id, "a")
        for pid in reg.ids():
            if pid != "base":
                self.assertEqual(reg.get(pid).lineage()[0].id, "base", pid)

    def test_self_extension(self):  # TC-1 (C2)
        self.pack("loop", {"extends": "loop"})
        with self.assertRaises(MockitdownError) as cm:
            PackRegistry((self.dir,)).get("loop")
        self.assertTrue(str(cm.exception).endswith("a pack cannot extend itself"), str(cm.exception))

    def test_merges(self):  # TC-1 (C3, C4, C6, V1)
        self.pack("acme", {
            "extends": "fluent",
            "elements": {"Button": {"role": "button", "defaults": {"variant": "acme"}}, "Widget": {"role": "card"}},
            "modifiers": {"buttonStyle": {"attr": "kind"}},
            "chrome": {"phone": "android"}, "sizes": {"phone": [400, 800]}, "icons": {"save": "tray"},
            "attrs": {"caption": "title"},
            "tokens": {"light": {"accent": "#123456"}},
        })
        reg = PackRegistry((self.dir,))
        acme, fluent = reg.get("acme"), reg.get("fluent")
        self.assertEqual(acme.element("Button").default_attrs, {"variant": "acme"})
        self.assertEqual(set(acme.elements), set(fluent.elements) | {"Widget"})
        for name in fluent.elements:
            if name != "Button":
                self.assertIs(acme.element(name), fluent.element(name), name)
        self.assertEqual(acme.modifiers, {**fluent.modifiers, "buttonStyle": {"attr": "kind"}})
        self.assertEqual(acme.chrome, {**fluent.chrome, "phone": "android"})
        self.assertEqual(acme.sizes, {**fluent.sizes, "phone": (400, 800)})
        self.assertEqual(acme.icons, {**fluent.icons, "save": "tray"})
        self.assertEqual(acme.attrs, {**fluent.attrs, "caption": "title"})
        # C4: tokens per mode, over the parent's tokens of that mode.
        self.assertEqual(acme.tokens["light"], {**fluent.tokens["light"], "accent": "#123456"})
        self.assertEqual(acme.tokens["dark"], fluent.tokens["dark"])
        # C6: own elements are recorded apart from inherited ones.
        self.assertEqual(set(acme.own_elements), {"Button", "Widget"})
        self.assertIn("Button", reg.get("base").own_elements)

    def test_font_aliases(self):  # TC-1 (C5)
        self.pack("a", {"fonts": {"h1": "largeTitle", "h2": "title"}})
        self.pack("b", {"extends": "a", "fonts": {"h2": "title2"}})
        b = PackRegistry((self.dir,)).get("b")
        self.assertEqual(b.font("h2"), "title2")       # the nearest definition
        self.assertEqual(b.font("h1"), "largeTitle")   # from an ancestor
        self.assertEqual(b.font("weird"), "weird")     # unmapped: itself

    def test_lineage_and_stylesheet(self):  # TC-1 (C7, V1)
        self.pack("acme", {"extends": "fluent", "elements": {"Button": {"role": "button"}},
                           "tokens": {"light": {"acme": "1px"}, "dark": {"acme": "2px"}}},
                  css=".mkd-pack-acme .mkd-button{outline:3px solid red}")
        reg = PackRegistry((self.dir,))
        self.assertEqual([p.id for p in reg.get("acme").lineage()], ["base", "fluent", "acme"])
        css = stylesheet(["acme"], reg)
        marks = [css.index(f".mkd-pack-{p} .mkd-frame{{color-scheme:light;--mkd-") for p in ("base", "fluent", "acme")]
        self.assertEqual(marks, sorted(marks))
        own = css.index(".mkd-pack-acme .mkd-button{outline:calc(3 * var(--u)) solid red}")
        self.assertLess(marks[1], own)                 # after fluent's tokens …
        self.assertLess(own, marks[2])                 # … and before its own
        # Its light and dark tokens (the dark ones also under the page's dark scheme and auto).
        self.assertEqual(set(re.findall(r"--mkd-acme:([^;}]*)", css)), {"1px", "calc(2 * var(--u))"})


class CoreVocabularyTests(unittest.TestCase):
    """R-PACK-009 TC-1."""

    def setUp(self):
        self.base = PackRegistry().get("base")

    def test_core_elements(self):  # TC-1 (C1, V1)
        core = [n for family in CORE.values() for n in family]
        self.assertEqual(len(core), 90)
        self.assertEqual(sorted(self.base.own_elements), sorted(core + ADDED))
        self.assertEqual(len(self.base.own_elements), 134)
        for pid in PackRegistry().ids():
            elements = PackRegistry().get(pid).elements
            self.assertFalse([n for n in core if n not in elements], pid)   # inherited by every pack

    def test_elements_command_lists_them(self):  # TC-1 (V1)
        import io
        from contextlib import redirect_stdout
        from mockitdown import cli
        buf = io.StringIO()
        with redirect_stdout(buf):
            self.assertEqual(cli.main(["elements", "base"]), 0)
        names = [ln.split()[0] for ln in buf.getvalue().splitlines() if ln.strip()]
        self.assertEqual(sorted(names), sorted([n for f in CORE.values() for n in f] + ADDED))

    def test_style_modifiers(self):  # TC-1 (C2)
        variant = ["buttonStyle", "listStyle", "pickerStyle", "toggleStyle", "textFieldStyle", "datePickerStyle",
                   "tabViewStyle", "progressViewStyle", "gaugeStyle", "menuStyle", "formStyle", "groupBoxStyle",
                   "navigationSplitViewStyle"]
        expected = {m: "variant" for m in variant}
        expected.update({"controlSize": "size", "buttonBorderShape": "shape", "labelStyle": "labelStyle"})
        expected.update({m: m for m in ("variant", "size", "severity", "state", "selected", "disabled", "badge",
                                         "elevation", "density", "expanded", "open", "color")})
        self.assertEqual({k: v["attr"] for k, v in self.base.modifiers.items()}, expected)
        out = render('Button("Go").buttonStyle(.bordered).controlSize(.large).buttonBorderShape(.capsule)').html
        self.assertIn('data-variant="bordered"', out)
        self.assertIn('data-size="large"', out)
        self.assertIn('data-shape="capsule"', out)

    def test_modules_device_and_chrome(self):  # TC-1 (C3)
        self.assertEqual(self.base.modules, ("Wireframe", "Mockitdown"))
        self.assertEqual(self.base.device, "desktop")
        for form in ("phone", "tablet", "desktop", "wide", "phone-landscape"):
            self.assertEqual(self.base.chrome_for(form), "none", form)
        out = render('import Wireframe\nText("x")').html
        self.assertIn('data-pack="base" data-device="desktop"', out)
        self.assertIn('data-chrome="none"', out)
        self.assertNotIn("mkd-chrome", re.sub(r'data-chrome="none"', "", out))


if __name__ == "__main__":
    unittest.main()
