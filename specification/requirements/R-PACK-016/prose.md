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

Every rule also carries a `title`, the role's name in a refusal (`horizontal stack`, `list item`). The
item roles of a collection (`listitem`, `treeitem`, `menuitem`, `tab`, …) are in the collection category,
and layouts name the collections they hold one by one, so that a tree item is offered only inside a tree.
The bars may stand in a vertical or horizontal stack or a group as well as in a frame or at the root,
since the root stack cannot be told apart from any other stack by role alone. The root also accepts the
overlays, so that a dialog or sheet can be drawn on its own. The sapui5 `ObjectPageLayout` narrows its
role (`vstack`) to `section`.

```js
canContain("base", "HStack", "NavigationSplitView") // {ok: false, reason: "A frame cannot be placed inside a horizontal stack"}
canContain("base", "Toolbar", "Text")              // {ok: false, reason: "A text cannot be placed inside a toolbar"}
canContain("sapui5", "ObjectPageLayout", "Text")    // … "inside ObjectPageLayout, which its pack limits to section"
```

Rendering never reads the table. Both packages carry it, but only the TypeScript design tools enforce it
for now; a Python warning for a misplaced role can follow once the rules have been exercised by the
gallery. The same file types the labels each role reads (`params`, R-PACK-017), and their labels are the
ones both evaluators use to warn about labelled arguments nothing understands (R-EVAL-004.C8).

Re-checked at 0.10.3 together with the items it cites or is cited by (specification audit, #51): the citations are still accurate and no obligation changed.

**Re-checked at specification 0.10.7.** Its prerequisites were re-checked after the renderer split (#48, #49) and the gallery spec split (#50) without any change to an obligation; neither is this item changed.

**Re-checked at 0.11.0.** Its cited items A-REPO-1, R-REPO-002 changed with SRC-18 (all packs recorded, stylesheet partials, gallery home page and easter eggs, TypeScript release builds, new packs); no obligation of this item changed.

Re-checked after R-REPO-002 was recorded as built (#54, partials resolved into the package copies, TC-4 tests named): no obligation of this requirement changed.


**Re-checked at specification 0.12.12.** Re-read after the clarification records of the items it cites (#81), which closed the suspect citations left by the test-case backfills (#54 to #60) and the SRC-19 import map (0.12.0). No obligation it rests on changed, and none of its clauses is altered.
