---
id: A-WEB-5.CR-1
target: A-WEB-5
kind: revision
version: 0.14.2
date: 2026-11-28
issue: 87
summary: "as built (#87): the editor, outline and gallery schedule renders through the shared RenderScheduler (typescript/src/elements/scheduler.ts)"
from: d520a63fd2a5
to: bb5539a5b8f8
---

## Clauses

@ P1 edit
~ provides: the custom elements `mockitdown-designer`, `mockitdown-canvas`, `mockitdown-editor`, `mockitdown-outline`, `mockitdown-gallery`, `mockitdown-inspector`, `mockitdown-code` and `mockitdown-diagnostics` (`typescript/src/elements/`), defined by the package entry, {+the editor, the outline and the gallery scheduling their renders through the shared `RenderScheduler` (`typescript/src/elements/scheduler.ts`), +}and the test pages `pages/editor.html` and `pages/designer.html`

## Files

```diff
--- a/prose.md
+++ b/prose.md
@@ -3 +3,6 @@
 test pages.
+
+The editor, the outline and the gallery, like `mockitdown-mockup`, schedule their renders through one
+`RenderScheduler`: changes coalesce into one render per microtask, a render overtaken by a newer change is
+dropped, and `rendered` resolves once the element is up to date. `renderFailure` gives the editor and the
+mockup the same `cannot render: …` diagnostic.
```
