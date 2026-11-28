---
id: R-EDIT-002.CR-7
target: R-EDIT-002
kind: revision
version: 0.13.8
date: 2026-11-28
issue: 29
summary: "as built (#29): insert with parent null adds a top-level statement (C4, C31); the corpus covers it (C16, insert-top-level, insert-top-level-empty)"
from: 34a5a55aa510
to: 9810e9de26bb
---

## Clauses

@ C4 edit
~ The operation `insert` MUST take a parent view node, {+or `null` for the top level of the source, +}an index among its statement children [-(C19)-]{+(C19), or among the top level's view statements,+} (or `end`) and the code of one view (a call with its modifier chain and closures), and insert that code as the parent's [-child-]{+child, or as a top-level statement,+} at that position.
@ C16 edit
~ The edit corpus MUST cover each operation at the first, a middle and the last position, into an empty parent and a parent without a closure, {+an `insert` at the top level, +}in sources with comments, blank lines, `let`, `ForEach`, `if` and struct declarations, and every refusal of this requirement.
@ C31 insert after C30
+ An `insert` at the top level MUST write the code before the view statement at its index, on lines of its own when that statement starts its line and else before it on its line followed by `; `, or, at the end, on a new line after the line of the last top-level statement, else at the end of the source, with the indentation of the first top-level view when it starts its line, else none.

## Files

```diff
--- a/TC-1.md
+++ b/TC-1.md
@@ -3,3 +3,3 @@
 title: The edit corpus
-verifies: [C1, C2, C4, C5, C6, C7, C8, C10, C11, C12, C13, C15, C16, C17, C18, C19, C20, C21, C22, C23, C24, C25, C26, C27, C28, C29, C30]
+verifies: [C1, C2, C4, C5, C6, C7, C8, C10, C11, C12, C13, C15, C16, C17, C18, C19, C20, C21, C22, C23, C24, C25, C26, C27, C28, C29, C30, C31]
 ---
@@ -15,3 +15,3 @@
 `move:` `first`/`middle`/`last`, `insert:empty`, `insert:no-closure`, `remove:all`, `move:empty`,
-`move:no-closure`, `source:comments`, `blank-lines`, `let`, `foreach`, `if`, `struct`, `indent:unit`,
+`move:no-closure`, `insert:top-level` (#29: `insert-top-level`, after the last statement and before a struct declared below it, and `insert-top-level-empty`, a source holding only a comment), `source:comments`, `blank-lines`, `let`, `foreach`, `if`, `struct`, `indent:unit`,
 `tabs`, `relative`, and one `refuse:` tag per refusal (C3, C9, C14, C20 to C24); a refused case carries
--- a/prose.md
+++ b/prose.md
@@ -41 +41,3 @@
 **Re-checked at specification 0.12.12.** Re-read after the clarification records of the items it cites (#81), which closed the suspect citations left by the test-case backfills (#54 to #60) and the SRC-19 import map (0.12.0). No obligation it rests on changed, and none of its clauses is altered.
+
+An `insert` with `parent: null` adds a top-level statement, the root of a mockup: the gallery's Add with nothing selected (R-TOOL-004) appends `Toggle()` on a new line after the last top-level view, before any struct declared below it.
```
