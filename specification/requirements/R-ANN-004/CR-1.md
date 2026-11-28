---
id: R-ANN-004.CR-1
target: R-ANN-004
kind: clarification
version: 0.12.7
date: 2026-11-27
issue: 56
summary: "test cases backfilled: every C clause verified by a TC naming its tests (#56)"
from: 0ea118cfccaf
to: 4cdd9b314c97
---

## Clauses

(none)

## Files

```diff
--- /dev/null
+++ b/TC-1.md
@@ -0,0 +1,12 @@
+---
+id: TC-1
+title: Callout references in prose
+verifies: [C1, C2, C3]
+---
+
+Python unit tests `python/tests/test_annotations.py` `CalloutReferenceTests`, through Python-Markdown
+with the `mockitdown` extension: `Enter the name (#1).` holds `<span class="mkd-ref">1</span>` (V1);
+`(#12)` and `(#A)` become circles, while `(#123)`, `(#a)`, `(#AB)`, `(# 1)` and a bare `#1` do not;
+with `callout_refs: false` nothing is converted (C1). `(#2 <colour>)` for each of the ten colours gives
+`data-color="<colour>"`, which `page.css` styles, and `(#2 magenta)` is not converted (C2).
+`Go to [the field](#1) and (#2).` keeps the link `<a href="#1">` and converts only `(#2)` (C3).
```
