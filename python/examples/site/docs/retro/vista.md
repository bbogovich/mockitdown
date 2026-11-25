# Windows Vista / 7 (Aero)

The **vista** pack imitates **Windows Vista** (2007) and **Windows 7** (2009) with the **Aero Glass**
theme: translucent window frames with soft highlights and diagonal light streaks, black caption text
with a white glow, the grouped glossy Minimize/Maximize pill and the red Close button hanging from
the top edge, the black glass taskbar with the round Start orb, Explorer's breadcrumb address bar,
search box, dark blue command bar and Details pane, task dialogs with the big blue main instruction
(`#003399`) and command links, glossy grey buttons that turn light blue on hover, the green
progress bar with its sheen, Sidebar gadgets, and the User Account Control consent dialog. Text is
Segoe UI 9 pt (12 px).

Real glass blurs whatever is behind the window; a static page cannot, so the frames are painted
with layered translucent gradients over a fixed streak pattern instead. Logos are replaced by a
neutral glyph, and every app, file and place name is invented.

Select it with `import WindowsVista` (also `Vista`, `Aero`, `Windows7`) or `pack="vista"`. Desktop
fences get the glass window frame; use `chrome="none"` for full-screen scenes. Main elements:
`Window`, `DialogBody`, `DialogFooter`, `TaskDialog`, `MainInstruction`, `CommandLink`,
`ExpandoButton`, `ConsentBanner`, `Wizard`, `TabControl`, `GroupBox`, `PushButton`,
`DefaultButton`, `CheckBox`, `RadioButtonList`, `TextBox`, `ComboBox`, `DropDownList`, `UpDown`,
`TrackBar`, `ProgressBar`, `NavigationBar`, `BreadcrumbBar`, `SearchBox`, `CommandBar`,
`CommandButton`, `NavigationPane`, `FavoriteLink`, `ListView`, `DetailsPane`, `TreeView`,
`Desktop`, `Taskbar`, `StartOrb`, `StartMenu`, `StartSearch`, `GadgetSidebar`, `ClockGadget`,
`WeatherGadget` and `Balloon` — `mockitdown elements vista` lists them all. The dark appearance
colourises the glass graphite and darkens the content.

## Options dialog with every control

A property sheet in a dialog frame (`DialogBody(variant: "help")` keeps only **?** and **Close**).
**Browse…** is hovered (light blue), **OK** is the default button, **Apply** is disabled.

```mockitdown pack="vista" source="true" appearance="both" width="580" height="520" title="Backup Options"
DialogBody(variant: "help") {
  TabControl(selection: "General") {
    TabPage("General") {
      HStack(alignment: .top, spacing: 12) {
        VStack(alignment: .leading, spacing: 8) {
          GroupBox("Back up to") {
            DropDownList(items: ["Local Disk (D:)", "Removable Disk (E:)"], selection: "Local Disk (D:)")
            TextBox(text: "D:\\Backups\\Weekly").state(.focused)
            HStack { Spacer(); PushButton("Browse...").state(.hover) }
          }
          GroupBox("Schedule") {
            RadioButtonList(items: ["Every day", "Every week", "Only when I ask"], selection: "Every week")
            DateTimePicker("Starting:", selection: "2007-01-30")
            UpDown("Copies to keep:", value: 4)
          }
        }
        .frame(maxWidth: .infinity)
        VStack(alignment: .leading, spacing: 8) {
          GroupBox("Options") {
            CheckBox("Verify data after backup", checked: true)
            CheckBox("Include system files", checked: .mixed)
            CheckBox("Shut down when finished")
            CheckBox("Encrypt backup").disabled()
          }
          GroupBox("Compression") {
            TrackBar(value: 6, in: 0...10, ticks: 10, minLabel: "Fast", maxLabel: "Small")
          }
          GroupBox("Last backup") {
            ProgressBar(value: 0.62)
            ProgressBar(value: 0.4).variant(.paused)
            Text("1,204 of 1,942 files copied")
          }
        }
        .frame(maxWidth: .infinity)
      }
    }
    TabPage("Exclusions") { }
    TabPage("Advanced") { }
  }
  .frame(maxHeight: .infinity)
  HStack(spacing: 8) {
    Spacer()
    DefaultButton("OK")
    PushButton("Cancel")
    PushButton("Apply").disabled()
  }
}
```

