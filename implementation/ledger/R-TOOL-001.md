---
requirement: R-TOOL-001
title: "The editable view: mockitdown-editor"
status: implemented
version: 0.13.4
date: 2026-11-28
issue: 25
---

# R-TOOL-001 — The editable view: mockitdown-editor

<!-- written by `vio-docs ledger record`; never edit -->

| Version | Date | Status | Issue | Change in the code | Pages |
|---|---|---|---|---|---|
| 0.13.4 | 2026-11-28 | implemented | #25 | typescript/src/elements/editor.ts: EditorElement (mockitdown-editor) renders the mockup named by its mockup attribute, else the active one, with edit: true and mockupOptions through the shared renderWithImports/showInShadow helpers of mockup.ts (import-base, asset-base); joins the enclosing designer's session, else the host's session property, else its own over its script child and fence attributes; click, second click/Esc, Enter, Alt-click and derived badge mapped through session.nodeFor; hover tag 'Button · W × H'; outlines in a pointer-events:none overlay coloured by --mkd-selection-color/--mkd-hover-color, parts overlay/selection/hover/tag/badge/view; src/elements/define.ts registers both elements; pages/editor.html; editor.spec.mjs (TC-1 to TC-3), IT-53 | [The editor element](../narrative/architecture/editor.md), [Testing](../narrative/testing.md) |
