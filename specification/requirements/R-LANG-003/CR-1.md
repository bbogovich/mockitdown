---
id: R-LANG-003.CR-1
target: R-LANG-003
kind: revision
version: 0.12.0
date: 2026-11-27
summary: "SRC-19: import map replaces import_paths; library names and qualified references; page library blocks; templates with slots; User guide"
from: 8db3ab62a2e7
to: 0c4ed733d1ab
---

## Clauses

@ C8 insert after C7
+ The parser MUST parse `import "path" as Name`, `Name` an identifier, as a file import with the alias `Name`.
@ C9 insert after C8
+ If `as` follows a module import, then the parser MUST raise the syntax error "only a file import can be renamed with `as`".

## Files

```diff
--- /dev/null
+++ b/TC-2.md
@@ -0,0 +1,7 @@
+---
+id: TC-2
+title: File import aliases
+verifies: [C8, C9]
+---
+
+`import "acme/cards" as Acme` parses as a file import with alias `Acme` (C8); `import SwiftUI as S` raises the syntax error of C9; `import "x" as 3` is a syntax error. Automated in the parser tests of both variants.
```
