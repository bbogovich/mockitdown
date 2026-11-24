# Windows 1.0

The **win1** pack imitates **Microsoft Windows 1.0** (1985), the first release of Windows. Its defining
trait is the **tiled** screen: application windows never overlap — they share the screen side by side and
top to bottom, and an application that is not in use shrinks to an icon in the **icon area** along the
bottom of the screen. Only dialog boxes, drop-down menus and a few pop-up windows (the Control Panel,
About boxes) are drawn on top of the tiles.

The captions carry the window title and nothing else: no system-menu box and no minimise/maximise
arrows (those arrived in 2.0 — compare the [Windows 2.x](win2.md) pack). Sizing, zooming and iconising
went through the menus and the mouse. The rest is the familiar vocabulary: a white menu bar with
drop-down menus (no underlined mnemonics yet), inverse-video selection, scroll bars with arrow boxes and
white thumbs on a grey shaft, rounded push buttons, and dialog boxes with a thick double frame and no
caption. Text uses the **fixed-pitch** system font of 1.0 (stack `Fixedsys`, `Terminal`, `"Lucida
Console"`, Monaco, Menlo, monospace — no web fonts).

The light appearance is the **EGA** colour set: blue active caption, white inactive caption, grey
desktop and icon area. The dark appearance is a **CGA**-style monochrome screen: white lines on black,
inverted captions and selections.

Select it with `import Windows1` (also `Win1`, `Windows101`, `MSDOSExecutive1`) or `pack="win1"`.
Besides the dialog-template names (`PushButton`, `DefPushButton`, `CheckBox`, `RadioButton`, `GroupBox`,
`EditText`, `ListBox`, `LText`, `ScrollBar`, `DialogBox`, `MessageBox`) and the menu elements
(`MenuBar`, `MenuBarItem`, `PopupMenu`, `MenuItem`), the pack has the tiling elements `Desktop`,
`TiledArea`, `TileColumn`, `Window`, `PopupWindow`, `IconArea` and `IconicWindow`, the MS-DOS
Executive's `DriveBar`, `DriveIcon`, `PathLine` and `FileName`, and `IndexCard`, `CardStack`,
`AppointmentList`, `MonthView`, `Clock`, `ToolPalette`, `PatternPalette`, `Ruler`, `SizeBox` and
`TerminalScreen` for the desk accessories. The reusable `AppWindow`, `Executive`, `FileColumn`,
`SliderRow` and `EditRow` components live in `mockups/win1/apps.mockitdown`. All application names and
content are invented.

## The tiled screen

