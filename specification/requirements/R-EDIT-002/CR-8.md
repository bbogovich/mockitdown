---
id: R-EDIT-002.CR-8
target: R-EDIT-002
kind: revision
version: 0.13.9
date: 2026-11-28
issue: 30
summary: "as built (#30): move with a null parent moves to the top level (C32, corpus case move-top-level)"
from: 9810e9de26bb
to: 4ad87a35e662
---

## Clauses

@ C32 insert after C31
+ A `move` with a null parent MUST move the nodes to the top level, before its view statement at the index (counted before the move), writing them as an `insert` at the top level writes code (C31).

## Files

```diff
--- a/TC-1.md
+++ b/TC-1.md
@@ -3,3 +3,3 @@
 title: The edit corpus
-verifies: [C1, C2, C4, C5, C6, C7, C8, C10, C11, C12, C13, C15, C16, C17, C18, C19, C20, C21, C22, C23, C24, C25, C26, C27, C28, C29, C30, C31]
+verifies: [C1, C2, C4, C5, C6, C7, C8, C10, C11, C12, C13, C15, C16, C17, C18, C19, C20, C21, C22, C23, C24, C25, C26, C27, C28, C29, C30, C31, C32]
 ---
@@ -18 +18,4 @@
 a `refuse:` tag and only a refused case does. It also fails on a file in `edit/` that belongs to no case.
+
+As built (#30): `move-top-level` (hand-written, tag `move:top-level`) moves a button out of its `VStack`
+to the top level before the view after the stack (C32).
```
