"""Expressions, operators and collection literals in the parser (R-LANG-006, R-LANG-008).

Each test names the test case (TC-n) and the clauses it verifies. Expressions are parsed as the value of a
``let`` statement and printed back fully parenthesised, so a test reads as the grouping it expects.
"""

import unittest

from tests.helpers import ROOT  # noqa: F401  (puts src/ on sys.path)
from mockitdown import render
from mockitdown.diagnostics import MockitdownSyntaxError
from mockitdown.syntax import ast as A
from mockitdown.syntax import parse


def tree(node):
    """A compact, fully parenthesised rendering of an expression tree."""
    if isinstance(node, A.Literal):
        return repr(node.value)
    if isinstance(node, A.StringLit):
        return repr("".join(p if isinstance(p, str) else "\\(" + tree(p) + ")" for p in node.parts))
    if isinstance(node, A.Ident):
        return node.name
    if isinstance(node, A.EnumCase):
        return "." + node.name
    if isinstance(node, A.Member):
        return f"{tree(node.base)}.{node.name}"
    if isinstance(node, A.Binary):
        return f"({tree(node.left)} {node.op} {tree(node.right)})"
    if isinstance(node, A.Unary):
        return f"({node.op}{tree(node.operand)})"
    if isinstance(node, A.RangeExpr):
        return f"({tree(node.lo)}{'...' if node.inclusive else '..<'}{tree(node.hi)})"
    if isinstance(node, A.Ternary):
        return f"({tree(node.cond)} ? {tree(node.then)} : {tree(node.other)})"
    if isinstance(node, A.Call):
        args = ", ".join((f"{a.label}: " if a.label else "") + tree(a.value) for a in node.args)
        trailing = "".join(" {" + (f"{lab}:" if lab else "") + "}" for lab, _ in node.trailing)
        return f"{tree(node.callee)}({args}){trailing}"
    if isinstance(node, A.Subscript):
        return f"{tree(node.base)}[{tree(node.index)}]"
    if isinstance(node, A.ArrayLit):
        return "[" + ", ".join(tree(i) for i in node.items) + "]"
    if isinstance(node, A.DictLit):
        return "[" + (", ".join(f"{tree(k)}: {tree(v)}" for k, v in node.items) or ":") + "]"
    if isinstance(node, A.TupleLit):
        return "(" + ", ".join((f"{a.label}: " if a.label else "") + tree(a.value) for a in node.items) + ",)"
    if isinstance(node, A.KeyPath):
        return "\\" + node.path
    if isinstance(node, A.Closure):
        return "{closure}"
    raise AssertionError(type(node))


def expr(src):
    (st,) = parse(f"let v = {src}").statements
    return tree(st.value)


def syntax_error(src):
    with self_raises() as cm:
        parse(src)
    return cm.exception.diagnostic.message


class self_raises:
    def __enter__(self):
        return self

    def __exit__(self, kind, exc, tb):
        if kind is None:
            raise AssertionError("no syntax error")
        if not issubclass(kind, MockitdownSyntaxError):
            return False
        self.exception = exc
        return True


