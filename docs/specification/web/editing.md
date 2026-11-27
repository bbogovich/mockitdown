---
title: "Editing core"
spec_version: 0.10.8
status: draft
updated: 2026-11-27
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

Re-checked at 0.10.3 together with the items it cites or is cited by (specification audit, #51): the citations are still accurate and no obligation changed.

**Re-checked at specification 0.10.6.** A-REND-1 and A-WEB-1 were revised as built by the behaviour-preserving renderer split (#48, #49), and the gallery test cases only renamed their files (#50); no obligation here changed.

**Re-checked at specification 0.10.7.** Its prerequisites were re-checked after the renderer split (#48, #49) and the gallery spec split (#50) without any change to an obligation; neither is this item changed.

**R-EDIT-001.TC-1 — Spans, ordinals and ids**

`node:test` (`typescript/tests/unit/tree.test.ts`): for every case of `shared/conformance/` that parses,
each view node's span and name span read back from the source as the node's text and name, its leading
comment lines included; the ordinals are `n1…nK` in source order; a modifier call is not a node; the
lookup by offset returns the innermost node. A source with a syntax error returns `tree: null` and the
same diagnostics as `check`.

**R-EDIT-001.TC-2 — Ids survive edits**

`node:test`: parse a formatted source with comments, a `let`, a `ForEach` and an `if`; apply, with
`reparse`, an insertion before a node, a replacement inside a sibling's arguments and a removal of
another sibling; every node whose name was not in an edited range keeps its id, the inserted node has
a new id, and no id of a removed node reappears in later trees.

**Realizes.** F-21

| | Statement |
|---|---|
| C1 | The TypeScript parser MUST record, for every syntax node, its start and end offsets in the source text (UTF-16 code units, end exclusive) in addition to its line and column. |
| C2 | The TypeScript lexer MUST record the offsets of every comment (`//` and `/* … */`), so that the text between two consecutive tokens, comments included, can be read back from the source. |
| C3 | The view nodes of a source MUST be its calls whose callee is an identifier or a dotted name of identifiers (`Text("a")`, `VStack { … }`, `Badge.Ribbon("New")`), its identifiers that stand alone as a view statement or as the base of a modifier chain in one (`Divider`, `Spacer.frame(height: 8)`), and its `if` statements; a modifier call MUST NOT be a view node and MUST belong to the view node whose chain it is in. |
| C4 | The view nodes MUST be numbered from 1 in the order of the start offsets of their first tokens, across the whole source including struct bodies; a node's ordinal MUST be written `n<k>` (`n1`, `n2`, …). |
| C5 | The package MUST export `parseTree(source)`, which returns `{tree, diagnostics}`: the syntax tree with its view nodes, or `tree: null` with the syntax diagnostics when the source does not parse. |
| C6 | Each view node of a tree MUST have a node id: an opaque string, unique within the tree and never reused for another node of the trees derived from it. |
| C7 | Each view node MUST expose its id, its ordinal, its element or struct name as written, its span (the offsets from its first token to the end of its modifier chain and closures), the span of its name, its parent view node and its child view nodes in source order (closures, slots and the branches of an `if` included). |
| C8 | The tree MUST look up a view node by id, by ordinal and by offset, the last giving the innermost view node whose span holds the offset. |
| C9 | The package MUST export `reparse(tree, edits)`, which applies text edits (M-EDIT-3) to the tree's source and returns `{tree, diagnostics}` for the edited text, with the ids of C10. |
| C10 | In the tree `reparse` returns, a view node whose name span lies outside every edited range MUST keep the id of the corresponding node of the old tree; a view node whose name span lies in an inserted or replaced range MUST get a new id. |
| C11 | The span of a view node MUST also cover the comment lines directly above its first line, which belong to it when it is moved or removed (R-EDIT-002). |
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

The printing rules for new code — indentation from the parent, one call per line, the indentation unit
of the file — are fixed by the edit corpus rather than by prose alone. The corpus is data (a source, an
operation, the expected text), so the Python variant can run the same cases if it ever gains the edit API
(ADR-21). Node references in a case are ordinals, because ids are not written in the source.

Re-checked at 0.10.3 together with the items it cites or is cited by (specification audit, #51): the citations are still accurate and no obligation changed.

**Re-checked at specification 0.10.6.** A-REND-1 and A-WEB-1 were revised as built by the behaviour-preserving renderer split (#48, #49), and the gallery test cases only renamed their files (#50); no obligation here changed.

**Re-checked at specification 0.10.7.** Its prerequisites were re-checked after the renderer split (#48, #49) and the gallery spec split (#50) without any change to an obligation; neither is this item changed.

**R-EDIT-002.TC-1 — The edit corpus**

`node:test` (`typescript/tests/unit/edit-corpus.test.ts`) over `shared/conformance/edit/index.json`:
for each case, `edit(source, op)` yields exactly `<name>.expected.mockitdown` (or the message of
`<name>.error.txt`), applying `edits` to the source yields the same text, and the edited source renders
with no diagnostic the original lacked. A meta-test fails when the corpus lacks one of the situations
of C16 (each case's `op.json` carries a `covers` list).

**R-EDIT-002.TC-2 — Refusals and ids**

`node:test`: a node that is a modifier call or does not exist, a move into the moved node's own
descendant and an insert of code with two views or a syntax error are refused with a message and no
edits; after a move, the moved nodes keep their ids.

**Realizes.** F-21

| | Statement |
|---|---|
| C1 | The package MUST export `edit(source, op)`, which applies one edit operation to a source and returns `{edits, source, tree}` — the text edits (M-EDIT-3) in ascending, non-overlapping order, the edited source and its tree (R-EDIT-001.C9) — or `{error}` with a message and no edits when the operation is refused. |
| C2 | Applying the returned edits to the source MUST yield the returned source, and every character outside the edited ranges MUST be kept, comments, blank lines and the formatting of other calls included. |
| C3 | An operation MUST name its nodes by node id or by ordinal, and MUST be refused when a named node is not a view node of the source. |
| C4 | The operation `insert` MUST take a parent view node, an index among its children (or `end`) and the code of one view (a call with its modifier chain and closures), and insert that code as the parent's child at that position. |
| C5 | When the parent of an `insert` has no trailing closure, the edit MUST give it one, written ` {` after the call's arguments and `}` on its own line at the parent's indentation. |
| C6 | The operation `remove` MUST take one or more sibling view nodes and delete each one's span with its line, so that no blank line is left where there was none. |
| C7 | When `remove` deletes every child of a closure, the closure's braces MUST stay, with the `{` and the `}` on the lines they were on. |
| C8 | The operation `move` MUST take one or more sibling view nodes, a new parent and an index, and move the nodes' spans there in their order; the moved nodes MUST keep their node ids. |
| C9 | A `move` into one of the moved nodes or into one of their descendants MUST be refused. |
| C10 | Inserted and moved code MUST be indented with the child indentation of its new parent: the indentation of the parent's first existing child, else the parent's line indentation plus one indentation unit. |
| C11 | The indentation unit MUST be the smallest non-zero indentation step found in the source, else four spaces. |
| C12 | Code given to `insert` MUST be re-indented line by line, its first line taking the child indentation and its other lines keeping their indentation relative to the first. |
| C13 | Code written by an operation from parts (a new closure, a new argument, a new modifier) MUST put one view call per line, chain its modifiers on that line and put each closure child on its own line one unit deeper. |
| C14 | An `insert` whose code does not parse as exactly one view MUST be refused with the syntax diagnostic. |
| C15 | `shared/conformance/edit/` MUST hold the edit corpus: cases named `<name>.mockitdown` (the source), `<name>.op.json` (the operation, its nodes named by ordinal) and `<name>.expected.mockitdown` (the edited source), listed in `shared/conformance/edit/index.json` as `{"cases": [{"name", "op"}, …]}`. |
| C16 | The edit corpus MUST cover each operation at the first, a middle and the last position, into an empty parent and a parent without a closure, in sources with comments, blank lines, `let`, `ForEach`, `if` and struct declarations, and every refusal of this requirement. |
| C17 | The TypeScript test suite MUST run every edit case under `node:test` and fail when the edited source differs from the expected file, or when the edited source renders with a diagnostic that the original source did not have. |
| C18 | A case whose operation is refused MUST give `<name>.error.txt`, holding the expected message, in place of the expected source. |
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

`setName` is the basis of the Convert command (R-EDIT-009); which arguments survive a conversion is the
command's business, not the operation's.

Re-checked at 0.10.3 together with the items it cites or is cited by (specification audit, #51): the citations are still accurate and no obligation changed.

**Re-checked at specification 0.10.6.** A-REND-1 and A-WEB-1 were revised as built by the behaviour-preserving renderer split (#48, #49), and the gallery test cases only renamed their files (#50); no obligation here changed.

**Re-checked at specification 0.10.7.** Its prerequisites were re-checked after the renderer split (#48, #49) and the gallery spec split (#50) without any change to an obligation; neither is this item changed.

**R-EDIT-003.TC-1 — Argument, modifier and identifier cases**

Edit corpus cases (run by R-EDIT-002.TC-1) for each operation: add, replace and remove a positional and
a labelled argument; parentheses added to `Divider` and removed from `VStack(spacing: 8) { … }`; a
modifier added to a one-line and to a multi-line chain, replaced, and removed from both; `.id` set,
replaced and removed; `.ref` set and cleared; a comment set, replaced and removed; a name replaced. Each
expected file differs from its source only in the changed span.

**R-EDIT-003.TC-2 — Duplicate identifier refused**

`node:test`: with `.id("save")` on one button, `rename` of another button to `save` is refused with a
message naming the identifier, and returns no edits.

**Realizes.** F-21

| | Statement |
|---|---|
| C1 | The operation `setArgument` MUST take a view node, a label (or `null` and a position for a positional argument) and the code of a value, or `null` to remove the argument, and add, replace or remove that argument of the node's call. |
| C2 | `setArgument` MUST replace an existing argument in place, append a new labelled argument after the call's last argument, and insert a new positional argument at its position among the positional arguments. |
| C3 | Removing an argument MUST also remove the comma and the space that separated it from its neighbour. |
| C4 | When an argument is added to a call written without parentheses (`Divider`, `VStack { … }`), the edit MUST add the parentheses directly after the name; when the last argument of a call with a trailing closure is removed, the empty parentheses MUST be removed too. |
| C5 | The operation `setModifier` MUST take a view node, a modifier name, an occurrence index (default 0, the first) and the code of its arguments, or `null` to remove it, and add, replace or remove that modifier in the node's chain. |
| C6 | A new modifier MUST be appended to the end of the chain, on the chain's last line when the chain is written on one line, else on a line of its own at the indentation of the chain's other continuation lines. |
| C7 | Removing a modifier written on a line of its own MUST remove that line. |
| C8 | The operation `rename` MUST take a view node and an identifier and set the argument of the node's `.id(…)` modifier, adding the modifier when the node has none and removing it when the identifier is `null`. |
| C9 | `rename` MUST be refused when another view node of the source carries the same identifier in `.id(…)`. |
| C10 | The operation `setRefs` MUST take a view node and a list of strings and set its `.ref(…)` modifier to them, removing the modifier for an empty list. |
| C11 | The operation `setComment` MUST take a view node and a text, or `null`, and replace the `//` comment lines directly above the node with one line per line of the text, at the node's indentation. |
| C12 | The operation `setName` MUST take a view node and an element name and replace the node's name, leaving its arguments, modifiers and closures as written. |
| C13 | Every operation of this requirement MUST have cases in the edit corpus (R-EDIT-002.C15) that show the code outside the changed span unchanged. |
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

The attributes carry ordinals, which both parsers compute the same way, not the TypeScript session's
stable ids; the session maps one to the other (R-EDIT-006.C9). The option therefore exists in both
variants and is held to the conformance corpus like every other rendering (ADR-22, ADR-18.C1). It is a
library option only: a documentation page has no use for it.

Re-checked at 0.10.3 together with the items it cites or is cited by (specification audit, #51): the citations are still accurate and no obligation changed.

**Re-checked at specification 0.10.6.** A-REND-1 and A-WEB-1 were revised as built by the behaviour-preserving renderer split (#48, #49), and the gallery test cases only renamed their files (#50); no obligation here changed.

**Re-checked at specification 0.10.7.** Its prerequisites were re-checked after the renderer split (#48, #49) and the gallery spec split (#50) without any change to an obligation; neither is this item changed.

**R-EDIT-004.TC-1 — Edit-mode conformance cases**

`gen_conformance.py` renders the edit-mode cases (`edit-*` names, `edit: true`) with Python; both
suites compare their output with the expected HTML (R-REPO-004.C5). A Python unit test checks, for each
edit-mode case, that every element carrying `data-el` that a view node produced carries `data-mkd-node`,
that the derived ones carry `data-mkd-derived` naming a `ForEach`, `if` or struct call, and that marks
and tables carry neither.

**R-EDIT-004.TC-2 — Off means unchanged**

Both suites render every conformance case with `edit: false` added to its options and compare with the
unchanged expected HTML. The Python API and TypeScript `render` accept `edit`; the fence reports an `edit`
attribute as an unknown fence option (R-MDX-003.C4), and the CLI has no such option.

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
| 0.10.8 | 2026-11-27 | re-checked after the renderer split: unaffected (#53) |
| 0.10.7 | 2026-11-27 | re-checked after the renderer split and the gallery spec split: unaffected (#53) |
| 0.10.3 | 2026-11-26 | re-stamped with the items it cites after the audit's prose clarifications; no obligation changes (audit #51) |
| 0.10.0 | 2026-11-26 | Page created (ING-1) |
| 0.10.7 | 2026-11-27 | re-checked after the renderer split and the gallery spec split: unaffected (#53) |
| 0.10.3 | 2026-11-26 | re-stamped with the items it cites after the audit's prose clarifications; no obligation changes (audit #51) |
| 0.10.0 | 2026-11-26 | Page created (ING-1) |
