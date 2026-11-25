---
id: R-REPO-004
title: Conformance corpus
status: active
version: 0.6.0
rev: 0
page: REPO.1
slot: reqs
order: 4
hash: 04f1b27a8cc0
source: [SRC-8]
realizes: [F-16]
requires: [R-REPO-003]
constrained_by: [ADR-18]
---

C1: `shared/conformance/` MUST hold conformance cases, each a mockitdown source `<name>.mockitdown` with its render options in `<name>.json` and its expected HTML in `<name>.html`.
C2: The corpus MUST cover every render role of the base pack, every shipped pack at least once, light and dark appearance, each device form, imports of components, annotations and overlays, charts, images and diagnostics.
C3: The expected HTML MUST be produced by the Python renderer, by `python/tools/gen_conformance.py`.
C4: `gen_conformance.py --check` MUST fail when an expected file differs from what the Python renderer now produces.
C5: Each variant's test suite MUST render every case and fail on any difference from the expected HTML.
V1: Changing one expected file makes both test suites fail.
