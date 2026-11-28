"""The rendered markup: figure structure, role markup, attributes, output safety, static and deterministic
output, unknown elements (R-REND-001, R-REND-002, R-REND-003, R-REND-006, R-REND-007, R-REND-008).

Each test names the test case (TC-n) and the clauses it verifies. The browser half of R-REND-008 (TC-2,
how an unknown element looks) is in typescript/tests/browser/markup.spec.mjs.
"""

import json
import re
import unittest
from pathlib import Path

from tests.helpers import ROOT, html
from tests.role_markup import collect
from mockitdown import RenderOptions, render
from mockitdown.packs import PackRegistry
from mockitdown.render.html import Renderer

SHARED = ROOT.parent / "shared"
CORPUS = SHARED / "conformance"
CATALOGUE = json.loads((Path(__file__).parent / "fixtures" / "role-catalogue.json").read_text(encoding="utf-8"))
ROLES = {name[2:] for name in dir(Renderer) if name.startswith("r_")}


def screen(out):
    """The markup inside the first .mkd-screen (up to the end of the figure)."""
    return out[out.index('<div class="mkd-screen">') + len('<div class="mkd-screen">'):]


def root(out):
    """The first element's start tag inside the screen."""
    return re.match(r"<[^>]+>", screen(out)).group(0)


def corpus_html():
    return [f.read_text(encoding="utf-8") for f in sorted(CORPUS.glob("*.html"))]


class FigureStructureTests(unittest.TestCase):
    """R-REND-001 TC-1."""

    def test_figure(self):  # TC-1 (C1)
        out = html('Text("x")', pack="swiftui", device="phone", title="Inbox")
        self.assertTrue(out.startswith('<div class="mkd-figure mkd-pack-swiftui" role="figure" aria-label="Inbox" '
                                       'data-pack="swiftui" data-device="phone" data-appearance="light">'), out[:200])
        self.assertIn('aria-label="S-1"', html('Text("x")', id="S-1"))
        self.assertIn('aria-label="SwiftUI mockup"', html('Text("x")', pack="swiftui"))
        self.assertIn('aria-label="Wireframe mockup"', html('Text("x")'))

    def test_stage_cells_and_frames(self):  # TC-1 (C2, C3, C5, V1)
        out = html('Text("x")', appearance="both", title="T", id="S")
        self.assertEqual(out.count('<div class="mkd-stage" data-count="2">'), 1)
        self.assertEqual(out.count('<div class="mkd-cell">'), 2)
        frames = re.findall(r'<div class="mkd-frame" data-appearance="(\w+)" data-device="desktop" data-chrome="none" '
                            r'style="--mkd-w:1280;--mkd-h:800">', out)
        self.assertEqual(frames, ["light", "dark"])
        self.assertEqual(re.findall(r'<div class="mkd-cell__label">(\w+)</div></div>', out), ["Light", "Dark"])
        self.assertIn('<div class="mkd-caption">S · T</div>', out)
        one = html('Text("x")', appearance="auto")
        self.assertIn('<div class="mkd-stage" data-count="1">', one)
        self.assertIn('<div class="mkd-frame" data-appearance="auto"', one)
        self.assertNotIn("mkd-cell__label", one)
        fit = html('Text("x")', device="fit")
        self.assertRegex(fit, r'<div class="mkd-frame" [^>]*data-fit="true">')
        self.assertNotIn("--mkd-w", fit)

    def test_frame_order(self):  # TC-1 (C4)
        out = html('VStack { Text("a") }.sheet(isPresented: true) { Text("s") }', pack="swiftui", device="phone")
        top, scr, layer, bottom = (out.index(s) for s in ('class="mkd-chrome mkd-chrome--status"',
                                                           'class="mkd-screen"', 'class="mkd-layer"',
                                                           'class="mkd-chrome mkd-chrome--home"'))
        self.assertLess(top, scr)
        self.assertLess(scr, out.index('class="mkd-vstack"'))
        self.assertLess(out.index('class="mkd-vstack"'), layer)       # the views, then the presentation layers
        self.assertLess(layer, bottom)                                 # all inside the screen, before the bottom chrome
        self.assertEqual(out.count('class="mkd-screen"'), 1)
        bare = html('Text("x")')
        self.assertRegex(bare, r'data-chrome="none" style="[^"]*"><div class="mkd-screen">')

    def test_caption(self):  # TC-1 (C6)
        self.assertIn('<div class="mkd-caption">S-1</div>', html('Text("x")', id="S-1"))
        self.assertIn('<div class="mkd-caption">Inbox</div>', html('Text("x")', title="Inbox"))
        self.assertNotIn("mkd-caption", html('Text("x")'))
        self.assertNotIn("mkd-caption", html('Text("x")', id="S-1", title="Inbox", caption=False))

    def test_title_and_id_sources(self):  # TC-1 (C7)
        src = '@Screen(title: "Meta", id: "M-1")\nText("x")'
        self.assertIn("M-1 · Meta", html(src))
        self.assertIn("O-1 · Option", html(src, title="Option", id="O-1"))
        self.assertIn('aria-label="Option"', html(src, title="Option"))


