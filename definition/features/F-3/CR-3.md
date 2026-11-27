---
id: F-3.CR-3
target: F-3
kind: additive
version: 0.10.0
date: 2026-11-27
summary: "SRC-18: all shipped packs recorded (C2, C8), easter eggs (C9), Amiga, Windows 1.0 default colours, GS/OS beyond the Finder, GEM, GEOS, RISC OS, BeOS, classic handhelds in Mobile, shared rules written once: C8-C15, AC5-AC9, UC-3, UC-4"
from: f600a5fc06bb
to: b494715c391f
---

## Clauses

@ meta.source
- [SRC-2, SRC-3, SRC-9]
+ [SRC-2, SRC-3, SRC-4, SRC-5, SRC-6, SRC-7, SRC-9, SRC-18]
@ C2 edit
~ Packs are shipped for a neutral wireframe, {+a hand-drawn wireframe sketch, +}SwiftUI,{+ Jetpack Compose (Android, Material 3),+} Windows with Fluent design (WinUI 3),{+ GTK 4 (libadwaita), Qt 6 Widgets, Avalonia UI, KDE Plasma,+} Material UI (current major version), Angular Material, SAPUI5 (Fiori), [-Bootstrap-]{+Bootstrap, shadcn/ui, Ant Design, Tailwind Catalyst, IBM Carbon, GitHub Primer, Vuetify+} and [-shadcn/ui.-]{+PrimeVue / PrimeNG.+}
@ C8 insert after AC4
+ Retro packs are shipped for the historic graphical interfaces, ordered by the year they appeared: Engelbart's NLS, Xerox Star, Apple Lisa, the black-and-white Macintosh, Windows 1.0, Windows 2.x, the Apple IIgs GS/OS Finder, NeXTSTEP, Windows 3.1.1, Windows 95, Mac OS 9, Solaris CDE, Mac OS X Aqua, Windows XP and Windows Vista.
@ C9 insert after C8
+ Science-fiction interfaces (a Star Trek LCARS console, a green-screen phosphor terminal, a hologram display) are shipped as easter-egg packs: they work wherever they are named but are left out of every pack list, so a reader finds them only through the documentation's hidden pages and the gallery's home page.
@ C10 insert after C9
+ A retro pack for the Commodore Amiga Workbench is shipped in the Retro group.
@ C11 insert after C10
+ The Windows 1.0 pack shows Windows 1.0's default colour scheme — yellow menu bars, blue caption bars, red scroll bars, a blue and cyan desktop and a cyan icon area — rather than a monochrome look.
@ C12 insert after C11
+ The Apple IIgs GS/OS pack covers the system beyond the Finder window: the boot screen, the Launcher, the desktop with its drive icons and Trash, coloured icons, the desk accessories, the Control Panel, the Teach text editor and the shut-down screen.
@ C13 insert after C12
+ Further retro packs are shipped for systems with a distinct look of their own: Atari ST GEM, GEOS on the Commodore 64, Acorn RISC OS and BeOS.
@ C14 insert after C13
+ Classic handheld packs are shipped in the Mobile group for Apple Newton, Palm OS, Windows CE (Pocket PC) and BlackBerry.
@ C15 insert after C14
+ Rules that two or more packs' stylesheets share are written once and included by every pack that uses them, so that a pack's look can be maintained in one place.
@ AC5 insert after C15
+ Every pack the example site's Reference section and the gallery list belongs to one of C2, C8, C10, C13 or C14, and no shipped pack is missing from the lists except the easter eggs of C9.
@ AC6 insert after AC5
+ Naming an easter-egg pack in a fence (`pack="lcars"`) renders it, while `mockitdown packs` and the Reference section do not list it.
@ AC7 insert after AC6
+ A Windows 1.0 mockup of two tiled windows over the desktop and icon area shows the colours of SRC-18#image1.
@ AC8 insert after AC7
+ The Amiga, GEM, GEOS, RISC OS and BeOS packs appear in the Retro group in chronological order, and the Newton, Palm OS, Windows CE and BlackBerry packs in the Mobile group.
@ AC9 insert after AC8
+ No run of six stylesheet lines appears in two packs' stylesheets.

## Files

```diff
--- a/prose.md
+++ b/prose.md
@@ -10 +10,21 @@
 names; a variant that renders as the default with a different label misleads the reviewer.
+
+**All shipped packs (SRC-18#answers).** C2 once named only the first eight packs; later requests added
+desktop, mobile and web frameworks (SRC-4, SRC-6, SRC-7), retro systems (SRC-5, SRC-6) and science-fiction
+easter eggs (SRC-4, SRC-5). C2, C8 and C9 now record every pack that ships. The easter eggs are their own
+capability because they behave differently: they render when named but are never listed — a reward for
+readers who explore (SRC-4).
+
+**More history, and phones before the iPhone (SRC-18#packs, SRC-18#mobile).** The Amiga Workbench, a
+Windows 1.0 pack in the garish default colours of its time (the developer's screenshot, SRC-18#image1),
+a much fuller GS/OS pack (from the screens of SRC-18#refs), and four systems from the GUI timeline with a
+look nobody confuses with another: Atari ST GEM (green desktop, 1985), GEOS on the Commodore 64 (1986),
+Acorn RISC OS (the icon bar, 1987/1992) and BeOS (yellow title tabs, 1995). OS/2 Warp 4, DeskMate and
+Visi On were considered and left for later: OS/2 and DeskMate resemble the Windows packs already shipped,
+and Visi On is mostly text. The handhelds — Newton, Palm OS, Windows CE and BlackBerry — join the Mobile
+group because they are phones and PDAs, not desktops.
+
+**Shared rules written once (SRC-18#health).** Packs that imitate related systems (the Lisa and the
+Macintosh, for example) share many drawing rules. Those rules live in one shared stylesheet that each
+pack includes, rather than in copies that drift apart.
+
--- /dev/null
+++ b/usecases/UC-3.md
@@ -0,0 +1,12 @@
+---
+id: UC-3
+title: Show a screen as a historic system drew it
+---
+
+**Actor:** writer of an article or talk about interface history, or a retro enthusiast.
+
+1. The writer describes a Cardfile window with `pack="win1"`, then the same layout with `pack="amiga"`
+   and `pack="palm"`.
+
+**Outcome:** each figure looks like a screenshot of that system — Windows 1.0 in its default yellow,
+blue and red, the Workbench in its blue and orange, the Palm in its 160 × 160 greyscale screen.
--- /dev/null
+++ b/usecases/UC-4.md
@@ -0,0 +1,11 @@
+---
+id: UC-4
+title: Find an easter egg
+---
+
+**Actor:** developer reading the documentation.
+
+1. The developer reads the gallery's home page to its end and follows the link to the LCARS pack.
+
+**Outcome:** the gallery shows the LCARS pack's elements and examples, although the side panel lists no
+science-fiction pack.
```
