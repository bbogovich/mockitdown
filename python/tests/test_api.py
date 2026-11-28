"""The library API (R-API-001 to R-API-004): render, check, evaluate, stylesheet, render options,
the exports and the package's dependencies and data.

Each test names the test case (TC-n) and the clauses it verifies.
"""

import ast
import contextlib
import dataclasses
import io
import sys
import tempfile
import tomllib
import unittest
from pathlib import Path
from unittest import mock

from tests.helpers import ROOT
import mockitdown
from mockitdown import RenderOptions, check, evaluate, render, stylesheet
from mockitdown import cli, fence
from mockitdown.api import RenderResult
from mockitdown.options import FENCE_OPTIONS
from mockitdown.packs import registry

PYPROJECT = tomllib.loads((ROOT / "pyproject.toml").read_text(encoding="utf-8"))
SRC = ROOT / "src" / "mockitdown"
REPO = ROOT.parent

HELLO = 'import SwiftUI\nText("Hello")'


class RenderTests(unittest.TestCase):
    """R-API-001 TC-1."""

    def test_render_result_fields(self):  # TC-1 (C1, V1)
        r = render(HELLO, device="phone")
        self.assertIsInstance(r, RenderResult)
        self.assertTrue(r.ok)
        self.assertEqual(r.packs, ["base", "swiftui"])
        self.assertIn('class="mkd-figure mkd-pack-swiftui"', r.html)
        self.assertIn('data-device="phone"', r.html)
        self.assertNotIn("<style", r.html)  # the fragment carries no CSS
        self.assertIsNotNone(r.screen)
        self.assertEqual(r.screen.pack.id, "swiftui")
        self.assertIsInstance(r.diagnostics, list)

    def test_nothing_rendered_has_no_packs_and_no_screen(self):  # TC-1 (C1)
        r = render('Text("x"')
        self.assertEqual(r.packs, [])
        self.assertIsNone(r.screen)

    def test_overrides_replace_options_unless_none_and_unknown_are_ignored(self):  # TC-1 (C2)
        r = render(HELLO, RenderOptions(pack="fluent", device="tablet"), device="phone", pack=None, nope=1)
        self.assertTrue(r.ok, r.diagnostics)
        self.assertEqual(r.screen.pack.id, "fluent")
        self.assertIn('data-device="phone"', r.html)

    def test_errors_and_ok(self):  # TC-1 (C3)
        r = render('Bogus()\nIcon("xyzzy")')
        self.assertFalse(r.ok)
        self.assertEqual([d.severity.value for d in r.errors], ["error"])
        self.assertTrue(all(d in r.diagnostics for d in r.errors))
        self.assertGreater(len(r.diagnostics), len(r.errors))  # the icon warning is not an error
        self.assertTrue(render('Icon("xyzzy")').ok)

    def test_html_is_error_box_then_figure_then_source(self):  # TC-1 (C4)
        r = render("Bogus()", source=True)
        self.assertTrue(r.html.startswith('<div class="mkd-error" role="alert">'))
        box, figure, source = (r.html.index(s) for s in ('class="mkd-error"', 'class="mkd-figure', 'class="mkd-source"'))
        self.assertLess(box, figure)
        self.assertLess(figure, source)
        self.assertTrue(r.html.endswith("</details>"))

    def test_warnings_shown_only_with_show_warnings(self):  # TC-1 (C4)
        self.assertTrue(render('Icon("xyzzy")').html.startswith('<div class="mkd-figure'))
        shown = render('Icon("xyzzy")', show_warnings=True).html
        self.assertTrue(shown.startswith('<div class="mkd-error"'))
        self.assertIn("mockitdown: warnings", shown)
        self.assertIn('class="mkd-figure', shown)

    def test_syntax_error_is_the_error_box_only(self):  # TC-1 (C4)
        r = render('VStack { Text("x"', source=True)
        self.assertTrue(r.html.startswith('<div class="mkd-error"'))
        self.assertNotIn("mkd-figure", r.html)
        self.assertNotIn("mkd-source", r.html)


