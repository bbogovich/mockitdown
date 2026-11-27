---
title: "Role rules and typed parameters"
spec_version: 0.10.0
status: draft
updated: 2026-11-26
page_id: PACK.3
---

# Role rules and typed parameters

Shared language data that the design tools read (F-16.C6, F-16.C7; SRC-12#s6.3, SRC-12#s7): which
roles may contain which, how an element attaches to its parent, and the type of every role parameter
and rendered modifier. The data is kept by role in `shared/language/roles.json` and
`shared/language/vocabulary.json`, so a pack element inherits it from its role, and a pack overrides it
only for the elements that differ. Rendering never reads it: both variants publish it unchanged, and
only the TypeScript design tools enforce it.

<!-- slot: reqs -->

## Revision history

| Version | Date | Change |
|---|---|---|
| 0.10.0 | 2026-11-26 | Page created (ING-1) |
