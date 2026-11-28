---
requirement: R-EDIT-009
title: "Commands: wrap, unwrap, convert and extract component"
status: implemented
version: 0.14.0
date: 2026-11-28
issue: 90
---

# R-EDIT-009 — Commands: wrap, unwrap, convert and extract component

<!-- written by `vio-docs ledger record`; never edit -->

| Version | Date | Status | Issue | Change in the code | Pages |
|---|---|---|---|---|---|
| 0.14.0 | 2026-11-28 | implemented | #90 | commands lists eighteen commands, New Section and Delete Section before Undo; run takes {name} and {section} (C8) | [Commands on the selection](../narrative/architecture/commands.md), [Testing](../narrative/testing.md) |
| 0.13.16 | 2026-11-28 | implemented | #43 | session.commands and run gain newMockup, duplicateMockup and deleteMockup ({mockup} argument) | [Commands on the selection](../narrative/architecture/commands.md), [The active mockup and the mockup commands](../narrative/architecture/mockups.md) |
| 0.13.16 | 2026-11-28 | implemented | #37 | DesignSession.wrap, unwrap, convert, extractComponent planned as edit operations (and a text step for the struct) and applied as one step each through applyOps, refused with the role rule's sentence or the reason; commands (13 entries with label, shortcut, enabled) and run(name, args); roles.labelUnderstood shared with the evaluator; the designer binds Cmd/Ctrl+G and Shift+Cmd/Ctrl+G; restructure.test.ts and commands.spec.mjs (IT-65) | [Commands on the selection](../narrative/architecture/commands.md), [Design documents and the design session](../narrative/architecture/design.md), [The designer element](../narrative/architecture/designer.md), [Testing](../narrative/testing.md) |
