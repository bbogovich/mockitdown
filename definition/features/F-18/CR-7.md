---
id: F-18.CR-7
target: F-18
kind: additive
version: 0.10.0
date: 2026-11-27
summary: "SRC-18: gallery home page, easter eggs reachable but not listed, Node HTTP module a deliberate constraint: C14, C15, N1, AC11, AC12"
from: a9742bf1f771
to: 6032b703b34d
---

## Clauses

@ meta.source
- [SRC-8, SRC-9, SRC-10, SRC-11, SRC-17]
+ [SRC-8, SRC-9, SRC-10, SRC-11, SRC-17, SRC-18]
@ C14 insert after AC10
+ The published gallery opens on a home page that says what the gallery is for, that every mockup in it is rendered in the browser by the TypeScript renderer, and briefly how to use the TypeScript library in a project, with a link to its release builds (F-17.C7).
@ C15 insert after C14
+ The easter-egg packs (F-3.C9) can be shown in the gallery by their address, but the side panel does not list them; the home page links to the gallery view of each of them.
@ N1 insert after C15
+ C4 and AC4 deliberately name Node's own HTTP module: they keep an implementer from adding a web-server framework the gallery does not need (SRC-18#answers). They are product constraints, not implementation hints to drop.
@ AC11 insert after N1
+ Opening the published gallery's address shows the home page, from which one link opens the pack gallery and one link per easter-egg pack opens that pack's elements.
@ AC12 insert after AC11
+ No easter-egg pack appears in the side panel, and opening the gallery at an easter-egg pack's address shows that pack's elements and examples without a diagnostic.

## Files

```diff
--- a/prose.md
+++ b/prose.md
@@ -19 +19,9 @@
 **Re-checked at definition 0.9.2.** The F-17 clarification changed no obligation; this feature is unaffected.
+
+**A home page and the easter eggs (SRC-18#gallery).** The gallery's address now opens a short home
+page: what the gallery is for, that it renders with the TypeScript web component, how to use the library
+in a project, and — near its end — links into the gallery for each science-fiction easter egg. The eggs
+stay out of the side panel.
+
+**Deliberate constraints (SRC-18#answers).** The development server is built on Node's own HTTP module on
+purpose: naming it keeps an implementing agent from importing a web framework for a static file server.
```
