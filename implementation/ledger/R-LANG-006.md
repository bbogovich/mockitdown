---
requirement: R-LANG-006
title: Expressions and operators
status: implemented
version: 0.12.9
date: 2026-11-27
issue: 58
---

# R-LANG-006 — Expressions and operators

<!-- written by `vio-docs ledger record`; never edit -->

| Version | Date | Status | Issue | Change in the code | Pages |
|---|---|---|---|---|---|
| 0.12.9 | 2026-11-27 | implemented | #58 | C1-C8 implemented (syntax/parser.py parse_expr, parse_binary, parse_unary, parse_postfix, parse_primary); fixed by TC-1: a ternary's ? on the next line now continues the expression (C2), in parser.py and parser.ts; verified by test_expressions.py ExpressionTests (TC-1) and the lang-expressions conformance case (#58). | [Syntax: lexer, parser, syntax tree](../narrative/architecture/syntax.md), [Conformance corpus](../narrative/conformance.md), [Testing](../narrative/testing.md) |
