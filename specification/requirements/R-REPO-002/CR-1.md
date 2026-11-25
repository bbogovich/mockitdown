---
id: R-REPO-002.CR-1
target: R-REPO-002
kind: revision
version: 0.6.1
date: 2026-11-25
issue: 1
summary: "as built: vocabulary.json also carries neutral_modules (#1)"
from: a769efe08283
to: e4fe28e55a3e
---

## Clauses

@ C4 edit
~ The modifier vocabulary (rendered and ignored modifiers) MUST exist only as `shared/language/vocabulary.json`, with [-`rendered`-]{+`rendered`, `ignored`+} and [-`ignored`-]{+`neutral_modules`+} name [-lists.-]{+lists, `neutral_modules` being the import names that select no pack.+}

## Files

```diff
--- a/prose.md
+++ b/prose.md
@@ -1 +1,3 @@
-What moves to `shared/`: the 38 packs, `page.css`, the icon table now written in `icons.py`, and the modifier lists now written in `vocabulary.py`. Their content does not change.
+What moved to `shared/`: the 38 packs, `page.css`, the icon table formerly written in `icons.py`, and the modifier lists and neutral import names formerly written in `vocabulary.py`. Their content did not change; the Python modules now load the JSON copies packaged beside them.
+
+The Python build copies the files with `python/tools/sync_shared.py`, run by `python/setup.py` at every build from a checkout; the copies are ignored by git and travel in the sdist.
```
