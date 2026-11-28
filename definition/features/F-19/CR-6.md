---
id: F-19.CR-6
target: F-19
kind: revision
version: 0.14.0
date: 2026-11-28
issue: "#85"
summary: "SRC-21 answers (#85, #88, #90): the sapui5 ObjectPageLayout holds its header and AnchorBar; copies named <name>-copy; New Section and Delete Section"
from: 1c1afcecb69a
to: 4d5304b49847
---

## Clauses

@ meta.source
- [SRC-8, SRC-12, SRC-13]
+ [SRC-8, SRC-12, SRC-13, SRC-21]
@ C23 insert after AC10
+ A duplicated element's identifier is its original's followed by `-copy`, numbered when that is taken, and the designer renames it afterwards.
@ AC11 insert after C23
+ Duplicating an element whose identifier is `ok` gives a copy whose identifier is `ok-copy`, and a second duplicate of the original gives `ok-copy-2`.

## Files

```diff
--- a/prose.md
+++ b/prose.md
@@ -21 +21,4 @@
 **Re-checked at 0.10.0.** Its cited items F-17 changed with SRC-18 (all packs recorded, stylesheet partials, gallery home page and easter eggs, TypeScript release builds, new packs); no obligation of this item changed.
+
+**Names of copies (SRC-21#answers).** A duplicate is named plainly after what it copies, `ok-copy`, so
+that the designer can see it is a copy and rename it; the tools do not try to guess a better name.
```
