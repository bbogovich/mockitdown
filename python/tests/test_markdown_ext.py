"""The Markdown extension and the superfences fence (R-MDX-001, R-MDX-002, R-MDX-003, R-MDX-004,
R-MDX-005, R-MDX-006).

Each test names the test case (TC-n) and the clauses it verifies. R-MDX-002.TC-1 (the import map) and
R-MDX-003.TC-1 (the library attribute) belong to the issues that build those options (#75, #78).
"""

import importlib
import io
import logging
import os
import re
import shutil
import subprocess
import tempfile
import tomllib
import unittest
from contextlib import redirect_stdout
from pathlib import Path

from tests.helpers import ROOT

try:
    import markdown
    from pymdownx.superfences import SuperFencesException

    from mockitdown import cli, fence, stylesheet
    from mockitdown.extension import MockitdownExtension
    from mockitdown.options import FENCE_OPTIONS
except ImportError:  # pragma: no cover
    markdown = None

SITE = ROOT / "examples" / "site"
LOGGER = "mkdocs.extensions.mockitdown"


def make_md(extension=True, fence_class="mockitdown", **cfg):
    """A Markdown instance with superfences' mockitdown fence, and the extension when ``extension``."""
    exts = (["mockitdown"] if extension else []) + ["pymdownx.superfences"]
    configs = {"pymdownx.superfences": {"custom_fences": [
        {"name": "mockitdown", "class": fence_class, "format": fence.format, "validator": fence.validate}]}}
    if extension:
        configs["mockitdown"] = cfg
    return markdown.Markdown(extensions=exts, extension_configs=configs)


def block(source, attrs=""):
    return f"```mockitdown{(' ' + attrs) if attrs else ''}\n{source}\n```\n"


class Capture(logging.Handler):
    """Collects the records of the mockitdown logger while in use."""

    def __init__(self):
        super().__init__(logging.DEBUG)
        self.records = []

    def emit(self, record):
        self.records.append(record)

    def __enter__(self):
        logging.getLogger(LOGGER).addHandler(self)
        return self

    def __exit__(self, *exc):
        logging.getLogger(LOGGER).removeHandler(self)

    def messages(self, level):
        return [r.getMessage() for r in self.records if r.levelno == level]


def site_extensions():
    """The example site's markdown_extensions entries, by name, in order."""
    text = (SITE / "mkdocs.yml").read_text(encoding="utf-8")
    section = text.split("markdown_extensions:\n", 1)[1].split("\n\n", 1)[0]
    return re.findall(r"^  - ([\w.]+)", section, re.M)


@unittest.skipIf(markdown is None, "Markdown / pymdown-extensions not installed")
class IntegrationTests(unittest.TestCase):
    """R-MDX-001 TC-1."""

    def test_extension_loads_by_name(self):  # TC-1 (C1, V1)
        md = make_md()
        self.assertTrue(any(isinstance(e, MockitdownExtension) for e in md.registeredExtensions))
        out = md.convert("# Page\n\n" + block('Text("hello")'))
        self.assertEqual(out.count('class="mkd-figure '), 1)
        self.assertIn(">hello<", out)

    def test_fence_is_registered_by_dotted_names(self):  # TC-1 (C2)
        for dotted in ("mockitdown.fence.format", "mockitdown.fence.validate"):
            module, name = dotted.rsplit(".", 1)
            self.assertTrue(callable(getattr(importlib.import_module(module), name)), dotted)
        text = (SITE / "mkdocs.yml").read_text(encoding="utf-8")
        self.assertIn("- name: mockitdown", text)
        self.assertIn("format: !!python/name:mockitdown.fence.format", text)
        self.assertIn("validator: !!python/name:mockitdown.fence.validate", text)
        # The class name is free.
        self.assertIn('class="mkd-figure ', make_md(fence_class="anything").convert(block('Text("x")')))

    def test_no_mkdocs_plugin(self):  # TC-1 (C3)
        project = tomllib.loads((ROOT / "pyproject.toml").read_text(encoding="utf-8"))
        self.assertNotIn("mkdocs.plugins", project["project"].get("entry-points", {}))
        for f in (ROOT / "src" / "mockitdown").rglob("*.py"):
            text = f.read_text(encoding="utf-8")
            self.assertNotIn("BasePlugin", text, f)
            self.assertNotRegex(text, r"^\s*(import|from) mkdocs\b", f)
        self.assertNotRegex((SITE / "mkdocs.yml").read_text(encoding="utf-8"), r"^plugins:")
        # The Zensical build of the example site is ZensicalBuildTests in test_examples.py.

    def test_fence_without_the_extension(self):  # TC-1 (C4)
        out = make_md(extension=False).convert(block('Text("x")'))
        self.assertIn('class="mkd-figure mkd-pack-base"', out)
        self.assertIn('data-device="desktop" data-appearance="light"', out)
        self.assertNotIn("<style", out)

    def test_extension_listed_before_superfences(self):  # TC-1 (C5)
        names = site_extensions()
        self.assertLess(names.index("mockitdown"), names.index("pymdownx.superfences"))


