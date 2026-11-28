---
id: R-TOOL-003
title: The composite designer and its test page
status: active
version: pending
rev: 4
page: WEB.4
slot: reqs
order: 3
hash: 9c8f97c1d774
source: [SRC-12, SRC-13, SRC-16]
realizes: [F-19, F-20]
requires: [R-TOOL-001, R-TOOL-002]
constrained_by: [A-WEB-5]
refs: [R-EDIT-002, R-EDIT-005, R-EDIT-006]
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
