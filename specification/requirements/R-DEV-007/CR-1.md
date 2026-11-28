---
id: R-DEV-007.CR-1
target: R-DEV-007
kind: correction
version: 0.12.9
date: 2026-11-27
issue: 58
summary: C1 names the chrome kinds of R-DEV-005, not R-DEV-004 (length rewriting); TC-1 verifies C1-C2 (#58)
from: 49cbc12bd4f9
to: dbbec168a42b
---

## Clauses

@ C1 edit
~ The chrome kinds MUST include, besides those of [-R-DEV-004,-]{+R-DEV-005,+} `gnome` (no title bar: a GNOME app draws its own header bar), `kde` (Breeze title bar), `win31` (Windows 3.1 caption with control-menu box and arrow buttons) and `window`.

## Files

```diff
--- /dev/null
+++ b/TC-1.md
@@ -0,0 +1,12 @@
+---
+id: TC-1
+title: Additional chrome kinds and the generic window
+verifies: [C1, C2]
+---
+
+Python unit tests `python/tests/test_devices.py` `AdditionalChromeTests`: `gnome`, `kde`, `win31` and
+`window` are chrome kinds; `gnome` draws no chrome, `kde` a title bar with the title, `win31` the
+control-menu box, the title and minimise and maximise; the `gtk` pack maps to `gnome` and `win31` to
+`win31` (C1). The `aqua` pack's desktop renders `.mkd-chrome--window` with the title, the leading
+close and menu buttons, the trailing help, minimise, maximise, zoom, collapse and close buttons and the
+grow box in a bottom strip, and the base stylesheet hides the buttons and the strip (C2, V1).
```
