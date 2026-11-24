---
id: F-10
title: Devices, frames and chrome
status: active
version: 0.2.0
rev: 0
page: FEAT.2
slot: features
order: 3
family: rendering
source: [SRC-2, SRC-3]
hash: 6783e9e14853
---

G1: A mockup must show the screen at the size and in the window or device frame the user will see.
C1: A mockup renders inside a frame of a named device size (phone, phone landscape, tablet, tablet portrait, desktop, wide) or a custom width and height, or shrink-wrapped to its content.
C2: The frame scales down as one picture to fit the page column, never larger than its logical size.
C3: The frame can show device chrome: an iOS or Android status bar, an iPadOS status bar, a macOS or Windows title bar, or a browser bar with an address.
C4: Each pack chooses a sensible default device and chrome for its platform.
AC1: A `device="phone"` mockup in a narrow column keeps its proportions and stays legible.
AC2: The SwiftUI pack shows an iOS status bar on a phone without any attribute.
N1: The prototype's per-device `form` overrides inside one block are retired; one block is written per device.
