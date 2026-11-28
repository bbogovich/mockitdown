---
id: R-EVAL-005.CR-2
target: R-EVAL-005
kind: revision
version: 0.13.0
date: 2026-11-27
issue: "#84"
summary: "components may not embed themselves (#84, SRC-20): F-4.C11/AC9; R-EVAL-005.C10 cycle detection replaces the depth limit for recursion, C11 depth backstop, TC-3"
from: 58e40b599dcf
to: d6426b00ade9
---

## Clauses

@ C10 replace
- If struct instantiation nests 48 levels deep, then the evaluator MUST report "struct S nests too deeply (recursive?)" with code `recursion` and produce no views.
+ Before instantiating a struct, the evaluator MUST decide from the declarations whether the struct can reach itself through the struct names its body, computed properties and property defaults call, directly or through other structs (block-local or imported), counting branches that do not run; if it can, then the evaluator MUST report "struct S uses itself (S → T → S)" with code `recursion`, naming the cycle, once per struct per screen, and MUST produce no views for that use, without expanding it.
@ C11 insert after C10
+ If struct instantiation of structs that do not reach themselves nests 48 levels deep, then the evaluator MUST report "struct S nests too deeply" with code `recursion` and produce no views.
@ V1 edit
~ `struct Pill: View { var text: String; var color: Color = .green; var body: some View { … } }` called as `Pill(text: "On")` binds `color` to `.green`; `Pill()` reports the missing `text`; a [-struct-]{+`struct+} [-that-]{+Row`+} [-instantiates-]{+whose body is `VStack { Row(); Row() }` reports one `recursion` error "struct Row uses+} itself [-stops-]{+(Row → Row)"+} at [-depth-]{+once,+} [-48-]{+without+} [-with-]{+expanding+} [-a `recursion` error.-]{+it.+}

## Files

```diff
--- /dev/null
+++ b/TC-3.md
@@ -0,0 +1,14 @@
+---
+id: TC-3
+title: Self-embedding components are rejected
+verifies: [C10, C11]
+---
+
+**Given** three blocks, each with a `Text("after")` beside the component call:
+`struct Row: View { var body: some View { Row() } }`,
+`struct Row: View { var body: some View { VStack { Row(); Row() } } }`, and
+`struct A: View { var body: some View { B() } }` with `struct B: View { var body: some View { if false { A() } } }`;
+**when** each is checked and rendered in both variants, **then** each finishes promptly (well under a second, no memory growth) with exactly one error with code `recursion` whose message names the cycle (`Row → Row`, `Row → Row`, `A → B → A`), the component use renders nothing, and `Text("after")` renders.
+**And** a chain of 49 distinct structs, each using the next, reports "nests too deeply" with code `recursion` (C11).
+
+Automated in both variants (Python `tests/`, TypeScript `tests/unit/`); the implementer names the tests here.
```
