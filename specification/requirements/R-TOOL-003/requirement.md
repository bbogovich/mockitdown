---
id: R-TOOL-003
title: The composite designer and its test page
status: active
version: 0.13.19
rev: 9
page: WEB.4
slot: reqs
order: 3
hash: a03c73e77c8c
source: [SRC-12, SRC-13, SRC-16]
realizes: [F-19, F-20]
requires: [R-TOOL-001, R-TOOL-002]
constrained_by: [A-WEB-5]
refs: [R-EDIT-005, R-EDIT-006, R-TOOL-004, R-TOOL-008, R-TOOL-009, R-TOOL-010]
---

C1: The package MUST define the custom element `mockitdown-designer`, which owns a design session (its `session` property) that its components join (R-EDIT-006.C11).
C2: The designer's default layout MUST be a toolbar at the top, a left column of 240 CSS pixels holding the outline above the gallery, the view in the centre, a properties panel of 260 CSS pixels on the right, and a status bar at the bottom.
C3: The side panels MUST be resizable between 120 and 640 CSS pixels by dragging their inner edges and by Left and Right on them, and collapsible by a toggle each in the toolbar, and the designer MUST expose their sizes and collapsed states as its `layout` property `{left: {size, collapsed}, right: {size, collapsed}}`, which a host may read and set in part.
C4: The designer MUST offer the named slots `toolbar`, `outline`, `gallery`, `view`, `inspector` and `status`; an element in a slot MUST replace that panel and join the designer's session, the designer setting its `session` property once its custom element is defined.
C5: `designer.open(json)` MUST accept JSON text or an object (written as JSON text first), read it with `readDesign` (R-EDIT-005.C2), start a new session over it whose active mockup is the one `view.active` names, else the first mockup, and resolve; it MUST reject with a `DesignOpenError` whose `errors` are those of `readDesign`, and keep the current document, when they are not empty.
C6: The `document` property MUST return what `toJSON()` returns and, when set, open the document as `open` does, throwing the `DesignOpenError` where `open` rejects.
C7: `designer.toJSON()` MUST return the session's live document, the opened document with every edit applied, such that `writeDesign` of it differs from `writeDesign` of the opened document only in what the edits changed.
C8: The `mode` attribute and property MUST take `design` (the default), `preview` or `code`, an unknown value meaning `design`.
C9: In Preview mode the designer MUST hide the side panels and the view, show each mockup in document order read-only through a `mockitdown-mockup` whose attributes are the fence options among the mockup's options (R-EDIT-005.C9), list the mockups by name beside the previews, each scrolling to its preview when activated, and offer an appearance toggle of light, dark and both that sets every preview's `appearance` while one is pressed.
C10: The toolbar MUST hold the mode switch (Design, Preview, Code) as a radio group and show the name, the pack and the device of the active mockup, the device being its `device` option, else the pack's default device.
C11: Delete or Backspace with the focus in the outline or the view, outside Preview mode and outside a text field, MUST delete the selected nodes through `session.delete()` (R-EDIT-006.C19): one change, then the next sibling of the last removed node, else its previous sibling, else its parent selected.
C12: The status bar MUST show the active mockup's diagnostic count (`0 diagnostics`, `1 diagnostic`), as a button opening the diagnostics list (R-TOOL-010.C4), and a breadcrumb of the element names on the path from the top-level view node to the first selected node, each crumb a button selecting its node when activated.
C13: The designer MUST dispatch the events of R-EDIT-006.C7, each exactly once per notification.
C14: The TypeScript project MUST include the test page `pages/designer.html`, which opens the sample design document `pages/designer-sample.mkdesign` of at least two mockups — one nesting a `Button` in a `Card` in a `List`, with a comment, a `let` and a `ForEach` — in a `mockitdown-designer`.
C15: In Code mode the designer MUST show the active mockup's code and its diagnostics in a code view (R-TOOL-008) in place of the view, keeping the side panels, the code view joined to the session for editing (R-TOOL-009).
C16: The gallery panel MUST hold a `mockitdown-gallery` (R-TOOL-004) that joins the designer's session and takes its `import-base`, and until the inspector exists the properties panel MUST hold a placeholder naming the first selected element.
C17: The designer MUST expose the property `rendered`, a promise that resolves once its outline, its view and, in Preview mode, its previews are rendered, and MUST pass its `import-base` and `asset-base` attributes on to its view, outline and previews.
V1: On `pages/designer.html`, deleting the selected button fires one `mockitdown-change` with its text edits, and `toJSON()` returns the sample document with only that button's lines removed.
