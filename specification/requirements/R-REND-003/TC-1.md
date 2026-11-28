---
id: TC-1
title: Data attributes on the root
verifies: [C1, C2, C3, C4, C5]
---

Python unit tests `python/tests/test_markup.py` `AttributeTests`: each attribute of C1 is copied to `data-<name>`; enum values by name,
numbers, and booleans as `true`/`false`; `appearance` is not copied; values with `<`, `"`, `;`, more than 40
characters or a list are dropped (C1); `state` gives `data-state`, `disabled` overrides it, `error` gives `error` only
without a state and only when not false or empty (C2); `selected` (C3); `.id`, `.ref` with two arguments and `.help`
(C4, V1); every data attribute the conformance corpus puts in a role's markup is common to every role or listed for
that role in the catalogue copy (C5).
