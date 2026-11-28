---
id: R-EDIT-001.CR-7
target: R-EDIT-001
kind: revision
version: 0.12.16
date: 2026-11-27
issue: 20
summary: "as built (#20): view nodes wherever a call stands (C3); capital-letter dotted names (C12); leading comment lines defined (C13); argument spans (C14); id matching and removals (C15); RangeError on bad edits (C16); token offsets (C17); node fields (C18); TC-1, TC-2 name the tests"
from: 8cf1a52e8505
to: 8e6cdd63d7b7
---

## Clauses

@ C3 edit
~ The view nodes of a source MUST be its calls whose callee is an identifier or a dotted name of identifiers (`Text("a")`, `VStack { … }`, `Badge.Ribbon("New")`),{+ wherever they stand (statements, arguments, modifier arguments, `let` values),+} its identifiers that stand alone as a view statement or as the base of a modifier chain in one (`Divider`, `Spacer.frame(height: 8)`), and its `if` statements; a modifier call MUST NOT be a view node and MUST belong to the view node whose chain it is in.
@ C12 insert after C11
+ A member segment of a callee MUST continue the dotted name when it starts with a capital letter (`Badge.Ribbon`) and MUST be a modifier otherwise (`Spacer.frame`), whatever the pack.
@ C13 insert after C12
+ The leading comment lines of C11 MUST be the contiguous lines holding only comments directly above the node's first line, and only when the node's first token is the first on its line; a blank line, or a line whose comment follows code, MUST end them.
@ C14 insert after C13
+ The span of a view node that is not a view statement (an argument, a `let` value) MUST start at its first token.
@ C15 insert after C14
+ In the tree `reparse` returns, a view node whose name a removal falls inside MUST get a new id, and a kept id MUST belong to an old node with the same name and the same name span before the edits.
@ C16 insert after C15
+ `reparse` MUST throw a `RangeError` for edits out of order, overlapping one another or outside the text, and MUST leave the old tree usable.
@ C17 insert after C16
+ Each token of the TypeScript lexer MUST carry its start and end offsets.
@ C18 insert after C17
+ Each view node MUST expose its ordinal both as written (`n3`) and as a number, its kind (call, identifier or `if`) and its modifiers in source order.

## Files

```diff
--- a/TC-1.md
+++ b/TC-1.md
@@ -3,3 +3,3 @@
 title: Spans, ordinals and ids
-verifies: [C1, C2, C3, C4, C5, C7, C8, C11]
+verifies: [C1, C2, C3, C4, C5, C7, C8, C11, C12, C13, C14, C17, C18]
 ---
@@ -11 +11,7 @@
 same diagnostics as `check`.
+
+Besides the corpus, cases in the same file: the narrative example (names, kinds, parents, the comment
+above `VStack` in its span), a call inside a modifier's argument (a node) next to the modifiers (none),
+a struct body numbered with the rest, UTF-16 offsets past an emoji and inside an interpolation, nested
+block comments recorded, comment lines leading a node only when contiguous and not trailing code, and
+the lookups by offset, id and ordinal.
--- a/TC-2.md
+++ b/TC-2.md
@@ -3,6 +3,6 @@
 title: Ids survive edits
-verifies: [C6, C9, C10]
+verifies: [C6, C9, C10, C15, C16]
 ---
 
-`node:test`: parse a formatted source with comments, a `let`, a `ForEach` and an `if`; apply, with
+`node:test` (`typescript/tests/unit/tree.test.ts`): parse a formatted source with comments, a `let`, a `ForEach` and an `if`; apply, with
 `reparse`, an insertion before a node, a replacement inside a sibling's arguments and a removal of
@@ -10 +10,5 @@
 a new id, and no id of a removed node reappears in later trees.
+
+Also: replacing a node's name gives it a new id while its siblings keep theirs; an edit that breaks the
+source returns `tree: null` with the syntax diagnostic, and the old tree still reparses; edits out of
+order, overlapping or out of range throw a `RangeError`.
--- a/prose.md
+++ b/prose.md
@@ -23,2 +23,10 @@
 
+As built (#20), `parseTree(source)` and `reparse(tree, edits)` live in `typescript/src/core/syntax/tree.ts`.
+A view node gives `id`, `ordinal` (`"n3"`), `index` (3), `kind`, `name`, `span`, `nameSpan`, `first`
+(its first token's offset), `parent`, `children`, `syntax`, `expr` and `modifiers`; the tree gives
+`nodes`, `roots`, `comments`, `byId`, `byOrdinal` (`"n3"` or 3), `atOffset` and `text(span)`. Ids are
+`id1`, `id2`, …, from a counter a tree shares only with the trees derived from it. Whether `Badge.Ribbon`
+is a dotted name or `Badge` with a modifier is decided by the capital letter (C12), so the tree needs no
+pack: the evaluator still resolves names against the pack when it renders.
+
 Re-checked at 0.10.3 together with the items it cites or is cited by (specification audit, #51): the citations are still accurate and no obligation changed.
```
