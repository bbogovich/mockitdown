**Context.** Without a plugin, the Markdown layer is the only place to deliver CSS.

**Decision.** A postprocessor adds the CSS the page needs; a CLI command serves sites that prefer a
linked file.

**Consequences.** CSS is repeated across pages in inline mode — acceptable for documentation sites;
`css: none` exists for the rest.
