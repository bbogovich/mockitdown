---
title: Pack catalogue
spec_version: 0.2.0
status: draft
updated: 2026-11-24
page_id: PACK.2
---

# Pack catalogue

The packs mockitdown ships (R-PACK-008, ADR-13) and, for each, its element catalogue. The core
vocabulary (R-PACK-009) is available in every pack; framework packs add their native components
and restyle everything.

<!-- packs-table -->
| Pack id | Imitates | Version followed | Default device · chrome | Selected by | Own elements |
|---|---|---|---|---|---|
| `angular-material` | Angular Material · Material 3 (azure theme) | Angular Material 20 | desktop · browser | `pack="angular-material"`, `import AngularMaterial`, `import Angular` | 93 |
| `base` | Neutral wireframe (the portable core every pack extends) | 1 | desktop · none | `pack="base"`, `import Wireframe`, `import Mockitdown` | 90 |
| `bootstrap` | Bootstrap 5.3 (as used directly or through React-Bootstrap / ng-bootstrap), default theme | 5.3 | desktop · browser | `pack="bootstrap"`, `import Bootstrap`, `import ReactBootstrap` | 85 |
| `fluent` | Fluent 2 · WinUI 3 (Windows 11 desktop apps) | Windows App SDK 1.8 | desktop · windows | `pack="fluent"`, `import WinUI`, `import FluentUI`, `import Fluent`, `import WindowsAppSDK`, `import Microsoft.UI.Xaml` | 108 |
| `mui` | Material UI (MUI Core + MUI X) · React, default theme | v9 | desktop · browser | `pack="mui"`, `import MaterialUI`, `import MUI` | 116 |
| `sapui5` | SAPUI5 / OpenUI5 · SAP Fiori Horizon theme (sap_horizon, sap_horizon_dark) | 1.136 | desktop · browser | `pack="sapui5"`, `import SAPUI5`, `import OpenUI5`, `import UI5`, `import Fiori`, `import sap.m`, `import sap.f`, `import sap.uxap`, `import sap.tnt` | 128 |
| `shadcn` | shadcn/ui · new-york style, neutral base (Radix primitives, Tailwind CSS v4) | shadcn 3 · Tailwind CSS 4 | desktop · browser | `pack="shadcn"`, `import Shadcn`, `import ShadcnUI`, `import Radix` | 154 |
| `swiftui` | SwiftUI · iOS 26, iPadOS 26, macOS 26 (Liquid Glass) | iOS 26 SDK | phone · ios | `pack="swiftui"`, `import SwiftUI` | 86 |
| *proposed* | Ant Design | 5.x | — | — | — |
<!-- end packs-table -->

!!! note "Generated catalogue"
    The table and the element catalogues are generated from each pack's `pack.json` by
    `tools/gen_catalogue.py` on `main`; the authoritative list at any time is `mockitdown packs`. The element
    catalogue of each pack below is **generated** from the pack data with
    `mockitdown elements <pack> --markdown --own` (R-CLI-006) and must not be edited by hand; each
    lists only the pack's own elements — the core vocabulary of `base` is available in every pack.

## base — Wireframe

The core vocabulary every pack inherits. Its elements are listed in R-PACK-009 and their roles in
the [Role catalogue](../rendering/roles.md).

<!-- catalogue: base — generate with `mockitdown elements base --markdown` -->

| Element | Role | Arguments | Defaults | Notes |
|---|---|---|---|---|
| `Accordion` | accordion | title |  |  |
| `Alert` | dialog | title | variant: "alert" |  |
| `AppBar` | appbar | title |  |  |
| `AsyncImage` | image | url |  |  |
| `Avatar` | avatar | name |  |  |
| `Badge` | badge | text |  |  |
| `Banner` | alert | title |  |  |
| `Breadcrumb` | breadcrumb | items |  |  |
| `Button` | button | label |  | Button("Save", systemImage:) · .buttonStyle(…) |
| `Calendar` | calendar |  |  |  |
| `Capsule` | shape |  | shape: "capsule" |  |
| `Card` | card | title |  |  |
| `Chart` | chart |  |  | kind: .bar/.line/.area/.pie/.donut, values: [..], labels: [..] |
| `Checkbox` | checkbox | label |  |  |
| `Chip` | chip | label |  |  |
| `Circle` | shape |  | shape: "circle" |  |
| `Color` | color | color |  |  |
| `ControlGroup` | toolbar |  | variant: "group" |  |
| `DatePicker` | datepicker | label |  | selection: "2026-11-23"; .datePickerStyle(.graphical) |
| `Dialog` | dialog | title |  |  |
| `DisclosureGroup` | accordion | title |  |  |
| `Divider` | divider |  |  |  |
| `Dropzone` | dropzone | label |  |  |
| `Ellipse` | shape |  | shape: "ellipse" |  |
| `FloatingActionButton` | fab | icon |  |  |
| `Form` | form |  |  |  |
| `Gauge` | progress | value | variant: "gauge" |  |
| `Grid` | grid |  |  | Grid of GridRow children, or columns: n |
| `GridRow` | gridrow |  |  |  |
| `Group` | group |  |  |  |
| `GroupBox` | card | title |  |  |
| `HStack` | hstack |  |  | Horizontal stack. spacing:, alignment: .top/.center/.bottom |
| `Icon` | icon | name |  |  |
| `IconButton` | button | icon | iconOnly: true |  |
| `Image` | image | name |  | Image("path.png") or Image(systemName: "star") |
| `Label` | label | title |  | Label("Inbox", systemImage: "tray") |
| `LabeledContent` | labeled | label, value |  |  |
| `LazyHGrid` | grid |  |  |  |
| `LazyHStack` | hstack |  |  |  |
| `LazyVGrid` | grid |  |  | columns: [GridItem(.flexible()), …] or a count |
| `LazyVStack` | vstack |  |  |  |
| `Link` | link | label, destination |  |  |
| `List` | list |  |  | .listStyle(.insetGrouped/.plain/.sidebar/…) |
| `ListItem` | listitem | title |  |  |
| `Menu` | menu | label |  |  |
| `MenuItem` | menuitem | label |  |  |
| `NavItem` | navitem | label |  |  |
| `NavigationLink` | listitem | title | chevron: true |  |
| `NavigationSplitView` | split |  |  | { sidebar } content: { … } detail: { … } |
| `NavigationStack` | navstack |  |  | Content's .navigationTitle / .toolbar form the bar |
| `NavigationView` | navstack |  |  |  |
| `Pagination` | pagination |  |  |  |
| `Picker` | select | label |  | Picker("Size", selection: "M") { Text("S") … } |
| `Placeholder` | placeholder | label |  | A labelled box for maps, charts, media |
| `ProgressView` | progress | label |  | value: 0…1 (or total:); none = indeterminate |
| `RadioButton` | radio | label |  |  |
| `RadioGroup` | radiogroup | label |  |  |
| `Rating` | rating | value |  |  |
| `Rectangle` | shape |  | shape: "rectangle" |  |
| `RoundedRectangle` | shape |  | shape: "rounded" |  |
| `Row` | listitem | title |  | title, subtitle:, detail:, systemImage:, chevron: |
| `ScrollView` | scroll | axes |  |  |
| `SearchField` | textfield | placeholder | kind: "search" |  |
| `Section` | section | title |  | Section("Header") { … } footer: { … } |
| `SecureField` | textfield | placeholder | kind: "password" |  |
| `SegmentedControl` | segmented | items |  |  |
| `Sheet` | dialog | title | variant: "sheet" |  |
| `Sidebar` | sidebar | title |  |  |
| `Slider` | slider |  |  | Slider(value: 0.4) or Slider(value: 30, in: 0...100) |
| `Spacer` | spacer |  |  |  |
| `Stepper` | stepper | label |  |  |
| `Steps` | steps | steps |  |  |
| `Tab` | tab | label |  | Tab("Home", systemImage: "house") { … } |
| `TabView` | tabs |  | placement: "bottom" | Children with .tabItem { Label } or Tab(…) |
| `Table` | table |  |  | columns: ["Name", …], rows: [[…], …] or TableRow children |
| `TableColumn` | tablecolumn | title |  |  |
| `TableRow` | tablerow |  |  |  |
| `Tabs` | tabs | items | placement: "top" |  |
| `Tag` | chip | label |  |  |
| `Text` | text | content |  | Text with **bold**, *italic*, `code` Markdown |
| `TextEditor` | textfield | text | kind: "multiline" |  |
| `TextField` | textfield | placeholder |  | TextField("Placeholder", text: "value") |
| `Toast` | toast | message |  |  |
| `Toggle` | toggle | label |  | Toggle("Wi-Fi", isOn: true) |
| `Toolbar` | toolbar |  |  |  |
| `ToolbarItem` | toolbaritem |  |  | ToolbarItem(placement: .topBarTrailing) { … } |
| `ToolbarItemGroup` | toolbaritem |  |  |  |
| `Tooltip` | tooltip | text |  |  |
| `VStack` | vstack |  |  | Vertical stack. spacing:, alignment: .leading/.center/.trailing |
| `ZStack` | zstack |  |  | Overlapping layers. alignment: |

<!-- end catalogue: base -->

## swiftui — SwiftUI

<!-- catalogue: swiftui — generate with `mockitdown elements swiftui --markdown` -->

