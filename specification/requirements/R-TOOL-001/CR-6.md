---
id: R-TOOL-001.CR-6
target: R-TOOL-001
kind: revision
version: 0.13.4
date: 2026-11-28
issue: 25
summary: "as built (#25): C10 hover colour default #2f80ed; C12-C21 the editor's own session, own-session events, clearing and root clicks, the Enter trail, Alt-click start and wrap, activation, outlines of derived nodes, parts, properties and focus; TC-1 to TC-3 name the editor.spec.mjs tests"
from: 10c66780a060
to: b7f6dc3c99dd
---

## Clauses

@ C10 edit
~ The selection and hover outlines MUST be drawn in a layer above the rendering that changes neither its layout nor its elements' attributes, coloured by the custom properties `--mkd-selection-color` (default `#ff8a00`) and [-`--mkd-hover-color`.-]{+`--mkd-hover-color` (default `#2f80ed`).+}
@ C12 insert after C11
+ When neither an enclosing `mockitdown-designer` nor its host gives it a session (R-EDIT-006.C11), the editor MUST make a session of its own over a document holding one mockup, named by its `mockup` attribute else `Mockup`, whose code is that of its first `<script type="text/mockitdown">` child (R-WEB-002.C2) and whose defaults are its fence attributes (R-WEB-002.C3), and MUST make a later change of that script's text the mockup's code through `session.setCode`.
@ C13 insert after C12
+ The editor MUST dispatch the notifications of a session of its own as the DOM events of R-EDIT-006.C7 and MUST NOT dispatch those of a session it joined.
@ C14 insert after C13
+ A click in the view on no element that carries `data-mkd-node` or `data-mkd-derived` MUST clear the selection.
@ C15 insert after C14
+ A click on the selected element when its node has no parent MUST select the innermost element's node again, and Esc on such a node and Enter with no child to return to MUST leave the selection unchanged.
@ C16 insert after C15
+ A selection change other than the editor's own climbing and returning (C6) MUST forget the children that Enter returns to.
@ C17 insert after C16
+ Alt-click MUST start at the innermost element when the elements under the pointer differ from those of the previous Alt-click or the selection is not the one that Alt-click made, and MUST wrap from the outermost back to the innermost.
@ C18 insert after C17
+ A click, an Alt-click or `select(nodeId)` in an editor whose mockup is not the session's active one MUST make that mockup active first (R-EDIT-006.C12).
@ C19 insert after C18
+ The outline of a node that produced no element of its own (a `ForEach`, an `if` statement or a struct call) MUST be drawn around each outermost element derived from it, and the badge of C5 MUST be shown on every outlined selected element that carries `data-mkd-derived`.
@ C20 insert after C19
+ The editor MUST expose its overlay layer and its selection outlines, hover outlines, tag and badge as the shadow parts `overlay`, `selection`, `hover`, `tag` and `badge`, and its rendering as the part `view`.
@ C21 insert after C20
+ The editor MUST expose the properties `mockup` (the name of the mockup shown), `diagnostics` (the last render's) and `rendered` (a promise as R-WEB-002.C8 defines), and MUST be focusable, with `tabindex` 0 unless the page sets one, so that it receives Esc and Enter.
@ V1 edit
~ On `pages/editor.html`, a click on the nested button selects the button's node, a second click selects the card, {+Esc selects the list, +}Enter returns to the [-button,-]{+card,+} and a click on a row of the `ForEach` selects the `ForEach` and shows the derived badge.

## Files

```diff
--- a/TC-1.md
+++ b/TC-1.md
@@ -3,8 +3,12 @@
 title: Click to locate
-verifies: [C1, C3, C4, C5, C6, C7, C11]
+verifies: [C1, C3, C4, C5, C6, C7, C11, C17]
 ---
 
-Browser test (Chromium, `editor.spec.mjs`) on `pages/editor.html`: a click on the button inside the
-card inside the list selects the button's node (`editor.session.selection`); a second click selects the
-card; Esc selects the list; Enter returns to the card; Alt-click cycles button, card, list, root; a click
-on a `ForEach` row selects the `ForEach` node and shows the badge.
+Browser test (Chromium, `typescript/tests/browser/editor.spec.mjs`, "TC-1: click to locate") on
+`pages/editor.html`: one editor, defined by the package entry, renders the sample (a `Button` in a `Card`
+in a `List` in a `VStack`, and a `ForEach` of three rows) with `data-mkd-node` in its shadow root. A
+click on the button selects the button's node (`editor.session.selection`); a second click selects the
+card; Esc selects the list; Enter returns to the card, and Enter again to the button. Five Alt-clicks on
+the button select button, card, list, `VStack` and the button again. A click on a `ForEach` row selects
+the `ForEach` node, outlines its three rows and shows the "derived" badge. `select(nodeId)` selects a
+node; setting `code` changes the session's code and the rendering and keeps the selection.
--- a/TC-2.md
+++ b/TC-2.md
@@ -3,7 +3,12 @@
 title: Overlays
-verifies: [C2, C8, C9, C10]
+verifies: [C2, C8, C9, C10, C19, C20]
 ---
 
-Browser test: hovering the button shows a tag `Button · W × H` matching its bounding box; the selection
-outline's colour follows `--mkd-selection-color`; the rendered elements' attributes and bounding boxes
-are the same with and without a selection; a mockup importing a component through `import-base` renders.
+Browser tests (`typescript/tests/browser/editor.spec.mjs`): hovering the button sets the session's
+hovered node and shows one tag `Button · W × H` matching its bounding box, and a node hovered through
+the session (`session.hover`) is outlined with a `Card · W × H` tag; with a selection and a hover, the
+rendering's HTML and bounding box are unchanged, the selection outline lies on the button's box, the
+overlay takes no pointer events and the outline's colour is `#ff8a00` until `--mkd-selection-color`
+is set on the editor. An editor with `import-base` and `asset-base` renders the `import-component`
+conformance source without import diagnostics, its derived elements marked, and an image resolved
+against `asset-base`.
--- /dev/null
+++ b/TC-3.md
@@ -0,0 +1,12 @@
+---
+id: TC-3
+title: Sessions and edge cases
+verifies: [C12, C13, C14, C15, C16, C18, C21]
+---
+
+Browser tests (`typescript/tests/browser/editor.spec.mjs`): the page's editor, with a session of its own
+made from its script child, dispatches `mockitdown-select` when `select` is called; an editor given a
+host session with `mockup="B"` renders mockup B, makes it active on `select`, and dispatches no event.
+On the page's editor, Esc and Enter on the selected `VStack` change nothing; a click on the button with
+the `VStack` selected selects the button again; a selection made through `select` forgets the trail,
+so Enter changes nothing; a click on the frame outside every element clears the selection.
--- a/prose.md
+++ b/prose.md
@@ -19 +19,8 @@
 **Re-checked at specification 0.12.12.** Re-read after the clarification records of the items it cites (#81), which closed the suspect citations left by the test-case backfills (#54 to #60) and the SRC-19 import map (0.12.0). No obligation it rests on changed, and none of its clauses is altered.
+
+**As built (#25).** An editor used on its own makes its own session from its script child and its fence
+attributes, much as `mockitdown-mockup` reads its code, and only then reports the session's
+notifications to the page; inside a designer or with a host session, the owner of the session reports
+them. Repeated clicks climb to the root; one more click starts again at the innermost element, so a
+click can always reach a nested element. The hover outline is blue (`#2f80ed`) next to the orange
+selection, and both, with the tag and the badge, can be styled through `::part`.
```
