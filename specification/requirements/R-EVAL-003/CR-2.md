---
id: R-EVAL-003.CR-2
target: R-EVAL-003
kind: revision
version: 0.12.0
date: 2026-11-27
summary: "SRC-19: import map replaces import_paths; library names and qualified references; page library blocks; templates with slots; User guide"
from: 74ae63fcae83
to: 7931eba27b14
---

## Clauses

@ C1 edit
~ When a call `Name(…)` appears where views are expected, the evaluator MUST resolve `Name` in this order: `ForEach`; a {+qualified component `L.Name` when `L` names a loaded library (R-IMP-007.C4); a +}struct declared in the block or [-imported;-]{+imported (R-IMP-007.C5);+} a variable in scope (calling a view-valued property such as `content()`); an element of the selected pack.

## Files

```diff
--- /dev/null
+++ b/TC-3.md
@@ -0,0 +1,7 @@
+---
+id: TC-3
+title: Qualified components in resolution order
+verifies: [C1]
+---
+
+With library `acme` declaring `Card` and the pack also having a `Card` element, `acme.Card()` instantiates the struct, `Card()` instantiates the struct (unique), and a block-local `Card` wins over both for `Card()` but not for `acme.Card()`. Automated in `python/tests/` and the TypeScript unit tests.
```
