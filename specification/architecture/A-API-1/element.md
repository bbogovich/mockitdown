---
id: A-API-1
title: Library API
status: active
version: 0.2.0
rev: 0
page: ARCH.1
slot: elements
order: 1
level: module
realizes: [F-13, F-11]
hash: da46fa05f953
---

P1: provides: `render`, `check`, `evaluate`, `stylesheet`, `RenderResult` and the error box (`mockitdown`, `mockitdown.api`)
P2: provides: the `makeExtension` entry point that Python-Markdown loads for `markdown_extensions: [mockitdown]`
U1: uses A-SYN-2 — parse the source
U2: uses A-EVAL-1 — evaluate the module into a screen
U3: uses A-REND-2 — assemble the figure
U4: uses A-ASSET-1 — resolve images during rendering
U5: uses A-STYLE-1 — build stylesheets
U6: uses A-PACK-1 — look up packs
K1: The library API MUST be the only entry point the fence, the CLI and external callers use to render.
K2: The library API MUST NOT import Python-Markdown or pymdown-extensions.
