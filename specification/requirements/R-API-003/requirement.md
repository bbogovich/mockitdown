---
id: R-API-003
title: Render options
status: active
version: pending
rev: 1
page: API.1
slot: reqs
order: 3
source: [SRC-2]
realizes: [F-11, F-13]
constrained_by: [A-OPT-1, M-OPT-1]
reverse_engineered: true
hash: cdd098018d12
refs: [M-OPT-1]
---

C1: Render options MUST be an immutable value with the fields and defaults of M-OPT-1, and MUST provide a copy with overrides applied.
C2: Every fence attribute and CLI rendering option MUST map onto a render option of the same meaning.
V1: `RenderOptions(pack="fluent").with_overrides(device="phone", nope=1)` has pack `fluent`, device `phone` and no error.
