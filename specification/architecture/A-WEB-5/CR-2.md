---
id: A-WEB-5.CR-2
target: A-WEB-5
kind: revision
version: 0.14.3
date: 2026-11-28
issue: 89
summary: "as built (#89): the canvas, editor, outline, gallery, inspector and diagnostics join their design session through the shared SessionLink (typescript/src/elements/session-link.ts)"
from: bb5539a5b8f8
to: a0986faf8a81
---

## Clauses

@ P1 edit
~ provides: the custom elements `mockitdown-designer`, `mockitdown-canvas`, `mockitdown-editor`, `mockitdown-outline`, `mockitdown-gallery`, `mockitdown-inspector`, `mockitdown-code` and `mockitdown-diagnostics` (`typescript/src/elements/`), defined by the package entry, the editor, the outline and the gallery scheduling their renders through the shared `RenderScheduler` (`typescript/src/elements/scheduler.ts`), {+the canvas, the editor, the outline, the gallery, the inspector and the diagnostics list joining their design session through the shared `SessionLink` (`typescript/src/elements/session-link.ts`), +}and the test pages `pages/editor.html` and `pages/designer.html`

## Files

```diff
--- a/prose.md
+++ b/prose.md
@@ -8 +8,7 @@
 mockup the same `cannot render: …` diagnostic.
+
+The canvas, the editor, the outline, the gallery, the inspector and the diagnostics list find their
+session in one place, `SessionLink` with `findDesignerSession`: the nearest enclosing designer's session
+(walking parents and out of shadow roots), else the one the host set, else one of their own. The link
+holds the subscription and dispatches the session's events from the element while the session is its
+own; each element keeps its own notification handling and what it resets when the session changes.
```
