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
<!-- file: TC-1.md -->
---
id: TC-1
title: Edit-mode conformance cases
verifies: [C3, C4, C5, C6, C7, C8, C9]
---

`gen_conformance.py` renders the edit-mode cases (`edit-*` names, `edit: true`) with Python; both
suites compare their output with the expected HTML (R-REPO-004.C5). A Python unit test checks, for each
edit-mode case, that every element carrying `data-el` that a view node produced carries `data-mkd-node`,
that the derived ones carry `data-mkd-derived` naming a `ForEach`, `if` or struct call, and that marks
and tables carry neither.
<!-- file: TC-2.md -->
---
id: TC-2
title: Off means unchanged
verifies: [C1, C2, C10]
---

Both suites render every conformance case with `edit: false` added to its options and compare with the
unchanged expected HTML. The Python API and TypeScript `render` accept `edit`; the fence reports an `edit`
attribute as an unknown fence option (R-MDX-003.C4), and the CLI has no such option.
<!-- file: prose.md -->
Source mapping in the rendered HTML (SRC-12#s9, SRC-12#s13). With `edit` on, every element produced
from a call names its node, so a click in the editable view finds its outline row; elements a loop, a
condition or a component body produced name the construct that produced them, so the editor selects the
construct and shows a "derived" badge.

```html
<div class="mkd-vstack" data-el="VStack" data-mkd-node="n1">
  <span class="mkd-text" data-el="Text" data-mkd-node="n3" data-mkd-derived="n2">Mon</span>
  <span class="mkd-text" data-el="Text" data-mkd-node="n3" data-mkd-derived="n2">Tue</span>
</div>
```

The attributes carry ordinals, which both parsers compute the same way, not the TypeScript session's
stable ids; the session maps one to the other (R-EDIT-006.C9). The option therefore exists in both
variants and is held to the conformance corpus like every other rendering (ADR-22, ADR-18.C1). It is a
library option only: a documentation page has no use for it.
