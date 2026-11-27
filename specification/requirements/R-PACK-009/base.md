---
id: R-PACK-009
title: The core vocabulary
status: active
version: 0.2.0
rev: 0
page: PACK.1
slot: reqs
order: 9
source: [SRC-2, SRC-3]
realizes: [F-3]
constrained_by: [A-PACK-2]
decisions: [ADR-4]
reverse_engineered: true
hash: 9aafc62b9698
---

C1: The `base` pack MUST define the core vocabulary inherited by every pack: layout (`VStack`, `HStack`, `ZStack`, `LazyVStack`, `LazyHStack`, `Grid`, `GridRow`, `LazyVGrid`, `LazyHGrid`, `ScrollView`, `Group`, `Spacer`, `Divider`), shapes and colour (`Rectangle`, `RoundedRectangle`, `Circle`, `Capsule`, `Ellipse`, `Color`), content (`Text`, `Label`, `Image`, `AsyncImage`, `Icon`, `Avatar`, `Badge`, `Chip`, `Tag`, `Link`, `ProgressView`, `Gauge`, `Rating`, `Placeholder`, `Chart`), controls (`Button`, `IconButton`, `FloatingActionButton`, `Toggle`, `Checkbox`, `RadioButton`, `RadioGroup`, `TextField`, `SecureField`, `TextEditor`, `SearchField`, `Picker`, `SegmentedControl`, `Slider`, `Stepper`, `DatePicker`, `Calendar`, `Dropzone`), navigation (`NavigationStack`, `NavigationView`, `NavigationSplitView`, `TabView`, `Tab`, `Tabs`, `AppBar`, `Sidebar`, `NavItem`, `Breadcrumb`, `Pagination`, `Steps`), containers (`Card`, `GroupBox`, `Section`, `List`, `Row`, `ListItem`, `NavigationLink`, `LabeledContent`, `Form`, `Table`, `TableRow`, `TableColumn`, `Toolbar`, `ToolbarItem`, `ToolbarItemGroup`, `ControlGroup`, `DisclosureGroup`, `Accordion`) and overlays (`Dialog`, `Alert`, `Sheet`, `Menu`, `MenuItem`, `Tooltip`, `Toast`, `Banner`).
C2: The `base` pack MUST map the SwiftUI style modifiers `buttonStyle`, `listStyle`, `pickerStyle`, `toggleStyle`, `textFieldStyle`, `datePickerStyle`, `tabViewStyle`, `progressViewStyle`, `gaugeStyle`, `menuStyle`, `formStyle`, `groupBoxStyle` and `navigationSplitViewStyle` to the `variant` attribute, `controlSize` to `size`, `buttonBorderShape` to `shape`, `labelStyle` to `labelStyle`, and the generic modifiers `variant`, `size`, `severity`, `state`, `selected`, `disabled`, `badge`, `elevation`, `density`, `expanded`, `open` and `color` to the attribute of the same name.
C3: The `base` pack MUST declare the modules `Wireframe` and `Mockitdown`, default to the `desktop` device and draw no chrome.
V1: `mockitdown elements base` lists exactly the 90 core elements.
<!-- file: prose.md -->
The core vocabulary is SwiftUI's own names plus the cross-framework components SwiftUI lacks
(`Card`, `Chip`, `Breadcrumb`, `Table`, `Toast` …). A block written with it renders in every pack —
which is what makes imported component libraries portable (F-4.C6).
