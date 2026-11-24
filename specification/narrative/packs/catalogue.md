---
title: Pack catalogue
spec_version: 0.1.0
status: draft
updated: 2026-11-24
page_id: PACK.2
---

# Pack catalogue

The packs mockitdown ships (R-PACK-008, ADR-13) and, for each, its element catalogue. The core
vocabulary (R-PACK-009) is available in every pack; framework packs add their native components
and restyle everything. Framework packs are listed by kind — desktop, web, mobile — and retro
packs in chronological order. The rendered
gallery of every element is in the [Reference](https://bbogovich.github.io/mockitdown/demos/reference/)
section of the published site (R-PACK-012).

<!-- packs-table -->
| Pack id | Imitates | Version followed | Default device · chrome | Selected by | Own elements |
|---|---|---|---|---|---|
| `android` | Jetpack Compose · Material 3 Expressive (baseline scheme) | Compose Material 3 1.4 · Android 16 | phone · android | `pack="android"`, `import Android`, `import JetpackCompose`, `import Compose`, `import Material3` | 118 |
| `angular-material` | Angular Material · Material 3 (azure theme) | Angular Material 20 | desktop · browser | `pack="angular-material"`, `import AngularMaterial`, `import Angular` | 93 |
| `antd` | Ant Design (antd) + ProComponents · React, default token theme | v5 | desktop · browser | `pack="antd"`, `import Antd`, `import AntDesign`, `import ProComponents` | 150 |
| `aqua` | Mac OS X Aqua, early era (10.0 Cheetah – 10.2 Jaguar, Cocoa / Carbon) | Mac OS X 10.2 | desktop · window | `pack="aqua"`, `import Aqua`, `import MacOSX`, `import Cheetah`, `import Jaguar` | 73 |
| `avalonia` | Avalonia UI 11 · FluentTheme (cross-platform .NET desktop apps) | Avalonia 11.3 | desktop · windows | `pack="avalonia"`, `import Avalonia`, `import AvaloniaUI`, `import Avalonia.Controls`, `import Avalonia.Themes.Fluent` | 96 |
| `base` | Neutral wireframe (the portable core every pack extends) | 1 | desktop · none | `pack="base"`, `import Wireframe`, `import Mockitdown` | 134 |
| `bootstrap` | Bootstrap 5.3 (as used directly or through React-Bootstrap / ng-bootstrap), default theme | 5.3 | desktop · browser | `pack="bootstrap"`, `import Bootstrap`, `import ReactBootstrap` | 85 |
| `carbon` | IBM Carbon Design System v11 · @carbon/react, White theme (light) and g100 (dark); g10 / g90 zones via Theme | 11 | desktop · browser | `pack="carbon"`, `import Carbon`, `import CarbonReact` | 148 |
| `cde` | Common Desktop Environment 1.x on Solaris 2.6–9 · Motif 1.2/2.1 · dtwm | CDE 1.3–1.5 (Solaris default palette) | desktop · window | `pack="cde"`, `import CDE`, `import Motif`, `import Solaris` | 52 |
| `fluent` | Fluent 2 · WinUI 3 (Windows 11 desktop apps) | Windows App SDK 1.8 | desktop · windows | `pack="fluent"`, `import WinUI`, `import FluentUI`, `import Fluent`, `import WindowsAppSDK`, `import Microsoft.UI.Xaml` | 108 |
| `gsos` | Apple IIgs GS/OS System 6 Finder (super hi-res 640 mode, 1988–1993) | System 6.0.1 | desktop · window | `pack="gsos"`, `import GSOS`, `import AppleIIgs`, `import IIgs` | 38 |
| `gtk` | GTK 4 with libadwaita and the Adwaita stylesheet (GNOME 48/49) | GTK 4.18 · libadwaita 1.7/1.8 | desktop · gnome | `pack="gtk"`, `import Gtk`, `import Adwaita`, `import Libadwaita`, `import GNOME` | 107 |
| `kde-plasma` | KDE Plasma 6 apps · Kirigami (KF6) and Qt Widgets · Breeze style, Breeze Light / Breeze Dark colours | Plasma 6.2 · KDE Frameworks 6 | desktop · kde | `pack="kde-plasma"`, `import KDE`, `import Plasma`, `import Breeze`, `import Kirigami`, `import KF6` | 113 |
| `lisa` | Apple Lisa Office System (Lisa 7/7), 1983 – 1985, 1-bit | Office System 3.1 | desktop · none | `pack="lisa"`, `import Lisa`, `import LisaOffice` | 39 |
| `mac-classic` | Classic Macintosh system software, System 1 – System 6 (1984 – 1991), 1-bit | System 6.0.8 | desktop · none | `pack="mac-classic"`, `import MacClassic`, `import System6`, `import Macintosh` | 45 |
| `macos9` | Mac OS 8 / 9 Platinum appearance (Appearance Manager, 1997–2001) | Mac OS 9.2 | desktop · window | `pack="macos9"`, `import MacOS9`, `import Platinum`, `import MacOS8` | 54 |
| `mui` | Material UI (MUI Core + MUI X) · React, default theme | v9 | desktop · browser | `pack="mui"`, `import MaterialUI`, `import MUI` | 116 |
| `nextstep` | NeXTSTEP 3.x Application Kit / OPENSTEP 4 · Workspace Manager (1989–1997) | NeXTSTEP 3.3 | desktop · window | `pack="nextstep"`, `import NeXTSTEP`, `import AppKitNeXT`, `import OpenStep` | 78 |
| `nls` | oN-Line System, SRI Augmentation Research Center — as shown at the Fall Joint Computer Conference, 9 December 1968 | NLS on the SDS 940, 1968 | desktop · none | `pack="nls"`, `import NLS`, `import OnLineSystem`, `import ARC` | 30 |
| `prime` | PrimeVue 4 / PrimeNG 18+ / PrimeReact (styled mode) · Aura theme preset | PrimeVue 4 · @primeuix/themes Aura | desktop · browser | `pack="prime"`, `import PrimeVue`, `import PrimeNG`, `import PrimeReact`, `import Prime` | 123 |
| `primer` | GitHub Primer · Primer React components and Primer CSS, primitives light/dark default themes | Primer React 37 · Primer Primitives 10 | desktop · browser | `pack="primer"`, `import Primer`, `import PrimerReact`, `import GitHub` | 140 |
| `qt` | Qt 6 Widgets · Fusion style (cross-platform default palette) | Qt 6.8 | desktop · windows | `pack="qt"`, `import Qt`, `import QtWidgets`, `import Qt6`, `import PySide`, `import PyQt` | 76 |
| `sapui5` | SAPUI5 / OpenUI5 · SAP Fiori Horizon theme (sap_horizon, sap_horizon_dark) | 1.136 | desktop · browser | `pack="sapui5"`, `import SAPUI5`, `import OpenUI5`, `import UI5`, `import Fiori`, `import sap.m`, `import sap.f`, `import sap.uxap`, `import sap.tnt` | 128 |
| `shadcn` | shadcn/ui · new-york style, neutral base (Radix primitives, Tailwind CSS v4) | shadcn 3 · Tailwind CSS 4 | desktop · browser | `pack="shadcn"`, `import Shadcn`, `import ShadcnUI`, `import Radix` | 154 |
| `sketch` | Hand-drawn wireframe sketch of the neutral core (paper and pencil, one highlighter) | 1 | desktop · browser | `pack="sketch"`, `import Sketch`, `import HandDrawn`, `import Napkin` | 8 |
| `swiftui` | SwiftUI · iOS 26, iPadOS 26, macOS 26 (Liquid Glass) | iOS 26 SDK | phone · ios | `pack="swiftui"`, `import SwiftUI` | 86 |
| `tailwind` | Catalyst — the Tailwind Plus application UI kit (Headless UI + Tailwind CSS v4), zinc neutrals, plus Tailwind Plus marketing sections | Catalyst 2025 · Tailwind CSS 4.1 | desktop · browser | `pack="tailwind"`, `import Tailwind`, `import TailwindPlus`, `import TailwindCatalyst` | 107 |
| `vista` | Windows Vista / Windows 7 · Aero Glass (common controls v6, Explorer, Task Dialog, UAC) | Windows Vista (2007) – Windows 7 (2009) | desktop · window | `pack="vista"`, `import WindowsVista`, `import Vista`, `import Aero`, `import Windows7` | 78 |
| `vuetify` | Vuetify 3 · Vue 3, default theme (Material Design 2 blueprint) | 3.x | desktop · browser | `pack="vuetify"`, `import Vuetify`, `import Vue` | 141 |
| `win1` | Microsoft Windows 1.01–1.04 (1985–87), tiled windows, EGA 16 colours / CGA monochrome | Windows 1.03 | desktop · window | `pack="win1"`, `import Windows1`, `import Win1`, `import Windows101`, `import MSDOSExecutive1` | 53 |
| `win2` | Microsoft Windows 2.0 / 2.1 (1987–88), EGA/VGA 16 colours | Windows 2.11 | desktop · window | `pack="win2"`, `import Windows2`, `import Win2`, `import MSDOSExecutive` | 43 |
| `win31` | Windows 3.1 / Windows for Workgroups 3.11 (Win16, Windows Default colour scheme) | 3.11 | desktop · win31 | `pack="win31"`, `import Windows31`, `import Win31`, `import Win16` | 85 |
| `win95` | Windows 95 · Win32 shell and common controls (Windows Standard colour scheme) | Windows 95 (1995) | desktop · window | `pack="win95"`, `import Windows95`, `import Win95`, `import Win32` | 63 |
| `winxp` | Windows XP · Luna Blue visual style (Win32 common controls v6, shell) | Windows XP (2001) | desktop · window | `pack="winxp"`, `import WindowsXP`, `import WinXP`, `import Luna` | 69 |
| `xerox-star` | Xerox 8010 Information System “Star” (1981), 1-bit bitmapped display | ViewPoint precursor, Star 1981 | desktop · window | `pack="xerox-star"`, `import XeroxStar`, `import Star8010`, `import Xerox` | 27 |
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

## sketch — Wireframe sketch (hand-drawn)

<!-- catalogue: sketch — generate with `mockitdown elements sketch --markdown --own` -->

| Element | Role | Arguments | Defaults | Notes |
|---|---|---|---|---|
| `Annotation` | stickynote | text | variant: "left" | Handwritten margin note in the highlighter colour with an arrow: Annotation("tap to edit", variant: .up); place with .position(x:y:) |
| `Arrow` | divider | label | variant: "right" | A pencil arrow between screens or boxes in a flow, optional label: Arrow("tap"), Arrow(variant: .down) |
| `CrossedImage` | placeholder | label |  | A box with a big pencil X for an image still to come: CrossedImage("hero shot", height: 180) |
| `Highlight` | text | content |  | Text swiped with the highlighter marker: Highlight("Free for 30 days") |
| `Lorem` | text | content | content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore." | Filler copy in the handwriting font: Lorem() or Lorem("short custom filler") |
| `Note` | stickynote | text |  | A taped paper note (slightly rotated): Note("ask legal", title: "TODO", author: "BB", rotation: 2) |
| `Scribble` | skeleton |  | lines: 3 | Squiggle lines standing in for body text: Scribble(lines: 4) · avatar:, image: add a crossed box |
| `Squiggle` | skeleton |  | lines: 1 | One squiggle line (a heading or label still to be written) |

<!-- end catalogue: sketch -->

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

## gtk — GTK 4 (libadwaita)

<!-- catalogue: gtk — generate with `mockitdown elements gtk --markdown --own` -->

| Element | Role | Arguments | Defaults | Notes |
|---|---|---|---|---|
| `AboutDialog` | dialog | title | variant: "about" | AboutDialog(applicationName:, developerName:, applicationIcon:) { rows } |
| `ActionBar` | toolbar |  | variant: "actionbar" | ActionBar { start … Spacer() … end } — bottom bar |
| `ActionRow` | listitem | title |  | ActionRow("Title", subtitle:, icon:, chevron: true) { suffix widgets } |
| `AlertDialog` | dialog | title | variant: "alert" | AlertDialog("Delete Notes?", body:, responses: ["Cancel", "Delete"], defaultResponse: "Delete", destructive: "Delete") |
| `ApplicationWindow` | vstack |  | alignment: "stretch", spacing: 0 | Adw.ApplicationWindow — the window content; put a ToolbarView or a split view inside |
| `Avatar` | avatar | name |  | Avatar("Ana Lima", size: .large, image:) — Adwaita gradient colours |
| `Banner` | alert | title | showIcon: false | Banner("Title", actions: { Button("Restart") }) — the strip under a HeaderBar |
| `Bin` | group |  |  | A single-child container |
| `BottomSheet` | dialog | title | variant: "sheet" | Adw.BottomSheet (1.6) |
| `Box` | vstack |  | alignment: "stretch" | Box(orientation: .horizontal, spacing: 6) { … } · .variant(.linked) joins buttons |
| `BoxedList` | list |  | variant: "boxedList" | ListBox styled .boxed-list — rows in a rounded card |
| `BreakpointBin` | group |  |  |  |
| `Button` | button | label |  | Button("Save", icon:) · .variant(.suggested / .destructive / .flat / .pill / .circular / .osd) |
| `ButtonRow` | listitem | title |  | ButtonRow("Add Account", icon:) · .variant(.suggested / .destructive) — 1.6 |
| `Calendar` | calendar |  |  | Calendar(selection: "2026-11-24", marked: […]) |
| `Carousel` | scroll |  | axes: "horizontal" | Carousel { pages } — horizontal pages |
| `CarouselIndicatorDots` | pagination |  | variant: "dots" | CarouselIndicatorDots(pages: 4, position: 2) |
| `CarouselIndicatorLines` | pagination |  | variant: "lines" |  |
| `CenterBox` | hstack |  |  | start / center / end widgets in a row |
| `CheckButton` | checkbox | label |  | CheckButton("Label", active: true) |
| `Clamp` | vstack |  | alignment: "stretch" | Clamp { … } — limits its child to 600 px (maximumSize:) and centres it |
| `ClampScrollable` | vstack |  | alignment: "stretch" |  |
| `ColorDialogButton` | swatches |  |  | colors: [..], selection: |
| `ColumnView` | table |  |  | ColumnView(columns: ["Name", "Size"], rows: [[…]]) — Gtk.ColumnView data table |
| `ColumnViewColumn` | tablecolumn | title |  |  |
| `ComboRow` | listitem | title | chevron: true | ComboRow("Title", subtitle:, selected: "Current value") |
| `Dialog` | dialog | title |  | Adw.Dialog("Title") { ToolbarView … } |
| `DropDown` | select | label |  | DropDown(model: ["A", "B"], selected: "A", open:) |
| `EditableLabel` | textfield | text |  |  |
| `Entry` | textfield | placeholder |  | Entry("Placeholder", text:, icon:) · .state(.focused / .error) |
| `EntryRow` | textfield | title |  | EntryRow("Title", text:) — the title floats above the text |
| `ExpanderRow` | accordion | title |  | ExpanderRow("Title", subtitle:, expanded: true) { nested rows } |
| `FlowBox` | grid |  | columns: 4 | FlowBox(columns: 5) { FlowBoxChild … } |
| `FlowBoxChild` | vstack |  |  |  |
| `FontDialogButton` | button | label | variant: "font" |  |
| `Frame` | card | title |  | Gtk.Frame — a bordered box |
| `GridView` | grid |  | columns: 5 | GridView(columns: 6) { … } — Nautilus-style icon grid |
| `HeaderBar` | appbar | title | kind: "window" | HeaderBar("Title", subtitle:, start: { … }, titleWidget: { ViewSwitcher }) { end widgets } — draws the window close button; showEndTitleButtons: false for inner panes |
| `InlineViewSwitcher` | segmented | items |  | Adw.InlineViewSwitcher (1.7) — items:, selection: |
| `Label` | text | content |  | Label("Text", style: .title1 / .title2 / .title3 / .title4 / .heading / .caption / .captionHeading / .largeTitle) · .class("dim-label") |
| `LevelBar` | progress | label | variant: "levelbar" | LevelBar(value: 0.7) · .color(.warning / .error / .success) for the low/high offsets |
| `LinkButton` | link | label, destination |  | LinkButton("Website", uri:) |
| `ListBox` | list |  |  | ListBox { rows } · .variant(.boxedList / .navigationSidebar / .richList) |
| `ListBoxRow` | listitem | title |  |  |
| `ListView` | list |  |  |  |
| `MenuButton` | menu | label |  | MenuButton(icon: "open-menu", open: true) { MenuItem … } |
| `MenuItem` | menuitem | label |  | MenuItem("Preferences", shortcut: "Ctrl+,", checked:) |
| `MessageDialog` | dialog | title | variant: "alert" |  |
| `NavigationPage` | vstack | title | alignment: "stretch", spacing: 0 | NavigationPage("Title") { ToolbarView { … } } |
| `NavigationSidebar` | sidebar | title |  | ListBox.navigation-sidebar — NavigationSidebar(selection:) { SidebarItem("Wi-Fi", icon:) … } |
| `NavigationSplitView` | split |  |  | NavigationSplitView { sidebar page } content: { content page } |
| `NavigationView` | vstack |  | alignment: "stretch", spacing: 0 | Navigation stack — shows its (top) page |
| `Overlay` | zstack |  |  |  |
| `OverlaySplitView` | split |  |  | OverlaySplitView { sidebar } content: { … } |
| `Paned` | split |  |  | Paned { start } content: { end } |
| `PasswordEntry` | textfield | placeholder | kind: "password", reveal: true |  |
| `PasswordEntryRow` | textfield | title | kind: "password", reveal: true | PasswordEntryRow("Password", text:) |
| `PathBar` | breadcrumb | items |  | Nautilus path bar: PathBar(["Home", "Projects"]) |
| `Picture` | image | name |  |  |
| `Popover` | card | title | variant: "popover" | A popover surface; place it with .overlay(alignment:) |
| `PopoverMenu` | menu | label |  | PopoverMenu { MenuItem … } — an open menu popover |
| `PreferencesDialog` | dialog | title | variant: "preferences" | PreferencesDialog("Preferences") { PreferencesPage … } |
| `PreferencesGroup` | section | title |  | PreferencesGroup("Title", description:) { rows } headerSuffix: { Button } |
| `PreferencesPage` | form | title |  | PreferencesPage { PreferencesGroup … } — clamped, scrolling page of groups |
| `PreferencesWindow` | vstack |  | alignment: "stretch", spacing: 0 | Preferences window (deprecated; use PreferencesDialog) |
| `ProgressBar` | progress | label |  | ProgressBar(fraction: 0.6, showText:) — none = pulsing |
| `RadioButton` | radio | label |  | CheckButton in a group — RadioButton("Label", active: true) |
| `Revealer` | group |  |  |  |
| `Scale` | slider | label |  | Scale(value: 40, in: 0...100, marks: …) |
| `ScrolledWindow` | scroll | axes |  | Scrolling region (static) |
| `SearchBar` | toolbar |  | variant: "searchbar" | SearchBar { SearchEntry(…) } — revealed under the HeaderBar |
| `SearchEntry` | textfield | placeholder | kind: "search" | SearchEntry("Search", text:) |
| `Separator` | divider |  |  |  |
| `ShortcutLabel` | kbd | keys |  | ShortcutLabel(["Ctrl", "S"]) |
| `SidebarItem` | navitem | label |  | SidebarItem("Wi-Fi", icon: "network-wireless", badge:) · .selected() |
| `SourceView` | code | code |  | GtkSourceView 5 — SourceView("…", language: "python", lineNumbers:, highlight:) |
| `SpinButton` | stepper | label |  | SpinButton(value: 4) |
| `SpinRow` | stepper | title |  | SpinRow("Title", value: 4) |
| `Spinner` | progress |  | variant: "spinner" | Adw.Spinner — indeterminate |
| `SplitButton` | button | label | split: true | SplitButton("Open") — button + dropdown arrow |
| `Stack` | tabs |  | variant: "stack" | Stack(selection:) { StackPage("Name") { … } } — shows the selected page |
| `StackPage` | tab | title |  |  |
| `StackSwitcher` | segmented | items |  | StackSwitcher(items: ["A", "B"], selection: "A") — linked buttons |
| `StatusPage` | emptystate | title |  | StatusPage("No Results", icon: "system-search", description:) { Button(…).variant(.pill) } |
| `Statusbar` | toolbar |  | variant: "statusbar" |  |
| `Switch` | toggle | label |  | Switch(active: true) |
| `SwitchRow` | toggle | title |  | SwitchRow("Title", subtitle:, active: true) |
| `TabBar` | tabs | items | placement: "top", variant: "tabview" | TabBar(items: ["a.txt", "b.txt"], selection:) |
| `TabPage` | tab | title |  | TabPage("Title", icon:, badge:) { … } |
| `TabView` | tabs |  | placement: "top", variant: "tabview" | TabView(selection:) { TabPage("notes.md") { … } } — Adw tab bar + pages |
| `TextView` | textfield | text | kind: "multiline" | TextView(text:, rows:) — multi-line text area |
| `Toast` | toast | title |  | Toast("‘Report.pdf’ moved to trash", buttonLabel: "Undo") — floats at the bottom |
| `ToastOverlay` | group |  |  | Hosts toasts; put the content and a Toast inside |
| `ToggleButton` | button | label |  | ToggleButton("Bold", active: true) |
| `ToggleGroup` | segmented | items |  | Adw.ToggleGroup (1.7) — items:, selection: |
| `ToolbarView` | vstack |  | alignment: "stretch", spacing: 0 | ToolbarView { HeaderBar(…); content; bottom bar } — content between the bars fills the space |
| `TreeExpander` | treeitem | label |  |  |
| `TreeListView` | tree |  |  |  |
| `ViewStack` | tabs |  | variant: "stack" | ViewStack(selection:) { ViewStackPage("Albums", icon:) { … } } — the selected page only |
| `ViewStackPage` | tab | title |  | ViewStackPage("Albums", icon: "photo", badge: 3) { … } |
| `ViewSwitcher` | tabs |  | placement: "top", variant: "switcher" | ViewSwitcher(selection:) { ViewSwitcherItem("World", icon:) … } — wide switcher for a HeaderBar titleWidget |
| `ViewSwitcherBar` | tabs |  | placement: "bottom", variant: "switcherBar" | ViewSwitcherBar(selection:) { ViewSwitcherItem … } — the narrow/mobile bottom bar |
| `ViewSwitcherItem` | tab | title |  |  |
| `Viewport` | group |  |  |  |
| `Window` | vstack |  | alignment: "stretch", spacing: 0 | Adw.Window / Gtk.Window |
| `WindowTitle` | listitem | title, subtitle |  | WindowTitle("Document", "~/Notes") — title + subtitle for a HeaderBar titleWidget |
| `WrapBox` | hstack |  | spacing: 6, wrap: true | Adw.WrapBox (1.7) — wraps children onto lines |

<!-- end catalogue: gtk -->

## qt — Qt 6 (Fusion)

<!-- catalogue: qt — generate with `mockitdown elements qt --markdown --own` -->

| Element | Role | Arguments | Defaults | Notes |
|---|---|---|---|---|
| `Action` | menuitem | label |  | QAction("&Open…", icon:, shortcut: "Ctrl+O", checked:) — children make a submenu |
| `BasicColors` | swatches |  | variant: "basicColors" | QColorDialog basic-colour grid: colors: [..], selection: |
| `ButtonGroup` | radiogroup | label |  | Exclusive group of RadioButtons: items:, selection: |
| `CalendarWidget` | calendar |  | firstWeekday: 1 | QCalendarWidget(selectedDate: "2026-11-23") — highlight-coloured navigation bar |
| `CentralWidget` | vstack |  | alignment: "stretch", spacing: 6 | The main window's central widget; give it .frame(maxWidth: .infinity, maxHeight: .infinity) |
| `ChartView` | chart |  |  | QChartView(kind: .bar/.line/.pie/…, series:, labels:) — Qt Charts light/dark themes |
| `CheckBox` | checkbox | label |  | QCheckBox("Option", checked: true/.indeterminate) |
| `ColorDialog` | dialog | title | closable: true, variant: "colorDialog" | QColorDialog window |
| `ComboBox` | select | label |  | QComboBox(items: [..], currentText:, editable:) |
| `CommandLinkButton` | button | label | icon: "arrow.right", variant: "commandLink" | QCommandLinkButton("Install now") |
| `DateEdit` | datepicker | date | format: "numeric" | QDateEdit(date: "2026-11-23", calendarPopup: true) |
| `DateTimeEdit` | datepicker | dateTime | format: "numeric", kind: "datetime" | QDateTimeEdit(dateTime: "2026-11-23 14:30") |
| `Dial` | progress | value | kind: "circular" | QDial(value: 40, maximum: 100) |
| `Dialog` | dialog | title | closable: true | QDialog("Title") { … } actions: { DialogButtonBox… } — a window with its own title bar |
| `DialogButtonBox` | hstack |  | spacing: 6, variant: "buttonBox" | QDialogButtonBox { PushButton("OK", default: true); PushButton("Cancel") } — right-aligned |
| `DockWidget` | card | title | variant: "dock" | QDockWidget("Title") { … } — title bar with float and close buttons |
| `DoubleSpinBox` | textfield | value | kind: "spin" | QDoubleSpinBox(value: 1.50, suffix:) |
| `FileDialog` | dialog | title | closable: true, variant: "fileDialog" | QFileDialog window (compose its contents) |
| `FontComboBox` | select | label | selection: "Segoe UI" | QFontComboBox(currentText:) |
| `FontDialog` | dialog | title | closable: true, variant: "fontDialog" | QFontDialog window |
| `FormLayout` | form |  | variant: "formLayout" | QFormLayout { FormRow("Name:") { LineEdit() } } — labels right-aligned in the first column |
| `FormRow` | labeled | label |  | QFormLayout::addRow(label, field): FormRow("Name:") { LineEdit() } |
| `Frame` | vstack |  | alignment: "stretch", variant: "styledPanel" | QFrame(frameShape: .box/.panel/.styledPanel/.hLine/.vLine/.noFrame, frameShadow: .sunken/.raised/.plain) |
| `GridLayout` | grid |  |  | QGridLayout(columns: n) or GridRow children |
| `GroupBox` | card | title |  | QGroupBox("Title", checkable: true, checked: true) { … } — bold title above a rounded frame |
| `HBoxLayout` | hstack |  | spacing: 6 | QHBoxLayout: children left to right |
| `HeaderView` | segmented | items |  | QHeaderView(["Name", "Size"], selection: sorted section) |
| `InputDialog` | dialog | title | closable: true, variant: "inputDialog" | QInputDialog window |
| `KeySequenceEdit` | textfield | keySequence |  | QKeySequenceEdit(keySequence: "Ctrl+Shift+S") |
| `LCDNumber` | text | content | variant: "outline" | QLCDNumber("128.4", segmentStyle: .filled) |
| `Label` | label | title |  | QLabel("Text") (also icon:) |
| `LineEdit` | textfield | text |  | QLineEdit("text", placeholderText:, echoMode: .password, clearButtonEnabled:) |
| `ListView` | list |  |  | QListView { ListWidgetItem… } |
| `ListWidget` | list |  |  | QListWidget { ListWidgetItem("Item", icon:) … } — select with .selected() |
| `ListWidgetItem` | listitem | title |  | ListWidgetItem("Text", icon:, checked:) |
| `MainWindow` | vstack |  | alignment: "stretch", spacing: 0 | QMainWindow: stack MenuBar, ToolBar, the central area (DockWidgets + central widget in an HStack/Splitter) and StatusBar |
| `MdiArea` | canvas |  |  | QMdiArea: place MdiSubWindow children with .position(x:y:) |
| `MdiSubWindow` | card | title | variant: "mdi" | QMdiSubWindow("Title") { … } |
| `Menu` | menu | label | caret: false | QMenu: in a MenuBar a title (open: true shows it); without a label a standalone popup / context menu |
| `MenuBar` | toolbar |  | variant: "menuBar" | QMenuBar { Menu("&File") { Action… } } |
| `MessageBox` | dialog | title | closable: true, variant: "messageBox" | QMessageBox("Title", text:, icon: .warning/.information/.critical/.question, buttons: [..], primary:) { informative text } |
| `PlainTextEdit` | textfield | text | kind: "multiline", rows: 6 | QPlainTextEdit(plainText:) |
| `ProgressBar` | progress | value | showValue: true | QProgressBar(value: 64) — percentage in the bar; no value = busy |
| `ProgressDialog` | dialog | title | closable: true, variant: "progressDialog" | QProgressDialog window |
| `PushButton` | button | label |  | QPushButton("OK", default: true, icon:, checked:, flat:, menu:) |
| `RadioButton` | radio | label |  | QRadioButton("Option", checked: true) |
| `RubberBand` | marquee |  |  | QRubberBand: a selection rectangle (size with .frame, place with .position) |
| `ScrollArea` | scroll | axes |  | QScrollArea with Fusion scroll bars |
| `ScrollBar` | slider | value | orientation: "horizontal" | QScrollBar(value: 30, orientation: .horizontal) |
| `Separator` | divider |  |  | addSeparator() in menus and tool bars |
| `SizeGrip` | spacer |  | variant: "sizeGrip" | QSizeGrip |
| `Slider` | slider | value |  | QSlider(value: 40, minimum: 0, maximum: 100, tickPosition: .ticksBelow) |
| `SpinBox` | textfield | value | kind: "spin" | QSpinBox(value: 3, prefix:, suffix: " px") — up/down buttons at the right |
| `Splitter` | hstack |  | spacing: 0 | QSplitter(orientation: .horizontal/.vertical) — panes separated by a handle; size panes with .frame(width:) |
| `StackedLayout` | vstack |  | alignment: "stretch" |  |
| `StackedWidget` | vstack |  | alignment: "stretch" | QStackedWidget: holds the current page only |
| `StatusBar` | toolbar |  | variant: "statusBar" | QStatusBar { Label("Ready"); Spacer(); Label("Ln 1, Col 1") } — size grip at the right |
| `TabBar` | tabs | items | placement: "top", variant: "tabBar" | QTabBar(items: [..], selection:) |
| `TabWidget` | tabs |  | placement: "top", variant: "tabWidget" | QTabWidget(selection:) { Tab("General") { … } } — tabsClosable:, documentMode via .variant(.documentMode) |
| `TableView` | table |  | variant: "verticalHeader" | QTableView(columns:, rows:, selection:, sortColumn:) — .variant(.noVerticalHeader) hides row numbers |
| `TableWidget` | table |  | variant: "verticalHeader" | QTableWidget(columns: [..], rows: [[..]], selection: [row], alternatingRowColors:) — row numbers on the left |
| `TextBrowser` | textfield | text | kind: "multiline", rows: 6 | QTextBrowser(html:) — read-only rich text |
| `TextEdit` | textfield | text | kind: "multiline", rows: 6 | QTextEdit("rich text", rows:) — rich text editor |
| `TimeEdit` | datepicker | time | kind: "time" | QTimeEdit(time: "14:30") |
| `ToolBar` | toolbar |  | variant: "toolBar" | QToolBar { ToolButton(icon:) … Separator() } |
| `ToolBox` | vstack |  | alignment: "stretch", spacing: 0 | QToolBox { ToolBoxItem("Page", expanded: true) { … } } |
| `ToolBoxItem` | accordion | title |  | One QToolBox page: tab button + (expanded) contents |
| `ToolButton` | button | label | variant: "toolButton" | QToolButton("Save", icon: "document-save", toolButtonStyle: .textUnderIcon/.textBesideIcon/.iconOnly, checked:, popupMode:) |
| `ToolTip` | tooltip | text |  | QToolTip shown over its child |
| `TreeView` | tree |  |  | QTreeView { HeaderView([…]); TreeWidgetItem… } |
| `TreeWidget` | tree |  |  | QTreeWidget { HeaderView(["Name", "Size"]); TreeWidgetItem("src") { … } } |
| `TreeWidgetItem` | treeitem | label |  | TreeWidgetItem("Name", icon:, expanded:) { Text("col 2") … TreeWidgetItem(…) } — Text children are extra columns |
| `VBoxLayout` | vstack |  | alignment: "stretch", spacing: 6 | QVBoxLayout: children top to bottom |
| `Widget` | vstack |  | alignment: "leading" | QWidget: a plain container (vertical) |
| `Wizard` | dialog | title | closable: true, variant: "wizard" | QWizard window holding one WizardPage |
| `WizardPage` | card | title | variant: "wizardPage" | QWizardPage("Title", subtitle:) { … } — white header band |

<!-- end catalogue: qt -->

## avalonia — Avalonia UI 11 (Fluent theme)

<!-- catalogue: avalonia — generate with `mockitdown elements avalonia --markdown --own` -->

| Element | Role | Arguments | Defaults | Notes |
|---|---|---|---|---|
| `AccessText` | text | content |  |  |
| `AutoCompleteBox` | select | label | variant: "autocomplete" | AutoCompleteBox(text: "Lis", items: ["Lisbon", "Lismore"], isDropDownOpen: true, watermark:) |
| `Border` | vstack |  | alignment: "stretch" | A decorator: style with .padding / .background / .cornerRadius / .border |
| `Button` | button | label | variant: "default" | Button("Save", icon:) · classes: "accent" (Classes="accent") for the accent button |
| `ButtonSpinner` | textfield | text | kind: "number", trailingIcon: "chevron.up.down" |  |
| `Calendar` | calendar |  | showToday: true | Calendar(selectedDate: "2026-11-18") — today (Nov 23) has the accent fill, the selection an accent ring |
| `CalendarDatePicker` | datepicker | label | format: "numeric" | CalendarDatePicker(selectedDate: "2026-11-23", watermark:) — a TextBox with a calendar button |
| `Canvas` | canvas |  |  | Absolute positioning: place children with .position(x:y:) (Canvas.Left/Top) |
| `Carousel` | zstack |  |  | Carousel { current item } — one item at a time |
| `CartesianChart` | chart |  | kind: "line" | LiveCharts2 CartesianChart(kind: .line/.bar/.area, series:, labels:) |
| `CheckBox` | checkbox | label |  | CheckBox("Remember me", isChecked: true / .indeterminate) — IsThreeState shows the dash |
| `ColorPicker` | swatches | label | variant: "picker" | ColorPicker(colors: ["#0078d7"], selection: 0) — the drop-down button with its colour preview |
| `ColorSlider` | slider | label |  |  |
| `ColorSpectrum` | placeholder | label | systemImage: "sun" |  |
| `ColorView` | swatches | label |  | ColorView palette: colors: [..], selection: |
| `ComboBox` | select | label |  | ComboBox(items: ["S", "M"], selectedItem: "M", placeholderText:, isDropDownOpen: true) or ComboBoxItem children |
| `ComboBoxItem` | text | content |  |  |
| `ContentControl` | group |  |  | Hosts one piece of content |
| `ContentPresenter` | group |  |  |  |
| `ContextMenu` | menu |  |  | ContextMenu { MenuItem… } — an open popup (place it with .padding / .position) |
| `DataGrid` | table |  | variant: "dataGrid" | Avalonia.Controls.DataGrid(columns: [...], rows: [[...]], selected: [1]) or DataGrid*Column children |
| `DataGridCheckBoxColumn` | tablecolumn | title |  |  |
| `DataGridTemplateColumn` | tablecolumn | title |  |  |
| `DataGridTextColumn` | tablecolumn | title |  |  |
| `DatePicker` | datepicker | label | format: "long", variant: "fields" | DatePicker(selectedDate: "2026-11-23") — month · day · year segments |
| `Decorator` | group |  |  |  |
| `Dialog` | dialog | title | closable: true | A modal child Window (ShowDialog): Dialog("Title") { content } actions: { Button… } |
| `DockPanel` | vstack |  | alignment: "stretch", spacing: 0 | DockPanel { top docks… ; fill } — docked children in order; put a left/right dock and the fill in an HStack |
| `DropDownButton` | button | label | dropdown: true, variant: "default" | Button with a chevron that opens a Flyout |
| `Ellipse` | shape |  | shape: "ellipse" |  |
| `Expander` | accordion | header |  | Expander("Header", isExpanded: true) { content } |
| `Flyout` | card | title | variant: "flyout" | A light-dismiss popup surface; place with .overlay(alignment:) or .position |
| `Grid` | grid |  |  | Grid(columns: 3, spacing: 12) { … } — column count (ColumnDefinitions as a count), or GridRow children |
| `GridSplitter` | divider |  |  | A draggable divider between grid cells |
| `HeaderedContentControl` | section | header |  | HeaderedContentControl("Header") { content } |
| `HyperlinkButton` | button | label | variant: "hyperlink" | HyperlinkButton("Learn more", navigateUri:) — link-styled button |
| `Image` | image | name |  | Image("assets/images/photo-1.svg") or Image(source:) |
| `ItemsControl` | vstack |  | alignment: "stretch" | Repeats an item template: use ForEach inside |
| `ItemsRepeater` | vstack |  | alignment: "stretch" | Avalonia.Controls.ItemsRepeater: ForEach inside; .orientation(.horizontal) for a row |
| `Label` | text | content |  | Label("Name:") — a ContentControl caption for an input (Target:) |
| `LayoutTransformControl` | group |  |  |  |
| `ListBox` | list |  | variant: "listBox" | ListBox { ListBoxItem… } — selection uses the accent list brush; .selected() on an item |
| `ListBoxItem` | listitem | title |  | ListBoxItem("Title", subtitle:, detail:, icon:) or a custom item template as children |
| `MaskedTextBox` | textfield | text |  | MaskedTextBox(mask: "(000) 000-0000") — the mask shows when empty |
| `Menu` | toolbar |  | variant: "menubar" | Menu { MenuItem("File") … MenuBarItem("Edit", isSubMenuOpen: true) { MenuItem("Copy", inputGesture: "Ctrl+C") } } |
| `MenuBarItem` | menu | label | caret: false, variant: "menubar" | A top-level MenuItem of a Menu with its submenu (XAML writes MenuItem; this name lets it open: isSubMenuOpen: true) |
| `MenuFlyout` | menu | label |  | MenuFlyout { MenuItem… } — an open flyout; MenuFlyout("Sort", isOpen: true) { … } draws the DropDownButton that owns it |
| `MenuItem` | menuitem | label |  | MenuItem("Copy", icon:, inputGesture: "Ctrl+C", isChecked:) — children make a submenu; in a Menu bar a closed top-level item |
| `NotificationCard` | toast | title | inline: true, severity: "information" | NotificationCard("Saved", message:, type: .information/.success/.warning/.error) — put inside WindowNotificationManager |
| `NumericUpDown` | textfield | value | kind: "number", trailingIcon: "chevron.up.down" | NumericUpDown(value: 3, minimum:, maximum:, formatString:) — spinner on the right |
| `Panel` | zstack |  |  | Children overlap (Panel stacks them on top of each other) |
| `Path` | shape |  | shape: "rectangle" |  |
| `PathIcon` | icon | name |  | PathIcon("Settings") — a geometry icon (FluentIcons names work) |
| `PieChart` | chart |  | kind: "donut" | LiveCharts2 PieChart(values:, labels:) |
| `PolarChart` | chart |  | kind: "radar" | LiveCharts2 PolarChart(series:, labels:) |
| `Popup` | card | title | variant: "flyout" |  |
| `ProgressBar` | progress | label | total: 100 | ProgressBar(value: 60) — 0…100 (Maximum:); no value = indeterminate; showProgressText: true |
| `RadioButton` | radio | label |  | RadioButton("Small", isChecked: true, groupName:) |
| `Rectangle` | shape |  | shape: "rectangle" |  |
| `RefreshContainer` | vstack |  | alignment: "stretch" | Pull-to-refresh host; refreshing: true shows the visualizer |
| `RefreshVisualizer` | progress |  | kind: "circular" | The pull-to-refresh spinner |
| `RelativePanel` | zstack |  |  |  |
| `RepeatButton` | button | label | variant: "default" | Fires repeatedly while pressed |
| `ReversibleStackPanel` | vstack |  | alignment: "stretch" |  |
| `Run` | text | content |  |  |
| `ScrollViewer` | scroll | axes |  | Scrolling region (static; Fluent overlay scroll bars are hidden at rest) |
| `SelectableTextBlock` | text | content |  | Text the user can select and copy |
| `Separator` | divider |  |  | A horizontal rule (menus, stack panels) |
| `Slider` | slider | label |  | Slider(value: 40, minimum: 0, maximum: 100, ticks: 10) |
| `SplitButton` | button | label | split: true, variant: "default" | Primary part + chevron that opens a Flyout |
| `SplitView` | split |  | variant: "inline" | SplitView(displayMode: .inline) { pane } content: { … } — the pane sits on PaneBackground |
| `StackPanel` | vstack |  | alignment: "stretch" | StackPanel(spacing: 8, orientation: .horizontal) { … } — vertical by default, children stretch across |
| `SymbolIcon` | icon | name |  | FluentIcons.Avalonia SymbolIcon(symbol: "Home") |
| `TabControl` | tabs |  | placement: "top", variant: "tabControl" | TabControl(selectedIndex: 0) { TabItem("General") { … } } — 24 px SemiLight headers with the accent pipe |
| `TabItem` | tab | label |  |  |
| `TabStrip` | tabs | items | placement: "top", variant: "tabStrip" | TabStrip(items: [..], selectedIndex:) — headers only |
| `TabStripItem` | tab | label |  |  |
| `TextBlock` | text | content |  | TextBlock("Hi", classes: "h2") — Text; .font(.title2), FontWeight via .bold() |
| `TextBox` | textfield | text |  | TextBox("text", watermark: "Hint", label:) · .passwordChar("•") · .acceptsReturn() (rows:) · classes: "clearButton" / "revealPasswordButton" |
| `TextEditor` | code | code |  | AvaloniaEdit TextEditor("…", language:, lineNumbers:, highlight: [3]) — ShowLineNumbers |
| `TimePicker` | datepicker | label | kind: "time", variant: "fields" | TimePicker(selectedTime: "7:30 AM") |
| `TitleBar` | appbar | title |  | A client-area title bar (ExtendClientAreaToDecorationsHint): TitleBar("App", logo:) { trailing controls } |
| `ToggleButton` | button | label | variant: "default" | ToggleButton("Bold", isChecked: true) — checked uses the accent fill |
| `ToggleSplitButton` | button | label | split: true, variant: "default" | SplitButton whose primary part toggles (isChecked:) |
| `ToggleSwitch` | toggle | label | offText: "Off", onText: "On" | ToggleSwitch("Wi-Fi", isChecked: true, onContent:, offContent:) — Content is the header above the switch |
| `ToolTip` | tooltip | text |  | ToolTip("Hint") { target } — ToolTip.Tip |
| `TransitioningContentControl` | group |  |  | Shows the current page (transitions are static) |
| `TreeView` | tree |  |  | TreeView { TreeViewItem("src", isExpanded: true) { TreeViewItem("App.axaml") } } |
| `TreeViewItem` | treeitem | label |  | TreeViewItem("Header", icon:, isExpanded:, isSelected:) { children } |
| `UniformGrid` | grid |  |  | UniformGrid(columns: n) { … } |
| `UserControl` | vstack |  | alignment: "stretch", spacing: 0 | A reusable view's root |
| `Viewbox` | zstack |  |  | Scales its child (static) |
| `VirtualizingStackPanel` | vstack |  | alignment: "stretch" |  |
| `Window` | vstack |  | alignment: "stretch", spacing: 0 | Window { … } — the top-level window's content (title and decorations come from the fence's title/chrome) |
| `WindowNotificationManager` | vstack |  | alignment: "stretch", position: "topRight", spacing: 8 | Hosts NotificationCards in a window corner (position: .topRight/.bottomRight/.topLeft/.bottomLeft) |
| `WrapPanel` | hstack |  | wrap: true | Children left to right, wrapping |

