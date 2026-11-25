---
id: R-DEV-008.CR-1
target: R-DEV-008
kind: revision
version: 0.8.1
date: 2026-11-25
issue: 8
summary: "as built (#8): toast at least its text's width, natural width unless the pack sets one (C6, C10); open menus and pickers in flow at fit (C7); fit dialog at least 240 x 80 (C8); sheet reaches the frame's sides and bottom (C9); V1 exempts packs whose own Alert is the framework's inline banner (antd, bootstrap, mui, shadcn)"
from: ceb46ab4717b
to: fd80e22c90b7
---

## Clauses

@ C6 edit
~ A toast MUST be drawn at{+ least as wide as+} its text's natural width (up to the frame's width) and at least one line tall.
@ C7 insert after C6
+ At device `fit`, an open menu or picker written directly in the screen or in a vertical stack MUST lay out its popup in flow, so that the frame holds it.
@ C8 insert after C7
+ At device `fit`, a dialog surface MUST be at least 240 points wide and 80 points tall.
@ C9 insert after C8
+ At device `fit`, a sheet MUST reach the frame's sides and bottom.
@ C10 insert after C9
+ A toast in a pack that sets no toast width MUST be drawn at its text's natural width; a pack MAY keep its framework's minimum or fixed toast width.
@ V1 edit
~ In every shipped [-pack,-]{+pack whose `Alert` presents a dialog (a pack's own `Alert` that is its framework's inline banner, as in antd, bootstrap, mui and shadcn, is an `alert` role and exempt),+} `Alert("Title") { Text("Content"); Button("Action") }` at `fit` renders a dialog at least 200 × 80 points containing the title and the action; a `fit` HStack of eight `Toggle("Label")` in a 300-pixel host keeps its natural width and the host scrolls.

## Files

```diff
--- a/TC-1.md
+++ b/TC-1.md
@@ -3,5 +3,5 @@
 title: Fit frames keep their width and hold presentations
-verifies: [C1, C2, C3, C6]
+verifies: [C1, C2, C3, C6, C7, C8, C9, C10]
 ---
 
-Python and TypeScript: render `Alert`, `Dialog`, `Sheet`, `Popover`, `Toast`, `Tooltip` and `ConfirmationDialog` alone at `fit` in every shipped pack; browser test (Playwright) asserts the surface box is at least 200 × 80 (toast: at least its text width) and inside the frame. A `fit` mockup of eight captioned toggles in a 300 px wide host: frame width equals its scroll width, the cell's scrollWidth exceeds its clientWidth.
+Python and TypeScript: render `Alert`, `Dialog`, `Sheet`, `Popover`, `Toast`, `Tooltip` and `ConfirmationDialog` alone at `fit` in every shipped pack; browser test (Playwright) asserts the surface box is at least 200 × 80 (toast: at least its text width) and inside the frame. A `fit` mockup of eight captioned toggles in a 300 px wide host: frame width equals its scroll width, the cell's scrollWidth exceeds its clientWidth. Every element sample and variant of the gallery (R-WEB-004 TC-4) is checked the same way, open menus and pickers included. (`python/tests/test_fit.py`, `typescript/tests/browser/gallery.spec.mjs`.)
--- a/prose.md
+++ b/prose.md
@@ -6 +6,12 @@
 page column is narrower, the reader scrolls sideways instead of seeing a squeezed picture.
+
+**As built.** At `fit` the screen that holds a presentation layer becomes a one-column grid: its
+content takes the first rows and every layer spans all of them, so the grid — and the frame — is as
+large as the larger of the two. The layer is not positioned there, which makes the screen the scrim's
+containing block, so the scrim covers the whole screen. A sheet bleeds over the fit screen's padding
+(the `--mkd-fit-padding` token, 16 points unless a pack sets it) to reach the frame's edges. A
+tooltip's bubble is laid out beside its anchor in a small grid at `fit` (above it for `top`, below for
+`bottom`, after it for `trailing`); elsewhere it stays positioned over the content. The arrow is an
+element of the bubble (`mkd-tooltip__arrow`); a pack that draws its own (`::after`) hides it. Toasts
+keep a pack's framework width where it has one (Material snackbars' 288 or 344 points, Bootstrap's
+350) — never narrower than the text.
```