@unittest.skipIf(markdown is None, "Markdown / pymdown-extensions not installed")
class OptionTests(unittest.TestCase):
    """R-MDX-002 TC-2."""

    def test_defaults(self):  # TC-2 (C1)
        md = make_md()
        ext = next(e for e in md.registeredExtensions if isinstance(e, MockitdownExtension))
        cfg = ext.getConfigs()
        expected = {"default_pack": "base", "default_appearance": "light", "default_device": "",
                    "asset_paths": ["docs"], "pack_paths": [], "embed_assets": True,
                    "max_embed_bytes": 2_000_000, "css": "inline", "strict": False, "caption": True,
                    "elements": False, "show_warnings": False, "callout_refs": True}
        for key, value in expected.items():
            self.assertEqual(cfg[key], value, key)
        opts = md.mockitdown.options
        self.assertEqual((opts.default_pack, opts.default_appearance, opts.default_device), ("base", "light", None))
        self.assertEqual((opts.asset_paths, opts.pack_paths), ((Path("docs"),), ()))
        self.assertEqual((opts.embed_assets, opts.max_embed_bytes, opts.caption, opts.elements, opts.show_warnings),
                         (True, 2_000_000, True, False, False))
        self.assertEqual((md.mockitdown.css, md.mockitdown.strict), ("inline", False))

    def test_paths_take_a_string_or_a_list(self):  # TC-2 (C2)
        for value, expected in (("docs/img", (Path("docs/img"),)), (["a", "b"], (Path("a"), Path("b")))):
            opts = make_md(asset_paths=value, pack_paths=value).mockitdown.options
            self.assertEqual(opts.asset_paths, expected)
            self.assertEqual(opts.pack_paths, expected)

    def test_invalid_appearance_fails_configuration(self):  # TC-2 (C3, V1)
        with self.assertRaises(ValueError) as cm:
            make_md(default_appearance="dim")
        self.assertEqual(str(cm.exception), "mockitdown: default_appearance must be one of light, dark, auto, both")
        for good in ("light", "dark", "auto", "both"):
            make_md(default_appearance=good)

    def test_invalid_css_fails_configuration(self):  # TC-2 (C4)
        with self.assertRaises(ValueError) as cm:
            make_md(css="link")
        self.assertEqual(str(cm.exception), "mockitdown: css must be 'inline' or 'none'")

    def test_options_apply_to_every_block_unless_overridden(self):  # TC-2 (C5, V1)
        md = make_md(default_pack="swiftui", css="none", default_appearance="dark", caption=False)
        out = md.convert(block('Text("a")', 'title="A"') + "\n" + block('Text("b")', 'title="B"') + "\n"
                         + block('Text("c")', 'pack="fluent" appearance="light" caption="yes" title="C"'))
        figures = re.findall(r'<div class="mkd-figure mkd-pack-(\w+)"[^>]*data-appearance="(\w+)"', out)
        self.assertEqual(figures, [("swiftui", "dark"), ("swiftui", "dark"), ("fluent", "light")])
        self.assertEqual(out.count('class="mkd-caption"'), 1)
        self.assertNotIn("<style", out)


