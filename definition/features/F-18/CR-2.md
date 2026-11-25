---
id: F-18.CR-2
target: F-18
kind: additive
version: 0.7.0
date: 2026-11-25
summary: "SRC-10: Elements and Examples tabs; complex layout examples"
from: 93353cdfb8ad
to: c0294cd2fcfc
---

## Clauses

@ meta.source
- [SRC-8, SRC-9]
+ [SRC-8, SRC-9, SRC-10]
@ C9 insert after C5
+ The selected pack's content is split into tabs — its elements and its design examples — so that the examples are reached in one step, without scrolling past every element.
@ C10 insert after C9
+ The design examples include complex application layouts beyond single forms: multi-pane workspaces, dashboards with navigation, boards, messaging, commerce and scheduling screens.
@ AC7 insert after AC6
+ Opening a pack's Examples tab shows its first design example without scrolling, and a link can open a pack directly on that tab.
@ AC8 insert after AC7
+ The design examples number at least twelve, at least six of them complex multi-region layouts.

## Files

```diff
--- a/prose.md
+++ b/prose.md
@@ -7 +7,3 @@
 so each is seen whole; multi-platform packs show an example application per platform.
+
+**Tabs and complex examples (SRC-10).** A pack has around a hundred element cards; the examples sat below all of them. Elements and examples now have their own tabs, and the examples grow to complex application layouts.
```
