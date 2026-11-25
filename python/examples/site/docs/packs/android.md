# Android · Jetpack Compose

The **android** pack imitates Android apps built with **Jetpack Compose Material 3** (Compose Material 3
1.4, the Material 3 Expressive era, Android 16) in the **baseline colour scheme** — no dynamic colour:
primary `#6750A4` (`#D0BCFF` in dark theme), the tonal `surfaceContainerLowest…Highest` roles, Roboto
with the M3 type scale, full-pill 40dp buttons, 12dp cards, 16dp FABs, 28dp dialogs and sheets, and
tonal elevation. Phones get the Android status bar and gesture handle; tablets too. Select it with

```swift
import Compose      // or: import Android, import JetpackCompose, import Material3
```

Elements use the Compose Material 3 names — `Scaffold`, `TopAppBar` / `CenterAlignedTopAppBar` /
`MediumTopAppBar` / `LargeTopAppBar`, `BottomAppBar`, `NavigationBar` + `NavigationBarItem`,
`NavigationRail` + `NavigationRailItem`, `ModalNavigationDrawer` / `NavigationDrawerItem`, `Card` /
`ElevatedCard` / `OutlinedCard`, `Button` / `FilledTonalButton` / `OutlinedButton` / `TextButton` /
`ElevatedButton`, `IconButton` and its filled / tonal / outlined forms, `FloatingActionButton` in four sizes
plus `ExtendedFloatingActionButton`, `SingleChoiceSegmentedButtonRow`, `Checkbox`, `TriStateCheckbox`,
`RadioButton`, `Switch`, `Slider`, `RangeSlider`, `TextField` / `OutlinedTextField` (`label`,
`supportingText`, `isError`, `leadingIcon`, `trailingIcon`), `ExposedDropdownMenuBox`, `DropdownMenu`,
the four chip types, `Badge` / `BadgedBox`, progress indicators, `ListItem` (`headlineContent`,
`supportingContent`, `overlineContent`, `leadingContent`, `trailingContent`), `HorizontalDivider`,
`PrimaryTabRow` / `SecondaryTabRow`, `SearchBar`, `AlertDialog`, `ModalBottomSheet`, `Snackbar`, `Tooltip` /
`RichTooltip`, `DatePicker`, `DateRangePicker`, `TimePicker` (the clock dial),
`HorizontalMultiBrowseCarousel` and `ListDetailPaneScaffold`. Compose layout names (`Column`, `Box`,
`LazyColumn`, `LazyRow`, `LazyVerticalGrid`, `FlowRow`) work beside the core stacks; `Row` keeps its core
meaning (a list row), so use `HStack` for a horizontal layout. Callbacks such as `onClick: {}` and
`onCheckedChange: {}` are accepted and ignored, and Material Symbols names (`"more_vert"`, `"inbox"`,
`"photo_library"`) work wherever an icon is accepted.

