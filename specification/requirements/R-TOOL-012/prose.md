Each mockup is a frame with its name above it (SRC-15#p1.c1). The name is the key SpecItOut tools
import a mockup by, so it is unique, kept exactly as written, and a default name earns a warning in the
Mockups list (SRC-12#s10).

Re-checked at 0.10.3 together with the items it cites or is cited by (specification audit, #51): the citations are still accurate and no obligation changed.

**Re-checked at specification 0.10.7.** Its prerequisites were re-checked after the renderer split (#48, #49) and the gallery spec split (#50) without any change to an obligation; neither is this item changed.

**Re-checked at 0.11.0.** Its cited items R-EDIT-007, R-TOOL-011 changed with SRC-18 (all packs recorded, stylesheet partials, gallery home page and easter eggs, TypeScript release builds, new packs); no obligation of this item changed.


**Re-checked at specification 0.12.12.** Re-read after the clarification records of the items it cites (#81), which closed the suspect citations left by the test-case backfills (#54 to #60) and the SRC-19 import map (0.12.0). No obligation it rests on changed, and none of its clauses is altered.

**As built (#42).** The canvas moves a frame by its label and renames it in place; the session holds the
rules (`renameMockup`, `newMockup`) and `mockitdown/design`'s frames.ts the arithmetic. A move starts
after 3 px so that a click or a double-click on a label never moves it. Snapping works per axis: the
nearest edge of another frame within 6 screen pixels (6 / zoom canvas units) wins over the 8-unit grid.
A new mockup is placed by the frames' measured sizes, which the canvas lends the session as `measure`;
without a canvas the options' `width` and `height` stand in.