class RoleMarkupTests(unittest.TestCase):
    """R-REND-002 TC-1."""

    #: The roles whose root has another class (REF.2 "Other roots"); tablecolumn draws nothing itself.
    OTHER_ROOTS = {"icon": "symbol", "table": "table-wrap", "tab": "tabs", "tablerow": "hstack", "toolbaritem": "group"}

    def test_every_role_root_has_its_class(self):  # TC-1 (C1, C2)
        base = PackRegistry().get("base")
        for name, el in sorted(base.elements.items()):
            with self.subTest(element=name):
                out = render(f"{name}()", RenderOptions()).html
                tags = re.findall(rf'<[a-z]+ class="([^"]*)"[^>]*\bdata-el="{name}"', out)
                if el.role == "tablecolumn":
                    self.assertEqual(tags, [])
                    continue
                self.assertTrue(tags, name)
                self.assertEqual(tags[0].split()[0], f"mkd-{self.OTHER_ROOTS.get(el.role, el.role)}")
        out = html('Table(columns: ["A"]) { TableRow { Text("x") } }')
        self.assertIn('<div class="mkd-table-wrap" data-el="Table"><table class="mkd-table">', out)

    def test_component_root(self):  # TC-1 (C2)
        out = html('struct InfoRow: View { var body: some View { HStack { Text("r") } } }\nInfoRow()')
        self.assertIn('<div class="mkd-hstack" data-el="HStack" data-component="InfoRow">', out)
        self.assertIn('<span class="mkd-text" data-el="Text">r</span>', out)      # only the body's root
        out = html('InfoBar("Saved")', pack="fluent")
        self.assertIn('data-el="InfoBar"', root(out))

    def test_parts_are_the_same_in_every_pack(self):  # TC-1 (C3, V1)
        reg = PackRegistry()
        for pid in reg.ids():
            with self.subTest(pack=pid):
                tag = root(html('Button("Save")', pack=pid))
                self.assertTrue(tag.startswith('<span class="mkd-button'), tag)
                self.assertIn('data-el="Button"', tag)
                self.assertIn('role="button"', tag)
                self.assertIn('<span class="mkd-button__label">Save</span>', html('Button("Save")', pack=pid))
        # The part classes a role emits do not depend on the pack.
        def classes(out):
            return sorted(set(c for cls in re.findall(r'class="([^"]*)"', screen(out)) for c in cls.split()
                              if "__" in c))
        for src in ('Toggle("Wi-Fi", isOn: true)', 'Slider(value: 0.4)', 'Card(title: "T") { Text("b") }'):
            want = classes(html(src))
            for pid in ("swiftui", "fluent", "mui", "win95"):
                self.assertEqual(classes(html(src, pack=pid, chrome="none")), want, f"{pid}: {src}")

    def test_class_modifier(self):  # TC-1 (C4)
        self.assertIn('<span class="mkd-text hero big" data-el="Text">', html('Text("x").class("hero big")'))
        self.assertIn('class="mkd-button wide"', html('Button("x").class("wide")'))

    def test_role_catalogue(self):  # TC-1 (C5)
        self.assertEqual(ROLES, set(CATALOGUE["roles"]))
        base = PackRegistry().get("base")
        by_role = {}
        for name, el in base.elements.items():
            by_role.setdefault(el.role, set()).add(name)
        for role, entry in CATALOGUE["roles"].items():
            self.assertEqual(sorted(by_role.get(role, ())), entry["elements"], role)
        parts, _ = collect(corpus_html(), ROLES, CATALOGUE["common_data"])
        for role, seen in sorted(parts.items()):
            with self.subTest(role=role):
                self.assertEqual(sorted(seen - set(CATALOGUE["roles"][role]["parts"])), [],
                                 "parts not in the role catalogue (REF.2)")


