# GTK 4 · libadwaita

The **gtk** pack imitates GNOME apps built with **GTK 4** and **libadwaita 1.7/1.8** in the default
**Adwaita** stylesheet (GNOME 48/49): neutral grey window, view and sidebar backgrounds, translucent
button and entry fills with no borders, bold button labels, 6 px control corners, 12 px cards and
boxed lists, a 47 px header bar that draws the window's own close button, the accent blue `#3584e4`
for suggested actions and checked controls, and the Adwaita Sans type scale (11 pt body, `title-1`
20 pt heavy, `heading` bold, `caption` 9 pt).

Select it with `import Adwaita` (also `Gtk`, `Libadwaita`, `GNOME`) or `pack="gtk"` on the fence.
Desktop and tablet mockups get the `gnome` window frame — there is no title bar, because a
libadwaita app's `HeaderBar` *is* the title bar — and phones get none (the adaptive mobile layout).

Elements use the widget names without their `Gtk`/`Adw` prefix: `ApplicationWindow`, `ToolbarView`,
`HeaderBar`, `WindowTitle`, `NavigationSplitView`, `NavigationSidebar`, `ViewStack` with
`ViewSwitcher` / `ViewSwitcherBar`, `TabView`, `PreferencesPage`, `PreferencesGroup`, `ActionRow`,
`SwitchRow`, `ComboRow`, `EntryRow`, `SpinRow`, `ExpanderRow`, `ButtonRow`, `BoxedList`, `Button`
(`.suggested`, `.destructive`, `.flat`, `.pill`, `.circular`, `.osd`), `SplitButton`, `MenuButton`,
`ToggleButton`, `Switch`, `CheckButton`, `Entry`, `SearchEntry`, `DropDown`, `Scale`, `ProgressBar`,
`LevelBar`, `Spinner`, `Banner`, `Toast`, `StatusPage`, `AlertDialog`, `AboutDialog`, `PopoverMenu`,
`ToggleGroup`, `Carousel`, `Clamp` and more — `mockitdown elements gtk` lists them all. `Label` is the
GTK label: `Label("Hi", style: .title1)` uses the Adwaita classes `title1`…`title4`, `heading`,
`caption`, `captionHeading` and `largeTitle`, and `.class("dim-label")` (or any Adwaita style class
such as `"numeric"`, `"accent"`, `"error"`, `"card"`, `"boxed-list"`, `"linked"`) works as in GTK.
Icons accept freedesktop symbolic names such as `"open-menu-symbolic"`, `"system-search"` or
`"user-trash"`.

The custom rows used below — `PanelItem`, `NavRow`, `FileItem`, `ResourceRow`, `AlarmRow` and
`UpdateRow` — live in `mockups/gtk/widgets.mockitdown` and are imported with `import "gtk/widgets"`.

## Widgets

The basic controls: button styles, a linked box, toggles, entries, a drop-down, a scale, progress
and level bars, a spinner, avatars and a toggle group.

```mockitdown source="true" device="fit" title="Widgets"
import Adwaita

VStack(alignment: .leading, spacing: 18) {
  HStack(spacing: 12) {
    Button("Regular")
    Button("Suggested").variant(.suggested)
    Button("Destructive").variant(.destructive)
    Button("Flat").variant(.flat)
    Button(icon: "edit-find-symbolic")
    Button(icon: "list-add-symbolic").variant(.circular)
    SplitButton("Open")
  }
  HStack(spacing: 12) {
    Box(orientation: .horizontal) {
      ToggleButton("Day", active: true)
      ToggleButton("Week")
      ToggleButton("Month")
    }
    .variant(.linked)
    ToggleGroup(items: ["Grid", "List"], selection: "Grid")
    Button("Get Started").variant(.pill).class("suggested-action")
  }
  HStack(spacing: 24) {
    Switch(active: true)
    Switch()
    CheckButton("Remember", active: true)
    CheckButton("Notify")
    RadioButton("Light", active: true)
    RadioButton("Dark")
  }
  HStack(spacing: 12) {
    Entry("Name", text: "Ana Lima").frame(width: 150)
    SearchEntry("Search files").frame(width: 170)
    Entry("Port", text: "80800").state(.error).frame(width: 110)
    DropDown(model: ["Automatic", "Wired", "Wi-Fi"], selected: "Automatic").frame(width: 140)
    SpinButton(value: 12)
  }
  HStack(spacing: 24) {
    Scale(value: 60, in: 0...100).frame(width: 160)
    ProgressBar(fraction: 0.45).frame(width: 140)
    LevelBar(value: 0.8).frame(width: 110)
    LevelBar(value: 0.95).color(.warning).frame(width: 110)
    Spinner()
  }
  HStack(spacing: 12) {
    Avatar("Ana Lima")
    Avatar("Ben Okafor")
    Avatar("Chen Wu", size: .large)
    Avatar("Dana Kim", size: .large)
    Label("Caption heading", style: .captionHeading)
    Label("Dimmed caption", style: .caption).class("dim-label")
    ShortcutLabel(["Ctrl", "Q"])
  }
}
.padding(24)
```

