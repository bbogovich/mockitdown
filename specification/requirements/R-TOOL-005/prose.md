The second and third ways to insert (SRC-12#s6, SRC-14#p1.c1): drop onto the outline with a before,
after or inside indicator, or onto the view with an insertion bar across the axis the container lays
its children out along — a horizontal bar between the children of a `VStack`, a vertical one in an
`HStack`. Dragging outline rows reorders and re-parents, refusing a drop into the row's own descendants
as the MockItOut outline did (SRC-12#s15).

As built (#30), the drag is a pointer drag (`typescript/src/elements/drag.ts`) rather than HTML drag
and drop: only a pointer drag can show the `not-allowed` cursor and a reason by the pointer, and Esc
cancels it in every browser. A transparent shield over the page carries the cursor and a ghost names
what is dragged. The components only point: where a drop may go and the drop itself belong to the
design session (`dropPosition`, `checkDrop`, `drop`, `isContainer`, `childrenOf`), so a host can offer
the same placement from its own controls. A drop into a `VStack` inside a `ForEach` is checked by the
VStack's role rules, not the ForEach's. Moving a row out to the top level uses the top-level move of
R-EDIT-002.C32.

Re-checked at 0.10.3 together with the items it cites or is cited by (specification audit, #51): the citations are still accurate and no obligation changed.

**Re-checked at specification 0.10.7.** Its prerequisites were re-checked after the renderer split (#48, #49) and the gallery spec split (#50) without any change to an obligation; neither is this item changed.

**Re-checked at 0.11.0.** Its cited items R-TOOL-001, R-TOOL-002, R-TOOL-004 changed with SRC-18 (all packs recorded, stylesheet partials, gallery home page and easter eggs, TypeScript release builds, new packs); no obligation of this item changed.


**Re-checked at specification 0.12.12.** Re-read after the clarification records of the items it cites (#81), which closed the suspect citations left by the test-case backfills (#54 to #60) and the SRC-19 import map (0.12.0). No obligation it rests on changed, and none of its clauses is altered.
