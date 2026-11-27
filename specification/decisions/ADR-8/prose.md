**Context.** Without a plugin, the Markdown layer is the only place to deliver CSS.

**Decision.** A postprocessor adds the CSS the page needs; a CLI command serves sites that prefer a
linked file.

**Consequences.** CSS is repeated across pages in inline mode — acceptable for documentation sites;
`css: none` exists for the rest.

Checked at 0.10.1: R-MDX-004 changed after this decision only by a clarification that dropped a known-deviation note (0.2.1); the decision stands.
