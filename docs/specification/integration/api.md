---
title: "Library API"
spec_version: 0.12.7
status: draft
updated: 2026-11-27
page_id: API.1
---

# Library API

The Python API shared by the fence, the CLI and other tools, and the package's dependencies and platform.

### R-API-001 — render

`render` is the one entry point the fence, the CLI and other tools share.

`source` and `options` are positional, so that every render option can be given as a keyword
override, `source=True` included (found while writing TC-1, #56).

**R-API-001.TC-1 — render and its result**

Python unit tests `python/tests/test_api.py` `RenderTests`:
`render('import SwiftUI\nText("Hello")', device="phone")` returns a `RenderResult` that is `ok`, with
`packs` `["base", "swiftui"]`, a phone figure without CSS and the evaluated screen (C1, V1); a syntax
error gives empty `packs` and no screen (C1).
`render(src, RenderOptions(pack="fluent", device="tablet"), device="phone", pack=None, nope=1)` renders
fluent on a phone without an error, and every render option can be given as an override, `source`
included (C2). An unknown element puts one error in `errors` and makes `ok` false, while warnings stay
out of `errors`; warnings alone leave `ok` true (C3). With `source=True` and an error the HTML is the
error box, then the figure, then the source disclosure; warnings show a box only with `show_warnings`; a
syntax error is the error box alone, even with `source=True` (C4).

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

**R-API-002.TC-1 — check, evaluate, stylesheet and the exports**

Python unit tests `python/tests/test_api.py` `CheckEvaluateStylesheetTests`: `check` returns the same
diagnostics as `render` for the same source and overrides, the render-stage `icon` and `asset`
warnings included (C1). `evaluate` returns the screen, with its pack and views, and an empty collector
for a source whose only problem is found while rendering (an unknown icon), and `None` with the syntax
error for a broken source (C2). `stylesheet(["fluent"])` holds `page.css`, fluent and its ancestor base
and no other pack; `stylesheet()` holds every registered pack; `minify=False` keeps the pack comments; a
site pack in `pack_paths` contributes its tokens and scaled CSS (C3). `mockitdown.__all__` is exactly the
twelve names of C4, each an attribute of the package (C4).
`<style>{stylesheet(r.packs)}</style>{r.html}` holds the figure and its pack rules (V1).

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


Checked at 0.10.1 after M-OPT-1.F22 (`edit`, R-EDIT-004): C1 takes the new field and its default (false) through its reference to M-OPT-1. `edit` is a library option only, so C2 (every fence attribute and CLI option maps onto a render option) is unchanged.

**R-API-003.TC-1 — Render options and their mapping**

Python unit tests `python/tests/test_api.py` `RenderOptionsTests`: `RenderOptions` has every field of
M-OPT-1 with its default and no other — a field a queued issue adds or retires is listed in the test
with that issue (`imports` #75, `edit` #23, `libraries` #78; `import_paths`, retired by #75); assigning a
field raises `FrozenInstanceError`; `RenderOptions(pack="fluent").with_overrides(device="phone", nope=1)`
is a new value with pack `fluent` and device `phone`, the original unchanged (C1, V1). Every key of
`FENCE_OPTIONS` is a field, and a fence with every attribute reaches `render` with each value, typed, on
the field of the same name; `mockitdown render` with every rendering flag (`--pack`, `--default-pack`,
`--device`, `--appearance`, `--width`, `--height`, `--chrome`, `--title`, `--windowed`, `--menubar`,
`--app`, `--elements`, `-A`, `-P`, `--no-embed`) reaches `render` with the corresponding option, and the
file sets `source_path` (C2). `-I` is covered with R-IMP-002 (#75).

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

**R-API-004.TC-1 — Dependencies, package data and licence**

Python unit tests `python/tests/test_api.py` `DependencyAndPlatformTests`, on `python/pyproject.toml`
and the sources: `dependencies` is empty, and no module of `src/mockitdown` but `extension.py` and
`fence.py` imports anything outside the standard library and the package (C1, V1); the `markdown` extra
is exactly `Markdown>=3.6,<4` and `pymdown-extensions>=10,<14`, the only third-party imports of those two
modules (C2, V1); `requires-python` is `>=3.11` (C3, with TC-M1 for the platforms); the package data
names `page.css`, `packs/*/pack.json` and `packs/*/pack.css`, every shared pack has both files in the
package, and the console script `mockitdown` is `mockitdown.cli:main` (C4); the licence is `MIT` and both
`LICENSE` files hold the MIT licence (C5). IT-7 builds a wheel and checks its files (R-REPO-003.TC-1).

**R-API-004.TC-M1 — The suite on every platform**

Before a release: run the Python suite (`python -m unittest discover -s tests -t .` in `python/`) under
Python 3.11 and the newest supported Python, on macOS, Windows and Linux, each in a fresh virtual
environment with `pip install -e "python[markdown]"`. Record the platforms, versions and results on the
release issue; a failure fails the release. CI runs Linux with Python 3.12 only.

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

opts = RenderOptions(device="phone", appearance="both", imports={"": ["docs/mockups"]})
result = render(Path("checkout.mockitdown").read_text(), opts)
for d in result.diagnostics:
    print(d)                       # "error [unknown] at line 3:5: …"
page = f"<style>{stylesheet(result.packs)}</style>{result.html}"
```

## Revision history

| Version | Date | Change |
|---|---|---|
| 0.12.7 | 2026-11-27 | test cases backfilled: every C clause verified by a TC naming its tests (#56); test cases backfilled (TC-1); prose: source and options are positional, so source=True works as an override (#56) |
| 0.12.0 | 2026-11-27 | `imports` replaces `import_paths` in the example (ADR-24) |
| 0.10.2 | 2026-11-26 | checked against the changed item it cites; no obligation changes (audit #51) |
| 0.2.0 | 2026-11-24 | Page created |
| 0.10.2 | 2026-11-26 | checked against the changed item it cites; no obligation changes (audit #51) |
| 0.2.0 | 2026-11-24 | Page created |
