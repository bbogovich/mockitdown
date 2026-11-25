# Windows 3.1

The **win31** pack imitates **Windows 3.1 and Windows for Workgroups 3.11** (1992–1993), the 16-bit
Windows that put Program Manager, File Manager and the common dialogs on millions of VGA screens. It uses
the *Windows Default* colour scheme: a teal desktop, navy caption bars with the control-menu box and the
minimize/maximize arrows, the thick grey sizing border, white client areas and dialogs, push buttons with
their two-pixel bevel and the heavy outline on the default button, check boxes with an X, round radio
buttons, scroll bars with arrow boxes, and everything set in the bold System font. Select it with
`import Windows31` (also `Win31`, `Win16`) or `pack="win31"` on the fence; the default device is an
800 × 600 SVGA screen, and `chrome="none"` turns the screen into the desktop for composing several windows.

The elements use Win16 vocabulary: `Window`, `ProgramManager`, `ProgramGroup`, `ProgramItem`,
`MenuBar`, `Menu`, `MenuItem`, `Button` (`.variant(.default)` is the DEFPUSHBUTTON), `CheckBox`,
`RadioButton`, `GroupBox`, `Edit`, `MultiLineEdit`, `ListBox`, `ComboBox`, `ScrollBar`, `Static`,
`DialogBox`, `MessageBox`, `FileManager`, `DriveBar`, `DirectoryTree`, `FileList`, `Notepad`,
`Cardfile` with `IndexCard`, `Calculator`, `Clock`, `StatusBar` — and, for the nostalgic, the
resource-script spellings `DEFPUSHBUTTON`, `LTEXT`, `GROUPBOX`, `EDITTEXT`, `LISTBOX`. `appearance: dark`
switches to a *High Contrast Black* scheme, which 3.1 did not ship in quite this form but would have
liked to.

## Program Manager

The shell itself: Program Manager on the desktop, the *Main* group active, *Accessories* behind it,
the other groups minimized along the bottom, and Clock running minimized on the desktop.

```mockitdown pack="win31" chrome="none" title="Program Manager" source="true"
import "win31/apps"

Desktop {
  ProgramManager {
    ProgmanMenuBar()
    MDIClient {
      GroupWindow(title: "Accessories", inactive: true) {
        ProgramItem("Write", icon: "pencil")
        ProgramItem("Paintbrush", icon: "photo").color(.red)
        ProgramItem("Terminal", icon: "phone")
        ProgramItem("Notepad", icon: "doc")
        ProgramItem("Recorder", icon: "video").color(.purple)
        ProgramItem("Cardfile", icon: "square.grid.2x2").color(.brown)
        ProgramItem("Calendar", icon: "calendar").color(.green)
        ProgramItem("Calculator", icon: "number")
        ProgramItem("Clock", icon: "clock").color(.green)
        ProgramItem("Object Packager", icon: "cube").color(.purple)
        ProgramItem("Character Map", icon: "square.grid.3x3")
        ProgramItem("Media Player", icon: "play").color(.red)
      }
      .frame(width: 400, height: 250)
      .offset(x: 250, y: 120)

      GroupWindow(title: "Main") {
        ProgramItem("File Manager", icon: "folder").color(.yellow).selected()
        ProgramItem("Control Panel", icon: "slider.horizontal.3").color(.green)
        ProgramItem("Print Manager", icon: "printer")
        ProgramItem("Clipboard Viewer", icon: "doc.on.doc").color(.purple)
        ProgramItem("MS-DOS Prompt", icon: "app")
        ProgramItem("Windows Setup", icon: "wrench").color(.brown)
        ProgramItem("PIF Editor", icon: "pencil").color(.green)
        ProgramItem("Read Me", icon: "doc").color(.blue)
      }
      .frame(width: 360, height: 200)
      .offset(x: 16, y: 14)

      HStack(spacing: 4) {
        ProgramGroupIcon("Network")
        ProgramGroupIcon("StartUp")
        ProgramGroupIcon("Games")
        ProgramGroupIcon("Applications")
        Spacer()
      }
      .padding(6)
    }
  }
  .frame(width: 700, height: 470)
  .offset(x: 40, y: 24)

  DesktopIcon("Clock", icon: "clock").color(.green).offset(x: 24, y: 512)
  DesktopIcon("Write - LETTER.WRI", icon: "pencil").offset(x: 110, y: 512)
}
```

## Notepad

Notepad with its *File* menu dropped down. Menu titles and items underline their mnemonic letter;
the highlighted item uses the navy selection colour.

