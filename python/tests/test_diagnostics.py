"""Diagnostics (R-DIAG-001 to R-DIAG-004): content and printed form, the collector, the codes and the
error box. R-DIAG-005 is verified in test_render.py.

Each test names the test case (TC-n) and the clauses it verifies.
"""

import ast
import contextlib
import io
import json
import re
import tempfile
import unittest
from pathlib import Path

from tests.helpers import ROOT, diags
from mockitdown import Diagnostic, MockitdownSyntaxError, Severity, evaluate, render
from mockitdown.diagnostics import Diagnostics, Location
from mockitdown.syntax import parse

SRC = ROOT / "src" / "mockitdown"
CORPUS = ROOT.parent / "shared" / "conformance"

#: R-DIAG-003.C1, in the order of the clause.
CODES = ("syntax", "empty", "directive", "pack", "import", "unknown", "view", "foreach", "recursion", "argument",
         "struct", "modifier", "value", "role", "icon", "asset", "device", "appearance", "chrome", "chart", "fence")


class ContentTests(unittest.TestCase):
    """R-DIAG-001 TC-1."""

    def test_fields(self):  # TC-1 (C1)
        self.assertEqual({s.value for s in Severity}, {"error", "warning"})
        d = Diagnostic(Severity.WARNING, "m")
        self.assertEqual((d.location.line, d.location.col, d.location.source, d.code), (0, 0, "", ""))
        (d,) = render('import SwiftUI\nVStack {\n  Bogus()\n}').diagnostics
        self.assertEqual((d.severity, d.code, d.location.line, d.location.source), (Severity.ERROR, "unknown", 3, ""))
        self.assertGreaterEqual(d.location.col, 3)
        self.assertIn("Bogus", d.message)

    def test_file_name_for_a_problem_in_a_file(self):  # TC-1 (C1)
        with tempfile.TemporaryDirectory() as tmp:
            lib = Path(tmp) / "lib.mockitdown"
            lib.write_text('struct K: View {\n  var body: some View { Text("k") }\n}\nText("demo")', encoding="utf-8")
            (d,) = render(f'import SwiftUI\nimport "{lib}"\nK()').diagnostics
            self.assertEqual((d.code, d.location.line, d.location.source), ("import", 4, str(lib.resolve())))
            page = Path(tmp) / "page.mockitdown"
            (d,) = render('import SwiftUI\nBogus()', source_path=page).diagnostics
            self.assertEqual(d.location.line, 2)

    def test_printed_form(self):  # TC-1 (C2, V1)
        e, w = Severity.ERROR, Severity.WARNING
        self.assertEqual(str(Diagnostic(e, "m", Location(3, 5), "unknown")), "error [unknown] at line 3:5: m")
        self.assertEqual(str(Diagnostic(w, "m", Location(2, 9, "a.mockitdown"), "icon")),
                         "warning [icon] at a.mockitdown:2:9: m")
        self.assertEqual(str(Diagnostic(w, "m", Location(0, 0, "a.mockitdown"), "import")),
                         "warning [import] at a.mockitdown: m")
        self.assertEqual(str(Diagnostic(w, "m", Location(), "chrome")), "warning [chrome] at ?: m")
        self.assertEqual(str(Diagnostic(e, "m", Location(1, 2))), "error at line 1:2: m")
        self.assertRegex(diags('import SwiftUI\nImage(systemName: "xyzzy")')[0],
                         r"^warning \[icon\] at line 2:\d+: unknown icon 'xyzzy'$")
        self.assertRegex(diags('import SwiftUI\nVStack {\n  Bogus()\n}')[0], r"^error \[unknown\] at line 3:\d+: ")

    def test_errors_are_wrong_mockups_and_warnings_approximations(self):  # TC-1 (C3)
        def severity(src):
            (d,) = render(src).diagnostics
            return d.severity

        self.assertIs(severity('import SwiftUI\nBogus()'), Severity.ERROR)  # not what was written
        self.assertIs(severity('import SwiftUI\nText("a"'), Severity.ERROR)
        self.assertIs(severity('import SwiftUI\nText("a").frobnicate()'), Severity.WARNING)  # ignored
        self.assertIs(severity('import SwiftUI\nImage(systemName: "xyzzy")'), Severity.WARNING)  # placeholder
        self.assertIs(severity('@Foo\nimport SwiftUI\nText("a")'), Severity.WARNING)
        self.assertIs(severity('import SwiftUI\nImage("missing.png")'), Severity.WARNING)


