---
id: TC-3
title: New Section and Delete Section
verifies: [C11, C12, C13, C14]
---

Unit part (`sections.test.ts`, `node:test`), every expected value written by hand before the code
runs: `newSection("Flow")` makes its section current; `deleteSection()` removes the current section,
leaves every frame's position as it was, notifies one `change` of kind `sections` and leaves no section
current; undo restores the section and redo removes it again; `deleteSection(5)` on a document of one
section and `deleteSection()` with no current section are refused with no step and no notification;
`session.commands` lists New Section and Delete Section after Delete Mockup and before Undo with no
shortcut, Delete Section disabled until a section is current; `session.run("newSection", {name})` and
`session.run("deleteSection", {section: 0})` run them.

Browser part (`sections.spec.mjs`) on `pages/designer.html`: a click on a section's label marks it
`data-current`, which Preview hides; running New Section with no name opens the inline field over the
new section's label, Enter with `Checkout` names it, Esc on a second one keeps `Section 2`; Delete
Section removes the current section and its layer while the frames stay at their positions; a
document whose only section was added and deleted writes back as it was opened (F-20.AC8).
