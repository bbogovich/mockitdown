---
id: TC-2
title: No library, speed, colouring ranges
verifies: [C8, C9, C10]
---

`node:test` (`code.test.ts`, IT-66) reads the compiled module graph of `dist/elements/code.js` and fails
unless its only import is the core lexer and the whole graph is the lexer, `diagnostics`, `values` and
`pyformat`; it checks `highlight` against ranges counted by hand (names, modifiers, a member, a chain
continued on the next line, keywords, numbers, comments) and that an unterminated string, an
unterminated block comment and an unreadable character are coloured without throwing. A browser timing
(`code.spec.mjs`) of 50 keystrokes at the end of a 1000-line source in a code view of its own reports
the median re-colour time as an annotation (a warning above 16 ms; about 10 ms in Chromium) and checks
the line numbers and colours afterwards.
