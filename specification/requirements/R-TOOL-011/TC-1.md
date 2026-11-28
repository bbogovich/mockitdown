---
id: TC-1
title: Zoom and pan
verifies: [C1, C2, C3, C4, C5, C6, C7, C9, C10, C11, C12, C13]
---

Browser test (`canvas.spec.mjs`, IT-69) on `pages/designer.html` with a document of three fit mockups
("Sign in" at 0, 0, "Inbox" at 600, 0, the active one, "Settings" at 0, 500): the frames stand at
their `x` and `y` (at 50 % from (-20, -40): 10, 20 and 310, 270 px), the active one holding the
designer's editor and the others a `mockitdown-mockup`; the toolbar's zoom control lists 10 % to 400 %
and Fit, reaches 10 % and 400 % and no further, nor do Cmd/Ctrl+minus and plus there or `zoom` set to 8
or 0.01; Cmd/Ctrl+plus, plus, minus give 150, 200, 150 %, Cmd/Ctrl+1 100 %; Cmd/Ctrl+wheel of -100 px
zooms by e^0.3 about the pointer, the canvas point under it staying, and the control shows "135%";
Cmd/Ctrl+0 and Fit fit all frames with 40 px margins, centred; `reveal("Inbox")` centres and fits it,
`reveal("Nope")` throws `there is no mockup named "Nope"`; Shift+2 fits the selected button (at 400 %,
centred) and, with nothing selected, the active mockup; a click on the Settings frame makes it active;
Preview mode keeps the canvas with three read-only frames and its list reveals Inbox; Code mode hides
it. A second test: a wheel of ±100 px at 200 % pans ±50 units each way, space-drags and middle-drags of
60 and 40 px pan 30 and 20 units each way without selecting, the minimap shows three frames in the
bottom right corner, dragging its viewport rectangle pans by the distance over its scale each way, and
a click on the Settings mark centres the viewport on that frame.

`node:test` (`canvas.test.ts`, IT-69): `clampZoom`, `stepZoom` up and down through every step,
`zoomAt` about a point, `centreAt`, `fitView` (200 %, clamped to 10 %, an empty box at 100 %),
`unionBox`, `viewBox`, `zoomRendering` and `minimapMapping` with its two conversions, all with
hand-computed values.
