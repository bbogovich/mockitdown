# KDE Plasma (Breeze)

The **kde-plasma** pack imitates **KDE Plasma 6** applications in the default **Breeze** widget style
with the **Breeze Light** colour scheme (and **Breeze Dark** in dark mode): Kirigami apps built on KDE
Frameworks 6 and Qt Widgets apps such as Dolphin, Kate and System Settings. It draws the Breeze window
decoration — app icon on the left, centred title, round minimise / maximise / close glyphs — with the
Plasma 6 header area merged into the toolbar below it. Controls are 30 px tall with 3 px corners and a
subtle frame, focus and hover show the Breeze blue (`#3daee9`), item views and menus select with a
translucent blue fill and outline, and checked boxes, radios and switches fill with blue. Text is
Noto Sans 10 pt (13.3 px), code is Hack; Kirigami headings scale 1.35×, 1.2×, 1.15×, 1.1× and 1×.

Select it with `import Kirigami` (also `KDE`, `Plasma`, `Breeze`, `KF6`) or `pack="kde-plasma"` on the
fence. Elements use the Kirigami, Qt Quick Controls and KDE application names: `ApplicationWindow`,
`GlobalDrawer`, `ContextDrawer`, `PageRow`, `Page`, `ScrollablePage`, `Action`, `ToolBar`,
`ActionToolBar`, `Heading`, `Button` (`highlighted:` / `flat:`), `ToolButton`, `CheckBox`,
`RadioButton`, `Switch`, `ComboBox`, `TextField`, `SearchField`, `PasswordField`, `SpinBox`, `Slider`,
`ProgressBar`, `BusyIndicator`, `TabBar` / `TabButton`, `NavigationTabBar`, `Card`, `CardsLayout`,
`InlineMessage`, `PlaceholderMessage`, `FormLayout` (with `FormRow` and `FormSection`), Kirigami
Addons' `FormCard` delegates, `SwipeListItem`, `ListSectionHeader`, `Avatar`, `Chip`, `Dialog`,
`PromptDialog`, `MessageBox`, `Menu` / `MenuItem`, `MenuBar`, `Notification`, `PlasmaPanel` — and for
the Qt Widgets apps `MainWindow`, `Splitter`, `Breadcrumb` (Dolphin's location bar), `PlacesPanel`,
`IconView`, `DetailsView`, `TreeView`, `TableView`, `DockWidget`, `StatusBar`, and the System Settings
`KCMSidebar`, `KCMCategory` and `KCM` page. `mockitdown elements kde-plasma` lists them all. Icons
accept freedesktop / Breeze icon names such as `"document-open"`, `"list-add"`, `"user-home"`,
`"view-list-icons"` or `"configure"`.

The custom components used below — a Dolphin file item, a Discover app card, the Plasma Mobile status
bar and a System Monitor sensor tile — live in `mockups/kde-plasma/components.mockitdown` and are
brought in with `import "kde-plasma/components"`.

## Breeze controls

The basic widgets in their rest, checked, focused and default states. The highlighted button is the
dialog default (blue frame and tint); `flat:` and tool buttons have no frame until hovered.

```mockitdown source="true" device="fit" title="Breeze controls"
import Kirigami

ColumnLayout(spacing: 14) {
  RowLayout(spacing: 6) {
    Button("Apply", icon: "dialog-ok-apply", highlighted: true)
    Button("Cancel", icon: "dialog-cancel")
    Button("Hovered").state(.hover)
    Button("Disabled").disabled()
    ToolButton("Split", icon: "view-split-left-right")
    ToolButton("Preview", icon: "view-preview", checked: true)
    ToolButton(icon: "application-menu")
  }
  RowLayout(spacing: 24) {
    ColumnLayout(spacing: 6) {
      CheckBox("Show hidden files", checked: true)
      CheckBox("Some items", checked: .indeterminate)
      CheckBox("Remember view properties")
    }
    ColumnLayout(spacing: 6) {
      RadioButton("Single-click to open", checked: true)
      RadioButton("Double-click to open")
      RadioButton("Focused").state(.focused)
    }
    ColumnLayout(spacing: 8) {
      Switch("Night Light", checked: true)
      Switch("Do not disturb")
    }
  }
  RowLayout(spacing: 10) {
    TextField("Search files…", text: "holiday photos").state(.focused).frame(width: 200)
    ComboBox(items: ["Icons", "Compact", "Details"], selection: "Icons").frame(width: 130)
    SpinBox(value: 12, suffix: " px").frame(width: 100)
    PasswordField(text: "hunter22").frame(width: 150)
  }
  RowLayout(spacing: 16) {
    Slider(value: 60, from: 0, to: 100, ticks: 10).frame(width: 180)
    ProgressBar(value: 0.45).frame(width: 150)
    BusyIndicator()
    Chip("Photos", closable: true)
    Chip("Work", checked: true)
    Avatar("Ana Diaz")
    Avatar("Kai Rossi", size: .small)
  }
  TabBar(selection: "General") {
    TabButton("General")
    TabButton("Previews")
    TabButton("Confirmations")
  }
  .frame(width: 420)
  InlineMessage("Folder view settings changed for all folders.", type: .positive, showCloseButton: true).frame(width: 560)
  InlineMessage("The disk “Backup” is almost full.", type: .warning) {} actions: {
    Action("Free Space…", icon: "edit-clear")
  }
  .frame(width: 560)
}
.padding(20)
```

## Dolphin — a guided tour

Dolphin in split-view mode, a Qt Widgets `MainWindow`. The **Places** panel (#1) lists bookmarked
folders, remote locations and devices. Each view has its own **location bar** (#2) in breadcrumb
mode; click a segment to go up, or click the empty end to type a path. The toolbar switches between
the **icons, compact and details** views (#3) and toggles **Split** (#4), here showing the icons view
on the left and the details view on the right. The **status bar** (#5) summarises the selection and
shows the zoom slider and the free space on the current device.

```mockitdown source="true" width="1180" height="660" title="Pictures — Dolphin"
import KDE
import "kde-plasma/components"

MainWindow {
  ToolBar {
    ToolButton(icon: "go-previous")
    ToolButton(icon: "go-next").disabled()
    Separator()
    HStack(spacing: 2) {
      ToolButton(icon: "view-list-icons", checked: true)
      ToolButton(icon: "view-list-compact")
      ToolButton(icon: "view-list-details")
    }
    .callout(3, alignment: .bottom)
    Spacer()
    ToolButton("Split", icon: "view-split-left-right", checked: true).callout(4, alignment: .bottomLeading)
    ToolButton(icon: "edit-find")
    HamburgerMenu()
  }
  HStack(spacing: 0) {
    PlacesPanel {
      Section("Places") {
        PlacesItem("Home", icon: "user-home")
        PlacesItem("Desktop", icon: "user-desktop")
        PlacesItem("Documents", icon: "folder-documents")
        PlacesItem("Downloads", icon: "folder-download")
        PlacesItem("Pictures", icon: "folder-pictures").selected()
        PlacesItem("Music", icon: "folder-music")
        PlacesItem("Trash", icon: "user-trash")
      }
      Section("Remote") {
        PlacesItem("Network", icon: "folder-network")
      }
      Section("Devices") {
        PlacesItem("238.5 GiB Internal Drive", icon: "drive-harddisk")
        PlacesItem("Backup", icon: "drive-removable-media")
      }
    }
    .frame(maxHeight: .infinity)
    .callout(1, alignment: .trailing)
    Splitter {
      VStack(alignment: .stretch, spacing: 0) {
        HStack { Breadcrumb(["Home", "Pictures", "2026"]).frame(maxWidth: .infinity).callout(2, alignment: .trailing) }.padding(6)
        IconView(columns: 4) {
          DolphinFile(name: "Holiday")
          DolphinFile(name: "Family")
          DolphinFile(name: "Screenshots")
          DolphinFile(name: "beach.jpg", icon: "image-x-generic", tint: .orange, selected: true)
          DolphinFile(name: "harbour.jpg", icon: "image-x-generic", tint: .orange, selected: true)
          DolphinFile(name: "lighthouse.png", icon: "image-x-generic", tint: .green)
          DolphinFile(name: "notes.txt", icon: "text-x-generic", tint: .gray)
          DolphinFile(name: "trip.mp4", icon: "video-x-generic", tint: .purple)
        }
        .frame(maxHeight: .infinity)
      }
      .frame(maxHeight: .infinity)
      VStack(alignment: .stretch, spacing: 0) {
        HStack { Breadcrumb(["Home", "Documents"]) }.padding(6)
        DetailsView(columns: ["Name", "Size", "Modified"], rows: [
          [Label("Invoices", systemImage: "folder"), "4 items", "Yesterday"],
          [Label("Taxes 2025", systemImage: "folder"), "12 items", "3 Mar"],
          [Label("lease.pdf", systemImage: "application-pdf"), "1.4 MiB", "Today, 09:12"],
          [Label("budget.ods", systemImage: "text-x-generic"), "38.2 KiB", "Today, 08:40"],
          [Label("cv.odt", systemImage: "text-x-generic"), "51.0 KiB", "12 Feb"]
        ], selection: [2])
        .frame(maxHeight: .infinity)
      }
      .frame(maxHeight: .infinity)
    }
    .frame(maxWidth: .infinity, maxHeight: .infinity)
  }
  StatusBar {
    Text("2 files selected (6.8 MiB)")
    Spacer()
    Slider(value: 40, from: 0, to: 100).frame(width: 110)
    ProgressBar("61.2 GiB free", value: 0.74).callout(5, alignment: .leading)
  }
}
```

## System Settings

System Settings pairs the category sidebar (`KCMSidebar` with a `SearchField` and `KCMCategory` rows;
`chevron: true` marks categories with sub-pages) with the selected module, a `KCM` page. KCMs use
`FormLayout`: labels end in a colon and sit right-aligned in the left column, controls start in the
right column, and `FormSection` adds a titled group. The footer carries Help, Defaults, Reset and the
highlighted Apply button.

```mockitdown source="true" width="1180" height="700" title="General Behavior — System Settings"
import Kirigami

ApplicationWindow {
  KCMSidebar {
    SearchField()
    KCMCategory("Wi-Fi & Internet", icon: "network-wireless", chevron: true)
    KCMCategory("Bluetooth", icon: "preferences-system-bluetooth")
    KCMCategory("Sound", icon: "audio-volume-high")
    KCMCategory("Display & Monitor", icon: "preferences-desktop-display", chevron: true)
    KCMCategory("Input & Output", icon: "preferences-desktop-keyboard", chevron: true)
    KCMCategory("Colors & Themes", icon: "preferences-desktop-theme", chevron: true)
    KCMCategory("Text & Fonts", icon: "preferences-desktop-font", chevron: true)
    KCMCategory("General Behavior", icon: "preferences-system").selected()
    KCMCategory("Notifications", icon: "preferences-desktop-notification")
    KCMCategory("Power Management", icon: "preferences-system-power", chevron: true)
    KCMCategory("Users", icon: "preferences-system-users")
    KCMCategory("Region & Language", icon: "preferences-desktop-locale", chevron: true)
  }
  KCM("General Behavior") {
    FormLayout {
      FormRow("Visual behavior:") {
        CheckBox("Display informational tooltips on mouse hover", checked: true)
        CheckBox("Display visual feedback for status changes", checked: true)
      }
      FormRow("Animation speed:") {
        Slider(value: 55, from: 0, to: 100, ticks: 8, minLabel: "Slow", maxLabel: "Instant").frame(width: 280)
      }
      FormRow("Clicking files or folders:") {
        RadioButton("Selects them", checked: true)
        RadioButton("Opens them")
        Text("Select by clicking on item's selection marker").font(.footnote).foregroundStyle(.secondary)
      }
      FormRow("Clicking in scrollbar track:") {
        RadioButton("Scrolls to the clicked location", checked: true)
        RadioButton("Scrolls one page up or down")
      }
      FormSection("Desktop session") {
        ComboBox("When logging in:", items: ["Start with an empty session", "Restore last session"], selection: "Restore last session")
        SpinBox(label: "Lock screen after:", value: 5, suffix: " minutes")
        TextField(label: "Default browser:", text: "Firefox")
        Switch("Allow apps to inhibit sleep", checked: true)
      }
    }
    .toolbar {
      ToolbarItem(placement: .bottomBar) {
        Button("Help", icon: "help-contents")
        Button("Defaults", icon: "edit-undo")
        Spacer()
        Button("Reset", icon: "edit-undo").disabled()
        Button("Apply", icon: "dialog-ok-apply", highlighted: true)
      }
    }
  }
}
```

## A Kirigami app: Discover

Discover is a Kirigami application: a `GlobalDrawer` holds the app's navigation, the `PageRow` shows
the current page with its title and actions in the header, an `InlineMessage` with an action reports
pending updates, and a `CardsLayout` arranges the application cards — `AppCard`, a custom component.

```mockitdown source="true" width="1100" height="620" appearance="both" title="Discover"
import Kirigami
import "kde-plasma/components"

ApplicationWindow {
  GlobalDrawer {
    SearchField()
    DrawerAction("Home", icon: "go-home").selected()
    DrawerAction("Applications", icon: "applications-system")
    DrawerAction("Plasma Addons", icon: "plasma")
    DrawerAction("Installed", icon: "checkmark")
    DrawerAction("Updates", icon: "system-software-update", badge: 7)
    Spacer()
    DrawerAction("Settings", icon: "configure")
    DrawerAction("About", icon: "help-about")
  }
  PageRow {
    ScrollablePage("Home") {
      VStack(alignment: .stretch, spacing: 12) {
        InlineMessage("7 updates are available, including Plasma 6.2.4.", type: .information) {} actions: {
          Action("Update All", icon: "update-high")
        }
        Heading("Popular apps", level: 2)
        CardsLayout(columns: 2) {
          AppCard(name: "Krita", summary: "Digital painting, creative freedom", icon: "draw-brush", tint: .pink, rating: 4.5, reviews: 2481)
          AppCard(name: "Kdenlive", summary: "Video editor for everyone", icon: "video-x-generic", tint: .indigo, rating: 4.0, reviews: 1912)
          AppCard(name: "Elisa", summary: "Play music and listen to online radio", icon: "applications-multimedia", tint: .teal, rating: 4.5, reviews: 640, installed: true)
          AppCard(name: "KStars", summary: "Desktop planetarium", icon: "star", tint: .orange, rating: 5, reviews: 380)
        }
        Heading("Editor's picks", level: 2)
        Card("Plasma 6.2 is here", subtitle: "Better color management, new Plasma Welcome tour, and much more.", image: "assets/images/banner.png", mediaHeight: 90) {} actions: {
          Action("Read More", icon: "internet-web-browser")
        }
      }
      .padding(16)
      .toolbar {
        Action("Sort", icon: "view-sort")
        Action("Refresh", icon: "view-refresh")
      }
    }
  }
}
```

## Kate

Kate is a Qt Widgets `MainWindow` with a `MenuBar` (the Edit menu is open), a Projects tool view in a
`DockWidget` holding a `TreeView`, the editor (`CodeEditor` with document tabs, the current line
highlighted) and the integrated Konsole as a `Terminal` panel. The `StatusBar` shows the cursor position,
input mode, indentation, encoding and syntax.

```mockitdown source="true" width="1180" height="680" title="main.py — myproject — Kate"
import KDE

MainWindow {
  MenuBar {
    MenuBarItem("File")
    MenuBarItem("Edit", open: true) {
      MenuItem("Undo", icon: "edit-undo", shortcut: "Ctrl+Z")
      MenuItem("Redo", icon: "edit-redo", shortcut: "Ctrl+Shift+Z").disabled()
      MenuSeparator()
      MenuItem("Cut", icon: "edit-cut", shortcut: "Ctrl+X")
      MenuItem("Copy", icon: "edit-copy", shortcut: "Ctrl+C").state(.hover)
      MenuItem("Paste", icon: "edit-paste", shortcut: "Ctrl+V")
      MenuSeparator()
      MenuItem("Find…", icon: "edit-find", shortcut: "Ctrl+F")
      MenuItem("Replace…", icon: "edit-find", shortcut: "Ctrl+R")
      MenuItem("Block Selection Mode", shortcut: "Ctrl+Shift+B", checked: false)
      MenuItem("Overwrite Mode", shortcut: "Ins", checked: false)
    }
    MenuBarItem("Selection")
    MenuBarItem("View")
    MenuBarItem("Go")
    MenuBarItem("Tools")
    MenuBarItem("Sessions")
    MenuBarItem("Settings")
    MenuBarItem("Help")
  }
  ToolBar {
    ToolButton("New", icon: "document-new")
    ToolButton("Open", icon: "document-open")
    ToolButton("Save", icon: "document-save")
    Separator()
    ToolButton(icon: "edit-undo")
    ToolButton(icon: "edit-redo")
    Spacer()
    ToolButton(icon: "edit-find")
  }
  Splitter(columnWidths: [240]) {
    DockWidget("Projects") {
      TreeView {
        TreeViewItem("myproject", folder: true) {
          TreeViewItem("src", folder: true) {
            TreeViewItem("main.py", icon: "text-x-python").selected()
            TreeViewItem("models.py", icon: "text-x-python")
            TreeViewItem("views.py", icon: "text-x-python")
          }
          TreeViewItem("tests", folder: true, hasChildren: true, expanded: false)
          TreeViewItem("README.md", icon: "text-x-generic")
          TreeViewItem("pyproject.toml", icon: "text-x-generic")
        }
      }
    }
    .frame(maxHeight: .infinity)
    VStack(alignment: .stretch, spacing: 0) {
      CodeEditor(language: "python", tabs: ["main.py", "models.py", "README.md"], highlight: [9], code: """
      from pathlib import Path
      from .models import Project

      # Load every project below the given folder.
      def load_projects(root: Path) -> list[Project]:
          projects = []
          for path in sorted(root.glob("*/project.toml")):
              project = Project.from_file(path)
              projects.append(project)
          return projects

      if __name__ == "__main__":
          print(len(load_projects(Path.home())))
      """)
      .frame(maxHeight: .infinity)
      Terminal(title: "Terminal — ~/myproject", code: """
      $ python -m pytest -q
      ........................                                   [100%]
      24 passed in 0.41s
      $ git status --short
       M src/main.py
      """)
      .frame(height: 150)
    }
    .frame(maxHeight: .infinity)
  }
  StatusBar {
    Text("Line 10, Column 24")
    Spacer()
    Text("INSERT")
    Text("Soft Tabs: 4")
    Text("UTF-8")
    Text("Python")
  }
}
```

## Plasma notification

A Plasma desktop with the panel at the bottom (`PlasmaPanel`: application launcher, task manager,
system tray and clock), the application launcher open as a `Plasmoid` popup above its panel button,
and a `Notification` popup in the bottom-right corner with its action buttons.

```mockitdown source="true" width="1100" height="560" chrome="none" title="Plasma desktop"
import Plasma

ZStack(alignment: .bottom) {
  Image("assets/images/photo-3.svg").resizable().scaledToFill().frame(width: 1100, height: 560)
  VStack(alignment: .leading, spacing: 0) {
    Spacer()
    Plasmoid {
      VStack(alignment: .stretch, spacing: 6) {
        HStack(spacing: 10) {
          Avatar("Ana Diaz")
          Text("Ana Diaz").font(.headline)
          Spacer()
          ToolButton(icon: "configure")
          ToolButton(icon: "system-shutdown")
        }
        SearchField().state(.focused)
        ListView {
          ListItem("Dolphin", subtitle: "File Manager", icon: "org.kde.dolphin")
          ListItem("Kate", subtitle: "Advanced Text Editor", icon: "org.kde.kate").state(.hover)
          ListItem("Konsole", subtitle: "Terminal", icon: "org.kde.konsole")
          ListItem("System Settings", subtitle: "Configuration Tools", icon: "systemsettings")
          ListItem("Discover", subtitle: "Software Center", icon: "plasmadiscover")
        }
      }
    }
    .frame(width: 320)
    .padding(.leading, 6)
    .padding(.bottom, 6)
    PlasmaPanel {
      ToolButton(icon: "kde", checked: true)
      Separator()
      ToolButton(icon: "org.kde.dolphin", checked: true)
      ToolButton(icon: "internet-web-browser")
      ToolButton(icon: "org.kde.kate")
      ToolButton(icon: "org.kde.konsole")
      ToolButton(icon: "systemsettings")
      Spacer()
      ToolButton(icon: "update-high")
      ToolButton(icon: "network-wireless")
      ToolButton(icon: "audio-volume-high")
      ToolButton(icon: "battery-full")
      VStack(spacing: 0) {
        Text("10:42")
        Text("24/11/2026").font(.caption)
      }
      .padding(.horizontal, 8)
    }
    .frame(maxWidth: .infinity)
  }
  .frame(width: 1100, height: 560)
}

Notification("Updates available", body: "7 packages can be updated, including Plasma 6.2.4. A restart is required.", icon: "plasmadiscover") {} actions: {
  HStack {
    Button("Later")
    Button("Update", icon: "update-high", highlighted: true)
  }
}
```

## Confirmation dialogs

Two dialog styles: a Kirigami `PromptDialog` over the Accounts page of a Kirigami app, with a
`ContextDrawer` of page actions, and below it the Qt Widgets `MessageBox` (KMessageBox) that Dolphin
shows before deleting files permanently.

```mockitdown source="true" width="1000" height="540" title="Online Accounts"
import Kirigami

ApplicationWindow {
  PageRow {
    ScrollablePage("Online Accounts") {
      ListView {
        ListSectionHeader("Connected") {
          SwipeListItem("ana.diaz@kde.org", subtitle: "Nextcloud · files, calendars, contacts", avatar: "Ana Diaz") {} actions: {
            Action(icon: "configure")
            Action(icon: "edit-delete")
          }
          .selected()
          SwipeListItem("ana@example.com", subtitle: "Google · calendar and contacts", avatar: "Google") {} actions: {
            Action(icon: "configure")
            Action(icon: "edit-delete")
          }
          SwipeListItem("@ana@floss.social", subtitle: "Mastodon", avatar: "Mastodon") {} actions: {
            Action(icon: "configure")
            Action(icon: "edit-delete")
          }
        }
      }
      .toolbar {
        Action("Add Account…", icon: "list-add")
      }
    }
  }
  ContextDrawer("Account") {
    DrawerAction("Sync now", icon: "view-refresh")
    DrawerAction("Rename…", icon: "edit-rename")
    DrawerAction("Remove", icon: "edit-delete")
  }
}

PromptDialog("Remove account?", subtitle: "Removing “ana.diaz@kde.org” also removes its calendars and address books from this computer.", buttons: ["Remove", "Cancel"], primary: "Remove", destructive: "Remove")
```

```mockitdown device="fit" chrome="kde" title="Delete Permanently — Dolphin"
import KDE

MessageBox("Do you really want to delete these 2 items?", message: "This action cannot be undone.", icon: "dialog-warning", color: .warning, buttons: ["Delete", "Cancel"], primary: "Delete", inline: true) {
  CheckBox("Do not ask again")
}
```

## Plasma Mobile

A Kirigami app on Plasma Mobile (phone, no window decoration): the shell's status bar is a custom
`MobileStatusBar` component, the page header holds the title and actions, contacts are grouped with
`ListSectionHeader`, and a `NavigationTabBar` switches between the app's main pages.

```mockitdown source="true" device="phone" appearance="both" title="Contacts"
import Kirigami
import "kde-plasma/components"

VStack(alignment: .stretch, spacing: 0) {
  MobileStatusBar()
  NavigationTabBar(selection: "Contacts") {
    NavigationTabButton("Favorites", icon: "starred")
    NavigationTabButton("Contacts", icon: "im-user") {
      Page("Contacts") {
        VStack(alignment: .stretch, spacing: 0) {
          SearchField().padding(8)
          ListView {
            ListSectionHeader("A") {
              SwipeListItem("Ana Diaz", subtitle: "+49 151 2345 678", avatar: "Ana Diaz") {} actions: { Action(icon: "phone") }
              SwipeListItem("Arjun Mehta", subtitle: "arjun@example.org", avatar: "Arjun Mehta") {} actions: { Action(icon: "phone") }
            }
            ListSectionHeader("B") {
              SwipeListItem("Ben Okafor", subtitle: "+44 7700 900123", avatar: "Ben Okafor").selected()
              SwipeListItem("Bianca Rossi", subtitle: "Work · +39 06 1234", avatar: "Bianca Rossi") {} actions: { Action(icon: "phone") }
            }
            ListSectionHeader("C") {
              SwipeListItem("Chen Wei", subtitle: "+86 10 5555 0101", avatar: "Chen Wei") {} actions: { Action(icon: "phone") }
              SwipeListItem("Clara Jensen", subtitle: "clara@example.dk", avatar: "Clara Jensen") {} actions: { Action(icon: "phone") }
            }
          }
          .frame(maxHeight: .infinity)
        }
        .toolbar {
          Action(icon: "contact-new")
          Action(icon: "overflow-menu")
        }
      }
    }
    NavigationTabButton("Recent", icon: "clock", badge: 2)
    NavigationTabButton("Settings", icon: "configure")
  }
  .frame(maxHeight: .infinity)
}
```

## System Monitor

Plasma System Monitor's Overview page: a page list in a `GlobalDrawer`, sensor tiles (a custom
`SensorTile` built on `SystemMonitorSensor`), CPU and memory history charts, a disk usage donut and the
busiest processes in a `TableView`.

```mockitdown source="true" width="1180" height="720" title="Overview — System Monitor"
import Kirigami
import "kde-plasma/components"

ApplicationWindow {
  GlobalDrawer {
    DrawerAction("Overview", icon: "utilities-system-monitor").selected()
    DrawerAction("Applications", icon: "applications-system")
    DrawerAction("History", icon: "chart.line")
    DrawerAction("Processes", icon: "list.bullet")
    Spacer()
    DrawerAction("Add New Page…", icon: "list-add")
  }
  PageRow {
    ScrollablePage("Overview") {
      VStack(alignment: .stretch, spacing: 12) {
        HStack(spacing: 12) {
          SensorTile(label: "CPU", value: "23 %", change: "−4 %", history: [18, 22, 31, 27, 25, 40, 33, 28, 24, 23])
          SensorTile(label: "Memory", value: "9.4 GiB", change: "+0.3 GiB", history: [8.6, 8.8, 9.0, 9.1, 9.0, 9.2, 9.3, 9.4])
          SensorTile(label: "Network", value: "1.2 MiB/s", change: "+0.8 MiB/s", history: [0.2, 0.3, 0.2, 0.9, 1.4, 1.1, 1.2])
          SensorTile(label: "Temperature", value: "54 °C", change: "+2 °C", history: [49, 50, 52, 51, 53, 54])
        }
        HStack(alignment: .top, spacing: 12) {
          Card("CPU usage", subtitle: "8 cores · 3.8 GHz") {
            AreaChart(series: [("User", [12, 18, 25, 22, 30, 41, 35, 28, 24, 21, 26, 23]), ("System", [4, 5, 6, 5, 7, 9, 8, 6, 5, 5, 6, 5])], labels: ["60s", "", "", "", "", "30s", "", "", "", "", "", "now"], stacked: true, height: 170)
          }
          .frame(maxWidth: .infinity)
          Card("Memory", subtitle: "9.4 of 31.2 GiB used") {
            LineChart(series: [("Used", [8.2, 8.5, 8.9, 9.0, 9.2, 9.1, 9.3, 9.4]), ("Cache", [6.1, 6.0, 6.3, 6.4, 6.6, 6.5, 6.8, 6.9])], labels: ["", "", "", "", "", "", "", "now"], height: 170)
          }
          .frame(maxWidth: .infinity)
          Card("Disk", subtitle: "/ · 512 GB NVMe") {
            DonutChart(values: [238, 274], labels: ["Used", "Free"], unit: "46 %", height: 170)
          }
          .frame(width: 250)
        }
        TableView(columns: ["Name", "CPU", "Memory", "Download", "Upload"], rows: [
          [Label("Firefox", systemImage: "internet-web-browser"), "8.2 %", "2.1 GiB", "940 KiB/s", "12 KiB/s"],
          [Label("Plasma Shell", systemImage: "plasma"), "3.1 %", "612 MiB", "—", "—"],
          [Label("Kate", systemImage: "org.kde.kate"), "1.4 %", "188 MiB", "—", "—"],
          [Label("KWin", systemImage: "app"), "1.2 %", "244 MiB", "—", "—"],
          [Label("Dolphin", systemImage: "org.kde.dolphin"), "0.4 %", "96 MiB", "—", "—"]
        ], selection: [0], sortColumn: 1)
      }
      .padding(16)
      .toolbar {
        Action("Edit Page", icon: "document-edit")
        HamburgerMenu()
      }
    }
  }
}
```
