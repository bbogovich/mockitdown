---
id: R-PACK-016.CR-7
target: R-PACK-016
kind: revision
version: 0.13.7
date: 2026-11-28
issue: 28
summary: "as built (#28): rules carry a title; bars also in stacks and groups; layouts name their collections, item roles in the collection category (C11); root accepts overlays (C12); unknown names (C13); the reason sentences (C14); a pack id or Pack; allowedChildren's shape; unloaded rules or unknown pack throw (C15); TC files name the tests"
from: 6b58db1ae1a5
to: 79fa5d7a289c
---

## Clauses

@ C1 edit
~ `shared/language/roles.json` MUST hold one rule (M-PACK-3) for every render role, as `{"root": {"accepts": […]}, "roles": {"<role>": [-{"category",-]{+{"title", "category",+} "accepts", "attach"}, …}}`, the category being one of `frame`, `bar`, `layout`, `collection`, `content`, `overlay` and [-`annotation`.-]{+`annotation`, and the title the role's name in a refusal sentence.+}
@ C4 edit
~ The rules MUST follow SRC-12#s6.3: a frame only at the root, as a split-view column or as a tab's content; a bar inside a [-frame-]{+frame, the root,+} or{+ a vertical or horizontal stack or group (standing in for+} the root [-stack,-]{+stack),+} a toolbar holding only toolbar items, buttons, pickers and search fields; a layout holding [-layouts-]{+layouts, content+} and [-content,-]{+the collections,+} a grid only grid rows; a collection only its item roles; content without children, except a button or link holding its label.
@ C6 edit
~ The TypeScript core MUST export `canContain(pack, parent, child)`, taking{+ a pack id or a loaded pack and+} element names (or `null` for the root), which returns `{ok: true}` or `{ok: false, reason}`, the reason a sentence naming the rule that refuses (`A frame cannot be placed inside a horizontal stack`).
@ C7 edit
~ The TypeScript core MUST export `allowedChildren(pack, parent)`, which returns {+`{allowed, refused}`: the names of +}the pack's elements the parent may [-hold-]{+hold, in the pack's order,+} and the others [-grouped-]{+as+} [-by-]{+`{reason,+} [-their-]{+elements}` groups, one per+} reason.
@ C11 insert after C10
+ The item roles of a collection (list item, table row and column, tree item, timeline item, board column, kanban card, menu item, tab, navigation item) MUST have the category `collection`, and a layout or the root MUST name the collections it holds by role, so that an item role is accepted only by its collection.
@ C12 insert after C11
+ `root.accepts` MUST accept the overlays, so that a mockup may show a dialog, sheet or toast on its own.
@ C13 insert after C12
+ An element name the pack does not define, and an element whose role has no rule, MUST be treated as role `unknown`.
@ C14 insert after C13
+ The reason MUST be `<A parent> cannot hold other elements` when the parent accepts nothing, `<A child> is attached through a presentation modifier (.sheet, .alert, .overlay), not placed inside <a parent>` for an overlay and `<A child> is attached as a modifier, not placed inside <a parent>` for an annotation, `<A child> cannot be placed inside <Element>, which its pack limits to <titles>` when the parent's pack narrows it, and otherwise `<A child> cannot be placed inside <a parent>` (`at the root of a mockup` for the root), the child named by its category when the parent accepts none of that category and by its title otherwise.
@ C15 insert after C14
+ If no role rules are loaded or the pack is unknown, then `canContain` and `allowedChildren` MUST throw a `MockitdownError`.

## Files

```diff
--- a/TC-1.md
+++ b/TC-1.md
@@ -3,8 +3,13 @@
 title: Every role has a rule
-verifies: [C1, C2, C3, C4, C9]
+verifies: [C1, C2, C3, C4, C9, C11]
 ---
 
-Shared test in both suites (`test_roles.py`, `roles.test.ts`): every role of the renderer's role table
-has a rule with a valid category and attach mode; every `accepts` entry is a role or `@category`; every
-pack's `rules` is a subset of its role's; SRC-12#s6.3's examples hold (a frame accepted at the root and
-refused in a stack, a Grid accepting only GridRow).
+Shared test in both suites (`python/tests/test_roles.py` `RoleTableTests`, `typescript/tests/unit/roles.test.ts`
+"TC-1: …"): every role of the renderer's role table (the Python `r_<role>` methods, the TypeScript
+`RENDER_ROLES`) has exactly one rule and no rule names a role the renderer lacks; every rule has a title,
+a valid category and the attach mode of its category; every `accepts` entry is a role or `@category`;
+every pack's `rules` is a subset of its role's; SRC-12#s6.3's examples hold (each frame accepted at the
+root and refused in a stack, a card and a list, a Grid accepting only GridRow, a toolbar only toolbar
+items, buttons, pickers and search fields, the item roles of List, Tree and Board, content leaves, a
+button or link holding its label, overlays and annotations refused in a stack), with the hand-written
+reasons of C14.
--- a/TC-2.md
+++ b/TC-2.md
@@ -3,7 +3,15 @@
 title: canContain and allowedChildren
-verifies: [C5, C6, C7, C8, C10]
+verifies: [C5, C6, C7, C8, C10, C12, C13, C14, C15]
 ---
 
-`node:test`: the cases of V1; `allowedChildren("base", "HStack")` lists `Toggle` and not `TabView`,
-with `TabView` under its reason; an `unknown` parent accepts all. Python: the package holds `roles.json`
-and every conformance case's diagnostics are unchanged.
+`typescript/tests/unit/roles.test.ts` "TC-2: …" (`node:test`): the cases of V1, with the hand-written
+reasons; the sapui5 `ObjectPageLayout` accepts only section-role elements while a plain `VStack` of the
+same pack follows its role; a pack given as a `Pack`; `allowedChildren("base", "HStack")` lists `Toggle`
+and not `TabView`, with `TabView` under "A frame cannot be placed inside a horizontal stack", every
+element exactly once and one group per reason; a leaf parent refuses everything with one reason; an
+element name the pack does not define accepts all and is accepted by every parent holding children, but
+not by a leaf; `dist/shared/roles.json` equals `shared/language/roles.json` and is in the manifest; an
+unknown pack throws. Python (`python/tests/test_roles.py` `PackagedTableTests`): the package holds
+`roles.json` beside `vocabulary.json`, identical to `shared/`, and a mockup breaking a pack's rule
+renders without a diagnostic; every conformance case's diagnostics are unchanged (the conformance suites
+of both variants).
--- a/prose.md
+++ b/prose.md
@@ -13,2 +13,16 @@
 | annotation | Callout, Pointer, highlight | attached as a modifier |
+
+Every rule also carries a `title`, the role's name in a refusal (`horizontal stack`, `list item`). The
+item roles of a collection (`listitem`, `treeitem`, `menuitem`, `tab`, …) are in the collection category,
+and layouts name the collections they hold one by one, so that a tree item is offered only inside a tree.
+The bars may stand in a vertical or horizontal stack or a group as well as in a frame or at the root,
+since the root stack cannot be told apart from any other stack by role alone. The root also accepts the
+overlays, so that a dialog or sheet can be drawn on its own. The sapui5 `ObjectPageLayout` narrows its
+role (`vstack`) to `section`.
+
+```js
+canContain("base", "HStack", "NavigationSplitView") // {ok: false, reason: "A frame cannot be placed inside a horizontal stack"}
+canContain("base", "Toolbar", "Text")              // {ok: false, reason: "A text cannot be placed inside a toolbar"}
+canContain("sapui5", "ObjectPageLayout", "Text")    // … "inside ObjectPageLayout, which its pack limits to section"
+```
 
```
