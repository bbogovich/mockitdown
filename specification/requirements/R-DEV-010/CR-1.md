---
id: R-DEV-010.CR-1
target: R-DEV-010
kind: revision
version: 0.8.8
date: 2026-11-25
summary: "C6: iPadOS 26 floating glass sidebar (review of #12)"
from: 2c39ae92cfbe
to: 0bb0547bf4e4
---

## Clauses

@ C6 insert after C5
+ With `ipados` chrome, a `NavigationSplitView`'s sidebar MUST be drawn as the iPadOS 26 floating sidebar: an inset, rounded Liquid Glass panel over the detail's background, with the sidebar's title and rows inside it and a sidebar toggle button in the toolbar.

## Files

```diff
--- a/TC-1.md
+++ b/TC-1.md
@@ -6,2 +6,2 @@
 
-Python and TypeScript render tests: the V1 source at phone, tablet and desktop; assert `data-chrome` ios/ipados/macos, the floating sidebar markup at desktop and the collapsed stack at phone; browser screenshot reviewed manually (TC-M1).
+Python and TypeScript render tests: the V1 source at phone, tablet and desktop; assert `data-chrome` ios/ipados/macos, the floating sidebar at desktop and tablet (C6) and the collapsed stack at phone; browser screenshot reviewed manually (TC-M1).
```
