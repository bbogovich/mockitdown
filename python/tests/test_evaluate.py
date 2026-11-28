"""The evaluator (R-EVAL-001, R-EVAL-002, R-EVAL-008, R-EVAL-011): completing on every problem, what a
block renders, values and operators, and tolerance for pasted SwiftUI.

Each test names the test case (TC-n) and the clauses it verifies.
"""

import re
import unittest

from tests.helpers import ROOT  # noqa: F401  (puts src/ on sys.path)
from mockitdown import RenderOptions, evaluate, render
from mockitdown.model import CallValue, EnumValue, Screen
from mockitdown.diagnostics import Diagnostics
from mockitdown.evaluate import Env, Evaluator, format_value
from mockitdown.packs import PackRegistry
from mockitdown.syntax import parse


def texts(html):
    return [t.replace("&#160;", "") for t in re.findall(r'data-el="Text"[^>]*>([^<]*)<', html)]


def value(expr, prelude=""):
    """Evaluate one expression after the ``let`` statements of ``prelude``: (value, diagnostics)."""
    diags = Diagnostics()
    ev = Evaluator(PackRegistry(), diags)
    ev.pack = ev.registry.get("base")
    env = Env()
    module = parse(f"{prelude}\nlet __v = {expr}")
    for st in module.statements:
        env.vars[st.name] = ev.value(st.value, env)
    return env.vars["__v"], [(d.severity.value, d.code, d.message) for d in diags.items]


def shown(expr, prelude=""):
    """The interpolated text of ``expr`` and the diagnostics' messages."""
    r = render(f'{prelude}\nText("\\({expr})")')
    return texts(r.html)[0], [d.message for d in r.diagnostics]


class CompletionTests(unittest.TestCase):
    """R-EVAL-001 TC-1."""

    def test_a_screen_from_a_module(self):  # TC-1 (C1)
        screen, diags = evaluate('import SwiftUI\n@Screen("Inbox", device: .phone)\n'
                                 'struct Row: View {\n  var body: some View { Text("row") }\n}\nVStack { Row() }\nText("b")',
                                 RenderOptions())
        self.assertIsInstance(screen, Screen)
        self.assertEqual(diags.items, [])
        self.assertEqual([v.name for v in screen.views], ["VStack", "Text"])
        self.assertEqual(screen.pack.id, "swiftui")
        self.assertEqual((screen.meta["title"], screen.meta["device"]), ("Inbox", "phone"))
        self.assertEqual(screen.components, ["Row"])
        self.assertFalse(any("<" in str(v.attrs) for v in screen.views))  # data, no HTML (A-EVAL-1.K1)

    def test_semantic_problems_never_raise(self):  # TC-1 (C1, C2)
        sources = ['Foo()', 'Text(zz)', 'Text("a").bogus()', 'ForEach(1) { }', 'ForEach(3)', 'Text("\\([1][9])")',
                   'struct S: View { var x: Int\n var body: some View { Text("\\(x)") } }\nS()', 'Text("\\(1 / 0)")',
                   'struct R: View { var body: some View { R() } }\nR()', '@Bogus\nText("a")', 'import Nope\nText("a")',
                   'Text("\\("a" - 1)")', 'Text("\\(-"a")")']
        for src in sources:
            screen, diags = evaluate(src, RenderOptions())
            self.assertIsInstance(screen, Screen, src)
            self.assertTrue(diags.items, src)

    def test_substitutes_unknown_views_and_nil_values(self):  # TC-1 (C2, V1)
        r = render('VStack {\n  Text("before")\n  Foo { Text("inside") }\n  Text("after").bogus()\n  Text("\\(zz)")\n}')
        self.assertEqual(texts(r.html), ["before", "inside", "after", "nil"])
        self.assertIn('data-el="Foo"', r.html)
        self.assertEqual([(d.severity.value, d.code) for d in r.diagnostics],
                         [("error", "unknown"), ("warning", "modifier"), ("error", "unknown")])
        r = render('VStack { Text("a"); Foo(); Text("b").bogus() }')
        self.assertEqual(texts(r.html), ["a", "b"])
        self.assertEqual((len(r.errors), len(r.diagnostics) - len(r.errors)), (1, 1))

    def test_source_order_and_nested_scopes(self):  # TC-1 (C3)
        self.assertEqual(texts(render('let a = "1"\nText(a)\nlet a = "2"\nText(a)').html), ["1", "2"])
        r = render('let a = 1\nif true {\n  let a = 2\n  Text("in \\(a)")\n}\nText("out \\(a)")')
        self.assertEqual(texts(r.html), ["in 2", "out 1"])
        r = render('if true { let b = 2 }\nText("\\(b)")')
        self.assertEqual([d.message for d in r.diagnostics], ["unknown name 'b'"])
        r = render('let n = "outer"\nForEach(["x"]) { n in Text(n) }\nText(n)')
        self.assertEqual(texts(r.html), ["x", "outer"])
        r = render('struct S: View {\n  var body: some View { Text("\\(outer)") }\n}\nlet outer = 1\nS()')
        self.assertEqual([d.message for d in r.diagnostics], ["unknown name 'outer'"])  # a struct sees its own scope


