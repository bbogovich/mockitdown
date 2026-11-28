---
id: TC-1
title: Unknown labelled arguments
verifies: [C7, C8, C9, C10, C11, C12]
---

Conformance case `diag-unknown-label` in pack antd (a misspelt label on a core element, `VStack(spacng:)`,
and on a pack element, `Switch(chekced:)`; an element alias `type:`, a default `variant:`, a slot
`extra: Link(…)`, an `action:` closure and a binding `onSearch: $query` — only the first two warn), its
`diag.json` written by hand, run by `test_conformance.py` and `conformance.test.ts`; `lang-colors` now
expects the three warnings of `Color(red:green:blue:)`. `python/tests/test_unknown_labels.py` and
`typescript/tests/unit/unknown-labels.test.ts` (IT-60) hold the same hand-written examples (F-12.AC4,
the understood labels of C7, the order of several warnings, struct arguments not reported), check that
both variants read `reads` from the shared file (C8, C11: no rule, no warning) and that the reference
samples render without the warning; the Python suite also renders the whole corpus recording every
label each role looks up and fails on one the table omits (C12). `test_examples.py` (example site and
its component files) and the pattern tests (R-WEB-004.TC-7) fail on any diagnostic, `gen_reference.py
--check` on a declared sample with one (C10, F-12.AC5).
