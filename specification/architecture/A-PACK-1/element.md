---
id: A-PACK-1
title: Pack registry
status: active
version: 0.2.0
rev: 0
page: ARCH.1
slot: elements
order: 7
level: module
hash: 07def5221549
---

P1: provides: `PackRegistry` (lookup by id, listing, module index), `Pack`, `ElementDef` and the cached `registry(extra_dirs)` (`mockitdown.packs`)
U1: uses A-PACK-2 — the built-in pack directory
U2: uses A-DIAG-1 — raise pack loading errors
K1: The pack registry MUST read packs as data only; it MUST NOT execute code from a pack directory.
