---
id: TC-1
title: Every role has a rule
verifies: [C1, C2, C3, C4, C9, C11]
---

Shared test in both suites (`python/tests/test_roles.py` `RoleTableTests`, `typescript/tests/unit/roles.test.ts`
"TC-1: …"): every role of the renderer's role table (the Python `r_<role>` methods, the TypeScript
`RENDER_ROLES`) has exactly one rule and no rule names a role the renderer lacks; every rule has a title,
a valid category and the attach mode of its category; every `accepts` entry is a role or `@category`;
every pack's `rules` is a subset of its role's; SRC-12#s6.3's examples hold (each frame accepted at the
root and refused in a stack, a card and a list, a Grid accepting only GridRow, a toolbar only toolbar
items, buttons, pickers and search fields, the item roles of List, Tree and Board, content leaves, a
button or link holding its label, overlays and annotations refused in a stack), with the hand-written
reasons of C14.
