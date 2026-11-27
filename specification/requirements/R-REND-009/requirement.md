---
id: R-REND-009
title: Presentations and navigation composition
status: active
version: 0.10.7
rev: 1
page: REND.1
slot: reqs
order: 9
source: [SRC-2]
realizes: [F-2, F-8]
constrained_by: [A-REND-1]
reverse_engineered: true
hash: 9a8909d5165d
---

C1: When a view carries `.alert`, `.confirmationDialog`, `.sheet`, `.fullScreenCover`, `.popover` or `.inspector` and its `isPresented:` (or `item:`) argument is absent or truthy, the renderer MUST draw the presentation as a `div.mkd-layer[data-kind]` appended to the screen after the views.
C2: An alert MUST render as a `div.mkd-dialog[role=alertdialog]` with the title, the `message:` slot as body and the closure's views as actions, defaulting to one primary `OK` button; a confirmation dialog MUST render the same way with kind `action-sheet`.
C3: A sheet MUST render a scrim, a grabber and the content; a full-screen cover, popover or inspector MUST render the content in `div.mkd-presented` of its kind.
C4: A `NavigationStack` MUST build its navigation bar from its content: the title from the first `.navigationTitle`, the subtitle from `.navigationSubtitle`, the title display mode from `.navigationBarTitleDisplayMode` (default large; inline when there is no title), toolbar items from `.toolbar` grouped by placement, and a search field from `.searchable`.
C5: A `TabView` MUST build its tab bar from its children's `.tabItem { … }` labels or from `Tab(…)` children, and show the selected tab's content.
V1: `NavigationStack { List { … }.navigationTitle("Settings").toolbar { ToolbarItem(placement: .topBarTrailing) { Button("Edit") } } }` renders a bar with a large title and a trailing Edit button; `.alert("Sign out?", isPresented: true) { … } message: { … }` adds an alert layer.
