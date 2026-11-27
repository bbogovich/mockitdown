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
