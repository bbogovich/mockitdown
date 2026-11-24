**Context.** SRC-2: "We are switching from MkDocs to Zensical for the docs." Zensical (0.1.3,
November 2026) is the Material for MkDocs team's successor; it reads `mkdocs.yml`.

**Decision.** Build every site of the project with Zensical.

**Consequences.** Some MkDocs conveniences are missing (Mermaid injection, plugins); they are
replaced by site assets or by design (ADR-3).
