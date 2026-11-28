---
id: R-REND-011.CR-1
target: R-REND-011
kind: correction
version: 0.12.10
date: 2026-11-27
issue: 59
summary: "as built: C6 fixed colours where the real thing keeps its colour, radii fixed in base; TC-1 verifies C1-C6 (#59)"
from: 5f3cd88c2198
to: df1ad91fc3d1
---

## Clauses

@ C6 replace
- Component roles MUST take their colours, radii and type from pack tokens so that every pack restyles them without new markup.
+ Component roles MUST take their colours and type from pack tokens so that every pack restyles them without new markup; a fixed colour is allowed only where the real thing does not follow the theme (the terminal and video surfaces, the sticky note's ink, avatar hues, white marks on a coloured ground, shadows), and radii are fixed in the base stylesheet, which a pack overrides.

## Files

```diff
--- /dev/null
+++ b/TC-1.md
@@ -0,0 +1,17 @@
+---
+id: TC-1
+title: The component roles
+verifies: [C1, C2, C3, C4, C5, C6]
+---
+
+Python unit tests `python/tests/test_component_roles.py` `ComponentRoleTests`: each role of C1 exists, `base` defines
+its elements on it and every pack inherits them (C1); a spreadsheet draws column letters and row numbers, its values
+with numbers marked for right alignment, the `A1:B1` selection with its border and its headers marked, the active cell,
+the formula bar, a fill and sheet tabs, and no formula bar without `formula:` (C2, V1); a code block numbers its lines,
+marks a highlighted line, and draws keyword, string, number, comment, function and type spans for swift, js, ts,
+python, go, rust, json, sql, shell and html, and a terminal draws a window with prompts and commands apart from output
+(C3); a gantt chart places bars on its scale, a zero-length task as a milestone, progress and today, and a schedule
+places events in their day columns between its hours and draws now (C4, V2); a canvas places positioned children
+absolutely (C5); the components' markup is the same in base, Fluent, Material UI, Carbon and Windows 95, and the base
+stylesheet gives them colours only through tokens except the fixed colours C6 allows, and type only through tokens
+except the formula bar's fx glyph (C6).
--- a/prose.md
+++ b/prose.md
@@ -1 +1,3 @@
 Real applications are full of components no UI kit ships — spreadsheets, boards, editors, chat threads, schedules. They are part of the core vocabulary so a mockup of any app can show them, styled by whichever pack is in use. The example site's *Beyond the framework kits* page exercises every one.
+
+Some things keep their own colour whatever the theme — a terminal is dark, a video frame black, a sticky note's ink near-black on its paper — so those few declarations are fixed; everything else follows the pack's tokens. Corner radii are written once in the base stylesheet, and a pack that rounds differently overrides the rule.
```
