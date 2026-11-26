---
id: R-CLI-002.CR-1
target: R-CLI-002
kind: revision
version: 0.8.9
date: 2026-11-25
issue: 13
summary: "as built: --windowed (R-DEV-010.C4) (#13)"
from: 4678a1b46fa2
to: c4a8e004131e
---

## Clauses

@ C1 edit
~ `render` and `check` MUST accept `--pack`, `--default-pack` (default `base`), `--device`, `--appearance` (one of the four), `--width`, `--height`, `--chrome`, `--title`, {+`--windowed`, +}`--elements`, `-I/--import-path` (repeatable), `-A/--asset-path` (repeatable), `-P/--pack-path` (repeatable) and `--no-embed`, with the meaning of the corresponding render option.

## Files

(none)
