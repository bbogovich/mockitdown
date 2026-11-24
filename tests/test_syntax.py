import unittest

from tests.helpers import parse
from mockitdown.diagnostics import MockitdownSyntaxError
from mockitdown.syntax import ast as A


class SyntaxTests(unittest.TestCase):
    def test_imports_directive_struct_statements(self):
        m = parse('import SwiftUI\nimport "lib/rows"\n@Screen(title: "T", device: .phone)\n'
                   'struct Row: View {\n  var title: String\n  var count: Int = 0\n'
                   '  @ViewBuilder var content: Content\n  var body: some View { Text(title) }\n}\n'
                   'VStack { Row(title: "a") }\n')
        self.assertEqual([i.module for i in m.imports], ["SwiftUI", None])
        self.assertEqual(m.imports[1].path, "lib/rows")
        self.assertEqual(m.attributes[0].name, "Screen")
        self.assertEqual([p.name for p in m.structs[0].properties], ["title", "count", "content"])
        self.assertTrue(m.structs[0].properties[2].is_view)
        self.assertEqual(len(m.statements), 1)

    def test_modifier_chain_across_lines(self):
        m = parse('Text("x")\n  .font(.title)\n  .padding()\nText("y")')
        self.assertEqual(len(m.statements), 2)
        call = m.statements[0].expr
        self.assertIsInstance(call, A.Call)
        self.assertEqual(call.callee.name, "padding")

    def test_trailing_and_labeled_closures(self):
        m = parse('Menu { Button("A") } label: { Label("More", systemImage: "ellipsis") }')
        call = m.statements[0].expr
        self.assertEqual([lab for lab, _ in call.trailing], [None, "label"])

    def test_labeled_closure_without_unlabeled_first(self):
        call = parse('Banner("x") actions: { Button("Undo") }').statements[0].expr
        self.assertEqual([lab for lab, _ in call.trailing], ["actions"])

    def test_closure_params_and_interpolation(self):
        m = parse('ForEach(["a"]) { name in Text("Hi \\(name)!") }')
        closure = m.statements[0].expr.trailing[0][1]
        self.assertEqual(closure.params, ["name"])
        self.assertIsInstance(closure.body[0].expr.args[0].value, A.StringLit)

    def test_if_else_and_ranges(self):
        m = parse('if x > 1 { Text("a") } else { Text("b") }\nForEach(0..<3) { i in Text("\\(i)") }')
        self.assertIsInstance(m.statements[0], A.IfStmt)
        self.assertIsInstance(m.statements[1].expr.args[0].value, A.RangeExpr)

    def test_preview_block_becomes_statements(self):
        m = parse('struct V: View { var body: some View { Text("x") } }\n#Preview { V() }')
        self.assertEqual(len(m.statements), 1)

    def test_comments_and_semicolons(self):
        m = parse('// c\nHStack { Text("a"); /* b */ Spacer(); Text("c") }')
        self.assertEqual(len(m.statements[0].expr.trailing[0][1].body), 3)

    def test_errors_are_located(self):
        for src in ('Text("unterminated', 'VStack {', 'Text("a" "b")', 'struct S: View { func f() }'):
            with self.assertRaises(MockitdownSyntaxError) as cm:
                parse(src)
            self.assertGreater(cm.exception.diagnostic.location.line, 0, src)


if __name__ == "__main__":
    unittest.main()
