---
id: R-EDIT-002
title: "Edit API: insert, remove and move"
status: active
version: pending
rev: 5
page: WEB.3
slot: reqs
order: 2
hash: 69c5506bffdf
source: [SRC-12]
realizes: [F-21]
requires: [R-EDIT-001]
constrained_by: [A-WEB-1, M-EDIT-3, ADR-21]
refs: [M-EDIT-3, R-EDIT-001]
---

C1: The package MUST export `edit(source, op)`, which applies one edit operation to a source and returns `{edits, source, tree}` — the text edits (M-EDIT-3) in ascending, non-overlapping order, the edited source and its tree (R-EDIT-001.C9) — or `{error}` with a message and no edits when the operation is refused.
C2: Applying the returned edits to the source MUST yield the returned source, and every character outside the edited ranges MUST be kept, comments, blank lines and the formatting of other calls included.
C3: An operation MUST name its nodes by node id or by ordinal, and MUST be refused when a named node is not a view node of the source.
C4: The operation `insert` MUST take a parent view node, an index among its children (or `end`) and the code of one view (a call with its modifier chain and closures), and insert that code as the parent's child at that position.
C5: When the parent of an `insert` has no trailing closure, the edit MUST give it one, written ` {` after the call's arguments and `}` on its own line at the parent's indentation.
C6: The operation `remove` MUST take one or more sibling view nodes and delete each one's span with its line, so that no blank line is left where there was none.
C7: When `remove` deletes every child of a closure, the closure's braces MUST stay, with the `{` and the `}` on the lines they were on.
C8: The operation `move` MUST take one or more sibling view nodes, a new parent and an index, and move the nodes' spans there in their order; the moved nodes MUST keep their node ids.
C9: A `move` into one of the moved nodes or into one of their descendants MUST be refused.
C10: Inserted and moved code MUST be indented with the child indentation of its new parent: the indentation of the parent's first existing child, else the parent's line indentation plus one indentation unit.
C11: The indentation unit MUST be the smallest non-zero indentation step found in the source, else four spaces.
C12: Code given to `insert` MUST be re-indented line by line, its first line taking the child indentation and its other lines keeping their indentation relative to the first.
C13: Code written by an operation from parts (a new closure, a new argument, a new modifier) MUST put one view call per line, chain its modifiers on that line and put each closure child on its own line one unit deeper.
C14: An `insert` whose code does not parse as exactly one view MUST be refused with the syntax diagnostic.
C15: `shared/conformance/edit/` MUST hold the edit corpus: cases named `<name>.mockitdown` (the source), `<name>.op.json` (the operation, its nodes named by ordinal) and `<name>.expected.mockitdown` (the edited source), listed in `shared/conformance/edit/index.json` as `{"cases": [{"name", "op"}, …]}`.
C16: The edit corpus MUST cover each operation at the first, a middle and the last position, into an empty parent and a parent without a closure, in sources with comments, blank lines, `let`, `ForEach`, `if` and struct declarations, and every refusal of this requirement.
C17: The TypeScript test suite MUST run every edit case under `node:test` and fail when the edited source differs from the expected file, or when the edited source renders with a diagnostic that the original source did not have.
C18: A case whose operation is refused MUST give `<name>.error.txt`, holding the expected message, in place of the expected source.
V1: Every case of `shared/conformance/edit/` passes, and each edited source renders without a new diagnostic.
