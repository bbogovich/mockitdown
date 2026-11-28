---
id: R-TOOL-003.CR-7
target: R-TOOL-003
kind: revision
version: 0.13.17
date: 2026-11-28
issue: 38
summary: "as built (#38): Code mode shows the active mockup's code and diagnostics in a read-only mockitdown-code (R-TOOL-008) until R-TOOL-009 (C15)"
from: 261e8a549d46
to: 6fdaa4306491
---

## Clauses

@ C15 edit
~ In Code mode the designer MUST show the active mockup's code {+and its diagnostics in a +}read-only{+ code view (R-TOOL-008)+} in place of the view, keeping the side panels, until [-the-]{+editing that+} code[- view-] (R-TOOL-009) takes that place.

## Files

```diff
--- a/TC-2.md
+++ b/TC-2.md
@@ -18,2 +18,3 @@
 with the same attributes and code; the Dark toggle sets `appearance="dark"` on every preview; Code mode
-shows the active mockup's code with the left column visible, and Design brings the view back.
+shows the active mockup's code in `mockitdown-code` with the left column visible (and `code.spec.mjs` checks that
+it is read-only and coloured, with a line number per line), and Design brings the view back.
--- a/prose.md
+++ b/prose.md
@@ -31,3 +31,3 @@
 A host can replace any panel through its slot, for example to put its own inspector on the right; the
-replacement joins the designer's session. Code mode is specified with the code view (R-TOOL-009); undo
+replacement joins the designer's session. Code mode shows the active mockup in a read-only `mockitdown-code` (R-TOOL-008), with its diagnostics in the gutter; editing it comes with two-way editing (R-TOOL-009); undo
 and the toolbar's Undo and Redo buttons with the history (R-EDIT-007); the zoom control with the canvas
```
