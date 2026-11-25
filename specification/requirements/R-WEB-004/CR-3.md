---
id: R-WEB-004.CR-3
target: R-WEB-004
kind: revision
version: 0.8.0
date: 2026-11-25
summary: "SRC-10: tabs with fragment state, packGallery.tab, six complex layout patterns, in-tab index"
from: 936cdee17681
to: a23dbc0ef5c5
---

## Clauses

@ meta.source
- [SRC-8, SRC-9]
+ [SRC-8, SRC-9, SRC-10]
@ C16 insert after C15
+ The main area MUST show the selected pack's facts above two tabs, Elements and Examples, with exactly one tab's content shown; Elements (the element cards and the name filter) MUST be the default.
@ C17 insert after C16
+ The selected tab MUST be reflected in the fragment as `#pack=<id>&tab=elements|examples`, kept when another pack is selected, and restored on reload; an unknown tab MUST select Elements.
@ C18 insert after C17
+ `window.packGallery` MUST also offer `tab(name)`, which selects a tab and resolves when its content is shown; `renderAll()` MUST render both tabs' mockups.
@ C19 insert after C18
+ `shared/patterns/` MUST hold, in addition to the six patterns of C3, at least these complex layouts in the core vocabulary: a three-pane mail client (folder sidebar, message list, reading pane), an admin console (sidebar navigation, header with search and avatar, KPI cards, chart and table), a kanban board (columns of cards), a chat application (conversation list, message thread with bubbles, composer), a product page (gallery, details, options, purchase panel, reviews) and a calendar or scheduler (week grid with events and a side panel).
@ C20 insert after C19
+ The Examples tab MUST list the examples in the order of `shared/patterns/index.json`, with an in-tab index linking to each example.

## Files

```diff
--- /dev/null
+++ b/TC-6.md
@@ -0,0 +1,7 @@
+---
+id: TC-6
+title: Elements and Examples tabs
+verifies: [C16, C17, C18, C20]
+---
+
+`gallery.spec.mjs`: default tab Elements; `#pack=carbon&tab=examples` opens Examples with the first example in the viewport and no element card visible; switching pack keeps the tab; the index links scroll to each example; `packGallery.tab()` resolves.
--- /dev/null
+++ b/TC-7.md
@@ -0,0 +1,7 @@
+---
+id: TC-7
+title: Complex layout examples render everywhere
+verifies: [C19]
+---
+
+`patterns.test.ts` and `test_patterns.py`: each of the twelve core patterns renders in every shipped pack without an error diagnostic; the gallery geometry checks (TC-4) apply to them at their device size.
--- a/prose.md
+++ b/prose.md
@@ -19 +19,3 @@
 **Natural size and per-platform examples (SRC-9).** Cards scroll sideways rather than squeeze their mockups (SRC-9#scroll); multi-platform packs add example applications per platform; the browser tests check geometry, not only the absence of diagnostics.
+
+**Tabs (SRC-10).** Elements and examples are separate tabs so the examples are one click away; six complex layouts join the six simple patterns.
```
