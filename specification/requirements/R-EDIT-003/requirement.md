---
id: R-EDIT-003
title: "Edit API: arguments, modifiers and identifiers"
status: active
version: pending
rev: 5
page: WEB.3
slot: reqs
order: 3
hash: f6ca033017eb
source: [SRC-12]
realizes: [F-21]
requires: [R-EDIT-002]
constrained_by: [A-WEB-1, ADR-21]
refs: [R-EDIT-002]
---

C1: The operation `setArgument` MUST take a view node, a label (or `null` and a position for a positional argument) and the code of a value, or `null` to remove the argument, and add, replace or remove that argument of the node's call.
C2: `setArgument` MUST replace an existing argument in place, append a new labelled argument after the call's last argument, and insert a new positional argument at its position among the positional arguments.
C3: Removing an argument MUST also remove the comma and the space that separated it from its neighbour.
C4: When an argument is added to a call written without parentheses (`Divider`, `VStack { … }`), the edit MUST add the parentheses directly after the name; when the last argument of a call with a trailing closure is removed, the empty parentheses MUST be removed too.
C5: The operation `setModifier` MUST take a view node, a modifier name, an occurrence index (default 0, the first) and the code of its arguments, or `null` to remove it, and add, replace or remove that modifier in the node's chain.
C6: A new modifier MUST be appended to the end of the chain, on the chain's last line when the chain is written on one line, else on a line of its own at the indentation of the chain's other continuation lines.
C7: Removing a modifier written on a line of its own MUST remove that line.
C8: The operation `rename` MUST take a view node and an identifier and set the argument of the node's `.id(…)` modifier, adding the modifier when the node has none and removing it when the identifier is `null`.
C9: `rename` MUST be refused when another view node of the source carries the same identifier in `.id(…)`.
C10: The operation `setRefs` MUST take a view node and a list of strings and set its `.ref(…)` modifier to them, removing the modifier for an empty list.
C11: The operation `setComment` MUST take a view node and a text, or `null`, and replace the `//` comment lines directly above the node with one line per line of the text, at the node's indentation.
C12: The operation `setName` MUST take a view node and an element name and replace the node's name, leaving its arguments, modifiers and closures as written.
C13: Every operation of this requirement MUST have cases in the edit corpus (R-EDIT-002.C15) that show the code outside the changed span unchanged.
V1: The corpus cases of this requirement pass, among them a labelled argument added to `Button("Save")`, a modifier removed from a multi-line chain and a refused duplicate identifier.
