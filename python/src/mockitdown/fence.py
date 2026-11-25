"""pymdownx.superfences custom fence for ```` ```mockitdown ```` blocks.

``validate`` accepts every fence attribute (unknown ones are reported by ``format`` as a
diagnostic, so a typo is visible instead of silently turning the block into code). ``format``
renders the block with the site options from the ``mockitdown`` extension when it is loaded, or
the defaults otherwise.
"""

from __future__ import annotations

import logging

from .api import error_html, render
from .diagnostics import Diagnostic, Location, Severity
from .options import RenderOptions, coerce_fence_options

log = logging.getLogger("mkdocs.extensions.mockitdown")

_DEFAULT = None


def _session(md):
    global _DEFAULT
    s = getattr(md, "mockitdown", None)
    if s is not None:
        return s
    if _DEFAULT is None:
        from .extension import MockitdownSession

        _DEFAULT = MockitdownSession(RenderOptions(), css="none")
    return _DEFAULT


def validate(language, inputs, options, attrs, md):  # noqa: ANN001 - superfences signature
    options.update(inputs)
    return True


def _label(source: str, opts: RenderOptions) -> str:
    if opts.title:
        return repr(opts.title)
    first = next((ln.strip() for ln in source.splitlines() if ln.strip()), "")
    return repr(first[:48])


def format(source, language, css_class, options, md, **kwargs):  # noqa: A001, ANN001 - superfences signature
    session = _session(md)
    typed, problems = coerce_fence_options({k: str(v) for k, v in (options or {}).items()})
    opts = session.options.with_overrides(**typed)
    result = render(source, opts)
    diags = list(result.diagnostics) + [Diagnostic(Severity.ERROR, p, Location(), "fence") for p in problems]
    label = _label(source, opts)
    for d in diags:
        (log.error if d.severity is Severity.ERROR else log.warning)("mockitdown block %s: %s", label, d)
    errors = [d for d in diags if d.severity is Severity.ERROR]
    if errors and session.strict:
        message = f"mockitdown block {label}: " + "; ".join(str(d) for d in errors)
        try:
            from pymdownx.superfences import SuperFencesException
        except ImportError:  # pragma: no cover
            raise RuntimeError(message) from None
        raise SuperFencesException(message)
    for pid in result.packs:
        if pid not in session.used:
            session.used.append(pid)
    html = result.html
    if problems:
        html = error_html([d for d in diags if d.code == "fence"]) + html
    return html