<!-- end catalogue: avalonia -->

## kde-plasma — KDE Plasma 6 (Breeze)

<!-- catalogue: kde-plasma — generate with `mockitdown elements kde-plasma --markdown --own` -->

| Element | Role | Arguments | Defaults | Notes |
|---|---|---|---|---|
| `AbstractCard` | card | title |  | Kirigami.AbstractCard { … } — the card frame with free content |
| `Action` | button | label | variant: "tool" | Kirigami.Action("Add", icon: "list-add") — shown as a tool button in toolbars and page headers |
| `ActionButton` | fab | icon |  | Kirigami floating action button (Plasma Mobile pages) |
| `ActionTextField` | textfield | placeholder | clearButton: true | Kirigami.ActionTextField with inline actions |
| `ActionToolBar` | toolbar |  | variant: "actions" | Kirigami.ActionToolBar { Action… } |
| `ApplicationWindow` | hstack |  | alignment: "top" | Kirigami.ApplicationWindow { GlobalDrawer { … } PageRow { Page… } } — drawer and page stack side by side, filling the window |
| `Avatar` | avatar | name |  | Kirigami.Avatar("Ana Diaz", image:, size: .small/.large) |
| `Breadcrumb` | breadcrumb | items |  | Dolphin's location bar (KUrlNavigator) in breadcrumb mode: Breadcrumb(["Home", "Documents", "Taxes"]) |
| `BusyIndicator` | progress | label | variant: "spinner" | BusyIndicator() — the spinning process-working icon |
| `Button` | button | label | variant: "normal" | Button("Apply", icon: "dialog-ok-apply") · highlighted: true for the default button · flat: true · checked: true |
| `ButtonGroup` | radiogroup | label |  | ButtonGroup(items: ["A", "B"], selection: "A") — exclusive radio buttons |
| `Card` | card | title |  | Kirigami.Card("Title", subtitle:, image:) { contentItem } actions: { Action… } |
| `CardsLayout` | grid |  | columns: 2 | Kirigami.CardsLayout(columns: 3) { Card… } |
| `CheckBox` | checkbox | label |  | CheckBox("Show hidden files", checked: true / .indeterminate) |
| `CheckDelegate` | listitem | title | checkbox: true | CheckDelegate("Item", checked: true) |
| `Chip` | chip | label | checkmark: false | Kirigami.Chip("Tag", closable: true, checked: true) |
| `ColumnLayout` | vstack |  | alignment: "leading" | QtQuick.Layouts ColumnLayout(spacing: 6) |
| `ComboBox` | select | label |  | ComboBox(items: ["Icons", "Details"], selection: "Icons", open: true) — label: is the FormLayout label |
| `ContextDrawer` | sidebar | title | variant: "context" | Kirigami.ContextDrawer("Actions") { … } — page-specific actions on the right |
| `ContextualHelpButton` | button | label | icon: "help-contents", iconOnly: true, variant: "tool" | Kirigami.ContextualHelpButton — a (?) tool button |
| `DetailsView` | table |  | variant: "details" | Dolphin's details view: DetailsView(columns: ["Name", "Size", "Modified"], rows: …, selection: [0]) |
| `Dial` | progress | value | variant: "gauge" | QQC2 Dial(value:) |
| `Dialog` | dialog | title | closable: true | Kirigami.Dialog("Title", buttons: ["OK", "Cancel"], primary: "OK") { content } |
| `DockWidget` | card | title | variant: "dock" | QDockWidget / Kate tool view: a titled panel (Dolphin Information, Kate Projects…) |
| `DrawerAction` | navitem | label |  | An action in a GlobalDrawer: DrawerAction("Inbox", icon:, badge:) · .selected() |
| `FlexColumn` | vstack |  | alignment: "stretch" | Kirigami.FlexColumn — a centred column of limited width |
| `FormButtonDelegate` | listitem | title | chevron: true | FormButtonDelegate("About", icon:, description:) |
| `FormCard` | card | title | variant: "formcard" | Kirigami Addons FormCard { FormTextDelegate … } |
| `FormCardPage` | navstack | title | titleDisplayMode: "inline" | Kirigami Addons FormCardPage("Settings") { FormHeader … FormCard { … } } |
| `FormCheckDelegate` | checkbox | label |  | FormCheckDelegate("Show badge", checked: true) |
| `FormComboBoxDelegate` | select | label |  | FormComboBoxDelegate("Theme", items:, selection:) |
| `FormDelegateSeparator` | divider |  |  | Separator between FormCard delegates |
| `FormHeader` | text | content |  | FormHeader("General") — the title above a FormCard |
| `FormLayout` | form |  |  | Kirigami.FormLayout { TextField(label: "Name:") … } — labels right-aligned in a column, controls left-aligned |
| `FormRow` | labeled | label |  | FormRow("Clicking files:") { RadioButton… } — any content under a right-aligned FormLayout label |
| `FormSection` | section | title |  | A FormLayout section: Kirigami.Separator with Kirigami.FormData.isSection and a label |
| `FormSwitchDelegate` | toggle | label |  | FormSwitchDelegate("Notifications", description:, checked: true) |
| `FormTextDelegate` | listitem | title |  | FormTextDelegate("Version", description: "6.2") |
| `FormTextFieldDelegate` | textfield | label |  | FormTextFieldDelegate("Name", text:) |
| `Frame` | card | title | variant: "frame" | QQC2 Frame / QFrame: a bordered box |
| `GlobalDrawer` | sidebar | title | variant: "global" | Kirigami.GlobalDrawer("App", titleIcon:) { Action / NavItem… } — the application's main navigation |
| `GridLayout` | grid |  |  | GridLayout(columns: 3) { … } |
| `GroupBox` | card | title | variant: "groupbox" | GroupBox("Title") { … } — QGroupBox with its title above the frame |
| `HamburgerMenu` | menu | label | icon: "application-menu", variant: "tool" | The KHamburgerMenu button at the end of the toolbar (open: true shows the menu) |
| `Heading` | text | content | level: 1 | Kirigami.Heading("Title", level: 1…5) — 1.35×, 1.2×, 1.15×, 1.1×, 1× the default font; type: .primary is bold |
| `IconView` | grid |  | columns: 6 | Dolphin's icons view: IconView(columns: 6) { file items } |
| `InlineMessage` | alert | text | type: "information" | Kirigami.InlineMessage("Text", type: .information/.positive/.warning/.error, showCloseButton: true, position: .header) actions: { Action… } |
| `ItemDelegate` | listitem | title |  | QQC2 ItemDelegate |
| `KCM` | navstack | title | titleDisplayMode: "inline" | A System Settings module page: KCM("Mouse") { FormLayout { … } } · .toolbar { ToolbarItem(placement: .bottomBar) { Help / Defaults / Reset / Apply } } |
| `KCMCategory` | navitem | label |  | KCMCategory("Appearance", icon:, chevron: true) · .selected() — chevron: a category holding sub-pages |
| `KCMSidebar` | sidebar | title | variant: "kcm" | System Settings' category sidebar: KCMSidebar { SearchField  KCMCategory… } |
| `KMessageWidget` | alert | text | type: "information" | KMessageWidget (Qt Widgets): KMessageWidget("Text", type: .warning) |
| `LinkButton` | link | label, destination |  | Kirigami.LinkButton("Learn more") |
| `ListItem` | listitem | title |  | ListItem("Title", subtitle:, icon:, detail:) — Kirigami delegate |
| `ListSectionHeader` | section | title |  | Kirigami.ListSectionHeader("Today") { rows } |
| `ListView` | list |  |  | ListView { ItemDelegate… } |
| `LoadingPlaceholder` | skeleton |  |  | Kirigami.LoadingPlaceholder |
| `MainWindow` | vstack |  | alignment: "stretch" | QMainWindow / KXmlGuiWindow: MenuBar, ToolBar, central widget and StatusBar stacked, filling the window |
| `Menu` | menu | label |  | Menu { MenuItem("Copy", icon: "edit-copy", shortcut: "Ctrl+C") … } |
| `MenuBar` | toolbar |  | variant: "menubar" | MenuBar { MenuBarItem("File") … } |
| `MenuBarItem` | menu | label | caret: false, variant: "menubar" | MenuBarItem("Edit", open: true) { MenuItem… } |
| `MenuDialog` | dialog | title | closable: true | Kirigami.MenuDialog |
| `MenuItem` | menuitem | label |  | MenuItem("Paste", icon:, shortcut:, checked:) |
| `MenuSeparator` | divider |  |  | A separator line in a Menu |
| `MessageBox` | dialog | title | variant: "messagebox" | KMessageBox("Title", message:, icon: "dialog-warning", buttons: […]) |
| `NavigationTabBar` | tabs |  | placement: "bottom", variant: "navigation" | Kirigami.NavigationTabBar { NavigationTabButton("Home", icon:) … } — the Plasma Mobile bottom bar |
| `NavigationTabButton` | tab | label |  | NavigationTabButton("Library", icon: "folder", badge: 3) |
| `Notification` | toast | message | closable: true, position: "bottomTrailing" | A Plasma notification popup: Notification("Title", body:, icon:) actions: { HStack { Button… } } |
| `OverlayDrawer` | sidebar | title | variant: "global" | Kirigami.OverlayDrawer |
| `OverlaySheet` | dialog | title | closable: true | Kirigami.OverlaySheet |
| `Page` | navstack | title | titleDisplayMode: "inline" | Kirigami.Page("Title") { … } — title on the left of the page header; .toolbar { Action… } for page actions |
| `PageRow` | split |  |  | Kirigami PageRow (pageStack): pages side by side as columns — the first ones 360 px wide, the last fills |
| `PasswordField` | textfield | placeholder | kind: "password", reveal: true | Kirigami.PasswordField(text: "secret") |
| `PlaceholderMessage` | emptystate | title | icon: "dialog-information" | Kirigami.PlaceholderMessage("No files", explanation: "…", icon: "folder") { helpfulAction Button } |
| `PlacesItem` | navitem | label |  | PlacesItem("Home", icon: "user-home") · .selected() |
| `PlacesPanel` | sidebar | title | variant: "places" | Dolphin's Places panel: PlacesPanel { Section("Places") { PlacesItem… } … } |
| `PlasmaPanel` | toolbar |  | variant: "panel" | The Plasma panel (task manager, system tray, clock) — place at the bottom of a desktop mockup |
| `Plasmoid` | card | title | variant: "plasmoid" | A Plasma applet popup / desktop widget |
| `ProgressBar` | progress | label |  | ProgressBar(value: 0.6) — no value = indeterminate |
| `PromptDialog` | dialog | title |  | Kirigami.PromptDialog("Delete file?", subtitle: "…", buttons: ["Delete", "Cancel"], destructive: "Delete") |
| `RadioButton` | radio | label |  | RadioButton("Single-click", checked: true) |
| `RadioDelegate` | radio | label |  | RadioDelegate("Item", checked: true) |
| `RangeSlider` | slider | label |  | RangeSlider(value: [20, 80]) |
| `RoundButton` | button | icon | iconOnly: true, variant: "round" | QQC2 RoundButton(icon:) |
| `RowLayout` | hstack |  |  | QtQuick.Layouts RowLayout(spacing: 6) |
| `ScrollView` | scroll | axes |  | QQC2 ScrollView (static) |
| `ScrollablePage` | navstack | title | titleDisplayMode: "inline" | Kirigami.ScrollablePage("Title") { … } — a Page whose content scrolls |
| `SearchField` | textfield | placeholder | kind: "search", placeholder: "Search\u2026" | Kirigami.SearchField(text:) |
| `SelectableLabel` | text | content |  | Kirigami.SelectableLabel |
| `Separator` | divider |  |  | Kirigami.Separator — a 1 px line in the frame colour |
| `Slider` | slider | label |  | Slider(value: 40, from: 0, to: 100, ticks: 10) |
| `SpinBox` | textfield | value | kind: "number", trailingIcon: "chevron.up.down" | SpinBox(value: 5, suffix: " px") — up/down arrows on the right |
| `SplitView` | split |  |  | QQC2 SplitView |
| `Splitter` | split |  |  | QSplitter / SplitView: children side by side with a handle; columnWidths: [240, 600] |
| `StatusBar` | toolbar |  | variant: "statusbar" | QStatusBar (Dolphin, Kate): small text on the left, zoom slider and free-space bar on the right |
| `SubtitleDelegate` | listitem | title |  | Kirigami.SubtitleDelegate("Title", subtitle:, icon:) |
| `SwipeListItem` | listitem | title |  | Kirigami.SwipeListItem("Title", subtitle:) actions: { Action… } — inline actions at the end |
| `Switch` | toggle | label |  | Switch("Enable", checked: true) — the indicator sits before the text |
| `SwitchDelegate` | toggle | label |  | SwitchDelegate("Item", checked: true) |
| `SystemMonitorSensor` | stat | label, value |  | A System Monitor sensor face: SystemMonitorSensor("CPU", "23 %", trend: [...]) |
| `TabBar` | tabs |  | placement: "top" | TabBar(selection: "Files") { TabButton("Files") … } |
| `TabButton` | tab | label |  | TabButton("General", icon:) { content } |
| `TabWidget` | tabs |  | placement: "top", variant: "document" | QTabWidget / document tabs (Kate, Konsole): TabWidget { TabButton("main.cpp") { … } } |
| `TableView` | table |  |  | QTableView / TableView(columns: [...], rows: [[...]], selection: [1]) |
| `TextArea` | textfield | text | kind: "multiline" | TextArea(text:, rows: 4) |
| `TextField` | textfield | placeholder |  | TextField("Placeholder", text:, label:) — label: is the FormLayout label |
| `ToolBar` | toolbar |  |  | ToolBar { ToolButton… } — the main window toolbar, merged with the title bar in Plasma 6 |
| `ToolButton` | button | label | variant: "tool" | ToolButton("Split", icon: "view-split-left-right") — flat until hovered; checked: true |
| `ToolTip` | tooltip | text |  | ToolTip("Hint") { target } |
| `TreeView` | tree |  |  | QTreeView / TreeView { TreeViewItem("src", folder: true) { … } } |
| `TreeViewItem` | treeitem | label |  | TreeViewItem("main.cpp", icon:, expanded:, selected:) |
| `UrlButton` | link | label, destination |  | Kirigami.UrlButton("kde.org") |
| `UrlNavigator` | breadcrumb | items |  | KUrlNavigator — same as Breadcrumb |

<!-- end catalogue: kde-plasma -->

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

## antd — Ant Design 5

<!-- catalogue: antd — generate with `mockitdown elements antd --markdown --own` -->

