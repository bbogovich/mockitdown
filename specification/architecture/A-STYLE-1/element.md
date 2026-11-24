---
id: A-STYLE-1
title: Stylesheet assembly
status: active
version: 0.2.0
rev: 0
page: ARCH.2
slot: elements
order: 4
level: module
hash: 05045c5e1e35
---

P1: provides: `stylesheet(pack_ids, registry, minify)`, `scale_px`, `token_css` and `page.css` (`mockitdown.styles`)
U1: uses A-PACK-1 — pack lineage, CSS files and tokens
K1: Stylesheet assembly MUST be deterministic and cache pack CSS by file modification time.
