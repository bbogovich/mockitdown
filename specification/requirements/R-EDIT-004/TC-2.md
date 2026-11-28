---
id: TC-2
title: Off means unchanged
verifies: [C1, C2, C10]
---

Both suites render every conformance case with `edit: false` added to its options and compare with the
unchanged expected HTML. The Python API and TypeScript `render` accept `edit`; the fence reports an `edit`
attribute as an unknown fence option (R-MDX-003.C4), and the CLI has no such option.

As built (#23): `python/tests/test_edit_mode.py` (`EditOff`) and `typescript/tests/unit/conformance.test.ts`
("… renders unchanged with edit: false"); for an edit-mode case, `edit: false` is compared with the same
options without `edit`. `typescript/tests/unit/edit-mode.test.ts` checks the default and the fence.
