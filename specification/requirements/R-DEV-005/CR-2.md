---
id: R-DEV-005.CR-2
target: R-DEV-005
kind: revision
version: 0.12.9
date: 2026-11-27
issue: 58
summary: "as built: C4 browser address also from @Screen(url:); C5 part classes of R-DEV-007 and R-DEV-010; TC-1 verifies C1-C5 (#58)"
from: b70e844772e6
to: 2c1c1047f2d5
---

## Clauses

@ C4 edit
~ `ios` MUST draw a status bar (time 9:41, dynamic island, cellular, Wi-Fi and battery icons) and a home indicator; `ipados` a status bar with date and battery percentage and a home indicator; `android` a status bar and a navigation handle; `macos` a title bar with traffic lights and the title (unified with the root's toolbar as R-DEV-010.C2 and C7 say); `windows` a title bar with app icon, title and minimise/maximise/close controls; `browser` a window bar with traffic lights, navigation buttons, an address field showing the `url` [-option-]{+option, else `@Screen(url:)`+} (default `https://app.example.com`) and a menu button.
@ C5 edit
~ Chrome MUST be static markup with classes `mkd-chrome` and one of `mkd-chrome--status`, `mkd-chrome--titlebar`, `mkd-chrome--browser`, `mkd-chrome--home` {+(or a part class another requirement names, R-DEV-007, R-DEV-010) +}and `data-chrome=<kind>`, styled by the base pack and restyled by packs.

## Files

```diff
--- /dev/null
+++ b/TC-1.md
@@ -0,0 +1,17 @@
+---
+id: TC-1
+title: Chrome kinds, selection and markup
+verifies: [C1, C2, C3, C4, C5]
+---
+
+Python unit tests `python/tests/test_devices.py` `ChromeTests`: every kind of C1 renders without
+diagnostics (C1). The `chrome` option wins over `@Screen(chrome:)`, `auto` in either falls through, and
+the pack's map gives `ios` for a SwiftUI phone, `ipados` for its tablet and `none` for an unmapped form
+or an Android desktop (C2). `chrome="bogus"` and `@Screen(chrome: .bogus)` warn "unknown chrome 'bogus'
+(known: …)" with code `chrome` and draw no chrome (C3). The parts of each kind: 9:41, the island,
+cellular, Wi-Fi and battery icons and the home indicator for `ios`; the date, 100% and the home
+indicator for `ipados`; status bar and handle for `android`; three traffic lights and the title for
+`macos`; app icon, title and minimise, maximise, close for `windows`; lights, back, forward, reload, the
+address (default `https://app.example.com`, the `url` option or `@Screen(url:)`) and the menu for
+`browser` (C4, V1). Each kind's markup carries `mkd-chrome`, its part classes and its `data-chrome`, and
+the base stylesheet styles the four part classes (C5).
```
