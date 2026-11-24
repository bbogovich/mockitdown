---
id: R-REND-002
title: Role markup
status: active
version: 0.2.0
rev: 0
page: REND.1
slot: reqs
order: 2
source: [SRC-3]
realizes: [F-3, F-8]
constrained_by: [A-REND-1]
decisions: [ADR-4]
reverse_engineered: true
hash: 9fc903ed609c
---

C1: The renderer MUST render every view through its element's render role, and every role MUST produce a root element with the class `mkd-<role>`.
C2: The renderer MUST give each role's root element `data-el` set to the element name as written (`Button`, `InfoBar`), and `data-component` set to the component name when the view is the root of a struct's body.
C3: The renderer MUST name a role's inner parts with BEM classes `mkd-<role>__<part>` (and, where a part has a variant, `mkd-<role>--<modifier>`), and these class names MUST be the same for every pack.
C4: The renderer MUST append the classes given by `.class(…)` to the root element.
C5: The set of roles and the parts and attributes each role emits MUST be as listed in the role catalogue; adding a role or a part is a change to this specification.
V1: `Button("Save")` renders `<span class="mkd-button" data-el="Button" role="button">` with a `mkd-button__label` part in every pack.
