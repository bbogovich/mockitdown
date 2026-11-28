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

The table also lists the labels each role reads (`reads`: the top-level list for every role, each
rule's for its own; `roleReads(role)` gives both). Evaluation warns, with code `argument`, about a
labelled argument of an element call that nothing understands — not a param or default of the element,
an alias of the element or its pack, a label its role reads, a closure or views (a slot), an action, or
a binding (`$x`) — and still renders the element, exactly as the Python variant does:

```text
Text("Hi", colour: .red)   →  warning [argument] 'colour' is not understood by Text in pack 'base' (1:12)
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
and Code; Outline and Properties toggles; the active mockup, its pack and device), the outline above the
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
- `mode` (attribute and property): `design` (default), `preview` (every mockup read-only through
  `mockitdown-mockup` with its options, a list of the mockups and a Light, Dark, Both toggle) or `code`
  (the active mockup's code). An unknown value means `design`.
- Drag a side panel's inner edge (or use ← → on it) to resize it; `d.layout` is
  `{left: {size, collapsed}, right: {size, collapsed}}` and may be set in part
  (`d.layout = {right: {collapsed: true}}`).
- Slots `toolbar`, `outline`, `gallery`, `view`, `inspector` and `status` replace a panel; the slotted
  element is given the session (`el.session = d.session`). The gallery panel holds
  `mockitdown-gallery`; the properties panel holds a placeholder until the inspector exists. The test
  page is `pages/designer.html`.

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
