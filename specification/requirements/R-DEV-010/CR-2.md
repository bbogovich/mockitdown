---
id: R-DEV-010.CR-2
target: R-DEV-010
kind: revision
version: 0.8.9
date: 2026-11-25
issue: 13
summary: "as built: unified title bar rules (C7, C13), icon-only toolbar buttons sharing a glass capsule (C8, C14), macOS sidebar toggle and titles in the toolbar row (C9, C15, C16), windowed ignored without iPadOS chrome (C10), iPad toggle (C11), split column toolbar (C12), windowed on CLI and element (C4) (#13)"
from: 0bb0547bf4e4
to: 196bf25a5368
---

## Clauses

@ C4 edit
~ The render option `windowed` (fence [-attribute,-]{+attribute `windowed`, CLI `--windowed`, `mockitdown-mockup` attribute `windowed`,+} `@Screen(windowed:)`) with `ipados` chrome MUST draw an iPadOS 26 app window — rounded corners, traffic lights at its top leading corner — over a [-wallpaper,-]{+wallpaper (`--mkd-wallpaper`),+} inset from the [-frame.-]{+frame, the status bar and home indicator drawn over the wallpaper.+}
@ C7 insert after C6
+ The title bar MUST be unified with the root's own toolbar row — the traffic lights drawn over its leading end — when the root view is a `NavigationStack` whose content has a `.navigationTitle` or `.toolbar`, a `NavigationSplitView`, or a `.sidebarAdaptable` `TabView`.
@ C8 insert after C7
+ With `macos` or `ipados` chrome, a toolbar button that has an icon MUST show only its icon.
@ C9 insert after C8
+ With `macos` chrome, the sidebar toggle MUST stand at the trailing end of the sidebar's part of the toolbar row.
@ C10 insert after C9
+ With any chrome other than `ipados`, the renderer MUST ignore `windowed` and warn "windowed needs iPadOS chrome; ignored" with code `chrome`.
@ C11 insert after C10
+ With `ipados` chrome, the sidebar toggle MUST be a Liquid Glass circle at the sidebar's top leading corner, beside the traffic lights when `windowed`.
@ C12 insert after C11
+ A `NavigationSplitView` column that is not a `NavigationStack` MUST draw its `.toolbar` items in its header, trailing its title.
@ C13 insert after C12
+ For any other root view carrying `.navigationTitle` or `.toolbar`, the macOS title bar MUST be 52 points tall and draw that title leading after the traffic lights, in place of the window title, and the toolbar items trailing.
@ C14 insert after C13
+ With `macos` or `ipados` chrome, adjacent toolbar buttons MUST share one Liquid Glass capsule.
@ C15 insert after C14
+ With `macos` chrome, the sidebar's own navigation title MUST be drawn leading in the toolbar row beside the sidebar when no other column has a title, and not inside the sidebar.
@ C16 insert after C15
+ With `macos` chrome, the titles of the columns after the sidebar MUST be drawn leading in the toolbar row.

## Files

```diff
--- a/prose.md
+++ b/prose.md
@@ -2 +2,10 @@
 its platform's chrome, and the shared containers adapt as SwiftUI adapts them.
+
+On a Mac the window's title bar becomes the root view's toolbar row, as in macOS 26: a navigation stack's bar, a
+split view's columns or a sidebar-adaptable tab view run up to the top edge with the traffic lights floating over
+their leading end; a plain view's `.navigationTitle` and `.toolbar` are drawn in the title bar itself. A view without
+either keeps the classic centred window title. The sidebar's own title is the window's: macOS shows it in the
+toolbar, not in the sidebar.
+
+`windowed` shows how an iPad app looks in iPadOS 26's windowing: the app's window, with its traffic lights, over
+the wallpaper. It means nothing for other chrome, so the renderer warns rather than guessing.
```
