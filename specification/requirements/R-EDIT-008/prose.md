The everyday commands of a structured editor (SRC-12#s8). The clipboard holds plain mockitdown text, so
an element copied in the designer pastes into a Markdown fence, a code review or another document.

Multi-select is limited to siblings: every command here acts on a contiguous or scattered run of children
of one parent, which keeps their results predictable.

Re-checked at 0.10.3 together with the items it cites or is cited by (specification audit, #51): the citations are still accurate and no obligation changed.

**Re-checked at specification 0.10.7.** Its prerequisites were re-checked after the renderer split (#48, #49) and the gallery spec split (#50) without any change to an obligation; neither is this item changed.

**Re-checked at 0.11.0.** Its cited items R-EDIT-007 changed with SRC-18 (all packs recorded, stylesheet partials, gallery home page and easter eggs, TypeScript release builds, new packs); no obligation of this item changed.


**Re-checked at specification 0.12.12.** Re-read after the clarification records of the items it cites (#81), which closed the suspect citations left by the test-case backfills (#54 to #60) and the SRC-19 import map (0.12.0). No obligation it rests on changed, and none of its clauses is altered.

**As built (#36).** The commands are methods of the design session (`mockitdown/design`); the outline,
the editor and the designer only call them. A command with several operations (a duplicate or paste of
several views, a move of several nodes) applies them one after the other to the tree and forms one step
and one `change`, whose single text edit turns the code before into the code after. The identifiers of
a copy are renamed only where the mockup already uses them, so a duplicate always renames (`ok` →
`ok-copy`, then `ok-copy-2`) and a paste after a cut keeps them; duplicating `ok-copy` gives
`ok-copy-copy`. The name only marks the copy: the designer renames it (SRC-21#answers). Copied code keeps the comment lines above a node, as a
move carries them. A paste goes into the one selected node only when it is a container the drop rules
of R-TOOL-005 would drop into (never a `ForEach`) and its role accepts every pasted element. With
several nodes selected, a move shifts each of them one position, so a scattered selection stays
scattered. The designer writes the clipboard with `navigator.clipboard.writeText` and reads it with
`readText`, falling back to its own last copy when reading is refused.
