---
id: TC-3
title: Every kind draws marks from values
verifies: [C6, C7]
---

Python and TypeScript render tests: for every kind of C1, `values: [3, 5, 2, 6, 4]` yields an SVG with at least one mark (`circle`, `rect` or `path` besides axes); a chart with no data emits the `chart` warning.
