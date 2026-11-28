**Context.** Every dependency is a long-term liability (project policy); documentation toolchains
already bring Python-Markdown and pymdown-extensions.

**Decision.** Standard library only in the core.

**Consequences.** Slightly more code to own; nothing to audit or pin beyond the extra.


**Re-checked at specification 0.12.10.** Re-read against R-API-004 (changed at 0.12.7: test cases backfilled and as-built clauses recorded by #54 to #60). No obligation this item rests on changed, and none of its clauses is altered (#81).