| Element | Role | Arguments | Defaults | Notes |
|---|---|---|---|---|
| `ActionSheet` | dialog | title | variant: "action-sheet" | Deprecated action sheet |
| `Alert` | dialog | title | variant: "alert" | Alert("Delete?", message: "…") { Button("Cancel", role: .cancel) … } — prefer .alert(…) |
| `AnyView` | group |  |  | Type-erased wrapper |
| `AreaMark` | chart |  | kind: "area" | An area chart: AreaMark(values: [..], labels: [..]) |
| `AsyncImage` | image | url |  | AsyncImage(url: "photo.jpg") |
| `BarMark` | chart |  | kind: "bar" | A bar chart: BarMark(values: [..], labels: [..]) |
| `Button` | button | label |  | Button("Save", systemImage:, role: .destructive/.cancel) · .buttonStyle(.bordered/.borderedProminent/.glass/.glassProminent) · .controlSize(.small/.large) |
| `Canvas` | placeholder | label |  | Canvas drawing placeholder |
| `Card` | card | title |  | Not SwiftUI: a rounded content tile like GroupBox |
| `Chart` | chart |  |  | Swift Charts: Chart(kind: .bar/.line/.area/.pie/.donut, values: [..], labels: [..]) or series: [[..], [..]] |
| `ColorPicker` | labeled | label |  | ColorPicker("Tint", selection: .blue) — label with the rainbow colour well |
| `ConcentricRectangle` | shape |  | shape: "rounded" | iOS 26 concentric shape |
| `ConfirmationDialog` | dialog | title | variant: "action-sheet" | Action sheet; prefer .confirmationDialog(…) |
| `ContainerRelativeShape` | shape |  | shape: "rounded" |  |
| `ContentUnavailableView` | dialog | title | inline: true, variant: "unavailable" | ContentUnavailableView("No Mail", systemImage: "tray", description: Text("…")) { actions }  |
| `ControlGroup` | toolbar |  | variant: "group" | ControlGroup { Button … } — joined capsule of buttons |
| `DatePicker` | datepicker | label |  | DatePicker("Starts", selection: "2026-11-23") — compact grey capsule; .datePickerStyle(.graphical) for the calendar |
| `DisclosureGroup` | accordion | title |  | DisclosureGroup("Advanced", isExpanded: true) { … } |
| `EditButton` | button | label | label: "Edit" | Toggles a list's edit mode — plain accent text |
| `EmptyView` | group |  |  | Renders nothing |
| `Form` | form |  | variant: "grouped" | Form { Section { TextField … Toggle … } } — inset-grouped rows |
| `Gauge` | progress | value | variant: "accessoryCircular" | Gauge(value: 0.7, label: { Text("BPM") }, currentValueLabel: { Text("72") }) · .gaugeStyle(…) |
| `GeometryReader` | vstack |  |  | Transparent container (stacked) |
| `GlassEffectContainer` | hstack |  |  | iOS 26: groups glass shapes; renders as an HStack |
| `GroupBox` | card | title |  | GroupBox("Activity") { … } — rounded secondary-background box |
| `HSplitView` | hstack |  |  | macOS horizontal split |
| `HelpLink` | button |  | iconOnly: true, systemImage: "questionmark", variant: "help" | macOS round help (?) button |
| `Image` | image | name |  | Image("asset.png") or Image(systemName: "star.fill") |
| `Inspector` | card | title |  | Inline inspector panel content (prefer the .inspector modifier) |
| `Label` | label | title |  | Label("Inbox", systemImage: "tray"); .labelStyle(.iconOnly/.titleOnly/.titleAndIcon) |
| `LabeledContent` | labeled | label, value |  | LabeledContent("Version", value: "26.1") — label + secondary value |
| `LineMark` | chart |  | kind: "line" | A line chart: LineMark(values: [..], labels: [..]) |
| `Link` | link | label, destination |  | Link("Privacy Policy", destination: url) — accent text |
| `List` | list |  | variant: "insetGrouped" | List { Section("…") { … } } — inset-grouped by default; .listStyle(.plain/.sidebar/.grouped) |
| `Map` | placeholder | label | systemImage: "mappin" | MapKit map placeholder (streets, park, water, pin) |
| `Menu` | menu | label |  | Menu("Sort", systemImage:) { Button … } · open: true shows the glass menu |
| `MultiDatePicker` | calendar | label |  | MultiDatePicker("Dates", selection:) — calendar with several marked days (events:) |
| `NavigationLink` | listitem | title | chevron: true | NavigationLink("General", systemImage: "gear", iconColor: .gray) — row with chevron |
| `NavigationSplitView` | split |  |  | NavigationSplitView { sidebar } content: { … } detail: { … } |
| `NavigationStack` | navstack |  |  | NavigationStack { … .navigationTitle("Title") .toolbar { … } } · back: "Settings" shows the glass back button |
| `NavigationView` | navstack |  |  | Deprecated alias of NavigationStack |
| `OutlineGroup` | accordion | title |  | Hierarchical rows; written here as a DisclosureGroup-like node: OutlineGroup("Folder", isExpanded: true) { … } |
| `PasteButton` | button | label | label: "Paste", systemImage: "doc.on.clipboard", variant: "bordered" | System paste button (bordered capsule) |
| `PhotosPicker` | button | label | label: "Select Photos", systemImage: "photo" | PhotosPicker("Select Photos", selection:) — opens the photo picker |
| `Picker` | select | label | variant: "menu" | Picker("Sort", selection: "Date") { Text("Date") … } · .pickerStyle(.segmented/.inline/.navigationLink) |
| `PointMark` | chart |  | kind: "line" | A point/line chart: PointMark(values: [..]) |
| `Popover` | dialog | title | variant: "popover" | Popover bubble; prefer .popover(isPresented:) |
| `ProgressView` | progress | label |  | ProgressView() spinner, or ProgressView("Uploading", value: 0.4) |
| `RealityView` | placeholder | label | systemImage: "cube" | RealityKit view placeholder |
| `RenameButton` | button | label | label: "Rename", systemImage: "pencil" | Triggers a rename action |
| `Row` | listitem | title |  | Generic row: title, subtitle:, detail:, systemImage:, iconColor:, chevron: |
| `SceneView` | placeholder | label | systemImage: "cube" | SceneKit / RealityKit view placeholder |
| `ScrollView` | scroll | axes |  | ScrollView { … } or ScrollView(.horizontal) { … } |
| `ScrollViewReader` | group |  |  | Transparent container |
| `Section` | section | title |  | Section("Header") { … } footer: { Text("…") } |
| `SectorMark` | chart |  | kind: "donut" | A donut chart: SectorMark(values: [..], labels: [..]) |
| `SecureField` | textfield | placeholder | kind: "password" | SecureField("Password", text: $password) |
| `SettingsLink` | button | label | label: "Settings\u2026" | macOS button that opens the Settings window |
| `ShareLink` | button | label | label: "Share", systemImage: "square.and.arrow.up" | ShareLink(item: url) — share-sheet button |
| `Sheet` | dialog | title | variant: "sheet" | Bottom sheet; prefer .sheet(isPresented:) { … } |
| `SignInWithAppleButton` | button | label | label: "Sign in with Apple", variant: "signInWithApple" | AuthenticationServices button — black capsule (white in dark) |
| `Slider` | slider |  |  | Slider(value: 0.4) { Text("Volume") } minimumValueLabel: { Image(systemName: "speaker") } … |
| `SpriteView` | placeholder | label | systemImage: "sparkles" | SpriteKit scene placeholder |
| `Stepper` | stepper | label |  | Stepper("Guests", value: 2) — −/+ capsule |
| `Tab` | tab | label |  | Tab("Search", systemImage: "magnifyingglass") { … } · .badge(3) |
| `TabSection` | section | title |  | A group of Tabs (sidebar-adaptable TabView) |
| `TabView` | tabs |  | placement: "bottom" | TabView { Tab("Home", systemImage: "house") { … } } — floating Liquid Glass tab bar |
| `Table` | table |  |  | Table(columns: ["Name", "Size"], rows: [[…]]) or TableColumn / TableRow children — macOS/iPadOS table |
| `TableColumn` | tablecolumn | title |  | TableColumn("Name") |
| `TableRow` | tablerow |  |  | TableRow { Text(…) … } |
| `Text` | text | content |  | Text("Hello") with **bold**, *italic*, `code`; .font(.headline) etc. |
| `TextEditor` | textfield | text | kind: "multiline" | TextEditor(text: $notes) — multi-line editor |
| `TextField` | textfield | placeholder |  | TextField("Email", text: $email); plain in a Form, .textFieldStyle(.roundedBorder) elsewhere; axis: .vertical |
| `TimelineView` | group |  |  | Transparent container |
| `TipView` | alert | title | closable: true, systemImage: "lightbulb" | TipKit tip: TipView("Favorites", message: "Tap the star…") |
| `Toggle` | toggle | label |  | Toggle("Wi-Fi", isOn: true) — 51×31 green switch; .toggleStyle(.button/.checkbox) |
| `Toolbar` | toolbar |  |  | Not SwiftUI: an inline bar of controls |
| `ToolbarItem` | toolbaritem |  |  | ToolbarItem(placement: .topBarTrailing/.topBarLeading/.principal/.bottomBar) { … } |
| `ToolbarItemGroup` | toolbaritem |  |  | ToolbarItemGroup(placement: .bottomBar) { … } |
| `ToolbarSpacer` | spacer |  |  | iOS 26: separates toolbar glass groups (.fixed / .flexible) |
| `UnevenRoundedRectangle` | shape |  | shape: "rounded" |  |
| `VSplitView` | vstack |  |  | macOS vertical split |
| `VideoPlayer` | placeholder | label | systemImage: "play" | AVKit video placeholder with play button |
| `ViewThatFits` | group |  |  | Renders all candidates; keep one child |
| `WebView` | placeholder | label | systemImage: "globe" | iOS 26 SwiftUI WebView placeholder |
| `WindowGroup` | group |  |  | Scene wrapper, accepted so App code pastes |

<!-- end catalogue: swiftui -->

## fluent — Fluent 2 · WinUI 3

<!-- catalogue: fluent — generate with `mockitdown elements fluent --markdown` -->

