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


@unittest.skipUnless(shutil.which("zensical") or os.environ.get("ZENSICAL"), "zensical not installed")
class ZensicalBuildTests(unittest.TestCase):
    def test_site_builds(self):
        exe = os.environ.get("ZENSICAL") or shutil.which("zensical")
        proc = subprocess.run([exe, "build", "--clean"], cwd=SITE, capture_output=True, text=True, timeout=600)
        self.assertEqual(proc.returncode, 0, proc.stdout + proc.stderr)
        self.assertTrue((SITE / "site" / "index.html").exists())


if __name__ == "__main__":
    unittest.main()