The custom components below — `MailRow`, `SettingRow`, `GoalRing`, `TimeDisplay` and `AlarmCard` — are
ordinary structs in [`mockups/android/components.mockitdown`](https://github.com/), imported with
`import "android/components"`.

## Inbox

A Gmail-style inbox: a `SearchBar` in place of the top app bar, the imported `MailRow` (a `ListItem` with an
avatar, bold unread text and a star toggle), an `ExtendedFloatingActionButton` and a `NavigationBar` with a
badge. The FAB floats above the navigation bar, as in a `Scaffold`.

```mockitdown source="true" appearance="both"
import Compose
import "android/components"

Scaffold {
  SearchBar("Search in mail", leadingIcon: "menu", trailingIcon: "account_circle")
    .padding(.horizontal, 16).padding(.vertical, 8)
  LazyColumn {
    Text("Primary").font(.labelMedium).foregroundStyle(.secondary).padding(.horizontal, 16).padding(.vertical, 8)
    MailRow(sender: "Ana Lima", subject: "Field trip photos", preview: "I picked the best ones from Thursday…",
            time: "9:41 AM", unread: true, image: "assets/images/avatar-1.svg")
    MailRow(sender: "Google Play", subject: "Your November receipt", preview: "Thanks for your purchase of…",
            time: "8:02 AM", unread: true)
    MailRow(sender: "Ben Okafor", subject: "Re: Sprint review", preview: "Works for me — let's keep the demo short",
            time: "Yesterday", starred: true, image: "assets/images/avatar-2.svg")
    MailRow(sender: "Chen Wei", subject: "Lunch on Friday?", preview: "There's a new ramen place near the office",
            time: "Nov 22", image: "assets/images/avatar-3.svg")
    MailRow(sender: "Dana Ruiz", subject: "Contract draft v3", preview: "Attached the redlines from legal, please…",
            time: "Nov 21")
    MailRow(sender: "Eli Novak", subject: "Photos from the hike", preview: "Shared an album with you",
            time: "Nov 20", image: "assets/images/avatar-4.svg")
  }
  ExtendedFloatingActionButton("Compose", icon: "edit")
  NavigationBar {
    NavigationBarItem("Mail", icon: "mail", selected: true, badge: 12)
    NavigationBarItem("Chat", icon: "chat", badge: true)
    NavigationBarItem("Meet", icon: "videocam")
  }
}
```

The same app with its `ModalNavigationDrawer` open: a `ModalDrawerSheet` of `NavigationDrawerItem`s with
counts, section labels and a divider, over a scrim.

```mockitdown source="true"
import Compose
import "android/components"

Scaffold {
  SearchBar("Search in mail", leadingIcon: "menu", trailingIcon: "account_circle")
    .padding(.horizontal, 16).padding(.vertical, 8)
  LazyColumn {
    MailRow(sender: "Ana Lima", subject: "Field trip photos", preview: "I picked the best ones…", time: "9:41 AM", unread: true)
    MailRow(sender: "Ben Okafor", subject: "Re: Sprint review", preview: "Works for me", time: "Yesterday")
  }
  ModalNavigationDrawer(title: "Gmail") {
    NavigationDrawerItem("Inbox", icon: "inbox", selected: true, badge: "12")
    NavigationDrawerItem("Starred", icon: "star_outline")
    NavigationDrawerItem("Snoozed", icon: "snooze")
    NavigationDrawerItem("Sent", icon: "send")
    NavigationDrawerItem("Drafts", icon: "draft", badge: "3")
    HorizontalDivider()
    Text("Labels")
    NavigationDrawerItem("Family", icon: "label")
    NavigationDrawerItem("Work", icon: "label", badge: "99+")
  }
}
```

## Sign in

A full-screen form: a `Column` with a headline, `OutlinedTextField`s with leading and trailing icons, one in
the error state with `supportingText`, a checkbox row and the button pair.

```mockitdown source="true"
import Compose

Column(alignment: .leading, spacing: 16) {
  Image("assets/images/logo.svg").frame(width: 48, height: 48).padding(.top, 32)
  Text("Sign in").font(.headlineLarge)
  Text("Use your Acme account. You can change it later in Settings.").font(.bodyMedium).foregroundStyle(.secondary)
  OutlinedTextField("Email", value: "ana.lima@acme", leadingIcon: "mail", trailingIcon: "error",
                    supportingText: "Enter a valid email address", isError: true)
  OutlinedTextField("Password", value: "correct horse", leadingIcon: "lock", trailingIcon: "visibility",
                    kind: .password, state: .focused)
  OutlinedTextField("Workspace (optional)", leadingIcon: "business")
  HStack(spacing: 8) {
    Checkbox(checked: true)
    Text("Keep me signed in")
  }
  TextButton("Forgot email?").padding(.leading, -12)
  Spacer()
  HStack {
    TextButton("Create account")
    Spacer()
    Button("Next")
  }
}
.padding(.horizontal, 24).padding(.bottom, 24)
.frame(maxWidth: .infinity, maxHeight: .infinity)
```

## Settings

A `LargeTopAppBar` over grouped `SettingRow`s with switches, a brightness `Slider`, a theme
`SingleChoiceSegmentedButtonRow` and an `ExposedDropdownMenuBox`.

```mockitdown source="true" appearance="both"
import Compose
import "android/components"

Scaffold {
  LargeTopAppBar(title: "Settings", navigationIcon: { IconButton("arrow_back") }, actions: { IconButton("search") })
  LazyColumn {
    Section("Display") {
      ListItem(headlineContent: "Brightness level", icon: "light_mode")
      Slider(value: 0.62).padding(.horizontal, 16)
      ListItem(headlineContent: "Theme", icon: "dark_mode")
      SingleChoiceSegmentedButtonRow(["Light", "Dark", "System"], selection: 2).padding(.horizontal, 16)
      SettingRow(title: "Adaptive brightness", summary: "Optimise for available light", icon: "brightness_6",
                 toggle: true, on: true)
    }
    Section("Network") {
      SettingRow(title: "Wi‑Fi", summary: "Home-5G", icon: "wifi", toggle: true, on: true)
      SettingRow(title: "Bluetooth", summary: "Off", icon: "bluetooth", toggle: true)
      VStack(alignment: .stretch) {
        ExposedDropdownMenuBox("Preferred network", value: "5G (recommended)")
      }.padding(.horizontal, 16).padding(.vertical, 8)
    }
    Section("Privacy") {
      SettingRow(title: "Permission manager", summary: "Control app access to your data", icon: "privacy_tip")
    }
  }
}
```

## Photo gallery

A `TopAppBar` with a `BadgedBox` notification icon and an open `DropdownMenu`, a
`HorizontalMultiBrowseCarousel` of `CarouselItem`s, `FilterChip`s in a `LazyRow`, a `LazyVerticalGrid` of
photos and an `AssistChip`.

```mockitdown source="true"
import Compose

Scaffold {
  TopAppBar(title: "Photos", actions: {
    IconButton("cloud_upload")
    BadgedBox(badge: true) { Icon("notifications") }.padding(.horizontal, 8)
    DropdownMenu(icon: "more_vert", expanded: true) {
      DropdownMenuItem("Select", leadingIcon: "check_circle")
      DropdownMenuItem("Slideshow", leadingIcon: "play_arrow")
      HorizontalDivider()
      DropdownMenuItem("Settings", leadingIcon: "settings")
    }
  })
  LazyColumn {
    Text("Memories").font(.titleMedium).padding(.horizontal, 16).padding(.bottom, 8)
    HorizontalMultiBrowseCarousel {
      CarouselItem { Image("assets/images/photo-1.svg"); Text("1 year ago") }
      CarouselItem { Image("assets/images/photo-2.svg"); Text("Lisbon") }
      CarouselItem { Image("assets/images/photo-3.svg") }
    }
    .frame(height: 220).padding(.horizontal, 16)
    LazyRow {
      FilterChip("All", selected: true)
      FilterChip("Favourites", leadingIcon: "favorite_border")
      FilterChip("Videos")
      FilterChip("Screenshots")
    }
    .padding(16)
    LazyVerticalGrid(columns: 3, spacing: 2) {
      ForEach(1...6) { i in
        Image("assets/images/photo-\(i).svg").resizable().aspectRatio(1, contentMode: .fill)
      }
    }
    HStack {
      AssistChip("Create collage", leadingIcon: "auto_awesome")
      Spacer()
    }.padding(16)
  }
  NavigationBar {
    NavigationBarItem("Photos", icon: "photo", selected: true)
    NavigationBarItem("Collections", icon: "photo_library")
    NavigationBarItem("Search", icon: "search")
  }
}
```

## Bottom sheet and snackbar

Two states of a file browser. Tapping a file's overflow opens a `ModalBottomSheet` of actions over a scrim;
after **Get link** the sheet closes and a `Snackbar` with an action confirms it, lifted above the
`NavigationBar` and the small FAB.

```mockitdown source="true"
import Compose

Scaffold {
  CenterAlignedTopAppBar(title: "My Drive", navigationIcon: { IconButton("menu") },
                         actions: { Avatar("Ana Lima", image: "assets/images/avatar-1.svg") })
  PrimaryTabRow(["Files", "Shared", "Starred"], selectedTabIndex: 0)
  LazyColumn {
    ListItem(headlineContent: "Q4 roadmap", supportingContent: "Modified 9:12 AM", icon: "description") { IconButton("more_vert") }
    ListItem(headlineContent: "Budget 2027", supportingContent: "Modified yesterday", icon: "bar_chart") { IconButton("more_vert") }
    ListItem(headlineContent: "Team offsite", supportingContent: "Folder · 14 items", icon: "folder") { IconButton("more_vert") }
  }
  NavigationBar {
    NavigationBarItem("Home", icon: "home")
    NavigationBarItem("Files", icon: "folder", selected: true)
  }
  ModalBottomSheet {
    ListItem(headlineContent: "Q4 roadmap", supportingContent: "Google Docs", icon: "description")
    HorizontalDivider()
    ListItem(headlineContent: "Share", icon: "person_add")
    ListItem(headlineContent: "Get link", icon: "link")
    ListItem(headlineContent: "Make available offline", icon: "download")
    ListItem(headlineContent: "Rename", icon: "edit")
    ListItem(headlineContent: "Remove", icon: "delete")
  }
}
```

```mockitdown appearance="both"
import Compose

Scaffold {
  CenterAlignedTopAppBar(title: "My Drive", navigationIcon: { IconButton("menu") },
                         actions: { Avatar("Ana Lima", image: "assets/images/avatar-1.svg") })
  PrimaryTabRow(["Files", "Shared", "Starred"], selectedTabIndex: 0)
  LazyColumn {
    ListItem(headlineContent: "Q4 roadmap", supportingContent: "Modified 9:12 AM", icon: "description") { IconButton("more_vert") }
    ListItem(headlineContent: "Budget 2027", supportingContent: "Modified yesterday", icon: "bar_chart") { IconButton("more_vert") }
    ListItem(headlineContent: "Team offsite", supportingContent: "Folder · 14 items", icon: "folder") { IconButton("more_vert") }
    Skeleton(lines: 2, avatar: true).padding(16)
  }
  SmallFloatingActionButton("add")
  NavigationBar {
    NavigationBarItem("Home", icon: "home")
    NavigationBarItem("Files", icon: "folder", selected: true)
  }
  Snackbar("Link copied to clipboard", action: "Undo")
}
```

## Pickers and dialogs

A `DatePickerDialog` (the header is plain `Text`, the grid is `DatePicker`), a `TimePickerDialog` with the
imported `TimeDisplay` header above the `TimePicker` clock dial, and an `AlertDialog` with an icon.

```mockitdown source="true" appearance="both"
import Compose

Scaffold {
  TopAppBar(title: "New event", navigationIcon: { IconButton("close") }, actions: { TextButton("Save") })
  Column(alignment: .leading, spacing: 16) {
    OutlinedTextField("Title", value: "Design review")
    DatePickerField("Date", selection: "2026-11-27")
  }.padding(16)
  DatePickerDialog(title: "Select date", actions: { TextButton("Cancel"); TextButton("OK") }) {
    HStack {
      Text("Fri, Nov 27").font(.headlineLarge)
      Spacer()
      IconButton("edit")
    }.padding(.horizontal, 24).padding(.top, 20).padding(.bottom, 12)
    HorizontalDivider()
    DatePicker(selection: "2026-11-27")
  }
}
```

```mockitdown height="760"
import Compose
import "android/components"

Scaffold {
  TopAppBar(title: "Alarm")
  TimePickerDialog(title: "Select time", actions: { IconButton("keyboard"); Spacer(); TextButton("Cancel"); TextButton("OK") }) {
    TimeDisplay(hour: "7", minute: "30").padding(.horizontal, 24).padding(.vertical, 20)
    TimePicker(hour: "7")
  }
}
```

```mockitdown height="640"
import Compose

Scaffold {
  TopAppBar(title: "Drafts", navigationIcon: { IconButton("menu") })
  ListItem(headlineContent: "Trip notes", supportingContent: "Edited 2 min ago", icon: "description")
  AlertDialog(title: "Discard draft?", text: "Your changes to “Trip notes” will be lost. This can’t be undone.",
              icon: "delete", buttons: ["Cancel", "Discard"])
}
```

## Tablet: list–detail with a navigation rail

A Google Messages–style tablet layout: `NavigationRail` with a FAB in its header, then a
`ListDetailPaneScaffold` whose list pane holds conversations and whose detail pane holds the chat
(`MessageBubble`s) and a `TextField` composer. The detail pane sits on its own surface, as in the adaptive
Material 3 layouts.

```mockitdown source="true" device="tablet"
import Compose

HStack(spacing: 0) {
  NavigationRail(header: { FloatingActionButton("edit", inline: true) }) {
    NavigationRailItem("Chats", icon: "chat", selected: true, badge: 3)
    NavigationRailItem("Calls", icon: "call")
    NavigationRailItem("Contacts", icon: "people")
    NavigationRailItem("Settings", icon: "settings")
  }
  ListDetailPaneScaffold {
    VStack(alignment: .stretch, spacing: 0) {
      SearchBar("Search conversations", trailingIcon: "account_circle").padding(.vertical, 12)
      ListItem(headlineContent: "**Ana Lima**", supportingContent: "**See you at the station 🚆**",
               avatar: "Ana Lima") { Text("9:41") }.selected()
      ListItem(headlineContent: "Ben Okafor", supportingContent: "You: Sounds good!", avatar: "Ben Okafor") { Text("8:15") }
      ListItem(headlineContent: "Hiking crew", supportingContent: "Chen: Photos are up", avatar: "Hiking crew") { Text("Mon") }
      ListItem(headlineContent: "Dana Ruiz", supportingContent: "Voice message · 0:42", avatar: "Dana Ruiz") { Text("Sun") }
      ListItem(headlineContent: "Eli Novak", supportingContent: "Thanks again!", avatar: "Eli Novak") { Text("Nov 20") }
      Spacer()
    }
    VStack(alignment: .stretch, spacing: 12) {
      TopAppBar(title: "Ana Lima", subtitle: "Online", actions: { IconButton("call"); IconButton("videocam"); IconButton("more_vert") })
      VStack(alignment: .stretch, spacing: 8) {
        MessageBubble("Are we still on for Saturday?", from: .them, time: "9:30")
        MessageBubble("Yes! Train leaves at 8:10 from Oriente", from: .me, time: "9:32")
        MessageBubble("Perfect. I'll bring snacks", from: .them, time: "9:38", reactions: ["❤️"])
        MessageBubble("See you at the station 🚆", from: .them, time: "9:41")
      }.padding(.horizontal, 24)
      Spacer()
      HStack(spacing: 8) {
        IconButton("add_circle")
        TextField(placeholder: "Text message", trailingIcon: "mic").frame(maxWidth: .infinity)
        FilledIconButton("send")
      }.padding(16)
    }
  }
}
```

## Fitness dashboard

A Fit-style dashboard: `Stat` tiles in a grid, the imported `GoalRing` card, a weekly `BarChart` with
M3 rounded bars, a heart-rate `LineChart`, a `RichTooltip` and a `ShortNavigationBar`.

```mockitdown source="true" appearance="both" height="1000"
import Compose
import "android/components"

Scaffold {
  MediumFlexibleTopAppBar(title: "Today", subtitle: "Tuesday, Nov 24", actions: {
    RichTooltip("Daily goals", message: "Rings close when you reach your Move Minutes and Heart Points.",
                actions: { TextButton("Edit goals") }, placement: .bottom) { IconButton("info") }
    Avatar("Ana Lima", image: "assets/images/avatar-1.svg")
  })
  LazyColumn {
    VStack(alignment: .stretch, spacing: 12) {
      GoalRing(label: "Heart Points · goal 40", value: "32", goal: 0.8, icon: "monitor_heart")
      LazyVerticalGrid(columns: 2, spacing: 12) {
        Stat("Steps", "8,412", change: "+12%", caption: "vs last week", systemImage: "directions_walk")
        Stat("Calories", "1,860", change: "+4%", caption: "kcal", systemImage: "local_fire_department")
        Stat("Distance", "6.1 km", change: "−3%", caption: "vs last week", systemImage: "directions_run")
        Stat("Sleep", "7h 12m", change: "+25m", caption: "avg", systemImage: "bedtime")
      }
      ElevatedCard(title: "Steps this week", subtitle: "Daily average 7,960") {
        BarChart(values: [6200, 9100, 7400, 10350, 8412, 5100, 9050], labels: ["W", "T", "F", "S", "S", "M", "T"], height: 170)
      }
      OutlinedCard(title: "Heart rate", subtitle: "Resting 58 bpm") {
        LineChart(values: [62, 58, 71, 96, 124, 88, 74, 66], labels: ["6", "9", "12", "15", "18", "21", "24", ""], height: 140)
      }
    }.padding(16)
  }
  ShortNavigationBar {
    ShortNavigationBarItem("Home", icon: "home", selected: true)
    ShortNavigationBarItem("Journal", icon: "list")
    ShortNavigationBarItem("Browse", icon: "grid_view")
  }
}
```

## Annotated walkthrough: setting an alarm

A Clock screen annotated with numbered callouts. Turn an alarm on with its `Switch` (#1); the repeat days are
`FilterChip`s (#2); add a new alarm with the `LargeFloatingActionButton` (#3); the **Alarm** destination of
the `NavigationBar` (#4) stays selected while you edit.

```mockitdown source="true"
import Compose
import "android/components"

Scaffold {
  TopAppBar(title: "Alarm", actions: { IconButton("more_vert") })
  LazyColumn {
    VStack(alignment: .stretch, spacing: 12) {
      AlarmCard(time: "6:45", label: "Gym")
      AlarmCard(time: "7:30", label: "Weekdays")
        .callout(1, "Turn on", alignment: .topTrailing, labelSide: .leading)
      AlarmCard(time: "9:00", label: "Weekend hike", active: [true, false, false, false, false, false, true], on: false)
        .callout(2, "Repeat days", alignment: .bottomLeading, labelSide: .trailing)
    }.padding(16)
    HStack {
      Spacer()
      LargeFloatingActionButton("add", inline: true).callout(3, "New alarm", alignment: .leading)
      Spacer()
    }.padding(.top, 8)
  }
  NavigationBar {
    NavigationBarItem("Alarm", icon: "alarm", selected: true)
    NavigationBarItem("Clock", icon: "schedule")
    NavigationBarItem("Timer", icon: "timer")
    NavigationBarItem("Stopwatch", icon: "timer")
  }
  .callout(4, alignment: .topLeading, inset: true)
}
```
