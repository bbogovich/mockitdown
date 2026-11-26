---
id: R-DEV-010
title: Multi-platform chrome for SwiftUI
status: active
version: 0.8.9
rev: 2
page: REND.2
slot: reqs
order: 999
source: [SRC-9]
realizes: [F-10]
constrained_by: [A-REND-2]
requires: [R-DEV-001]
hash: 196bf25a5368
---

C1: The `swiftui` pack MUST draw `phone` forms in iOS 26 chrome (status bar with time, Dynamic Island, cellular, Wi-Fi and battery; home indicator), `tablet` forms in iPadOS 26 chrome (status bar with time and date, Wi-Fi, battery percentage; home indicator) and `desktop` and `wide` forms in macOS 26 chrome.
C2: macOS 26 chrome MUST draw a window with rounded corners (`--mkd-window-radius`, 16 points), a shadow, and traffic lights 12 points in diameter; when the root view has a toolbar or navigation title, the title bar MUST be unified with it — title leading after the traffic lights, toolbar items trailing as Liquid Glass capsules — otherwise a centred title.
C3: With `macos` chrome, a `NavigationSplitView`'s sidebar MUST be drawn as the macOS 26 floating sidebar (an inset rounded translucent panel running under the title bar, the traffic lights over it) with a sidebar toggle button in the toolbar.
C4: The render option `windowed` (fence attribute `windowed`, CLI `--windowed`, `mockitdown-mockup` attribute `windowed`, `@Screen(windowed:)`) with `ipados` chrome MUST draw an iPadOS 26 app window — rounded corners, traffic lights at its top leading corner — over a wallpaper (`--mkd-wallpaper`), inset from the frame, the status bar and home indicator drawn over the wallpaper.
C5: The `swiftui` pack SHOULD adapt shared elements to the form: `NavigationSplitView` collapses to its sidebar in a `NavigationStack` on a phone; `TabView(.sidebarAdaptable)` shows a sidebar on tablet and desktop; `Form` (automatic) uses the grouped style on phone and tablet and the columns style on desktop.
C6: With `ipados` chrome, a `NavigationSplitView`'s sidebar MUST be drawn as the iPadOS 26 floating sidebar: an inset, rounded Liquid Glass panel over the detail's background, with the sidebar's title and rows inside it and a sidebar toggle button in the toolbar.
C7: The title bar MUST be unified with the root's own toolbar row — the traffic lights drawn over its leading end — when the root view is a `NavigationStack` whose content has a `.navigationTitle` or `.toolbar`, a `NavigationSplitView`, or a `.sidebarAdaptable` `TabView`.
C8: With `macos` or `ipados` chrome, a toolbar button that has an icon MUST show only its icon.
C9: With `macos` chrome, the sidebar toggle MUST stand at the trailing end of the sidebar's part of the toolbar row.
C10: With any chrome other than `ipados`, the renderer MUST ignore `windowed` and warn "windowed needs iPadOS chrome; ignored" with code `chrome`.
C11: With `ipados` chrome, the sidebar toggle MUST be a Liquid Glass circle at the sidebar's top leading corner, beside the traffic lights when `windowed`.
C12: A `NavigationSplitView` column that is not a `NavigationStack` MUST draw its `.toolbar` items in its header, trailing its title.
C13: For any other root view carrying `.navigationTitle` or `.toolbar`, the macOS title bar MUST be 52 points tall and draw that title leading after the traffic lights, in place of the window title, and the toolbar items trailing.
C14: With `macos` or `ipados` chrome, adjacent toolbar buttons MUST share one Liquid Glass capsule.
C15: With `macos` chrome, the sidebar's own navigation title MUST be drawn leading in the toolbar row beside the sidebar when no other column has a title, and not inside the sidebar.
C16: With `macos` chrome, the titles of the columns after the sidebar MUST be drawn leading in the toolbar row.
V1: The same `NavigationSplitView` source renders with an iOS status bar at `phone`, an iPadOS status bar at `tablet` and a macOS window with a floating sidebar at `desktop`.
