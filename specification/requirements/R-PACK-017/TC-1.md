---
id: TC-1
title: Types complete
verifies: [C1, C2, C3, C5, C8]
---

Shared test in both suites (`test_types.py`, `types.test.ts`): every rule has `params` with valid
types; every rendered modifier of the vocabulary has a group and argument types; every pack's `types`
is valid and `params` stays a list of names; the labels each role reads (R-EVAL-004.C8) all have a
type, being the keys of its `params`, which `test_unknown_labels.py` holds against what the Python
renderer looks up. The Python suite also runs each check on hand-written bad data (an unknown type, a rule
without `params`, an enum without values, an array without items, a repeated common label, a modifier
without an entry or with an unknown group) and expects the hand-written error list (C8).
