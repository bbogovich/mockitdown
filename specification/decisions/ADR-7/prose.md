**Context.** The prototype introduced container-query `--u` scaling (SRC-3). Production keeps it
and removes its cost for pack authors.

**Decision.** Scale by unit, not by transform, and apply the unit mechanically.

**Consequences.** Requires container queries (all current browsers). The 1px cap means mockups never
enlarge beyond their logical size.
