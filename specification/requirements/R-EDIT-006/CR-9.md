---
id: R-EDIT-006.CR-9
target: R-EDIT-006
kind: revision
version: 0.13.23
date: 2026-11-28
issue: 44
summary: "as built (#44): change notifications gain the kind sections, with an empty mockup and code (C5)"
from: 25af62cee292
to: 81413be2474f
---

## Clauses

@ C5 edit
~ The detail of a notification MUST be: `select` `{mockup, nodes}`; `hover` `{mockup, node}`; `change` `{kind, mockup, edits, code}` with `kind` one of `code`, `options`, [-`move`-]{+`move`, `mockups`+} and [-`mockups`-]{+`sections` (R-TOOL-014.C8, whose `mockup` and `code` are empty)+} and `edits` the text edits (M-EDIT-3, empty unless `kind` is `code`); `insert` `{mockup, node, element}`; `rename` `{from, to}`; `active` `{mockup}`; `diagnostics` `{mockup, diagnostics}`.

## Files

(none)
