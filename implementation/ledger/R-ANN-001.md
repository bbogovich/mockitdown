---
requirement: R-ANN-001
title: Numbered callouts
status: implemented
version: 0.10.0
date: 2026-11-28
issue: 46
---

# R-ANN-001 — Numbered callouts

<!-- written by `vio-docs ledger record`; never edit -->

| Version | Date | Status | Issue | Change in the code | Pages |
|---|---|---|---|---|---|
| 0.10.0 | 2026-11-28 | implemented | #46 | Overlays keep their marks: r_dialog, r_toast and r_fab (dialog, toast, fab in TypeScript) add their layer through present(), which decorates the overlay's root inside the layer and puts its anchored mark after it (C6). Conformance annotate-overlay-callouts. IT-74. | [Rendering](../narrative/architecture/render.md), [Conformance corpus](../narrative/conformance.md), [Testing](../narrative/testing.md) |
