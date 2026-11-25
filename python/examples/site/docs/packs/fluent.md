# Fluent (WinUI 3)

The **fluent** pack imitates Windows 11 desktop apps built with **WinUI 3** (Windows App SDK 1.8) in
the Fluent 2 design language: Mica window backgrounds, content layers with an 8 px corner, 32 px
controls with 4 px corners and the darker "elevation" bottom edge, accent-pill selection indicators,
and the Segoe UI Variable type ramp (Caption 12 · Body 14 · BodyStrong 14 · Subtitle 20 · Title 28 ·
TitleLarge 40 · Display 68).

Select it with `import WinUI` (also `FluentUI`, `Fluent`, `WindowsAppSDK`, `Microsoft.UI.Xaml`) or
`pack="fluent"` on the fence. Elements use the WinUI names: `NavigationView`, `NavigationViewItem`,
`TitleBar`, `CommandBar`, `AppBarButton`, `Button` (`.accent` / `.standard` / `.subtle`),
`ToggleSwitch`, `CheckBox`, `RadioButtons`, `ComboBox`, `TextBox`, `PasswordBox`, `NumberBox`,
`AutoSuggestBox`, `CalendarDatePicker`, `InfoBar`, `InfoBadge`, `TeachingTip`, `ContentDialog`,
`MenuFlyout`, `MenuBar`, `ListView`, `TreeView`, `TabView`, `SelectorBar`, `BreadcrumbBar`,
`Expander`, the Community Toolkit's `SettingsCard`, `SettingsExpander` and `DataGrid`, and more —
`mockitdown elements fluent` lists them all. `TextBlock(style: .subtitleTextBlockStyle)` (or
`.font(.subtitle)`) uses the Fluent type ramp. Icons accept Fluent / Segoe Fluent Icons names such as
`"Home"`, `"Mail"`, `"Settings"` or `"Accept"`.

## Controls

The basic input controls in their rest, checked and focused states.

```mockitdown source="true" device="fit" title="Basic input"
import WinUI

StackPanel(spacing: 20) {
  StackPanel(spacing: 8, orientation: .horizontal) {
    Button("Accent").buttonStyle(.accent)
    Button("Standard")
    Button("Subtle", icon: "Settings").buttonStyle(.subtle)
    HyperlinkButton("Learn more")
    ToggleButton("Bold", selected: true)
    DropDownButton("Sort", icon: "Sort")
    SplitButton("Color")
  }
  StackPanel(spacing: 32, orientation: .horizontal) {
    ToggleSwitch("Wi-Fi", isOn: true)
    ToggleSwitch("Airplane mode")
    StackPanel(spacing: 0) {
      CheckBox("Remember me", checked: true)
      CheckBox("Select all", checked: .indeterminate)
      CheckBox("Unchecked")
    }
    RadioButtons("Theme", items: ["Light", "Dark", "Use system setting"], selection: "Dark")
  }
  StackPanel(spacing: 16, orientation: .horizontal) {
    TextBox("Display name", text: "Ana Diaz").state(.focused).frame(width: 220)
    NumberBox("Copies", text: "2").spinButtonPlacementMode(.inline).frame(width: 140)
    ComboBox("Font size", items: ["12", "14", "16"], selection: "14").frame(width: 140)
    AutoSuggestBox("Search").frame(width: 200)
  }
  StackPanel(spacing: 24, orientation: .horizontal) {
    Slider("Volume", value: 60, in: 0...100).frame(width: 200)
    RatingControl(3.5)
    ProgressBar(value: 0.6).frame(width: 160)
    ProgressRing(value: 0.7)
    ProgressRing()
    InfoBadge(8)
    InfoBadge(3).variant(.critical)
    InfoBadge()
    PipsPager(count: 5, page: 2)
  }
}
.padding(24)
```

## Sign-in dialog

A `ContentDialog` over an app window: the title and content sit on the dialog layer, the buttons on
the darker footer, and the default button uses the accent style.

