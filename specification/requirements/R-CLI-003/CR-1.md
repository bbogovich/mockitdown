---
id: R-CLI-003.CR-1
target: R-CLI-003
kind: clarification
version: 0.12.8
date: 2026-11-27
issue: 57
summary: "test cases backfilled: every C clause verified by a TC naming its tests (#57)"
from: 84a4fcbe17fc
to: 22a1629b46b8
---

## Clauses

(none)

## Files

```diff
--- /dev/null
+++ b/TC-1.md
@@ -0,0 +1,14 @@
+---
+id: TC-1
+title: render to a fragment or a standalone page
+verifies: [C1, C2, C3]
+---
+
+Python unit tests `python/tests/test_cli.py` `RenderCommandTests`: a file with an unknown icon writes
+the fragment (`div.mkd-figure`, no `<html>`) to standard output, or to `-o` with nothing on standard
+output, and its `warning [icon]` line to standard error only (C1). `--standalone -o a.html` for a Fluent
+source writes a page starting `<!doctype html>` with the UTF-8 charset, the responsive viewport, the title
+`a` (from the file name; `--title` escaped when given; `mockitdown` for standard input), the neutral
+background with its `prefers-color-scheme: dark` variant, the Fluent and base rules inlined, no other
+pack and no `<link>` (C2, V1); a syntax error, which uses no pack, inlines `base` (C2). A file with an
+error writes its output, error box included, and exits 1 (C3).
```