class CheckEvaluateStylesheetTests(unittest.TestCase):
    """R-API-002 TC-1."""

    def test_check_returns_every_diagnostic_of_a_render(self):  # TC-1 (C1)
        src = 'Bogus()\nIcon("xyzzy")\nImage("javascript:x")'
        found = check(src)
        self.assertEqual([str(d) for d in found], [str(d) for d in render(src).diagnostics])
        self.assertLessEqual({"icon", "asset"}, {d.code for d in found})  # found while rendering
        self.assertEqual([str(d) for d in check(HELLO, pack="nope")],
                         [str(d) for d in render(HELLO, pack="nope").diagnostics])

    def test_evaluate_returns_screen_and_collector_without_rendering(self):  # TC-1 (C2)
        screen, diags = evaluate('import SwiftUI\nIcon("xyzzy")')
        self.assertEqual(screen.pack.id, "swiftui")
        self.assertEqual(len(screen.views), 1)
        self.assertEqual([d.code for d in diags.items], [])  # the icon is only looked up when rendering
        screen, diags = evaluate('Text("x"')
        self.assertIsNone(screen)
        self.assertEqual([d.severity.value for d in diags.items], ["error"])

    def test_stylesheet_for_given_packs_and_lineage(self):  # TC-1 (C3)
        css = stylesheet(["fluent"])
        self.assertIn(".mkd-pack-fluent .mkd-frame", css)
        self.assertIn(".mkd-pack-base .mkd-frame", css)
        self.assertNotIn(".mkd-pack-mui ", css)
        self.assertIn(".mkd-figure", css)  # page.css

    def test_stylesheet_for_every_pack_when_none(self):  # TC-1 (C3)
        css = stylesheet()
        for pid in registry(()).ids():
            self.assertIn(f".mkd-pack-{pid} .mkd-frame", css, pid)

    def test_stylesheet_minify_and_pack_paths(self):  # TC-1 (C3)
        self.assertNotIn("/*", stylesheet(["base"]))
        self.assertIn("/* mockitdown pack: base */", stylesheet(["base"], minify=False))
        with tempfile.TemporaryDirectory() as d:
            p = Path(d) / "site-pack"
            p.mkdir()
            (p / "pack.json").write_text('{"id": "site-pack", "name": "Site", "extends": "base",'
                                         ' "tokens": {"light": {"bg": "#123456"}}}', encoding="utf-8")
            (p / "pack.css").write_text(".mkd-pack-site-pack .mkd-button { border-width: 3px; }", encoding="utf-8")
            css = stylesheet(["site-pack"], pack_paths=(Path(d),))
            self.assertIn("--mkd-bg:#123456", css)
            self.assertIn(".mkd-pack-site-pack .mkd-button{border-width: calc(3 * var(--u))}", css)

    def test_package_exports(self):  # TC-1 (C4)
        names = {"render", "check", "evaluate", "stylesheet", "RenderOptions", "RenderResult", "Diagnostic",
                 "Severity", "MockitdownError", "MockitdownSyntaxError", "makeExtension", "__version__"}
        self.assertEqual(set(mockitdown.__all__), names)
        for n in names:
            self.assertTrue(hasattr(mockitdown, n), n)
        self.assertTrue(issubclass(mockitdown.MockitdownSyntaxError, mockitdown.MockitdownError))

    def test_self_contained_fragment(self):  # TC-1 (V1)
        r = render(HELLO)
        page = f"<style>{stylesheet(r.packs)}</style>{r.html}"
        self.assertIn(".mkd-pack-swiftui .mkd-frame", page)
        self.assertIn('class="mkd-figure mkd-pack-swiftui"', page)


#: M-OPT-1's fields and defaults. A field a later issue adds is listed in PENDING with that issue,
#: which removes the entry when it builds the field.
M_OPT_1 = {
    "pack": None, "default_pack": "base", "device": None, "appearance": None, "default_appearance": "light",
    "width": None, "height": None, "chrome": "auto", "title": None, "id": None, "caption": True,
    "elements": False, "source": False, "url": None, "imports": {}, "asset_paths": (), "pack_paths": (),
    "embed_assets": True, "max_embed_bytes": 2_000_000, "source_path": None, "show_warnings": False,
    "edit": False, "libraries": {}, "default_device": None, "window": None, "windowed": None,
    "menubar": None, "app": None,
}
PENDING = {"imports": "#75 (R-IMP-002)", "edit": "#23 (R-EDIT-004)", "libraries": "#78 (R-IMP-008)"}
#: Built fields that a pending issue retires: import_paths gives way to imports in #75.
RETIRING = {"import_paths"}


