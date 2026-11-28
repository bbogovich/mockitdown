---
id: F-18.CR-9
target: F-18
kind: clarification
version: 0.12.0
date: 2026-11-27
issue: 80
summary: "Definition audit (#80): AC7 viewport named; UC-5 and AC13 for the easter-egg packs"
from: 067ca2b9abd8
to: 0b058ce1fb39
---

## Clauses

@ AC7 edit
~ Opening a pack's Examples tab {+in a 1280 by 720 pixel viewport (Playwright's Desktop Chrome, the viewport of the gallery browser tests) +}shows its first design example{+ in view+} without scrolling, and a link can open a pack directly on that tab.
@ AC13 insert after AC12
+ A reader who opens the gallery's home page and scrolls to its easter-egg section finds one link per easter-egg pack, labelled with the pack's name; following one opens the gallery on that pack's elements and examples, while no pack list names it. (UC-5)

## Files

```diff
--- /dev/null
+++ b/usecases/UC-5.md
@@ -0,0 +1,14 @@
+---
+id: UC-5
+title: Find the hidden easter-egg packs
+---
+
+**Actor:** curious reader of the published documentation or the gallery.
+
+**Precondition:** the reader has seen the pack lists, which show no science-fiction pack.
+
+1. The reader follows a hidden page of the documentation site, or the easter-egg section at the bottom of the gallery's home page.
+2. The page links each easter-egg pack (F-3.C9) by name.
+3. The reader follows a link; the pack gallery opens on that pack's elements and examples.
+
+**Outcome:** the reader sees the hidden pack rendered as any other pack, although the side panel and the pack lists never name it.
```
