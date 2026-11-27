---
id: R-WEB-002.CR-8
target: R-WEB-002
kind: revision
version: 0.12.0
date: 2026-11-27
summary: "SRC-19: import map replaces import_paths; library names and qualified references; page library blocks; templates with slots; User guide"
from: 90d4ca52c640
to: 774eff62d1ee
---

## Clauses

@ C3 edit
~ The mockup element MUST accept the fence attributes of R-MDX-003 as HTML attributes with the same names and meanings (`pack`, `device`, `appearance`, `chrome`, `title`, `id`, `url`, `width`, `height`, `caption`, `elements`, `source`, `window` and `windowed`, which the fence also [-accepts),-]{+accepts, but not `library`, R-IMP-008.C8),+} plus `import-base` and `asset-base` (URLs, default: the document's base [-URL).-]{+URL); `import-base` is the base against which the import map's relative targets resolve, and the root target when the map has no empty key.+}
@ C14 insert after C13
+ The mockup element MUST take the document's import map from the first `<script type="mockitdown-imports">` element in the document, whose text is a JSON object of the form of R-IMP-002.C7 and C8, and MUST apply its `imports` attribute, a JSON object of the same form, on top of it for that element, its keys replacing the document's.
@ C15 insert after C14
+ If the document's import map or an `imports` attribute is not valid JSON of that form, then the mockup element MUST report the error "invalid import map: <reason>" with code `import` and render with the map ignored.

## Files

```diff
--- /dev/null
+++ b/TC-5.md
@@ -0,0 +1,7 @@
+---
+id: TC-5
+title: Document import map and imports attribute
+verifies: [C3, C14, C15]
+---
+
+Browser test (Chromium) serving `typescript/tests/fixtures/`: a page with `<script type="mockitdown-imports">{"acme/": "libs/acme/"}</script>` and `import-base="/fixtures/"` renders a mockup importing `acme/cards` from `/fixtures/libs/acme/cards.mockitdown` (C3, C14); an element with `imports='{"acme/": "other/"}'` loads from `other/` (C14); a map holding `{"acme/": 3}` shows the error of C15 and the mockup still renders its other content.
```
