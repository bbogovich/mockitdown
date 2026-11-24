---
id: M-API-1
title: RenderResult
status: active
version: 0.2.0
rev: 0
page: MODEL.1
slot: entities
order: 10
level: entity
hash: 650e60bc3eaf
---

F1: html: str — error box, figure and optional source disclosure
F2: diagnostics: list — every diagnostic, in order
F3: packs: list — ids of the selected pack's lineage, root first; empty on a syntax error
F4: screen: Screen · optional — the evaluated screen
R1: diagnostics: → M-DIAG-1 (0..*) — reported problems
R2: screen: → M-VIEW-3 (0..1) — the evaluated mockup
