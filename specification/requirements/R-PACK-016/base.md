---
id: R-PACK-016
title: Role rules
status: active
version: 0.10.0
rev: 0
page: PACK.3
slot: reqs
order: 1
hash: 0d84d7892993
source: [SRC-12]
realizes: [F-16]
requires: [R-PACK-004, R-REPO-002]
constrained_by: [A-REPO-1, M-PACK-2, M-PACK-3]
---

C1: `shared/language/roles.json` MUST hold one rule (M-PACK-3) for every render role, as `{"root": {"accepts": […]}, "roles": {"<role>": {"category", "accepts", "attach"}, …}}`, the category being one of `frame`, `bar`, `layout`, `collection`, `content`, `overlay` and `annotation`.
C2: `accepts` MUST list the roles a role's views may hold as children, each entry a role name or a category written `@<category>`, and `root.accepts` MUST list those allowed at the root of a mockup.
C3: `attach` MUST be `child` for a view placed among its parent's children, `presentation` for an overlay attached through a presentation modifier (`.sheet`, `.alert`, `.overlay`) and `modifier` for an annotation attached as a modifier.
C4: The rules MUST follow SRC-12#s6.3: a frame only at the root, as a split-view column or as a tab's content; a bar inside a frame or the root stack, a toolbar holding only toolbar items, buttons, pickers and search fields; a layout holding layouts and content, a grid only grid rows; a collection only its item roles; content without children, except a button or link holding its label.
C5: An element definition in `pack.json` MAY carry `rules: {"accepts": […]}` (M-PACK-2), which MUST name a subset of what its role accepts and replaces the role's `accepts` for that element; a pack element without one MUST follow its role's rule.
C6: The TypeScript core MUST export `canContain(pack, parent, child)`, taking element names (or `null` for the root), which returns `{ok: true}` or `{ok: false, reason}`, the reason a sentence naming the rule that refuses (`A frame cannot be placed inside a horizontal stack`).
C7: The TypeScript core MUST export `allowedChildren(pack, parent)`, which returns the pack's elements the parent may hold and the others grouped by their reason.
C8: A parent view of role `unknown` MUST accept every child, and a child of role `unknown` MUST be accepted by every parent that accepts children.
C9: A shared test MUST fail when a render role of either variant has no rule, a rule names an unknown role or category, or a pack's `rules` widens its role's.
C10: The Python variant MUST package `roles.json` and MUST NOT report a diagnostic from it.
V1: `canContain("base", "HStack", "NavigationSplitView")` is refused with a reason, `canContain("vuetify", "VCard", "VBtn")` is allowed as for a card and a button, and a Fiori object page that narrows its rule accepts only sections.
<!-- file: TC-1.md -->
---
id: TC-1
title: Every role has a rule
verifies: [C1, C2, C3, C4, C9]
---

Shared test in both suites (`test_roles.py`, `roles.test.ts`): every role of the renderer's role table
has a rule with a valid category and attach mode; every `accepts` entry is a role or `@category`; every
pack's `rules` is a subset of its role's; SRC-12#s6.3's examples hold (a frame accepted at the root and
refused in a stack, a Grid accepting only GridRow).
<!-- file: TC-2.md -->
---
id: TC-2
title: canContain and allowedChildren
verifies: [C5, C6, C7, C8, C10]
---

`node:test`: the cases of V1; `allowedChildren("base", "HStack")` lists `Toggle` and not `TabView`,
with `TabView` under its reason; an `unknown` parent accepts all. Python: the package holds `roles.json`
and every conformance case's diagnostics are unchanged.
<!-- file: prose.md -->
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
