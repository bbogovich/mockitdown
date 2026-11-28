---
requirement: R-ANN-003
title: Overlay placement and free positioning
status: implemented
version: 0.10.8
date: 2026-11-28
issue: 46
---

# R-ANN-003 — Overlay placement and free positioning

<!-- written by `vio-docs ledger record`; never edit -->

| Version | Date | Status | Issue | Change in the code | Pages |
|---|---|---|---|---|---|
| 0.10.8 | 2026-11-28 | implemented | #46 | The anchored marks of a presentation's contents (alert, confirmation dialog, sheet, cover, popover, inspector) follow its layer, as a Dialog's already did (C3, C6). Conformance annotate-dialog-contents; annotate-in-dialog regenerated. IT-74. | [Rendering](../narrative/architecture/render.md), [Conformance corpus](../narrative/conformance.md), [Testing](../narrative/testing.md) |
| 0.6.2 | 2026-11-25 | implemented | #2 | anchor prefix = sha1(pack id + LF + source)[:6] via render.anchor_prefix, replacing the hash of repr(screen.views) | [Rendering](../narrative/architecture/render.md) |
| 0.3.0 | 2026-11-25 | implemented | #2 | anchor prefix = sha1(pack id + LF + source)[:6] via render.anchor_prefix, replacing the hash of repr(screen.views) | [Rendering](../narrative/architecture/render.md) |
