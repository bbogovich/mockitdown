---
id: R-EDIT-004.CR-7
target: R-EDIT-004
kind: revision
version: 0.13.2
date: 2026-11-28
issue: 23
summary: "as built (#23): imported component views carry data-mkd-derived without data-mkd-node (C11, C12); content passed to a component is derived where it is written (C13); a declarations-only preview is not derived (C14); TC-1 and TC-2 name their tests"
from: 993a3dc21008
to: 96239ee4e4f8
---

## Clauses

@ C11 insert after C10
+ When `edit` is true, a view produced from a view node of another source (the body of a struct imported from a component file) MUST carry no `data-mkd-node`.
@ C12 insert after C11
+ When `edit` is true and a view of C11 was produced inside the body of a struct instantiated by a call, the renderer MUST give its root element `data-mkd-derived` set to the ordinal of the innermost `ForEach` call, `if` statement or struct call of the rendered source.
@ C13 insert after C12
+ A view written in a closure passed to a struct call (its trailing closure or a view-typed property) MUST be derived as the place where the closure is written, not from that struct call.
@ C14 insert after C13
+ In the preview of a block that holds only declarations, the views of the struct it renders MUST carry no `data-mkd-derived` from that implicit call.

## Files

```diff
--- a/TC-1.md
+++ b/TC-1.md
@@ -3,3 +3,3 @@
 title: Edit-mode conformance cases
-verifies: [C3, C4, C5, C6, C7, C8, C9]
+verifies: [C3, C4, C5, C6, C7, C8, C9, C11, C12, C13, C14]
 ---
@@ -11 +11,10 @@
 and tables carry neither.
+
+As built (#23): the cases are `edit-nested-stacks`, `edit-list-cards`, `edit-modifier-chain`,
+`edit-slots`, `edit-presentation`, `edit-foreach`, `edit-if-else`, `edit-struct` (C13: the content a call
+passes is not derived), `edit-literal`, `edit-import` (C11, C12) and `edit-marks` (C8, with the Elements
+table and the source). `python/tests/test_edit_mode.py` holds, for each, every `data-el` element in
+document order with its two attributes, written by hand from the source before the renderer produced
+them; it also checks the Python numbering (`mockitdown.syntax.nodes.view_nodes`) on a crafted source
+and the preview of a declarations-only block (C14). `typescript/tests/unit/edit-mode.test.ts` checks
+that the evaluator's ordinals equal `parseTree`'s for every corpus case, and a crafted render.
--- a/TC-2.md
+++ b/TC-2.md
@@ -9 +9,5 @@
 attribute as an unknown fence option (R-MDX-003.C4), and the CLI has no such option.
+
+As built (#23): `python/tests/test_edit_mode.py` (`EditOff`) and `typescript/tests/unit/conformance.test.ts`
+("… renders unchanged with edit: false"); for an edit-mode case, `edit: false` is compared with the same
+options without `edit`. `typescript/tests/unit/edit-mode.test.ts` checks the default and the fence.
--- a/prose.md
+++ b/prose.md
@@ -11,2 +11,9 @@
 ```
+
+Derivation follows where code is written. A view in a closure passed to a component (`Card { Text("x") }`)
+is written at the call, so it names its own node and is not derived from the component; the component's
+body is. A component imported from another file has no ordinals in this source: its views carry only
+`data-mkd-derived`, naming the call, which is what the editor can select. Each variant computes the
+ordinals with its own parser (Python: `mockitdown.syntax.nodes.view_nodes`), and both number every
+source of the corpus alike.
 
```