| Element | Role | Arguments | Defaults | Notes |
|---|---|---|---|---|
| `Alert` | alert | title | showIcon: false | Alert(message: "Saved", description: "…", type: "success"/"info"/"warning"/"error", showIcon: true, closable: true, action: { … }) |
| `Anchor` | list |  |  | Anchor { AnchorLink("Basic") … } — in-page nav with the ink rail |
| `AnchorLink` | listitem | title |  |  |
| `App` | group |  |  | App wrapper (renders its content) |
| `AutoComplete` | select | placeholder |  | AutoComplete("Search…", value:, options: [..], open: true) |
| `Avatar` | avatar | name |  | Avatar("Ana Lima", src: "…", icon: "UserOutlined", shape: "square", size: "small"/"large") |
| `AvatarGroup` | hstack |  | spacing: 0 | Avatar.Group { Avatar … } — overlapped avatars with white rings |
| `Badge` | badge | count |  | Badge(count: 5) { Avatar(…) } · Badge(dot: true) · Badge(status: "success", text: "Running") · overflowCount: 99 |
| `BadgeRibbon` | badge | text | variant: "ribbon" | Badge.Ribbon(text: "Recommended", color: "volcano") { Card(…) } — corner ribbon over its child |
| `Breadcrumb` | breadcrumb | items |  | Breadcrumb(["Home", "Orders", "Detail"]) — "/" separators |
| `Button` | button | label | variant: "default" | Button("Save", type: "primary", icon: "SaveOutlined", size: "small"/"large", shape: "circle"/"round") · .danger() · v5.21 color:/variant: ("solid", "outlined", "dashed", "filled", "text", "link") |
| `ButtonGroup` | toolbar |  | variant: "group" | Joined buttons (Space.Compact of Buttons) |
| `Calendar` | calendar |  |  | Calendar(value: "2026-11-24", fullscreen: false) |
| `Card` | card | title |  | Card(title: "Orders", extra: { Link("More") }, size: "small", cover: "…", hoverable:) { … } actions: { Icon(…) … } |
| `CardGrid` | vstack |  |  | Card.Grid — a hoverable cell of a grid card |
| `CardMeta` | listitem | title |  | Card.Meta(title:, description:, avatar:) |
| `Carousel` | media | image |  | Carousel(image: "…") — one slide with dots |
| `Cascader` | select | placeholder |  | Cascader(value: "Asia / Japan / Tokyo", options: ["Asia", "Europe"], open: true) |
| `CheckCard` | card | title | variant: "check" | CheckCard(title:, description:, avatar:, checked: true) |
| `CheckableTag` | chip | label | variant: "checkable" | Tag.CheckableTag("Movies", checked: true) |
| `Checkbox` | checkbox | label |  | Checkbox("Remember me", checked: true) · checked: "indeterminate" |
| `CheckboxGroup` | hstack |  | spacing: 8 | Checkbox.Group { Checkbox … } — a row of checkboxes (spacing 8) |
| `Col` | vstack |  | alignment: "stretch" | Col(span: 6) — spans 1…24 columns of its Row |
| `Collapse` | vstack |  | alignment: "stretch", spacing: 0 | Collapse { CollapsePanel("Header", expanded: true) { … } … } · bordered: false · ghost: true |
| `CollapsePanel` | accordion | title |  | Collapse panel; extra: { … } on the right |
| `ColorPicker` | swatches |  |  | ColorPicker(colors: ["#1677ff", …], selection: 0, label: "#1677FF") |
| `Column` | tablecolumn | title |  | Table column header (alignment: .trailing) |
| `ConfigProvider` | group |  |  | ConfigProvider wrapper (renders its content) |
| `Content` | vstack |  | alignment: "stretch" | Layout.Content — the padded page body |
| `DatePicker` | datepicker | placeholder | format: "iso" | DatePicker(value: "2026-11-24", placeholder: "Select date", open: true) |
| `Descriptions` | section | title |  | Descriptions(title: "User Info", column: 3, bordered: true, size: "small", extra: { … }) { DescriptionsItem("Name", "Ana") … } |
| `DescriptionsItem` | labeled | label, value |  | DescriptionsItem("Status") { Badge(status:, text:) } · span: 2 |
| `DirectoryTree` | tree |  | variant: "directory" |  |
| `Divider` | divider |  |  | Divider() · Divider(label: "Text", orientation: "left") · type: "vertical" · dashed: true |
| `Dragger` | dropzone | label | icon: "InboxOutlined" | Alias of UploadDragger |
| `Drawer` | dialog | title | closable: true, variant: "drawer" | Drawer(title: "Order #1024", placement: .right, width: 420) { … } footer: { Button … } |
| `Dropdown` | menu | label |  | Dropdown("Actions", open: true) { DropdownItem("Edit", icon:); MenuDivider(); DropdownItem("Delete", danger: true) } |
| `DropdownButton` | menu | label | variant: "default" | Dropdown.Button — a button with a separate caret |
| `DropdownItem` | menuitem | label |  | Item of a Dropdown menu; danger: true, extra: "⌘E" |
| `Empty` | emptystate | description | description: "No data", icon: "tray" | Empty("No orders yet") { Button("Create", type: "primary") } · image: "simple" |
| `Flex` | hstack |  |  | Flex(gap: 16, vertical: true, justify:, align:, wrap: true) { … } |
| `FloatButton` | fab | icon | variant: "default" | FloatButton(icon: "QuestionCircleOutlined", type: "primary", description: "HELP") — floats bottom-right |
| `Footer` | hstack |  |  | Layout.Footer — centered secondary text |
| `FooterToolbar` | toolbar |  | variant: "footer" | FooterToolbar { Button … } — the fixed bottom action bar |
| `Form` | form |  | variant: "horizontal" | Form(layout: "horizontal"/"vertical"/"inline") { FormItem(…) { … } · Input(label:) … } — horizontal puts right-aligned labels with a colon left |
| `FormItem` | labeled | label |  | FormItem("Notifications", required: true, help: "…") { Switch() } — label + any control |
| `GridContent` | vstack |  | alignment: "stretch", spacing: 24 |  |
| `Header` | appbar | title | variant: "dark" | Layout.Header — 64 px bar, #001529 (theme: "light" for white); children go to the right |
| `Icon` | icon | name |  | Ant icon by component name: Icon("SettingOutlined") |
| `Image` | image | src |  | Image(src: "…", width: …) |
| `Input` | textfield | placeholder |  | Input("Email", label: "Email", value:, prefix:, suffix:, addonBefore: "https://", allowClear: true, status: "error", size:) |
| `InputNumber` | textfield | placeholder | kind: "number", trailingIcon: "chevron.up.down" | InputNumber(value: 3, min: 1, max: 10, addonAfter: "kg") |
| `InputOTP` | segmented | items | variant: "otp" | Input.OTP(items: ["4", "8", "1", "", "", ""]) |
| `InputPassword` | textfield | placeholder | kind: "password", reveal: true | Input.Password with the eye toggle |
| `InputSearch` | textfield | placeholder | kind: "search" | Input.Search("Search orders", enterButton: true) |
| `Kbd` | kbd | keys |  |  |
| `Layout` | vstack |  | alignment: "stretch", spacing: 0 | Layout { Header; Layout { Sider; Content }; Footer } — colorBgLayout background; hasSider: true for a row |
| `LayoutHeader` | appbar | title | variant: "dark" | Alias of Header |
| `LightFilter` | hstack |  | spacing: 8 | LightFilter { Select(…, variant: "borderless") … } — compact inline filters |
| `List` | list |  |  | List(header: "Activity", bordered: true, size: "small") { ListItem(…) } · itemLayout: "vertical" |
| `ListItem` | listitem | title |  | List.Item with Meta: ListItem("Title", description: "…", avatar: "Ana") actions: { Link("edit") } |
| `ListItemMeta` | listitem | title |  |  |
| `Mentions` | textfield | placeholder | kind: "multiline" | Mentions — a TextArea that suggests @names |
| `Menu` | sidebar |  | variant: "light" | Menu(mode: "inline"/"vertical"/"horizontal", theme: "dark", selection: "Orders") { MenuItem(…); SubMenu(…) { … } } |
| `MenuDivider` | divider |  |  |  |
| `MenuItem` | navitem | label |  | MenuItem("Orders", icon: "ShoppingCartOutlined").selected() · danger via .badge / DropdownItem |
| `MenuItemGroup` | section | title |  | Menu.ItemGroup — grey caption above a group of items |
| `Message` | toast | message | icon: "InfoCircleFilled", position: "top", variant: "info" | message.success(…): Message("Saved successfully", type: "success") — a small card at the top centre |
| `Modal` | dialog | title | closable: true | Modal(title: "Basic Modal", open: true) { … } footer: { Button("Cancel"); Button("OK", type: "primary") } · buttons: ["Cancel", "OK"] |
| `ModalConfirm` | dialog | title | buttons: ["Cancel", "OK"], icon: "ExclamationCircleFilled", variant: "confirm" | Modal.confirm(title:, content:, buttons: ["Cancel", "Delete"], destructive: "Delete") — icon left, buttons bottom-right |
| `Notification` | toast | message | closable: true, position: "topRight", variant: "notification" | notification.open: Notification(message: "New order", description: "…", type: "success", icon:) — top-right card |
| `PageContainer` | card | title |  | PageContainer(title: "Basic list", subtitle:) header: { Breadcrumb([..]) } extra: { Button … } { content } |
| `PageHeader` | card | title | variant: "header" | PageHeader(title:, subTitle:, onBack: true) extra: { … } |
| `Pagination` | pagination |  |  | Pagination(total: 85, current: 2, showTotal: "Total 85 items", pageSize: 10, size: "small") — count is pages |
| `Panel` | accordion | title |  |  |
| `Paragraph` | text | content |  | Typography.Paragraph — body text with 1em bottom margin; type: "secondary" |
| `Password` | textfield | placeholder | kind: "password", reveal: true |  |
| `Popconfirm` | tooltip | title |  | Popconfirm(title: "Delete the task", description: "Are you sure?") { Button(…) } actions: { … } |
| `Popover` | tooltip | title |  | Popover(title: "Title", content: "…") { Button(…) } — white card bubble |
| `ProCard` | card | title |  | ProCard(title: "Trend", extra: { … }, bordered: true, headerBordered: true, split: "vertical") { … } |
| `ProDescriptions` | section | title |  | ProDescriptions(title:, column: 2) { DescriptionsItem … } |
| `ProForm` | form |  | variant: "vertical" | ProForm(layout: "vertical") { ProFormText(…) … } actions: { Button("Submit", type: "primary") } |
| `ProFormCheckbox` | checkbox | label |  |  |
| `ProFormDatePicker` | datepicker | label | format: "iso" |  |
| `ProFormDateRangePicker` | datepicker | label | format: "iso", kind: "range" |  |
| `ProFormDigit` | textfield | label | kind: "number", trailingIcon: "chevron.up.down" |  |
| `ProFormPassword` | textfield | label | kind: "password", reveal: true |  |
| `ProFormRadioGroup` | radiogroup | label | orientation: "horizontal" |  |
| `ProFormSelect` | select | label |  | ProFormSelect("Status", options: [..], value:) |
| `ProFormSwitch` | toggle | label |  |  |
| `ProFormText` | textfield | label |  | ProFormText("Name", placeholder:, required: true, width: "md") |
| `ProFormTextArea` | textfield | label | kind: "multiline" |  |
| `ProFormUploadDragger` | dropzone | label | icon: "InboxOutlined" |  |
| `ProHeader` | appbar | title | variant: "pro" | ProLayout global header (56 px): ProHeader(title:, search:, notifications: 3, avatar: "Serati Ma") { actions } |
| `ProLayout` | hstack |  | alignment: "stretch", spacing: 0 | ProLayout(layout: "side"/"mix"/"top") { ProSider(…) { MenuItem … }; VStack { ProHeader(…); PageContainer(…) { … } } } |
| `ProList` | list |  |  | ProList(headerTitle: "Members") { ListItem … } |
| `ProSider` | sidebar | title | variant: "light" | ProLayout side menu with logo + title header: ProSider(title: "Ant Design Pro", logo: …) |
| `ProTable` | table |  |  | ProTable(headerTitle: "Orders", columns:, rows:, rowSelection: true) toolbar: { Button(…) } footer: { Pagination(…) } |
| `Progress` | progress | percent | showValue: true | Progress(percent: 30, type: "circular", status: "exception"/"success"/"active", size: "small", strokeColor:, showInfo: false) |
| `QRCode` | placeholder | label | icon: "square.grid.3x3" | QRCode(value:) — a QR placeholder |
| `QueryFilter` | form |  | variant: "query" | QueryFilter { ProFormText(…) … } actions: { Button("Reset"); Button("Query", type: "primary") } — the 3-column search form above a ProTable |
| `Radio` | radio | label |  |  |
| `RadioButton` | radio | label |  |  |
| `RadioGroup` | radiogroup | label | orientation: "horizontal" | Radio.Group(options: ["Daily", "Weekly"], value: "Weekly", optionType: "button", buttonStyle: "solid") |
| `RangePicker` | datepicker | placeholder | format: "iso", kind: "range" | DatePicker.RangePicker(value: "2026-11-01  →  2026-11-30") |
| `Rate` | rating | value |  | Rate(value: 3.5, count: 5) |
| `Result` | emptystate | title | icon: "checkmark.circle", kind: "success" | Result(status: "success", title: "Successfully Purchased!", subTitle: "Order 2017…") { Button("Go Console", type: "primary") } |
| `Row` | grid |  | columns: 24 | Row(gutter: 16) { Col(span: 8) { … } … } — the 24-column grid |
| `Search` | textfield | placeholder | kind: "search" |  |
| `Segmented` | segmented | options |  | Segmented(options: ["Daily", "Weekly", "Monthly"], value: "Weekly", block: true, size:) |
| `Select` | select | placeholder |  | Select("Status", value: "Active", options: [..], open: true) · mode: "multiple" with value: [..] renders tags |
| `Sider` | sidebar | title | variant: "dark" | Layout.Sider(width: 200, theme: "light", collapsed: true) { MenuItem … } |
| `Skeleton` | skeleton |  |  | Skeleton(avatar: true, lines: 3, active: true) |
| `Slider` | slider |  |  | Slider(value: 30) · range: value: [20, 50] · marks via ticks: 4 |
| `Space` | hstack |  |  | Space(size: "small"/"middle"/"large", direction: "vertical") { … } — 8/16/24 px gaps |
| `SpaceCompact` | toolbar |  | variant: "group" | Space.Compact { Input(…); Button(…) } — joined controls |
| `Spin` | progress | label | kind: "spinner" | Spin(tip: "Loading…", size: "large") |
| `Statistic` | stat | title, value |  | Statistic(title: "Active Users", value: "112,893", change: "+11.28%", prefix:/suffix: via value text) |
| `StatisticCard` | stat | title, value |  | StatisticCard(title: "Sales", value: "¥ 126,560", change: "12%", caption: "week over week", trend: [..]) |
| `StatisticCountdown` | stat | title, value |  | Statistic.Countdown(title:, value: "23:59:59") |
| `Steps` | steps | items |  | Steps(items: ["Login", ["title": "Verify", "description": "…"], "Done"], current: 1, direction: "vertical", size: "small") · errors: [1] |
| `StepsForm` | vstack |  | alignment: "stretch", spacing: 24 | StepsForm { Steps(…); ProForm { … } } |
| `SubMenu` | navitem | label |  | SubMenu("Settings", icon:, expanded: true) { MenuItem … } |
| `Switch` | toggle | label |  | Switch(checked: true, checkedChildren: "ON", size: "small", loading:) |
| `TabPane` | tab | label |  | TabPane("Details", icon:) { panel } |
| `Table` | table |  |  | Table(columns: [..], rows: [[..]], rowSelection: true, selectedRows: [1], sortColumn: 2, size: "middle"/"small", bordered: true, pagination: "…") — cells may be views |
| `Tabs` | tabs | items | placement: "top" | Tabs(items: ["Overview", "Logs"], selection: 0, type: "card", size: "small") or Tabs { TabPane("One") { … } } |
| `TabsItem` | tab | label |  |  |
| `Tag` | chip | label |  | Tag("processing", color: "blue"/"success"/"processing"/"error"/"warning"/"magenta"…, icon:, closable: true, bordered: false) |
| `Text` | text | content |  | Typography.Text: Text("Note", type: "secondary"/"success"/"warning"/"danger") · .strong() .code() .mark() .keyboard() .delete() .underline() |
| `TextArea` | textfield | placeholder | kind: "multiline" | Input.TextArea(rows: 4, showCount: true, maxLength: 100) |
| `TimePicker` | datepicker | placeholder | kind: "time" |  |
| `Timeline` | timeline |  |  | Timeline { TimelineItem("Created", color: "green", label: "2026-11-01") … } · pending: |
| `TimelineItem` | timelineitem | title |  | TimelineItem("Shipped", color: "green"/"blue"/"red"/"gray", description:, dot: "ClockCircleOutlined") |
| `Title` | text | content | level: 1 | Title("Dashboard", level: 3) — Typography.Title h1–h5 (38/30/24/20/16 px) |
| `Tooltip` | tooltip | title |  | Tooltip("prompt text", placement: .bottom) { Button(…) } |
| `Tour` | tooltip | title |  | Tour step bubble: Tour("Upload file", description: "…") { target } |
| `Transfer` | hstack |  | alignment: "center", spacing: 8 | Transfer { TransferList("Source") { … }; TransferOperation(); TransferList("Target") { … } } |
| `TransferItem` | listitem | title | checked: false |  |
| `TransferList` | card | title |  | TransferList("Source", subtitle: "2/8 items") { TransferItem("Content 1", checked: true) } |
| `TransferOperation` | vstack |  | spacing: 4 | The two arrow buttons between TransferLists (pass children to override) |
| `Tree` | tree |  |  | Tree { TreeNode("parent", expanded: true) { TreeNode("leaf") } } · showLine · checkable |
| `TreeNode` | treeitem | title |  | TreeNode("src", folder: true, expanded: true, checked: true).selected() |
| `TreeSelect` | select | placeholder |  | TreeSelect(value: "Engineering / Platform", options: [..]) |
| `Typography` | text | content |  | Typography("Body text") — plain text container |
| `TypographyText` | text | content |  | Alias of Text |
| `Upload` | vstack |  | alignment: "leading", spacing: 8 | Upload { Button("Click to Upload", icon: "UploadOutlined"); UploadFile("spec.pdf") } — trigger + file list |
| `UploadDragger` | dropzone | label | icon: "InboxOutlined" | Upload.Dragger("Click or drag file to this area to upload", hint: "Support for a single or bulk upload.") |
| `UploadFile` | listitem | title | icon: "PaperClipOutlined" | UploadFile("report.pdf", status: "uploading"/"done"/"error") — a row of the upload list |
| `Watermark` | group |  |  | Watermark wrapper (renders its content) |

<!-- end catalogue: antd -->

## tailwind — Tailwind Catalyst

<!-- catalogue: tailwind — generate with `mockitdown elements tailwind --markdown --own` -->

| Element | Role | Arguments | Defaults | Notes |
|---|---|---|---|---|
| `Alert` | dialog | title | size: "md", variant: "alert" | Catalyst Alert: a small centred confirmation modal. Alert("Are you sure?", description: "…") actions: { … } |
| `AlertActions` | hstack |  | spacing: 12 | Alert actions |
| `AlertBody` | vstack |  | alignment: "stretch" | Alert body |
| `AlertDescription` | text | content |  | Alert description |
| `AlertTitle` | text | content |  | Alert title |
| `AuthLayout` | vstack |  | spacing: 0 | Centred sign-in page on an inset panel: AuthLayout { VStack { … } } |
| `Avatar` | avatar | name |  | Avatar("Erica Jones", src: "…") · initials: "EJ" · square: true |
| `AvatarButton` | avatar | name |  | An Avatar that is a button (e.g. a dropdown trigger) |
| `Badge` | badge | text | color: "zinc" | Badge("Paid", color: .lime) — rounded-md tinted pill; any Tailwind colour (zinc default) |
| `BadgeButton` | badge | text | color: "zinc" | A Badge that is a link/button |
| `Button` | button | label | variant: "solid" | Button("Save", color: .indigo) · variant: .solid/.outline/.plain (or .outline() / .plain()) · color: dark/zinc (default), light, dark, white, dark/white, zinc, indigo, red, … all Tailwind hues |
| `Checkbox` | checkbox | label |  | Checkbox("Allow embedding", checked: true, color: .indigo) · indeterminate via checked: .indeterminate |
| `CheckboxField` | listitem | title | checked: false | CheckboxField("Allow embedding", description: "…", checked: true) — checkbox, label and description |
| `CheckboxGroup` | vstack |  | alignment: "stretch", spacing: 12 | Stack of CheckboxFields (space-y-3) |
| `Code` | text | content |  | Code("…") — inline code with a hairline border |
| `Combobox` | select | placeholder | trailingIcon: "chevron.up.down" | Combobox("Search…", selection: "Can", open: true) { ComboboxOption(…) } — a text input with a listbox |
| `ComboboxDescription` | text | content |  | Option description |
| `ComboboxLabel` | text | content |  | Option label |
| `ComboboxOption` | menuitem | label |  | One Combobox option |
| `Description` | text | content |  | Field description (zinc-500) |
| `DescriptionDetails` | text | content |  | Details (zinc-950) |
| `DescriptionList` | grid |  |  | DescriptionList { DescriptionTerm("Customer"); DescriptionDetails("Leslie Alexander") … } — two columns on desktop |
| `DescriptionTerm` | text | content |  | Term (zinc-500) |
| `Dialog` | dialog | title | size: "lg" | Dialog("Refund payment", description: "…") { DialogBody … } actions: { Button("Cancel", variant: .plain); Button("Refund") } · size: .sm…5xl |
| `DialogActions` | hstack |  | spacing: 12 | Right-aligned actions (gap-3) |
| `DialogBody` | vstack |  | alignment: "stretch", spacing: 16 | Dialog body (mt-6) |
| `DialogDescription` | text | content |  | Dialog description |
| `DialogTitle` | text | content |  | Dialog title |
| `Divider` | divider |  |  | Divider() · Divider(soft: true) for the lighter zinc-950/5 rule |
| `Dropdown` | menu | label | variant: "outline" | Dropdown("Options", open: true) { DropdownItem("Edit", shortcut: "⌘E") … } · trigger variant: .outline (default)/.plain/.solid |
| `DropdownButton` | menu | label | variant: "outline" | Same as Dropdown (Catalyst names the trigger DropdownButton) |
| `DropdownDescription` | text | content |  | Item description |
| `DropdownDivider` | divider |  |  | Rule between sections |
| `DropdownHeader` | vstack |  | alignment: "leading", spacing: 0 | Non-interactive header block (px-3.5 pt-2.5 pb-1) |
| `DropdownHeading` | text | content |  | Section heading (xs/5 medium zinc-500) |
| `DropdownItem` | menuitem | label |  | DropdownItem("Settings", systemImage: "cog-6-tooth", shortcut: "⌘S") · .state(.focused) for the blue highlight |
| `DropdownLabel` | text | content |  | Item label |
| `DropdownMenu` | menu |  |  | An open dropdown panel on its own (place it with .offset) |
| `DropdownSection` | group |  |  | A group of items |
| `DropdownShortcut` | kbd | keys |  | DropdownShortcut(keys: ["⌘", "K"]) |
| `EmptyState` | emptystate | title |  | Tailwind Plus empty state: dashed box, icon, title, description and a button |
| `ErrorMessage` | text | content |  | Field error (red-600) |
| `Eyebrow` | text | content |  | Small indigo kicker above a section title (or a pill announcement with variant: .pill) |
| `Feature` | listitem | title |  | Feature("Push to deploy", description: "…", systemImage: "cloud-arrow-up") — indigo icon tile + title + text |
| `FeatureGrid` | grid |  | columns: 3, spacing: 40 | Feature section grid: FeatureGrid(columns: 3) { Feature(…) … } |
| `Field` | vstack |  | alignment: "stretch", spacing: 12 | Field { Label("Email"); Input(…); Description(…) } |
| `FieldGroup` | vstack |  | alignment: "stretch", spacing: 32 | Stack of fields (space-y-8) |
| `Fieldset` | vstack |  | alignment: "stretch", spacing: 0 | Fieldset { Legend(…); Text(…); FieldGroup { Field { … } } } |
| `Heading` | text | content | style: "title2" | Heading("Orders") — text-2xl/8 sm:text-xl/8 semibold · level: 1…6 |
| `Hero` | vstack |  | spacing: 24 | Marketing hero (simple centred): Hero { Eyebrow(…); Text(…).font(.display); Lead(…); HStack { Button… } } |
| `HeroHeading` | text | content |  | Hero title (text-6xl semibold tracking-tight, balanced) |
| `InlineAlert` | alert | title |  | Tailwind Plus “Alerts” banner: InlineAlert("Attention needed", message: "…", severity: .warning) · variant: .accent for a left border |
| `Input` | textfield | placeholder |  | Input("you@example.com", label:, description:, text:, type: .email/.password/.search) · invalid: true |
| `InputGroup` | textfield | placeholder |  | Input with a leading icon: InputGroup("Search…", systemImage: "magnifying-glass") |
| `Kbd` | kbd | keys |  | Keyboard keys |
| `Label` | label | title |  | Label("Full name") — form label (sm/6 medium) |
| `Lead` | text | content |  | Large muted intro paragraph (text-lg/8) |
| `Legend` | text | content |  | Fieldset legend (base/6 semibold) |
| `Link` | link | label |  | Link("View") — unstyled link (inherits colour) |
| `Listbox` | select | placeholder | trailingIcon: "chevron.up.down" | Listbox("Select a status", selection: "Active", open: true) { ListboxOption("Active") … } |
| `ListboxDescription` | text | content |  | Option description |
| `ListboxLabel` | text | content |  | Option label |
| `ListboxOption` | menuitem | label |  | One Listbox option |
| `Navbar` | toolbar |  |  | Navbar { NavbarSection { NavbarItem("Home", current: true) }; NavbarSpacer(); NavbarItem(systemImage:) } |
| `NavbarDivider` | divider |  |  | Vertical rule between navbar groups |
| `NavbarItem` | navitem | label |  | NavbarItem("Orders", systemImage:, current: true) — the current item gets an underline bar |
| `NavbarLabel` | text | content |  | Text inside a navbar item |
| `NavbarSection` | hstack |  | spacing: 12 | Group of navbar items |
| `NavbarSpacer` | spacer |  |  | Flexible gap |
| `Notification` | toast | message | closable: true, position: "top-right" | Tailwind Plus notification panel (top right): Notification("Successfully saved!", description: "…", systemImage: "check-circle") |
| `Pagination` | pagination |  |  | Pagination(count: 10, page: 2) — Previous · pages · Next, spread over the width |
| `PricingGrid` | grid |  | columns: 3, spacing: 32 | Row of PricingTier cards |
| `PricingTier` | card | title |  | PricingTier("Startup", description: "…", featured: true) { price, features } actions: { Button } |
| `Radio` | radio | label |  | Radio("Monthly", checked: true) |
| `RadioField` | radio | label |  | Radio with its label |
| `RadioGroup` | radiogroup | label |  | RadioGroup(selection: "Monthly") { Radio("Monthly"); Radio("Yearly") } |
| `SectionHeading` | text | content |  | Marketing section title (text-4xl semibold tracking-tight) |
| `Select` | select | placeholder | trailingIcon: "chevron.up.down" | Native select: Select("Country", selection: "Canada") { … } |
| `Sidebar` | sidebar |  |  | Sidebar { SidebarHeader { … }; SidebarBody { SidebarSection { SidebarItem(…) } }; SidebarFooter { … } } |
| `SidebarBody` | vstack |  | alignment: "stretch", spacing: 32 | Scrolling middle block |
| `SidebarDivider` | divider |  |  | Rule between sidebar sections |
| `SidebarFooter` | vstack |  | alignment: "stretch", spacing: 0 | Bottom block with a top border |
| `SidebarHeader` | vstack |  | alignment: "stretch", spacing: 0 | Top block with a bottom border |
| `SidebarHeading` | text | content |  | SidebarHeading("Upcoming events") — xs zinc-500 section title |
| `SidebarItem` | navitem | label |  | SidebarItem("Home", systemImage: "home", current: true) — current: indicator bar on the left |
| `SidebarLabel` | text | content |  | Label inside a sidebar item |
| `SidebarLayout` | hstack |  | alignment: "stretch", spacing: 0 | App shell: SidebarLayout { Sidebar { … }; VStack { page } } — the page sits on a white panel with a ring, inset on zinc-100 |
| `SidebarSection` | vstack |  | alignment: "stretch", spacing: 2 | A group of items (gap-0.5) |
| `SidebarSpacer` | spacer |  |  | Pushes the following sections down |
| `StackedLayout` | vstack |  | alignment: "stretch", spacing: 0 | App shell: StackedLayout { Navbar { … }; VStack { page } } — navbar on top, page on an inset panel |
| `Stat` | stat | label, value |  | Stat(label:, value:, change:) — dashboard stat with a top rule (Catalyst demo) |
| `Strong` | text | content |  | Strong("…") — zinc-950 medium |
| `Subheading` | text | content | style: "subheadline" | Subheading("Recent orders") — text-base/7 sm:text-sm/6 semibold |
| `Switch` | toggle | label |  | Switch(isOn: true, color: .emerald) — h-5 w-8 track, any Tailwind colour |
| `SwitchField` | toggle | label |  | SwitchField("Allow embedding", isOn: true, description: "…") — label + description left, switch right |
| `SwitchGroup` | vstack |  | alignment: "stretch", spacing: 12 | Stack of SwitchFields (space-y-3) |
| `Table` | table |  |  | Table(columns: […], rows: […]) or TableHeader/TableRow children · variant: .striped/.grid · dense: true · bleed: true |
| `TableBody` | group |  |  | Kept for source compatibility; put TableRow children directly in the Table |
| `TableCell` | text | content |  | TableCell("…") — a cell (or any view) |
| `TableHead` | group |  |  | Kept for source compatibility; put TableHeader children directly in the Table |
| `TableHeader` | tablecolumn | title |  | TableHeader("Amount", alignment: .trailing) |
| `TableRow` | tablerow |  |  | TableRow { TableCell(…) … } · selected: |
| `Tabs` | tabs |  | placement: "top" | Tailwind Plus underline tabs: Tabs(selection: "Billing") { Tab("Account") { … } … } · variant: .pills |
| `Text` | text | content |  | Text("…") — body copy in zinc-500 (Catalyst Text); Markdown inline **bold** `code` |
| `TextLink` | link | label |  | TextLink("docs") — underlined link |
| `Textarea` | textfield | placeholder | kind: "multiline" | Textarea("…", rows: 4) |
| `TouchTarget` | group |  |  | No-op wrapper kept for source compatibility |

<!-- end catalogue: tailwind -->

## carbon — IBM Carbon 11

<!-- catalogue: carbon — generate with `mockitdown elements carbon --markdown --own` -->

| Element | Role | Arguments | Defaults | Notes |
|---|---|---|---|---|
| `Accordion` | vstack |  | alignment: "stretch", spacing: 0 | Accordion { AccordionItem(title:, open: true) { … } } |
| `AccordionItem` | accordion | title |  |  |
| `ActionableNotification` | alert | title | closable: true, severity: "error" | Inline notification with an action: ActionableNotification(…) actions: { Button("Undo", kind: "tertiary", size: "sm") } |
| `AreaChart` | chart |  | kind: "area" |  |
| `AspectRatio` | zstack |  |  |  |
| `Breadcrumb` | breadcrumb | items |  | Breadcrumb(["Home", "Projects", "Atlas"]) or BreadcrumbItem children |
| `BreadcrumbItem` | link | label, href |  |  |
| `BubbleChart` | chart |  | kind: "bubble" |  |
| `Button` | button | label | variant: "primary" | Button("Create", kind: "secondary", size: "sm" / "md" / "lg" / "xl", renderIcon: "Add") — icon sits at the trailing edge |
| `ButtonSet` | toolbar |  | variant: "set" | Buttons side by side with no gap (secondary + primary) |
| `Checkbox` | checkbox | label |  | Checkbox("Email me", checked: true) · checked: "mixed" |
| `CheckboxGroup` | radiogroup | label |  | CheckboxGroup(legendText:) { Checkbox … } |
| `ClickableTile` | card | title | variant: "clickable" | Whole tile is a link (arrow at the bottom right) |
| `CodeSnippet` | code | code | lineNumbers: false | CodeSnippet("npm install @carbon/react", type: "single") — copy button at the end |
| `Column` | vstack |  | alignment: "stretch" | Grid column: Column(lg: 8) spans 8 of 16 columns |
| `ComboBox` | select | label |  |  |
| `ComboButton` | menu | label |  | Primary action with a chevron menu |
| `ComboChart` | chart |  | kind: "combo" |  |
| `ComposedModal` | dialog | title |  | ComposedModal(title:) { ModalBody { … } } actions: { Button(kind: "secondary"); Button } |
| `Content` | vstack |  | alignment: "stretch" | UI Shell main content area (32px padding) |
| `ContentSwitcher` | segmented | items |  | ContentSwitcher(selectedIndex: 0) { Switch("All"); Switch("Active") } · size: "sm" / "lg" |
| `CopyButton` | button | icon | icon: "doc.on.doc", iconOnly: true, variant: "ghost" |  |
| `DataTable` | table |  |  | DataTable(columns: [..], rows: [[..]], selectable: true, selectedRows: [1], sortColumn: 0, size: "md") — or TableRow/TableExpandRow children |
| `DataTableSkeleton` | skeleton |  | lines: 6 |  |
| `DatePicker` | datepicker | label | format: "numeric", placeholder: "mm/dd/yyyy" | DatePicker("Start date", value: "2026-11-23") |
| `DatePickerInput` | datepicker | label | format: "numeric", placeholder: "mm/dd/yyyy" |  |
| `DefinitionTooltip` | tooltip | text |  |  |
| `DismissibleTag` | chip | label | color: "gray", removable: true |  |
| `DonutChart` | chart |  | kind: "donut" |  |
| `Dropdown` | select | label |  | Dropdown("Plan", items: ["Lite", "Standard"], selectedItem: "Standard", open: true) |
| `ExpandableSearch` | textfield | placeholder | kind: "search" |  |
| `ExpandableTile` | card | title | variant: "expandable" | Chevron at the bottom right; include TileBelowTheFoldContent to show it expanded |
| `FileUploader` | card | title |  | FileUploader(labelTitle: "Upload files", labelDescription: "Max 500 kB") { FileUploaderButton("Add file"); FileUploaderItem("a.png", status: "complete") } |
| `FileUploaderButton` | button | label | size: "sm", variant: "primary" |  |
| `FileUploaderDropContainer` | dropzone | label |  | Dashed drop area: FileUploaderDropContainer("Drag and drop files here or click to upload") |
| `FileUploaderItem` | chip | label | removable: true, variant: "edit" | Uploaded file row: FileUploaderItem("report.pdf", status: "complete") |
| `FilterableMultiSelect` | select | label |  |  |
| `FlexGrid` | vstack |  | alignment: "stretch" |  |
| `Form` | form |  |  | Form { TextInput … } · fields stack with 24px gaps |
| `FormGroup` | section | title |  | FormGroup(legendText: "Contact") { … } |
| `FormItem` | vstack |  | alignment: "stretch" |  |
| `FormLabel` | text | content |  | 12px label-01 field label |
| `GaugeChart` | chart |  | kind: "gauge" |  |
| `Grid` | grid | columns |  | 16-column CSS Grid: Grid { Column(lg: 4) { … } } · .narrow() / .condensed() |
| `GroupedBarChart` | chart |  | kind: "bar" | GroupedBarChart(series: [[..], [..]], seriesNames:, labels:) |
| `Header` | appbar | subtitle |  | UI Shell header (48px, g100): Header("Cloud Console", prefix: "Acme", menu: true) { HeaderGlobalAction("Notification") } center: { HeaderNavigation { … } } |
| `HeaderGlobalAction` | button | icon | iconOnly: true | 48×48 header icon button: HeaderGlobalAction("Notification").badge(true) |
| `HeaderGlobalBar` | toolbar |  |  | Right-hand group of HeaderGlobalAction icons |
| `HeaderMenu` | menu | label |  | HeaderMenu("Manage", open: true) { HeaderMenuItem … } |
| `HeaderMenuButton` | button | icon | icon: "line.3.horizontal", iconOnly: true |  |
| `HeaderMenuItem` | button | label |  | Header link; .selected() / isCurrentPage: true marks the current page |
| `HeaderName` | text | content |  | Header product name (or use Header(prefix:)) |
| `HeaderNavigation` | toolbar |  |  | HeaderNavigation { HeaderMenuItem("Catalog").selected() … } |
| `HeaderPanel` | sidebar | title | variant: "panel" | Right-hand panel under the header (e.g. Switcher) |
| `Heading` | text | content | font: "heading03" | Heading("Deployments") — heading-03 (20px); font: "heading-05" etc. for other productive headings |
| `HeatmapChart` | chart |  | kind: "heatmap" |  |
| `HelperText` | text | content |  | 12px helper text under a control |
| `HistogramChart` | chart |  | kind: "histogram" |  |
| `IconButton` | button | icon | iconOnly: true, variant: "primary" | IconButton("Edit", kind: "ghost", size: "sm") |
| `InlineLoading` | progress | label | kind: "circular", size: "small" |  |
| `InlineNotification` | alert | title | closable: true, severity: "error" | InlineNotification(title: "Error", subtitle: "…", kind: "error" / "success" / "warning" / "info", lowContrast: true) |
| `Layer` | vstack |  | alignment: "stretch" | Raises nested components one layer (layer-02 / field-02) |
| `LineChart` | chart |  | kind: "line" |  |
| `Link` | link | label, href |  | Link("Learn more", icon: "ArrowRight") · size: "sm" / "lg" |
| `Loading` | progress |  | kind: "circular" | Spinner; size: "small" |
| `MenuButton` | menu | label |  | MenuButton("Actions", kind: "primary", open: true) { MenuItem … } |
| `MeterChart` | progress | label |  | Carbon Charts meter: a labelled proportion bar |
| `Modal` | dialog | title |  | Modal("Delete project?", buttons: ["Cancel", "Delete"], destructive: "Delete", closable: true) { body } |
| `ModalBody` | vstack |  | alignment: "stretch" |  |
| `MultiSelect` | select | label |  | MultiSelect("Tags", selectedItems: ["api", "web"]) — selected values show as tags |
| `NumberInput` | stepper | label |  | NumberInput("Replicas", value: 3) — field with − / + buttons |
| `OperationalTag` | chip | label | color: "gray" |  |
| `OrderedList` | list |  |  | OrderedList { ListItem("…") } — numbered |
| `OverflowMenu` | menu |  | icon: "ellipsis.vertical" | OverflowMenu(open: true) { OverflowMenuItem("Edit"); OverflowMenuItem("Delete", isDelete: true) } |
| `OverflowMenuItem` | menuitem | label |  |  |
| `Pagination` | pagination | summary | rowsPerPage: 10 | Carbon's bar: Pagination("31–40 of 97 items", page: 4, count: 10, pageSize: 10) |
| `PaginationNav` | pagination |  |  | Numbered page links: PaginationNav(page: 3, totalItems: 12) |
| `PasswordInput` | textfield | label | kind: "password", trailingIcon: "eye" |  |
| `PieChart` | chart |  | kind: "pie" |  |
| `ProgressBar` | progress | label |  | ProgressBar("Uploading", value: 60, showValue: true) · size: "small" |
| `ProgressIndicator` | steps | steps |  | ProgressIndicator(currentIndex: 1) { ProgressStep("Details") … } · errors: [2] |
| `ProgressStep` | text | label |  | Step of a ProgressIndicator: ProgressStep("Details", secondaryLabel: "Optional") |
| `RadarChart` | chart |  | kind: "radar" |  |
| `RadioButton` | radio | label |  |  |
| `RadioButtonGroup` | radiogroup | label |  | RadioButtonGroup(legendText: "Plan", options: [..], valueSelected: "Lite", orientation: .vertical) |
| `RadioTile` | card | title | variant: "radio" | Radio at the top right; .selected() |
| `ScatterChart` | chart |  | kind: "scatter" |  |
| `Search` | textfield | placeholder | kind: "search" | Search("Search", size: "lg") · value: shows the clear button |
| `Select` | select | label |  | Select("Region", value: "US South") { SelectItem("US South") … } |
| `SelectItem` | text | text |  | Option of a Select: SelectItem("US South") |
| `SelectableTag` | chip | label |  | SelectableTag("Python").selected() |
| `SelectableTile` | card | title | variant: "selectable" | Checkbox at the top right; .selected() outlines it |
| `SideNav` | sidebar | title |  | SideNav { SideNavLink("Dashboard", icon: "Dashboard").selected(); SideNavMenu("Manage") { SideNavMenuItem … } } |
| `SideNavDivider` | divider |  |  |  |
| `SideNavItems` | group |  |  |  |
| `SideNavLink` | navitem | label |  |  |
| `SideNavMenu` | navitem | label |  | Expandable SideNav category; expands when a child is selected or expanded: true |
| `SideNavMenuItem` | navitem | label |  |  |
| `SimpleBarChart` | chart |  | kind: "bar" | Carbon Charts: SimpleBarChart(values: [..], labels: [..]) |
| `SkeletonPlaceholder` | skeleton |  | lines: 0, shape: "rectangle" |  |
| `SkeletonText` | skeleton |  | lines: 3 |  |
| `Slider` | slider |  | showValue: true | Slider(labelText: "Budget", value: 40, min: 0, max: 100, minLabel: "0", maxLabel: "100") |
| `Stack` | vstack |  | alignment: "stretch" | Stack(gap: 16) · orientation: .horizontal for a row |
| `StackedAreaChart` | chart |  | kind: "area", stacked: true |  |
| `StackedBarChart` | chart |  | kind: "bar", stacked: true |  |
| `StructuredList` | table | columns |  | StructuredList(columns: [..]) { StructuredListRow { StructuredListCell("…") } } · selection: true for radio rows |
| `StructuredListCell` | text | content |  | Cell of a StructuredListRow; head: true for a header cell |
| `StructuredListRow` | tablerow |  |  |  |
| `StructuredListWrapper` | table | columns |  |  |
| `Switch` | text | text |  | Segment of a ContentSwitcher: Switch("Active") |
| `Switcher` | group |  |  |  |
| `SwitcherDivider` | divider |  |  |  |
| `SwitcherItem` | navitem | label |  |  |
| `Tab` | tab | label |  |  |
| `TabList` | tabs | items | placement: "top" |  |
| `TabPanel` | vstack |  | alignment: "stretch" |  |
| `Table` | table |  |  |  |
| `TableBatchAction` | button | label |  |  |
| `TableBatchActions` | toolbar | title |  | Blue batch bar shown when rows are selected: TableBatchActions("3 items selected") { TableBatchAction("Delete", renderIcon: "TrashCan"); Button("Cancel") } |
| `TableCell` | text | content |  | Cell inside TableRow / StructuredListRow |
| `TableContainer` | card | title |  | TableContainer(title: "Deployments", description: "…") { TableToolbar { … }; DataTable(…) } |
| `TableExpandRow` | tablerow |  | status: "collapsed" | Row with an expand chevron; follow it with TableExpandedRow { … } to show it expanded |
| `TableExpandedRow` | tablerow |  | status: "detail" | Full-width detail row under a TableExpandRow |
| `TableHeader` | tablecolumn | title |  |  |
| `TableRow` | tablerow |  |  |  |
| `TableToolbar` | toolbar |  |  | 48px toolbar above a DataTable: search, icon actions, primary button |
| `TableToolbarAction` | menuitem | label |  |  |
| `TableToolbarContent` | hstack |  | spacing: 0 |  |
| `TableToolbarMenu` | menu |  | icon: "gear" |  |
| `TableToolbarSearch` | textfield | placeholder | kind: "search", placeholder: "Search" |  |
| `Tabs` | tabs | items | placement: "top" | Tabs(selectedIndex: 0) { Tab("Overview") { panel } … } · .contained() |
| `Tag` | chip | label | color: "gray" | Tag("Running", type: "green") — red, magenta, purple, blue, cyan, teal, green, gray, cool-gray, warm-gray, high-contrast, outline · size: "sm" |
| `TextArea` | textfield | label | kind: "multiline" | TextArea("Notes", value:, rows: 4) |
| `TextInput` | textfield | label |  | TextInput("Email", placeholder:, helperText:, invalidText: "…", size: "sm" / "md" / "lg") |
| `Theme` | vstack | variant | alignment: "stretch" | Zoned theme: Theme("g100") { … } renders its content in that theme |
| `Tile` | card | title |  | Tile(title:) { … } — layer-01 surface, 16px padding, square |
| `TileAboveTheFoldContent` | vstack |  | alignment: "stretch" |  |
| `TileBelowTheFoldContent` | vstack |  | alignment: "stretch" | Present = ExpandableTile shown expanded |
| `TileGroup` | vstack |  | alignment: "stretch" | Group of RadioTiles |
| `TimePicker` | datepicker | label | kind: "time", placeholder: "hh:mm" |  |
| `ToastNotification` | toast | title | closable: true, position: "topTrailing", severity: "error" | ToastNotification(title:, subtitle:, kind:) { Text("caption") } — top-right; inline: true to place it |
| `Toggle` | toggle | label | offText: "Off", onText: "On" | Toggle("Notifications", toggled: true, size: "sm") |
| `Toggletip` | tooltip | text |  |  |
| `Tooltip` | tooltip | text |  | Tooltip("Copy") { IconButton … } · align: .bottom |
| `TreeNode` | treeitem | label |  |  |
| `TreeView` | tree | label |  |  |
| `TreemapChart` | chart |  | kind: "treemap" |  |
| `UnorderedList` | list |  |  | UnorderedList { ListItem("…") } — en-dash bullets |