class AttributeTests(unittest.TestCase):
    """R-REND-003 TC-1."""

    PASSTHROUGH = ["variant", "size", "color", "shape", "density", "elevation", "placement", "orientation", "emphasis",
                   "design", "severity", "kind", "labelStyle", "position", "level", "side", "withHandle", "direction",
                   "labelPlacement", "rowsPerPage"]

    def test_passthrough_attributes(self):  # TC-1 (C1, V1)
        for name in self.PASSTHROUGH:
            with self.subTest(attr=name):
                self.assertIn(f'data-{name}="x1"', root(html(f'Button("b", {name}: "x1")')))
        tag = root(html('Button("b", variant: .bordered, size: 3, density: true, emphasis: false, '
                        'level: 2.5, appearance: "dark")'))
        for want in ('data-variant="bordered"', 'data-size="3"', 'data-density="true"', 'data-emphasis="false"',
                     'data-level="2.5"'):
            self.assertIn(want, tag)
        self.assertNotIn("data-appearance", tag)
        for bad in ('"a<b"', '"a\\"b"', '"' + "x" * 41 + '"', '"semi;colon"', '[1, 2]'):
            with self.subTest(value=bad):
                self.assertNotIn("data-variant", root(html(f'Button("b", variant: {bad})')))
        self.assertIn('data-variant="ok_1. -x"', root(html('Button("b", variant: "ok_1. -x")')))

    def test_state(self):  # TC-1 (C2, V1)
        self.assertIn('data-state="loading"', root(html('Button("b", state: .loading)')))
        self.assertIn('data-state="disabled"', root(html('Button("b", state: .loading).disabled(true)')))
        self.assertNotIn("data-state", root(html('Button("b").disabled(false)')))
        self.assertIn('data-state="error"', root(html('Button("b", error: "Required")')))
        self.assertIn('data-state="warning"', root(html('Button("b", state: .warning, error: true)')))
        for empty in ("false", '""'):
            self.assertNotIn("data-state", root(html(f'Button("b", error: {empty})')))

    def test_selected(self):  # TC-1 (C3)
        self.assertIn('data-selected="true"', root(html('Button("b").selected(true)')))
        self.assertNotIn("data-selected", root(html('Button("b").selected(false)')))

    def test_id_ref_help(self):  # TC-1 (C4, V1)
        tag = root(html('Button("Delete").buttonStyle(.bordered).disabled(true).id("del").ref("UC-1", "F-2.AC3")'
                        '.help("Removes it")'))
        for want in ('data-variant="bordered"', 'data-state="disabled"', 'data-mkd-id="del"',
                     'data-ref="UC-1 F-2.AC3"', 'title="Removes it"'):
            self.assertIn(want, tag)

    def test_role_data_attributes_are_catalogued(self):  # TC-1 (C5)
        self.assertLessEqual({p.lower() for p in self.PASSTHROUGH}, {c.lower() for c in CATALOGUE["common_data"]})
        _, data = collect(corpus_html(), ROLES, CATALOGUE["common_data"])
        for role, seen in sorted(data.items()):
            with self.subTest(role=role):
                listed = {d.lower() for d in CATALOGUE["roles"][role]["data"]}
                self.assertEqual(sorted(seen - listed), [], "data attributes not in the role catalogue (REF.2)")


