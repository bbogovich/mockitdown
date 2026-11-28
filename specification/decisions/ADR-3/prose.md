**Context.** The prototype's plugin copied kit CSS into the site, warned about instant navigation
and failed strict builds. Zensical reads `mkdocs.yml` and runs Python-Markdown extensions and
superfences fences, but not MkDocs plugins.

**Decision.** Move every responsibility into the Markdown layer that both tools share.

**Consequences.** One integration for every Python-Markdown host. The cost is C3: Python-Markdown
does not tell an extension which file it is converting.

Checked at 0.10.1: R-MDX-004 changed after this decision only by a clarification that dropped a known-deviation note (0.2.1); the decision stands.


**Re-checked at specification 0.12.10.** Re-read against R-MDX-001, R-MDX-004, R-MDX-005 (changed at 0.12.10: test cases backfilled and as-built clauses recorded by #54 to #60). No obligation this item rests on changed, and none of its clauses is altered (#81).
