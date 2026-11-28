---
id: R-EDIT-009
title: "Commands: wrap, unwrap, convert and extract component"
status: active
version: 0.14.0
rev: 8
page: WEB.3
slot: reqs
order: 9
hash: 098dc2507b4c
source: [SRC-21, SRC-12, SRC-16]
realizes: [F-19]
requires: [R-EDIT-008, R-PACK-016]
constrained_by: [A-WEB-4]
refs: [R-EDIT-003, R-EDIT-007, R-EVAL-004, R-EVAL-005, R-PACK-016, R-TOOL-013, R-TOOL-014]
---

C1: `session.wrap(name)` MUST replace the selected sibling nodes by one call `<name> { … }` holding them in their order, at the position of the first, the wrapped nodes keeping their ids, and select the new call.
C2: `wrap` MUST be refused when `name` is not an element name, the element `name` cannot contain one of the nodes or the parent (past an `if` or a `ForEach`) cannot contain `name` (R-PACK-016.C6), naming the reason with the refusing rule's sentence.
C3: `session.unwrap()` MUST replace the one selected node by its statement children, its arguments, modifiers and other closures removed with it, and select the children, and MUST be refused when it has no statement children or the parent (past an `if` or a `ForEach`) cannot contain one of them.
C4: `session.convert(name)` MUST replace the one selected node's name by `name` (R-EDIT-003.C12) when both are elements of the mockup's pack with the same role, select the converted node, and MUST be refused otherwise, naming both roles.
C5: `convert` MUST keep the labelled arguments that the new element understands (R-EVAL-004.C7), whose value is a closure, a view or a binding, and its positional arguments up to the number of its `params`, and MUST remove the others.
C6: `session.extractComponent(name)` MUST declare `struct <name>: View` with a `body` holding the selected nodes in source order with their comment lines, indented by the mockup's indentation unit and separated by a blank line, after the mockup's last struct declaration or else before its first view statement, and replace the selection by the call `<name>()`, which it selects.
C7: `extractComponent` MUST be refused when `name` is already a struct, an element of the mockup's pack, a name the mockup already calls (so that the struct never embeds itself, R-EVAL-005.C10) or not an identifier beginning with an uppercase letter, and when the selection uses a `let` binding, closure parameter or property of its struct declared outside it.
C8: `session.commands` MUST list every command of the session (delete, duplicate, cut, copy, paste, move up, move down, wrap, unwrap, convert, extract component, new mockup, duplicate mockup, delete mockup, new section, delete section, undo and redo, R-TOOL-013.C4, R-TOOL-014.C13) with its name, label, shortcut (`Mod` for Cmd/Ctrl, null for none) and whether it is enabled for the current selection (wrap for a `VStack`, convert for one selected element of the pack), and `session.run(name, args)` MUST run one, with `{name}` for wrap, convert and extract component, `{text}` for paste `{mockup}` for duplicate mockup and delete mockup, `{name}` for new section and `{section}` for delete section, refusing an unknown name, so that a host can offer them in its own menus.
C9: The composite designer MUST bind Cmd/Ctrl+G to wrap in a `VStack` and Cmd/Ctrl+Shift+G to unwrap.
C10: Each command of this requirement MUST be one undo step (R-EDIT-007).
C11: `unwrap` MUST be refused when the node's content declares a closure parameter (a `ForEach`) or a `let`, which its children could use.
C12: `wrap`, `unwrap` and `extractComponent` MUST be refused, changing nothing, when nothing is selected or a selected node is not placed among its parent's statement children.
V1: Wrapping two buttons in an `HStack`, unwrapping it, converting a `Button` to the pack's `VBtn` and extracting a card into a struct each give the expected code, render without a new diagnostic and undo to the original.
