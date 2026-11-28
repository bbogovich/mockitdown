---
id: TC-1
title: Role roots, components, parts, classes and the role catalogue
verifies: [C1, C2, C3, C4, C5]
---

Python unit tests `python/tests/test_markup.py` `RoleMarkupTests`: every `base` element renders a root of class `mkd-<role>` (or the root the
role catalogue names for `icon`, `table`, `tab`, `tablerow`, `toolbaritem`; `tablecolumn` draws none) with `data-el`
as written (C1, C2); a struct's body root carries `data-component` (C2); `Button("Save")` renders
`span.mkd-button[data-el=Button][role=button]` with `mkd-button__label` in every shipped pack, and a toggle, a slider
and a card emit the same part classes in base, SwiftUI, Fluent, Material UI and Windows 95 (C3, V1); `.class(…)`
classes follow the role class (C4); the renderer's roles are exactly the catalogue's, `base` maps the catalogue's
elements to each, and every part class the conformance corpus contains is listed for its role in
`python/tests/fixtures/role-catalogue.json`, the copy of the catalogue's table (C5).
