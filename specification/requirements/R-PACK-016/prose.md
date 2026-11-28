Which elements may go where (SRC-12#s6.3), decided by role so that a pack element inherits it: `VBtn`
behaves as a button and `ShellBar` as a bar. The gallery filters by it, drag and drop refuses by it and
the restructuring commands check it; each refusal comes with a sentence saying why.

| Category | Examples | May hold or be placed in |
|---|---|---|
| frame | NavigationStack, NavigationSplitView, TabView | only at the root, a split-view column or a tab's content |
| bar | AppBar, Toolbar, Sidebar | inside a frame or the root stack |
| layout | VStack, HStack, ZStack, Form, Section, Card | layouts and content; a Grid only GridRow |
| collection | List, Table, Tree, Menu, Board | only their item roles |
| content | Text, Image, Button, Toggle, Chart | no children (a Button or Link may hold its label) |
| overlay | Dialog, Sheet, Alert, Toast | attached through a presentation modifier |
| annotation | Callout, Pointer, highlight | attached as a modifier |

Rendering never reads the table. Both packages carry it, but only the TypeScript design tools enforce it
for now; a Python warning for a misplaced role can follow once the rules have been exercised by the
gallery.

Re-checked at 0.10.3 together with the items it cites or is cited by (specification audit, #51): the citations are still accurate and no obligation changed.

**Re-checked at specification 0.10.7.** Its prerequisites were re-checked after the renderer split (#48, #49) and the gallery spec split (#50) without any change to an obligation; neither is this item changed.

**Re-checked at 0.11.0.** Its cited items A-REPO-1, R-REPO-002 changed with SRC-18 (all packs recorded, stylesheet partials, gallery home page and easter eggs, TypeScript release builds, new packs); no obligation of this item changed.

Re-checked after R-REPO-002 was recorded as built (#54, partials resolved into the package copies, TC-4 tests named): no obligation of this requirement changed.


**Re-checked at specification 0.12.12.** Re-read after the clarification records of the items it cites (#81), which closed the suspect citations left by the test-case backfills (#54 to #60) and the SRC-19 import map (0.12.0). No obligation it rests on changed, and none of its clauses is altered.
