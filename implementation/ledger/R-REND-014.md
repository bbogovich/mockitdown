---
requirement: R-REND-014
title: Shape framing
status: implemented
version: 0.8.3
date: 2026-11-25
issue: 9
---

# R-REND-014 — Shape framing

<!-- written by `sio-docs ledger record`; never edit -->

| Version | Date | Status | Issue | Change in the code | Pages |
|---|---|---|---|---|---|
| 0.8.3 | 2026-11-25 | implemented | #9 | base pack.css: Circle is a size container whose ::before is a min(100cqw,100cqh) disc centred in the frame; Ellipse border-radius 50%, Capsule 9999px; a circle's .stroke()/.shadow() go to --mkd-shape-stroke and filter: drop-shadow (style.py/style.ts _is_circle); Ellipse in .background(in:)/.clipShape() 50%; sketch pack no longer wobbles circle/ellipse/capsule; IT-17 shape geometry in every pack | [Rendering](../narrative/architecture/render.md), [Testing](../narrative/testing.md), [Conformance corpus](../narrative/conformance.md) |