| Element | Role | Arguments | Defaults | Notes |
|---|---|---|---|---|
| `AnimatedVisualPlayer` | placeholder | label | icon: "sparkles" |  |
| `AppBarButton` | button | label | variant: "appBar" | AppBarButton("Share", icon: "Share") inside a CommandBar |
| `AppBarElementContainer` | group |  |  |  |
| `AppBarSeparator` | divider |  |  |  |
| `AppBarToggleButton` | button | label | variant: "appBar" | selected: true = IsChecked |
| `AutoSuggestBox` | textfield | placeholder | kind: "search" | AutoSuggestBox("Search", text:) — query icon on the right |
| `BitmapIcon` | icon | name |  |  |
| `Border` | vstack |  | alignment: "leading" | A container; style it with .padding / .background / .cornerRadius / .border |
| `BreadcrumbBar` | breadcrumb | items |  | BreadcrumbBar(["System", "Display"]) · .variant(.title) for a page title |
| `Button` | button | label | variant: "standard" | Button("Save", icon:) · .buttonStyle(.accent / .subtle) |
| `CalendarDatePicker` | datepicker | header |  | CalendarDatePicker("Start", date:, placeholder: "Pick a date") |
| `CalendarView` | calendar |  |  | CalendarView(selection: "2026-11-23", showToday: true) |
| `Canvas` | zstack |  |  | Overlapping layers |
| `CheckBox` | checkbox | label |  | CheckBox("Remember me", checked: true / .indeterminate) |
| `ColorPicker` | placeholder | label | icon: "palette" |  |
| `ComboBox` | select | header |  | ComboBox("Size", items: ["S", "M"], selection: "M", placeholder:, open: true) |
| `ComboBoxItem` | text | content |  |  |
| `CommandBar` | toolbar |  | placement: "right" | CommandBar { AppBarButton… } · .defaultLabelPosition(.bottom / .right / .collapsed); AppBarButton(icon: "More") for the overflow button |
| `CommandBarFlyout` | menu | label |  |  |
| `ContentDialog` | dialog | title |  | ContentDialog("Save?", buttons: ["Save", "Don't save", "Cancel"], primary: "Save") { content } |
| `DataGrid` | table |  |  | Community Toolkit DataGrid(columns: [...], rows: [[...]]) |
| `DataGridTemplateColumn` | tablecolumn | title |  |  |
| `DataGridTextColumn` | tablecolumn | title |  |  |
| `DatePicker` | datepicker | header | format: "long", variant: "fields" | DatePicker("Birthday", date: "2026-11-23") |
| `DockPanel` | vstack |  | alignment: "stretch" |  |
| `DropDownButton` | button | label | dropdown: true, variant: "standard" | Button with a chevron that opens a flyout |
| `Expander` | accordion | header |  | Expander("Header", isExpanded: true) { content } |
| `FlipView` | placeholder | label | icon: "photo" |  |
| `Flyout` | card | title | variant: "flyout" | A light-dismiss surface; place it with .overlay(alignment:) |
| `FontIcon` | icon | name |  | FontIcon("Mail") — Fluent / Segoe Fluent Icons name |
| `Frame` | group |  |  | Navigation host — renders its content |
| `Grid` | grid |  |  | Grid(columns: 3) { … } — column count, or GridRow children |
| `GridView` | grid |  | columns: 4 | GridView(columns: 4) { GridViewItem… } |
| `GridViewItem` | vstack |  | alignment: "stretch" |  |
| `HeaderedContentControl` | section | header |  | Header text above content |
| `Hyperlink` | link | label, destination |  |  |
| `HyperlinkButton` | button | label | variant: "hyperlink" | Link-styled button |
| `ImageIcon` | icon | name |  |  |
| `InfoBadge` | badge | value | variant: "attention" | InfoBadge(5) or InfoBadge() dot; .variant(.critical) |
| `InfoBar` | alert | title | isClosable: true, severity: "informational" | InfoBar("Title", message:, severity: .informational/.success/.warning/.error) { … } actions: { Button } |
| `ItemsRepeater` | vstack |  | alignment: "stretch" |  |
| `ItemsView` | grid |  | columns: 3 |  |
| `ListView` | list |  |  | ListView { ListViewItem… } — selection with .selected() |
| `ListViewHeaderItem` | text | content |  |  |
| `ListViewItem` | listitem | title |  | ListViewItem("Title", subtitle:, detail:, icon:, avatar:) |
| `MapControl` | placeholder | label | icon: "map" |  |
| `MediaPlayerElement` | placeholder | label | icon: "play" |  |
| `MenuBar` | toolbar |  | variant: "menubar" | MenuBar { MenuBarItem("File") { … } } |
| `MenuBarItem` | menu | label | caret: false, variant: "menubar" | MenuBarItem("Edit", open: true) { MenuFlyoutItem… } |
| `MenuFlyout` | menu | label |  | MenuFlyout { MenuFlyoutItem… } — open popup; with a label it is a button (open: true) |
| `MenuFlyoutItem` | menuitem | label |  | MenuFlyoutItem("Copy", icon: "Copy", shortcut: "Ctrl+C") |
| `MenuFlyoutSeparator` | divider |  |  |  |
| `MenuFlyoutSubItem` | menuitem | label |  | Item with a submenu chevron (children) |
| `NavigationView` | split |  | variant: "left" | NavigationView { pane items } content: { page } · .paneDisplayMode(.leftCompact / .top) |
| `NavigationViewItem` | navitem | label |  | NavigationViewItem("Home", icon: "Home", badge: 3) · .selected() |
| `NavigationViewItemHeader` | text | content |  |  |
| `NavigationViewItemSeparator` | divider |  |  |  |
| `NumberBox` | textfield | header | kind: "number", trailingIcon: "chevron.up.down" | NumberBox("Quantity", text: "3") · .spinButtonPlacementMode(.inline / .compact) |
| `PasswordBox` | textfield | header | kind: "password", reveal: true | PasswordBox("Password", text: "secret") |
| `PathIcon` | icon | name |  |  |
| `PersonPicture` | avatar | name |  | PersonPicture("Ana Diaz", image:, initials:, badge:, size: .small/.large) |
| `PipsPager` | pagination |  | variant: "pips" | PipsPager(count: 5, page: 2) |
| `Pivot` | tabs |  | placement: "top", variant: "pivot" | Pivot { PivotItem("All") { … } } |
| `PivotItem` | tab | label |  |  |
| `ProgressBar` | progress | label |  | ProgressBar(value: 0.6) — no value = indeterminate; .state(.paused / .error) |
| `ProgressRing` | progress | label | variant: "ring" | ProgressRing() indeterminate, or value: 0.7 |
| `RadioButton` | radio | label |  | RadioButton("Small", checked: true) |
| `RadioButtons` | radiogroup | label |  | RadioButtons("Theme", items: ["Light", "Dark"], selection: "Dark") |
| `RadioMenuFlyoutItem` | menuitem | label | checked: false | checked: true |
| `RangeSelector` | slider | label |  | Community Toolkit: value: [20, 80] |
| `RatingControl` | rating | value |  | RatingControl(3.5, max: 5, label:) |
| `RelativePanel` | zstack |  |  |  |
| `RepeatButton` | button | label | variant: "standard" |  |
| `RichEditBox` | textfield | header | kind: "multiline" | Multi-line rich text editor (rows:) |
| `RichTextBlock` | text | content |  |  |
| `ScrollView` | scroll | axes |  | WinUI 1.5 ScrollView (static) |
| `ScrollViewer` | scroll | axes |  | Scrolling region (static) |
| `Segmented` | segmented | items |  | Community Toolkit Segmented(items:, selection:) |
| `SelectorBar` | tabs |  | placement: "top", variant: "selector" | SelectorBar { SelectorBarItem("Recent") … } |
| `SelectorBarItem` | tab | label |  |  |
| `SettingsCard` | listitem | title |  | SettingsCard("Header", description:, icon:, chevron:) { control } — Community Toolkit |
| `SettingsExpander` | accordion | header |  | SettingsExpander("Header", description:, icon:, expanded:) { SettingsCard… } trailing: { control } |
| `Slider` | slider | label |  | Slider("Volume", value: 40, in: 0...100, ticks: 10) |
| `SplitButton` | button | label | split: true, variant: "standard" | Primary part + chevron part |
| `SplitView` | split |  |  | SplitView { pane } content: { … } |
| `StackPanel` | vstack |  | alignment: "stretch" | StackPanel(spacing: 8, orientation: .horizontal) { … } — children stretch across, controls keep their width (alignment: .leading to opt out) |
| `SymbolIcon` | icon | name |  | SymbolIcon("Accept") — Symbol enum name |
| `TabView` | tabs |  | placement: "top", variant: "document" | TabView(selection:) { TabViewItem("Doc.txt", icon:) { … } } — tabs with close buttons and “+” |
| `TabViewItem` | tab | label |  |  |
| `TeachingTip` | tooltip | title | placement: "bottom" | TeachingTip("Title", subtitle:, placement: .bottom/.top/.bottomLeft/.bottomRight/.topLeft/.topRight) { target } actions: { Button } |
| `TextBlock` | text | content |  | TextBlock("Hi", style: .titleTextBlockStyle) — Caption, Body, BodyStrong, BodyLarge, Subtitle, Title, TitleLarge, Display |
| `TextBox` | textfield | header |  | TextBox("Name", text:, placeholder:, description:) · .state(.focused) |
| `TimePicker` | datepicker | header | kind: "time", variant: "fields" | TimePicker("Alarm", value: "7:30 AM") |
| `TitleBar` | appbar | title |  | TitleBar("App", subtitle:, logo: "icon", back: true, menu: true) content: { AutoSuggestBox } { right header } |
| `ToggleButton` | button | label | variant: "standard" | ToggleButton("Bold", selected: true) — selected is IsChecked |
| `ToggleMenuFlyoutItem` | menuitem | label | checked: false | checked: true |
| `ToggleSplitButton` | button | label | split: true, variant: "standard" | SplitButton whose primary part toggles (selected:) |
| `ToggleSwitch` | toggle | label | offText: "Off", onText: "On" | ToggleSwitch("Wi-Fi", isOn: true, onText:, offText:) — label is the Header |
| `TokenizingTextBox` | textfield | header |  |  |
| `ToolTip` | tooltip | text |  | ToolTip("Hint") { target } |
| `TreeView` | list |  | variant: "tree" | TreeView { TreeViewItem("Docs", icon:, expanded: true) { … } } |
| `TreeViewItem` | navitem | label |  |  |
| `TreeViewNode` | navitem | label |  |  |
| `TwoPaneView` | split |  |  | TwoPaneView { pane1 } content: { pane2 } |
| `UniformGrid` | grid |  |  | Community Toolkit UniformGrid(columns: n) |
| `Viewbox` | zstack |  |  |  |
| `WebView2` | placeholder | label | icon: "globe" |  |
| `WrapPanel` | hstack |  | wrap: true | Community Toolkit WrapPanel |

<!-- end catalogue: fluent -->

## mui — Material UI

<!-- catalogue: mui — generate with `mockitdown elements mui --markdown` -->