## Explorer

The Documents folder in Details view: the glass navigation bar with the round Back/Forward buttons,
breadcrumb and search box, the command bar, the Favorite Links pane, the selected row in Explorer's
light-blue highlight, and the Details pane at the foot. The bars are an `ExplorerBars` component in
`docs/mockups/vista/shell.mockitdown`.

```mockitdown pack="vista" source="true" appearance="both" width="840" height="560" title="Documents"
import "vista/shell"

VStack(spacing: 0) {
  ExplorerBars(path: ["Alex", "Documents", "Projects"]) {
    CommandButton("Organize", dropdown: true)
    CommandButton("Views", systemImage: "views", dropdown: true)
    CommandButton("Share", systemImage: "person.2")
    CommandButton("Burn", systemImage: "circle")
  }
  HStack(spacing: 0) {
    NavigationPane("Favorite Links") {
      FavoriteLink("Documents", systemImage: "folder").selected()
      FavoriteLink("Pictures", systemImage: "photo")
      FavoriteLink("Music", systemImage: "music.note")
      FavoriteLink("Recently Changed", systemImage: "clock")
      FavoriteLink("Searches", systemImage: "search")
      FavoriteLink("Public", systemImage: "person.2")
    } footer: {
      TreeView {
        TreeViewItem("Folders", expanded: true) {
          TreeViewItem("Desktop", systemImage: "folder", hasChildren: true)
          TreeViewItem("Alex", systemImage: "folder", expanded: true) {
            TreeViewItem("Documents", systemImage: "folder", selected: true)
            TreeViewItem("Downloads", systemImage: "folder")
          }
        }
      }
    }
    ListView(columns: ["Name", "Date modified", "Type", "Size"], sortColumn: 0, selectedRows: [2]) {
      TableRow { Label("Field notes", systemImage: "folder"); Text("1/12/2007 9:14 AM"); Text("File Folder"); Text("") }
      TableRow { Label("Harbor survey", systemImage: "folder"); Text("1/28/2007 4:02 PM"); Text("File Folder"); Text("") }
      TableRow { Label("Grant proposal.docx", systemImage: "doc"); Text("1/30/2007 11:47 AM"); Text("Document"); Text("86 KB") }
      TableRow { Label("Tide tables.xlsx", systemImage: "chart.bar"); Text("1/29/2007 8:20 PM"); Text("Spreadsheet"); Text("212 KB") }
      TableRow { Label("Reef photos.zip", systemImage: "archivebox"); Text("1/22/2007 6:31 PM"); Text("Compressed Folder"); Text("18.4 MB") }
      TableRow { Label("Readme.txt", systemImage: "doc"); Text("12/02/2006 10:05 AM"); Text("Text Document"); Text("2 KB") }
    }
    .frame(maxWidth: .infinity, maxHeight: .infinity)
  }
  .frame(maxWidth: .infinity, maxHeight: .infinity)
  DetailsPane("Grant proposal.docx", subtitle: "Document", systemImage: "doc") {
    PropertyRow("Authors:", "Alex Morgan")
    PropertyRow("Date modified:", "1/30/2007 11:47 AM")
    PropertyRow("Tags:", "Add a tag")
    PropertyRow("Size:", "86.0 KB")
    PropertyRow("Title:", "Harbor restoration")
    PropertyRow("Rating:", "★★★★☆")
  }
}
```

## Control Panel

The category view of a settings window: green category titles with blue task links under each, and
the Control Panel Home / Classic View switch on the left.

