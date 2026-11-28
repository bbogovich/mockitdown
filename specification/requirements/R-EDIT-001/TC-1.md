---
id: TC-1
title: Spans, ordinals and ids
verifies: [C1, C2, C3, C4, C5, C7, C8, C11, C12, C13, C14, C17, C18]
---

`node:test` (`typescript/tests/unit/tree.test.ts`): for every case of `shared/conformance/` that parses,
each view node's span and name span read back from the source as the node's text and name, its leading
comment lines included; the ordinals are `n1…nK` in source order; a modifier call is not a node; the
lookup by offset returns the innermost node. A source with a syntax error returns `tree: null` and the
same diagnostics as `check`.

Besides the corpus, cases in the same file: the narrative example (names, kinds, parents, the comment
above `VStack` in its span), a call inside a modifier's argument (a node) next to the modifiers (none),
a struct body numbered with the rest, UTF-16 offsets past an emoji and inside an interpolation, nested
block comments recorded, comment lines leading a node only when contiguous and not trailing code, and
the lookups by offset, id and ordinal.
