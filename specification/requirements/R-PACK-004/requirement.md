---
id: R-PACK-004
title: Element definitions
status: active
version: 0.10.2
rev: 1
page: PACK.1
slot: reqs
order: 4
source: [SRC-3]
realizes: [F-3]
constrained_by: [A-PACK-1, M-PACK-2]
decisions: [ADR-4]
reverse_engineered: true
hash: e74faa4707f3
---

C1: An element definition MUST name its render `role`; if `role` is missing, then the pack registry MUST raise "element 'X' has no 'role'".
C2: An element definition MAY give `params` (the attribute names of positional arguments, in order), `defaults` (attribute values applied before the call's arguments), `variants` (the documented values of its `variant` attribute) and `doc` (one line of usage).
C3: Every element's role MUST be one of the renderer's roles (the role catalogue).
C4: If an element's role is not a renderer role, then the renderer MUST report "pack 'p': element 'X' has unknown role 'r'" with code `role` and render the view as an unknown element.
C5: Every element a pack lists MUST render without errors (other than missing struct arguments) when called with no arguments.
V1: The contract test loads every pack, checks every element's role against the renderer, and renders `Name()` for every element of every pack without errors.
