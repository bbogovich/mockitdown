---
id: R-PACK-008
title: Shipped packs
status: active
version: 0.2.0
rev: 0
page: PACK.1
slot: reqs
order: 8
source: [SRC-2]
realizes: [F-3]
constrained_by: [A-PACK-2]
decisions: [ADR-13]
hash: e96d800ee8f1
---

C1: mockitdown MUST ship these packs: `base` (neutral wireframe, the core vocabulary), `swiftui` (SwiftUI on iOS, iPadOS and macOS), `fluent` (Fluent 2 · WinUI 3), `mui` (Material UI v9, React), `angular-material` (Angular Material), `sapui5` (SAPUI5 with the Fiori Horizon theme), `bootstrap` (Bootstrap 5.3) and `shadcn` (shadcn/ui).
C2: Every shipped pack other than `base` MUST extend `base` directly or indirectly, declare at least one import module, define light and dark tokens, and choose a default device and per-device chrome that match its platform.
C3: The `swiftui` pack MUST be selected by `import SwiftUI`.
C4: Each framework pack SHOULD define elements for as many of its framework's components as practical, under the framework's own names, with `doc` lines and documented `variants`.
C5: Each framework pack MUST map the framework's style modifiers or properties onto attributes its CSS styles (for example a button style onto `variant`), so that the same core elements take on the framework's variants.
C6: The pack's `framework` and `version` keys MUST name the imitated framework and the version whose design it follows.
V1: `mockitdown packs` lists the eight identifiers; the example site has one page per framework pack (F-14).
<!-- file: prose.md -->
The selection answers SRC-2: SwiftUI, Windows with Fluent, the most popular web frameworks — React
through Material UI (its current major version) and Angular through Angular Material — and SAPUI5;
Bootstrap and shadcn/ui are the proposed additions, covering the most common non-Material web
styles. Ant Design is proposed next (ADR-13). The element catalogue of each pack is on the
[Pack catalogue](catalogue.md) page.
