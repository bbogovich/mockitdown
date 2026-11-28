---
id: R-TOOL-011.CR-5
target: R-TOOL-011
kind: revision
version: 0.13.20
date: 2026-11-28
issue: 41
summary: "as built (#41): frames with labels and natural widths (C1); zoom control part and steps about the centre (C3); fitSelection, fits clamped and centred (C4); Shift+wheel, minimap drag, no click after a pan (C6); minimap parts, bottom right (C7); CSS zoom above 200 % (C8); the designer's editor in the active frame, read-only frames, the canvas property (C9); click activates (C10); view from the document, mockitdown-view (C11); arithmetic in mockitdown/design (C12); editor outlines in a scaled canvas (C13); TC-1 and TC-2 name their tests (IT-69)"
from: a6dc8632060c
to: 5d2f8af6f837
---

## Clauses

@ C1 edit
~ The package MUST define the custom element `mockitdown-canvas`, which shows every mockup of its session's document as a frame {+(part `frame`, `data-mockup`) +}at the mockup's `x` and `y`, one canvas unit being one CSS pixel at 100 [-%.-]{+%, as wide as its rendering's device, or a fit rendering's own width, with the mockup's name above it (part `label`) at the same size at every zoom.+}
@ C3 edit
~ Cmd/Ctrl with the wheel and a pinch gesture MUST zoom about the pointer, Cmd/Ctrl+plus and minus MUST step through 10, 25, 50, 75, 100, 150, 200, 300 and 400 [-%,-]{+% about the viewport's centre,+} and the composite designer's toolbar MUST have a zoom control {+(part `zoom`) +}offering the same steps and [-fit.-]{+Fit and showing the current zoom.+}
@ C4 edit
~ `fit()` and Cmd/Ctrl+0 MUST fit every frame in the viewport with a margin of 40 CSS pixels, Cmd/Ctrl+1 MUST set 100 %, and Shift+2 {+(`fitSelection()`) +}MUST fit the selected element, else the active [-mockup.-]{+mockup, every fit centred and within the zoom range of C2.+}
@ C6 edit
~ The canvas MUST pan with the wheel or trackpad scroll,{+ Shift turning a vertical wheel horizontal,+} by dragging with the space bar held, by dragging with the middle button, and by dragging {+in +}the [-minimap's-]{+minimap,+} [-viewport.-]{+and a pan drag MUST NOT reach the editor as a click.+}
@ C7 edit
~ A minimap{+ (part `minimap`)+} MUST show every frame {+(part `minimap-frame`) +}and the viewport's rectangle {+(part `minimap-viewport`) +}in [-a-]{+the bottom right+} corner of the canvas, and a click in it MUST centre the viewport there.
@ C8 edit
~ Up to 200 % the canvas MUST scale the frames with a CSS transform; above it, it MUST lay them out again at the zoomed [-size,-]{+size with the CSS `zoom` property and no transform scale,+} so that text stays sharp.
@ C9 replace
- In Design and Preview modes the composite designer MUST use the canvas as its view.
+ In Design and Preview modes the composite designer MUST use the canvas as its view (its `canvas` property), the active mockup's frame showing the designer's editor in Design mode, and every other frame, and every frame in Preview mode (the canvas's `preview` attribute), a read-only `mockitdown-mockup`.
@ C10 insert after C9
+ A click on an inactive frame MUST make its mockup the session's active one (F-20.C5).
@ C11 insert after C10
+ The canvas's `view` (`{zoom, x, y}`, the canvas point at the viewport's top left corner) MUST start as the document's `view` and MUST NOT be written back to the document, and every change of it MUST dispatch `mockitdown-view` (bubbling, composed, `detail: {zoom, x, y}`).
@ C12 insert after C11
+ The arithmetic of C2 to C8 MUST be held by `mockitdown/design` (`clampZoom`, `stepZoom`, `zoomAt`, `fitView`, `zoomRendering`, `minimapMapping`), which uses no DOM.
@ C13 insert after C12
+ The editor's selection and hover outlines, inline text field and drop marks MUST stay on their elements in a scaled or zoomed canvas.

## Files

```diff
--- a/TC-1.md
+++ b/TC-1.md
@@ -3,9 +3,24 @@
 title: Zoom and pan
-verifies: [C1, C2, C3, C4, C5, C6, C7, C9]
+verifies: [C1, C2, C3, C4, C5, C6, C7, C9, C10, C11, C12, C13]
 ---
 
-Browser test (`canvas.spec.mjs`) on `pages/designer.html` with three mockups: Cmd/Ctrl+wheel zooms
-about the pointer; the toolbar control reaches 10 % and 400 % and no further; Cmd/Ctrl+0 fits all
-frames inside the viewport with 40 px margins; Cmd/Ctrl+1 gives 100 %; scroll, space-drag, middle-drag
-and a minimap drag each pan in all four directions; `reveal("Inbox")` centres it; `reveal("Nope")`
-throws.
+Browser test (`canvas.spec.mjs`, IT-69) on `pages/designer.html` with a document of three fit mockups
+("Sign in" at 0, 0, "Inbox" at 600, 0, the active one, "Settings" at 0, 500): the frames stand at
+their `x` and `y` (at 50 % from (-20, -40): 10, 20 and 310, 270 px), the active one holding the
+designer's editor and the others a `mockitdown-mockup`; the toolbar's zoom control lists 10 % to 400 %
+and Fit, reaches 10 % and 400 % and no further, nor do Cmd/Ctrl+minus and plus there or `zoom` set to 8
+or 0.01; Cmd/Ctrl+plus, plus, minus give 150, 200, 150 %, Cmd/Ctrl+1 100 %; Cmd/Ctrl+wheel of -100 px
+zooms by e^0.3 about the pointer, the canvas point under it staying, and the control shows "135%";
+Cmd/Ctrl+0 and Fit fit all frames with 40 px margins, centred; `reveal("Inbox")` centres and fits it,
+`reveal("Nope")` throws `there is no mockup named "Nope"`; Shift+2 fits the selected button (at 400 %,
+centred) and, with nothing selected, the active mockup; a click on the Settings frame makes it active;
+Preview mode keeps the canvas with three read-only frames and its list reveals Inbox; Code mode hides
+it. A second test: a wheel of ±100 px at 200 % pans ±50 units each way, space-drags and middle-drags of
+60 and 40 px pan 30 and 20 units each way without selecting, the minimap shows three frames in the
+bottom right corner, dragging its viewport rectangle pans by the distance over its scale each way, and
+a click on the Settings mark centres the viewport on that frame.
+
+`node:test` (`canvas.test.ts`, IT-69): `clampZoom`, `stepZoom` up and down through every step,
+`zoomAt` about a point, `centreAt`, `fitView` (200 %, clamped to 10 %, an empty box at 100 %),
+`unionBox`, `viewBox`, `zoomRendering` and `minimapMapping` with its two conversions, all with
+hand-computed values.
--- a/TC-2.md
+++ b/TC-2.md
@@ -6,4 +6,5 @@
 
-Browser test: at 400 % a text element's computed font size times the remaining transform scale equals
-four times its 100 % size and the frame has no transform scale above 2 (F-20.AC1); a screenshot of a
-text at 400 % has no blur against a reference rendered at that size.
+Browser test (`canvas.spec.mjs`, IT-69): the Settings text at 200 % is twice and at 400 % four times
+its 100 % height (±1 px); the canvas's world is scaled by 1, 2 and 1 and the frame's CSS `zoom` is 1, 1
+and 4, so no transform scales above 2 (F-20.AC1); a screenshot of the text at 400 % matches, within a
+mean channel difference of 8, the same mockup laid out alone at CSS `zoom` 4.
--- a/prose.md
+++ b/prose.md
@@ -11 +11,10 @@
 **Re-checked at specification 0.12.12.** Re-read after the clarification records of the items it cites (#81), which closed the suspect citations left by the test-case backfills (#54 to #60) and the SRC-19 import map (0.12.0). No obligation it rests on changed, and none of its clauses is altered.
+
+As built (#41): the active mockup's frame shows the designer's own editor, slotted into the canvas,
+so selection, drag and drop and the inline text field work on the canvas as they did in the view; the
+editor measures how much its ancestors scale it and keeps its outlines on their elements. A
+rendering fills the width it is given, its device frames shrinking to fit, so a frame is given the
+rendering's natural width: the device's width, or a fit rendering's own. Above 200 % the frames are
+laid out again with the CSS `zoom` property, which lays text out and draws it at the zoomed size. The
+view the user pans and zooms to is the canvas's own; saving it in the document is left to the work on
+canvas documents.
```