```mockitdown pack="vista" width="840" height="540" title="Control Panel"
import "vista/shell"

VStack(spacing: 0) {
  ExplorerBars(path: ["Control Panel"], search: "Search") { }
  HStack(alignment: .top, spacing: 0) {
    NavigationPane {
      FavoriteLink("Control Panel Home").selected()
      FavoriteLink("Classic View")
    } footer: {
      SysLink("Recent tasks")
      SysLink("Change the screen saver")
      SysLink("Adjust screen resolution")
    }
    .frame(maxHeight: .infinity)
    Grid(columns: 2, spacing: 22) {
      VStack(alignment: .leading, spacing: 3) {
        CategoryLink("System and Maintenance", systemImage: "gear").state(.hover)
        SysLink("Get started").padding(.leading, 46)
        SysLink("Back up your computer").padding(.leading, 46)
      }
      VStack(alignment: .leading, spacing: 3) {
        CategoryLink("User Accounts", systemImage: "user.accounts")
        SysLink("Add or remove user accounts").padding(.leading, 46)
      }
      VStack(alignment: .leading, spacing: 3) {
        CategoryLink("Security", systemImage: "security")
        SysLink("Check for updates").padding(.leading, 46)
        SysLink("Allow a program through the firewall").padding(.leading, 46)
      }
      VStack(alignment: .leading, spacing: 3) {
        CategoryLink("Appearance and Personalization", systemImage: "photo")
        SysLink("Change desktop background").padding(.leading, 46)
        SysLink("Adjust screen resolution").padding(.leading, 46)
      }
      VStack(alignment: .leading, spacing: 3) {
        CategoryLink("Network and Internet", systemImage: "globe")
        SysLink("View network status and tasks").padding(.leading, 46)
      }
      VStack(alignment: .leading, spacing: 3) {
        CategoryLink("Clock, Language, and Region", systemImage: "clock")
        SysLink("Change display language").padding(.leading, 46)
      }
      VStack(alignment: .leading, spacing: 3) {
        CategoryLink("Hardware and Sound", systemImage: "printer")
        SysLink("Play CDs or other media automatically").padding(.leading, 46)
      }
      VStack(alignment: .leading, spacing: 3) {
        CategoryLink("Ease of Access", systemImage: "person.circle")
        SysLink("Optimize visual display").padding(.leading, 46)
      }
    }
    .padding(24)
    .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
    .background(.surface)
  }
  .frame(maxWidth: .infinity, maxHeight: .infinity)
}
```

## User Account Control

The consent prompt: the coloured banner with the shield (amber for an unidentified program), the
program's name and publisher, **Details**, and the Allow / Cancel command links. Every elevation in
Vista passed through this dialog.

```mockitdown pack="vista" appearance="both" width="480" height="380" title="User Account Control"
DialogBody {
  ConsentBanner("An unidentified program wants access to your computer", severity: .warning, systemImage: "shield")
  Text("Don't run the program unless you know where it's from or you've used it before.")
    .padding(.top, 14)
  HStack(spacing: 10) {
    Image(systemName: "app").font(.system(size: 30)).foregroundStyle(.accent)
    VStack(alignment: .leading, spacing: 1) {
      Text("tidesync-setup.exe")
      Text("Unidentified Publisher").foregroundStyle(.secondary)
    }
  }
  .padding(.leading, 10)
  CommandLink("Cancel", subtitle: "I don't know where this program is from or what it's for.")
  CommandLink("Allow", subtitle: "I trust this program. I know where it's from or I've used it before.").state(.hover)
  Spacer()
  DialogFooter {
    ExpandoButton("Details")
    Spacer()
    PushButton("Cancel")
  }
}
```

## Annotated Aero wizard