class ExpressionTests(unittest.TestCase):
    """R-LANG-006 TC-1."""

    def test_precedence_and_associativity(self):  # TC-1 (C1, V1)
        self.assertEqual(expr("a || b && c == d"), "(a || (b && (c == d)))")
        self.assertEqual(expr("a && b || c"), "((a && b) || c)")
        self.assertEqual(expr("x ? a || b : c"), "(x ? (a || b) : c)")
        self.assertEqual(expr("a || b ? 1 : 2"), "((a || b) ? 1 : 2)")
        self.assertEqual(expr("a ? b : c ? d : e"), "(a ? b : (c ? d : e))")
        self.assertEqual(expr("1 < 2 == true"), "((1 < 2) == True)")
        self.assertEqual(expr("a != b && c >= d && e <= f && g > h"),
                         "((((a != b) && (c >= d)) && (e <= f)) && (g > h))")
        self.assertEqual(expr("0...n - 1"), "(0...(n - 1))")
        self.assertEqual(expr("0..<n == r"), "((0..<n) == r)")
        self.assertEqual(expr("1 + 2 * 3 - 4 / 2"), "((1 + (2 * 3)) - (4 / 2))")
        self.assertEqual(expr("10 - 4 - 3"), "((10 - 4) - 3)")
        self.assertEqual(expr("8 / 4 / 2"), "((8 / 4) / 2)")
        self.assertEqual(expr("-a * !b"), "((-a) * (!b))")
        self.assertEqual(expr("!!a"), "(!(!a))")
        self.assertEqual(expr("-a.b(1)[0]"), "(-a.b(1)[0])")
        self.assertEqual(expr('f(1).g { }'), "f(1).g() {}")
        self.assertEqual(render('let a = 1\nlet b = 2\nText("\\(a + b * 2 == 5 && !false)")').diagnostics, [])

    def test_line_feeds(self):  # TC-1 (C2, V1)
        self.assertEqual(expr("1 +\n  2 *\n  3"), "(1 + (2 * 3))")
        self.assertEqual(expr("a ||\n b &&\n\n c"), "(a || (b && c))")
        self.assertEqual(expr("a ==\n b"), "(a == b)")
        self.assertEqual(expr('x ?\n "on" :\n "off"'), "(x ? 'on' : 'off')")
        self.assertEqual(expr('x\n  ? "on"\n  : "off"'), "(x ? 'on' : 'off')")
        r = render('let x = true\nText(x\n  ? "on"\n  : "off")')
        self.assertEqual((r.diagnostics, 'data-el="Text">on<' in r.html), ([], True))
        # A line feed before a binary operator ends the statement: `- 2` is a statement of its own.
        self.assertEqual(len(parse("let a = 1\n- 2").statements), 2)

    def test_primary_expressions(self):  # TC-1 (C3)
        cases = {"42": "42", "2.5": "2.5", '"s"': "'s'", "true": "True", "false": "False", "nil": "None",
                 "name": "name", ".red": ".red", "[1, 2]": "[1, 2]", '["a": 1]': "['a': 1]", "(1)": "1",
                 "(1, 2)": "(1, 2,)", "{ Text(\"x\") }": "{closure}", r"\.a.b": r"\.a.b", r"\Item.name": r"\Item.name",
                 "$isOn": "isOn"}
        for src, expected in cases.items():
            self.assertEqual(expr(src), expected, src)

    def test_bindings_are_identifiers(self):  # TC-1 (C4, V1)
        (st,) = parse("let v = $isOn").statements
        self.assertIsInstance(st.value, A.Ident)
        self.assertEqual(st.value.name, "isOn")
        r = render('let isOn = true\nText(isOn ? "on" : "off")\nText("\\($isOn)")')
        self.assertEqual(r.diagnostics, [])
        self.assertIn('data-el="Text">on<', r.html)
        self.assertIn('data-el="Text">true<', r.html)

    def test_force_unwrap_is_ignored(self):  # TC-1 (C5)
        self.assertEqual(expr("name!"), "name")
        self.assertEqual(expr("user!.name!.count"), "user.name.count")
        self.assertEqual(expr("a! == b"), "(a == b)")
        self.assertEqual(expr("!a"), "(!a)")
        self.assertEqual(expr("a != b"), "(a != b)")

    def test_keyword_member_names(self):  # TC-1 (C6)
        self.assertEqual(expr(".default"), ".default")
        self.assertEqual(expr("Font.default"), "Font.default")
        self.assertEqual(expr("x.in"), "x.in")
        self.assertEqual(expr(".if.let"), ".if.let")

    def test_no_expression(self):  # TC-1 (C7)
        self.assertEqual(syntax_error("Text(1 +)"), "expected an expression, found ')'")
        self.assertEqual(syntax_error("let v ="), "expected an expression, found end of input")
        self.assertEqual(syntax_error("Text("), "expected an expression, found end of input")
        self.assertEqual(syntax_error("let v = * 2"), "expected an expression, found '*'")

    def test_tuple_element_members(self):  # TC-1 (C8)
        self.assertEqual(expr("t.0"), "t.0")
        self.assertEqual(expr("t.1.count"), "t.1.count")
        self.assertEqual(expr("pairs[0].1"), "pairs[0].1")
        r = render('let t = ("a", ("b", "c"))\nlet u = t.1\nText("\\(t.0)\\(u.1)")')
        self.assertEqual(r.diagnostics, [])
        self.assertIn('data-el="Text">ac<', r.html)


class CollectionLiteralTests(unittest.TestCase):
    """R-LANG-008 TC-1."""

    def test_arrays_and_dictionaries(self):  # TC-1 (C1, V1)
        self.assertEqual(expr('[("Ana", 1), ("Ben", 2)]'), "[('Ana', 1,), ('Ben', 2,)]")
        self.assertEqual(expr('["a": 1, "b": 2]'), "['a': 1, 'b': 2]")
        self.assertEqual(expr("[\n  1,\n  2,\n]"), "[1, 2]")
        self.assertEqual(expr('[\n  "a": 1,\n\n  "b": 2,\n]'), "['a': 1, 'b': 2]")
        self.assertEqual(expr("[]"), "[]")
        self.assertEqual(expr("[:]"), "[:]")
        self.assertIsInstance(parse("let v = [:]").statements[0].value, A.DictLit)
        self.assertEqual(expr("[[1], [2: 3]]"), "[[1], [2: 3]]")

    def test_mixed_entries(self):  # TC-1 (C2, V1)
        self.assertEqual(syntax_error('let v = [1, "a": 2]'), "a collection literal mixes array and dictionary entries")
        self.assertEqual(syntax_error('let v = ["a": 2, 1]'), "a collection literal mixes array and dictionary entries")

    def test_tuples_and_parentheses(self):  # TC-1 (C3)
        self.assertEqual(expr("(1, 2)"), "(1, 2,)")
        self.assertEqual(expr('(name: "A", age: 3)'), "(name: 'A', age: 3,)")
        self.assertEqual(expr('(name: "A")'), "(name: 'A',)")
        self.assertEqual(expr("(\n  1,\n  2\n)"), "(1, 2,)")
        self.assertEqual(expr("(1 + 2)"), "(1 + 2)")
        self.assertEqual(expr("((1))"), "1")
        self.assertIsInstance(parse("let v = (1)").statements[0].value, A.Literal)


if __name__ == "__main__":
    unittest.main()
