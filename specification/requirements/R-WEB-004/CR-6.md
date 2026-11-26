---
id: R-WEB-004.CR-6
target: R-WEB-004
kind: revision
version: 0.9.0
date: 2026-11-26
summary: "show source on each example (SRC-11): C21-C26, TC-8"
from: f0f9ce1532cf
to: b42b06e4f3a7
---

## Clauses

@ meta.source
- [SRC-8, SRC-9, SRC-10]
+ [SRC-8, SRC-9, SRC-10, SRC-11]
@ C21 insert after C20
+ Each example of the Examples tab MUST have a Show source toggle button, with `aria-expanded` and `aria-controls`, that shows or hides a source block below the example's mockup; the source block MUST be hidden by default and the button's label MUST read Hide source while it is shown.
@ C22 insert after C21
+ The source block MUST show the snippet that reproduces the example in the selected pack: a `<mockitdown-mockup>` opening tag carrying `pack` and every attribute the gallery passes from the index entry (C14), in the order `pack`, `device`, `chrome`, `menubar`, `app`, `windowed`, then a `<script type="text/mockitdown">` child (R-WEB-002) holding the pattern file's text unchanged (its indentation and line breaks kept, without a trailing newline), then the closing tags; the gallery-only attributes `caption`, `label` and `appearance` MUST NOT appear.
@ C23 insert after C22
+ The source block MUST be monospaced, keep its line breaks, scroll horizontally rather than wrap, and follow the page's light or dark appearance.
@ C24 insert after C23
+ The source block MUST have a Copy button that writes the snippet to the clipboard and announces Copied through a polite live region; where the clipboard is unavailable it MUST select the snippet's text instead.
@ C25 insert after C24
+ Showing or hiding an example's source MUST NOT re-create, re-render or resize that example's mockup.
@ C26 insert after C25
+ `window.packGallery` MUST offer `source(patternId)`, which resolves with the snippet of C22 for that example in the selected pack, or `null` when the selected pack does not show that example.

## Files

```diff
--- /dev/null
+++ b/TC-8.md
@@ -0,0 +1,26 @@
+---
+id: TC-8
+title: Show source on every example
+verifies: [C21, C22, C23, C24, C25, C26]
+---
+
+Browser test (Chromium, `gallery.spec.mjs`), for the `base` pack (core patterns) and for `swiftui`
+(including the Mac example with `device`, `chrome`, `menubar` and `app`):
+
+1. On the Examples tab every `.pattern` has one Show source button with `aria-expanded="false"`, and its
+   source block is hidden.
+2. Activating the button of each example sets `aria-expanded="true"`, the label to Hide source, and shows
+   the block; the block's text equals `packGallery.source(id)`, which equals the expected snippet built
+   from `shared/patterns/index.json` and the pattern file (C22 attribute order, file text unchanged, no
+   `caption`, `label` or `appearance`).
+3. The example's `mockitdown-mockup` is the same element before and after, its `rendered` event does not
+   fire again and its bounding box is unchanged (C25).
+4. The block's computed `white-space` keeps line breaks and its `overflow-x` scrolls; its colours differ
+   between light and dark appearance (C23).
+5. With a stubbed clipboard, Copy writes exactly the snippet and the live region reads Copied; with the
+   clipboard removed, Copy selects the block's text (C24).
+6. Activating the button again hides the block and restores `aria-expanded="false"`.
+7. `packGallery.source(id)` resolves `null` for a swiftui-only example while `base` is selected (C26).
+
+A unit test of the snippet builder (pure function, both a core and a pack-specific entry) runs under
+`npm test` without a browser.
--- a/prose.md
+++ b/prose.md
@@ -26 +26,8 @@
 onto a phone.
+
+**Show source (SRC-11).** Every example has a Show source button. The block it opens is the snippet a
+reader would paste into a page to get the same example in the same pack: the `mockitdown-mockup` tag
+with `pack` (and, for the platform examples, `device`, `chrome`, `menubar`, `app`, `windowed`) around a
+`<script type="text/mockitdown">` child holding the pattern file verbatim. Attributes that only serve the
+gallery (`caption`, `label`, `appearance`) are left out. The block has a Copy button and scrolls sideways
+for long lines; opening it never re-renders the example.
```
