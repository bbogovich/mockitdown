---
id: A-SYN-1
title: Lexer
status: active
version: 0.2.0
rev: 0
page: ARCH.1
slot: elements
order: 4
level: module
hash: 7be5ec2905c7
---

P1: provides: `tokenize(src, source)` → tokens with kinds, values and locations (`mockitdown.syntax.lexer`)
U1: uses A-DIAG-1 — raise located syntax errors
K1: The lexer MUST keep string interpolations as unparsed source with their locations.
