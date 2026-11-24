---
id: R-LANG-007
title: Calls, modifier chains and closures
status: active
version: 0.2.0
rev: 0
page: LANG.1
slot: reqs
order: 7
source: [SRC-2]
realizes: [F-2]
constrained_by: [A-SYN-2]
decisions: [ADR-2]
reverse_engineered: true
hash: 77ed00c0d287
---

C1: The parser MUST parse an argument list as `(` zero or more arguments separated by `,` `)`, each optionally labelled `label:` where the label may be an identifier or a keyword, with line feeds allowed between arguments.
C2: The parser MUST treat `(` as a call only when it is on the same line as the expression it follows.
C3: When a line ends and the next non-empty line starts with `.name`, the parser MUST continue the current postfix expression with that member, so modifier chains may continue on following lines.
C4: The parser MUST parse a `{` on the same line after a call, an identifier, a member or an implicit member as an unlabelled trailing closure of a call.
C5: After a trailing closure, the parser MUST parse each following `label: {` — on the same or a later line — as a labelled trailing closure of the same call.
C6: The parser MUST parse closure parameters when the closure starts with `a, b in`, `(a, b) in`, typed parameters `a: T in`, or `_ in`; otherwise the closure has no parameters and its whole content is its body.
C7: If an argument list lacks `,` or `)` between arguments, then the parser MUST raise "expected ',' or ')' in an argument list".
V1: `Text("A")` newline `.font(.title)` newline `.bold()` parses as one chain; `.alert("T", isPresented: true) { Button("OK") } message: { Text("m") }` has one unlabelled and one labelled trailing closure; `ForEach(items) { name, dept in … }` has two parameters.
