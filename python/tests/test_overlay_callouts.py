"""Marks on overlay layers (R-ANN-001.C6) and on views inside a dialog (R-ANN-003.C3, C6); F-15.C5, C6, AC3.

TC-1 of R-ANN-001 and TC-1 of R-ANN-003. The expected fragments are written by hand from the clauses and
from the markup of an unmarked toast, floating action button and dialog (the conformance cases
overlay-toast, overlay-fab and overlay-dialog-element), not taken from a rendering. The marks' positions in
a browser are measured by typescript/tests/browser/overlay-callouts.spec.mjs (IT-74).
"""

import re
import unittest

from tests.helpers import html


def _same(out: str) -> str:
    """The output with its anchor names (which hash the source, R-ANN-003.C5) made equal."""
    return re.sub(r"--mkd-[0-9a-f]{6}-", "--mkd-x-", out)


def _callout(n: int) -> str:
    return f'<span class="mkd-deco__callout" data-align="topLeading"><span class="mkd-callout__badge">{n}</span></span>'


def _anchored(n: int, seq: int = 1) -> str:
    return f'<div class="mkd-anchored" style="position-anchor:--mkd-x-{seq}">{_callout(n)}</div>'


def _fallback(n: int) -> str:
    return f'<div class="mkd-deco__layer">{_callout(n)}</div>'


TOAST_LAYER = ('<div class="mkd-layer" data-kind="toast" data-position="bottom">'
               '<div class="mkd-toast" data-el="Toast" role="status" style="anchor-name:--mkd-x-1" data-deco="true">'
               '<span class="mkd-toast__text"><span class="mkd-toast__message">%s</span></span>'
               + _fallback(2) + '</div></div>')


class OverlayCalloutTests(unittest.TestCase):
    """R-ANN-001 TC-1 (C6)."""

    def test_toast_keeps_its_callout(self):
        out = _same(html('VStack { Text("Saved list"); Toast("Saved").callout(2) }', device="fit"))
        # The toast's layer holds the decorated toast; its anchored mark follows the layer (R-ANN-003.C3).
        self.assertIn(TOAST_LAYER % "Saved" + _anchored(2), out)
        self.assertEqual(out.count('<span class="mkd-callout__badge">2</span>'), 2)  # drawn once, twice laid out

    def test_floating_action_button_keeps_its_callout(self):
        out = _same(html('VStack { Text("List"); FloatingActionButton("plus").callout(3) }', device="fit"))
        self.assertIn('<div class="mkd-layer" data-kind="fab" data-position="bottomTrailing">'
                      '<span class="mkd-fab" data-el="FloatingActionButton" role="button" '
                      'style="anchor-name:--mkd-x-1" data-deco="true"><span class="mkd-fab__icon"><svg ', out)
        self.assertIn('</svg></span>' + _fallback(3) + '</span></div>' + _anchored(3) + '</div>', out)

    def test_dialog_keeps_its_callout(self):
        out = _same(html('Dialog("Rename") { TextField("Name"); Button("OK") }.callout(1)', device="fit"))
        self.assertIn('<div class="mkd-layer" data-kind="dialog"><div class="mkd-scrim"></div>'
                      '<div class="mkd-dialog" data-el="Dialog" role="dialog" style="anchor-name:--mkd-x-1" '
                      'data-deco="true"><div class="mkd-dialog__header">', out)
        self.assertIn('<span class="mkd-button__label">OK</span></span></div>' + _fallback(1) + '</div></div>'
                      + _anchored(1), out)

    def test_overlay_presented_through_a_modifier_keeps_its_callout(self):
        out = _same(html('Color(.blue).frame(width: 240, height: 120).overlay { Toast("Copied").callout(2) }',
                         device="fit"))
        self.assertIn(TOAST_LAYER % "Copied" + _anchored(2), out)

    def test_inline_overlays_are_decorated_in_place(self):
        out = _same(html('VStack { Toast("Saved", inline: true).callout(2) }', device="fit"))
        self.assertNotIn("mkd-layer", out)
        self.assertIn('<div class="mkd-toast" data-el="Toast" role="status" style="anchor-name:--mkd-x-1" '
                      'data-deco="true">', out)
        self.assertEqual(out.count("mkd-anchored"), 1)


class DialogContentsTests(unittest.TestCase):
    """R-ANN-003 TC-1 (C6), with C3: marks on views inside a dialog follow the dialog's layer."""

    def _order(self, out: str) -> None:
        layer_end = out.index('<div class="mkd-anchored"')
        self.assertLess(out.index('<div class="mkd-layer"'), layer_end)
        self.assertIn('data-deco="true"><span class="mkd-button__label">Delete</span>' + _fallback(1), out)
        self.assertEqual(out.count("mkd-anchored"), 1)

    def test_dialog_element(self):
        out = _same(html('VStack { Text("Behind"); Dialog("Delete?") { Text("This cannot be undone.")\n'
                         '  Button("Delete").callout(1) } }', device="fit"))
        self._order(out)
        self.assertIn('</div></div></div>' + _anchored(1) + '</div>', out)

    def test_alert_presentation(self):
        out = _same(html('VStack { Text("Behind") }\n.alert("Delete?", isPresented: true) {\n'
                         '  Button("Cancel")\n  Button("Delete").callout(1)\n}', device="fit"))
        self._order(out)
        self.assertIn('</div></div></div>' + _anchored(1) + '</div>', out)

    def test_sheet_presentation(self):
        out = _same(html('VStack { Text("Behind") }\n.sheet(isPresented: true) { Button("Delete").callout(1) }',
                         device="fit"))
        self._order(out)
        self.assertIn('</div></div>' + _anchored(1) + '</div>', out)


if __name__ == "__main__":
    unittest.main()
