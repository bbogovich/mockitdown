---
id: R-TOOL-003.CR-5
target: R-TOOL-003
kind: revision
version: 0.13.6
date: 2026-11-28
issue: 27
summary: "as built (#27): C3 panel range, arrow keys, toolbar toggles and layout shape; C4 slotted elements given the session; C5 a new session per open, DesignOpenError; C6 the setter throws; C7 the live document; C9 previews with the fence options, the mockups list and the appearance toggle; C10 radio group, name and default device; C11 through session.delete(), not in Preview or a text field; C12 count wording and crumbs; C14 the sample file; C15-C17 Code mode, placeholders, rendered and base URLs; TC-1, TC-2 name the designer.spec.mjs tests"
from: 9c8f97c1d774
to: 2fefcccb7f66
---

## Clauses

@ C3 edit
~ The side panels MUST be resizable{+ between 120 and 640 CSS pixels+} by dragging their inner edges and [-collapsible,-]{+by Left and Right on them, and collapsible by a toggle each in the toolbar,+} and the designer MUST expose their sizes and collapsed states as its `layout` [-property,-]{+property `{left: {size, collapsed}, right: {size, collapsed}}`,+} which a host may read and [-set.-]{+set in part.+}
@ C4 edit
~ The designer MUST offer the named slots `toolbar`, `outline`, `gallery`, `view`, `inspector` and `status`; an element in a slot MUST replace that panel and join the designer's [-session.-]{+session, the designer setting its `session` property once its custom element is defined.+}
@ C5 edit
~ `designer.open(json)` MUST accept JSON text or an [-object,-]{+object (written as JSON text first),+} read it with `readDesign` (R-EDIT-005.C2), [-make-]{+start a new session over it whose active mockup is+} the [-mockup named by-]{+one+} `view.active` [-active,-]{+names,+} else the first mockup, and resolve; it MUST reject with [-the-]{+a+} [-errors-]{+`DesignOpenError` whose `errors` are those+} of [-`readDesign`-]{+`readDesign`,+} and keep the current [-document-]{+document,+} when they are not empty.
@ C6 edit
~ The `document` property MUST return what `toJSON()` returns and, when set, open the document as `open` [-does.-]{+does, throwing the `DesignOpenError` where `open` rejects.+}
@ C7 edit
~ `designer.toJSON()` MUST return{+ the session's live document,+} the opened document with every edit applied, such that `writeDesign` of it differs from `writeDesign` of the opened document only in what the edits changed.
@ C9 edit
~ In Preview mode the designer MUST hide the side [-panels,-]{+panels and the view,+} show each mockup{+ in document order+} read-only through a `mockitdown-mockup` [-with-]{+whose attributes are the fence options among+} the mockup's [-options,-]{+options+} [-keep-]{+(R-EDIT-005.C9), list+} the [-Mockups-]{+mockups+} [-list-]{+by+} [-reachable,-]{+name beside the previews, each scrolling to its preview when activated,+} and offer an appearance toggle of light, dark and [-both.-]{+both that sets every preview's `appearance` while one is pressed.+}
@ C10 edit
~ The toolbar MUST hold the mode switch (Design, Preview, Code) {+as a radio group +}and show the {+name, the +}pack and{+ the+} device of the active [-mockup.-]{+mockup, the device being its `device` option, else the pack's default device.+}
@ C11 edit
~ Delete or Backspace with the focus in the outline or the [-view-]{+view, outside Preview mode and outside a text field,+} MUST [-remove-]{+delete+} the selected nodes [-(R-EDIT-002.C6)-]{+through+} [-as-]{+`session.delete()` (R-EDIT-006.C19):+} one change, then[- select-] the next sibling of the last removed node, else its previous sibling, else its [-parent.-]{+parent selected.+}
@ C12 edit
~ The status bar MUST show the active mockup's diagnostic count {+(`0 diagnostics`, `1 diagnostic`) +}and a breadcrumb of the {+element names on the +}path from the [-root-]{+top-level view node+} to the{+ first+} selected node, each crumb{+ a button+} selecting its node when activated.
@ C14 edit
~ The TypeScript project MUST include the test page `pages/designer.html`, which opens [-a-]{+the+} sample design document{+ `pages/designer-sample.mkdesign`+} of at least two mockups — one nesting a `Button` in a `Card` in a `List`, with a comment, a `let` and a `ForEach` — in a `mockitdown-designer`.
@ C15 insert after C14
+ In Code mode the designer MUST show the active mockup's code read-only in place of the view, keeping the side panels, until the code view (R-TOOL-009) takes that place.
@ C16 insert after C15
+ Until their components exist, the gallery and properties panels MUST hold placeholders, the properties panel naming the first selected element.
@ C17 insert after C16
+ The designer MUST expose the property `rendered`, a promise that resolves once its outline, its view and, in Preview mode, its previews are rendered, and MUST pass its `import-base` and `asset-base` attributes on to its view, outline and previews.

## Files

```diff
--- a/TC-1.md
+++ b/TC-1.md
@@ -6,6 +6,12 @@
 
-Browser test (`designer.spec.mjs`) on `pages/designer.html`: select the nested button; press Delete;
-exactly one `mockitdown-change` arrives, its edits remove the button's lines; the card's next sibling or
-the card is selected; `writeDesign(designer.toJSON())` equals the sample's text without those lines,
-unknown keys and key order kept. `open` of a document with `version: 2` rejects and keeps the current
-document.
+Browser test (`typescript/tests/browser/designer.spec.mjs`, "TC-1") on `pages/designer.html`, which opens
+`pages/designer-sample.mkdesign`: the designer owns a `DesignSession` that its outline and view share,
+with the `view.active` mockup active, and writes the sample back unchanged; clicking the nested button and
+pressing Delete gives exactly one `mockitdown-change`, from the designer, whose one edit removes the
+button's line, and selects the button's previous sibling `Text("Quarterly report")` (the card has no
+next one); `writeDesign(designer.toJSON())` equals the hand-written `fixtures/designer-deleted.mkdesign`,
+the sample without that line, unknown keys and key order kept; Backspace in the outline then deletes the
+text and selects the card. `open` of the document with `version: 2` rejects with a `DesignOpenError`
+whose `errors` are `[{path: "version", message: "version must be 1, found 2"}]` and keeps the current
+document; an object without `view` opens with its first mockup active; `document` is `toJSON()`, and
+setting it to the sample's text opens it.
--- a/TC-2.md
+++ b/TC-2.md
@@ -3,9 +3,17 @@
 title: Layout, slots and modes
-verifies: [C2, C3, C4, C8, C9, C10, C12]
+verifies: [C2, C3, C4, C8, C9, C10, C12, C15]
 ---
 
-Browser test: the panels measure 240 and 260 px; dragging an edge resizes and `layout` reflects it;
-a custom element in the `inspector` slot replaces the inspector and receives the session; `mode =
-"preview"` hides the panels and renders `mockitdown-mockup` elements whose shadow HTML equals the
-mockup element's rendering of the same code; the toolbar shows the active mockup's pack and device;
-activating a breadcrumb crumb selects its node; an unknown mode reads as `design`.
+Browser test (`typescript/tests/browser/designer.spec.mjs`, "TC-2") on `pages/designer.html`: the left
+column and the right panel measure 240 and 260 px, with the toolbar above, the outline above the gallery,
+the view between them and the status bar below; dragging the left edge 60 px makes it 300 px and
+`layout` says so; setting `layout = {right: {collapsed: true}}` hides the right panel and the toolbar
+toggle shows it again; the toolbar holds Design, Preview and Code and shows `base` and `fit`; the status
+bar shows `0 diagnostics`, the breadcrumb `VStack › List › Card › Button` after a click on the button,
+and activating `List` selects the list; code with an unknown modifier shows `1 diagnostic`; a custom
+element in the `inspector` slot replaces the properties panel inside the right column and is given the
+session, and a `mockitdown-outline` in the `outline` slot joins it; an unknown `mode` reads as `design`;
+Preview hides the side panels and the view, lists `Sign in` and `Inbox`, and renders `mockitdown-mockup`
+elements with each mockup's fence options whose shadow HTML equals that of a `mockitdown-mockup` alone
+with the same attributes and code; the Dark toggle sets `appearance="dark"` on every preview; Code mode
+shows the active mockup's code with the left column visible, and Design brings the view back.
--- a/prose.md
+++ b/prose.md
@@ -15,2 +15,16 @@
 
+`open` starts a new session over the document, so a host that kept `designer.session` reads it again
+after each `open`; the components inside the designer re-join the new one. An invalid document rejects
+with a `DesignOpenError` whose `errors` list every problem `readDesign` found:
+
+```js
+try { await d.open(text); } catch (e) { showProblems(e.errors); }   // [{path: "version", message: …}]
+d.layout = { right: { collapsed: true } };                          // sizes and collapsed states, in part
+d.mode = "preview";                                                  // design, preview or code
+```
+
+Until the gallery (R-TOOL-004) and the inspector exist, their panels hold placeholders. Delete is the
+session's `delete` command (R-EDIT-006.C19), so the host hears one `mockitdown-change` and then one
+`mockitdown-select` for the node selected after it.
+
 A host can replace any panel through its slot, for example to put its own inspector on the right; the
```
