---
id: TC-1
title: Every role has a rule
verifies: [C1, C2, C3, C4, C9]
---

Shared test in both suites (`test_roles.py`, `roles.test.ts`): every role of the renderer's role table
has a rule with a valid category and attach mode; every `accepts` entry is a role or `@category`; every
pack's `rules` is a subset of its role's; SRC-12#s6.3's examples hold (a frame accepted at the root and
refused in a stack, a Grid accepting only GridRow).
