---
requirement: R-REND-013
title: Rows without overlap
status: implemented
version: 0.8.1
date: 2026-11-25
issue: 8
---

# R-REND-013 — Rows without overlap

<!-- written by `sio-docs ledger record`; never edit -->

| Version | Date | Status | Issue | Change in the code | Pages |
|---|---|---|---|---|---|
| 0.8.1 | 2026-11-25 | implemented | #8 | base pack.css: non-text, non-spacer, non-filler children of HStack/toolbar/labelled rows keep min-width: min-content; text and control labels overflow-wrap: break-word; message bubble wraps, at fit the message is >= 300px so the 75% bubble holds its text; IT-16 row geometry at fit and in a 320-point phone frame, MessageBubble 40-word and one-word | [Rendering](../narrative/architecture/render.md), [Testing](../narrative/testing.md) |