```mockitdown pack="win31" width="640" height="420" title="Notepad - README.TXT" appearance="both"
VStack(spacing: 0) {
  MenuBar {
    Menu("File", open: true) {
      MenuItem("New")
      MenuItem("Open...")
      MenuItem("Save").selected()
      MenuItem("Save As...")
      MenuSeparator()
      MenuItem("Print")
      MenuItem("Page Setup...")
      MenuItem("Print Setup...")
      MenuSeparator()
      MenuItem("Exit")
    }
    Menu("Edit")
    Menu("Search")
    Menu("Help")
  }
  HStack(spacing: 0) {
    MultiLineEdit("README.TXT\n==========\n\nWelcome to Microsoft Windows version 3.1.\n\nThis document contains important information that is not included\nin the Microsoft Windows User's Guide or in Help.\n\nIf you are upgrading from Windows 3.0, read the section\n\"Upgrading Your System\" before you run Setup.\n\nTo print this document, choose Print from the File menu.", rows: 20)
      .variant(.client)
      .frame(maxWidth: .infinity, maxHeight: .infinity)
    ScrollBar(value: 0, orientation: .vertical)
  }
  .frame(maxWidth: .infinity, maxHeight: .infinity)
  ScrollBar(value: 0).frame(maxWidth: .infinity)
}
```

## File Manager