<!-- end catalogue: carbon -->

## primer — GitHub Primer

<!-- catalogue: primer — generate with `mockitdown elements primer --markdown --own` -->

| Element | Role | Arguments | Defaults | Notes |
|---|---|---|---|---|
| `ActionList` | list |  |  | ActionList { ActionListItem("Edit", leadingVisual: "pencil", description:) ; ActionListDivider() } |
| `ActionListDivider` | divider |  |  |  |
| `ActionListGroup` | section | title |  | ActionList.Group("Assignees") { items } |
| `ActionListGroupHeading` | text | content |  |  |
| `ActionListItem` | listitem | title |  | ActionList.Item(label, leadingVisual:, trailingVisual: text, description:, selected:, variant: .danger) |
| `ActionListLinkItem` | listitem | title |  |  |
| `ActionMenu` | menu | label | variant: "default" | ActionMenu("Sort", open: true) { ActionMenuItem("Newest", checked: true) … } — anchor + overlay |
| `ActionMenuButton` | button | label | trailingIcon: "triangle-down", variant: "default" | ActionMenu.Button (closed menu trigger) |
| `ActionMenuDivider` | divider |  |  |  |
| `ActionMenuItem` | menuitem | label |  | Item inside an open ActionMenu: leadingVisual:, trailingVisual: "⌘C", checked:, variant: .danger |
| `Autocomplete` | select | placeholder | variant: "autocomplete" | Autocomplete("Search users", text: "mo", open: true) { AutocompleteItem("mona") } |
| `AutocompleteItem` | label | title |  |  |
| `Avatar` | avatar | name |  | Avatar("Mona Lin", image:, size: 20…64, square: true for orgs/bots) |
| `AvatarPair` | zstack |  |  | Large avatar with a small one at the bottom right |
| `AvatarStack` | hstack |  | spacing: 0 | Overlapping avatars: AvatarStack { Avatar … } |
| `AvatarToken` | chip | text |  | AvatarToken("mona", avatar: "Mona Lin") |
| `Banner` | alert | title |  | Banner("Title", description:, variant: .info/.success/.warning/.critical/.upsell) { actions } |
| `Blankslate` | emptystate | title |  | Blankslate("No issues", systemImage: "issue-opened", description:, border: true) { primary / secondary actions } |
| `BlobView` | code | code |  |  |
| `Blockquote` | text | content |  |  |
| `BorderBox` | card | title | variant: "borderbox" | Box with border and rounded corners; header: title; children are rows (Box-row) |
| `Box` | vstack |  |  | Generic container (Box): style it with modifiers; children stack vertically |
| `BoxRow` | hstack |  | spacing: 8 | A Box-row inside a BorderBox (bordered row) |
| `BranchName` | text | content |  | BranchName("feature/login") — monospace accent chip |
| `Breadcrumbs` | breadcrumb | items |  | Breadcrumbs(items: ["acme", "rocket", "src"]) |
| `BreadcrumbsItem` | link | label |  |  |
| `Button` | button | label | variant: "default" | Button("Save", variant: .primary, size: .small/.medium/.large, leadingVisual: "plus", count: 3, trailingAction: "triangle-down") |
| `ButtonGroup` | toolbar |  | variant: "group" | Joined buttons: ButtonGroup { Button; IconButton } |
| `Checkbox` | checkbox | label |  | Checkbox("Require review", checked: true) |
| `CheckboxGroup` | vstack |  | alignment: "leading", spacing: 8 |  |
| `CircleBadge` | avatar | name |  | Round badge with an icon (systemImage:) |
| `CodeView` | code | code |  | Blob view: CodeView("…", language: "ts", highlight: [4], title: "src/app.ts") |
| `CommentBox` | card | title | variant: "comment" |  |
| `ConfirmationDialog` | dialog | title | variant: "confirmation" | ConfirmationDialog("Delete branch?", buttons: ["Cancel", "Delete"], destructive: "Delete") { body } |
| `Counter` | badge | text | variant: "secondary" | Counter(12) or Counter(count: 3, scheme: .primary) |
| `CounterLabel` | badge | text | variant: "secondary" |  |
| `DataTable` | table |  |  | DataTable(columns: […], rows: [[…]]) — bordered Primer table; title: and footer: |
| `Details` | accordion | title |  | Details/summary disclosure |
| `Dialog` | dialog | title | closable: true | Dialog("Title", subtitle:) { body } footer: { Button … } |
| `DiffCode` | text | content |  | Code cell of a DiffLine (monospace, keeps spaces) |
| `DiffFile` | card | title | variant: "diff" | File in a diff: DiffFile("src/app.ts", subtitle: "+12 −3") { DiffHunk(…); DiffLine(…) } action: { … } |
| `DiffHunk` | hstack |  | spacing: 0, variant: "hunk" | @@ hunk header row: DiffHunk { DiffNumber(""); DiffNumber(""); DiffCode("@@ -10,6 +10,8 @@") } |
| `DiffLine` | hstack |  | spacing: 0, variant: "context" | One diff row: DiffLine(variant: .addition) { DiffNumber(""); DiffNumber("14"); DiffCode("+ …") } |
| `DiffNumber` | text | content |  | Line-number gutter cell of a DiffLine |
| `Disclosure` | accordion | title |  |  |
| `Flash` | alert | title |  | Flash("Saved", variant: .default/.success/.warning/.danger, full: true) |
| `FormControl` | vstack |  | alignment: "stretch", spacing: 4 | FormControl { FormControlLabel("Name"); TextInput(…); FormControlCaption("…") } |
| `FormControlCaption` | text | content |  | FormControl.Caption (12px muted) |
| `FormControlLabel` | text | content |  | FormControl.Label (14px semibold) |
| `FormControlValidation` | text | content |  | FormControl.Validation("…", variant: .error/.success) |
| `Header` | appbar | title |  | Global header: Header("acme / rocket", logo: "cube", search: "Type / to search", avatar: "Mona") { actions } |
| `HeaderItem` | hstack |  | spacing: 8 | Header.Item |
| `HeaderLink` | link | label |  | Header.Link |
| `Heading` | text | content | style: "titleMedium" | Heading("Title", variant: .large / .medium / .small) |
| `IconButton` | button | icon | iconOnly: true, variant: "default" | IconButton("kebab-horizontal", variant: .invisible, "aria-label" via label:) |
| `InlineMessage` | text | content |  | InlineMessage("Check your token", variant: .critical/.warning/.success/.unavailable) |
| `IssueLabel` | badge | text | color: "gray", variant: "issue" | Repository label: IssueLabel("bug", color: .red) — tinted pill (named colours) |
| `IssueLabelToken` | badge | text | color: "gray", variant: "issue" |  |
| `Kbd` | kbd | keys |  | Keyboard key: Kbd("/") |
| `Label` | badge | text | variant: "default" | Label("Public", variant: .success, size: .small/.large) |
| `Link` | link | label, destination |  | Link("Docs", muted: true) or variant: .muted |
| `LinkButton` | button | label | variant: "default" | A link styled as a Button |
| `Markdown` | vstack |  | alignment: "leading", spacing: 16 | Rendered Markdown body (markdown-body): spacing 16, headings with rules |
| `NavList` | vstack |  | alignment: "stretch", spacing: 2 | NavList { NavListItem("General", leadingVisual: "gear").selected(); NavListGroup("Access") { … } } |
| `NavListDivider` | divider |  |  |  |
| `NavListGroup` | section | title |  | NavList.Group("Code and automation") { items } |
| `NavListGroupHeading` | text | content |  |  |
| `NavListItem` | navitem | label |  | NavList.Item(label, leadingVisual:, trailingVisual: count, selected:) — nested items = SubNav |
| `Octicon` | icon | name |  | Octicon("git-branch", size: 16) — Octicon names are aliased |
| `Overlay` | card | title | variant: "overlay" | Floating overlay surface |
| `PageHeader` | vstack |  | alignment: "stretch", spacing: 8 | PageHeader { PageHeaderContextArea; PageHeaderTitleArea { PageHeaderTitle; PageHeaderActions }; PageHeaderDescription } |
| `PageHeaderActions` | hstack |  | spacing: 8 | Right-aligned actions of the title row |
| `PageHeaderContextArea` | hstack |  | spacing: 8 | Parent link / breadcrumbs above the title |
| `PageHeaderDescription` | hstack |  | spacing: 8 | Muted metadata row under the title |
| `PageHeaderLeadingAction` | hstack |  | spacing: 4 |  |
| `PageHeaderLeadingVisual` | hstack |  | spacing: 4 |  |
| `PageHeaderNavigation` | vstack |  | alignment: "stretch", spacing: 0 | Holds an UnderlineNav under the header |
| `PageHeaderParentLink` | link | label | systemImage: "arrow-left" | Back link in the context area |
| `PageHeaderTitle` | text | content | style: "titleMedium" | PageHeader.Title (variant: .large / .medium / .subtitle) |
| `PageHeaderTitleArea` | hstack |  | spacing: 8 | Title row: leading visual, title, trailing visual, actions |
| `PageHeaderTrailingAction` | hstack |  | spacing: 4 |  |
| `PageHeaderTrailingVisual` | hstack |  | spacing: 4 |  |
| `PageLayout` | vstack |  | alignment: "stretch", spacing: 0 | PageLayout { PageLayoutHeader; PageLayoutContentRow { PageLayoutPane; PageLayoutContent } } |
| `PageLayoutContent` | vstack |  | alignment: "stretch", spacing: 16 | PageLayout.Content |
| `PageLayoutContentRow` | hstack |  | alignment: "top", spacing: 0 | Row holding the pane and the content (pane on either side) |
| `PageLayoutFooter` | vstack |  | alignment: "stretch", spacing: 8 | PageLayout.Footer |
| `PageLayoutHeader` | vstack |  | alignment: "stretch", spacing: 8 | PageLayout.Header |
| `PageLayoutPane` | vstack |  | alignment: "stretch", spacing: 8 | PageLayout.Pane (296px side column); divider: true draws the line |
| `Pagination` | pagination |  |  | Pagination(pageCount: 12, currentPage: 3) — Previous / pages / Next |
| `Popover` | card | title | variant: "popover" | Popover with caret |
| `ProgressBar` | progress | value |  | ProgressBar(progress: 60) of 100 |
| `Radio` | radio | label |  |  |
| `RadioGroup` | radiogroup | label |  |  |
| `RelativeTime` | text | content |  | RelativeTime("3 days ago") — muted, dotted hover underline |
| `SegmentedControl` | segmented | items |  | SegmentedControl { SegmentedControlButton("Preview").selected(); … } or items:, selection: |
| `SegmentedControlButton` | label | title |  | SegmentedControl.Button("Raw", leadingIcon:, selected:) |
| `SegmentedControlIconButton` | label | icon | labelStyle: "iconOnly" | SegmentedControl.IconButton(icon: "eye", ariaLabel via title:) |
| `Select` | select | placeholder |  | Native select: Select(selection: "main") { SelectOption("main") } |
| `SelectOption` | text | content |  |  |
| `SelectPanel` | menu | label | variant: "default" | Filterable selection overlay: SelectPanel("Labels", open: true) { TextInput; ActionMenuItem(checked:) } |
| `SkeletonAvatar` | skeleton |  | shape: "circle" |  |
| `SkeletonBox` | skeleton |  | shape: "rectangle" |  |
| `SkeletonText` | skeleton |  | lines: 1 |  |
| `Snippet` | code | code | lineNumbers: false | Clipboard-copy snippet (markdown code block) |
| `Spinner` | progress |  | variant: "spinner" | Spinner(size: .small/.medium/.large) |
| `SplitPageLayout` | hstack |  | alignment: "top", spacing: 0 | SplitPageLayout { SplitPageLayoutPane; SplitPageLayoutContent } (settings pages) |
| `SplitPageLayoutContent` | vstack |  | alignment: "stretch", spacing: 16 | SplitPageLayout.Content |
| `SplitPageLayoutPane` | vstack |  | alignment: "stretch", spacing: 8 | SplitPageLayout.Pane |
| `Stack` | vstack |  | alignment: "stretch", spacing: 16 | Stack (vertical, gap normal); use StackHorizontal or HStack for a row |
| `StackHorizontal` | hstack |  | spacing: 8 | Stack with direction="horizontal" |
| `StackItem` | vstack |  |  | Stack.Item |
| `StateLabel` | badge | text | variant: "open" | StateLabel("Open", status: .issueOpened / .issueClosed / .pullOpened / .pullMerged / .pullClosed / .draft, size: .small) |
| `SubNav` | toolbar |  | variant: "subnav" | Joined pill links: SubNav { SubNavLink("Labels").selected() } |
| `SubNavLink` | button | label | variant: "subnav" |  |
| `TabNav` | tabs | items | placement: "top", variant: "tabnav" | Boxed tabs (TabNav): TabNav(items: ["Write", "Preview"], selection: "Write") |
| `TabNavLink` | tab | label |  |  |
| `Table` | table |  |  |  |
| `TableContainer` | vstack |  | alignment: "stretch", spacing: 8 |  |
| `TableSubtitle` | text | content |  |  |
| `TableTitle` | text | content |  |  |
| `Terminal` | code | code | variant: "terminal" |  |
| `Text` | text | content |  | Text("…", size: .small/.medium/.large, weight: .light/.normal/.medium/.semibold) · .foregroundStyle(.secondary) |
| `TextInput` | textfield | placeholder |  | TextInput("Find a file…", value:, leadingVisual: "search", size: .small/.medium/.large) |
| `TextInputWithTokens` | select | placeholder |  | TextInputWithTokens("Add topics", selection: ["react", "css"]) |
| `Textarea` | textfield | placeholder | kind: "multiline" | Textarea("Leave a comment", value:, rows: 5) |
| `Timeline` | timeline |  |  | Timeline { TimelineItem("…", systemImage: "git-commit", time:) } |
| `TimelineBreak` | divider |  |  |  |
| `TimelineComment` | card | title | variant: "comment" | Issue/PR comment box: TimelineComment("**mona** commented 2 days ago", avatar: "Mona") { body } action: { … } |
| `TimelineItem` | timelineitem | title |  | Timeline.Item(title, systemImage: octicon, time:, description:, status: .open/.closed/.merged/.done, variant: .condensed) |
| `ToggleSwitch` | toggle | label | offText: "Off", onText: "On" | ToggleSwitch("Notifications", checked: true) — On/Off text, size: .small |
| `Token` | chip | text |  | Token("design", onRemove: true, size: .small/.medium/.large/.xlarge) |
| `Tooltip` | tooltip | text | placement: "top" | Tooltip("Copy", direction: .s) { IconButton } |
| `TreeView` | tree |  |  | TreeView { TreeViewItem("src", folder: true) { TreeViewItem("index.ts", systemImage: "file") } } |
| `TreeViewItem` | treeitem | label |  | TreeView.Item(label, folder:, expanded:, leadingVisual:, current: true) |
| `TreeViewSubTree` | group |  |  |  |
| `Truncate` | text | content |  | Single-line text cut with an ellipsis (maxWidth via .frame) |
| `UnderlineNav` | tabs | items | placement: "top", variant: "underline" | UnderlineNav { UnderlineNavItem("Code", leadingVisual: "code", counter: 3).selected() } |
| `UnderlineNavItem` | tab | label |  | UnderlineNav.Item(label, leadingVisual:, counter:, selected:) |
| `UnderlinePanels` | tabs | items | placement: "top", variant: "underline" | Tabs with panels: UnderlinePanels { UnderlinePanelsTab("Code") { panel } } |
| `UnderlinePanelsTab` | tab | label |  |  |

<!-- end catalogue: primer -->

## vuetify — Vuetify 3

<!-- catalogue: vuetify — generate with `mockitdown elements vuetify --markdown --own` -->

| Element | Role | Arguments | Defaults | Notes |
|---|---|---|---|---|
| `Td` | text | content |  | Td("value") — a table cell |
| `Tr` | tablerow |  |  | A table row (children are cells) |
| `VAlert` | alert | message | variant: "flat" | VAlert("Saved.", type: "success", title:, variant: "tonal" / "outlined" / "flat", closable: true, density:) |
| `VAlertTitle` | text | content |  | Bold first line of a VAlert |
| `VApp` | vstack |  | alignment: "stretch", spacing: 0 | Root of every Vuetify app: a full-height column on the theme background |
| `VAppBar` | appbar | title |  | VAppBar(title: "Inbox", color: "primary", density: "compact") { VBtn(icon: "mdi-magnify") } — 64px top bar, elevation 4; leading: { VAppBarNavIcon() } |
| `VAppBarNavIcon` | button |  | icon: "mdi-menu", iconOnly: true, variant: "text" | The ☰ icon button at the start of a VAppBar |
| `VAppBarTitle` | text | content |  | Title text of a VAppBar (1.25rem) |
| `VAutocomplete` | select | label | variant: "filled" | VAutocomplete("State", items: [..], modelValue: [..]) — filterable select; multiple values render chips |
| `VAvatar` | avatar | name |  | VAvatar(image: "avatar-1.svg", size: 40) · VAvatar("Ana Lima", color: "primary") · VAvatar(icon: "mdi-account", rounded: 0) |
| `VBadge` | badge | content |  | VBadge(content: 6, color: "error") { VIcon("mdi-bell") } · dot: true |
| `VBanner` | alert | message | severity: "info" | VBanner("No internet connection", icon: "mdi-wifi-strength-alert-outline") actions: { VBtn("Retry", variant: "text") } — full-width strip with a bottom border |
| `VBannerActions` | hstack |  |  | Action buttons of a VBanner |
| `VBannerText` | text | content |  | Text of a VBanner |
| `VBottomNavigation` | tabs |  | placement: "bottom" | VBottomNavigation(value: 0, color: "primary", items: [["title": "Home", "icon": "mdi-home"], …]) — 56px bar, icon above label (or VTab children) |
| `VBottomSheet` | dialog | title | variant: "sheet" | VBottomSheet { VList … } — sheet sliding up from the bottom |
| `VBreadcrumbs` | breadcrumb | items |  | VBreadcrumbs(items: ["Dashboard", "Orders", "#10423"], divider: "/") |
| `VBreadcrumbsItem` | link | label |  | One item of a VBreadcrumbs |
| `VBtn` | button | label | variant: "elevated" | VBtn("Save", color: "primary", variant: "tonal", size: "small", density: "compact", rounded: "pill", prependIcon: "mdi-content-save") · VBtn(icon: "mdi-heart") |
| `VBtnGroup` | toolbar |  | variant: "elevated" | VBtnGroup(variant: "outlined", divided: true) { VBtn … } — joined buttons |
| `VBtnToggle` | toolbar |  | variant: "text" | VBtnToggle(variant: "outlined", divided: true) { VBtn(icon: "mdi-format-bold").selected() … } — joined toggle buttons |
| `VCard` | card | title | variant: "elevated" | VCard(title:, subtitle:, prependIcon:, image:, variant: "outlined") { VCardText … } actions: { VBtn("Ok", variant: "text") } |
| `VCardActions` | hstack |  | spacing: 8 | VCardActions { VSpacer(); VBtn("Cancel", variant: "text") … } — 8px-padded button row |
| `VCardItem` | vstack |  | alignment: "stretch" | Header block of a VCard (title, subtitle, prepend/append) |
| `VCardSubtitle` | text | content |  | VCardSubtitle("…") — medium-emphasis 0.875rem line under the title |
| `VCardText` | vstack | text | alignment: "stretch" | VCardText { … } — 16px-padded body of a VCard (0.875rem) |
| `VCardTitle` | text | content |  | VCardTitle("Title") — 1.25rem / 500 heading of a VCard |
| `VCarousel` | image | src |  | VCarousel("photo.svg") — slideshow (shows its first slide) |
| `VCarouselItem` | image | src |  | VCarouselItem(src: "photo.svg") |
| `VCheckbox` | checkbox | label |  | VCheckbox("Remember me", modelValue: true, color: "primary", density: "compact") |
| `VCheckboxBtn` | checkbox | label |  | The bare checkbox control (no label) |
| `VChip` | chip | label | variant: "tonal" | VChip("Active", color: "success", variant: "tonal" / "flat" / "outlined" / "elevated" / "text", size: "small", closable: true, prependIcon:, label: true) |
| `VChipGroup` | hstack |  | spacing: 8 | VChipGroup(selectedClass: "text-primary", column: true) { VChip … } |
| `VCode` | code | code |  | Inline code |
| `VCol` | vstack | size | alignment: "stretch" | VCol(cols: 6) — column spanning cols/12 of a VRow (cols: 0 = auto grow) |
| `VColorPicker` | swatches |  |  | Colour picker (swatch grid) |
| `VCombobox` | select | label | variant: "filled" | VCombobox("Tags", items: [..], modelValue: [..], chips: true) — select that accepts new values |
| `VConfirmEdit` | hstack |  |  | Save / Cancel wrapper around an editable value |
| `VContainer` | vstack |  | alignment: "stretch" | Centered, padded (16px) content column; fluid: true for full width |
| `VDataIterator` | vstack |  | alignment: "stretch" | Custom layout over items with the data-table plumbing |
| `VDataTable` | table |  |  | VDataTable(headers: [..], items: [[..]], search:, sortBy: 2, showSelect: true, selectedRows: [1], itemsPerPage: 10) — sortable table with footer |
| `VDataTableFooter` | pagination | summary |  | VDataTableFooter("Items per page:  10 ▾     1-10 of 42") — the table footer with first/prev/next/last |
| `VDataTableServer` | table |  |  | Server-side VDataTable (same look) |
| `VDataTableVirtual` | table |  |  | Virtualised VDataTable (no footer) |
| `VDateInput` | datepicker | label | variant: "filled" | VDateInput("Delivery date", modelValue: "2026-11-23") — text field opening a VDatePicker |
| `VDatePicker` | calendar |  |  | VDatePicker(modelValue: "2026-11-23", title: "Select date", showAdjacentMonths: true) |
| `VDefaultsProvider` | group |  |  | Sets default props for its subtree (renders its children) |
| `VDialog` | dialog | title |  | VDialog(title: "Delete file?", maxWidth: 400) { VCardText … } actions: { VBtn … } — modal card over a scrim |
| `VDivider` | divider |  |  | VDivider() · VDivider(vertical: true) · inset: true · thickness: |
| `VEmptyState` | emptystate | title |  | VEmptyState(headline: "No orders yet", title:, text:, icon: "mdi-cart") { VBtn … } |
| `VExpansionPanel` | accordion | title |  | VExpansionPanel(title: "Shipping", text: "…", expanded: true) { content } |
| `VExpansionPanelText` | vstack |  | alignment: "stretch" | Body of a VExpansionPanel |
| `VExpansionPanelTitle` | text | content |  | Header of a VExpansionPanel |
| `VExpansionPanels` | vstack |  | alignment: "stretch", spacing: 0 | VExpansionPanels(variant: "accordion" / "inset" / "popout") { VExpansionPanel(title:, text:) … } |
| `VFab` | fab | icon | color: "primary" | VFab(icon: "mdi-plus", color: "primary") · extended: VFab(icon:, label: "Compose") |
| `VField` | textfield | label | variant: "filled" | The bare field box of an input |
| `VFileInput` | textfield | label | icon: "mdi-paperclip", variant: "filled" | VFileInput("Attachment", modelValue: "report.pdf", chips: true) — file field with a paperclip prepend icon |
| `VFileUpload` | dropzone | label |  | VFileUpload(title: "Drag and drop files") — drop zone with browse button |
| `VFooter` | toolbar |  |  | VFooter(border: true) { Text("© 2026 Acme") } — footer bar at the bottom of the app |
| `VForm` | vstack |  | alignment: "stretch" | VForm { VTextField … } — a column of fields with 8px gaps |
| `VHotkey` | kbd | keys |  | Keyboard shortcut display |
| `VHover` | group |  |  | Hover state provider (renders its children) |
| `VIcon` | icon | name |  | VIcon("mdi-home", color: "primary", size: "large") — Material Design Icons by name |
| `VIconBtn` | button | icon | iconOnly: true, variant: "text" | VIconBtn(icon: "mdi-cog") — compact icon-only button |
| `VImg` | image | src |  | VImg(src: "photo.svg", height: 200, cover: true) |
| `VInfiniteScroll` | scroll |  |  | VInfiniteScroll(height: 300) { items … VProgressCircular } — scroll area that loads more at its end |
| `VInput` | textfield | label | variant: "plain" | Base input wrapper |
| `VItem` | group |  |  | One selectable item of a VItemGroup |
| `VItemGroup` | hstack |  |  | Selection group around VItem children |
| `VKbd` | kbd | keys |  | VKbd("Ctrl") — keyboard key |
| `VLabel` | text | content |  | Medium-emphasis form label |
| `VLayout` | hstack |  | alignment: "top", spacing: 0 | Layout container for app bar / drawer / main (row; nest VLayout for columns) |
| `VLazy` | group |  |  | Renders its children when visible |
| `VList` | list |  |  | VList(nav: true, density: "compact", lines: "two") { VListSubheader("…"); VListItem(title:, subtitle:, prependIcon:) } |
| `VListGroup` | navitem | label |  | VListGroup("Admin", prependIcon:, expanded: true) { VListItem … } — collapsible group in a nav list |
| `VListImg` | image | src |  | Image inside a VList |
| `VListItem` | listitem | title |  | VListItem(title: "Inbox", subtitle:, prependIcon: "mdi-inbox", value:, active: true) — 48px row; prepend: / append: slots |
| `VListItemAction` | hstack |  |  | Trailing action area of a VListItem |
| `VListItemSubtitle` | text | content |  | Subtitle text of a VListItem |
| `VListItemTitle` | text | content |  | Title text of a VListItem |
| `VListSubheader` | text | content |  | VListSubheader("REPORTS") — 0.875rem / 500 label inside a VList |
| `VLocaleProvider` | group |  |  | Applies a locale to its subtree |
| `VMain` | vstack |  | alignment: "stretch" | Main content area beside VNavigationDrawer and under VAppBar |
| `VMenu` | menu | label |  | VMenu("Options", open: true) { VListItem(title: "Edit", prependIcon: "mdi-pencil") … } · VMenu(icon: "mdi-dots-vertical") |
| `VMessages` | text | content |  | Hint / error line under a control |
| `VNavigationDrawer` | sidebar | title |  | VNavigationDrawer(title:) { VList(nav: true) { VListItem(title:, prependIcon:) } } — 256px drawer; rail: true for 56px |
| `VNoSsr` | group |  |  | Client-only children |
| `VNumberInput` | textfield | label | trailingIcon: "mdi-unfold-more-horizontal", variant: "filled" | VNumberInput("Quantity", modelValue: 2) — number field with − / + controls |
| `VOtpInput` | textfield | label | variant: "outlined" | One-time-code field |
| `VOverlay` | dialog |  | variant: "backdrop" | Scrim with centred content |
| `VPagination` | pagination |  |  | VPagination(length: 10, modelValue: 2, totalVisible: 7, rounded: "circle", activeColor: "primary") |
| `VParallax` | image | src |  | VParallax(src:) — scrolling background image |
| `VProgressCircular` | progress |  | kind: "circular" | VProgressCircular(modelValue: 70, size: 48, width: 4, color: "primary") · indeterminate: true |
| `VProgressLinear` | progress |  |  | VProgressLinear(modelValue: 40, color: "primary", height: 6, rounded: true) · indeterminate: true |
| `VRadio` | radio | label |  | VRadio("Express", value:) inside VRadioGroup |
| `VRadioGroup` | radiogroup | label |  | VRadioGroup("Shipping", items: [..], modelValue: "Express", inline: true) — or VRadio children |
| `VRangeSlider` | slider | label |  | VRangeSlider(modelValue: [20, 60], max: 100) |
| `VRating` | rating | value |  | VRating(modelValue: 3.5, halfIncrements: true, color: "amber", density: "compact", size: "small") |
| `VResponsive` | vstack |  | alignment: "stretch" | Aspect-ratio box |
| `VRow` | hstack |  | alignment: "top" | Flex row of VCol in a 12-column grid (24px gutters) |
| `VSelect` | select | label | variant: "filled" | VSelect("Country", items: ["France", "Peru"], modelValue: "Peru", chips: true, multiple: true, open: true) |
| `VSheet` | card |  | elevation: 0 | VSheet(elevation: 2, rounded: true, color:) { … } — plain surface with no padding |
| `VSkeletonLoader` | skeleton |  |  | VSkeletonLoader(type: "list-item-avatar") — use avatar: true, lines: 3, image: true |
| `VSlideGroup` | hstack |  |  | Horizontally scrolling group with arrows |
| `VSlideGroupItem` | group |  |  | One item of a VSlideGroup |
| `VSlider` | slider | label |  | VSlider(modelValue: 40, min: 0, max: 100, step: 10, thumbLabel: true, color:) |
| `VSnackbar` | toast | message |  | VSnackbar("Saved", action: "Undo", color:, location: .bottom) — 344px dark message bar |
| `VSnackbarQueue` | toast | message |  | A queue of VSnackbar messages (shows the first) |
| `VSpacer` | spacer |  |  | Flexible space in a VToolbar, VCardActions or VRow |
| `VSparkline` | chart | values | kind: "sparkline" | VSparkline(modelValue: [1, 4, 2, 6], color: "primary", fill: true, smooth: true) — trend line |
| `VSpeedDial` | fab | icon | color: "primary" | Fab that opens a list of action buttons |
| `VStepper` | steps | steps |  | VStepper(items: ["Cart", "Shipping", "Payment"], modelValue: 1, altLabels: true) — numbered header; modelValue is the 0-based current step |
| `VStepperActions` | hstack |  |  | VStepperActions() — Previous / Next buttons of a VStepper |
| `VStepperHeader` | hstack |  |  | Header row of a VStepper |
| `VStepperItem` | text | content |  | One step of a VStepperHeader |
| `VStepperVertical` | steps | steps | orientation: "vertical" | Vertical stepper |
| `VStepperWindow` | vstack |  | alignment: "stretch" | Pane area of a VStepper |
| `VStepperWindowItem` | vstack |  | alignment: "stretch" | One step's pane |
| `VSubheader` | text | content |  | Section label (Vuetify 2 name; use VListSubheader) |
| `VSwitch` | toggle | label |  | VSwitch("Wi-Fi", modelValue: true, color: "primary", inset: true, hideDetails: true) |
| `VSystemBar` | toolbar |  | density: "compact" | VSystemBar { VIcon("mdi-wifi") … } — 24px status strip at the top of a mobile app |
| `VTab` | tab | label |  | VTab("Favorites", prependIcon: "mdi-heart") { pane } |
| `VTable` | table |  |  | VTable(density:) { thead/tbody as TableRow children } — or columns:, rows: |
| `VTabs` | tabs | items | placement: "top" | VTabs(value: 0, color: "primary", grow: true, alignTabs: "center") { VTab("Profile", prependIcon:) … } or VTabs(items: [..]) |
| `VTabsWindow` | vstack |  | alignment: "stretch" | Panes of a VTabs |
| `VTabsWindowItem` | vstack |  | alignment: "stretch" | One pane of a VTabsWindow |
| `VTextField` | textfield | label | variant: "filled" | VTextField("Email", modelValue:, variant: "outlined", density: "compact", prependInnerIcon:, hint:, errorMessages: "…", clearable: true) |
| `VTextarea` | textfield | label | kind: "multiline", variant: "filled" | VTextarea("Notes", rows: 3, counter: 200, autoGrow: true) |
| `VThemeProvider` | group |  |  | Applies a theme to its subtree (renders its children) |
| `VTimePicker` | datepicker | label | kind: "time", variant: "filled" | Time picker field |
| `VTimeline` | timeline |  |  | VTimeline(side: "end", density: "compact") { VTimelineItem("Order placed", dotColor: "primary") } |
| `VTimelineItem` | timelineitem | title |  | VTimelineItem("Shipped", time:, description:, dotColor: "success", icon:) |
| `VToolbar` | toolbar | title |  | VToolbar(title:, color:, density:) { VBtn … } — 64px bar (surface-light by default) |
| `VToolbarItems` | hstack |  | spacing: 0 | Full-height buttons inside a VToolbar |
| `VToolbarTitle` | text | content |  | Title text of a VToolbar |
| `VTooltip` | tooltip | text |  | VTooltip("Delete", location: .bottom) { VBtn(icon: "mdi-delete") } |
| `VTreeview` | tree |  |  | VTreeview { VTreeviewItem("src", expanded: true) { … } } — hierarchical list |
| `VTreeviewItem` | treeitem | label |  | VTreeviewItem("main.ts", icon: "mdi-language-typescript", expanded:, selected:) |
| `VVirtualScroll` | scroll |  |  | Virtualised scroll area of items |
| `VWindow` | vstack |  | alignment: "stretch" | VWindow { VWindowItem { … } } — the visible pane of a VTabs/VStepper |
| `VWindowItem` | vstack |  | alignment: "stretch" | One pane of a VWindow / VTabsWindow |