class CollectorTests(unittest.TestCase):
    """R-DIAG-002 TC-1."""

    def test_one_collector_nothing_printed(self):  # TC-1 (C1)
        out, err = io.StringIO(), io.StringIO()
        with contextlib.redirect_stdout(out), contextlib.redirect_stderr(err):
            r = render('import SwiftUI\nVStack {\n  Bogus()\n  Text("a").frobnicate()\n  Image("nope.png")\n}')
        self.assertEqual((out.getvalue(), err.getvalue()), ("", ""))
        self.assertEqual([d.code for d in r.diagnostics], ["unknown", "modifier", "asset"])  # evaluate, then render
        screen, collector = evaluate('import SwiftUI\nBogus()')
        self.assertIsNotNone(screen)
        self.assertIsInstance(collector, Diagnostics)

    def test_syntax_error_is_raised(self):  # TC-1 (C1)
        with self.assertRaises(MockitdownSyntaxError) as cm:
            parse('Text("a"')
        self.assertEqual(cm.exception.diagnostic.code, "syntax")
        screen, collector = evaluate('Text("a"')
        self.assertIsNone(screen)
        self.assertEqual([d.code for d in collector.items], ["syntax"])

    def test_order_kept_and_duplicates_dropped(self):  # TC-1 (C2)
        c = Diagnostics()
        c.warning("b", Location(2, 1), "icon")
        c.error("a", Location(1, 1), "unknown")
        c.warning("b", Location(2, 1), "icon")
        c.warning("b", Location(2, 1), "other")  # the code is not part of equality (M-DIAG-1.I1)
        c.error("b", Location(2, 1), "icon")  # another severity
        c.warning("b", Location(3, 1), "icon")  # another location
        c.extend([Diagnostic(Severity.ERROR, "a", Location(1, 1), "unknown")])
        self.assertEqual([(d.severity.value, d.message, d.location.line) for d in c.items],
                         [("warning", "b", 2), ("error", "a", 1), ("error", "b", 2), ("warning", "b", 3)])
        self.assertEqual(len(c), 4)
        self.assertEqual(len(c.errors) + len(c.warnings), 4)

    def test_foreach_reports_once(self):  # TC-1 (C2, V1)
        found = diags('import SwiftUI\nForEach(1...5) { i in\n  Image(systemName: "xyzzy")\n}')
        self.assertEqual(len(found), 1, found)
        self.assertIn("unknown icon 'xyzzy'", found[0])


def _python_codes() -> list[tuple[str, int, object]]:
    """(file, line, code) of every diagnostic the Python sources create, outside the collector itself."""
    out = []
    for path in sorted(SRC.rglob("*.py")):
        if path.name == "diagnostics.py":
            continue
        rel = str(path.relative_to(SRC))
        for node in ast.walk(ast.parse(path.read_text(encoding="utf-8"))):
            if not isinstance(node, ast.Call):
                continue
            f = node.func
            name = f.attr if isinstance(f, ast.Attribute) else getattr(f, "id", None)
            if rel.startswith("syntax/") and name == "error":
                continue  # Parser.error builds the syntax diagnostic, checked through Diagnostic( below
            index = {"error": 2, "warning": 2, "add": 3, "Diagnostic": 3}.get(name)
            if index is None or (name == "add" and len(node.args) < 2):
                continue  # a set's add
            keywords = {k.arg: k.value for k in node.keywords}
            arg = node.args[index] if len(node.args) > index else keywords.get("code")
            out.append((rel, node.lineno, arg.value if isinstance(arg, ast.Constant) else None))
    return out


