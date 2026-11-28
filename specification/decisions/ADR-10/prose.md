**Context.** SRC-2: "a site can define custom reusable controls within a doc site; import
statements at the start of the fenced code block can indicate where to retrieve the custom
components from."

**Decision.** Swift's own component mechanism, plus a quoted-path import.

**Consequences.** Components are evaluated per use (no compilation step); a deep or recursive
component is cut off by the nesting limit.


**Re-checked at specification 0.12.10.** Re-read against R-IMP-001, R-IMP-003 (changed at 0.12.8: test cases backfilled and as-built clauses recorded by #54 to #60). No obligation this item rests on changed, and none of its clauses is altered (#81).
