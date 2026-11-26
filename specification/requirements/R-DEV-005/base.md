---
id: R-DEV-005
title: Device chrome
status: active
version: 0.2.0
rev: 0
page: REND.2
slot: reqs
order: 8
source: [SRC-2, SRC-3]
realizes: [F-10]
constrained_by: [A-REND-2]
reverse_engineered: true
hash: dcb41100cf21
---

C1: The chrome kinds MUST be `none`, `ios`, `ipados`, `macos`, `windows`, `android` and `browser`.
C2: The figure assembler MUST take the chrome from the `chrome` option when it is not `auto`, else from `@Screen(chrome:)` when given and not `auto`, else from the pack's `chrome` map for the resolved device (none when unmapped).
C3: If the chrome kind is unknown, then the figure assembler MUST warn "unknown chrome 'x' (known: …)" with code `chrome` and draw none.
C4: `ios` MUST draw a status bar (time 9:41, dynamic island, cellular, Wi-Fi and battery icons) and a home indicator; `ipados` a status bar with date and battery percentage; `android` a status bar and a navigation handle; `macos` a title bar with traffic lights and the title; `windows` a title bar with app icon, title and minimise/maximise/close controls; `browser` a window bar with traffic lights, navigation buttons, an address field showing the `url` option (default `https://app.example.com`) and a menu button.
C5: Chrome MUST be static markup with classes `mkd-chrome` and one of `mkd-chrome--status`, `mkd-chrome--titlebar`, `mkd-chrome--browser`, `mkd-chrome--home` and `data-chrome=<kind>`, styled by the base pack and restyled by packs.
V1: A SwiftUI phone mockup shows the iOS status bar and home indicator; `chrome="browser" url="https://shop.example.com"` shows that address.
<!-- file: prose.md -->
Chrome puts the screen in context — a phone, a Windows app, a web page — without the author
drawing it. The fixed time and status icons make renderings reproducible.
