"""The command line (R-CLI-001 to R-CLI-006): commands, exit codes, rendering options, render, check,
css, packs and elements.

Each test names the test case (TC-n) and the clauses it verifies. R-CLI-002.TC-1 (the import-map
flags) is queued with #75.
"""

import contextlib
import io
import json
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path
from unittest import mock

from tests.helpers import ROOT  # noqa: F401  (puts src/ on sys.path)
import mockitdown
from mockitdown import cli, render
from mockitdown.packs import registry

GOOD = 'import SwiftUI\nText("Hello")'
BAD = 'import SwiftUI\nVStack {\n  Bogus()\n}'
WARN = 'import SwiftUI\nImage(systemName: "xyzzy")'


def run(argv, stdin=""):
    """``cli.main(argv)`` with captured streams: (exit code, stdout, stderr). argparse exits are caught."""
    out, err = io.StringIO(), io.StringIO()
    with contextlib.redirect_stdout(out), contextlib.redirect_stderr(err), \
            mock.patch.object(sys, "stdin", io.StringIO(stdin)):
        try:
            code = cli.main(argv)
        except SystemExit as e:
            code = e.code
    return code, out.getvalue(), err.getvalue()


class TempDirTest(unittest.TestCase):
    def setUp(self):
        self._tmp = tempfile.TemporaryDirectory()
        self.dir = Path(self._tmp.name)

    def tearDown(self):
        self._tmp.cleanup()

    def write(self, name, text):
        p = self.dir / name
        p.parent.mkdir(parents=True, exist_ok=True)
        p.write_text(text, encoding="utf-8")
        return p

    def site_pack(self, elements=None, css=""):
        d = self.dir / "packs" / "acme"
        d.mkdir(parents=True)
        (d / "pack.json").write_text(json.dumps({"id": "acme", "name": "Acme", "parent": "base",
                                                 "modules": ["Acme"], "elements": elements or {}}),
                                     encoding="utf-8")
        (d / "pack.css").write_text(css, encoding="utf-8")
        return self.dir / "packs"


class CommandTests(TempDirTest):
    """R-CLI-001 TC-1."""

    def test_subcommands_and_version(self):  # TC-1 (C1, V1)
        code, out, _ = run(["--version"])
        self.assertEqual((code, out.strip()), (0, f"mockitdown {mockitdown.__version__}"))
        code, out, _ = run(["--help"])
        self.assertEqual(code, 0)
        for name in ("render", "check", "css", "packs", "elements"):
            self.assertIn(name, out)
        self.assertEqual(run(["nope"])[0], 2)

    def test_installed_console_script(self):  # TC-1 (C1, V1)
        script = Path(sys.executable).parent / "mockitdown"
        if not script.exists():
            self.skipTest("the package is not installed in this interpreter's environment")
        p = subprocess.run([str(script), "--version"], capture_output=True, text=True, timeout=60)
        self.assertEqual((p.returncode, p.stdout.strip()), (0, f"mockitdown {mockitdown.__version__}"))
        p = subprocess.run([str(script), "render"], capture_output=True, text=True, timeout=60)
        self.assertEqual(p.returncode, 2)

    def test_dash_reads_standard_input(self):  # TC-1 (C2)
        code, out, _ = run(["render", "-"], stdin=GOOD)
        self.assertEqual(code, 0)
        self.assertIn("Hello", out)
        code, out, _ = run(["check", "-"], stdin=GOOD)
        self.assertEqual((code, out.strip().splitlines()[-1]), (0, "-: ok (0 errors, 0 warnings)"))

    def test_exit_codes(self):  # TC-1 (C3, V1)
        good, bad = self.write("good.mockitdown", GOOD), self.write("bad.mockitdown", BAD)
        self.assertEqual(run(["render", str(good)])[0], 0)
        self.assertEqual(run(["render", str(bad)])[0], 1)
        self.assertEqual(run(["check", str(bad)])[0], 1)
        code, out, err = run(["render", str(self.dir / "missing.mockitdown")])
        self.assertEqual((code, out), (1, ""))
        self.assertTrue(err.startswith("mockitdown: "), err)
        code, _, err = run(["elements", "no-such-pack"])
        self.assertEqual(code, 1)
        self.assertTrue(err.startswith("mockitdown: "), err)
        self.assertEqual(run(["render"])[0], 2)
        self.assertEqual(run(["render", str(good), "--width", "wide"])[0], 2)
        self.assertEqual(run(["check"])[0], 2)


