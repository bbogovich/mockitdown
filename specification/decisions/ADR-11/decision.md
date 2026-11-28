---
id: ADR-11
title: An original icon set with framework name aliases
status: active
version: 0.12.11
rev: 1
page: ADR.2
slot: decisions
order: 4
source: [SRC-2]
constrains: [R-ASSET-005]
hash: 1a1b8d462db8
refs: [ADR-5]
---

D1: mockitdown ships its own set of original 24px line glyphs and aliases SF Symbols, Material Symbols, Fluent UI System Icons and SAP icon names onto them.
O1: rejected: bundle SF Symbols — its licence forbids redistribution and use outside Apple platforms.
O2: rejected: bundle Material Symbols, Fluent icons and the SAP icon font — several megabytes of fonts or SVG, network or packaging cost, and per-pack icon pipelines.
O3: rejected: load icon fonts from a CDN — violates ADR-5.
C1: Any of the four naming schemes works in any pack.
C2: Icons approximate the framework's glyphs; unknown names show a placeholder and a warning.
