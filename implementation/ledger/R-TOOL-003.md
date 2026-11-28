---
requirement: R-TOOL-003
title: The composite designer and its test page
status: implemented
version: 0.13.18
date: 2026-11-28
issue: 39
---

# R-TOOL-003 — The composite designer and its test page

<!-- written by `vio-docs ledger record`; never edit -->

| Version | Date | Status | Issue | Change in the code | Pages |
|---|---|---|---|---|---|
| 0.13.18 | 2026-11-28 | implemented | #39 | Code mode's code view editable, joined by CodeSync (C15) | [The designer element](../narrative/architecture/designer.md) |
| 0.13.17 | 2026-11-28 | implemented | #38 | Code mode shows the active mockup's code and diagnostics in a read-only mockitdown-code (C15) | [The designer element](../narrative/architecture/designer.md), [The code view element](../narrative/architecture/code-view.md) |
| 0.13.8 | 2026-11-28 | implemented | #29 | the gallery panel holds mockitdown-gallery, joined on open, given import-base and awaited by rendered (C16) | [The designer element](../narrative/architecture/designer.md) |
| 0.13.6 | 2026-11-28 | implemented | #27 | typescript/src/elements/designer.ts: mockitdown-designer owns a DesignSession (a new one per open) that its outline and editor join; toolbar (Design/Preview/Code radio group, Outline and Properties toggles, mockup name, pack and device), 240 px left column (outline over a gallery placeholder), view, 260 px properties placeholder, status bar (diagnostic count, breadcrumb of crumb buttons); resizable (drag, arrow keys, 120-640 px) and collapsible panels, layout property; slots toolbar/outline/gallery/view/inspector/status, slotted elements given the session; open(json)/document/toJSON() with DesignOpenError; mode attribute (unknown = design), Preview with mockitdown-mockup per mockup, mockups list and Light/Dark/Both toggle, Code mode read-only code; Delete/Backspace in the outline or view through session.delete(); dispatches the session's events once each. pages/designer.html with designer-sample.mkdesign; designer.spec.mjs (TC-1, TC-2), IT-55 | [The designer element](../narrative/architecture/designer.md), [Design documents and the design session](../narrative/architecture/design.md), [Testing](../narrative/testing.md) |
