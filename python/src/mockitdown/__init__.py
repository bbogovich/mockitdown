"""mockitdown — UI mockups written in SwiftUI syntax inside Markdown, rendered as HTML styled
after a real UI framework (SwiftUI, Fluent, Material UI, Angular Material, SAPUI5, Bootstrap, …).

Library use::

    from mockitdown import render, stylesheet
    result = render('import SwiftUI\\nText("Hello")', device="phone")
    page = f"<style>{stylesheet(result.packs)}</style>{result.html}"

In a MkDocs or Zensical site, add the ``mockitdown`` Markdown extension and the superfences fence
(``mockitdown.fence.format`` / ``mockitdown.fence.validate``); see the documentation.
"""

from __future__ import annotations

from .api import RenderResult, check, evaluate, render, stylesheet
from .diagnostics import Diagnostic, MockitdownError, MockitdownSyntaxError, Severity
from .options import RenderOptions

__version__ = "0.1.0"

__all__ = [
    "render", "check", "evaluate", "stylesheet", "RenderOptions", "RenderResult", "Diagnostic", "Severity",
    "MockitdownError", "MockitdownSyntaxError", "makeExtension", "__version__",
]


def makeExtension(**kwargs):  # noqa: N802 - Python-Markdown's required name
    """Python-Markdown entry point, so ``markdown_extensions: [mockitdown]`` works."""
    from .extension import MockitdownExtension

    return MockitdownExtension(**kwargs)
