---
id: R-PACK-008.CR-3
target: R-PACK-008
kind: revision
version: 0.4.0
date: 2026-11-24
summary: Ships the avalonia pack (Avalonia UI 11, Fluent theme)
from: 2ca4ea3f7edb
to: 872c5a0d0c92
---

## Clauses

@ meta.source
- [SRC-2]
+ [SRC-2, SRC-6]
@ C1 edit
~ mockitdown MUST ship these packs: `base` (neutral wireframe, the core vocabulary), `swiftui` (SwiftUI on iOS, iPadOS and macOS), `fluent` (Fluent 2 · WinUI 3), `mui` (Material UI v9, React), `angular-material` (Angular Material), `sapui5` (SAPUI5 with the Fiori Horizon theme), `bootstrap` (Bootstrap 5.3), `shadcn` (shadcn/ui), `antd` (Ant Design 5, React), `tailwind` (Tailwind Catalyst, Tailwind Plus), `carbon` (IBM Carbon 11), `primer` (GitHub Primer), `android` (Jetpack Compose Material 3), `gtk` (GTK 4 with libadwaita), `qt` (Qt 6 Widgets, [-Fusion)-]{+Fusion), `avalonia` (Avalonia UI 11, Fluent theme)+} and `kde-plasma` (KDE Plasma 6, Breeze).

## Files

```diff
--- a/prose.md
+++ b/prose.md
@@ -8,2 +8,2 @@
 
-Release 0.4 adds four web kits from the recommended-next list (Ant Design, Tailwind Catalyst, IBM Carbon, GitHub Primer) and five retro systems (NLS, Windows 1.0, NeXTSTEP, Windows 95, Mac OS X Aqua); the retro pages are ordered by year so the section reads as a history of the GUI.
+Release 0.4 adds four web kits from the recommended-next list (Ant Design, Tailwind Catalyst, IBM Carbon, GitHub Primer), the cross-platform .NET toolkit Avalonia UI and five retro systems (NLS, Windows 1.0, NeXTSTEP, Windows 95, Mac OS X Aqua); the retro pages are ordered by year so the section reads as a history of the GUI.
```
