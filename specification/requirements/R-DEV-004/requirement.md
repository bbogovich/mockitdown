---
id: R-DEV-004
title: Length rewriting
status: active
version: 0.2.0
rev: 0
page: REND.2
slot: reqs
order: 7
source: [SRC-3]
realizes: [F-10]
constrained_by: [A-STYLE-1, A-REND-3]
decisions: [ADR-7]
reverse_engineered: true
hash: bc30dd314c81
---

C1: When assembling the stylesheet, the stylesheet assembler MUST rewrite every `px` length in pack CSS and in token values whose absolute value exceeds 1 to `calc(N * var(--u))`, keeping N as written.
C2: The stylesheet assembler MUST keep lengths of 1px or less unchanged, so hairlines stay crisp at every scale.
C3: The stylesheet assembler MUST NOT rewrite a number that is part of an identifier, a hex colour or another unit.
C4: The page stylesheet (`page.css`) MUST NOT be rewritten; its lengths are page lengths.
V1: `padding: 12px 1px; border: 0.5px solid; width: 2.5px` becomes `padding: calc(12 * var(--u)) 1px; border: 0.5px solid; width: calc(2.5 * var(--u))`.
