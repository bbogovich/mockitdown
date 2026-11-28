---
id: R-TOOL-003.CR-8
target: R-TOOL-003
kind: correction
version: 0.13.18
date: 2026-11-28
issue: 39
summary: "as built (#39): Code mode's code view is editable, joined to the session by two-way editing (C15); TC-2: code.spec.mjs checks it is editable"
from: 6fdaa4306491
to: f76e71788193
---

## Clauses

@ C15 edit
~ In Code mode the designer MUST show the active mockup's code and its diagnostics in a [-read-only -]code view (R-TOOL-008) in place of the view, keeping the side panels, [-until-]{+the code view joined to the session for+} editing [-that code (R-TOOL-009) takes that place.-]{+(R-TOOL-009).+}

## Files

```diff
--- a/TC-2.md
+++ b/TC-2.md
@@ -19,2 +19,2 @@
 shows the active mockup's code in `mockitdown-code` with the left column visible (and `code.spec.mjs` checks that
-it is read-only and coloured, with a line number per line), and Design brings the view back.
+it is editable and coloured, with a line number per line), and Design brings the view back.
--- a/prose.md
+++ b/prose.md
@@ -31,3 +31,3 @@
 A host can replace any panel through its slot, for example to put its own inspector on the right; the
-replacement joins the designer's session. Code mode shows the active mockup in a read-only `mockitdown-code` (R-TOOL-008), with its diagnostics in the gutter; editing it comes with two-way editing (R-TOOL-009); undo
+replacement joins the designer's session. Code mode shows the active mockup in a `mockitdown-code` (R-TOOL-008), with its diagnostics in the gutter, edited through two-way editing (R-TOOL-009, #39); undo
 and the toolbar's Undo and Redo buttons with the history (R-EDIT-007); the zoom control with the canvas
```
