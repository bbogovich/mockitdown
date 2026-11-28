---
requirement: R-EDIT-006
title: The design session and its events
status: partial
version: 0.13.3
date: 2026-11-28
issue: 24
---

# R-EDIT-006 — The design session and its events

<!-- written by `vio-docs ledger record`; never edit -->

| Version | Date | Status | Issue | Change in the code | Pages |
|---|---|---|---|---|---|
| 0.13.3 | 2026-11-28 | partial | #24 | typescript/src/design/session.ts: DesignSession with the document, active mockup, selection, hover, last valid tree and diagnostics per mockup; apply, setCode, setOptions, moveMockup, select, hover, setActive, nodeFor, subscribe; one notification per state change, insert after an insert op; DESIGN_EVENTS; design-session.test.ts (TC-1), IT-52. Not yet: the components' DOM events (C7, C8, C11, TC-2) | [Design documents and the design session](../narrative/architecture/design.md), [Testing](../narrative/testing.md) |