An Aero wizard page: the big blue main instruction (#1), the options (#2), the green progress bar
with its sheen (#3), and **Next** (#4) on the grey footer.

```mockitdown pack="vista" width="560" height="440" title="Set Up a Backup"
DialogBody {
  Wizard("Where do you want to save your backup?", subtitle: "Choose a drive with enough free space for the files you back up.") {
    RadioButtonList(items: ["On a hard disk, CD, or DVD:", "On a network:"], selection: "On a hard disk, CD, or DVD:")
      .callout(2, alignment: .trailing)
    DropDownList(items: ["Local Disk (D:)  48.2 GB free"], selection: "Local Disk (D:)  48.2 GB free")
      .padding(.leading, 18)
    ProgressBar("Space used on Local Disk (D:)", value: 0.58)
      .callout(3, alignment: .trailing)
    SysLink("Why don't I see my hard disk?")
  } actions: {
    DefaultButton("Next").callout(4, alignment: .topTrailing)
    PushButton("Cancel")
  }
  .callout(1, alignment: .topLeading, inset: true)
}
.padding(0)
```

## Desktop with the Start menu and gadgets

The full shell: the aurora wallpaper, Sidebar gadgets on the right, an inactive glass `Window`, the
open Start menu with the framed user picture, the white program pane with **Start Search**, the
glass places pane with the power, lock and arrow buttons, the black taskbar with the orb, and an
information `Balloon` from the notification area. The taskbar is the `VistaTaskbar` component.

```mockitdown pack="vista" source="true" appearance="both" chrome="none" width="1024" height="720" title="Desktop"
import "vista/shell"

VStack(spacing: 0) {
  ZStack(alignment: .bottomLeading) {
    Desktop {
      DesktopIcon("Recycle Bin", systemImage: "trash").position(x: 48, y: 50)
      DesktopIcon("Tide Sync", systemImage: "arrow.clockwise").selected().position(x: 48, y: 140)
      Window("Pictures", systemImage: "photo", variant: "inactive") {
        IconView {
          FileIcon("Harbor.jpg", systemImage: "photo")
          FileIcon("Reef.jpg", systemImage: "photo")
          FileIcon("Kayaks", systemImage: "folder")
          FileIcon("Lighthouse.jpg", systemImage: "photo").selected()
          FileIcon("Sunset.jpg", systemImage: "photo")
        }
        .frame(maxHeight: .infinity)
      }
      .frame(width: 430, height: 290)
      .position(x: 560, y: 190)
      GadgetSidebar {
        ClockGadget("Harbor City")
        WeatherGadget("Harbor City", "21°", change: "H 24°  L 15°", systemImage: "sun")
        NotesGadget("Pick up kayak\nat 4 pm")
      }
      .frame(width: 160, height: 692)
      .position(x: 944, y: 346)
    }
    .frame(maxWidth: .infinity, maxHeight: .infinity)
    StartMenu("Alex Morgan", avatar: "Alex Morgan", avatarImage: "assets/images/avatar-1.svg") {
      StartMenuPrograms {
        StartProgram(name: "Internet", detail: "Web browser", icon: "internet")
        StartProgram(name: "E-mail", detail: "Mail client", icon: "email")
        Divider()
        StartProgram(name: "Photo Gallery", icon: "photo")
        StartProgram(name: "Media Center", icon: "media.player")
        StartProgram(name: "Calculator", icon: "calculator")
        StartProgram(name: "Notepad", icon: "notepad")
        Spacer()
        AllProgramsButton()
        StartSearch()
      }
      StartMenuPlaces {
        StartMenuItem("Alex Morgan")
        StartMenuItem("Documents")
        StartMenuItem("Pictures")
        StartMenuItem("Music")
        Divider()
        StartMenuItem("Search")
        StartMenuItem("Recent Items")
        StartMenuItem("Computer")
        StartMenuItem("Network")
        Divider()
        StartMenuItem("Control Panel").selected()
        StartMenuItem("Default Programs")
        StartMenuItem("Help and Support")
        HStack {
          PowerButton()
          LockButton()
          PowerMenuButton()
        }
      }
    }
  }
  .frame(maxWidth: .infinity, maxHeight: .infinity)
  VistaTaskbar(windows: ["Pictures", "Grant proposal.docx"], startOpen: true) {
    TrayIcon("speaker")
    Balloon("Tide Sync is up to date", message: "312 files were synchronized with the harbor office at 10:40 AM.") {
      TrayIcon("arrow.clockwise")
    }
    TrayIcon("wifi")
  }
}
```