```mockitdown source="true" width="960" height="600" title="Contoso"
import WinUI

StackPanel(spacing: 12) {
  TextBlock("Welcome to Contoso", style: .titleTextBlockStyle)
  TextBlock("Sign in to sync your projects across devices.").foregroundStyle(.secondary)
  Button("Sign in").buttonStyle(.accent)
}
.padding(40)
.frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)

ContentDialog("Sign in to Contoso", buttons: ["Sign in", "Cancel"], primary: "Sign in") {
  TextBox("Email", text: "ana.diaz@contoso.com")
  PasswordBox("Password", text: "hunter22").state(.focused)
  HStack {
    CheckBox("Keep me signed in", checked: true)
    Spacer()
    HyperlinkButton("Forgot password?")
  }
}
```

## Form with validation

`TextBox`, `NumberBox`, `CalendarDatePicker`, `TimePicker`, `ComboBox`, `RadioButtons` and a
`RichEditBox`, with `InfoBar`s reporting the state of the form.

```mockitdown source="true" width="960" height="840" title="Calendar · New event"
import WinUI

ScrollViewer {
  StackPanel(spacing: 16) {
    TextBlock("New event", style: .titleTextBlockStyle)
    InfoBar("Conflict", message: "You already have “Design review” from 10:00 to 11:00.", severity: .warning)
    TextBox("Title", text: "Quarterly planning").frame(maxWidth: .infinity)
    Grid(columns: 3, spacing: 16) {
      CalendarDatePicker("Date", date: "2026-11-23")
      TimePicker("Start", value: "10:30 AM")
      NumberBox("Duration (min)", text: "90").spinButtonPlacementMode(.compact)
    }
    Grid(columns: 2, spacing: 16) {
      ComboBox("Calendar", items: ["Work", "Personal"], selection: "Work")
      TextBox("Location", placeholder: "Add a room or location", description: "Rooms in Building 25 are listed first.")
    }
    RadioButtons("Show as", items: ["Free", "Tentative", "Busy", "Away"], selection: "Busy", orientation: .horizontal)
    RichEditBox("Notes", text: "Agenda: review OKRs, staffing, budget for next quarter.", rows: 3)
    CheckBox("Request responses", checked: true)
    InfoBar("Invitations sent", message: "Attendees will get an email when you save.", severity: .success, isClosable: false)
    HStack {
      Spacer()
      Button("Cancel")
      Button("Save").buttonStyle(.accent)
    }
  }
  .padding(32)
}
```

## Settings page

The Windows 11 Settings pattern: a custom `TitleBar`, a `NavigationView` whose pane sits on Mica,
and a page on the content layer with a `BreadcrumbBar` title, `SettingsCard`s and an expanded
`SettingsExpander`. The rows are custom components from `mockups/fluent/components.mockitdown`
(`SettingToggle`, `SettingChoice`, `SettingLink`).

