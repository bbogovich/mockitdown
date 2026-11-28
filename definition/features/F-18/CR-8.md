---
id: F-18.CR-8
target: F-18
kind: clarification
version: 0.11.1
date: 2026-11-27
issue: 80
summary: "definition audit (#80): Gallery tab sits next to User guide; AC11 makes C14 observable; UC-2 and UC-4 follow the Examples tab and home page"
from: 6032b703b34d
to: 067ca2b9abd8
---

## Clauses

@ C13 edit
~ The documentation site and the example site each have a Gallery header tab, next to [-Demo,-]{+the User guide tab (F-14.C5),+} that opens the published gallery.
@ AC11 edit
~ Opening the published gallery's address shows the home page, [-from-]{+which+} [-which-]{+states what the gallery is for, that every mockup in it is rendered in the browser by the TypeScript renderer, how to use the TypeScript library in a project, and a link to its release builds;+} one link opens the pack gallery and one link per easter-egg pack opens that pack's elements.

## Files

```diff
--- a/usecases/UC-2.md
+++ b/usecases/UC-2.md
@@ -8,3 +8,3 @@
 1. The reviewer opens the pack gallery and selects SwiftUI.
-2. The reviewer scrolls past the element cards to the examples.
+2. The reviewer selects the pack's Examples tab.
 
--- a/usecases/UC-4.md
+++ b/usecases/UC-4.md
@@ -8,4 +8,4 @@
 1. The reader selects the Gallery header tab.
-2. The published pack gallery opens on its first pack.
-3. The reader selects another pack and its Examples tab.
+2. The published gallery opens on its home page.
+3. The reader follows the link to the pack gallery, selects a pack and its Examples tab.
 
```
