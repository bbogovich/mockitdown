---
id: R-CLI-002.CR-3
target: R-CLI-002
kind: revision
version: 0.12.0
date: 2026-11-27
summary: "SRC-19: import map replaces import_paths; library names and qualified references; page library blocks; templates with slots; User guide"
from: fbb34dd2287b
to: aa6eb931153c
---

## Clauses

@ C1 edit
~ `render` and `check` MUST accept `--pack`, `--default-pack` (default `base`), `--device`, `--appearance` (one of the four), `--width`, `--height`, `--chrome`, `--title`, `--windowed`, `--elements`, [-`-I/--import-path`-]{+`-I/--import`+} (repeatable), `-A/--asset-path` (repeatable), `-P/--pack-path` (repeatable) and `--no-embed`, with the meaning of the corresponding render option.
@ C3 insert after C2
+ Each `-I/--import` value MUST be `KEY=TARGET`, adding the import-map entry `KEY` → `TARGET` (R-IMP-002.C7), or a bare `TARGET`, adding `TARGET` to the targets of the empty key; repeated values for one key MUST form its target list in order.
@ V2 insert after V1
+ `mockitdown render a.mockitdown -I acme/=vendor/acme/ -I lib` resolves `import "acme/cards"` from `vendor/acme/` and `import "kpi"` from the file's directory, then `lib/`.

## Files

```diff
--- /dev/null
+++ b/TC-1.md
@@ -0,0 +1,7 @@
+---
+id: TC-1
+title: Import map flags
+verifies: [C1, C2, C3]
+---
+
+`mockitdown render screens/a.mockitdown -I acme/=vendor/acme/ -I lib` in a temporary tree resolves `import "acme/cards"` from `vendor/acme/` and `import "kpi"` from `screens/` then `lib/` (C1, C2, C3); `-I acme/=x -I acme/=y` tries `x` then `y`; the old long option `--import-path` is rejected by argparse. Automated in `python/tests/test_cli.py`.
```
