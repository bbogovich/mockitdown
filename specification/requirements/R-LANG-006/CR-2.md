---
id: R-LANG-006.CR-2
target: R-LANG-006
kind: clarification
version: 0.12.9
date: 2026-11-27
issue: 58
summary: "test cases backfilled: TC-1 verifies C1-C8; prose notes chained tuple indexes (#58)"
from: 35a1a1107812
to: 507c34b5e217
---

## Clauses

(none)

## Files

```diff
--- /dev/null
+++ b/TC-1.md
@@ -0,0 +1,14 @@
+---
+id: TC-1
+title: Expressions, precedence and line feeds
+verifies: [C1, C2, C3, C4, C5, C6, C7, C8]
+---
+
+Python unit tests `python/tests/test_expressions.py` `ExpressionTests`, printing parsed expressions fully
+parenthesised: the precedence ladder and left associativity of every binary level, nested ternaries,
+prefix and postfix operators (C1, V1); line feeds after binary operators and before or after `?` and
+`:` (`x` / `? "on"` / `: "off"` on three lines renders `on`), and a line feed before an operator ending
+the statement (C2, V1); every primary form (C3); `$isOn` as the identifier `isOn` (C4, V1); a postfix
+`!` dropped, `!a` and `!=` kept (C5); `.default`, `Font.default` and other keywords as member names
+(C6); "expected an expression, found ')'" / "'*'" / "end of input" (C7); `t.0`, `t.1.count` and
+`pairs[0].1` (C8). The conformance case `lang-expressions` holds the TypeScript parser to the same.
--- a/prose.md
+++ b/prose.md
@@ -2 +2,4 @@
 precedence ladder without assignment, casts or custom operators.
+
+A chained tuple index such as `t.1.1` lexes `1.1` as a number and is a syntax error; bind the inner
+tuple first (`let u = t.1`, then `u.1`).
```
