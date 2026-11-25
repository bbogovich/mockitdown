---
id: A-WEB-2
title: Mockup element
status: active
version: 0.6.0
rev: 0
page: ARCH.3
slot: elements
order: 3
hash: 24fad257c608
level: module
---

P1: provides: the custom element `mockitdown-mockup` (`typescript/src/elements/mockup.ts`) and the package entry `dist/mockitdown.js`, which defines it
U1: uses A-WEB-1 — render the code and build the stylesheet
K1: The mockup element MUST render into its own shadow root so page styles and pack styles do not leak into each other.
<!-- file: prose.md -->
The DOM side of the renderer: reads the script child and attributes, loads packs, renders and reports diagnostics.
