---
id: F-14.CR-3
target: F-14
kind: revision
version: 0.11.0
date: 2026-11-27
summary: Demo becomes User guide; Installation page for Python and TypeScript; every term the guide uses is defined (developer prompt 2026-11-27)
from: 75c742dc0838
to: 86c6e89c24fe
---

## Clauses

@ meta.title
- Example site as demo and end-to-end test
+ Example site as user guide and end-to-end test
@ C5 edit
~ The published documentation has a tab bar in its header with six sections — [-Demo-]{+User guide+} (the example site), Gallery (the pack gallery, F-18), Definition, Specification, Implementation and Reference — each with its own navigation menu.
@ C8 insert after C7
+ The User guide starts with an Installation page covering the Python package and the TypeScript web components: how to install each, and how to build a documentation page with embedded mockups — chiefly a Zensical or MkDocs site with the Python extension, and a plain HTML page with the web components.
@ C9 insert after C8
+ Every option, attribute, file or term the User guide uses is defined where it is first used or links to the page that defines it; in particular the guide says where the import map is configured for each integration.
@ AC5 insert after AC4
+ The header tab and the example site's top section are named User guide, and its first page after the home page is Installation. (UC-2)
@ AC6 insert after AC5
+ Following the Installation page literally in a fresh environment produces a site page and an HTML page that each show a rendered mockup. (UC-2)
@ AC7 insert after AC6
+ The custom-components page shows the import map configuration, a library block used by a later block, qualified references to two libraries, and a template with slots.

## Files

```diff
--- a/prose.md
+++ b/prose.md
@@ -3,3 +3,3 @@
 
-**Change.** `examples/site` is both the demo and the end-to-end fixture: one page per pack, a
+**Change.** `examples/site` is both the user guide and the end-to-end fixture: an Installation page, one page per pack, a
 language tour and a custom-components page, all checked by the test suite.
--- /dev/null
+++ b/usecases/UC-2.md
@@ -0,0 +1,13 @@
+---
+id: UC-2
+title: Add mockups to an existing documentation site
+---
+
+**Actor:** developer maintaining a Zensical or MkDocs site (or a plain web page).
+
+1. The developer opens the User guide's Installation page.
+2. The developer installs the Python package with its Markdown extra (or the web components), adds
+   the configuration shown, writes a `mockitdown` block and builds the site.
+
+**Outcome:** the built page shows the rendered mockup; the developer knows where each option,
+including the import map, is configured.
```
