---
id: TC-1
title: Declared samples
verifies: [C1, C2, C4, C6, C7, C8]
---

Python unit test of `gen_reference`: a declared sample is used verbatim; a declared sample with a diagnostic fails naming pack and element; `--check` passes on the shipped packs.

Also: a declared sample of an element with variants that is not a call of the element fails; the variants sample is the declared sample with `.variant("…")`; every pack's reference JSON shows pickers, radio groups, segmented controls, tabs, date pickers and charts with content (IT-18, `python/tests/test_samples.py`).
