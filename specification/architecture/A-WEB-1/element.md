---
id: A-WEB-1
title: TypeScript core
status: active
version: 0.6.4
rev: 2
page: ARCH.3
slot: elements
order: 2
hash: 0c408e3392df
level: module
refs: [A-REPO-1]
---

P1: provides: `render(source, options)`, `check(source, options)`, `evaluate(source, options)`, `stylesheet(packIds, {minify})`, `loadAssets(assets)`, `registerPack(json, css)`, `registerComponents(name, source)` and the pack registry (`typescript/src/core/`)
U1: uses A-REPO-1 — the packs, icons, vocabulary and page stylesheet, copied into the package at build
K1: The TypeScript core MUST NOT access the DOM, the network or the file system; assets reach it as data.
