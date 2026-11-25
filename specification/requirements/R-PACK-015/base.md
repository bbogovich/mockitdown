---
id: R-PACK-015
title: SwiftUI presentations and navigation
status: active
version: 0.7.0
rev: 0
page: PACK.1
slot: reqs
order: 999
source: [SRC-9]
realizes: [F-3]
constrained_by: [A-PACK-2]
requires: [R-DEV-008, R-PACK-013]
hash: d3057a078ffa
---

C1: An `Alert` in the `swiftui` pack MUST render as the iOS 26 alert: a centred Liquid Glass card about 300 points wide with large corner radius (`--mkd-radius-alert`, 34 points), bold centred title, centred message, and its actions as capsule buttons — side by side for two, stacked for more — a `.cancel` role in the neutral style and a `.destructive` role in red.
C2: A `ConfirmationDialog` MUST render on a phone as an action sheet at the bottom — a Liquid Glass panel with the title in secondary small type, one row per action, the `.cancel` action set apart below — and with `macos` or `ipados` chrome as an alert-style dialog.
C3: A `Popover` MUST render as a rounded Liquid Glass bubble with an arrow pointing at its anchor; alone, the arrow points up at a placeholder anchor above it.
C4: A `Sheet` MUST render from the bottom with rounded top corners, a grabber, its content and the dimmed screen above it (R-DEV-008.C4).
C5: A `Tab` alone MUST render as one item of a tab bar (icon over label, selected tint) inside the tab bar capsule; inside a `TabView` it is one of its tabs.
C6: A `TabView` MUST render its selected tab's content above a floating Liquid Glass capsule tab bar with icon-over-label items and a highlight pill on the selected item, and the content MUST NOT extend under the bar at `fit`; `.page` MUST render the content with page indicator dots below it and no tab bar; `.sidebarAdaptable` MUST render as `.automatic` on a phone and as a sidebar list of the tabs on tablet and desktop; `.tabBarOnly` as `.automatic`.
C7: A `NavigationSplitView` MUST take its columns from `sidebar:`/`content:`/`detail:` closures (or, unlabelled, the first child as sidebar and the last as detail, a middle child as content) and render two or three columns: the sidebar (a `.sidebar` list with its own navigation title, 320 points on a tablet, 220 on a desktop), the optional content column, and the detail with its title, separated by hairlines; `.balanced` MUST share the width between the columns and `.prominentDetail` MUST keep the detail at full width with the sidebar over it; with `macos` chrome it MUST follow R-DEV-010.C3.
C8: At `fit` with no device, `NavigationSplitView` MUST render at least 640 × 360 points so that its columns are visible.
V1: `NavigationSplitView { List { Label("Inbox", systemImage: "tray") } .navigationTitle("Mail") } detail: { Text("Select a message") }` renders a sidebar column with the title Mail and an Inbox row beside a detail column.
<!-- file: TC-1.md -->
---
id: TC-1
title: SwiftUI presentations
verifies: [C1, C2, C3, C4, C5]
---

Python and TypeScript render tests per element asserting the parts (alert title, message, capsule actions; action-sheet rows and separate cancel; popover arrow; sheet grabber; tab item); browser box checks at `fit`.
<!-- file: TC-2.md -->
---
id: TC-2
title: SwiftUI navigation containers
verifies: [C6, C7, C8]
---

Render tests: TabView variants (content box above the bar box; page dots for `.page`); V1 split view columns and widths; `.prominentDetail` detail spans the frame.
<!-- file: TC-M1.md -->
---
id: TC-M1
title: Visual comparison with SwiftUI
verifies: [C1, C2, C6, C7]
---

TC-M: compare the gallery cards with Apple's iOS 26 and macOS 26 HIG screenshots.
<!-- file: prose.md -->
Presentations and navigation containers are where SwiftUI's look is most distinctive (SRC-9). The
clauses fix the visible structure of each; at `fit` they are drawn whole (R-DEV-008).
