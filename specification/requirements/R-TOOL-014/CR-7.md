---
id: R-TOOL-014.CR-7
target: R-TOOL-014
kind: revision
version: 0.14.5
date: 2026-11-28
issue: 90
summary: "as built (#90): the current section through session.currentSection and setCurrentSection (C16, notifying section), following its section and cleared by an undo removing it (C17); designer.run and canvas.editSectionName for New Section without a name (C14); deleting the last section of a document opened without sections removes the key (C15); TC-3 verifies C11-C17"
from: 241bddea2687
to: 8b8307dea232
---

## Clauses

@ C14 edit
~ When the composite designer runs New Section without a [-name,-]{+name (`designer.run("newSection")`, which runs every other command as `session.run` does),+} it MUST{+ add the section named `Section <n>` (`newSectionName` of `mockitdown/design`), `<n>` being one more than the number of sections before it, and+} open the canvas's inline field over [-the new section's-]{+its+} label{+ (`canvas.editSectionName(index)`)+} to name it, an empty or cancelled name keeping the name `Section [-<n>`, `<n>` being one more than the number of sections before it.-]{+<n>`.+}
@ C15 insert after C14
+ Deleting the last section of a document opened without `sections` MUST remove the key, so that a section added and then deleted leaves the document as it was (F-20.AC8).
@ C16 insert after C15
+ The session MUST offer the current section of C11 as `session.currentSection`, its index or null, and `session.setCurrentSection(index)`, null for none, which MUST refuse an index no section has, MUST notify `section` with the detail `{section}` when the current section changes, and MUST be no step of the history.
@ C17 insert after C16
+ An undo or redo that removes the current section MUST leave no section current, and the current section MUST follow its section when another section's removal or return changes its index.

## Files

```diff
--- a/TC-3.md
+++ b/TC-3.md
@@ -3,3 +3,3 @@
 title: New Section and Delete Section
-verifies: [C11, C12, C13, C14]
+verifies: [C11, C12, C13, C14, C15, C16, C17]
 ---
@@ -7,3 +7,4 @@
 Unit part (`sections.test.ts`, `node:test`), every expected value written by hand before the code
-runs: `newSection("Flow")` makes its section current; `deleteSection()` removes the current section,
+runs: `setCurrentSection(0)` notifies `section` once and refuses an index no section has, and is no step;
+`newSection("Flow")` makes its section current, notifying one `change` only, and undoing it leaves no section current; `deleteSection()` removes the current section,
 leaves every frame's position as it was, notifies one `change` of kind `sections` and leaves no section
@@ -13,6 +14,7 @@
 shortcut, Delete Section disabled until a section is current; `session.run("newSection", {name})` and
-`session.run("deleteSection", {section: 0})` run them.
+`session.run("deleteSection", {section: 0})` run them; `newSectionName` gives `Section 1` and `Section 3`;
+a document without `sections` with a section added and deleted writes the text it was read from (C15).
 
 Browser part (`sections.spec.mjs`) on `pages/designer.html`: a click on a section's label marks it
-`data-current`, which Preview hides; running New Section with no name opens the inline field over the
+`data-current`, which Preview hides; `designer.run("newSection")` with no name opens the inline field over the
 new section's label, Enter with `Checkout` names it, Esc on a second one keeps `Section 2`; Delete
--- a/prose.md
+++ b/prose.md
@@ -23 +23,11 @@
 where they are, so a section added and deleted again leaves the document unchanged.
+
+**As built (#90).** The current section is held by the session (`currentSection`,
+`setCurrentSection`), as the active mockup is, so that `deleteSection` and the commands' enabled state
+need no canvas; it is kept as the section object, so it follows its section when an undo or another
+deletion shifts the indices. A click on a label that does not become a drag makes the section current;
+New Section and Delete Section change it with their one `change` of kind `sections`, which the canvas
+redraws from, so only `setCurrentSection` notifies `section`. A host's menu runs the commands through
+`designer.run`, which differs from `session.run` only for New Section without a name. An empty list of
+sections is written as none when the document had none, which is what makes an added and deleted
+section leave the document byte-identical.
```
