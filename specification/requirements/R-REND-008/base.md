---
id: R-REND-008
title: Unknown elements and roles
status: active
version: 0.2.0
rev: 0
page: REND.1
slot: reqs
order: 8
source: [SRC-3]
realizes: [F-12]
constrained_by: [A-REND-1, A-EVAL-1]
reverse_engineered: true
hash: bd3b728839fc
---

C1: The renderer MUST render an `unknown` view as `div.mkd-unknown[data-el=<name>]` containing `span.mkd-unknown__name` with the name, followed by the view's children.
C2: If an element's role has no renderer, then the renderer MUST report the error of R-PACK-004.C4 and render the view as an unknown view.
C3: The base pack's CSS MUST style unknown views as visibly labelled placeholders that keep the surrounding layout intact.
V1: `HStack { Text("a"); Foo { Text("b") }; Text("c") }` renders three children, the middle one an `mkd-unknown` labelled `Foo` holding `b`.
<!-- file: prose.md -->
A placeholder in place shows the author exactly which element is wrong while keeping the rest of
the screen readable.