@unittest.skipIf(markdown is None, "Markdown / pymdown-extensions not installed")
class FenceAttributeTests(unittest.TestCase):
    """R-MDX-003 TC-2."""

    def convert(self, attrs, source='Text("x")', **cfg):
        with Capture() as cap:
            out = make_md(**cfg).convert(block(source, attrs))
        return out, cap

    def test_typed_attributes(self):  # TC-2 (C1, V1)
        self.assertEqual(FENCE_OPTIONS, {
            "pack": str, "device": str, "appearance": str, "chrome": str, "title": str, "id": str, "url": str,
            "window": str, "menubar": str, "app": str, "width": int, "height": int,
            "caption": bool, "elements": bool, "source": bool, "windowed": bool})
        out, cap = self.convert('pack="swiftui" device="phone" appearance="dark" chrome="none" title="T" id="S-1" '
                                'url="example.com" width="300" height="200" caption="yes" elements="yes" '
                                'source="yes" window="dialog" windowed="no" menubar="no" app="Mail"',
                                'Button("Go").id("go")')
        self.assertEqual(cap.messages(logging.ERROR), [])
        self.assertIn('class="mkd-figure mkd-pack-swiftui"', out)
        for attr in ('data-device="phone"', 'data-appearance="dark"', 'data-chrome="none"',
                     'style="--mkd-w:300;--mkd-h:200"', "S-1 · T", '<table class="mkd-elements">', "<details"):
            self.assertIn(attr, out)

    def test_boolean_values(self):  # TC-2 (C2)
        for value in ("1", "true", "yes", "on", "TRUE", "Yes", "On"):
            out, _ = self.convert(f'elements="{value}"', 'Text("x").id("t")')
            self.assertIn('class="mkd-elements"', out, value)
        for value in ("0", "false", "no", "off", "nope", ""):
            out, _ = self.convert(f'elements="{value}"', 'Text("x").id("t")')
            self.assertNotIn('class="mkd-elements"', out, value)

    def test_validator_accepts_every_attribute(self):  # TC-2 (C3)
        options = {}
        self.assertTrue(fence.validate("mockitdown", {"devise": "phone", "zzz": "1"}, options, {}, None))
        self.assertEqual(options, {"devise": "phone", "zzz": "1"})
        out, _ = self.convert('devise="phone"')
        self.assertNotIn("<pre", out)          # not turned into a code listing
        self.assertIn('class="mkd-figure ', out)

    def test_fence_errors(self):  # TC-2 (C4, V1)
        for attrs, message in (('devise="phone"', "unknown fence option 'devise'"),
                               ('width="wide"', "fence option width='wide' is not a valid int"),
                               ('appearance="dim"', "appearance must be one of light, dark, auto, both")):
            with self.subTest(attrs=attrs):
                out, cap = self.convert(attrs)
                errors = cap.messages(logging.ERROR)
                self.assertEqual(len(errors), 1)
                self.assertIn("error [fence]", errors[0])
                self.assertIn(message, errors[0])
                self.assertLess(out.index('<div class="mkd-error"'), out.index('class="mkd-figure '))
                self.assertIn(message.replace("'", "&#x27;"), out)
                # The attribute is ignored: the defaults hold.
                self.assertIn('data-device="desktop" data-appearance="light"', out)
                self.assertIn("--mkd-w:1280;--mkd-h:800", out)

    def test_fence_overrides_site_options_and_screen(self):  # TC-2 (C5)
        out, _ = self.convert('pack="swiftui" device="tablet" title="Fence"',
                              '@Screen(title: "Meta", device: .phone, pack: "fluent")\nText("x")',
                              default_pack="mui", default_device="desktop")
        self.assertIn('class="mkd-figure mkd-pack-swiftui"', out)
        self.assertIn('data-device="tablet"', out)
        self.assertIn('aria-label="Fence"', out)
        out, _ = self.convert("", '@Screen(title: "Meta", device: .phone)\nText("x")', default_device="desktop")
        self.assertIn('data-device="phone"', out)
        self.assertIn('aria-label="Meta"', out)


