---
id: R-REPO-004.CR-1
target: R-REPO-004
kind: revision
version: 0.6.2
date: 2026-11-25
issue: 2
summary: "as built: options JSON shape, .diag.json result, harness without machine paths, index.json, case comments and --check strictness (#2)"
from: 04f1b27a8cc0
to: 592cab1e5347
---

## Clauses

@ C6 insert after C5
+ Each `<name>.json` MUST be a JSON object holding only render options — `pack`, `default_pack`, `device`, `default_device`, `appearance`, `default_appearance`, `chrome`, `title`, `id`, `window`, `url` (strings), `width`, `height` (integers), `caption`, `elements`, `source`, `show_warnings` (booleans) — with every absent key taking its default.
@ C7 insert after C6
+ Each case MUST have `<name>.diag.json`, an object `{"packs": [id, …], "diagnostics": [{"severity", "code", "message", "line", "col", "source"}, …]}` holding the render's pack lineage and its diagnostics in order, and each variant's test suite MUST fail when its result differs from it.
@ C8 insert after C7
+ `<name>.html` MUST be the rendered HTML followed by one line feed.
@ C9 insert after C8
+ A case MUST be rendered with no source path, no asset or pack search paths and the single import search path `.` resolved against `shared/conformance/`; component files the cases import MUST lie under `shared/conformance/components/`.
@ C10 insert after C9
+ An expected file MUST NOT contain a path of the machine that generated it; `gen_conformance.py` MUST refuse a case whose output does.
@ C11 insert after C10
+ `shared/conformance/index.json` MUST list every case in generation order as `{"cases": [{"name", "area"}, …]}`, the area being the case name up to its first hyphen.
@ C12 insert after C11
+ Each case source MUST begin with a `//` comment line saying what the case exercises.
@ C13 insert after C12
+ Every case outside the `diag` area MUST render without a diagnostic, and every `diag` case MUST report at least one; `gen_conformance.py` MUST refuse a case that breaks this.
@ C14 insert after C13
+ `gen_conformance.py --check` MUST also fail when a corpus file is missing or a file in `shared/conformance/` belongs to no case.

## Files

```diff
--- a/TC-1.md
+++ b/TC-1.md
@@ -3,3 +3,3 @@
 title: Python matches the corpus
-verifies: [C5]
+verifies: [C5, C7]
 ---
--- a/TC-2.md
+++ b/TC-2.md
@@ -3,3 +3,3 @@
 title: Corpus is current
-verifies: [C4]
+verifies: [C4, C14]
 ---
--- /dev/null
+++ b/TC-3.md
@@ -0,0 +1,7 @@
+---
+id: TC-3
+title: Corpus covers the required areas
+verifies: [C2, C6, C11]
+---
+
+Automated by `test_coverage`, `test_layout` and `test_options_are_known` in `python/tests/test_conformance.py`.
--- a/prose.md
+++ b/prose.md
@@ -1 +1,22 @@
 The corpus is the definition of "the same rendering" (ADR-18). It is regenerated deliberately, never to make a failing TypeScript test pass.
+
+The cases are many and small, so a port can make them pass one area at a time. Areas, by name prefix:
+`role-<role>-<element>` (every base element, from its Reference sample), `pack-<id>` (every shipped pack,
+hidden ones included) and `pack-<id>-own-<n>` (each listed pack's own elements, twelve per case),
+`appearance-`, `device-`, `chrome-`, `option-`, `import-`, `annotate-`, `overlay-`, `chart-`, `image-`,
+`lang-` and `diag-`.
+
+A case, for example `annotate-callout-label`:
+
+```text
+annotate-callout-label.mockitdown   // a callout with a label …
+annotate-callout-label.json         {"device": "fit"}
+annotate-callout-label.html         <div class="mkd-figure …">…</div>⏎
+annotate-callout-label.diag.json    {"packs": ["base"], "diagnostics": []}
+```
+
+The harness is fixed so that nothing in the output depends on the machine: there is no source path
+(diagnostics in the block read `line L:C`), images come from `data:` or remote URLs, and imports are
+found through the one search path `.` — the corpus directory — so a missing import reports
+`(searched .)`. A diagnostic inside an imported file would carry that file's resolved path, so the
+corpus has none. Regenerate with `cd python && ../.venv/bin/python tools/gen_conformance.py`.
```
