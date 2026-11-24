---
id: ADR-14
title: Documentation sites build with Zensical
status: active
version: 0.2.0
rev: 0
page: ADR.2
slot: decisions
order: 7
source: [SRC-2]
constrains: [R-MDX-001]
hash: b20985c585fe
---

D1: The project's documentation site (this site, the `docs` branch) and the example site build with Zensical, with `theme.variant: classic`.
D2: Mermaid diagrams are rendered by a small loader script, because Zensical does not inject Mermaid.
O1: rejected: stay on MkDocs 1.x with Material — MkDocs is in low maintenance and SRC-2 directs the switch.
O2: rejected: Zensical's default `modern` variant — drops the Material header colouring this site relies on.
C1: mockitdown must work without MkDocs plugins (ADR-3).
C2: The sites keep `mkdocs.yml` (Zensical reads it) and a `requirements.txt` naming Zensical.
C3: Zensical is pre-1.0; the build is re-verified when it is upgraded.