class OutputSafetyTests(unittest.TestCase):
    """R-REND-006 TC-1."""

    HOSTILE = '<script>alert("x")</script> \' " & javascript:alert(1)'

    def test_escaping(self):  # TC-1 (C1, V1)
        src = f'VStack {{ Text({json.dumps(self.HOSTILE)}); Button({json.dumps(self.HOSTILE)}).help({json.dumps(self.HOSTILE)}).id({json.dumps(self.HOSTILE)}) }}'
        out = render(src).html
        self.assertNotIn("<script", out)
        self.assertIn("&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt; &#x27; &quot; &amp; javascript:alert(1)", out)
        for value in re.findall(r'="([^"]*)"', out):
            self.assertNotIn("<", value)

    def test_no_active_markup(self):  # TC-1 (C2)
        out = "".join(corpus_html())
        self.assertGreater(len(out), 100_000)
        for pattern in (r"<script\b", r"<iframe\b", r"<object\b", r"<form\b", r"<a\s[^>]*href=", r"\son[a-z]+\s*="):
            self.assertIsNone(re.search(pattern, out, re.I), pattern)
        link = root(html('Link("Docs", destination: "https://example.org")'))
        self.assertTrue(link.startswith("<span"), link)
        self.assertNotIn("href", link)

    def test_style_values(self):  # TC-1 (C3)
        out = render('VStack { Text("a").foregroundStyle("red;background:url(x)"); Text("b").padding(12)'
                     '.background(Color("#ff0000")); Text("c").font(.system(size: "12px;x:y")) }').html
        styles = re.findall(r'style="([^"]*)"', screen(out))
        self.assertTrue(any("calc(12 * var(--u))" in s for s in styles))
        self.assertTrue(any("#ff0000" in s for s in styles))
        for s in styles:
            self.assertNotIn("url(", s)
            self.assertNotIn("x:y", s)

    def test_image_sources(self):  # TC-1 (C4, V1)
        for src in ("javascript:alert(1)", "data:text/html,<b>x</b>", "../../etc/passwd", "file:///etc/passwd"):
            with self.subTest(src=src):
                out = render(f'Image({json.dumps(src)})').html
                self.assertNotIn("<img", out)
                self.assertIn("mkd-image--placeholder", out)
        out = render('Image("https://example.org/a.png")').html
        self.assertIn('src="https://example.org/a.png"', out)

    def test_fence_attributes(self):  # TC-1 (C5)
        out = render('Text("x")', RenderOptions(title='"><script>x</script>', id="<b>", url='"onload="x',
                                                device='"><i>', chrome='"><i>', pack="swiftui")).html
        self.assertNotIn("<script", out)
        self.assertNotIn("<b>", out)
        self.assertNotIn("<i>", out)
        self.assertNotRegex(out, r'\sonload=')
        self.assertIn("&lt;b&gt;", out)