<!-- end catalogue: vuetify -->

## prime — PrimeVue 4 · PrimeNG (Aura)

<!-- catalogue: prime — generate with `mockitdown elements prime --markdown --own` -->

| Element | Role | Arguments | Defaults | Notes |
|---|---|---|---|---|
| `Accordion` | vstack |  | alignment: "stretch", spacing: 0 | Accordion { AccordionPanel("Header I", expanded: true) { … } … } |
| `AccordionContent` | group |  |  | Transparent wrapper |
| `AccordionPanel` | accordion | header |  | AccordionPanel("Header I", expanded: true) { AccordionContent } |
| `AccordionTab` | accordion | header |  | Pre-v4 name of AccordionPanel |
| `AutoComplete` | select | placeholder |  | AutoComplete("Search", selection:, options:, open: true, dropdown: true) |
| `Avatar` | avatar | label |  | Avatar(label: "P", image: "…", icon: "pi pi-user", shape: "circle", size: "large"/"xlarge") |
| `AvatarGroup` | hstack |  | spacing: 0 | AvatarGroup { Avatar(shape: "circle") … } — overlapped |
| `Badge` | badge | value |  | Badge(value: 4, severity: "danger", size: "large") · Badge() is a dot |
| `BlockUI` | zstack |  |  | BlockUI(blocked: true) { content } — masks its content |
| `Breadcrumb` | breadcrumb | items |  | Breadcrumb(items: ["Electronics", "Computer", "Accessories"]) · Breadcrumb { Icon("pi pi-home"); Text(…) } |
| `Button` | button | label |  | Button("Save", icon: "pi pi-check", severity: "secondary"/"success"/"info"/"warn"/"help"/"danger"/"contrast", variant: "outlined"/"text"/"link", rounded: true, raised: true, size: "small"/"large", loading:, badge:, iconPos: "right" |
| `ButtonGroup` | toolbar |  | variant: "group" | ButtonGroup { Button … } — joined buttons |
| `Calendar` | calendar |  |  | Calendar(selection: "2026-11-24") — the inline DatePicker panel (pre-v4 name) |
| `Card` | card | title |  | Card(title: "Advanced Card", subtitle: "Card subtitle", image: "…") { content } footer: { Button … } |
| `Carousel` | hstack |  | spacing: 7 | Carousel { Button(icon: "pi pi-chevron-left", variant: "text", rounded: true); CarouselItem … } + CarouselIndicators |
| `CarouselIndicators` | segmented | items | variant: "indicators" | CarouselIndicators(items: ["", "", ""], selection: 0) |
| `CarouselItem` | card | title | variant: "carousel" | CarouselItem("Bamboo Watch", image: "…") { price, Tag, buttons } |
| `CascadeSelect` | select | placeholder |  | CascadeSelect("Select a City", selection: "Sydney", options:) |
| `Chart` | chart |  |  | Chart(type: "bar"/"line"/"pie"/"doughnut"/"polarArea"/"radar", series:, labels:, seriesNames:) — Chart.js look |
| `Checkbox` | checkbox | label |  | Checkbox("Remember me", checked: true) · checked: "indeterminate" · invalid: |
| `Chip` | chip | label |  | Chip("Amy Elsner", avatar: "Amy Elsner", avatarImage: "…", icon:, removable: true) |
| `ColorPicker` | swatches | colors |  | ColorPicker(colors: ["#10b981"], selection: 0) — the swatch trigger; several colours make a palette |
| `Column` | tablecolumn | header |  | Column(header: "Price", alignment: .trailing) |
| `ConfirmDialog` | dialog | header | buttons: ["Cancel", "Save"], closable: true, icon: "pi-exclamation-triangle", variant: "confirm" | ConfirmDialog(header: "Confirmation", message: "Are you sure you want to proceed?", buttons: ["Cancel", "Delete"], destructive: "Delete", icon:) |
| `ConfirmPopup` | tooltip | message | placement: "bottom" | ConfirmPopup(message: "Are you sure?") { target } actions: { Button("Cancel", …); Button("Save", size: "small") } |
| `ContextMenu` | menu |  |  | ContextMenu { MenuItem … } — an open context menu; place it with .offset |
| `DataTable` | table |  |  | DataTable(columns: [..] or Column children, rows: [[..]], selectionMode: "multiple", selectedRows: [1], sortField: 2, stripedRows: true, size: "small") header: { … } footer: { Paginator(…) } |
| `DataView` | list |  | variant: "dataview" | DataView(header: "Products") { DataViewItem(…) } — list layout of items |
| `DataViewItem` | listitem | title |  | DataViewItem("Bamboo Watch", subtitle: "Accessories", image: "…") { price/actions } |
| `DatePicker` | datepicker | placeholder |  | DatePicker("Select date", selection: "2026-11-24", showIcon: true, label:) · DatePickerPanel for the inline calendar |
| `DatePickerPanel` | calendar |  |  | DatePickerPanel(selection: "2026-11-24", range: [..]) — DatePicker with inline: true |
| `Dialog` | dialog | header | closable: true | Dialog(header: "Edit Profile", message: "Update your information.") { … } footer: { Button("Cancel", severity: "secondary"); Button("Save") } |
| `Divider` | divider |  |  | Divider() · Divider(label: "OR") · type: "dashed" · layout: "vertical" |
| `Dock` | toolbar |  | variant: "dock" | Dock { DockItem("Finder", icon: "pi pi-folder") … } — magnifying app bar |
| `DockItem` | avatar | label |  | DockItem("Photos", icon: "pi pi-image", image:) |
| `Drawer` | dialog | header | closable: true, placement: "left", variant: "drawer" | Drawer(header: "Menu", position: "left"/"right"/"top"/"bottom") { … } |
| `Dropdown` | select | placeholder |  | Pre-v4 name of Select |
| `Editor` | textfield | placeholder | kind: "multiline", variant: "editor" | Editor(rows: 6) — Quill rich text editor with toolbar |
| `Fieldset` | card | legend | variant: "fieldset" | Fieldset(legend: "Header") { … } — bordered group with a legend on the border |
| `FileUpload` | dropzone | label | icon: "pi-cloud-upload", label: "Drag and drop files to here to upload." | FileUpload { … } — advanced mode content area; children (e.g. FileUploadItem) render inside |
| `FileUploadItem` | listitem | title | icon: "pi-file" | FileUploadItem("report.pdf", subtitle: "1.2 MB", status: "pending"/"completed") { Button(icon: "pi pi-times") } |
| `FloatLabel` | textfield | label | variant: "float" | FloatLabel("Username", value: "amy") — the label floats on the border |
| `Fluid` | group |  |  | Fluid { … } — wrapper (children use .frame(maxWidth: .infinity)) |
| `Galleria` | card |  | variant: "galleria" | Galleria(image: "…", mediaHeight: 280) { HStack { Image(…) … } } — main image + thumbnail strip |
| `Icon` | icon | name |  | Icon("pi pi-check") — a PrimeIcons glyph |
| `IconField` | textfield | placeholder | icon: "pi-search" | IconField("Search") — InputText with an InputIcon (icon:) |
| `Image` | image | src |  | Image(src: "assets/images/photo-1.svg", alt:) |
| `InlineMessage` | alert | text | severity: "error", variant: "inline" | InlineMessage("Username is required", severity: "error") — pre-v4 compact message |
| `Inplace` | group |  |  | Inplace { display / content } — renders its content |
| `InputGroup` | textfield | placeholder |  | InputGroup("Price", prefix: "$", suffix: ".00") — InputText between InputGroupAddon cells |
| `InputMask` | textfield | placeholder |  | InputMask("99-999999", value: "48-210771", mask:) |
| `InputNumber` | textfield | placeholder | kind: "number" | InputNumber(value: 1500, prefix: "$", suffix: " kg", trailingIcon: "pi-sort") |
| `InputOtp` | segmented | items | variant: "otp" | InputOtp(items: ["4", "8", "", ""], selection: 2) — one box per item, the selected focused |
| `InputSwitch` | toggle | label |  | Pre-v4 name of ToggleSwitch |
| `InputText` | textfield | placeholder |  | InputText("Username", value:, label:, icon: "pi pi-search", invalid: true, size: "small"/"large", variant: "filled", disabled:, helper: |
| `Kbd` | kbd | keys |  | Kbd("⌘K") |
| `Knob` | progress | value | kind: "circular", showValue: true | Knob(value: 60, max: 100) — circular dial with the value in the centre |
| `ListControls` | vstack |  | spacing: 7 | ListControls { Button(icon: "pi pi-angle-up", severity: "secondary") … } — the button column |
| `Listbox` | segmented | options | variant: "listbox" | Listbox(options: ["New York", "Rome", "London"], selection: "Rome") — a bordered option list |
| `MegaMenu` | toolbar |  | variant: "menubar" | MegaMenu { MegaMenuItem("Furniture", open: true) { Grid(columns: 3) { MenuGroup … } } } |
| `MegaMenuItem` | menu | label | variant: "megamenu" | A MegaMenu root item whose open panel holds MenuGroup columns |
| `Menu` | menu | label |  | Menu { MenuGroup("Documents") { MenuItem("New", icon: "pi pi-plus") } MenuSeparator() } · Menu("Options", open: true) for a popup with its button |
| `MenuGroup` | section | label |  | MenuGroup("Profile") { MenuItem … } — submenu label + items |
| `MenuItem` | menuitem | label |  | MenuItem("Export", icon: "pi pi-upload", shortcut: "⌘+E", badge:) · children make a submenu chevron |
| `MenuSeparator` | divider |  |  | Separator between menu items |
| `Menubar` | toolbar |  | variant: "menubar" | Menubar { MenubarItem("File", icon:, open: true) { MenuItem … }; MenubarItem("Help", caret: false) } start: … end: … |
| `MenubarItem` | menu | label | variant: "menubar" | MenubarItem("Projects", icon: "pi pi-search", open: true) { MenuItem … } · caret: false for a leaf |
| `Message` | alert | text | severity: "info", showIcon: false | Message("Saved", severity: "success"/"info"/"warn"/"error"/"secondary"/"contrast", icon:, showIcon: true, variant: "simple", size: "small", closable:) |
| `MeterGroup` | chart |  | chartHeight: 30, grid: false, horizontal: true, kind: "bar", legend: true, stacked: true | MeterGroup(series: [[16], [8], [24]], seriesNames: ["Apps (16%)", "Messages (8%)", "Media (24%)"]) — stacked meter + labels |
| `MultiSelect` | select | placeholder |  | MultiSelect("Select Cities", selection: ["Rome", "Paris"], options:, display: "chip", open: true) |
| `OrderList` | hstack |  | alignment: "top", spacing: 14 | OrderList { ListControls(); Listbox(…) } — reorder buttons beside a list |
| `OverlayBadge` | badge | value | variant: "overlay" | OverlayBadge(value: 2, severity: "danger") { Icon("pi pi-bell") } |
| `OverlayPanel` | card | title | variant: "popover" | Pre-v4 name of Popover |
| `Paginator` | pagination |  |  | Paginator(count: 12, page: 2, summary: "Showing 11 to 20 of 120") — first/prev/pages/next/last + current page report |
| `Panel` | card | header | variant: "panel" | Panel(header: "Header", toggleable: true) { … } footer: { … } extra: { icons } |
| `PanelMenu` | vstack |  | alignment: "stretch", spacing: 4 | PanelMenu { PanelMenuPanel("Files", icon: "pi pi-file", expanded: true) { MenuItem … } } |
| `PanelMenuPanel` | accordion | label |  | PanelMenuPanel("Cloud", icon: "pi pi-cloud", expanded:) { MenuItem … } |
| `Password` | textfield | placeholder | kind: "password" | Password("Password", value:, toggleMask: true, feedback: true) — pair with PasswordMeter for the strength panel |
| `PasswordMeter` | progress | value | variant: "meter" | PasswordMeter(value: 66, label: "Medium", color: "medium") — the strength bar of Password's overlay |
| `PickList` | hstack |  | alignment: "center", spacing: 14 | PickList { Listbox(…); ListControls(); Listbox(…) } — source / transfer buttons / target |
| `Popover` | card | title | variant: "popover" | Popover { … } — floating panel with an arrow; place it with .offset |
| `ProgressBar` | progress | value | showValue: true | ProgressBar(value: 50) · mode: indeterminate when value is omitted · showValue: false |
| `ProgressSpinner` | progress |  | variant: "spinner" | ProgressSpinner() — the 4-colour animated ring (drawn static) |
| `RadioButton` | radio | label |  | RadioButton("Cheese", checked: true) |
| `RadioButtonGroup` | radiogroup | label |  | RadioButtonGroup(options: ["Card", "PayPal"], selection: "Card") |
| `Rating` | rating | value |  | Rating(value: 4, stars: 5) |
| `Row` | tablerow |  |  | Row { cells } — one DataTable row of views |
| `ScrollPanel` | scroll |  |  | ScrollPanel { … } |
| `ScrollTop` | fab | icon | icon: "pi-arrow-up" | ScrollTop() — round button pinned bottom-right |
| `Select` | select | placeholder |  | Select("Select a City", options: ["New York", "Rome"], selection: "Rome", open: true, showClear:, invalid:, label:) |
| `SelectButton` | segmented | options |  | SelectButton(options: ["One-Way", "Return"], selection: "Return") |
| `Sidebar` | dialog | header | closable: true, placement: "left", variant: "drawer" | Pre-v4 name of Drawer |
| `Skeleton` | skeleton |  | shape: "rectangle" | Skeleton().frame(width: 160, height: 14) · shape: "circle" |
| `Slider` | slider |  |  | Slider(value: 30) · range: value: [20, 80] · min:, max: |
| `SpeedDial` | fab | icon | icon: "pi-plus" | SpeedDial(icon: "pi pi-plus", position: "bottomTrailing", inline: true) — the round primary trigger button |
| `SplitButton` | button | label | dropdown: true | SplitButton("Save", icon: "pi pi-check", severity:) — the default action joined to a chevron-down dropdown button |
| `Splitter` | hstack |  | alignment: "stretch", spacing: 0 | Splitter { SplitterPanel { … } SplitterPanel { … } } — gutters drawn between panels |
| `SplitterPanel` | vstack |  | alignment: "stretch", spacing: 0 | SplitterPanel { … } (.frame(width:) for a fixed size) |
| `Step` | label | title |  | Step("Payment") — a child of Stepper / StepList |
| `Stepper` | steps | items |  | Stepper(items: ["Personal", "Seat", "Payment"], current: 1) · Step children · orientation: .vertical |
| `Steps` | steps | items | variant: "steps" | Steps(items: ["Personal", "Seat", "Payment"], activeStep: 1) — the pre-v4 numbered steps |
| `Tab` | tab | label |  | Tab("Header I", icon: "pi pi-user") { TabPanel content } |
| `TabMenu` | tabs | items | placement: "top", variant: "menu" | TabMenu(items: [["label": "Dashboard", "icon": "pi pi-home"], …], selection: 0) |
| `TabPanel` | tab | header |  | TabPanel("Header I") { … } — pre-v4 TabView child |
| `TabView` | tabs | items | placement: "top" | Pre-v4 Tabs |
| `Tabs` | tabs | items | placement: "top" | Tabs(selection: "Header II") { Tab("Header I") { panel } Tab("Header II", icon:, badge:) … } · items: ["A", "B"] for a bar alone |
| `Tag` | badge | value |  | Tag("Instock", severity: "success"/"info"/"warn"/"danger"/"secondary"/"contrast", icon:, rounded: true) |
| `Terminal` | code | code | variant: "terminal" | Terminal(code: "$ date\n…") |
| `Textarea` | textfield | placeholder | kind: "multiline" | Textarea("Description", rows: 4, autoResize:) |
| `TieredMenu` | menu | label |  | TieredMenu { MenuItem("File") { MenuItem … } } — nested menus; open a level beside it with .offset |
| `Timeline` | timeline |  |  | Timeline { TimelineEvent("Ordered", time: "15/10/2026 10:30", icon: "pi pi-shopping-cart") … } · layout: "horizontal" |
| `TimelineEvent` | timelineitem | title |  | TimelineEvent("Shipped", time:, description:, icon:, color: "#10b981") |
| `Toast` | toast | summary | closable: true, icon: "pi-info-circle", position: "top-right", severity: "info" | Toast(summary: "Success", detail: "File uploaded", severity: "success"/"info"/"warn"/"error"/"secondary"/"contrast", icon:, position: "top-right") |
| `ToggleButton` | toggle | label | variant: "button" | ToggleButton("Locked", checked: true) · use onLabel/offLabel text as the label |
| `ToggleSwitch` | toggle | label |  | ToggleSwitch("Notifications", checked: true) |
| `Toolbar` | toolbar |  |  | Toolbar { start buttons; Spacer(); end buttons } — bordered bar |
| `Tooltip` | tooltip | text | placement: "right" | Tooltip("Enter your username", placement: .top/.right/.bottom/.left) { target } — v-tooltip |
| `Tree` | tree |  |  | Tree { TreeNode("Documents", icon: "pi pi-folder", expanded: true) { TreeNode(…) } } |
| `TreeNode` | treeitem | label |  | TreeNode("Work", icon: "pi pi-folder", expanded: true).selected() |
| `TreeSelect` | select | placeholder |  | TreeSelect("Select Item", selection: "Documents / Work") |
| `TreeTable` | table |  | variant: "treetable" | TreeTable(columns:, rows:) — first cells as TreeTableToggle("Documents", level: 1, expanded: true) |
| `TreeTableToggle` | label | title | icon: "pi-chevron-right" | TreeTableToggle("Work", level: 0…3, expanded: true, icon:) — indented first cell with the toggler |
| `VirtualScroller` | scroll |  |  | VirtualScroller { … } — a scroll container |

<!-- end catalogue: prime -->

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

## android — Android (Jetpack Compose Material 3)

<!-- catalogue: android — generate with `mockitdown elements android --markdown --own` -->

| Element | Role | Arguments | Defaults | Notes |
|---|---|---|---|---|
| `AlertDialog` | dialog | title | variant: "alert" | AlertDialog(title: "Discard draft?", text: "…", icon: "delete", buttons: ["Cancel", "Discard"]) or confirmButton: { TextButton… } |
| `AssistChip` | chip | label | variant: "assist" | AssistChip("Add to calendar", leadingIcon: "event") — 32dp, 8dp corners |
| `Badge` | badge | text |  | Badge() — 6dp dot; Badge("12") — 16dp large badge (error colours) |
| `BadgedBox` | label |  |  | BadgedBox(badge: 3) { Icon("mail") } — badge: true for a dot |
| `BasicAlertDialog` | dialog | title | variant: "alert" | BasicAlertDialog { custom content } |
| `BottomAppBar` | toolbar |  |  | BottomAppBar { IconButton(…) …; Spacer(); FloatingActionButton("add", inline: true) } |
| `Box` | zstack |  |  | Compose Box: overlapping children; alignment: |
| `Button` | button | label | variant: "filled" | Button(onClick: {}) { Text("Save") } or Button("Save", icon:) — filled, 40dp pill |
| `ButtonGroup` | hstack |  | spacing: 8 | M3 Expressive ButtonGroup { ToggleButton … } (standard) |
| `Card` | card | title | variant: "filled" | Card { … } — filled (surfaceContainerHighest), 12dp corners; title:, subtitle:, image:, actions: |
| `CarouselItem` | zstack |  | alignment: "bottomLeading" | CarouselItem { Image(…); Text("caption") } — a masked carousel item with an overlay label |
| `CenterAlignedTopAppBar` | appbar | title | variant: "centerAligned" | CenterAlignedTopAppBar(title:, navigationIcon:, actions:) |
| `Checkbox` | checkbox | label |  | Checkbox(checked: true) (label optional, Compose puts it in a Row) |
| `CircularProgressIndicator` | progress |  | variant: "circular" | CircularProgressIndicator(progress: 0.7) |
| `CircularWavyProgressIndicator` | progress |  | variant: "circular" | M3 Expressive wavy circular indicator |
| `Column` | vstack |  | alignment: "leading" | Compose Column (vertical layout); spacing:, alignment: |
| `ConnectedButtonGroup` | hstack |  | spacing: 2 | M3 Expressive connected button group: ToggleButtons with shared inner corners |
| `DatePicker` | calendar |  | showToday: true | DatePicker(selection: "2026-11-27") — month grid, selected day in a primary circle, today outlined |
| `DatePickerDialog` | dialog | title | variant: "picker" | DatePickerDialog(actions: { TextButton("Cancel"); TextButton("OK") }) { DatePicker(…) } |
| `DatePickerField` | datepicker | label | variant: "outlined" | a date text field with a calendar icon: DatePickerField("Date", selection:) |
| `DateRangePicker` | calendar |  | showToday: true | DateRangePicker(range: ["2026-11-23", "2026-11-27"]) |
| `Dialog` | dialog | title | variant: "alert" | Dialog { Card { … } } — a custom dialog window |
| `DismissibleNavigationDrawer` | sidebar |  | variant: "drawer" | an open dismissible drawer beside the content |
| `DockedSearchBar` | textfield | placeholder | kind: "search", variant: "docked" | DockedSearchBar("Search", query:) |
| `DropdownMenu` | menu | label |  | DropdownMenu(expanded: true) { DropdownMenuItem("Edit", leadingIcon: "edit") } — label:/icon: give it an anchor |
| `DropdownMenuItem` | menuitem | label |  | DropdownMenuItem("Share", leadingIcon: "share", trailingText: "⌘S") |
| `ElevatedAssistChip` | chip | label | elevation: "1", variant: "assist" | elevated assist chip |
| `ElevatedButton` | button | label | variant: "elevated" | surfaceContainerLow pill button with level-1 shadow |
| `ElevatedCard` | card | title | variant: "elevated" | ElevatedCard: surfaceContainerLow + level-1 shadow |
| `ElevatedFilterChip` | chip | label | elevation: "1", variant: "filter" | elevated filter chip |
| `ElevatedSuggestionChip` | chip | label | elevation: "1", variant: "suggestion" | elevated suggestion chip |
| `ExposedDropdownMenuBox` | select | label | variant: "filled" | ExposedDropdownMenuBox("Country", value: "Portugal", options: [..], expanded: true) |
| `ExtendedFloatingActionButton` | fab | label |  | ExtendedFloatingActionButton("Compose", icon: "edit") — 56dp, label + icon |
| `FilledIconButton` | button | icon | iconOnly: true, variant: "filled" | FilledIconButton("add") |
| `FilledTonalButton` | button | label | variant: "tonal" | secondaryContainer pill button |
| `FilledTonalIconButton` | button | icon | iconOnly: true, variant: "tonal" | FilledTonalIconButton("edit") |
| `FilterChip` | chip | label | variant: "filter" | FilterChip("Nature", selected: true) — check icon when selected |
| `FloatingActionButton` | fab | icon |  | FloatingActionButton("add") — 56dp, 16dp corners, primaryContainer; floats bottom-end (inline: true to place in flow) |
| `FlowRow` | hstack |  | spacing: 8, wrap: true | FlowRow { … } — wraps its children (chips) |
| `HorizontalCenteredHeroCarousel` | hstack |  | spacing: 8, variant: "hero" | M3 Expressive hero carousel: one large centred item between two small ones |
| `HorizontalDivider` | divider |  |  | HorizontalDivider() — 1dp outlineVariant; .variant(.inset) for a 16dp inset |
| `HorizontalFloatingToolbar` | toolbar |  | variant: "floating" | M3 Expressive floating toolbar: a pill of IconButtons |
| `HorizontalMultiBrowseCarousel` | hstack |  | spacing: 8, variant: "multiBrowse" | HorizontalMultiBrowseCarousel { Image(…) … } — large, medium and small items with 28dp corners |
| `HorizontalUncontainedCarousel` | hstack |  | spacing: 8, variant: "uncontained" | HorizontalUncontainedCarousel { Image(…) … } — equal-width items |
| `Icon` | icon | name |  | Icon("favorite") — Material Symbols names (snake_case) map onto built-in glyphs |
| `IconButton` | button | icon | iconOnly: true, variant: "standard" | IconButton("more_vert") — 40dp touch target, on-surface-variant icon; selected: for toggles |
| `IconToggleButton` | button | icon | iconOnly: true, variant: "standard" | IconToggleButton("star", selected: true) |
| `InputChip` | chip | label | removable: true, variant: "input" | InputChip("Ana Lima", avatar: "Ana Lima") — trailing close icon |
| `LargeFlexibleTopAppBar` | appbar | title | variant: "large" | M3 Expressive LargeFlexibleTopAppBar(title:, subtitle:) |
| `LargeFloatingActionButton` | fab | icon | size: "large" | 96dp, 28dp corners |
| `LargeTopAppBar` | appbar | title | variant: "large" | LargeTopAppBar: 152dp, headlineMedium title below the icons |
| `LazyColumn` | scroll |  |  | LazyColumn { … } — a vertically scrolling column |
| `LazyRow` | scroll |  | axes: "horizontal" | LazyRow { … } — a horizontally scrolling row |
| `LazyVerticalGrid` | grid | columns |  | LazyVerticalGrid(columns: 3, spacing:) { … } |
| `LeadingIconTab` | tab | label |  | LeadingIconTab("Mail", icon:) (rendered like Tab) |
| `LinearProgressIndicator` | progress |  |  | LinearProgressIndicator(progress: 0.6) — no progress: indeterminate |
| `LinearWavyProgressIndicator` | progress |  | variant: "wavy" | M3 Expressive wavy linear indicator (progress:) |
| `ListDetailPaneScaffold` | split |  |  | adaptive list–detail: ListDetailPaneScaffold { listPane; detailPane } (two children) |
| `ListItem` | listitem | title |  | ListItem(headlineContent: "Ana", supportingContent:, overlineContent:, leadingContent: { Avatar(…) }, trailingContent: { Text("9:41") }) — or title/subtitle/avatar:/icon: |
| `LoadingIndicator` | progress |  | variant: "circular" | M3 Expressive LoadingIndicator (shown as a spinner) |
| `MediumFlexibleTopAppBar` | appbar | title | variant: "medium" | M3 Expressive MediumFlexibleTopAppBar(title:, subtitle:) |
| `MediumFloatingActionButton` | fab | icon | size: "medium" | M3 Expressive 80dp FAB, 20dp corners |
| `MediumTopAppBar` | appbar | title | variant: "medium" | MediumTopAppBar: 112dp, headlineSmall title below the icons |
| `ModalBottomSheet` | dialog | title | variant: "sheet" | ModalBottomSheet { … } — 28dp top corners, drag handle, over a scrim |
| `ModalDrawerSheet` | dialog |  | variant: "drawer" | the sheet of an open ModalNavigationDrawer (same rendering) |
| `ModalNavigationDrawer` | dialog |  | variant: "drawer" | an open modal drawer over the screen: ModalNavigationDrawer { Text("Mail"); NavigationDrawerItem(…) } |
| `MultiChoiceSegmentedButtonRow` | segmented | items |  | MultiChoiceSegmentedButtonRow (renders one selection: selection:) |
| `NavigationBar` | tabs |  | placement: "bottom" | NavigationBar { NavigationBarItem("Mail", icon: "mail", selected: true, badge: 3) … } |
| `NavigationBarItem` | tab | label |  | label, icon:, selected:, badge: (number, or true for a dot) |
| `NavigationDrawerItem` | navitem | label |  | label, icon:, selected:, badge: (shown as trailing text) |
| `NavigationRail` | sidebar |  | variant: "rail" | NavigationRail(header: { FloatingActionButton("edit", inline: true) }) { NavigationRailItem(…) } |
| `NavigationRailItem` | navitem | label |  | label, icon:, selected:, badge: |
| `NavigationSuiteScaffold` | split |  |  | adaptive navigation: NavigationSuiteScaffold { NavigationRail { … }; content } |
| `OutlinedButton` | button | label | variant: "outlined" | outline-bordered pill button |
| `OutlinedCard` | card | title | variant: "outlined" | OutlinedCard: surface with an outlineVariant border |
| `OutlinedExposedDropdownMenuBox` | select | label | variant: "outlined" | an ExposedDropdownMenuBox holding an OutlinedTextField |
| `OutlinedIconButton` | button | icon | iconOnly: true, variant: "outlined" | OutlinedIconButton("share") |
| `OutlinedSecureTextField` | textfield | label | kind: "password", variant: "outlined" | OutlinedSecureTextField("Password", value:, reveal:) |
| `OutlinedTextField` | textfield | label | variant: "outlined" | OutlinedTextField("Email", value:, supportingText:, isError:, leadingIcon:, trailingIcon:) |
| `PermanentDrawerSheet` | sidebar |  | variant: "drawer" | a permanent drawer sheet |
| `PermanentNavigationDrawer` | sidebar |  | variant: "drawer" | PermanentDrawerSheet beside the content (tablets) |
| `PlainTooltip` | tooltip | text |  | PlainTooltip("Delete") { IconButton("delete") } |
| `PrimaryScrollableTabRow` | tabs | items | placement: "top", variant: "scrollable" | PrimaryScrollableTabRow(selectedTabIndex:) |
| `PrimaryTabRow` | tabs | items | placement: "top", variant: "primary" | PrimaryTabRow(selectedTabIndex:) { Tab(…) } — content-width indicator, primary colour |
| `RadioButton` | radio | label |  | RadioButton(selected: true) (label optional) |
| `RangeSlider` | slider |  |  | RangeSlider(value: [20, 80], in: 0...100) |
| `RichTooltip` | tooltip | text | variant: "rich" | RichTooltip("Title", message: "…", actions: { TextButton("Learn more") }) { anchor } |
| `Scaffold` | vstack |  | alignment: "stretch", spacing: 0 | Scaffold { TopAppBar(…); content; NavigationBar { … } } — fills the screen; FABs float over it |
| `ScrollableTabRow` | tabs | items | placement: "top", variant: "scrollable" | ScrollableTabRow / PrimaryScrollableTabRow |
| `SearchBar` | textfield | placeholder | kind: "search", variant: "searchbar" | SearchBar("Search in mail", leadingIcon: "menu", trailingIcon: "account_circle", query:) — 56dp pill |
| `SecondaryTabRow` | tabs | items | placement: "top", variant: "secondary" | SecondaryTabRow(selectedTabIndex:) — full-width 2dp indicator, on-surface text |
| `SecureTextField` | textfield | label | kind: "password", variant: "filled" | SecureTextField("Password", value:) — masked |
| `SegmentedButton` | button | label |  | SegmentedButton("Week") inside a SegmentedButtonRow; the row's selection: picks it |
| `ShortNavigationBar` | tabs |  | placement: "bottom", variant: "short" | M3 Expressive ShortNavigationBar (64dp); same items as NavigationBar |
| `ShortNavigationBarItem` | tab | label |  | label, icon:, selected:, badge: |
| `SingleChoiceSegmentedButtonRow` | segmented | items |  | SingleChoiceSegmentedButtonRow(selection: "Week") { SegmentedButton("Day") … } or (["Day", "Week"], selection: 1) |
| `Slider` | slider |  |  | Slider(value: 0.4) or (value: 30, in: 0...100, steps: 4, ticks: true) — M3 Expressive bar handle |
| `SmallFloatingActionButton` | fab | icon | size: "small" | 40dp, 12dp corners |
| `Snackbar` | toast | message |  | Snackbar("Message archived", action: "Undo") — inverseSurface; inline: true to place in flow |
| `SuggestionChip` | chip | label | variant: "suggestion" | SuggestionChip("Sounds good!") |
| `Surface` | vstack |  | alignment: "stretch", spacing: 0 | Surface(color:, tonalElevation:) { … } — a plain M3 surface; .elevation(1…5) adds tonal elevation |
| `Switch` | toggle | label |  | Switch(checked: true) — 52×32 track, check icon in the thumb when on (thumbContent) |
| `Tab` | tab | label |  | Tab("Photos", icon: "photo", selected:) { panel content } |
| `TabRow` | tabs | items | placement: "top", variant: "primary" | TabRow(selectedTabIndex: 0) { Tab("Photos", icon:) … } or TabRow(["A", "B"]) |
| `TextButton` | button | label | variant: "text" | text-only button (dialog actions, card actions) |
| `TextField` | textfield | label | variant: "filled" | TextField("Label", value:, placeholder:, supportingText:, isError:, leadingIcon: "search", trailingIcon:) — filled |
| `TimeInput` | datepicker | label | kind: "time", variant: "outlined" | TimeInput("Time", selection: "10:30 AM") |
| `TimePicker` | radiogroup |  | options: ["12", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11"], variant: "dial" | TimePicker(hour: "10") — the 256dp clock dial with the selected hour |
| `TimePickerDialog` | dialog | title | variant: "picker" | TimePickerDialog(title: "Select time", actions:) { TimePicker(hour: "10") } |
| `ToggleButton` | button | label | variant: "toggle" | M3 Expressive ToggleButton("Bold", checked: true) |
| `Tooltip` | tooltip | text |  | plain tooltip: Tooltip("Add to favorites") { IconButton("star") } |
| `TooltipBox` | tooltip | text |  | TooltipBox("Label") { anchor } |
| `TopAppBar` | appbar | title | variant: "small" | TopAppBar(title: "Inbox", navigationIcon: { IconButton("menu") }, actions: { IconButton("search") }) — 64dp small bar |
| `TopSearchBar` | textfield | placeholder | kind: "search", variant: "searchbar" | M3 Expressive TopSearchBar (app bar with search) |
| `TriStateCheckbox` | checkbox | label |  | TriStateCheckbox(state: .indeterminate / .on / .off) |
| `VerticalDivider` | divider |  |  | VerticalDivider() inside a Row |
| `VerticalSlider` | slider |  |  | M3 Expressive VerticalSlider (rendered horizontally) |
| `WideNavigationRail` | sidebar |  | variant: "rail" | M3 Expressive WideNavigationRail (collapsed) |

<!-- end catalogue: android -->

## nls — NLS — the 1968 oN-Line System

<!-- catalogue: nls — generate with `mockitdown elements nls --markdown --own` -->

| Element | Role | Arguments | Defaults | Notes |
|---|---|---|---|---|
| `Bug` | pointer |  | kind: "bug" | The tracking spot moved by the mouse: a short upward arrow · use inline in a statement, or .position(x:y:) in a ZStack/Drawing |
| `Caption` | text | content | font: "caption" | Dim fine print |
| `Chord` | kbd | keys |  | A five-key keyset chord as typed (keys pressed together): Chord(["·","█","·","█","·"]) or Chord("d") |
| `CommandButton` | button | label |  | A command word set in brackets — there were no on-screen buttons; this stands for a keyset command: CommandButton("JUMP") |
| `CommandFeedback` | toolbar | title |  | Alias of FeedbackLine |
| `CommandWord` | text | content | variant: "command" | One command word (verb or noun) as shown in the feedback line: CommandWord("JUMP") |
| `Display` | card | title |  | The whole CRT display as the TV camera saw it: Display(file: "<ARC>LIST,1", viewspec: "abm") { … } header: { FeedbackLine(…) } |
| `DisplayArea` | card | title | variant: "area" | One display area (window) of a split screen, its file address in the top rule: DisplayArea("<ARC>PLAN,3", viewspec: "bm") { … } |
| `Drawing` | canvas |  |  | A vector drawing area; place Strokes, Nodes and labels with .position(x:y:) |
| `Echo` | text | content | variant: "echo" | Characters echoed as they are typed on the keyset, ending in the underline cursor: Echo("2b") |
| `FeedbackLine` | toolbar | title |  | The command feedback line at the top of the screen: the command being composed, then the echo: FeedbackLine("INSERT STATEMENT") { Echo("fresh bread") } |
| `FileLink` | link | label | variant: "file" | A link to a statement in another file, shown in parentheses: FileLink("ARC, PLAN, 3a") → (ARC, PLAN, 3a) |
| `Heading` | text | content | font: "title3" | A larger line of text |
| `Marker` | text | content | variant: "marker" | A named marker set on a character, shown as a small tag: Marker("m") |
| `Node` | text | content | variant: "node" | A boxed label in a diagram: Node("library") |
| `Outline` | tree |  |  | Alias of StatementFile |
| `PartnerBug` | pointer |  | kind: "partner" | A second user's tracking spot on a shared screen, drawn hollow |
| `Register` | text | content | variant: "register" | A name register or status slot at the edge of the feedback line: Register("BUG 2c") |
| `RouteMap` | map |  |  | A line-drawn map with stops and the route between them: RouteMap(pins: [(20, 30, "library")], route: true) |
| `Rule` | divider | label |  | A drawn horizontal line; Rule("label") sets text into it |
| `Screen` | card | title |  | Alias of Display |
| `SplitScreen` | split |  |  | Display areas side by side (or stacked with orientation: .vertical), split by a single drawn line |
| `Statement` | treeitem | label |  | One statement; nest Statements for sub-statements. number: "3b" overrides the automatic number · .selected() intensifies it |
| `StatementFile` | tree |  |  | A structured file of hierarchical statements, numbered 1, 1a, 1a1 … automatically · view specs: levels: 1…4, lines: 1 (first line only), numbers: false |
| `StatementLink` | link | label | variant: "statement" | A link to another statement, shown in parentheses: StatementLink("2b") → (2b) |
| `Stroke` | shape |  | variant: "line" | A drawn vector line: Stroke().frame(width: 120, height: 2).rotationEffect(.degrees(30)).position(x:y:) |
| `SystemMessage` | text | content | variant: "message" | A short system reply in the feedback area, set in inverse: SystemMessage("FILE LOADED") |
| `VideoInset` | placeholder | label | variant: "inset" | The television picture of a person mixed into the display: VideoInset("camera 2 — remote site") · .variant(.overlay) superimposes it translucently |
| `ViewSpec` | text | content | variant: "viewspec" | The current view-specification letters, shown dim: ViewSpec("abm") |
| `Window` | card | title | variant: "area" | Alias of DisplayArea |

<!-- end catalogue: nls -->

## xerox-star — Xerox Star

<!-- catalogue: xerox-star — generate with `mockitdown elements xerox-star --markdown --own` -->

| Element | Role | Arguments | Defaults | Notes |
|---|---|---|---|---|
| `ChoiceButton` | button | label | variant: "choice" | A single choice box; .selected() reverses it |
| `ChoiceButtons` | segmented | label |  | ChoiceButtons(items: ["Left", "Center", "Right"], selection: "Left"): the chosen value is in reverse video |
| `CommandKey` | kbd | keys |  | One function key, e.g. CommandKey("MOVE") |
| `CommandKeys` | kbd | keys | keys: ["AGAIN", "DELETE", "FIND", "COPY", "SAME", "MOVE", "OPEN", "PROPS", "HELP", "UNDO"] | The universal-command keys of the Star keyboard as a strip |
| `Confirmation` | dialog | title | variant: "alert" | A boxed confirmation/error message with Yes/No commands |
| `Desktop` | zstack |  | alignment: "topLeading" | The grey (stippled) desktop; place icons and windows inside |
| `DesktopIcon` | label | title |  | A pictogram with its name, e.g. DesktopIcon("Report", icon: "Document"); .selected() shows it in reverse video |
| `DocumentPage` | vstack |  | alignment: "leading", spacing: 8 | A WYSIWYG page in a document window (Classic serif text) |
| `FieldBox` | textfield | text |  | A boxed text property |
| `FolderEntry` | listitem | title |  | FolderEntry("Memo", icon: "Document", detail: "12-Mar-81") |
| `FolderList` | list |  |  | The contents of an opened folder: FolderEntry rows |
| `Frame` | card | title | variant: "frame" | A graphics frame anchored in a document |
| `Heading` | text | content | font: "title2" | Document heading |
| `IconColumn` | vstack |  | alignment: "center", spacing: 18 | A column of desktop icons |
| `IconRow` | hstack |  | alignment: "top", spacing: 22 | A row of desktop icons |
| `MenuCommand` | menuitem | label |  | A command in a pop-up menu |
| `MessageLine` | toolbar |  | variant: "message" | The prompt/message area at the top of the screen |
| `OnOffBox` | checkbox | label |  | A boolean property: a small square, checked when on |
| `OptionSheet` | card | title | variant: "sheet" | Option sheet (parameters of a command such as Print) |
| `Paragraph` | text | content |  | Document paragraph |
| `PopUpMenu` | menu | label |  | A pop-up command menu |
| `PropertyField` | labeled | label, value |  | PropertyField("Name") { FieldBox(…) } — a label with its value |
| `PropertySheet` | card | title | variant: "sheet" | Property sheet: header with Done/Cancel/Defaults, then PropertyField rows |
| `ScrollBar` | slider | value | orientation: "vertical", variant: "scrollbar" | The window scroll bar with arrow and next/previous-page boxes |
| `StarWindow` | card | title |  | Window: black header strip with the name and command buttons (headerAction: { WindowCommand(…) }) |
| `Window` | card | title |  | Alias of StarWindow |
| `WindowCommand` | button | label | variant: "command" | A command button in a window or property-sheet header |

<!-- end catalogue: xerox-star -->

## lisa — Lisa Office System

<!-- catalogue: lisa — generate with `mockitdown elements lisa --markdown --own` -->

| Element | Role | Arguments | Defaults | Notes |
|---|---|---|---|---|
| `Alert` | dialog | message | severity: "note", variant: "alert" | An alert box: severity .note / .caution / .stop |
| `Button` | button | label |  | A Lisa button: a heavy rounded box |
| `CautionAlert` | dialog | message | severity: "caution", variant: "alert" | Alert with the caution symbol |
| `CheckBox` | checkbox | label, checked |  | A Lisa check box: a small box filled black when chosen |
| `DefaultButton` | button | label | variant: "default" | The button that Return activates (doubled outline) |
| `Desktop` | zstack |  | alignment: "topLeading" | The desktop: the patterned area below the menu bar; place windows and icons with .offset(x:y:) |
| `DesktopIcon` | label | title, kind | kind: "document" | An Office System icon: kind .stationery / .document / .folder / .profile / .clipboard / .trash / .preferences / .calculator / .printer |
| `Dialog` | dialog | title |  | A dialog box presented over the screen (thick border) |
| `DialogBox` | card |  | variant: "dialog" | An in-place dialog box with the thick Lisa border |
| `DocumentWindow` | card | title | variant: "document" | A document window with scroll bars and size control |
| `DrawCanvas` | canvas |  |  | The drawing area (LisaDraw shows a dotted grid with grid: .dots) |
| `DrawPalette` | grid |  | columns: 1 | The vertical tool palette of a drawing program |
| `EditText` | textfield | text |  | A typing field |
| `FileItem` | listitem | title, kind |  | A row of a ListBox: FileItem("Budget", kind: .stationery) |
| `Folder` | label | title | kind: "folder" | A folder icon |
| `FolderWindow` | card | title, subtitle | variant: "folder" | An open folder or disk on the Office System desktop (icon view) |
| `ListBox` | list |  | kind: "files" | A list of documents in a dialog |
| `Menu` | menu | label | caret: false | A menu-bar title; Menu("File", open: true) { MenuItem(…) } pulls its menu down |
| `MenuBar` | toolbar |  |  | The menu bar across the top of the screen; holds Menu elements (one may be open: true) |
| `MenuItem` | menuitem | label, shortcut |  | A menu command: MenuItem("Quit", shortcut: "⌘Q"); .disabled() greys it |
| `MenuSeparator` | divider |  |  | The dotted line between menu groups |
| `NoteAlert` | dialog | message | severity: "note", variant: "alert" | Alert with the note symbol |
| `PatternPalette` | swatches | colors | colors: ["white", "black", "gray", "gray", "gray", "gray", "gray", "gray", "gray", "gray", "gray", "gray"] | Fill patterns; selection: index |
| `ProgressBar` | progress | value |  | A plain progress bar |
| `RadioButton` | radio | label, checked |  | One choice of a group, filled when chosen |
| `RadioGroup` | radiogroup | label |  | Choices from items: […], selection: … |
| `Ruler` | divider |  | kind: "ruler" | The tab ruler at the top of a word-processing window |
| `ScrollBar` | divider | orientation | orientation: "vertical" | A Lisa scroll bar with its elevator box: ScrollBar(.vertical, position: .middle) |
| `Separator` | divider |  |  | A 1-pixel line |
| `Spreadsheet` | spreadsheet |  |  | Same as Worksheet |
| `StaticText` | text | content |  | Static text |
| `StationeryPad` | label | title | kind: "stationery" | A stationery pad: tear off a new document |
| `StopAlert` | dialog | message | severity: "stop", variant: "alert" | Alert with the stop symbol |
| `TextField` | textfield | text |  | A typing field: an underlined area |
| `Tool` | button | kind | iconOnly: true | A palette tool drawn as a 1-bit glyph: Tool(.rect); .selected() inverts it |
| `ToolPalette` | grid |  | columns: 2 | A two-column tool palette |
| `ToolWindow` | card | title | variant: "tool" | A window without scroll bars |
| `Window` | card | title | variant: "document" | A Lisa window: .document (tall white title bar, centred title, scroll bars), .tool (no scroll bars), .dialog (thick-bordered box) |
| `Worksheet` | spreadsheet |  |  | A LisaCalc-style worksheet (rows: [[…]], selection: "B3", formula: …) |

<!-- end catalogue: lisa -->

## mac-classic — Macintosh System 1–6

<!-- catalogue: mac-classic — generate with `mockitdown elements mac-classic --markdown --own` -->

| Element | Role | Arguments | Defaults | Notes |
|---|---|---|---|---|
| `Alert` | dialog | message | severity: "note", variant: "alert" | An alert box; severity: .stop / .note / .caution draws the icon |
| `AppleMenu` | menu |  | caret: false, kind: "apple", label: " " | The leftmost menu, titled with a neutral apple-ish glyph; holds desk accessories |
| `Button` | button | label |  | Push button: a round-cornered rectangle; .variant(.default) adds the thick outline |
| `CalcKey` | button | label | variant: "key" | A calculator key |
| `CautionAlert` | dialog | message | severity: "caution", variant: "alert" | Alert with the caution icon (a triangle with !) |
| `CheckBox` | checkbox | label, checked |  | Check box: a square crossed with an X when on |
| `DefaultButton` | button | label | variant: "default" | The default push button (3-pixel rounded outline; Return activates it) |
| `DeskAccessory` | card | title | kind: "da", variant: "noGrow" | A small desk-accessory window (Calculator, Note Pad, Alarm Clock …) |
| `Desktop` | zstack |  | alignment: "topLeading" | The desktop: the patterned area below the menu bar; place windows and icons with .offset(x:y:) |
| `DesktopIcon` | label | title, kind | kind: "document" | A 32×32 1-bit icon with its name below; kind: .folder/.document/.application/.disk/.floppy/.trash/.system |
| `Dialog` | dialog | title |  | A modal dialog (dBoxProc) presented over the screen; actions: { Button … } |
| `DialogWindow` | card |  | variant: "dBox" | An in-place modal dialog box (dBoxProc double border), drawn where it stands |
| `DocumentWindow` | card | title | variant: "document" | documentProc window with stripes, close box, zoom box, scroll bars, grow box |
| `EditText` | textfield | text |  | Editable text item of a dialog: a framed box |
| `FileItem` | listitem | title, kind |  | A row of a ListBox: FileItem("Letters", kind: .folder); .selected() inverts it |
| `FinderIcon` | label | title, kind | kind: "document" | An icon in a Finder window's icon view |
| `FinderWindow` | card | title, subtitle | variant: "finder" | A Finder window in icon view: FinderWindow("Disk", subtitle: "5 items …") |
| `GrowBox` | color |  |  | The size box drawn where the two scroll bars meet |
| `LineWidths` | vstack |  | spacing: 0 | The line-width chooser of a paint program |
| `ListBox` | list |  | kind: "files" | List Manager list (Standard File's file list) with a scroll bar |
| `Menu` | menu | label | caret: false | A menu-bar title; Menu("File", open: true) { MenuItem(…) } pulls its menu down |
| `MenuBar` | toolbar |  |  | The menu bar across the top of the screen; holds Menu elements (one may be open: true) |
| `MenuItem` | menuitem | label, shortcut |  | A menu command: MenuItem("Quit", shortcut: "⌘Q"); .disabled() greys it |
| `MenuSeparator` | divider |  |  | The dotted line between menu groups |
| `ModalDialog` | dialog | title |  | Same as Dialog |
| `NoGrowWindow` | card | title | variant: "noGrow" | noGrowDocProc window: striped title bar, no scroll bars |
| `NoteAlert` | dialog | message | severity: "note", variant: "alert" | Alert with the note icon (a talking face) |
| `PaintCanvas` | canvas |  |  | The white drawing area of a paint window |
| `PatternPalette` | swatches | colors | colors: ["white", "black", "gray", "gray", "gray", "gray", "gray", "gray", "gray", "gray", "gray", "gray"] | The row of fill patterns under a paint program's canvas; selection: index |
| `PopUpMenu` | select | label |  | Pop-up menu: framed with a drop shadow and a down triangle |
| `ProgressBar` | progress | value |  | A plain progress bar: framed and filled black |
| `PushButton` | button | label |  | Push button |
| `RadioButton` | radio | label, checked |  | Radio button: a circle with a dot when on |
| `RadioGroup` | radiogroup | label |  | Radio buttons from items: […], selection: … |
| `RoundWindow` | card | title | variant: "rDoc" | rDocProc window: rounded corners and a black title bar (Calculator style) |
| `ScrollBar` | divider | orientation | orientation: "vertical" | A scroll bar: ScrollBar(.vertical / .horizontal, position: .top/.middle/.bottom); .variant(.inactive) for an inactive window |
| `Separator` | divider |  |  | A 1-pixel line |
| `Spreadsheet` | spreadsheet |  |  | A worksheet grid (rows: [[…]], selection: "B2") |
| `StaticText` | text | content |  | Static text item of a dialog |
| `StopAlert` | dialog | message | severity: "stop", variant: "alert" | Alert with the stop icon (an octagon with a raised hand) |
| `TextEdit` | textfield | text |  | TextEdit field (multi-line with kind: .multiline) |
| `TextField` | textfield | text |  | Editable text box |
| `Tool` | button | kind | iconOnly: true | A palette tool drawn as a 1-bit glyph: Tool(.pencil); .selected() inverts it |
| `ToolPalette` | grid |  | columns: 2 | A drawing program's tool palette (two columns of tools) |
| `Window` | card | title | variant: "document" | A window: .document (title bar, scroll bars, grow box), .noGrow, .dBox, .plainDBox, .altDBox, .rDoc (rounded desk accessory), .finder |

<!-- end catalogue: mac-classic -->

## win1 — Windows 1.0

<!-- catalogue: win1 — generate with `mockitdown elements win1 --markdown --own` -->

| Element | Role | Arguments | Defaults | Notes |
|---|---|---|---|---|
| `AppointmentList` | list |  | variant: "appointments" | Calendar day view: one ListBoxItem per time slot |
| `AutoCheckBox` | checkbox | label |  | BS_AUTOCHECKBOX |
| `AutoRadioButton` | radio | label |  | BS_AUTORADIOBUTTON |
| `CText` | text | content |  | CTEXT: centred static text |
| `CardStack` | zstack |  | alignment: "topLeading" | Cardfile's cascade of index cards |
| `CheckBox` | checkbox | label |  | Check box: square that shows an X when checked |
| `ClientArea` | vstack |  | alignment: "stretch", spacing: 0 | The white client area of a window |
| `Clock` | text | content | variant: "clock" | Digital-style clock face text shown in a Clock window |
| `DefPushButton` | button | label | variant: "default" | DEFPUSHBUTTON: the default button, with a heavier border |
| `Desktop` | vstack |  | alignment: "stretch", spacing: 0 | The whole screen: a TiledArea of windows above the IconArea; dialogs and menus overlap it |
| `DialogBox` | dialog | title |  | Modal dialog box: no caption, a thick double black frame; overlaps the tiles |
| `DialogIcon` | icon | name |  | ICON in a dialog: hand, exclamation, question, asterisk |
| `DriveBar` | hstack |  | spacing: 10 | MS-DOS Executive: the row of drive icons |
| `DriveIcon` | chip | label |  | MS-DOS Executive drive icon, e.g. DriveIcon("C").selected() |
| `Edit` | textfield | text |  | Edit control (window class "edit") |
| `EditText` | textfield | text |  | EDITTEXT: single-line edit control in a black box |
| `FileList` | grid |  | columns: 4, spacing: 0 | MS-DOS Executive file names in columns |
| `FileName` | text | content |  | A file name in the list; .selected() inverts it |
| `GroupBox` | card | title | variant: "groupbox" | GROUPBOX: rectangle with its title on the top line |
| `IconArea` | hstack |  | alignment: "center", spacing: 14 | The strip along the bottom of the screen where iconic (inactive) applications park |
| `IconicWindow` | label | title |  | An application shrunk to an icon in the icon area, its name below |
| `IndexCard` | card | title | variant: "indexcard" | Cardfile card: the index line on top, a red rule, then the card text |
| `LText` | text | content |  | LTEXT: left-aligned static text |
| `ListBox` | list |  |  | LISTBOX: bordered list; ListBoxItem children, .selected() inverts |
| `ListBoxItem` | listitem | title |  | A list box string |
| `MenuBar` | toolbar |  |  | The menu bar under the caption; children are MenuBarItem or PopupMenu |
| `MenuBarItem` | button | label | variant: "menubar" | A menu title in the menu bar; .selected() inverts it (Windows 1.0 shows no mnemonic underlines) |
| `MenuItem` | menuitem | label |  | Menu command; checked:, shortcut:, .disabled() (grey), .selected() |
| `MenuSeparator` | divider |  |  | Separator line in a drop-down menu |
| `MessageBox` | dialog | title | variant: "alert" | MessageBox("Write", message: "…", icon: "exclamation", buttons: ["OK", "Cancel"]) |
| `MonthView` | calendar |  |  | Calendar month view (date:, selection:) |
| `MultiLineEdit` | textfield | text | kind: "multiline" | ES_MULTILINE edit control |
| `PageView` | vstack |  | alignment: "leading", spacing: 4 | Document text area (Write) |
| `PaletteTool` | button | label | variant: "tool" | A palette tool: icon:, .selected() |
| `PathLine` | text | content |  | MS-DOS Executive current path, e.g. "C: \\WINDOWS" |
| `PatternPalette` | swatches |  |  | Paint pattern/colour palette from colors: |
| `PopupMenu` | menu | label | caret: false, variant: "menubar" | PopupMenu("File", open: true) { MenuItem("New") … } |
| `PopupWindow` | card | title | variant: "popup" | Overlapping pop-up window (Control Panel, About): double-line frame over the tiles |
| `PushButton` | button | label |  | Push button: rounded box with a 1px black border |
| `RText` | text | content |  | RTEXT: right-aligned static text |
| `RadioButton` | radio | label |  | RADIOBUTTON: circle, filled dot when checked |
| `RadioGroup` | radiogroup | label |  | Radio buttons from items:/selection: |
| `Ruler` | slider |  | ticks: 12, variant: "ruler" | Write ruler with tick marks |
| `ScrollBar` | slider | value | variant: "scrollbar" | Horizontal scroll bar: grey shaft, white thumb, arrow boxes |
| `SizeBox` | color |  | variant: "sizebox" | The square where the two scroll bars meet |
| `Static` | text | content |  | Static control (window class "static") |
| `StatusLine` | toolbar |  | variant: "status" | Status text line at the bottom of a window |
| `TerminalScreen` | code | code | kind: "terminal" | Terminal / DOS-application screen (code role, terminal kind) |
| `TileColumn` | vstack |  | alignment: "stretch", spacing: 0 | A column of tiled windows stacked top to bottom |
| `TiledArea` | hstack |  | alignment: "stretch", spacing: 0 | The tiling region above the icon area: windows share it side by side, never overlapping |
| `ToolPalette` | grid |  | columns: 2, spacing: 0 | Paint tool palette |
| `VScrollBar` | slider | value | orientation: "vertical", variant: "scrollbar" | Vertical scroll bar at a window's right edge |
| `Window` | card | title |  | Tiled application window: a caption bar with the centred title only (no boxes), menu bar and client area; .variant(.inactive) for a white caption |

<!-- end catalogue: win1 -->

## win2 — Windows 2.x

<!-- catalogue: win2 — generate with `mockitdown elements win2 --markdown --own` -->

| Element | Role | Arguments | Defaults | Notes |
|---|---|---|---|---|
| `AutoCheckBox` | checkbox | label |  | BS_AUTOCHECKBOX |
| `AutoRadioButton` | radio | label |  | BS_AUTORADIOBUTTON |
| `CText` | text | content |  | CTEXT: centred static text |
| `CheckBox` | checkbox | label |  | CHECKBOX: square that shows an X when checked |
| `ClientArea` | vstack |  | alignment: "stretch", spacing: 0 | The white client area of a window |
| `DefPushButton` | button | label | variant: "default" | DEFPUSHBUTTON: the default button, with a heavier border |
| `Desktop` | zstack |  | alignment: "topLeading" | The screen background; place windows with .offset(x:y:) and .frame(width:height:) |
| `DialogBox` | dialog | title |  | Modal dialog box (DS_MODALFRAME double border, no caption unless a title is given) |
| `DialogIcon` | icon | name |  | ICON in a dialog: hand, exclamation, question, asterisk |
| `DriveBar` | hstack |  | spacing: 10 | MS-DOS Executive: the row of drive icons |
| `DriveIcon` | chip | label |  | MS-DOS Executive drive icon, e.g. DriveIcon("C").selected() |
| `Edit` | textfield | text |  | Edit control (window class "edit") |
| `EditText` | textfield | text |  | EDITTEXT: single-line edit control in a black box |
| `FileList` | grid |  | columns: 4, spacing: 0 | MS-DOS Executive file names in columns |
| `FileName` | text | content |  | A file name in the list; .selected() inverts it |
| `GroupBox` | card | title | variant: "groupbox" | GROUPBOX: rectangle with its title on the top line |
| `IconArea` | hstack |  | alignment: "bottom", spacing: 18 | The icon area along the bottom of the screen where iconic (minimised) windows park |
| `IconicWindow` | label | title |  | A minimised application: icon box with its name below |
| `LText` | text | content |  | LTEXT: left-aligned static text |
| `ListBox` | list |  |  | LISTBOX: bordered list; ListBoxItem children, .selected() inverts |
| `ListBoxItem` | listitem | title |  | A list box string |
| `MenuBar` | toolbar |  |  | The menu bar under the caption; children are MenuBarItem or PopupMenu |
| `MenuBarItem` | button | label | variant: "menubar" | A menu title; the first letter is the underlined mnemonic; .selected() inverts it |
| `MenuItem` | menuitem | label |  | Menu command; checked:, shortcut:, .disabled() (MF_GRAYED), .selected() |
| `MenuSeparator` | divider |  |  | MF_SEPARATOR line |
| `MessageBox` | dialog | title | variant: "alert" | MessageBox("Write", message: "…", icon: "exclamation", buttons: ["OK", "Cancel"]) |
| `MultiLineEdit` | textfield | text | kind: "multiline" | ES_MULTILINE edit control |
| `PageView` | vstack |  | alignment: "leading", spacing: 4 | Document text area (Write) |
| `PaletteTool` | button | label | variant: "tool" | A palette tool: icon:, .selected() |
| `PathLine` | text | content |  | MS-DOS Executive current path, e.g. "C: \\WINDOWS" |
| `PatternPalette` | swatches |  |  | Paint pattern/colour palette from colors: |
| `PopupMenu` | menu | label | caret: false, variant: "menubar" | PopupMenu("File", open: true) { MenuItem("New") … } |
| `PushButton` | button | label |  | PUSHBUTTON: rounded box with a 1px black border |
| `RText` | text | content |  | RTEXT: right-aligned static text |
| `RadioButton` | radio | label |  | RADIOBUTTON: circle, filled dot when checked |
| `RadioGroup` | radiogroup | label |  | Radio buttons from items:/selection: |
| `Ruler` | slider |  | ticks: 12, variant: "ruler" | Write ruler with tick marks |
| `ScrollBar` | slider | value | variant: "scrollbar" | SCROLLBAR (SBS_HORZ): grey shaft, white thumb box, arrow boxes |
| `Static` | text | content |  | Static control (window class "static") |
| `StatusLine` | toolbar |  | variant: "status" | Status text line at the bottom of a window |
| `ToolPalette` | grid |  | columns: 2, spacing: 0 | Paint tool palette |
| `VScrollBar` | slider | value | orientation: "vertical", variant: "scrollbar" | Vertical window scroll bar (thumb drawn at the top) |
| `Window` | card | title |  | Overlapped window: caption with system-menu box, minimise/maximise arrow boxes; .variant(.inactive) for an inactive caption |

<!-- end catalogue: win2 -->

## gsos — Apple IIgs GS/OS

<!-- catalogue: gsos — generate with `mockitdown elements gsos --markdown --own` -->

| Element | Role | Arguments | Defaults | Notes |
|---|---|---|---|---|
| `Alert` | dialog | title | icon: "exclamationmark.triangle", severity: "caution", variant: "alert" | A modal alert: double frame, Stop / Note / Caution icon (severity: .stop / .note / .caution), buttons:, primary: |
| `AppleMenu` | menu |  | caret: false, icon: "circle" | The Apple menu at the left (a neutral colour glyph, not the logo); open: true shows the desk accessories |
| `ApplicationIcon` | label | title | icon: "app", kind: "application" | An application (S16) icon |
| `Button` | button | label |  | A rounded push button; .variant(.default) (or DefaultButton) draws the bold outline |
| `CheckBox` | checkbox | label |  | A check box (checked shows an X) |
| `ControlPanel` | card | title | title: "Control Panel", variant: "nda" | The Control Panel NDA window: a CDev list at the left, the selected CDev at the right |
| `DefaultButton` | button | label | variant: "default" | The default button (Return activates it) |
| `Desktop` | canvas |  |  | The Finder desktop (dithered pattern). Put a MenuBar first, then place windows and icons with .position(x:y:) |
| `Dialog` | dialog | title | variant: "modal" | A centred modal dialog with the double frame |
| `Disk` | label | title | icon: "archivebox", kind: "floppy" | A 3.5-inch disk icon |
| `DocumentIcon` | label | title | icon: "doc", kind: "document" | A document icon |
| `FinderIcon` | label | title |  | A Finder icon with its name below; icon: any icon name; .selected() inverts it |
| `FinderList` | table |  |  | Finder list view: columns:, TableRow children, sortColumn: (underlined), selectedRows: |
| `FinderWindow` | card | title | variant: "document" | A Finder window; an InfoBar then icons or a list inside a ScrollArea |
| `Folder` | label | title | icon: "folder", kind: "folder" | A folder icon |
| `Frame` | card | title | variant: "group" | A plain rectangle grouping controls (static text title on top) |
| `HardDisk` | label | title | icon: "archivebox", kind: "harddisk" | A hard disk (SCSI or /RAM5) icon |
| `InfoBar` | labeled | label, value |  | The Finder window info bar: InfoBar("9 items", "312K available") |
| `LineEdit` | textfield | placeholder |  | A LineEdit text field |
| `ListControl` | list |  |  | A List Manager list: framed, the selected rows inverted |
| `ListItem` | listitem | title |  | A list row |
| `MenuBar` | toolbar |  |  | The menu bar: AppleMenu(), MenuTitle("File") …, Spacer(), Text(…) |
| `MenuItem` | menuitem | label |  | A menu item; shortcut: "⌘O" (the open-apple key), checked:, .disabled(), .highlighted() |
| `MenuTitle` | menu | label | caret: false | A menu bar title; MenuTitle("File", open: true) { MenuItem(…) } |
| `ModalDialog` | card | title | variant: "dialog" | A modal dialog drawn in place (double frame, no title bar) |
| `NDAWindow` | card | title | variant: "nda" | A New Desk Accessory window (Control Panel, Calculator …) |
| `PopupMenu` | select | label |  | A pop-up menu with its title at the left and a drop shadow |
| `ProgressBar` | progress | label |  | A thermometer progress bar; value: 0…1 |
| `RadioButton` | radio | label |  | A radio button |
| `RadioGroup` | radiogroup | label |  | RadioGroup("Speed:", items: […], selection:) |
| `ScrollArea` | scroll |  | variant: "both" | A content area with GS/OS scroll bars (dithered track, arrows at each end) and the grow box |
| `Separator` | divider |  |  | A dividing line |
| `Slider` | slider | label |  | A scroll-bar style value control |
| `StickyNote` | stickynote | text |  | A Note Pad note |
| `TextEdit` | textfield | text | kind: "multiline" | A multi-line TextEdit box |
| `TextField` | textfield | placeholder |  | A LineEdit text field |
| `TrashIcon` | label | title | icon: "trash", kind: "trash", title: "Trash" | The Trash |
| `Window` | card | title | variant: "document" | A GS/OS window: lined title bar, close box at the left, zoom box at the right |

<!-- end catalogue: gsos -->

## nextstep — NeXTSTEP 3

<!-- catalogue: nextstep — generate with `mockitdown elements nextstep --markdown --own` -->

| Element | Role | Arguments | Defaults | Notes |
|---|---|---|---|---|
| `AlertPanel` | dialog | title | icon: "Application", variant: "alert" | An alert panel: title bar, application icon, bold title, message and buttons with the default (return) one on the right |
| `AppIcon` | button | label | iconOnly: true, variant: "running" | A 64 px Dock tile; .variant(.idle) shows the ellipsis of an application that is not running |
| `Box` | card | title | variant: "box" | A Box: a grooved frame with its title at the top-left |
| `Browser` | hstack |  | alignment: "stretch", spacing: 0 | The column browser: BrowserColumn children, each with its own scroller on the left |
| `BrowserCell` | listitem | title | chevron: true | A branch cell (folder): title and the right arrow; .selected() highlights it white |
| `BrowserColumn` | list |  |  | One column of a Browser: BrowserCell (branch, with the arrow) and BrowserLeaf rows |
| `BrowserLeaf` | listitem | title |  | A leaf cell (file) without the arrow |
| `Button` | button | label |  | A bevelled push button; .variant(.default) (or ReturnButton) adds the return glyph; .selected() is the highlighted (white) state |
| `ButtonCell` | button | label |  | A bevelled push button; .variant(.default) (or ReturnButton) adds the return glyph; .selected() is the highlighted (white) state |
| `ButtonRow` | toolbar |  | variant: "buttonrow" | A row of buttons along a window's top (Mail, Edit) |
| `ColorWell` | color | color |  | A colour well: a bevelled frame around a colour swatch |
| `DBTableView` | table |  |  | A table view: raised column titles over a white grid (Mail's message list) |
| `Dock` | vstack |  | alignment: "center", spacing: 0 | The Dock: a column of 64 px tiles at the right edge of the screen |
| `DockTile` | button | label | iconOnly: true, variant: "running" | A 64 px Dock tile; .variant(.idle) shows the ellipsis of an application that is not running |
| `FileIcon` | label | title |  | A Workspace icon: a 48 px picture with its name below; .selected() boxes the name |
| `Form` | vstack |  | alignment: "stretch", spacing: 4 | A Form: a column of FormCells |
| `FormCell` | textfield | label |  | A Form entry: the title on the left, the bezelled field on the right |
| `IconButton` | button | icon | iconOnly: true, variant: "image" | A square bevelled button with only an icon |
| `ImageButton` | button | label | variant: "icontop" | A button showing an icon above its title (Mail's and Preferences' button rows) |
| `Matrix` | radiogroup | label |  | A Matrix of radio button cells: RadioMatrix("Title", items: […], selection:) |
| `Menu` | card | title | variant: "menu" | A vertical menu: black title bar over a column of menu cells; MenuItem / SubmenuItem children |
| `MenuCell` | menuitem | label |  | A menu cell: shortcut: "c" shows the Command-key equivalent on the right; .selected() highlights it white |
| `MenuItem` | menuitem | label |  | A menu cell: shortcut: "c" shows the Command-key equivalent on the right; .selected() highlights it white |
| `MiniWindow` | button | label | variant: "miniwindow" | A miniaturized window: a 64 px tile with its title strip at the bottom |
| `NSBox` | card | title | variant: "box" | A Box: a grooved frame with its title at the top-left |
| `NSBrowser` | hstack |  | alignment: "stretch", spacing: 0 | The column browser: BrowserColumn children, each with its own scroller on the left |
| `NSButton` | button | label |  | A bevelled push button; .variant(.default) (or ReturnButton) adds the return glyph; .selected() is the highlighted (white) state |
| `NSColorWell` | color | color |  | A colour well: a bevelled frame around a colour swatch |
| `NSForm` | vstack |  | alignment: "stretch", spacing: 4 | A Form: a column of FormCells |
| `NSFormCell` | textfield | label |  | A Form entry: the title on the left, the bezelled field on the right |
| `NSMenu` | card | title | variant: "menu" | A vertical menu: black title bar over a column of menu cells; MenuItem / SubmenuItem children |
| `NSMenuItem` | menuitem | label |  | A menu cell: shortcut: "c" shows the Command-key equivalent on the right; .selected() highlights it white |
| `NSPanel` | card | title | variant: "panel" | A panel (inspector, find, info): title bar with the close button only, no resize bar |
| `NSPopUpButton` | select | label |  | A pop-up list: a raised button with the small bar indicator on the right |
| `NSProgressIndicator` | progress |  |  | A progress bar (OPENSTEP 4): sunken trough with a dark fill |
| `NSRadioButton` | radio | label |  | A radio button: a round bezel, dark when on |
| `NSRulerView` | toolbar |  | variant: "ruler" | The Text ruler: a tick-marked strip with alignment, spacing and tab controls |
| `NSScrollView` | scroll |  |  | A ScrollView with its scroller on the LEFT (NeXT style: knob in a dark trough, both arrows at the bottom) |
| `NSSecureTextField` | textfield | label | kind: "password" | A text field that shows bullets |
| `NSSlider` | slider | label |  | A slider: a sunken dark grey trough and a raised knob with a dimple |
| `NSSplitView` | vstack |  | alignment: "stretch", spacing: 0 | A split view: put Divider() between the panes to get the dimpled divider bar |
| `NSSubmenuItem` | menuitem | label |  | A menu cell that opens a submenu (the arrow on the right); .selected() while its submenu is attached |
| `NSSwitchButton` | checkbox | label |  | A switch: a small bevelled square that shows a check mark when on |
| `NSTableView` | table |  |  | A table view: raised column titles over a white grid (Mail's message list) |
| `NSTextField` | textfield | label |  | A bezelled text field (white, sunken) |
| `NSTextView` | textfield | label | kind: "multiline" | A Text object in a ScrollView: white page with the scroller on the left |
| `NSWindow` | card | title | variant: "key" | A titled window: black title bar when key (.variant(.main) dark grey, .variant(.inactive) light grey), miniaturize button left, close button right, resize bar at the bottom |
| `NXBrowser` | hstack |  | alignment: "stretch", spacing: 0 | The column browser: BrowserColumn children, each with its own scroller on the left |
| `NXColorWell` | color | color |  | A colour well: a bevelled frame around a colour swatch |
| `NXRunAlertPanel` | dialog | title | icon: "Application", variant: "alert" | An alert panel: title bar, application icon, bold title, message and buttons with the default (return) one on the right |
| `NXSplitView` | vstack |  | alignment: "stretch", spacing: 0 | A split view: put Divider() between the panes to get the dimpled divider bar |
| `NXText` | textfield | label | kind: "multiline" | A Text object in a ScrollView: white page with the scroller on the left |
| `NXWorkspace` | canvas |  |  | The Workspace screen: the dark grey backdrop; place Window, Menu and Dock with .position(x:y:) or frames |
| `Panel` | card | title | variant: "panel" | A panel (inspector, find, info): title bar with the close button only, no resize bar |
| `PathView` | hstack |  | alignment: "top", spacing: 0 | The File Viewer's icon path: a FileIcon per folder of the current path |
| `PopUpList` | select | label |  | A pop-up list: a raised button with the small bar indicator on the right |
| `ProgressIndicator` | progress |  |  | A progress bar (OPENSTEP 4): sunken trough with a dark fill |
| `PullDownList` | select | label | variant: "pulldown" | A pull-down list: a raised button with a down arrow |
| `RadioButton` | radio | label |  | A radio button: a round bezel, dark when on |
| `RadioMatrix` | radiogroup | label |  | A Matrix of radio button cells: RadioMatrix("Title", items: […], selection:) |
| `ReturnButton` | button | label | variant: "default" | The default button of a panel: the return-key glyph after its title |
| `Ruler` | toolbar |  | variant: "ruler" | The Text ruler: a tick-marked strip with alignment, spacing and tab controls |
| `ScrollView` | scroll |  |  | A ScrollView with its scroller on the LEFT (NeXT style: knob in a dark trough, both arrows at the bottom) |
| `SecureTextField` | textfield | label | kind: "password" | A text field that shows bullets |
| `Separator` | divider |  |  | An etched separator |
| `Shelf` | hstack |  | alignment: "top", spacing: 12 | The File Viewer's shelf: a row of FileIcons above the browser |
| `Slider` | slider | label |  | A slider: a sunken dark grey trough and a raised knob with a dimple |
| `SplitView` | vstack |  | alignment: "stretch", spacing: 0 | A split view: put Divider() between the panes to get the dimpled divider bar |
| `SubmenuItem` | menuitem | label |  | A menu cell that opens a submenu (the arrow on the right); .selected() while its submenu is attached |
| `Switch` | checkbox | label |  | A switch: a small bevelled square that shows a check mark when on |
| `TableView` | table |  |  | A table view: raised column titles over a white grid (Mail's message list) |
| `Terminal` | code | code | variant: "terminal" | A Terminal window body (white, monospaced) |
| `TextField` | textfield | label |  | A bezelled text field (white, sunken) |
| `TextView` | textfield | label | kind: "multiline" | A Text object in a ScrollView: white page with the scroller on the left |
| `Title` | text | content | font: "title2" | A Helvetica Bold heading |
| `TornOffMenu` | card | title | variant: "torn" | A submenu torn off and left on screen: its title bar gains a close button |
| `Window` | card | title | variant: "key" | A titled window: black title bar when key (.variant(.main) dark grey, .variant(.inactive) light grey), miniaturize button left, close button right, resize bar at the bottom |
| `Workspace` | canvas |  |  | The Workspace screen: the dark grey backdrop; place Window, Menu and Dock with .position(x:y:) or frames |

<!-- end catalogue: nextstep -->

## win31 — Windows 3.1.1

<!-- catalogue: win31 — generate with `mockitdown elements win31 --markdown --own` -->

| Element | Role | Arguments | Defaults | Notes |
|---|---|---|---|---|
| `AUTOCHECKBOX` | checkbox | label |  |  |
| `AUTORADIOBUTTON` | radio | label |  |  |
| `ApplicationWindow` | card | title | kind: "window", variant: "active" | Same as Window |
| `AutoCheckBox` | checkbox | label |  |  |
| `AutoRadioButton` | radio | label |  |  |
| `Button` | button | label | variant: "push" | PUSHBUTTON; .variant(.default) is the DEFPUSHBUTTON with the heavy outline; .state(.focused) draws the dotted focus rectangle |
| `CHECKBOX` | checkbox | label |  | Resource-script spelling |
| `COMBOBOX` | select | label | variant: "dropdown" |  |
| `CTEXT` | text | content | kind: "ctext" | Centred static text |
| `CalcKey` | button | label | variant: "calc" | A Calculator key; .foregroundStyle(.red) for C/CE like the original |
| `Calculator` | card | title | kind: "window", title: "Calculator", variant: "active" | Calculator window: an Edit display and a grid of CalcKeys |
| `CardStack` | zstack |  | alignment: "topLeading", kind: "cards" | Overlapping IndexCards, back to front; offset each with .offset(x:y:) |
| `Cardfile` | card | title | kind: "window", title: "Cardfile - (Untitled)", variant: "active" | Cardfile window: MenuBar, a status Static, then a CardStack of IndexCards |
| `CheckBox` | checkbox | label |  | CheckBox("Wrap", checked: true) — square box with an X |
| `Clock` | card | title | kind: "window", title: "Clock", variant: "active" | Clock window: ClockFace inside |
| `ClockFace` | shape |  | kind: "clock", shape: "circle" | Analog clock face at 10:10 (size with .frame) |
| `ColorPalette` | swatches |  |  | The 48 basic colours grid of the Custom Color Selector (colors:, selection:) |
| `ComboBox` | select | label | variant: "dropdown" | ComboBox(items:, selection:, open:) — edit plus the separate drop-down arrow box |
| `ControlPanel` | card | title | kind: "window", title: "Control Panel", variant: "active" | Control Panel window: a grid of ProgramItems (Color, Fonts, Ports, …) |
| `DEFPUSHBUTTON` | button | label | variant: "default" | Resource-script spelling |
| `DIALOG` | dialog | title | inline: true, variant: "dialog" |  |
| `DefPushButton` | button | label | variant: "default" | BS_DEFPUSHBUTTON — the default button |
| `Desktop` | zstack |  | alignment: "topLeading" | The teal desktop; place windows with .offset(x:y:) (top-left anchored) |
| `DesktopIcon` | label | title | icon: "app", variant: "minimized" | A minimized application icon on the desktop |
| `DialogBox` | dialog | title | inline: true, variant: "dialog" | DialogBox("Print Setup") { controls } actions: { Button… } — modal frame, caption with control-menu box |
| `Directory` | treeitem | label | folder: true | Directory("windows", expanded:) — folder icon; the selected one shows the open folder |
| `DirectoryTree` | tree |  | variant: "directory" | DirectoryTree { Directory("c:\\") { Directory("windows").selected() } } |
| `DirectoryWindow` | card | title | kind: "window", variant: "child" | DirectoryWindow("C:\\WINDOWS\\*.*") { DriveBar; HStack { DirectoryTree; FileList } } |
| `Drive` | button | label | kind: "hard", variant: "drive" | Drive("c", kind: .floppy/.hard/.network/.cdrom/.ram).selected() |
| `DriveBar` | toolbar |  | variant: "drivebar" | Row of Drive buttons, then the volume label Static |
| `DropDownList` | select | label | variant: "dropdownList" | CBS_DROPDOWNLIST — no editing |
| `EDITTEXT` | textfield | text |  | Resource-script spelling |
| `Edit` | textfield | text |  | Edit("C:\\WINDOWS", label:) — single-line edit; kind: .multiline for MultiLineEdit |
| `EditText` | textfield | text |  |  |
| `FileItem` | listitem | title | icon: "doc", kind: "document" | FileItem("win.com", kind: .program/.document/.file/.folder, detail: "50,904") |
| `FileList` | list |  | variant: "files" | FileList { FileItem("win.ini") … } — the right pane of a directory window |
| `FileManager` | card | title | kind: "window", title: "File Manager", variant: "active" | File Manager window: MenuBar, then DirectoryWindow children |
| `GROUPBOX` | card | title | variant: "groupbox" | Resource-script spelling |
| `Gauge` | progress | value | variant: "gauge" | The Setup percentage gauge (value 0…1) |
| `GroupBox` | card | title | variant: "groupbox" | GroupBox("Orientation") { RadioButton… } — a black frame with the caption breaking the top line |
| `ICON` | icon | name |  |  |
| `Icon` | icon | name |  | An icon glyph |
| `IndexCard` | stickynote | title, text | color: "white", variant: "card" | IndexCard("Brown, Ana", "555-0134") — white card with the index line |
| `LISTBOX` | list |  | variant: "listbox" |  |
| `LTEXT` | text | content |  | Left-aligned static text |
| `ListBox` | list |  | variant: "listbox" | ListBox { ListBoxItem("Arial").selected() … } |
| `ListBoxItem` | listitem | title |  | A list box line (icon:, detail:) |
| `MDIChildWindow` | card | title | kind: "window", variant: "child" | MDI document window inside an MDIClient |
| `MDIClient` | zstack |  | alignment: "topLeading", kind: "mdiclient" | MDI workspace (Application Workspace colour); children placed with .offset |
| `MENUITEM` | menuitem | label |  | Resource-script spelling of MenuItem |
| `MSDOSPrompt` | code | code | kind: "dos", variant: "terminal" | Full-screen-ish MS-DOS Prompt; lines starting with "C:\\>" are commands |
| `MSGraph` | chart |  |  | Microsoft Graph chart in the 16-colour VGA palette (kind:) |
| `Menu` | menu | label | caret: false, variant: "menubar" | Menu("File", open: true) { MenuItem("Open...", shortcut: "Ctrl+O") } |
| `MenuBar` | toolbar |  | variant: "menubar" | MenuBar { Menu("File") { MenuItem… } } — first letters are underlined as mnemonics |
| `MenuItem` | menuitem | label |  | MenuItem("Save As...", shortcut:, checked:, disabled:) |
| `MenuSeparator` | divider |  |  |  |
| `MessageBox` | dialog | title | icon: "info.circle", inline: true, variant: "information" | MessageBox("Program Manager", message:, icon: .stop/.exclamation/.information/.question, buttons: ["OK", "Cancel"], primary: "OK") |
| `ModalDialog` | dialog | title | variant: "dialog" | A DialogBox presented over the screen |
| `MultiLineEdit` | textfield | text | kind: "multiline" | ES_MULTILINE edit (rows:) |
| `Notepad` | card | title | kind: "window", title: "Notepad - (Untitled)", variant: "active" | Notepad window: MenuBar + MultiLineEdit |
| `POPUP` | menu | label | caret: false, variant: "menubar" | Resource-script spelling of Menu |
| `PUSHBUTTON` | button | label | variant: "push" | Resource-script spelling |
| `PasswordEdit` | textfield | text | kind: "password" | ES_PASSWORD edit (asterisks) |
| `PopupMenu` | menu |  |  | A free-standing drop-down menu (open) |
| `ProgramGroup` | card | title | kind: "window", variant: "child" | Program group child window: a grid of ProgramItems |
| `ProgramGroupIcon` | label | title | icon: "square.grid.2x2", variant: "group" | A minimized program group at the bottom of Program Manager |
| `ProgramItem` | label | title | icon: "app", variant: "item" | ProgramItem("Notepad", icon: "doc") — 32×32 icon over a caption; .selected() |
| `ProgramManager` | card | title | kind: "window", title: "Program Manager", variant: "active" | Program Manager window: put a MenuBar and an MDIClient of ProgramGroups inside |
| `ProgressBar` | progress | label |  | Setup gauge: navy fill in a sunken box |
| `PushButton` | button | label | variant: "push" | BS_PUSHBUTTON |
| `RADIOBUTTON` | radio | label |  | Resource-script spelling |
| `RTEXT` | text | content | kind: "rtext" | Right-aligned static text |
| `RadioButton` | radio | label |  | RadioButton("Portrait", checked: true) |
| `SCROLLBAR` | slider |  | orientation: "horizontal", variant: "scrollbar" |  |
| `ScrollBar` | slider |  | orientation: "horizontal", variant: "scrollbar" | ScrollBar(value: 0.3, orientation: .vertical) — arrow boxes and a square thumb |
| `Static` | text | content |  | A static text control (bold System font) |
| `StatusBar` | toolbar |  | variant: "statusbar" | StatusBar { StatusBarPane("Selected 1 file(s)") } |
| `StatusBarPane` | text | content | kind: "pane" | A sunken status-bar pane |
| `SystemMenu` | menu |  |  | The control menu (Restore, Move, Size, Minimize, Maximize, Close, Switch To…) |
| `ToolBar` | toolbar |  | variant: "toolbar" | WfW 3.11-style toolbar (File Manager) |
| `ToolBarButton` | button | icon | iconOnly: true, variant: "tool" | ToolBarButton("folder") |
| `TrackBar` | slider | label |  | A slider (Control Panel Mouse/Desktop style) |
| `Window` | card | title | kind: "window", variant: "active" | Overlapped window: navy caption, control-menu box, min/max arrows, sizing border. .variant(.inactive) |
| `Worksheet` | spreadsheet |  |  | Excel 4.0 worksheet: grey headers, black active-cell border |
| `Write` | card | title | kind: "window", title: "Write - (Untitled)", variant: "active" | Windows Write window |

<!-- end catalogue: win31 -->

## win95 — Windows 95

<!-- catalogue: win95 — generate with `mockitdown elements win95 --markdown --own` -->

| Element | Role | Arguments | Defaults | Notes |
|---|---|---|---|---|
| `CascadeMenu` | menu |  |  | A cascading menu beside the Start menu or a menu bar: CascadeMenu { MenuItem("Notepad", systemImage: "doc") } |
| `CheckBox` | checkbox | label |  | 13 px sunken white box with the black check: CheckBox("Hide files", checked: true) |
| `Clock` | text | content | content: "4:20 PM" | Taskbar clock |
| `ComboBox` | select | label |  | Drop-down combo with the raised arrow button: ComboBox(items:, selection:) |
| `ContextMenu` | menu | label |  | Pop-up (right-click) menu, grey with the navy highlight |
| `ControlPanelItem` | label | title |  | A Control Panel applet: ControlPanelItem("Display", systemImage: "display") |
| `CopyAnimation` | hstack |  |  | The file-copy animation: two folders with a page flying between them |
| `DateTimePicker` | datepicker | label |  | Date field with the drop-down arrow |
| `DefaultButton` | button | label | state: "focused", variant: "default" | The default (Enter) button: black outline and dotted focus rectangle |
| `Desktop` | canvas |  |  | The teal #008080 desktop; place DesktopIcons and Windows with .position(x:y:) |
| `DesktopIcon` | label | title |  | DesktopIcon("My Computer", systemImage: "my.computer") — 32 px icon over a caption; .selected() draws the navy caption with the dotted focus rectangle |
| `DialogBody` | vstack |  |  | Root of a dialog screen: the frame's caption keeps only Close (and ? with .variant(.help)); grey dialog face |
| `DropDownList` | select | label |  | Drop-down list (not editable) |
| `DropDownMenu` | menu | label | caret: false, open: true, variant: "menubar" | A menu-bar title with its menu dropped down: MenuBar { DropDownMenu("File") { MenuItem… } MenuBarItem("Edit") } |
| `FileIcon` | label | title |  | FileIcon("Readme.txt", systemImage: "doc") · .variant(.small) puts the name beside a 16 px icon |
| `Frame` | card | title |  | Alias of GroupBox |
| `GroupBox` | card | title |  | Etched frame with the caption breaking the top line |
| `IconView` | grid |  |  | Large Icons view: a grid of FileIcons in a sunken white well |
| `ListBox` | list |  |  | Single-selection list box with a sunken border |
| `ListView` | table |  |  | Details view: raised column headers, columns:, rows:, selectedRows: |
| `MSDOSPrompt` | code |  | variant: "terminal" | An MS-DOS Prompt window body (black, Fixedsys) |
| `MenuBar` | toolbar |  |  | A menu bar: MenuBarItem("File")… |
| `MenuBarItem` | button | label | variant: "plain" | A menu-bar title; .selected() when its menu is open (navy highlight) |
| `MenuSeparator` | divider |  |  | Etched separator in a menu |
| `MessageBox` | dialog | title | severity: "info", systemImage: "info.circle" | Modal message box: MessageBox("Confirm File Delete", message: "…", severity: .question, buttons: ["Yes", "No"], primary: "Yes") — the icon is drawn from severity |
| `Monitor` | zstack |  |  | The monitor preview in Display Properties: a grey bezel around its child (the screen) |
| `MonthCalendar` | calendar |  |  | Month calendar (Date/Time Properties) |
| `MultilineTextBox` | textfield | text | kind: "multiline" | Multi-line edit control |
| `Notepad` | textfield | text | kind: "multiline" | Notepad's edit area: fills its window, white, Fixedsys, with the scroll bars |
| `NotificationArea` | hstack |  |  | Alias of Tray |
| `OptionButton` | radio | label |  | Round sunken option button (also RadioButton) |
| `PaneHeader` | text | content |  | Explorer's raised caption over a pane: PaneHeader("All Folders") |
| `PasswordBox` | textfield | placeholder | kind: "password" | Password edit (asterisks) |
| `PopupMenu` | menu | label |  | A free-standing pop-up menu |
| `ProgressBar` | progress | label |  | Sunken progress bar of navy blocks: ProgressBar(value: 0.6) |
| `PropertyRow` | labeled | label, value |  | A label: value line in a property sheet |
| `PropertySheet` | vstack |  | variant: "help" | Root of a property-sheet screen (tabs + OK/Cancel/Apply): caption with ? and Close |
| `PushButton` | button | label |  | 75 × 23 push button with the two-pixel bevel; .variant(.default) adds the black outline, .state(.focused) the dotted focus rectangle |
| `RadioButtonList` | radiogroup | label |  | RadioButtonList("View", items: […], selection:) |
| `ScrollBar` | slider |  | orientation: "horizontal", variant: "scrollbar" | ScrollBar(value: 0.3, orientation: .vertical) — dithered track, arrow buttons and a square thumb |
| `ScrollCorner` | spacer |  |  | The grey size box where a horizontal and a vertical ScrollBar meet |
| `StartButton` | button | label | label: "Start", systemImage: "start" | The raised bold Start button with a neutral glyph; .selected() while the menu is open |
| `StartMenu` | card | title | subtitle: "95", title: "Workspace" | The Start menu with the vertical side banner: StartMenu("Workspace", subtitle: "95") { StartMenuItem… } |
| `StartMenuItem` | listitem | title |  | StartMenuItem("Programs", systemImage: "programs", submenu: true) — 32 px icon, ▸ for a cascading menu; .selected() is the navy highlight |
| `StaticText` | text | content |  | A static text control |
| `StatusBar` | hstack |  |  | Window status bar of sunken StatusBarPanels with the size grip |
| `StatusBarPanel` | text | content |  | One sunken status-bar field |
| `TabControl` | tabs |  | placement: "top" | Property-sheet tabs: raised tabs with clipped corners, the selected one 2 px taller |
| `TabPage` | tab | label |  | TabPage("General") { … } |
| `Taskbar` | hstack |  |  | The grey taskbar along the bottom: StartButton, TaskbarButton…, Spacer, Tray |
| `TaskbarButton` | button | label | systemImage: "app" | A window's taskbar button (160 px, icon + caption); .selected() for the active window: pressed and dithered |
| `TextBox` | textfield | placeholder |  | Sunken white edit control |
| `ToolBar` | toolbar |  |  | A flat toolbar (the drive combo and 16 px buttons); a grip ridge at its left |
| `ToolBarButton` | button | label | iconOnly: true, variant: "toolbar" | A flat 23 × 22 toolbar button, raised on .state(.hover), sunken when .selected() |
| `ToolTip` | tooltip | text | placement: "bottom" | Pale yellow tooltip with a black border, below its target |
| `TrackBar` | slider |  |  | Trackbar with the pointed raised thumb: TrackBar(value: 3, in: 0...10, ticks: 10) |
| `Tray` | hstack |  |  | The sunken notification area at the right of the taskbar: TrayIcon… Clock |
| `TrayIcon` | icon | name |  | A 16 px tray icon |
| `TreeView` | tree |  |  | Folder tree with dotted lines and +/− boxes in a sunken white well |
| `TreeViewItem` | treeitem | label |  | TreeViewItem("Windows", systemImage: "folder") |
| `UpDown` | stepper | label |  | Spin box: UpDown("Copies", value: 2) |
| `Window` | card | title |  | A window drawn inside a Desktop: navy caption with the app icon, Minimize/Maximize, gap, Close. Window("Notepad", systemImage: "doc") { … } · .variant(.inactive / .dialog / .tool) |
| `Wizard` | card | title |  | Wizard page: the picture panel at left (systemImage:), title and body at right, actions: { < Back · Next > · Cancel } under an etched line |

<!-- end catalogue: win95 -->

## macos9 — Mac OS 9 (Platinum)

<!-- catalogue: macos9 — generate with `mockitdown elements macos9 --markdown --own` -->

| Element | Role | Arguments | Defaults | Notes |
|---|---|---|---|---|
| `Alert` | dialog | title | icon: "exclamationmark.triangle", severity: "caution", variant: "alert" | A modal alert with the Stop / Note / Caution icon: severity: .stop / .note / .caution; buttons:, primary: |
| `AppleMenu` | menu |  | caret: false, icon: "circle" | The Apple menu at the left of the menu bar (a neutral rainbow glyph); open: true shows its items |
| `ApplicationIcon` | label | title | icon: "app", kind: "application" | An application icon (the generic diamond) |
| `ApplicationMenu` | menu | label | caret: false, icon: "app" | The Application menu at the right of the menu bar: icon and name of the frontmost application |
| `AsyncArrows` | progress |  | kind: "circular" | The chasing-arrows busy indicator |
| `Balloon` | tooltip | text |  | Balloon help: Balloon("Click to empty the Trash.") { target view }; placement: |
| `BevelButton` | button | label | variant: "bevel" | A square bevel button (toolbar-style); icon:, .selected() for the pressed state |
| `Button` | button | label |  | A Platinum push button. .variant(.default) (or DefaultButton) draws the default ring |
| `CheckBox` | checkbox | label |  | A Platinum check box; checked: true / .mixed |
| `ControlPanel` | card | title | variant: "panel" | A control panel window (platinum body); combine with Tabs, GroupBox, PopupMenu … |
| `ControlStrip` | toolbar |  |  | The Control Strip: ControlStripModule children; place at the bottom-left of the Desktop |
| `ControlStripModule` | button | icon | dropdown: true, iconOnly: true | One Control Strip module (icon + popup arrow) |
| `DefaultButton` | button | label | variant: "default" | The default push button with its thick outline (Return activates it) |
| `Desktop` | canvas |  |  | The Finder desktop (pattern background). Put a MenuBar first, then place windows and icons with .position(x:y:) |
| `Dialog` | dialog | title | variant: "dialog" | A centred modal dialog (Mac OS 9 has no sheets) |
| `DisclosureTriangle` | accordion | title |  | A disclosure triangle with its label; expanded: true shows the content |
| `Disk` | label | title | icon: "archivebox", kind: "disk" | A hard disk icon |
| `DocumentIcon` | label | title | icon: "doc", kind: "document" | A document icon |
| `DocumentWindow` | card | title | variant: "document" | A document window |
| `EditText` | textfield | placeholder |  | An edit-text field (Toolbox name) |
| `Finder` | card | title | variant: "document" | A Finder window; put an InfoBar, then FinderIcon/Folder… (icon view) or a FinderList (list view) inside |
| `FinderIcon` | label | title |  | A Finder / desktop icon with its name below. icon: any icon name; .selected() inverts the name |
| `FinderList` | table |  |  | Finder list view: columns: ["Name", "Date Modified", "Size", "Kind"], rows:, sortColumn:, selectedRows: |
| `FloatingWindow` | card | title | variant: "utility" | A floating palette / utility window with a thin title bar |
| `Folder` | label | title | icon: "folder", kind: "folder" | A folder icon |
| `GroupBox` | card | title | variant: "group" | A primary group box (etched frame, title on the frame) |
| `InfoBar` | labeled | label, value |  | The Finder window header: InfoBar("12 items", "1.2 GB available") |
| `ListItem` | listitem | title |  | A list row |
| `ListView` | list |  |  | A list box (white, inset frame); Row/ListItem children, .selected() highlights |
| `LittleArrows` | stepper | label |  | The little up/down arrows control beside a number field |
| `MenuBar` | toolbar |  |  | The menu bar: AppleMenu(), Menu("File") …, Spacer(), Text(clock), ApplicationMenu("Finder") |
| `MenuItem` | menuitem | label |  | A menu item. shortcut: "⌘N", checked:, .disabled(), .highlighted() (the item under the pointer) |
| `MenuTitle` | menu | label | caret: false | A menu bar title; MenuTitle("File", open: true) { MenuItem(…) } shows its menu |
| `ModalDialog` | card | title | variant: "dialog" | A modal dialog drawn in place (no title bar); use Dialog for a centred overlay |
| `MovableModalDialog` | card | title | variant: "movableModal" | A movable modal dialog: title bar without close box |
| `PasswordField` | textfield | placeholder | kind: "password" | A password field (bullets) |
| `PopupMenu` | select | label |  | A popup menu button with the double arrow; PopupMenu("Font:", items: […], selection:, open:) |
| `ProgressBar` | progress | label |  | A progress bar; value: 0…1, or no value for the (static) blue barber pole |
| `PullDownMenu` | menu | label | caret: false | A pull-down menu (menu bar title or bevel button menu) |
| `PushButton` | button | label |  | A Platinum push button |
| `RadioButton` | radio | label |  | A Platinum radio button |
| `RadioGroup` | radiogroup | label |  | RadioGroup("Size", items: […], selection:) |
| `ScrollArea` | scroll |  | variant: "both" | A scrolling content area with Platinum scroll bars (arrows together at the bottom / right) |
| `SearchField` | textfield | placeholder | kind: "search" | A Sherlock-style search field |
| `SecondaryGroupBox` | card | title | variant: "secondary" | A secondary group box (lighter etched frame) |
| `Separator` | divider |  |  | An etched separator line |
| `Slider` | slider | label |  | A Platinum slider with the pointed thumb; Slider("Volume:", value: 0.4, ticks: 5) |
| `StickyNote` | stickynote | text |  | A Stickies note |
| `TabControl` | tabs | items | placement: "top" | Platinum tab control (Toolbox name) |
| `Tabs` | tabs | items | placement: "top" | Platinum tab control (as in the Appearance control panel); Tab("Fonts") { … } children |
| `TextField` | textfield | placeholder |  | An edit-text field with the inset frame; .state(.focused) draws the focus ring |
| `Toolbar` | toolbar |  |  | A window toolbar of BevelButtons (application-drawn, platinum) |
| `TrashIcon` | label | title | icon: "trash", kind: "trash", title: "Trash" | The Trash |
| `Window` | card | title | variant: "document" | A Platinum window: striped title bar, close box, zoom and collapse boxes. .inactive() greys the title bar |

<!-- end catalogue: macos9 -->

## cde — Solaris CDE

<!-- catalogue: cde — generate with `mockitdown elements cde --markdown --own` -->

| Element | Role | Arguments | Defaults | Notes |
|---|---|---|---|---|
| `DtComboBox` | select | label | variant: "combo" | CDE combo box |
| `DtIcon` | label | title |  | A File Manager / Application Manager icon: picture with its name below; .selected() |
| `DtIconButton` | button | label | variant: "icontop" | A button with its icon above the label (Style Manager) |
| `DtIconGrid` | hstack |  | alignment: "top", spacing: 14, wrap: true | Icon view of a folder |
| `DtSpinBox` | stepper | label |  | Spin box with up/down arrows |
| `DtTerm` | code | code | variant: "terminal" | dtterm terminal emulator; lines starting with "$ " are commands |
| `DtWindow` | card | title |  | A dtwm-framed window inside a Workspace (resize border, window-menu button, minimise/maximise); .variant(.inactive) |
| `FrontPanel` | toolbar |  | variant: "frontpanel" | The CDE Front Panel along the bottom of the screen |
| `FrontPanelControl` | button | label | variant: "fpcontrol" | A Front Panel control (icon:) with the subpanel arrow above it |
| `FrontPanelIcon` | button | label | variant: "fpplain" | A Front Panel control without a subpanel (e.g. the clock) |
| `StatusLine` | toolbar |  | variant: "status" | Sunken message/status line at the bottom of a main window |
| `SwitchControl` | button | label | variant: "switchctl" | Lock / Exit / busy-light controls beside the workspace buttons |
| `Workspace` | zstack |  | alignment: "topLeading" | The workspace backdrop; place windows with .padding and the FrontPanel with .frame(maxHeight: .infinity, alignment: .bottom) |
| `WorkspaceButton` | button | label | variant: "workspace" | A workspace button; .selected() for the current workspace; .color(.ws2) etc. |
| `WorkspaceSwitch` | grid |  | columns: 2, spacing: 3 | The workspace switch in the middle of the Front Panel |
| `XmArrowButton` | button | direction | variant: "arrow" | Arrow button |
| `XmCascadeButton` | button | label | variant: "cascade" | A menu-bar title; the first letter is the mnemonic; .selected() arms it |
| `XmComboBox` | select | label | variant: "combo" | Combo box: sunken text with an arrow button |
| `XmDialogShell` | dialog | title |  | A dialog window |
| `XmDrawingArea` | canvas |  |  | Free-form drawing area |
| `XmErrorDialog` | dialog | title | icon: "error", variant: "alert" | Error dialog |
| `XmForm` | vstack |  | alignment: "stretch", spacing: 8 | Form container |
| `XmFrame` | card | title | variant: "frame" | Etched-in frame with a title on its top edge |
| `XmInformationDialog` | dialog | title | icon: "information", variant: "alert" | Information dialog |
| `XmLabel` | text | content |  | Label |
| `XmList` | list |  |  | List; ListItem children, .selected() uses the select colour |
| `XmListItem` | listitem | title |  | An item of an XmList |
| `XmMainWindow` | vstack |  | alignment: "stretch", spacing: 0 | Main window: menu bar, work area, message line |
| `XmMenuBar` | toolbar |  | variant: "menubar" | Raised menu bar holding XmCascadeButtons / XmPulldownMenus |
| `XmMenuItem` | menuitem | label |  | A push-button gadget in a menu: shortcut:, checked:, .selected() (armed) |
| `XmMessageBox` | dialog | title | variant: "alert" | Message dialog: symbol on the left, message, separator, buttons |
| `XmNotebook` | tabs |  |  | Motif 2.1 notebook (tabs) |
| `XmOptionMenu` | select | label |  | Option menu: raised button with the small raised-bar indicator |
| `XmPanedWindow` | vstack |  | alignment: "stretch", spacing: 0 | Panes separated by sashes |
| `XmPopupMenu` | menu |  |  | A pop-up menu (no trigger) |
| `XmPulldownMenu` | menu | label | caret: false, variant: "cascade" | XmPulldownMenu("File", open: true) { MenuItem("Open...") … } |
| `XmPushButton` | button | label |  | Push button with a 2px bevel; .showAsDefault() adds the default ring |
| `XmQuestionDialog` | dialog | title | icon: "question", variant: "alert" | Question dialog |
| `XmRadioBox` | radiogroup | label |  | Radio box from items:/selection: (diamond indicators) |
| `XmRadioButton` | radio | label |  | One-of-many toggle: diamond indicator |
| `XmRowColumn` | vstack |  | alignment: "leading", spacing: 6 | Row/column container (use HStack for XmHORIZONTAL) |
| `XmScale` | slider | label | showValue: true | Scale: sunken trough, raised slider with a centre groove, value shown |
| `XmScrollBar` | slider | value | variant: "scrollbar" | Scroll bar with arrow buttons |
| `XmScrolledList` | list |  | variant: "scrolled" | List with a vertical scroll bar |
| `XmScrolledText` | textfield | label | kind: "multiline" | Multi-line text in a scrolled window |
| `XmScrolledWindow` | scroll |  |  | Scrolling region |
| `XmSeparator` | divider |  |  | Etched separator |
| `XmSpinBox` | stepper | label |  | Motif 2.1 spin box |
| `XmText` | textfield | label | kind: "multiline" | Multi-line text |
| `XmTextField` | textfield | label |  | Single-line text field (sunken, light text background) |
| `XmToggleButton` | checkbox | label |  | N-of-many toggle: square indicator, filled with the select colour when set |
| `XmWarningDialog` | dialog | title | icon: "warning", variant: "alert" | Warning dialog |

<!-- end catalogue: cde -->

## aqua — Mac OS X Aqua

<!-- catalogue: aqua — generate with `mockitdown elements aqua --markdown --own` -->

| Element | Role | Arguments | Defaults | Notes |
|---|---|---|---|---|
| `Alert` | dialog | title | icon: "app", variant: "alert" | An application-modal alert: application icon at the left, bold message, small informative text, buttons at the right with the pulsing default button |
| `AlertSheet` | dialog | title | icon: "app", variant: "sheet" | An alert presented as a sheet (NSBeginAlertSheet): icon, message and buttons sliding from the title bar |
| `AppMenu` | menu | label | caret: false | The application menu: the frontmost application's name in bold |
| `ApplicationIcon` | label | title | icon: "app", kind: "application" | An application icon: a glossy tile in the colour given by color: |
| `BevelButton` | button | label | variant: "bevel" | A square bevel button (NSRegularSquareBezelStyle) for icons and image wells |
| `Box` | card | title | variant: "box" | A group box: title above a sunken, slightly darker rounded box |
| `Browser` | hstack |  |  | The column browser (NSBrowser), as in the Finder's column view: BrowserColumn children |
| `BrowserCell` | listitem | title | chevron: true, icon: "folder" | A folder cell of a Browser column: icon, name and the black triangle at the right |
| `BrowserColumn` | list |  |  | One column of a Browser: BrowserCell (folders, with the triangle) and FileCell rows |
| `Button` | button | label | variant: "push" | A push button: the clear gel lozenge. .variant(.default) is the pulsing blue default button |
| `CheckBox` | checkbox | label |  | An Aqua check box: clear gel square, blue gel with the check mark when on; checked: true / .mixed |
| `ColorWell` | swatches |  |  | A row of colour wells / the Colors panel swatches |
| `ComboBox` | select | label | kind: "combo" | A combo box: a text field with a blue gel arrow button at the right |
| `ContextMenu` | menu |  |  | A contextual menu drawn open in place: ContextMenu { MenuItem(…) } |
| `DefaultButton` | button | label | variant: "default" | The default button: blue gel, slowly pulsing; Return activates it |
| `Desktop` | canvas |  |  | The Aqua desktop (blue wave). Put a MenuBar first, then windows, icons and the Dock placed with .position(x:y:) |
| `DiskIcon` | label | title | icon: "archivebox", kind: "disk" | A hard disk icon |
| `Dock` | toolbar |  |  | The Dock: a translucent shelf of DockItem icons with a DockSeparator before the Trash |
| `DockItem` | button | label | iconOnly: true, variant: "dock" | An icon in the Dock: DockItem("Mail", icon: "envelope", color: .blue); .running() adds the black triangle, .highlighted() shows the name above |
| `DockSeparator` | divider |  |  | The separator between applications and documents/Trash in the Dock |
| `DocumentIcon` | label | title | icon: "doc", kind: "document" | A document icon with the folded corner |
| `DocumentWindow` | card | title | variant: "document" | A document window (pinstriped, white content area) |
| `Drawer` | card | title | variant: "drawer" | A drawer sliding out of a window side (side: .trailing default, .leading); put it next to the Window in an HStack(spacing: 0) |
| `FileCell` | listitem | title | icon: "doc" | A file cell of a Browser column (no triangle) |
| `FinderIcon` | label | title | kind: "generic" | A Finder / desktop icon with its name below; icon: any icon name |
| `FolderIcon` | label | title | icon: "folder", kind: "folder" | A translucent blue Aqua folder |
| `HelpButton` | button |  | label: "?", variant: "help" | The round help button with the question mark |
| `InfoBar` | labeled | label, value |  | The Finder window status text under the toolbar: InfoBar("6 items", "2.4 GB available") |
| `LevelIndicator` | progress | label |  | A capacity indicator (as in the Finder's disk info) |
| `ListItem` | listitem | title |  | A list row |
| `ListView` | list |  |  | A white list (single-column table) with blue selection |
| `Matrix` | radiogroup | label |  | NSMatrix of radio buttons (Interface Builder name) |
| `Menu` | menu | label |  | A menu; with no label it is a standalone (open) translucent menu |
| `MenuBar` | toolbar |  |  | The translucent menu bar: SystemMenu(), AppMenu("Finder"), MenuTitle("File") …, Spacer(), MenuExtra/Text(clock) |
| `MenuExtra` | label | title |  | A menu extra (status item) at the right of the menu bar: MenuExtra(icon: "speaker") or MenuExtra("Mon 9:41 AM") |
| `MenuItem` | menuitem | label |  | A menu item: shortcut: "⌘N", checked:, icon:, .disabled(), .highlighted() for the blue gel item under the pointer |
| `MenuTitle` | menu | label | caret: false | A menu bar title; MenuTitle("File", open: true) { MenuItem(…) } pulls its menu down |
| `MetalWindow` | card | title | variant: "metal" | A brushed-metal (textured) window, as in the media and camera applications |
| `OutlineItem` | treeitem | title |  | A row of an OutlineView |
| `OutlineView` | tree |  |  | An outline view with disclosure triangles |
| `Panel` | card | title | variant: "utility" | A utility panel (Fonts, Colors, Inspector): small title bar and small gel buttons |
| `PopUpButton` | select | label |  | A pop-up button: clear gel lozenge with the blue cap holding the double arrows; items:, selection:, open: |
| `PreferenceIcon` | label | title | kind: "pref" | A System Preferences pane icon: glossy tile (color:) with the glyph and its name below |
| `ProgressBar` | progress | label |  | Alias of ProgressIndicator |
| `ProgressIndicator` | progress | label |  | The Aqua progress bar: blue gel with moving barber stripes; no value: the indeterminate blue-and-white pole |
| `PullDownButton` | menu | label | variant: "pulldown" | A pull-down button: a gel lozenge with a single down arrow; open: true shows its menu |
| `PushButton` | button | label | variant: "push" | A push button (NSRoundedBezelStyle) |
| `RadioButton` | radio | label |  | An Aqua radio button: clear gel bead, blue with a dark dot when selected |
| `RadioGroup` | radiogroup | label |  | A radio matrix: RadioGroup("Show:", items: [...], selection:) |
| `RoundButton` | button | icon | variant: "round" | A round gel button (NSCircularBezelStyle); on a MetalWindow the transport buttons of a media player |
| `ScrollView` | scroll |  | variant: "vertical" | A scroll view with Aqua scroll bars: blue gel thumb, both arrows together at the bottom |
| `SearchField` | textfield | placeholder | kind: "search" | A search field (rounded, with the magnifying glass) |
| `SecureTextField` | textfield | placeholder | kind: "password" | A secure text field (bullets) |
| `SegmentedControl` | segmented | label |  | A gel segmented control (items:, selection:) |
| `Separator` | divider |  |  | A separator line (NSBox separator) |
| `Sheet` | dialog | title | variant: "sheet" | A document-modal sheet sliding down from the title bar of the window drawn by the window chrome; buttons: [...], primary: |
| `Slider` | slider | label |  | An Aqua slider: thin gel track and the blue gel knob (pointed when ticks: is set) |
| `Spinner` | progress |  | kind: "circular" | The spinning (asynchronous) progress indicator with twelve grey spokes |
| `StatusDisplay` | card | title | variant: "lcd" | The LCD-style status display of a brushed-metal media application: title, subtitle and a progress |
| `Stepper` | stepper | label |  | The little arrows (NSStepper) beside a number field |
| `StickyNote` | stickynote | text |  | A Stickies note |
| `SystemMenu` | menu |  | caret: false, icon: "circle" | The system menu at the far left of the menu bar (drawn as a neutral blue gel orb); open: true shows its items |
| `TabView` | tabs | items | placement: "top" | An Aqua tab view: gel tab segments centred on the top edge of a sunken box; TabViewItem("General") { … } children |
| `TabViewItem` | tab | label |  | One tab of a TabView |
| `TableView` | table |  |  | A table view: gel column headers (the sorted one in blue), alternating blue-white rows when variant: .alternating; columns:, rows:, sortColumn:, selectedRows: |
| `Terminal` | code |  | variant: "terminal" | A Terminal window (black on white, Monaco) |
| `TextField` | textfield | placeholder |  | A text field with the inset frame; .state(.focused) draws the blue focus ring |
| `TextView` | textfield | placeholder | kind: "multiline" | A multi-line text view in an inset frame |
| `ToolTip` | tooltip | text |  | A help tag: pale yellow tooltip |
| `Toolbar` | toolbar |  |  | A window toolbar (NSToolbar): ToolbarButton items with large icons and labels below; the white toolbar toggle lozenge is drawn at the top right |
| `ToolbarButton` | button | label | variant: "toolbar" | A toolbar item: ToolbarButton("Home", icon: "house") |
| `UtilityWindow` | card | title | variant: "utility" | A utility window (NSPanel with the utility style) |
| `Window` | card | title | variant: "document" | An Aqua window: pinstriped body, title bar with the red/yellow/green gel buttons. .inactive() greys the buttons and title |

<!-- end catalogue: aqua -->

## winxp — Windows XP (Luna)

<!-- catalogue: winxp — generate with `mockitdown elements winxp --markdown --own` -->

| Element | Role | Arguments | Defaults | Notes |
|---|---|---|---|---|
| `AddressBar` | select | value | label: "Address", systemImage: "folder" | Address combo with its label: AddressBar("C:\\Documents and Settings") |
| `AllProgramsButton` | button | label | label: "All Programs" | All Programs ▸ with the green arrow |
| `BackButton` | button | label | label: "Back", systemImage: "arrow.left", variant: "toolbar" | Green round Back arrow |
| `Balloon` | tooltip | text | placement: "top" | Notification balloon pointing at its child: Balloon("Updates are ready", message: "…") { TrayIcon("shield") } |
| `BrandGlyph` | icon | name | name: "flag" | A neutral waving-flag glyph standing in for the system logo (Welcome screen, About boxes) |
| `CategoryLink` | link | label |  | Control Panel category: CategoryLink("Appearance and Themes", systemImage: "photo") — 32 px icon and blue text |
| `CheckBox` | checkbox | label |  | 13 px box with the green check: CheckBox("Show hidden files", checked: true) |
| `Clock` | text | content | content: "10:42 AM" | Taskbar clock |
| `ComboBox` | select | label |  | Drop-down combo with the blue arrow button: ComboBox("Size", items:, selection:) |
| `ContextMenu` | menu | label |  | Pop-up menu (white with the #316ac5 highlight) |
| `DateTimePicker` | datepicker | label |  | Date picker field with the drop-down arrow |
| `DefaultButton` | button | label | variant: "default" | The dialog's default (Enter) button |
| `Desktop` | canvas |  |  | The desktop with a sky-and-hill wallpaper; place windows and icons with .position(x:y:) |
| `DesktopIcon` | label | title |  | DesktopIcon("My Computer", systemImage: "computer") — 32 px icon over a white shadowed label; .selected() |
| `DialogBody` | vstack |  |  | Root of a dialog screen: the frame's title bar keeps only Close (and ? with .variant(.help)). |
| `DropDownList` | select | label |  | Drop-down list (not editable) |
| `FileIcon` | label | title |  | FileIcon("Budget.xls", systemImage: "doc") · .variant(.tiles) puts the name beside a 32 px icon |
| `ForwardButton` | button | label | systemImage: "arrow.right", variant: "toolbar" | Green round Forward arrow |
| `Frame` | card | title |  | Group box: thin rounded frame with a blue caption (also GroupBox) |
| `GoButton` | button | label | label: "Go", systemImage: "arrow.right", variant: "toolbar" | The green Go arrow beside the address bar |
| `IconView` | grid |  |  | Icons / Tiles view: a grid of FileIcon |
| `ListBox` | list |  |  | Single-selection list box with a sunken border |
| `ListView` | table |  |  | Details view: columns:, rows:, sortColumn:, selectedRows: |
| `LogOffButton` | button | label | label: "Log Off", systemImage: "key" | Start menu footer: Log Off |
| `MenuBar` | toolbar |  |  | A classic menu bar: MenuBarItem("File")… |
| `MenuBarItem` | button | label | variant: "plain" | A menu bar title; .selected() when its menu is open |
| `MessageBox` | dialog | title |  | Modal message box: MessageBox("Disk Cleanup", message: "…", systemImage: "exclamationmark.triangle", severity: .warning, buttons: ["OK"]) |
| `MonthCalendar` | calendar |  |  | Month calendar with the blue title band |
| `MultilineTextBox` | textfield | text | kind: "multiline" | Multi-line edit control |
| `NotificationArea` | hstack |  |  | The light-blue tray at the right of the taskbar: TrayIcon… Clock |
| `OptionButton` | radio | label |  | Radio button with the green dot (also RadioButton) |
| `PasswordBox` | textfield | placeholder | kind: "password" | Password edit (black dots) |
| `ProgressBar` | progress | label |  | Green block progress: ProgressBar(value: 0.6) |
| `PropertyRow` | labeled | label, value |  | A label: value line in a property sheet |
| `PushButton` | button | label |  | 75×23 rounded button; .variant(.default) draws the blue default-button glow, .state(.hover) the orange one |
| `QuickLaunch` | hstack |  |  | Quick Launch toolbar: small IconButtons beside Start |
| `RadioButtonList` | radiogroup | label |  | RadioButtonList("View", items: […], selection:) |
| `StartButton` | button | label | label: "start", systemImage: "flag" | The green Start button (.selected() while the menu is open) |
| `StartMenu` | card | title |  | Two-column Start menu: StartMenu("Alex", avatar: "Alex") { StartMenuPrograms{…} StartMenuPlaces{…} } actions: { LogOffButton() TurnOffButton() } |
| `StartMenuItem` | listitem | title |  | StartMenuItem("Internet", subtitle: "Web browser", systemImage: "globe") |
| `StartMenuPlaces` | vstack |  |  | The light-blue right column (My Documents, Control Panel, Help, Search, Run…) |
| `StartMenuPrograms` | vstack |  |  | The white left column of the Start menu (pinned and frequent programs) |
| `StatusBar` | hstack |  |  | Window status bar of sunken StatusBarPanels |
| `StatusBarPanel` | text | content |  | One status bar field |
| `SysLink` | link | label |  | Hyperlink text control |
| `SystemTray` | hstack |  |  | Alias of NotificationArea |
| `TabControl` | tabs |  | placement: "top" | Property-sheet tabs with the orange hot-track line on the selected tab |
| `TabPage` | tab | label |  | TabPage("General") { … } |
| `TaskLink` | link | label |  | TaskLink("Rename this file", systemImage: "pencil") |
| `TaskPane` | vstack |  |  | Explorer's blue common-tasks pane holding TaskPaneSections |
| `TaskPaneSection` | accordion | title | expanded: true | Collapsible task box: TaskPaneSection("File and Folder Tasks") { TaskLink(…) } · .variant(.special) for the dark-blue header |
| `Taskbar` | hstack |  |  | The blue taskbar: StartButton, QuickLaunch, TaskbarButton…, Spacer, NotificationArea |
| `TaskbarButton` | button | label |  | A window's taskbar button; .selected() for the active window |
| `TextBox` | textfield | placeholder |  | Edit control with the #7f9db9 border |
| `ToolBar` | toolbar |  |  | Explorer's Standard Buttons toolbar (flat buttons, raised on hover) |
| `ToolBarButton` | button | label | variant: "toolbar" | ToolBarButton("Search", systemImage: "search") |
| `ToolTip` | tooltip | text |  | Pale yellow tooltip |
| `TrackBar` | slider |  |  | Slider with the pointed thumb: TrackBar(value: 30, in: 0...100, ticks: 10) |
| `TrayIcon` | icon | name |  | A 16 px notification icon |
| `TreeView` | tree |  |  | Folders tree with dotted lines and +/− boxes |
| `TreeViewItem` | treeitem | label |  | TreeViewItem("My Documents", systemImage: "folder") |
| `TurnOffButton` | button | label | label: "Turn Off Computer", systemImage: "power" | Start menu / Welcome screen: the red power button |
| `UpButton` | button | label | systemImage: "arrow.up", variant: "toolbar" | Up one level |
| `UpDown` | stepper | label |  | Spin box: UpDown("Copies", value: 2) |
| `UserTile` | listitem | title |  | A user picture and name on the Welcome screen: UserTile("Alex", subtitle: "Type your password", image: …) |
| `WelcomeBand` | hstack |  |  | Dark blue band at the top or bottom of the Welcome screen |
| `WelcomeScreen` | vstack |  |  | The blue Welcome (log-on) screen: header band, centre, footer band |
| `Window` | card | title |  | A Luna window drawn inside a Desktop: blue title bar with min/max/close. Window("My Computer", systemImage: "computer") { … } · .variant(.inactive / .dialog / .tool) |
| `Wizard` | card | title |  | Wizard page: white header band (title, subtitle:, systemImage:), body, and actions: { < Back · Next > · Cancel } |

<!-- end catalogue: winxp -->

## vista — Windows Vista (Aero)

<!-- catalogue: vista — generate with `mockitdown elements vista --markdown --own` -->

| Element | Role | Arguments | Defaults | Notes |
|---|---|---|---|---|
| `AllProgramsButton` | button | label | label: "All Programs" | All Programs with the arrow |
| `BackButton` | button | label | iconOnly: true, systemImage: "arrow.left" | Round glossy blue Back button |
| `Balloon` | tooltip | text | placement: "top" | Notification balloon pointing at its child: Balloon("Title", message: "…") { TrayIcon("shield") } |
| `BrandGlyph` | icon | name | name: "flag" | Neutral glyph standing in for the system logo |
| `BreadcrumbBar` | breadcrumb | items |  | Address bar as breadcrumbs: BreadcrumbBar(["Alex", "Documents", "Projects"]) |
| `CategoryLink` | link | label |  | Control Panel category with a 32 px icon |
| `CheckBox` | checkbox | label |  | Check box |
| `Clock` | text | content | content: "10:42 AM" | Taskbar clock |
| `ClockGadget` | text | content |  | Analog clock gadget (hands at 10:10); the text is the caption under the face |
| `ComboBox` | select | label |  | Combo box |
| `CommandBar` | toolbar |  |  | Explorer's dark blue command bar: CommandButton("Organize", dropdown: true)… |
| `CommandButton` | button | label | variant: "command" | A command bar button (white text, glass on hover) |
| `CommandLink` | listitem | title | systemImage: "arrow.right" | Task dialog command link: green arrow, title and subtitle: |
| `ConsentBanner` | alert | title |  | UAC banner: coloured band with a shield: ConsentBanner("A program needs your permission", severity: .warning) |
| `ContextMenu` | menu | label |  | Pop-up menu with the icon gutter |
| `DateTimePicker` | datepicker | label |  | Date picker field |
| `DefaultButton` | button | label | variant: "default" | The default (Enter) button |
| `Desktop` | canvas |  |  | The desktop with an aurora-like wallpaper; place windows, icons and gadgets with .position(x:y:) |
| `DesktopIcon` | label | title |  | DesktopIcon("Computer", systemImage: "computer") — 48 px icon, white label; .selected() |
| `DetailsPane` | card | title |  | The gradient Details pane at the foot of Explorer: DetailsPane("Report.docx", subtitle:, systemImage:) { PropertyRow(…) } |
| `DialogBody` | vstack |  |  | Root of a dialog screen: the frame keeps only Close (and ? with .variant(.help)) |
| `DialogFooter` | hstack |  |  | The grey footer band of a dialog (buttons, a 'Details' expander) — last child of DialogBody |
| `DropDownList` | select | label | variant: "dropdown" | Drop-down list drawn as a glossy button |
| `ExpandoButton` | button | label | systemImage: "chevron.down", variant: "expando" | Task dialog's 'See details' expander: round arrow button and its label |
| `FavoriteLink` | navitem | label |  | FavoriteLink("Documents", systemImage: "folder") |
| `FileIcon` | label | title |  | FileIcon("Report.docx", systemImage: "doc") · .variant(.tiles) |
| `ForwardButton` | button | label | iconOnly: true, systemImage: "arrow.right" | Round glossy blue Forward button |
| `Frame` | card | title |  | Group box (also GroupBox) |
| `GadgetSidebar` | vstack |  |  | The translucent Sidebar strip holding gadgets |
| `IconView` | grid |  |  | Icons view: a grid of FileIcon |
| `InfoBar` | alert | title |  | The yellow information bar |
| `ListBox` | list |  |  | List box |
| `ListView` | table |  |  | Details view: columns:, TableRow children or rows:, sortColumn:, selectedRows: |
| `LockButton` | button | label | iconOnly: true, systemImage: "lock" | Amber lock button |
| `MainInstruction` | text | content |  | The big blue (#003399) main instruction of a task dialog or Aero wizard |
| `MenuBar` | toolbar |  |  | A classic menu bar |
| `MenuBarItem` | button | label | variant: "plain" | A menu bar title; .selected() when open |
| `MonthCalendar` | calendar |  |  | Month calendar |
| `MultilineTextBox` | textfield | text | kind: "multiline" | Multi-line edit |
| `NavigationBar` | hstack |  |  | The glass strip with Back/Forward, the breadcrumb and the search box |
| `NavigationPane` | sidebar | title |  | Explorer's left pane: NavigationPane("Favorite Links") { FavoriteLink(…) } |
| `NotesGadget` | stickynote | text |  | Notes gadget |
| `NotificationArea` | hstack |  |  | Tray at the right of the taskbar: TrayIcon… Clock |
| `OptionButton` | radio | label |  | Radio button (also RadioButton) |
| `PasswordBox` | textfield | placeholder | kind: "password" | Password edit |
| `PowerButton` | button | label | iconOnly: true, systemImage: "power" | Red power (sleep) button |
| `PowerMenuButton` | button | label | iconOnly: true, systemImage: "chevron.right" | The arrow opening the shut-down menu |
| `ProgressBar` | progress | label |  | Green glossy progress bar; .variant(.paused) yellow, .variant(.error) red |
| `PropertyRow` | labeled | label, value |  | A label: value property line |
| `PushButton` | button | label |  | Glossy push button; .state(.hover) light-blue, .variant(.default) blue border |
| `QuickLaunch` | hstack |  |  | Quick Launch toolbar |
| `RadioButtonList` | radiogroup | label |  | RadioButtonList("View", items: […], selection:) |
| `SearchBox` | textfield | placeholder | kind: "search", placeholder: "Search" | Explorer search box (italic prompt, magnifier at the right) |
| `StartButton` | button | label | systemImage: "flag" | Alias of StartOrb |
| `StartMenu` | card | title |  | Glass Start menu: StartMenu("Alex", avatar:, avatarImage:) { StartMenuPrograms{…} StartMenuPlaces{…} } |
| `StartMenuItem` | listitem | title |  | StartMenuItem("Internet", subtitle: "Web browser", systemImage: "globe") |
| `StartMenuPlaces` | vstack |  |  | The glass right pane (user folders, Control Panel, power buttons) |
| `StartMenuPrograms` | vstack |  |  | The white left pane (programs, All Programs, Start Search) |
| `StartOrb` | button | label | systemImage: "flag" | The round glossy Start orb with a neutral glyph; .selected() while the menu is open |
| `StartSearch` | textfield | placeholder | kind: "search", placeholder: "Start Search" | The search box at the foot of the Start menu |
| `StatusBar` | hstack |  |  | Status bar |
| `StatusBarPanel` | text | content |  | One status bar field |
| `SysLink` | link | label |  | Hyperlink text |
| `TabControl` | tabs |  | placement: "top" | Property-sheet tabs |
| `TabPage` | tab | label |  | TabPage("General") { … } |
| `TaskDialog` | dialog | title |  | Task dialog: white content (MainInstruction, text, CommandLinks) over a grey footer of buttons: TaskDialog("Caption", systemImage:) { … } actions: { … } |
| `Taskbar` | hstack |  |  | The black glass taskbar: StartOrb, QuickLaunch, TaskbarButton…, NotificationArea |
| `TaskbarButton` | button | label |  | A window's glass taskbar button; .selected() for the active window |
| `TextBox` | textfield | placeholder |  | Edit control |
| `ToolTip` | tooltip | text |  | Gradient tooltip |
| `TrackBar` | slider |  |  | Slider: TrackBar(value: 30, in: 0...100, ticks: 10) |
| `TrayIcon` | icon | name |  | A 16 px notification icon |
| `TreeView` | tree |  |  | Tree with the Vista hollow/filled triangles |
| `TreeViewItem` | treeitem | label |  | TreeViewItem("Documents", systemImage: "folder") |
| `UpDown` | stepper | label |  | Spin box |
| `WeatherGadget` | stat | label, value |  | Weather gadget: WeatherGadget("Harbor City", "21°", change: "H 24° L 15°", systemImage: "sun") |
| `Window` | card | title |  | An Aero glass window drawn inside a Desktop: Window("Pictures", systemImage: "photo") { … } · .variant(.inactive / .dialog / .tool) |
| `Wizard` | card | title |  | Aero wizard page: main instruction header, white body, grey footer actions: { Next · Cancel } |

<!-- end catalogue: vista -->

## Revision history

| Version | Date | Change |
|---|---|---|
| 0.2.0 | 2026-11-24 | Page created |
| 0.2.1 | 2026-11-24 | Pack table and element catalogues generated from the shipped packs |
| 0.3.0 | 2026-11-24 | Platform and retro packs added |
