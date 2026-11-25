# Windows XP (Luna)

The **winxp** pack imitates **Windows XP** (2001) in its default **Luna Blue** visual style: the
saturated blue title bar with rounded top corners and the white Trebuchet MS caption, the glossy blue
Minimize/Maximize and red-orange Close buttons, beige `#ece9d8` dialog surfaces, rounded push buttons
with the orange hover and blue default-button glows, green check marks and green progress blocks,
the orange line on the selected tab, the green **start** button on the blue taskbar, Explorer's blue
task pane, and the Welcome screen. Text is Tahoma 8 pt (11 px). Logos are replaced by a neutral
flag glyph, and every app and file name is invented.

Select it with `import WindowsXP` (also `WinXP`, `Luna`) or `pack="winxp"` on the fence. A desktop
fence gets the Luna window frame automatically; use `chrome="none"` for full-screen scenes. Element
names follow Win32 and the XP shell: `Window`, `DialogBody`, `MessageBox`, `Wizard`, `TabControl`,
`TabPage`, `GroupBox`, `PushButton`, `DefaultButton`, `CheckBox`, `OptionButton`, `RadioButtonList`,
`TextBox`, `ComboBox`, `UpDown`, `TrackBar`, `ProgressBar`, `DateTimePicker`, `MonthCalendar`,
`ListView`, `TreeView`, `StatusBar`, `MenuBar`, `ToolBar`, `AddressBar`, `TaskPane`,
`TaskPaneSection`, `TaskLink`, `Desktop`, `DesktopIcon`, `Taskbar`, `StartButton`, `StartMenu`,
`NotificationArea`, `Balloon`, `WelcomeScreen` and `UserTile` — `mockitdown elements winxp` lists
them all. The dark appearance is a "Luna Noir" variant: black glossy title bars, charcoal surfaces
and orange highlights.

## Welcome screen

The log-on screen: dark blue bands with the light rules, the neutral glyph on the left, user tiles on
the right and **Turn off computer** at the bottom.

```mockitdown pack="winxp" chrome="none" width="800" height="600" title="Welcome"
WelcomeScreen {
  WelcomeBand { Spacer() }
  HStack(spacing: 0) {
    VStack(alignment: .trailing, spacing: 16) {
      BrandGlyph()
      Text("Workstation").font(.largeTitle).bold()
      Text("To begin, click your user name").font(.title3)
    }
    .frame(maxWidth: .infinity, alignment: .trailing)
    .padding(.trailing, 30)
    Divider().frame(height: 320)
    VStack(alignment: .leading, spacing: 12) {
      UserTile("Alex Morgan", image: "assets/images/avatar-1.svg")
      UserTile("Sam Rivera", subtitle: "Type your password", image: "assets/images/avatar-2.svg").selected()
      HStack(spacing: 4) {
        PasswordBox(text: "secret").frame(width: 150)
        GoButton(label: "")
      }
      .padding(.leading, 76)
      UserTile("Guest", image: "assets/images/avatar-5.svg")
    }
    .frame(maxWidth: .infinity, alignment: .leading)
    .padding(.leading, 30)
  }
  .frame(maxHeight: .infinity)
  WelcomeBand {
    TurnOffButton(label: "Turn off computer")
    Spacer()
    Text("After you log on, you can add or change accounts.\nJust go to Control Panel and click User Accounts.")
      .multilineTextAlignment(.trailing)
  }
}
```

## Options dialog with every control

A property sheet: `DialogBody(variant: "help")` turns the frame into a dialog with only **?** and
**Close**. `TabControl` draws the orange line on the selected tab, `GroupBox` the blue caption on the
etched frame. **OK** is the default button (blue glow), **Browse…** is hovered (orange glow) and
**Apply** is disabled.

