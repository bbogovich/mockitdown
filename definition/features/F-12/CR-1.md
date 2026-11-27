---
id: F-12.CR-1
target: F-12
kind: additive
version: 0.9.0
date: 2026-11-26
summary: "unknown labelled arguments are warned: C6, AC4, AC5 (ING-1)"
from: a8e4b882df54
to: 2dc6c0fccd67
---

## Clauses

@ meta.source
- [SRC-3]
+ [SRC-3, SRC-12]
@ C6 insert after AC3
+ A labelled argument that the called element does not understand is reported as a warning naming the element and the label, instead of being dropped silently; both variants report it alike.
@ AC4 insert after C6
+ `Text("Hi", colour: .red)` produces a warning naming `Text` and `colour` in both variants, and the text still renders.
@ AC5 insert after AC4
+ The shipped design patterns, the element samples and the example site render without such a warning.

## Files

```diff
--- a/prose.md
+++ b/prose.md
@@ -4 +4,5 @@
 page shows the errors; the log lists everything; strict mode turns errors into a failed build.
+
+**Unknown labelled arguments (SRC-12#s13).** A misspelt or unsupported label used to vanish without a
+trace, so an author could not tell why an argument had no effect, and an editor could not show it as
+"not understood by this pack". It is now a warning.
```
