---
id: R-PACK-012.CR-4
target: R-PACK-012
kind: revision
version: 0.10.0
date: 2026-11-26
summary: "six header tabs with Gallery next to Demo (SRC-17): C6, TC-1 (ING-1)"
from: 72d3b99df04b
to: 00e0e51e4672
---

## Clauses

@ meta.source
- [SRC-6, SRC-7]
+ [SRC-6, SRC-7, SRC-17]
@ C6 edit
~ Both published sites (documentation and example site) MUST enable header tabs and list the same [-five-]{+six+} top-level sections in the order Demo,{+ Gallery,+} Definition, Specification, Implementation, Reference; a section built [-by-]{+elsewhere (by+} the other [-site-]{+site, or the pack gallery at `/gallery/`, R-WEB-004.C27)+} is a link to its published URL.

## Files

```diff
--- /dev/null
+++ b/TC-1.md
@@ -0,0 +1,11 @@
+---
+id: TC-1
+title: Header tabs of both sites
+verifies: [C6, C8]
+---
+
+Python test (`test_site_nav.py`): the top-level `nav` entries of `python/examples/site/mkdocs.yml` are
+Demo, Gallery, Definition, Specification, Implementation and Reference in that order, Gallery being the
+absolute URL `https://bbogovich.github.io/mockitdown/gallery/`, with `navigation.tabs` and
+`navigation.tabs.sticky` enabled. The published-site test of the Pages workflow (R-WEB-004.TC-9, step 5)
+checks the same six tabs, in order, in the built pages of both sites.
--- a/prose.md
+++ b/prose.md
@@ -7 +7,4 @@
 lives in the example site because it is generated from code and needs every pack's CSS.
+
+The pack gallery of the web components (R-WEB-004) is published beside them at `/gallery/` and has its
+own header tab, Gallery, next to Demo on both sites (SRC-17).
```