class StaticOutputTests(unittest.TestCase):
    """R-REND-007 TC-1."""

    def test_controls_are_static(self):  # TC-1 (C1, V1)
        roles = {'Button("b")': "button", 'Toggle("t", isOn: true)': "switch", 'Checkbox("c")': "checkbox",
                 'RadioButton("r")': "radio", 'TextField("f")': "textbox", 'Link("l", destination: "x")': "link"}
        for src, aria in roles.items():
            with self.subTest(src=src):
                out = html(src)
                self.assertIn(f'role="{aria}"', out)
                self.assertNotRegex(out, r"<(button|input|select|textarea|a)\b")
                self.assertNotIn("<script", out)

    def test_byte_identical(self):  # TC-1 (C2, V1)
        sources = [f.read_text(encoding="utf-8") for f in sorted(CORPUS.glob("*.mockitdown"))[:120]]
        for src in sources:
            self.assertEqual(render(src).html, render(src).html)
        src = 'HStack { Avatar(name: "Dana Ruiz"); Chart(values: [1, 2]) }.overlay { Text("o") }'
        self.assertEqual(render(src).html, render(src).html)

    def test_generated_values(self):  # TC-1 (C3)
        hue = lambda out: re.search(r'data-hue="(\d+)"', out).group(1)   # noqa: E731
        a = hue(html('Avatar(name: "Dana Ruiz")'))
        self.assertEqual(a, hue(html('VStack { Text("other"); Avatar(name: "Dana Ruiz") }')))   # from the content
        self.assertNotEqual(a, hue(html('Avatar(name: "Lee Park")')))
        two = html('VStack { Chart(values: [1, 2]); Chart(values: [1, 2]) }')
        ids = re.findall(r'\bid="([^"]+)"', two)
        self.assertEqual(len(ids), len(set(ids)))                     # numbered in mockup order
        self.assertEqual(ids, re.findall(r'\bid="([^"]+)"', html('VStack { Chart(values: [1, 2]); Chart(values: [1, 2]) }')))
        for f in (ROOT / "src" / "mockitdown" / "render").rglob("*.py"):
            text = f.read_text(encoding="utf-8")
            for banned in ("import random", "from random", "time.time", "datetime.now", "uuid", "id("):
                if banned == "id(":
                    self.assertNotRegex(text, r"(?<![\w.])id\((?!\")", f)
                else:
                    self.assertNotIn(banned, text, f)

    def test_icons(self):  # TC-1 (C4)
        svgs = re.findall(r'<svg class="mkd-icon"[^>]*>', "".join(corpus_html()))
        self.assertGreater(len(svgs), 100)
        for tag in svgs:
            self.assertIn('aria-hidden="true"', tag)
            self.assertIn('focusable="false"', tag)


class UnknownElementTests(unittest.TestCase):
    """R-REND-008 TC-1."""

    def test_unknown_view(self):  # TC-1 (C1, V1)
        r = render('HStack { Text("a"); Foo { Text("b") }; Text("c") }')
        self.assertEqual([d.code for d in r.errors], ["unknown"])
        self.assertIn('<div class="mkd-hstack" data-el="HStack"><span class="mkd-text" data-el="Text">a</span>'
                      '<div class="mkd-unknown" data-el="Foo"><span class="mkd-unknown__name">Foo</span>'
                      '<span class="mkd-text" data-el="Text">b</span></div>'
                      '<span class="mkd-text" data-el="Text">c</span></div>', r.html)

    def test_role_without_renderer(self):  # TC-1 (C2)
        import tempfile
        with tempfile.TemporaryDirectory() as d:
            p = Path(d) / "acme"
            p.mkdir()
            (p / "pack.json").write_text(json.dumps({"elements": {"Gizmo": {"role": "gizmo"}}}), encoding="utf-8")
            r = render('Gizmo { Text("inside") }', RenderOptions(pack="acme", pack_paths=(Path(d),)))
        self.assertEqual([(d.code, d.message) for d in r.errors],
                         [("role", "pack 'acme': element 'Gizmo' has unknown role 'gizmo'")])
        self.assertIn('<div class="mkd-unknown" data-el="Gizmo"><span class="mkd-unknown__name">Gizmo</span>'
                      '<span class="mkd-text" data-el="Text">inside</span></div>', r.html)

    def test_placeholder_css(self):  # TC-1 (C3)
        css = (SHARED / "packs" / "base" / "pack.css").read_text(encoding="utf-8")
        rule = re.search(r"\.mkd-unknown\s*\{([^}]*)\}", css)
        self.assertIsNotNone(rule)
        self.assertRegex(rule.group(1), r"border\s*:[^;]*dashed")
        self.assertRegex(css, r"\.mkd-unknown__name\s*\{")


if __name__ == "__main__":
    unittest.main()
