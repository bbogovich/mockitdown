---
id: R-DEV-009
title: The macOS menu bar
status: active
version: 0.8.11
rev: 2
page: REND.2
slot: reqs
order: 999
source: [SRC-9]
realizes: [F-10]
constrained_by: [A-REND-2]
requires: [R-DEV-010]
hash: 81acb80e76c8
refs: [R-DEV-010]
---

C1: The render option `menubar` (fence attribute `menubar`, CLI `--menubar`, `mockitdown-mockup` attribute `menubar`, `@Screen(menubar:)`) MUST accept `true`, `false` (default) or the title of a menu; any value other than `false` (an empty value, such as the attribute or the CLI flag given without one, included) MUST draw the macOS menu bar, and a title MUST additionally draw that menu open.
C2: The menu bar MUST be drawn only with `macos` chrome; with any other chrome the renderer MUST ignore it and warn "menubar needs macOS chrome" with code `chrome`.
C3: The menu bar MUST span the full width of the frame above the window, 24 points tall, translucent (`--mkd-menubar-bg`), and MUST hold, left to right: the Apple menu glyph, the application name in bold, the application's menus, a flexible gap, and the status items in macOS's order — battery, Wi-Fi, Control Center — and the clock `Mon Nov 23  9:41 AM` (fixed text, for deterministic output).
C4: The application name MUST be the `app` option (fence attribute `app`, `@Screen(app:)`), defaulting to the window title, then `App`.
C5: The application's menus MUST come from `.commands { … }` on the root view: `CommandMenu("T") { … }` adds menu T before Window; `CommandGroup(replacing:|before:|after: <placement>) { … }` edits a standard menu at the SwiftUI placement (`.appInfo`, `.appSettings`, `.systemServices`, `.appVisibility`, `.appTermination`, `.newItem`, `.saveItem`, `.importExport`, `.printItem`, `.undoRedo`, `.pasteboard`, `.textEditing`, `.textFormatting`, `.toolbar`, `.sidebar`, `.windowSize`, `.singleWindowList`, `.windowList`, `.windowArrangement`, `.help`).
C6: Without `.commands`, and around its additions, the menu bar MUST show the standard menus App, File, Edit, View, Window and Help with macOS's standard items for each placement (for example File: New ⌘N, Open… ⌘O, Close ⌘W, Save ⌘S; Edit: Undo ⌘Z, Redo ⇧⌘Z, Cut ⌘X, Copy ⌘C, Paste ⌘V, Select All ⌘A; App: About <App>, Settings… ⌘,, Hide <App> ⌘H, Quit <App> ⌘Q).
C7: An open menu MUST be drawn as a dropdown under its title (the title highlighted), overlapping the window, as a translucent rounded panel holding one row per item: `Button` (title; `.keyboardShortcut("k", modifiers: …)` drawn right-aligned as ⌃⌥⇧⌘ glyphs then the key, default modifier ⌘), `Divider` (separator), `Menu` (submenu: title and a trailing chevron), `Toggle` (checkmark when on), and `.disabled(true)` items greyed.
C8: A `CommandMenu` or `Menu` inside `.commands` MAY carry `.open()` (or `isPresented: true`), which opens it like naming it in `menubar`; at most one menu bar menu MUST be drawn open (the first).
C9: The menu bar MUST be part of the frame's height: at a fixed device the window MUST fill the frame below it, keeping its macOS 26 window form (R-DEV-010.C2: rounded corners, shadow, traffic lights, unified title bar) under the bar rather than on the frame's own edge.
C10: A `menubar` title that names no menu MUST draw the bar with no menu open and warn "menubar names no menu" with the title and code `chrome`.
C11: A `CommandGroup` without `replacing:`, `before:` or `after:`, or naming a placement not listed in C5, MUST be ignored with a warning of code `chrome`.
C12: An open menu MAY draw a `Button`'s or `Menu`'s `systemImage` as an icon before its title, a `Section`'s title as a header row, and an open submenu (`.open()` on a `Menu` inside it) cascading beside its highlighted row.
V1: `menubar="File"` on a desktop SwiftUI mockup with `.commands { CommandMenu("Shapes") { Button("Circle").keyboardShortcut("c", modifiers: [.shift, .command]) } }` renders the bar with App…File, Edit, View, Shapes, Window, Help, the clock, and an open File menu whose first row is New with ⌘N.