```mockitdown source="true" appearance="both" chrome="none" width="1100" height="720" title="Settings"
import WinUI
import "fluent/components"

TitleBar("Settings", logo: "Settings", back: true)

NavigationView {
  HStack(spacing: 12) {
    PersonPicture("Ana Diaz", image: "assets/images/avatar-2.svg", size: .large)
    VStack(alignment: .leading, spacing: 0) {
      TextBlock("Ana Diaz", style: .bodyStrong)
      TextBlock("ana.diaz@contoso.com", style: .caption).foregroundStyle(.secondary)
    }
  }
  .padding(.horizontal, 12)
  .padding(.vertical, 8)
  AutoSuggestBox("Find a setting")
  NavigationViewItem("Home", icon: "Home")
  NavigationViewItem("System", icon: "System").selected()
  NavigationViewItem("Bluetooth & devices", icon: "Devices")
  NavigationViewItem("Network & internet", icon: "Network")
  NavigationViewItem("Personalization", icon: "Personalization")
  NavigationViewItem("Apps", icon: "Apps")
  NavigationViewItem("Accounts", icon: "Accounts")
  NavigationViewItem("Time & language", icon: "TimeLanguage")
  NavigationViewItem("Privacy & security", icon: "Privacy")
  NavigationViewItem("Windows Update", icon: "WindowsUpdate", badge: 1)
} content: {
  ScrollViewer {
    StackPanel(spacing: 4) {
      BreadcrumbBar(["System", "Display"]).variant(.title).padding(.bottom, 20)
      SettingChoice(header: "Scale", description: "Change the size of text, apps and other items",
                    icon: "Zoom", items: ["100%", "125% (Recommended)", "150%"], selection: "125% (Recommended)")
      SettingLink(header: "Display resolution", description: "Adjust the resolution to fit your connected display",
                  icon: "Display", value: "2560 × 1600")
      SettingToggle(header: "Night light", description: "Use warmer colors to help block blue light",
                    icon: "NightLight", isOn: true)
      SettingsExpander("HDR", description: "More about HDR", icon: "Brightness", expanded: true) {
        SettingToggle(header: "Use HDR", isOn: false)
        SettingToggle(header: "Play streaming HDR video", isOn: true)
        SettingsCard("Display capabilities", description: "Supported") {
          HyperlinkButton("Learn more")
        }
      }
      TextBlock("Related settings", style: .bodyStrong).padding(.top, 24).padding(.bottom, 4)
      SettingLink(header: "Advanced display", description: "Display information, refresh rate", icon: "Display")
      SettingLink(header: "Graphics", icon: "Gaming")
    }
    .padding(.horizontal, 40)
    .padding(.vertical, 28)
  }
}
```

## Mail

A compact `NavigationView` (`.paneDisplayMode(.leftCompact)`) with `InfoBadge`s, a `CommandBar`, a
`ListView` of custom `MailItem` rows and a reading pane.

```mockitdown width="1200" height="720" title="Mail"
import WinUI
import "fluent/components"

NavigationView {
  NavigationViewItem("Menu", icon: "GlobalNavigationButton")
  NavigationViewItem("Mail", icon: "Mail", badge: 4).selected()
  NavigationViewItem("Calendar", icon: "Calendar")
  NavigationViewItem("People", icon: "People")
  NavigationViewItem("To Do", icon: "Accept")
  Spacer()
  NavigationViewItem("Settings", icon: "Settings")
} content: {
  HStack(alignment: .top, spacing: 0) {
    VStack(alignment: .leading, spacing: 0) {
      HStack {
        TextBlock("Inbox", style: .subtitle)
        Spacer()
        Button(icon: "Filter").buttonStyle(.subtle)
      }
      .padding(.horizontal, 16)
      .padding(.top, 12)
      SelectorBar(selection: "Focused") {
        SelectorBarItem("Focused")
        SelectorBarItem("Other")
      }
      .padding(.horizontal, 4)
      ListView {
        MailItem(sender: "Kenji Sato", subject: "Q4 roadmap review", preview: "Here are the slides for tomorrow's review…", time: "10:42", unread: true, selected: true)
        MailItem(sender: "Lena Fischer", subject: "Re: Offsite logistics", preview: "The bus leaves at 8:15 from the main entrance.", time: "09:17", unread: true, flagged: true)
        MailItem(sender: "Contoso Travel", subject: "Your trip to Seattle", preview: "Check in now for flight CT 204 on Thursday.", time: "Mon")
        MailItem(sender: "Priya Nair", subject: "Design tokens v3", preview: "I pushed the updated color ramps to the repo.", time: "Mon")
        MailItem(sender: "Marco Rossi", subject: "Lunch?", preview: "New ramen place opened next to building 25.", time: "Sun")
        MailItem(sender: "GitHub", subject: "[contoso/app] PR #482 merged", preview: "Merged #482 into main.", time: "Sat")
      }
    }
    .frame(width: 360, maxHeight: .infinity)
    Divider()
    VStack(alignment: .leading, spacing: 16) {
      CommandBar {
        AppBarButton("Reply", icon: "Reply")
        AppBarButton("Reply all", icon: "ReplyAll")
        AppBarButton("Forward", icon: "Forward")
        AppBarSeparator()
        AppBarButton("Archive", icon: "Archive")
        AppBarButton("Delete", icon: "Delete")
        AppBarToggleButton("Flag", icon: "Flag")
        AppBarButton(icon: "More")
      }
      VStack(alignment: .leading, spacing: 16) {
        TextBlock("Q4 roadmap review", style: .subtitle)
        HStack(spacing: 12) {
          PersonPicture("Kenji Sato", image: "assets/images/avatar-1.svg")
          VStack(alignment: .leading, spacing: 0) {
            TextBlock("Kenji Sato", style: .bodyStrong)
            TextBlock("To: Design team · Today 10:42", style: .caption).foregroundStyle(.secondary)
          }
        }
        TextBlock("Hi all,\n\nHere are the slides for tomorrow's review. Please add your team's top three priorities to slide 6 before 5 pm so we can consolidate them.\n\nThanks,\nKenji")
        HStack {
          Image("assets/images/photo-3.svg").resizable().frame(width: 56, height: 40).cornerRadius(4)
          VStack(alignment: .leading, spacing: 0) {
            TextBlock("Q4-roadmap.pptx", style: .body)
            TextBlock("4.2 MB", style: .caption).foregroundStyle(.secondary)
          }
        }
        .padding(8)
        .border(.separator)
        .cornerRadius(4)
      }
      .padding(.horizontal, 24)
    }
    .frame(maxWidth: .infinity, maxHeight: .infinity)
  }
  .frame(maxHeight: .infinity)
}
.paneDisplayMode(.leftCompact)
```

