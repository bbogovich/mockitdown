---
id: R-TOOL-005.CR-5
target: R-TOOL-005
kind: revision
version: 0.13.9
date: 2026-11-28
issue: 30
summary: "as built (#30): selected rows drag together (C1); end of the top level below the last row (C2); container by session.isContainer, else the top level, bar across the children's axis (C3); edit refusals and the refused colour (C4); <Name>() and moved ids selected (C5); one change, undo with R-EDIT-007 (C6); pointer drag, 4 px, ghost (C7); session dropPosition/checkDrop/drop (C8); pack of the last evaluation, ForEach and if defer (C9); isContainer, childrenOf (C10); active mockup and own session only (C11); data-drop, parts and colours (C12); TC files name the tests"
from: bcc9835116d3
to: fadec81c97a2
---

## Clauses

@ C1 edit
~ A gallery card MUST be draggable onto the outline and onto the editor, and an outline row of a view that is not derived MUST be draggable within the [-outline.-]{+outline, carrying every selected node when the row is one of several selected rows.+}
@ C2 edit
~ Over an outline row, the outline MUST show a drop indicator before the row, after it or inside it, chosen by the pointer's position in the upper, lower or middle third of the [-row.-]{+row, and below the last row a drop indicator at the end of the mockup's top level.+}
@ C3 edit
~ Over the editor, the editor MUST outline the innermost container under the pointer{+ (`session.isContainer`, C10), else the mockup's top level,+} and show an insertion bar at the gap between its children nearest the pointer, [-along-]{+across+} the [-container's-]{+axis+} [-axis.-]{+along which its children are laid out: horizontal in a `VStack`, vertical in an `HStack`.+}
@ C4 edit
~ A drop position whose parent cannot contain the dragged element (R-PACK-016.C6), [-or -]that lies inside a dragged row's own subtree, {+or that the edit operation refuses +}MUST show the `not-allowed` [-cursor-]{+cursor, the indicator in the refused colour+} and the reason next to the pointer, and a drop there MUST do nothing.
@ C5 edit
~ Dropping a gallery card MUST insert [-the element-]{+`<Name>()`+} at the indicated position (R-EDIT-002.C4) and select it; dropping outline rows MUST move their nodes there [-(R-EDIT-002.C8).-]{+(R-EDIT-002.C8), keeping their node ids and selecting them.+}
@ C6 edit
~ Each drop MUST be one [-change-]{+edit+} [-and-]{+operation of the session, notifying+} one {+`change` (one +}undo [-step,-]{+step once the history of R-EDIT-007 exists),+} and Esc MUST cancel a [-drag.-]{+drag, changing nothing.+}
@ C7 insert after V1
+ A drag MUST be a pointer drag that starts once the pointer has moved 4 CSS pixels from where it was pressed and shows, next to the pointer, the name of what is dragged; releasing the pointer where no component shows a position, or a cancelled pointer, MUST end the drag with nothing changed.
@ C8 insert after C7
+ The components MUST take the drop position, its check and the drop from the design session (A-WEB-5.K2): `session.dropPosition(node, zone)` gives the position before, inside (as last child) or after a node of the active mockup and is refused for a node that stands where no statement goes beside it; `session.checkDrop(source, position, pack)` gives `{ok: true}` or `{ok: false, reason}`; `session.drop(source, position, pack)` checks and then inserts or moves.
@ C9 insert after C8
+ The role rules of C4 MUST be those of the pack of the target component's last evaluation of the mockup, and a `ForEach` or an `if` MUST defer them to the element above it.
@ C10 insert after C9
+ `session.isContainer(node, pack)` MUST be true for an element call other than a `ForEach` that already has statement children or whose element holds children in the pack (R-PACK-016.C16), and `session.childrenOf(parent)` MUST give the statement children a position's index counts (null: the top level).
@ C11 insert after C10
+ Only the editor showing the session's active mockup MUST take drops, and only a drag of the component's own session MUST be shown or dropped.
@ C12 insert after C11
+ The outline MUST mark the row of the position with `data-drop` (`before`, `inside` or `after`, followed by ` refused` when refused), and the editor MUST draw the outlined container and the bar as the shadow parts `drop-target` and `drop-bar`, the bar carrying `data-orientation`; allowed positions MUST be coloured by `--mkd-drop-color` (default `#2f80ed`) and refused ones by `--mkd-drop-refused-color` (default `#d93025`).

