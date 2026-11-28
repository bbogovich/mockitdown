The restructuring commands (SRC-12#s8). They read the role rules (R-PACK-016) to refuse what the
gallery would refuse — a frame wrapped into a stack, a toolbar item unwrapped into a list — and say why.
`session.commands` is the menu model a host such as the MockItDown Designer builds its Edit and Arrange
menus from (SRC-16 D37).

Re-checked at 0.10.3 together with the items it cites or is cited by (specification audit, #51): the citations are still accurate and no obligation changed.

**Re-checked at specification 0.10.7.** Its prerequisites were re-checked after the renderer split (#48, #49) and the gallery spec split (#50) without any change to an obligation; neither is this item changed.

**Re-checked at 0.11.0.** Its cited items R-EDIT-008, R-PACK-016 changed with SRC-18 (all packs recorded, stylesheet partials, gallery home page and easter eggs, TypeScript release builds, new packs); no obligation of this item changed.


**Re-checked at specification 0.12.10.** Re-read against R-PACK-016 (changed at 0.12.4: test cases backfilled and as-built clauses recorded by #54 to #60). No obligation this item rests on changed, and none of its clauses is altered (#81).


**Re-checked at specification 0.12.12.** Re-read after the clarification records of the items it cites (#81), which closed the suspect citations left by the test-case backfills (#54 to #60) and the SRC-19 import map (0.12.0). No obligation it rests on changed, and none of its clauses is altered.

**As built (#37).** The commands are methods of the design session, each planned as edit operations and
applied as one step: wrap inserts `<name> {}` at the first node's place and moves the nodes into it,
unwrap moves the children before the node and removes it, so the moved nodes keep their ids; convert is
a `setName` and one `setArgument` removal per dropped argument, and selects the converted node, which
the new name gives a new id. Extract component removes the nodes, inserts `<name>()` in their place and
writes the struct as text. Unwrap is refused for a `ForEach` and for content with a `let`, whose children
would lose their names; extract refuses a name the mockup already calls, so the new struct can never
contain itself. The role checks look past an `if` and a `ForEach` to the element whose rule holds the
children, as a drop does. `session.commands` reports wrap as enabled when wrapping in a `VStack`, the
designer's Cmd/Ctrl+G, would be accepted.
