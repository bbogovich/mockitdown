---
id: R-LANG-008
title: Collection and tuple literals
status: active
version: 0.2.0
rev: 0
page: LANG.1
slot: reqs
order: 8
source: [SRC-2]
realizes: [F-2]
constrained_by: [A-SYN-2]
decisions: [ADR-2]
reverse_engineered: true
hash: c4b3337f27d5
---

C1: The parser MUST parse `[a, b, …]` as an array literal and `[k: v, …]` as a dictionary literal, allowing line feeds between entries and a trailing comma; `[:]` MUST be an empty dictionary.
C2: If a collection literal mixes array entries and `key: value` entries, then the parser MUST raise "a collection literal mixes array and dictionary entries".
C3: The parser MUST parse a parenthesised list of two or more expressions, or of any labelled expressions (`(name: "A", age: 3)`), as a tuple literal, and a single unlabelled parenthesised expression as that expression.
V1: `[("Ana", 1), ("Ben", 2)]` is an array of two tuples; `["a": 1, "b": 2]` is a dictionary; `[1, "a": 2]` is a syntax error.
