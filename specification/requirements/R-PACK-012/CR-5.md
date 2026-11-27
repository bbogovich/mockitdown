---
id: R-PACK-012.CR-5
target: R-PACK-012
kind: revision
version: 0.12.0
date: 2026-11-27
summary: "SRC-19: import map replaces import_paths; library names and qualified references; page library blocks; templates with slots; User guide"
from: 00e0e51e4672
to: d3213e1b9602
---

## Clauses

@ C6 edit
~ Both published sites (documentation and example site) MUST enable header tabs and list the same six top-level sections in the order [-Demo,-]{+User guide,+} Gallery, Definition, Specification, Implementation, Reference; a section built elsewhere (by the other site, or the pack gallery at `/gallery/`, R-WEB-004.C27) is a link to its published URL.
@ C7 edit
~ The site root MUST redirect to the [-Demo-]{+User+} [-section.-]{+guide section, which stays published at `/demos/`.+}

## Files

```diff
--- a/TC-1.md
+++ b/TC-1.md
@@ -7,3 +7,3 @@
 Python test (`test_site_nav.py`): the top-level `nav` entries of `python/examples/site/mkdocs.yml` are
-Demo, Gallery, Definition, Specification, Implementation and Reference in that order, Gallery being the
+User guide, Gallery, Definition, Specification, Implementation and Reference in that order, Gallery being the
 absolute URL `https://bbogovich.github.io/mockitdown/gallery/`, with `navigation.tabs` and
--- a/prose.md
+++ b/prose.md
@@ -9,2 +9,2 @@
 The pack gallery of the web components (R-WEB-004) is published beside them at `/gallery/` and has its
-own header tab, Gallery, next to Demo on both sites (SRC-17).
+own header tab, Gallery, next to the User guide (formerly Demo) on both sites (SRC-17, SRC-19).
```
