---
id: R-REPO-003.CR-1
target: R-REPO-003
kind: revision
version: 0.6.1
date: 2026-11-25
issue: 1
summary: "as built: shape of shared/reference/<pack>.json and index.json, --check covers them, LICENSE in wheel and sdist (#1)"
from: 68fe4c4452f2
to: bb8e7e8a7dd8
---

## Clauses

@ C6 insert after C5
+ Each `shared/reference/<pack>.json` MUST be an object with `id`, `name`, `framework`, `version`, `modules`, `device`, `chrome`, `group` (its Reference menu group) and `elements`, the elements in Reference page order (own elements, then inherited core elements, each by name).
@ C7 insert after C6
+ Each element entry in `shared/reference/<pack>.json` MUST be an object with `name`, `role`, `params`, `defaults` (attribute → value), `variants`, `doc`, `own`, `sample` (a source that renders without a diagnostic) and `variants_sample` (a source showing each variant, or null).
@ C8 insert after C7
+ `tools/gen_reference.py` MUST write `shared/reference/index.json` as `{"groups": [{"title", "packs": [id, …]}, …]}`, in the order of the Reference menu.
@ C9 insert after C8
+ `tools/gen_reference.py --check` MUST fail when a Reference page or a `shared/reference/` file is missing or out of date.
@ C10 insert after C9
+ The Python wheel and sdist MUST contain the repository's `LICENSE`.

## Files

```diff
--- a/prose.md
+++ b/prose.md
@@ -1 +1,3 @@
-The Python variant behaves exactly as before; only paths change.
+The Python variant behaves exactly as before; only paths change. A wheel built after the move holds the same files as the 0.3.0 wheel, plus `icons.json` and `vocabulary.json`, which `icons.py` and `vocabulary.py` now load.
+
+The reference JSON carries the same data as the Reference page of a pack, so the TypeScript pack gallery (R-WEB-004) and the example site show the same samples. `index.json` gives the gallery its side-panel groups (Core, Wireframe, Desktop, Web, Mobile, Retro). The repository's `LICENSE` stays at the root (R-REPO-001.C4) and is copied beside `pyproject.toml` at build time.
```
