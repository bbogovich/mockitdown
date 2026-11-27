---
id: TC-3
title: Qualified components in resolution order
verifies: [C1]
---

With library `acme` declaring `Card` and the pack also having a `Card` element, `acme.Card()` instantiates the struct, `Card()` instantiates the struct (unique), and a block-local `Card` wins over both for `Card()` but not for `acme.Card()`. Automated in `python/tests/` and the TypeScript unit tests.
