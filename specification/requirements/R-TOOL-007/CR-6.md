---
id: R-TOOL-007.CR-6
target: R-TOOL-007
kind: revision
version: 0.13.18
date: 2026-11-28
issue: 39
summary: "as built (#39): Edit in code for an if, a ForEach, a struct's call or a code-only value, part edit-in-code, dispatching mockitdown-edit-in-code on which the designer switches to Code mode and reveals the span; the model's editInCode (C11); TC-3 names its tests (IT-67)"
from: 2a615300c41b
to: ac1075a221f0
---

## Clauses

@ C11 edit
~ When the selected node is derived {+(an `if`, a `ForEach` or a call of a struct of the mockup) +}or has a [-construct-]{+value+} [-the-]{+only+} [-controls-]{+a+} [-cannot-]{+code+} [-express,-]{+field shows (C13),+} the inspector MUST offer Edit in [-code,-]{+code (part `edit-in-code`),+} which [-switches-]{+dispatches a bubbling, composed `mockitdown-edit-in-code` event with the mockup, the node and its span, on which+} the designer{+ switches+} to Code mode and reveals the [-node's -]span [-(R-TOOL-008.C1).-]{+(R-TOOL-008.C1); the model's `editInCode` MUST give that span, else null.+}

## Files

```diff
--- a/TC-3.md
+++ b/TC-3.md
@@ -9,4 +9,6 @@
 values; changing the device changes the mockup's `options.device` as one `options` change, a height of 0
-or an unknown device is refused, and each option edit is undone on its own. Edit in code (C11) on a
-derived row, switching to Code mode with the node's span selected, is tested with the code view
-(R-TOOL-008).
+or an unknown device is refused, and each option edit is undone on its own. Edit in code (C11): `code-sync.test.ts`
+(IT-67) finds `editInCode` the span of a `ForEach` (27-64) and of `Text(n)` (a code-only value, 53-60) and
+null for `Text("Welcome back")`; `sync.spec.mjs` (IT-67) clicks a derived `ForEach` row, then Edit in
+code, and finds the designer in Code mode with the ForEach's span (220-269) selected, and no Edit in code
+for `Text("Inbox")`.
--- a/prose.md
+++ b/prose.md
@@ -29 +29,5 @@
 (R-TOOL-008).
+
+**As built (#39).** Edit in code is a button under the header that tells the host what to show: the
+inspector dispatches `mockitdown-edit-in-code` and the designer, which owns the modes, switches to Code
+mode and reveals the span. A host composing its own tools can handle the same event.
```
