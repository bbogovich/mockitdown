---
title: "Design-tool components"
spec_version: 0.10.0
status: draft
updated: 2026-11-26
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

**R-TOOL-001.TC-1 — Click to locate**

Browser test (Chromium, `editor.spec.mjs`) on `pages/editor.html`: a click on the button inside the
card inside the list selects the button's node (`editor.session.selection`); a second click selects the
card; Esc selects the list; Enter returns to the card; Alt-click cycles button, card, list, root; a click
on a `ForEach` row selects the `ForEach` node and shows the badge.

**R-TOOL-001.TC-2 — Overlays**

Browser test: hovering the button shows a tag `Button · W × H` matching its bounding box; the selection
outline's colour follows `--mkd-selection-color`; the rendered elements' attributes and bounding boxes
are the same with and without a selection; a mockup importing a component through `import-base` renders.

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
| C10 | The selection and hover outlines MUST be drawn in a layer above the rendering that changes neither its layout nor its elements' attributes, coloured by the custom properties `--mkd-selection-color` (default `#ff8a00`) and `--mkd-hover-color`. |
| C11 | The TypeScript project MUST include the test page `pages/editor.html`, holding one `mockitdown-editor` over a sample mockup that nests a `Button` in a `Card` in a `List` and has a `ForEach`. |
| V1 | On `pages/editor.html`, a click on the nested button selects the button's node, a second click selects the card, Enter returns to the button, and a click on a row of the `ForEach` selects the `ForEach` and shows the derived badge. |

---

### R-TOOL-002 — The outline: mockitdown-outline

**Requires:** R-EDIT-006

