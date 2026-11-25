---
requirement: R-REPO-003
title: The Python variant after the move
status: implemented
version: 0.6.1
date: 2026-11-25
issue: 1
---

# R-REPO-003 — The Python variant after the move

<!-- written by `sio-docs ledger record`; never edit -->

| Version | Date | Status | Issue | Change in the code | Pages |
|---|---|---|---|---|---|
| 0.6.1 | 2026-11-25 | implemented | #1 | As built (0.6.1): reference JSON shape (C6–C8), --check covers it (C9), LICENSE in wheel and sdist (C10). | [Repository layout and shared assets](../narrative/repository.md), [Build and publish](../narrative/build-publish.md) |
| 0.6.0 | 2026-11-25 | implemented | #1 | Package unchanged in name, API, CLI and files (wheel compared with 0.3.0); wheel and sdist carry the shared copies and LICENSE; release and Pages workflows build from python/; gen_reference.py also writes shared/reference/<pack>.json and index.json, checked by --check. | [Repository layout and shared assets](../narrative/repository.md), [Build and publish](../narrative/build-publish.md), [Testing](../narrative/testing.md) |
