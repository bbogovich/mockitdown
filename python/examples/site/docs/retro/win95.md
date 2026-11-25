# Windows 95

The **win95** pack imitates **Windows 95** (1995) in its *Windows Standard* colour scheme: grey
`#c0c0c0` 3D objects with the two-pixel bevel (white and light grey on the lit edges, dark grey and black
on the shadowed ones), raised for buttons and window frames and sunken for edit controls and white
wells; solid navy captions (grey when inactive) with the application icon at the left and the
Minimize, Maximize and Close buttons at the right, a small gap before Close; MS Sans Serif 8 pt;
navy selection with the dotted focus rectangle; progress bars of navy blocks; and the teal desktop
with the taskbar, the **Start** button and the clock. The Start button carries a neutral glyph instead
of the system logo, the Start menu banner reads an invented product name, and every app, file and
company is made up.

Select it with `import Windows95` (also `Win95`, `Win32`) or `pack="win95"` on the fence. A desktop
fence gets the window frame automatically (default size 640 × 480); use `chrome="none"` for the whole
desktop. Element names follow Win32 and the shell: `Window`, `DialogBody`, `PropertySheet`,
`MessageBox`, `Wizard`, `TabControl`, `TabPage`, `GroupBox`, `PushButton`, `DefaultButton`,
`CheckBox`, `OptionButton`, `RadioButtonList`, `TextBox`, `ComboBox`, `UpDown`, `TrackBar`,
`ProgressBar`, `ScrollBar`, `MonthCalendar`, `ListView`, `IconView`, `FileIcon`, `TreeView`,
`PaneHeader`, `StatusBar`, `MenuBar`, `ToolBar`, `Desktop`, `DesktopIcon`, `Taskbar`, `StartButton`,
`StartMenu`, `StartMenuItem`, `CascadeMenu`, `Tray`, `Notepad`, `MSDOSPrompt` and
`ControlPanelItem` — `mockitdown elements win95` lists them all. The dark appearance is the
**High Contrast Black** scheme Windows 95 shipped: black faces, white text and edges, purple
captions and selection, green grey-text.

## Desktop with the Start menu open

The whole shell: the teal desktop with its icons, an inactive MS-DOS Prompt, the Start menu with the
vertical banner and the **Programs** cascade open, and the taskbar with the pressed Start button,
one button per window and the sunken tray. The taskbar is the `Taskbar95` component from
`docs/mockups/win95/shell.mockitdown`.

```mockitdown pack="win95" source="true" appearance="both" chrome="none" width="800" height="600" title="Desktop"
import "win95/shell"

VStack(spacing: 0) {
  ZStack(alignment: .bottomLeading) {
    Desktop {
      DesktopIcon("My Computer", systemImage: "my.computer").position(x: 40, y: 40)
      DesktopIcon("Network Neighborhood", systemImage: "network").position(x: 40, y: 115)
      DesktopIcon("Inbox", systemImage: "inbox").position(x: 40, y: 190)
      DesktopIcon("Recycle Bin", systemImage: "recycle.bin").selected().position(x: 40, y: 265)
      DesktopIcon("Briefcase", systemImage: "briefcase").position(x: 40, y: 340)
      MSDOSPrompt(title: "MS-DOS Prompt", code: "C:\\>cd \\projects\\orchard\nC:\\PROJECTS\\ORCHARD>dir /w\n\n Volume in drive C has no label\n Directory of C:\\PROJECTS\\ORCHARD\n\n[.]        [..]       HARVEST.DAT  TREES.TXT\n        2 file(s)     48,213 bytes\n\nC:\\PROJECTS\\ORCHARD>_")
      .frame(width: 400, height: 190)
      .position(x: 540, y: 150)
    }
    .frame(maxWidth: .infinity, maxHeight: .infinity)
    HStack(alignment: .top, spacing: -3) {
      StartMenu("Workspace", subtitle: "95") {
        StartMenuItem("Programs", systemImage: "programs", submenu: true).selected()
        StartMenuItem("Documents", systemImage: "documents", submenu: true)
        StartMenuItem("Settings", systemImage: "settings", submenu: true)
        StartMenuItem("Find", systemImage: "find", submenu: true)
        StartMenuItem("Help", systemImage: "help")
        StartMenuItem("Run...", systemImage: "run")
        Divider()
        StartMenuItem("Shut Down...", systemImage: "shut.down")
      }
      CascadeMenu {
        MenuItem("Accessories", systemImage: "folder") { MenuItem("Calculator") }
        MenuItem("StartUp", systemImage: "folder") { MenuItem("Clock") }
        MenuItem("Orchard Planner", systemImage: "chart.bar")
        MenuItem("MS-DOS Prompt", systemImage: "msdos")
        MenuItem("Mail Center", systemImage: "mail")
        MenuItem("Windows Explorer", systemImage: "folder")
      }
      .padding(.top, 3)
    }
  }
  .frame(maxWidth: .infinity, maxHeight: .infinity)
  Taskbar95(windows: ["MS-DOS Prompt", "Orchard Planner"], active: "", startOpen: true) {
    TrayIcon("volume")
  }
}
```

