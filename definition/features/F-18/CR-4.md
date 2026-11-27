---
id: F-18.CR-4
target: F-18
kind: additive
version: 0.9.0
date: 2026-11-26
summary: "gallery published on GitHub Pages with a Gallery header tab (SRC-17): C12, C13, AC10, UC-4 (ING-1)"
from: 11557e161429
to: 76e8cedfd5ec
---

## Clauses

@ meta.source
- [SRC-8, SRC-9, SRC-10, SRC-11]
+ [SRC-8, SRC-9, SRC-10, SRC-11, SRC-17]
@ C12 insert after AC9
+ The pack gallery is published with the documentation on the project's public site, at an address of its own, and works there as it does on the development server.
@ C13 insert after C12
+ The documentation site and the example site each have a Gallery header tab, next to Demo, that opens the published gallery.
@ AC10 insert after C13
+ After the documentation is published, the gallery's public address shows every pack with its elements and examples, without a failed request, and the Gallery tab of both sites opens it.

## Files

```diff
--- a/prose.md
+++ b/prose.md
@@ -13 +13,5 @@
 pack — so a reader learns the vocabulary from working layouts and can copy one as a starting point.
+
+**Published (SRC-17).** The gallery was reachable only through the development server, so a reader of
+the published documentation could not find it. It is now published beside the documentation and the
+demo site, with a Gallery header tab on both sites.
--- /dev/null
+++ b/usecases/UC-4.md
@@ -0,0 +1,12 @@
+---
+id: UC-4
+title: Open the gallery from the published documentation
+---
+
+**Actor:** reader of the published documentation or the demo site.
+
+1. The reader selects the Gallery header tab.
+2. The published pack gallery opens on its first pack.
+3. The reader selects another pack and its Examples tab.
+
+**Outcome:** the reader sees every pack's elements and examples without installing anything or running a server.
```
