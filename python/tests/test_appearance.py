"""Appearance selection (R-APP-001), token application by appearance (R-APP-002) and side-by-side
appearances (R-APP-003).

Each test names the test case (TC-n) and the clauses it verifies. The switching and the layout in a
browser are measured by typescript/tests/browser/appearance.spec.mjs (R-APP-002 TC-2, R-APP-003 TC-2).
"""

import contextlib
import io
import re
import unittest

from tests.helpers import ROOT, html
from mockitdown import cli, render, stylesheet
from mockitdown.options import APPEARANCES, coerce_fence_options
from mockitdown.packs import registry
from mockitdown.styles import scale_px

SRC = 'VStack { Text("Appearance"); Button("Continue") }'


def _frames(out: str) -> list[str]:
    return re.findall(r'<div class="mkd-frame" data-appearance="([a-z]+)"', out)


class AppearanceSelectionTests(unittest.TestCase):
    """R-APP-001 TC-1."""

    def test_the_four_appearances(self):  # TC-1 (C1)
        self.assertEqual(APPEARANCES, ("light", "dark", "auto", "both"))
        for a in APPEARANCES:
            self.assertEqual(coerce_fence_options({"appearance": a}), ({"appearance": a}, []))
        values, problems = coerce_fence_options({"appearance": "dim"})
        self.assertEqual(values, {})
        self.assertEqual(problems, ["appearance must be one of light, dark, auto, both"])
        with contextlib.redirect_stderr(io.StringIO()), self.assertRaises(SystemExit):
            cli.main(["render", "-", "--appearance", "dim"])

    def test_option_then_screen_then_default(self):  # TC-1 (C2, V1)
        screen_dark = f"@Screen(appearance: .dark)\n{SRC}"
        self.assertEqual(_frames(html(screen_dark, device="fit")), ["dark"])
        self.assertEqual(_frames(html(screen_dark, device="fit", appearance="light")), ["light"])
        self.assertEqual(_frames(html(SRC, device="fit")), ["light"])
        self.assertEqual(_frames(html(SRC, device="fit", default_appearance="dark")), ["dark"])
        self.assertEqual(_frames(html(screen_dark, device="fit", default_appearance="auto")), ["dark"])

    def test_unknown_appearance_warns_and_renders_light(self):  # TC-1 (C3, V1)
        src = f'@Screen(appearance: "dim")\n{SRC}'
        found = [(d.severity.value, d.code, d.message) for d in render(src, device="fit").diagnostics]
        self.assertEqual(found, [("warning", "appearance", "unknown appearance 'dim'; using light")])
        self.assertEqual(_frames(html(src, device="fit")), ["light"])
        self.assertEqual(_frames(html(SRC, device="fit", appearance="sepia")), ["light"])

    def test_frames_per_appearance(self):  # TC-1 (C4)
        for a in ("light", "dark", "auto"):
            out = html(SRC, device="fit", appearance=a)
            self.assertEqual(_frames(out), [a])
            self.assertIn(f'data-appearance="{a}"><div class="mkd-stage" data-count="1">', out)
        self.assertEqual(_frames(html(SRC, device="fit", appearance="both")), ["light", "dark"])


def _block(css: str, selector: str) -> str:
    start = css.index(selector + "{")
    return css[start + len(selector) + 1:css.index("}", start)]


class TokenTests(unittest.TestCase):
    """R-APP-002 TC-1."""

    def test_light_and_dark_token_rules(self):  # TC-1 (C1 to C4)
        reg = registry(())
        for pid in ("base", "fluent", "mui"):
            pack = reg.get(pid)
            light = pack.tokens.get("light", {})
            dark = {**light, **pack.tokens.get("dark", {})}
            self.assertTrue(pack.tokens.get("dark"), pid)
            css = stylesheet([pid], minify=False)
            scope = f".mkd-pack-{pid} .mkd-frame"
            rules = {
                "C1": (scope, "light", light),
                "C2": (f'{scope}[data-appearance="dark"]', "dark", dark),
                "C3": (f'[data-md-color-scheme="slate"] {scope}[data-appearance="auto"]', "dark", dark),
                "C4": (f'body:not([data-md-color-scheme]) {scope}[data-appearance="auto"]', "dark", dark),
            }
            for clause, (selector, scheme, tokens) in rules.items():
                body = _block(css, selector)
                self.assertTrue(body.startswith(f"color-scheme:{scheme};"), (pid, clause))
                for k, v in tokens.items():
                    self.assertIn(f"--mkd-{k}:{scale_px(str(v))};", body, (pid, clause, k))
            media = css[css.index("@media (prefers-color-scheme: dark){body:not([data-md-color-scheme]) " + scope):]
            self.assertTrue(media.startswith("@media (prefers-color-scheme: dark){"))

    def test_no_script_no_rebuild(self):  # TC-1 (C5)
        out = html(SRC, device="fit", appearance="auto")
        self.assertNotIn("<script", out)
        self.assertEqual(_frames(out), ["auto"])
        self.assertNotIn("<script", stylesheet(["base"]))


class SideBySideTests(unittest.TestCase):
    """R-APP-003 TC-1."""

    def test_two_cells_from_the_same_views(self):  # TC-1 (C1)
        out = html('import SwiftUI\nVStack { Text("A"); Toggle("On", isOn: true) }', device="phone",
                   appearance="both")
        cells = re.findall(r'<div class="mkd-cell"><div class="mkd-frame" data-appearance="(light|dark)"(.*?)</div>'
                           r'<div class="mkd-cell__label">(Light|Dark)</div></div>', out)
        self.assertEqual([(c[0], c[2]) for c in cells], [("light", "Light"), ("dark", "Dark")])
        self.assertEqual(cells[0][1], cells[1][1])  # the same frame contents
        self.assertIn('<div class="mkd-stage" data-count="2">', out)

    def test_page_stylesheet_lays_cells_side_by_side(self):  # TC-1 (C2)
        css = (ROOT.parent / "shared" / "css" / "page.css").read_text(encoding="utf-8")
        stage = _block(css.replace(" {", "{"), ".mkd-stage")
        cell = _block(css.replace(" {", "{"), ".mkd-cell")
        self.assertIn("display: flex;", stage)
        self.assertIn("gap:", stage)
        self.assertIn("flex: 1 1 0;", cell)
        self.assertIn("min-width: 0;", cell)
        self.assertIn("container-type: inline-size;", cell)


if __name__ == "__main__":
    unittest.main()
