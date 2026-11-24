---
id: R-MDX-004.CR-1
target: R-MDX-004
kind: clarification
version: 0.2.1
date: 2026-11-24
summary: "As built: the implementation now matches the clauses; known-deviation note removed"
from: e1239fa37444
to: 512edd1be53b
---

## Clauses

(none)

## Files

```diff
--- a/prose.md
+++ b/prose.md
@@ -4,7 +4,5 @@
 
-**Known deviation (Zensical).** Under Zensical 0.1.3 the `<style>` element prepended by the
-postprocessor does not survive: the CSS is missing from the built page and its text leaks into the
-page title, the navigation and every heading id (verified 2026-11-24 on this site and on the example
-site). Until the delivery is fixed, Zensical sites use `css: none` with the stylesheet from
-`mockitdown css` linked through `extra_css`, as this site does. C1 still states the intended
-behaviour.
+Hosts may call `convert()` more than once per page — Zensical converts heading fragments in nested
+calls while the page is being converted, and reuses the Markdown instance without `reset()` — so
+the stylesheet is emitted only by the conversion whose output contains the page's figures, which
+then consumes the collected packs.
```
