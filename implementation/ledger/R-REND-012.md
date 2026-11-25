---
requirement: R-REND-012
title: Charts
status: implemented
version: 0.8.3
date: 2026-11-25
issue: 9
---

# R-REND-012 — Charts

<!-- written by `sio-docs ledger record`; never edit -->

| Version | Date | Status | Issue | Change in the code | Pages |
|---|---|---|---|---|---|
| 0.8.3 | 2026-11-25 | implemented | #9 | charts.py/charts.ts: scatter, bubble, heatmap and candlestick derive marks from values and series (_value_points, _value_matrix, _value_candles); bubble radius 17*sqrt(size/max); has_data and _empty (axes, pie/donut outline, sparkline baseline, frame); r_chart warns '<Element> has no data' (code chart); IT-17, conformance chart-* cases | [Rendering](../narrative/architecture/render.md), [Testing](../narrative/testing.md), [Conformance corpus](../narrative/conformance.md) |
