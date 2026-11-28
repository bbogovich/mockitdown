---
id: R-TOOL-011
title: "The canvas: mockitdown-canvas"
status: active
version: 0.12.12
rev: 4
page: WEB.5
slot: reqs
order: 1
hash: a6dc8632060c
source: [SRC-12, SRC-15]
realizes: [F-20]
requires: [R-TOOL-003]
constrained_by: [A-WEB-5]
refs: [F-20]
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
