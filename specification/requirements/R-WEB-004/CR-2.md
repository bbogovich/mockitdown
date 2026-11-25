---
id: R-WEB-004.CR-2
target: R-WEB-004
kind: revision
version: 0.7.0
date: 2026-11-25
summary: "SRC-9: natural-size cards that scroll, pack-specific examples (SwiftUI phone/tablet/desktop), geometry checks"
from: dc46923cf79e
to: 936cdee17681
---

## Clauses

@ meta.source
- [SRC-8]
+ [SRC-8, SRC-9]
@ C13 insert after C12
+ Each element card MUST show its sample and its variants sample at their natural `fit` size (R-DEV-008.C1); a mockup wider than its card MUST scroll horizontally within the card rather than be squeezed or scaled.
@ C14 insert after C13
+ An entry of `shared/patterns/index.json` MAY carry `packs` (pack ids; the pattern is shown only for those packs and MAY import their module), `device`, `chrome`, `menubar` and `app`; for `swiftui` the gallery MUST show at least an iPhone app (TabView with a NavigationStack list and detail), an iPad app (three-column NavigationSplitView) and a Mac app (NavigationSplitView with toolbar, `.commands` and `menubar` naming an open menu).
@ C15 insert after C14
+ The browser tests MUST fail, for any pack, when two captioned variant cells of an element card intersect, when a `fit` frame is narrower than its content's scroll width, or when a presentation surface of an element sample is smaller than 200 × 80 points (a toast: than its text).

## Files

```diff
--- /dev/null
+++ b/TC-4.md
@@ -0,0 +1,7 @@
+---
+id: TC-4
+title: Variants seen whole
+verifies: [C13, C15]
+---
+
+`gallery.spec.mjs`: for every pack, after `renderAll()`, no two variant cells intersect, every `fit` frame's width ≥ its scrollWidth, a card whose mockup is wider than the card scrolls (scrollWidth > clientWidth), presentation surfaces meet the minimum size.
--- /dev/null
+++ b/TC-5.md
@@ -0,0 +1,7 @@
+---
+id: TC-5
+title: SwiftUI per-platform examples
+verifies: [C14]
+---
+
+`gallery.spec.mjs`: at `#pack=swiftui` the examples include patterns with device phone, tablet and desktop, the desktop one showing a menu bar with an open menu; patterns with `packs` are not shown for other packs; `patterns.test.ts` and `test_patterns.py` render each pack-specific pattern in its packs without an error diagnostic.
--- a/prose.md
+++ b/prose.md
@@ -18 +18,2 @@
 
+**Natural size and per-platform examples (SRC-9).** Cards scroll sideways rather than squeeze their mockups (SRC-9#scroll); multi-platform packs add example applications per platform; the browser tests check geometry, not only the absence of diagnostics.
```
