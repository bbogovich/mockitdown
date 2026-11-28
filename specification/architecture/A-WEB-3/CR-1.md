---
id: A-WEB-3.CR-1
target: A-WEB-3
kind: revision
version: 0.14.1
date: 2026-11-28
issue: 86
summary: "as built (#86): the gallery pages share the page chrome stylesheet typescript/pages/chrome.css"
from: 45e68f24a657
to: 1991c87a9d67
---

## Clauses

@ P1 edit
~ provides: the development server `typescript/scripts/serve.mjs`, the test pages under `typescript/pages/` {+(the gallery home page and the pack gallery share the page chrome stylesheet `typescript/pages/chrome.css`: colour tokens, light and dark, and the top bar) +}and the browser tests under `typescript/tests/browser/`

## Files

```diff
--- a/prose.md
+++ b/prose.md
@@ -1 +1,4 @@
 Development and test only; none of it is part of the published package.
+
+The gallery pages load `chrome.css` before their own stylesheet (`index.css`, `packs.css`), which keeps only
+what differs: the body's font size, the pack gallery's `--stage` and `--side`, and each page's layout.
```