## Exploring a drive

Windows Explorer: the menu bar and the toolbar with the folder combo, the raised pane captions over
the folder tree (dotted lines, `+`/`−` boxes, the selected folder in navy with its focus rectangle)
and a `ListView` in Details view with raised column headers, then the status bar with its sunken
panels and size grip. The bars are the `ExplorerBars` component.

```mockitdown pack="win95" source="true" appearance="both" width="800" height="520" title="Exploring - Projects (C:)"
import "win95/shell"

VStack(spacing: 0) {
  ExplorerBars(folder: "Projects")
  HStack(spacing: 2) {
    VStack(spacing: 0) {
      PaneHeader("All Folders")
      TreeView {
        TreeViewItem("Desktop", systemImage: "app", expanded: true) {
          TreeViewItem("My Computer", systemImage: "my.computer", expanded: true) {
            TreeViewItem("3½ Floppy (A:)", systemImage: "floppy")
            TreeViewItem("Hard Disk (C:)", systemImage: "drive", expanded: true) {
              TreeViewItem("Games", systemImage: "folder")
              TreeViewItem("Program Files", systemImage: "folder")
              TreeViewItem("Projects", systemImage: "folder", expanded: true) {
                TreeViewItem("Orchard", systemImage: "folder")
                TreeViewItem("Recipes", systemImage: "folder").selected()
              }
              TreeViewItem("Temp", systemImage: "folder")
              TreeViewItem("Windows", systemImage: "folder")
            }
            TreeViewItem("CD-ROM (D:)", systemImage: "cdrom")
            TreeViewItem("Control Panel", systemImage: "control.panel")
            TreeViewItem("Printers", systemImage: "printers")
          }
          TreeViewItem("Network Neighborhood", systemImage: "network")
          TreeViewItem("Recycle Bin", systemImage: "recycle.bin")
        }
      }
      .frame(maxHeight: .infinity)
    }
    .frame(width: 250)
    .frame(maxHeight: .infinity)
    VStack(spacing: 0) {
      PaneHeader("Contents of 'C:\\Projects\\Recipes'")
      ListView(columns: ["Name", "Size", "Type", "Modified"], selectedRows: [2]) {
        TableRow { Label("Desserts", systemImage: "folder"); Text(""); Text("Folder"); Text("3/14/96 6:40 PM") }
        TableRow { Label("Breads.txt", systemImage: "doc"); Text("4KB"); Text("Text Document"); Text("1/02/96 9:12 AM") }
        TableRow { Label("Soups.wri", systemImage: "doc"); Text("18KB"); Text("Write Document"); Text("2/20/96 7:55 PM") }
        TableRow { Label("Pantry.xls", systemImage: "chart.bar"); Text("9KB"); Text("Worksheet"); Text("3/08/96 4:21 PM") }
        TableRow { Label("Shopping.txt", systemImage: "doc"); Text("1KB"); Text("Text Document"); Text("3/30/96 11:05 AM") }
        TableRow { Label("Index.bmp", systemImage: "photo"); Text("230KB"); Text("Bitmap Image"); Text("12/11/95 10:31 AM") }
      }
      .frame(maxWidth: .infinity, maxHeight: .infinity)
    }
    .frame(maxWidth: .infinity, maxHeight: .infinity)
  }
  .padding(.top, 2)
  .frame(maxWidth: .infinity, maxHeight: .infinity)
  StatusBar {
    StatusBarPanel("1 object(s) selected").frame(width: 250)
    StatusBarPanel("17.6KB")
  }
}
```

