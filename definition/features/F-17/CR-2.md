---
id: F-17.CR-2
target: F-17
kind: additive
version: 0.10.0
date: 2026-11-27
summary: "SRC-18: release builds of the TypeScript library on GitHub releases: C7, AC6"
from: cd1139598f60
to: 656547104525
---

## Clauses

@ meta.source
- [SRC-8]
+ [SRC-8, SRC-18]
@ C7 insert after AC5
+ Each release of the TypeScript variant is also published on the project's GitHub releases page as the packaged library (the NPM package archive), so that a project can install a released build without a package registry.
@ AC6 insert after C7
+ A project installs the library from the archive attached to a GitHub release and renders a `mockitdown-mockup` with it.

## Files

```diff
--- a/prose.md
+++ b/prose.md
@@ -13 +13,5 @@
 **Re-checked at definition 0.9.1.** F-16.CR-1 adds role rules and typed parameters as shared data that only the design tools read; embedding a mockup in a web page is unchanged.
+
+**Release builds on GitHub (SRC-18#gallery).** A web project needs a released build to depend on.
+Each TypeScript release is attached to a GitHub release as the archive `npm pack` makes, which `npm
+install` accepts by its URL; the gallery's home page links to it.
```