class RenderingOptionTests(TempDirTest):
    """R-CLI-002 TC-2 (the import-map flags are TC-1, queued with #75)."""

    def capture(self, argv, stdin=""):
        seen = []

        def fake(src, opts):
            seen.append(opts)
            return render(src, opts)

        with mock.patch.object(cli, "render", side_effect=fake):
            code = run(argv, stdin)[0]
        return code, seen

    def test_check_takes_the_same_options_as_render(self):  # TC-2 (C1)
        f = self.write("m.mockitdown", GOOD)
        flags = ["--pack", "fluent", "--default-pack", "mui", "--device", "phone", "--appearance", "dark",
                 "--width", "300", "--height", "500", "--chrome", "none", "--title", "T", "--windowed",
                 "--menubar", "File", "--app", "Mail", "--elements", "-A", str(self.dir), "-P", str(self.dir),
                 "--no-embed"]
        _, (r,) = self.capture(["render", str(f), *flags])
        _, (c,) = self.capture(["check", str(f), *flags])
        self.assertEqual(r, c)
        self.assertEqual((c.pack, c.default_pack, c.device, c.appearance, c.width, c.height, c.chrome, c.title),
                         ("fluent", "mui", "phone", "dark", 300, 500, "none", "T"))
        self.assertEqual((c.windowed, c.menubar, c.app, c.elements, c.embed_assets),
                         (True, "File", "Mail", True, False))

    def test_defaults_without_flags(self):  # TC-2 (C1)
        f = self.write("m.mockitdown", GOOD)
        _, (o,) = self.capture(["render", str(f)])
        self.assertEqual((o.pack, o.default_pack, o.device, o.appearance, o.chrome, o.windowed, o.menubar),
                         (None, "base", None, None, "auto", None, None))
        self.assertEqual((o.elements, o.embed_assets, o.asset_paths, o.pack_paths), (False, True, (), ()))
        _, (o,) = self.capture(["render", str(f), "--menubar"])
        self.assertEqual(o.menubar, "true")  # the bar with no menu drawn open
        self.assertEqual(run(["render", str(f), "--appearance", "dim"])[0], 2)

    def test_repeatable_paths_keep_their_order(self):  # TC-2 (C1)
        f = self.write("m.mockitdown", GOOD)
        a, b = self.dir / "a", self.dir / "b"
        _, (o,) = self.capture(["render", str(f), "-A", str(a), "--asset-path", str(b),
                                "-P", str(b), "--pack-path", str(a)])
        self.assertEqual((o.asset_paths, o.pack_paths), ((a, b), (b, a)))

    def test_source_path_from_the_file(self):  # TC-2 (C2)
        f = self.write("screens/a.mockitdown", 'import SwiftUI\nimport "kpi"\nImage("logo.png")\nKPI()')
        self.write("screens/kpi.mockitdown", 'struct KPI: View {\n  var body: some View { Text("kpi-beside") }\n}')
        self.write("screens/logo.png", "png")
        _, (o,) = self.capture(["render", str(self.dir / "screens" / ".." / "screens" / "a.mockitdown")])
        self.assertEqual(o.source_path, f.resolve())
        code, out, err = run(["render", str(f), "--no-embed"])
        self.assertEqual(code, 0, err)
        self.assertIn("kpi-beside", out)
        self.assertIn("logo.png", out)
        self.assertNotIn("[asset]", err)
        _, (o,) = self.capture(["render", "-"], stdin=GOOD)
        self.assertIsNone(o.source_path)


