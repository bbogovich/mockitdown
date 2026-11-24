---
id: R-LANG-002
title: String literals and interpolation
status: active
version: 0.2.0
rev: 0
page: LANG.1
slot: reqs
order: 2
source: [SRC-2]
realizes: [F-2]
constrained_by: [A-SYN-1, A-SYN-2]
decisions: [ADR-2]
reverse_engineered: true
hash: 87252198223d
---

C1: The lexer MUST recognise single-line string literals delimited by `"` that do not span a line feed, and multi-line literals delimited by `"""`.
C2: The lexer MUST decode the escapes `\n` `\t` `\r` `\0` `\"` `\'` `\\` and `\u{hex}`; if any other escape follows a backslash, then it MUST raise a syntax error "unknown escape".
C3: The lexer MUST keep each `\( … )` interpolation as a separate part holding the enclosed source and its starting location, matching nested parentheses; an interpolation in a single-line string MUST NOT span a line feed.
C4: The parser MUST parse each interpolation's source as one expression at its original location; if text remains after the expression, then it MUST raise a syntax error.
C5: For a multi-line literal, the lexer MUST drop the line feed that follows the opening `"""` and the indentation of the closing delimiter's line from every line, as Swift does.
C6: If a string literal or interpolation is not terminated, then the lexer MUST raise a syntax error located at its start.
V1: `"Hello \(name)!"` produces a string node with parts `Hello `, an identifier expression and `!`; an unterminated `"abc` is a located syntax error.
