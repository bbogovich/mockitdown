The second half of the edit API: the operations the inspector uses. They work on one call and leave
its neighbours, and its own formatting outside the changed span, untouched.

| Operation | Before | After |
|---|---|---|
| `setArgument` label `role`, value `.destructive` | `Button("Delete")` | `Button("Delete", role: .destructive)` |
| `setModifier` `padding`, `null` | `Text("A")` ⏎ `  .padding()` ⏎ `  .bold()` | `Text("A")` ⏎ `  .bold()` |
| `rename` `"save"` | `Button("Save")` | `Button("Save").id("save")` |
| `setName` `VBtn` | `Button("Save").id("save")` | `VBtn("Save").id("save")` |

As built (#22), the operations are objects like those of R-EDIT-002, the node named by id or ordinal:
`{op: "setArgument", node, label, position, value}`, `{op: "setModifier", node, name, index, args}`
(`args` is the code between the parentheses, `""` for `.bold()`), `{op: "rename", node, id}`,
`{op: "setRefs", node, refs}`, `{op: "setComment", node, text}` and `{op: "setName", node, name}`.
Removing what is not there is refused rather than ignored, so a host learns that its view of the code
is stale. A new argument next to one that starts its line goes on a line of its own, so a call written
one argument per line stays that way. A renamed element gets a new node id, as any edit of a node's name
does (R-EDIT-001.C10); a host that converts an element re-selects it by its position.

`setName` is the basis of the Convert command (R-EDIT-009); which arguments survive a conversion is the
command's business, not the operation's.

Re-checked at 0.10.3 together with the items it cites or is cited by (specification audit, #51): the citations are still accurate and no obligation changed.

**Re-checked at specification 0.10.6.** A-REND-1 and A-WEB-1 were revised as built by the behaviour-preserving renderer split (#48, #49), and the gallery test cases only renamed their files (#50); no obligation here changed.

**Re-checked at specification 0.10.7.** Its prerequisites were re-checked after the renderer split (#48, #49) and the gallery spec split (#50) without any change to an obligation; neither is this item changed.

**Re-checked at 0.11.0.** Its cited items ADR-21, R-EDIT-002 changed with SRC-18 (all packs recorded, stylesheet partials, gallery home page and easter eggs, TypeScript release builds, new packs); no obligation of this item changed.


**Re-checked at specification 0.12.12.** Re-read after the clarification records of the items it cites (#81), which closed the suspect citations left by the test-case backfills (#54 to #60) and the SRC-19 import map (0.12.0). No obligation it rests on changed, and none of its clauses is altered.
