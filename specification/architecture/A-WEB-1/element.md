---
id: A-WEB-1
title: TypeScript core
status: active
version: 0.6.0
rev: 0
page: ARCH.3
slot: elements
order: 2
hash: a29befb1b185
level: module
---

P1: provides: `render(source, options)`, `check(source, options)`, `stylesheet(packIds, appearance)`, `registerPack(json, css)`, `registerComponents(name, source)` and the pack registry (`typescript/src/core/`)
U1: uses A-REPO-1 — the packs, icons, vocabulary and page stylesheet, copied into the package at build
K1: The TypeScript core MUST NOT access the DOM, the network or the file system; assets reach it as data.