```mockitdown pack="winxp" source="true" appearance="both" width="560" height="500" title="Backup Options"
DialogBody(variant: "help") {
  TabControl(selection: "General") {
    TabPage("General") {
      HStack(alignment: .top, spacing: 10) {
        VStack(alignment: .leading, spacing: 8) {
          GroupBox("Back up to") {
            ComboBox(items: ["Local Disk (D:)", "Removable Disk (E:)"], selection: "Local Disk (D:)")
            TextBox(text: "D:\\Backups\\Weekly").state(.focused)
            HStack { Spacer(); PushButton("Browse...").state(.hover) }
          }
          GroupBox("Schedule") {
            RadioButtonList(items: ["Every day", "Every week", "Only when I ask"], selection: "Every week")
            DateTimePicker("Starting:", selection: "2002-03-08")
            UpDown("Copies to keep:", value: 4)
          }
        }
        .frame(maxWidth: .infinity)
        VStack(alignment: .leading, spacing: 8) {
          GroupBox("Options") {
            CheckBox("Verify data after backup", checked: true)
            CheckBox("Include system files", checked: .mixed)
            CheckBox("Shut down when finished")
            CheckBox("Encrypt backup (needs NTFS)").disabled()
          }
          GroupBox("Compression") {
            TrackBar(value: 6, in: 0...10, ticks: 10, minLabel: "Fast", maxLabel: "Small")
          }
          GroupBox("Last backup") {
            ProgressBar(value: 0.62)
            Text("1,204 of 1,942 files copied")
          }
        }
        .frame(maxWidth: .infinity)
      }
    }
    TabPage("Exclusions") { }
    TabPage("Advanced") { }
    TabPage("Log") { }
  }
  .frame(maxHeight: .infinity)
  HStack(spacing: 6) {
    Spacer()
    DefaultButton("OK")
    PushButton("Cancel")
    PushButton("Apply").disabled()
  }
}
```

## Explorer

`My Documents` in Details view: the menu bar, the Standard Buttons toolbar with the green Back
arrow, the address bar with **Go**, the blue task pane with its collapsible boxes, and a `ListView`
with the selected row in the Luna highlight. The bars come from a custom `ExplorerBars` component in
`docs/mockups/winxp/shell.mockitdown`.

```mockitdown pack="winxp" source="true" appearance="both" width="820" height="560" title="My Documents"
import "winxp/shell"

VStack(spacing: 0) {
  ExplorerBars(path: "C:\\Documents and Settings\\Alex\\My Documents")
  HStack(spacing: 0) {
    TaskPane {
      TaskPaneSection("File and Folder Tasks") {
        TaskLink("Rename this file", systemImage: "pencil")
        TaskLink("Move this file", systemImage: "folder")
        TaskLink("Copy this file", systemImage: "doc.on.doc")
        TaskLink("E-mail this file", systemImage: "envelope")
        TaskLink("Delete this file", systemImage: "xmark")
      }
      TaskPaneSection("Other Places") {
        TaskLink("Desktop", systemImage: "square.grid.2x2")
        TaskLink("Shared Documents", systemImage: "folder")
        TaskLink("My Computer", systemImage: "computer")
      }
      TaskPaneSection("Details") {
        Text("**Budget 2002.xls**")
        Text("Spreadsheet")
        Text("Date Modified: Friday, March 08, 2002, 4:21 PM")
        Text("Size: 48.5 KB")
      }
    }
    .frame(width: 210)
    .frame(maxHeight: .infinity)
    ListView(columns: ["Name", "Size", "Type", "Date Modified"], sortColumn: 0, selectedRows: [3]) {
      TableRow { Label("My Music", systemImage: "folder"); Text(""); Text("File Folder"); Text("2/14/2002 9:12 AM") }
      TableRow { Label("My Pictures", systemImage: "folder"); Text(""); Text("File Folder"); Text("3/02/2002 6:40 PM") }
      TableRow { Label("Recipes", systemImage: "folder"); Text(""); Text("File Folder"); Text("1/27/2002 8:03 PM") }
      TableRow { Label("Budget 2002.xls", systemImage: "chart.bar"); Text("49 KB"); Text("Spreadsheet"); Text("3/08/2002 4:21 PM") }
      TableRow { Label("Garden plan.doc", systemImage: "doc"); Text("112 KB"); Text("Document"); Text("2/20/2002 7:55 PM") }
      TableRow { Label("Holiday letter.doc", systemImage: "doc"); Text("36 KB"); Text("Document"); Text("12/11/2001 10:31 AM") }
      TableRow { Label("Mixtape.m3u", systemImage: "music.note"); Text("2 KB"); Text("Playlist"); Text("1/03/2002 11:47 PM") }
    }
    .frame(maxWidth: .infinity, maxHeight: .infinity)
  }
  .frame(maxWidth: .infinity, maxHeight: .infinity)
  StatusBar {
    StatusBarPanel("Type: Spreadsheet  Date Modified: 3/08/2002 4:21 PM  Size: 48.5 KB")
    StatusBarPanel("48.5 KB").frame(width: 80)
    StatusBarPanel("My Computer").frame(width: 120)
  }
}
```

