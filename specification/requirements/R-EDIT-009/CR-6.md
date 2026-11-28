---
id: R-EDIT-009.CR-6
target: R-EDIT-009
kind: revision
version: 0.13.16
date: 2026-11-28
issue: 37
summary: "as built (#37): wrap keeps the wrapped ids and refuses a non-element name; unwrap of the one selected node selects its children, refused for no children, a ForEach parameter or a let (C11); convert selects the converted node and keeps closures, views and bindings; extract writes the struct in source order with the file's unit and refuses a name the mockup calls and struct properties; command shortcuts and enabled rules, run args; refusals without a placed selection (C12); TC-1, TC-2 name their tests"
from: 28bd2b6067f6
to: bd6e8261861f
---

## Clauses

@ C1 edit
~ `session.wrap(name)` MUST replace the selected sibling nodes by one call `<name> { … }` holding them in their order, at the position of the first, {+the wrapped nodes keeping their ids, +}and select the new call.
@ C2 edit
~ `wrap` MUST be refused when{+ `name` is not an element name,+} the element `name` cannot contain one of the nodes or the parent {+(past an `if` or a `ForEach`) +}cannot contain `name` (R-PACK-016.C6), naming the [-reason.-]{+reason with the refusing rule's sentence.+}
@ C3 edit
~ `session.unwrap()` MUST replace the{+ one+} selected node by its {+statement +}children, its [-arguments-]{+arguments, modifiers+} and [-modifiers-]{+other closures+} removed with it,{+ and select the children,+} and MUST be refused when {+it has no statement children or +}the parent{+ (past an `if` or a `ForEach`)+} cannot contain one of [-the children.-]{+them.+}
@ C4 edit
~ `session.convert(name)` MUST replace the{+ one+} selected node's name by `name` (R-EDIT-003.C12) when [-the-]{+both+} [-two-]{+are+} elements [-have-]{+of the mockup's pack with+} the same [-role-]{+role,+} [-in-]{+select+} the [-mockup's-]{+converted+} [-pack,-]{+node,+} and MUST be refused [-otherwise.-]{+otherwise, naming both roles.+}
@ C5 edit
~ `convert` MUST keep the labelled arguments that the new element understands [-(R-EVAL-004.C7)-]{+(R-EVAL-004.C7), whose value is a closure, a view or a binding,+} and its positional arguments up to the number of its `params`, and MUST remove the others.
@ C6 edit
~ `session.extractComponent(name)` MUST declare `struct <name>: View` with a `body` holding the selected [-nodes,-]{+nodes in source order with their comment lines, indented by the mockup's indentation unit and separated by a blank line,+} after the mockup's last struct declaration or else before its first view statement, and replace the selection by the call [-`<name>()`.-]{+`<name>()`, which it selects.+}
@ C7 edit
~ `extractComponent` MUST be refused when `name` is already a struct, an element of the mockup's [-pack-]{+pack, a name the mockup already calls (so that the struct never embeds itself, R-EVAL-005.C10)+} or not an identifier beginning with an uppercase letter, and when the selection uses a `let` [-binding or-]{+binding,+} closure parameter{+ or property of its struct+} declared outside it.
@ C8 edit
~ `session.commands` MUST list every command of the session (delete, duplicate, cut, copy, paste, move up, move down, wrap, unwrap, convert, extract component, undo and redo) with its name, label, shortcut {+(`Mod` for Cmd/Ctrl, null for none) +}and whether it is enabled for the current [-selection,-]{+selection (wrap for a `VStack`, convert for one selected element of the pack),+} and `session.run(name, args)` MUST run one,{+ with `{name}` for wrap, convert and extract component and `{text}` for paste, refusing an unknown name,+} so that a host can offer them in its own menus.
@ C11 insert after C10
+ `unwrap` MUST be refused when the node's content declares a closure parameter (a `ForEach`) or a `let`, which its children could use.
@ C12 insert after C11
+ `wrap`, `unwrap` and `extractComponent` MUST be refused, changing nothing, when nothing is selected or a selected node is not placed among its parent's statement children.

## Files

```diff
--- a/TC-1.md
+++ b/TC-1.md
@@ -3,9 +3,17 @@
 title: Restructuring commands
-verifies: [C1, C2, C3, C4, C5, C6, C7, C10]
+verifies: [C1, C2, C3, C4, C5, C6, C7, C10, C11, C12]
 ---
 
-`node:test`: wrap two sibling buttons in `HStack`; wrap a `NavigationSplitView` in a `VStack` (refused
-with a reason); unwrap the stack; convert `Button("Save", role: .destructive, bogus: 1)` to a
-same-role element keeping `role` and dropping `bogus`; convert to an element of another role (refused);
-extract a card into `struct OrderCard: View` and replace it by `OrderCard()`; extract a row using a
-`ForEach` parameter (refused). Each result renders without a new diagnostic and undoes to the original.
+`node:test` (`typescript/tests/unit/restructure.test.ts`, IT-65), every expected code written by hand:
+wrap two sibling buttons in `HStack` (ids kept, the stack selected); wrap a `NavigationSplitView` in a
+`VStack` (refused: "A frame cannot be placed inside a vertical stack"), a button in `Text` and in `List`,
+a lowercase name and nothing selected (refused); unwrap `HStack(spacing: 4) { … }.padding().id("row")`
+back to its two buttons, selected, and a wrap then unwrap to the original; unwrap a leaf, a `GridRow`
+in a `Grid`, a `ForEach` and a stack with a `let` (refused); in vuetify, convert
+`Button("Save", role: .destructive, bogus: 1)` to `VBtn` keeping `role` and dropping `bogus`, selected,
+and `Button("Go", "extra") {}` to `VBtn("Go") {}`; convert to `Text`, to an unknown name and with two
+nodes selected (refused); extract a card into `struct OrderCard: View` before the first view and
+replace it by `OrderCard()`, and two texts after the last struct; extract under a struct's name, a pack
+element's, a lowercase name and a name the mockup already calls, a row using a `ForEach` parameter, a
+`ForEach` using a top-level `let` and nothing selected (refused). Each result renders without a new
+diagnostic, is one step and undoes to the original with the selection restored.
--- a/TC-2.md
+++ b/TC-2.md
@@ -6,4 +6,9 @@
 
-`node:test`: `session.commands` lists the thirteen commands with labels and shortcuts, `enabled`
-false for unwrap on a leaf; `session.run("wrap", {name: "VStack"})` equals `session.wrap("VStack")`.
-Browser test: Cmd/Ctrl+G wraps the selection in a `VStack`.
+`node:test` (`typescript/tests/unit/restructure.test.ts`, IT-65): `session.commands` lists the thirteen
+commands in menu order with their labels and shortcuts, all but paste disabled with nothing selected,
+for a leaf at the first position moveUp and unwrap disabled, unwrap enabled on a container, undo after
+a step; `session.run("wrap", {name: "VStack"})` gives the code `session.wrap("VStack")` gives, `run`
+undoes and copies, and refuses an unknown name. Browser test (`typescript/tests/browser/commands.spec.mjs`,
+IT-65) on `pages/designer.html`: with the Inbox title and list selected, Cmd/Ctrl+G wraps them in a
+`VStack` (hand-written code), Shift+Cmd/Ctrl+G unwraps back to the sample with both selected, and
+Cmd/Ctrl+Z undoes the unwrap.
--- a/prose.md
+++ b/prose.md
@@ -16 +16,12 @@
 **Re-checked at specification 0.12.12.** Re-read after the clarification records of the items it cites (#81), which closed the suspect citations left by the test-case backfills (#54 to #60) and the SRC-19 import map (0.12.0). No obligation it rests on changed, and none of its clauses is altered.
+
+**As built (#37).** The commands are methods of the design session, each planned as edit operations and
+applied as one step: wrap inserts `<name> {}` at the first node's place and moves the nodes into it,
+unwrap moves the children before the node and removes it, so the moved nodes keep their ids; convert is
+a `setName` and one `setArgument` removal per dropped argument, and selects the converted node, which
+the new name gives a new id. Extract component removes the nodes, inserts `<name>()` in their place and
+writes the struct as text. Unwrap is refused for a `ForEach` and for content with a `let`, whose children
+would lose their names; extract refuses a name the mockup already calls, so the new struct can never
+contain itself. The role checks look past an `if` and a `ForEach` to the element whose rule holds the
+children, as a drop does. `session.commands` reports wrap as enabled when wrapping in a `VStack`, the
+designer's Cmd/Ctrl+G, would be accepted.
```
