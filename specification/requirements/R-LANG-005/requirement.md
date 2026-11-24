---
id: R-LANG-005
title: Statements
status: active
version: 0.2.0
rev: 0
page: LANG.1
slot: reqs
order: 5
source: [SRC-2]
realizes: [F-2]
constrained_by: [A-SYN-2]
decisions: [ADR-2]
reverse_engineered: true
hash: 58e7d5e517cc
---

C1: The parser MUST parse `if <expr> { … }` with an optional `else { … }` or `else if …`, where `else` may follow the closing brace on the next line.
C2: The parser MUST parse an `if` condition without trailing closures, so the `{` after the condition opens the branch.
C3: The parser MUST parse `let name [: Type] = expr` and `var name [: Type] = expr` as a binding statement; the type annotation MUST be ignored.
C4: The parser MUST parse `return expr` as an expression statement, ignoring `return`.
C5: The parser MUST parse any other statement as an expression statement.
C6: Inside braces, the parser MUST separate statements by line feeds or `;`, and MUST raise "missing '}'" when the input ends first.
V1: `if a { X() } else if b { Y() } else { Z() }` and `let n: Int = 3` parse; `if a { X() }` followed on the next line by `else { Y() }` attaches the else branch.
