**Context.** SRC-2: "Ideally light and dark modes per type should be supportable."

**Decision.** Appearance is a property of the frame (`data-appearance`) resolved entirely by
generated token rules.

**Consequences.** A frame can be light inside a dark page and vice versa; `auto` tracks the
documentation theme live, without scripts.

**Re-checked at specification 0.10.7.** Its prerequisites were re-checked after the renderer split (#48, #49) and the gallery spec split (#50) without any change to an obligation; neither is this item changed.


**Re-checked at specification 0.12.10.** Re-read against R-APP-001, R-APP-002 (changed at 0.12.7: test cases backfilled and as-built clauses recorded by #54 to #60). No obligation this item rests on changed, and none of its clauses is altered (#81).
