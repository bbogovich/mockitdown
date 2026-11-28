---
id: R-TOOL-004.CR-6
target: R-TOOL-004
kind: revision
version: 0.13.8
date: 2026-11-28
issue: 29
summary: "as built (#29): pack from the edit-mode evaluation, category order (C1); reference/<pack>.json at loadAssetsFromUrl's default base, registered elements without previews when a pack has none (C2); previews within 200 px of the visible part (C3); search over components, not Hidden here (C4); Components first, filtered, no preview (C5); first selected node (C6); <Name>() through session.insert (C8); keyboard (C9), session join and events (C10), add/state/rendered (C11); TC files name the tests"
from: d079a502b9db
to: 8f9075965b8d
---

## Clauses

@ C1 edit
~ The package MUST define the custom element `mockitdown-gallery`, which lists the elements of the active mockup's pack{+ (the pack its edit-mode evaluation selects)+} — the pack's own elements first, then the inherited core vocabulary — grouped by the category of their role [-(R-PACK-016.C1).-]{+(R-PACK-016.C1) in the order frames, bars, layouts, collections, content, overlays and annotations.+}
@ C2 edit
~ The gallery MUST read the elements, their [-roles-]{+roles, doc lines+} and samples from the reference data published in the package (R-WEB-001.C17), {+`reference/<pack>.json` +}fetched relative to the base that `loadAssetsFromUrl` [-uses.-]{+uses by default, once per URL, and MUST list a pack without reference data by its registered elements, without previews.+}
@ C3 edit
~ Each element MUST be shown as a card with its name and a live preview, a `mockitdown-mockup` of its sample with `device="fit"` in the mockup's pack, created only when the card comes [-near-]{+within 200 CSS pixels of+} the [-viewport.-]{+gallery's visible part and kept while the pack is shown.+}
@ C4 edit
~ A search field, mirrored by the `filter` property, MUST narrow the cards to the elements whose name, role or doc line contains the search text, ignoring [-case.-]{+case, and the components to those whose name contains it; the search MUST NOT narrow Hidden here.+}
@ C5 edit
~ A Components [-group-]{+group, first,+} MUST list the structs the active mockup declares or [-imports.-]{+imports that the selection may hold, as cards with their name and no preview.+}
@ C6 edit
~ With no selection the gallery MUST show the elements allowed at the root of a mockup, and with [-one-]{+a+} [-selected node-]{+selection+} only those [-its-]{+the first selected node's+} element may contain (`allowedChildren`, R-PACK-016.C7).
@ C8 edit
~ An Add button on each card, a double-click on the card or Enter on the focused card MUST insert [-the-]{+`<Name>()`+} [-element-]{+through `session.insert` (R-EDIT-006.C20):+} as the last child of the{+ first+} selected node, else at the end of the mockup's [-root,-]{+top level,+} select the new node and dispatch `mockitdown-insert` (R-EDIT-006.C5).
@ C9 insert after V1
+ The cards MUST be one tab stop, Up, Down, Home and End moving the focus among them.
@ C10 insert after C9
+ The gallery MUST join a session as R-EDIT-006.C11 says and dispatch, as DOM events, only the notifications of a session of its own (R-EDIT-006.C8).
@ C11 insert after C10
+ The gallery MUST expose `add(name)`, which inserts as Add does, `state` (the mockup, pack, parent element, the cards before the search and the hidden elements by reason) and `rendered`, a promise that resolves after the next rebuild and never rejects.

## Files

```diff
--- a/TC-1.md
+++ b/TC-1.md
@@ -3,3 +3,3 @@
 title: Filtered gallery and Add
-verifies: [C1, C3, C6, C7, C8]
+verifies: [C1, C3, C6, C7, C8, C9, C10, C11]
 ---
@@ -10 +10,11 @@
 With nothing selected, root-only frames are offered. Previews exist only for cards near the viewport.
+
+As built (#29): `typescript/tests/browser/gallery-component.spec.mjs` opens the hand-written
+`tests/browser/fixtures/gallery-sample.mkdesign` in the designer of `pages/designer.html`. With nothing
+selected the frame and layout groups are shown with `NavigationSplitView` and `TabView`; with HStack
+`#actions` selected both are under "A frame cannot be placed inside a horizontal stack" (R-PACK-016's own
+example), the footer's `data-count` and "(n)" equal its listed elements, the first card has a
+`mockitdown-mockup` (`device="fit"`, `pack="base"`) and the last none until it is scrolled to; Add on
+`Toggle` gives the hand-written code with `Toggle()` as the stack's last child, selected, and one
+`mockitdown-insert` from the designer. A second test adds `Text` by double-click and `Divider` by Enter
+with nothing selected, each on a new line at the end of the top level.
--- a/TC-2.md
+++ b/TC-2.md
@@ -9 +9,8 @@
 Components group; switching the active mockup to another pack lists that pack's own elements first.
+
+As built (#29): the same spec's TC-2 test records the page's requests: `/dist/shared/reference/base.json`
+and no path under `/shared/`; `Badge`, declared in the mockup, is in the Components group; `filter =
+"toggle"` sets the search field and leaves only cards whose name, role or doc line contains it; typing
+`BADGE` into the field sets `filter` and shows the component; `setActive("Cards")` fetches
+`vuetify.json` and, in every group, lists the elements `shared/reference/vuetify.json` marks `own`
+before the inherited ones.
--- a/prose.md
+++ b/prose.md
@@ -16 +16,6 @@
 **Re-checked at specification 0.12.12.** Re-read after the clarification records of the items it cites (#81), which closed the suspect citations left by the test-case backfills (#54 to #60) and the SRC-19 import map (0.12.0). No obligation it rests on changed, and none of its clauses is altered.
+
+**As built (#29).** The inserted code is the bare call `<Name>()`; R-TOOL-006 gives it the sample's
+arguments. Inserting at the root uses the top-level `insert` of R-EDIT-002 (`parent: null`) through the
+session's `insert` command, so the gallery itself holds no editing rule (A-WEB-5.K2). Components are
+listed by the structs the edit-mode evaluation knows (`evaluate(…).structs`), declared or imported.
```
