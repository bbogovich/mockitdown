---
id: R-CLI-006.CR-1
target: R-CLI-006
kind: revision
version: 0.12.8
date: 2026-11-27
issue: 57
summary: "as built: packs leaves hidden packs out (R-PACK-010.C1), C5 elements --own; TC-1 verifies C1-C5 (#57)"
from: 9ca49fb02f6d
to: f6558c270429
---

## Clauses

@ C1 edit
~ `mockitdown packs` MUST list every known [-pack,-]{+pack except the hidden ones (R-PACK-010.C1),+} one line each with its id, name, element count and import modules; with `--json`, an array of objects with `id`, `name`, `framework`, `version`, `modules`, `device`, `elements` (count) and `own_elements` (names).
@ C5 insert after C4
+ With `--own`, `elements` MUST list only the pack's own elements, leaving out those it inherits.

## Files

```diff
--- /dev/null
+++ b/TC-1.md
@@ -0,0 +1,14 @@
+---
+id: TC-1
+title: packs and elements
+verifies: [C1, C2, C3, C4, C5]
+---
+
+Python unit tests `python/tests/test_cli.py` `PacksAndElementsTests`: `packs` prints one line per pack
+that is not hidden, in registry order, the Fluent line holding its name, element count and
+`import <modules>`; `--json` has the same packs with exactly the eight keys of C1 and Fluent's counts,
+modules and own elements; the hidden packs appear only with `--all` (C1). `elements fluent` lists every
+element sorted by name with its role and parameters, and `--own` only the pack's own (C2, C5).
+`--markdown` prints the five-column header, `InfoBar` with role `alert` and `VStack` marked `*(core)*`;
+`base` marks nothing core (C3, V1). A site pack from `-P` is listed by `packs --json` and by `elements`,
+its notes' `|` printed as `/` (C3, C4).
--- a/prose.md
+++ b/prose.md
@@ -2 +2,4 @@
 [Pack catalogue](../packs/catalogue.md), so the documentation cannot drift from the pack data.
+
+As built (#57): `packs` leaves the hidden packs out unless given the undocumented `--all` (R-PACK-010.C1),
+and `elements --own` lists a pack's own elements only (C5).
```
