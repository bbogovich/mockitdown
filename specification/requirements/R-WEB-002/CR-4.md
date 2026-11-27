---
id: R-WEB-002.CR-4
target: R-WEB-002
kind: revision
version: 0.10.0
date: 2026-11-26
summary: "boolean attribute edit for edit-mode rendering: C13, TC-4 (ING-1)"
from: 99d8bdc542fb
to: 063171fe3d72
---

## Clauses

@ meta.source
- [SRC-8]
+ [SRC-8, SRC-12]
@ C13 insert after V1
+ The mockup element MUST accept the boolean attribute `edit`, which renders with the `edit` option (R-EDIT-004.C1); like `import-base` and `asset-base`, it is not a fence attribute.

## Files

```diff
--- /dev/null
+++ b/TC-4.md
@@ -0,0 +1,9 @@
+---
+id: TC-4
+title: Edit attribute
+verifies: [C13]
+---
+
+Browser test (`mockup.spec.mjs`): a mockup element with `edit` holds, in its shadow root, the HTML that
+`render` returns with `edit: true` for the same code; removing the attribute re-renders without any
+`data-mkd-node`.
--- a/prose.md
+++ b/prose.md
@@ -35 +35,4 @@
 whole pack is done.
+
+`<mockitdown-mockup edit>` renders the mockup for editing (R-EDIT-004): every element produced from a
+call carries `data-mkd-node`. The design tools use it; a page showing a mockup to readers does not.
```
