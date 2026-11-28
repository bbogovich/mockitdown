**Context.** SRC-2: "We are switching from MkDocs to Zensical for the docs." Zensical (0.1.3,
November 2026) is the Material for MkDocs team's successor; it reads `mkdocs.yml`.

**Decision.** Build every site of the project with Zensical.

**Consequences.** Some MkDocs conveniences are missing (Mermaid injection, plugins); they are
replaced by site assets or by design (ADR-3).


**Re-checked at specification 0.12.10.** Re-read against R-MDX-001 (changed at 0.12.10: test cases backfilled and as-built clauses recorded by #54 to #60). No obligation this item rests on changed, and none of its clauses is altered (#81).
