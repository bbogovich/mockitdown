"""Public entry points: render, check, stylesheet."""

from __future__ import annotations

from dataclasses import dataclass, field
from pathlib import Path

from .assets import AssetResolver
from .diagnostics import Diagnostic, Diagnostics, MockitdownSyntaxError, Severity
from .evaluate import Evaluator, ImportContext
from .model import Screen
from .options import RenderOptions
from .packs import registry as _registry
from .render import Renderer, render_screen
from .render.html import esc
from .styles import stylesheet as _stylesheet
from .syntax import parse


@dataclass
class RenderResult:
    html: str
    diagnostics: list[Diagnostic] = field(default_factory=list)
    #: Ids of the packs the output needs CSS for (empty when nothing rendered).
    packs: list[str] = field(default_factory=list)
    screen: Screen | None = None

    @property
    def errors(self) -> list[Diagnostic]:
        return [d for d in self.diagnostics if d.severity is Severity.ERROR]

    @property
    def ok(self) -> bool:
        return not self.errors


def _search_paths(paths: tuple[Path, ...]) -> list[Path]:
    return [Path(p) for p in paths]


def evaluate(source: str, options: RenderOptions | None = None,
             diagnostics: Diagnostics | None = None) -> tuple[Screen | None, Diagnostics]:
    """Parse and evaluate ``source``. Returns ``(None, diags)`` on a syntax error."""
    opts = options or RenderOptions()
    diags = diagnostics or Diagnostics()
    src_name = str(opts.source_path) if opts.source_path else ""
    try:
        module = parse(source, source=src_name)
    except MockitdownSyntaxError as e:
        diags.extend([e.diagnostic])
        return None, diags
    reg = _registry(tuple(str(p) for p in opts.pack_paths))
    base_dir = opts.source_path.parent if opts.source_path else None
    ev = Evaluator(reg, diags, default_pack=opts.default_pack, pack_override=opts.pack,
                   imports=ImportContext(_search_paths(opts.import_paths), base_dir))
    return ev.evaluate(module), diags


def render(source: str, options: RenderOptions | None = None, **overrides: object) -> RenderResult:
    """Render one mockup to an HTML fragment (no CSS; see :func:`stylesheet`)."""
    opts = (options or RenderOptions()).with_overrides(**overrides)
    screen, diags = evaluate(source, opts)
    if screen is None:
        return RenderResult(error_html(diags.items), diags.items)
    base_dir = opts.source_path.parent if opts.source_path else None
    assets = AssetResolver(_search_paths(opts.asset_paths), base_dir, diags, embed=opts.embed_assets,
                           max_bytes=opts.max_embed_bytes)
    renderer = Renderer(screen.pack, diags, assets)
    body = render_screen(screen, renderer, opts, diags)
    errors = diags.errors
    shown = errors + (diags.warnings if opts.show_warnings else [])
    prefix = error_html(shown) if shown else ""
    packs = [p.id for p in screen.pack.lineage()]
    if opts.source:
        body += (f'<details class="mkd-source"><summary>Source</summary><pre><code class="language-swift">'
                 f"{esc(source.strip())}</code></pre></details>")
    return RenderResult(prefix + body, diags.items, packs, screen)


def check(source: str, options: RenderOptions | None = None, **overrides: object) -> list[Diagnostic]:
    """All diagnostics for ``source`` (rendering included, so asset and icon problems are found)."""
    return render(source, options, **overrides).diagnostics


def stylesheet(packs: list[str] | None = None, *, pack_paths: tuple[Path, ...] = (), minify: bool = True) -> str:
    """CSS for the given pack ids (all known packs when None)."""
    reg = _registry(tuple(str(p) for p in pack_paths))
    return _stylesheet(packs if packs is not None else reg.ids(), reg, minify=minify)


def error_html(items: list[Diagnostic]) -> str:
    errors = [d for d in items if d.severity is Severity.ERROR]
    title = "mockitdown: " + (f"{len(errors)} error{'s' if len(errors) != 1 else ''}" if errors else "warnings")
    lis = "".join(f"<li>{esc(str(d))}</li>" for d in items)
    return (f'<div class="mkd-error" role="alert"><div class="mkd-error__title">{esc(title)}</div>'
            f"<ul>{lis}</ul></div>")
