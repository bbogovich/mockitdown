---
title: "Diagnostics"
spec_version: 0.1.0
status: draft
updated: 2026-11-24
page_id: DIAG.1
---

# Diagnostics

How problems are located, collected, coded and shown.

<!-- slot: reqs -->

## Diagnostic codes

| Code | Severity | Typical message | Requirement |
|---|---|---|---|
| `syntax` | error | expected ',' or ')' in an argument list · unterminated string literal · missing '}' | R-LANG-009 |
| `empty` | warning | the mockup has no views | R-EVAL-002 |
| `directive` | warning | unknown directive @Foo | R-EVAL-010 |
| `pack` | warning / error | import X names no known pack · import X selects pack 'b', but 'a' is already selected · unknown pack 'x' | R-PACK-005 |
| `import` | error / warning | cannot find import 'x' (searched …) · cannot read import · struct S from f replaces an earlier definition · top-level views in an imported file are ignored | R-IMP |
| `unknown` | error | 'Foo' is not an element of pack 'p' and no struct of that name is declared or imported · unknown view or variable · unknown name | R-EVAL-003, R-EVAL-008 |
| `view` | error | this expression does not produce a view · a T value is not a view | R-EVAL-003 |
| `foreach` | error / warning | ForEach needs a content closure · ForEach needs an array, a range or a count · ForEach truncated to 500 items | R-EVAL-006 |
| `recursion` | error | struct S uses itself (S → T → S) · struct S nests too deeply | R-EVAL-005 |
| `argument` | error / warning | missing argument 'x' for struct S · struct S has no property 'x' · too many arguments | R-EVAL-005 |
| `struct` | error | struct S has no `var body: some View { … }` | R-EVAL-005 |
| `modifier` | warning | unknown modifier .x() is ignored · invalid class name | R-EVAL-009, R-REND-004 |
| `value` | error | a range needs integer bounds · subscript out of range · value has no member 'x' · cannot apply '-' to these values | R-EVAL-008 |
| `role` | error | pack 'p': element 'X' has unknown role 'r' | R-PACK-004 |
| `icon` | warning | unknown icon 'x' | R-ASSET-005 |
| `asset` | warning | asset 'x' not found (searched …) · unsupported asset scheme · only data:image/… URIs are accepted · over the embed limit; linked instead | R-ASSET |
| `device` | warning | unknown device 'x'; using desktop | R-DEV-002 |
| `appearance` | warning | unknown appearance 'x'; using light | R-APP-001 |
| `chrome` | warning | unknown chrome 'x' | R-DEV-005 |
| `fence` | error | unknown fence option 'x' · fence option width='a' is not a valid int · appearance must be one of … | R-MDX-003 |

## Where diagnostics appear

| Context | Errors | Warnings |
|---|---|---|
| Site page | error box above the figure; build log at ERROR; strict mode fails the build | build log at WARNING; error box only with `show_warnings` |
| `mockitdown render` | standard error; exit 1 | standard error |
| `mockitdown check` | standard output (or JSON); exit 1 | standard output (or JSON) |
| Library API | `RenderResult.diagnostics`, `.errors`; error box in `.html` | `RenderResult.diagnostics` |

## Revision history

| Version | Date | Change |
|---|---|---|
| 0.2.0 | 2026-11-24 | Page created |
| 0.13.1 | 2026-11-28 | `recursion`: the self-use message (R-EVAL-005.C10), the depth message without "(recursive?)" (#84) |