The primary means of selection (SRC-12#s5, SRC-13#p1.c2): the element tree of the active mockup, with
the row anatomy, the 14-pixel indent and the rounded selected row of the MockItOut designer's outline
(SRC-12#s15). A row reads like the code it stands for — `Button "Sign in" #submit`.

The tree follows the rendered structure, so a `ForEach` over three items shows three italic rows; each
selects the loop. Reordering rows by drag is R-TOOL-005; the Mockups tab becomes active in R-TOOL-013.

**R-TOOL-002.TC-1 — Tree and selection sync**

Browser test (`outline.spec.mjs`) on `pages/editor.html`: the tree's rows match the edit-mode
evaluation (names, labels, `#id` chips, levels, 14 px indent per level); a click in the editor on the
nested button selects its row, expanded and in view (F-19.AC3); the `ForEach` rows are italic with the
link icon and select the `ForEach`.

**R-TOOL-002.TC-2 — Keyboard and hover**

Browser test: Left collapses, Right expands, Up and Down move, Home and End jump, typing `Bu` selects
the next row starting with "Bu"; hovering a row outlines its element in the editor and hovering the
element highlights the row; the Mockups tab lists the document's mockups.

**Realizes.** F-19

| | Statement |
|---|---|
| C1 | The package MUST define the custom element `mockitdown-outline`, which shows the element tree of the session's active mockup as an ARIA tree (`role="tree"`, rows `role="treeitem"` with `aria-level`, `aria-expanded` and `aria-selected`). |
| C2 | The rows MUST follow the views of the mockup's edit-mode evaluation: one row per view produced from a view node, nested as the views are, its node found through its ordinal (R-EDIT-006.C9). |
| C3 | A row MUST show the element name, then its main label (its first argument when that is a string), then an `#id` chip when the view carries `.id(…)`, and MUST be indented by 14 CSS pixels per level. |
| C4 | A row of a derived view (R-EDIT-004.C5) MUST be drawn in italics with a link icon, and selecting it MUST select the node that produced it. |
| C5 | A row with children MUST expand and collapse by its disclosure triangle and by Right and Left; Up and Down MUST move the selection between visible rows, Home and End to the first and last row, and typed characters MUST select the next row whose name starts with them. |
| C6 | `expandTo(nodeId)` MUST expand the ancestors of the node's row and scroll the row into view, and the outline MUST call it whenever the session's selection changes. |
| C7 | Hovering a row MUST set the session's hovered node, and the row of a node hovered elsewhere MUST be highlighted. |
| C8 | The outline MUST have two tabs, Elements (the tree) and Mockups, the latter listing the document's mockups by name in document order with the active one marked. |
| C9 | `pages/editor.html` MUST also hold a `mockitdown-outline` that shares the editor's session. |
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

A host can replace any panel through its slot, for example to put its own inspector on the right; the
replacement joins the designer's session. Code mode is specified with the code view (R-TOOL-009); undo
and the toolbar's Undo and Redo buttons with the history (R-EDIT-007); the zoom control with the canvas
(R-TOOL-011).

**R-TOOL-003.TC-1 — Open, select, delete, toJSON**

Browser test (`designer.spec.mjs`) on `pages/designer.html`: select the nested button; press Delete;
exactly one `mockitdown-change` arrives, its edits remove the button's lines; the card's next sibling or
the card is selected; `writeDesign(designer.toJSON())` equals the sample's text without those lines,
unknown keys and key order kept. `open` of a document with `version: 2` rejects and keeps the current
document.

**R-TOOL-003.TC-2 — Layout, slots and modes**

Browser test: the panels measure 240 and 260 px; dragging an edge resizes and `layout` reflects it;
a custom element in the `inspector` slot replaces the inspector and receives the session; `mode =
"preview"` hides the panels and renders `mockitdown-mockup` elements whose shadow HTML equals the
mockup element's rendering of the same code; the toolbar shows the active mockup's pack and device;
activating a breadcrumb crumb selects its node; an unknown mode reads as `design`.

**Realizes.** F-19, F-20

| | Statement |
|---|---|
| C1 | The package MUST define the custom element `mockitdown-designer`, which owns a design session (its `session` property) that its components join (R-EDIT-006.C11). |
| C2 | The designer's default layout MUST be a toolbar at the top, a left column of 240 CSS pixels holding the outline above the gallery, the view in the centre, a properties panel of 260 CSS pixels on the right, and a status bar at the bottom. |
| C3 | The side panels MUST be resizable by dragging their inner edges and collapsible, and the designer MUST expose their sizes and collapsed states as its `layout` property, which a host may read and set. |
| C4 | The designer MUST offer the named slots `toolbar`, `outline`, `gallery`, `view`, `inspector` and `status`; an element in a slot MUST replace that panel and join the designer's session. |
| C5 | `designer.open(json)` MUST accept JSON text or an object, read it with `readDesign` (R-EDIT-005.C2), make the mockup named by `view.active` active, else the first mockup, and resolve; it MUST reject with the errors of `readDesign` and keep the current document when they are not empty. |
| C6 | The `document` property MUST return what `toJSON()` returns and, when set, open the document as `open` does. |
| C7 | `designer.toJSON()` MUST return the opened document with every edit applied, such that `writeDesign` of it differs from `writeDesign` of the opened document only in what the edits changed. |
| C8 | The `mode` attribute and property MUST take `design` (the default), `preview` or `code`, an unknown value meaning `design`. |
| C9 | In Preview mode the designer MUST hide the side panels, show each mockup read-only through a `mockitdown-mockup` with the mockup's options, keep the Mockups list reachable, and offer an appearance toggle of light, dark and both. |
| C10 | The toolbar MUST hold the mode switch (Design, Preview, Code) and show the pack and device of the active mockup. |
| C11 | Delete or Backspace with the focus in the outline or the view MUST remove the selected nodes (R-EDIT-002.C6) as one change, then select the next sibling of the last removed node, else its previous sibling, else its parent. |
| C12 | The status bar MUST show the active mockup's diagnostic count and a breadcrumb of the path from the root to the selected node, each crumb selecting its node when activated. |
| C13 | The designer MUST dispatch the events of R-EDIT-006.C7, each exactly once per notification. |
| C14 | The TypeScript project MUST include the test page `pages/designer.html`, which opens a sample design document of at least two mockups — one nesting a `Button` in a `Card` in a `List`, with a comment, a `let` and a `ForEach` — in a `mockitdown-designer`. |
| V1 | On `pages/designer.html`, deleting the selected button fires one `mockitdown-change` with its text edits, and `toJSON()` returns the sample document with only that button's lines removed. |

---

### R-TOOL-004 — The gallery: mockitdown-gallery

**Requires:** R-PACK-016, R-EDIT-006, R-WEB-002

The gallery of SRC-13#p1.c3 and SRC-14: the elements allowed at the selection, drawn as small live
previews in the pack's style — the same samples as the Reference pages and the pack gallery test page
(R-PACK-013), created as they scroll into view as the pack gallery does (R-WEB-004.C10). The "Hidden
here" footer says what the role rules filtered out and why, so the rule is never a mystery.

**R-TOOL-004.TC-1 — Filtered gallery and Add**

Browser test (`gallery-component.spec.mjs`) on `pages/designer.html`: with an `HStack` selected, no card
is `NavigationSplitView` or `TabView`, both appear under Hidden here with their reason, and Add on
`Toggle` appends `Toggle(…)` as the stack's last child, selected, with one `mockitdown-insert` (F-19.AC2).
With nothing selected, root-only frames are offered. Previews exist only for cards near the viewport.

**R-TOOL-004.TC-2 — Data, search and components**

Browser test: the gallery fetches `dist/shared/reference/<pack>.json` and no file under `shared/`;
`filter = "toggle"` leaves the toggle-like cards; a struct declared in the mockup appears in the
Components group; switching the active mockup to another pack lists that pack's own elements first.

**Realizes.** F-19

| | Statement |
|---|---|
| C1 | The package MUST define the custom element `mockitdown-gallery`, which lists the elements of the active mockup's pack — the pack's own elements first, then the inherited core vocabulary — grouped by the category of their role (R-PACK-016.C1). |
| C2 | The gallery MUST read the elements, their roles and samples from the reference data published in the package (R-WEB-001.C17), fetched relative to the base that `loadAssetsFromUrl` uses. |
| C3 | Each element MUST be shown as a card with its name and a live preview, a `mockitdown-mockup` of its sample with `device="fit"` in the mockup's pack, created only when the card comes near the viewport. |
| C4 | A search field, mirrored by the `filter` property, MUST narrow the cards to the elements whose name, role or doc line contains the search text, ignoring case. |
| C5 | A Components group MUST list the structs the active mockup declares or imports. |
| C6 | With no selection the gallery MUST show the elements allowed at the root of a mockup, and with one selected node only those its element may contain (`allowedChildren`, R-PACK-016.C7). |
| C7 | A footer group, Hidden here, MUST give the number of elements the selection filters out and list them under their reasons. |
| C8 | An Add button on each card, a double-click on the card or Enter on the focused card MUST insert the element as the last child of the selected node, else at the end of the mockup's root, select the new node and dispatch `mockitdown-insert` (R-EDIT-006.C5). |
| V1 | With an `HStack` selected, the gallery shows no `NavigationSplitView` and no `TabView`, lists them under Hidden here, and Add on `Toggle` appends a `Toggle(…)` as the stack's last child (F-19.AC2). |

---

### R-TOOL-005 — Drag and drop onto the outline and the view

**Requires:** R-TOOL-004, R-TOOL-001, R-TOOL-002

The second and third ways to insert (SRC-12#s6, SRC-14#p1.c1): drop onto the outline with a before,
after or inside indicator, or onto the view with an insertion bar along the container's axis — vertical
for a `VStack`, horizontal for an `HStack`. Dragging outline rows reorders and re-parents, refusing a drop
into the row's own descendants as the MockItOut outline did (SRC-12#s15).

**R-TOOL-005.TC-1 — Drop into the view**

Browser test on `pages/designer.html`: drag the `Text` card onto the gap between a `VStack`'s first and
second children in the view; the bar is horizontal at that gap; after the drop the code holds the new
`Text(…)` as the stack's second child, selected (F-19.AC1); one undo removes it; Esc during a drag
inserts nothing.

**R-TOOL-005.TC-2 — Outline drops and refusals**

Browser test: dropping a card in the upper, middle and lower third of a row inserts before, inside and
after it; dragging a `NavigationSplitView` card over an `HStack` row shows `not-allowed` and the
reason; dragging a card row onto its own child is refused; dragging a row after its sibling moves it,
its node id kept.

**Realizes.** F-19

| | Statement |
|---|---|
| C1 | A gallery card MUST be draggable onto the outline and onto the editor, and an outline row of a view that is not derived MUST be draggable within the outline. |
| C2 | Over an outline row, the outline MUST show a drop indicator before the row, after it or inside it, chosen by the pointer's position in the upper, lower or middle third of the row. |
| C3 | Over the editor, the editor MUST outline the innermost container under the pointer and show an insertion bar at the gap between its children nearest the pointer, along the container's axis. |
| C4 | A drop position whose parent cannot contain the dragged element (R-PACK-016.C6), or that lies inside a dragged row's own subtree, MUST show the `not-allowed` cursor and the reason next to the pointer, and a drop there MUST do nothing. |
| C5 | Dropping a gallery card MUST insert the element at the indicated position (R-EDIT-002.C4) and select it; dropping outline rows MUST move their nodes there (R-EDIT-002.C8). |
| C6 | Each drop MUST be one change and one undo step, and Esc MUST cancel a drag. |
| V1 | Dragging `Text` from the gallery into a `VStack` in the view inserts `Text(…)` at the position of the insertion bar (F-19.AC1). |

---

### R-TOOL-006 — New elements: sample arguments and first-text editing

**Requires:** R-TOOL-004, R-EDIT-003

Naming a new element takes one keystroke sequence (SRC-12#s6): it arrives with its sample's arguments,
as in the Reference pages, and its first text opens for editing at once.

**R-TOOL-006.TC-1 — Sample arguments and inline edit**

Browser test on `pages/designer.html`: Add on `Button` inserts `Button("Button")` and opens a focused
field with the text selected; typing `Save` and Enter gives `Button("Save")`; undo restores
`Button("Button")` and a second undo removes the button; Add on `List` inserts its sample call without
the sample's rows; Esc keeps the sample text.

**Realizes.** F-19

| | Statement |
|---|---|
| C1 | An element inserted from the gallery MUST be written as the top-level call of its reference sample (R-PACK-013) with that call's arguments and modifiers and without its trailing closures, or as `<Name>()` when the sample is not a call of the element. |
| C2 | After an insertion, when the new call's first positional argument is a string literal, the editor MUST open an inline text field over the rendered element holding that string, focused with its text selected. |
| C3 | Enter or leaving the field MUST commit the text with `setArgument` (R-EDIT-003.C1) as one change and one undo step, separate from the insertion; Esc MUST close the field and keep the sample's text. |
| V1 | Adding a `Button` inserts `Button("Button")`, opens a field holding `Button`, and typing `Save` then Enter gives `Button("Save")`; one undo restores `Button("Button")`. |

---

### R-TOOL-007 — The inspector: mockitdown-inspector

**Requires:** R-PACK-017, R-EDIT-007, R-EDIT-003

The properties panel of SRC-13#p1.c5 (SRC-12#s7). Its controls are generated from the typed parameter
data (R-PACK-017), so a new pack needs no inspector code, and it borrows the field style of the MockItOut
inspector: a small grey label above a full-width input (SRC-12#s15).

Edits apply as the designer types, debounced, and a burst of typing is one undo step. An invalid value is
never written: a value the control rejects, or one whose rendering would add a diagnostic at the node,
stays red with the message until corrected.

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
| 0.10.0 | 2026-11-26 | Page created (ING-1) |