## Control Panel with an error

Category view of a settings window, with a modal `MessageBox` reporting a failure: the red error
icon, the message and a centred **OK** default button.

```mockitdown pack="winxp" width="820" height="560" title="Control Panel"
import "winxp/shell"

VStack(spacing: 0) {
  ExplorerBars(path: "Control Panel")
  HStack(spacing: 0) {
    TaskPane {
      TaskPaneSection("Control Panel", systemImage: "control.panel", variant: "special") {
        TaskLink("Switch to Classic View", systemImage: "arrow.right")
      }
      TaskPaneSection("See Also") {
        TaskLink("Software Update", systemImage: "globe")
        TaskLink("Help and Support", systemImage: "questionmark.circle")
        TaskLink("Other Control Panel Options", systemImage: "gear")
      }
    }
    .frame(width: 210)
    .frame(maxHeight: .infinity)
    VStack(alignment: .leading, spacing: 18) {
      Text("Pick a category").font(.title).foregroundStyle(.taskpaneTitle)
      Grid(columns: 2, spacing: 18) {
        CategoryLink("Appearance and Themes", systemImage: "photo")
        CategoryLink("Printers and Other Hardware", systemImage: "printer")
        CategoryLink("Network and Internet Connections", systemImage: "globe")
        CategoryLink("User Accounts", systemImage: "user.accounts")
        CategoryLink("Add or Remove Programs", systemImage: "archivebox").state(.hover)
        CategoryLink("Date, Time, Language, and Regional Options", systemImage: "clock")
        CategoryLink("Sounds, Speech, and Audio Devices", systemImage: "speaker")
        CategoryLink("Accessibility Options", systemImage: "person.circle")
        CategoryLink("Performance and Maintenance", systemImage: "gauge")
        CategoryLink("Security Center", systemImage: "shield")
      }
    }
    .padding(24)
    .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
    .background(.surface)
  }
  .frame(maxWidth: .infinity, maxHeight: .infinity)
}

MessageBox("Add or Remove Programs",
           message: "Contoso Updater could not be removed because the file CUPDATE.DLL is in use.\n\nClose all programs and then try again.",
           systemImage: "xmark", severity: .error, buttons: ["OK"])
```

## Annotated wizard

