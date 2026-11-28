**Context.** The prototype's `fiori` kit emitted real `ui5-*` tags that "come alive" under the UI5
runtime (SRC-3). With seven frameworks, three of them React/Angular libraries, real runtimes are
impractical in a documentation page.

**Decision.** Replicate each design language in CSS.

**Consequences.** mockitdown owns the fidelity of every pack; the example site is the visual
regression reference.

**Re-checked at specification 0.10.7.** Its prerequisites were re-checked after the renderer split (#48, #49) and the gallery spec split (#50) without any change to an obligation; neither is this item changed.


**Re-checked at specification 0.12.10.** Re-read against R-MDX-006, R-REND-006, R-REND-007 (changed at 0.12.10: test cases backfilled and as-built clauses recorded by #54 to #60). No obligation this item rests on changed, and none of its clauses is altered (#81).
