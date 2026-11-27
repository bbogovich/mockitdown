---
id: TC-1
title: Precedence within and across libraries
verifies: [C1, C2, C3, C4]
---

Two files imported `as UI` both declaring `Card`: one warning of C1, the later `Card` is used; `acme/cards` and `contoso/cards` both declaring `Card` load with no diagnostic (C4); a block-local `Card` replaces the imported ones silently (C2); a struct `Text` replaces the pack's `Text` (C3). Automated in `python/tests/test_imports.py` and mirrored in the TypeScript unit tests.
