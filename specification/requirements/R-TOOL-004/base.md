---
id: R-TOOL-004
title: "The gallery: mockitdown-gallery"
status: active
version: 0.10.0
rev: 0
page: WEB.4
slot: reqs
order: 4
hash: d4a3087481d6
source: [SRC-12, SRC-14]
realizes: [F-19]
requires: [R-PACK-016, R-EDIT-006, R-WEB-002]
constrained_by: [A-WEB-5]
---

C1: The package MUST define the custom element `mockitdown-gallery`, which lists the elements of the active mockup's pack — the pack's own elements first, then the inherited core vocabulary — grouped by the category of their role (R-PACK-016.C1).
C2: The gallery MUST read the elements, their roles and samples from the reference data published in the package (R-WEB-001.C17), fetched relative to the base that `loadAssetsFromUrl` uses.
C3: Each element MUST be shown as a card with its name and a live preview, a `mockitdown-mockup` of its sample with `device="fit"` in the mockup's pack, created only when the card comes near the viewport.
C4: A search field, mirrored by the `filter` property, MUST narrow the cards to the elements whose name, role or doc line contains the search text, ignoring case.
C5: A Components group MUST list the structs the active mockup declares or imports.
C6: With no selection the gallery MUST show the elements allowed at the root of a mockup, and with one selected node only those its element may contain (`allowedChildren`, R-PACK-016.C7).
C7: A footer group, Hidden here, MUST give the number of elements the selection filters out and list them under their reasons.
C8: An Add button on each card, a double-click on the card or Enter on the focused card MUST insert the element as the last child of the selected node, else at the end of the mockup's root, select the new node and dispatch `mockitdown-insert` (R-EDIT-006.C5).
V1: With an `HStack` selected, the gallery shows no `NavigationSplitView` and no `TabView`, lists them under Hidden here, and Add on `Toggle` appends a `Toggle(…)` as the stack's last child (F-19.AC2).
<!-- file: TC-1.md -->
---
id: TC-1
title: Filtered gallery and Add
verifies: [C1, C3, C6, C7, C8]
---

Browser test (`gallery-component.spec.mjs`) on `pages/designer.html`: with an `HStack` selected, no card
is `NavigationSplitView` or `TabView`, both appear under Hidden here with their reason, and Add on
`Toggle` appends `Toggle(…)` as the stack's last child, selected, with one `mockitdown-insert` (F-19.AC2).
With nothing selected, root-only frames are offered. Previews exist only for cards near the viewport.
<!-- file: TC-2.md -->
---
id: TC-2
title: Data, search and components
verifies: [C2, C4, C5]
---

Browser test: the gallery fetches `dist/shared/reference/<pack>.json` and no file under `shared/`;
`filter = "toggle"` leaves the toggle-like cards; a struct declared in the mockup appears in the
Components group; switching the active mockup to another pack lists that pack's own elements first.
<!-- file: prose.md -->
The gallery of SRC-13#p1.c3 and SRC-14: the elements allowed at the selection, drawn as small live
previews in the pack's style — the same samples as the Reference pages and the pack gallery test page
(R-PACK-013), created as they scroll into view as the pack gallery does (R-WEB-004.C10). The "Hidden
here" footer says what the role rules filtered out and why, so the rule is never a mystery.