## Files

```diff
--- a/TC-1.md
+++ b/TC-1.md
@@ -3,3 +3,3 @@
 title: Drop into the view
-verifies: [C1, C3, C5, C6]
+verifies: [C1, C3, C5, C6, C7, C11, C12]
 ---
@@ -10 +10,11 @@
 inserts nothing.
+
+As built (#30): `typescript/tests/browser/drag-drop.spec.mjs` opens the hand-written
+`tests/browser/fixtures/drag-sample.mkdesign` (a `VStack` of `Text("First")`, `Text("Second")` and an
+`HStack` of two buttons) in the designer of `pages/designer.html` and drags with the pointer
+(`page.mouse`). Over the gap between the texts the VStack's box is the `drop-target` and the
+`drop-bar` is horizontal (`data-orientation`), wider than tall and between the two texts, with the
+`grabbing` cursor; the drop gives the hand-written code with `Text()` second, selected, after exactly
+one code `change`. Over the gap between the buttons the bar is vertical; Esc removes the ghost, the
+shield and the bar, and releasing afterwards changes nothing. There is no undo yet (R-EDIT-007): the
+undo step is checked as the one `change`.
--- a/TC-2.md
+++ b/TC-2.md
@@ -3,3 +3,3 @@
 title: Outline drops and refusals
-verifies: [C2, C4, C5]
+verifies: [C1, C2, C4, C5, C8, C9, C10, C12]
 ---
@@ -10 +10,12 @@
 its node id kept.
+
+As built (#30): `typescript/tests/browser/drag-drop.spec.mjs` on the same fixture: the `Text`,
+`Divider` and `Text` cards dropped in the upper, middle and lower third of the `HStack` row (its
+`data-drop` `before`, `inside`, `after`) give the hand-written code after each drop, the new node
+selected, three changes in all. The `NavigationSplitView` card over the HStack row's middle third
+marks it `inside refused`, shows `not-allowed` and "A frame cannot be placed inside a horizontal
+stack" by the pointer, and drops nothing; the HStack row dragged onto its `Left` button's row shows
+"Cannot move HStack into one of its own descendants"; the `Second` row dropped in the HStack row's
+lower third moves after it, its node id kept and selected, in one change. The session API (C8 to C10:
+positions, checks through a `ForEach`, refusals, one change per drop) is also tested in
+`typescript/tests/unit/design-session.test.ts` with hand-written expectations.
--- a/prose.md
+++ b/prose.md
@@ -1,5 +1,15 @@
 The second and third ways to insert (SRC-12#s6, SRC-14#p1.c1): drop onto the outline with a before,
-after or inside indicator, or onto the view with an insertion bar along the container's axis — vertical
-for a `VStack`, horizontal for an `HStack`. Dragging outline rows reorders and re-parents, refusing a drop
-into the row's own descendants as the MockItOut outline did (SRC-12#s15).
+after or inside indicator, or onto the view with an insertion bar across the axis the container lays
+its children out along — a horizontal bar between the children of a `VStack`, a vertical one in an
+`HStack`. Dragging outline rows reorders and re-parents, refusing a drop into the row's own descendants
+as the MockItOut outline did (SRC-12#s15).
+
+As built (#30), the drag is a pointer drag (`typescript/src/elements/drag.ts`) rather than HTML drag
+and drop: only a pointer drag can show the `not-allowed` cursor and a reason by the pointer, and Esc
+cancels it in every browser. A transparent shield over the page carries the cursor and a ghost names
+what is dragged. The components only point: where a drop may go and the drop itself belong to the
+design session (`dropPosition`, `checkDrop`, `drop`, `isContainer`, `childrenOf`), so a host can offer
+the same placement from its own controls. A drop into a `VStack` inside a `ForEach` is checked by the
+VStack's role rules, not the ForEach's. Moving a row out to the top level uses the top-level move of
+R-EDIT-002.C32.
 
```
