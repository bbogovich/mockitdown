---
id: R-DEV-009.CR-2
target: R-DEV-009
kind: revision
version: 0.8.11
date: 2026-11-25
issue: 14
summary: "as built (#14): empty menubar value draws the bar; status items in macOS order (battery, Wi-Fi, Control Center, clock); every SwiftUI command placement; warnings for an unknown menu title (C10) and placement (C11); icons, section headers and cascading submenus (C12)"
from: 2ea4047f37f5
to: 81acb80e76c8
---

## Clauses

@ C1 edit
~ The render option `menubar` (fence attribute `menubar`, CLI `--menubar`, `mockitdown-mockup` attribute `menubar`, `@Screen(menubar:)`) MUST accept `true`, `false` (default) or the title of a menu; any value other than `false` {+(an empty value, such as the attribute or the CLI flag given without one, included) +}MUST draw the macOS menu bar, and a title MUST additionally draw that menu open.
@ C3 edit
~ The menu bar MUST span the full width of the frame above the window, 24 points tall, translucent (`--mkd-menubar-bg`), and MUST hold, left to right: the Apple menu glyph, the application name in bold, the application's menus, a flexible gap, and the status items [-Control-]{+in+} [-Center,-]{+macOS's order — battery,+} Wi-Fi, [-battery-]{+Control Center —+} and the clock `Mon Nov 23  9:41 AM` (fixed text, for deterministic output).
@ C5 edit
~ The application's menus MUST come from `.commands { … }` on the root view: `CommandMenu("T") { … }` adds menu T before Window; `CommandGroup(replacing:|before:|after: <placement>) { … }` edits a standard menu at the SwiftUI placement (`.appInfo`, `.appSettings`, {+`.systemServices`, `.appVisibility`, `.appTermination`, +}`.newItem`, `.saveItem`,{+ `.importExport`,+} `.printItem`, `.undoRedo`, `.pasteboard`, `.textEditing`, [-`.sidebar`,-]{+`.textFormatting`,+} `.toolbar`, {+`.sidebar`, +}`.windowSize`,{+ `.singleWindowList`, `.windowList`,+} `.windowArrangement`, `.help`).
@ C10 insert after C9
+ A `menubar` title that names no menu MUST draw the bar with no menu open and warn "menubar names no menu" with the title and code `chrome`.
@ C11 insert after C10
+ A `CommandGroup` without `replacing:`, `before:` or `after:`, or naming a placement not listed in C5, MUST be ignored with a warning of code `chrome`.
@ C12 insert after C11
+ An open menu MAY draw a `Button`'s or `Menu`'s `systemImage` as an icon before its title, a `Section`'s title as a header row, and an open submenu (`.open()` on a `Menu` inside it) cascading beside its highlighted row.

## Files

```diff
--- a/TC-1.md
+++ b/TC-1.md
@@ -3,5 +3,5 @@
 title: Menu bar and open menu
-verifies: [C1, C3, C5, C6, C7]
+verifies: [C1, C3, C4, C5, C6, C7, C8, C10, C11, C12]
 ---
 
-Python and TypeScript render tests (conformance cases added to `shared/conformance/`): V1 source; assert the bar's items in order, the clock text, the open File menu's rows, shortcut glyphs, separator, disabled row and submenu chevron.
+Python and TypeScript render tests (conformance cases added to `shared/conformance/`): V1 source; assert the bar's items in order, the clock text, the open File menu's rows, shortcut glyphs, separator, disabled row and submenu chevron. Also: the option's spellings (`true`, empty, a title, `@Screen`, fence, CLI, element attribute) and the app name's defaults; `CommandGroup` replacing, before and after; `.open()` on a menu and on a submenu (cascading); a title naming no menu and an unknown placement warn with code `chrome`.
--- a/prose.md
+++ b/prose.md
@@ -13 +13,8 @@
 ```
+
+The status items follow macOS's own order (battery, Wi-Fi, Control Center, then the clock), and the
+standard menus carry the items a SwiftUI app gets on macOS 26 for each placement, so a `CommandGroup`
+edits exactly the group it names; an empty `CommandGroup(replacing:)` removes that group without
+leaving a doubled separator. Only one menu is drawn open, because macOS shows only one at a time;
+the title highlighted in the bar tells the reader which. A mistyped menu title or placement draws the
+bar anyway, with a warning, so the mistake is visible rather than silently dropped.
```
