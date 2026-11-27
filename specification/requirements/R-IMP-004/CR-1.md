---
id: R-IMP-004.CR-1
target: R-IMP-004
kind: revision
version: 0.12.0
date: 2026-11-27
summary: "SRC-19: import map replaces import_paths; library names and qualified references; page library blocks; templates with slots; User guide"
from: 1d3b6334955c
to: a9708a1c5f9a
---

## Clauses

@ C1 edit
~ When several loaded files{+ of the same library (R-IMP-007.C1)+} declare a struct of the same name, the later declaration in load order MUST replace the earlier one, and the evaluator MUST warn "struct S from <file> replaces an earlier definition" with code `import`.
@ C4 insert after C3
+ Structs of the same name in different libraries MUST NOT replace one another, and loading them MUST NOT produce a diagnostic; each stays reachable by its qualified name (R-IMP-007.C4).
@ V2 insert after V1
+ Importing `acme/cards` and `contoso/cards`, both declaring `Card`, loads both silently; two files imported `as UI` that both declare `Card` warn once, and the later one is `UI.Card`.

## Files

```diff
--- /dev/null
+++ b/TC-1.md
@@ -0,0 +1,7 @@
+---
+id: TC-1
+title: Precedence within and across libraries
+verifies: [C1, C2, C3, C4]
+---
+
+Two files imported `as UI` both declaring `Card`: one warning of C1, the later `Card` is used; `acme/cards` and `contoso/cards` both declaring `Card` load with no diagnostic (C4); a block-local `Card` replaces the imported ones silently (C2); a struct `Text` replaces the pack's `Text` (C3). Automated in `python/tests/test_imports.py` and mirrored in the TypeScript unit tests.
```
