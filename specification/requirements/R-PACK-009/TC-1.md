---
id: TC-1
title: The core vocabulary of base
verifies: [C1, C2, C3]
---

Python unit tests `python/tests/test_pack_registry.py` `CoreVocabularyTests`: the 90 core elements of C1 by family, plus the elements other
requirements add to `base`, are exactly `base`'s own elements (134), every pack inherits all 90, and
`mockitdown elements base` lists exactly those (C1, V1); `base`'s modifiers are exactly the mappings of C2, and
`.buttonStyle(.bordered)`, `.controlSize(.large)` and `.buttonBorderShape(.capsule)` render `data-variant`,
`data-size` and `data-shape` (C2); `base` declares `Wireframe` and `Mockitdown`, defaults to `desktop` and has chrome
`none` on every form, and `import Wireframe` renders a desktop figure without chrome (C3).
