---
id: R-TOOL-002.CR-5
target: R-TOOL-002
kind: revision
version: 0.13.5
date: 2026-11-28
issue: 26
summary: "as built (#26): C2 rows also for derived views without a node, other views skipped; C3 the main label is a positional first argument; C5 visible rows; C6 every row of the node, also after a rebuild; C8 aria-current; C10-C15 initial expansion, Right/Left to child and parent, typeahead window, aria-selected rows and activedescendant, the outline's session and events, rebuilds, properties and parts; TC-1, TC-2 name the outline.spec.mjs tests"
from: e92f4a5bd15b
to: 6463c709b1bf
---

## Clauses

@ C2 edit
~ The rows MUST follow the views of the mockup's edit-mode evaluation: one row per view produced from a view [-node,-]{+node or derived from one (R-EDIT-004.C4, C5),+} nested as the views are, its node found through its ordinal [-(R-EDIT-006.C9).-]{+(R-EDIT-006.C9); a view that is neither MUST get no row, its children taking its place.+}
@ C3 edit
~ A row MUST show the element name, then its main label (its first argument when that {+argument +}is{+ positional and its value+} a string), then an `#id` chip when the view carries `.id(…)`, and MUST be indented by 14 CSS pixels per level.
@ C5 edit
~ A row with children MUST expand and collapse by its disclosure triangle and by Right and Left; Up and Down MUST move the selection between visible rows, Home and End to the first and last {+visible +}row, and typed characters MUST select the next {+visible +}row whose name starts with them.
@ C6 edit
~ `expandTo(nodeId)` MUST expand the ancestors of {+every row of +}the [-node's row-]{+node+} and scroll the [-row-]{+first+} into view, and the outline MUST call it {+for each selected node +}whenever the session's selection [-changes.-]{+changes and after its rows are rebuilt.+}
@ C8 edit
~ The outline MUST have two tabs, Elements (the tree) and Mockups, the latter listing the document's mockups by name in document order with the active one [-marked.-]{+marked by `aria-current="true"`.+}
@ C10 insert after C9
+ Rows of the first level MUST start expanded and deeper rows collapsed, and a row MUST keep its expansion when the rows are rebuilt while its nodes keep their ids.
@ C11 insert after C10
+ Right on an expanded row MUST select its first child and Left on a collapsed row or a row without children MUST select its parent row; characters typed within 600 milliseconds of each other MUST form one search, a new search starting after the current row.
@ C12 insert after C11
+ Every row whose node is selected MUST carry `aria-selected="true"`, so that all the rows of a `ForEach` are selected with it, and the tree MUST keep the keyboard focus on itself and name the current row by `aria-activedescendant`.
@ C13 insert after C12
+ The outline MUST join a session as R-EDIT-006.C11 says, making a session of its own over an empty document when none is given, and MUST dispatch the notifications of a session of its own as the DOM events of R-EDIT-006.C7 and MUST NOT dispatch those of a session it joined.
@ C14 insert after C13
+ The outline MUST rebuild its rows after every `change` of the active mockup other than a move and after an `active` notification, and MUST keep its last rows when the mockup does not evaluate.
@ C15 insert after C14
+ The outline MUST expose the properties `rows` (every row in document order) and `rendered` (a promise that resolves once the rows are up to date), the shadow parts `tabs`, `tab`, `tree`, `row`, `twisty`, `link`, `name`, `label`, `chip`, `mockups` and `mockup`, and the custom properties `--mkd-outline-selected-background` and `--mkd-outline-hover-background` for the row colours.

## Files

```diff
--- a/TC-1.md
+++ b/TC-1.md
@@ -3,8 +3,14 @@
 title: Tree and selection sync
-verifies: [C1, C2, C3, C4, C6, C9]
+verifies: [C1, C2, C3, C4, C6, C9, C10, C12]
 ---
 
-Browser test (`outline.spec.mjs`) on `pages/editor.html`: the tree's rows match the edit-mode
-evaluation (names, labels, `#id` chips, levels, 14 px indent per level); a click in the editor on the
-nested button selects its row, expanded and in view (F-19.AC3); the `ForEach` rows are italic with the
-link icon and select the `ForEach`.
+Browser test (Chromium, `typescript/tests/browser/outline.spec.mjs`, "TC-1: tree and selection sync")
+on `pages/editor.html`, whose sample nests `Button("Open").id("open")` in a `Card` in a `List` under a
+`VStack` and has a `ForEach` of three `Text` rows: the page's one outline, defined by the package
+entry, is an ARIA tree sharing the editor's session. Before any selection the visible rows are
+`VStack` (expanded), `Text "Inbox"` and `List` (collapsed). A click in the editor on the nested button
+expands the list and the card and selects the button's row, which lies inside the tree's scrolling
+box; the nine visible rows then match, by level, name, label, `#id` chip, italics, link icon,
+`aria-expanded` and `aria-selected`, the list written by hand from the source; the disclosure triangles
+lie 14 px further right per level. A click on the `Beta` row selects the `ForEach` and all three of its
+rows show as selected; a click on the `Card` row selects the card.
--- a/TC-2.md
+++ b/TC-2.md
@@ -2,8 +2,13 @@
 id: TC-2
-title: Keyboard and hover
-verifies: [C5, C7, C8]
+title: Keyboard, hover and the Mockups tab
+verifies: [C5, C7, C8, C11, C14]
 ---
 
-Browser test: Left collapses, Right expands, Up and Down move, Home and End jump, typing `Bu` selects
-the next row starting with "Bu"; hovering a row outlines its element in the editor and hovering the
-element highlights the row; the Mockups tab lists the document's mockups.
+Browser test (Chromium, `typescript/tests/browser/outline.spec.mjs`, "TC-2: keyboard, hover and the
+Mockups tab") on `pages/editor.html`: with the `VStack` row selected, Left collapses it (one visible
+row) and Right expands it; Down, Down, Up select text, list, text; Right on the list and on the card
+expands them; End selects the `ForEach`, Home the `VStack`; typing `Bu` selects the button. Hovering the
+`Card` row sets the session's hovered node and the editor draws its `Card · W × H` tag; hovering the
+button in the editor highlights exactly the button's row. The tabs read Elements and Mockups; the
+Mockups tab hides the tree and lists `Mockup`, marked current. An outline given a host session over
+mockups A and B with B active lists both, B marked, and shows B's rows `VStack` and `Text "second" #t2`.
--- a/prose.md
+++ b/prose.md
@@ -15 +15,9 @@
 **Re-checked at specification 0.12.12.** Re-read after the clarification records of the items it cites (#81), which closed the suspect citations left by the test-case backfills (#54 to #60) and the SRC-19 import map (0.12.0). No obligation it rests on changed, and none of its clauses is altered.
+
+**As built (#26).** The outline evaluates the active mockup itself, with the same options and imports
+as the editor renders it, so it needs no editor on the page; a component's views and a `ForEach`'s
+items get italic rows that stand for the construct, as their elements do in the editor. The keys follow
+the usual tree pattern: Right on an open row goes to its first child, Left on a closed one to its
+parent, and the selection follows the current row, so a selection made anywhere — a click in the
+editor, a key here — shows in both. The first level starts open; deeper rows open as the selection
+reaches them.
```
