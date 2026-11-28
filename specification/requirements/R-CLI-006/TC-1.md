---
id: TC-1
title: packs and elements
verifies: [C1, C2, C3, C4, C5]
---

Python unit tests `python/tests/test_cli.py` `PacksAndElementsTests`: `packs` prints one line per pack
that is not hidden, in registry order, the Fluent line holding its name, element count and
`import <modules>`; `--json` has the same packs with exactly the eight keys of C1 and Fluent's counts,
modules and own elements; the hidden packs appear only with `--all` (C1). `elements fluent` lists every
element sorted by name with its role and parameters, and `--own` only the pack's own (C2, C5).
`--markdown` prints the five-column header, `InfoBar` with role `alert` and `VStack` marked `*(core)*`;
`base` marks nothing core (C3, V1). A site pack from `-P` is listed by `packs --json` and by `elements`,
its notes' `|` printed as `/` (C3, C4).
