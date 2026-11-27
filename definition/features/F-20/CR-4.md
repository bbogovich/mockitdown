---
id: F-20.CR-4
target: F-20
kind: clarification
version: 0.10.0
date: 2026-11-27
summary: "SRC-18: C6 and C10 are deliberate constraints: N1"
from: f3f1faa9b401
to: b4c38df160b8
---

## Clauses

@ meta.source
- [SRC-8, SRC-12, SRC-15]
+ [SRC-8, SRC-12, SRC-15, SRC-18]
@ N1 insert after AC7
+ C6 (one JSON file, `.mkdesign`) and C10 (one module of the mockitdown package, no browser needed) are deliberate constraints of the product, not implementation hints: they keep an implementer from adding a database, a second format or a framework for a document that tools must read without the designer (SRC-18#answers).

## Files

```diff
--- a/prose.md
+++ b/prose.md
@@ -14 +14,4 @@
 **Re-checked at definition 0.9.2.** The F-17 clarification changed no obligation; this feature is unaffected.
+
+**Deliberate constraints (SRC-18#answers).** The format and the place of the module are fixed on
+purpose, so that SpecItOut tools and a desktop shell can rely on one readable file and one small module.
```
