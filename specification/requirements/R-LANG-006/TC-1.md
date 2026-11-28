---
id: TC-1
title: Expressions, precedence and line feeds
verifies: [C1, C2, C3, C4, C5, C6, C7, C8]
---

Python unit tests `python/tests/test_expressions.py` `ExpressionTests`, printing parsed expressions fully
parenthesised: the precedence ladder and left associativity of every binary level, nested ternaries,
prefix and postfix operators (C1, V1); line feeds after binary operators and before or after `?` and
`:` (`x` / `? "on"` / `: "off"` on three lines renders `on`), and a line feed before an operator ending
the statement (C2, V1); every primary form (C3); `$isOn` as the identifier `isOn` (C4, V1); a postfix
`!` dropped, `!a` and `!=` kept (C5); `.default`, `Font.default` and other keywords as member names
(C6); "expected an expression, found ')'" / "'*'" / "end of input" (C7); `t.0`, `t.1.count` and
`pairs[0].1` (C8). The conformance case `lang-expressions` holds the TypeScript parser to the same.
