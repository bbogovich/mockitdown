---
id: R-TOOL-011
title: "The canvas: mockitdown-canvas"
status: active
version: 0.10.0
rev: 0
page: WEB.5
slot: reqs
order: 1
hash: 25474e52f3ae
source: [SRC-12, SRC-15]
realizes: [F-20]
requires: [R-TOOL-003]
constrained_by: [A-WEB-5]
---

C1: The package MUST define the custom element `mockitdown-canvas`, which shows every mockup of its session's document as a frame at the mockup's `x` and `y`, one canvas unit being one CSS pixel at 100 %.
C2: The `zoom` property MUST hold the zoom factor, clamped to 0.1 to 4.
C3: Cmd/Ctrl with the wheel and a pinch gesture MUST zoom about the pointer, Cmd/Ctrl+plus and minus MUST step through 10, 25, 50, 75, 100, 150, 200, 300 and 400 %, and the composite designer's toolbar MUST have a zoom control offering the same steps and fit.
C4: `fit()` and Cmd/Ctrl+0 MUST fit every frame in the viewport with a margin of 40 CSS pixels, Cmd/Ctrl+1 MUST set 100 %, and Shift+2 MUST fit the selected element, else the active mockup.
C5: `reveal(name)` MUST centre and fit the named mockup, and MUST throw for a name the document does not hold.
C6: The canvas MUST pan with the wheel or trackpad scroll, by dragging with the space bar held, by dragging with the middle button, and by dragging the minimap's viewport.
C7: A minimap MUST show every frame and the viewport's rectangle in a corner of the canvas, and a click in it MUST centre the viewport there.
C8: Up to 200 % the canvas MUST scale the frames with a CSS transform; above it, it MUST lay them out again at the zoomed size, so that text stays sharp.
C9: In Design and Preview modes the composite designer MUST use the canvas as its view.
V1: A canvas holding three mockups zooms from 10 % to 400 % and pans in every direction, and the mockups' text stays sharp (F-20.AC1).
<!-- file: TC-1.md -->
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
<!-- file: TC-2.md -->
---
id: TC-2
title: Crisp at 400 %
verifies: [C8]
---

Browser test: at 400 % a text element's computed font size times the remaining transform scale equals
four times its 100 % size and the frame has no transform scale above 2 (F-20.AC1); a screenshot of a
text at 400 % has no blur against a reference rendered at that size.
<!-- file: prose.md -->
The infinite canvas of SRC-15 (SRC-12#s10). Mockups are HTML, so they stay sharp at every zoom level:
frames are scaled with transforms up to 200 % and laid out again beyond, where a scaled bitmap would blur.
