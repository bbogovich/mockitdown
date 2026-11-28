---
id: R-TOOL-004
title: "The gallery: mockitdown-gallery"
status: active
version: 0.13.10
rev: 7
page: WEB.4
slot: reqs
order: 4
hash: e532bb21162a
source: [SRC-12, SRC-14]
realizes: [F-19]
requires: [R-PACK-016, R-EDIT-006, R-WEB-002]
constrained_by: [A-WEB-5]
refs: [F-19, R-EDIT-006, R-PACK-016, R-TOOL-006, R-WEB-001]
---

C1: The package MUST define the custom element `mockitdown-gallery`, which lists the elements of the active mockup's pack (the pack its edit-mode evaluation selects) — the pack's own elements first, then the inherited core vocabulary — grouped by the category of their role (R-PACK-016.C1) in the order frames, bars, layouts, collections, content, overlays and annotations.
C2: The gallery MUST read the elements, their roles, doc lines and samples from the reference data published in the package (R-WEB-001.C17), `reference/<pack>.json` fetched relative to the base that `loadAssetsFromUrl` uses by default, once per URL, and MUST list a pack without reference data by its registered elements, without previews.
C3: Each element MUST be shown as a card with its name and a live preview, a `mockitdown-mockup` of its sample with `device="fit"` in the mockup's pack, created only when the card comes within 200 CSS pixels of the gallery's visible part and kept while the pack is shown.
C4: A search field, mirrored by the `filter` property, MUST narrow the cards to the elements whose name, role or doc line contains the search text, ignoring case, and the components to those whose name contains it; the search MUST NOT narrow Hidden here.
C5: A Components group, first, MUST list the structs the active mockup declares or imports that the selection may hold, as cards with their name and no preview.
C6: With no selection the gallery MUST show the elements allowed at the root of a mockup, and with a selection only those the first selected node's element may contain (`allowedChildren`, R-PACK-016.C7).
C7: A footer group, Hidden here, MUST give the number of elements the selection filters out and list them under their reasons.
C8: An Add button on each card, a double-click on the card or Enter on the focused card MUST insert the element as R-TOOL-006.C1 writes it (its sample's call, else `<Name>()`) through `session.insert` (R-EDIT-006.C20): as the last child of the first selected node, else at the end of the mockup's top level, select the new node and dispatch `mockitdown-insert` (R-EDIT-006.C5).
V1: With an `HStack` selected, the gallery shows no `NavigationSplitView` and no `TabView`, lists them under Hidden here, and Add on `Toggle` appends a `Toggle(…)` as the stack's last child (F-19.AC2).
C9: The cards MUST be one tab stop, Up, Down, Home and End moving the focus among them.
C10: The gallery MUST join a session as R-EDIT-006.C11 says and dispatch, as DOM events, only the notifications of a session of its own (R-EDIT-006.C8).
C11: The gallery MUST expose `add(name)`, which inserts as Add does, `state` (the mockup, pack, parent element, the cards before the search and the hidden elements by reason) and `rendered`, a promise that resolves after the next rebuild and never rejects.
