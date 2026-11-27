---
id: R-PACK-016
title: Role rules
status: active
version: 0.11.0
rev: 3
page: PACK.3
slot: reqs
order: 1
hash: 70e450e99bea
source: [SRC-12]
realizes: [F-16]
requires: [R-PACK-004, R-REPO-002]
constrained_by: [A-REPO-1, M-PACK-2, M-PACK-3]
refs: [M-PACK-2, M-PACK-3]
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
