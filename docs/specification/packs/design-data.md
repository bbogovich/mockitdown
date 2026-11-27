---
title: "Role rules and typed parameters"
spec_version: 0.10.8
status: draft
updated: 2026-11-27
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

Rendering never reads the table. Both packages carry it, but only the TypeScript design tools enforce it
for now; a Python warning for a misplaced role can follow once the rules have been exercised by the
gallery.

Re-checked at 0.10.3 together with the items it cites or is cited by (specification audit, #51): the citations are still accurate and no obligation changed.

**Re-checked at specification 0.10.7.** Its prerequisites were re-checked after the renderer split (#48, #49) and the gallery spec split (#50) without any change to an obligation; neither is this item changed.

**R-PACK-016.TC-1 — Every role has a rule**

Shared test in both suites (`test_roles.py`, `roles.test.ts`): every role of the renderer's role table
has a rule with a valid category and attach mode; every `accepts` entry is a role or `@category`; every
pack's `rules` is a subset of its role's; SRC-12#s6.3's examples hold (a frame accepted at the root and
refused in a stack, a Grid accepting only GridRow).

**R-PACK-016.TC-2 — canContain and allowedChildren**

`node:test`: the cases of V1; `allowedChildren("base", "HStack")` lists `Toggle` and not `TabView`,
with `TabView` under its reason; an `unknown` parent accepts all. Python: the package holds `roles.json`
and every conformance case's diagnostics are unchanged.

**Realizes.** F-16

| | Statement |
|---|---|
| C1 | `shared/language/roles.json` MUST hold one rule (M-PACK-3) for every render role, as `{"root": {"accepts": […]}, "roles": {"<role>": {"category", "accepts", "attach"}, …}}`, the category being one of `frame`, `bar`, `layout`, `collection`, `content`, `overlay` and `annotation`. |
| C2 | `accepts` MUST list the roles a role's views may hold as children, each entry a role name or a category written `@<category>`, and `root.accepts` MUST list those allowed at the root of a mockup. |
| C3 | `attach` MUST be `child` for a view placed among its parent's children, `presentation` for an overlay attached through a presentation modifier (`.sheet`, `.alert`, `.overlay`) and `modifier` for an annotation attached as a modifier. |
| C4 | The rules MUST follow SRC-12#s6.3: a frame only at the root, as a split-view column or as a tab's content; a bar inside a frame or the root stack, a toolbar holding only toolbar items, buttons, pickers and search fields; a layout holding layouts and content, a grid only grid rows; a collection only its item roles; content without children, except a button or link holding its label. |
| C5 | An element definition in `pack.json` MAY carry `rules: {"accepts": […]}` (M-PACK-2), which MUST name a subset of what its role accepts and replaces the role's `accepts` for that element; a pack element without one MUST follow its role's rule. |
| C6 | The TypeScript core MUST export `canContain(pack, parent, child)`, taking element names (or `null` for the root), which returns `{ok: true}` or `{ok: false, reason}`, the reason a sentence naming the rule that refuses (`A frame cannot be placed inside a horizontal stack`). |
| C7 | The TypeScript core MUST export `allowedChildren(pack, parent)`, which returns the pack's elements the parent may hold and the others grouped by their reason. |
| C8 | A parent view of role `unknown` MUST accept every child, and a child of role `unknown` MUST be accepted by every parent that accepts children. |
| C9 | A shared test MUST fail when a render role of either variant has no rule, a rule names an unknown role or category, or a pack's `rules` widens its role's. |
| C10 | The Python variant MUST package `roles.json` and MUST NOT report a diagnostic from it. |
| V1 | `canContain("base", "HStack", "NavigationSplitView")` is refused with a reason, `canContain("vuetify", "VCard", "VBtn")` is allowed as for a card and a button, and a Fiori object page that narrows its rule accepts only sections. |

---

### R-PACK-017 — Typed parameters and modifiers

**Requires:** R-PACK-016

What control the inspector uses for each argument (SRC-12#s7). Types are kept by role, so the 3132
element definitions need no annotation each; a pack adds `types` only for an element whose parameters
differ from its role's. `params` keeps its meaning — the names of the positional arguments — so nothing
that reads it changes.

```json
"button": {
  "category": "content", "accepts": [], "attach": "child",
  "params": { "label": "text", "role": { "type": "enum", "values": ["cancel", "destructive"] },
              "systemImage": "icon", "disabled": "bool" }
}
```

Re-checked at 0.10.3 together with the items it cites or is cited by (specification audit, #51): the citations are still accurate and no obligation changed.

**Re-checked at specification 0.10.7.** Its prerequisites were re-checked after the renderer split (#48, #49) and the gallery spec split (#50) without any change to an obligation; neither is this item changed.

**R-PACK-017.TC-1 — Types complete**

Shared test in both suites (`test_types.py`, `types.test.ts`): every rule has `params` with valid
types; every rendered modifier of the vocabulary has a group and argument types; every pack's `types`
is valid; the labels each role understands (R-EVAL-004.C8) all have a type.

**R-PACK-017.TC-2 — Lookups and no rendering change**

`node:test`: the cases of V1 and `modifierTypes().padding.group === "layout"`; both conformance suites
pass with the types loaded.

**Realizes.** F-16

| | Statement |
|---|---|
| C1 | Each rule of `roles.json` MUST carry `params`, an object mapping every labelled argument its role understands (R-EVAL-004.C7) to a type. |
| C2 | A type MUST be one of `text`, `number`, `bool`, `color`, `icon`, `enum` and `array`, written as the name or as an object `{"type": …}`, where `enum` names its `values`, `array` names the type of its `items`, and `number` MAY name `min` and `max`. |
| C3 | An element definition in `pack.json` MAY carry `types` (M-PACK-2), an object of parameter names and types that adds to or overrides its role's `params` for that element; `params` (M-PACK-2.F3) MUST stay a list of names. |
| C4 | The type of `variant` MUST be an `enum` of the variants the element declares (M-PACK-2.F5). |
| C5 | `shared/language/vocabulary.json` MUST also hold `modifiers`, an object mapping every rendered modifier to `{"group", "args"}`, the group being one of `layout`, `typography`, `colour`, `presentation`, `annotations` and `other`, and `args` listing each argument's label (or `null`) and type. |
| C6 | The TypeScript core MUST export `parameterTypes(pack, element)`, the element's role `params` with its own `types` applied, and `modifierTypes()`, the vocabulary's `modifiers`. |
| C7 | Loading the types MUST change neither the rendered HTML nor the diagnostics of any conformance case in either variant. |
| C8 | A shared test MUST fail when a rule has no `params`, a type is unknown, an element's `types` names a type that is unknown, or a rendered modifier has no entry in `modifiers`. |
| V1 | `parameterTypes("base", "Toggle")` gives `isOn` as `bool`, `parameterTypes` of an element with declared variants gives `variant` as an `enum` of them, and the conformance suites pass unchanged. |

## Revision history

| Version | Date | Change |
|---|---|---|
| 0.10.8 | 2026-11-27 | re-checked after the renderer split: unaffected (#53) |
| 0.10.3 | 2026-11-26 | re-stamped with the items it cites after the audit's prose clarifications; no obligation changes (audit #51) |
| 0.10.0 | 2026-11-26 | Page created (ING-1) |
| 0.10.3 | 2026-11-26 | re-stamped with the items it cites after the audit's prose clarifications; no obligation changes (audit #51) |
| 0.10.0 | 2026-11-26 | Page created (ING-1) |
