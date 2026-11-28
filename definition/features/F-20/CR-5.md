---
id: F-20.CR-5
target: F-20
kind: revision
version: 0.14.0
date: 2026-11-28
issue: "#85"
summary: "SRC-21 answers (#85, #88, #90): the sapui5 ObjectPageLayout holds its header and AnchorBar; copies named <name>-copy; New Section and Delete Section"
from: b4c38df160b8
to: c14efe1a49ef
---

## Clauses

@ meta.source
- [SRC-8, SRC-12, SRC-15, SRC-18]
+ [SRC-8, SRC-12, SRC-15, SRC-18, SRC-21]
@ C11 insert after AC7
+ A duplicated mockup is named after its original followed by `-copy`, numbered when that is taken, and the designer renames it afterwards.
@ C12 insert after C11
+ Sections can be added and deleted on the canvas; deleting a section leaves its mockups where they are.
@ AC8 insert after C12
+ A section added around a mockup and then deleted leaves the canvas as it was, and each step can be undone.
@ AC9 insert after AC8
+ Duplicating a mockup named `Inbox` gives `Inbox-copy`, and duplicating `Inbox` again gives `Inbox-copy-2`.

## Files

```diff
--- a/prose.md
+++ b/prose.md
@@ -17 +17,5 @@
 purpose, so that SpecItOut tools and a desktop shell can rely on one readable file and one small module.
+
+**Copies and sections (SRC-21#answers).** A duplicated mockup is named `<name>-copy` for the designer
+to rename, as a duplicated element is (F-19.C23). Sections are created and removed on the canvas
+itself; removing one never moves or removes the mockups it enclosed.
```