File Manager with one directory window open on drive C. The drive bar (#1) lists the floppy, hard and
network drives with the current one outlined; the directory tree (#2) shows the selected directory as
an open folder; the file list (#3) separates programs from documents by their icons; and the status bar
(#4) reports free space and the selection — all in lowercase, as 8.3 file names were meant to be read.

```mockitdown pack="win31" width="760" height="520" title="File Manager"
VStack(spacing: 0) {
  MenuBar {
    Menu("File")
    Menu("Disk")
    Menu("Tree")
    Menu("View")
    Menu("Options")
    Menu("Tools")
    Menu("Window")
    Menu("Help")
  }
  MDIClient {
    DirectoryWindow("C:\\WINDOWS\\*. *") {
      DriveBar {
        Drive("a", kind: .floppy)
        Drive("b", kind: .floppy)
        Drive("c", kind: .hard).selected()
        Drive("d", kind: .cdrom)
        Drive("f", kind: .network)
        Static("C: [MS-DOS_6]")
      }
      .frame(maxWidth: .infinity)
      .callout(1, alignment: .trailing)
      HStack(spacing: 0) {
        DirectoryTree {
          Directory("c:\\") {
            Directory("dos")
            Directory("excel")
            Directory("mouse")
            Directory("temp")
            Directory("windows") {
              Directory("msapps")
              Directory("system")
            }
            .selected()
            Directory("winword")
          }
        }
        .frame(width: 220, maxHeight: .infinity)
        .callout(2, alignment: .bottomTrailing)
        FileList {
          FileItem("msapps", kind: .folder)
          FileItem("system", kind: .folder)
          FileItem("calc.exe", kind: .program, detail: "43,072")
          FileItem("cardfile.exe", kind: .program, detail: "93,184")
          FileItem("clock.exe", kind: .program, detail: "16,416")
          FileItem("control.exe", kind: .program, detail: "13,280").selected()
          FileItem("notepad.exe", kind: .program, detail: "32,736")
          FileItem("progman.exe", kind: .program, detail: "115,312")
          FileItem("winfile.exe", kind: .program, detail: "146,864")
          FileItem("control.ini", kind: .document, detail: "4,215")
          FileItem("progman.ini", kind: .document, detail: "183")
          FileItem("system.ini", kind: .document, detail: "2,281")
          FileItem("win.ini", kind: .document, detail: "6,840")
          FileItem("readme.wri", kind: .document, detail: "46,975")
          FileItem("386spart.par", kind: .file, detail: "8,192,000")
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .callout(3, alignment: .bottom)
      }
      .frame(maxWidth: .infinity, maxHeight: .infinity)
    }
    .frame(width: 680, height: 380)
    .offset(x: 10, y: 10)
  }
  StatusBar {
    StatusBarPane("Selected 1 file(s) (13,280 bytes)")
    StatusBarPane("Total 112 file(s) (5,411,926 bytes)")
  }
  .frame(maxWidth: .infinity)
  .callout(4, alignment: .top)
}
```

## A dialog box with every control

Control Panel's *Desktop* applet, the classic kitchen-sink dialog: group boxes, drop-down combo boxes,
edits, check boxes with an X, round radio buttons, push buttons with the heavy outline on the default
one, the dotted focus rectangle, and a scroll bar used as a slider.

```mockitdown pack="win31" chrome="none" device="fit" title="Desktop" source="true"
import "win31/apps"

DialogBox("Desktop", placement: .trailing) {
  GroupBox("Pattern") {
    HStack(spacing: 8) {
      Static("Name:")
      DropDownList(selection: "(None)").frame(width: 150)
      Button("Edit Pattern...")
    }
  }
  GroupBox("Applications") {
    CheckBox("Fast \"Alt+Tab\" Switching", checked: true).state(.focused)
  }
  GroupBox("Screen Saver") {
    HStack(spacing: 8) {
      Static("Name:")
      DropDownList(selection: "Flying Windows").frame(width: 150)
      Button("Test")
    }
    HStack(spacing: 8) {
      Static("Delay:")
      Edit("2").frame(width: 40)
      Static("Minutes")
      Spacer()
      Button("Setup...")
    }
  }
  HStack(alignment: .top, spacing: 10) {
    GroupBox("Wallpaper") {
      HStack(spacing: 6) {
        Static("File:")
        ComboBox(selection: "leaves.bmp").frame(width: 110)
      }
      HStack(spacing: 16) {
        RadioButton("Center")
        RadioButton("Tile", checked: true)
      }
    }
    GroupBox("Icons") {
      HStack(spacing: 6) {
        Static("Spacing:")
        Edit("75").frame(width: 40)
        Static("Pixels")
      }
      CheckBox("Wrap Title", checked: true)
    }
  }
  HStack(alignment: .top, spacing: 10) {
    GroupBox("Sizing Grid") {
      HStack(spacing: 6) {
        Static("Granularity:")
        Edit("0").frame(width: 40)
      }
      HStack(spacing: 6) {
        Static("Border Width:")
        Edit("3").frame(width: 40)
      }
    }
    GroupBox("Cursor Blink Rate") {
      HStack(spacing: 6) {
        Static("Slow")
        ScrollBar(value: 0.55).frame(width: 86)
        Static("Fast")
      }
    }
  }
} actions: {
  DialogButtons()
}
```

## Message boxes

A `MessageBox` takes the four Win16 icons — `.stop`, `.exclamation`, `.information` and `.question` —
and centres its buttons under the text. Here Excel 4.0 asks the eternal question over a worksheet and an
embedded Microsoft Graph chart in the sixteen-colour palette.

```mockitdown pack="win31" chrome="none" title="Microsoft Excel"
Desktop {
  Window("Microsoft Excel - SALES.XLS") {
    MenuBar {
      Menu("File")
      Menu("Edit")
      Menu("Formula")
      Menu("Format")
      Menu("Data")
      Menu("Options")
      Menu("Macro")
      Menu("Window")
      Menu("Help")
    }
    HStack(alignment: .top, spacing: 8) {
      Worksheet(
        columns: ["Region", "Q1", "Q2", "Q3", "Q4"],
        rows: [["North", 1240, 1310, 1525, 1690],
               ["South", 980, 1045, 1110, 1302],
               ["East", 1420, 1388, 1460, 1611],
               ["West", 760, 912, 1004, 1189],
               ["Total", 4400, 4655, 5099, 5792]],
        selection: "B3:E6", active: "B3", formula: "980", rowCount: 14)
        .frame(width: 400)
      BarChart(title: "Sales by Quarter", series: [[1240, 1310, 1525, 1690], [980, 1045, 1110, 1302], [1420, 1388, 1460, 1611], [760, 912, 1004, 1189]],
               seriesNames: ["North", "South", "East", "West"], labels: ["Q1", "Q2", "Q3", "Q4"])
        .frame(maxWidth: .infinity)
    }
    .padding(6)
    StatusBar {
      StatusBarPane("Ready")
      StatusBarPane("NUM").frame(width: 60)
    }
  }
  .frame(width: 780, height: 440)
  .offset(x: 10, y: 10)

  MessageBox("Microsoft Excel", message: "Save changes in 'SALES.XLS'?", icon: .exclamation,
             buttons: ["Yes", "No", "Cancel"], primary: "Yes")
    .offset(x: 240, y: 200)
  MessageBox("Program Manager", message: "Cannot find file WINFILE.EXE (or one of its components).",
             icon: .stop, buttons: ["OK"])
    .offset(x: 300, y: 470)
}
```

## Control Panel: Color

The *Color* applet with the palette expanded: pick a scheme, preview it in the sample, or change a
single screen element from the 48 basic colours.

```mockitdown pack="win31" chrome="none" device="fit" title="Color"
DialogBox("Color") {
  HStack(alignment: .top, spacing: 14) {
    VStack(alignment: .leading, spacing: 6) {
      Static("Color Schemes")
      DropDownList(selection: "Windows Default").frame(width: 230)
      HStack(spacing: 8) {
        Button("Save Scheme...")
        Button("Remove Scheme")
      }
      ZStack(alignment: .topLeading) {
        Window("Inactive") { Static("") }.state(.inactive).frame(width: 150, height: 60)
        Window("Active") {
          MenuBar {
            Menu("Normal")
            Menu("Disabled").disabled()
            Menu("Highlighted").selected()
          }
          HStack(spacing: 4) {
            Static("Window Text").padding(4)
            Spacer()
            ScrollBar(value: 0, orientation: .vertical).frame(height: 70)
          }
          .frame(maxWidth: .infinity)
        }
        .frame(width: 210, height: 120)
        .offset(x: 14, y: 26)
        Button("OK").offset(x: 70, y: 152)
      }
      .frame(width: 236, height: 186)
      .background("#008080")
      .border(Color.black)
      HStack(spacing: 6) {
        Button("Color Palette >>").disabled()
        Button("OK").variant(.default)
        Button("Cancel")
      }
    }
    Divider()
    VStack(alignment: .leading, spacing: 6) {
      Static("Screen Element:")
      DropDownList(selection: "Active Title Bar").frame(width: 200)
      Static("Basic Colors:")
      ColorPalette(colors: ["#ff8080", "#ffff80", "#80ff80", "#00ff80", "#80ffff", "#0080ff", "#ff80c0", "#ff80ff",
                            "#ff0000", "#ffff00", "#80ff00", "#00ff40", "#00ffff", "#0080c0", "#8080c0", "#ff00ff",
                            "#804040", "#ff8040", "#00ff00", "#008080", "#004080", "#8080ff", "#800040", "#ff0080",
                            "#800000", "#ff8000", "#008000", "#008040", "#0000ff", "#0000a0", "#800080", "#8000ff",
                            "#400000", "#804000", "#004000", "#004040", "#000080", "#000040", "#400040", "#400080",
                            "#000000", "#808000", "#808040", "#808080", "#408080", "#c0c0c0", "#400040", "#ffffff"],
                   selection: "#000080")
      Static("Custom Colors:")
      ColorPalette(colors: ["#ffffff", "#ffffff", "#ffffff", "#ffffff", "#ffffff", "#ffffff", "#ffffff", "#ffffff",
                            "#ffffff", "#ffffff", "#ffffff", "#ffffff", "#ffffff", "#ffffff", "#ffffff", "#ffffff"])
      Button("Define Custom Colors...").frame(width: 200)
    }
  }
}
```

## Cardfile

Cardfile keeps a stack of index cards: only the index lines of the cards behind show, the front card
is open for editing, and the status line counts the cards.

```mockitdown pack="win31" width="640" height="440" title="Cardfile - PHONE.CRD" appearance="both"
VStack(spacing: 0) {
  MenuBar {
    Menu("File")
    Menu("Edit")
    Menu("View")
    Menu("Card")
    Menu("Search")
    Menu("Help")
  }
  ToolBar {
    ToolBarButton("chevron.left")
    ToolBarButton("chevron.right")
    Divider()
    Static("Card View")
    Spacer()
    Static("7 Cards")
  }
  CardStack {
    IndexCard("Wilson, Grace", "").offset(x: 180, y: 0)
    IndexCard("Patel, Dev", "").offset(x: 150, y: 20)
    IndexCard("Okafor, Chidi", "").offset(x: 120, y: 40)
    IndexCard("Lindqvist, Maja", "").offset(x: 90, y: 60)
    IndexCard("Garcia, Luis", "").offset(x: 60, y: 80)
    IndexCard("Chen, Wei", "").offset(x: 30, y: 100)
    IndexCard("Brown, Ana", "Contoso Ltd.\nPhone: (206) 555-0134\nFax: (206) 555-0135\n\nBirthday: April 6\nPrefers e-mail over fax.\nAsk about the WfW 3.11 upgrade.")
      .selected()
      .offset(x: 0, y: 120)
  }
}
```
