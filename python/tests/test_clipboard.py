"""Code copied from the designer renders in a Markdown fence (R-EDIT-008 TC-2, V1; F-19.AC10).

The clipboard text is ``typescript/tests/browser/fixtures/copied-card.mockitdown``, written by hand as
the sample's Card at column 0; the browser test (``commands.spec.mjs``, IT-64) checks that Cmd/Ctrl+C
in the composite designer puts exactly that text on the clipboard. Here it goes into a ``mockitdown``
fence, which must render the copied elements without a diagnostic.
"""

import unittest

from tests.helpers import ROOT

try:
    import markdown

    from mockitdown import fence
except ImportError:  # pragma: no cover
    markdown = None

COPIED = ROOT.parent / "typescript" / "tests" / "browser" / "fixtures" / "copied-card.mockitdown"


@unittest.skipIf(markdown is None, "the markdown extra is not installed")
class CopiedCodeInAFence(unittest.TestCase):
    def test_tc2_copied_text_renders_in_a_fence_without_a_diagnostic(self):
        text = COPIED.read_text(encoding="utf-8")
        md = markdown.Markdown(
            extensions=["mockitdown", "pymdownx.superfences"],
            extension_configs={"pymdownx.superfences": {"custom_fences": [
                {"name": "mockitdown", "class": "mockitdown", "format": fence.format, "validator": fence.validate}]}},
        )
        with self.assertNoLogs("mkdocs.extensions.mockitdown", level="WARNING"):
            html = md.convert(f"```mockitdown\n{text}\n```\n")
        for element in ("Card", "Text", "Button"):
            self.assertIn(f'data-el="{element}"', html, f"the copied {element} is rendered")
        self.assertIn("Quarterly report", html)
        self.assertIn('data-mkd-id="open"', html)


if __name__ == "__main__":
    unittest.main()
