---
id: R-WEB-007.CR-3
target: R-WEB-007
kind: correction
version: 0.12.15
date: 2026-11-27
issue: 63
summary: "as built (#63): C6 release notes list the commits since the previous ts-v tag that change typescript/ or shared/"
from: 8bdda81a0868
to: 73c1301bc270
---

## Clauses

@ C6 edit
~ The release notes MUST give the install command `npm install https://github.com/bbogovich/mockitdown/releases/download/ts-vX.Y.Z/mockitdown-X.Y.Z.tgz` and list the commits since the previous `ts-v` [-tag.-]{+tag (every earlier commit for the first release) that change `typescript/` or `shared/`.+}

## Files

```diff
--- a/prose.md
+++ b/prose.md
@@ -5,2 +5,5 @@
 projects can use it; F-17.C7. Why its own tags and no npm registry: ADR-23.
+
+**As built (#63).** The notes list only the commits that change `typescript/` or `shared/`, since the
+repository's other commits (the Python variant, its tools and site) do not change the archive.
 
```
