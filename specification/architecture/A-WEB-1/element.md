---
id: A-WEB-1
title: TypeScript core
status: active
version: 0.10.5
rev: 4
page: ARCH.3
slot: elements
order: 2
hash: f5043dfabec6
level: module
refs: [A-REPO-1, R-EDIT-001, R-EDIT-003, R-EDIT-004, R-PACK-016, R-PACK-017]
---

P1: provides: `render(source, options)`, `check(source, options)`, `evaluate(source, options)`, `stylesheet(packIds, {minify})`, `loadAssets(assets)`, `registerPack(json, css)`, `registerComponents(name, source)` and the pack registry (`typescript/src/core/`)
P2: provides: the editing core — `parseTree`, `reparse` and `edit` (R-EDIT-001 to R-EDIT-003), the `edit` render option (R-EDIT-004), `canContain` and `allowedChildren` (R-PACK-016) and `parameterTypes` and `modifierTypes` (R-PACK-017)
U1: uses A-REPO-1 — the packs, icons, vocabulary and page stylesheet, copied into the package at build
K1: The TypeScript core MUST NOT access the DOM, the network or the file system; assets reach it as data.
