History lives in the session, per design document (SRC-12#s8), so it covers every component and,
once the canvas exists, moves and renames of mockups as well (R-TOOL-012.C7). A step is a change and its
inverse, plus the selection on either side, so that undo puts the designer back exactly where they were.

Typing coalesces: each keystroke in an inspector field or in the code view is applied, but the steps
merge while the same field keeps changing, so one undo removes the whole word or value.

Re-checked at 0.10.3 together with the items it cites or is cited by (specification audit, #51): the citations are still accurate and no obligation changed.

**Re-checked at specification 0.10.7.** Its prerequisites were re-checked after the renderer split (#48, #49) and the gallery spec split (#50) without any change to an obligation; neither is this item changed.

**Re-checked at 0.11.0.** Its cited items R-EDIT-006 changed with SRC-18 (all packs recorded, stylesheet partials, gallery home page and easter eggs, TypeScript release builds, new packs); no obligation of this item changed.


**Re-checked at specification 0.12.12.** Re-read after the clarification records of the items it cites (#81), which closed the suspect citations left by the test-case backfills (#54 to #60) and the SRC-19 import map (0.12.0). No obligation it rests on changed, and none of its clauses is altered.

**As built (#34).** A step snapshots the mockup's code and its last valid tree, so an undo restores the
very nodes (and ids) that were selected, and the active mockup with them: undoing a step of another
mockup switches to it. Coalescing merges only into the latest step, for the same mockup and kind of
change, and an undo or redo ends the burst. The designer binds the keys on itself, so they act only
while the focus is inside it, and leaves them to text fields and to Preview mode, where the document
is read-only. The inspector and the code view (C5) pass their keys when they are built.
