---
id: TC-1
title: Inheritance, merging, fonts and lineage
verifies: [C1, C2, C3, C4, C5, C6, C7]
---

Python unit tests `python/tests/test_pack_registry.py` `InheritanceTests`: `base` has no parent, a pack without `extends` extends `base`, and every
pack's lineage starts at `base` (C1); a pack extending itself raises "a pack cannot extend itself" (C2); a pack
extending `fluent` that redefines `Button`, adds an element and overrides one modifier, chrome form, size, icon and
argument map keeps every other Fluent entry (C3, V1); one light token is replaced and the dark tokens are Fluent's (C4,
V1); a font alias resolves from the nearest pack, then its ancestors, and an unmapped name to itself (C5);
`own_elements` holds only the pack's own definitions (C6); the lineage is base, fluent, the pack, and its stylesheet
holds base, then Fluent, then its own CSS before its own token rules (C7, V1).