## Settings

GNOME Settings: a `NavigationSplitView` whose sidebar holds a `NavigationSidebar` of panels, and a
content page of `PreferencesGroup`s with `ActionRow`, `SwitchRow`, `ComboRow` and `SpinRow` rows.
Both panes carry their own `HeaderBar`; only the content one draws the close button.

```mockitdown source="true" appearance="both" width="1040" height="760" title="Settings"
import Adwaita
import "gtk/widgets"

NavigationSplitView {
  ToolbarView {
    HeaderBar("Settings", showEndTitleButtons: false, start: { Button(icon: "system-search-symbolic") }) {
      MenuButton(icon: "open-menu-symbolic")
    }
    NavigationSidebar {
      PanelItem("Wi-Fi", icon: "network-wireless-symbolic")
      PanelItem("Network", icon: "network-wired-symbolic")
      PanelItem("Bluetooth", icon: "bluetooth-symbolic")
      Separator()
      PanelItem("Displays", icon: "preferences-desktop-display-symbolic")
      PanelItem("Sound", icon: "audio-volume-high-symbolic")
      PanelItem("Power", icon: "power-profile-balanced-symbolic", selected: true)
      PanelItem("Multitasking", icon: "preferences-desktop-multitasking")
      PanelItem("Appearance", icon: "preferences-desktop-appearance-symbolic")
      PanelItem("Apps", icon: "preferences-desktop-apps-symbolic")
      PanelItem("Notifications", icon: "notifications-symbolic")
      PanelItem("Search", icon: "system-search-symbolic")
      PanelItem("Online Accounts", icon: "online-accounts-symbolic")
      PanelItem("Privacy & Security", icon: "preferences-system-privacy-symbolic")
    }
  }
} content: {
  ToolbarView {
    HeaderBar("Power")
    PreferencesPage {
      PreferencesGroup {
        ActionRow("Battery", subtitle: "Charging — 1 hour 12 minutes until full") {
          LevelBar(value: 0.72).frame(width: 140)
          Label("72 %").class("numeric")
        }
      }
      PreferencesGroup("Power Mode", description: "Affects system performance and power usage.") {
        ActionRow("Performance", subtitle: "High performance and power usage.", leading: { RadioButton() })
        ActionRow("Balanced", subtitle: "Standard performance and power usage.", leading: { RadioButton(active: true) })
        ActionRow("Power Saver", subtitle: "Reduced performance and power usage.", leading: { RadioButton() })
      }
      PreferencesGroup("Power Saving") {
        SwitchRow("Dim Screen", subtitle: "Reduces the screen brightness when the computer is inactive", active: true)
        ComboRow("Screen Blank", selected: "5 minutes")
        NavRow(title: "Automatic Suspend", value: "Off")
        SwitchRow("Automatic Power Saver", subtitle: "Turn on power saver mode when battery power is low", active: true)
      }
      PreferencesGroup("General") {
        ComboRow("Power Button Behavior", selected: "Suspend")
        SwitchRow("Show Battery Percentage", active: false)
        SpinRow("Critical Battery Level", value: 5)
      }
    }
  }
}
```

## Files

A Nautilus-style file manager: places in the sidebar, back/forward buttons and a `PathBar` in the
header bar, a view toggle and a `GridView` of `FileItem`s with one item selected.