class BlockContentTests(unittest.TestCase):
    """R-EVAL-002 TC-1."""

    def test_top_level_and_preview_statements(self):  # TC-1 (C1)
        r = render('Text("a")\n#Preview { Text("p") }\nText("b")')
        self.assertEqual(texts(r.html), ["a", "p", "b"])
        r = render('struct V: View { var body: some View { Text("v") } }\n#Preview("Named") { V() }')
        self.assertEqual(texts(r.html), ["v"])
        self.assertEqual(texts(render('struct V: View { var body: some View { Text("v") } }\nText("top")').html),
                         ["top"])

    def test_declarations_only_renders_the_last_struct(self):  # TC-1 (C2, C4, V1)
        src = ('struct Login: View {\n  var body: some View { Text("login") }\n}\n'
               'struct Card: View {\n  var title: String\n  var count: Int = 3\n  var body: some View { Text("\\(title) \\(count)") }\n}')
        r = render(src)
        self.assertEqual(r.diagnostics, [])
        self.assertEqual(texts(r.html), ["title 3"])  # called without arguments; C4: the name as placeholder
        self.assertEqual(texts(render(src.split("struct Card")[0]).html), ["login"])
        # Only the implicit instance gets placeholders: an explicit call still reports the missing argument.
        r = render(src + "\nCard()")
        self.assertEqual([d.message for d in r.diagnostics], ["missing argument 'title' for struct Card"])

    def test_empty_mockup(self):  # TC-1 (C3, V1)
        for src in ("", "// nothing\n", 'let x = 1', 'if false { Text("x") }', 'import SwiftUI'):
            r = render(src)
            self.assertEqual([(d.severity.value, d.code, d.message) for d in r.diagnostics],
                             [("warning", "empty", "the mockup has no views")], src)


