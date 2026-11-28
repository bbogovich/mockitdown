---
id: R-EDIT-003.CR-6
target: R-EDIT-003
kind: revision
version: 0.12.18
date: 2026-11-27
issue: 22
summary: "as built (#22): replace a value in place, positional placement (C2); parentheses kept without a closure (C4); chain on one line, after a trailing comment (C6); line and inline removal (C7); string literal (C8); leading comment lines (C11); refusals C14, C16-C20; one argument per line kept (C15); TC-1, TC-2 name the tests"
from: f6ca033017eb
to: 14bb2a39f25b
---

## Clauses

@ C2 edit
~ `setArgument` MUST replace an existing [-argument-]{+argument's value+} in place, append a new labelled argument after the call's last argument, and insert a new positional argument at its position among the positional [-arguments.-]{+arguments: before the one at that position, else after the last positional argument, else before the first argument.+}
@ C4 edit
~ When an argument is added to a call written without parentheses (`Divider`, `VStack { … }`), the edit MUST add the parentheses directly after the name; when the last argument of a call with a trailing closure is removed, the empty parentheses MUST be removed [-too.-]{+too, and kept on a call without one.+}
@ C6 edit
~ A new modifier MUST be appended to the end of the [-chain,-]{+chain:+} on the chain's last line when {+no modifier of +}the chain [-is written on one line, else on-]{+starts+} a line of its [-own-]{+own, else on a new line after the chain's last line and any comment trailing it,+} at the indentation of the chain's [-other-]{+last+} continuation [-lines.-]{+line.+}
@ C7 replace
- Removing a modifier written on a line of its own MUST remove that line.
+ Removing a modifier that starts its line and is followed on it by at most a comment MUST remove that line, the comment included; a modifier sharing its line with other code MUST be removed with the spaces before it on that line.
@ C8 edit
~ The operation `rename` MUST take a view node and an identifier and set the argument of the node's `.id(…)` [-modifier,-]{+modifier to it as a string literal,+} adding the modifier when the node has none and removing it when the identifier is `null`.
@ C11 edit
~ The operation `setComment` MUST take a view node and a text, or `null`, and replace the [-`//` -]comment lines [-directly above-]{+leading+} the node {+(R-EDIT-001.C11) +}with one{+ `//`+} line per line of the text, at the node's [-indentation.-]{+indentation, removing them for `null` or an empty text.+}
@ C14 insert after C13
+ `setArgument` MUST be refused for a label that is not an identifier, for a position outside 0 to the number of positional arguments, for a value that does not parse as one argument value (with the syntax diagnostic, its column counted from the start of the value), and for the removal of an argument the call does not have.
@ C15 insert after C14
+ A new argument placed next to an argument that starts its line MUST be written on a line of its own at that argument's indentation, the comma ending the line before.
@ C16 insert after C15
+ `setModifier` MUST be refused for a name that is not an identifier starting with a lower-case letter, for arguments that do not parse as an argument list, for an occurrence index outside 0 to the number of occurrences, and for the removal of an occurrence the chain does not have; an index equal to the number of occurrences adds one.
@ C17 insert after C16
+ `rename` MUST be refused for an empty identifier, and `rename` with `null` and `setRefs` with an empty list MUST be refused when the node has no such modifier.
@ C18 insert after C17
+ `setComment` MUST be refused for a node that does not start its line, and for `null` or an empty text when no comment lines lead the node.
@ C19 insert after C18
+ `setName` MUST be refused for a name that is not a capitalised identifier or several joined by dots, and the renamed node MUST get a new node id (R-EDIT-001.C10).
@ C20 insert after C19
+ Every operation of this requirement except `setComment` MUST be refused for an `if` node.

## Files

```diff
--- a/TC-1.md
+++ b/TC-1.md
@@ -3,3 +3,3 @@
 title: Argument, modifier and identifier cases
-verifies: [C1, C2, C3, C4, C5, C6, C7, C8, C10, C11, C12, C13]
+verifies: [C1, C2, C3, C4, C5, C6, C7, C8, C10, C11, C12, C13, C14, C15, C16, C18, C19, C20]
 ---
@@ -11 +11,11 @@
 expected file differs from its source only in the changed span.
+
+As built (#22): 41 cases in `shared/conformance/edit/` (`set-argument-*`, `set-modifier-*`, `rename-*`,
+`set-refs-*`, `set-comment-*`, `set-name*` and ten `refuse-*`), each source opening with a `//` line
+saying what it exercises, each expected file written by hand. The meta-test of
+`typescript/tests/unit/edit-corpus.test.ts` also requires the `covers` tags `setArgument:` `add-` /
+`replace-` / `remove-labelled` and `-positional`, `add-parens`, `remove-parens`, `multiline`;
+`setModifier:` `add-inline`, `add-line`, `replace`, `occurrence`, `remove-inline`, `remove-line`;
+`rename:` `add`, `replace`, `remove`; `setRefs:` `set`, `clear`; `setComment:` `add`, `replace`,
+`remove`; `setName`; and the refusals `duplicate-id`, `no-argument`, `no-modifier`, `argument-syntax`,
+`position`, `modifier-name`, `element-name`, `not-a-call` and `comment-inline`.
--- a/TC-2.md
+++ b/TC-2.md
@@ -3,3 +3,3 @@
 title: Duplicate identifier refused
-verifies: [C9]
+verifies: [C9, C14, C16, C17, C19]
 ---
@@ -8 +8,11 @@
 message naming the identifier, and returns no edits.
+
+As built (#22): `typescript/tests/unit/edit-set.test.ts`. Also: a node's own identifier and an unused
+one are accepted, and an identifier with quotes and a backslash is written as a string literal that
+the duplicate check reads back; argument, modifier, identifier, reference and comment edits keep every
+node id, `setName` gives the renamed node a new one; nodes are named by id; a value that does not parse
+is refused with one syntax diagnostic on line 1 whose column lies within the value, modifier arguments
+that are not an argument list and a value of two arguments are refused; `rename` to `null`, `setRefs`
+with `[]` and `setComment` with `null` on a node without the modifier or comment, a modifier index
+past the next occurrence and a negative position are refused; an index equal to the number of
+occurrences adds a modifier.
--- a/prose.md
+++ b/prose.md
@@ -9,2 +9,11 @@
 | `setName` `VBtn` | `Button("Save").id("save")` | `VBtn("Save").id("save")` |
+
+As built (#22), the operations are objects like those of R-EDIT-002, the node named by id or ordinal:
+`{op: "setArgument", node, label, position, value}`, `{op: "setModifier", node, name, index, args}`
+(`args` is the code between the parentheses, `""` for `.bold()`), `{op: "rename", node, id}`,
+`{op: "setRefs", node, refs}`, `{op: "setComment", node, text}` and `{op: "setName", node, name}`.
+Removing what is not there is refused rather than ignored, so a host learns that its view of the code
+is stale. A new argument next to one that starts its line goes on a line of its own, so a call written
+one argument per line stays that way. A renamed element gets a new node id, as any edit of a node's name
+does (R-EDIT-001.C10); a host that converts an element re-selects it by its position.
 
```
