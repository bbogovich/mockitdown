---
id: R-EDIT-005
title: The design document module
status: active
version: 0.10.0
rev: 0
page: WEB.3
slot: reqs
order: 5
hash: 1197bd8bd572
source: [SRC-12, SRC-15]
realizes: [F-20]
requires: [R-WEB-001]
constrained_by: [A-WEB-4, M-EDIT-1, M-EDIT-2]
---

C1: The package MUST provide the module `dist/design.js`, exported as the subpath `mockitdown/design`, which MUST run in Node 22 and in browsers without access to the DOM, the network or the file system.
C2: `readDesign(text)` MUST parse a design document (M-EDIT-1) from JSON text and return `{document}`, or `{errors}` — a list of `{path, message}` naming the JSON path (`mockups[2].code`) of each problem — when the text is not a valid design document.
C3: `readDesign` MUST refuse a document whose `format` is not `mockitdown-design` or whose `version` is not `1`, naming the key and the value it found.
C4: `readDesign` MUST refuse a document whose `mockups` is not a list, a mockup whose `name` or `code` is not a string, a mockup whose `x` or `y` is not a number, and two mockups with the same name.
C5: `writeDesign(document)` MUST return JSON text indented by two spaces and ending with one line feed, with the keys of each object in the order of M-EDIT-1 and M-EDIT-2, followed by the keys the module does not know in the order they were read.
C6: Keys the module does not know, at the document, mockup, section and view levels, MUST be kept with their values by `readDesign` and written back by `writeDesign`.
C7: `writeDesign(readDesign(text).document)` MUST return `text` unchanged for every text that `writeDesign` produced, and a mockup's `code` MUST reach the document and the text verbatim.
C8: The pack of a mockup MUST be its `options.pack` when present, else the document's `defaults.pack`, else `base`.
C9: `mockupOptions(document, name)` MUST return the render options of a mockup: the document's `defaults`, overridden by the mockup's `options`, with the pack of C8.
C10: `newDesign(name)` MUST return a document with `format`, `version` 1, the given `name`, empty `defaults` and an empty `mockups` list.
C11: The module MUST NOT read or write files, and MUST NOT convert a document to or from Markdown, HTML or a folder of files; these remain with the host.
V1: Reading and writing every document of the test fixtures yields the same text; each malformed fixture is refused with the expected JSON path.
<!-- file: TC-1.md -->
---
id: TC-1
title: Round trip and key order
verifies: [C1, C5, C6, C7, C10]
---

`node:test` (`typescript/tests/unit/design.test.ts`), importing `mockitdown/design` in Node: fixture
documents with sections, view, imports and unknown keys at every level read and write back to the same
text; a document built with `newDesign` and written has its keys in M-EDIT-1 order; a code string with
tabs, CRLF and trailing spaces is kept verbatim. The module imports no DOM global.
<!-- file: TC-2.md -->
---
id: TC-2
title: Refusals
verifies: [C2, C3, C4]
---

`node:test`: wrong `format`, `version: 2`, `mockups` as an object, a mockup without `code`, `x` as a
string and two mockups named `Inbox` are each refused, with the expected `path` and a message naming the
problem.
<!-- file: TC-3.md -->
---
id: TC-3
title: Pack per mockup
verifies: [C8, C9, C11]
---

`node:test`: with `defaults.pack` `fluent`, a mockup without a pack resolves to `fluent`, one with
`options.pack` `mui` to `mui`; without defaults, to `base`; `mockupOptions` merges `defaults.appearance`
under the mockup's own options. The module exports no Markdown or file function.
<!-- file: prose.md -->
The `.mkdesign` format of F-20 (SRC-12#s11, SRC-15) and the one module that reads and writes it. The
composite designer uses it for `open` and `toJSON`; a desktop shell uses the same module in its main
process to read, validate and save files, so the two cannot drift apart.

```json
{
  "format": "mockitdown-design",
  "version": 1,
  "name": "Mail app",
  "defaults": { "pack": "fluent", "appearance": "light" },
  "imports": ["components/cards.mockitdown"],
  "sections": [ { "name": "Onboarding", "x": -40, "y": -60, "w": 1400, "h": 900 } ],
  "mockups": [
    { "name": "Sign in", "x": 0, "y": 0,
      "options": { "device": "desktop", "width": 480, "height": 360, "title": "Sign in" },
      "code": "NavigationStack {\n  VStack(spacing: 12) {\n    Text(\"Welcome back\")\n  }\n}\n" }
  ],
  "view": { "zoom": 0.75, "x": 120, "y": 40, "active": "Sign in" }
}
```

A mockup may name its own pack (to compare Fluent and Material side by side); one that names none uses
`defaults.pack`. The file is meant to be read and diffed without the designer, so the key order is fixed,
code is kept byte for byte, and keys written by a newer tool survive a round trip through an older one.
Markdown, HTML and folder export stay in the shell for now.
