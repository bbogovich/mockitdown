---
id: ADR-17.CR-3
target: ADR-17
kind: revision
version: 0.11.0
date: 2026-11-27
summary: "SRC-18: D2 names the stylesheet partials, the role rule table and the edit corpus as shared assets (audit question 4)"
from: 3ed3bb89f5aa
to: 0964d92fab81
---

## Clauses

@ meta.source
- [SRC-8]
+ [SRC-8, SRC-18]
@ D2 edit
~ `shared/` is the only place a pack definition, pack stylesheet, {+stylesheet partial (`shared/packs/_partials/`), +}page stylesheet, icon glyph, modifier vocabulary, {+role rule table (`shared/language/roles.json`), +}reference sample, design [-pattern or-]{+pattern,+} conformance case{+ or edit corpus case (`shared/conformance/edit/`)+} is written; each variant's build copies what it [-publishes.-]{+publishes, resolving a pack stylesheet's partials as it copies it (R-PACK-018).+}

## Files

```diff
--- a/prose.md
+++ b/prose.md
@@ -5 +5,4 @@
 Re-checked at 0.10.3 together with the items it cites or is cited by (specification audit, #51): the citations are still accurate and no obligation changed.
+**Shared assets named (SRC-18#answers, question 4).** D2 now names the role rule table and the edit
+corpus, which the audit found written only in `shared/` but missing from the list, and the stylesheet
+partials of R-PACK-018. A partial is published only inside the pack stylesheets that include it.
```
