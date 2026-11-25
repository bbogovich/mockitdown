---
id: R-REPO-003
title: The Python variant after the move
status: active
version: 0.6.0
rev: 0
page: REPO.1
slot: reqs
order: 3
hash: 68fe4c4452f2
source: [SRC-8]
realizes: [F-16]
requires: [R-REPO-002]
constrained_by: [ADR-17]
---

C1: The Python package built from `python/` MUST keep its PyPI name `mockitdown`, its import name, its public API, its command line and its Markdown extension and fence names.
C2: The Python wheel and sdist MUST contain the shared assets the package needs (C5 of R-REPO-002).
C3: `python -m pip install -e python[markdown]` MUST give a working development install, and the test suite MUST pass when run from `python/`.
C4: The release workflow MUST build and publish the Python package from `python/`, and the Pages workflow MUST build the example site from `python/examples/site/`.
C5: `tools/gen_reference.py` MUST keep generating the example site's Reference section and MUST also write `shared/reference/<pack>.json` (R-WEB-004).
V1: The Python test suite, including the Zensical example-site build, passes from `python/`, and a wheel built from `python/` installs and renders a mockup in a fresh virtual environment.
