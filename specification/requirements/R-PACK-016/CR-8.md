---
id: R-PACK-016.CR-8
target: R-PACK-016
kind: revision
version: 0.13.9
date: 2026-11-28
issue: 30
summary: "as built (#30): holdsChildren(pack, name), the editor's container test (C16)"
from: 79fa5d7a289c
to: f7db65a4b17f
---

## Clauses

@ C16 insert after C15
+ The TypeScript core MUST export `holdsChildren(pack, name)`, true when the element's role, or its pack's narrowing (C5), accepts some role, and for an element the pack does not define.

## Files

```diff
--- a/TC-2.md
+++ b/TC-2.md
@@ -3,3 +3,3 @@
 title: canContain and allowedChildren
-verifies: [C5, C6, C7, C8, C10, C12, C13, C14, C15]
+verifies: [C5, C6, C7, C8, C10, C12, C13, C14, C15, C16]
 ---
@@ -17 +17,4 @@
 of both variants).
+
+As built (#30): "TC-2: holdsChildren …" in the same file: `VStack`, `HStack` and `List` hold children, `Text` and
+`Divider` do not, a name `base` does not define does, and the narrowed sapui5 `ObjectPageLayout` still does (C16).
```
