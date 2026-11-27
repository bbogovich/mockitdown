---
id: A-REND-1.CR-2
target: A-REND-1
kind: revision
version: 0.10.5
date: 2026-11-27
issue: 49
summary: "as built: the TypeScript renderer mirrors the role-family split with the same module names (#49)"
from: d138d7bbcb88
to: f7f71e0dbddf
---

## Clauses

(none)

## Files

```diff
--- a/prose.md
+++ b/prose.md
@@ -1 +1 @@
-The markup contract in code. Realizes R-REND-002 to R-REND-009 and R-ASSET-004. `render/html.py` holds the dispatch and the infrastructure every family shares (the element root, slots, icons, decorations, overlays, presentations); each family's roles and the helpers only it uses sit in `render/roles/<family>.py`, so a change to one family's markup stays in one file.
+The markup contract in code. Realizes R-REND-002 to R-REND-009 and R-ASSET-004. `render/html.py` holds the dispatch and the infrastructure every family shares (the element root, slots, icons, decorations, overlays, presentations); each family's roles and the helpers only it uses sit in `render/roles/<family>.py`, so a change to one family's markup stays in one file. The TypeScript renderer (A-WEB-1) mirrors the split with the same family names, `typescript/src/core/render/roles/<family>.ts`, so the two renderers' diffs read side by side.
```
