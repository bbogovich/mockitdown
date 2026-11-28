---
id: F-3
title: Framework design packs
status: active
version: 0.11.1
rev: 4
page: FEAT.1
slot: features
order: 3
family: authoring
source: [SRC-2, SRC-3, SRC-4, SRC-5, SRC-6, SRC-7, SRC-9, SRC-18]
hash: 9148452068b3
requires: [F-2]
---

G1: A mockup must look like the framework the final application is built with, so reviewers judge a realistic screen rather than a generic wireframe.
C1: A design pack provides the element vocabulary, design tokens, device chrome and stylesheet of one UI framework.
C2: Packs are shipped for a neutral wireframe, a hand-drawn wireframe sketch, SwiftUI, Jetpack Compose (Android, Material 3), Windows with Fluent design (WinUI 3), GTK 4 (libadwaita), Qt 6 Widgets, Avalonia UI, KDE Plasma, Material UI (current major version), Angular Material, SAPUI5 (Fiori), Bootstrap, shadcn/ui, Ant Design, Tailwind Catalyst, IBM Carbon, GitHub Primer, Vuetify and PrimeVue / PrimeNG.
C3: Each framework pack offers the framework's native component names (for example Fluent's `InfoBar`) in addition to the portable core vocabulary shared by all packs.
C4: Each framework pack covers as many of the framework's components as practical, so most screens of a real application can be expressed.
C5: The pack is chosen per mockup by a fence attribute, by an `import <Module>` line in the block, by the `@Screen(pack:)` directive, or by the site's default.
C6: Further frameworks can be added as packs without changing the notation; the example site's roadmap page lists the recommended next ones.
AC1: The same block written with core elements renders in every shipped pack, each time in that framework's visual style.
AC2: Every element a pack lists renders without an error.
AC3: `import SwiftUI` at the top of a block selects the SwiftUI pack.
N1: "Packs" were called "kits" in the prototype (base, swift, fiori).
C7: The SwiftUI pack follows Apple's current platform design (iOS 26, iPadOS 26, macOS 26) for each style it offers, so that each `.…Style(…)` variant looks like the native style rather than a relabelled default.
AC4: Every variant of the SwiftUI pack's ControlGroup, DatePicker, Form, Gauge, List, Picker, TabView and Toggle, and its Alert, ConfirmationDialog, NavigationSplitView, Popover, Sheet and Tab, renders recognisably as the native SwiftUI style it names.
C8: Retro packs are shipped for the historic graphical interfaces, ordered by the year they appeared: Engelbart's NLS, Xerox Star, Apple Lisa, the black-and-white Macintosh, Windows 1.0, Windows 2.x, the Apple IIgs GS/OS Finder, NeXTSTEP, Windows 3.1.1, Windows 95, Mac OS 9, Solaris CDE, Mac OS X Aqua, Windows XP and Windows Vista.
C9: Science-fiction interfaces (a Star Trek LCARS console, a green-screen phosphor terminal, a hologram display) are shipped as easter-egg packs: they work wherever they are named but are left out of every pack list, so a reader finds them only through the documentation's hidden pages and the gallery's home page.
C10: A retro pack for the Commodore Amiga Workbench is shipped in the Retro group.
C11: The Windows 1.0 pack shows Windows 1.0's default colour scheme — yellow menu bars, blue caption bars, red scroll bars, a blue and cyan desktop and a cyan icon area — rather than a monochrome look.
C12: The Apple IIgs GS/OS pack covers the system beyond the Finder window: the boot screen, the Launcher, the desktop with its drive icons and Trash, coloured icons, the desk accessories, the Control Panel, the Teach text editor and the shut-down screen.
C13: Further retro packs are shipped for systems with a distinct look of their own: Atari ST GEM, GEOS on the Commodore 64, Acorn RISC OS and BeOS.
C14: Classic handheld packs are shipped in the Mobile group for Apple Newton, Palm OS, Windows CE (Pocket PC) and BlackBerry.
C15: Rules that two or more packs' stylesheets share are written once and included by every pack that uses them, so that a pack's look can be maintained in one place.
AC5: Every pack the example site's Reference section and the gallery list belongs to one of C2, C8, C10, C13 or C14, and no shipped pack is missing from the lists except the easter eggs of C9.
AC6: Naming an easter-egg pack in a fence (`pack="lcars"`) renders it, while `mockitdown packs` and the Reference section do not list it.
AC7: A Windows 1.0 mockup of two tiled windows over the desktop and icon area shows the colours of SRC-18#image1.
AC8: The Amiga, GEM, GEOS, RISC OS and BeOS packs appear in the Retro group in chronological order, and the Newton, Palm OS, Windows CE and BlackBerry packs in the Mobile group.
AC9: No run of six stylesheet lines appears in two packs' stylesheets.
AC10: A mockup in the Apple IIgs GS/OS pack renders each of the screens named in C12 — the boot screen, the Launcher, the desktop with drive icons and Trash, a desk accessory, the Control Panel, the Teach editor and the shut-down screen — without a diagnostic, with coloured icons.