@unittest.skipIf(markdown is None, "Markdown / pymdown-extensions not installed")
class CssDeliveryTests(unittest.TestCase):
    """R-MDX-004 TC-1."""

    PAGE = (block('import SwiftUI\nText("a")') + "\n" + block('import Fluent\nText("b")') + "\n"
            + block('import SwiftUI\nText("c")'))

    def test_one_style_element_per_page(self):  # TC-1 (C1, V1)
        out = make_md().convert("# T\n\n" + self.PAGE)
        self.assertEqual(out.count("<style"), 1)
        self.assertTrue(out.startswith('<style data-mockitdown="base swiftui fluent">'))

    def test_stylesheet_order_and_content(self):  # TC-1 (C2, V1)
        out = make_md().convert(self.PAGE)
        css = re.match(r"<style[^>]*>(.*?)</style>", out, re.S).group(1)
        self.assertEqual(css, stylesheet(["base", "swiftui", "fluent"]))
        self.assertNotIn("\n", css)                                       # minified
        page_rule = ".mkd-figure{display: block"
        self.assertTrue(css.startswith(page_rule))                        # the page stylesheet first …
        self.assertEqual(css.count(page_rule), 1)                         # … once
        # Each pack once, root first, its CSS followed by its token rules.
        tokens = [css.index(f".mkd-pack-{p} .mkd-frame{{color-scheme:light;--mkd-") for p in ("base", "swiftui", "fluent")]
        self.assertEqual(tokens, sorted(tokens))
        for pid in ("base", "swiftui", "fluent"):
            self.assertEqual(css.count(f".mkd-pack-{pid} .mkd-frame{{color-scheme:light;--mkd-"), 1, pid)
        for prev, pid, own in ((tokens[0], "swiftui", tokens[1]), (tokens[1], "fluent", tokens[2])):
            self.assertLess(prev, css.index(f".mkd-pack-{pid}"), pid)    # its CSS after the parent's tokens
            self.assertLess(css.index(f".mkd-pack-{pid}"), own, pid)     # and before its own tokens

    def test_no_style_without_a_mockup(self):  # TC-1 (C3)
        self.assertNotIn("<style", make_md().convert("# Title\n\nJust prose.\n\n```python\nx = 1\n```\n"))

    def test_css_none(self):  # TC-1 (C4)
        out = make_md(css="none").convert(self.PAGE)
        self.assertNotIn("<style", out)
        self.assertEqual(out.count('class="mkd-figure '), 3)
        buf = io.StringIO()
        with redirect_stdout(buf):
            self.assertEqual(cli.main(["css", "--pack", "swiftui", "--pack", "fluent"]), 0)
        self.assertIn(".mkd-pack-fluent", buf.getvalue())   # what the site then includes itself

    def test_reset_forgets_the_packs(self):  # TC-1 (C5)
        md = make_md()
        md.mockitdown.used = ["fluent"]   # left over from a page whose output was discarded
        md.reset()
        self.assertEqual(md.mockitdown.used, [])
        self.assertTrue(md.convert(block('Text("x")')).startswith('<style data-mockitdown="base">'))
        md.reset()
        out = md.convert(block('import SwiftUI\nText("y")'))
        self.assertTrue(out.startswith('<style data-mockitdown="base swiftui">'))


@unittest.skipIf(markdown is None, "Markdown / pymdown-extensions not installed")
class BuildLogTests(unittest.TestCase):
    """R-MDX-005 TC-1."""

    def test_diagnostics_are_logged(self):  # TC-1 (C1)
        with Capture() as cap:
            make_md().convert(block('Text("a").frobnicate()\nButon("x")'))
        errors, warnings = cap.messages(logging.ERROR), cap.messages(logging.WARNING)
        label = "mockitdown block 'Text(\"a\").frobnicate()': "
        self.assertEqual(len(errors), 1)
        self.assertTrue(errors[0].startswith(label + "error [unknown]"), errors[0])
        self.assertIn("'Buton'", errors[0])
        self.assertEqual(len(warnings), 1)
        self.assertTrue(warnings[0].startswith(label + "warning"), warnings[0])
        self.assertTrue(all(r.name == LOGGER for r in cap.records))

    def test_label(self):  # TC-1 (C1)
        long = 'Text("' + "x" * 80 + '")'
        with Capture() as cap:
            make_md().convert(block("\n\n" + long + "\nButon()"))
            make_md().convert(block("Buton()", 'title="Inbox"'))
        first, titled = cap.messages(logging.ERROR)
        self.assertTrue(first.startswith(f"mockitdown block {long[:48]!r}: "), first)
        self.assertTrue(titled.startswith("mockitdown block 'Inbox': "), titled)

    def test_strict_raises(self):  # TC-1 (C2, V1)
        with Capture():
            with self.assertRaises(SuperFencesException) as cm:
                make_md(strict=True).convert(block('Buton("x")'))
        self.assertTrue(str(cm.exception).startswith("mockitdown block 'Buton(\"x\")': error [unknown]"))
        with Capture():
            with self.assertRaises(SuperFencesException) as cm:
                make_md(strict=True).convert(block('Text("x")', 'devise="phone"'))
        self.assertIn("unknown fence option 'devise'", str(cm.exception))
        with Capture():   # warnings alone do not fail a strict build
            self.assertIn('class="mkd-figure ', make_md(strict=True).convert(block('Text("a").frobnicate()')))

    def test_not_strict_continues(self):  # TC-1 (C3)
        with Capture():
            out = make_md().convert(block('Buton("x")') + "\nAfter.\n\n" + block('Text("ok")'))
        self.assertIn('<div class="mkd-error"', out)
        self.assertEqual(out.count('class="mkd-figure '), 2)
        self.assertIn("<p>After.</p>", out)

    def test_show_warnings(self):  # TC-1 (C4)
        src = 'Text("a").frobnicate()'
        with Capture() as cap:
            hidden = make_md().convert(block(src))
            shown = make_md(show_warnings=True).convert(block(src))
        self.assertEqual(len(cap.messages(logging.WARNING)), 2)    # the log shows them either way
        self.assertNotIn("<div class=\"mkd-error\"", hidden)
        self.assertIn("<div class=\"mkd-error\"", shown)
        self.assertIn("frobnicate", shown)


