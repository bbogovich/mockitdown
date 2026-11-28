---
id: TC-1
title: Additional chrome kinds and the generic window
verifies: [C1, C2]
---

Python unit tests `python/tests/test_devices.py` `AdditionalChromeTests`: `gnome`, `kde`, `win31` and
`window` are chrome kinds; `gnome` draws no chrome, `kde` a title bar with the title, `win31` the
control-menu box, the title and minimise and maximise; the `gtk` pack maps to `gnome` and `win31` to
`win31` (C1). The `aqua` pack's desktop renders `.mkd-chrome--window` with the title, the leading
close and menu buttons, the trailing help, minimise, maximise, zoom, collapse and close buttons and the
grow box in a bottom strip, and the base stylesheet hides the buttons and the strip (C2, V1).
