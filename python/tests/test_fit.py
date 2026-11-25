"""Fit frames and presentations drawn whole (R-DEV-008), in the Python variant.

The sizes themselves are measured in a browser (`typescript/tests/browser/gallery.spec.mjs`, TC-4 of
R-WEB-004 and the TC-1/TC-2 tests of R-DEV-008 and R-REND-013); here each presenting element renders,
alone at `fit` in every shipped pack, the markup those measurements rely on.
"""

import json
import re
import unittest

from tests.helpers import ROOT, render  # noqa: F401  (puts src on sys.path)
from mockitdown import RenderOptions
from mockitdown.packs import PackRegistry

REFERENCE = ROOT.parent / "shared" / "reference"
#: R-DEV-008 TC-1: the elements rendered alone, when the pack offers them with a presenting role.
PRESENTING = ("Alert", "Dialog", "Sheet", "Popover", "Toast", "Tooltip", "ConfirmationDialog")
SOURCE = '{name}("Title") {{ Text("Content"); Button("Action") }}'


@unittest.skipUnless(REFERENCE.is_dir(), "no shared/ beside python/ (not a repository checkout)")
class FitPresentationTests(unittest.TestCase):
    def test_presenting_elements_render_their_surface_alone_at_fit(self):  # R-DEV-008 TC-1 (C2, C3)
        packs = PackRegistry().ids()
        self.assertGreater(len(packs), 30)
        failures = []
        for pack in packs:
            ref = REFERENCE / f"{pack}.json"
            if not ref.exists():
                continue
            roles = {e["name"]: e["role"] for e in json.loads(ref.read_text(encoding="utf-8"))["elements"]}
            for name in PRESENTING:
                role = roles.get(name)
                if role not in ("dialog", "toast", "tooltip"):
                    continue
                src = SOURCE.format(name=name) if role != "toast" else f'{name}("Message")'
                result = render(src, RenderOptions(pack=pack, device="fit"))
                failures += [f"{name} in {pack}: {d}" for d in result.errors]
                html = result.html
                if role == "dialog":
                    ok = re.search(r'class="mkd-layer" data-kind="[^"]+"><div class="mkd-scrim"></div>'
                                   r'<div class="mkd-dialog', html) and "Title" in html and "Action" in html
                elif role == "toast":
                    ok = 'class="mkd-layer" data-kind="toast"' in html and "Message" in html
                else:
                    ok = 'class="mkd-tooltip__anchor"' in html and 'class="mkd-tooltip__arrow"' in html
                if not ok:
                    failures.append(f"{name} in {pack}: no presented surface")
        self.assertEqual(failures, [])

    def test_tooltip_without_content_has_a_placeholder_anchor(self):  # R-DEV-008.C5
        html = render('Tooltip("Copied")', RenderOptions(pack="base", device="fit")).html
        anchor = re.search(r'<span class="mkd-tooltip__anchor">(.*?)</span></span><span class="mkd-tooltip__bubble"',
                           html)
        self.assertIsNotNone(anchor, html)
        self.assertIn('class="mkd-button" data-placeholder="true"', anchor.group(1))
        self.assertIn('data-placement="top"', html)

    def test_tooltip_with_content_anchors_it(self):  # R-DEV-008.C5
        html = render('Tooltip("Copy") { Button("Copy") }', RenderOptions(pack="base")).html
        self.assertIn('<span class="mkd-tooltip__anchor"><span class="mkd-button" data-el="Button"', html)
        self.assertNotIn("data-placeholder", html)


class PositionalAliasTests(unittest.TestCase):
    def test_positional_argument_takes_its_parameters_alias(self):  # R-PACK-011 TC-1 (C3)
        positional = render('Dialog("Edit") { Text("x") }', RenderOptions(pack="prime", device="fit")).html
        labelled = render('Dialog(header: "Edit") { Text("x") }', RenderOptions(pack="prime", device="fit")).html
        self.assertEqual(positional, labelled)
        self.assertIn('<span class="mkd-dialog__title">Edit</span>', positional)


if __name__ == "__main__":
    unittest.main()
