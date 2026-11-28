---
id: A-WEB-5
title: Design-tool components
status: active
version: 0.14.2
rev: 1
page: ARCH.3
slot: elements
order: 6
hash: bb5539a5b8f8
level: module
refs: [A-WEB-1, A-WEB-2, A-WEB-4]
---

P1: provides: the custom elements `mockitdown-designer`, `mockitdown-canvas`, `mockitdown-editor`, `mockitdown-outline`, `mockitdown-gallery`, `mockitdown-inspector`, `mockitdown-code` and `mockitdown-diagnostics` (`typescript/src/elements/`), defined by the package entry, the editor, the outline and the gallery scheduling their renders through the shared `RenderScheduler` (`typescript/src/elements/scheduler.ts`), and the test pages `pages/editor.html` and `pages/designer.html`
U1: uses A-WEB-4 — the session, the document, the history and the commands
U2: uses A-WEB-2 — previews, Preview mode and inactive mockups through `mockitdown-mockup`
U3: uses A-WEB-1 — edit-mode rendering, the lexer, role rules and parameter types
K1: Each component MUST render into its own open shadow root, be styled through custom properties and `::part`, and use no UI framework.
K2: The components MUST hold no editing rule of their own: they render the session's state and forward the user's actions to it.
