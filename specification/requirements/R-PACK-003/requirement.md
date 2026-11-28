---
id: R-PACK-003
title: Pack inheritance
status: active
version: 0.12.10
rev: 2
page: PACK.1
slot: reqs
order: 3
source: [SRC-3]
realizes: [F-3, F-7]
constrained_by: [A-PACK-1]
decisions: [ADR-4]
reverse_engineered: true
hash: 6a58c8608b1a
---

C1: A pack MUST extend the pack named by `extends`; when `extends` is absent, every pack other than `base` MUST extend `base`, and `base` MUST extend nothing.
C2: If a pack extends itself, then the pack registry MUST raise "a pack cannot extend itself".
C3: The pack registry MUST merge `elements`, `modifiers`, `chrome`, `sizes`, `icons` and `attrs` over the parent's, the child's entries replacing the parent's entries of the same name.
C4: The pack registry MUST merge `tokens` per mode over the parent's tokens of that mode.
C5: Font aliases MUST be resolved from the pack itself up through its ancestors, the nearest definition winning; an unmapped name MUST resolve to itself.
C6: The pack registry MUST record which element names the pack defines itself, as distinct from inherited ones.
C7: The pack's lineage MUST be the chain from the root pack to the pack, and the stylesheet for a pack MUST include every pack in its lineage, root first.
V1: A pack extending `fluent` that redefines `Button` and adds one token keeps every other Fluent element and token, and its stylesheet contains base, then fluent, then its own CSS.
