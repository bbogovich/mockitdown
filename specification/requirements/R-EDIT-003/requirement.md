---
id: R-EDIT-003
title: "Edit API: arguments, modifiers and identifiers"
status: active
version: 0.12.18
rev: 6
page: WEB.3
slot: reqs
order: 3
hash: 14bb2a39f25b
source: [SRC-12]
realizes: [F-21]
requires: [R-EDIT-002]
constrained_by: [A-WEB-1, ADR-21]
refs: [R-EDIT-001, R-EDIT-002]
---

C1: The operation `setArgument` MUST take a view node, a label (or `null` and a position for a positional argument) and the code of a value, or `null` to remove the argument, and add, replace or remove that argument of the node's call.
C2: `setArgument` MUST replace an existing argument's value in place, append a new labelled argument after the call's last argument, and insert a new positional argument at its position among the positional arguments: before the one at that position, else after the last positional argument, else before the first argument.
C3: Removing an argument MUST also remove the comma and the space that separated it from its neighbour.
C4: When an argument is added to a call written without parentheses (`Divider`, `VStack { … }`), the edit MUST add the parentheses directly after the name; when the last argument of a call with a trailing closure is removed, the empty parentheses MUST be removed too, and kept on a call without one.
C5: The operation `setModifier` MUST take a view node, a modifier name, an occurrence index (default 0, the first) and the code of its arguments, or `null` to remove it, and add, replace or remove that modifier in the node's chain.
C6: A new modifier MUST be appended to the end of the chain: on the chain's last line when no modifier of the chain starts a line of its own, else on a new line after the chain's last line and any comment trailing it, at the indentation of the chain's last continuation line.
C7: Removing a modifier that starts its line and is followed on it by at most a comment MUST remove that line, the comment included; a modifier sharing its line with other code MUST be removed with the spaces before it on that line.
C8: The operation `rename` MUST take a view node and an identifier and set the argument of the node's `.id(…)` modifier to it as a string literal, adding the modifier when the node has none and removing it when the identifier is `null`.
C9: `rename` MUST be refused when another view node of the source carries the same identifier in `.id(…)`.
C10: The operation `setRefs` MUST take a view node and a list of strings and set its `.ref(…)` modifier to them, removing the modifier for an empty list.
C11: The operation `setComment` MUST take a view node and a text, or `null`, and replace the comment lines leading the node (R-EDIT-001.C11) with one `//` line per line of the text, at the node's indentation, removing them for `null` or an empty text.
C12: The operation `setName` MUST take a view node and an element name and replace the node's name, leaving its arguments, modifiers and closures as written.
C13: Every operation of this requirement MUST have cases in the edit corpus (R-EDIT-002.C15) that show the code outside the changed span unchanged.
C14: `setArgument` MUST be refused for a label that is not an identifier, for a position outside 0 to the number of positional arguments, for a value that does not parse as one argument value (with the syntax diagnostic, its column counted from the start of the value), and for the removal of an argument the call does not have.
C15: A new argument placed next to an argument that starts its line MUST be written on a line of its own at that argument's indentation, the comma ending the line before.
C16: `setModifier` MUST be refused for a name that is not an identifier starting with a lower-case letter, for arguments that do not parse as an argument list, for an occurrence index outside 0 to the number of occurrences, and for the removal of an occurrence the chain does not have; an index equal to the number of occurrences adds one.
C17: `rename` MUST be refused for an empty identifier, and `rename` with `null` and `setRefs` with an empty list MUST be refused when the node has no such modifier.
C18: `setComment` MUST be refused for a node that does not start its line, and for `null` or an empty text when no comment lines lead the node.
C19: `setName` MUST be refused for a name that is not a capitalised identifier or several joined by dots, and the renamed node MUST get a new node id (R-EDIT-001.C10).
C20: Every operation of this requirement except `setComment` MUST be refused for an `if` node.
V1: The corpus cases of this requirement pass, among them a labelled argument added to `Button("Save")`, a modifier removed from a multi-line chain and a refused duplicate identifier.
