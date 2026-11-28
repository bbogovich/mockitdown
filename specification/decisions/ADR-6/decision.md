---
id: ADR-6
title: Token-driven appearance
status: active
version: 0.12.11
rev: 2
page: ADR.1
slot: decisions
order: 6
source: [SRC-2]
constrains: [R-APP-001, R-APP-002, R-PACK-006, R-PACK-007]
hash: 246adb471f3d
refs: [ADR-5]
---

D1: Each pack defines light and dark token sets; pack CSS uses only tokens for appearance-dependent values and never branches on appearance.
D2: `auto` follows the host page: Material/Zensical `data-md-color-scheme="slate"` means dark; on pages without that attribute, `prefers-color-scheme` decides.
D3: `both` renders the light and dark frames side by side.
O1: rejected: separate light and dark stylesheets per pack — doubles CSS and drifts.
O2: rejected: follow only `prefers-color-scheme` — ignores the reader's choice in the documentation theme's toggle.
O3: rejected: a script that watches the theme toggle — violates ADR-5.
C1: Dark mode for a pack costs only a dark token set.
C2: A pack's CSS must route every colour through tokens to be correct in dark mode.
