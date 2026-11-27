---
id: R-MDX-003.CR-1
target: R-MDX-003
kind: revision
version: 0.12.0
date: 2026-11-27
summary: "SRC-19: import map replaces import_paths; library names and qualified references; page library blocks; templates with slots; User guide"
from: 23df020b9b54
to: ec9f0fd6c76d
---

## Clauses

@ C1 edit
~ The fence MUST accept these attributes, with these types: `pack`, `device`, `appearance`, `chrome`, `title`, `id`, [-`url`-]{+`url`, `library`+} (text); `width`, `height` (integer); `caption`, `elements`, `source` (boolean).
@ C6 insert after C5
+ If `library` is not an identifier (a letter or `_`, then letters, digits or `_`), then the fence MUST report a fence error naming it and render the block as a mockup (R-IMP-008).

## Files

```diff
--- /dev/null
+++ b/TC-1.md
@@ -0,0 +1,7 @@
+---
+id: TC-1
+title: The library attribute
+verifies: [C1, C6]
+---
+
+A fence with `library="cards"` is accepted by the validator with no fence error (C1); `library="my-cards"` produces the fence error naming `library` and the block renders as a mockup (C6). Automated in `python/tests/`.
```