Three applications tiled across the screen: the MS-DOS Executive on the left (#1), a clock under it,
and a notepad taking the right half. Captions hold only the title (#2) — the active window's is
blue. Programs that are not on screen wait in the icon area (#3) along the bottom.

```mockitdown source="true" chrome="none" title="Windows 1.0 tiled desktop" appearance="both" height="350"
import Windows1
import "win1/apps"

Desktop {
  TiledArea {
    TileColumn {
      AppWindow(title: "MS-DOS Executive", menus: ["File", "View", "Special"], inactive: true) {
        Executive(path: "C: \\WINDOWS",
                  columns: [["CALC.EXE", "CALENDAR.EXE", "CARDFILE.EXE", "CLOCK.EXE"],
                            ["CONTROL.EXE", "NOTEPAD.EXE", "PAINT.EXE", "WIN.INI"]],
                  selected: "NOTEPAD.EXE")
      }
      .callout(1, alignment: .center)
      Window("Clock") {
        Clock("10:42:17").frame(maxWidth: .infinity, maxHeight: .infinity)
      }
      .variant(.inactive)
    }
    AppWindow(title: "Notepad - TODO.TXT", menus: ["File", "Edit", "Search"]) {
      HStack(alignment: .stretch, spacing: 0) {
        VStack(alignment: .leading, spacing: 0) {
          Text("Monday")
          Text("- call the print shop about the")
          Text("  spring flyers")
          Text("- back up the ledger disks")
          Text("- order ribbons for the FX-80")
          Text("Tuesday")
          Text("- staff meeting at 9:30")
          Spacer()
        }
        .padding(4)
        .frame(maxWidth: .infinity)
        VScrollBar(value: 0)
      }
      .frame(maxHeight: .infinity)
    }
    .callout(2, alignment: .center)
  }
  IconArea {
    IconicWindow("Calc", icon: "number").callout(3, alignment: .topLeading)
    IconicWindow("Calendar", icon: "calendar")
    IconicWindow("Cardfile", icon: "square.stack")
    IconicWindow("Paint", icon: "palette")
    IconicWindow("Spooler", icon: "printer")
    Spacer()
  }
}
```

## MS-DOS Executive

The Windows 1.0 shell: drive icons along the top, the current directory below, and the file names in
columns. Here the **File** menu is pulled down; greyed commands are `.disabled()` menu items.

```mockitdown chrome="window" title="MS-DOS Executive" appearance="both"
import MSDOSExecutive1
import "win1/apps"

VStack(alignment: .stretch, spacing: 0) {
  MenuBar {
    PopupMenu("File", open: true) {
      MenuItem("Run...")
      MenuItem("Load...")
      MenuItem("Copy...")
      MenuItem("Get Info").disabled()
      MenuItem("Delete...")
      MenuItem("Print...").selected()
      MenuItem("Rename...")
    }
    MenuBarItem("View")
    MenuBarItem("Special")
  }
  Executive(path: "C: \\LETTERS",
            columns: [["ANNUAL.DOC", "BUDGET.CAL", "CLIENTS.CRD", "FLYER.MSP"],
                      ["INVITE.DOC", "MEMO.TXT", "MINUTES.TXT", "NOTES.TXT"],
                      ["PRICES.TXT", "REPORT.DOC", "STAFF.CRD"]],
            selected: "MEMO.TXT")
}
```

## Inkwell — a word processor

An invented Write-style editor: menu bar, `Ruler`, the document in a proportional serif face, a
vertical scroll bar, and the page indicator next to the horizontal scroll bar, ending in a `SizeBox`.

```mockitdown source="true" chrome="window" title="Inkwell - FLYER.DOC"
import Windows1

VStack(alignment: .stretch, spacing: 0) {
  MenuBar {
    MenuBarItem("File")
    MenuBarItem("Edit")
    MenuBarItem("Search")
    MenuBarItem("Character").selected()
    MenuBarItem("Paragraph")
    MenuBarItem("Document")
  }
  HStack(alignment: .top, spacing: 0) {
    PageView {
      Ruler()
      Text("Harbour Street Print Shop").font(.title2).frame(maxWidth: .infinity, alignment: .center)
      Text("Spring Open House").font(.title3).frame(maxWidth: .infinity, alignment: .center)
      Text("Come and see the new offset press in action on Saturday the 12th. Bring a design on a floppy disk and we will print a proof while you wait.")
      Text("Coffee and pastries from ten o'clock. Free parking behind the bakery.")
      Spacer()
    }
    .padding(.horizontal, 12)
    .padding(.top, 4)
    .frame(maxWidth: .infinity, maxHeight: .infinity)
    VScrollBar(value: 0)
  }
  .frame(maxHeight: .infinity)
  HStack(spacing: 0) {
    Text("Page 1").padding(.horizontal, 6).frame(width: 72)
    ScrollBar(value: 0.05).frame(maxWidth: .infinity)
    SizeBox()
  }
  .border(.black)
}
```

## Doodle — a paint program

An invented Paint-style program: the `ToolPalette` on the left, the drawing on a `Canvas`, and the
`PatternPalette` of fill patterns along the bottom.

```mockitdown chrome="window" title="Doodle - FLYER.MSP"
import Windows1

VStack(alignment: .stretch, spacing: 0) {
  MenuBar {
    MenuBarItem("File")
    MenuBarItem("Edit")
    MenuBarItem("Font")
    MenuBarItem("Style")
    MenuBarItem("Size")
    MenuBarItem("Palette")
  }
  HStack(alignment: .top, spacing: 6) {
    ToolPalette {
      PaletteTool(icon: "square.dashed")
      PaletteTool(icon: "search")
      PaletteTool(icon: "pencil").selected()
      PaletteTool(icon: "palette")
      PaletteTool("A")
      PaletteTool(icon: "trash")
      PaletteTool(icon: "minus")
      PaletteTool(icon: "square")
      PaletteTool(icon: "circle")
      PaletteTool(icon: "circle.fill")
    }
    .padding(6)
    Canvas {
      Rectangle().fill(.blue).frame(width: 150, height: 70).position(x: 140, y: 80)
      Circle().fill(.red).frame(width: 70, height: 70).position(x: 300, y: 130)
      Text("OPEN HOUSE").font(.title).position(x: 200, y: 200)
    }
    .frame(maxWidth: .infinity, maxHeight: .infinity)
    .padding(.vertical, 6)
    .padding(.trailing, 6)
  }
  .frame(maxHeight: .infinity)
  HStack(spacing: 8) {
    PatternPalette(colors: ["#000000", "#ffffff", "#aaaaaa", "#555555", "#0000aa", "#aa0000", "#00aa00", "#aa00aa", "#00aaaa", "#aa5500", "#ffff55", "#55ffff"], selection: 4)
    Spacer()
  }
  .padding(6)
  .border(.black)
}
```

## Control Panel

The Control Panel was one of the few **pop-up** windows of Windows 1.0: it floats over the tiles with a
double frame. Its settings are scroll bars used as sliders, plus the date and time fields; `SliderRow`
is a custom component.

```mockitdown source="true" chrome="none" title="Control Panel" height="350"
import Windows1
import "win1/apps"

Desktop {
  TiledArea {
    AppWindow(title: "MS-DOS Executive", menus: ["File", "View", "Special"], inactive: true) {
      Executive(columns: [["AUTOEXEC.BAT", "COMMAND.COM", "CONFIG.SYS"], ["DOS", "LETTERS", "WINDOWS"]])
    }
  }
  IconArea {
    IconicWindow("Clock", icon: "clock")
    IconicWindow("Notepad", icon: "doc")
    Spacer()
  }
}

PopupWindow("Control Panel") {
  MenuBar {
    MenuBarItem("Installation")
    MenuBarItem("Setup")
    MenuBarItem("Preferences")
  }
  VStack(alignment: .stretch, spacing: 10) {
    HStack(spacing: 10) {
      LText("Date").frame(width: 50)
      EditText("4/11/86").frame(width: 100)
      LText("Time").frame(width: 50)
      EditText("10:42 AM").state(.focused).frame(width: 100)
    }
    SliderRow(label: "Cursor Blink", value: 0.6)
    SliderRow(label: "Double Click", value: 0.35)
    HStack(spacing: 10) {
      Spacer()
      PushButton("TEST")
    }
  }
  .padding(12)
}
.frame(width: 400)
.position(x: 320, y: 140)
```

## Dialog boxes

Two dialogs over a notepad window. A `DialogBox` has no caption — only the heavy double frame — and
holds the dialog-template controls: `LText`, `EditText`, `GroupBox`es of `RadioButton`s and
`CheckBox`es, a `ListBox`, and `PushButton`s next to the heavier `DefPushButton`.

```mockitdown source="true" chrome="window" title="Notepad - MINUTES.TXT" appearance="both"
import Windows1
import "win1/apps"

VStack(alignment: .stretch, spacing: 0) {
  MenuBar {
    MenuBarItem("File").selected()
    MenuBarItem("Edit")
    MenuBarItem("Search")
  }
  Text("Minutes of the March meeting").padding(4)
  Spacer()
}

DialogBox {
  HStack(alignment: .top, spacing: 16) {
    VStack(alignment: .stretch, spacing: 6) {
      LText("Print MINUTES.TXT")
      EditRow(label: "Copies:", text: "2", focused: true)
      GroupBox("Quality") {
        RadioButton("High", checked: true)
        RadioButton("Draft")
      }
      GroupBox("Options") {
        CheckBox("Page numbers", checked: true)
        CheckBox("Header")
        CheckBox("Wait for each page").disabled()
      }
    }
    .frame(width: 230)
    VStack(alignment: .stretch, spacing: 6) {
      LText("Printer:")
      ListBox {
        ListBoxItem("Epson FX-80 LPT1:")
        ListBoxItem("Okidata 92 LPT2:").selected()
        ListBoxItem("Plotter COM1:")
      }
      .frame(height: 60)
      Spacer()
      HStack(spacing: 10) {
        Spacer()
        DefPushButton("Ok")
        PushButton("Cancel")
      }
    }
    .frame(maxWidth: .infinity)
  }
}
.frame(width: 470)
```

A `MessageBox` with the exclamation icon:

```mockitdown chrome="window" title="Notepad - MINUTES.TXT"
import Windows1

VStack(alignment: .stretch, spacing: 0) {
  MenuBar {
    MenuBarItem("File")
    MenuBarItem("Edit")
    MenuBarItem("Search")
  }
  Text("Minutes of the March meeting").padding(4)
  Spacer()
}

MessageBox("Notepad", message: "MINUTES.TXT has changed. Save current changes?", icon: "exclamation",
           buttons: ["Yes", "No", "Cancel"], primary: "Yes")
```

## Calendar and Cardfile

Two desk accessories tiled next to each other: a calendar with the month view above the day's
appointments, and a card file of `IndexCard`s in a `CardStack`. Card names and appointments are
invented.

```mockitdown source="true" chrome="none" title="Calendar and Cardfile" height="350"
import Windows1
import "win1/apps"

Desktop {
  TiledArea {
    AppWindow(title: "Calendar - SHOP.CAL", menus: ["File", "Edit", "View", "Show", "Alarm", "Options"]) {
      HStack(alignment: .top, spacing: 0) {
        MonthView(selection: "1986-04-11", events: ["1986-04-03", "1986-04-12", "1986-04-24"])
          .frame(width: 170)
        AppointmentList {
          ListBoxItem("8:00")
          ListBoxItem("9:00  Deliveries")
          ListBoxItem("10:00").selected()
          ListBoxItem("11:00 Menu proofs")
          ListBoxItem("12:00")
          ListBoxItem("1:00  Lunch, Ruth")
          ListBoxItem("2:00")
          ListBoxItem("3:00  Order ink")
        }
        .frame(maxWidth: .infinity)
      }
      .frame(maxWidth: .infinity)
      Spacer()
    }
    AppWindow(title: "Cardfile - CLIENTS.CRD", menus: ["File", "Edit", "View", "Card", "Search"], inactive: true) {
      HStack(spacing: 8) {
        LText("Card View")
        Spacer()
        LText("4 Cards")
      }
      .padding(4)
      CardStack {
        IndexCard("Whitfield Hardware") { Text("") }
          .frame(width: 190, height: 120).offset(x: 36, y: 6)
        IndexCard("Riverside Bakery") { Text("") }
          .frame(width: 190, height: 120).offset(x: 24, y: 24)
        IndexCard("Lindqvist, Maja") { Text("") }
          .frame(width: 190, height: 120).offset(x: 12, y: 42)
        IndexCard("Benton Florists") {
          Text("Ada Benton")
          Text("14 Mill Lane")
          Text("Tel. 555-0182")
          Text("Price list, weekly")
        }
        .frame(width: 190, height: 130).offset(x: 0, y: 60)
      }
      .padding(8)
    }
  }
  IconArea {
    IconicWindow("MS-DOS Exec.", icon: "folder")
    IconicWindow("Clock", icon: "clock")
    Spacer()
  }
}
```
