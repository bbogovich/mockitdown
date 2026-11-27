---
id: TC-1
title: Round trip and key order
verifies: [C1, C5, C6, C7, C10]
---

`node:test` (`typescript/tests/unit/design.test.ts`), importing `mockitdown/design` in Node: fixture
documents with sections, view, imports and unknown keys at every level read and write back to the same
text; a document built with `newDesign` and written has its keys in M-EDIT-1 order; a code string with
tabs, CRLF and trailing spaces is kept verbatim. The module imports no DOM global.
