---
id: TC-1
title: Chrome kinds, selection and markup
verifies: [C1, C2, C3, C4, C5]
---

Python unit tests `python/tests/test_devices.py` `ChromeTests`: every kind of C1 renders without
diagnostics (C1). The `chrome` option wins over `@Screen(chrome:)`, `auto` in either falls through, and
the pack's map gives `ios` for a SwiftUI phone, `ipados` for its tablet and `none` for an unmapped form
or an Android desktop (C2). `chrome="bogus"` and `@Screen(chrome: .bogus)` warn "unknown chrome 'bogus'
(known: …)" with code `chrome` and draw no chrome (C3). The parts of each kind: 9:41, the island,
cellular, Wi-Fi and battery icons and the home indicator for `ios`; the date, 100% and the home
indicator for `ipados`; status bar and handle for `android`; three traffic lights and the title for
`macos`; app icon, title and minimise, maximise, close for `windows`; lights, back, forward, reload, the
address (default `https://app.example.com`, the `url` option or `@Screen(url:)`) and the menu for
`browser` (C4, V1). Each kind's markup carries `mkd-chrome`, its part classes and its `data-chrome`, and
the base stylesheet styles the four part classes (C5).
