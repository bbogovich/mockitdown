---
title: "Editing core"
spec_version: 0.13.2
status: draft
updated: 2026-11-28
page_id: WEB.3
---

# Editing core

What the TypeScript core offers the design tools (F-21, F-19, F-20; SRC-12#s9, SRC-12#s13): a syntax
tree that keeps every node's position and gives each view node an identity, structural edits that
return minimal text changes, a rendering made for editing that ties each element to its node, the
design document module and the design session with its history and commands.

The code is the source of truth. Every visual edit is an edit to the code — an insertion, removal or
replacement of a text span — and is never a regeneration of the mockup from a model, so the author's
formatting, comments, `let` bindings, `ForEach` loops and `if` conditions survive. The edit API exists
in TypeScript only; its printing rules are kept as language-neutral cases in `shared/conformance/edit/`
(ADR-21). The rendering made for editing exists in both variants and is held to the conformance corpus
like any other rendering (ADR-22).

The project has no design tier: these requirements and those of the design-tool pages cite the
features F-19, F-20 and F-21 and the sources SRC-12 to SRC-15 directly; the screen mockups SRC-13 to
SRC-15 are illustrations, not design items.

### R-EDIT-001 — Source spans and node identities

**Requires:** R-WEB-001

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

As built (#20), `parseTree(source)` and `reparse(tree, edits)` live in `typescript/src/core/syntax/tree.ts`.
A view node gives `id`, `ordinal` (`"n3"`), `index` (3), `kind`, `name`, `span`, `nameSpan`, `first`
(its first token's offset), `parent`, `children`, `syntax`, `expr` and `modifiers`; the tree gives
`nodes`, `roots`, `comments`, `byId`, `byOrdinal` (`"n3"` or 3), `atOffset` and `text(span)`. Ids are
`id1`, `id2`, …, from a counter a tree shares only with the trees derived from it. Whether `Badge.Ribbon`
is a dotted name or `Badge` with a modifier is decided by the capital letter (C12), so the tree needs no
pack: the evaluator still resolves names against the pack when it renders.

Re-checked at 0.10.3 together with the items it cites or is cited by (specification audit, #51): the citations are still accurate and no obligation changed.

**Re-checked at specification 0.10.6.** A-REND-1 and A-WEB-1 were revised as built by the behaviour-preserving renderer split (#48, #49), and the gallery test cases only renamed their files (#50); no obligation here changed.

**Re-checked at specification 0.10.7.** Its prerequisites were re-checked after the renderer split (#48, #49) and the gallery spec split (#50) without any change to an obligation; neither is this item changed.

**Re-checked at 0.11.0.** Its cited items ADR-21, R-WEB-001 changed with SRC-18 (all packs recorded, stylesheet partials, gallery home page and easter eggs, TypeScript release builds, new packs); no obligation of this item changed.


**Re-checked at specification 0.12.10.** Re-read against R-WEB-001 (changed at 0.12.0: SRC-19 import map (0.12.0), which changes how imports are found and nothing this item obliges). No obligation this item rests on changed, and none of its clauses is altered (#81).


**Re-checked at specification 0.12.12.** Re-read after the clarification records of the items it cites (#81), which closed the suspect citations left by the test-case backfills (#54 to #60) and the SRC-19 import map (0.12.0). No obligation it rests on changed, and none of its clauses is altered.

**R-EDIT-001.TC-1 — Spans, ordinals and ids**

`node:test` (`typescript/tests/unit/tree.test.ts`): for every case of `shared/conformance/` that parses,
each view node's span and name span read back from the source as the node's text and name, its leading
comment lines included; the ordinals are `n1…nK` in source order; a modifier call is not a node; the
lookup by offset returns the innermost node. A source with a syntax error returns `tree: null` and the
same diagnostics as `check`.

Besides the corpus, cases in the same file: the narrative example (names, kinds, parents, the comment
above `VStack` in its span), a call inside a modifier's argument (a node) next to the modifiers (none),
a struct body numbered with the rest, UTF-16 offsets past an emoji and inside an interpolation, nested
block comments recorded, comment lines leading a node only when contiguous and not trailing code, and
the lookups by offset, id and ordinal.

**R-EDIT-001.TC-2 — Ids survive edits**

`node:test` (`typescript/tests/unit/tree.test.ts`): parse a formatted source with comments, a `let`, a `ForEach` and an `if`; apply, with
`reparse`, an insertion before a node, a replacement inside a sibling's arguments and a removal of
another sibling; every node whose name was not in an edited range keeps its id, the inserted node has
a new id, and no id of a removed node reappears in later trees.

Also: replacing a node's name gives it a new id while its siblings keep theirs; an edit that breaks the
source returns `tree: null` with the syntax diagnostic, and the old tree still reparses; edits out of
order, overlapping or out of range throw a `RangeError`.

**Realizes.** F-21

| | Statement |
|---|---|
| C1 | The TypeScript parser MUST record, for every syntax node, its start and end offsets in the source text (UTF-16 code units, end exclusive) in addition to its line and column. |
| C2 | The TypeScript lexer MUST record the offsets of every comment (`//` and `/* … */`), so that the text between two consecutive tokens, comments included, can be read back from the source. |
| C3 | The view nodes of a source MUST be its calls whose callee is an identifier or a dotted name of identifiers (`Text("a")`, `VStack { … }`, `Badge.Ribbon("New")`), wherever they stand (statements, arguments, modifier arguments, `let` values), its identifiers that stand alone as a view statement or as the base of a modifier chain in one (`Divider`, `Spacer.frame(height: 8)`), and its `if` statements; a modifier call MUST NOT be a view node and MUST belong to the view node whose chain it is in. |
| C4 | The view nodes MUST be numbered from 1 in the order of the start offsets of their first tokens, across the whole source including struct bodies; a node's ordinal MUST be written `n<k>` (`n1`, `n2`, …). |
| C5 | The package MUST export `parseTree(source)`, which returns `{tree, diagnostics}`: the syntax tree with its view nodes, or `tree: null` with the syntax diagnostics when the source does not parse. |
| C6 | Each view node of a tree MUST have a node id: an opaque string, unique within the tree and never reused for another node of the trees derived from it. |
| C7 | Each view node MUST expose its id, its ordinal, its element or struct name as written, its span (the offsets from its first token to the end of its modifier chain and closures), the span of its name, its parent view node and its child view nodes in source order (closures, slots and the branches of an `if` included). |
| C8 | The tree MUST look up a view node by id, by ordinal and by offset, the last giving the innermost view node whose span holds the offset. |
| C9 | The package MUST export `reparse(tree, edits)`, which applies text edits (M-EDIT-3) to the tree's source and returns `{tree, diagnostics}` for the edited text, with the ids of C10. |
| C10 | In the tree `reparse` returns, a view node whose name span lies outside every edited range MUST keep the id of the corresponding node of the old tree; a view node whose name span lies in an inserted or replaced range MUST get a new id. |
| C11 | The span of a view node MUST also cover the comment lines directly above its first line, which belong to it when it is moved or removed (R-EDIT-002). |
| C12 | A member segment of a callee MUST continue the dotted name when it starts with a capital letter (`Badge.Ribbon`) and MUST be a modifier otherwise (`Spacer.frame`), whatever the pack. |
| C13 | The leading comment lines of C11 MUST be the contiguous lines holding only comments directly above the node's first line, and only when the node's first token is the first on its line; a blank line, or a line whose comment follows code, MUST end them. |
| C14 | The span of a view node that is not a view statement (an argument, a `let` value) MUST start at its first token. |
| C15 | In the tree `reparse` returns, a view node whose name a removal falls inside MUST get a new id, and a kept id MUST belong to an old node with the same name and the same name span before the edits. |
| C16 | `reparse` MUST throw a `RangeError` for edits out of order, overlapping one another or outside the text, and MUST leave the old tree usable. |
| C17 | Each token of the TypeScript lexer MUST carry its start and end offsets. |
| C18 | Each view node MUST expose its ordinal both as written (`n3`) and as a number, its kind (call, identifier or `if`) and its modifiers in source order. |
| V1 | For every case of the conformance corpus, each view node's span reads back as its text from the source, the ordinals follow source order, and a `reparse` after an edit outside a node keeps that node's id. |

---

### R-EDIT-002 — Edit API: insert, remove and move

**Requires:** R-EDIT-001

The first half of the edit API (SRC-12#s13). Each operation returns the smallest text change that
does the job, so that a host can apply it to its own copy of the code, an undo step can invert it, and a
diff of the document shows only what the designer changed.

```js
const { edits, source, tree } = edit(code, {
  op: "insert", parent: "n1", index: "end", code: 'Toggle("Remember me")',
});
// edits: [{ start: 58, end: 58, text: '  Toggle("Remember me")\n' }]
```

Positions count a parent's *statement children*: the views standing as statements in its content
closure (or in the braced branches of an `if`), so an index is what an outline shows, not an offset.
Only such statements are removed or moved here; a view in an argument or a `let` value is changed by
the argument operations (R-EDIT-003). A host that holds a tree passes it instead of the source, so the
result continues its ids: a moved node keeps its id across the move, which a host's selection follows.

```js
const r = edit(tree, { op: "move", nodes: ["n4"], parent: "n1", index: 0 });
if ("error" in r) showMessage(r.error);   // e.g. "cannot move n2 into n3, one of its descendants"
```

A node on lines of its own leaves with its lines, its leading comment lines and a comment trailing it;
a node sharing a line leaves with its `;` separator. Blank lines that would end up against a brace go
with it, so a removal never opens a gap that was not there.

The printing rules for new code — indentation from the parent, one call per line, the indentation unit
of the file — are fixed by the edit corpus rather than by prose alone. The corpus is data (a source, an
operation, the expected text), so the Python variant can run the same cases if it ever gains the edit API
(ADR-21). Node references in a case are ordinals, because ids are not written in the source.

Re-checked at 0.10.3 together with the items it cites or is cited by (specification audit, #51): the citations are still accurate and no obligation changed.

**Re-checked at specification 0.10.6.** A-REND-1 and A-WEB-1 were revised as built by the behaviour-preserving renderer split (#48, #49), and the gallery test cases only renamed their files (#50); no obligation here changed.

**Re-checked at specification 0.10.7.** Its prerequisites were re-checked after the renderer split (#48, #49) and the gallery spec split (#50) without any change to an obligation; neither is this item changed.

**Re-checked at 0.11.0.** Its cited items ADR-21, R-EDIT-001 changed with SRC-18 (all packs recorded, stylesheet partials, gallery home page and easter eggs, TypeScript release builds, new packs); no obligation of this item changed.


**Re-checked at specification 0.12.12.** Re-read after the clarification records of the items it cites (#81), which closed the suspect citations left by the test-case backfills (#54 to #60) and the SRC-19 import map (0.12.0). No obligation it rests on changed, and none of its clauses is altered.

**R-EDIT-002.TC-1 — The edit corpus**

`node:test` (`typescript/tests/unit/edit-corpus.test.ts`) over `shared/conformance/edit/index.json`:
for each case, `edit(source, op)` yields exactly `<name>.expected.mockitdown` (or the message of
`<name>.error.txt`), applying `edits` to the source yields the same text, and the edited source renders
with no diagnostic the original lacked. A meta-test fails when the corpus lacks one of the situations
of C16 (each case's `op.json` carries a `covers` list).

As built (#21): 61 cases (`insert-*`, `remove-*`, `move-*`, `refuse-*`), each source opening with a `//`
line saying what it exercises. The meta-test requires the `covers` tags `insert:`, `remove:` and
`move:` `first`/`middle`/`last`, `insert:empty`, `insert:no-closure`, `remove:all`, `move:empty`,
`move:no-closure`, `source:comments`, `blank-lines`, `let`, `foreach`, `if`, `struct`, `indent:unit`,
`tabs`, `relative`, and one `refuse:` tag per refusal (C3, C9, C14, C20 to C24); a refused case carries
a `refuse:` tag and only a refused case does. It also fails on a file in `edit/` that belongs to no case.

**R-EDIT-002.TC-2 — Refusals and ids**

`node:test` (`typescript/tests/unit/edit.test.ts`): a node that is a modifier call or does not exist, a move into the moved node's own
descendant and an insert of code with two views or a syntax error are refused with a message and no
edits; after a move, the moved nodes keep their ids.
Nodes are named by id, by `n6` and by 6 with the same result; an edit of a tree continues its ids,
and inserted nodes get new ones; `indentUnit` gives two or three spaces, a tab, or four spaces for a
source without indentation; an index past the children or negative, and a parent with only labelled
closures, are refused.

**Realizes.** F-21

| | Statement |
|---|---|
| C1 | The package MUST export `edit(source, op)`, which applies one edit operation to a source, or to a syntax tree whose ids the result then continues, and returns `{edits, source, tree}` — the text edits (M-EDIT-3) in ascending, non-overlapping order, the edited source and its tree (R-EDIT-001.C9) — or `{error, diagnostics}` with a message, the syntax diagnostics when code did not parse, and no edits when the operation is refused. |
| C2 | Applying the returned edits to the source MUST yield the returned source, and every character outside the edited ranges MUST be kept, comments, blank lines and the formatting of other calls included. |
| C3 | An operation MUST name its nodes by node id or by ordinal (`n3`, or the number 3), and MUST be refused when a named node is not a view node of the source. |
| C4 | The operation `insert` MUST take a parent view node, an index among its statement children (C19) (or `end`) and the code of one view (a call with its modifier chain and closures), and insert that code as the parent's child at that position. |
| C5 | When the parent of an `insert` has no trailing closure, the edit MUST give it one, written ` {` after the call's arguments and `}` on its own line at the parent's indentation. |
| C6 | The operation `remove` MUST take one or more sibling view nodes and delete each one's span with its line, so that no blank line is left where there was none. |
| C7 | When `remove` deletes every child of a closure, the closure's braces MUST stay, with the `{` and the `}` on the lines they were on. |
| C8 | The operation `move` MUST take one or more sibling view nodes, a new parent and an index among the new parent's statement children before the move, and move the nodes' spans there in source order; the moved nodes and their descendants MUST keep their node ids. |
| C9 | A `move` into one of the moved nodes or into one of their descendants MUST be refused. |
| C10 | Inserted and moved code MUST be indented with the child indentation of its new parent: the indentation of the parent's first existing child, else the parent's line indentation plus one indentation unit. |
| C11 | The indentation unit MUST be a tab when the source's lines are indented with tabs, else the smallest increase of indentation between consecutive non-blank lines, else four spaces. |
| C12 | Code given to `insert` MUST be re-indented line by line, its first line taking the child indentation and its other lines keeping their indentation relative to the first. |
| C13 | Code written by an operation from parts (a new closure, a new argument, a new modifier) MUST put one view call per line, chain its modifiers on that line and put each closure child on its own line one unit deeper. |
| C14 | An `insert` whose code does not parse as exactly one view MUST be refused: with the syntax diagnostic when it does not parse, and with a message saying what it holds (several statements, no view, a `let`, an import, a directive or a struct) otherwise. |
| C15 | `shared/conformance/edit/` MUST hold the edit corpus: cases named `<name>.mockitdown` (the source), `<name>.op.json` (the operation, its nodes named by ordinal) and `<name>.expected.mockitdown` (the edited source), listed in `shared/conformance/edit/index.json` as `{"cases": [{"name", "op"}, …]}`. |
| C16 | The edit corpus MUST cover each operation at the first, a middle and the last position, into an empty parent and a parent without a closure, in sources with comments, blank lines, `let`, `ForEach`, `if` and struct declarations, and every refusal of this requirement. |
| C17 | The TypeScript test suite MUST run every edit case under `node:test` and fail when the edited source differs from the expected file, or when the edited source renders with a diagnostic that the original source did not have. |
| C18 | A case whose operation is refused MUST give `<name>.error.txt`, holding the expected message, in place of the expected source. |
| C19 | The statement children of a view node MUST be the view nodes standing as statements in its content: the unlabelled trailing closure of a call, or the braced branches of an `if` in order, the then branch taking the indexes up to its number of children. |
| C20 | A node named by `remove` or `move` MUST be a statement of a body (a closure, a braced `if` branch, a struct body or the top level of the source), and the operation MUST be refused for an argument, a `let` value or an `else if`. |
| C21 | A `remove` or `move` MUST be refused when its nodes are not statements of one body, when a node is named twice, or when it names no node. |
| C22 | An index MUST be an integer from 0 to the parent's number of statement children, or `end`, and any other index MUST be refused. |
| C23 | An `insert` or `move` into a call whose only trailing closures are labelled MUST be refused. |
| C24 | An unknown operation, and any operation on a source that does not parse, MUST be refused, the latter with the syntax diagnostic. |
| C25 | When nothing precedes a node on its first line and at most a `;` and a comment follow it on its last line, `remove` MUST delete its whole lines, the trailing comment included, together with the blank lines that would be left directly after an opening `{` line, directly before a closing `}` line or at the end of the source. |
| C26 | A node that shares a line with other code MUST be removed with the `;` and spaces after it, else with the `;` and spaces before it, else with the spaces that would be left around it at the end of its line. |
| C27 | Code inserted before a statement child that does not start its line, or after the last statement of a closure whose `}` follows code on its line, MUST be written on that line, separated from its neighbour by `; `. |
| C28 | An `insert` or `move` into an empty closure written on one line (`{}`) MUST put the code on lines of its own and the `}` on its own line at the parent's indentation. |
| C29 | A moved node that stands on its own lines (C25) MUST carry the comment trailing its last line. |
| C30 | Each `<name>.op.json` MUST carry a `covers` list naming the situations of C16 the case covers, and the TypeScript test suite MUST fail when a situation is covered by no case. |
| V1 | Every case of `shared/conformance/edit/` passes, and each edited source renders without a new diagnostic. |

---

### R-EDIT-003 — Edit API: arguments, modifiers and identifiers

**Requires:** R-EDIT-002

The second half of the edit API: the operations the inspector uses. They work on one call and leave
its neighbours, and its own formatting outside the changed span, untouched.

| Operation | Before | After |
|---|---|---|
| `setArgument` label `role`, value `.destructive` | `Button("Delete")` | `Button("Delete", role: .destructive)` |
| `setModifier` `padding`, `null` | `Text("A")` ⏎ `  .padding()` ⏎ `  .bold()` | `Text("A")` ⏎ `  .bold()` |
| `rename` `"save"` | `Button("Save")` | `Button("Save").id("save")` |
| `setName` `VBtn` | `Button("Save").id("save")` | `VBtn("Save").id("save")` |

As built (#22), the operations are objects like those of R-EDIT-002, the node named by id or ordinal:
`{op: "setArgument", node, label, position, value}`, `{op: "setModifier", node, name, index, args}`
(`args` is the code between the parentheses, `""` for `.bold()`), `{op: "rename", node, id}`,
`{op: "setRefs", node, refs}`, `{op: "setComment", node, text}` and `{op: "setName", node, name}`.
Removing what is not there is refused rather than ignored, so a host learns that its view of the code
is stale. A new argument next to one that starts its line goes on a line of its own, so a call written
one argument per line stays that way. A renamed element gets a new node id, as any edit of a node's name
does (R-EDIT-001.C10); a host that converts an element re-selects it by its position.

`setName` is the basis of the Convert command (R-EDIT-009); which arguments survive a conversion is the
command's business, not the operation's.

Re-checked at 0.10.3 together with the items it cites or is cited by (specification audit, #51): the citations are still accurate and no obligation changed.

**Re-checked at specification 0.10.6.** A-REND-1 and A-WEB-1 were revised as built by the behaviour-preserving renderer split (#48, #49), and the gallery test cases only renamed their files (#50); no obligation here changed.

**Re-checked at specification 0.10.7.** Its prerequisites were re-checked after the renderer split (#48, #49) and the gallery spec split (#50) without any change to an obligation; neither is this item changed.

**Re-checked at 0.11.0.** Its cited items ADR-21, R-EDIT-002 changed with SRC-18 (all packs recorded, stylesheet partials, gallery home page and easter eggs, TypeScript release builds, new packs); no obligation of this item changed.


**Re-checked at specification 0.12.12.** Re-read after the clarification records of the items it cites (#81), which closed the suspect citations left by the test-case backfills (#54 to #60) and the SRC-19 import map (0.12.0). No obligation it rests on changed, and none of its clauses is altered.

**R-EDIT-003.TC-1 — Argument, modifier and identifier cases**

Edit corpus cases (run by R-EDIT-002.TC-1) for each operation: add, replace and remove a positional and
a labelled argument; parentheses added to `Divider` and removed from `VStack(spacing: 8) { … }`; a
modifier added to a one-line and to a multi-line chain, replaced, and removed from both; `.id` set,
replaced and removed; `.ref` set and cleared; a comment set, replaced and removed; a name replaced. Each
expected file differs from its source only in the changed span.

As built (#22): 41 cases in `shared/conformance/edit/` (`set-argument-*`, `set-modifier-*`, `rename-*`,
`set-refs-*`, `set-comment-*`, `set-name*` and ten `refuse-*`), each source opening with a `//` line
saying what it exercises, each expected file written by hand. The meta-test of
`typescript/tests/unit/edit-corpus.test.ts` also requires the `covers` tags `setArgument:` `add-` /
`replace-` / `remove-labelled` and `-positional`, `add-parens`, `remove-parens`, `multiline`;
`setModifier:` `add-inline`, `add-line`, `replace`, `occurrence`, `remove-inline`, `remove-line`;
`rename:` `add`, `replace`, `remove`; `setRefs:` `set`, `clear`; `setComment:` `add`, `replace`,
`remove`; `setName`; and the refusals `duplicate-id`, `no-argument`, `no-modifier`, `argument-syntax`,
`position`, `modifier-name`, `element-name`, `not-a-call` and `comment-inline`.

**R-EDIT-003.TC-2 — Duplicate identifier refused**

`node:test`: with `.id("save")` on one button, `rename` of another button to `save` is refused with a
message naming the identifier, and returns no edits.

As built (#22): `typescript/tests/unit/edit-set.test.ts`. Also: a node's own identifier and an unused
one are accepted, and an identifier with quotes and a backslash is written as a string literal that
the duplicate check reads back; argument, modifier, identifier, reference and comment edits keep every
node id, `setName` gives the renamed node a new one; nodes are named by id; a value that does not parse
is refused with one syntax diagnostic on line 1 whose column lies within the value, modifier arguments
that are not an argument list and a value of two arguments are refused; `rename` to `null`, `setRefs`
with `[]` and `setComment` with `null` on a node without the modifier or comment, a modifier index
past the next occurrence and a negative position are refused; an index equal to the number of
occurrences adds a modifier.

**Realizes.** F-21

| | Statement |
|---|---|
| C1 | The operation `setArgument` MUST take a view node, a label (or `null` and a position for a positional argument) and the code of a value, or `null` to remove the argument, and add, replace or remove that argument of the node's call. |
| C2 | `setArgument` MUST replace an existing argument's value in place, append a new labelled argument after the call's last argument, and insert a new positional argument at its position among the positional arguments: before the one at that position, else after the last positional argument, else before the first argument. |
| C3 | Removing an argument MUST also remove the comma and the space that separated it from its neighbour. |
| C4 | When an argument is added to a call written without parentheses (`Divider`, `VStack { … }`), the edit MUST add the parentheses directly after the name; when the last argument of a call with a trailing closure is removed, the empty parentheses MUST be removed too, and kept on a call without one. |
| C5 | The operation `setModifier` MUST take a view node, a modifier name, an occurrence index (default 0, the first) and the code of its arguments, or `null` to remove it, and add, replace or remove that modifier in the node's chain. |
| C6 | A new modifier MUST be appended to the end of the chain: on the chain's last line when no modifier of the chain starts a line of its own, else on a new line after the chain's last line and any comment trailing it, at the indentation of the chain's last continuation line. |
| C7 | Removing a modifier that starts its line and is followed on it by at most a comment MUST remove that line, the comment included; a modifier sharing its line with other code MUST be removed with the spaces before it on that line. |
| C8 | The operation `rename` MUST take a view node and an identifier and set the argument of the node's `.id(…)` modifier to it as a string literal, adding the modifier when the node has none and removing it when the identifier is `null`. |
| C9 | `rename` MUST be refused when another view node of the source carries the same identifier in `.id(…)`. |
| C10 | The operation `setRefs` MUST take a view node and a list of strings and set its `.ref(…)` modifier to them, removing the modifier for an empty list. |
| C11 | The operation `setComment` MUST take a view node and a text, or `null`, and replace the comment lines leading the node (R-EDIT-001.C11) with one `//` line per line of the text, at the node's indentation, removing them for `null` or an empty text. |
| C12 | The operation `setName` MUST take a view node and an element name and replace the node's name, leaving its arguments, modifiers and closures as written. |
| C13 | Every operation of this requirement MUST have cases in the edit corpus (R-EDIT-002.C15) that show the code outside the changed span unchanged. |
| C14 | `setArgument` MUST be refused for a label that is not an identifier, for a position outside 0 to the number of positional arguments, for a value that does not parse as one argument value (with the syntax diagnostic, its column counted from the start of the value), and for the removal of an argument the call does not have. |
| C15 | A new argument placed next to an argument that starts its line MUST be written on a line of its own at that argument's indentation, the comma ending the line before. |
| C16 | `setModifier` MUST be refused for a name that is not an identifier starting with a lower-case letter, for arguments that do not parse as an argument list, for an occurrence index outside 0 to the number of occurrences, and for the removal of an occurrence the chain does not have; an index equal to the number of occurrences adds one. |
| C17 | `rename` MUST be refused for an empty identifier, and `rename` with `null` and `setRefs` with an empty list MUST be refused when the node has no such modifier. |
| C18 | `setComment` MUST be refused for a node that does not start its line, and for `null` or an empty text when no comment lines lead the node. |
| C19 | `setName` MUST be refused for a name that is not a capitalised identifier or several joined by dots, and the renamed node MUST get a new node id (R-EDIT-001.C10). |
| C20 | Every operation of this requirement except `setComment` MUST be refused for an `if` node. |
| V1 | The corpus cases of this requirement pass, among them a labelled argument added to `Button("Save")`, a modifier removed from a multi-line chain and a refused duplicate identifier. |

---

### R-EDIT-004 — Edit-mode rendering

**Requires:** R-EDIT-001

Source mapping in the rendered HTML (SRC-12#s9, SRC-12#s13). With `edit` on, every element produced
from a call names its node, so a click in the editable view finds its outline row; elements a loop, a
condition or a component body produced name the construct that produced them, so the editor selects the
construct and shows a "derived" badge.

```html
<div class="mkd-vstack" data-el="VStack" data-mkd-node="n1">
  <span class="mkd-text" data-el="Text" data-mkd-node="n3" data-mkd-derived="n2">Mon</span>
  <span class="mkd-text" data-el="Text" data-mkd-node="n3" data-mkd-derived="n2">Tue</span>
</div>
```

Derivation follows where code is written. A view in a closure passed to a component (`Card { Text("x") }`)
is written at the call, so it names its own node and is not derived from the component; the component's
body is. A component imported from another file has no ordinals in this source: its views carry only
`data-mkd-derived`, naming the call, which is what the editor can select. Each variant computes the
ordinals with its own parser (Python: `mockitdown.syntax.nodes.view_nodes`), and both number every
source of the corpus alike.

The attributes carry ordinals, which both parsers compute the same way, not the TypeScript session's
stable ids; the session maps one to the other (R-EDIT-006.C9). The option therefore exists in both
variants and is held to the conformance corpus like every other rendering (ADR-22, ADR-18.C1). It is a
library option only: a documentation page has no use for it.

Re-checked at 0.10.3 together with the items it cites or is cited by (specification audit, #51): the citations are still accurate and no obligation changed.

**Re-checked at specification 0.10.6.** A-REND-1 and A-WEB-1 were revised as built by the behaviour-preserving renderer split (#48, #49), and the gallery test cases only renamed their files (#50); no obligation here changed.

**Re-checked at specification 0.10.7.** Its prerequisites were re-checked after the renderer split (#48, #49) and the gallery spec split (#50) without any change to an obligation; neither is this item changed.

**Re-checked at 0.11.0.** Its cited items ADR-22, R-EDIT-001 changed with SRC-18 (all packs recorded, stylesheet partials, gallery home page and easter eggs, TypeScript release builds, new packs); no obligation of this item changed.


**Re-checked at specification 0.12.10.** Re-read against M-OPT-1 (changed at 0.12.7: test cases backfilled and as-built clauses recorded by #54 to #60). No obligation this item rests on changed, and none of its clauses is altered (#81).


**Re-checked at specification 0.12.12.** Re-read after the clarification records of the items it cites (#81), which closed the suspect citations left by the test-case backfills (#54 to #60) and the SRC-19 import map (0.12.0). No obligation it rests on changed, and none of its clauses is altered.

**R-EDIT-004.TC-1 — Edit-mode conformance cases**

`gen_conformance.py` renders the edit-mode cases (`edit-*` names, `edit: true`) with Python; both
suites compare their output with the expected HTML (R-REPO-004.C5). A Python unit test checks, for each
edit-mode case, that every element carrying `data-el` that a view node produced carries `data-mkd-node`,
that the derived ones carry `data-mkd-derived` naming a `ForEach`, `if` or struct call, and that marks
and tables carry neither.

As built (#23): the cases are `edit-nested-stacks`, `edit-list-cards`, `edit-modifier-chain`,
`edit-slots`, `edit-presentation`, `edit-foreach`, `edit-if-else`, `edit-struct` (C13: the content a call
passes is not derived), `edit-literal`, `edit-import` (C11, C12) and `edit-marks` (C8, with the Elements
table and the source). `python/tests/test_edit_mode.py` holds, for each, every `data-el` element in
document order with its two attributes, written by hand from the source before the renderer produced
them; it also checks the Python numbering (`mockitdown.syntax.nodes.view_nodes`) on a crafted source
and the preview of a declarations-only block (C14). `typescript/tests/unit/edit-mode.test.ts` checks
that the evaluator's ordinals equal `parseTree`'s for every corpus case, and a crafted render.

**R-EDIT-004.TC-2 — Off means unchanged**

Both suites render every conformance case with `edit: false` added to its options and compare with the
unchanged expected HTML. The Python API and TypeScript `render` accept `edit`; the fence reports an `edit`
attribute as an unknown fence option (R-MDX-003.C4), and the CLI has no such option.

As built (#23): `python/tests/test_edit_mode.py` (`EditOff`) and `typescript/tests/unit/conformance.test.ts`
("… renders unchanged with edit: false"); for an edit-mode case, `edit: false` is compared with the same
options without `edit`. `typescript/tests/unit/edit-mode.test.ts` checks the default and the fence.

**Realizes.** F-21

| | Statement |
|---|---|
| C1 | Both variants MUST offer the render option `edit` (M-OPT-1), a boolean that is false by default. |
| C2 | When `edit` is false, the rendered HTML MUST be byte-identical to the HTML rendered without the option. |
| C3 | Both variants MUST number the view nodes of a source as R-EDIT-001.C3 and R-EDIT-001.C4 define, from the parser's positions. |
| C4 | When `edit` is true, the renderer MUST give the root element of every view produced from a view node the attribute `data-mkd-node` set to that node's ordinal (`n12`). |
| C5 | When `edit` is true and a view was produced inside the body of a `ForEach`, a branch of an `if` statement or the body of a struct instantiated by a call, the renderer MUST also give its root element `data-mkd-derived`, set to the ordinal of the innermost such `ForEach` call, `if` statement or struct call. |
| C6 | The renderer MUST write `data-mkd-node` and then `data-mkd-derived` directly after the element's `data-el` attribute (R-REND-002.C2). |
| C7 | A view not produced from a view node (a string literal or a variable used as a view, R-EVAL-003.C4, R-EVAL-003.C5) MUST carry neither attribute. |
| C8 | The annotation marks (R-ANN-003), the Elements table and the source disclosure MUST carry neither attribute. |
| C9 | The conformance corpus MUST hold edit-mode cases — their `<name>.json` setting `edit: true` — that cover nested stacks, a list of cards, modifier chains, slots and labelled closures, a presentation, `ForEach`, `if`/`else`, a struct component and a string literal used as a view. |
| C10 | The Python library API and the TypeScript `render` MUST both accept `edit`; the Markdown fence and the command line MUST NOT offer it. |
| C11 | When `edit` is true, a view produced from a view node of another source (the body of a struct imported from a component file) MUST carry no `data-mkd-node`. |
| C12 | When `edit` is true and a view of C11 was produced inside the body of a struct instantiated by a call, the renderer MUST give its root element `data-mkd-derived` set to the ordinal of the innermost `ForEach` call, `if` statement or struct call of the rendered source. |
| C13 | A view written in a closure passed to a struct call (its trailing closure or a view-typed property) MUST be derived as the place where the closure is written, not from that struct call. |
| C14 | In the preview of a block that holds only declarations, the views of the struct it renders MUST carry no `data-mkd-derived` from that implicit call. |
| V1 | Every edit-mode case of the conformance corpus renders the same HTML in both variants, and every case renders byte-identically with `edit: false` and without the option. |

---

### R-EDIT-005 — The design document module

**Requires:** R-WEB-001

The `.mkdesign` format of F-20 (SRC-12#s11, SRC-15) and the one module that reads and writes it. The
composite designer uses it for `open` and `toJSON`; a desktop shell uses the same module in its main
process to read, validate and save files, so the two cannot drift apart.

```json
{
  "format": "mockitdown-design",
  "version": 1,
  "name": "Mail app",
  "defaults": { "pack": "fluent", "appearance": "light" },
  "imports": ["components/cards.mockitdown"],
  "sections": [ { "name": "Onboarding", "x": -40, "y": -60, "w": 1400, "h": 900 } ],
  "mockups": [
    { "name": "Sign in", "x": 0, "y": 0,
      "options": { "device": "desktop", "width": 480, "height": 360, "title": "Sign in" },
      "code": "NavigationStack {\n  VStack(spacing: 12) {\n    Text(\"Welcome back\")\n  }\n}\n" }
  ],
  "view": { "zoom": 0.75, "x": 120, "y": 40, "active": "Sign in" }
}
```

A mockup may name its own pack (to compare Fluent and Material side by side); one that names none uses
`defaults.pack`. The file is meant to be read and diffed without the designer, so the key order is fixed,
code is kept byte for byte, and keys written by a newer tool survive a round trip through an older one.
Markdown, HTML and folder export stay in the shell for now.

Re-checked at 0.10.3 together with the items it cites or is cited by (specification audit, #51): the citations are still accurate and no obligation changed.

**Re-checked at specification 0.10.7.** Its prerequisites were re-checked after the renderer split (#48, #49) and the gallery spec split (#50) without any change to an obligation; neither is this item changed.

**Re-checked at 0.11.0.** Its cited items R-WEB-001 changed with SRC-18 (all packs recorded, stylesheet partials, gallery home page and easter eggs, TypeScript release builds, new packs); no obligation of this item changed.


**Re-checked at specification 0.12.10.** Re-read against R-WEB-001 (changed at 0.12.0: SRC-19 import map (0.12.0), which changes how imports are found and nothing this item obliges). No obligation this item rests on changed, and none of its clauses is altered (#81).


**Re-checked at specification 0.12.12.** Re-read after the clarification records of the items it cites (#81), which closed the suspect citations left by the test-case backfills (#54 to #60) and the SRC-19 import map (0.12.0). No obligation it rests on changed, and none of its clauses is altered.

**R-EDIT-005.TC-1 — Round trip and key order**

`node:test` (`typescript/tests/unit/design.test.ts`), importing `mockitdown/design` in Node: fixture
documents with sections, view, imports and unknown keys at every level read and write back to the same
text; a document built with `newDesign` and written has its keys in M-EDIT-1 order; a code string with
tabs, CRLF and trailing spaces is kept verbatim. The module imports no DOM global.

**R-EDIT-005.TC-2 — Refusals**

`node:test`: wrong `format`, `version: 2`, `mockups` as an object, a mockup without `code`, `x` as a
string and two mockups named `Inbox` are each refused, with the expected `path` and a message naming the
problem.

**R-EDIT-005.TC-3 — Pack per mockup**

`node:test`: with `defaults.pack` `fluent`, a mockup without a pack resolves to `fluent`, one with
`options.pack` `mui` to `mui`; without defaults, to `base`; `mockupOptions` merges `defaults.appearance`
under the mockup's own options. The module exports no Markdown or file function.

**Realizes.** F-20

| | Statement |
|---|---|
| C1 | The package MUST provide the module `dist/design.js`, exported as the subpath `mockitdown/design`, which MUST run in Node 22 and in browsers without access to the DOM, the network or the file system. |
| C2 | `readDesign(text)` MUST parse a design document (M-EDIT-1) from JSON text and return `{document}`, or `{errors}` — a list of `{path, message}` naming the JSON path (`mockups[2].code`) of each problem — when the text is not a valid design document. |
| C3 | `readDesign` MUST refuse a document whose `format` is not `mockitdown-design` or whose `version` is not `1`, naming the key and the value it found. |
| C4 | `readDesign` MUST refuse a document whose `mockups` is not a list, a mockup whose `name` or `code` is not a string, a mockup whose `x` or `y` is not a number, and two mockups with the same name. |
| C5 | `writeDesign(document)` MUST return JSON text indented by two spaces and ending with one line feed, with the keys of each object in the order of M-EDIT-1 and M-EDIT-2, followed by the keys the module does not know in the order they were read. |
| C6 | Keys the module does not know, at the document, mockup, section and view levels, MUST be kept with their values by `readDesign` and written back by `writeDesign`. |
| C7 | `writeDesign(readDesign(text).document)` MUST return `text` unchanged for every text that `writeDesign` produced, and a mockup's `code` MUST reach the document and the text verbatim. |
| C8 | The pack of a mockup MUST be its `options.pack` when present, else the document's `defaults.pack`, else `base`. |
| C9 | `mockupOptions(document, name)` MUST return the render options of a mockup: the document's `defaults`, overridden by the mockup's `options`, with the pack of C8. |
| C10 | `newDesign(name)` MUST return a document with `format`, `version` 1, the given `name`, empty `defaults` and an empty `mockups` list. |
| C11 | The module MUST NOT read or write files, and MUST NOT convert a document to or from Markdown, HTML or a folder of files; these remain with the host. |
| V1 | Reading and writing every document of the test fixtures yields the same text; each malformed fixture is refused with the expected JSON path. |

---

### R-EDIT-006 — The design session and its events

**Requires:** R-EDIT-005, R-EDIT-002

One plain object that every component of an editor shares (SRC-12#s12): the document, which mockup
is active, what is selected and hovered, and the parsed tree of each mockup. Because the outline, the view,
the gallery and the inspector read and change the same session, they cannot disagree.

The session notifies its components; the components tell the host through DOM events that bubble out of
their shadow roots. Inside the composite designer only the designer dispatches them, so a host listening
on the designer hears each change once:

```js
designer.addEventListener("mockitdown-change", (e) => {
  markEdited(e.detail.mockup);          // the window's "edited" marker
  scheduleAutosave();                    // e.detail.edits: the text edits made
});
```

Node ids are the session's; ordinals are what an edit-mode rendering carries (R-EDIT-004). `nodeFor`
turns one into the other after every parse.

Re-checked at 0.10.3 together with the items it cites or is cited by (specification audit, #51): the citations are still accurate and no obligation changed.

**Re-checked at specification 0.10.7.** Its prerequisites were re-checked after the renderer split (#48, #49) and the gallery spec split (#50) without any change to an obligation; neither is this item changed.

**Re-checked at 0.11.0.** Its cited items R-EDIT-002, R-EDIT-005 changed with SRC-18 (all packs recorded, stylesheet partials, gallery home page and easter eggs, TypeScript release builds, new packs); no obligation of this item changed.


**Re-checked at specification 0.12.12.** Re-read after the clarification records of the items it cites (#81), which closed the suspect citations left by the test-case backfills (#54 to #60) and the SRC-19 import map (0.12.0). No obligation it rests on changed, and none of its clauses is altered.

**R-EDIT-006.TC-1 — Session notifications**

`node:test`: a session over a two-mockup document; `apply` of an insert and of a remove each notify
one `change` with `kind: "code"` and edits that, applied in turn to the original code, give the current
code; the selection keeps a surviving node and drops a removed one; a syntax error in the code keeps the
last valid tree and notifies `diagnostics`; `nodeFor` maps each ordinal of an edit-mode render of the
mockup to a node of its tree; selecting two non-siblings is refused.

**R-EDIT-006.TC-2 — DOM events**

Browser test (Chromium) on `pages/designer.html`: a listener on `document` receives each of
`mockitdown-select`, `mockitdown-change` and `mockitdown-insert` once per action, from the designer
element, with the notification's detail; a `mockitdown-outline` placed outside the designer with its
`session` set joins that session and dispatches the events of a selection made in it.

**Realizes.** F-19, F-20

| | Statement |
|---|---|
| C1 | `mockitdown/design` MUST export `DesignSession`, a plain object without DOM access that holds a design document, the name of the active mockup, the selection (the ids of sibling view nodes of the active mockup), the hovered node and, per mockup, its last valid tree and its current diagnostics. |
| C2 | The session MUST parse a mockup's code with `parseTree` (R-EDIT-001.C5) when the mockup is first needed and after every change of its code, and MUST keep the last valid tree when the code does not parse. |
| C3 | `session.apply(op)` MUST apply an edit operation (R-EDIT-002, R-EDIT-003) to the active mockup, replace its code with the edited source, keep its tree from `reparse` and keep the selected nodes that still exist. |
| C4 | `session.subscribe(listener)` MUST register a listener, and the session MUST notify every listener once per state change with one of the kinds `select`, `hover`, `change`, `insert`, `rename`, `active` and `diagnostics` and its detail. |
| C5 | The detail of a notification MUST be: `select` `{mockup, nodes}`; `hover` `{mockup, node}`; `change` `{kind, mockup, edits, code}` with `kind` one of `code`, `options`, `move` and `mockups` and `edits` the text edits (M-EDIT-3, empty unless `kind` is `code`); `insert` `{mockup, node, element}`; `rename` `{from, to}`; `active` `{mockup}`; `diagnostics` `{mockup, diagnostics}`. |
| C6 | Applying one operation or command MUST produce exactly one `change` notification, however many text edits it made. |
| C7 | The design-tool components MUST dispatch the notifications of kinds `select`, `change`, `insert`, `rename` and `diagnostics` to the host as bubbling, composed DOM events named `mockitdown-select`, `mockitdown-change`, `mockitdown-insert`, `mockitdown-rename` and `mockitdown-diagnostics`, with the notification's detail as the event's `detail`. |
| C8 | Inside a `mockitdown-designer`, only the designer element MUST dispatch these events; a component used on its own MUST dispatch those of its own session. |
| C9 | `session.nodeFor(mockup, ordinal)` MUST return the id of the view node with that ordinal in the mockup's current tree, so that an element of an edit-mode rendering (R-EDIT-004.C4) maps to its node. |
| C10 | `session.select(ids)` MUST refuse a list whose nodes are not siblings, and MUST replace the selection otherwise. |
| C11 | A component MUST join the session of the nearest enclosing `mockitdown-designer`, else the session its host sets as its `session` property, else a session of its own. |
| V1 | A unit test opens a document in a session, applies an insert and a remove, and receives exactly two `change` notifications whose edits, applied to the original code, give the session's code. |

---

### R-EDIT-007 — Undo and redo history

**Requires:** R-EDIT-006

History lives in the session, per design document (SRC-12#s8), so it covers every component and,
once the canvas exists, moves and renames of mockups as well (R-TOOL-012.C7). A step is a change and its
inverse, plus the selection on either side, so that undo puts the designer back exactly where they were.

Typing coalesces: each keystroke in an inspector field or in the code view is applied, but the steps
merge while the same field keeps changing, so one undo removes the whole word or value.

Re-checked at 0.10.3 together with the items it cites or is cited by (specification audit, #51): the citations are still accurate and no obligation changed.

**Re-checked at specification 0.10.7.** Its prerequisites were re-checked after the renderer split (#48, #49) and the gallery spec split (#50) without any change to an obligation; neither is this item changed.

**Re-checked at 0.11.0.** Its cited items R-EDIT-006 changed with SRC-18 (all packs recorded, stylesheet partials, gallery home page and easter eggs, TypeScript release builds, new packs); no obligation of this item changed.


**Re-checked at specification 0.12.12.** Re-read after the clarification records of the items it cites (#81), which closed the suspect citations left by the test-case backfills (#54 to #60) and the SRC-19 import map (0.12.0). No obligation it rests on changed, and none of its clauses is altered.

**R-EDIT-007.TC-1 — Undo restores document and selection**

`node:test`: a random sequence of 50 operations on a session; undoing all restores the original
document and selection, redoing all the final ones, each undo and redo notifying one `change`; a new
operation after two undos makes `canRedo` false; 250 steps keep at least the latest 200.

**R-EDIT-007.TC-2 — Coalescing**

`node:test` with a fake clock: ten changes with one key 100 ms apart form one step, a change 1500 ms
later a new one, a change with another key a new one. Browser test on `pages/designer.html`: typing a
word in an inspector field and pressing Cmd/Ctrl+Z restores the field's old value in one step; the
toolbar's Undo button is disabled on a fresh document.

**Realizes.** F-19

| | Statement |
|---|---|
| C1 | The session MUST keep one undo history per design document, each step holding the mockup, the change, the change's inverse and the selection before and after it. |
| C2 | Every operation, command or code change applied through the session MUST be recorded as exactly one step. |
| C3 | `session.undo()` MUST revert the latest step and restore the selection from before it; `session.redo()` MUST reapply the step undone last and restore the selection from after it. |
| C4 | A change made with the same coalescing key as the latest step, within 1000 ms of that step's last change, MUST be merged into that step instead of forming a new one. |
| C5 | The inspector MUST use the node and field as the coalescing key, and the code view the key `code`, so that one burst of typing forms one step. |
| C6 | A new step after an undo MUST discard the steps that could have been redone. |
| C7 | Undo and redo MUST each notify one `change` (R-EDIT-006.C5) holding the edits they made. |
| C8 | `session.canUndo` and `session.canRedo` MUST say whether a step can be undone or redone. |
| C9 | The history MUST keep at least the latest 200 steps. |
| C10 | The composite designer MUST bind Cmd/Ctrl+Z to undo and Shift+Cmd/Ctrl+Z and Ctrl+Y to redo while the focus is not in a text field, and its toolbar MUST have Undo and Redo buttons enabled by C8. |
| V1 | After any sequence of operations and commands, undoing every step restores the document and the selection that the session started with, and redoing every step restores the final ones. |

---

### R-EDIT-008 — Commands: duplicate, clipboard, move and multi-select

**Requires:** R-EDIT-007

The everyday commands of a structured editor (SRC-12#s8). The clipboard holds plain mockitdown text, so
an element copied in the designer pastes into a Markdown fence, a code review or another document.

Multi-select is limited to siblings: every command here acts on a contiguous or scattered run of children
of one parent, which keeps their results predictable.

Re-checked at 0.10.3 together with the items it cites or is cited by (specification audit, #51): the citations are still accurate and no obligation changed.

**Re-checked at specification 0.10.7.** Its prerequisites were re-checked after the renderer split (#48, #49) and the gallery spec split (#50) without any change to an obligation; neither is this item changed.

**Re-checked at 0.11.0.** Its cited items R-EDIT-007 changed with SRC-18 (all packs recorded, stylesheet partials, gallery home page and easter eggs, TypeScript release builds, new packs); no obligation of this item changed.


**Re-checked at specification 0.12.12.** Re-read after the clarification records of the items it cites (#81), which closed the suspect citations left by the test-case backfills (#54 to #60) and the SRC-19 import map (0.12.0). No obligation it rests on changed, and none of its clauses is altered.

**R-EDIT-008.TC-1 — Commands and undo**

`node:test`: duplicate of `Button("A").id("ok")` yields `.id("ok-2")`, a second duplicate `ok-3`;
cut and paste into a stack and after a leaf; paste of invalid text is refused without a step;
moveUp at the first position records no step; every command undoes and redoes with the selection
restored (the AC9 check of F-19).

**R-EDIT-008.TC-2 — Keyboard, clipboard and multi-select**

Browser test on `pages/designer.html` with a granted clipboard: Shift-click selects a range of rows,
Cmd/Ctrl-click toggles one, a click on a non-sibling replaces the selection; Cmd/Ctrl+C puts the
selected text on the clipboard; a Python test renders that text in a `mockitdown` fence without a
diagnostic (F-19.AC10); Alt+Down moves the selection.

**Realizes.** F-19

| | Statement |
|---|---|
| C1 | `session.duplicate()` MUST insert a copy of each selected node directly after it and select the copies. |
| C2 | In a copy, each `.id("x")` MUST become `.id("x-<n>")`, `<n>` being the smallest integer from 2 that makes the identifier unique in the mockup. |
| C3 | `session.copy()` MUST return, and the composite designer MUST write to the clipboard as `text/plain`, the source text of the selected nodes in order, each re-indented to column 0 by its first line, joined by line feeds. |
| C4 | `session.cut()` MUST copy the selected nodes and remove them as one step. |
| C5 | `session.paste(text)` MUST insert the views the text holds as the last children of the selected node when one node is selected and its role accepts them (R-PACK-016), else directly after the last selected node, else at the end of the mockup's root. |
| C6 | If the pasted text does not parse as views, then `paste` MUST be refused with the syntax diagnostic and record no step. |
| C7 | `session.moveUp()` and `session.moveDown()` MUST move the selected nodes one position among their siblings; at the first or last position they MUST do nothing and record no step. |
| C8 | In the outline and the editor, Shift-click MUST select the siblings from the selection's first node to the clicked node, Cmd/Ctrl-click MUST add or remove the clicked node, and a click on a node that is not a sibling of the selection MUST replace the selection. |
| C9 | The composite designer MUST bind Cmd/Ctrl+D to duplicate, Cmd/Ctrl+X, C and V to cut, copy and paste, and Alt+Up and Alt+Down to move, while the focus is in the outline or the view. |
| C10 | Each command of this requirement MUST be one undo step (R-EDIT-007). |
| V1 | Every command, applied to a single and to a multiple selection, can be undone and redone with the selection restored, and copied text pasted into a mockitdown fence renders the copied elements. |

---

### R-EDIT-009 — Commands: wrap, unwrap, convert and extract component

**Requires:** R-EDIT-008, R-PACK-016

The restructuring commands (SRC-12#s8). They read the role rules (R-PACK-016) to refuse what the
gallery would refuse — a frame wrapped into a stack, a toolbar item unwrapped into a list — and say why.
`session.commands` is the menu model a host such as the MockItDown Designer builds its Edit and Arrange
menus from (SRC-16 D37).

Re-checked at 0.10.3 together with the items it cites or is cited by (specification audit, #51): the citations are still accurate and no obligation changed.

**Re-checked at specification 0.10.7.** Its prerequisites were re-checked after the renderer split (#48, #49) and the gallery spec split (#50) without any change to an obligation; neither is this item changed.

**Re-checked at 0.11.0.** Its cited items R-EDIT-008, R-PACK-016 changed with SRC-18 (all packs recorded, stylesheet partials, gallery home page and easter eggs, TypeScript release builds, new packs); no obligation of this item changed.


**Re-checked at specification 0.12.10.** Re-read against R-PACK-016 (changed at 0.12.4: test cases backfilled and as-built clauses recorded by #54 to #60). No obligation this item rests on changed, and none of its clauses is altered (#81).


**Re-checked at specification 0.12.12.** Re-read after the clarification records of the items it cites (#81), which closed the suspect citations left by the test-case backfills (#54 to #60) and the SRC-19 import map (0.12.0). No obligation it rests on changed, and none of its clauses is altered.

**R-EDIT-009.TC-1 — Restructuring commands**

`node:test`: wrap two sibling buttons in `HStack`; wrap a `NavigationSplitView` in a `VStack` (refused
with a reason); unwrap the stack; convert `Button("Save", role: .destructive, bogus: 1)` to a
same-role element keeping `role` and dropping `bogus`; convert to an element of another role (refused);
extract a card into `struct OrderCard: View` and replace it by `OrderCard()`; extract a row using a
`ForEach` parameter (refused). Each result renders without a new diagnostic and undoes to the original.

**R-EDIT-009.TC-2 — Commands for a host menu**

`node:test`: `session.commands` lists the thirteen commands with labels and shortcuts, `enabled`
false for unwrap on a leaf; `session.run("wrap", {name: "VStack"})` equals `session.wrap("VStack")`.
Browser test: Cmd/Ctrl+G wraps the selection in a `VStack`.

**Realizes.** F-19

| | Statement |
|---|---|
| C1 | `session.wrap(name)` MUST replace the selected sibling nodes by one call `<name> { … }` holding them in their order, at the position of the first, and select the new call. |
| C2 | `wrap` MUST be refused when the element `name` cannot contain one of the nodes or the parent cannot contain `name` (R-PACK-016.C6), naming the reason. |
| C3 | `session.unwrap()` MUST replace the selected node by its children, its arguments and modifiers removed with it, and MUST be refused when the parent cannot contain one of the children. |
| C4 | `session.convert(name)` MUST replace the selected node's name by `name` (R-EDIT-003.C12) when the two elements have the same role in the mockup's pack, and MUST be refused otherwise. |
| C5 | `convert` MUST keep the labelled arguments that the new element understands (R-EVAL-004.C7) and its positional arguments up to the number of its `params`, and MUST remove the others. |
| C6 | `session.extractComponent(name)` MUST declare `struct <name>: View` with a `body` holding the selected nodes, after the mockup's last struct declaration or else before its first view statement, and replace the selection by the call `<name>()`. |
| C7 | `extractComponent` MUST be refused when `name` is already a struct, an element of the mockup's pack or not an identifier beginning with an uppercase letter, and when the selection uses a `let` binding or closure parameter declared outside it. |
| C8 | `session.commands` MUST list every command of the session (delete, duplicate, cut, copy, paste, move up, move down, wrap, unwrap, convert, extract component, undo and redo) with its name, label, shortcut and whether it is enabled for the current selection, and `session.run(name, args)` MUST run one, so that a host can offer them in its own menus. |
| C9 | The composite designer MUST bind Cmd/Ctrl+G to wrap in a `VStack` and Cmd/Ctrl+Shift+G to unwrap. |
| C10 | Each command of this requirement MUST be one undo step (R-EDIT-007). |
| V1 | Wrapping two buttons in an `HStack`, unwrapping it, converting a `Button` to the pack's `VBtn` and extracting a card into a struct each give the expected code, render without a new diagnostic and undo to the original. |

## Revision history

| Version | Date | Change |
|---|---|---|
| 0.13.2 | 2026-11-28 | as built (#23): imported component views carry data-mkd-derived without data-mkd-node (C11, C12); content passed to a component is derived where it is written (C13); a declarations-only preview is not derived (C14); TC-1 and TC-2 name their tests |
| 0.12.18 | 2026-11-27 | as built (#22): replace a value in place, positional placement (C2); parentheses kept without a closure (C4); chain on one line, after a trailing comment (C6); line and inline removal (C7); string literal (C8); leading comment lines (C11); refusals C14, C16-C20; one argument per line kept (C15); TC-1, TC-2 name the tests |
| 0.12.17 | 2026-11-27 | as built (#21): edit takes a source or a tree, refusals carry diagnostics (C1); nodes by number too (C3); statement children (C4, C8, C19); tab or smallest-step unit (C11); not-one-view messages (C14); refusals C20-C24; line, separator and blank-line rules (C25-C29); covers tags (C30); TC-1, TC-2 name the tests |
| 0.12.16 | 2026-11-27 | as built (#20): view nodes wherever a call stands (C3); capital-letter dotted names (C12); leading comment lines defined (C13); argument spans (C14); id matching and removals (C15); RangeError on bad edits (C16); token offsets (C17); node fields (C18); TC-1, TC-2 name the tests |
| 0.12.12 | 2026-11-27 | re-checked with the items it cites after the #81 audit: unaffected (#81) |
| 0.12.11 | 2026-11-27 | re-checked against R-PACK-016: unaffected (#81); re-checked against R-WEB-001: unaffected (#81); re-checked against M-OPT-1: unaffected (#81) |
| 0.11.0 | 2026-11-27 | re-checked against R-EDIT-008, R-PACK-016 (SRC-18): unaffected; re-checked against R-EDIT-006 (SRC-18): unaffected; re-checked against ADR-21, R-WEB-001 (SRC-18): unaffected; re-checked against R-EDIT-002, R-EDIT-005 (SRC-18): unaffected; re-checked against R-EDIT-007 (SRC-18): unaffected; re-checked against ADR-21, R-EDIT-002 (SRC-18): unaffected; re-checked against ADR-22, R-EDIT-001 (SRC-18): unaffected; re-checked against R-WEB-001 (SRC-18): unaffected; re-checked against ADR-21, R-EDIT-001 (SRC-18): unaffected |
| 0.10.8 | 2026-11-27 | re-checked after the renderer split: unaffected (#53) |
| 0.10.7 | 2026-11-27 | re-checked after the renderer split and the gallery spec split: unaffected (#53) |
| 0.10.3 | 2026-11-26 | re-stamped with the items it cites after the audit's prose clarifications; no obligation changes (audit #51) |
| 0.10.0 | 2026-11-26 | Page created (ING-1) |
| 0.12.18 | 2026-11-27 | as built (#22): replace a value in place, positional placement (C2); parentheses kept without a closure (C4); chain on one line, after a trailing comment (C6); line and inline removal (C7); string literal (C8); leading comment lines (C11); refusals C14, C16-C20; one argument per line kept (C15); TC-1, TC-2 name the tests |
| 0.12.17 | 2026-11-27 | as built (#21): edit takes a source or a tree, refusals carry diagnostics (C1); nodes by number too (C3); statement children (C4, C8, C19); tab or smallest-step unit (C11); not-one-view messages (C14); refusals C20-C24; line, separator and blank-line rules (C25-C29); covers tags (C30); TC-1, TC-2 name the tests |
| 0.12.16 | 2026-11-27 | as built (#20): view nodes wherever a call stands (C3); capital-letter dotted names (C12); leading comment lines defined (C13); argument spans (C14); id matching and removals (C15); RangeError on bad edits (C16); token offsets (C17); node fields (C18); TC-1, TC-2 name the tests |
| 0.12.12 | 2026-11-27 | re-checked with the items it cites after the #81 audit: unaffected (#81) |
| 0.12.11 | 2026-11-27 | re-checked against R-PACK-016: unaffected (#81); re-checked against R-WEB-001: unaffected (#81); re-checked against M-OPT-1: unaffected (#81) |
| 0.11.0 | 2026-11-27 | re-checked against R-EDIT-008, R-PACK-016 (SRC-18): unaffected; re-checked against R-EDIT-006 (SRC-18): unaffected; re-checked against ADR-21, R-WEB-001 (SRC-18): unaffected; re-checked against R-EDIT-002, R-EDIT-005 (SRC-18): unaffected; re-checked against R-EDIT-007 (SRC-18): unaffected; re-checked against ADR-21, R-EDIT-002 (SRC-18): unaffected; re-checked against ADR-22, R-EDIT-001 (SRC-18): unaffected; re-checked against R-WEB-001 (SRC-18): unaffected; re-checked against ADR-21, R-EDIT-001 (SRC-18): unaffected |
| 0.10.8 | 2026-11-27 | re-checked after the renderer split: unaffected (#53) |
| 0.10.7 | 2026-11-27 | re-checked after the renderer split and the gallery spec split: unaffected (#53) |
| 0.10.3 | 2026-11-26 | re-stamped with the items it cites after the audit's prose clarifications; no obligation changes (audit #51) |
| 0.10.0 | 2026-11-26 | Page created (ING-1) |