| Element | Role | Arguments | Defaults | Notes |
|---|---|---|---|---|
| `Accordion` | accordion | title |  | Accordion("General settings", subtitle:, expanded: true) { details } |
| `AccordionDetails` | vstack |  | alignment: "stretch" |  |
| `Alert` | alert | message | severity: "success", variant: "standard" | Alert("Saved", severity: "info", title: "Info", variant: "filled", closable: true) |
| `AlertTitle` | text | content |  | Bold first line inside an Alert |
| `AppBar` | appbar | title |  | AppBar(title: "Dashboard", menu: true, avatar: "Ana", search: "Search…") { IconButton(…) } · color: "default" |
| `Autocomplete` | select | label | variant: "outlined" | Autocomplete("Movie", value: "Inception") · value: [..] renders chips (multiple) |
| `Avatar` | avatar | name |  | Avatar("Remy Sharp", image: "…") · variant: "rounded" |
| `AvatarGroup` | hstack |  |  | AvatarGroup { Avatar(…) … } — overlapped avatars |
| `Backdrop` | dialog |  | variant: "backdrop" | Backdrop { CircularProgress() } |
| `Badge` | badge | content |  | Badge(4, color: "error") { SvgIcon("mail") } — or .badge(4) on IconButton/Tab/ListItem |
| `BarChart` | chart |  | kind: "bar" | MUI X BarChart(series: [[..], [..]], labels: [..], height: 200) |
| `BottomNavigation` | tabs |  | placement: "bottom" | BottomNavigation(value: 0) { BottomNavigationAction("Recents", icon: "restore") … } |
| `BottomNavigationAction` | tab | label |  |  |
| `Box` | vstack |  | alignment: "stretch" | Generic container (a column that stretches its children) |
| `Breadcrumbs` | breadcrumb | items |  | Breadcrumbs(["Home", "Catalog", "Shoes"]) or Link children |
| `Button` | button | label | variant: "text" | Button("Save", variant: "contained", color: "secondary", size: "small", startIcon: "send") |
| `ButtonGroup` | toolbar |  | variant: "outlined" | ButtonGroup(variant: "contained") { Button("One") … } |
| `Card` | card | title | elevation: 1 | Card(title:, subheader:, avatar:, image:) { content } actions: { Button … } headerAction: { IconButton } |
| `CardActions` | hstack |  |  | Row of small buttons at the bottom of a Card |
| `CardContent` | vstack |  | alignment: "stretch" | 16px-padded body of a Card |
| `CardHeader` | card | title |  | CardHeader(title:, subheader:, avatar:) action: { … } |
| `CardMedia` | image | src |  | CardMedia("photo.svg") — 140px cover image (or Card(image:)) |
| `Checkbox` | checkbox | label |  | Checkbox("Remember me", checked: true, color:) |
| `Chip` | chip | label | variant: "filled" | Chip("Active", color: "success", variant: "outlined", onDelete: true, icon:, avatar:) |
| `CircularProgress` | progress |  | kind: "circular" | CircularProgress(value: 75, color:) |
| `Collapse` | group |  |  |  |
| `Container` | vstack |  | alignment: "stretch" | Centered, max-width 1200 column with 24px gutters |
| `DataGrid` | table |  |  | MUI X DataGrid(columns:, rows:, checkboxSelection: true, selectedRows: [1], pagination: "…") |
| `DateCalendar` | calendar |  |  | MUI X DateCalendar(value: "2026-11-23", showToday: true) |
| `DatePicker` | datepicker | label | format: "numeric", variant: "outlined" | MUI X DatePicker("Start date", value: "2026-11-23") |
| `DateTimePicker` | datepicker | label | format: "numeric", kind: "datetime", variant: "outlined" |  |
| `Dialog` | dialog | title |  | Dialog(title:, message:) { content } actions: { Button("Cancel") … } |
| `DialogActions` | hstack |  |  | Right-aligned row of dialog buttons |
| `DialogContent` | vstack |  | alignment: "stretch" |  |
| `DialogContentText` | text | content |  | Secondary body text of a Dialog |
| `DialogTitle` | text | content |  | Dialog heading (or use Dialog(title:)) |
| `Divider` | divider |  |  | Divider(variant: "inset") · Divider(label: "OR") |
| `Drawer` | sidebar | title | variant: "permanent" | Drawer(title: "Acme") { ListItemButton("Inbox", icon: "inbox").selected() … } · variant: "temporary" floats over a backdrop |
| `Fab` | fab | icon |  | Fab("add", color: "primary") · Fab("navigation", label: "Navigate", variant: "extended") — floats bottom-right; inline: true to place it |
| `Fade` | group |  |  |  |
| `FilledInput` | textfield | placeholder | variant: "filled" |  |
| `FormControl` | vstack |  | alignment: "stretch" |  |
| `FormControlLabel` | checkbox | label |  | Checkbox with a label (use Switch(label) for a switch) |
| `FormGroup` | vstack |  | alignment: "leading" | Column of Checkbox / Switch controls; orientation: .horizontal for row |
| `FormHelperText` | text | content |  | Caption under a control; error: true |
| `FormLabel` | text | content |  | Label of a RadioGroup / FormGroup |
| `Gauge` | progress | value | kind: "circular" |  |
| `Grid` | grid | columns |  | Grid(spacing: 16) { Grid(size: 4) { … } } — 12-column grid, items span size: |
| `Grow` | group |  |  |  |
| `IconButton` | button | icon | iconOnly: true | IconButton("delete", color: "primary", size: "small") |
| `ImageList` | grid | columns |  | ImageList(columns: 3) { ImageListItem("photo.svg") … } |
| `ImageListItem` | image | src |  |  |
| `Input` | textfield | placeholder | variant: "standard" |  |
| `InputBase` | textfield | placeholder | variant: "base" |  |
| `InputLabel` | text | content |  |  |
| `LineChart` | chart |  | kind: "line" |  |
| `LinearProgress` | progress |  |  | LinearProgress(value: 60) · no value = indeterminate |
| `Link` | link | label, href |  |  |
| `List` | list |  |  | List { ListItem(…) … } · .dense() · List(header: "Folders") |
| `ListItem` | listitem | primary |  | ListItem("Inbox", secondary: "…", icon: "inbox", avatar: "Ana") { secondary action } |
| `ListItemAvatar` | avatar | name |  | Leading avatar of a ListItem |
| `ListItemButton` | listitem | primary |  | Clickable ListItem; .selected() tints it |
| `ListItemIcon` | icon | name |  | Leading icon of a ListItem (56px column) |
| `ListItemText` | listitem | primary |  | ListItemText(primary:, secondary:) inside a ListItem |
| `ListSubheader` | text | content |  | Section heading inside a List |
| `LoadingButton` | button | label | loading: true, variant: "contained" | Button with a progress spinner (Button loading:) |
| `Masonry` | grid | columns |  |  |
| `Menu` | menu | label |  | Menu(icon: "more_vert", open: true) { MenuItem("Edit", icon: "edit") … } |
| `MenuItem` | menuitem | label |  | MenuItem("Profile", icon:, shortcut: "⌘P").selected() |
| `MenuList` | menu |  |  | A standalone menu surface |
| `MobileStepper` | pagination |  |  | MobileStepper(count: 4, page: 2) — dots with Back/Next |
| `Modal` | dialog | title |  |  |
| `NativeSelect` | select | label | variant: "standard" |  |
| `OutlinedInput` | textfield | placeholder | variant: "outlined" |  |
| `Pagination` | pagination |  |  | Pagination(count: 10, page: 2, color: "primary", shape: "rounded") |
| `Paper` | card |  | elevation: 1 | Paper(elevation: 3) { … } — surface with no padding; variant: "outlined" |
| `PieChart` | chart |  | kind: "pie" | MUI X PieChart(values: [..], labels: [..]) |
| `Placeholder` | placeholder | label |  |  |
| `Popover` | menu | label |  |  |
| `Radio` | radio | label |  |  |
| `RadioGroup` | radiogroup | label |  | RadioGroup("Gender", options: [..], value: "Female") · orientation: .horizontal for row |
| `Rating` | rating | value |  | Rating(value: 3.5, max: 5, size: "small") |
| `Select` | select | label | variant: "outlined" | Select("Age", options: ["Ten", "Twenty"], value: "Twenty", open: true) |
| `Skeleton` | shape |  | shape: "rectangle", variant: "text" | Skeleton(variant: "circular").frame(width: 40, height: 40) |
| `Slide` | group |  |  |  |
| `Slider` | slider |  |  | Slider(value: 30, min: 0, max: 100, color:) · value: [20, 37] for a range |
| `Snackbar` | toast | message |  | Snackbar("Note archived", action: "UNDO", closable: true) · position: .bottomCenter |
| `SparkLineChart` | chart |  | kind: "sparkline" |  |
| `SpeedDial` | fab | icon | color: "primary" |  |
| `Stack` | vstack |  | alignment: "stretch" | Stack(spacing: 16) · orientation: .horizontal for direction="row" (spacing in px) |
| `StaticDatePicker` | calendar |  |  |  |
| `Step` | text | label |  | Stepper { Step("Shipping") … } (or steps: [..]) |
| `StepLabel` | text | label |  |  |
| `Stepper` | steps | steps |  | Stepper(["Shipping", "Payment", "Review"], activeStep: 1) · orientation: .vertical |
| `SvgIcon` | icon | name |  | Material icon by name: SvgIcon("inbox") |
| `SwipeableDrawer` | sidebar | title | variant: "temporary" |  |
| `Switch` | toggle | label |  | Switch("Wi-Fi", checked: true) · labelPlacement: .start |
| `Tab` | tab | label |  | Tab("Favorites", icon: "favorite") { panel } |
| `TabList` | tabs | items | placement: "top" |  |
| `TabPanel` | vstack |  | alignment: "stretch" |  |
| `Table` | table |  |  | Table(columns: [..], rows: [[..]], size: "small") or TableRow { TableCell … } children |
| `TableCell` | text | content |  | Cell inside TableRow |
| `TableContainer` | card |  | elevation: 1 | Paper around a Table |
| `TablePagination` | pagination | summary |  | TablePagination("Rows per page: 10 ▾    1–10 of 100") — the label, then prev/next |
| `TableRow` | tablerow |  |  |  |
| `Tabs` | tabs | items | placement: "top" | Tabs(["Account", "Security"], value: 0) or Tabs { Tab("One") { panel } } |
| `TextField` | textfield | label | variant: "outlined" | TextField("Email", value: "…", helperText:, error: true, prefix: "$", size: "small", multiline via kind: .multiline) |
| `TextareaAutosize` | textfield | placeholder | kind: "multiline", variant: "outlined" |  |
| `TimePicker` | datepicker | label | kind: "time", variant: "outlined" |  |
| `Timeline` | steps | steps | orientation: "vertical" |  |
| `ToggleButton` | button | label |  | ToggleButton(icon: "format_bold").selected() |
| `ToggleButtonGroup` | segmented | items |  | ToggleButtonGroup(["Web", "Android", "iOS"], value: "Web") — items may be ["icon": …] dicts |
| `Toolbar` | toolbar |  |  | Toolbar { IconButton; Typography; Spacer(); Button } |
| `Tooltip` | tooltip | title |  | Tooltip("Delete") { IconButton("delete") } · placement: .bottom |
| `Typography` | text | content | variant: "body1" | Typography("Title", variant: "h5", color: "text.secondary") |
| `Zoom` | group |  |  |  |

<!-- end catalogue: mui -->

## angular-material — Angular Material

<!-- catalogue: angular-material — generate with `mockitdown elements angular-material --markdown` -->

