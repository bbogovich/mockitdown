---
id: TC-1
title: Unknown labelled arguments
verifies: [C7, C8, C9, C10]
---

Conformance cases `diag-unknown-label` (a misspelt label on a core element and on a pack element, an
alias, a default, a slot label, an `action:` closure and a binding — only the first two warn) with their
`diag.json`, in both suites; the order and text of the warnings are identical. `test_examples.py`, the
pattern tests (R-WEB-004.TC-7) and `gen_reference.py --check` fail on any `argument` warning in the
example site, the design patterns or the reference samples (F-12.AC5).
