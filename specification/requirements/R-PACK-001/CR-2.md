---
id: R-PACK-001.CR-2
target: R-PACK-001
kind: clarification
version: 0.12.10
date: 2026-11-27
issue: 59
summary: test cases backfilled (#59)
from: 97a7862fb5f3
to: ce520762daa0
---

## Clauses

(none)

## Files

```diff
--- /dev/null
+++ b/TC-1.md
@@ -0,0 +1,13 @@
+---
+id: TC-1
+title: Pack directories, lookup order, listing and loading once
+verifies: [C1, C2, C3, C4, C5]
+---
+
+Python unit tests `python/tests/test_pack_registry.py` `LayoutAndLookupTests`: a directory with `pack.json` is a pack whether or not it has
+`pack.css`, a directory without `pack.json` is none, and every built-in pack's id is its directory name (C1); with two
+pack directories the first holding `<id>/pack.json` wins, the built-in directory comes last, and a block with
+`pack_paths` and `pack="fluent"` uses the site's pack (C2, V1); `ids()` lists the configured directories' packs first,
+sorted within each directory, then the built-in ones, without duplicates or pack-less directories (C3); `pack="nope"`
+raises "unknown pack 'nope'; known packs: …" listing `ids()`, and a block reports it (C4, V1); `get()` returns the same
+object every time and does not read a changed `pack.json` again (C5).
```
