---
title: "Role rules and typed parameters"
spec_version: 0.13.12
status: draft
updated: 2026-11-28
page_id: PACK.3
---

# Role rules and typed parameters

Shared language data that the design tools read (F-16.C6, F-16.C7; SRC-12#s6.3, SRC-12#s7): which
roles may contain which, how an element attaches to its parent, and the type of every role parameter
and rendered modifier. The data is kept by role in `shared/language/roles.json` and
`shared/language/vocabulary.json`, so a pack element inherits it from its role, and a pack overrides it
only for the elements that differ. Rendering never reads it: both variants publish it unchanged, and
only the TypeScript design tools enforce it.

### R-PACK-016 — Role rules

**Requires:** R-PACK-004, R-REPO-002

Which elements may go where (SRC-12#s6.3), decided by role so that a pack element inherits it: `VBtn`
behaves as a button and `ShellBar` as a bar. The gallery filters by it, drag and drop refuses by it and
the restructuring commands check it; each refusal comes with a sentence saying why.

| Category | Examples | May hold or be placed in |
|---|---|---|
| frame | NavigationStack, NavigationSplitView, TabView | only at the root, a split-view column or a tab's content |
| bar | AppBar, Toolbar, Sidebar | inside a frame or the root stack |
| layout | VStack, HStack, ZStack, Form, Section, Card | layouts and content; a Grid only GridRow |
| collection | List, Table, Tree, Menu, Board | only their item roles |
| content | Text, Image, Button, Toggle, Chart | no children (a Button or Link may hold its label) |
| overlay | Dialog, Sheet, Alert, Toast | attached through a presentation modifier |
| annotation | Callout, Pointer, highlight | attached as a modifier |

Every rule also carries a `title`, the role's name in a refusal (`horizontal stack`, `list item`). The
item roles of a collection (`listitem`, `treeitem`, `menuitem`, `tab`, …) are in the collection category,
and layouts name the collections they hold one by one, so that a tree item is offered only inside a tree.
The bars may stand in a vertical or horizontal stack or a group as well as in a frame or at the root,
since the root stack cannot be told apart from any other stack by role alone. The root also accepts the
overlays, so that a dialog or sheet can be drawn on its own. The sapui5 `ObjectPageLayout` narrows its
role (`vstack`) to `section`.

```js
canContain("base", "HStack", "NavigationSplitView") // {ok: false, reason: "A frame cannot be placed inside a horizontal stack"}
canContain("base", "Toolbar", "Text")              // {ok: false, reason: "A text cannot be placed inside a toolbar"}
canContain("sapui5", "ObjectPageLayout", "Text")    // … "inside ObjectPageLayout, which its pack limits to section"
```

Rendering never reads the table. Both packages carry it, but only the TypeScript design tools enforce it
for now; a Python warning for a misplaced role can follow once the rules have been exercised by the
gallery. The same file types the labels each role reads (`params`, R-PACK-017), and their labels are the
ones both evaluators use to warn about labelled arguments nothing understands (R-EVAL-004.C8).

Re-checked at 0.10.3 together with the items it cites or is cited by (specification audit, #51): the citations are still accurate and no obligation changed.

**Re-checked at specification 0.10.7.** Its prerequisites were re-checked after the renderer split (#48, #49) and the gallery spec split (#50) without any change to an obligation; neither is this item changed.

**Re-checked at 0.11.0.** Its cited items A-REPO-1, R-REPO-002 changed with SRC-18 (all packs recorded, stylesheet partials, gallery home page and easter eggs, TypeScript release builds, new packs); no obligation of this item changed.

Re-checked after R-REPO-002 was recorded as built (#54, partials resolved into the package copies, TC-4 tests named): no obligation of this requirement changed.


**Re-checked at specification 0.12.12.** Re-read after the clarification records of the items it cites (#81), which closed the suspect citations left by the test-case backfills (#54 to #60) and the SRC-19 import map (0.12.0). No obligation it rests on changed, and none of its clauses is altered.

**R-PACK-016.TC-1 — Every role has a rule**

Shared test in both suites (`python/tests/test_roles.py` `RoleTableTests`, `typescript/tests/unit/roles.test.ts`
"TC-1: …"): every role of the renderer's role table (the Python `r_<role>` methods, the TypeScript
`RENDER_ROLES`) has exactly one rule and no rule names a role the renderer lacks; every rule has a title,
a valid category and the attach mode of its category; every `accepts` entry is a role or `@category`;
every pack's `rules` is a subset of its role's; SRC-12#s6.3's examples hold (each frame accepted at the
root and refused in a stack, a card and a list, a Grid accepting only GridRow, a toolbar only toolbar
items, buttons, pickers and search fields, the item roles of List, Tree and Board, content leaves, a
button or link holding its label, overlays and annotations refused in a stack), with the hand-written
reasons of C14.

**R-PACK-016.TC-2 — canContain and allowedChildren**

`typescript/tests/unit/roles.test.ts` "TC-2: …" (`node:test`): the cases of V1, with the hand-written
reasons; the sapui5 `ObjectPageLayout` accepts only section-role elements while a plain `VStack` of the
same pack follows its role; a pack given as a `Pack`; `allowedChildren("base", "HStack")` lists `Toggle`
and not `TabView`, with `TabView` under "A frame cannot be placed inside a horizontal stack", every
element exactly once and one group per reason; a leaf parent refuses everything with one reason; an
element name the pack does not define accepts all and is accepted by every parent holding children, but
not by a leaf; `dist/shared/roles.json` equals `shared/language/roles.json` and is in the manifest; an
unknown pack throws. Python (`python/tests/test_roles.py` `PackagedTableTests`): the package holds
`roles.json` beside `vocabulary.json`, identical to `shared/`, and a mockup breaking a pack's rule
renders without a diagnostic; every conformance case's diagnostics are unchanged (the conformance suites
of both variants).

As built (#30): "TC-2: holdsChildren …" in the same file: `VStack`, `HStack` and `List` hold children, `Text` and
`Divider` do not, a name `base` does not define does, and the narrowed sapui5 `ObjectPageLayout` still does (C16).

**Realizes.** F-16

| | Statement |
|---|---|
| C1 | `shared/language/roles.json` MUST hold one rule (M-PACK-3) for every render role, as `{"params": {…}, "root": {"accepts": […]}, "roles": {"<role>": {"title", "category", "accepts", "attach", "params"}, …}}`, the category being one of `frame`, `bar`, `layout`, `collection`, `content`, `overlay` and `annotation`, the title the role's name in a refusal sentence, and the `params` maps those of R-PACK-017.C1, whose labels are the ones of R-EVAL-004.C8. |
| C2 | `accepts` MUST list the roles a role's views may hold as children, each entry a role name or a category written `@<category>`, and `root.accepts` MUST list those allowed at the root of a mockup. |
| C3 | `attach` MUST be `child` for a view placed among its parent's children, `presentation` for an overlay attached through a presentation modifier (`.sheet`, `.alert`, `.overlay`) and `modifier` for an annotation attached as a modifier. |
| C4 | The rules MUST follow SRC-12#s6.3: a frame only at the root, as a split-view column or as a tab's content; a bar inside a frame, the root, or a vertical or horizontal stack or group (standing in for the root stack), a toolbar holding only toolbar items, buttons, pickers and search fields; a layout holding layouts, content and the collections, a grid only grid rows; a collection only its item roles; content without children, except a button or link holding its label. |
| C5 | An element definition in `pack.json` MAY carry `rules: {"accepts": […]}` (M-PACK-2), which MUST name a subset of what its role accepts and replaces the role's `accepts` for that element; a pack element without one MUST follow its role's rule. |
| C6 | The TypeScript core MUST export `canContain(pack, parent, child)`, taking a pack id or a loaded pack and element names (or `null` for the root), which returns `{ok: true}` or `{ok: false, reason}`, the reason a sentence naming the rule that refuses (`A frame cannot be placed inside a horizontal stack`). |
| C7 | The TypeScript core MUST export `allowedChildren(pack, parent)`, which returns `{allowed, refused}`: the names of the pack's elements the parent may hold, in the pack's order, and the others as `{reason, elements}` groups, one per reason. |
| C8 | A parent view of role `unknown` MUST accept every child, and a child of role `unknown` MUST be accepted by every parent that accepts children. |
| C9 | A shared test MUST fail when a render role of either variant has no rule, a rule names an unknown role or category, or a pack's `rules` widens its role's. |
| C10 | The Python variant MUST package `roles.json`, MUST read only the labels of its `params` maps (R-EVAL-004.C8) and MUST NOT report a diagnostic from its role rules. |
| C11 | The item roles of a collection (list item, table row and column, tree item, timeline item, board column, kanban card, menu item, tab, navigation item) MUST have the category `collection`, and a layout or the root MUST name the collections it holds by role, so that an item role is accepted only by its collection. |
| C12 | `root.accepts` MUST accept the overlays, so that a mockup may show a dialog, sheet or toast on its own. |
| C13 | An element name the pack does not define, and an element whose role has no rule, MUST be treated as role `unknown`. |
| C14 | The reason MUST be `<A parent> cannot hold other elements` when the parent accepts nothing, `<A child> is attached through a presentation modifier (.sheet, .alert, .overlay), not placed inside <a parent>` for an overlay and `<A child> is attached as a modifier, not placed inside <a parent>` for an annotation, `<A child> cannot be placed inside <Element>, which its pack limits to <titles>` when the parent's pack narrows it, and otherwise `<A child> cannot be placed inside <a parent>` (`at the root of a mockup` for the root), the child named by its category when the parent accepts none of that category and by its title otherwise. |
| C15 | If no role rules are loaded or the pack is unknown, then `canContain` and `allowedChildren` MUST throw a `MockitdownError`. |
| C16 | The TypeScript core MUST export `holdsChildren(pack, name)`, true when the element's role, or its pack's narrowing (C5), accepts some role, and for an element the pack does not define. |
| V1 | `canContain("base", "HStack", "NavigationSplitView")` is refused with a reason, `canContain("vuetify", "VCard", "VBtn")` is allowed as for a card and a button, and a Fiori object page that narrows its rule accepts only sections. |

---

### R-PACK-017 — Typed parameters and modifiers

**Requires:** R-PACK-016

What control the inspector uses for each argument (SRC-12#s7). Types are kept by role, so the 3132
element definitions need no annotation each; a pack adds `types` only for an element whose parameters
differ from its role's, and a label it types that way is understood by the element's calls
(R-EVAL-004.C7). `params` in `pack.json` keeps its meaning — the names of the positional arguments — so
nothing that reads it changes.

As built (#33), the typed maps replaced the `reads` lists of R-EVAL-004.C8: the labels a role reads are
the keys of its `params`, those every role reads the keys of the table's top-level `params`. Each type
was chosen from what the renderer does with the label: `value` is a number for a slider, a progress bar
or a rating and text for a text field; `rows` is a number for a text field and an array of arrays for a
table. An `enum` names its values only where the renderer knows a fixed set (`orientation`,
`titleDisplayMode`, a button's `role`); the rest of the common markup (`size`, `state`, `severity`, …)
is `text`, its values differing from pack to pack. `variant` is `text` in the table, and
`parameterTypes` makes it an `enum` of the element's declared variants (C4).

```json
"params": {"color": "color", "disabled": "bool", "orientation": {"type": "enum", "values": ["horizontal", "vertical"]}, …},
"roles": {
  "button": {"title": "button", "category": "content", "accepts": ["text", "label", "icon", "image", …], "attach": "child",
             "params": {"label": "text", "role": {"type": "enum", "values": ["cancel", "destructive"]}, "systemImage": "icon", "loading": "bool", …}}
}
```

The modifiers are grouped as the renderer's stylesheet builder groups them: `layout` (padding, frame,
offset, position, aspect ratio, …), `typography`, `colour` (colour and shape: fills, strokes, borders,
corner radius, clip shape, shadow, opacity), `presentation` (alert, sheet, popover, overlay, …),
`annotations` (callouts, pointers, marquees, highlights, taps) and `other` (identity, navigation titles,
search, shortcuts, toolbars). An argument without a label is positional:

```json
"padding": {"group": "layout", "args": [{"label": null, "type": {"type": "enum", "values": ["all", "horizontal", "vertical", "top", "bottom", "leading", "trailing"]}}, {"label": null, "type": "number"}]}
```

Re-checked at 0.10.3 together with the items it cites or is cited by (specification audit, #51): the citations are still accurate and no obligation changed.

**Re-checked at specification 0.10.7.** Its prerequisites were re-checked after the renderer split (#48, #49) and the gallery spec split (#50) without any change to an obligation; neither is this item changed.

**Re-checked at 0.11.0.** Its cited items A-REPO-1, R-PACK-016 changed with SRC-18 (all packs recorded, stylesheet partials, gallery home page and easter eggs, TypeScript release builds, new packs); no obligation of this item changed.


**Re-checked at specification 0.12.10.** Re-read against R-PACK-016 (changed at 0.12.4: test cases backfilled and as-built clauses recorded by #54 to #60). No obligation this item rests on changed, and none of its clauses is altered (#81).


**Re-checked at specification 0.12.12.** Re-read after the clarification records of the items it cites (#81), which closed the suspect citations left by the test-case backfills (#54 to #60) and the SRC-19 import map (0.12.0). No obligation it rests on changed, and none of its clauses is altered.

**R-PACK-017.TC-1 — Types complete**

Shared test in both suites (`test_types.py`, `types.test.ts`): every rule has `params` with valid
types; every rendered modifier of the vocabulary has a group and argument types; every pack's `types`
is valid and `params` stays a list of names; the labels each role reads (R-EVAL-004.C8) all have a
type, being the keys of its `params`, which `test_unknown_labels.py` holds against what the Python
renderer looks up. The Python suite also runs each check on hand-written bad data (an unknown type, a rule
without `params`, an enum without values, an array without items, a repeated common label, a modifier
without an entry or with an unknown group) and expects the hand-written error list (C8).

**R-PACK-017.TC-2 — Lookups and no rendering change**

`node:test` (`typescript/tests/unit/types.test.ts`, IT-61): the cases of V1 and `modifierTypes().padding.group
=== "layout"`, each type in its object form; an application pack element whose `types` overrides and adds
to its role's (`variant` still the enum of its declared variants, `params` still a list of names); the
common params alone for an element the pack does not define; a `MockitdownError` for an unknown pack (C9).
Both conformance suites pass with the types loaded. Expected values written by hand from the shared files.

**Realizes.** F-16

| | Statement |
|---|---|
| C1 | `roles.json` MUST carry `params` at its top level, an object mapping each label every role reads through the common element markup to a type, and each of its rules MUST carry `params`, an object mapping each other label its role reads (R-EVAL-004.C8) to a type, without repeating a common label. |
| C2 | A type MUST be one of `text`, `number`, `bool`, `color`, `icon`, `enum` and `array`, written as the name or as an object `{"type": …}`, where `enum` names its `values`, `array` names the type of its `items`, and `number` MAY name `min` and `max`. |
| C3 | An element definition in `pack.json` MAY carry `types` (M-PACK-2), an object of parameter names and types that adds to or overrides its role's `params` for that element; `params` (M-PACK-2.F3) MUST stay a list of names. |
| C4 | The type of `variant` MUST be an `enum` of the variants the element declares (M-PACK-2.F5). |
| C5 | `shared/language/vocabulary.json` MUST also hold `modifiers`, an object mapping every rendered modifier to `{"group", "args"}`, the group being one of `layout`, `typography`, `colour`, `presentation`, `annotations` and `other`, and `args` listing each argument's label (or `null`) and type. |
| C6 | The TypeScript core MUST export `parameterTypes(pack, element)`, taking a pack id or a loaded pack, which returns the common `params`, then the element's role `params`, then its own `types`, the common ones alone for an element the pack does not define, and `modifierTypes()`, the vocabulary's `modifiers`, each type in its object form (`{"type": "bool"}`). |
| C7 | Loading the types MUST change neither the rendered HTML nor the diagnostics of any conformance case in either variant. |
| C8 | A shared test MUST fail when a rule has no `params`, a type is unknown, an element's `types` names a type that is unknown, or a rendered modifier has no entry in `modifiers`. |
| C9 | If no role rules are loaded or the pack is unknown, then `parameterTypes` MUST throw a `MockitdownError`. |
| V1 | `parameterTypes("base", "Toggle")` gives `isOn` as `bool`, `parameterTypes` of an element with declared variants gives `variant` as an `enum` of them, and the conformance suites pass unchanged. |

## Revision history

| Version | Date | Change |
|---|---|---|
| 0.13.12 | 2026-11-28 | as built (#33): the role table's reads lists became the keys of typed params maps (top-level params for the common labels); parameterTypes and modifierTypes; a label an element's types names is understood |
| 0.13.11 | 2026-11-28 | as built (#32): C1 the table carries reads (top level and per rule); C10 Python reads only the reads lists |
| 0.13.9 | 2026-11-28 | as built (#30): holdsChildren(pack, name), the editor's container test (C16) |
| 0.13.7 | 2026-11-28 | as built (#28): rules carry a title; bars also in stacks and groups; layouts name their collections, item roles in the collection category (C11); root accepts overlays (C12); unknown names (C13); the reason sentences (C14); a pack id or Pack; allowedChildren's shape; unloaded rules or unknown pack throw (C15); TC files name the tests |
| 0.12.12 | 2026-11-27 | re-checked with the items it cites after the #81 audit: unaffected (#81) |
| 0.12.11 | 2026-11-27 | re-checked against R-PACK-016: unaffected (#81) |
| 0.12.4 | 2026-11-27 | re-checked after the #54 as-built records, released with them |
| 0.12.3 | 2026-11-27 | re-checked after R-REPO-002 0.12.2 (#54): no obligation changed |
| 0.11.0 | 2026-11-27 | re-checked against A-REPO-1, R-PACK-016 (SRC-18): unaffected; re-checked against A-REPO-1, R-REPO-002 (SRC-18): unaffected |
| 0.10.8 | 2026-11-27 | re-checked after the renderer split: unaffected (#53) |
| 0.10.3 | 2026-11-26 | re-stamped with the items it cites after the audit's prose clarifications; no obligation changes (audit #51) |
| 0.10.0 | 2026-11-26 | Page created (ING-1) |
| 0.13.11 | 2026-11-28 | as built (#32): C1 the table carries reads (top level and per rule); C10 Python reads only the reads lists |
| 0.13.9 | 2026-11-28 | as built (#30): holdsChildren(pack, name), the editor's container test (C16) |
| 0.13.7 | 2026-11-28 | as built (#28): rules carry a title; bars also in stacks and groups; layouts name their collections, item roles in the collection category (C11); root accepts overlays (C12); unknown names (C13); the reason sentences (C14); a pack id or Pack; allowedChildren's shape; unloaded rules or unknown pack throw (C15); TC files name the tests |
| 0.12.12 | 2026-11-27 | re-checked with the items it cites after the #81 audit: unaffected (#81) |
| 0.12.11 | 2026-11-27 | re-checked against R-PACK-016: unaffected (#81) |
| 0.12.4 | 2026-11-27 | re-checked after the #54 as-built records, released with them |
| 0.12.3 | 2026-11-27 | re-checked after R-REPO-002 0.12.2 (#54): no obligation changed |
| 0.11.0 | 2026-11-27 | re-checked against A-REPO-1, R-PACK-016 (SRC-18): unaffected; re-checked against A-REPO-1, R-REPO-002 (SRC-18): unaffected |
| 0.10.8 | 2026-11-27 | re-checked after the renderer split: unaffected (#53) |
| 0.10.3 | 2026-11-26 | re-stamped with the items it cites after the audit's prose clarifications; no obligation changes (audit #51) |
| 0.10.0 | 2026-11-26 | Page created (ING-1) |
