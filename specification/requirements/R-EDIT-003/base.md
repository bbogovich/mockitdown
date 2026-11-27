---
id: R-EDIT-003
title: "Edit API: arguments, modifiers and identifiers"
status: active
version: 0.10.0
rev: 0
page: WEB.3
slot: reqs
order: 3
hash: cd484bf0a411
source: [SRC-12]
realizes: [F-21]
requires: [R-EDIT-002]
constrained_by: [A-WEB-1, ADR-21]
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
<!-- file: TC-1.md -->
---
id: TC-1
title: Argument, modifier and identifier cases
verifies: [C1, C2, C3, C4, C5, C6, C7, C8, C10, C11, C12, C13]
---

Edit corpus cases (run by R-EDIT-002.TC-1) for each operation: add, replace and remove a positional and
a labelled argument; parentheses added to `Divider` and removed from `VStack(spacing: 8) { … }`; a
modifier added to a one-line and to a multi-line chain, replaced, and removed from both; `.id` set,
replaced and removed; `.ref` set and cleared; a comment set, replaced and removed; a name replaced. Each
expected file differs from its source only in the changed span.
<!-- file: TC-2.md -->
---
id: TC-2
title: Duplicate identifier refused
verifies: [C9]
---

`node:test`: with `.id("save")` on one button, `rename` of another button to `save` is refused with a
message naming the identifier, and returns no edits.
<!-- file: prose.md -->
The second half of the edit API: the operations the inspector uses. They work on one call and leave
its neighbours, and its own formatting outside the changed span, untouched.

| Operation | Before | After |
|---|---|---|
| `setArgument` label `role`, value `.destructive` | `Button("Delete")` | `Button("Delete", role: .destructive)` |
| `setModifier` `padding`, `null` | `Text("A")` ⏎ `  .padding()` ⏎ `  .bold()` | `Text("A")` ⏎ `  .bold()` |
| `rename` `"save"` | `Button("Save")` | `Button("Save").id("save")` |
| `setName` `VBtn` | `Button("Save").id("save")` | `VBtn("Save").id("save")` |

`setName` is the basis of the Convert command (R-EDIT-009); which arguments survive a conversion is the
command's business, not the operation's.
