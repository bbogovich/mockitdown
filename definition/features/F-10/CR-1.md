---
id: F-10.CR-1
target: F-10
kind: additive
version: 0.6.0
date: 2026-11-25
summary: "SRC-9: SwiftUI gallery defects, multi-platform chrome, macOS menu bar, meaningful samples"
from: 6783e9e14853
to: dc570284548a
---

## Clauses

@ meta.source
- [SRC-2, SRC-3]
+ [SRC-2, SRC-3, SRC-9]
@ C5 insert after N1
+ A desktop mockup in a pack whose platform has a global menu bar (SwiftUI on macOS) can show that menu bar above the window, with the application's menus and the system's status items, and with any one menu drawn open as its dropdown.
@ C6 insert after C5
+ Packs for frameworks that span phone, tablet and desktop (SwiftUI) draw each form in its platform's chrome: iOS status bar and home indicator on a phone, the iPadOS status bar (and, for a windowed app, the window controls) on a tablet, and a macOS window with its toolbar on a desktop.
@ AC3 insert after C6
+ A SwiftUI mockup at `device="desktop"` with the menu bar turned on shows the Apple menu, the application name in bold, the application's menus and the clock; a menu marked open shows its items with keyboard shortcuts, separators, submenu arrows and disabled items.
@ AC4 insert after AC3
+ The same SwiftUI source renders at `phone`, `tablet` and `desktop` in iOS, iPadOS and macOS chrome respectively.

## Files

```diff
--- a/prose.md
+++ b/prose.md
@@ -5 +5,5 @@
 drawn from the pack's platform, or forced per block.
+
+**Desktop and tablet (SRC-9).** SwiftUI targets iPhone, iPad and Mac. On the Mac the global menu
+bar is part of the application's interface — its menu titles and commands are designed text — so a
+desktop mockup can show it, with one menu dropped down.
--- /dev/null
+++ b/usecases/UC-2.md
@@ -0,0 +1,13 @@
+---
+id: UC-2
+title: Show a Mac app with its menu bar and an open menu
+---
+
+**Actor:** specification author.
+
+1. The author writes a SwiftUI mockup of a Mac app, sets `device="desktop"` and turns the menu bar on.
+2. The author declares the app's menus (File, Edit, View, a custom menu) and marks the File menu open.
+
+**Outcome:** the screen shows the macOS menu bar across the top — Apple menu, the app's name in
+bold, its menus, the status items and clock — with the File menu dropped down over the window,
+showing its commands, shortcuts and separators; below it, the app's window with traffic lights and toolbar.
```
