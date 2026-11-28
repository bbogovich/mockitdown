---
title: "Design-tool components"
spec_version: 0.13.10
status: draft
updated: 2026-11-28
page_id: WEB.4
---

# Design-tool components

The custom elements a web application composes into a mockup editor (F-19; SRC-12#s12): the composite
`mockitdown-designer`, the editable view `mockitdown-editor`, the outline, the gallery, the inspector,
the code view and the diagnostics list. They are standard custom elements with open shadow roots and
no framework, styled through CSS custom properties and `::part`, and they share one design session
(R-EDIT-006). The canvas of named mockups is on [Canvas of named mockups](canvas.md).

The layout follows the designer's main window (SRC-13): toolbar (SRC-13#p1.c1), outline (c2), gallery
(c3), canvas (c4), properties (c5) and status bar (c6); inserting follows SRC-14. The test pages
`pages/editor.html` and `pages/designer.html` compose the components for demonstration and for the
browser tests (F-19.C10).

### R-TOOL-001 — The editable view: mockitdown-editor

**Requires:** R-EDIT-004, R-EDIT-006, R-WEB-002

The view of SRC-13#p1.c4 for one mockup. A click is a quick way to *locate* an element: it selects
the innermost element under the pointer, and a second click or Esc climbs to the parent, because a click
on a button's label could mean the label, the button, the stack or the card around it (SRC-12#s5). The
outline remains the primary means of selection.

Elements that a loop, a condition or a component produced select the construct they came from and show a
"derived" badge, because editing them means editing that construct.

Re-checked at 0.10.3 together with the items it cites or is cited by (specification audit, #51): the citations are still accurate and no obligation changed.

**Re-checked at specification 0.10.7.** Its prerequisites were re-checked after the renderer split (#48, #49) and the gallery spec split (#50) without any change to an obligation; neither is this item changed.

**Re-checked at 0.11.0.** Its cited items R-EDIT-004, R-EDIT-006, R-WEB-002 changed with SRC-18 (all packs recorded, stylesheet partials, gallery home page and easter eggs, TypeScript release builds, new packs); no obligation of this item changed.


**Re-checked at specification 0.12.10.** Re-read against R-WEB-002 (changed at 0.12.0: SRC-19 import map (0.12.0), which changes how imports are found and nothing this item obliges). No obligation this item rests on changed, and none of its clauses is altered (#81).


**Re-checked at specification 0.12.12.** Re-read after the clarification records of the items it cites (#81), which closed the suspect citations left by the test-case backfills (#54 to #60) and the SRC-19 import map (0.12.0). No obligation it rests on changed, and none of its clauses is altered.

**As built (#25).** An editor used on its own makes its own session from its script child and its fence
attributes, much as `mockitdown-mockup` reads its code, and only then reports the session's
notifications to the page; inside a designer or with a host session, the owner of the session reports
them. Repeated clicks climb to the root; one more click starts again at the innermost element, so a
click can always reach a nested element. The hover outline is blue (`#2f80ed`) next to the orange
selection, and both, with the tag and the badge, can be styled through `::part`.

**R-TOOL-001.TC-1 — Click to locate**

Browser test (Chromium, `typescript/tests/browser/editor.spec.mjs`, "TC-1: click to locate") on
`pages/editor.html`: one editor, defined by the package entry, renders the sample (a `Button` in a `Card`
in a `List` in a `VStack`, and a `ForEach` of three rows) with `data-mkd-node` in its shadow root. A
click on the button selects the button's node (`editor.session.selection`); a second click selects the
card; Esc selects the list; Enter returns to the card, and Enter again to the button. Five Alt-clicks on
the button select button, card, list, `VStack` and the button again. A click on a `ForEach` row selects
the `ForEach` node, outlines its three rows and shows the "derived" badge. `select(nodeId)` selects a
node; setting `code` changes the session's code and the rendering and keeps the selection.

**R-TOOL-001.TC-2 — Overlays**

Browser tests (`typescript/tests/browser/editor.spec.mjs`): hovering the button sets the session's
hovered node and shows one tag `Button · W × H` matching its bounding box, and a node hovered through
the session (`session.hover`) is outlined with a `Card · W × H` tag; with a selection and a hover, the
rendering's HTML and bounding box are unchanged, the selection outline lies on the button's box, the
overlay takes no pointer events and the outline's colour is `#ff8a00` until `--mkd-selection-color`
is set on the editor. An editor with `import-base` and `asset-base` renders the `import-component`
conformance source without import diagnostics, its derived elements marked, and an image resolved
against `asset-base`.

**R-TOOL-001.TC-3 — Sessions and edge cases**

Browser tests (`typescript/tests/browser/editor.spec.mjs`): the page's editor, with a session of its own
made from its script child, dispatches `mockitdown-select` when `select` is called; an editor given a
host session with `mockup="B"` renders mockup B, makes it active on `select`, and dispatches no event.
On the page's editor, Esc and Enter on the selected `VStack` change nothing; a click on the button with
the `VStack` selected selects the button again; a selection made through `select` forgets the trail,
so Enter changes nothing; a click on the frame outside every element clears the selection.

**Realizes.** F-19

| | Statement |
|---|---|
| C1 | The package MUST define the custom element `mockitdown-editor`, which renders one mockup of its session — the one its `mockup` attribute names, else the active mockup — with the `edit` option (R-EDIT-004) and the mockup's options (R-EDIT-005.C9) into its open shadow root. |
| C2 | The editor MUST resolve imports and image paths as the mockup element does, with the `import-base` and `asset-base` attributes (R-WEB-002.C3). |
| C3 | The editor MUST expose the properties `code` (the mockup's code, set through the session) and `session`, and the method `select(nodeId)`. |
| C4 | A click in the view MUST select the view node of the innermost element under the pointer that carries `data-mkd-node`, mapped through `session.nodeFor` (R-EDIT-006.C9). |
| C5 | A click on an element that carries `data-mkd-derived` MUST select the node its `data-mkd-derived` names, and the editor MUST show a "derived" badge on the element. |
| C6 | A second click on the selected element, or Esc, MUST move the selection to the parent view node, and Enter MUST move it back to the child it came from. |
| C7 | Alt-click MUST cycle the selection through the view nodes of every element under the pointer, innermost first. |
| C8 | Hovering an element MUST set the session's hovered node and draw a hover outline around the element with a tag holding its element name and its size in CSS pixels (`Button · 88 × 32`); a node hovered in another component MUST be outlined the same way. |
| C9 | The editor MUST outline every element of the selected nodes with the selection outline and scroll the first into view when the selection changes. |
| C10 | The selection and hover outlines MUST be drawn in a layer above the rendering that changes neither its layout nor its elements' attributes, coloured by the custom properties `--mkd-selection-color` (default `#ff8a00`) and `--mkd-hover-color` (default `#2f80ed`). |
| C11 | The TypeScript project MUST include the test page `pages/editor.html`, holding one `mockitdown-editor` over a sample mockup that nests a `Button` in a `Card` in a `List` and has a `ForEach`. |
| C12 | When neither an enclosing `mockitdown-designer` nor its host gives it a session (R-EDIT-006.C11), the editor MUST make a session of its own over a document holding one mockup, named by its `mockup` attribute else `Mockup`, whose code is that of its first `<script type="text/mockitdown">` child (R-WEB-002.C2) and whose defaults are its fence attributes (R-WEB-002.C3), and MUST make a later change of that script's text the mockup's code through `session.setCode`. |
| C13 | The editor MUST dispatch the notifications of a session of its own as the DOM events of R-EDIT-006.C7 and MUST NOT dispatch those of a session it joined. |
| C14 | A click in the view on no element that carries `data-mkd-node` or `data-mkd-derived` MUST clear the selection. |
| C15 | A click on the selected element when its node has no parent MUST select the innermost element's node again, and Esc on such a node and Enter with no child to return to MUST leave the selection unchanged. |
| C16 | A selection change other than the editor's own climbing and returning (C6) MUST forget the children that Enter returns to. |
| C17 | Alt-click MUST start at the innermost element when the elements under the pointer differ from those of the previous Alt-click or the selection is not the one that Alt-click made, and MUST wrap from the outermost back to the innermost. |
| C18 | A click, an Alt-click or `select(nodeId)` in an editor whose mockup is not the session's active one MUST make that mockup active first (R-EDIT-006.C12). |
| C19 | The outline of a node that produced no element of its own (a `ForEach`, an `if` statement or a struct call) MUST be drawn around each outermost element derived from it, and the badge of C5 MUST be shown on every outlined selected element that carries `data-mkd-derived`. |
| C20 | The editor MUST expose its overlay layer and its selection outlines, hover outlines, tag and badge as the shadow parts `overlay`, `selection`, `hover`, `tag` and `badge`, and its rendering as the part `view`. |
| C21 | The editor MUST expose the properties `mockup` (the name of the mockup shown), `diagnostics` (the last render's) and `rendered` (a promise as R-WEB-002.C8 defines), and MUST be focusable, with `tabindex` 0 unless the page sets one, so that it receives Esc and Enter. |
| V1 | On `pages/editor.html`, a click on the nested button selects the button's node, a second click selects the card, Esc selects the list, Enter returns to the card, and a click on a row of the `ForEach` selects the `ForEach` and shows the derived badge. |

---

### R-TOOL-002 — The outline: mockitdown-outline

**Requires:** R-EDIT-006

The primary means of selection (SRC-12#s5, SRC-13#p1.c2): the element tree of the active mockup, with
the row anatomy, the 14-pixel indent and the rounded selected row of the MockItOut designer's outline
(SRC-12#s15). A row reads like the code it stands for — `Button "Sign in" #submit`.

The tree follows the rendered structure, so a `ForEach` over three items shows three italic rows; each
selects the loop. Reordering rows by drag is R-TOOL-005; the Mockups tab becomes active in R-TOOL-013.

Re-checked at 0.10.3 together with the items it cites or is cited by (specification audit, #51): the citations are still accurate and no obligation changed.

**Re-checked at specification 0.10.7.** Its prerequisites were re-checked after the renderer split (#48, #49) and the gallery spec split (#50) without any change to an obligation; neither is this item changed.

**Re-checked at 0.11.0.** Its cited items R-EDIT-006 changed with SRC-18 (all packs recorded, stylesheet partials, gallery home page and easter eggs, TypeScript release builds, new packs); no obligation of this item changed.


**Re-checked at specification 0.12.12.** Re-read after the clarification records of the items it cites (#81), which closed the suspect citations left by the test-case backfills (#54 to #60) and the SRC-19 import map (0.12.0). No obligation it rests on changed, and none of its clauses is altered.

**As built (#26).** The outline evaluates the active mockup itself, with the same options and imports
as the editor renders it, so it needs no editor on the page; a component's views and a `ForEach`'s
items get italic rows that stand for the construct, as their elements do in the editor. The keys follow
the usual tree pattern: Right on an open row goes to its first child, Left on a closed one to its
parent, and the selection follows the current row, so a selection made anywhere — a click in the
editor, a key here — shows in both. The first level starts open; deeper rows open as the selection
reaches them.

**R-TOOL-002.TC-1 — Tree and selection sync**

Browser test (Chromium, `typescript/tests/browser/outline.spec.mjs`, "TC-1: tree and selection sync")
on `pages/editor.html`, whose sample nests `Button("Open").id("open")` in a `Card` in a `List` under a
`VStack` and has a `ForEach` of three `Text` rows: the page's one outline, defined by the package
entry, is an ARIA tree sharing the editor's session. Before any selection the visible rows are
`VStack` (expanded), `Text "Inbox"` and `List` (collapsed). A click in the editor on the nested button
expands the list and the card and selects the button's row, which lies inside the tree's scrolling
box; the nine visible rows then match, by level, name, label, `#id` chip, italics, link icon,
`aria-expanded` and `aria-selected`, the list written by hand from the source; the disclosure triangles
lie 14 px further right per level. A click on the `Beta` row selects the `ForEach` and all three of its
rows show as selected; a click on the `Card` row selects the card.

**R-TOOL-002.TC-2 — Keyboard, hover and the Mockups tab**

Browser test (Chromium, `typescript/tests/browser/outline.spec.mjs`, "TC-2: keyboard, hover and the
Mockups tab") on `pages/editor.html`: with the `VStack` row selected, Left collapses it (one visible
row) and Right expands it; Down, Down, Up select text, list, text; Right on the list and on the card
expands them; End selects the `ForEach`, Home the `VStack`; typing `Bu` selects the button. Hovering the
`Card` row sets the session's hovered node and the editor draws its `Card · W × H` tag; hovering the
button in the editor highlights exactly the button's row. The tabs read Elements and Mockups; the
Mockups tab hides the tree and lists `Mockup`, marked current. An outline given a host session over
mockups A and B with B active lists both, B marked, and shows B's rows `VStack` and `Text "second" #t2`.

**Realizes.** F-19

| | Statement |
|---|---|
| C1 | The package MUST define the custom element `mockitdown-outline`, which shows the element tree of the session's active mockup as an ARIA tree (`role="tree"`, rows `role="treeitem"` with `aria-level`, `aria-expanded` and `aria-selected`). |
| C2 | The rows MUST follow the views of the mockup's edit-mode evaluation: one row per view produced from a view node or derived from one (R-EDIT-004.C4, C5), nested as the views are, its node found through its ordinal (R-EDIT-006.C9); a view that is neither MUST get no row, its children taking its place. |
| C3 | A row MUST show the element name, then its main label (its first argument when that argument is positional and its value a string), then an `#id` chip when the view carries `.id(…)`, and MUST be indented by 14 CSS pixels per level. |
| C4 | A row of a derived view (R-EDIT-004.C5) MUST be drawn in italics with a link icon, and selecting it MUST select the node that produced it. |
| C5 | A row with children MUST expand and collapse by its disclosure triangle and by Right and Left; Up and Down MUST move the selection between visible rows, Home and End to the first and last visible row, and typed characters MUST select the next visible row whose name starts with them. |
| C6 | `expandTo(nodeId)` MUST expand the ancestors of every row of the node and scroll the first into view, and the outline MUST call it for each selected node whenever the session's selection changes and after its rows are rebuilt. |
| C7 | Hovering a row MUST set the session's hovered node, and the row of a node hovered elsewhere MUST be highlighted. |
| C8 | The outline MUST have two tabs, Elements (the tree) and Mockups, the latter listing the document's mockups by name in document order with the active one marked by `aria-current="true"`. |
| C9 | `pages/editor.html` MUST also hold a `mockitdown-outline` that shares the editor's session. |
| C10 | Rows of the first level MUST start expanded and deeper rows collapsed, and a row MUST keep its expansion when the rows are rebuilt while its nodes keep their ids. |
| C11 | Right on an expanded row MUST select its first child and Left on a collapsed row or a row without children MUST select its parent row; characters typed within 600 milliseconds of each other MUST form one search, a new search starting after the current row. |
| C12 | Every row whose node is selected MUST carry `aria-selected="true"`, so that all the rows of a `ForEach` are selected with it, and the tree MUST keep the keyboard focus on itself and name the current row by `aria-activedescendant`. |
| C13 | The outline MUST join a session as R-EDIT-006.C11 says, making a session of its own over an empty document when none is given, and MUST dispatch the notifications of a session of its own as the DOM events of R-EDIT-006.C7 and MUST NOT dispatch those of a session it joined. |
| C14 | The outline MUST rebuild its rows after every `change` of the active mockup other than a move and after an `active` notification, and MUST keep its last rows when the mockup does not evaluate. |
| C15 | The outline MUST expose the properties `rows` (every row in document order) and `rendered` (a promise that resolves once the rows are up to date), the shadow parts `tabs`, `tab`, `tree`, `row`, `twisty`, `link`, `name`, `label`, `chip`, `mockups` and `mockup`, and the custom properties `--mkd-outline-selected-background` and `--mkd-outline-hover-background` for the row colours. |
| V1 | On `pages/editor.html`, selecting the nested button in the editor expands the list and the card in the outline and selects and shows the button's row (F-19.AC3). |

---

### R-TOOL-003 — The composite designer and its test page

**Requires:** R-TOOL-001, R-TOOL-002

The composite editor of SRC-13 (callouts 1–6) and the walking skeleton the MockItDown Designer's
desktop shell embeds first (SRC-16 D32–D34): open a document, select, delete, hear about the change, get
the document back.

```html
<mockitdown-designer id="d"></mockitdown-designer>
<script type="module">
  import "mockitdown";
  const d = document.getElementById("d");
  await d.open(await (await fetch("mail.mkdesign")).text());
  d.addEventListener("mockitdown-change", () => markEdited());
  save(JSON.stringify(d.toJSON(), null, 2));   // or writeDesign(d.toJSON())
</script>
```

`open` starts a new session over the document, so a host that kept `designer.session` reads it again
after each `open`; the components inside the designer re-join the new one. An invalid document rejects
with a `DesignOpenError` whose `errors` list every problem `readDesign` found:

```js
try { await d.open(text); } catch (e) { showProblems(e.errors); }   // [{path: "version", message: …}]
d.layout = { right: { collapsed: true } };                          // sizes and collapsed states, in part
d.mode = "preview";                                                  // design, preview or code
```

The gallery panel holds the gallery element (R-TOOL-004, #29); until the inspector exists, the properties
panel holds a placeholder. Delete is the
session's `delete` command (R-EDIT-006.C19), so the host hears one `mockitdown-change` and then one
`mockitdown-select` for the node selected after it.

A host can replace any panel through its slot, for example to put its own inspector on the right; the
replacement joins the designer's session. Code mode is specified with the code view (R-TOOL-009); undo
and the toolbar's Undo and Redo buttons with the history (R-EDIT-007); the zoom control with the canvas
(R-TOOL-011).

Re-checked at 0.10.3 together with the items it cites or is cited by (specification audit, #51): the citations are still accurate and no obligation changed.

**Re-checked at specification 0.10.7.** Its prerequisites were re-checked after the renderer split (#48, #49) and the gallery spec split (#50) without any change to an obligation; neither is this item changed.

**Re-checked at 0.11.0.** Its cited items R-TOOL-001, R-TOOL-002 changed with SRC-18 (all packs recorded, stylesheet partials, gallery home page and easter eggs, TypeScript release builds, new packs); no obligation of this item changed.


**Re-checked at specification 0.12.12.** Re-read after the clarification records of the items it cites (#81), which closed the suspect citations left by the test-case backfills (#54 to #60) and the SRC-19 import map (0.12.0). No obligation it rests on changed, and none of its clauses is altered.

**R-TOOL-003.TC-1 — Open, select, delete, toJSON**

Browser test (`typescript/tests/browser/designer.spec.mjs`, "TC-1") on `pages/designer.html`, which opens
`pages/designer-sample.mkdesign`: the designer owns a `DesignSession` that its outline and view share,
with the `view.active` mockup active, and writes the sample back unchanged; clicking the nested button and
pressing Delete gives exactly one `mockitdown-change`, from the designer, whose one edit removes the
button's line, and selects the button's previous sibling `Text("Quarterly report")` (the card has no
next one); `writeDesign(designer.toJSON())` equals the hand-written `fixtures/designer-deleted.mkdesign`,
the sample without that line, unknown keys and key order kept; Backspace in the outline then deletes the
text and selects the card. `open` of the document with `version: 2` rejects with a `DesignOpenError`
whose `errors` are `[{path: "version", message: "version must be 1, found 2"}]` and keeps the current
document; an object without `view` opens with its first mockup active; `document` is `toJSON()`, and
setting it to the sample's text opens it.

**R-TOOL-003.TC-2 — Layout, slots and modes**

Browser test (`typescript/tests/browser/designer.spec.mjs`, "TC-2") on `pages/designer.html`: the left
column and the right panel measure 240 and 260 px, with the toolbar above, the outline above the gallery,
the view between them and the status bar below; dragging the left edge 60 px makes it 300 px and
`layout` says so; setting `layout = {right: {collapsed: true}}` hides the right panel and the toolbar
toggle shows it again; the toolbar holds Design, Preview and Code and shows `base` and `fit`; the status
bar shows `0 diagnostics`, the breadcrumb `VStack › List › Card › Button` after a click on the button,
and activating `List` selects the list; code with an unknown modifier shows `1 diagnostic`; a custom
element in the `inspector` slot replaces the properties panel inside the right column and is given the
session, and a `mockitdown-outline` in the `outline` slot joins it; an unknown `mode` reads as `design`;
Preview hides the side panels and the view, lists `Sign in` and `Inbox`, and renders `mockitdown-mockup`
elements with each mockup's fence options whose shadow HTML equals that of a `mockitdown-mockup` alone
with the same attributes and code; the Dark toggle sets `appearance="dark"` on every preview; Code mode
shows the active mockup's code with the left column visible, and Design brings the view back.

**Realizes.** F-19, F-20

| | Statement |
|---|---|
| C1 | The package MUST define the custom element `mockitdown-designer`, which owns a design session (its `session` property) that its components join (R-EDIT-006.C11). |
| C2 | The designer's default layout MUST be a toolbar at the top, a left column of 240 CSS pixels holding the outline above the gallery, the view in the centre, a properties panel of 260 CSS pixels on the right, and a status bar at the bottom. |
| C3 | The side panels MUST be resizable between 120 and 640 CSS pixels by dragging their inner edges and by Left and Right on them, and collapsible by a toggle each in the toolbar, and the designer MUST expose their sizes and collapsed states as its `layout` property `{left: {size, collapsed}, right: {size, collapsed}}`, which a host may read and set in part. |
| C4 | The designer MUST offer the named slots `toolbar`, `outline`, `gallery`, `view`, `inspector` and `status`; an element in a slot MUST replace that panel and join the designer's session, the designer setting its `session` property once its custom element is defined. |
| C5 | `designer.open(json)` MUST accept JSON text or an object (written as JSON text first), read it with `readDesign` (R-EDIT-005.C2), start a new session over it whose active mockup is the one `view.active` names, else the first mockup, and resolve; it MUST reject with a `DesignOpenError` whose `errors` are those of `readDesign`, and keep the current document, when they are not empty. |
| C6 | The `document` property MUST return what `toJSON()` returns and, when set, open the document as `open` does, throwing the `DesignOpenError` where `open` rejects. |
| C7 | `designer.toJSON()` MUST return the session's live document, the opened document with every edit applied, such that `writeDesign` of it differs from `writeDesign` of the opened document only in what the edits changed. |
| C8 | The `mode` attribute and property MUST take `design` (the default), `preview` or `code`, an unknown value meaning `design`. |
| C9 | In Preview mode the designer MUST hide the side panels and the view, show each mockup in document order read-only through a `mockitdown-mockup` whose attributes are the fence options among the mockup's options (R-EDIT-005.C9), list the mockups by name beside the previews, each scrolling to its preview when activated, and offer an appearance toggle of light, dark and both that sets every preview's `appearance` while one is pressed. |
| C10 | The toolbar MUST hold the mode switch (Design, Preview, Code) as a radio group and show the name, the pack and the device of the active mockup, the device being its `device` option, else the pack's default device. |
| C11 | Delete or Backspace with the focus in the outline or the view, outside Preview mode and outside a text field, MUST delete the selected nodes through `session.delete()` (R-EDIT-006.C19): one change, then the next sibling of the last removed node, else its previous sibling, else its parent selected. |
| C12 | The status bar MUST show the active mockup's diagnostic count (`0 diagnostics`, `1 diagnostic`) and a breadcrumb of the element names on the path from the top-level view node to the first selected node, each crumb a button selecting its node when activated. |
| C13 | The designer MUST dispatch the events of R-EDIT-006.C7, each exactly once per notification. |
| C14 | The TypeScript project MUST include the test page `pages/designer.html`, which opens the sample design document `pages/designer-sample.mkdesign` of at least two mockups — one nesting a `Button` in a `Card` in a `List`, with a comment, a `let` and a `ForEach` — in a `mockitdown-designer`. |
| C15 | In Code mode the designer MUST show the active mockup's code read-only in place of the view, keeping the side panels, until the code view (R-TOOL-009) takes that place. |
| C16 | The gallery panel MUST hold a `mockitdown-gallery` (R-TOOL-004) that joins the designer's session and takes its `import-base`, and until the inspector exists the properties panel MUST hold a placeholder naming the first selected element. |
| C17 | The designer MUST expose the property `rendered`, a promise that resolves once its outline, its view and, in Preview mode, its previews are rendered, and MUST pass its `import-base` and `asset-base` attributes on to its view, outline and previews. |
| V1 | On `pages/designer.html`, deleting the selected button fires one `mockitdown-change` with its text edits, and `toJSON()` returns the sample document with only that button's lines removed. |

---

### R-TOOL-004 — The gallery: mockitdown-gallery

**Requires:** R-PACK-016, R-EDIT-006, R-WEB-002

The gallery of SRC-13#p1.c3 and SRC-14: the elements allowed at the selection, drawn as small live
previews in the pack's style — the same samples as the Reference pages and the pack gallery test page
(R-PACK-013), created as they scroll into view as the pack gallery does (R-WEB-004.C10). The "Hidden
here" footer says what the role rules filtered out and why, so the rule is never a mystery.

Re-checked at 0.10.3 together with the items it cites or is cited by (specification audit, #51): the citations are still accurate and no obligation changed.

**Re-checked at specification 0.10.7.** Its prerequisites were re-checked after the renderer split (#48, #49) and the gallery spec split (#50) without any change to an obligation; neither is this item changed.

**Re-checked at 0.11.0.** Its cited items R-EDIT-006, R-PACK-016, R-WEB-002 changed with SRC-18 (all packs recorded, stylesheet partials, gallery home page and easter eggs, TypeScript release builds, new packs); no obligation of this item changed.


**Re-checked at specification 0.12.10.** Re-read against R-PACK-016, R-WEB-002 (changed at 0.12.0, 0.12.4: SRC-19 import map (0.12.0), which changes how imports are found and nothing this item obliges; test cases backfilled and as-built clauses recorded by #54 to #60). No obligation this item rests on changed, and none of its clauses is altered (#81).


**Re-checked at specification 0.12.12.** Re-read after the clarification records of the items it cites (#81), which closed the suspect citations left by the test-case backfills (#54 to #60) and the SRC-19 import map (0.12.0). No obligation it rests on changed, and none of its clauses is altered.

**As built (#29).** The inserted code was the bare call `<Name>()`; since #31 it is the sample's call
of R-TOOL-006.C1 (`Toggle("Label")` in the base pack), and a struct is still `<Name>()`. Inserting at the root uses the top-level `insert` of R-EDIT-002 (`parent: null`) through the
session's `insert` command, so the gallery itself holds no editing rule (A-WEB-5.K2). Components are
listed by the structs the edit-mode evaluation knows (`evaluate(…).structs`), declared or imported.

**R-TOOL-004.TC-1 — Filtered gallery and Add**

Browser test (`gallery-component.spec.mjs`) on `pages/designer.html`: with an `HStack` selected, no card
is `NavigationSplitView` or `TabView`, both appear under Hidden here with their reason, and Add on
`Toggle` appends `Toggle(…)` as the stack's last child, selected, with one `mockitdown-insert` (F-19.AC2).
With nothing selected, root-only frames are offered. Previews exist only for cards near the viewport.

As built (#29): `typescript/tests/browser/gallery-component.spec.mjs` opens the hand-written
`tests/browser/fixtures/gallery-sample.mkdesign` in the designer of `pages/designer.html`. With nothing
selected the frame and layout groups are shown with `NavigationSplitView` and `TabView`; with HStack
`#actions` selected both are under "A frame cannot be placed inside a horizontal stack" (R-PACK-016's own
example), the footer's `data-count` and "(n)" equal its listed elements, the first card has a
`mockitdown-mockup` (`device="fit"`, `pack="base"`) and the last none until it is scrolled to; Add on
`Toggle` gives the hand-written code with `Toggle("Label")` (the base pack's sample since #31, R-TOOL-006.C1) as the stack's last child, selected, and one
`mockitdown-insert` from the designer. A second test adds `Text` (as `Text("Content")`) by double-click and `Divider` (as `Divider()`) by Enter
with nothing selected, each on a new line at the end of the top level.

**R-TOOL-004.TC-2 — Data, search and components**

Browser test: the gallery fetches `dist/shared/reference/<pack>.json` and no file under `shared/`;
`filter = "toggle"` leaves the toggle-like cards; a struct declared in the mockup appears in the
Components group; switching the active mockup to another pack lists that pack's own elements first.

As built (#29): the same spec's TC-2 test records the page's requests: `/dist/shared/reference/base.json`
and no path under `/shared/`; `Badge`, declared in the mockup, is in the Components group; `filter =
"toggle"` sets the search field and leaves only cards whose name, role or doc line contains it; typing
`BADGE` into the field sets `filter` and shows the component; `setActive("Cards")` fetches
`vuetify.json` and, in every group, lists the elements `shared/reference/vuetify.json` marks `own`
before the inherited ones.

**Realizes.** F-19

| | Statement |
|---|---|
| C1 | The package MUST define the custom element `mockitdown-gallery`, which lists the elements of the active mockup's pack (the pack its edit-mode evaluation selects) — the pack's own elements first, then the inherited core vocabulary — grouped by the category of their role (R-PACK-016.C1) in the order frames, bars, layouts, collections, content, overlays and annotations. |
| C2 | The gallery MUST read the elements, their roles, doc lines and samples from the reference data published in the package (R-WEB-001.C17), `reference/<pack>.json` fetched relative to the base that `loadAssetsFromUrl` uses by default, once per URL, and MUST list a pack without reference data by its registered elements, without previews. |
| C3 | Each element MUST be shown as a card with its name and a live preview, a `mockitdown-mockup` of its sample with `device="fit"` in the mockup's pack, created only when the card comes within 200 CSS pixels of the gallery's visible part and kept while the pack is shown. |
| C4 | A search field, mirrored by the `filter` property, MUST narrow the cards to the elements whose name, role or doc line contains the search text, ignoring case, and the components to those whose name contains it; the search MUST NOT narrow Hidden here. |
| C5 | A Components group, first, MUST list the structs the active mockup declares or imports that the selection may hold, as cards with their name and no preview. |
| C6 | With no selection the gallery MUST show the elements allowed at the root of a mockup, and with a selection only those the first selected node's element may contain (`allowedChildren`, R-PACK-016.C7). |
| C7 | A footer group, Hidden here, MUST give the number of elements the selection filters out and list them under their reasons. |
| C8 | An Add button on each card, a double-click on the card or Enter on the focused card MUST insert the element as R-TOOL-006.C1 writes it (its sample's call, else `<Name>()`) through `session.insert` (R-EDIT-006.C20): as the last child of the first selected node, else at the end of the mockup's top level, select the new node and dispatch `mockitdown-insert` (R-EDIT-006.C5). |
| V1 | With an `HStack` selected, the gallery shows no `NavigationSplitView` and no `TabView`, lists them under Hidden here, and Add on `Toggle` appends a `Toggle(…)` as the stack's last child (F-19.AC2). |
| C9 | The cards MUST be one tab stop, Up, Down, Home and End moving the focus among them. |
| C10 | The gallery MUST join a session as R-EDIT-006.C11 says and dispatch, as DOM events, only the notifications of a session of its own (R-EDIT-006.C8). |
| C11 | The gallery MUST expose `add(name)`, which inserts as Add does, `state` (the mockup, pack, parent element, the cards before the search and the hidden elements by reason) and `rendered`, a promise that resolves after the next rebuild and never rejects. |

---

### R-TOOL-005 — Drag and drop onto the outline and the view

**Requires:** R-TOOL-004, R-TOOL-001, R-TOOL-002

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

**R-TOOL-005.TC-1 — Drop into the view**

Browser test on `pages/designer.html`: drag the `Text` card onto the gap between a `VStack`'s first and
second children in the view; the bar is horizontal at that gap; after the drop the code holds the new
`Text(…)` as the stack's second child, selected (F-19.AC1); one undo removes it; Esc during a drag
inserts nothing.

As built (#30): `typescript/tests/browser/drag-drop.spec.mjs` opens the hand-written
`tests/browser/fixtures/drag-sample.mkdesign` (a `VStack` of `Text("First")`, `Text("Second")` and an
`HStack` of two buttons) in the designer of `pages/designer.html` and drags with the pointer
(`page.mouse`). Over the gap between the texts the VStack's box is the `drop-target` and the
`drop-bar` is horizontal (`data-orientation`), wider than tall and between the two texts, with the
`grabbing` cursor; the drop gives the hand-written code with `Text("Content")` (the base pack's sample, R-TOOL-006.C1; `Text()` before #31) second, selected, after exactly
one code `change`. Over the gap between the buttons the bar is vertical; Esc removes the ghost, the
shield and the bar, and releasing afterwards changes nothing. There is no undo yet (R-EDIT-007): the
undo step is checked as the one `change`.

**R-TOOL-005.TC-2 — Outline drops and refusals**

Browser test: dropping a card in the upper, middle and lower third of a row inserts before, inside and
after it; dragging a `NavigationSplitView` card over an `HStack` row shows `not-allowed` and the
reason; dragging a card row onto its own child is refused; dragging a row after its sibling moves it,
its node id kept.

As built (#30): `typescript/tests/browser/drag-drop.spec.mjs` on the same fixture: the `Text`,
`Divider` and `Text` cards dropped in the upper, middle and lower third of the `HStack` row (its
`data-drop` `before`, `inside`, `after`) give the hand-written code after each drop, the new node
selected, three changes in all. The `NavigationSplitView` card over the HStack row's middle third
marks it `inside refused`, shows `not-allowed` and "A frame cannot be placed inside a horizontal
stack" by the pointer, and drops nothing; the HStack row dragged onto its `Left` button's row shows
"Cannot move HStack into one of its own descendants"; the `Second` row dropped in the HStack row's
lower third moves after it, its node id kept and selected, in one change. The session API (C8 to C10:
positions, checks through a `ForEach`, refusals, one change per drop) is also tested in
`typescript/tests/unit/design-session.test.ts` with hand-written expectations.

**Realizes.** F-19

| | Statement |
|---|---|
| C1 | A gallery card MUST be draggable onto the outline and onto the editor, and an outline row of a view that is not derived MUST be draggable within the outline, carrying every selected node when the row is one of several selected rows. |
| C2 | Over an outline row, the outline MUST show a drop indicator before the row, after it or inside it, chosen by the pointer's position in the upper, lower or middle third of the row, and below the last row a drop indicator at the end of the mockup's top level. |
| C3 | Over the editor, the editor MUST outline the innermost container under the pointer (`session.isContainer`, C10), else the mockup's top level, and show an insertion bar at the gap between its children nearest the pointer, across the axis along which its children are laid out: horizontal in a `VStack`, vertical in an `HStack`. |
| C4 | A drop position whose parent cannot contain the dragged element (R-PACK-016.C6), that lies inside a dragged row's own subtree, or that the edit operation refuses MUST show the `not-allowed` cursor, the indicator in the refused colour and the reason next to the pointer, and a drop there MUST do nothing. |
| C5 | Dropping a gallery card MUST insert the element as R-TOOL-006.C1 writes it (its sample's call, else `<Name>()`) at the indicated position (R-EDIT-002.C4) and select it; dropping outline rows MUST move their nodes there (R-EDIT-002.C8), keeping their node ids and selecting them. |
| C6 | Each drop MUST be one edit operation of the session, notifying one `change` (one undo step once the history of R-EDIT-007 exists), and Esc MUST cancel a drag, changing nothing. |
| V1 | Dragging `Text` from the gallery into a `VStack` in the view inserts `Text(…)` at the position of the insertion bar (F-19.AC1). |
| C7 | A drag MUST be a pointer drag that starts once the pointer has moved 4 CSS pixels from where it was pressed and shows, next to the pointer, the name of what is dragged; releasing the pointer where no component shows a position, or a cancelled pointer, MUST end the drag with nothing changed. |
| C8 | The components MUST take the drop position, its check and the drop from the design session (A-WEB-5.K2): `session.dropPosition(node, zone)` gives the position before, inside (as last child) or after a node of the active mockup and is refused for a node that stands where no statement goes beside it; `session.checkDrop(source, position, pack)` gives `{ok: true}` or `{ok: false, reason}`; `session.drop(source, position, pack)` checks and then inserts or moves. |
| C9 | The role rules of C4 MUST be those of the pack of the target component's last evaluation of the mockup, and a `ForEach` or an `if` MUST defer them to the element above it. |
| C10 | `session.isContainer(node, pack)` MUST be true for an element call other than a `ForEach` that already has statement children or whose element holds children in the pack (R-PACK-016.C16), and `session.childrenOf(parent)` MUST give the statement children a position's index counts (null: the top level). |
| C11 | Only the editor showing the session's active mockup MUST take drops, and only a drag of the component's own session MUST be shown or dropped. |
| C12 | The outline MUST mark the row of the position with `data-drop` (`before`, `inside` or `after`, followed by ` refused` when refused), and the editor MUST draw the outlined container and the bar as the shadow parts `drop-target` and `drop-bar`, the bar carrying `data-orientation`; allowed positions MUST be coloured by `--mkd-drop-color` (default `#2f80ed`) and refused ones by `--mkd-drop-refused-color` (default `#d93025`). |

---

### R-TOOL-006 — New elements: sample arguments and first-text editing

**Requires:** R-TOOL-004, R-EDIT-003

Naming a new element takes one keystroke sequence (SRC-12#s6): it arrives with its sample's arguments,
as in the Reference pages, and its first text opens for editing at once.

**As built (#31).** The sample is the one the pack's reference data publishes (R-PACK-013), so the
text depends on the pack: in the base pack a `Button` arrives as `Button("Label")` and a `Toggle` as
`Toggle("Label")`, in swiftui as `Button("Share", systemImage: "square.and.arrow.up")`. The rule
applies to every insertion from the gallery, Add and a drop alike (R-TOOL-004.C8, R-TOOL-005.C5), and
the editor opens the field after any insertion into the mockup it shows. The gallery holds no rule of
its own: `sampleCall` is in the core, `firstText` and `setText` in the session (A-WEB-5.K2). The field
is an `<input>` in the editor's shadow root (`part="text-field"`), drawn above the outlines with the
rendered element's font; its keys stay in it, so the designer's Delete and the editor's Esc and Enter
do not act on the selection while typing.

Re-checked at 0.10.3 together with the items it cites or is cited by (specification audit, #51): the citations are still accurate and no obligation changed.

**Re-checked at specification 0.10.7.** Its prerequisites were re-checked after the renderer split (#48, #49) and the gallery spec split (#50) without any change to an obligation; neither is this item changed.

**Re-checked at 0.11.0.** Its cited items R-EDIT-003, R-TOOL-004 changed with SRC-18 (all packs recorded, stylesheet partials, gallery home page and easter eggs, TypeScript release builds, new packs); no obligation of this item changed.


**Re-checked at specification 0.12.12.** Re-read after the clarification records of the items it cites (#81), which closed the suspect citations left by the test-case backfills (#54 to #60) and the SRC-19 import map (0.12.0). No obligation it rests on changed, and none of its clauses is altered.

**R-TOOL-006.TC-1 — Sample arguments and inline edit**

Browser test on `pages/designer.html`: Add on `Button` inserts `Button("Label")` and opens a focused
field with the text selected; typing `Save` and Enter gives `Button("Save")`; undo restores
`Button("Label")` and a second undo removes the button; Add on `List` inserts its sample call without
the sample's rows; Esc keeps the sample text.

As built (#31): `typescript/tests/browser/new-element.spec.mjs` (IT-59) opens the hand-written
`tests/browser/fixtures/new-element-sample.mkdesign` (base pack, a `VStack` holding `Text("Sign in")`)
in the designer and selects the stack. Add on `Button` inserts `Button("Label")`, the base pack's
sample; the field `.mkd-editor__field` holds `Label`, is focused with characters 0 to 5 selected and
sits over the new button's element; typing `Save` and Enter closes it and gives `Button("Save")`, the
code changes being exactly the insertion's and then the text's, with the button still selected. Add
on `List` gives `List()` and opens no field. Add on `Text` opens `Content`; typing then Esc closes it,
keeps `Text("Content")` and adds no change; Add on `Toggle`, typing `Wi-Fi` and a click into the
gallery's search field commits `Toggle("Wi-Fi")`. With `Hello` typed into the field of a new
`Text`, a host's `session.insert('Button("Go")', …)` commits `Text("Hello")` and opens the field
again on `Go`; replacing the code as text without the button closes the field with nothing committed. There is no undo yet (R-EDIT-007): the undo step is
checked as a change of its own. The expected code was written by hand from the fixture and
`shared/reference/base.json`.

**R-TOOL-006.TC-2 — The insertion code and the session's text**

Unit test `typescript/tests/unit/sample.test.ts`: `sampleCall` keeps a sample call's arguments and
modifiers and drops its trailing closures (`List() { … }` gives `List()`, `NavigationSplitView { … }
detail: { … }` gives `NavigationSplitView()`, a modifier after the closure is kept, a closure passed as
an argument is kept), and gives `<Name>()` for a sample shown inside another element, two statements,
a `let`, a bare identifier, code that does not parse and no sample; over `shared/reference/base.json`
Button, Toggle, List and VStack give `Button("Label")`, `Toggle("Label")`, `List()` and `VStack()`.
`firstText` reads plain string literals only (not an interpolation, a label or a variable). On a
session, `setText` with the same text has no edits and no notification, a new text with quotes is
written escaped as one `change` keeping the node's id, and a node without a first text is refused
(`n3 has no text as its first argument`). All expected values were written by hand.

**Realizes.** F-19

| | Statement |
|---|---|
| C1 | An element inserted from the gallery MUST be written as the top-level call of its reference sample (R-PACK-013) with that call's arguments and modifiers and without its trailing closures, or as `<Name>()` when the sample is not a call of the element. |
| C2 | After an insertion into the mockup it shows, when the new call's first positional argument is a string literal without interpolation, the editor MUST open an inline text field over the new element's first rendered element holding that string, focused with its text selected. |
| C3 | Enter or leaving the field MUST commit the text with `setArgument` (R-EDIT-003.C1) as one change of the session, separate from the insertion's (one undo step once the history of R-EDIT-007 exists); Esc MUST close the field and keep the sample's text. |
| V1 | In the base pack, adding a `Button` inserts `Button("Label")`, opens a field holding `Label`, and typing `Save` then Enter gives `Button("Save")` in a second change after the insertion's. |
| C4 | The design session MUST provide `firstText(node)`, the text of a node's first positional argument when it is a string literal without interpolation, else null, and `setText(node, text)`, which sets that argument to the string literal of the text as one change, changes nothing and notifies nothing for the same text, and is refused for a node without such an argument. |
| C5 | An insertion that arrives while the field is open MUST first commit the field's text, and a field whose node no longer has a first text after a render MUST close without committing. |
| C6 | The code of C1 MUST be computed by the core (`sampleCall(name, sample)`), which gives `<Name>()` for a missing sample, a sample that does not parse, one with more than one top-level statement, a declaration or an import, and one whose single statement is not a call of the element. |

---

### R-TOOL-007 — The inspector: mockitdown-inspector

**Requires:** R-PACK-017, R-EDIT-007, R-EDIT-003

The properties panel of SRC-13#p1.c5 (SRC-12#s7). Its controls are generated from the typed parameter
data (R-PACK-017), so a new pack needs no inspector code, and it borrows the field style of the MockItOut
inspector: a small grey label above a full-width input (SRC-12#s15).

Edits apply as the designer types, debounced, and a burst of typing is one undo step. An invalid value is
never written: a value the control rejects, or one whose rendering would add a diagnostic at the node,
stays red with the message until corrected.

Re-checked at 0.10.3 together with the items it cites or is cited by (specification audit, #51): the citations are still accurate and no obligation changed.

**Re-checked at specification 0.10.7.** Its prerequisites were re-checked after the renderer split (#48, #49) and the gallery spec split (#50) without any change to an obligation; neither is this item changed.

**Re-checked at 0.11.0.** Its cited items R-EDIT-003, R-EDIT-007, R-PACK-017 changed with SRC-18 (all packs recorded, stylesheet partials, gallery home page and easter eggs, TypeScript release builds, new packs); no obligation of this item changed.


**Re-checked at specification 0.12.12.** Re-read after the clarification records of the items it cites (#81), which closed the suspect citations left by the test-case backfills (#54 to #60) and the SRC-19 import map (0.12.0). No obligation it rests on changed, and none of its clauses is altered.

**R-TOOL-007.TC-1 — Variant change and undo**

Browser test (`inspector.spec.mjs`) on `pages/designer.html`: select a `Button` with declared variants;
the variant choice lists exactly those; choosing another changes the code's `.variant(…)` and the
rendered class within 500 ms; Undo restores both (F-19.AC4). Typing a label in the text field forms one
undo step.

**R-TOOL-007.TC-2 — Typed controls and validation**

Browser test: each type of R-PACK-017.C2 gets its control; Add argument offers only unused labels;
Add modifier omits modifiers in the chain; `.frame(width: -10)` is shown invalid with its message and the
code is unchanged; an unknown label `bogus:` shows "not understood by this pack" and can be removed; a
duplicate `.id` is refused; two selected nodes show "2 selected".

**R-TOOL-007.TC-3 — Mockup tab and Edit in code**

Browser test: with nothing selected, changing the device in the Mockup tab changes the mockup's
`options.device` and the rendering, undoable; on a derived row, Edit in code switches to Code mode with
the node's span selected.

**Realizes.** F-19

| | Statement |
|---|---|
| C1 | The package MUST define the custom element `mockitdown-inspector`, which shows the properties of the single selected node in four groups: Arguments, Variant and state, Modifiers, and Identity. |
| C2 | Arguments MUST list the element's positional parameters in order, then the labelled arguments in use, and an Add argument control MUST offer the labels of the element's parameter types (R-PACK-017.C6) that are not in use. |
| C3 | Each argument and modifier argument MUST be edited with the control of its type: a text field for `text`, a number field for `number`, a switch for `bool`, a choice of its values for `enum`, a colour field accepting names and hexadecimal values for `color`, a text field suggesting icon names for `icon` and a list editor for `array`. |
| C4 | Variant and state MUST offer `variant` with only the variants the element declares (M-PACK-2.F5), and the state arguments `selected`, `disabled`, `checked` and `value` its role's parameters name. |
| C5 | Modifiers MUST list the node's modifier chain grouped by the modifier groups of the vocabulary (R-PACK-017.C5), and an Add modifier control MUST offer only rendered modifiers that are not already in the chain. |
| C6 | Identity MUST edit the node's `.id` (R-EDIT-003.C8), showing a refusal for an identifier in use, its `.ref` list (R-EDIT-003.C10) and its comment (R-EDIT-003.C11). |
| C7 | A labelled argument the element does not understand (R-EVAL-004.C7) MUST be listed under Arguments with the note "not understood by this pack" and a remove control. |
| C8 | An edit MUST be applied 150 ms after the last input in its control, as one operation coalesced per node and field (R-EDIT-007.C5). |
| C9 | A value that its control cannot accept, or whose application would add a diagnostic located at the node, MUST be shown with `aria-invalid` and the diagnostic's text, and MUST NOT be applied. |
| C10 | When nothing is selected, the inspector MUST show a Mockup tab that edits the active mockup's name, pack, device, width, height, appearance, title, caption and Elements table option, each edit one undo step with the change kind `options`. |
| C11 | When the selected node is derived or has a construct the controls cannot express, the inspector MUST offer Edit in code, which switches the designer to Code mode and reveals the node's span (R-TOOL-008.C1). |
| C12 | With several nodes selected, the inspector MUST show their number and no fields. |
| V1 | Changing a button's variant in the inspector changes the code and the rendering, and undo restores both (F-19.AC4); a negative width is shown as invalid and not applied. |

---

### R-TOOL-008 — The code view: mockitdown-code

**Requires:** R-EDIT-001

A light editor built for this project (SRC-12#s9): a `<textarea>` over a coloured copy of its text,
with line numbers, diagnostics in the gutter, bracket matching and auto-indent. It has no third-party
editor (SRC-12#s14 "Dependencies", ADR-20) and, by the developer's choice, no find and replace, folding
or multi-cursor; find and replace can be a later issue. It is usable on its own, for example to show code
beside a `mockitdown-mockup`.

Re-checked at 0.10.3 together with the items it cites or is cited by (specification audit, #51): the citations are still accurate and no obligation changed.

**Re-checked at specification 0.10.7.** Its prerequisites were re-checked after the renderer split (#48, #49) and the gallery spec split (#50) without any change to an obligation; neither is this item changed.

**Re-checked at 0.11.0.** Its cited items ADR-20, R-EDIT-001 changed with SRC-18 (all packs recorded, stylesheet partials, gallery home page and easter eggs, TypeScript release builds, new packs); no obligation of this item changed.


**Re-checked at specification 0.12.12.** Re-read after the clarification records of the items it cites (#81), which closed the suspect citations left by the test-case backfills (#54 to #60) and the SRC-19 import map (0.12.0). No obligation it rests on changed, and none of its clauses is altered.

**R-TOOL-008.TC-1 — Light editor**

Browser test (`code.spec.mjs`) on `pages/designer.html` in Code mode and on a bare `mockitdown-code`:
tokens get their colour classes; line numbers match the line count; a diagnostic on line 3 marks that
gutter line with an accessible message; the caret after `{` highlights its `}`, an unmatched `)` is
marked; Enter after `{` indents one unit, `}` outdents; Tab indents a selection; `reveal` selects the
range; each typed character fires one `input` event.

**R-TOOL-008.TC-2 — No library, speed**

`node:test` reads the compiled module graph of `mockitdown-code` and fails on an import outside the
package's core lexer; a browser timing of 50 keystrokes in a 1000-line source reports the median
re-colour time (warning above 16 ms).

**Realizes.** F-19

| | Statement |
|---|---|
| C1 | The package MUST define the custom element `mockitdown-code`, a plain text area with the properties `value` and `diagnostics` and the method `reveal(range)`, which scrolls to the range `{start, end}` (offsets) and selects it. |
| C2 | The code view MUST colour the text from the TypeScript lexer's tokens (keywords, element and type names, identifiers, modifiers, strings, numbers, comments, punctuation) in a layer behind the transparent text area, with colours from custom properties for light and dark appearance. |
| C3 | The code view MUST show line numbers in a gutter. |
| C4 | The code view MUST mark each line holding a diagnostic in the gutter, with the severity's colour and the message available as text to pointer and keyboard users. |
| C5 | When the caret is next to a bracket (`(`, `)`, `{`, `}`, `[`, `]`), the code view MUST highlight it and its match, and MUST mark an unmatched bracket. |
| C6 | Enter MUST keep the current line's indentation and add one indentation unit (R-EDIT-002.C11) after a line ending in `{` or `(`; a `}` typed as a line's first character MUST remove one unit; Tab and Shift+Tab MUST indent and outdent the selected lines, and Esc followed by Tab MUST move the focus out. |
| C7 | The code view MUST dispatch a bubbling, composed `input` event for every change of its value by the user. |
| C8 | The code view MUST depend on no editor library and on no other design-tool component, and MUST NOT provide find and replace, folding or multiple cursors. |
| C9 | Re-colouring after a keystroke SHOULD take less than 16 ms for a source of 1000 lines. |
| V1 | Typing in the code view of a 1000-line source keeps colouring, line numbers and bracket matching correct, and its module imports only the core lexer. |

---

### R-TOOL-009 — Two-way editing and Code mode

**Requires:** R-TOOL-008, R-TOOL-003, R-EDIT-007

Code and pictures edit the same mockup (SRC-12#s4 "Modes", SRC-12#s9). Typing re-parses after a short
pause; a valid result updates the outline and the view and keeps the selection by node id, an invalid one
leaves them on the last valid tree, read-only, so the designer never loses the picture while a brace is
missing. Developers can keep the code docked under the canvas in Design mode.

Re-checked at 0.10.3 together with the items it cites or is cited by (specification audit, #51): the citations are still accurate and no obligation changed.

**Re-checked at specification 0.10.7.** Its prerequisites were re-checked after the renderer split (#48, #49) and the gallery spec split (#50) without any change to an obligation; neither is this item changed.

**Re-checked at 0.11.0.** Its cited items R-EDIT-007, R-TOOL-003, R-TOOL-008 changed with SRC-18 (all packs recorded, stylesheet partials, gallery home page and easter eggs, TypeScript release builds, new packs); no obligation of this item changed.


**Re-checked at specification 0.12.12.** Re-read after the clarification records of the items it cites (#81), which closed the suspect citations left by the test-case backfills (#54 to #60) and the SRC-19 import map (0.12.0). No obligation it rests on changed, and none of its clauses is altered.

**R-TOOL-009.TC-1 — Unbalanced brace**

Browser test (`sync.spec.mjs`) on `pages/designer.html`: select a `Text`; in Code mode delete a `}`;
after 300 ms the gutter and the status bar show a syntax diagnostic and the outline still shows the
previous tree with editing refused; retype the `}`; the view updates and the same `Text` node is still
selected (F-19.AC5); the change's edits are the one-character replacements.

**R-TOOL-009.TC-2 — Following the caret and visual edits**

Browser test: moving the caret into a `Toggle` selects its row; a gallery Add in Code mode inserts into
the stack holding the caret; a Delete in the outline updates the code view with the caret kept before
the removed range; selecting a node highlights its span; in Design mode the dock toggle shows the code
view below the view.

**Realizes.** F-19

| | Statement |
|---|---|
| C1 | A code view joined to the session MUST apply its text to the active mockup 300 ms after the last keystroke, as one change whose edits replace the range between the longest common prefix and suffix of the old and new text. |
| C2 | When the new code parses, the session MUST take the tree from `reparse` (R-EDIT-001.C9), and the outline and the editor MUST update with the selection kept by node id. |
| C3 | When the new code does not parse, the code view and the status bar MUST show its diagnostics, and the outline and the editor MUST keep the last valid tree, marked read-only and refusing edits, until the code parses again. |
| C4 | While the code parses, moving the caret MUST select the innermost view node whose span holds the caret (R-EDIT-001.C8). |
| C5 | A change made in another component MUST be applied to the code view by its text edits, keeping the caret and the scroll position outside the edited ranges. |
| C6 | Selecting a node in another component MUST highlight the node's span in the code view without moving the focus. |
| C7 | In Code mode the designer MUST show the active mockup's code view in the centre, keep the outline and the inspector live, and make the gallery insert into the node the caret selects (C4). |
| C8 | In Design mode the designer MUST offer a toggle that docks the code view below the view, both kept in sync. |
| V1 | Typing an unbalanced brace shows a diagnostic in the gutter and the status bar while the outline keeps the last valid tree; fixing it updates the view with the selection kept (F-19.AC5). |

---

### R-TOOL-010 — The diagnostics list: mockitdown-diagnostics

**Requires:** R-TOOL-009

The diagnostics of the active mockup, opened from the status bar's count (SRC-12#s4, SRC-13#p1.c6). An
entry leads to its element, or, for a syntax error with no element yet, to its place in the code.

Re-checked at 0.10.3 together with the items it cites or is cited by (specification audit, #51): the citations are still accurate and no obligation changed.

**Re-checked at specification 0.10.7.** Its prerequisites were re-checked after the renderer split (#48, #49) and the gallery spec split (#50) without any change to an obligation; neither is this item changed.

**Re-checked at 0.11.0.** Its cited items R-TOOL-009 changed with SRC-18 (all packs recorded, stylesheet partials, gallery home page and easter eggs, TypeScript release builds, new packs); no obligation of this item changed.


**Re-checked at specification 0.12.12.** Re-read after the clarification records of the items it cites (#81), which closed the suspect citations left by the test-case backfills (#54 to #60) and the SRC-19 import map (0.12.0). No obligation it rests on changed, and none of its clauses is altered.

**R-TOOL-010.TC-1 — Diagnostics lead to their element**

Browser test on `pages/designer.html`: a mockup with `Text("A", bogus: 1)` and an unknown element shows
two entries; activating the status count opens the list; activating the first entry selects the `Text`
(F-19.AC7); with a syntax error, activating its entry reveals the location in the code view; fixing the
code empties the list ("No problems").

**Realizes.** F-19

| | Statement |
|---|---|
| C1 | The package MUST define the custom element `mockitdown-diagnostics`, which lists the active mockup's diagnostics in order, each with its severity, message, line and column, and shows "No problems" when there are none. |
| C2 | Activating an entry by click or Enter MUST select the innermost view node whose span holds the diagnostic's location, else reveal the location in the code view (R-TOOL-008.C1). |
| C3 | The list MUST update on every `diagnostics` notification of its session. |
| C4 | In the composite designer, activating the status bar's diagnostic count MUST open the list, and Esc MUST close it. |
| V1 | Activating a diagnostic about an unknown argument selects the element that carries the argument (F-19.AC7). |

## Revision history

| Version | Date | Change |
|---|---|---|
| 0.13.10 | 2026-11-28 | as built (#31): Add inserts the sample's call of R-TOOL-006.C1 instead of <Name>() (C8); as built (#31): a dropped card is inserted as the sample's call of R-TOOL-006.C1 instead of <Name>() (C5); as built (#31): sample calls of the base pack (V1 Button("Label")), the commit as a change of its own until R-EDIT-007, session firstText/setText (C4), an insertion while open and a vanished node (C5), sampleCall in the core (C6); TC-1 as built, TC-2 new |
| 0.13.9 | 2026-11-28 | as built (#30): selected rows drag together (C1); end of the top level below the last row (C2); container by session.isContainer, else the top level, bar across the children's axis (C3); edit refusals and the refused colour (C4); <Name>() and moved ids selected (C5); one change, undo with R-EDIT-007 (C6); pointer drag, 4 px, ghost (C7); session dropPosition/checkDrop/drop (C8); pack of the last evaluation, ForEach and if defer (C9); isContainer, childrenOf (C10); active mockup and own session only (C11); data-drop, parts and colours (C12); TC files name the tests |
| 0.13.8 | 2026-11-28 | as built (#29): the gallery panel holds mockitdown-gallery (C16); as built (#29): pack from the edit-mode evaluation, category order (C1); reference/<pack>.json at loadAssetsFromUrl's default base, registered elements without previews when a pack has none (C2); previews within 200 px of the visible part (C3); search over components, not Hidden here (C4); Components first, filtered, no preview (C5); first selected node (C6); <Name>() through session.insert (C8); keyboard (C9), session join and events (C10), add/state/rendered (C11); TC files name the tests |
| 0.13.6 | 2026-11-28 | as built (#27): C3 panel range, arrow keys, toolbar toggles and layout shape; C4 slotted elements given the session; C5 a new session per open, DesignOpenError; C6 the setter throws; C7 the live document; C9 previews with the fence options, the mockups list and the appearance toggle; C10 radio group, name and default device; C11 through session.delete(), not in Preview or a text field; C12 count wording and crumbs; C14 the sample file; C15-C17 Code mode, placeholders, rendered and base URLs; TC-1, TC-2 name the designer.spec.mjs tests |
| 0.13.5 | 2026-11-28 | as built (#26): C2 rows also for derived views without a node, other views skipped; C3 the main label is a positional first argument; C5 visible rows; C6 every row of the node, also after a rebuild; C8 aria-current; C10-C15 initial expansion, Right/Left to child and parent, typeahead window, aria-selected rows and activedescendant, the outline's session and events, rebuilds, properties and parts; TC-1, TC-2 name the outline.spec.mjs tests |
| 0.13.4 | 2026-11-28 | as built (#25): C10 hover colour default #2f80ed; C12-C21 the editor's own session, own-session events, clearing and root clicks, the Enter trail, Alt-click start and wrap, activation, outlines of derived nodes, parts, properties and focus; TC-1 to TC-3 name the editor.spec.mjs tests |
| 0.12.12 | 2026-11-27 | re-checked with the items it cites after the #81 audit: unaffected (#81) |
| 0.12.11 | 2026-11-27 | re-checked against R-PACK-016, R-WEB-002: unaffected (#81); re-checked against R-WEB-002: unaffected (#81) |
| 0.11.0 | 2026-11-27 | re-checked against R-TOOL-009 (SRC-18): unaffected; re-checked against R-TOOL-001, R-TOOL-002 (SRC-18): unaffected; re-checked against R-EDIT-006, R-PACK-016, R-WEB-002 (SRC-18): unaffected; re-checked against R-TOOL-001, R-TOOL-002, R-TOOL-004 (SRC-18): unaffected; re-checked against R-EDIT-006 (SRC-18): unaffected; re-checked against R-EDIT-007, R-TOOL-003, R-TOOL-008 (SRC-18): unaffected; re-checked against R-EDIT-003, R-EDIT-007, R-PACK-017 (SRC-18): unaffected; re-checked against R-EDIT-004, R-EDIT-006, R-WEB-002 (SRC-18): unaffected; re-checked against R-EDIT-003, R-TOOL-004 (SRC-18): unaffected; re-checked against ADR-20, R-EDIT-001 (SRC-18): unaffected |
| 0.10.8 | 2026-11-27 | re-checked after the renderer split: unaffected (#53) |
| 0.10.3 | 2026-11-26 | re-stamped with the items it cites after the audit's prose clarifications; no obligation changes (audit #51) |
| 0.10.0 | 2026-11-26 | Page created (ING-1) |
| 0.13.9 | 2026-11-28 | as built (#30): selected rows drag together (C1); end of the top level below the last row (C2); container by session.isContainer, else the top level, bar across the children's axis (C3); edit refusals and the refused colour (C4); <Name>() and moved ids selected (C5); one change, undo with R-EDIT-007 (C6); pointer drag, 4 px, ghost (C7); session dropPosition/checkDrop/drop (C8); pack of the last evaluation, ForEach and if defer (C9); isContainer, childrenOf (C10); active mockup and own session only (C11); data-drop, parts and colours (C12); TC files name the tests |
| 0.13.8 | 2026-11-28 | as built (#29): the gallery panel holds mockitdown-gallery (C16); as built (#29): pack from the edit-mode evaluation, category order (C1); reference/<pack>.json at loadAssetsFromUrl's default base, registered elements without previews when a pack has none (C2); previews within 200 px of the visible part (C3); search over components, not Hidden here (C4); Components first, filtered, no preview (C5); first selected node (C6); <Name>() through session.insert (C8); keyboard (C9), session join and events (C10), add/state/rendered (C11); TC files name the tests |
| 0.13.6 | 2026-11-28 | as built (#27): C3 panel range, arrow keys, toolbar toggles and layout shape; C4 slotted elements given the session; C5 a new session per open, DesignOpenError; C6 the setter throws; C7 the live document; C9 previews with the fence options, the mockups list and the appearance toggle; C10 radio group, name and default device; C11 through session.delete(), not in Preview or a text field; C12 count wording and crumbs; C14 the sample file; C15-C17 Code mode, placeholders, rendered and base URLs; TC-1, TC-2 name the designer.spec.mjs tests |
| 0.13.5 | 2026-11-28 | as built (#26): C2 rows also for derived views without a node, other views skipped; C3 the main label is a positional first argument; C5 visible rows; C6 every row of the node, also after a rebuild; C8 aria-current; C10-C15 initial expansion, Right/Left to child and parent, typeahead window, aria-selected rows and activedescendant, the outline's session and events, rebuilds, properties and parts; TC-1, TC-2 name the outline.spec.mjs tests |
| 0.13.4 | 2026-11-28 | as built (#25): C10 hover colour default #2f80ed; C12-C21 the editor's own session, own-session events, clearing and root clicks, the Enter trail, Alt-click start and wrap, activation, outlines of derived nodes, parts, properties and focus; TC-1 to TC-3 name the editor.spec.mjs tests |
| 0.12.12 | 2026-11-27 | re-checked with the items it cites after the #81 audit: unaffected (#81) |
| 0.12.11 | 2026-11-27 | re-checked against R-PACK-016, R-WEB-002: unaffected (#81); re-checked against R-WEB-002: unaffected (#81) |
| 0.11.0 | 2026-11-27 | re-checked against R-TOOL-009 (SRC-18): unaffected; re-checked against R-TOOL-001, R-TOOL-002 (SRC-18): unaffected; re-checked against R-EDIT-006, R-PACK-016, R-WEB-002 (SRC-18): unaffected; re-checked against R-TOOL-001, R-TOOL-002, R-TOOL-004 (SRC-18): unaffected; re-checked against R-EDIT-006 (SRC-18): unaffected; re-checked against R-EDIT-007, R-TOOL-003, R-TOOL-008 (SRC-18): unaffected; re-checked against R-EDIT-003, R-EDIT-007, R-PACK-017 (SRC-18): unaffected; re-checked against R-EDIT-004, R-EDIT-006, R-WEB-002 (SRC-18): unaffected; re-checked against R-EDIT-003, R-TOOL-004 (SRC-18): unaffected; re-checked against ADR-20, R-EDIT-001 (SRC-18): unaffected |
| 0.10.8 | 2026-11-27 | re-checked after the renderer split: unaffected (#53) |
| 0.10.3 | 2026-11-26 | re-stamped with the items it cites after the audit's prose clarifications; no obligation changes (audit #51) |
| 0.10.0 | 2026-11-26 | Page created (ING-1) |