class RenderCommandTests(TempDirTest):
    """R-CLI-003 TC-1."""

    def test_fragment_to_stdout_or_file_and_diagnostics_to_stderr(self):  # TC-1 (C1)
        f = self.write("a.mockitdown", WARN)
        code, out, err = run(["render", str(f)])
        self.assertEqual(code, 0)
        self.assertTrue(out.startswith('<div class="mkd-figure'), out[:80])
        self.assertNotIn("<html", out)
        self.assertNotIn("warning [icon]", out)
        self.assertIn("warning [icon]", err)
        target = self.dir / "a.html"
        code, out, err = run(["render", str(f), "-o", str(target)])
        self.assertEqual((code, out), (0, ""))
        self.assertTrue(target.read_text(encoding="utf-8").startswith('<div class="mkd-figure'))
        self.assertIn("warning [icon]", err)

    def test_standalone_page(self):  # TC-1 (C2, V1)
        f = self.write("a.mockitdown", 'import Fluent\nText("Hello")')
        target = self.dir / "a.html"
        self.assertEqual(run(["render", str(f), "--standalone", "-o", str(target)])[0], 0)
        page = target.read_text(encoding="utf-8")
        self.assertTrue(page.startswith("<!doctype html>"))
        self.assertIn('<meta charset="utf-8">', page)
        self.assertIn('<meta name="viewport" content="width=device-width,initial-scale=1">', page)
        self.assertIn("<title>a</title>", page)
        self.assertIn("background:#f3f4f6", page)
        self.assertIn("@media (prefers-color-scheme:dark)", page)
        self.assertIn(".mkd-pack-fluent", page)
        self.assertIn(".mkd-figure", page)  # base and page.css are inlined
        self.assertNotIn("<link", page)  # nothing to fetch: the page opens offline
        self.assertNotIn(".mkd-pack-mui", page)
        _, out, _ = run(["render", "-", "--standalone", "--title", "A <b>"], stdin=GOOD)
        self.assertIn("<title>A &lt;b&gt;</title>", out)
        _, out, _ = run(["render", "-", "--standalone"], stdin=GOOD)
        self.assertIn("<title>mockitdown</title>", out)

    def test_standalone_without_packs_uses_base(self):  # TC-1 (C2)
        code, out, _ = run(["render", "-", "--standalone"], stdin='Text("x"')
        self.assertEqual(code, 1)
        self.assertIn('class="mkd-error"', out)
        self.assertIn(".mkd-pack-base", out)
        self.assertNotIn(".mkd-pack-swiftui", out)

    def test_errors_exit_1_after_writing(self):  # TC-1 (C3)
        f = self.write("bad.mockitdown", BAD)
        target = self.dir / "bad.html"
        code, _, err = run(["render", str(f), "-o", str(target)])
        self.assertEqual(code, 1)
        self.assertIn('class="mkd-error"', target.read_text(encoding="utf-8"))
        self.assertIn("error [unknown]", err)


class CheckCommandTests(TempDirTest):
    """R-CLI-004 TC-1."""

    def test_summary_lines(self):  # TC-1 (C1, C3, V1)
        good, bad, warn = (self.write(n, s) for n, s in
                           (("good.mockitdown", GOOD), ("bad.mockitdown", BAD), ("warn.mockitdown", WARN)))
        code, out, err = run(["check", str(good), str(bad), str(warn)])
        self.assertEqual((code, err), (1, ""))
        lines = out.strip().splitlines()
        self.assertIn(f"{good}: ok (0 errors, 0 warnings)", lines)
        self.assertIn(f"{bad}: FAILED (1 errors, 0 warnings)", lines)
        self.assertIn(f"{warn}: ok (0 errors, 1 warnings)", lines)  # the icon is found while rendering
        self.assertTrue(any(line.startswith(f"error [unknown] at {bad.resolve()}:3:") for line in lines), lines)
        self.assertEqual(run(["check", str(good), str(warn)])[0], 0)

    def test_json_report(self):  # TC-1 (C2, C3, V1)
        good, bad = self.write("good.mockitdown", GOOD), self.write("bad.mockitdown", BAD)
        code, out, _ = run(["check", str(good), str(bad), "--json"])
        self.assertEqual(code, 1)
        report = json.loads(out)
        self.assertEqual([(r["file"], r["ok"]) for r in report], [(str(good), True), (str(bad), False)])
        self.assertEqual(report[0]["diagnostics"], [])
        (d,) = report[1]["diagnostics"]
        self.assertEqual(set(d), {"severity", "code", "message", "line", "col", "source"})
        self.assertEqual((d["severity"], d["code"], d["line"], d["col"]), ("error", "unknown", 3, 8))
        self.assertEqual(d["source"], str(bad.resolve()))


class CssCommandTests(TempDirTest):
    """R-CLI-005 TC-1."""

    def test_selected_or_all_packs(self):  # TC-1 (C1, V1)
        _, one, _ = run(["css", "--pack", "fluent"])
        self.assertIn(".mkd-pack-fluent", one)
        self.assertIn(".mkd-pack-base", one)
        self.assertNotIn(".mkd-pack-mui", one)
        _, two, _ = run(["css", "--pack", "fluent", "--pack", "mui"])
        self.assertIn(".mkd-pack-mui", two)
        _, every, _ = run(["css"])
        for pid in registry(()).ids():
            self.assertIn(f".mkd-pack-{pid}", every, pid)
        _, site, _ = run(["css", "-P", str(self.site_pack(css=".mkd-pack-acme .mkd-text { color: rebeccapurple; }\n"))])
        self.assertIn(".mkd-pack-acme", site)
        self.assertIn("rebeccapurple", site)

    def test_minified_unless_pretty(self):  # TC-1 (C2)
        _, small, _ = run(["css", "--pack", "fluent"])
        _, pretty, _ = run(["css", "--pack", "fluent", "--pretty"])
        self.assertLess(len(small), len(pretty))
        self.assertIn("/*", pretty)
        self.assertNotIn("/*", small)

    def test_output_creates_parent_directories(self):  # TC-1 (C3, V1)
        target = self.dir / "docs" / "assets" / "mockitdown.css"
        code, out, _ = run(["css", "--pack", "fluent", "-o", str(target)])
        self.assertEqual((code, out), (0, ""))
        self.assertIn(".mkd-pack-fluent", target.read_text(encoding="utf-8"))