| Element | Role | Arguments | Defaults | Notes |
|---|---|---|---|---|
| `MatAccordion` | vstack |  | alignment: "stretch", spacing: 0 | mat-accordion: MatExpansionPanel children |
| `MatActionList` | list |  |  | mat-action-list: rows that are buttons |
| `MatAutocomplete` | select | label | variant: "fill" | input with matAutocomplete: value: (typed text), options:, open: true |
| `MatBadge` | badge | text |  | matBadge content (usually .badge(n) on a button or icon) |
| `MatBottomSheet` | dialog | title | variant: "sheet" | MatBottomSheet content: list or actions |
| `MatButton` | button | label | variant: "text" | button matButton="text/filled/tonal/outlined/elevated" · .variant(.filled) or variant: "filled" |
| `MatButtonToggle` | button | label | variant: "toggle" | mat-button-toggle |
| `MatButtonToggleGroup` | segmented | items |  | mat-button-toggle-group: items: [..] or MatButtonToggle children, value: |
| `MatCalendar` | calendar |  |  | mat-calendar: selection:, range: [a, b] |
| `MatCard` | card | title | variant: "raised" | mat-card: title:, subtitle:, avatar:, image:, children = content, actions: slot; appearance raised/outlined/filled |
| `MatCardActions` | hstack |  | spacing: 8 | mat-card-actions |
| `MatCardAvatar` | avatar | name |  | img mat-card-avatar |
| `MatCardContent` | vstack |  | alignment: "leading" | mat-card-content |
| `MatCardHeader` | hstack |  | spacing: 16 | mat-card-header |
| `MatCardImage` | image | name |  | img mat-card-image |
| `MatCardSubtitle` | text | content | font: "titleSmall" | mat-card-subtitle |
| `MatCardTitle` | text | content | font: "titleLarge" | mat-card-title |
| `MatCell` | text | content |  | td mat-cell |
| `MatCheckbox` | checkbox | label |  | mat-checkbox: checked:, .state(.indeterminate) |
| `MatChip` | chip | label | variant: "assist" | mat-chip (assist/suggestion): systemImage: |
| `MatChipGrid` | hstack |  | spacing: 8, wrap: true | mat-chip-grid: MatChipRow children (input chips) |
| `MatChipListbox` | hstack |  | spacing: 8, wrap: true | mat-chip-listbox: MatChipOption children |
| `MatChipOption` | chip | label | variant: "filter" | mat-chip-option (filter): selected: |
| `MatChipRow` | chip | label | removable: true, variant: "input" | mat-chip-row (input chip with remove icon): avatar: |
| `MatChipSet` | hstack |  | spacing: 8, wrap: true | mat-chip-set: MatChip children |
| `MatColumnDef` | tablecolumn | title |  | ng-container matColumnDef |
| `MatDateRangeInput` | datepicker | label | variant: "fill" | mat-date-range-input: selection: "11/3/2026 – 11/9/2026" |
| `MatDateRangePicker` | calendar |  |  | mat-date-range-picker panel: range: [a, b] |
| `MatDatepicker` | datepicker | label | variant: "fill" | input [matDatepicker] + toggle: selection: "2026-11-23" |
| `MatDialog` | dialog | title |  | MatDialog content: title (mat-dialog-title), message:, children (mat-dialog-content), actions: slot (mat-dialog-actions) |
| `MatDialogActions` | hstack |  | spacing: 8 | mat-dialog-actions |
| `MatDialogContent` | vstack |  | alignment: "leading" | mat-dialog-content |
| `MatDivider` | divider |  |  | mat-divider; .variant(.inset) |
| `MatDrawer` | sidebar | title | variant: "side" | mat-drawer |
| `MatDrawerContainer` | split |  |  | mat-drawer-container |
| `MatDrawerContent` | vstack |  | alignment: "stretch" | mat-drawer-content |
| `MatExpansionPanel` | accordion | title |  | mat-expansion-panel: title, description:, expanded:, children = body |
| `MatExtendedFab` | fab | label |  | button matFab extended: MatExtendedFab("Compose", icon: "edit") |
| `MatFab` | fab | icon |  | button matFab (floats bottom-trailing; inline: true to place in flow) |
| `MatFlatButton` | button | label | variant: "filled" | mat-flat-button (= matButton="filled") |
| `MatFormField` | textfield | label | variant: "fill" | mat-form-field + matInput: label (mat-label), text:, placeholder:, helper: (mat-hint), error: (mat-error); .appearance(.outline) |
| `MatGridList` | grid | columns | spacing: 4 | mat-grid-list: MatGridList(4) { MatGridTile … } (cols as first argument) |
| `MatGridTile` | placeholder | label |  | mat-grid-tile: a tile; children overlay it |
| `MatHeaderCell` | tablecolumn | title |  | th mat-header-cell |
| `MatHorizontalStepper` | tabs |  | placement: "top", variant: "stepper" | mat-stepper orientation=horizontal |
| `MatIcon` | icon | name |  | mat-icon: Material Icons/Symbols name, e.g. MatIcon("home") |
| `MatIconButton` | button | icon | iconOnly: true, variant: "icon" | button matIconButton: MatIconButton("more_vert") |
| `MatInput` | textfield | label | variant: "fill" | input matInput inside its mat-form-field (same as MatFormField) |
| `MatList` | list |  |  | mat-list: MatListItem children; .variant(.dense) |
| `MatListItem` | listitem | title |  | mat-list-item: title, subtitle: (matListItemLine), systemImage: (matListItemIcon), avatar:, detail: (matListItemMeta) |
| `MatListOption` | listitem | title | checkbox: true | mat-list-option: checked:, subtitle:; checkbox after the text |
| `MatListSubheader` | text | content |  | matSubheader: section heading inside a list |
| `MatMenu` | menu | label |  | mat-menu + [matMenuTriggerFor]: label or systemImage: (icon trigger), open: true, MatMenuItem children |
| `MatMenuItem` | menuitem | label |  | button mat-menu-item: systemImage:, disabled |
| `MatMiniFab` | fab | icon | size: "small" | button matMiniFab |
| `MatNavList` | list |  | variant: "nav" | mat-nav-list: MatListItem rows, the selected one `.selected()` (activated) |
| `MatNestedTreeNode` | navitem | label |  | mat-nested-tree-node |
| `MatOption` | text | content |  | mat-option |
| `MatPaginator` | pagination | summary |  | mat-paginator: MatPaginator("1 – 10 of 100") |
| `MatProgressBar` | progress |  |  | mat-progress-bar: value: 0…100; no value = indeterminate |
| `MatProgressSpinner` | progress |  | variant: "circular" | mat-progress-spinner / mat-spinner: value: |
| `MatRadioButton` | radio | label |  | mat-radio-button: checked: |
| `MatRadioGroup` | radiogroup | label |  | mat-radio-group: options: [..] or MatRadioButton children, value: |
| `MatRaisedButton` | button | label | variant: "elevated" | mat-raised-button (= matButton="elevated") |
| `MatRow` | tablerow |  |  | tr mat-row: cells as children |
| `MatSelect` | select | label | variant: "fill" | mat-select in a mat-form-field: options: [..] or MatOption children, value:, open: true |
| `MatSelectionList` | list |  | variant: "selection" | mat-selection-list: MatListOption children |
| `MatSidenav` | sidebar | title | variant: "side" | mat-sidenav: title:, header:/footer: slots, children (usually a MatNavList) |
| `MatSidenavContainer` | split |  |  | mat-sidenav-container: MatSidenav { … } then MatSidenavContent { … } |
| `MatSidenavContent` | vstack |  | alignment: "stretch" | mat-sidenav-content: the main area beside the sidenav |
| `MatSlideToggle` | toggle | label |  | mat-slide-toggle: isOn: / checked: |
| `MatSlider` | slider |  |  | mat-slider: value:, min:, max:, ticks: (showTickMarks), value: [a, b] for a range |
| `MatSnackBar` | toast | message |  | MatSnackBar: message, action: "Undo" |
| `MatSortHeader` | tablecolumn | title |  | th mat-sort-header (sorted column: MatTable sortColumn:) |
| `MatSpinner` | progress |  | variant: "circular" | mat-spinner (indeterminate) |
| `MatStep` | tab | label |  | mat-step: label, children = step content |
| `MatStepper` | tabs |  | placement: "top", variant: "stepper" | mat-stepper: MatStep children, selection: index; orientation: .vertical |
| `MatStepperHeader` | steps | steps |  | Step header only: steps: [..], current: |
| `MatStrokedButton` | button | label | variant: "outlined" | mat-stroked-button (= matButton="outlined") |
| `MatTab` | tab | label |  | mat-tab: label, systemImage:, children = content |
| `MatTabGroup` | tabs |  | placement: "top" | mat-tab-group: MatTab children, selectedIndex via selection: |
| `MatTabLink` | tab | label |  | a mat-tab-link |
| `MatTabNavBar` | tabs | items | placement: "top" | nav mat-tab-nav-bar: items: [..] or MatTabLink children |
| `MatTable` | table |  |  | mat-table: columns:, rows:, selectable: (SelectionModel), sortColumn: (matSort), toolbar:/footer: slots |
| `MatTextarea` | textfield | label | kind: "multiline", variant: "fill" | textarea matInput (cdkTextareaAutosize): rows: |
| `MatTimepicker` | datepicker | label | kind: "time", variant: "fill" | input [matTimepicker]: selection: "9:30 AM" |
| `MatTonalButton` | button | label | variant: "tonal" | matButton="tonal" |
| `MatToolbar` | appbar | title |  | mat-toolbar: title, navigationIcon:, menu: true, children = actions; .color(.primary) |
| `MatToolbarRow` | toolbar |  |  | mat-toolbar-row: a row of a multi-row toolbar |
| `MatTooltip` | tooltip | text | placement: "bottom" | [matTooltip]: MatTooltip("Delete") { MatIconButton("delete") } |
| `MatTree` | vstack |  | alignment: "stretch", spacing: 0 | mat-tree: nested MatTreeNode children |
| `MatTreeNode` | navitem | label |  | mat-tree-node: label, systemImage:, nested nodes as children, expanded: |
| `MatVerticalStepper` | tabs |  | orientation: "vertical", placement: "top", variant: "stepper" | mat-stepper orientation=vertical |

<!-- end catalogue: angular-material -->

## sapui5 — SAPUI5 (Fiori Horizon)

<!-- catalogue: sapui5 — generate with `mockitdown elements sapui5 --markdown` -->

