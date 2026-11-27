---
id: F-19.CR-2
target: F-19
kind: additive
version: 0.9.0
date: 2026-11-26
summary: "structural commands with undo restoring the selection: C19-C22, AC9, AC10 (ING-1)"
from: 487b9df2f6b2
to: bd50bf7ae25d
---

## Clauses

@ C19 insert after AC8
+ The design tools offer these commands on the selection: delete, duplicate, cut, copy and paste with the clipboard holding mockitdown text, move up and down among siblings, wrap in a container, unwrap a container, convert to another element of the same role, and extract a component.
@ C20 insert after C19
+ Every command is one undo step, and undo and redo restore the selection as it was before and after the command.
@ C21 insert after C20
+ One burst of typing in a field forms one undo step.
@ C22 insert after C21
+ The commands are offered to the host too, so that it can show them in its own menus.
@ AC9 insert after C22
+ Each command of C19 can be undone and redone, and after undo the selection is the one before the command.
@ AC10 insert after AC9
+ Elements copied from the design tools paste into a Markdown fence as mockitdown code that renders them.

## Files

```diff
--- a/prose.md
+++ b/prose.md
@@ -12 +12,6 @@
 windows stay with the host.
+
+**Structural commands (SRC-12#s8).** Rearranging the hierarchy is the main editing activity, so the
+selection has the commands of a structured editor: delete, duplicate, the clipboard as mockitdown text
+(which also pastes into a Markdown fence), move, wrap, unwrap, convert and extract component. Each is
+one undo step that restores the selection, and a host can put the same commands in its menus.
```
