---
requirement: R-ANN-003
title: Overlay placement and free positioning
status: implemented
version: 0.6.2
date: 2026-11-25
issue: 2
---

# R-ANN-003 — Overlay placement and free positioning

<!-- written by `sio-docs ledger record`; never edit -->

| Version | Date | Status | Issue | Change in the code | Pages |
|---|---|---|---|---|---|
| 0.6.2 | 2026-11-25 | implemented | #2 | anchor prefix = sha1(pack id + LF + source)[:6] via render.anchor_prefix, replacing the hash of repr(screen.views) | [Rendering](../narrative/architecture/render.md) |
| 0.3.0 | 2026-11-25 | implemented | #2 | anchor prefix = sha1(pack id + LF + source)[:6] via render.anchor_prefix, replacing the hash of repr(screen.views) | [Rendering](../narrative/architecture/render.md) |
