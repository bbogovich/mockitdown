---
id: ADR-14
title: Documentation sites build with Zensical
status: active
version: 0.12.11
rev: 1
page: ADR.2
slot: decisions
order: 7
source: [SRC-2]
constrains: [R-MDX-001]
hash: b39a1a9a8570
refs: [ADR-3]
---

D1: The project's documentation site (this site, the `docs` branch) and the example site build with Zensical, with `theme.variant: classic`.
D2: Mermaid diagrams are rendered by a small loader script, because Zensical does not inject Mermaid.
O1: rejected: stay on MkDocs 1.x with Material — MkDocs is in low maintenance and SRC-2 directs the switch.
O2: rejected: Zensical's default `modern` variant — drops the Material header colouring this site relies on.
C1: mockitdown must work without MkDocs plugins (ADR-3).
C2: The sites keep `mkdocs.yml` (Zensical reads it) and a `requirements.txt` naming Zensical.
C3: Zensical is pre-1.0; the build is re-verified when it is upgraded.
