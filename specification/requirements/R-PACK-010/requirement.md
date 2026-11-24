---
id: R-PACK-010
title: Hidden packs
status: active
version: 0.3.0
rev: 0
page: PACK.1
slot: reqs
order: 999
source: [SRC-5]
reverse_engineered: true
hash: e7d6b5b5b895
---

C1: A pack MAY declare `"hidden": true`; a hidden pack MUST work wherever it is named (fence `pack=`, `import`) and MUST be left out of `mockitdown packs` (unless `--all`) and of the generated catalogue.
V1: `mockitdown packs` does not list `lcars`; `pack="lcars"` renders.
