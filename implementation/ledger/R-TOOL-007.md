---
requirement: R-TOOL-007
title: "The inspector: mockitdown-inspector"
status: implemented
version: 0.13.18
date: 2026-11-28
issue: 39
---

# R-TOOL-007 — The inspector: mockitdown-inspector

<!-- written by `vio-docs ledger record`; never edit -->

| Version | Date | Status | Issue | Change in the code | Pages |
|---|---|---|---|---|---|
| 0.13.18 | 2026-11-28 | implemented | #39 | Edit in code (C11): Inspection.editInCode, the edit-in-code button dispatching mockitdown-edit-in-code; the designer switches to Code mode and reveals the span | [The inspector element](../narrative/architecture/inspector.md), [Two-way editing](../narrative/architecture/two-way-editing.md) |
| 0.13.14 | 2026-11-28 | implemented | #35 | mockitdown-inspector over the model in mockitdown/design (inspect, setField, removeField, addArgument, addModifier, removeModifier, setOption): Arguments, Variant and state, Modifiers, Identity from parameterTypes/modifierTypes; typed controls with a code fallback; 150 ms debounce or blur, coalesced <node>:<field>; refusals by control, edit API and added diagnostics at the node, aria-invalid with the reason; '<n> selected'; Mockup tab of options; .frame sizes min 0; the designer's properties panel. C11 (Edit in code) waits for R-TOOL-008 | [The inspector element](../narrative/architecture/inspector.md), [The designer element](../narrative/architecture/designer.md), [Design documents and the design session](../narrative/architecture/design.md), [Testing](../narrative/testing.md) |