A wizard page inside a dialog frame: the white header band with title, subtitle and picture, the
body on the beige surface, and the etched line above **< Back**, **Next >** and **Cancel**. Choose
the folders to keep in sync (#1) and how conflicts are resolved (#2); the progress bar (#3) shows the
space the copy needs, and **Next >** (#4) is the default button.

```mockitdown pack="winxp" width="560" height="440" title="Sync Setup Wizard"
DialogBody {
  Wizard("Choose what to synchronize", subtitle: "You can change these settings later in Sync Options.", systemImage: "arrow.clockwise") {
    Text("Which folders do you want to keep in sync with the office server?")
    VStack(alignment: .leading, spacing: 5) {
      CheckBox("My Documents", checked: true)
      CheckBox("Desktop", checked: true)
      CheckBox("Favorites")
    }
    .callout(1, alignment: .trailing)
    RadioButtonList("When a file changed in both places:", items: ["Keep the newer copy", "Ask me every time"], selection: "Ask me every time")
      .callout(2, alignment: .trailing)
    ProgressBar("Space needed on the server: 312 MB of 500 MB", value: 0.62)
      .callout(3, alignment: .trailing)
  } actions: {
    PushButton("< Back")
    DefaultButton("Next >").callout(4, alignment: .topTrailing)
    PushButton("Cancel")
  }
}
.padding(0)
```

## Desktop with the Start menu open

The full shell: wallpaper, desktop icons, an inactive `Window`, the two-column **Start** menu with
the user picture, the blue taskbar with Quick Launch and window buttons, and a warning `Balloon`
rising from the notification area. The taskbar is the `XPTaskbar` component.

```mockitdown pack="winxp" source="true" appearance="both" chrome="none" width="1024" height="720" title="Desktop"
import "winxp/shell"

VStack(spacing: 0) {
  ZStack(alignment: .bottomLeading) {
    Desktop {
      DesktopIcon("My Documents", systemImage: "folder").position(x: 46, y: 44)
      DesktopIcon("My Computer", systemImage: "computer").position(x: 46, y: 124)
      DesktopIcon("My Network Places", systemImage: "globe").position(x: 46, y: 204)
      DesktopIcon("Recycle Bin", systemImage: "trash").selected().position(x: 46, y: 284)
      Window("My Pictures", systemImage: "photo", variant: "inactive") {
        IconView {
          FileIcon("Beach.jpg", systemImage: "photo")
          FileIcon("Birthday.jpg", systemImage: "photo")
          FileIcon("Garden", systemImage: "folder")
          FileIcon("Kites.jpg", systemImage: "photo")
          FileIcon("Snow day.jpg", systemImage: "photo")
        }
        .frame(maxHeight: .infinity)
      }
      .frame(width: 440, height: 300)
      .position(x: 700, y: 210)
    }
    .frame(maxWidth: .infinity, maxHeight: .infinity)
    StartMenu("Alex Morgan", avatar: "Alex Morgan", avatarImage: "assets/images/avatar-1.svg") {
      StartMenuPrograms {
        StartProgram(name: "Internet", detail: "Web Browser", icon: "internet")
        StartProgram(name: "E-mail", detail: "Mail Client", icon: "email")
        Divider()
        StartProgram(name: "Photo Album", icon: "photo")
        StartProgram(name: "Notepad", icon: "notepad")
        StartProgram(name: "Media Player", icon: "media.player")
        StartProgram(name: "Command Prompt", icon: "command.prompt")
        Spacer()
        AllProgramsButton()
      }
      StartMenuPlaces {
        StartMenuItem("My Documents", systemImage: "my.documents")
        StartMenuItem("My Pictures", systemImage: "my.pictures")
        StartMenuItem("My Music", systemImage: "my.music")
        StartMenuItem("My Computer", systemImage: "computer")
        Divider()
        StartMenuItem("Control Panel", systemImage: "control.panel").selected()
        StartMenuItem("Printers and Faxes", systemImage: "printer")
        Divider()
        StartMenuItem("Help and Support", systemImage: "help")
        StartMenuItem("Search", systemImage: "search")
        StartMenuItem("Run...", systemImage: "run")
      }
    } actions: {
      LogOffButton()
      TurnOffButton()
    }
  }
  .frame(maxWidth: .infinity, maxHeight: .infinity)
  XPTaskbar(windows: ["My Pictures", "Budget 2002.xls"], active: "", startOpen: true) {
    TrayIcon("speaker")
    Balloon("Your computer might be at risk", message: "Virus protection might not be turned on. Click this balloon to fix this problem.", severity: .warning) {
      TrayIcon("security")
    }
    TrayIcon("wifi")
  }
}
```
