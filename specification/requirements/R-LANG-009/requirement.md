---
id: R-LANG-009
title: Syntax errors
status: active
version: 0.2.0
rev: 0
page: LANG.1
slot: reqs
order: 9
source: [SRC-3]
realizes: [F-2, F-12]
constrained_by: [A-SYN-1, A-SYN-2, A-DIAG-1]
decisions: [ADR-2]
reverse_engineered: true
hash: bf2ab7d66295
---

C1: The lexer and parser MUST stop at the first syntax error and raise it as a syntax error carrying one diagnostic with severity error, code `syntax`, the message and the location of the offending token.
C2: When the source comes from a file, the diagnostic location MUST name that file.
C3: Messages of the form "expected X, found Y" MUST name the found token's text, or "end of input" at the end.
V1: `VStack {` reports "missing '}'" at end of input with code `syntax`; an error inside an imported file names that file.
