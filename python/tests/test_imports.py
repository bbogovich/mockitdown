"""Component imports (R-IMP-001, R-IMP-003, R-IMP-006): loading component files, nested imports and
cycles, and module imports that load no file.

Each test names the test case (TC-n) and the clauses it verifies. R-IMP-002.TC-1 (the import map) is
queued with #75 and R-IMP-004.TC-1 (libraries) with #77; R-IMP-005.TC-1 is in test_render.py.
"""

import tempfile
import unittest
from pathlib import Path

from tests.helpers import ROOT  # noqa: F401  (puts src/ on sys.path)
from mockitdown import render


def struct(name, text):
    return f'struct {name}: View {{\n  var body: some View {{ Text("{text}") }}\n}}\n'


class TempDirTest(unittest.TestCase):
    def setUp(self):
        self._tmp = tempfile.TemporaryDirectory()
        self.dir = Path(self._tmp.name).resolve()
        self.page = self.dir / "page.mockitdown"

    def tearDown(self):
        self._tmp.cleanup()

    def write(self, name, text):
        p = self.dir / name
        p.parent.mkdir(parents=True, exist_ok=True)
        p.write_text(text, encoding="utf-8")
        return p

    def render(self, src, **kw):
        return render(src, source_path=self.page, **kw)


class FileImportTests(TempDirTest):
    """R-IMP-001 TC-1."""

    def test_structs_load_before_the_block(self):  # TC-1 (C1)
        self.write("kpi.mockitdown", struct("KPI", "kpi-text"))
        r = self.render('import SwiftUI\nimport "kpi"\nstruct Card: View {\n  var body: some View { KPI() }\n}\nCard()')
        self.assertEqual(r.diagnostics, [])
        self.assertIn("kpi-text", r.html)
        self.assertEqual(r.screen.pack.id, "swiftui")

    def test_only_imports_and_structs_take_effect(self):  # TC-1 (C2, C3, V1)
        self.write("kpi.mockitdown", struct("KPI", "kpi-text") + 'Text("demo")\nText("demo2")\n')
        r = self.render('import SwiftUI\nimport "kpi"\nKPI()')
        self.assertIn("kpi-text", r.html)
        self.assertNotIn("demo", r.html)
        (d,) = r.diagnostics
        self.assertEqual((d.severity.value, d.code, d.message),
                         ("warning", "import", "kpi.mockitdown: top-level views in an imported file are ignored"))
        self.assertEqual((d.location.line, d.location.source), (4, str(self.dir / "kpi.mockitdown")))

    def test_module_imports_in_a_component_file_select_no_pack(self):  # TC-1 (C2)
        self.write("kpi.mockitdown", "import Fluent\n" + struct("KPI", "kpi-text"))
        r = self.render('import SwiftUI\nimport "kpi"\nKPI()')
        self.assertEqual(r.diagnostics, [])
        self.assertEqual(r.screen.pack.id, "swiftui")

    def test_directives_are_ignored(self):  # TC-1 (C4)
        self.write("kpi.mockitdown", '@Screen(device: "tablet", appearance: "dark")\n@Foo\n' + struct("KPI", "k"))
        r = self.render('import SwiftUI\nimport "kpi"\nKPI()')
        self.assertEqual(r.diagnostics, [])
        self.assertIn('data-device="phone"', r.html)
        self.assertIn('data-appearance="light"', r.html)


class NestedImportTests(TempDirTest):
    """R-IMP-003 TC-1."""

    def test_nested_imports_depth_first(self):  # TC-1 (C1)
        self.write("lib/a.mockitdown", 'import "b"\n' + struct("A", "from-a") + struct("Same", "same-a"))
        self.write("lib/b.mockitdown", struct("B", "from-b") + struct("Same", "same-b"))
        r = self.render('import SwiftUI\nimport "lib/a"\nVStack {\n  A()\n  B()\n  Same()\n}')
        self.assertIn("from-a", r.html)
        self.assertIn("from-b", r.html)  # b resolved beside a, not beside the page
        self.assertIn("same-a", r.html)  # b's structs are taken first, a's replace them
        self.assertNotIn("same-b", r.html)
        self.assertEqual([d.message for d in r.diagnostics],
                         ["struct Same from a.mockitdown replaces an earlier definition"])

    def test_cycles_load_once_silently(self):  # TC-1 (C2, V1)
        self.write("a.mockitdown", 'import "b"\n' + struct("A", "from-a"))
        self.write("b.mockitdown", 'import "a"\n' + struct("B", "from-b"))
        r = self.render('import SwiftUI\nimport "a"\nVStack {\n  A()\n  B()\n}')
        self.assertEqual(r.diagnostics, [])
        self.assertIn("from-a", r.html)
        self.assertIn("from-b", r.html)

    def test_each_file_once_per_mockup(self):  # TC-1 (C2)
        self.write("kpi.mockitdown", struct("KPI", "kpi-text") + 'Text("ignored")\n')
        self.write("rows.mockitdown", 'import "kpi"\nimport "./kpi.mockitdown"\n' + struct("Rows", "rows"))
        r = self.render('import SwiftUI\nimport "kpi"\nimport "rows"\nimport "kpi.mockitdown"\nVStack {\n  KPI()\n  Rows()\n}')
        self.assertEqual([d.message for d in r.diagnostics],
                         ["kpi.mockitdown: top-level views in an imported file are ignored"])  # loaded once
        again = self.render('import SwiftUI\nimport "kpi"\nKPI()')  # a new mockup loads it again
        self.assertEqual(len(again.diagnostics), 1)


class ModuleImportTests(TempDirTest):
    """R-IMP-006 TC-1."""

    def test_module_import_loads_no_file(self):  # TC-1 (C1, V1)
        self.write("Charts.mockitdown", struct("FromFile", "x"))
        self.write("Kpi.mockitdown", struct("FromFile", "x"))
        r = self.render('import SwiftUI\nimport Charts\nText("a")')
        self.assertEqual(r.diagnostics, [])
        r = self.render('import SwiftUI\nimport Kpi\nFromFile()')
        self.assertEqual([(d.severity.value, d.code, d.message) for d in r.diagnostics],
                         [("warning", "pack", "import Kpi names no known pack"),
                          ("error", "unknown", r.diagnostics[1].message)])
        self.assertIn("FromFile", r.diagnostics[1].message)

    def test_module_import_selects_a_pack(self):  # TC-1 (C1)
        self.write("Fluent.mockitdown", struct("FromFile", "x"))
        r = self.render('import Fluent\nText("a")')
        self.assertEqual((r.diagnostics, r.screen.pack.id), ([], "fluent"))

    def test_libraries_need_a_quoted_path(self):  # TC-1 (C2)
        self.write("Kpi.mockitdown", struct("KPI", "kpi-text"))
        r = self.render('import SwiftUI\nimport "Kpi"\nKPI()')
        self.assertEqual(r.diagnostics, [])
        self.assertIn("kpi-text", r.html)


if __name__ == "__main__":
    unittest.main()
