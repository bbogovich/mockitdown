"""The example site is the end-to-end fixture: every page must convert with no mockitdown error,
render one figure per fence, and (when Zensical is installed) build as a site."""

import logging
import os
import re
import shutil
import subprocess
import unittest

from tests.helpers import ROOT

SITE = ROOT / "examples" / "site"
DOCS = SITE / "docs"
FENCE = re.compile(r"^[ \t]*```mockitdown", re.M)

try:
    import markdown
    from pymdownx import superfences

    from mockitdown import fence
except ImportError:  # pragma: no cover
    markdown = None


def convert(path):
    md = markdown.Markdown(extensions=[
        "admonition", "attr_list", "md_in_html", "tables", "pymdownx.details",
        "pymdownx.tabbed",
        "mockitdown",
        "pymdownx.superfences",
    ], extension_configs={
        "mockitdown": {"default_pack": "base", "default_appearance": "auto",
                       "import_paths": [str(DOCS / "mockups")], "asset_paths": [str(DOCS)], "strict": False},
        "pymdownx.tabbed": {"alternate_style": True},
        "pymdownx.superfences": {"custom_fences": [
            {"name": "mockitdown", "class": "mockitdown", "format": fence.format, "validator": fence.validate}]},
    })
    return md.convert(path.read_text(encoding="utf-8"))


class _Capture(logging.Handler):
    def __init__(self):
        super().__init__(logging.WARNING)
        self.records = []

    def emit(self, record):
        self.records.append(record)


@unittest.skipIf(markdown is None, "Markdown / pymdown-extensions not installed")
class ExampleSiteTests(unittest.TestCase):
    def test_every_page_renders_without_errors(self):
        pages = sorted(DOCS.rglob("*.md"))
        self.assertTrue(pages)
        log = logging.getLogger("mkdocs.extensions.mockitdown")
        for page in pages:
            with self.subTest(page=str(page.relative_to(DOCS))):
                cap = _Capture()
                log.addHandler(cap)
                try:
                    out = convert(page)
                finally:
                    log.removeHandler(cap)
                errors = [r.getMessage() for r in cap.records if r.levelno >= logging.ERROR]
                self.assertEqual(errors, [])
                warnings = [r.getMessage() for r in cap.records if r.levelno == logging.WARNING]
                self.assertEqual(warnings, [], "warnings are not allowed in the examples")
                fences = len(FENCE.findall(page.read_text(encoding="utf-8")))
                self.assertEqual(out.count('class="mkd-figure '), fences)
                if fences:
                    self.assertIn("<style data-mockitdown=", out)


@unittest.skipIf(markdown is None, "Markdown / pymdown-extensions not installed")
class CssInjectionTests(unittest.TestCase):
    def _md(self):
        return markdown.Markdown(extensions=["mockitdown", "pymdownx.superfences"], extension_configs={
            "pymdownx.superfences": {"custom_fences": [
                {"name": "mockitdown", "class": "mockitdown", "format": fence.format, "validator": fence.validate}]}})

    def test_style_once_even_with_extra_converts_without_reset(self):
        md = self._md()
        page = '# T\n\n```mockitdown\nText("a")\n```\n\n```mockitdown\nText("b")\n```\n'
        out = md.convert(page)
        self.assertEqual(out.count("<style data-mockitdown"), 1)
        self.assertNotIn("<style", md.convert("## heading only"))  # e.g. a host's nested heading convert

    def test_nested_convert_does_not_steal_the_stylesheet(self):
        md = self._md()
        session = md.mockitdown
        session.used = ["base"]  # fences already ran for the page …
        self.assertNotIn("<style", md.convert("heading"))  # … a nested convert without figures
        self.assertEqual(session.used, ["base"])


class ReferencePagesTests(unittest.TestCase):
    """The Reference section is generated from the packs and must be committed up to date (R-PACK-012)."""

    def test_reference_pages_are_current(self):
        import sys
        res = subprocess.run([sys.executable, str(ROOT / "tools" / "gen_reference.py"), "--check"],
                             capture_output=True, text=True)
        self.assertEqual(res.returncode, 0,
                         res.stdout + res.stderr + "\nrun: python tools/gen_reference.py")

    def test_hidden_packs_have_egg_pages_only(self):  # R-PACK-010 TC-1 step 3 (C2, C3)
        mkdocs = (SITE / "mkdocs.yml").read_text(encoding="utf-8")
        nav = mkdocs[mkdocs.index("\nnav:"):]
        for pid in ("hologram", "lcars", "phosphor"):
            with self.subTest(pack=pid):
                self.assertFalse((SITE / "docs" / "reference" / f"{pid}.md").exists())
                self.assertTrue((SITE / "docs" / "eggs" / f"{pid}.md").is_file())
                self.assertNotIn(f"reference/{pid}.md", nav)
                self.assertNotIn(f"eggs/{pid}.md", nav)


@unittest.skipUnless(shutil.which("zensical") or os.environ.get("ZENSICAL"), "zensical not installed")
class ZensicalBuildTests(unittest.TestCase):
    def test_site_builds(self):
        exe = os.environ.get("ZENSICAL") or shutil.which("zensical")
        shutil.rmtree(SITE / ".cache", ignore_errors=True)
        proc = subprocess.run([exe, "build", "--clean"], cwd=SITE, capture_output=True, text=True, timeout=600)
        self.assertEqual(proc.returncode, 0, proc.stdout + proc.stderr)
        tour = (SITE / "site" / "tour" / "index.html").read_text(encoding="utf-8")
        self.assertIn("<title>Language tour", tour)  # no CSS leaked into titles / heading ids
        self.assertEqual(tour.count("<style data-mockitdown"), 1)
        self.assertIn("calc(16 * var(--u))", tour)


if __name__ == "__main__":
    unittest.main()
