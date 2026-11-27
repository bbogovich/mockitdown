---
id: R-EDIT-004
title: Edit-mode rendering
status: active
version: 0.10.0
rev: 0
page: WEB.3
slot: reqs
order: 4
hash: 9406c40a3213
source: [SRC-12]
realizes: [F-21]
requires: [R-EDIT-001]
constrained_by: [A-REND-1, A-WEB-1, M-OPT-1, M-VIEW-1, ADR-22]
---

C1: Both variants MUST offer the render option `edit` (M-OPT-1), a boolean that is false by default.
C2: When `edit` is false, the rendered HTML MUST be byte-identical to the HTML rendered without the option.
C3: Both variants MUST number the view nodes of a source as R-EDIT-001.C3 and R-EDIT-001.C4 define, from the parser's positions.
C4: When `edit` is true, the renderer MUST give the root element of every view produced from a view node the attribute `data-mkd-node` set to that node's ordinal (`n12`).
C5: When `edit` is true and a view was produced inside the body of a `ForEach`, a branch of an `if` statement or the body of a struct instantiated by a call, the renderer MUST also give its root element `data-mkd-derived`, set to the ordinal of the innermost such `ForEach` call, `if` statement or struct call.
C6: The renderer MUST write `data-mkd-node` and then `data-mkd-derived` directly after the element's `data-el` attribute (R-REND-002.C2).
C7: A view not produced from a view node (a string literal or a variable used as a view, R-EVAL-003.C4, R-EVAL-003.C5) MUST carry neither attribute.
C8: The annotation marks (R-ANN-003), the Elements table and the source disclosure MUST carry neither attribute.
C9: The conformance corpus MUST hold edit-mode cases — their `<name>.json` setting `edit: true` — that cover nested stacks, a list of cards, modifier chains, slots and labelled closures, a presentation, `ForEach`, `if`/`else`, a struct component and a string literal used as a view.
C10: The Python library API and the TypeScript `render` MUST both accept `edit`; the Markdown fence and the command line MUST NOT offer it.
V1: Every edit-mode case of the conformance corpus renders the same HTML in both variants, and every case renders byte-identically with `edit: false` and without the option.
