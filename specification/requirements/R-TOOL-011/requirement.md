---
id: R-TOOL-011
title: "The canvas: mockitdown-canvas"
status: active
version: 0.13.20
rev: 5
page: WEB.5
slot: reqs
order: 1
hash: 5d2f8af6f837
source: [SRC-12, SRC-15]
realizes: [F-20]
requires: [R-TOOL-003]
constrained_by: [A-WEB-5]
refs: [F-20]
---

C1: The package MUST define the custom element `mockitdown-canvas`, which shows every mockup of its session's document as a frame (part `frame`, `data-mockup`) at the mockup's `x` and `y`, one canvas unit being one CSS pixel at 100 %, as wide as its rendering's device, or a fit rendering's own width, with the mockup's name above it (part `label`) at the same size at every zoom.
C2: The `zoom` property MUST hold the zoom factor, clamped to 0.1 to 4.
C3: Cmd/Ctrl with the wheel and a pinch gesture MUST zoom about the pointer, Cmd/Ctrl+plus and minus MUST step through 10, 25, 50, 75, 100, 150, 200, 300 and 400 % about the viewport's centre, and the composite designer's toolbar MUST have a zoom control (part `zoom`) offering the same steps and Fit and showing the current zoom.
C4: `fit()` and Cmd/Ctrl+0 MUST fit every frame in the viewport with a margin of 40 CSS pixels, Cmd/Ctrl+1 MUST set 100 %, and Shift+2 (`fitSelection()`) MUST fit the selected element, else the active mockup, every fit centred and within the zoom range of C2.
C5: `reveal(name)` MUST centre and fit the named mockup, and MUST throw for a name the document does not hold.
C6: The canvas MUST pan with the wheel or trackpad scroll, Shift turning a vertical wheel horizontal, by dragging with the space bar held, by dragging with the middle button, and by dragging in the minimap, and a pan drag MUST NOT reach the editor as a click.
C7: A minimap (part `minimap`) MUST show every frame (part `minimap-frame`) and the viewport's rectangle (part `minimap-viewport`) in the bottom right corner of the canvas, and a click in it MUST centre the viewport there.
C8: Up to 200 % the canvas MUST scale the frames with a CSS transform; above it, it MUST lay them out again at the zoomed size with the CSS `zoom` property and no transform scale, so that text stays sharp.
C9: In Design and Preview modes the composite designer MUST use the canvas as its view (its `canvas` property), the active mockup's frame showing the designer's editor in Design mode, and every other frame, and every frame in Preview mode (the canvas's `preview` attribute), a read-only `mockitdown-mockup`.
C10: A click on an inactive frame MUST make its mockup the session's active one (F-20.C5).
C11: The canvas's `view` (`{zoom, x, y}`, the canvas point at the viewport's top left corner) MUST start as the document's `view` and MUST NOT be written back to the document, and every change of it MUST dispatch `mockitdown-view` (bubbling, composed, `detail: {zoom, x, y}`).
C12: The arithmetic of C2 to C8 MUST be held by `mockitdown/design` (`clampZoom`, `stepZoom`, `zoomAt`, `fitView`, `zoomRendering`, `minimapMapping`), which uses no DOM.
C13: The editor's selection and hover outlines, inline text field and drop marks MUST stay on their elements in a scaled or zoomed canvas.
V1: A canvas holding three mockups zooms from 10 % to 400 % and pans in every direction, and the mockups' text stays sharp (F-20.AC1).