ACME_ELEMENTS = {"Widget": {"role": "button", "params": ["label"], "doc": "a | b"}}


class PacksAndElementsTests(TempDirTest):
    """R-CLI-006 TC-1."""

    def test_packs_text_and_json(self):  # TC-1 (C1, C4)
        reg = registry(())
        listed = [pid for pid in reg.ids() if not reg.get(pid).hidden]
        _, out, _ = run(["packs"])
        lines = out.strip().splitlines()
        self.assertEqual([line.split()[0] for line in lines], listed)
        fluent = reg.get("fluent")
        (row,) = [line for line in lines if line.startswith("fluent ")]
        self.assertIn(fluent.name, row)
        self.assertIn(f"{len(fluent.elements)} elements", row)
        self.assertTrue(row.endswith("import " + ", ".join(fluent.modules)), row)
        _, out, _ = run(["packs", "--json"])
        rows = json.loads(out)
        self.assertEqual([r["id"] for r in rows], listed)
        (r,) = [r for r in rows if r["id"] == "fluent"]
        self.assertEqual(set(r), {"id", "name", "framework", "version", "modules", "device", "elements",
                                  "own_elements"})
        self.assertEqual((r["elements"], r["modules"], r["own_elements"]),
                         (len(fluent.elements), list(fluent.modules), list(fluent.own_elements)))
        _, out, _ = run(["packs", "--json", "-P", str(self.site_pack(ACME_ELEMENTS))])
        self.assertIn("acme", [r["id"] for r in json.loads(out)])

    def test_hidden_packs_only_with_all(self):  # TC-1 (C1; R-PACK-010.C1)
        reg = registry(())
        hidden = [pid for pid in reg.ids() if reg.get(pid).hidden]
        self.assertTrue(hidden)
        _, out, _ = run(["packs", "--json"])
        self.assertFalse(set(hidden) & {r["id"] for r in json.loads(out)})
        _, out, _ = run(["packs", "--json", "--all"])
        self.assertEqual([r["id"] for r in json.loads(out)], reg.ids())

    def test_elements_sorted_with_role_and_parameters(self):  # TC-1 (C2, C5)
        pack = registry(()).get("fluent")
        _, out, _ = run(["elements", "fluent"])
        lines = out.strip().splitlines()
        self.assertEqual([line.split()[0] for line in lines], sorted(pack.elements))
        e = pack.elements["Button"]
        (row,) = [line for line in lines if line.split()[0] == "Button"]
        self.assertEqual(row.split()[1], e.role)
        self.assertTrue(row.rstrip().endswith(", ".join(e.params)), row)
        _, out, _ = run(["elements", "fluent", "--own"])
        self.assertEqual([line.split()[0] for line in out.strip().splitlines()], sorted(pack.own_elements))

    def test_markdown_table(self):  # TC-1 (C3, V1)
        _, out, _ = run(["elements", "fluent", "--markdown"])
        lines = out.strip().splitlines()
        self.assertEqual(lines[:2], ["| Element | Role | Arguments | Defaults | Notes |", "|---|---|---|---|---|"])
        (info,) = [line for line in lines if line.startswith("| `InfoBar`")]
        self.assertEqual(info.split(" | ")[1], "alert")
        self.assertTrue(any(line.startswith("| `VStack` *(core)* |") for line in lines))
        _, out, _ = run(["elements", "base", "--markdown"])
        self.assertNotIn("*(core)*", out)

    def test_site_packs_in_elements(self):  # TC-1 (C3, C4)
        packs = str(self.site_pack(ACME_ELEMENTS))
        _, out, _ = run(["elements", "acme", "--own", "-P", packs])
        self.assertEqual(out.split(), ["Widget", "button", "label"])
        _, out, _ = run(["elements", "acme", "--own", "--markdown", "-P", packs])
        self.assertIn("| `Widget` | button | label |  | a / b |", out)


if __name__ == "__main__":
    unittest.main()
