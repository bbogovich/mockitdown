---
id: R-EDIT-008.CR-7
target: R-EDIT-008
kind: correction
version: 0.14.4
date: 2026-11-28
issue: 88
summary: "as built (#88): TC-2's Cmd/Ctrl+D duplicate of the card names the button's copy open-copy (C2), not open-2"
from: cb17bfd671c2
to: 363796a254bd
---

## Clauses

(none)

## Files

```diff
--- a/TC-2.md
+++ b/TC-2.md
@@ -13,3 +13,3 @@
 test (`python/tests/test_clipboard.py`) renders that text in a `mockitdown` fence with no diagnostic
-(F-19.AC10). Cmd/Ctrl+D duplicates the card (`open-2`), Cmd/Ctrl+X cuts it and Cmd/Ctrl+V pastes it
+(F-19.AC10). Cmd/Ctrl+D duplicates the card (`open-copy`), Cmd/Ctrl+X cuts it and Cmd/Ctrl+V pastes it
 after the ForEach, Alt+Down and Alt+Up move the title below the list and back, each against hand-written
```
