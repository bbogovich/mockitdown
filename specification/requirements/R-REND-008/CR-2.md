---
id: R-REND-008.CR-2
target: R-REND-008
kind: clarification
version: 0.12.10
date: 2026-11-27
issue: 59
summary: test cases backfilled (#59)
from: 903055857cd3
to: 29889d3d3581
---

## Clauses

(none)

## Files

```diff
--- /dev/null
+++ b/TC-1.md
@@ -0,0 +1,11 @@
+---
+id: TC-1
+title: Unknown elements and roles
+verifies: [C1, C2, C3]
+---
+
+Python unit tests `python/tests/test_markup.py` `UnknownElementTests`: `HStack { Text("a"); Foo { Text("b") }; Text("c") }` reports one
+`unknown` error and renders `div.mkd-unknown[data-el=Foo]` with `span.mkd-unknown__name` and `b`, between `a` and `c`
+(C1, V1); a site pack element whose role has no renderer reports "pack 'acme': element 'Gizmo' has unknown role
+'gizmo'" (code `role`) and renders as an unknown view (C2); the base stylesheet gives `.mkd-unknown` a dashed border
+and styles its name (C3).
--- /dev/null
+++ b/TC-2.md
@@ -0,0 +1,9 @@
+---
+id: TC-2
+title: An unknown element in the browser
+verifies: [C3]
+---
+
+Chromium tests `typescript/tests/browser/markup.spec.mjs`: in `base`, Fluent and SwiftUI, an unknown element between
+two texts has a visible dashed border and its name shown, holds its child, and sits between its siblings without
+overlapping them (C3, V1).
```
