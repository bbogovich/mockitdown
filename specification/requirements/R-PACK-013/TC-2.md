---
id: TC-2
title: Base samples carry content
verifies: [C3, C5]
---

Python test over `shared/reference/base.json`: the listed elements' samples contain the required arguments; browser gallery test asserts each chart sample draws at least one mark.

IT-18: `python/tests/test_samples.py` (`BaseSampleTests`, every chart sample rendered with at least one mark) and `typescript/tests/browser/gallery-render.spec.mjs` ("R-PACK-013 TC-2").
