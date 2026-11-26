---
id: R-DEV-009
title: The macOS menu bar
status: active
version: 0.7.0
rev: 0
page: REND.2
slot: reqs
order: 999
source: [SRC-9]
realizes: [F-10]
constrained_by: [A-REND-2]
requires: [R-DEV-010]
hash: faa14d76f130
---

C1: The render option `menubar` (fence attribute `menubar`, CLI `--menubar`, `mockitdown-mockup` attribute `menubar`, `@Screen(menubar:)`) MUST accept `true`, `false` (default) or the title of a menu; any value other than `false` MUST draw the macOS menu bar, and a title MUST additionally draw that menu open.
C2: The menu bar MUST be drawn only with `macos` chrome; with any other chrome the renderer MUST ignore it and warn "menubar needs macOS chrome" with code `chrome`.
C3: The menu bar MUST span the full width of the frame above the window, 24 points tall, translucent (`--mkd-menubar-bg`), and MUST hold, left to right: the Apple menu glyph, the application name in bold, the application's menus, a flexible gap, and the status items Control Center, Wi-Fi, battery and the clock `Mon Nov 23  9:41 AM` (fixed text, for deterministic output).
C4: The application name MUST be the `app` option (fence attribute `app`, `@Screen(app:)`), defaulting to the window title, then `App`.
C5: The application's menus MUST come from `.commands { … }` on the root view: `CommandMenu("T") { … }` adds menu T before Window; `CommandGroup(replacing:|before:|after: <placement>) { … }` edits a standard menu at the SwiftUI placement (`.appInfo`, `.appSettings`, `.newItem`, `.saveItem`, `.printItem`, `.undoRedo`, `.pasteboard`, `.textEditing`, `.sidebar`, `.toolbar`, `.windowSize`, `.windowArrangement`, `.help`).
C6: Without `.commands`, and around its additions, the menu bar MUST show the standard menus App, File, Edit, View, Window and Help with macOS's standard items for each placement (for example File: New ⌘N, Open… ⌘O, Close ⌘W, Save ⌘S; Edit: Undo ⌘Z, Redo ⇧⌘Z, Cut ⌘X, Copy ⌘C, Paste ⌘V, Select All ⌘A; App: About <App>, Settings… ⌘,, Hide <App> ⌘H, Quit <App> ⌘Q).
C7: An open menu MUST be drawn as a dropdown under its title (the title highlighted), overlapping the window, as a translucent rounded panel holding one row per item: `Button` (title; `.keyboardShortcut("k", modifiers: …)` drawn right-aligned as ⌃⌥⇧⌘ glyphs then the key, default modifier ⌘), `Divider` (separator), `Menu` (submenu: title and a trailing chevron), `Toggle` (checkmark when on), and `.disabled(true)` items greyed.
C8: A `CommandMenu` or `Menu` inside `.commands` MAY carry `.open()` (or `isPresented: true`), which opens it like naming it in `menubar`; at most one menu bar menu MUST be drawn open (the first).
C9: The menu bar MUST be part of the frame's height: at a fixed device the window MUST fill the frame below it.
V1: `menubar="File"` on a desktop SwiftUI mockup with `.commands { CommandMenu("Shapes") { Button("Circle").keyboardShortcut("c", modifiers: [.shift, .command]) } }` renders the bar with App…File, Edit, View, Shapes, Window, Help, the clock, and an open File menu whose first row is New with ⌘N.
<!-- file: TC-1.md -->
---
id: TC-1
title: Menu bar and open menu
verifies: [C1, C3, C5, C6, C7]
---

Python and TypeScript render tests (conformance cases added to `shared/conformance/`): V1 source; assert the bar's items in order, the clock text, the open File menu's rows, shortcut glyphs, separator, disabled row and submenu chevron.
<!-- file: TC-2.md -->
---
id: TC-2
title: Menu bar only with macOS chrome
verifies: [C2, C9]
---

`menubar=true` with `device=phone` warns code `chrome` and draws no bar; with `device=desktop` the window's top edge is 24 points below the frame's top.
<!-- file: prose.md -->
On the Mac, the menu bar's titles and commands are designed text and part of the application's
interface (SRC-9). It is an option because most screens are reviewed without it. Menus are declared
the SwiftUI way, with `.commands`, so the mockup reads like the app's own code.

```swift
import SwiftUI
@Screen(app: "Notes", menubar: "File")
NavigationSplitView { … } detail: { … }
  .commands {
    CommandGroup(after: .newItem) { Button("New Folder").keyboardShortcut("n", modifiers: [.shift, .command]) }
    CommandMenu("Format") { Button("Bold").keyboardShortcut("b"); Divider(); Toggle("Show Ruler", isOn: true) }
  }
```
