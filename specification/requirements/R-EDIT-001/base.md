---
id: R-EDIT-001
title: Source spans and node identities
status: active
version: 0.10.0
rev: 0
page: WEB.3
slot: reqs
order: 1
hash: c93cfe40a290
source: [SRC-12]
realizes: [F-21]
requires: [R-WEB-001]
constrained_by: [A-WEB-1, ADR-21]
---

C1: The TypeScript parser MUST record, for every syntax node, its start and end offsets in the source text (UTF-16 code units, end exclusive) in addition to its line and column.
C2: The TypeScript lexer MUST record the offsets of every comment (`//` and `/* … */`), so that the text between two consecutive tokens, comments included, can be read back from the source.
C3: The view nodes of a source MUST be its calls whose callee is an identifier or a dotted name of identifiers (`Text("a")`, `VStack { … }`, `Badge.Ribbon("New")`), its identifiers that stand alone as a view statement or as the base of a modifier chain in one (`Divider`, `Spacer.frame(height: 8)`), and its `if` statements; a modifier call MUST NOT be a view node and MUST belong to the view node whose chain it is in.
C4: The view nodes MUST be numbered from 1 in the order of the start offsets of their first tokens, across the whole source including struct bodies; a node's ordinal MUST be written `n<k>` (`n1`, `n2`, …).
C5: The package MUST export `parseTree(source)`, which returns `{tree, diagnostics}`: the syntax tree with its view nodes, or `tree: null` with the syntax diagnostics when the source does not parse.
C6: Each view node of a tree MUST have a node id: an opaque string, unique within the tree and never reused for another node of the trees derived from it.
C7: Each view node MUST expose its id, its ordinal, its element or struct name as written, its span (the offsets from its first token to the end of its modifier chain and closures), the span of its name, its parent view node and its child view nodes in source order (closures, slots and the branches of an `if` included).
C8: The tree MUST look up a view node by id, by ordinal and by offset, the last giving the innermost view node whose span holds the offset.
C9: The package MUST export `reparse(tree, edits)`, which applies text edits (M-EDIT-3) to the tree's source and returns `{tree, diagnostics}` for the edited text, with the ids of C10.
C10: In the tree `reparse` returns, a view node whose name span lies outside every edited range MUST keep the id of the corresponding node of the old tree; a view node whose name span lies in an inserted or replaced range MUST get a new id.
C11: The span of a view node MUST also cover the comment lines directly above its first line, which belong to it when it is moved or removed (R-EDIT-002).
V1: For every case of the conformance corpus, each view node's span reads back as its text from the source, the ordinals follow source order, and a `reparse` after an edit outside a node keeps that node's id.
<!-- file: TC-1.md -->
---
id: TC-1
title: Spans, ordinals and ids
verifies: [C1, C2, C3, C4, C5, C7, C8, C11]
---

`node:test` (`typescript/tests/unit/tree.test.ts`): for every case of `shared/conformance/` that parses,
each view node's span and name span read back from the source as the node's text and name, its leading
comment lines included; the ordinals are `n1…nK` in source order; a modifier call is not a node; the
lookup by offset returns the innermost node. A source with a syntax error returns `tree: null` and the
same diagnostics as `check`.
<!-- file: TC-2.md -->
---
id: TC-2
title: Ids survive edits
verifies: [C6, C9, C10]
---

`node:test`: parse a formatted source with comments, a `let`, a `ForEach` and an `if`; apply, with
`reparse`, an insertion before a node, a replacement inside a sibling's arguments and a removal of
another sibling; every node whose name was not in an edited range keeps its id, the inserted node has
a new id, and no id of a removed node reappears in later trees.
<!-- file: prose.md -->
The syntax tree the editor works on. The renderer only needs line and column; an editor needs to know
exactly which characters belong to which call, so that an edit can replace a span and leave everything
else as the author wrote it — comments included, which the lexer used to drop.

A *view node* is what a designer selects: an element or struct call, a bare view identifier, or an
`if` statement. Modifier calls are not nodes of their own; they belong to the call they modify. Two
numberings coexist. The *ordinal* (`n1`, `n2`, …) is the node's position in the source and is what any
parser can compute, so the Python variant can put it in an edit-mode rendering too (R-EDIT-004,
ADR-22). The *id* is the TypeScript session's stable name for a node: it survives every edit that does
not touch the node's name, so the selection, the outline's expansion and the undo history keep pointing
at the same node while the code around it changes.

```text
// Sign-in form            ← comment: part of VStack's span (C11)
VStack(spacing: 12) {      ← n1  VStack
  Text("Welcome")          ← n2  Text
    .font(.title)          ←     modifier of n2
  if showHint {            ← n3  if
    Text("Forgot it?")     ← n4  Text
  }
}
```
