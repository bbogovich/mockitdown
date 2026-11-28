---
id: R-DIAG-001
title: Diagnostic content
status: active
version: 0.12.8
rev: 1
page: DIAG.1
slot: reqs
order: 1
source: [SRC-3]
realizes: [F-12]
constrained_by: [A-DIAG-1, M-DIAG-1]
reverse_engineered: true
hash: 1d603f86538d
---

C1: Every diagnostic MUST carry a severity (`error` or `warning`), a message, a location (line and column, 1-based, and the source file name when the problem is in a file; zero when unknown) and a code.
C2: A diagnostic MUST print as `<severity> [<code>] at <where>: <message>`, where `<where>` is `line L:C`, or `<file>:L:C` for a file, or the file name or `?` when no line is known; the code part MUST be omitted when empty.
C3: Errors MUST mean the mockup is wrong (it does not show what was written); warnings MUST mean something was ignored or approximated.
V1: An unknown element in a fenced block prints `error [unknown] at line 3:5: …`; an unknown icon prints `warning [icon] at line 2:9: unknown icon 'xyzzy'`.
