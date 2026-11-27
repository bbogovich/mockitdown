---
id: R-PACK-015
title: SwiftUI presentations and navigation
status: active
version: 0.10.7
rev: 7
page: PACK.1
slot: reqs
order: 999
source: [SRC-9]
realizes: [F-3]
constrained_by: [A-PACK-2]
requires: [R-DEV-008, R-PACK-013]
reverse_engineered: true
hash: a363b17373df
refs: [R-DEV-008, R-DEV-010, R-PACK-013]
---

C1: An `Alert` in the `swiftui` pack MUST render as the iOS 26 alert: a centred Liquid Glass card about 300 points wide with large corner radius (`--mkd-radius-alert`, 34 points), bold centred title, centred message, and its actions as capsule buttons — side by side for two, stacked for more — a `.cancel` role in the neutral style and a `.destructive` role in red.
C2: A `ConfirmationDialog` MUST render on a phone as an action sheet at the bottom — a Liquid Glass panel with the title in secondary small type, one row per action, the `.cancel` action set apart below — and with `macos` or `ipados` chrome as an alert-style dialog.
C3: A `Popover` MUST render as a rounded Liquid Glass bubble with an arrow pointing at its anchor; alone, the arrow points up at a placeholder anchor above it.
C4: A `Sheet` MUST render from the bottom with rounded top corners, a grabber, its content and the dimmed screen above it (R-DEV-008.C4, C9).
C5: A `Tab` alone MUST render as one item of a tab bar (icon over label, selected tint) inside the tab bar capsule; inside a `TabView` it is one of its tabs.
C6: A `TabView` MUST render its selected tab's content above a floating Liquid Glass capsule tab bar with icon-over-label items and a highlight pill on the selected item, and the content MUST NOT extend under the bar at `fit`; `.page` MUST render the content with page indicator dots below it and no tab bar; `.sidebarAdaptable` MUST render as `.automatic` on a phone and as a sidebar list of the tabs on tablet and desktop; `.tabBarOnly` as `.automatic`.
C7: A `NavigationSplitView` MUST take its columns from `sidebar:`/`content:`/`detail:` closures (or, unlabelled, the first child as sidebar and the last as detail, a middle child as content) and render two or three columns: the sidebar (a `.sidebar` list with its own navigation title, 320 points on a tablet and at `fit`, 220 on a desktop), the optional content column, and the detail with its title, separated by hairlines at `fit` and with `ios` chrome; a column's title is the `.navigationTitle` of its content unless the column is a `NavigationStack`, which draws its own bar; `.balanced` MUST share the width between the columns side by side (as `.automatic`) and `.prominentDetail` MUST keep the detail at full width with the sidebar floating over it; with `macos` or `ipados` chrome it MUST follow R-DEV-010.C3 and C6, and on a `phone` form R-DEV-010.C5 (the split view collapsed to its sidebar).
C8: At `fit` with no device, `NavigationSplitView` MUST render at least 640 × 360 points so that its columns are visible.
C9: In every pack, a dialog whose variant is `alert` or `action-sheet` and that has no `actions:` MUST render its `Button` children as its actions, in order and with their roles, and its other children in its body.
C10: In every pack, a dialog of variant `popover` written on its own MUST render a placeholder anchor button above its surface; a pack other than `swiftui` MAY omit the arrow.
C11: In every pack, a `Tab` written outside a `TabView` MUST render as a tab bar with that one tab selected, placed as the pack's `TabView` places its bar.
V1: Each element above renders from its declared sample (R-PACK-013.C4); `NavigationSplitView { List { Label("Inbox", systemImage: "tray") } .navigationTitle("Mail") } detail: { Text("Select a message") }` renders a sidebar column with the title Mail and an Inbox row beside a detail column.
