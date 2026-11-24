---
id: ADR-13
title: The shipped packs
status: active
version: 0.2.0
rev: 0
page: ADR.2
slot: decisions
order: 6
source: [SRC-2]
constrains: [R-PACK-008]
hash: e4264440d201
---

D1: mockitdown ships `base` (wireframe), `swiftui`, `fluent` (WinUI 3 / Fluent 2), `mui` (Material UI v9), `angular-material`, `sapui5` (Fiori Horizon), `bootstrap` (5.3) and `shadcn` (shadcn/ui).
D2: Ant Design is the proposed next pack.
O1: rejected: Fluent UI React (web) instead of WinUI 3 — SRC-2 asks for "Windows with Fluent design language"; a web Fluent pack can extend `fluent` later.
O2: rejected: Material 3 (Material Web / Compose) as the Material pack — SRC-2 names Material UI; MUI is the React implementation most teams use.
O3: rejected: Chakra UI, Vuetify, Tailwind UI as the extra web packs — lower usage than Bootstrap, or (Tailwind) not a component library; shadcn/ui covers the Tailwind-based style.
C1: The packs cover Apple platforms, Windows, React, Angular, SAP and the two most common other web styles.
C2: Each pack has a page on the example site (F-14).
<!-- file: prose.md -->
**Context.** SRC-2 requires SwiftUI, Fluent on Windows, Angular, React (with current Material UI)
and SAPUI5, and asks for proposals of others.

**Decision.** Bootstrap — still the most deployed CSS component framework — and shadcn/ui — the
fastest-growing React component style — are added; Ant Design, dominant in enterprise React, is
next.

**Consequences.** Eight packs to maintain under one contract; framework major versions are
recorded in each `pack.json` (`version`).
