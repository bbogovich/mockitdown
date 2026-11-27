---
id: R-WEB-001.CR-7
target: R-WEB-001
kind: revision
version: 0.12.0
date: 2026-11-27
summary: "SRC-19: import map replaces import_paths; library names and qualified references; page library blocks; templates with slots; User guide"
from: 5201d350af86
to: 3a335800a738
---

## Clauses

@ C6 edit
~ `import "path"` of components MUST resolve {+first +}against components registered by `registerComponents(name, [-source)`-]{+source)`,+} [-and,-]{+then as R-IMP-002 says through the import map given by the render option `imports` —+} in the custom elements, [-against-]{+the+} [-URLs-]{+document's import map (R-WEB-002), whose+} relative [-to-]{+targets+} [-an-]{+resolve against the+} import base [-URL, trying the name as written and then with `.mockitdown`.-]{+URL.+}
@ C10 edit
~ When the render options [-name-]{+give+} neither a source path nor {+an +}import [-search paths,-]{+map,+} `import "path"` MUST try the path as written, then with `.mockitdown`.

## Files

```diff
--- /dev/null
+++ b/TC-6.md
@@ -0,0 +1,7 @@
+---
+id: TC-6
+title: Import map in the TypeScript core
+verifies: [C6, C10]
+---
+
+TypeScript unit tests run the cases of R-IMP-002.TC-1 that need no file system with registered components and a stub fetch: a registered `shared/kpi` wins over the map; `imports` with `acme/` → `https://h/acme/` asks for `https://h/acme/cards` then `https://h/acme/cards.mockitdown` (C6); with neither map nor source path, `import "pill"` tries `pill` then `pill.mockitdown` (C10).
--- a/prose.md
+++ b/prose.md
@@ -6,3 +6,3 @@
 
-Options keep the Python field names (`default_pack`, `show_warnings`, `import_paths`, `source_path` …); those that name files on disk (`asset_paths`, `pack_paths`, `embed_assets`, `max_embed_bytes`) have no TypeScript counterpart.
+Options keep the Python field names (`default_pack`, `show_warnings`, `imports`, `source_path` …); those that name files on disk (`asset_paths`, `pack_paths`, `embed_assets`, `max_embed_bytes`) have no TypeScript counterpart.
 
```