@unittest.skipIf(markdown is None, "Markdown / pymdown-extensions not installed")
class InstantNavigationTests(unittest.TestCase):
    """R-MDX-006 TC-1 (the Zensical build is skipped when Zensical is not installed)."""

    def test_page_carries_its_css_and_no_script(self):  # TC-1 (C1)
        out = make_md().convert("# Page\n\n" + block('import SwiftUI\nButton("Save")'))
        self.assertNotIn("<script", out)
        self.assertNotRegex(out, r"\son[a-z]+=")
        self.assertLess(out.index("<style data-mockitdown"), out.index('class="mkd-figure '))

    def test_nothing_about_instant_navigation(self):  # TC-1 (C2)
        for f in (ROOT / "src" / "mockitdown").rglob("*.py"):
            self.assertNotRegex(f.read_text(encoding="utf-8"), r"\binstant\b", f)

    @unittest.skipUnless(shutil.which("zensical") or os.environ.get("ZENSICAL"), "zensical not installed")
    def test_zensical_site_with_instant_navigation(self):  # TC-1 (C1, C2, V1)
        exe = os.environ.get("ZENSICAL") or shutil.which("zensical")
        with tempfile.TemporaryDirectory() as d:
            site = Path(d)
            (site / "docs").mkdir()
            (site / "mkdocs.yml").write_text(
                "site_name: instant\ntheme:\n  name: material\n  features:\n    - navigation.instant\n"
                "markdown_extensions:\n  - mockitdown\n  - pymdownx.superfences:\n      custom_fences:\n"
                "        - name: mockitdown\n          class: mockitdown\n"
                "          format: !!python/name:mockitdown.fence.format\n"
                "          validator: !!python/name:mockitdown.fence.validate\n"
                "nav:\n  - Home: index.md\n  - Mockup: mockup.md\n", encoding="utf-8")
            (site / "docs" / "index.md").write_text("# Home\n\nNo mockups here.\n", encoding="utf-8")
            (site / "docs" / "mockup.md").write_text("# Mockup\n\n" + block('import SwiftUI\nButton("Save")'),
                                                     encoding="utf-8")
            env = {**os.environ, "PYTHONPATH": str(ROOT / "src")}
            proc = subprocess.run([exe, "build", "--clean"], cwd=site, capture_output=True, text=True,
                                  timeout=300, env=env)
            self.assertEqual(proc.returncode, 0, proc.stdout + proc.stderr)
            self.assertNotIn("instant", (proc.stdout + proc.stderr).lower())   # nothing warns about it
            home = (site / "site" / "index.html").read_text(encoding="utf-8")
            page = (site / "site" / "mockup" / "index.html").read_text(encoding="utf-8")
            self.assertIn("navigation.instant", page)
            # The part instant navigation swaps in holds the stylesheet and the figure …
            content = page[page.index('data-md-component="content"'):]
            content = content[:content.index("</article>")]
            self.assertEqual(content.count("<style data-mockitdown"), 1)
            self.assertIn('class="mkd-figure ', content)
            # … and the page has no script beyond the theme's own, the same as the page without mockups.
            scripts = [re.findall(r"<script[^>]*>", html.replace('"../', '"./')) for html in (page, home)]
            self.assertEqual(scripts[0], scripts[1])
            self.assertNotIn("mockitdown", home)


if __name__ == "__main__":
    unittest.main()
