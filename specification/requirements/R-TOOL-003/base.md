---
id: R-TOOL-003
title: The composite designer and its test page
status: active
version: 0.10.0
rev: 0
page: WEB.4
slot: reqs
order: 3
hash: fc8eb791300e
source: [SRC-12, SRC-13, SRC-16]
realizes: [F-19, F-20]
requires: [R-TOOL-001, R-TOOL-002]
constrained_by: [A-WEB-5]
---

C1: The package MUST define the custom element `mockitdown-designer`, which owns a design session (its `session` property) that its components join (R-EDIT-006.C11).
C2: The designer's default layout MUST be a toolbar at the top, a left column of 240 CSS pixels holding the outline above the gallery, the view in the centre, a properties panel of 260 CSS pixels on the right, and a status bar at the bottom.
C3: The side panels MUST be resizable by dragging their inner edges and collapsible, and the designer MUST expose their sizes and collapsed states as its `layout` property, which a host may read and set.
C4: The designer MUST offer the named slots `toolbar`, `outline`, `gallery`, `view`, `inspector` and `status`; an element in a slot MUST replace that panel and join the designer's session.
C5: `designer.open(json)` MUST accept JSON text or an object, read it with `readDesign` (R-EDIT-005.C2), make the mockup named by `view.active` active, else the first mockup, and resolve; it MUST reject with the errors of `readDesign` and keep the current document when they are not empty.
C6: The `document` property MUST return what `toJSON()` returns and, when set, open the document as `open` does.
C7: `designer.toJSON()` MUST return the opened document with every edit applied, such that `writeDesign` of it differs from `writeDesign` of the opened document only in what the edits changed.
C8: The `mode` attribute and property MUST take `design` (the default), `preview` or `code`, an unknown value meaning `design`.
C9: In Preview mode the designer MUST hide the side panels, show each mockup read-only through a `mockitdown-mockup` with the mockup's options, keep the Mockups list reachable, and offer an appearance toggle of light, dark and both.
C10: The toolbar MUST hold the mode switch (Design, Preview, Code) and show the pack and device of the active mockup.
C11: Delete or Backspace with the focus in the outline or the view MUST remove the selected nodes (R-EDIT-002.C6) as one change, then select the next sibling of the last removed node, else its previous sibling, else its parent.
C12: The status bar MUST show the active mockup's diagnostic count and a breadcrumb of the path from the root to the selected node, each crumb selecting its node when activated.
C13: The designer MUST dispatch the events of R-EDIT-006.C7, each exactly once per notification.
C14: The TypeScript project MUST include the test page `pages/designer.html`, which opens a sample design document of at least two mockups — one nesting a `Button` in a `Card` in a `List`, with a comment, a `let` and a `ForEach` — in a `mockitdown-designer`.
V1: On `pages/designer.html`, deleting the selected button fires one `mockitdown-change` with its text edits, and `toJSON()` returns the sample document with only that button's lines removed.
<!-- file: TC-1.md -->
---
id: TC-1
title: Open, select, delete, toJSON
verifies: [C1, C5, C6, C7, C11, C13, C14]
---

Browser test (`designer.spec.mjs`) on `pages/designer.html`: select the nested button; press Delete;
exactly one `mockitdown-change` arrives, its edits remove the button's lines; the card's next sibling or
the card is selected; `writeDesign(designer.toJSON())` equals the sample's text without those lines,
unknown keys and key order kept. `open` of a document with `version: 2` rejects and keeps the current
document.
<!-- file: TC-2.md -->
---
id: TC-2
title: Layout, slots and modes
verifies: [C2, C3, C4, C8, C9, C10, C12]
---

Browser test: the panels measure 240 and 260 px; dragging an edge resizes and `layout` reflects it;
a custom element in the `inspector` slot replaces the inspector and receives the session; `mode =
"preview"` hides the panels and renders `mockitdown-mockup` elements whose shadow HTML equals the
mockup element's rendering of the same code; the toolbar shows the active mockup's pack and device;
activating a breadcrumb crumb selects its node; an unknown mode reads as `design`.
<!-- file: prose.md -->
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
