---
title: "Editing core"
spec_version: 0.10.0
status: draft
updated: 2026-11-26
page_id: WEB.3
---

# Editing core

What the TypeScript core offers the design tools (F-21, F-19, F-20; SRC-12#s9, SRC-12#s13): a syntax
tree that keeps every node's position and gives each view node an identity, structural edits that
return minimal text changes, a rendering made for editing that ties each element to its node, the
design document module and the design session with its history and commands.

The code is the source of truth. Every visual edit is an edit to the code — an insertion, removal or
replacement of a text span — and is never a regeneration of the mockup from a model, so the author's
formatting, comments, `let` bindings, `ForEach` loops and `if` conditions survive. The edit API exists
in TypeScript only; its printing rules are kept as language-neutral cases in `shared/conformance/edit/`
(ADR-21). The rendering made for editing exists in both variants and is held to the conformance corpus
like any other rendering (ADR-22).

The project has no design tier: these requirements and those of the design-tool pages cite the
features F-19, F-20 and F-21 and the sources SRC-12 to SRC-15 directly; the screen mockups SRC-13 to
SRC-15 are illustrations, not design items.

<!-- slot: reqs -->

## Revision history

| Version | Date | Change |
|---|---|---|
| 0.10.0 | 2026-11-26 | Page created (ING-1) |
