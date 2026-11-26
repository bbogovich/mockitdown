---
id: F-18.CR-3
target: F-18
kind: additive
version: 0.8.0
date: 2026-11-26
summary: "show source on each design example (SRC-11): C11, AC9, UC-3"
from: c0294cd2fcfc
to: 11557e161429
---

## Clauses

@ meta.source
- [SRC-8, SRC-9, SRC-10]
+ [SRC-8, SRC-9, SRC-10, SRC-11]
@ C11 insert after C10
+ Each design example offers a show-source option that reveals the mockitdown source of that example, as it would be written to reproduce it in the selected pack, so that a reader can see how the example is constructed and copy it.
@ AC9 insert after AC8
+ From any design example a reader can reveal its source in one step, see the exact source and attributes that produce the example in the selected pack, copy it, and hide it again without the example changing.

## Files

```diff
--- a/prose.md
+++ b/prose.md
@@ -9 +9,5 @@
 **Tabs and complex examples (SRC-10).** A pack has around a hundred element cards; the examples sat below all of them. Elements and examples now have their own tabs, and the examples grow to complex application layouts.
+
+**Show source (SRC-11).** Each design example can reveal the source that builds it — the pattern
+file wrapped in the `mockitdown-mockup` tag with the attributes the gallery passes for the selected
+pack — so a reader learns the vocabulary from working layouts and can copy one as a starting point.
--- /dev/null
+++ b/usecases/UC-3.md
@@ -0,0 +1,16 @@
+---
+id: UC-3
+title: Learn how a design example is built
+---
+
+**Actor:** developer or designer writing their own mockup.
+
+**Precondition:** the pack gallery is open on a pack's Examples tab.
+
+1. The reader chooses an example (for example the mail client) and selects its Show source button.
+2. The gallery shows, under the example, the source that produces it in the selected pack.
+3. The reader copies the source, or reads how the regions are composed.
+4. The reader selects the button again; the source is hidden.
+
+**Outcome:** the reader has the exact source of the example as rendered in that pack, and the example
+itself did not change while they looked.
```