## File Explorer with an open menu

A `CommandBar` whose **New** button has its `MenuFlyout` open, a `BreadcrumbBar` address bar,
a `TreeView` navigation pane and a `DataGrid` details view — plus a `ToolTip`.

```mockitdown source="true" width="1200" height="700" title="Documents - File Explorer"
import WinUI

VStack(alignment: .leading, spacing: 0) {
  HStack(spacing: 4) {
    Button(icon: "Back").buttonStyle(.subtle)
    Button(icon: "Forward").buttonStyle(.subtle)
    Button(icon: "arrow.up").buttonStyle(.subtle)
    Button(icon: "Refresh").buttonStyle(.subtle)
    HStack {
      FontIcon("Folder")
      BreadcrumbBar(["This PC", "Documents", "Projects"])
      Spacer()
    }
    .padding(.horizontal, 10)
    .frame(height: 32, maxWidth: .infinity)
    .background(.surface)
    .border(.separator)
    .cornerRadius(4)
    Border { AutoSuggestBox("Search Projects") }.frame(width: 260)
  }
  .frame(maxWidth: .infinity)
  .padding(.horizontal, 8)
  .padding(.vertical, 6)
  CommandBar {
    MenuFlyout("New", icon: "Add", open: true) {
      MenuFlyoutItem("Folder", icon: "Folder", shortcut: "Ctrl+Shift+N")
      MenuFlyoutItem("Shortcut", icon: "link")
      MenuFlyoutSeparator()
      MenuFlyoutItem("Text Document", icon: "Document")
      MenuFlyoutItem("Microsoft Excel Worksheet", icon: "chart.bar")
      MenuFlyoutSubItem("More") { MenuFlyoutItem("Bitmap image") }
    }
    .variant(.appBar)
    AppBarSeparator()
    AppBarButton(icon: "Cut")
    AppBarButton(icon: "Copy")
    AppBarButton(icon: "Rename")
    AppBarButton(icon: "Share")
    AppBarButton(icon: "Delete")
    AppBarSeparator()
    ToolTip("Sort items (Ctrl+Shift+S)", placement: .bottom) {
      AppBarButton("Sort", icon: "Sort")
    }
    AppBarButton("View", icon: "View")
    Spacer()
    AppBarButton("Details", icon: "info.circle")
  }
  .padding(.horizontal, 4)
  .frame(maxWidth: .infinity)
  HStack(alignment: .top, spacing: 0) {
    TreeView {
      TreeViewItem("Home", icon: "Home")
      TreeViewItem("Gallery", icon: "Gallery")
      TreeViewItem("OneDrive - Contoso", icon: "OneDrive")
      TreeViewItem("This PC", icon: "ThisPC", expanded: true) {
        TreeViewItem("Desktop", icon: "Desktop")
        TreeViewItem("Documents", icon: "Folder", expanded: true) {
          TreeViewItem("Projects", icon: "Folder").selected()
          TreeViewItem("Receipts", icon: "Folder")
        }
        TreeViewItem("Downloads", icon: "Downloads")
        TreeViewItem("Music", icon: "Music")
        TreeViewItem("Pictures", icon: "Pictures")
      }
      TreeViewItem("Network", icon: "Network")
    }
    .frame(width: 248, maxHeight: .infinity)
    DataGrid(columns: ["Name", "Date modified", "Type", "Size"],
             rows: [["Brand refresh", "11/20/2026 4:12 PM", "File folder", ""],
                    ["Contoso app", "11/18/2026 9:03 AM", "File folder", ""],
                    ["Budget 2027.xlsx", "11/22/2026 6:40 PM", "Microsoft Excel Worksheet", "48 KB"],
                    ["Kickoff notes.docx", "11/21/2026 11:15 AM", "Microsoft Word Document", "22 KB"],
                    ["Roadmap.pptx", "11/23/2026 10:42 AM", "Microsoft PowerPoint Presentation", "4,210 KB"],
                    ["todo.txt", "11/23/2026 8:01 AM", "Text Document", "1 KB"]],
             selectedRows: [4])
      .frame(maxWidth: .infinity)
      .padding(.trailing, 8)
  }
  .frame(maxWidth: .infinity, maxHeight: .infinity)
  HStack {
    TextBlock("6 items   1 item selected  4.11 MB", style: .caption)
    Spacer()
  }
  .padding(.horizontal, 16)
  .padding(.vertical, 4)
}
.frame(maxWidth: .infinity, maxHeight: .infinity)
```

