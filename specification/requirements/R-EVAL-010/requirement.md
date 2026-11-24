---
id: R-EVAL-010
title: The @Screen directive
status: active
version: 0.2.0
rev: 0
page: LANG.2
slot: reqs
order: 10
source: [SRC-3]
realizes: [F-1, F-6]
constrained_by: [A-EVAL-1]
decisions: [ADR-2]
reverse_engineered: true
hash: 1c39a1e8b318
---

C1: The evaluator MUST read `@Screen(…)` arguments into the screen's metadata: a labelled argument under its label, the first unlabelled argument as `title`, later unlabelled arguments under `_<position>`; enum values MUST be stored by name.
C2: The metadata keys `title`, `id`, `device`, `appearance`, `chrome`, `url` and `pack` MUST take effect as specified for each (R-PACK-005, R-DEV-002, R-APP-001, R-DEV-006, R-REND-001); other keys MUST be ignored.
C3: If a top-level directive other than `@Screen` is present, then the evaluator MUST warn "unknown directive @Name" with code `directive` and ignore it.
C4: Values given by fence attributes or render options MUST override the corresponding `@Screen` metadata.
V1: `@Screen("Checkout", id: "SCR-2", device: .phone)` with fence `device="tablet"` renders a tablet frame captioned `SCR-2 · Checkout`.
