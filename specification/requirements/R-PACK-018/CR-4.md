---
id: R-PACK-018.CR-4
target: R-PACK-018
kind: editorial
version: 0.12.5
date: 2026-11-27
issue: 55
summary: "prose: the as-built paragraph counts the four partials (#55)"
from: c80734dd337f
to: a1b408652edb
---

## Clauses

(none)

## Files

```diff
--- a/prose.md
+++ b/prose.md
@@ -25,6 +25,6 @@
 
-**As built (#55).** Three partials hold rules two packs share: `mac-1bit.css` (lisa and mac-classic: the
+**As built (#55).** Four partials hold rules two packs share: `mac-1bit.css` (lisa and mac-classic: the
 whole common stylesheet), `material3.css` (android and angular-material: the text button and its state
-layer) and `win-button.css` (winxp and vista: the push button); `crt.css` (nls and phosphor) holds the
-layer the tube's scan lines are painted on. No rule was common to every pack, so `base` is unchanged.
+layer), `win-button.css` (winxp and vista: the push button) and `crt.css` (nls and phosphor: the layer
+the tube's scan lines are painted on). No rule was common to every pack, so `base` is unchanged.
 Where the two packs of `mac-1bit.css` name the same window or icon differently (`finder` and `folder`,
```
