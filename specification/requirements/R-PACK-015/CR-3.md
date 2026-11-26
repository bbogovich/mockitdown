---
id: R-PACK-015.CR-3
target: R-PACK-015
kind: revision
version: 0.8.7
date: 2026-11-25
issue: 12
summary: "as built (#12): Button children of alert and action-sheet dialogs are their actions in every pack (C9), a lone popover has a placeholder anchor (C10), a lone Tab is a one-item tab bar (C11); C7 column titles from .navigationTitle, 320 points at fit, .balanced side by side, .prominentDetail floating sidebar"
from: ae7a404471c2
to: 07e2998d1d35
---

## Clauses

@ meta.reverse_engineered
- ~
+ true
@ C7 edit
~ A `NavigationSplitView` MUST take its columns from `sidebar:`/`content:`/`detail:` closures (or, unlabelled, the first child as sidebar and the last as detail, a middle child as content) and render two or three columns: the sidebar (a `.sidebar` list with its own navigation title, 320 points on a [-tablet,-]{+tablet and at `fit`,+} 220 on a desktop), the optional content column, and the detail with its title, separated by hairlines; {+a column's title is the `.navigationTitle` of its content unless the column is a `NavigationStack`, which draws its own bar; +}`.balanced` MUST share the width between the columns{+ side by side (as `.automatic`)+} and `.prominentDetail` MUST keep the detail at full width with the sidebar {+floating +}over it; with `macos` chrome it MUST follow R-DEV-010.C3.
@ C9 insert after C8
+ In every pack, a dialog whose variant is `alert` or `action-sheet` and that has no `actions:` MUST render its `Button` children as its actions, in order and with their roles, and its other children in its body.
@ C10 insert after C9
+ In every pack, a dialog of variant `popover` written on its own MUST render a placeholder anchor button above its surface; a pack other than `swiftui` MAY omit the arrow.
@ C11 insert after C10
+ In every pack, a `Tab` written outside a `TabView` MUST render as a tab bar with that one tab selected, placed as the pack's `TabView` places its bar.

## Files

```diff
--- a/TC-1.md
+++ b/TC-1.md
@@ -3,5 +3,5 @@
 title: SwiftUI presentations
-verifies: [C1, C2, C3, C4, C5]
+verifies: [C1, C2, C3, C4, C5, C9, C10, C11]
 ---
 
-Python and TypeScript render tests per element asserting the parts (alert title, message, capsule actions; action-sheet rows and separate cancel; popover arrow; sheet grabber; tab item); browser box checks at `fit`.
+Python and TypeScript render tests per element asserting the parts (alert title, message, capsule actions; action-sheet rows and separate cancel; popover arrow; sheet grabber; tab item); browser box checks at `fit`. Button children become actions (C9); a popover alone has its anchor (C10); a lone `Tab` is a one-item bar (C11). Built as IT-20.
--- a/TC-2.md
+++ b/TC-2.md
@@ -6,2 +6,2 @@
 
-Render tests: TabView variants (content box above the bar box; page dots for `.page`); V1 split view columns and widths; `.prominentDetail` detail spans the frame.
+Render tests: TabView variants (content box above the bar box; page dots for `.page`); V1 split view columns and widths; `.prominentDetail` detail spans the frame. Built as IT-20.
--- a/prose.md
+++ b/prose.md
@@ -2 +2,13 @@
 clauses fix the visible structure of each; at `fit` they are drawn whole (R-DEV-008).
+
+SwiftUI writes an alert's and a confirmation dialog's buttons in the closure
+(`.alert("Delete?", isPresented: $p) { Button("Delete", role: .destructive) }`), so the `Alert` and
+`ConfirmationDialog` elements take their `Button` children as actions (C9); `actions:` still works and
+wins when given. Because the dialog role is shared, this holds in every pack whose alert is a dialog, as
+do the popover's placeholder anchor (C10) and the one-item tab bar of a lone `Tab` (C11).
+
+As built (#12): the column titles of a split view come from each column's `.navigationTitle`, drawn as a
+large title on the sidebar and content columns and inline on the detail; on a desktop the sidebar title
+is small and secondary until the macOS floating sidebar of R-DEV-010.C3 replaces it. `.balanced` keeps
+the columns side by side as `.automatic` does; `.prominentDetail` floats the sidebar as a glass panel
+over the full-width detail. On iPadOS and macOS chrome, a confirmation dialog takes the alert's card.
```
