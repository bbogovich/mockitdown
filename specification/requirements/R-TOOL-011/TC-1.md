---
id: TC-1
title: Zoom and pan
verifies: [C1, C2, C3, C4, C5, C6, C7, C9]
---

Browser test (`canvas.spec.mjs`) on `pages/designer.html` with three mockups: Cmd/Ctrl+wheel zooms
about the pointer; the toolbar control reaches 10 % and 400 % and no further; Cmd/Ctrl+0 fits all
frames inside the viewport with 40 px margins; Cmd/Ctrl+1 gives 100 %; scroll, space-drag, middle-drag
and a minimap drag each pan in all four directions; `reveal("Inbox")` centres it; `reveal("Nope")`
throws.