class CodeTests(unittest.TestCase):
    """R-DIAG-003 TC-1."""

    def test_every_python_diagnostic_has_a_listed_code(self):  # TC-1 (C1, V1)
        found = _python_codes()
        self.assertGreater(len(found), 40)
        bad = [(f, line, code) for f, line, code in found if code not in CODES]
        self.assertEqual(bad, [])
        self.assertIn("syntax", {code for _, _, code in found})  # the lexer's and the parser's

    def test_corpus_diagnostics_have_listed_codes(self):  # TC-1 (C1, V1): both variants match the corpus
        seen = set()
        for path in sorted(CORPUS.glob("*.diag.json")):
            for d in json.loads(path.read_text(encoding="utf-8"))["diagnostics"]:
                self.assertIn(d["code"], CODES, path.name)
                seen.add(d["code"])
        self.assertGreater(len(seen), 5)

    def test_triggers(self):  # TC-1 (C1, V1)
        cases = {
            'Text("a"': "syntax",
            "import SwiftUI\n": "empty",
            '@Foo\nimport SwiftUI\nText("a")': "directive",
            'import Kpi\nText("a")': "pack",
            'import "no/such/file"\nText("a")': "import",
            "import SwiftUI\nBogus()": "unknown",
            'import SwiftUI\nText("a").frobnicate()': "modifier",
            'import SwiftUI\nImage(systemName: "xyzzy")': "icon",
            'import SwiftUI\nImage("missing.png")': "asset",
            'import SwiftUI\nText("a")': None,
        }
        for src, code in cases.items():
            codes = [d.code for d in render(src).diagnostics]
            self.assertEqual(codes, [code] if code else [], src)
        self.assertEqual([d.code for d in render('import SwiftUI\nText("a")', appearance="dim").diagnostics],
                         ["appearance"])

    def test_codes_are_documented_together(self):  # TC-1 (C2)
        # C2 (a new code is a change to the specification) is a process rule: the list above is the
        # clause's, so a new code fails test_every_python_diagnostic_has_a_listed_code until both change.
        self.assertEqual(len(CODES), len(set(CODES)))
        self.assertTrue(all(re.fullmatch(r"[a-z]+", c) for c in CODES))


class ErrorBoxTests(unittest.TestCase):
    """R-DIAG-004 TC-1."""

    SRC = 'import SwiftUI\nVStack {\n  Bogus()\n  Text("a").frobnicate()\n}'

    @staticmethod
    def box(html):
        m = re.match(r'<div class="mkd-error" role="alert"><div class="mkd-error__title">([^<]*)</div><ul>(.*?)</ul></div>',
                     html)
        return (m.group(1), re.findall(r"<li>(.*?)</li>", m.group(2))) if m else None

    def test_box_before_the_figure(self):  # TC-1 (C1, C2, C3, V1)
        r = render(self.SRC)
        title, items = self.box(r.html)
        self.assertEqual(title, "mockitdown: 1 error")
        self.assertEqual(len(items), 1)
        self.assertIn("error [unknown]", items[0])
        self.assertLess(r.html.index("mkd-error"), r.html.index('class="mkd-figure'))

    def test_warnings_with_show_warnings(self):  # TC-1 (C2, C3, V1)
        title, items = self.box(render(self.SRC, show_warnings=True).html)
        self.assertEqual(title, "mockitdown: 1 error")
        self.assertEqual(len(items), 2)
        self.assertIn("warning [modifier]", items[1])
        title, items = self.box(render('import SwiftUI\nText("a").frobnicate()', show_warnings=True).html)
        self.assertEqual((title, len(items)), ("mockitdown: warnings", 1))

    def test_plural_title(self):  # TC-1 (C2)
        title, items = self.box(render('import SwiftUI\nVStack {\n  Bogus()\n  Nope()\n}').html)
        self.assertEqual((title, len(items)), ("mockitdown: 2 errors", 2))

    def test_no_box_without_errors(self):  # TC-1 (C4)
        for src in ('import SwiftUI\nText("a")', 'import SwiftUI\nText("a").frobnicate()'):
            html = render(src).html
            self.assertNotIn("mkd-error", html)
            self.assertTrue(html.startswith('<div class="mkd-figure'))
        self.assertNotIn("mkd-error", render('import SwiftUI\nText("a")', show_warnings=True).html)

    def test_items_are_escaped(self):  # TC-1 (C1)
        _, items = self.box(render('import SwiftUI\nVStack {\n  Bogus("<b>")\n  Text("a").frobnicate()\n}').html)
        self.assertTrue(all("<b>" not in i for i in items))


if __name__ == "__main__":
    unittest.main()
