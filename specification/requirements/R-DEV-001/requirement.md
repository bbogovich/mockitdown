---
id: R-DEV-001
title: Device forms and sizes
status: active
version: 0.2.0
rev: 0
page: REND.2
slot: reqs
order: 4
source: [SRC-2, SRC-3]
realizes: [F-10]
constrained_by: [A-OPT-1, A-REND-2]
reverse_engineered: true
hash: bb0abe4e9b7f
---

C1: mockitdown MUST define these device forms with sizes in logical points (width × height): `phone` 393 × 852, `phone-landscape` 852 × 393, `tablet` 1180 × 820, `tablet-portrait` 820 × 1180, `desktop` 1280 × 800, `wide` 1440 × 900.
C2: A pack's `sizes` MUST override these sizes, and MAY define further device forms, for that pack.
C3: The device form `fit` MUST size the frame to its content instead of a fixed size.
V1: `device="phone"` renders `--mkd-w:393;--mkd-h:852`; a pack with `"sizes": {"phone": [390, 844]}` renders `--mkd-w:390;--mkd-h:844`.
