---
id: A-WEB-4
title: Design document and session module
status: active
version: 0.10.0
rev: 0
page: ARCH.3
slot: elements
order: 5
hash: f300710611f1
level: module
---

P1: provides: the module `dist/design.js` (subpath `mockitdown/design`, `typescript/src/design/`): `readDesign`, `writeDesign`, `newDesign`, `mockupOptions` and `DesignSession` with its history and commands
U1: uses A-WEB-1 — parse, re-parse, edit and render the mockups' code, and the role rules
K1: The module MUST NOT access the DOM, the network or the file system, so that a desktop shell's main process can use it in Node.
K2: The session MUST change a mockup's code only through edit operations, commands and code changes it records in its history.
