---
requirement: R-WEB-002
title: The mockitdown-mockup element
status: implemented
version: 0.12.12
date: 2026-11-28
issue: 23
---

# R-WEB-002 — The mockitdown-mockup element

<!-- written by `vio-docs ledger record`; never edit -->

| Version | Date | Status | Issue | Change in the code | Pages |
|---|---|---|---|---|---|
| 0.12.12 | 2026-11-28 | implemented | #23 | C13: the mockup element observes the boolean edit attribute (no fence attribute) and renders with the edit option; removing it re-renders without data-mkd-node (TC-4) | [The mockup element](../narrative/architecture/elements.md), [Testing](../narrative/testing.md) |
| 0.8.9 | 2026-11-25 | implemented | #13 | the windowed attribute (FENCE_OPTIONS) | [TypeScript core](../narrative/architecture/typescript.md) |
| 0.6.7 | 2026-11-25 | implemented | #7 | no code change: editorial prose at 0.6.7 (the gallery creates elements on demand); reviewed against ADR-19 as clarified | [The mockup element](../narrative/architecture/elements.md) |
| 0.6.6 | 2026-11-25 | implemented | #6 | mockitdown-mockup element (src/elements/mockup.ts, defined by dist/mockitdown.js): script child dedented, fence attributes + window + import-base/asset-base, shadow root with one constructed stylesheet per pack set, re-render on attribute/script change, imports fetched by re-render rounds, fence and element error boxes, composed mockitdown-diagnostics event, code/diagnostics/rendered; pages/mockup.html; IT-14 | [The mockup element](../narrative/architecture/elements.md), [Web development server, test pages and browser tests](../narrative/architecture/web-dev.md), [Testing](../narrative/testing.md) |
| 0.6.0 | 2026-11-25 | implemented | #6 | mockitdown-mockup element (src/elements/mockup.ts, defined by dist/mockitdown.js): script child dedented, fence attributes + window + import-base/asset-base, shadow root with one constructed stylesheet per pack set, re-render on attribute/script change, imports fetched by re-render rounds, fence and element error boxes, composed mockitdown-diagnostics event, code/diagnostics/rendered; pages/mockup.html; IT-14 | [The mockup element](../narrative/architecture/elements.md), [Web development server, test pages and browser tests](../narrative/architecture/web-dev.md), [Testing](../narrative/testing.md) |