class ValueTests(unittest.TestCase):
    """R-EVAL-008 TC-1."""

    def test_literals_and_collections(self):  # TC-1 (C1)
        self.assertEqual(value('["s", 1, 2.5, true, nil]')[0], ["s", 1, 2.5, True, None])
        self.assertEqual(value('["a": 1, "b": [2]]')[0], {"a": 1, "b": [2]})
        self.assertEqual(value('[:]')[0], {})
        self.assertEqual(value('(1, "x")')[0], (1, "x"))
        self.assertEqual(value('(name: "A", 3)')[0], {"name": "A", "1": 3})
        self.assertIsInstance(value("2.0")[0], float)
        self.assertIsInstance(value("2")[0], int)

    def test_interpolation_format(self):  # TC-1 (C2, V1)
        self.assertEqual(shown('"\\(3.0) \\(2.5) \\(nil) \\([1, 2])"')[0], "3 2.5 nil [1, 2]")
        self.assertEqual(shown("true")[0], "true")
        self.assertEqual(shown("false")[0], "false")
        self.assertEqual(shown(".large")[0], "large")
        self.assertEqual(shown("1.0 / 3")[0], "0.333333")     # six significant digits, as built
        self.assertEqual(shown("1234567.0 + 0.5")[0], "1.23457e+06")
        self.assertEqual(shown('[1.5, nil, "a"]')[0], "[1.5, nil, a]")
        self.assertEqual(shown("v", 'let v = Text("x")')[0], "")  # a view value
        self.assertEqual((format_value(None), format_value(2.0), format_value(EnumValue("red", "Color"))),
                         ("nil", "2", "red"))

    def test_enum_values(self):  # TC-1 (C3)
        self.assertEqual(value(".red")[0], EnumValue("red"))
        self.assertEqual(value('.custom("Inter", size: 12)')[0],
                         EnumValue("custom", args=("Inter",), kwargs=(("size", 12),)))
        self.assertEqual(value("Color.red")[0], EnumValue("red", namespace="Color"))
        self.assertEqual(value('Font.custom("x")')[0], EnumValue("custom", namespace="Font", args=("x",)))
        self.assertEqual(value(".constant(5)")[0], 5)
        # A variable named like the namespace is a value, not a namespace.
        self.assertEqual(value("Color.count", 'let Color = [1, 2]')[0], 2)

    def test_members(self):  # TC-1 (C4)
        self.assertEqual(value('m.a', 'let m = ["a": 1]')[0], 1)
        for expr, expected in (('"abc".count', 3), ('[1, 2].count', 2), ('(1, 2, 3).count', 3), ('["a": 1].count', 1),
                               ('"".isEmpty', True), ('[1].isEmpty', False), ('[:].isEmpty', True),
                               ('[4, 5].first', 4), ('[4, 5].last', 5), ('(4, 5).last', 5), ('(7, 8).1', 8)):
            self.assertEqual(value(expr), (expected, []), expr)
        self.assertEqual(value("e.first", "let e = [Int]()")[0], None)
        self.assertEqual(value("e.last", "let e = []")[0], None)
        self.assertEqual(value(".red.opacity(0.3)")[0], EnumValue("opacity", namespace="red", args=(0.3,)))
        self.assertEqual(value("Color.red.secondary")[0], EnumValue("secondary", namespace="red"))

    def test_methods(self):  # TC-1 (C5)
        self.assertEqual(value('"Ab".uppercased()')[0], "AB")
        self.assertEqual(value('"Ab".lowercased()')[0], "ab")
        self.assertEqual(value('"hello world".capitalized()')[0], "Hello World")
        self.assertEqual(value('["a", 1, 2.0].joined(separator: ", ")')[0], "a, 1, 2")
        self.assertEqual(value('["a", "b"].joined()')[0], "ab")
        self.assertEqual(value('["a", "b"].contains("b")')[0], True)
        self.assertEqual(value('"mockup".hasPrefix("mock")')[0], True)
        self.assertEqual(value('"mockup".hasSuffix("down")')[0], False)
        self.assertEqual(value('"mockup".contains("ku")')[0], True)

    def test_operators(self):  # TC-1 (C6, V1)
        cases = {'"a" + 1': "a1", '1 + "a"': "1a", '"a" + nil': "anil", "1 + 2": 3, "1.5 + 1": 2.5, "5 - 7": -2,
                 "3 * 4": 12, "7 / 2": 3, "7.0 / 2": 3.5, "-7 / 2": -4, "1 < 2": True, "2 >= 3": False, "1 == 1.0": True,
                 '"a" != "b"': True, "!0": True, '!""': True, '!"x"': False, "-(2.5)": -2.5,
                 '[] && x': False, '"x" || y': True, 'nil || 0': False, '1 && "a"': True}
        for expr, expected in cases.items():
            self.assertEqual(value(expr), (expected, []), expr)  # short-circuit: x and y are never looked up
        self.assertEqual(value('-"a"'), (None, [("error", "value", "'-' needs a number")]))

    def test_ranges(self):  # TC-1 (C7)
        self.assertEqual(value("1...3")[0], [1, 2, 3])
        self.assertEqual(value("0..<3")[0], [0, 1, 2])
        self.assertEqual(value("3..<3")[0], [])
        self.assertEqual(value("0.2...0.8")[0], [0.2, 0.8])          # continuous: its bounds
        self.assertEqual(value('"a"...2'), ([], [("error", "value", "a range needs numeric bounds")]))
        self.assertEqual(value('1...nil')[1], [("error", "value", "a range needs numeric bounds")])

    def test_subscripts(self):  # TC-1 (C8, V1)
        for expr, expected in (('[1, 2][1]', 2), ('(1, "b")[1]', "b"), ('"abc"[2]', "c"), ('["k": 9]["k"]', 9)):
            self.assertEqual(value(expr), (expected, []), expr)
        for expr in ('[1][3]', '["k": 9]["z"]', '"abc"[9]', '[1]["a"]', '5[0]'):
            self.assertEqual(value(expr), (None, [("error", "value", "subscript out of range")]), expr)

    def test_call_values_and_key_paths(self):  # TC-1 (C9)
        self.assertEqual(value("GridItem(.flexible())")[0], CallValue("GridItem", (EnumValue("flexible"),)))
        self.assertEqual(value('URL(string: "x")')[0], CallValue("URL", (), (("string", "x"),)))
        self.assertEqual(value(r"\.name"), (None, []))
        self.assertEqual(value(r"\Item.name"), (None, []))

    def test_problems_yield_nil(self):  # TC-1 (C10)
        self.assertEqual(value('"a" - 1'), (None, [("error", "value", "cannot apply '-' to these values")]))
        self.assertEqual(value('1 / 0'), (None, [("error", "value", "cannot apply '/' to these values")]))
        self.assertEqual(value('[1] < 2'), (None, [("error", "value", "cannot apply '<' to these values")]))
        self.assertEqual(value('[1].bogus'), (None, [("error", "value", "value has no member 'bogus'")]))
        self.assertEqual(value('(1, 2).5'), (None, [("error", "value", "value has no member '5'")]))
        self.assertEqual(value('zz'), (None, [("error", "unknown", "unknown name 'zz'")]))
        text, messages = shown('zz + 1')
        self.assertEqual((text, messages), ("nil", ["unknown name 'zz'", "cannot apply '+' to these values"]))


