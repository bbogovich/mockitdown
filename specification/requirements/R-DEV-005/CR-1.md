---
id: R-DEV-005.CR-1
target: R-DEV-005
kind: revision
version: 0.8.9
date: 2026-11-25
issue: 13
summary: "as built: ipados draws a home indicator; macos title bar unified per R-DEV-010 (#13)"
from: dcb41100cf21
to: b70e844772e6
---

## Clauses

@ C4 edit
~ `ios` MUST draw a status bar (time 9:41, dynamic island, cellular, Wi-Fi and battery icons) and a home indicator; `ipados` a status bar with date and battery [-percentage;-]{+percentage and a home indicator;+} `android` a status bar and a navigation handle; `macos` a title bar with traffic lights and the [-title;-]{+title (unified with the root's toolbar as R-DEV-010.C2 and C7 say);+} `windows` a title bar with app icon, title and minimise/maximise/close controls; `browser` a window bar with traffic lights, navigation buttons, an address field showing the `url` option (default `https://app.example.com`) and a menu button.

## Files

(none)
