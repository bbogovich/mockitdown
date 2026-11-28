---
id: R-PACK-002.CR-2
target: R-PACK-002
kind: correction
version: 0.12.10
date: 2026-11-27
issue: 59
summary: "as built: C1 reads hidden (R-PACK-010) and attrs (R-PACK-011); TC-1 verifies C1-C10 (#59)"
from: 0778cd19aea1
to: 8117cb137724
---

## Clauses

@ C1 edit
~ The pack registry MUST read these `pack.json` keys, all optional except as stated: `id` (default: the directory name), `name` (default: the id), `framework`, `version`, `extends`, `modules`, `device`, `chrome`, `tokens`, `elements`, `modifiers`, `fonts`, `sizes`, [-`icons`;-]{+`icons`, `hidden` (R-PACK-010), `attrs` (R-PACK-011);+} other keys MUST be ignored.

## Files

```diff
--- /dev/null
+++ b/TC-1.md
@@ -0,0 +1,13 @@
+---
+id: TC-1
+title: pack.json keys
+verifies: [C1, C2, C3, C4, C5, C6, C7, C8, C9, C10]
+---
+
+Python unit tests `python/tests/test_pack_registry.py` `PackJsonKeyTests`: a `pack.json` with every key of C1 and two unknown ones loads each key
+into the pack and ignores the others; without keys the id and name are the directory name (C1); `modules` select the
+pack through `import` (C2); `device` defaults to the parent's, `desktop` for `base` (C3); an unlisted device form has
+chrome `none` (C4); light and dark tokens (C5); an element definition's role, params, defaults, variants and doc (C6);
+a modifier with and without a fixed value sets its attribute (C7); a font alias (C8), a size (C9) and an icon (C10)
+map as given; `{"id": "acme", "extends": "mui"}` has the Material UI pack's elements, tokens, modifiers, chrome and
+sizes (V1).
```
