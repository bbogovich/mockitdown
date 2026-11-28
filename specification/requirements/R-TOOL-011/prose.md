The infinite canvas of SRC-15 (SRC-12#s10). Mockups are HTML, so they stay sharp at every zoom level:
frames are scaled with transforms up to 200 % and laid out again beyond, where a scaled bitmap would blur.

Re-checked at 0.10.3 together with the items it cites or is cited by (specification audit, #51): the citations are still accurate and no obligation changed.

**Re-checked at specification 0.10.7.** Its prerequisites were re-checked after the renderer split (#48, #49) and the gallery spec split (#50) without any change to an obligation; neither is this item changed.

**Re-checked at 0.11.0.** Its cited items R-TOOL-003 changed with SRC-18 (all packs recorded, stylesheet partials, gallery home page and easter eggs, TypeScript release builds, new packs); no obligation of this item changed.


**Re-checked at specification 0.12.12.** Re-read after the clarification records of the items it cites (#81), which closed the suspect citations left by the test-case backfills (#54 to #60) and the SRC-19 import map (0.12.0). No obligation it rests on changed, and none of its clauses is altered.

As built (#41): the active mockup's frame shows the designer's own editor, slotted into the canvas,
so selection, drag and drop and the inline text field work on the canvas as they did in the view; the
editor measures how much its ancestors scale it and keeps its outlines on their elements. A
rendering fills the width it is given, its device frames shrinking to fit, so a frame is given the
rendering's natural width: the device's width, or a fit rendering's own. Above 200 % the frames are
laid out again with the CSS `zoom` property, which lays text out and draws it at the zoomed size. The
view the user pans and zooms to is the canvas's own; saving it in the document is left to the work on
canvas documents.
