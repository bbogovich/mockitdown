---
id: F-10
title: Devices, frames and chrome
status: active
version: 0.6.0
rev: 1
page: FEAT.2
slot: features
order: 3
family: rendering
source: [SRC-2, SRC-3, SRC-9]
hash: dc570284548a
---

G1: A mockup must show the screen at the size and in the window or device frame the user will see.
C1: A mockup renders inside a frame of a named device size (phone, phone landscape, tablet, tablet portrait, desktop, wide) or a custom width and height, or shrink-wrapped to its content.
C2: The frame scales down as one picture to fit the page column, never larger than its logical size.
C3: The frame can show device chrome: an iOS or Android status bar, an iPadOS status bar, a macOS or Windows title bar, or a browser bar with an address.
C4: Each pack chooses a sensible default device and chrome for its platform.
AC1: A `device="phone"` mockup in a narrow column keeps its proportions and stays legible.
AC2: The SwiftUI pack shows an iOS status bar on a phone without any attribute.
N1: The prototype's per-device `form` overrides inside one block are retired; one block is written per device.
C5: A desktop mockup in a pack whose platform has a global menu bar (SwiftUI on macOS) can show that menu bar above the window, with the application's menus and the system's status items, and with any one menu drawn open as its dropdown.
C6: Packs for frameworks that span phone, tablet and desktop (SwiftUI) draw each form in its platform's chrome: iOS status bar and home indicator on a phone, the iPadOS status bar (and, for a windowed app, the window controls) on a tablet, and a macOS window with its toolbar on a desktop.
AC3: A SwiftUI mockup at `device="desktop"` with the menu bar turned on shows the Apple menu, the application name in bold, the application's menus and the clock; a menu marked open shows its items with keyboard shortcuts, separators, submenu arrows and disabled items.
AC4: The same SwiftUI source renders at `phone`, `tablet` and `desktop` in iOS, iPadOS and macOS chrome respectively.
