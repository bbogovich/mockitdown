---
id: R-WEB-004.CR-8
target: R-WEB-004
kind: clarification
version: 0.10.1
date: 2026-11-26
issue: 17
summary: "as built: Copy falls back to selecting the snippet also when the clipboard refuses the write (C24) (#17)"
from: 152e6443330b
to: abb4cf5070bf
---

## Clauses

@ C24 edit
~ The source block MUST have a Copy button that writes the snippet to the clipboard and announces Copied through a polite live region; where the clipboard is unavailable {+or refuses the write +}it MUST select the snippet's text instead.

## Files

```diff
--- a/prose.md
+++ b/prose.md
@@ -32,3 +32,4 @@
 gallery (`caption`, `label`, `appearance`) are left out. The block has a Copy button and scrolls sideways
-for long lines; opening it never re-renders the example.
+for long lines; opening it never re-renders the example. A Copy the browser refuses (no permission,
+an insecure page) falls back to selecting the text, as a missing clipboard does.
 
```
