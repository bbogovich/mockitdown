---
id: R-CLI-002.CR-4
target: R-CLI-002
kind: revision
version: 0.12.8
date: 2026-11-27
issue: 57
summary: "as built: C1 names --menubar [MENU] and --app; TC-2 verifies the rendering flags and source_path (#57)"
from: aa6eb931153c
to: edda6118907c
---

## Clauses

@ C1 edit
~ `render` and `check` MUST accept `--pack`, `--default-pack` (default `base`), `--device`, `--appearance` (one of the four), `--width`, `--height`, `--chrome`, `--title`, `--windowed`, {+`--menubar [MENU]` (the bare flag drawing the bar with no menu open), `--app`, +}`--elements`, `-I/--import` (repeatable), `-A/--asset-path` (repeatable), `-P/--pack-path` (repeatable) and `--no-embed`, with the meaning of the corresponding render option.

## Files

```diff
--- /dev/null
+++ b/TC-2.md
@@ -0,0 +1,14 @@
+---
+id: TC-2
+title: Rendering flags and the source path
+verifies: [C1, C2]
+---
+
+Python unit tests `python/tests/test_cli.py` `RenderingOptionTests`, with `cli.render` wrapped to record
+the options it is given: `render` and `check` with every flag of C1 except `-I` (TC-1) build equal
+options carrying each value; without flags the options are the render defaults (`default_pack` `base`,
+`chrome` `auto`, embedding on); a bare `--menubar` gives `"true"`; an appearance outside the four is a
+usage error; repeated `-A/--asset-path` and `-P/--pack-path` keep their order (C1). A file given through
+a path with `..` sets `source_path` to its resolved path, so `import "kpi"` and `Image("logo.png")` beside
+it resolve with no diagnostic; standard input sets none (C2). R-API-003.TC-1 checks the same flags
+against the render options.
--- a/prose.md
+++ b/prose.md
@@ -4 +4,4 @@
 Checked at 0.10.1 after M-OPT-1.F22 (`edit`): the command line offers no option for it (the model prose says so), so the list of C1 stands.
+
+As built (#57): `--menubar` and `--app` (M-OPT-1.F27, F28; R-DEV-009) were added to the command line with the
+macOS menu bar and are now in C1; TC-2 checks every flag of C1 except the import map's (TC-1).
```
