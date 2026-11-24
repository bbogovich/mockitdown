---
id: A-SYN-2
title: Parser and syntax tree
status: active
version: 0.2.0
rev: 0
page: ARCH.1
slot: elements
order: 5
level: module
hash: 2ee6fe64b7af
---

P1: provides: `parse(src, source)` → `Module` (imports, directives, structs, statements) and the syntax-tree node types (`mockitdown.syntax.parser`, `mockitdown.syntax.ast`)
U1: uses A-SYN-1 — tokens, and re-lexing of interpolations
U2: uses A-DIAG-1 — raise located syntax errors
K1: The parser MUST be recursive descent with no external parser generator.
K2: The syntax tree MUST NOT decide whether an expression is a view or a value; that is the evaluator's job.
