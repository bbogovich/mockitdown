"""Pointers, selections, highlights and taps (R-ANN-002) and callout references in prose (R-ANN-004).

Each test names the test case (TC-n) and the clauses it verifies. The marks' geometry in a browser is
measured by typescript/tests/browser/annotations.spec.mjs (R-ANN-002 TC-2).
"""

import re
import unittest

from tests.helpers import ROOT, html
from mockitdown.render._util import _CURSORS

REPO = ROOT.parent
BASE_CSS = (REPO / "shared" / "packs" / "base" / "pack.css").read_text(encoding="utf-8")
KINDS = ("arrow", "hand", "ibeam", "grab", "crosshair", "touch")


def _same(out: str) -> str:
    """The output with its anchor names (which hash the source, R-ANN-003.C5) made equal."""
    return re.sub(r"--mkd-[0-9a-f]{6}-", "--mkd-x-", out)


def _rule(selector: str) -> str:
    m = re.search(re.escape(selector) + r"\s*\{([^}]*)\}", BASE_CSS)
    assert m, selector
    return m.group(1)


class PointerSelectionTests(unittest.TestCase):
    """R-ANN-002 TC-1."""

    def test_pointer_kinds_alias_default_and_alignment(self):  # TC-1 (C1)
        drawings = set()
        for kind in KINDS:
            out = html(f'Button("Send").pointer(.{kind}, alignment: .topTrailing)', device="fit")
            self.assertIn(f'<span class="mkd-deco__pointer" data-align="topTrailing">'
                          f'<span class="mkd-pointer" data-kind="{kind}">', out)
            self.assertIn(f'data-kind="{kind}">{_CURSORS[kind]}</svg>', out)
            drawings.add(_CURSORS[kind])
        self.assertEqual(len(drawings), len(KINDS))  # each kind has its own drawing
        default = html('Button("Send").pointer()', device="fit")
        self.assertIn('<span class="mkd-deco__pointer" data-align="center"><span class="mkd-pointer" data-kind="arrow">',
                      default)
        self.assertEqual(_same(html('Button("Send").cursor(.ibeam)', device="fit")),
                         _same(html('Button("Send").pointer(.ibeam)', device="fit")))

    def test_drag_select_draws_a_tinted_rectangle_beyond_the_view(self):  # TC-1 (C2, V1)
        out = html('List { Text("a") }.dragSelect()', device="fit")
        self.assertIn('<span class="mkd-deco__marquee"></span>', out)
        self.assertEqual(out.count("mkd-deco__marquee"), 2)  # the anchored layer and the fallback layer
        coloured = html('TextField("To", text: "x").dragSelect(.green)', device="fit")
        self.assertIn('<span class="mkd-deco__marquee" style="--mkd-marquee:var(--mkd-color-green)"></span>', coloured)
        self.assertEqual(_same(html('TextField("To", text: "x").marquee(.green)', device="fit")), _same(coloured))
        rule = _rule(".mkd-frame .mkd-deco__marquee")
        self.assertRegex(rule, r"inset:\s*-\d+px")  # extends beyond the view
        self.assertRegex(rule, r"border:[^;]*var\(--mkd-marquee\)")
        self.assertRegex(rule, r"background:\s*color-mix\(in srgb, var\(--mkd-marquee\) \d+%, transparent\)")

    def test_highlight_and_tap(self):  # TC-1 (C3)
        out = html('Button("Send").highlight()', device="fit")
        self.assertIn('<span class="mkd-deco__highlight"></span>', out)
        self.assertIn('<span class="mkd-deco__highlight" style="--mkd-highlight:var(--mkd-color-red)"></span>',
                      html('Button("Send").highlight(.red)', device="fit"))
        self.assertRegex(_rule(".mkd-frame .mkd-deco__highlight"), r"border:[^;]*solid")
        self.assertIn('<span class="mkd-deco__tap" data-align="leading"></span>',
                      html('Button("Send").tap(alignment: .leading)', device="fit"))
        self.assertIn('<span class="mkd-deco__tap" data-align="center"></span>',
                      html('Button("Send").tap()', device="fit"))

    def test_free_pointer_and_selection_rect(self):  # TC-1 (C4)
        out = html('Canvas(height: 100) { SelectionRect().frame(width: 60, height: 40).position(x: 50, y: 50); '
                   'Pointer(.hand).position(x: 10, y: 20) }', device="fit")
        self.assertIn('<div class="mkd-marquee" data-el="SelectionRect" data-positioned="true" '
                      'style="width:calc(60 * var(--u));', out)
        self.assertIn("height:calc(40 * var(--u))", out)
        self.assertIn("position:absolute;left:calc(50 * var(--u));top:calc(50 * var(--u));translate:-50% -50%", out)
        self.assertIn('<span class="mkd-pointer" data-el="Pointer" data-kind="hand" data-positioned="true" '
                      'style="position:absolute;left:calc(10 * var(--u));top:calc(20 * var(--u))', out)
        self.assertIn(f'data-kind="hand">{_CURSORS["hand"]}</svg>', out)
        rule = _rule(".mkd-frame .mkd-marquee")  # the same mark as the modifier's
        self.assertRegex(rule, r"border:[^;]*var\(--mkd-marquee\)")
        self.assertRegex(rule, r"background:\s*color-mix\(in srgb, var\(--mkd-marquee\) \d+%, transparent\)")


try:
    import markdown
except ImportError:  # pragma: no cover - the markdown extra is installed for the tests
    markdown = None


def _md(text: str, **config) -> str:
    return markdown.markdown(text, extensions=["mockitdown"], extension_configs={"mockitdown": config})


@unittest.skipIf(markdown is None, "needs the markdown extra")
class CalloutReferenceTests(unittest.TestCase):
    """R-ANN-004 TC-1."""

    def test_numbers_and_letters_become_circles(self):  # TC-1 (C1, V1)
        self.assertIn('<span class="mkd-ref">1</span>', _md("Enter the name (#1)."))
        self.assertIn('<span class="mkd-ref">12</span>', _md("See (#12)."))
        self.assertIn('<span class="mkd-ref">A</span>', _md("See (#A)."))
        for text in ("(#123)", "(#a)", "(#AB)", "(# 1)", "#1"):
            self.assertNotIn("mkd-ref", _md(f"See {text}."), text)

    def test_option_turns_it_off(self):  # TC-1 (C1)
        self.assertNotIn("mkd-ref", _md("Enter the name (#1).", callout_refs=False))
        self.assertIn('<span class="mkd-ref">1</span>', _md("Enter the name (#1).", callout_refs=True))

    def test_colours(self):  # TC-1 (C2)
        page_css = (REPO / "shared" / "css" / "page.css").read_text(encoding="utf-8")
        for colour in ("red", "orange", "yellow", "green", "teal", "blue", "indigo", "purple", "pink", "gray"):
            self.assertIn(f'<span class="mkd-ref" data-color="{colour}">2</span>', _md(f"See (#2 {colour})."))
            self.assertIn(f'.mkd-ref[data-color="{colour}"]', page_css)
        self.assertNotIn("mkd-ref", _md("See (#2 magenta)."))

    def test_not_inside_a_link_destination(self):  # TC-1 (C3)
        out = _md("Go to [the field](#1) and (#2).")
        self.assertIn('<a href="#1">the field</a>', out)
        self.assertEqual(out.count("mkd-ref"), 1)
        self.assertIn('<span class="mkd-ref">2</span>', out)


if __name__ == "__main__":
    unittest.main()
