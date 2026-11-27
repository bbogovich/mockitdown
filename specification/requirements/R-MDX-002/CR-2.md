---
id: R-MDX-002.CR-2
target: R-MDX-002
kind: revision
version: 0.12.0
date: 2026-11-27
summary: "SRC-19: import map replaces import_paths; library names and qualified references; page library blocks; templates with slots; User guide"
from: 03a42ed5ea02
to: 2654ec2ed518
---

## Clauses

@ C1 edit
~ The Markdown extension MUST accept these options with these defaults: `default_pack` (`base`), `default_appearance` (`light`), `default_device` (empty: none), [-`import_paths`-]{+`imports`+} [-(`[docs]`),-]{+(`{"": "docs"}`),+} `asset_paths` (`[docs]`), `pack_paths` (`[]`), `embed_assets` (`true`), `max_embed_bytes` (`2000000`), `css` (`inline`), `strict` (`false`), `caption` (`true`), `elements` (`false`), `show_warnings` (`false`).
@ C2 edit
~ The path options{+ `asset_paths` and `pack_paths`+} MUST accept one string or a list of [-strings.-]{+strings; `imports` is an import map (R-IMP-002.C7, C8).+}
@ C6 insert after C5
+ If the option `import_paths` is given, then the Markdown extension MUST fail configuration with "mockitdown: import_paths was replaced by imports; write imports: {\"\": [<the given directories>]}", the given directories filled in.
@ C7 insert after C6
+ If `imports` is not a mapping whose keys are strings and whose values are a string or a list of strings, then the Markdown extension MUST fail configuration with "mockitdown: imports must map each namespace to a path, a URL or a list of them".
@ V2 insert after V1
+ `import_paths: [docs/mockups]` fails the build at startup with the message of C6 naming `docs/mockups`; `imports: {"shared/": docs/mockups/shared/}` is accepted.

## Files

```diff
--- /dev/null
+++ b/TC-1.md
@@ -0,0 +1,7 @@
+---
+id: TC-1
+title: The import map option replaces import_paths
+verifies: [C1, C6, C7]
+---
+
+Python unit tests on the extension's configuration: with no options the effective import map is `{"": "docs"}` and `import "shared/kpi"` is looked up as `docs/shared/kpi` (C1); `import_paths: [docs/mockups]` raises at `markdown.Markdown(...)` with the exact message of C6 naming `docs/mockups`; `imports: {"a/": 3}` and `imports: [docs]` raise with the message of C7; `imports: {"shared/": "docs/mockups/shared/", "": ["docs", "lib"]}` is accepted. Automated in `python/tests/` by the issue that implements it.
```
