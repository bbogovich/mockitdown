---
id: R-EDIT-009
title: "Commands: wrap, unwrap, convert and extract component"
status: active
version: 0.10.0
rev: 0
page: WEB.3
slot: reqs
order: 9
hash: 74444a3b7875
source: [SRC-12, SRC-16]
realizes: [F-19]
requires: [R-EDIT-008, R-PACK-016]
constrained_by: [A-WEB-4]
---

C1: `session.wrap(name)` MUST replace the selected sibling nodes by one call `<name> { … }` holding them in their order, at the position of the first, and select the new call.
C2: `wrap` MUST be refused when the element `name` cannot contain one of the nodes or the parent cannot contain `name` (R-PACK-016.C6), naming the reason.
C3: `session.unwrap()` MUST replace the selected node by its children, its arguments and modifiers removed with it, and MUST be refused when the parent cannot contain one of the children.
C4: `session.convert(name)` MUST replace the selected node's name by `name` (R-EDIT-003.C12) when the two elements have the same role in the mockup's pack, and MUST be refused otherwise.
C5: `convert` MUST keep the labelled arguments that the new element understands (R-EVAL-004.C7) and its positional arguments up to the number of its `params`, and MUST remove the others.
C6: `session.extractComponent(name)` MUST declare `struct <name>: View` with a `body` holding the selected nodes, after the mockup's last struct declaration or else before its first view statement, and replace the selection by the call `<name>()`.
C7: `extractComponent` MUST be refused when `name` is already a struct, an element of the mockup's pack or not an identifier beginning with an uppercase letter, and when the selection uses a `let` binding or closure parameter declared outside it.
C8: `session.commands` MUST list every command of the session (delete, duplicate, cut, copy, paste, move up, move down, wrap, unwrap, convert, extract component, undo and redo) with its name, label, shortcut and whether it is enabled for the current selection, and `session.run(name, args)` MUST run one, so that a host can offer them in its own menus.
C9: The composite designer MUST bind Cmd/Ctrl+G to wrap in a `VStack` and Cmd/Ctrl+Shift+G to unwrap.
C10: Each command of this requirement MUST be one undo step (R-EDIT-007).
V1: Wrapping two buttons in an `HStack`, unwrapping it, converting a `Button` to the pack's `VBtn` and extracting a card into a struct each give the expected code, render without a new diagnostic and undo to the original.