## Display Properties

A property sheet (`PropertySheet` at the root gives the caption **?** and **Close** only): the
tabs with the raised, clipped corners and the taller selected tab, the monitor preview (#1), the
wallpaper list box (#2) with its selection and focus rectangle, the **Display** combo (#3) and the
**OK** default button (#4) with its black outline and dotted focus rectangle. **Apply** is greyed
out with the embossed grey text.

```mockitdown pack="win95" width="420" height="440" title="Display Properties"
import "win95/shell"

PropertySheet {
  TabControl(selection: "Background") {
    TabPage("Background") {
      Monitor { Color.teal }
        .callout(1, alignment: .trailing)
      HStack(alignment: .top, spacing: 10) {
        GroupBox("Pattern") {
          ListBox {
            ListItem("(None)").selected()
            ListItem("Bricks")
            ListItem("Buttons")
            ListItem("Cargo Net")
            ListItem("Circuits")
          }
          .frame(height: 76)
          PushButton("Edit Pattern...").disabled()
        }
        .frame(maxWidth: .infinity)
        GroupBox("Wallpaper") {
          ListBox {
            ListItem("(None)")
            ListItem("Clouds").selected()
            ListItem("Pinstripe")
            ListItem("Sandstone")
            ListItem("Weave")
          }
          .frame(height: 76)
          .callout(2, alignment: .trailing)
          HStack(spacing: 6) {
            Text("Display:")
            ComboBox(items: ["Tile", "Center"], selection: "Tile").frame(width: 80)
              .callout(3, alignment: .bottom)
          }
          PushButton("Browse...")
        }
        .frame(maxWidth: .infinity)
      }
    }
    TabPage("Screen Saver") { }
    TabPage("Appearance") { }
    TabPage("Settings") { }
  }
  .frame(maxHeight: .infinity)
  HStack(spacing: 6) {
    Spacer()
    DefaultButton("OK").callout(4, alignment: .leading)
    PushButton("Cancel")
    PushButton("Apply").disabled()
  }
}
```

## Date/Time Properties

Another property sheet with the classic controls: `DropDownList` and `UpDown` for month and year,
the `MonthCalendar`, a sunken time field with spinner, check boxes, option buttons in a group box and
a `TrackBar`.

```mockitdown pack="win95" source="true" width="460" height="350" title="Date/Time Properties"
import "win95/shell"

PropertySheet {
  TabControl(selection: "Date & Time") {
    TabPage("Date & Time") {
      HStack(alignment: .top, spacing: 10) {
        GroupBox("Date") {
          HStack(spacing: 6) {
            DropDownList(items: ["April"], selection: "April").frame(width: 90)
            UpDown(value: 1996)
          }
          MonthCalendar(selection: "1996-04-12")
        }
        GroupBox("Time") {
          TextBox(text: "4:20:15 PM")
          RadioButtonList(items: ["12-hour clock", "24-hour clock"], selection: "12-hour clock")
          CheckBox("Show clock on taskbar", checked: true).state(.focused)
          CheckBox("Chime every hour")
          TrackBar(value: 6, in: 0...10, ticks: 10, minLabel: "Soft", maxLabel: "Loud")
        }
      }
      Text("Current time zone: Mountain Standard Time")
    }
    TabPage("Time Zone") { }
  }
  .frame(maxHeight: .infinity)
  SheetButtons(applyEnabled: true)
}
```

## Add Printer Wizard

The wizard layout: the picture panel at the left, the instructions and choices at the right, and
**< Back**, **Next >** (the default button) and **Cancel** under the etched line.

```mockitdown pack="win95" width="500" height="360" title="Add Printer Wizard"
DialogBody {
  Wizard("How is this printer attached to your computer?", subtitle: "If it is directly attached to your computer, click Local Printer. If it is attached to another computer, click Network Printer.", systemImage: "printer") {
    RadioButtonList(items: ["Local printer", "Network printer"], selection: "Local printer")
    Spacer()
    ProgressBar("Searching for drivers...", value: 0.45)
  } actions: {
    PushButton("< Back").disabled()
    DefaultButton("Next >")
    PushButton("Cancel")
  }
}
.padding(0)
```

## Notepad with a message box

Notepad: the menu bar with **File** open on a drop-down menu, the white edit area in Fixedsys with
both scroll bars and the size box, then the question `MessageBox` that closing an unsaved file
brings up — the speech-balloon icon, **Yes** as the default button.

```mockitdown pack="win95" source="true" width="560" height="380" title="PLANTING.TXT - Notepad"
import "win95/shell"

VStack(alignment: .leading, spacing: 0) {
  MenuBar {
    DropDownMenu("File") {
      MenuItem("New")
      MenuItem("Open...")
      MenuItem("Save")
      MenuItem("Save As...")
      Divider()
      MenuItem("Page Setup...")
      MenuItem("Print").selected()
      Divider()
      MenuItem("Exit")
    }
    MenuBarItem("Edit")
    MenuBarItem("Search")
    MenuBarItem("Help")
  }
  ScrolledEdit(text: "Planting schedule - north field\n\nMarch    prune the old apple rows\nApril    plant 40 pear saplings (row 7)\nMay      graft the plum stock\nJune     net the cherries before the birds do\n\nCall the nursery on Tuesday about the\ndelivery of the stakes and the drip line.", position: 0.1)
}
.frame(maxWidth: .infinity, maxHeight: .infinity)

MessageBox("Notepad", message: "The text in the PLANTING.TXT file has changed.\n\nDo you want to save the changes?", severity: .question, buttons: ["Yes", "No", "Cancel"], primary: "Yes")
```

## Control Panel

The Control Panel folder in Large Icons view: applets as 32-pixel icons in a sunken white well, one
selected, a tooltip, and the status bar counting the objects.

```mockitdown pack="win95" appearance="both" width="560" height="400" title="Control Panel"
import "win95/shell"

VStack(spacing: 0) {
  Menus(titles: ["File", "Edit", "View", "Help"])
  IconView {
    ControlPanelItem("Accessibility Options", systemImage: "accessibility")
    ControlPanelItem("Add New Hardware", systemImage: "add.hardware")
    ControlPanelItem("Add/Remove Programs", systemImage: "add.remove")
    ControlPanelItem("Date/Time", systemImage: "date.time")
    ToolTip("Changes display settings") {
      ControlPanelItem("Display", systemImage: "display").selected()
    }
    ControlPanelItem("Fonts", systemImage: "fonts")
    ControlPanelItem("Keyboard", systemImage: "keyboard")
    ControlPanelItem("Modems", systemImage: "modems")
    ControlPanelItem("Mouse", systemImage: "mouse")
    ControlPanelItem("Multimedia", systemImage: "multimedia")
    ControlPanelItem("Network", systemImage: "network")
    ControlPanelItem("Passwords", systemImage: "passwords")
    ControlPanelItem("Printers", systemImage: "printers")
    ControlPanelItem("Regional Settings", systemImage: "regional")
    ControlPanelItem("Sounds", systemImage: "sounds")
    ControlPanelItem("System", systemImage: "system")
  }
  .frame(maxWidth: .infinity, maxHeight: .infinity)
  StatusBar {
    StatusBarPanel("16 object(s)").frame(width: 200)
    StatusBarPanel("Changes the display settings")
  }
}
```

## Copying files

The file-copy progress dialog: the animation strip with the page flying between two folders, the
current file, source and destination, the progress bar of navy blocks and **Cancel**.

```mockitdown pack="win95" width="380" height="190" title="Copying..."
DialogBody {
  CopyAnimation {
    Icon("folder")
    Icon("doc")
    Icon("folder")
  }
  Text("HARVEST.DAT")
  Text("From 'A:\\' to 'C:\\PROJECTS\\ORCHARD'")
  HStack(alignment: .bottom, spacing: 12) {
    ProgressBar(value: 0.58).frame(maxWidth: .infinity)
    PushButton("Cancel")
  }
}
```
