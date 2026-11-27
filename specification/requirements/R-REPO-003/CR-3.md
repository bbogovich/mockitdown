---
id: R-REPO-003.CR-3
target: R-REPO-003
kind: clarification
version: 0.10.2
date: 2026-11-26
issue: 51
summary: "checked against the changed item it cites; no obligation changes (audit #51)"
from: d4779af7e224
to: 36b8b995f2eb
---

## Clauses

(none)

## Files

```diff
--- a/prose.md
+++ b/prose.md
@@ -3 +3,3 @@
 The reference JSON carries the same data as the Reference page of a pack, so the TypeScript pack gallery (R-WEB-004) and the example site show the same samples. `index.json` gives the gallery its side-panel groups (Core, Wireframe, Desktop, Web, Mobile, Retro). The repository's `LICENSE` stays at the root (R-REPO-001.C4) and is copied beside `pyproject.toml` at build time.
+
+Checked at 0.10.1 after R-REPO-002.C8 (`shared/language/roles.json`): the file is a shared asset the wheel and sdist carry through C2, copied by the same build step as `vocabulary.json`; the other clauses are unaffected.
```
