---
id: M-OPT-1.CR-2
target: M-OPT-1
kind: revision
version: 0.12.0
date: 2026-11-27
summary: "SRC-19: import map replaces import_paths; library names and qualified references; page library blocks; templates with slots; User guide"
from: 6394afa635d7
to: 34498b699462
---

## Clauses

@ F15 replace
- import_paths: list — import directories
+ imports: map — import map, key → path, URL or list of them (R-IMP-002.C7, C8)
@ F23 insert after F22
+ libraries: map — the page's library blocks, name → source (R-IMP-008.C9)

## Files

(none)
