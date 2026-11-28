---
id: M-OPT-1.CR-3
target: M-OPT-1
kind: correction
version: 0.12.7
date: 2026-11-27
issue: 56
summary: "as built: F24-F28 default_device, window, windowed, menubar and app, render options the library already had (#56)"
from: 34498b699462
to: 658416cf9bf6
---

## Clauses

@ F24 insert after F23
+ default_device: str · optional — device form when neither the options nor `@Screen(device:)` name one (R-DEV-002.C1)
@ F25 insert after F24
+ window: str · optional — window kind of packs that draw window frames, emitted as `data-window` (fence `window`)
@ F26 insert after F25
+ windowed: bool · optional — the app drawn as an iPadOS window over a wallpaper (fence `windowed`; R-DEV-010.C4)
@ F27 insert after F26
+ menubar: bool or str · optional — the macOS menu bar, or the title of the menu drawn open (fence `menubar`; R-DEV-009.C1)
@ F28 insert after F27
+ app: str · optional — the application name in the macOS menu bar (fence `app`; R-DEV-009.C4)

## Files

```diff
--- a/prose.md
+++ b/prose.md
@@ -3 +3,5 @@
 `edit` is a library option (R-EDIT-004.C10); the fence and the command line do not offer it.
+
+`default_device`, `window`, `windowed`, `menubar` and `app` were options of the library before this
+list named them; they were added as built (#56). `None` for `windowed`, `menubar` and `app` means the
+value comes from `@Screen` or the default.
```
