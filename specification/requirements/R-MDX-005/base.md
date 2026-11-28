---
id: R-MDX-005
title: Build log and strict mode
status: active
version: 0.2.0
rev: 0
page: MDX.1
slot: reqs
order: 5
source: [SRC-3]
realizes: [F-12, F-11]
constrained_by: [A-MDX-2]
reverse_engineered: true
hash: acd59bff39db
---

C1: The fence MUST log every diagnostic of a block to the logger `mkdocs.extensions.mockitdown` — errors at ERROR level, warnings at WARNING level — as "mockitdown block <label>: <diagnostic>", where the label is the block's title or its first non-empty line cut to 48 characters.
C2: While `strict` is on, if a block has any error (including fence errors), then the fence MUST raise `pymdownx.superfences.SuperFencesException` with the message "mockitdown block <label>: " followed by the errors, so the site build fails.
C3: While `strict` is off, a block with errors MUST render with its error box (R-DIAG-004) and the build MUST continue.
C4: While `show_warnings` is on, warnings MUST also appear in the page's diagnostic box; otherwise only the log shows them.
V1: With `strict: true`, a page containing `Buton("x")` fails `zensical build` with a message naming the block and the unknown element.
<!-- file: prose.md -->
The logger's name places mockitdown's messages under MkDocs' extension loggers, so MkDocs'
`--strict` warning policy and Zensical's log output pick them up. Strict mode is the CI gate.
