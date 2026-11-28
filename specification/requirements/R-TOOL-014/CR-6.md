---
id: R-TOOL-014.CR-6
target: R-TOOL-014
kind: revision
version: 0.14.0
date: 2026-11-28
issue: "#85"
summary: "SRC-21 answers (#85, #88, #90): the sapui5 ObjectPageLayout holds its header and AnchorBar; copies named <name>-copy; New Section and Delete Section"
from: c9b873ef1373
to: 241bddea2687
---

## Clauses

@ meta.source
- [SRC-12, SRC-15]
+ [SRC-21, SRC-12, SRC-15]
@ C11 insert after C10
+ A click on a section's label MUST make that section the current section (attribute `data-current` on its `section` part), `newSection` MUST make the section it adds current, and Preview mode MUST show no current section.
@ C12 insert after C11
+ The session MUST offer the command `deleteSection(index)`, the current section by default, which removes the section from the document's `sections`, leaves every frame where it is, as one undo step notifying `change` of kind `sections`, and leaves no section current; it MUST refuse an index no section has, and a call without an index when no section is current, changing and notifying nothing.
@ C13 insert after C12
+ `session.commands` MUST list `newSection` and `deleteSection` after the mockup commands and before `undo`, labelled "New Section" and "Delete Section" with no shortcut, `newSection` enabled whenever there is an active mockup and `deleteSection` whenever a section is current, and `session.run` MUST run them with `{name}` for `newSection` and `{section}` for `deleteSection`.
@ C14 insert after C13
+ When the composite designer runs New Section without a name, it MUST open the canvas's inline field over the new section's label to name it, an empty or cancelled name keeping the name `Section <n>`, `<n>` being one more than the number of sections before it.
@ V1 edit
~ Saving and reloading a canvas of three mockups and a section restores every mockup's name, position, options and code, the section and the view (F-20.AC3, [-F-20.AC7).-]{+F-20.AC7), and a section added and then deleted leaves the document as it was (F-20.AC8).+}

## Files

```diff
--- /dev/null
+++ b/TC-3.md
@@ -0,0 +1,20 @@
+---
+id: TC-3
+title: New Section and Delete Section
+verifies: [C11, C12, C13, C14]
+---
+
+Unit part (`sections.test.ts`, `node:test`), every expected value written by hand before the code
+runs: `newSection("Flow")` makes its section current; `deleteSection()` removes the current section,
+leaves every frame's position as it was, notifies one `change` of kind `sections` and leaves no section
+current; undo restores the section and redo removes it again; `deleteSection(5)` on a document of one
+section and `deleteSection()` with no current section are refused with no step and no notification;
+`session.commands` lists New Section and Delete Section after Delete Mockup and before Undo with no
+shortcut, Delete Section disabled until a section is current; `session.run("newSection", {name})` and
+`session.run("deleteSection", {section: 0})` run them.
+
+Browser part (`sections.spec.mjs`) on `pages/designer.html`: a click on a section's label marks it
+`data-current`, which Preview hides; running New Section with no name opens the inline field over the
+new section's label, Enter with `Checkout` names it, Esc on a second one keeps `Section 2`; Delete
+Section removes the current section and its layer while the frames stay at their positions; a
+document whose only section was added and deleted writes back as it was opened (F-20.AC8).
--- a/prose.md
+++ b/prose.md
@@ -18 +18,6 @@
 document byte-identical when written back.
+
+**Adding and deleting sections (SRC-21#answers).** A section is chosen by clicking its label, and the
+designer's menus offer New Section (around the active mockup, named in the inline field) and Delete
+Section (the current one). Deleting a section removes only the rectangle: the mockups it enclosed stay
+where they are, so a section added and deleted again leaves the document unchanged.
```