## Document editor

A Notepad-style editor: a `TabView` of documents with close buttons, a `MenuBar` with the **Edit**
menu open (`ToggleMenuFlyoutItem`, sub-items, shortcuts) and a status bar.

```mockitdown width="1100" height="640" title="Notepad"
import WinUI

TabView(selection: "Release notes.md") {
  TabViewItem("todo.txt", icon: "Document") { TextBlock("") }
  TabViewItem("Release notes.md", icon: "Document") {
    VStack(alignment: .leading, spacing: 0) {
      HStack(spacing: 0) {
        MenuBar {
          MenuBarItem("File") { MenuFlyoutItem("New tab") }
          MenuBarItem("Edit", open: true) {
            MenuFlyoutItem("Undo", icon: "Undo", shortcut: "Ctrl+Z")
            MenuFlyoutSeparator()
            MenuFlyoutItem("Cut", icon: "Cut", shortcut: "Ctrl+X")
            MenuFlyoutItem("Copy", icon: "Copy", shortcut: "Ctrl+C")
            MenuFlyoutItem("Paste", icon: "Paste", shortcut: "Ctrl+V")
            MenuFlyoutItem("Delete", icon: "Delete", shortcut: "Del").disabled()
            MenuFlyoutSeparator()
            MenuFlyoutItem("Find", icon: "Find", shortcut: "Ctrl+F")
            MenuFlyoutItem("Replace", shortcut: "Ctrl+H")
            MenuFlyoutSubItem("Font") { MenuFlyoutItem("Consolas") }
            ToggleMenuFlyoutItem("Word wrap", checked: true)
          }
          MenuBarItem("View") { MenuFlyoutItem("Zoom") }
        }
        Spacer()
        Button(icon: "Settings").buttonStyle(.subtle).padding(.trailing, 8)
      }
      Divider()
      VStack(alignment: .leading, spacing: 2) {
        TextBlock("# Contoso 4.2 release notes").monospaced()
        TextBlock("## New").monospaced().padding(.top, 20)
        TextBlock("- Mica backdrop and the new title bar on every window").monospaced()
        TextBlock("- Teaching tips for first-run features").monospaced()
        TextBlock("- Faster sync for large folders (up to 3×)").monospaced()
        TextBlock("## Fixed").monospaced().padding(.top, 20)
        TextBlock("- Dialogs now respect the system accent color").monospaced()
      }
      .padding(.horizontal, 16)
      .padding(.vertical, 16)
      .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
      Divider()
      HStack(spacing: 24) {
        TextBlock("Ln 5, Col 44", style: .caption)
        Spacer()
        TextBlock("100%", style: .caption)
        TextBlock("Windows (CRLF)", style: .caption)
        TextBlock("UTF-8", style: .caption)
      }
      .padding(.horizontal, 16)
      .padding(.vertical, 6)
    }
    .frame(maxWidth: .infinity, maxHeight: .infinity)
  }
  TabViewItem("Untitled", icon: "Document") { TextBlock("") }
}
```

