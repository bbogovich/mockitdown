---
id: R-MDX-003.CR-2
target: R-MDX-003
kind: correction
version: 0.12.10
date: 2026-11-27
issue: 59
summary: "as built: C1 lists window, menubar, app (text) and windowed (boolean); TC-2 verifies C1-C5 (#59)"
from: ec9f0fd6c76d
to: c8acf9a03b8b
---

## Clauses

@ C1 edit
~ The fence MUST accept these attributes, with these types: `pack`, `device`, `appearance`, `chrome`, `title`, `id`, `url`, [-`library`-]{+`library`, `window`, `menubar`, `app`+} (text); `width`, `height` (integer); `caption`, `elements`, [-`source`-]{+`source`, `windowed`+} (boolean).

## Files

```diff
--- /dev/null
+++ b/TC-2.md
@@ -0,0 +1,14 @@
+---
+id: TC-2
+title: Typed attributes, booleans, the validator and fence errors
+verifies: [C1, C2, C3, C4, C5]
+---
+
+Python unit tests `python/tests/test_markdown_ext.py` `FenceAttributeTests`: `FENCE_OPTIONS` holds exactly the attributes and types of C1 but
+`library` (TC-1), and a fence giving all of them renders without a fence error and applies them (C1, V1); `1`,
+`true`, `yes`, `on` in any case turn `elements` on and `0`, `false`, `no`, `off`, `nope` and an empty value leave it
+off (C2); the validator accepts unknown attributes and the block still renders as a mockup, not a code listing (C3);
+`devise="phone"`, `width="wide"` and `appearance="dim"` each log one `fence` error naming the attribute, render an
+error box above the figure and ignore the attribute (C4, V1); fence `pack`, `device` and `title` override
+`default_pack`, `default_device` and `@Screen`'s pack, device and title, and `@Screen` overrides the site's
+`default_device` (C5).
```
