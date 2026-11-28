---
id: R-EDIT-001
title: Source spans and node identities
status: active
version: 0.12.12
rev: 6
page: WEB.3
slot: reqs
order: 1
hash: 8cf1a52e8505
source: [SRC-12]
realizes: [F-21]
requires: [R-WEB-001]
constrained_by: [A-WEB-1, ADR-21]
refs: [M-EDIT-3, R-EDIT-002]
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
