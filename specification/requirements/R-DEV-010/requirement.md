---
id: R-DEV-010
title: Multi-platform chrome for SwiftUI
status: active
version: 0.8.8
rev: 1
page: REND.2
slot: reqs
order: 999
source: [SRC-9]
realizes: [F-10]
constrained_by: [A-REND-2]
requires: [R-DEV-001]
hash: 0bb0547bf4e4
---

C1: The `swiftui` pack MUST draw `phone` forms in iOS 26 chrome (status bar with time, Dynamic Island, cellular, Wi-Fi and battery; home indicator), `tablet` forms in iPadOS 26 chrome (status bar with time and date, Wi-Fi, battery percentage; home indicator) and `desktop` and `wide` forms in macOS 26 chrome.
C2: macOS 26 chrome MUST draw a window with rounded corners (`--mkd-window-radius`, 16 points), a shadow, and traffic lights 12 points in diameter; when the root view has a toolbar or navigation title, the title bar MUST be unified with it — title leading after the traffic lights, toolbar items trailing as Liquid Glass capsules — otherwise a centred title.
C3: With `macos` chrome, a `NavigationSplitView`'s sidebar MUST be drawn as the macOS 26 floating sidebar (an inset rounded translucent panel running under the title bar, the traffic lights over it) with a sidebar toggle button in the toolbar.
C4: The render option `windowed` (fence attribute, `@Screen(windowed:)`) with `ipados` chrome MUST draw an iPadOS 26 app window — rounded corners, traffic lights at its top leading corner — over a wallpaper, inset from the frame.
C5: The `swiftui` pack SHOULD adapt shared elements to the form: `NavigationSplitView` collapses to its sidebar in a `NavigationStack` on a phone; `TabView(.sidebarAdaptable)` shows a sidebar on tablet and desktop; `Form` (automatic) uses the grouped style on phone and tablet and the columns style on desktop.
C6: With `ipados` chrome, a `NavigationSplitView`'s sidebar MUST be drawn as the iPadOS 26 floating sidebar: an inset, rounded Liquid Glass panel over the detail's background, with the sidebar's title and rows inside it and a sidebar toggle button in the toolbar.
V1: The same `NavigationSplitView` source renders with an iOS status bar at `phone`, an iPadOS status bar at `tablet` and a macOS window with a floating sidebar at `desktop`.
