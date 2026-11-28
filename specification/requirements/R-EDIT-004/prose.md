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

Derivation follows where code is written. A view in a closure passed to a component (`Card { Text("x") }`)
is written at the call, so it names its own node and is not derived from the component; the component's
body is. A component imported from another file has no ordinals in this source: its views carry only
`data-mkd-derived`, naming the call, which is what the editor can select. Each variant computes the
ordinals with its own parser (Python: `mockitdown.syntax.nodes.view_nodes`), and both number every
source of the corpus alike.

The attributes carry ordinals, which both parsers compute the same way, not the TypeScript session's
stable ids; the session maps one to the other (R-EDIT-006.C9). The option therefore exists in both
variants and is held to the conformance corpus like every other rendering (ADR-22, ADR-18.C1). It is a
library option only: a documentation page has no use for it.

Re-checked at 0.10.3 together with the items it cites or is cited by (specification audit, #51): the citations are still accurate and no obligation changed.

**Re-checked at specification 0.10.6.** A-REND-1 and A-WEB-1 were revised as built by the behaviour-preserving renderer split (#48, #49), and the gallery test cases only renamed their files (#50); no obligation here changed.

**Re-checked at specification 0.10.7.** Its prerequisites were re-checked after the renderer split (#48, #49) and the gallery spec split (#50) without any change to an obligation; neither is this item changed.

**Re-checked at 0.11.0.** Its cited items ADR-22, R-EDIT-001 changed with SRC-18 (all packs recorded, stylesheet partials, gallery home page and easter eggs, TypeScript release builds, new packs); no obligation of this item changed.


**Re-checked at specification 0.12.10.** Re-read against M-OPT-1 (changed at 0.12.7: test cases backfilled and as-built clauses recorded by #54 to #60). No obligation this item rests on changed, and none of its clauses is altered (#81).


**Re-checked at specification 0.12.12.** Re-read after the clarification records of the items it cites (#81), which closed the suspect citations left by the test-case backfills (#54 to #60) and the SRC-19 import map (0.12.0). No obligation it rests on changed, and none of its clauses is altered.
