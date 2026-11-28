# mockitdown — TypeScript

The web variant of [mockitdown](../README.md): UI mockups written in SwiftUI syntax, rendered as HTML
styled after real UI frameworks, in the browser and in Node. It shares the language, the packs and the
page stylesheet with the [Python variant](../python/README.md) through the repository's `shared/`
folder, and it is held to the Python output by the conformance corpus in `shared/conformance/`.

**Status:** in progress. The core is ported — language, evaluation, packs, diagnostics, options,
stylesheet and the HTML renderer (`render`, `check`), byte-identical to Python on every conformance
case; the `mockitdown-` web components follow.

## Installing a release

The package is not on the npm registry. Each release is attached to the project's
[GitHub releases](https://github.com/bbogovich/mockitdown/releases) (tags `ts-vX.Y.Z`) as the
`npm pack` archive `mockitdown-X.Y.Z.tgz`; install it by its URL, which pins that exact build:

```bash
npm install https://github.com/bbogovich/mockitdown/releases/download/ts-vX.Y.Z/mockitdown-X.Y.Z.tgz
```

For example, `npm install https://github.com/bbogovich/mockitdown/releases/download/ts-v0.1.0/mockitdown-0.1.0.tgz`.
The archive holds `package.json`, this README, `LICENSE` and `dist/` (with `dist/shared/`); then
`import … from "mockitdown"` (browser and Node) or `"mockitdown/node"` (Node, assets read from disk).

Releasing (maintainers): set `version` in `typescript/package.json`, commit, push, then tag
`ts-vX.Y.Z` and push the tag. `.github/workflows/release-ts.yml` checks that the tag equals the
version, runs `npm ci`, `npm audit --audit-level=high` and `npm test`, packs the archive and creates
the release `mockitdown TypeScript X.Y.Z` with it. A pushed tag is never moved or reused: a failed
release after the GitHub release exists is followed by the next patch version (ADR-23).

## Package

- NPM package `mockitdown`, MIT, ES modules, **no runtime dependencies**. Development dependencies:
  `typescript` and `@playwright/test` only (ADR-20).
- `dist/mockitdown.js` — the package entry (the core today; it will define the custom elements).
- `dist/node.js` (`mockitdown/node`) — the core plus a loader that reads the shared assets from disk.
- `dist/design.js` (`mockitdown/design`) — design documents (`.mkdesign`) and the design session, for
  design tools and for hosts such as a desktop shell; no DOM, network or file system.
- `dist/shared/` — the packs (`packs/<id>/pack.json`, `pack.css`), `page.css`, `icons.json`,
  `vocabulary.json`, `roles.json` (the role rules), `reference/index.json` and `reference/<pack>.json`
  (each pack's elements, roles, doc lines and samples, which the gallery reads) and `manifest.json`
  (`{packs, files, reference}`: the pack ids, the files loaders load, and the reference files, which they
  do not), copied from `shared/` at build time.

The core (`src/core/`) touches no DOM, network or file system: the shared assets reach it as data,
once, through `loadAssets`.

```js
import { loadSharedAssets, render, check, registerComponents, stylesheet } from "mockitdown/node";

loadSharedAssets();                                   // the built-in packs from dist/shared/
registerComponents("components/pill.mockitdown", pillSource);
const result = render('import "components/pill"\nStatusPill(text: "Online")', { device: "phone" });
result.html;                                          // the figure (error box first if there are errors)
result.diagnostics;                                   // Diagnostic[] (also: check(source, options))
const css = stylesheet(result.packs);                 // CSS for the pack lineage, page.css included
```

In a browser, `loadAssetsFromUrl(base)` (from the package entry) fetches `manifest.json` and the files
it lists from `base` — by default the package's own `dist/shared/` — and passes them to `loadAssets`
once (the custom elements will do this for you):

```js
import { loadAssetsFromUrl, render, stylesheet } from "./dist/mockitdown.js";

await loadAssetsFromUrl();                            // or loadAssetsFromUrl("/assets/mockitdown/")
const { html, packs } = render(source, {});
```

Options use the Python `RenderOptions` field names (`pack`, `default_pack`, `device`, `appearance`,
`width`, `height`, `chrome`, `title`, `id`, `caption`, `elements`, `source`, `window`, `windowed`, `menubar`, `app`, `url`,
`import_paths`, `source_path`, `show_warnings`, `edit`), plus `import_resolver`, a function returning a
component file's text for a candidate path, and `asset_base`, the URL local image paths resolve
against (images are never embedded; without it a local path is reported as not found).

### Editing

For visual editors, `parseTree(source)` gives the view nodes of a source (ordinals `n1`, `n2`, … and
stable ids), and `edit(sourceOrTree, op)` inserts, removes or moves them with the smallest text edits,
keeping comments and formatting outside the changed lines:

```js
import { edit, parseTree } from "mockitdown";

const { tree } = parseTree(source);
const r = edit(tree, { op: "insert", parent: "n1", index: "end", code: 'Toggle("Remember me")' });
if ("error" in r) console.warn(r.error);
else apply(r.edits);                                  // [{start, end, text}], ascending; r.source, r.tree
// also { op: "remove", nodes: ["n3"] } and { op: "move", nodes: ["n3"], parent: "n2", index: 0 };
// parent null inserts at (or moves to) the top level (the root of the mockup)
```

The inspector's operations change one node and leave its neighbours as written:

```js
edit(tree, { op: "setArgument", node: "n3", label: "role", value: ".destructive" }); // null value removes it
edit(tree, { op: "setArgument", node: "n3", label: null, position: 0, value: '"Store"' });
edit(tree, { op: "setModifier", node: "n2", name: "padding", index: 0, args: "8" });   // null args removes it
edit(tree, { op: "rename", node: "n3", id: "save" });            // .id("save"); refused when another node has it
edit(tree, { op: "setRefs", node: "n3", refs: ["R-AUTH-001"] });  // [] removes .ref(…)
edit(tree, { op: "setComment", node: "n3", text: "Primary action" });
edit(tree, { op: "setName", node: "n3", name: "Link" });
```

Removing an argument, modifier, identifier or comment that is not there is refused, as is a value
that does not parse (its diagnostic counts columns from the given code).

The printing rules are fixed by the edit corpus in `shared/conformance/edit/`.

To tie a rendering back to the source, render with `edit: true` (also `<mockitdown-mockup edit>`; it is
no fence option). Every role root a view node produced then carries `data-mkd-node` with its ordinal,
and one a `ForEach`, an `if` or a component body produced also `data-mkd-derived` with that construct's
ordinal; text from a string literal or a variable carries neither. The Python `render(..., edit=True)`
writes the same attributes.

```js
render('VStack { ForEach(["Mon", "Tue"], id: \\.self) { d in Text(d) } }', { edit: true }).html;
// <div class="mkd-vstack" data-el="VStack" data-mkd-node="n1" …>
//   <span class="mkd-text" data-el="Text" data-mkd-node="n3" data-mkd-derived="n2" …>Mon</span> …
tree.byOrdinal("n3");                                 // the ViewNode, with its stable id
```

### Role rules

Which elements may go where is decided by render role, from `shared/language/roles.json` (copied to
`dist/shared/roles.json` and loaded with the other assets). A pack element inherits its role's rule
(`VBtn` behaves as a button); `rules: {"accepts": [...]}` in its `pack.json` entry can only narrow it.
Rendering never reads the table; design tools ask:

```js
import { allowedChildren, canContain } from "mockitdown";

canContain("base", "HStack", "NavigationSplitView"); // {ok: false, reason: "A frame cannot be placed inside a horizontal stack"}
canContain("vuetify", "VCard", "VBtn");              // {ok: true}: a card holds a button
canContain("base", null, "NavigationStack");         // null is the root of a mockup
allowedChildren("base", "HStack");                   // {allowed: ["VStack", "HStack", …], refused: [{reason, elements}, …]}
```

An element the pack does not define (a struct, a typo) has role `unknown`: as a parent it accepts
everything, as a child it is accepted by any parent that holds children.

The table also types the labels each role reads (`params`: the top-level map for every role, each
rule's for its own; `roleReads(role)` gives the labels of both). Evaluation warns, with code `argument`,
about a labelled argument of an element call that nothing understands — not a param or default of the
element, an alias of the element or its pack, a label its role reads or its pack types for it, a closure
or views (a slot), an action, or a binding (`$x`) — and still renders the element, exactly as the Python
variant does:

```text
Text("Hi", colour: .red)   →  warning [argument] 'colour' is not understood by Text in pack 'base' (1:12)
```

### Parameter and modifier types

A type is one of `text`, `number`, `bool`, `color`, `icon`, `enum` (with `values`) and `array` (with
`items`); a `number` may carry `min` and `max`. Types are kept by role, so a pack element needs none of
its own; `types: {"<name>": <type>}` in its `pack.json` entry adds to or overrides its role's, and a
label it types is understood. `vocabulary.json` types every rendered modifier and puts it in a group
(`layout`, `typography`, `colour`, `presentation`, `annotations`, `other`). The lookups give each type
in its object form; rendering never reads them:

```js
import { modifierTypes, parameterTypes } from "mockitdown";

parameterTypes("base", "Toggle").isOn;     // {type: "bool"}: common params, then the role's, then the element's types
parameterTypes("mui", "Button").variant;   // {type: "enum", values: ["text", "outlined", "contained"]}: its declared variants
modifierTypes().padding;                   // {group: "layout", args: [{label: null, type: {type: "enum", values: ["all", …]}}, {label: null, type: {type: "number"}}]}
```

### Design documents

A design (`.mkdesign`) is one JSON file of named mockups, each with its position, options and code.
`mockitdown/design` reads, validates and writes it, and holds the state the design tools share:

```js
import { DesignSession, mockupOptions, newDesign, readDesign, writeDesign } from "mockitdown/design";

const r = readDesign(text);                           // {document} or {errors: [{path, message}]}
if ("errors" in r) throw new Error(r.errors.map((e) => `${e.path}: ${e.message}`).join("\n"));
const session = new DesignSession(r.document);
session.subscribe(({ kind, detail }) => { /* select, hover, change, insert, active, diagnostics */ });
session.apply({ op: "remove", nodes: ["n3"] });       // one "change" with the text edits
session.setCode("Inbox", code);                       // code typed as text; the last valid tree is kept
session.delete();                                     // the selection, then select its next sibling, else previous, else parent
session.insert("Toggle()");                           // last child of the selected node, else at the end of the top level; selects it
writeDesign(session.document);                        // stable key order, unknown keys kept, code verbatim
mockupOptions(session.document, "Inbox");             // defaults under the mockup's options, with its pack
```

`writeDesign(readDesign(text).document)` gives `text` back for any text it wrote. Reading and writing
files, and converting a design to Markdown or HTML, stay with the host.

#### Undo and redo

Every operation, command and code change made through the session is one step of the session's undo
history, one history per session (so per opened document), keeping the latest 200 steps
(`historyLimit` may raise it). A step holds the mockup's code and tree, options and position before and
after the change, and the active mockup and selection on either side.

```js
session.undo();          // one "change" with the inverse edits; the selection from before the step
session.redo();          // one "change" with the step's edits; the selection from after it
session.canUndo;         // whether a step can be undone (canRedo: redone)
session.setCode("Inbox", code, { coalesce: "code" });   // a burst of typing: one step
```

A change made with the same `coalesce` key as the latest step (same mockup, same kind of change) within
1000 ms of that step's last change is merged into it; an undo or a redo ends the burst, and a burst that
comes back to where it started leaves no step. `apply`, `setText`, `setOptions` and `moveMockup` take the
same `{coalesce}` argument; without one every change is a step of its own. A new step after an undo drops
the steps that could have been redone. `new DesignSession(doc, { now })` gives coalescing another clock.

#### Commands on the selection

The session's selection commands (R-EDIT-008) each form one undo step, restoring the selection from
before and after them:

```js
session.selectRange(id);     // Shift-click: the siblings from the selection's first node to id
session.toggleSelected(id);  // Cmd/Ctrl-click: add or remove id (a non-sibling replaces the selection)
session.duplicate();         // a copy after each selected node, selected; .id("x") -> .id("x-2"), "x-3", ...
session.copy();              // the selected nodes' code at column 0, joined by line feeds ("" for none)
session.cut();               // copy, then remove as delete() does: {edits, source, tree, text}
session.paste(text);         // into the one selected container whose role accepts the views, else after
                             // the last selected node, else at the end of the top level; selected
session.moveUp();            // each selected node one position up (moveDown: down); nothing at the edge
```

A paste that does not parse, or holds anything but views (an import, a struct, a `let`), is refused with
its diagnostics and changes nothing. A pasted `.id` the mockup already uses gets the next free suffix, as
in a duplicate; one that is free (after a cut) is kept.

#### Restructuring commands

Wrap, unwrap, convert and extract component (R-EDIT-009) are one undo step each too, and are refused,
changing nothing, with a sentence saying why (the role rule's, for wrap and unwrap):

```js
session.wrap("HStack");              // the selected siblings into HStack { … } at the first one's place; selected
session.unwrap();                    // the one selected container replaced by its children; they are selected
session.convert("VBtn");             // same role only; keeps the labels VBtn understands and its params' positions
session.extractComponent("OrderCard"); // struct OrderCard: View { var body: some View { … } }, called as OrderCard()

session.commands;                    // [{name, label, shortcut, enabled}, …] for a host's menus, 13 commands
session.run("wrap", { name: "VStack" }); // any command by name: {name} for wrap/convert/extract, {text} for paste
```

Unwrap is refused for a node whose content declares a closure parameter (a `ForEach`) or a `let`, and
extract for a selection that uses a `let`, closure parameter or struct property declared outside it,
and for a name that is a struct, a pack element or already called in the mockup (so the new struct
never embeds itself). Convert selects the converted node, which has a new id. The composite designer binds
Cmd/Ctrl+G to wrap in a `VStack` and Shift+Cmd/Ctrl+G to unwrap.

### The editor element

`<mockitdown-editor>` (from the package entry) is the editable view of one mockup of a design session:
it renders the mockup in edit mode and turns clicks and hovers into the session's selection and hover.

```html
<mockitdown-editor pack="mui" device="fit">
  <script type="text/mockitdown">
    List { Card { Button("Open") {} } }
  </script>
</mockitdown-editor>
```

- Its session is the enclosing `mockitdown-designer`'s, else the one the host sets
  (`editor.session = new DesignSession(doc)`, with `mockup="Name"` to show a mockup other than the
  active one), else its own over the script child's code, with the fence attributes as defaults. Only
  an editor with a session of its own dispatches `mockitdown-select`, `mockitdown-change`, … to the page.
- `editor.code` (through `session.setCode`), `editor.session`, `editor.select(nodeId)`, `editor.rendered`.
- Click: the innermost element; again, or Esc: its parent (a click on the selected root starts again at
  the innermost); Enter: back to the child; a click on no element clears; Alt-click: cycle
  through the elements under the pointer; a `ForEach` row, `if` branch or component selects its
  construct and shows a "derived" badge. Hover outlines the element with `Button · 88 × 32`.
- Outlines are drawn in a layer above the rendering (`::part(overlay)`, `selection`, `hover`, `tag`,
  `badge`), coloured by `--mkd-selection-color` (default `#ff8a00`) and `--mkd-hover-color`
  (default `#2f80ed`). The test page is `pages/editor.html`.

### The outline element

`<mockitdown-outline>` shows the element tree of a design session's active mockup, with two tabs:
Elements (the tree) and Mockups (the document's mockups, the active one marked). It joins a session as
the editor does; to share an editor's, set it: `outline.session = editor.session`.

- One row per view of the mockup's edit-mode evaluation, nested as the views are: the element name,
  its main label and an `#id` chip (`Button "Open" #open`), 14 px of indent per level. A `ForEach`
  item, `if` branch or component view is italic with a link icon and selects its construct.
- A click or the keys select: ↑ ↓, Home, End, → (expand, then the first child), ← (collapse, then
  the parent), and typing the start of a name. The triangle expands and collapses; top-level rows start
  expanded. A selection made anywhere expands the row's ancestors and scrolls it into view
  (`outline.expandTo(nodeId)`).
- Hovering a row sets the session's hovered node (the editor outlines it); the row of a node hovered
  elsewhere is highlighted. `outline.rows`, `outline.rendered`; parts `tabs`, `tab`, `tree`, `row`,
  `twisty`, `link`, `name`, `label`, `chip`, `mockups`, `mockup`; row colours
  `--mkd-outline-selected-background`, `--mkd-outline-hover-background`.

### The designer element

`<mockitdown-designer>` composes the design tools over one design document: a toolbar (Design, Preview
and Code; Undo and Redo; Outline and Properties toggles; the active mockup, its pack and device), the outline above the
gallery on the left (240 px), the editable view, the properties panel on the right (260 px) and a
status bar (diagnostic count and a breadcrumb whose crumbs select their node).

```html
<mockitdown-designer id="d"></mockitdown-designer>
<script type="module">
  import { writeDesign } from "mockitdown/design";
  await d.open(await (await fetch("mail.mkdesign")).text());   // rejects with err.errors when invalid
  d.addEventListener("mockitdown-change", (e) => markEdited(e.detail.edits));
  save(writeDesign(d.toJSON()));                                // the document with every edit applied
</script>
```

- `d.session` is the designer's session (a new one per `open`); every component inside the designer
  joins it, and only the designer dispatches `mockitdown-select`, `-change`, `-insert`, `-rename` and
  `-diagnostics`. `d.document` returns `toJSON()`; setting it opens a document.
- Delete or Backspace with the focus in the outline or the view deletes the selection
  (`session.delete()`): one change, then the next sibling, else the previous one, else the parent is selected.
- Cmd/Ctrl+Z undoes, Shift+Cmd/Ctrl+Z and Ctrl+Y redo (`session.undo()`, `session.redo()`) while the
  focus is in the designer but not in a text field; the toolbar's Undo and Redo buttons (parts `undo`,
  `redo`) are enabled by `canUndo` and `canRedo`. Neither works in Preview mode.
- With the focus in the outline or the view: Cmd/Ctrl+D duplicates, Cmd/Ctrl+X, C and V cut, copy and
  paste (the system clipboard holds the code as `text/plain`; when it cannot be read, Cmd/Ctrl+V pastes
  what the designer copied last), Alt+Up and Alt+Down move the selection. Shift-click and Cmd/Ctrl-click
  in the outline and the view select several siblings. Not in a text field, nor in Preview mode.
- `mode` (attribute and property): `design` (default), `preview` (every mockup read-only through
  `mockitdown-mockup` with its options, a list of the mockups and a Light, Dark, Both toggle) or `code`
  (the active mockup's code). An unknown value means `design`.
- Drag a side panel's inner edge (or use ← → on it) to resize it; `d.layout` is
  `{left: {size, collapsed}, right: {size, collapsed}}` and may be set in part
  (`d.layout = {right: {collapsed: true}}`).
- Slots `toolbar`, `outline`, `gallery`, `view`, `inspector` and `status` replace a panel; the slotted
  element is given the session (`el.session = d.session`). The gallery panel holds
  `mockitdown-gallery`, the properties panel `mockitdown-inspector`. The test page is
  `pages/designer.html`.

### The gallery element

`<mockitdown-gallery>` lists the elements a session's selection may hold, as cards with a live preview
and an Add button. Inside a designer it joins the designer's session; elsewhere set `gallery.session`.

- The elements of the active mockup's pack, read from `dist/shared/reference/<pack>.json` beside the
  assets `loadAssetsFromUrl` loads: the pack's own first, then the inherited core vocabulary, in groups
  by role category (Frames, Bars, Layouts, Collections, Content, Overlays, Annotations), after a
  Components group of the structs the mockup declares or imports.
- Nothing selected: what the root of a mockup accepts; one node selected: what its element accepts
  (`allowedChildren`). The footer "Hidden here (n)" lists the others under the reason the role rules give.
- The search field, mirrored by `gallery.filter`, keeps the cards whose name, role or doc line contains
  the text, ignoring case.
- Previews are `mockitdown-mockup device="fit"` of each element's sample, created when a card comes
  within 200 px of the gallery's visible part.
- Add, a double-click on a card or Enter on the focused card (Up, Down, Home, End move between cards)
  inserts the element as its sample's call (see New elements below) through `session.insert(code)`: as the last child of the selected node, else at the
  end of the mockup's top level, then selects it; the session notifies `insert` (`mockitdown-insert`).
  `gallery.add(name)` does the same from a host's menu.
- `gallery.state` (`{mockup, pack, parent, cards, hidden}`), `gallery.rendered`; parts `search`, `list`,
  `group`, `card`, `name`, `add`, `preview`, `hidden`, `reason`.

### New elements

An element added from the gallery (Add or a drop) is written as the top-level call of its sample in the
pack's reference data, with its arguments and modifiers and without its trailing closures:
`Button("Label")`, `List()` for `List() { … }`, `Image().frame(width: 160, height: 96)`. A sample that
is not a call of the element (a `Tab` shown inside a `TabView`), a struct or an element without a sample
gives `<Name>()`. `sampleCall(name, sample)` in the core computes it; `insertCode(name, sample)` is the
gallery's name for it.

When the new call's first positional argument is a string literal, the editor showing the mockup opens
an inline field over the new element (`.mkd-editor__field`, part `text-field`) holding that text,
focused and selected. Enter or leaving the field commits the text as a change of its own through
`session.setText(nodeId, text)` (`setArgument` on the first positional argument; the same text changes
nothing); Esc closes it and keeps the sample's text. `session.firstText(nodeId)` gives the text the
field opens with, or null.

### Drag and drop

A gallery card can be dragged onto the outline or the editor, and an outline row (not a derived one)
within the outline; a row that is one of several selected rows drags them all. It is a pointer drag:
it starts after 4 px, a ghost by the pointer names what is dragged, and Esc cancels it.

- Over an outline row the drop goes before the row, inside it or after it, by the upper, middle or
  lower third of the row (the row's `data-drop`: `before`, `inside`, `after`); below the last row, to
  the end of the top level.
- Over the editor the innermost container under the pointer is outlined (`.mkd-editor__drop`, part
  `drop-target`) and a bar (`.mkd-editor__bar`, part `drop-bar`, `data-orientation`) marks the gap
  between its children nearest the pointer: horizontal in a `VStack`, vertical in an `HStack`.
- A position the role rules refuse, or one inside a dragged row's own subtree, is drawn in
  `--mkd-drop-refused-color` (default `#d93025`), with the `not-allowed` cursor and the reason by the
  pointer (`data-drop="inside refused"`); a drop there does nothing. Allowed positions use
  `--mkd-drop-color` (default `#2f80ed`).
- A drop is one session operation, one `change`: a card is inserted as its sample's call and selected, rows
  are moved and stay selected with their node ids. The components only point; the session decides:

```js
const at = session.dropPosition(nodeId, "before");                     // {parent, index} | {error}
session.checkDrop({ kind: "element", name: "Text", code: "Text()" }, at, "base"); // {ok} | {ok: false, reason}
session.drop({ kind: "nodes", mockup: "Drop", nodes: [id] }, at, "base");      // move; also insert(code, parent, index), move(nodes, parent, index)
session.isContainer(nodeId, "base"); session.childrenOf(nodeId);       // what the editor's indicator uses
```

### The inspector element

`<mockitdown-inspector>` shows the properties of a session's selection; inside a designer it is the
properties panel, elsewhere set `inspector.session`. Its fields come from the typed parameter data
(`parameterTypes`, `modifierTypes`), so a new pack needs no inspector code.

- One node selected: **Arguments** (the element's positional parameters in order, then the labelled
  arguments in use, and Add argument with the unused labels of its types), **Variant and state**
  (`variant` with the variants the element declares, and `selected`, `disabled`, `checked`, `value`
  where its types name them; written where they are, else as the pack's modifier of that name, else as
  an argument), **Modifiers** (the chain in the vocabulary's groups, each with its typed arguments and a
  Remove, and Add modifier with the rendered modifiers not in the chain) and **Identity** (`.id`, `.ref`,
  the comment).
- Controls by type: a text field (`text`), a number field (`number`, with its `min` and `max`), a switch
  (`bool`), a choice (`enum`), a colour field taking names and `#hex` (`color`), a text field suggesting
  icon names (`icon`), a list editor (`array`). A value none of them can show (a variable, `.infinity`)
  is edited as code. A labelled argument the pack does not understand says "not understood by this pack"
  and has a Remove.
- An edit is applied 150 ms after the last input (`INSPECTOR_DEBOUNCE_MS`), or when the control loses the
  focus, as one undo step per node and field (`{coalesce: "<node>:<field>"}`): a burst of typing is one
  step. A value the control cannot accept (`-10` for `.frame(width:)`), one the edit API refuses (an `.id`
  already in use) or one whose code adds a diagnostic at the node (an unknown icon) keeps its text, gets
  `aria-invalid="true"` and shows the reason (part `error`); nothing is applied.
- Several nodes selected: "*n* selected". Nothing selected: the Mockup tab (the name, and the pack,
  device, width, height, appearance, title, caption and Elements table options), each edit one
  `options` step.
- The model is `mockitdown/design`'s, usable without the element:

```js
import { inspect, setField, setOption, addArgument, addModifier, removeField } from "mockitdown/design";
const view = inspect(session, "mui");           // {view, node, arguments, state, modifiers, identity, addArguments, addModifiers, options}
setField(session, view.state.find((f) => f.label === "variant"), "outlined");   // {ok} | {ok: false, error, diagnostics}
setOption(session, "device", "tablet");
```

- Parts: `inspector`, `header`, `tab`, `count`, `group` (`data-group`), `heading`, `field` (`data-key`,
  `data-control`), `label`, `input`, `note`, `error`, `remove`, `modifier`, `add-argument`, `add-modifier`,
  `add-item`; custom properties `--mkd-inspector-border`, `--mkd-inspector-field-background`,
  `--mkd-inspector-label-color`, `--mkd-inspector-invalid-color`.

### The code view element

`<mockitdown-code>` is a light code editor for mockitdown, built here with no editor library: a
`<textarea>` with transparent text over a copy coloured from the core lexer (`highlight(source)` gives
the ranges: keyword, name, ident, modifier, member, string, number, comment, punct, error). The
designer's Code mode shows the active mockup in one, read-only for now (editing it is R-TOOL-009); it
also works on its own (`pages/code.html` puts one beside a `mockitdown-mockup`).

```js
code.value = source;                              // no event
code.diagnostics = check(source);                 // gutter marks; the caret line's messages below
code.addEventListener("input", () => mockup.code = code.value);   // one per keystroke or command
code.reveal({ start: 120, end: 128 });            // select the range and scroll it into view
```

- Line numbers in a gutter; a line holding a diagnostic is marked with its severity (`data-severity`)
  and its messages as the tooltip, and the messages of the caret's line are shown in the `message` part.
- The bracket next to the caret and its match are highlighted (`t-match`); an unmatched bracket is
  marked (`t-unmatched`). Brackets in strings and comments do not count.
- Enter keeps the line's indentation, one unit more after `{` or `(`; `}` first on a line takes one
  unit off; Tab and Shift+Tab indent and outdent the selected lines (Tab alone inserts a unit); Esc then
  Tab leaves the view. The unit is the source's (`indentUnit`). The keys go through the browser's
  `insertText` command, so its own undo keeps them.
- No find and replace, folding or multiple cursors. Re-colouring a 1000-line source takes about 10 ms
  in Chromium.
- Attributes `readonly`, `appearance` (`light`, `dark`, else the page's preference). Parts `code`,
  `gutter`, `line` (`data-line`), `highlight`, `text`, `message`; colours from `--mkd-code-keyword`,
  `--mkd-code-name`, `--mkd-code-ident`, `--mkd-code-modifier`, `--mkd-code-member`, `--mkd-code-string`,
  `--mkd-code-number`, `--mkd-code-comment`, `--mkd-code-punct`, `--mkd-code-error`, `--mkd-code-warning`,
  `--mkd-code-match`, `--mkd-code-selection`, `--mkd-code-background`, `--mkd-code-color`,
  `--mkd-code-gutter-background`, `--mkd-code-gutter-color` and the font from `--mkd-code-font`.

## Development

Node 22 or later.

```bash
cd typescript
npm install
npm run build        # tsc → dist/ (ES modules + .d.ts), then scripts/copy-shared.mjs → dist/shared/
npm run serve        # build, then serve the test pages on http://127.0.0.1:8173/ (PORT=… to change)
npx playwright install chromium                     # once: the test browser
npm test             # build, compile tests/ → test-build/, node --test, then Playwright (Chromium)
npx playwright test --project=firefox               # or webkit, after `npx playwright install firefox`
```

`scripts/serve.mjs` is a static server on `node:http`: `/` lists every page in `pages/`, and
`/pages/`, `/dist/` and `/shared/` serve `typescript/pages/`, `typescript/dist/` and the repository's
`shared/`; anything else is 404. The browser tests (`tests/browser/*.spec.mjs`) start it themselves.

Test pages: `pages/index.html`, the gallery home page (what the gallery is for, using the library,
and links to the hidden easter-egg packs), `pages/core.html` (the core API), `pages/mockup.html` (the
`mockitdown-mockup` element) and `pages/packs.html`, the pack gallery — every pack of `shared/reference/index.json` in a side panel, the
selected pack's elements (`shared/reference/<pack>.json`) and the design patterns of `shared/patterns/`
rendered in it, with `#pack=<id>` deep links, light/dark appearance and an element-name filter. Mockups
are created as they scroll into view; `window.packGallery.renderAll()` renders a whole pack at once.

`node scripts/copy-shared.mjs --check` reports a stale `dist/shared/`. The unit tests (`tests/unit/`,
`node:test`) run against `dist/`; `conformance.test.ts` walks every case of `shared/conformance/`.

Licence: MIT.
