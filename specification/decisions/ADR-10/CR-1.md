---
id: ADR-10.CR-1
target: ADR-10
kind: revision
version: 0.12.1
date: 2026-11-27
summary: "SRC-19: D2 follows ADR-24 — import map instead of import_paths, precedence within a library, qualified names across libraries"
from: 49b1b23588dc
to: a0c6825717f2
---

## Clauses

@ D2 edit
~ Paths resolve against the importing file's directory, then [-`import_paths`;-]{+through the import map (ADR-24, which replaced `import_paths`);+} `.mockitdown` may be omitted; cycles are ignored; {+within one library +}later definitions replace earlier [-ones-]{+ones, across libraries a qualified name selects one (R-IMP-007),+} and block-local ones replace imported ones.

## Files

(none)