## Dashboard with a teaching tip

`NavigationView` in **Top** mode, `StatCard` components with `ProgressRing`s, a chart card, a
`DataGrid` and a `TeachingTip` pointing at a new feature.

```mockitdown source="true" appearance="both" width="1200" height="760" title="Contoso Analytics"
import WinUI
import "fluent/components"

NavigationView {
  TextBlock("Contoso Analytics", style: .bodyStrong).padding(.horizontal, 12)
  NavigationViewItem("Overview", icon: "Home").selected()
  NavigationViewItem("Reports", icon: "Document")
  NavigationViewItem("Customers", icon: "People")
  NavigationViewItem("Billing", icon: "creditcard")
  Spacer()
  AutoSuggestBox("Search")
  PersonPicture("Ana Diaz", size: .small)
} content: {
  ScrollViewer {
    StackPanel(spacing: 16) {
      HStack {
        TextBlock("Overview", style: .titleTextBlockStyle)
        Spacer()
        SelectorBar(selection: "Month") {
          SelectorBarItem("Day")
          SelectorBarItem("Week")
          SelectorBarItem("Month")
          SelectorBarItem("Year")
        }
        TeachingTip("Export is here", placement: .bottomLeft, subtitle: "Send any view to Excel or Power BI with one click.") {
          DropDownButton("Export", icon: "Share")
        } actions: {
          HStack {
            Button("Try it").buttonStyle(.accent)
            Button("Got it")
          }
        }
      }
      InfoBar("Sync complete", message: "Data refreshed 2 minutes ago.", severity: .success)
      HStack(spacing: 16) {
        StatCard(title: "Revenue", value: "$1.24M", detail: "82% of Q4 goal", progress: 0.82)
        StatCard(title: "Active users", value: "48,210", detail: "+6.4% vs October", progress: 0.64)
        StatCard(title: "Tickets resolved", value: "1,932", detail: "93% within SLA", progress: 0.93)
      }
      HStack(alignment: .top, spacing: 16) {
        Card("Revenue by month", subtitle: "Thousands of USD") {
          Chart(kind: .bar, series: [[120, 135, 128, 160, 172, 190, 205, 198], [100, 110, 115, 130, 150, 160, 170, 180]],
                labels: ["Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov"], height: 150)
        }
        .frame(maxWidth: .infinity)
        Card("Top regions") {
          LabeledContent("North America", value: "$512K")
          ProgressBar(value: 0.8)
          LabeledContent("Europe", value: "$388K")
          ProgressBar(value: 0.6)
          LabeledContent("Asia Pacific", value: "$241K")
          ProgressBar(value: 0.38)
        }
      }
      DataGrid(title: "Recent orders", columns: ["Order", "Customer", "Region", "Status", "Amount"],
               rows: [["#10482", "Fabrikam", "Europe", "Shipped", "$12,400"],
                      ["#10481", "Northwind Traders", "North America", "Processing", "$8,150"],
                      ["#10480", "Tailspin Toys", "Asia Pacific", "Shipped", "$3,920"]])
    }
    .padding(.horizontal, 32)
    .padding(.vertical, 24)
  }
}
.paneDisplayMode(.top)
```
