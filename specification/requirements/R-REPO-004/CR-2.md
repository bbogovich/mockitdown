---
id: R-REPO-004.CR-2
target: R-REPO-004
kind: revision
version: 0.8.9
date: 2026-11-25
issue: 13
summary: "as built: conformance cases may set windowed (#13)"
from: 592cab1e5347
to: 56dbe1447901
---

## Clauses

@ C6 edit
~ Each `<name>.json` MUST be a JSON object holding only render options — `pack`, `default_pack`, `device`, `default_device`, `appearance`, `default_appearance`, `chrome`, `title`, `id`, `window`, `url` (strings), `width`, `height` (integers), `caption`, `elements`, `source`, [-`show_warnings`-]{+`show_warnings`, `windowed`+} (booleans) — with every absent key taking its default.

## Files

(none)
