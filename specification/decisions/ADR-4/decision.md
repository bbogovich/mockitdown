---
id: ADR-4
title: Packs are data mapped onto a fixed set of render roles
status: active
version: 0.2.0
rev: 0
page: ADR.1
slot: decisions
order: 4
source: [SRC-2, SRC-3]
constrains: [R-PACK-001, R-PACK-002, R-PACK-003, R-PACK-004, R-REND-002]
hash: 495362954b10
---

D1: A pack is data — `pack.json` (vocabulary, tokens, chrome, modifier maps, sizes, icons) and `pack.css` — that inherits from `base`.
D2: Elements map framework-native names onto a fixed set of render roles with positional parameters and default attributes; every pack shares one markup contract.
D3: Sites can add or replace packs from their own directories (`pack_paths`).
O1: rejected: packs as Python modules with their own renderers — code per framework, markup divergence, and site packs would execute code at build time.
O2: rejected: the prototype's kit catalogues in Python (`ElementSpec` with `html_tag`) — couples vocabulary to code and to per-framework tags.
O3: rejected: one renderer per framework — eight implementations of every role.
C1: Adding a framework or a site design system needs no code; a pack author writes JSON and CSS.
C2: A framework component that no role can express needs a new role — a specification change.
C3: Every pack is tested by the same contract tests.
