---
requirement: R-API-001
title: render
status: implemented
version: 0.12.7
date: 2026-11-27
issue: 56
---

# R-API-001 — render

<!-- written by `vio-docs ledger record`; never edit -->

| Version | Date | Status | Issue | Change in the code | Pages |
|---|---|---|---|---|---|
| 0.12.7 | 2026-11-27 | implemented | #56 | C1-C4 implemented (api.py render, RenderResult, error_html). Fixed while writing TC-1: render and check take source and options positional only, so the render option source can be a keyword override (C2); verified by test_api.py RenderTests (TC-1) (#56). | [Architecture overview](../narrative/architecture/index.md), [Testing](../narrative/testing.md) |
