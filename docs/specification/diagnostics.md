---
title: "Diagnostics"
spec_version: 0.10.0
status: draft
updated: 2026-11-26
page_id: DIAG.1
---

# Diagnostics

How problems are located, collected, coded and shown.

### R-DIAG-001 — Diagnostic content

The format is the same in the page, the build log and the CLI, so a message can be searched for
anywhere.

**Realizes.** F-12

| | Statement |
|---|---|
| C1 | Every diagnostic MUST carry a severity (`error` or `warning`), a message, a location (line and column, 1-based, and the source file name when the problem is in a file; zero when unknown) and a code. |
| C2 | A diagnostic MUST print as `<severity> [<code>] at <where>: <message>`, where `<where>` is `line L:C`, or `<file>:L:C` for a file, or the file name or `?` when no line is known; the code part MUST be omitted when empty. |
| C3 | Errors MUST mean the mockup is wrong (it does not show what was written); warnings MUST mean something was ignored or approximated. |
| V1 | An unknown element in a fenced block prints `error [unknown] at line 3:5: …`; an unknown icon prints `warning [icon] at line 2:9: unknown icon 'xyzzy'`. |

---

### R-DIAG-002 — Collecting diagnostics

One collector per rendering means one bad element never hides another, and repeated problems are
reported once.

**Realizes.** F-12

| | Statement |
|---|---|
| C1 | Every stage MUST report problems to one diagnostics collector per rendering and MUST NOT print or raise them, except that a syntax error is raised (R-LANG-009). |
| C2 | The collector MUST keep diagnostics in the order reported and MUST drop a diagnostic equal in severity, message and location to an earlier one. |
| V1 | An unknown icon used in a `ForEach` over five items is reported once. |

---

### R-DIAG-003 — Diagnostic codes

Codes let tools filter diagnostics (`check --json`) without parsing messages. The
[Diagnostics](diagnostics.md) page lists each code with its severity and typical message.

`argument` also covers a labelled argument that an element does not understand (R-EVAL-004.C9), a
warning.

**Realizes.** F-12

| | Statement |
|---|---|
| C1 | Diagnostics MUST use these codes: `syntax` (lexing or parsing), `empty` (no views), `directive` (unknown directive), `pack` (pack selection or loading), `import` (component files), `unknown` (unknown element, view or name), `view` (an expression that is not a view), `foreach`, `recursion`, `argument` (struct arguments, and labelled arguments an element does not understand), `struct` (struct without body), `modifier` (unknown modifier, invalid class name), `value` (value evaluation), `role` (pack element with an unknown role), `icon`, `asset`, `device`, `appearance`, `chrome`, `chart` (a chart with no data) and `fence` (fence attributes). |
| C2 | Adding a code MUST be a change to this specification. |
| V1 | Every diagnostic produced by the test suite has one of the listed codes. |

---

### R-DIAG-004 — The error box

The box is styled by the page stylesheet, independent of any pack, so it is legible on any site.

**Realizes.** F-12

| | Statement |
|---|---|
| C1 | When a rendering has errors, the library API MUST place before the figure a `div.mkd-error[role=alert]` holding `div.mkd-error__title` and a list with one item per shown diagnostic. |
| C2 | The title MUST read `mockitdown: 1 error` or `mockitdown: N errors`, or `mockitdown: warnings` when only warnings are shown. |
| C3 | The box MUST list the errors, and also the warnings when `show_warnings` is on. |
| C4 | When there are no errors and warnings are not shown, the library API MUST NOT emit the box. |
| V1 | A block with one unknown element and one unknown modifier shows a box titled `mockitdown: 1 error` with one item (two with `show_warnings`). |

---

### R-DIAG-005 — Syntax errors and partial rendering

A syntax error leaves no tree to render; any other error leaves a tree with a hole, which is
drawn.

**R-DIAG-005.TC-1 — Syntax error renders the error block**

Automated by `tests/test_render.py::EvaluateRenderTests::test_syntax_error_renders_error_block`.

**Realizes.** F-12

| | Statement |
|---|---|
| C1 | When the source has a syntax error, the library API MUST return the error box as the whole HTML, with no figure and an empty pack list. |
| C2 | When the source parses but has other errors, the library API MUST return the error box followed by the complete figure, with unknown elements as placeholders (R-REND-008). |
| V1 | `Text(` renders only an error box; `VStack { Foo() }` renders an error box and a figure containing an `mkd-unknown` placeholder. |

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
| `recursion` | error | struct S nests too deeply (recursive?) | R-EVAL-005 |
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
| 0.10.0 | 2026-11-26 | code argument also covers labelled arguments an element does not understand: C1 (ING-1) |
| 0.8.3 | 2026-11-25 | as built (#9): diagnostic code chart (a chart with no data, R-REND-012.C7) |
| 0.2.0 | 2026-11-24 | Page created |
| 0.8.3 | 2026-11-25 | as built (#9): diagnostic code chart (a chart with no data, R-REND-012.C7) |
| 0.2.0 | 2026-11-24 | Page created |
