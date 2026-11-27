---
id: TC-1
title: The library attribute
verifies: [C1, C6]
---

A fence with `library="cards"` is accepted by the validator with no fence error (C1); `library="my-cards"` produces the fence error naming `library` and the block renders as a mockup (C6). Automated in `python/tests/`.
