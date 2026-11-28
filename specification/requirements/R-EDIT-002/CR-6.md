---
id: R-EDIT-002.CR-6
target: R-EDIT-002
kind: revision
version: 0.12.17
date: 2026-11-27
issue: 21
summary: "as built (#21): edit takes a source or a tree, refusals carry diagnostics (C1); nodes by number too (C3); statement children (C4, C8, C19); tab or smallest-step unit (C11); not-one-view messages (C14); refusals C20-C24; line, separator and blank-line rules (C25-C29); covers tags (C30); TC-1, TC-2 name the tests"
from: 69c5506bffdf
to: 34a5a55aa510
---

## Clauses

@ C1 edit
~ The package MUST export `edit(source, op)`, which applies one edit operation to a [-source-]{+source, or to a syntax tree whose ids the result then continues,+} and returns `{edits, source, tree}` — the text edits (M-EDIT-3) in ascending, non-overlapping order, the edited source and its tree (R-EDIT-001.C9) — or [-`{error}`-]{+`{error, diagnostics}`+} with a [-message-]{+message, the syntax diagnostics when code did not parse,+} and no edits when the operation is refused.
@ C3 edit
~ An operation MUST name its nodes by node id or by [-ordinal,-]{+ordinal (`n3`, or the number 3),+} and MUST be refused when a named node is not a view node of the source.
@ C4 edit
~ The operation `insert` MUST take a parent view node, an index among its {+statement +}children{+ (C19)+} (or `end`) and the code of one view (a call with its modifier chain and closures), and insert that code as the parent's child at that position.
@ C8 edit
~ The operation `move` MUST take one or more sibling view nodes, a new parent and an [-index,-]{+index among the new parent's statement children before the move,+} and move the nodes' spans there in [-their-]{+source+} order; the moved nodes{+ and their descendants+} MUST keep their node ids.
@ C11 edit
~ The indentation unit MUST be {+a tab when the source's lines are indented with tabs, else +}the smallest [-non-zero-]{+increase of+} indentation [-step-]{+between+} [-found-]{+consecutive+} [-in-]{+non-blank+} [-the source,-]{+lines,+} else four spaces.
@ C14 edit
~ An `insert` whose code does not parse as exactly one view MUST be [-refused-]{+refused:+} with the syntax [-diagnostic.-]{+diagnostic when it does not parse, and with a message saying what it holds (several statements, no view, a `let`, an import, a directive or a struct) otherwise.+}
@ C19 insert after C18
+ The statement children of a view node MUST be the view nodes standing as statements in its content: the unlabelled trailing closure of a call, or the braced branches of an `if` in order, the then branch taking the indexes up to its number of children.
@ C20 insert after C19
+ A node named by `remove` or `move` MUST be a statement of a body (a closure, a braced `if` branch, a struct body or the top level of the source), and the operation MUST be refused for an argument, a `let` value or an `else if`.
@ C21 insert after C20
+ A `remove` or `move` MUST be refused when its nodes are not statements of one body, when a node is named twice, or when it names no node.
@ C22 insert after C21
+ An index MUST be an integer from 0 to the parent's number of statement children, or `end`, and any other index MUST be refused.
@ C23 insert after C22
+ An `insert` or `move` into a call whose only trailing closures are labelled MUST be refused.
@ C24 insert after C23
+ An unknown operation, and any operation on a source that does not parse, MUST be refused, the latter with the syntax diagnostic.
@ C25 insert after C24
+ When nothing precedes a node on its first line and at most a `;` and a comment follow it on its last line, `remove` MUST delete its whole lines, the trailing comment included, together with the blank lines that would be left directly after an opening `{` line, directly before a closing `}` line or at the end of the source.
@ C26 insert after C25
+ A node that shares a line with other code MUST be removed with the `;` and spaces after it, else with the `;` and spaces before it, else with the spaces that would be left around it at the end of its line.
@ C27 insert after C26
+ Code inserted before a statement child that does not start its line, or after the last statement of a closure whose `}` follows code on its line, MUST be written on that line, separated from its neighbour by `; `.
@ C28 insert after C27
+ An `insert` or `move` into an empty closure written on one line (`{}`) MUST put the code on lines of its own and the `}` on its own line at the parent's indentation.
@ C29 insert after C28
+ A moved node that stands on its own lines (C25) MUST carry the comment trailing its last line.
@ C30 insert after C29
+ Each `<name>.op.json` MUST carry a `covers` list naming the situations of C16 the case covers, and the TypeScript test suite MUST fail when a situation is covered by no case.

## Files

```diff
--- a/TC-1.md
+++ b/TC-1.md
@@ -3,3 +3,3 @@
 title: The edit corpus
-verifies: [C1, C2, C4, C5, C6, C7, C8, C10, C11, C12, C13, C15, C16, C17, C18]
+verifies: [C1, C2, C4, C5, C6, C7, C8, C10, C11, C12, C13, C15, C16, C17, C18, C19, C20, C21, C22, C23, C24, C25, C26, C27, C28, C29, C30]
 ---
@@ -11 +11,8 @@
 of C16 (each case's `op.json` carries a `covers` list).
+
+As built (#21): 61 cases (`insert-*`, `remove-*`, `move-*`, `refuse-*`), each source opening with a `//`
+line saying what it exercises. The meta-test requires the `covers` tags `insert:`, `remove:` and
+`move:` `first`/`middle`/`last`, `insert:empty`, `insert:no-closure`, `remove:all`, `move:empty`,
+`move:no-closure`, `source:comments`, `blank-lines`, `let`, `foreach`, `if`, `struct`, `indent:unit`,
+`tabs`, `relative`, and one `refuse:` tag per refusal (C3, C9, C14, C20 to C24); a refused case carries
+a `refuse:` tag and only a refused case does. It also fails on a file in `edit/` that belongs to no case.
--- a/TC-2.md
+++ b/TC-2.md
@@ -3,7 +3,11 @@
 title: Refusals and ids
-verifies: [C3, C8, C9, C14]
+verifies: [C1, C3, C8, C9, C11, C14, C22, C23, C24]
 ---
 
-`node:test`: a node that is a modifier call or does not exist, a move into the moved node's own
+`node:test` (`typescript/tests/unit/edit.test.ts`): a node that is a modifier call or does not exist, a move into the moved node's own
 descendant and an insert of code with two views or a syntax error are refused with a message and no
 edits; after a move, the moved nodes keep their ids.
+Nodes are named by id, by `n6` and by 6 with the same result; an edit of a tree continues its ids,
+and inserted nodes get new ones; `indentUnit` gives two or three spaces, a tab, or four spaces for a
+source without indentation; an index past the children or negative, and a parent with only labelled
+closures, are refused.
--- a/prose.md
+++ b/prose.md
@@ -10,2 +10,17 @@
 ```
+
+Positions count a parent's *statement children*: the views standing as statements in its content
+closure (or in the braced branches of an `if`), so an index is what an outline shows, not an offset.
+Only such statements are removed or moved here; a view in an argument or a `let` value is changed by
+the argument operations (R-EDIT-003). A host that holds a tree passes it instead of the source, so the
+result continues its ids: a moved node keeps its id across the move, which a host's selection follows.
+
+```js
+const r = edit(tree, { op: "move", nodes: ["n4"], parent: "n1", index: 0 });
+if ("error" in r) showMessage(r.error);   // e.g. "cannot move n2 into n3, one of its descendants"
+```
+
+A node on lines of its own leaves with its lines, its leading comment lines and a comment trailing it;
+a node sharing a line leaves with its `;` separator. Blank lines that would end up against a brace go
+with it, so a removal never opens a gap that was not there.
 
```