```mockitdown source="true" width="1060" height="640" title="Files"
import Adwaita
import "gtk/widgets"

NavigationSplitView {
  ToolbarView {
    HeaderBar("Files", showEndTitleButtons: false) {
      MenuButton(icon: "open-menu-symbolic")
    }
    NavigationSidebar {
      SidebarItem("Recent", icon: "document-open-recent-symbolic")
      SidebarItem("Starred", icon: "starred-symbolic")
      SidebarItem("Home", icon: "user-home-symbolic", selected: true)
      SidebarItem("Documents", icon: "folder-documents-symbolic")
      SidebarItem("Downloads", icon: "folder-download-symbolic")
      SidebarItem("Music", icon: "folder-music-symbolic")
      SidebarItem("Pictures", icon: "folder-pictures-symbolic")
      SidebarItem("Videos", icon: "folder-videos-symbolic")
      SidebarItem("Trash", icon: "user-trash-symbolic")
      Separator()
      SidebarItem("Other Locations", icon: "list-add-symbolic")
    }
  }
} content: {
  ToolbarView {
    HeaderBar(start: {
      Button(icon: "go-previous-symbolic")
      Button(icon: "go-next-symbolic").disabled()
    }, titleWidget: {
      PathBar(["Home", "Projects", "mockitdown"])
    }) {
      Button(icon: "system-search-symbolic")
      Box(orientation: .horizontal) {
        ToggleButton(icon: "view-grid-symbolic", active: true)
        ToggleButton(icon: "view-list-symbolic")
      }
      .variant(.linked)
      MenuButton(icon: "view-more-symbolic")
    }
    ScrolledWindow {
      GridView(columns: 6) {
        FileItem(name: "docs")
        FileItem(name: "examples")
        FileItem(name: "src", selected: true)
        FileItem(name: "tests")
        FileItem(name: "tools")
        FileItem(name: "README.md", folder: false)
        FileItem(name: "pyproject.toml", folder: false)
        FileItem(name: "LICENSE", folder: false)
        FileItem(name: "screenshot.png", folder: false, icon: "image-x-generic")
        FileItem(name: "demo.mp4", folder: false, icon: "video")
      }
      .padding(18)
    }
    .class("view")
  }
}
```

## Text Editor

GNOME Text Editor: a `SplitButton` to open files, a `WindowTitle` with the path as subtitle, an
`Adw.TabBar` (`TabView`) of open documents and a `SourceView` with line numbers and a highlighted
current line. The main menu is an open `PopoverMenu`.

```mockitdown source="true" width="960" height="600" title="Text Editor"
import Adwaita

ToolbarView {
  HeaderBar(start: {
    SplitButton("Open")
    Button(icon: "tab-new-symbolic")
  }, titleWidget: {
    WindowTitle("notes.py", "~/Projects/notes")
  }) {
    MenuButton(icon: "open-menu-symbolic", open: true) {
      MenuItem("New Window", shortcut: "Shift+Ctrl+N")
      Divider()
      MenuItem("Save As…", shortcut: "Shift+Ctrl+S")
      MenuItem("Print…", shortcut: "Ctrl+P")
      Divider()
      MenuItem("Show Line Numbers", checked: true)
      MenuItem("Word Wrap", checked: false)
      Divider()
      MenuItem("Preferences", shortcut: "Ctrl+,")
      MenuItem("Keyboard Shortcuts", shortcut: "Ctrl+?")
      MenuItem("About Text Editor")
    }
  }
  TabView(selection: "notes.py") {
    TabPage("notes.py") {
      SourceView("""
import gi
gi.require_version("Adw", "1")
from gi.repository import Adw, Gtk

class NotesWindow(Adw.ApplicationWindow):
    def __init__(self, app):
        super().__init__(application=app, title="Notes")
        self.toast = Adw.ToastOverlay()
        self.set_content(self.toast)

    def on_delete(self, note):
        self.toast.add_toast(Adw.Toast(title="Note deleted"))
""", language: "python", highlight: [11])
    }
    TabPage("README.md")
    TabPage("TODO.txt")
  }
}
```

## Alert dialog and toast

An `AlertDialog` asks before a destructive action — its responses are pill buttons and the
destructive one is red. After deleting, a `Toast` offers to undo.

```mockitdown source="true" appearance="both" width="760" height="460" title="Notes"
import Adwaita

ToolbarView {
  HeaderBar("Notes") {
    Button(icon: "edit-delete-symbolic")
  }
  Clamp {
    BoxedList {
      ActionRow("Shopping list", subtitle: "Milk, bread, coffee beans…", chevron: true)
      ActionRow("Trip to Lisbon", subtitle: "Flights on the 14th, hotel near…", chevron: true)
      ActionRow("Book club", subtitle: "Read chapters 4–7 by Thursday", chevron: true)
    }
  }
  .padding(24)
}

AlertDialog("Delete 3 Notes?", body: "Deleted notes cannot be restored.",
            responses: ["Cancel", "Delete"], defaultResponse: "Delete", destructive: "Delete")
```

