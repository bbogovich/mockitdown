---
id: A-REND-1.CR-1
target: A-REND-1
kind: revision
version: 0.10.4
date: 2026-11-27
issue: 48
summary: "as built: the r_<role> methods live in role-family mixins under mockitdown.render.roles and the shared helpers in mockitdown.render._util; Renderer in mockitdown.render.html inherits them (#48)"
from: 5fbaf27af68b
to: d138d7bbcb88
---

## Clauses

@ P1 edit
~ provides: `Renderer`{+ (`mockitdown.render.html`)+} with one `r_<role>` method per render role,{+ inherited from one mixin per role family in `mockitdown.render.roles` (layout, content, controls, navigation, containers, components, annotations),+} presentation layers, and the escaping and inline-Markdown helpers [-(`mockitdown.render.html`)-]{+(`mockitdown.render._util`, re-exported by `mockitdown.render.html`)+}

## Files

```diff
--- a/prose.md
+++ b/prose.md
@@ -1 +1 @@
-The markup contract in code. Realizes R-REND-002 to R-REND-009 and R-ASSET-004.
+The markup contract in code. Realizes R-REND-002 to R-REND-009 and R-ASSET-004. `render/html.py` holds the dispatch and the infrastructure every family shares (the element root, slots, icons, decorations, overlays, presentations); each family's roles and the helpers only it uses sit in `render/roles/<family>.py`, so a change to one family's markup stays in one file.
```
