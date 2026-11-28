---
id: TC-1
title: Unknown elements and roles
verifies: [C1, C2, C3]
---

Python unit tests `python/tests/test_markup.py` `UnknownElementTests`: `HStack { Text("a"); Foo { Text("b") }; Text("c") }` reports one
`unknown` error and renders `div.mkd-unknown[data-el=Foo]` with `span.mkd-unknown__name` and `b`, between `a` and `c`
(C1, V1); a site pack element whose role has no renderer reports "pack 'acme': element 'Gizmo' has unknown role
'gizmo'" (code `role`) and renders as an unknown view (C2); the base stylesheet gives `.mkd-unknown` a dashed border
and styles its name (C3).
