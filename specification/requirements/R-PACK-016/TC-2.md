---
id: TC-2
title: canContain and allowedChildren
verifies: [C5, C6, C7, C8, C10, C12, C13, C14, C15, C16]
---

`typescript/tests/unit/roles.test.ts` "TC-2: …" (`node:test`): the cases of V1, with the hand-written
reasons; the sapui5 `ObjectPageLayout` accepts only section-role elements while a plain `VStack` of the
same pack follows its role; a pack given as a `Pack`; `allowedChildren("base", "HStack")` lists `Toggle`
and not `TabView`, with `TabView` under "A frame cannot be placed inside a horizontal stack", every
element exactly once and one group per reason; a leaf parent refuses everything with one reason; an
element name the pack does not define accepts all and is accepted by every parent holding children, but
not by a leaf; `dist/shared/roles.json` equals `shared/language/roles.json` and is in the manifest; an
unknown pack throws. Python (`python/tests/test_roles.py` `PackagedTableTests`): the package holds
`roles.json` beside `vocabulary.json`, identical to `shared/`, and a mockup breaking a pack's rule
renders without a diagnostic; every conformance case's diagnostics are unchanged (the conformance suites
of both variants).

As built (#30): "TC-2: holdsChildren …" in the same file: `VStack`, `HStack` and `List` hold children, `Text` and
`Divider` do not, a name `base` does not define does, and the narrowed sapui5 `ObjectPageLayout` still does (C16).
