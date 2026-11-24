---
title: "Component imports"
spec_version: 0.2.0
status: draft
updated: 2026-11-24
page_id: IMP.1
---

# Component imports

Loading custom components from component library files with `import "path"`. The component mechanism itself (structs) is specified in R-LANG-004 and R-EVAL-005.

### R-IMP-001 — File imports load components

A component file is a library: it declares and never renders, so importing it can never change a
mockup except by providing components.

**Realizes.** F-4 · **Decisions.** ADR-10

| | Statement |
|---|---|
| C1 | When a block contains `import "path"`, the evaluator MUST load the struct declarations of the named component file before evaluating the block's own declarations and views. |
| C2 | A component file MUST be mockitdown source; only its imports and struct declarations take effect. |
| C3 | If a component file contains top-level statements, then the evaluator MUST ignore them and warn "<file>: top-level views in an imported file are ignored" with code `import`. |
| C4 | Directives in a component file MUST be ignored. |
| V1 | Importing a file that declares `KPI` and also contains `Text("demo")` makes `KPI` available and warns once about the ignored view. |

---

### R-IMP-002 — Resolving import paths

Resolution against the importing file first lets libraries import their neighbours with short
relative paths; the site's import directories make libraries available to every page.

**Known gap.** As for assets (R-ASSET-002), a fenced block in a Markdown page has no known file in
a site build, so a block's own relative imports are resolved through `import_paths` only.

**Realizes.** F-4 · **Decisions.** ADR-10

| | Statement |
|---|---|
| C1 | The evaluator MUST resolve an absolute import path as written. |
| C2 | The evaluator MUST resolve a relative import path against the directory of the importing file — the component file for nested imports, the block's source file when known — and then against each configured import directory (`import_paths`) in order. |
| C3 | For each candidate, the evaluator MUST try the path as written and then with `.mockitdown` appended, and MUST use the first existing file. |
| C4 | If no candidate exists, then the evaluator MUST report the error "cannot find import 'x' (searched …)" listing the import directories, with code `import`. |
| C5 | Relative import directories MUST be resolved against the process's working directory — for a site build, the directory the build is run from. |
| V1 | With `import_paths: [docs/mockups]`, `import "shared/kpi"` loads `docs/mockups/shared/kpi.mockitdown`; inside it, `import "rows"` loads `docs/mockups/shared/rows.mockitdown`. |

---

### R-IMP-003 — Nested imports and cycles

Cycles are harmless — libraries only declare — so they are ignored rather than reported.

**Realizes.** F-4 · **Decisions.** ADR-10

| | Statement |
|---|---|
| C1 | The evaluator MUST process a component file's own file imports, depth first, before taking its struct declarations. |
| C2 | The evaluator MUST load each resolved file at most once per mockup; an import of a file already loaded in that mockup, including an import cycle, MUST be skipped silently. |
| V1 | Files `a` importing `b` and `b` importing `a` both load once without a diagnostic. |

---

### R-IMP-004 — Definition precedence

The nearest definition wins, so a page can adjust a shared component locally, and a site can
replace a pack element with its own component.

**Realizes.** F-4 · **Decisions.** ADR-10

| | Statement |
|---|---|
| C1 | When several loaded files declare a struct of the same name, the later declaration in load order MUST replace the earlier one, and the evaluator MUST warn "struct S from <file> replaces an earlier definition" with code `import`. |
| C2 | A struct declared in the block MUST replace an imported struct of the same name without a diagnostic. |
| C3 | A struct (declared or imported) MUST take precedence over a pack element of the same name (R-EVAL-003.C1). |
| V1 | A block importing a library with `KPI` and declaring its own `KPI` uses its own. |

---

### R-IMP-005 — Import errors and caching

Caching matters for sites where many pages import the same library: each file is parsed once per
build unless it changes, which also keeps `zensical serve` reloads correct.

**R-IMP-005.TC-1 — Imports and assets**

Automated by `tests/test_render.py::EvaluateRenderTests::test_imports_and_assets`.

**Realizes.** F-4, F-12

| | Statement |
|---|---|
| C1 | If a component file cannot be read, then the evaluator MUST report "cannot read import 'x': <reason>" with code `import` and continue. |
| C2 | If a component file has a syntax error, then the evaluator MUST report that syntax error, located in that file, and continue without its declarations. |
| C3 | The evaluator MAY cache parsed component files across mockups in one process, keyed by resolved path and modification time; a changed file MUST be re-parsed. |
| V1 | A library with a syntax error on its line 4 produces `error [syntax] at <path>:4:…` and the block still renders its other content. |

---

### R-IMP-006 — Module imports are not file imports

The two forms mirror Swift: `import SwiftUI` names a framework, `import "shared/kpi"` names a file.

**Realizes.** F-3, F-4

| | Statement |
|---|---|
| C1 | An `import` of an unquoted module name MUST only select a pack (R-PACK-005) or be accepted as neutral (R-EVAL-011.C3); it MUST NOT load a file. |
| C2 | A component library MUST be imported with a quoted path. |
| V1 | `import Charts` neither loads a file nor warns; `import Kpi` warns that it names no known pack. |

## Revision history

| Version | Date | Change |
|---|---|---|
| 0.2.0 | 2026-11-24 | Page created |
