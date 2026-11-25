import tempfile
import unittest
from pathlib import Path

from tests.helpers import diags, html
from mockitdown import RenderOptions, render, stylesheet


class EvaluateRenderTests(unittest.TestCase):
    def test_struct_component_with_slot_and_defaults(self):
        out = html('struct Card2: View {\n var title: String\n var note: String = "n/a"\n'
                   ' @ViewBuilder var content: Content\n var body: some View {\n'
                   '  VStack { Text(title); Text(note); content } } }\n'
                   'Card2(title: "Hello") { Button("Go") }')
        self.assertIn('data-component="Card2"', out)
        self.assertIn("Hello", out)
        self.assertIn("n/a", out)
        self.assertIn("mkd-button", out)

    def test_foreach_tuples_and_interpolation(self):
        out = html('VStack { ForEach([("a", 1), ("b", 2)]) { n, c in Text("\\(n)=\\(c)") } }')
        self.assertIn("a=1", out)
        self.assertIn("b=2", out)

    def test_if_and_ternary(self):
        out = html('let on = true\nVStack { if on { Text("yes") } else { Text("no") }; Text(on ? "T" : "F") }')
        self.assertIn("yes", out)
        self.assertNotIn(">no<", out)
        self.assertIn(">T<", out)

    def test_modifiers_become_style_and_data(self):
        out = html('Text("x").font(.title).foregroundStyle(.red).padding(.horizontal, 8).id("t").ref("UC-1")')
        self.assertIn('data-font="title"', out)
        self.assertIn("var(--mkd-color-red)", out)
        self.assertIn("padding-left:calc(8 * var(--u))", out)
        self.assertIn('data-mkd-id="t"', out)
        self.assertIn('data-ref="UC-1"', out)

    def test_navigation_title_and_toolbar(self):
        out = html('NavigationStack { List { Text("a") }.navigationTitle("Inbox")'
                   '.toolbar { ToolbarItem(placement: .topBarLeading) { Button("Edit") } } }')
        self.assertIn('mkd-navbar__large">Inbox', out)
        self.assertIn('mkd-navbar__leading"><span class="mkd-button"', out)

    def test_tabview_with_tabitems(self):
        out = html('TabView { Text("A").tabItem { Label("Home", systemImage: "house") }\n'
                   'Text("B").tabItem { Label("Me", systemImage: "person") } }')
        self.assertEqual(out.count("mkd-tabs__tab"), 2)
        self.assertIn('aria-selected="true"><span class="mkd-tabs__icon">', out)

    def test_alert_modifier_becomes_overlay(self):
        out = html('Text("x").alert("Delete?", isPresented: true) { Button("Cancel") } message: { Text("Gone") }')
        self.assertIn('mkd-layer" data-kind="alert"', out)
        self.assertIn("Delete?", out)

    def test_unknown_element_is_an_error_but_renders(self):
        r = render('VStack { Bogus("x") }')
        self.assertFalse(r.ok)
        self.assertIn("mkd-unknown", r.html)
        self.assertIn("mkd-error", r.html)

    def test_unknown_modifier_is_a_warning(self):
        self.assertTrue(any("unknown modifier" in d for d in diags('Text("x").sparkle()')))

    def test_syntax_error_renders_error_block(self):
        r = render('VStack {')
        self.assertFalse(r.ok)
        self.assertTrue(r.html.startswith('<div class="mkd-error"'))

    def test_options_and_screen_directive(self):
        out = html('@Screen(title: "Inbox", id: "S-1", device: .phone, appearance: .both)\nText("x")')
        self.assertEqual(out.count('class="mkd-frame"'), 2)
        self.assertIn("S-1 · Inbox", out)
        out = html('@Screen(device: .phone)\nText("x")', device="desktop", appearance="dark")
        self.assertIn('data-device="desktop"', out)
        self.assertIn('data-appearance="dark"', out)

    def test_spec_deviations_fixed(self):
        out = html('let p = ("a", "b")\nText(p.1).onTapGesture { undefinedThing.toggle() }')
        self.assertIn(">b<", out)
        out = html('@Screen(device: .phone)\nText("x")', default_device="desktop")
        self.assertIn('data-device="phone"', out)

    def test_elements_table(self):
        out = html('Button("Go").id("go").ref("UC-1")', elements=True)
        self.assertIn('<table class="mkd-elements">', out)
        self.assertIn("UC-1", out)

    def test_imports_and_assets(self):
        with tempfile.TemporaryDirectory() as d:
            p = Path(d)
            (p / "lib").mkdir()
            (p / "lib" / "rows.mockitdown").write_text('struct Hello: View { var body: some View { Text("hi") } }')
            (p / "pic.svg").write_text('<svg xmlns="http://www.w3.org/2000/svg" width="4" height="4"/>')
            out = html('import "lib/rows"\nVStack { Hello(); Image("pic.svg") }',
                       import_paths=(p,), asset_paths=(p,))
            self.assertIn(">hi<", out)
            self.assertIn('src="data:image/svg+xml;base64,', out)
            r = render('import "nope"\nText("x")', RenderOptions(import_paths=(p,)))
            self.assertTrue(any("cannot find import" in str(e) for e in r.errors))
            r = render('Image("../../etc/passwd")', RenderOptions(asset_paths=(p,)))
            self.assertNotIn("data:", r.html)

    def test_text_is_escaped(self):
        out = html('Text("<script>alert(1)</script>")')
        self.assertNotIn("<script>", out)
        out = html('Text("x").foregroundStyle("red;background:url(x)")')
        self.assertNotIn("url(x)", out)

    def test_stylesheet_scales_and_scopes(self):
        css = stylesheet(["base"])
        self.assertIn("calc(16 * var(--u))", css)
        self.assertIn('[data-md-color-scheme="slate"] .mkd-pack-base .mkd-frame[data-appearance="auto"]', css)


class CollectionMethodTests(unittest.TestCase):
    def test_contains_and_prefix(self):
        out = html('let xs = ["a", "b"]\nVStack { if xs.contains("b") { Text("has-b") }; '
                   'if xs.contains("z") { Text("has-z") }; if "hello".hasPrefix("he") { Text("pre") } }')
        self.assertIn("has-b", out)
        self.assertNotIn("has-z", out)
        self.assertIn("pre", out)

    def test_table_sees_rows_inside_groups(self):
        out = html('Table { Group { TableColumn("Name") }; Group { TableRow { Text("Ana") } } }')
        self.assertIn("Name", out)
        self.assertIn("Ana", out)

    def test_badge_count_one_is_not_a_dot(self):
        out = html("Badge(count: 1)")
        self.assertIn('mkd-badge__label">1<', out)
        self.assertNotIn('data-dot="true"', out)

    def test_chart_top_tick_covers_the_maximum(self):
        from mockitdown.render.charts import nice_ticks
        self.assertGreaterEqual(nice_ticks(0, 23600)[-1], 23600)
        self.assertEqual(nice_ticks(0, 100), [0, 25, 50, 75, 100])

    def test_empty_text_keeps_a_line(self):
        self.assertIn("&#160;", html('VStack { Text("a"); Text(""); Text("b") }'))


if __name__ == "__main__":
    unittest.main()
