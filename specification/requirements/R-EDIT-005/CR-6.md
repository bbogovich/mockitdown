---
id: R-EDIT-005.CR-6
target: R-EDIT-005
kind: revision
version: 0.13.3
date: 2026-11-28
issue: 24
summary: "as built (#24): mockupPack (C8) and null for an unknown name (C9); the other refusals (C12), their wording (C13), every problem listed and non-JSON text (C14), read order kept for index-like keys (C15); TC-1 to TC-3 name their tests and fixtures"
from: 4ab500ce9b41
to: 9c004786cec7
---

## Clauses

@ C8 edit
~ The pack of a mockup MUST be its `options.pack` when [-present,-]{+that is a string,+} else the document's [-`defaults.pack`,-]{+`defaults.pack` when that is a string,+} else [-`base`.-]{+`base`, and `mockupPack(document, name)` MUST return it.+}
@ C9 edit
~ `mockupOptions(document, name)` MUST return the render options of a [-mockup:-]{+mockup as a new object:+} the document's `defaults`, overridden by the mockup's `options`, with the pack of [-C8.-]{+C8; `mockupPack` and `mockupOptions` MUST return null for a name no mockup has.+}
@ C12 insert after C11
+ `readDesign` MUST also refuse a `name` that is not a string, a `defaults` that is not an object, an `imports` that is not a list of strings, a section that is not an object with a string `name` and numbers `x`, `y`, `w` and `h`, a mockup that is not an object or whose `options` is not an object, and a `view` that is not an object or whose `zoom`, `x` or `y` is not a number or whose `active` is not a string; `imports`, `sections`, a mockup's `options`, `view` and each key of `view` MAY be absent.
@ C13 insert after C12
+ A number of C4 and C12 MUST be finite, and a refusal MUST say `<key> must be <what>, found <value>` (the value as JSON, `a list` or `an object`), or `<key> must be <what>, but it is missing`, and for a repeated name `the name "<name>" is already used by mockups[<k>]` at the later mockup's `name`.
@ C14 insert after C13
+ `readDesign` MUST list every problem it finds, in document order; a text that is not JSON MUST give one problem at the path `""` whose message starts `not valid JSON:` and names the line and column, and a JSON value that is not an object one problem at `""`.
@ C15 insert after C14
+ The order of C5 and C6 MUST be the order of the text even for keys that look like array indices (`"2"`), which a JavaScript object would enumerate first; a key a host adds to a read object MUST be written after the keys that were read.

## Files

```diff
--- a/TC-1.md
+++ b/TC-1.md
@@ -3,8 +3,13 @@
 title: Round trip and key order
-verifies: [C1, C5, C6, C7, C10]
+verifies: [C1, C5, C6, C7, C10, C15]
 ---
 
-`node:test` (`typescript/tests/unit/design.test.ts`), importing `mockitdown/design` in Node: fixture
-documents with sections, view, imports and unknown keys at every level read and write back to the same
-text; a document built with `newDesign` and written has its keys in M-EDIT-1 order; a code string with
-tabs, CRLF and trailing spaces is kept verbatim. The module imports no DOM global.
+`node:test` (`typescript/tests/unit/design.test.ts`), importing `mockitdown/design` in Node through the
+package's own subpath export: the hand-written fixture documents of `typescript/tests/fixtures/design/`
+(`mail.mkdesign` with sections, view, imports and unknown keys at every level, `minimal.mkdesign`,
+`unicode.mkdesign` with index-like unknown keys) read and write back to the same text; a document whose
+keys are out of order is written with the known keys in M-EDIT-1 and M-EDIT-2 order and the others after
+them in read order; a document built with `newDesign` and written equals `minimal.mkdesign`; a code string
+with tabs, CRLF and trailing spaces is kept verbatim. `dist/design.js` reaches only relative modules, none
+of them a custom-element module, and reads, writes and edits a document with every browser and network
+global made to throw.
--- a/TC-2.md
+++ b/TC-2.md
@@ -3,7 +3,9 @@
 title: Refusals
-verifies: [C2, C3, C4]
+verifies: [C2, C3, C4, C12, C13, C14]
 ---
 
-`node:test`: wrong `format`, `version: 2`, `mockups` as an object, a mockup without `code`, `x` as a
-string and two mockups named `Inbox` are each refused, with the expected `path` and a message naming the
-problem.
+`node:test` (`typescript/tests/unit/design.test.ts`): each fixture of `typescript/tests/fixtures/design/malformed/`
+— wrong `format`, `version: 2`, `mockups` as an object, a mockup without `code`, `x` as a string, two
+mockups named `Inbox`, text that is not JSON, a list, and one document with a problem of every C12 kind —
+is refused with exactly the paths and messages of `malformed/expected.json`, written by hand; a refusal
+gives no document. `format` and `version` refusals name the value found (`"1"`, `1.5`).
--- a/TC-3.md
+++ b/TC-3.md
@@ -6,4 +6,5 @@
 
-`node:test`: with `defaults.pack` `fluent`, a mockup without a pack resolves to `fluent`, one with
-`options.pack` `mui` to `mui`; without defaults, to `base`; `mockupOptions` merges `defaults.appearance`
-under the mockup's own options. The module exports no Markdown or file function.
+`node:test` (`typescript/tests/unit/design.test.ts`): with `defaults.pack` `fluent`, a mockup without a
+pack resolves to `fluent`, one with `options.pack` `mui` to `mui`; without defaults, to `base`; an unknown
+name to null; `mockupOptions` merges `defaults.appearance` under the mockup's own options into a new
+object. The module exports no Markdown, HTML or file function.
--- a/prose.md
+++ b/prose.md
@@ -26,2 +26,15 @@
 
+```js
+import { readDesign, writeDesign, mockupOptions } from "mockitdown/design";
+
+const r = readDesign(text);
+if ("errors" in r) for (const e of r.errors) console.log(`${e.path}: ${e.message}`);
+//   mockups[1].code: code must be a string, but it is missing
+else save(writeDesign(r.document));      // the same text when nothing changed
+```
+
+The reader lists every problem at once, so a hand-edited file can be fixed in one pass. Unknown keys keep
+their place even when they look like numbers: the module remembers the order it read, which a plain
+JavaScript object would not.
+
 Re-checked at 0.10.3 together with the items it cites or is cited by (specification audit, #51): the citations are still accurate and no obligation changed.
```
