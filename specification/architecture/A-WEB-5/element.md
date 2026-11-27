---
id: A-WEB-5
title: Design-tool components
status: active
version: 0.10.0
rev: 0
page: ARCH.3
slot: elements
order: 6
hash: d520a63fd2a5
level: module
---

P1: provides: the custom elements `mockitdown-designer`, `mockitdown-canvas`, `mockitdown-editor`, `mockitdown-outline`, `mockitdown-gallery`, `mockitdown-inspector`, `mockitdown-code` and `mockitdown-diagnostics` (`typescript/src/elements/`), defined by the package entry, and the test pages `pages/editor.html` and `pages/designer.html`
U1: uses A-WEB-4 — the session, the document, the history and the commands
U2: uses A-WEB-2 — previews, Preview mode and inactive mockups through `mockitdown-mockup`
U3: uses A-WEB-1 — edit-mode rendering, the lexer, role rules and parameter types
K1: Each component MUST render into its own open shadow root, be styled through custom properties and `::part`, and use no UI framework.
K2: The components MUST hold no editing rule of their own: they render the session's state and forward the user's actions to it.