PASTED = '''import SwiftUI
import Combine

struct SettingsView: View {
    @State private var wifi = true
    @Binding var name: String
    @ObservedObject var model: Model
    @Environment(\\.colorScheme) private var scheme: ColorScheme = .light
    public static let version = "1.0"

    var body: some View {
        return VStack {
            Toggle("Wi-Fi", isOn: $wifi)
                .onTapGesture { wifi.toggle(); Unknown() }
                .onAppear { load() }
            Text(name.uppercased())
            Text(model.title!)
            Button("Save", action: { save(); Missing() })
            Button("Reset", perform: { reset() })
        }
    }
}

SettingsView(name: .constant("ana"), model: (title: "Settings", n: 1))
'''


class PastedSwiftUITests(unittest.TestCase):
    """R-EVAL-011 TC-1."""

    def test_a_pasted_view_renders_without_diagnostics(self):  # TC-1 (C1, C2, C3, C4, C5, V1)
        r = render(PASTED)
        self.assertEqual([str(d) for d in r.diagnostics], [])
        self.assertEqual(texts(r.html), ["ANA", "Settings"])
        self.assertIn('data-el="Toggle" data-on="true"', r.html)
        self.assertEqual(r.screen.pack.id, "swiftui")

    def test_property_attributes(self):  # TC-1 (C1)
        src = ('struct V: View {\n  @State var on = false\n  @ViewBuilder var header: some View { Text("h") }\n'
               '  @ViewBuilder var content: Content\n  var body: some View { header; content }\n}\nV { Text("slot") }')
        r = render(src)
        self.assertEqual((r.diagnostics, texts(r.html)), ([], ["h", "slot"]))
        # Ignored means an attributed property is an ordinary one: a value without a default is an argument.
        r = render('struct V: View {\n  @State var on: Bool\n  var body: some View { Text("\\(on)") }\n}\nV(on: true)')
        self.assertEqual((r.diagnostics, texts(r.html)), ([], ["true"]))

    def test_ignored_syntax(self):  # TC-1 (C2)
        src = ('struct V: View, Equatable, Identifiable {\n  private static var count: Int = 2\n'
               '  fileprivate var title: String? = "t"\n  var body: some View {\n    return Text(title!)\n  }\n}\nV()')
        r = render(src)
        self.assertEqual((r.diagnostics, texts(r.html)), ([], ["t"]))
        r = render('let k = \\Item.name\nText("\\(k)")')
        self.assertEqual((r.diagnostics, texts(r.html)), ([], ["nil"]))

    def test_neutral_modules(self):  # TC-1 (C3)
        modules = ["Foundation", "Combine", "Observation", "UIKit", "AppKit", "SwiftData", "Charts", "MapKit",
                   "PhotosUI", "WebKit"]
        r = render("\n".join(f"import {m}" for m in modules) + '\nText("x")')
        self.assertEqual((r.diagnostics, r.screen.pack.id), ([], "base"))
        r = render("import Charts\nimport SwiftUI\nText(\"x\")")
        self.assertEqual((r.diagnostics, r.screen.pack.id), ([], "swiftui"))
        self.assertEqual([d.code for d in render('import Bogus\nText("x")').diagnostics], ["pack"])

    def test_bindings(self):  # TC-1 (C4)
        r = render('import SwiftUI\nlet wifi = false\nToggle("A", isOn: $wifi)\nToggle("B", isOn: .constant(true))')
        self.assertEqual(r.diagnostics, [])
        self.assertEqual(value("$n", "let n = 4"), (4, []))
        self.assertEqual(value(".constant(\"x\")"), ("x", []))

    def test_action_closures_are_not_evaluated(self):  # TC-1 (C5)
        r = render('Button("a", action: { Foo() })\nButton("b") { Text("label") }\n'
                   'Text("c").onTapGesture { Bar() }.onAppear { Baz() }.onChange(of: 1) { Qux() }')
        self.assertEqual([str(d) for d in r.diagnostics], [])
        self.assertNotIn("Foo", r.html)
        self.assertNotIn("Bar", r.html)


if __name__ == "__main__":
    unittest.main()
