---
id: ADR-13
title: The shipped packs
status: active
version: 0.12.11
rev: 4
page: ADR.2
slot: decisions
order: 6
source: [SRC-2]
constrains: [R-PACK-008]
hash: b5f201a8f1e8
refs: [F-14, R-PACK-008]
---

D1: mockitdown ships `base` (wireframe), `swiftui`, `fluent` (WinUI 3 / Fluent 2), `mui` (Material UI v9), `angular-material`, `sapui5` (Fiori Horizon), `bootstrap` (5.3) and `shadcn` (shadcn/ui).
D2: Ant Design, Tailwind Catalyst, IBM Carbon and GitHub Primer followed in 0.4 (R-PACK-008); further candidates are listed on the example site's roadmap page.
O1: rejected: Fluent UI React (web) instead of WinUI 3 — SRC-2 asks for "Windows with Fluent design language"; a web Fluent pack can extend `fluent` later.
O2: rejected: Material 3 (Material Web / Compose) as the Material pack — SRC-2 names Material UI; MUI is the React implementation most teams use.
O3: rejected: Chakra UI, Vuetify, Tailwind UI as the extra web packs — lower usage than Bootstrap, or (Tailwind) not a component library; shadcn/ui covers the Tailwind-based style.
C1: The packs cover Apple platforms, Windows, React, Angular, SAP and the two most common other web styles.
C2: Each pack has a page on the example site (F-14).
