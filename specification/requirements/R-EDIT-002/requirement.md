---
id: R-EDIT-002
title: "Edit API: insert, remove and move"
status: active
version: 0.13.8
rev: 7
page: WEB.3
slot: reqs
order: 2
hash: 9810e9de26bb
source: [SRC-12]
realizes: [F-21]
requires: [R-EDIT-001]
constrained_by: [A-WEB-1, M-EDIT-3, ADR-21]
refs: [M-EDIT-3, R-EDIT-001]
---

C1: The package MUST export `edit(source, op)`, which applies one edit operation to a source, or to a syntax tree whose ids the result then continues, and returns `{edits, source, tree}` — the text edits (M-EDIT-3) in ascending, non-overlapping order, the edited source and its tree (R-EDIT-001.C9) — or `{error, diagnostics}` with a message, the syntax diagnostics when code did not parse, and no edits when the operation is refused.
C2: Applying the returned edits to the source MUST yield the returned source, and every character outside the edited ranges MUST be kept, comments, blank lines and the formatting of other calls included.
C3: An operation MUST name its nodes by node id or by ordinal (`n3`, or the number 3), and MUST be refused when a named node is not a view node of the source.
C4: The operation `insert` MUST take a parent view node, or `null` for the top level of the source, an index among its statement children (C19), or among the top level's view statements, (or `end`) and the code of one view (a call with its modifier chain and closures), and insert that code as the parent's child, or as a top-level statement, at that position.
C5: When the parent of an `insert` has no trailing closure, the edit MUST give it one, written ` {` after the call's arguments and `}` on its own line at the parent's indentation.
C6: The operation `remove` MUST take one or more sibling view nodes and delete each one's span with its line, so that no blank line is left where there was none.
C7: When `remove` deletes every child of a closure, the closure's braces MUST stay, with the `{` and the `}` on the lines they were on.
C8: The operation `move` MUST take one or more sibling view nodes, a new parent and an index among the new parent's statement children before the move, and move the nodes' spans there in source order; the moved nodes and their descendants MUST keep their node ids.
C9: A `move` into one of the moved nodes or into one of their descendants MUST be refused.
C10: Inserted and moved code MUST be indented with the child indentation of its new parent: the indentation of the parent's first existing child, else the parent's line indentation plus one indentation unit.
C11: The indentation unit MUST be a tab when the source's lines are indented with tabs, else the smallest increase of indentation between consecutive non-blank lines, else four spaces.
C12: Code given to `insert` MUST be re-indented line by line, its first line taking the child indentation and its other lines keeping their indentation relative to the first.
C13: Code written by an operation from parts (a new closure, a new argument, a new modifier) MUST put one view call per line, chain its modifiers on that line and put each closure child on its own line one unit deeper.
C14: An `insert` whose code does not parse as exactly one view MUST be refused: with the syntax diagnostic when it does not parse, and with a message saying what it holds (several statements, no view, a `let`, an import, a directive or a struct) otherwise.
C15: `shared/conformance/edit/` MUST hold the edit corpus: cases named `<name>.mockitdown` (the source), `<name>.op.json` (the operation, its nodes named by ordinal) and `<name>.expected.mockitdown` (the edited source), listed in `shared/conformance/edit/index.json` as `{"cases": [{"name", "op"}, …]}`.
C16: The edit corpus MUST cover each operation at the first, a middle and the last position, into an empty parent and a parent without a closure, an `insert` at the top level, in sources with comments, blank lines, `let`, `ForEach`, `if` and struct declarations, and every refusal of this requirement.
C17: The TypeScript test suite MUST run every edit case under `node:test` and fail when the edited source differs from the expected file, or when the edited source renders with a diagnostic that the original source did not have.
C18: A case whose operation is refused MUST give `<name>.error.txt`, holding the expected message, in place of the expected source.
C19: The statement children of a view node MUST be the view nodes standing as statements in its content: the unlabelled trailing closure of a call, or the braced branches of an `if` in order, the then branch taking the indexes up to its number of children.
C20: A node named by `remove` or `move` MUST be a statement of a body (a closure, a braced `if` branch, a struct body or the top level of the source), and the operation MUST be refused for an argument, a `let` value or an `else if`.
C21: A `remove` or `move` MUST be refused when its nodes are not statements of one body, when a node is named twice, or when it names no node.
C22: An index MUST be an integer from 0 to the parent's number of statement children, or `end`, and any other index MUST be refused.
C23: An `insert` or `move` into a call whose only trailing closures are labelled MUST be refused.
C24: An unknown operation, and any operation on a source that does not parse, MUST be refused, the latter with the syntax diagnostic.
C25: When nothing precedes a node on its first line and at most a `;` and a comment follow it on its last line, `remove` MUST delete its whole lines, the trailing comment included, together with the blank lines that would be left directly after an opening `{` line, directly before a closing `}` line or at the end of the source.
C26: A node that shares a line with other code MUST be removed with the `;` and spaces after it, else with the `;` and spaces before it, else with the spaces that would be left around it at the end of its line.
C27: Code inserted before a statement child that does not start its line, or after the last statement of a closure whose `}` follows code on its line, MUST be written on that line, separated from its neighbour by `; `.
C28: An `insert` or `move` into an empty closure written on one line (`{}`) MUST put the code on lines of its own and the `}` on its own line at the parent's indentation.
C29: A moved node that stands on its own lines (C25) MUST carry the comment trailing its last line.
C30: Each `<name>.op.json` MUST carry a `covers` list naming the situations of C16 the case covers, and the TypeScript test suite MUST fail when a situation is covered by no case.
C31: An `insert` at the top level MUST write the code before the view statement at its index, on lines of its own when that statement starts its line and else before it on its line followed by `; `, or, at the end, on a new line after the line of the last top-level statement, else at the end of the source, with the indentation of the first top-level view when it starts its line, else none.
V1: Every case of `shared/conformance/edit/` passes, and each edited source renders without a new diagnostic.