```mockitdown appearance="both" width="760" height="360" title="Notes · after deleting"
import Adwaita

ToolbarView {
  HeaderBar("Notes") {
    Button(icon: "edit-delete-symbolic")
  }
  Clamp {
    BoxedList {
      ActionRow("Shopping list", subtitle: "Milk, bread, coffee beans…", chevron: true)
      ActionRow("Book club", subtitle: "Read chapters 4–7 by Thursday", chevron: true)
    }
  }
  .padding(24)
}

Toast("“Trip to Lisbon” deleted", buttonLabel: "Undo")
```

## Empty state

A `StatusPage` fills a page that has nothing to show yet, with a pill-shaped suggested action. A
`SearchBar` is revealed under the header bar.

```mockitdown source="true" appearance="both" width="760" height="520" title="Contacts"
import Adwaita

ToolbarView {
  HeaderBar("Contacts", start: { Button(icon: "list-add-symbolic") }) {
    ToggleButton(icon: "system-search-symbolic", active: true)
    MenuButton(icon: "open-menu-symbolic")
  }
  SearchBar {
    SearchEntry("Search contacts", text: "Zoë")
  }
  StatusPage("No Results Found", icon: "system-search-symbolic",
             description: "Try a different search, or import contacts from an online account.") {
    Button("Add Online Account").variant(.pill).class("suggested-action")
  }
}
```

## Mobile: adaptive layout

On a phone the same app collapses: the `ViewSwitcher` moves from the header bar to a
`ViewSwitcherBar` at the bottom, and content sits in a narrow `Clamp`. Here is GNOME Clocks with its
alarms in a boxed list of `AlarmRow`s.

```mockitdown source="true" device="phone" appearance="both" title="Clocks"
import Adwaita
import "gtk/widgets"

ToolbarView {
  HeaderBar("Alarms", start: { Button(icon: "list-add-symbolic") }) {
    MenuButton(icon: "open-menu-symbolic")
  }
  ViewStack(selection: "Alarms") {
    ViewStackPage("World", icon: "globe")
    ViewStackPage("Alarms", icon: "alarm-symbolic") {
      ScrolledWindow {
        BoxedList {
          AlarmRow(time: "06:30", days: "Weekdays")
          AlarmRow(time: "08:00", days: "Saturday, Sunday", active: false)
          AlarmRow(time: "13:15", days: "Once · Medicine", active: true)
          AlarmRow(time: "22:45", days: "Every day", active: false)
        }
      }
      .padding(12)
    }
  }
  ViewSwitcherBar(selection: "Alarms") {
    ViewSwitcherItem("World", icon: "globe")
    ViewSwitcherItem("Alarms", icon: "alarm-symbolic")
    ViewSwitcherItem("Stopwatch", icon: "stopwatch")
    ViewSwitcherItem("Timer", icon: "timer")
  }
}
```

## System monitor

A Resources-style dashboard: the sidebar lists each resource with a sparkline (`ResourceRow`), the
page shows `Stat` cards, a processor history chart, per-core `LevelBar`s and a `ColumnView` of
processes. A wide `ViewSwitcher` sits in the header bar.

