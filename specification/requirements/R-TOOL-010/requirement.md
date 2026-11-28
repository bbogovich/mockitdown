---
id: R-TOOL-010
title: "The diagnostics list: mockitdown-diagnostics"
status: active
version: 0.13.19
rev: 5
page: WEB.4
slot: reqs
order: 10
hash: 142113b67c1a
source: [SRC-12, SRC-13]
realizes: [F-19]
requires: [R-TOOL-009]
constrained_by: [A-WEB-5]
refs: [A-WEB-5, F-19, R-TOOL-008, R-TOOL-009]
---

C1: The package MUST define the custom element `mockitdown-diagnostics`, which lists the active mockup's diagnostics in the session's order, each as a button (part `entry`, with `data-severity`) holding its severity, message and `line:col` (parts `severity`, `message`, `location`), and shows "No problems" (part `empty`) when there are none.
C2: Activating an entry by click or Enter MUST select the innermost view node whose span holds the diagnostic's location, else reveal the location in the code view (R-TOOL-008.C1).
C3: The list MUST update on every `diagnostics` notification of its session.
C4: In the composite designer, activating the status bar's diagnostic count MUST open the list, and Esc MUST close it.
C5: When no node holds an entry's location, which is the case while the code does not parse, the list MUST dispatch `mockitdown-reveal` (bubbling, composed, `detail: {mockup, range}`, the location as an empty range of the mockup's code) instead of selecting.
C6: The composite designer MUST reveal a `mockitdown-reveal` range of its active mockup in its code view, staying in Design mode while the code view is docked (R-TOOL-009.C8) and switching to Code mode otherwise.
C7: A diagnostic located in an imported file, or with no line, MUST be listed and MUST lead nowhere when activated.
C8: The rules of C1, C2, C5 and C7 MUST be held by `mockitdown/design` (`diagnosticEntries`, `diagnosticTarget`, `activateDiagnostic`, `diagnosticOffset`, A-WEB-5.K2), which reads a location's column in code points, as the lexer counts it.
C9: The designer's diagnostic count MUST be the button of part `diagnostics`, its `aria-expanded` true while the list is open; the list MUST stand above the status bar in the part `problems`, its open state the designer's `diagnosticsOpen` property, and opening it MUST focus its first entry.
V1: Activating a diagnostic about an unknown argument selects the element that carries the argument (F-19.AC7).
