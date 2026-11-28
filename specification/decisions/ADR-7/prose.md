**Context.** The prototype introduced container-query `--u` scaling (SRC-3). Production keeps it
and removes its cost for pack authors.

**Decision.** Scale by unit, not by transform, and apply the unit mechanically.

**Consequences.** Requires container queries (all current browsers). The 1px cap means mockups never
enlarge beyond their logical size.


**Re-checked at specification 0.12.10.** Re-read against R-DEV-003 (changed at 0.12.9: test cases backfilled and as-built clauses recorded by #54 to #60). No obligation this item rests on changed, and none of its clauses is altered (#81).