| Element | Role | Arguments | Defaults | Notes |
|---|---|---|---|---|
| `ActionListItem` | listitem | title |  | sap.m.ActionListItem: centered action text |
| `ActionSheet` | menu |  |  | sap.m.ActionSheet: a menu of buttons |
| `AnchorBar` | tabs | items |  | sap.uxap.AnchorBar(items: [section titles], selection:) |
| `App` | vstack |  | alignment: "stretch", spacing: 0 | sap.m.App: the root container |
| `Avatar` | avatar | initials |  | sap.m.Avatar(initials, src:); .displayShape(.Square), .displaySize(.L), .backgroundColor(.Accent6) |
| `AvatarGroup` | hstack |  |  | sap.f.AvatarGroup |
| `Bar` | toolbar |  |  | sap.m.Bar: left/middle/right content; use ToolbarSpacer between |
| `Breadcrumbs` | breadcrumb | items |  | sap.m.Breadcrumbs(items: [..., current]) |
| `BusyIndicator` | progress | label | variant: "circular" | sap.m.BusyIndicator: three pulsing dots |
| `Button` | button | text |  | sap.m.Button; .type(.Emphasized) etc.; icon: "sap-icon://add" |
| `Calendar` | calendar |  |  | sap.ui.unified.Calendar(selection: "2026-11-24") |
| `Card` | card | title, subtitle |  | sap.f.Card(title, subtitle, icon:, status:) { content } |
| `Carousel` | scroll |  | axes: "horizontal" | sap.m.Carousel { Image(…) … }: first page + page indicator |
| `CheckBox` | checkbox | label |  | sap.m.CheckBox("text", selected: true) |
| `Column` | tablecolumn | title |  | sap.m.Column(header text, alignment: .End) |
| `ColumnListItem` | tablerow |  |  | sap.m.ColumnListItem { cells } |
| `ComboBox` | select | label |  | sap.m.ComboBox: typeable select |
| `CustomListItem` | listitem |  |  | sap.m.CustomListItem { any content } |
| `DatePicker` | datepicker | label |  | sap.m.DatePicker(value: "2026-11-24") |
| `DateRangeSelection` | datepicker | label |  | sap.m.DateRangeSelection(value: "Nov 1 – Nov 30, 2026") |
| `DateTimePicker` | datepicker | label | kind: "datetime" | sap.m.DateTimePicker |
| `Dialog` | dialog | title |  | sap.m.Dialog(title, state:, buttons: [...]) { content } actions: { buttons } |
| `DisplayListItem` | listitem | label, detail |  | sap.m.DisplayListItem(label, value) |
| `DynamicPage` | vstack |  | alignment: "stretch", spacing: 0 | sap.f.DynamicPage { DynamicPageTitle; DynamicPageHeader; content } |
| `DynamicPageHeader` | vstack |  | alignment: "stretch" | sap.f.DynamicPageHeader: collapsible header content (filter bar, key facts) |
| `DynamicPageTitle` | card | title, subtitle |  | sap.f.DynamicPageTitle(heading, subtitle) { key info } actions: { buttons } |
| `ExpandableText` | text | content |  | sap.m.ExpandableText |
| `FeedListItem` | listitem | title, subtitle |  | sap.m.FeedListItem(sender, text, avatar:, detail: timestamp) |
| `FileUploader` | textfield | placeholder | trailingIcon: "sap-icon://upload" | sap.ui.unified.FileUploader |
| `FilterBar` | toolbar |  |  | sap.ui.comp FilterBar: labelled filter fields + Go |
| `FlexBox` | hstack |  |  | sap.m.FlexBox; wrap: true wraps |
| `FlexibleColumnLayout` | split |  | variant: "TwoColumnsMidExpanded" | sap.f.FlexibleColumnLayout { begin } { mid } { end } as children; .layout(.TwoColumnsBeginExpanded) |
| `Form` | form | title |  | sap.ui.layout.form.Form { FormContainer { FormElement } } |
| `FormContainer` | section | title |  | sap.ui.layout.form.FormContainer |
| `FormElement` | labeled | label |  | sap.ui.layout.form.FormElement(label) { fields } |
| `FormattedText` | text | content |  | sap.m.FormattedText (inline **bold**, *italic*, `code`, [link](…)) |
| `GenericTag` | chip | label |  | sap.m.GenericTag |
| `GenericTile` | card | title, subtitle |  | sap.m.GenericTile(header, subheader, icon:) { TileContent(footer:) { NumericContent } }; .frameType(.TwoByOne) |
| `GroupHeaderListItem` | listitem | title |  | sap.m.GroupHeaderListItem |
| `HBox` | hstack |  |  | sap.m.HBox (FlexBox, row) |
| `Icon` | icon | name |  | sap.ui.core.Icon("sap-icon://home") |
| `IconTabBar` | tabs | items |  | sap.m.IconTabBar(selection:) { IconTabFilter(…) } |
| `IconTabFilter` | tab | text |  | sap.m.IconTabFilter(text, icon:) { content }; .count(12) |
| `IllustratedMessage` | dropzone | title | icon: "sap-icon://search" | sap.m.IllustratedMessage(title, description:, icon:) { additional buttons } |
| `Image` | image | src |  | sap.m.Image(src) |
| `InfoLabel` | badge | text |  | sap.tnt.InfoLabel; .colorScheme(.c7) or color: 1…10 |
| `Input` | textfield | placeholder |  | sap.m.Input(placeholder, value:, label:); .valueState(.Error), error: "text" for the value state message |
| `InputListItem` | listitem | label |  | sap.m.InputListItem(label) { control } |
| `Item` | text | text |  | sap.ui.core.Item: an option of Select / ComboBox / SegmentedButton |
| `Label` | text | content |  | sap.m.Label: field caption in sapContent_LabelColor |
| `Link` | link | text, href |  | sap.m.Link |
| `List` | list |  |  | sap.m.List(header:) { StandardListItem … } |
| `MaskInput` | textfield | placeholder |  | sap.m.MaskInput |
| `Menu` | menu | label |  | sap.m.Menu (standalone without a label) |
| `MenuButton` | menu | label |  | sap.m.MenuButton { MenuItem(…) }; open: true shows the menu |
| `MenuItem` | menuitem | text |  | sap.m.MenuItem(text, icon:) |
| `MessageBox` | dialog | title |  | sap.m.MessageBox(title, message:, state: .Error/.Warning/.Success/.Information, icon:, buttons:) |
| `MessageItem` | listitem | title |  | sap.m.MessageItem(title, subtitle:, icon:, status:) |
| `MessagePopover` | dialog | title | variant: "popover" | sap.m.MessagePopover { MessageItem … } |
| `MessageStrip` | alert | text |  | sap.m.MessageStrip(text, type: .Information/.Success/.Warning/.Error, showCloseButton:) |
| `MessageToast` | toast | message |  | sap.m.MessageToast("Saved") |
| `MultiComboBox` | select | label |  | sap.m.MultiComboBox(selection: ["A", "B"]): tokens in the field |
| `MultiInput` | select | label | trailingIcon: "sap-icon://value-help" | sap.m.MultiInput(selection: [tokens]) with value help |
| `NavigationList` | group |  |  | sap.tnt.NavigationList |
| `NavigationListItem` | navitem | label |  | sap.tnt.NavigationListItem(text, icon:) with nested items |
| `NotificationListItem` | listitem | title |  | sap.m.NotificationListItem(title, description:, avatar:, detail: time, status: .Error) |
| `NumericContent` | labeled | value, label |  | sap.m.NumericContent(value, scale, color: .Good/.Critical/.Error); .indicator(.Up) |
| `ObjectAttribute` | labeled | title, text |  | sap.m.ObjectAttribute(title, text) → “Title: text” |
| `ObjectHeader` | card | title, status |  | sap.m.ObjectHeader(title, number) { ObjectAttribute; ObjectStatus } |
| `ObjectIdentifier` | labeled | title, text |  | sap.m.ObjectIdentifier(title, text): bold title over a grey text |
| `ObjectListItem` | listitem | title, detail |  | sap.m.ObjectListItem(title, number) { ObjectAttribute; ObjectStatus } |
| `ObjectMarker` | badge | text | icon: "sap-icon://favorite" | sap.m.ObjectMarker (Favorite, Flagged, Draft …) |
| `ObjectNumber` | labeled | value, label |  | sap.m.ObjectNumber("1,250.00", "EUR", state:) |
| `ObjectPageDynamicHeaderTitle` | card | title, subtitle |  | alias of ObjectPageHeader |
| `ObjectPageHeader` | card | title, subtitle |  | sap.uxap.ObjectPageDynamicHeaderTitle(title, subtitle, avatar:) { header facts } actions: { … } |
| `ObjectPageLayout` | vstack |  | alignment: "stretch", spacing: 0 | sap.uxap.ObjectPageLayout { ObjectPageHeader; AnchorBar; ObjectPageSection … } |
| `ObjectPageSection` | section | title |  | sap.uxap.ObjectPageSection(title) { content } |
| `ObjectPageSubSection` | section | title |  | sap.uxap.ObjectPageSubSection |
| `ObjectStatus` | badge | text |  | sap.m.ObjectStatus(text, state: .Success/.Warning/.Error/.Information/.Indication05, icon:); .inverted() |
| `OverflowToolbar` | toolbar |  |  | sap.m.OverflowToolbar: header toolbar of tables and lists |
| `OverflowToolbarButton` | button | icon | iconOnly: true, variant: "Transparent" | sap.m.OverflowToolbarButton: icon-only transparent button |
| `Page` | navstack | title | titleDisplayMode: "inline" | sap.m.Page: header Bar with title (start-aligned in Horizon), content; back: true shows the nav button |
| `Panel` | accordion | title | expanded: true | sap.m.Panel(headerText, expanded:) |
| `Popover` | dialog | title | variant: "popover" | sap.m.Popover |
| `ProductSwitch` | grid |  | columns: 4 | sap.f.ProductSwitch { ProductSwitchItem(title, icon:) } |
| `ProductSwitchItem` | button | text |  | sap.f.ProductSwitchItem |
| `ProgressIndicator` | progress | value | showValue: true | sap.m.ProgressIndicator(value: 60, state: .Success) |
| `RadioButton` | radio | label |  | sap.m.RadioButton("text", selected: true) |
| `RadioButtonGroup` | radiogroup | label |  | sap.m.RadioButtonGroup(options: [...], selection: 0) |
| `RangeSlider` | slider |  |  | sap.m.RangeSlider(value: [20, 60], in: 0...100) |
| `RatingIndicator` | rating | value |  | sap.m.RatingIndicator(value: 4, max: 5) |
| `ResponsivePopover` | dialog | title | variant: "popover" | sap.m.ResponsivePopover |
| `ScrollContainer` | scroll | axes |  | sap.m.ScrollContainer |
| `SearchField` | textfield | placeholder | kind: "search" | sap.m.SearchField (magnifier at the end) |
| `SegmentedButton` | segmented | items |  | sap.m.SegmentedButton(items: [...], selection:) or SegmentedButtonItem children |
| `SegmentedButtonItem` | button | text |  | sap.m.SegmentedButtonItem |
| `Select` | select | label |  | sap.m.Select(selection:) { Item("…") } |
| `Shell` | vstack |  | alignment: "stretch", spacing: 0 | sap.m.Shell: letterboxed app root |
| `ShellBar` | appbar | title |  | sap.f.ShellBar(title, secondaryTitle:, logo:, search:, notifications: 3, avatar: "JD") { extra buttons, e.g. product switch } |
| `SideNavigation` | sidebar | title |  | sap.tnt.SideNavigation(selection:) { NavigationListItem … } footer: { fixed items } |
| `SimpleForm` | form | title |  | sap.ui.layout.form.SimpleForm(title) { Title; Label; Input … }: labels at the start on desktop |
| `Slider` | slider |  |  | sap.m.Slider(value: 30, in: 0...100) |
| `SplitApp` | split |  |  | sap.m.SplitApp: master + detail |
| `SplitContainer` | split |  |  | sap.m.SplitContainer |
| `StandardListItem` | listitem | title |  | sap.m.StandardListItem(title, description:, icon:, info:, status:, count:); .type(.Navigation) |
| `StepInput` | stepper | label |  | sap.m.StepInput(value: 3): − value + in one field |
| `Switch` | toggle | label |  | sap.m.Switch(isOn: true) |
| `TabContainer` | tabs | items |  | sap.m.TabContainer |
| `TabContainerItem` | tab | text |  | sap.m.TabContainerItem |
| `Table` | table |  |  | sap.m.Table(selectable:) { Column(…) … ColumnListItem { cells } } header: { OverflowToolbar } |
| `Text` | text | content |  | sap.m.Text |
| `TextArea` | textfield | value | kind: "multiline" | sap.m.TextArea(value, rows:) |
| `TileContent` | section | footer |  | sap.m.TileContent(footer, unit:) { NumericContent } |
| `TimePicker` | datepicker | label | kind: "time" | sap.m.TimePicker |
| `Title` | text | content | style: "H5" | sap.m.Title; level: .H1 … .H6 (or .titleStyle(.H3)) sets the size |
| `ToggleButton` | toggle | label | variant: "button" | sap.m.ToggleButton; .pressed() shows the pressed state |
| `Token` | chip | text | removable: true | sap.m.Token |
| `Tokenizer` | hstack |  | spacing: 4, wrap: true | sap.m.Tokenizer { Token(…) } |
| `ToolHeader` | appbar | title |  | sap.tnt.ToolHeader |
| `ToolPage` | vstack |  | alignment: "stretch", spacing: 0 | sap.tnt.ToolPage { ToolHeader; HStack { SideNavigation; content } } |
| `Toolbar` | toolbar |  |  | sap.m.Toolbar |
| `ToolbarSeparator` | divider |  |  | sap.m.ToolbarSeparator |
| `ToolbarSpacer` | spacer |  |  | sap.m.ToolbarSpacer: pushes the following content to the end |
| `UploadSet` | dropzone | label |  | sap.m.upload.UploadSet drop area |
| `VBox` | vstack |  | alignment: "leading" | sap.m.VBox (FlexBox, column) |
| `VariantManagement` | menu | label |  | sap.ui.fl VariantManagement (“Standard ▾” title) |
| `Wizard` | tabs |  |  | sap.m.Wizard(selection: 1) { WizardStep(title) { content } … }: numbered progress navigator |
| `WizardStep` | tab | title |  | sap.m.WizardStep(title) { content } |

<!-- end catalogue: sapui5 -->

## bootstrap — Bootstrap 5.3

<!-- catalogue: bootstrap — generate with `mockitdown elements bootstrap --markdown` -->

