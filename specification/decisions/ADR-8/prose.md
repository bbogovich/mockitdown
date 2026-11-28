**Context.** Without a plugin, the Markdown layer is the only place to deliver CSS.

**Decision.** A postprocessor adds the CSS the page needs; a CLI command serves sites that prefer a
linked file.

**Consequences.** CSS is repeated across pages in inline mode — acceptable for documentation sites;
`css: none` exists for the rest.

Checked at 0.10.1: R-MDX-004 changed after this decision only by a clarification that dropped a known-deviation note (0.2.1); the decision stands.


**Re-checked at specification 0.12.10.** Re-read against R-CLI-005, R-MDX-004 (changed at 0.12.10, 0.12.8: test cases backfilled and as-built clauses recorded by #54 to #60). No obligation this item rests on changed, and none of its clauses is altered (#81).
