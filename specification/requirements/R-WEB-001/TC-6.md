---
id: TC-6
title: Import map in the TypeScript core
verifies: [C6, C10]
---

TypeScript unit tests run the cases of R-IMP-002.TC-1 that need no file system with registered components and a stub fetch: a registered `shared/kpi` wins over the map; `imports` with `acme/` → `https://h/acme/` asks for `https://h/acme/cards` then `https://h/acme/cards.mockitdown` (C6); with neither map nor source path, `import "pill"` tries `pill` then `pill.mockitdown` (C10).
