---
id: TC-1
title: Wheel contains the shared assets
verifies: [C2]
---

Automated by `python/tests/test_shared.py`: a wheel built from `python/` lists every pack's `pack.json` and `pack.css`, `page.css`, `icons.json` and `vocabulary.json`.
