---
title: "Library API"
spec_version: 0.2.0
status: draft
updated: 2026-11-24
page_id: API.1
---

# Library API

The Python API shared by the fence, the CLI and other tools, and the package's dependencies and platform.

### R-API-001 — render

`render` is the one entry point the fence, the CLI and other tools share.

**Realizes.** F-13, F-11

| | Statement |
|---|---|
| C1 | The library API MUST provide `render(source, options=None, **overrides)` returning a render result with `html` (the fragment, without CSS), `diagnostics`, `packs` (the ids of the selected pack's lineage, root first; empty when nothing rendered) and `screen` (the evaluated screen or `None`). |
| C2 | Keyword overrides MUST replace the named render options when they are not `None`; unknown names MUST be ignored. |
| C3 | A render result MUST expose `errors` (the error diagnostics) and `ok` (true when there are none). |
| C4 | The HTML MUST be the error box (when there are errors, or warnings shown by `show_warnings`) followed by the figure and, when requested, the source disclosure; for a syntax error it MUST be the error box only. |
| V1 | `render('import SwiftUI\nText("Hello")', device="phone")` returns `ok` true, `packs` `["base", "swiftui"]` and a figure for a phone. |

---

### R-API-002 — check, evaluate and stylesheet

**Realizes.** F-13

| | Statement |
|---|---|
| C1 | The library API MUST provide `check(source, options=None, **overrides)` returning every diagnostic of a full render. |
| C2 | The library API MUST provide `evaluate(source, options=None)` returning the evaluated screen (or `None` on a syntax error) and the diagnostics collector, without rendering. |
| C3 | The library API MUST provide `stylesheet(packs=None, *, pack_paths=(), minify=True)` returning the CSS for the given pack ids, or for every known pack when `packs` is `None`. |
| C4 | The package MUST export `render`, `check`, `evaluate`, `stylesheet`, `RenderOptions`, `RenderResult`, `Diagnostic`, `Severity`, `MockitdownError`, `MockitdownSyntaxError`, `makeExtension` and `__version__`. |
| V1 | `from mockitdown import render, stylesheet` and `f"<style>{stylesheet(r.packs)}</style>{r.html}"` produces a self-contained page fragment. |

---

### R-API-003 — Render options

**Realizes.** F-11, F-13

| | Statement |
|---|---|
| C1 | Render options MUST be an immutable value with the fields and defaults of M-OPT-1, and MUST provide a copy with overrides applied. |
| C2 | Every fence attribute and CLI rendering option MUST map onto a render option of the same meaning. |
| V1 | `RenderOptions(pack="fluent").with_overrides(device="phone", nope=1)` has pack `fluent`, device `phone` and no error. |

---

### R-API-004 — Dependencies and platform

Every dependency is a long-term liability; the core needs none, and the Markdown packages are
needed only where Python-Markdown already runs (ADR-12).

**Realizes.** F-11, F-13 · **Decisions.** ADR-12

| | Statement |
|---|---|
| C1 | The core package (language, evaluation, packs, rendering, stylesheets, assets, icons, CLI) MUST have no runtime dependencies outside the Python standard library. |
| C2 | The Markdown integration MUST be an optional extra (`mockitdown[markdown]`) requiring `Markdown>=3.6,<4` and `pymdown-extensions>=10,<14`. |
| C3 | mockitdown MUST run on Python 3.11 or later, on macOS, Windows and Linux. |
| C4 | The package MUST include `page.css` and every built-in pack's `pack.json` and `pack.css` as package data, and MUST install the `mockitdown` console script. |
| C5 | mockitdown MUST be distributed under the MIT licence. |
| V1 | In a fresh virtual environment, `pip install mockitdown` installs no other package and `mockitdown render` works; `pip install mockitdown[markdown]` adds exactly Markdown and pymdown-extensions. |

## Example

```python
from pathlib import Path
from mockitdown import RenderOptions, render, stylesheet

opts = RenderOptions(device="phone", appearance="both", import_paths=(Path("docs/mockups"),))
result = render(Path("checkout.mockitdown").read_text(), opts)
for d in result.diagnostics:
    print(d)                       # "error [unknown] at line 3:5: …"
page = f"<style>{stylesheet(result.packs)}</style>{result.html}"
```

## Revision history

| Version | Date | Change |
|---|---|---|
| 0.2.0 | 2026-11-24 | Page created |
