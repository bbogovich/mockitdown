"""Python-Markdown extension: site-wide configuration and per-page CSS injection.

Works anywhere Python-Markdown runs, including MkDocs and Zensical (which does not run MkDocs
plugins), so mockitdown ships no MkDocs plugin. Rendering itself happens in the superfences
custom fence (:mod:`mockitdown.fence`); this extension gives the fence its configuration and,
with ``css: inline`` (the default), prepends one ``<style>`` element holding the CSS of the packs
the page used.

``mkdocs.yml``::

    markdown_extensions:
      - mockitdown:
          default_pack: swiftui
          import_paths: [docs/mockups]
      - pymdownx.superfences:
          custom_fences:
            - name: mockitdown
              class: mockitdown
              format: !!python/name:mockitdown.fence.format
              validator: !!python/name:mockitdown.fence.validate
"""

from __future__ import annotations

from pathlib import Path

from markdown import Markdown
from markdown.extensions import Extension
from markdown.inlinepatterns import InlineProcessor
from markdown.postprocessors import Postprocessor
import xml.etree.ElementTree as etree

from .options import APPEARANCES, RenderOptions
from .styles import stylesheet
from .packs import registry


class MockitdownSession:
    """Per-Markdown-instance state: options, mode flags and the packs used on the current page."""

    def __init__(self, options: RenderOptions, css: str = "inline", strict: bool = False) -> None:
        self.options = options
        self.css = css
        self.strict = strict
        self.used: list[str] = []

    def reset(self) -> None:
        self.used = []


class _StylePostprocessor(Postprocessor):
    def __init__(self, md: Markdown, session: MockitdownSession) -> None:
        super().__init__(md)
        self.session = session

    def run(self, text: str) -> str:
        if self.session.css != "inline" or not self.session.used:
            return text
        # Hosts such as Zensical run nested convert() calls (e.g. for headings) while a page is being
        # converted, and may convert again without reset(). Only the conversion whose output holds the
        # figures gets the stylesheet; it consumes the packs so the CSS is emitted once.
        if 'class="mkd-figure ' not in text:
            return text
        used, self.session.used = self.session.used, []
        reg = registry(tuple(str(p) for p in self.session.options.pack_paths))
        css = stylesheet(used, reg)
        return f'<style data-mockitdown="{" ".join(used)}">{css}</style>\n{text}'


CALLOUT_COLORS = ("red", "orange", "yellow", "green", "teal", "blue", "indigo", "purple", "pink", "gray")


class _CalloutRefProcessor(InlineProcessor):
    """``(#3)`` or ``(#3 blue)`` in prose → a numbered circle matching a mockup's ``.callout(3)``."""

    def handleMatch(self, m, data):  # noqa: N802
        el = etree.Element("span")
        el.set("class", "mkd-ref")
        if m.group(2):
            el.set("data-color", m.group(2))
        el.text = m.group(1)
        return el, m.start(0), m.end(0)


class MockitdownExtension(Extension):
    def __init__(self, **kwargs: object) -> None:
        self.config = {
            "default_pack": ["base", "Pack used when a block names none"],
            "default_appearance": ["light", "light | dark | auto | both"],
            "default_device": ["", "Device form when a block and its pack name none"],
            "import_paths": [["docs"], "Directories searched by import \"…\" (relative to the build directory)"],
            "asset_paths": [["docs"], "Directories searched for Image(\"…\") files"],
            "pack_paths": [[], "Directories holding site-defined packs (<dir>/<id>/pack.json)"],
            "embed_assets": [True, "Inline local images as data: URIs"],
            "max_embed_bytes": [2_000_000, "Largest image inlined; larger ones are linked"],
            "css": ["inline", "inline: add a <style> per page · none: the site links the CSS itself"],
            "strict": [False, "Fail the build on any mockitdown error"],
            "caption": [True, "Show the id · title caption"],
            "elements": [False, "Append the Elements table to every mockup"],
            "show_warnings": [False, "Show warnings in the page, not only in the build log"],
            "callout_refs": [True, "Turn (#1) in prose into a numbered callout circle"],
        }
        super().__init__(**kwargs)

    def extendMarkdown(self, md: Markdown) -> None:  # noqa: N802
        c = self.getConfigs()
        appearance = str(c["default_appearance"])
        if appearance not in APPEARANCES:
            raise ValueError(f"mockitdown: default_appearance must be one of {', '.join(APPEARANCES)}")
        if c["css"] not in ("inline", "none"):
            raise ValueError("mockitdown: css must be 'inline' or 'none'")
        opts = RenderOptions(
            default_pack=str(c["default_pack"]),
            default_appearance=appearance,
            default_device=str(c["default_device"]) or None,
            import_paths=tuple(Path(p) for p in _as_list(c["import_paths"])),
            asset_paths=tuple(Path(p) for p in _as_list(c["asset_paths"])),
            pack_paths=tuple(Path(p) for p in _as_list(c["pack_paths"])),
            embed_assets=bool(c["embed_assets"]),
            max_embed_bytes=int(c["max_embed_bytes"]),
            caption=bool(c["caption"]),
            elements=bool(c["elements"]),
            show_warnings=bool(c["show_warnings"]),
        )
        session = MockitdownSession(opts, str(c["css"]), bool(c["strict"]))
        md.mockitdown = session  # type: ignore[attr-defined]
        md.registerExtension(self)
        md.postprocessors.register(_StylePostprocessor(md, session), "mockitdown_css", 5)
        if c["callout_refs"]:
            colors = "|".join(CALLOUT_COLORS)
            md.inlinePatterns.register(
                _CalloutRefProcessor(rf"(?<!\])\(#(\d{{1,2}}|[A-Z])(?:\s+({colors}))?\)", md), "mockitdown_callout_ref", 175)
        self._session = session

    def reset(self) -> None:
        if getattr(self, "_session", None) is not None:
            self._session.reset()


def _as_list(v: object) -> list[str]:
    if isinstance(v, str):
        return [v]
    return [str(x) for x in (v or [])]


def makeExtension(**kwargs: object) -> MockitdownExtension:  # noqa: N802
    return MockitdownExtension(**kwargs)
