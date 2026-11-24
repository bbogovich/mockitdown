---
id: A-ASSET-1
title: Asset resolver
status: active
version: 0.2.0
rev: 0
page: ARCH.2
slot: elements
order: 5
level: module
hash: 5f6422161a1e
---

P1: provides: `AssetResolver.resolve(ref, location)` → URL for `src`, or `None` (`mockitdown.assets`)
U1: uses A-DIAG-1 — report refused, missing and oversized assets
K1: The asset resolver MUST NOT read a file outside its search roots.
