---
id: ADR-3
title: Integrate as a Python-Markdown extension and a superfences fence, without a MkDocs plugin
status: active
version: 0.2.0
rev: 0
page: ADR.1
slot: decisions
order: 3
source: [SRC-2, SRC-3]
constrains: [R-MDX-001, R-MDX-004, R-MDX-005]
hash: 67e6966a0a23
---

D1: mockitdown integrates with documentation sites as a Python-Markdown extension (configuration, per-page CSS) plus a `pymdownx.superfences` custom fence (rendering, logging, strict failure), and ships no MkDocs plugin.
O1: rejected: keep the prototype's MkDocs plugin — Zensical does not run MkDocs plugins (verified with zensical 0.1.3 on 2026-11-23), and the project's documentation moves to Zensical (SRC-2).
O2: rejected: a Zensical-specific plugin — Zensical's plugin API is not stable before 1.0 and would split the integration in two.
C1: The same configuration works in MkDocs, Zensical and any Python-Markdown pipeline.
C2: Everything the plugin did moves to the Markdown layer: CSS by a postprocessor, strict mode by raising `SuperFencesException`, asset handling by embedding (ADR-9).
C3: The fence cannot know the page's file path, so block-relative imports and assets resolve through the configured directories only.
<!-- file: prose.md -->
**Context.** The prototype's plugin copied kit CSS into the site, warned about instant navigation
and failed strict builds. Zensical reads `mkdocs.yml` and runs Python-Markdown extensions and
superfences fences, but not MkDocs plugins.

**Decision.** Move every responsibility into the Markdown layer that both tools share.

**Consequences.** One integration for every Python-Markdown host. The cost is C3: Python-Markdown
does not tell an extension which file it is converting.