class RenderOptionsTests(unittest.TestCase):
    """R-API-003 TC-1."""

    def test_fields_and_defaults_of_m_opt_1(self):  # TC-1 (C1)
        fields = {f.name: f.default for f in dataclasses.fields(RenderOptions)}
        for name, default in M_OPT_1.items():
            if name in PENDING:
                continue
            self.assertIn(name, fields)
            self.assertEqual(fields[name], default, name)
        self.assertEqual(set(fields) - set(M_OPT_1) - RETIRING, set())

    def test_immutable_and_copied_with_overrides(self):  # TC-1 (C1, V1)
        o = RenderOptions(pack="fluent")
        with self.assertRaises(dataclasses.FrozenInstanceError):
            o.pack = "mui"  # type: ignore[misc]
        p = o.with_overrides(device="phone", nope=1)
        self.assertIsNot(p, o)
        self.assertEqual((p.pack, p.device), ("fluent", "phone"))
        self.assertIsNone(o.device)

    def test_every_fence_attribute_is_a_render_option(self):  # TC-1 (C2)
        fields = {f.name for f in dataclasses.fields(RenderOptions)}
        self.assertEqual(set(FENCE_OPTIONS) - fields, set())
        seen = {}

        def fake(src, opts):
            seen["o"] = opts
            return render(src, opts)

        with mock.patch.object(fence, "render", side_effect=fake):
            fence.format(HELLO, "mockitdown", "mockitdown", {
                "pack": "fluent", "device": "phone", "appearance": "dark", "width": "300", "height": "500",
                "chrome": "none", "title": "T", "id": "M-1", "caption": "false", "elements": "true",
                "url": "u", "source": "true", "window": "dialog", "windowed": "false", "menubar": "File",
                "app": "Mail"}, None)
        o = seen["o"]
        self.assertEqual((o.pack, o.device, o.appearance, o.width, o.height, o.chrome, o.title, o.id),
                         ("fluent", "phone", "dark", 300, 500, "none", "T", "M-1"))
        self.assertEqual((o.caption, o.elements, o.url, o.source, o.window, o.windowed, o.menubar, o.app),
                         (False, True, "u", True, "dialog", False, "File", "Mail"))

    def test_every_cli_rendering_option_is_a_render_option(self):  # TC-1 (C2)
        seen = {}

        def fake(src, opts):
            seen["o"] = opts
            return render(src, opts)

        with tempfile.TemporaryDirectory() as d:
            f = Path(d) / "m.mockitdown"
            f.write_text(HELLO, encoding="utf-8")
            argv = ["render", str(f), "--pack", "fluent", "--default-pack", "mui", "--device", "phone",
                    "--appearance", "dark", "--width", "300", "--height", "500", "--chrome", "none",
                    "--title", "T", "--windowed", "--menubar", "File", "--app", "Mail", "--elements",
                    "-A", d, "-P", d, "--no-embed"]
            with mock.patch.object(cli, "render", side_effect=fake), contextlib.redirect_stdout(io.StringIO()), \
                    contextlib.redirect_stderr(io.StringIO()):
                cli.main(argv)
        o = seen["o"]
        self.assertEqual((o.pack, o.default_pack, o.device, o.appearance, o.width, o.height, o.chrome, o.title),
                         ("fluent", "mui", "phone", "dark", 300, 500, "none", "T"))
        self.assertEqual((o.windowed, o.menubar, o.app, o.elements, o.embed_assets),
                         (True, "File", "Mail", True, False))
        self.assertEqual((o.asset_paths, o.pack_paths, o.source_path), ((Path(d),), (Path(d),), f.resolve()))


def _imports(path: Path) -> set[str]:
    tree = ast.parse(path.read_text(encoding="utf-8"))
    out = set()
    for node in ast.walk(tree):
        if isinstance(node, ast.Import):
            out.update(a.name.split(".")[0] for a in node.names)
        elif isinstance(node, ast.ImportFrom) and node.level == 0 and node.module:
            out.add(node.module.split(".")[0])
    return out


class DependencyAndPlatformTests(unittest.TestCase):
    """R-API-004 TC-1."""

    def test_core_has_no_runtime_dependencies(self):  # TC-1 (C1, V1)
        self.assertEqual(PYPROJECT["project"]["dependencies"], [])
        markdown_only = {SRC / "extension.py", SRC / "fence.py"}
        for path in sorted(SRC.rglob("*.py")):
            if path in markdown_only:
                continue
            outside = {m for m in _imports(path) if m not in sys.stdlib_module_names and m != "mockitdown"}
            self.assertEqual(outside, set(), path.relative_to(SRC))

    def test_markdown_integration_is_an_extra(self):  # TC-1 (C2, V1)
        extras = PYPROJECT["project"]["optional-dependencies"]
        self.assertEqual(extras, {"markdown": ["Markdown>=3.6,<4", "pymdown-extensions>=10,<14"]})
        for name in ("extension.py", "fence.py"):
            self.assertLessEqual(_imports(SRC / name) - set(sys.stdlib_module_names) - {"mockitdown"},
                                 {"markdown", "pymdownx"}, name)

    def test_python_version(self):  # TC-1 (C3)
        self.assertEqual(PYPROJECT["project"]["requires-python"], ">=3.11")
        self.assertIn("Programming Language :: Python :: 3.11", PYPROJECT["project"]["classifiers"])

    def test_package_data_and_console_script(self):  # TC-1 (C4)
        data = PYPROJECT["tool"]["setuptools"]["package-data"]["mockitdown"]
        for pattern in ("page.css", "packs/*/pack.json", "packs/*/pack.css"):
            self.assertIn(pattern, data)
        self.assertEqual(PYPROJECT["project"]["scripts"], {"mockitdown": "mockitdown.cli:main"})
        self.assertTrue((SRC / "page.css").is_file())
        for pack in sorted((REPO / "shared" / "packs").iterdir()):
            if pack.name.startswith("_") or not (pack / "pack.json").is_file():
                continue
            for f in ("pack.json", "pack.css"):
                self.assertTrue((SRC / "packs" / pack.name / f).is_file(), f"{pack.name}/{f}")

    def test_mit_licence(self):  # TC-1 (C5)
        self.assertEqual(PYPROJECT["project"]["license"], "MIT")
        for licence in (ROOT / "LICENSE", REPO / "LICENSE"):
            self.assertTrue(licence.read_text(encoding="utf-8").startswith("MIT License"), licence)


if __name__ == "__main__":
    unittest.main()
