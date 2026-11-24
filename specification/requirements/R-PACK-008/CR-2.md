---
id: R-PACK-008.CR-2
target: R-PACK-008
kind: revision
version: 0.4.0
date: 2026-11-24
summary: Ships the antd, tailwind, carbon and primer packs and the nls, win1, nextstep, win95 and aqua retro packs; retro pages in chronological order
from: 7c53507ae5c2
to: 2ca4ea3f7edb
---

## Clauses

@ C1 edit
~ mockitdown MUST ship these packs: `base` (neutral wireframe, the core vocabulary), `swiftui` (SwiftUI on iOS, iPadOS and macOS), `fluent` (Fluent 2 · WinUI 3), `mui` (Material UI v9, React), `angular-material` (Angular Material), `sapui5` (SAPUI5 with the Fiori Horizon theme), `bootstrap` (Bootstrap 5.3), `shadcn` (shadcn/ui), {+`antd` (Ant Design 5, React), `tailwind` (Tailwind Catalyst, Tailwind Plus), `carbon` (IBM Carbon 11), `primer` (GitHub Primer), +}`android` (Jetpack Compose Material 3), `gtk` (GTK 4 with libadwaita), `qt` (Qt 6 Widgets, Fusion) and `kde-plasma` (KDE Plasma 6, Breeze).
@ C7 edit
~ mockitdown MUST ship the retro packs {+`nls` (Engelbart's NLS, 1968), `xerox-star` (Xerox Star), `lisa` (Lisa Office System), +}`mac-classic` (Macintosh System 1–6), [-`lisa`-]{+`win1`+} [-(Lisa-]{+(Windows+} [-Office-]{+1.0),+} [-System),-]{+`win2` (Windows 2.x), `gsos` (Apple IIgs GS/OS), `nextstep` (NeXTSTEP), `win31` (Windows 3.1.1), `win95` (Windows 95),+} `macos9` (Mac OS 9, Platinum), [-`gsos`-]{+`cde`+} [-(Apple-]{+(Solaris+} [-IIgs-]{+CDE),+} [-GS/OS),-]{+`aqua`+} [-`xerox-star`-]{+(Mac+} [-(Xerox-]{+OS+} [-Star),-]{+X+} [-`win2` (Windows 2.x), `win31` (Windows 3.1.1),-]{+Aqua),+} `winxp` (Windows XP, [-Luna),-]{+Luna) and+} `vista` (Windows Vista, [-Aero) and `cde` (Solaris CDE),-]{+Aero),+} and the hidden easter-egg packs `lcars`, `phosphor` and `hologram` (R-PACK-010, ADR-16).
@ V1 edit
~ `mockitdown packs` lists the framework and retro identifiers but not the hidden ones; the example site has one page per framework and retro [-pack-]{+pack, the retro pages listed in chronological order,+} and one hidden page per easter egg (F-14).

## Files

```diff
--- a/prose.md
+++ b/prose.md
@@ -3,3 +3,3 @@
 Bootstrap and shadcn/ui are the proposed additions, covering the most common non-Material web
-styles. Ant Design is proposed next (ADR-13). The element catalogue of each pack is on the
+styles. Ant Design, Tailwind Catalyst, IBM Carbon and GitHub Primer followed (ADR-13). The element catalogue of each pack is on the
 [Pack catalogue](catalogue.md) page.
@@ -7 +7,3 @@
 The platform packs added in 0.3 widen coverage to Android and the Linux desktops (SRC-4); the retro packs serve enthusiasts and historical documentation (SRC-5); the easter eggs reward readers who reach the end of the documentation.
+
+Release 0.4 adds four web kits from the recommended-next list (Ant Design, Tailwind Catalyst, IBM Carbon, GitHub Primer) and five retro systems (NLS, Windows 1.0, NeXTSTEP, Windows 95, Mac OS X Aqua); the retro pages are ordered by year so the section reads as a history of the GUI.
```
