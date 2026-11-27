---
id: R-IMP-002.CR-1
target: R-IMP-002
kind: revision
version: 0.12.0
date: 2026-11-27
summary: "SRC-19: import map replaces import_paths; library names and qualified references; page library blocks; templates with slots; User guide"
from: 5f36b20ab9bc
to: 5f9a4b7053a1
---

## Clauses

@ C2 edit
~ The evaluator MUST resolve [-a relative-]{+an+} import path{+ beginning with `./` or `../`+} against the directory of the importing file{+ only+} — the component file for nested imports, the block's source file when {+known; without a +}known [-—-]{+importing+} [-and-]{+file+} [-then-]{+it+} [-against-]{+MUST+} [-each-]{+report+} [-configured-]{+the+} [-import-]{+error+} [-directory-]{+of+} [-(`import_paths`) in order.-]{+C4.+}
@ C4 edit
~ If no candidate exists, then the evaluator MUST report the error "cannot find import 'x' [-(searched-]{+(tried+} …)" listing [-the-]{+every+} [-import-]{+candidate+} [-directories,-]{+tried, in order,+} with code `import`.
@ C5 edit
~ Relative{+ paths in an+} import [-directories-]{+map+} MUST be resolved against the process's working directory — for a site build, the directory the build is run [-from.-]{+from; in the web components, against the import base URL (R-WEB-002.C3).+}
@ C6 insert after C5
+ The evaluator MUST resolve any other relative path (a bare specifier such as `shared/kpi`) first against the directory of the importing file, when that file is known, and then through the import map.
@ C7 insert after C6
+ An import map MUST be a mapping from keys to targets: a key ending in `/` matches every path that starts with it, the remainder of the path being joined to the target; any other non-empty key matches only the identical path, its target naming the file; the empty key `""` matches every path, the whole path being the remainder; when several keys match, the evaluator MUST use the longest.
@ C8 insert after C7
+ A target MUST be a directory or file path, an `http:`, `https:` or `file:` URL, or a list of these; the evaluator MUST try the candidates of each list entry (C3) in list order, and MUST NOT fall back to a shorter key when the longest matching key yields no file.
@ C9 insert after C8
+ The Python evaluator MUST read an `http:` or `https:` candidate with a GET request and a 10-second timeout, treating status 404 as a missing candidate and any other failure as an unreadable file (R-IMP-005.C1).
@ C10 insert after C9
+ The render API and the command line MUST default to an empty import map; the Markdown extension's default is R-MDX-002.C1's.
@ V1 replace
- With `import_paths: [docs/mockups]`, `import "shared/kpi"` loads `docs/mockups/shared/kpi.mockitdown`; inside it, `import "rows"` loads `docs/mockups/shared/rows.mockitdown`.
+ With `imports: {"shared/": docs/mockups/shared/, "acme/": [vendor/acme/, "https://example.com/acme/"]}`, `import "shared/kpi"` loads `docs/mockups/shared/kpi.mockitdown`; inside it, `import "rows"` and `import "./rows"` load `docs/mockups/shared/rows.mockitdown`; `import "acme/cards"` loads `vendor/acme/cards.mockitdown` when it exists and otherwise `https://example.com/acme/cards.mockitdown`; `import "other/x"` reports C4 listing the candidates it tried.

## Files

```diff
--- /dev/null
+++ b/TC-1.md
@@ -0,0 +1,15 @@
+---
+id: TC-1
+title: Resolution through the import map
+verifies: [C1, C2, C3, C4, C5, C6, C7, C8, C9, C10]
+---
+
+In a temporary directory used as the working directory, with files `docs/mockups/shared/kpi.mockitdown` (importing `rows` and `./rows`), `docs/mockups/shared/rows.mockitdown`, `vendor/acme/cards.mockitdown`, `alt/one.mockitdown` and a local `http.server` on 127.0.0.1 serving `remote/acme/extra.mockitdown`, render through the API with `imports` = `{"shared/": "docs/mockups/shared/", "acme/": ["vendor/acme/", "http://127.0.0.1:<port>/remote/acme/"], "one": "alt/one.mockitdown", "": "docs"}` and check:
+
+1. An absolute path loads as written (C1); `import "./x"` in a block with no source path reports C4, and with `source_path` set resolves beside it (C2).
+2. `import "shared/kpi"` loads the library and its two nested imports, with `.mockitdown` appended (C3, C5, C6); `shared/` wins over `""` for that path (C7).
+3. `import "acme/cards"` loads the vendor file; `import "acme/extra"` falls through to the HTTP candidate (C8, C9); a 404 for `acme/none` reports C4 listing the four candidates in order, and does not try `docs/acme/none` (C8); a server that is stopped produces `cannot read import` (C9).
+4. `import "one"` loads `alt/one.mockitdown`; `import "one/x"` does not match the exact key (C7).
+5. Without `imports`, the API and the CLI resolve `import "kpi"` only beside the source file (C10).
+
+Automated in `python/tests/test_imports.py`; the TypeScript variant runs the same cases through R-WEB-001.TC-6.
--- a/prose.md
+++ b/prose.md
@@ -1,5 +1,17 @@
 Resolution against the importing file first lets libraries import their neighbours with short
-relative paths; the site's import directories make libraries available to every page.
+relative paths; the import map makes libraries available to every page under a namespace, the way
+TypeScript's `paths` or a browser import map does:
+
+```yaml
+imports:
+  "": docs/mockups                 # import "kpi"         → docs/mockups/kpi.mockitdown
+  shared/: docs/mockups/shared/      # import "shared/kpi"  → docs/mockups/shared/kpi.mockitdown
+  acme/: [vendor/acme/, "https://example.com/acme/"]   # local copy first, then the vendor's URL
+```
+
+The longest matching key wins and never falls back to a shorter one, so a namespace cannot be
+shadowed by a file of the same name under the root.
 
 **Known gap.** As for assets (R-ASSET-002), a fenced block in a Markdown page has no known file in
-a site build, so a block's own relative imports are resolved through `import_paths` only.
+a site build, so a block's own bare imports are resolved through the import map only, and `./` imports report
+that no importing file is known.
```
