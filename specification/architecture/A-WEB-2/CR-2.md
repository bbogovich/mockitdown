---
id: A-WEB-2.CR-2
target: A-WEB-2
kind: revision
version: 0.6.6
date: 2026-11-25
issue: 6
summary: "as built (#6): MockupElement and defineElements in the package entry; K3 imports fetched from the import base by re-rendering until none is missing; K4 one constructed stylesheet per pack set; K5 appearance selectors rewritten for the shadow root; K6 coalesced renders, overtaken renders discarded"
from: b60b34a91794
to: ce2de008569c
---

## Clauses

@ P1 edit
~ provides: the custom element `mockitdown-mockup` [-(`typescript/src/elements/mockup.ts`)-]{+(`MockupElement`, `typescript/src/elements/mockup.ts`)+} and the package entry `dist/mockitdown.js`, which defines it{+ with `defineElements()` where the host has `customElements` and exports `MockupElement`, `ELEMENT_TAGS`, `scriptCode` and `shadowCss`+}
@ K3 insert after K2
+ The mockup element MUST resolve `import "path"` by rendering, fetching every candidate path the core asked for and did not have from the import base URL, and rendering again until the core asks for nothing new; fetched files MUST be cached by URL for the page, and a failed fetch MUST count as not found.
@ K4 insert after K3
+ The mockup elements MUST share one constructed `CSSStyleSheet` per pack set through `adoptedStyleSheets`, and MUST fall back to a `<style>` element in the shadow root where constructed sheets are missing.
@ K5 insert after K4
+ The mockup element MUST rewrite the stylesheet's page-scoped appearance selectors (`body:not([data-md-color-scheme])` to `:host`, `[data-md-color-scheme="slate"]` to `:host-context(…)`) so that appearance `auto` follows the page from inside a shadow root.
@ K6 insert after K5
+ The mockup element MUST coalesce the changes made in one task into one render and MUST discard a render that a newer change overtook while it awaited assets or imports.

## Files

```diff
--- a/prose.md
+++ b/prose.md
@@ -6 +6,10 @@
 (`typescript/pages/core.html`). It resolves to the manifest.
+
+The element (`src/elements/mockup.ts`) keeps the core synchronous: it awaits the shared assets once
+(`loadAssetsFromUrl()`, unless a page already loaded them), then renders. The core resolves
+`import "path"` through a synchronous resolver, so the element answers from a per-page cache of
+fetched files and records what the core asked for and did not find; it fetches those URLs (relative to
+`import-base`) and renders again, until a render asks for nothing new — nested imports take one more
+round per level. Every element shares one constructed stylesheet per pack set; the token rules that
+look at the page's `body` are rewritten to `:host` so that `appearance="auto"` still follows the
+browser's colour scheme inside the shadow root.
```
