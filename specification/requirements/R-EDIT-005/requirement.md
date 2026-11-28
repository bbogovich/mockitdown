---
id: R-EDIT-005
title: The design document module
status: active
version: 0.13.3
rev: 6
page: WEB.3
slot: reqs
order: 5
hash: 9c004786cec7
source: [SRC-12, SRC-15]
realizes: [F-20]
requires: [R-WEB-001]
constrained_by: [A-WEB-4, M-EDIT-1, M-EDIT-2]
refs: [M-EDIT-1, M-EDIT-2]
---

C1: The package MUST provide the module `dist/design.js`, exported as the subpath `mockitdown/design`, which MUST run in Node 22 and in browsers without access to the DOM, the network or the file system.
C2: `readDesign(text)` MUST parse a design document (M-EDIT-1) from JSON text and return `{document}`, or `{errors}` — a list of `{path, message}` naming the JSON path (`mockups[2].code`) of each problem — when the text is not a valid design document.
C3: `readDesign` MUST refuse a document whose `format` is not `mockitdown-design` or whose `version` is not `1`, naming the key and the value it found.
C4: `readDesign` MUST refuse a document whose `mockups` is not a list, a mockup whose `name` or `code` is not a string, a mockup whose `x` or `y` is not a number, and two mockups with the same name.
C5: `writeDesign(document)` MUST return JSON text indented by two spaces and ending with one line feed, with the keys of each object in the order of M-EDIT-1 and M-EDIT-2, followed by the keys the module does not know in the order they were read.
C6: Keys the module does not know, at the document, mockup, section and view levels, MUST be kept with their values by `readDesign` and written back by `writeDesign`.
C7: `writeDesign(readDesign(text).document)` MUST return `text` unchanged for every text that `writeDesign` produced, and a mockup's `code` MUST reach the document and the text verbatim.
C8: The pack of a mockup MUST be its `options.pack` when that is a string, else the document's `defaults.pack` when that is a string, else `base`, and `mockupPack(document, name)` MUST return it.
C9: `mockupOptions(document, name)` MUST return the render options of a mockup as a new object: the document's `defaults`, overridden by the mockup's `options`, with the pack of C8; `mockupPack` and `mockupOptions` MUST return null for a name no mockup has.
C10: `newDesign(name)` MUST return a document with `format`, `version` 1, the given `name`, empty `defaults` and an empty `mockups` list.
C11: The module MUST NOT read or write files, and MUST NOT convert a document to or from Markdown, HTML or a folder of files; these remain with the host.
C12: `readDesign` MUST also refuse a `name` that is not a string, a `defaults` that is not an object, an `imports` that is not a list of strings, a section that is not an object with a string `name` and numbers `x`, `y`, `w` and `h`, a mockup that is not an object or whose `options` is not an object, and a `view` that is not an object or whose `zoom`, `x` or `y` is not a number or whose `active` is not a string; `imports`, `sections`, a mockup's `options`, `view` and each key of `view` MAY be absent.
C13: A number of C4 and C12 MUST be finite, and a refusal MUST say `<key> must be <what>, found <value>` (the value as JSON, `a list` or `an object`), or `<key> must be <what>, but it is missing`, and for a repeated name `the name "<name>" is already used by mockups[<k>]` at the later mockup's `name`.
C14: `readDesign` MUST list every problem it finds, in document order; a text that is not JSON MUST give one problem at the path `""` whose message starts `not valid JSON:` and names the line and column, and a JSON value that is not an object one problem at `""`.
C15: The order of C5 and C6 MUST be the order of the text even for keys that look like array indices (`"2"`), which a JavaScript object would enumerate first; a key a host adds to a read object MUST be written after the keys that were read.
V1: Reading and writing every document of the test fixtures yields the same text; each malformed fixture is refused with the expected JSON path.
