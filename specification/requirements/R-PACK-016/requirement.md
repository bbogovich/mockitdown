---
id: R-PACK-016
title: Role rules
status: active
version: 0.13.12
rev: 10
page: PACK.3
slot: reqs
order: 1
hash: afcb25df64a6
source: [SRC-12]
realizes: [F-16]
requires: [R-PACK-004, R-REPO-002]
constrained_by: [A-REPO-1, M-PACK-2, M-PACK-3]
refs: [M-PACK-2, M-PACK-3, R-EVAL-004, R-PACK-017]
---

C1: `shared/language/roles.json` MUST hold one rule (M-PACK-3) for every render role, as `{"params": {…}, "root": {"accepts": […]}, "roles": {"<role>": {"title", "category", "accepts", "attach", "params"}, …}}`, the category being one of `frame`, `bar`, `layout`, `collection`, `content`, `overlay` and `annotation`, the title the role's name in a refusal sentence, and the `params` maps those of R-PACK-017.C1, whose labels are the ones of R-EVAL-004.C8.
C2: `accepts` MUST list the roles a role's views may hold as children, each entry a role name or a category written `@<category>`, and `root.accepts` MUST list those allowed at the root of a mockup.
C3: `attach` MUST be `child` for a view placed among its parent's children, `presentation` for an overlay attached through a presentation modifier (`.sheet`, `.alert`, `.overlay`) and `modifier` for an annotation attached as a modifier.
C4: The rules MUST follow SRC-12#s6.3: a frame only at the root, as a split-view column or as a tab's content; a bar inside a frame, the root, or a vertical or horizontal stack or group (standing in for the root stack), a toolbar holding only toolbar items, buttons, pickers and search fields; a layout holding layouts, content and the collections, a grid only grid rows; a collection only its item roles; content without children, except a button or link holding its label.
C5: An element definition in `pack.json` MAY carry `rules: {"accepts": […]}` (M-PACK-2), which MUST name a subset of what its role accepts and replaces the role's `accepts` for that element; a pack element without one MUST follow its role's rule.
C6: The TypeScript core MUST export `canContain(pack, parent, child)`, taking a pack id or a loaded pack and element names (or `null` for the root), which returns `{ok: true}` or `{ok: false, reason}`, the reason a sentence naming the rule that refuses (`A frame cannot be placed inside a horizontal stack`).
C7: The TypeScript core MUST export `allowedChildren(pack, parent)`, which returns `{allowed, refused}`: the names of the pack's elements the parent may hold, in the pack's order, and the others as `{reason, elements}` groups, one per reason.
C8: A parent view of role `unknown` MUST accept every child, and a child of role `unknown` MUST be accepted by every parent that accepts children.
C9: A shared test MUST fail when a render role of either variant has no rule, a rule names an unknown role or category, or a pack's `rules` widens its role's.
C10: The Python variant MUST package `roles.json`, MUST read only the labels of its `params` maps (R-EVAL-004.C8) and MUST NOT report a diagnostic from its role rules.
C11: The item roles of a collection (list item, table row and column, tree item, timeline item, board column, kanban card, menu item, tab, navigation item) MUST have the category `collection`, and a layout or the root MUST name the collections it holds by role, so that an item role is accepted only by its collection.
C12: `root.accepts` MUST accept the overlays, so that a mockup may show a dialog, sheet or toast on its own.
C13: An element name the pack does not define, and an element whose role has no rule, MUST be treated as role `unknown`.
C14: The reason MUST be `<A parent> cannot hold other elements` when the parent accepts nothing, `<A child> is attached through a presentation modifier (.sheet, .alert, .overlay), not placed inside <a parent>` for an overlay and `<A child> is attached as a modifier, not placed inside <a parent>` for an annotation, `<A child> cannot be placed inside <Element>, which its pack limits to <titles>` when the parent's pack narrows it, and otherwise `<A child> cannot be placed inside <a parent>` (`at the root of a mockup` for the root), the child named by its category when the parent accepts none of that category and by its title otherwise.
C15: If no role rules are loaded or the pack is unknown, then `canContain` and `allowedChildren` MUST throw a `MockitdownError`.
C16: The TypeScript core MUST export `holdsChildren(pack, name)`, true when the element's role, or its pack's narrowing (C5), accepts some role, and for an element the pack does not define.
V1: `canContain("base", "HStack", "NavigationSplitView")` is refused with a reason, `canContain("vuetify", "VCard", "VBtn")` is allowed as for a card and a button, and a Fiori object page that narrows its rule accepts only sections.
