---
id: R-TOOL-003.CR-9
target: R-TOOL-003
kind: correction
version: 0.13.19
date: 2026-11-28
issue: 40
summary: "as built (#40): the status bar's diagnostic count is a button opening the diagnostics list (C12)"
from: f76e71788193
to: a03c73e77c8c
---

## Clauses

@ C12 edit
~ The status bar MUST show the active mockup's diagnostic count (`0 diagnostics`, `1 [-diagnostic`)-]{+diagnostic`), as a button opening the diagnostics list (R-TOOL-010.C4),+} and a breadcrumb of the element names on the path from the top-level view node to the first selected node, each crumb a button selecting its node when activated.

## Files

(none)