| Element | Role | Arguments | Defaults | Notes |
|---|---|---|---|---|
| `Accordion` | vstack |  | alignment: "stretch", spacing: 0 | Accordion { AccordionItem… } · .flush() |
| `AccordionItem` | accordion | title |  | AccordionItem("Item #1", expanded: true) { body } |
| `Alert` | alert | message | showIcon: false, variant: "primary" | Alert("Saved!", variant: "success", title:, dismissible: true) { AlertLink… } |
| `AlertHeading` | text | content | font: "h4" | An alert heading |
| `AlertLink` | link | label |  | A bold link coloured for its alert |
| `Badge` | badge | text | color: "primary" | Badge("New").bg(.success) · .pill() · variant: "subtle" (bg-*-subtle text-*-emphasis) |
| `Breadcrumb` | breadcrumb | items |  | Breadcrumb(["Home", "Library", "Data"]) or BreadcrumbItem children |
| `BreadcrumbItem` | text | content |  | One breadcrumb (the last is the active page) |
| `Button` | button | label | variant: "primary" | Button("Save", variant: "outline-secondary", size: "sm", systemImage:) · .active() · disabled: true |
| `ButtonGroup` | toolbar |  | variant: "group" | Joined buttons; size: "sm"/"lg" on the buttons |
| `ButtonToolbar` | toolbar |  |  | A row of button groups |
| `Card` | card | title |  | Card("Title", subtitle:, image:) { body } footer: { … } · header: { Text("Featured") } draws a header band |
| `CardBody` | group |  |  | Layout-only wrapper (the Card's children are its body) |
| `CardGroup` | hstack |  | spacing: 0 | Cards joined edge to edge |
| `CardImg` | image | name |  | An image inside a card body |
| `CardLink` | link | label |  | card-link |
| `CardSubtitle` | text | content | font: "h6" | card-subtitle (muted) |
| `CardText` | text | content |  | card-text |
| `CardTitle` | text | content | font: "h5" | card-title inside a body |
| `Carousel` | card | title |  | One carousel slide: Carousel("First slide", subtitle:, image:, mediaHeight:) with indicators and controls |
| `CloseButton` | button |  | icon: "xmark", iconOnly: true, variant: "close" | The btn-close × |
| `Col` | vstack | level |  | Grid column: Col() is equal width, Col(6) or .md(6) spans 6 of 12, Col("auto") sizes to content |
| `Container` | vstack |  |  | Centered, padded page container (max 1140px on desktop); .fluid() for full width |
| `Dropdown` | menu | title | variant: "primary" | Dropdown("Actions", open: true) { DropdownItem… } |
| `DropdownButton` | menu | title | variant: "primary" | DropdownButton("Filter", variant: "outline-secondary", open: true) { DropdownItem… } |
| `DropdownDivider` | divider |  |  | Separator inside a dropdown |
| `DropdownHeader` | text | content |  | Small muted heading inside a dropdown |
| `DropdownItem` | menuitem | label |  | DropdownItem("Edit", systemImage:) · .active() · disabled: true |
| `DropdownItemText` | text | content |  | Non-interactive text inside a dropdown |
| `DropdownMenu` | menu |  |  | A static, always-visible dropdown menu |
| `DropdownToggle` | button | label | dropdown: true, variant: "primary" | A button with a caret |
| `Figure` | vstack |  | alignment: "leading", spacing: 8 | Figure { FigureImage(…); FigureCaption(…) } |
| `FigureCaption` | text | content |  | figure-caption (muted, small) |
| `FigureImage` | image | name |  | figure-img |
| `FloatingLabel` | textfield | label | variant: "floating" | FloatingLabel("Email address", text: "name@example.com") |
| `Form` | form |  |  | Form { FormGroup… ; Button } (no padding; 16px between groups) |
| `FormCheck` | toggle | label | variant: "checkbox" | Checkbox: FormCheck("Remember me", checked: true) |
| `FormControl` | textfield | placeholder |  | FormControl("name@example.com", label:, text:, type: "email"/"password"/"textarea", size: "sm"/"lg", helper:) · .isInvalid() · .plaintext() |
| `FormControlFeedback` | text | content |  | invalid-feedback text; kind: "valid" for valid-feedback |
| `FormFloating` | group |  |  | Layout-only wrapper |
| `FormGroup` | vstack |  | alignment: "stretch", spacing: 0 | A label + control + help text group |
| `FormLabel` | text | content |  | A form label |
| `FormRadio` | radio | label |  | Radio (Form.Check type="radio"): FormRadio("Credit card", checked: true) |
| `FormRange` | slider | label |  | FormRange("Volume", value: 40, in: 0...100) |
| `FormSelect` | select | selection |  | FormSelect("Choose…", label:) { Text("One") … } · open: true |
| `FormSwitch` | toggle | label |  | Switch: FormSwitch("Notifications", checked: true) |
| `FormText` | text | content |  | Muted help text under a control |
| `Image` | image | name |  | Image("photo.jpg") · .rounded() · .roundedCircle() · .thumbnail() · .fluid() |
| `InputGroup` | hstack |  | spacing: 0 | InputGroup { InputGroupText("@"); FormControl("Username") } — joined controls |
| `InputGroupText` | text | content |  | An add-on box inside an InputGroup |
| `ListGroup` | list |  |  | ListGroup { ListGroupItem… } · .flush() · .numbered() · .horizontal() |
| `ListGroupItem` | listitem | title |  | ListGroupItem("Inbox", subtitle:, detail:) .badge(14) · .active() · .action() · variant: "success" |
| `Modal` | dialog | title | closeButton: true, variant: "modal" | Modal("Title") { body } footer: { Button… } · size: "sm"/"lg"/"xl" · .centered() · inline: true |
| `Nav` | tabs | items | placement: "top" | Nav { NavLink("Home").active(); NavLink("Link") } · variant: "tabs"/"pills"/"underline" · .class("flex-column") |
| `NavDropdown` | menu | title | variant: "nav" | A nav link with a dropdown menu; open: true shows it |
| `NavItem` | tab | label |  | A Nav entry (same as NavLink) |
| `NavLink` | tab | label |  | NavLink("Home", systemImage:) · .active() · disabled: true |
| `Navbar` | appbar | brand | color: "body-tertiary" | Navbar(brand: "Acme") { Nav { NavLink… }; Button… } · .bg(.dark) / .bg(.primary) / variant: "dark" |
| `NavbarBrand` | text | content |  | The brand text inside a Navbar |
| `NavbarCollapse` | group |  |  | Groups the collapsible part of a Navbar (layout only) |
| `NavbarText` | text | content |  | Plain text inside a Navbar |
| `NavbarToggle` | button |  | icon: "line.3.horizontal", iconOnly: true, variant: "toggler" | The collapsed-navbar hamburger toggler |
| `Offcanvas` | dialog | title | closeButton: true, variant: "offcanvas" | Offcanvas("Menu") { body } · placement: "end" |
| `Pagination` | pagination |  |  | Pagination(count: 10, page: 2) · size: "sm"/"lg" |
| `Placeholder` | shape | level |  | Loading placeholder bar: Placeholder(6) or .xs(6) spans 6/12 · size: "lg"/"sm"/"xs" · .animation(.glow) |
| `PlaceholderButton` | button | level | variant: "primary" | A placeholder in button shape |
| `Popover` | tooltip | title, message | placement: "right" | Popover("Title", "Body text") { trigger } · placement: .bottom |
| `ProgressBar` | progress | value |  | ProgressBar(60, label: "60%", variant: "success") · .striped() |
| `Ratio` | zstack | kind |  | Ratio("16x9") { content } — 1x1, 4x3, 16x9, 21x9 |
| `Row` | hstack |  | wrap: true | Flex grid row with 24px gutters; .gap(0…5) sets the gutter (g-*) |
| `Spinner` | badge |  |  | Spinner(variant: "primary", size: "sm") · .animation(.grow) |
| `SplitButton` | menu | title | variant: "primary" | A button with a separate caret toggle |
| `Stack` | vstack |  |  | Flex stack: .direction(.horizontal) for hstack, .gap(0…5) for the spacer scale |
| `Tab` | tab | title |  | Tab("Profile") { pane content } · .active() |
| `TabContainer` | group |  |  | Layout-only wrapper |
| `TabContent` | group |  |  | Layout-only wrapper |
| `TabPane` | group |  |  | Layout-only wrapper |
| `Table` | table |  |  | Table(columns:, rows:) · .striped() .hover() .bordered() .borderless() .size(.sm) · variant: "dark" |
| `Tabs` | tabs |  | placement: "top", variant: "tabs" | Tabs(selection: "Profile") { Tab("Home") { … } … } — nav tabs with panes |
| `Toast` | card | title |  | Toast("Bootstrap", status: "11 mins ago", systemImage:) { Text(body) } · .bg(.primary) |
| `ToastBody` | group |  |  | Layout-only wrapper |
| `ToastContainer` | dialog |  | position: "top-end", variant: "toast-container" | Positions toasts over the screen: position: "top-end"/"top-start"/"bottom-end"/… · inline: true |
| `ToggleButton` | toggle | label | variant: "button" | ToggleButton("Bold", checked: true) — outline-primary checkable button |
| `ToggleButtonGroup` | toolbar |  | variant: "group" | Joined ToggleButtons |
| `Tooltip` | tooltip | text | placement: "top" | Tooltip("Hint", placement: .bottom) { trigger } |

<!-- end catalogue: bootstrap -->

## shadcn — shadcn/ui

<!-- catalogue: shadcn — generate with `mockitdown elements shadcn --markdown` -->

| Element | Role | Arguments | Defaults | Notes |
|---|---|---|---|---|
| `Accordion` | vstack |  | alignment: "stretch", spacing: 0 | Accordion { AccordionItem(…) … } |
| `AccordionItem` | accordion | title |  | AccordionItem("Is it accessible?", expanded: true) { Text(…) } |
| `Alert` | alert | title | variant: "default" | Alert("Heads up!", description: "…", systemImage: "terminal", variant: .destructive) |
| `AlertDescription` | text | content |  |  |
| `AlertDialog` | dialog | title | variant: "alertDialog" | AlertDialog("Are you absolutely sure?", description: "…") { } actions: { AlertDialogCancel(); AlertDialogAction() } |
| `AlertDialogAction` | button | label | label: "Continue", variant: "default" |  |
| `AlertDialogCancel` | button | label | label: "Cancel", variant: "outline" |  |
| `AlertTitle` | text | content |  |  |
| `AspectRatio` | zstack |  |  | Use with .aspectRatio(16/9, contentMode: .fill) |
| `Avatar` | avatar | name |  | Avatar("Shad CN", image: "…") — falls back to initials |
| `AvatarFallback` | avatar | name |  |  |
| `Badge` | badge | text | variant: "default" | Badge("New", variant: .secondary) |
| `Breadcrumb` | breadcrumb | items |  |  |
| `Button` | button | label | variant: "default" | Button("Save", variant: .outline, size: .sm) · size default/sm/lg/icon · systemImage: lucide name |
| `ButtonGroup` | toolbar |  | variant: "group" | Joined outline buttons |
| `Calendar` | calendar |  |  | Calendar(selection: "2026-11-23") · range: [start, end] |
| `Card` | card | title |  | Card("Title", description: "…") { content } footer: { … } action: { … } |
| `CardAction` | hstack |  |  | Top-right header action |
| `CardContent` | vstack |  | alignment: "stretch" | Card body |
| `CardDescription` | text | content |  | Muted card description |
| `CardFooter` | hstack |  |  | Card footer row |
| `CardHeader` | vstack |  | alignment: "leading", spacing: 6 | Title + description column |
| `CardTitle` | text | content |  | Card title (leading-none font-semibold) |
| `Carousel` | hstack |  | spacing: 16 |  |
| `CarouselContent` | hstack |  | spacing: 16 |  |
| `CarouselItem` | card | title |  |  |
| `CarouselNext` | button |  | iconOnly: true, systemImage: "arrow-right", variant: "outline" |  |
| `CarouselPrevious` | button |  | iconOnly: true, systemImage: "arrow-left", variant: "outline" |  |
| `Chart` | chart |  |  | Chart(kind: .area/.bar/.line/.pie/.donut, values:, series:, labels:) — chart-1…5 |
| `ChartContainer` | chart |  |  |  |
| `Checkbox` | checkbox | label |  | Checkbox("Accept terms", checked: true) |
| `Collapsible` | accordion | title |  |  |
| `Combobox` | select | placeholder | trailingIcon: "chevrons-up-down" | Popover + Command pattern; trigger is an outline button with chevrons-up-down |
| `Command` | menu |  |  | Command { CommandInput(…); CommandGroup("Suggestions") { CommandItem(…) } } |
| `CommandDialog` | dialog |  | variant: "command" | A Command palette in a modal |
| `CommandEmpty` | text | content |  |  |
| `CommandGroup` | section | title |  | CommandGroup("Settings") { … } (heading:) |
| `CommandInput` | textfield | placeholder | kind: "search" |  |
| `CommandItem` | menuitem | label |  | CommandItem("Profile", systemImage: "user", shortcut: "⌘P") |
| `CommandList` | group |  |  |  |
| `CommandSeparator` | divider |  |  |  |
| `ContextMenu` | menu |  |  | An open context menu (standalone popup); place it with .offset |
| `ContextMenuCheckboxItem` | menuitem | label | checked: false |  |
| `ContextMenuItem` | menuitem | label |  |  |
| `ContextMenuLabel` | text | content |  |  |
| `ContextMenuSeparator` | divider |  |  |  |
| `DataTable` | table |  | selectable: true | Bordered table with row selection; toolbar: { … } footer: { … } · sortColumn: |
| `DatePicker` | datepicker | label | placeholder: "Pick a date" | Outline button with a calendar icon; selection: "2026-11-23" |
| `Dialog` | dialog | title | closable: true | Dialog("Edit profile", description: "…") { body } footer: { Button("Save changes") } |
| `DialogClose` | button | label | label: "Close", variant: "outline" |  |
| `Drawer` | dialog | title | variant: "sheet" | Bottom drawer (Vaul) with a drag handle |
| `DropdownMenu` | menu | label | variant: "outline" | DropdownMenu("Open", open: true) { DropdownMenuLabel(…); DropdownMenuItem(…) } · trigger: { … } |
| `DropdownMenuCheckboxItem` | menuitem | label | checked: false |  |
| `DropdownMenuContent` | group |  |  |  |
| `DropdownMenuGroup` | group |  |  |  |
| `DropdownMenuItem` | menuitem | label |  | systemImage:, shortcut: "⇧⌘P", destructive: true |
| `DropdownMenuLabel` | text | content |  |  |
| `DropdownMenuRadioItem` | menuitem | label | checked: false |  |
| `DropdownMenuSeparator` | divider |  |  |  |
| `DropdownMenuShortcut` | text | content |  |  |
| `DropdownMenuSub` | menuitem | label |  |  |
| `Empty` | vstack |  | spacing: 12 |  |
| `Field` | vstack |  | alignment: "stretch", spacing: 8 | Field { FieldLabel; Input; FieldDescription } |
| `FieldDescription` | text | content |  |  |
| `FieldGroup` | vstack |  | alignment: "stretch", spacing: 24 |  |
| `FieldLabel` | text | content |  |  |
| `FieldLegend` | text | content |  |  |
| `FieldSeparator` | divider | label |  |  |
| `FieldSet` | vstack |  | alignment: "stretch", spacing: 16 |  |
| `Form` | form |  |  |  |
| `FormDescription` | text | content |  |  |
| `FormItem` | vstack |  | alignment: "stretch", spacing: 8 |  |
| `FormLabel` | text | content |  |  |
| `FormMessage` | text | content |  |  |
| `HoverCard` | card | title |  | Floating preview card (w-64) |
| `Input` | textfield | placeholder |  | Input("m@example.com", label: "Email", text:, description:, type: .password) |
| `InputGroup` | textfield | placeholder |  | Input with leading icon (systemImage:) / prefix: / suffix: |
| `InputOTP` | segmented | items |  | InputOTP(items: ["1", "2", "", …], selection: 2) — one slot per item, the selected one focused |
| `Item` | listitem | title |  | Item("Title", description:, systemImage:) { actions } |
| `Kbd` | text | content |  | Kbd("⌘K") |
| `KbdGroup` | hstack |  | spacing: 4 |  |
| `Label` | label | title |  | Form label (text-sm font-medium) |
| `Menubar` | toolbar |  |  | Menubar { MenubarMenu("File", open: true) { MenubarItem(…) } … } |
| `MenubarCheckboxItem` | menuitem | label | checked: false |  |
| `MenubarItem` | menuitem | label |  |  |
| `MenubarMenu` | menu | label | caret: false, variant: "ghost" |  |
| `MenubarSeparator` | divider |  |  |  |
| `MenubarShortcut` | text | content |  |  |
| `NativeSelect` | select | placeholder |  |  |
| `NavigationMenu` | toolbar |  |  | NavigationMenu { NavigationMenuItem("Getting started") { … }; NavigationMenuLink("Docs") } |
| `NavigationMenuItem` | menu | label | variant: "ghost" |  |
| `NavigationMenuLink` | button | label | variant: "ghost" |  |
| `Pagination` | pagination |  |  | Pagination(count: 10, page: 2) — Previous / numbers / Next |
| `Popover` | card | title |  | Floating panel (w-72 p-4 shadow-md); position it with .offset or an overlay |
| `PopoverContent` | card | title |  |  |
| `Progress` | progress | value |  | Progress(value: 60) of 100 |
| `RadioGroup` | radiogroup | label |  | RadioGroup(selection: "Comfortable") { RadioGroupItem("Default") … } |
| `RadioGroupItem` | radio | label |  |  |
| `ResizableHandle` | divider |  |  | Drag handle between panels (drawn withHandle) |
| `ResizablePanel` | vstack |  | alignment: "stretch", spacing: 0 |  |
| `ResizablePanelGroup` | hstack |  | alignment: "stretch", spacing: 0 | ResizablePanelGroup { ResizablePanel { … }; ResizableHandle(); ResizablePanel { … } } |
| `ScrollArea` | scroll | axes |  |  |
| `Select` | select | placeholder |  | Select("Theme", selection: "Dark") { SelectItem("Light") … } · open: true shows SelectContent |
| `SelectGroup` | group |  |  |  |
| `SelectItem` | menuitem | label |  |  |
| `SelectLabel` | text | content |  |  |
| `Separator` | divider |  |  | Horizontal, or vertical inside an HStack |
| `Sheet` | dialog | title | closable: true, placement: "right", variant: "drawer" | Side panel; .side(.left/.right/.top/.bottom) |
| `Sidebar` | sidebar | title |  | Sidebar(variant: .inset) { SidebarGroup("Platform") { SidebarMenuButton(…) } } header: { … } footer: { … } |
| `SidebarContent` | group |  |  |  |
| `SidebarFooter` | vstack |  | alignment: "stretch", spacing: 8 |  |
| `SidebarGroup` | section | title |  |  |
| `SidebarGroupLabel` | text | content |  |  |
| `SidebarHeader` | vstack |  | alignment: "stretch", spacing: 8 |  |
| `SidebarInset` | vstack |  | alignment: "stretch", spacing: 0 |  |
| `SidebarMenu` | group |  |  |  |
| `SidebarMenuBadge` | badge | text |  |  |
| `SidebarMenuButton` | navitem | label |  | SidebarMenuButton("Dashboard", systemImage: "layout-dashboard", selected:) |
| `SidebarMenuItem` | navitem | label |  |  |
| `SidebarMenuSub` | group |  |  |  |
| `SidebarMenuSubItem` | navitem | label |  |  |
| `SidebarProvider` | hstack |  | alignment: "stretch", spacing: 0 | App shell: SidebarProvider { Sidebar(…); SidebarInset { … } } |
| `SidebarSeparator` | divider |  |  |  |
| `SidebarTrigger` | button |  | iconOnly: true, size: "icon", systemImage: "panel-left", variant: "ghost" |  |
| `Skeleton` | shape |  | shape: "rounded" | Skeleton().frame(width: 250, height: 16) · shape: .circle |
| `Slider` | slider |  |  | Slider(value: 50, in: 0...100) · value: [25, 75] for a range |
| `Sonner` | toast | message | position: "bottom-right" | Sonner("Event has been created") — message: { … } for title + description; action: "Undo" |
| `Spinner` | progress |  | variant: "spinner" |  |
| `Switch` | toggle | label |  | Switch("Airplane Mode", isOn: true, description:) |
| `Table` | table |  |  | Table(columns: ["Invoice", …], rows: [[…]]) or TableRow children |
| `TableCell` | text | content |  |  |
| `TableHead` | tablecolumn | title |  |  |
| `TableRow` | tablerow |  |  |  |
| `Tabs` | tabs | items | placement: "top" | Tabs(selection: "Account") { TabsContent("Account") { … } TabsContent("Password") { … } } |
| `TabsContent` | tab | label |  |  |
| `TabsTrigger` | tab | label |  |  |
| `Textarea` | textfield | placeholder | kind: "multiline" | Textarea("Type your message here.", rows: 4) |
| `Toast` | toast | message | position: "bottom-right" |  |
| `Toaster` | toast | message | position: "bottom-right" |  |
| `Toggle` | toggle | label | variant: "button" | Pressable toggle button: Toggle("B", isOn: true) or Toggle { Image(systemName:) } |
| `ToggleGroup` | segmented | items |  | ToggleGroup(items: ["B", "I", "U"], selection: "B") or ToggleGroupItem children |
| `ToggleGroupItem` | label | title |  | ToggleGroupItem("Bold") or (systemImage:) |
| `Tooltip` | tooltip | text |  | Tooltip("Add to library") { Button(…) } · placement: |
| `TypographyBlockquote` | text | content |  |  |
| `TypographyH1` | text | content | style: "h1" |  |
| `TypographyH2` | text | content | style: "h2" |  |
| `TypographyH3` | text | content | style: "h3" |  |
| `TypographyH4` | text | content | style: "h4" |  |
| `TypographyInlineCode` | text | content |  |  |
| `TypographyLarge` | text | content | style: "large" |  |
| `TypographyLead` | text | content | style: "lead" |  |
| `TypographyMuted` | text | content | style: "muted" |  |
| `TypographyP` | text | content | style: "p" |  |
| `TypographySmall` | text | content | style: "small" |  |

<!-- end catalogue: shadcn -->

## Revision history

| Version | Date | Change |
|---|---|---|
| 0.2.0 | 2026-11-24 | Page created |
| 0.2.1 | 2026-11-24 | Pack table and element catalogues generated from the shipped packs |
