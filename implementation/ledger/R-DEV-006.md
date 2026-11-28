---
requirement: R-DEV-006
title: Isolation from the host page
status: implemented
version: 0.12.9
date: 2026-11-27
issue: 58
---

# R-DEV-006 — Isolation from the host page

<!-- written by `vio-docs ledger record`; never edit -->

| Version | Date | Status | Issue | Change in the code | Pages |
|---|---|---|---|---|---|
| 0.12.9 | 2026-11-27 | implemented | #58 | C1-C3 implemented (shared/css/page.css); fixed by TC-2: the frame now sets the inherited text properties no pack sets (letter spacing and others leaked from Zensical's .md-typeset) and the reset covers kbd and box shadow, with .mkd-figure .mkd-frame kbd outranking theme key rules; verified by test_devices.py IsolationTests (TC-1) and devices.spec.mjs (TC-2) (#58). | [Styles and assets](../narrative/architecture/styles-assets.md), [Testing](../narrative/testing.md) |
