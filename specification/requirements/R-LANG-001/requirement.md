---
id: R-LANG-001
title: Lexical structure
status: active
version: 0.2.0
rev: 0
page: LANG.1
slot: reqs
order: 1
source: [SRC-2]
realizes: [F-2]
constrained_by: [A-SYN-1]
decisions: [ADR-2]
reverse_engineered: true
hash: cbe8b18acc6b
---

C1: The lexer MUST accept mockitdown source as Unicode text and report positions as 1-based line and column numbers.
C2: The lexer MUST treat spaces, tabs, carriage returns and a byte-order mark as insignificant, and MUST emit each line feed as a NEWLINE token.
C3: The lexer MUST skip line comments (`//` to the end of the line) and block comments (`/*` … `*/`), and block comments MUST nest.
C4: If a block comment is not terminated, then the lexer MUST raise a syntax error "unterminated block comment" located at the comment's start.
C5: The lexer MUST recognise identifiers as a letter or `_` followed by letters, digits or `_`, and MUST recognise a backtick-escaped identifier (`` `default` ``) as an identifier whose name is the text between the backticks.
C6: The lexer MUST treat exactly these words as keywords: `import`, `struct`, `var`, `let`, `if`, `else`, `in`, `true`, `false`, `nil`, `some`, `private`, `public`, `fileprivate`, `internal`, `static`, `return`.
C7: The lexer MUST recognise integer literals (digits, with `_` separators ignored) and floating-point literals (digits `.` digits); a `.` not followed by a digit MUST NOT be part of a number, so `0...5` lexes as a range.
C8: The lexer MUST recognise the punctuation `..<` `...` `==` `!=` `&&` `->` `<=` `>=` `{` `}` `(` `)` `[` `]` `,` `:` `;` `.` `=` `!` `@` `#` `+` `-` `*` `/` `<` `>` `?` `\` `$` `&` and the or-operator (two vertical bars), matching the longest first.
C9: If the lexer meets any other character outside a string or comment, then it MUST raise a syntax error "unexpected character" at that position.
V1: A source mixing nested block comments, line comments, `_`-separated numbers, escaped identifiers and a range `0...5` tokenizes without error and with correct positions; a stray `%` is a located syntax error.
