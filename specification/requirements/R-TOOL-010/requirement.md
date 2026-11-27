---
id: R-TOOL-010
title: "The diagnostics list: mockitdown-diagnostics"
status: active
version: 0.10.3
rev: 1
page: WEB.4
slot: reqs
order: 10
hash: 959fafc4b278
source: [SRC-12, SRC-13]
realizes: [F-19]
requires: [R-TOOL-009]
constrained_by: [A-WEB-5]
refs: [F-19, R-TOOL-008]
---

C1: The package MUST define the custom element `mockitdown-diagnostics`, which lists the active mockup's diagnostics in order, each with its severity, message, line and column, and shows "No problems" when there are none.
C2: Activating an entry by click or Enter MUST select the innermost view node whose span holds the diagnostic's location, else reveal the location in the code view (R-TOOL-008.C1).
C3: The list MUST update on every `diagnostics` notification of its session.
C4: In the composite designer, activating the status bar's diagnostic count MUST open the list, and Esc MUST close it.
V1: Activating a diagnostic about an unknown argument selects the element that carries the argument (F-19.AC7).
