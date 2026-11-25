---
id: ADR-19.CR-1
target: ADR-19
kind: clarification
version: 0.6.7
date: 2026-11-25
issue: 7
summary: "reviewed against R-WEB-002@0.6.6 (#7): D1 reads the first script child and ignores other children, as R-WEB-002.C2 was built"
from: 5899be2d08c6
to: f7119ea29521
---

## Clauses

@ D1 edit
~ A `mockitdown-mockup` element takes its code from [-its only child, -]a `<script type="text/mockitdown">` [-element,-]{+child,+} whose text the HTML parser leaves [-untouched.-]{+untouched; the first such child counts and other children are ignored (R-WEB-002.C2).+}

## Files

(none)
