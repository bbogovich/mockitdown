---
id: R-PACK-008.CR-1
target: R-PACK-008
kind: revision
version: 0.3.0
date: 2026-11-24
summary: Ships the Android, GTK, Qt and KDE Plasma packs, ten retro packs and three hidden easter-egg packs
from: e96d800ee8f1
to: 7c53507ae5c2
---

## Clauses

@ C1 edit
~ mockitdown MUST ship these packs: `base` (neutral wireframe, the core vocabulary), `swiftui` (SwiftUI on iOS, iPadOS and macOS), `fluent` (Fluent 2 · WinUI 3), `mui` (Material UI v9, React), `angular-material` (Angular Material), `sapui5` (SAPUI5 with the Fiori Horizon theme), `bootstrap` (Bootstrap [-5.3)-]{+5.3), `shadcn` (shadcn/ui), `android` (Jetpack Compose Material 3), `gtk` (GTK 4 with libadwaita), `qt` (Qt 6 Widgets, Fusion)+} and [-`shadcn`-]{+`kde-plasma`+} [-(shadcn/ui).-]{+(KDE Plasma 6, Breeze).+}
@ C7 insert after C1
+ mockitdown MUST ship the retro packs `mac-classic` (Macintosh System 1–6), `lisa` (Lisa Office System), `macos9` (Mac OS 9, Platinum), `gsos` (Apple IIgs GS/OS), `xerox-star` (Xerox Star), `win2` (Windows 2.x), `win31` (Windows 3.1.1), `winxp` (Windows XP, Luna), `vista` (Windows Vista, Aero) and `cde` (Solaris CDE), and the hidden easter-egg packs `lcars`, `phosphor` and `hologram` (R-PACK-010, ADR-16).
@ V1 edit
~ `mockitdown packs` lists the [-eight-]{+framework+} [-identifiers;-]{+and retro identifiers but not the hidden ones;+} the example site has one page per framework {+and retro +}pack {+and one hidden page per easter egg +}(F-14).

## Files

```diff
--- a/prose.md
+++ b/prose.md
@@ -5 +5,3 @@
 [Pack catalogue](catalogue.md) page.
+
+The platform packs added in 0.3 widen coverage to Android and the Linux desktops (SRC-4); the retro packs serve enthusiasts and historical documentation (SRC-5); the easter eggs reward readers who reach the end of the documentation.
```
