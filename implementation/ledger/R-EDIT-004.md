---
requirement: R-EDIT-004
title: Edit-mode rendering
status: implemented
version: 0.12.12
date: 2026-11-28
issue: 23
---

# R-EDIT-004 — Edit-mode rendering

<!-- written by `vio-docs ledger record`; never edit -->

| Version | Date | Status | Issue | Change in the code | Pages |
|---|---|---|---|---|---|
| 0.12.12 | 2026-11-28 | implemented | #23 | The edit render option in both variants: RenderOptions.edit (default false; not a fence option or CLI flag); view nodes numbered from source positions (TypeScript viewNodeOrdinals in tree.ts, Python mockitdown.syntax.nodes.view_nodes, equal on all 867 corpus sources); the evaluators set View.node and View.derived (Env.derived: innermost ForEach, if or struct call; closures derived where written; imported struct views derived only); Renderer.open and the unknown role write data-mkd-node then data-mkd-derived after data-el; 11 edit-* conformance cases | [Editing core](../narrative/architecture/editing.md), [Conformance corpus](../narrative/conformance.md), [Testing](../narrative/testing.md) |