```mockitdown source="true" width="1180" height="760" title="Resources"
import Adwaita
import "gtk/widgets"

NavigationSplitView {
  ToolbarView {
    HeaderBar("Resources", showEndTitleButtons: false) {
      MenuButton(icon: "open-menu-symbolic")
    }
    ListBox {
      ResourceRow(name: "Processor", reading: "38 %", level: 0.38, selected: true)
      ResourceRow(name: "Memory", reading: "9.1 / 16 GB", level: 0.57, color: .purple)
      ResourceRow(name: "Swap", reading: "0.4 / 8 GB", level: 0.05, color: .orange)
      ResourceRow(name: "Wi-Fi", reading: "↓ 2.4 MB/s", level: 0.3, color: .green)
      ResourceRow(name: "Disk", reading: "12 MB/s", level: 0.2, color: .red)
    }
    .variant(.navigationSidebar)
  }
} content: {
  ToolbarView {
    HeaderBar(titleWidget: {
      ViewSwitcher(selection: "Processor") {
        ViewSwitcherItem("Processor", icon: "processor-symbolic")
        ViewSwitcherItem("Apps", icon: "view-app-grid-symbolic")
        ViewSwitcherItem("Processes", icon: "view-list-symbolic")
      }
    })
    ScrolledWindow {
      VStack(alignment: .leading, spacing: 18) {
        HStack(spacing: 12) {
          Stat("Usage", "38 %", change: "+6 %")
          Stat("Frequency", "3.42 GHz", change: "−0.2 GHz", positive: true)
          Stat("Temperature", "61 °C", change: "+4 °C", positive: false)
          Stat("Uptime", "3 d 4 h", change: "since Friday")
        }
        .frame(maxWidth: .infinity)
        HStack(alignment: .top, spacing: 12) {
          VStack(alignment: .leading, spacing: 8) {
            Label("History", style: .heading)
            LineChart(series: [("Total", [22, 30, 28, 35, 41, 38, 33, 45, 52, 38]), ("User", [12, 18, 15, 20, 26, 22, 19, 28, 31, 22])],
                      labels: ["60 s", "", "", "", "", "30 s", "", "", "", "now"], chartWidth: 540, height: 220)
          }
          .padding(14)
          .class("card")
          .frame(maxWidth: .infinity)
          VStack(alignment: .leading, spacing: 10) {
            Label("Cores", style: .heading)
            ForEach([("Core 1", 0.42), ("Core 2", 0.81), ("Core 3", 0.25), ("Core 4", 0.97), ("Core 5", 0.33), ("Core 6", 0.12)]) { name, v in
              HStack(spacing: 10) {
                Label(name, style: .caption).frame(width: 50, alignment: .leading)
                LevelBar(value: v).color(v > 0.9 ? .warning : .accent).frame(maxWidth: .infinity)
              }
              .frame(maxWidth: .infinity)
            }
          }
          .padding(14)
          .class("card")
          .frame(width: 280)
        }
        .frame(maxWidth: .infinity)
        ColumnView(columns: ["Process", "Processor", "Memory", "User"],
                   rows: [["gnome-shell", "12.4 %", "412 MB", "ana"], ["firefox", "9.8 %", "1.9 GB", "ana"],
                          ["tracker-miner-fs-3", "4.1 %", "88 MB", "ana"], ["pipewire", "1.2 %", "24 MB", "ana"]],
                   selectedRows: [1])
          .class("card")
      }
      .padding(18)
    }
  }
}
```

## Walkthrough: installing updates

GNOME Software's Updates page, annotated. A `Banner` (#1) appears under the header bar when a
restart is pending. The updates are listed in a boxed list (#2) with each download size on the
right. **Restart & Update** (#3) is the suggested action, and the main menu (#4) holds the update
preferences.

```mockitdown source="true" width="900" height="600" title="Software"
import Adwaita
import "gtk/widgets"

ToolbarView {
  HeaderBar(start: { Button(icon: "view-refresh-symbolic") }, titleWidget: {
    ViewSwitcher(selection: "Updates") {
      ViewSwitcherItem("Explore", icon: "system-software-install-symbolic")
      ViewSwitcherItem("Installed", icon: "view-list-symbolic")
      ViewSwitcherItem("Updates", icon: "software-update-available-symbolic", badge: 4)
    }
  }) {
    MenuButton(icon: "open-menu-symbolic").callout(4, "Update preferences", alignment: .bottom, labelSide: .leading)
  }
  Banner("Updates are ready to install. A restart is needed.", actions: {
    Button("Restart & Update").variant(.suggested).callout(3, alignment: .topLeading)
  })
  .callout(1, alignment: .topLeading, inset: true)
  Clamp {
    VStack(alignment: .leading, spacing: 12) {
      HStack {
        Label("4 Updates", style: .heading)
        Spacer()
        Label("Last checked: 10 minutes ago", style: .caption).class("dim-label")
      }
      BoxedList {
        UpdateRow(app: "Firefox", version: "132.0.1 → 133.0", size: "86 MB", icon: "globe", tint: .orange)
        UpdateRow(app: "Text Editor", version: "48.1 → 48.2", size: "1.2 MB", icon: "accessories-text-editor-symbolic", tint: .blue)
        UpdateRow(app: "Maps", version: "48.0 → 48.2", size: "3.4 MB", icon: "mark-location-symbolic", tint: .green)
        UpdateRow(app: "GNOME 48 Platform", version: "48.1 → 48.2", size: "212 MB", icon: "package-x-generic-symbolic", tint: .gray)
      }
      .frame(maxWidth: .infinity)
      .callout(2, alignment: .topTrailing, labelSide: .leading)
    }
    .padding(24)
  }
}
```
