# Windows 2.x

The **win2** pack imitates **Microsoft Windows 2.0 and 2.1** (1987–88), the release that brought
overlapping windows to Windows. Everything is drawn with the 16-colour EGA/VGA palette and hairline black
rules: white client areas, a blue caption for the active window (white for inactive ones) with the
**system-menu box** on the left and the **minimise ▼ / maximise ▲ arrow boxes** on the right, a white
menu bar whose titles have underlined mnemonics, inverse-video selection, rounded push buttons with a
1-pixel border (2 pixels for the default button), square check boxes that show an X, and grey
scroll-bar shafts with white thumb boxes. Text uses the bold proportional **System** font (stack
`Fixedsys`, `"MS Sans Serif"`, Arial, monospace — no web fonts).

Select it with `import Windows2` (also `Win2`, `MSDOSExecutive`) or `pack="win2"`. Elements use the
dialog-template and window-class names of the Windows 2 SDK: `Window`, `MenuBar`, `MenuBarItem`,
`PopupMenu`, `MenuItem`, `PushButton`, `DefPushButton`, `CheckBox`, `RadioButton`, `GroupBox`,
`EditText`, `ListBox`, `LText`/`RText`/`CText`, `ScrollBar`, `DialogBox`, `MessageBox`, plus the MS-DOS
Executive's `DriveBar`, `DriveIcon`, `PathLine`, `FileList`, `FileName`, the `IconArea` with
`IconicWindow`s, and a Paint-style `ToolPalette` / `PatternPalette`. The dark appearance is an inverted
black-background scheme of the kind people set up in the Control Panel for plasma and LCD laptops. The
reusable `AppWindow`, `FileColumn` and `EditRow` components live in `mockups/win2/apps.mockitdown`.

## The desktop

Overlapping windows on the grey desktop: the MS-DOS Executive behind, an active document window in
front, and minimised programs parked in the icon area. The numbered callouts mark the system-menu box
(#1), the minimise/maximise boxes (#2), the drive icons (#3), the selected file (#4) and the icon area
(#5).

```mockitdown source="true" chrome="none" title="Windows 2 desktop"
import Windows2
import "win2/apps"

Desktop {
  VStack {
  AppWindow(title: "MS-DOS Executive", menus: ["File", "View", "Special"], inactive: true) {
    DriveBar {
      DriveIcon("A")
      DriveIcon("B")
      DriveIcon("C").selected().callout(3, alignment: .trailing)
    }
    PathLine("C: \\WINDOWS")
    HStack(alignment: .top, spacing: 24) {
      FileColumn(names: ["CALC.EXE", "CLOCK.EXE", "CONTROL.EXE", "NOTEPAD.EXE", "PAINT.EXE"])
      FileColumn(names: ["PIF", "README.TXT", "SCRIBE.EXE", "SPOOLER.EXE", "WIN.INI"], selected: "SCRIBE.EXE")
        .callout(4, alignment: .trailing)
      FileColumn(names: ["WINOLDAP.MOD", "WIN200.BIN", "WIN200.OVL", "SYSTEM.INI"])
    }
    .padding(.horizontal, 6)
    Spacer()
  }
  .frame(width: 520, height: 300)
  .callout(1, alignment: .topLeading)
  }
  .padding(8)

  VStack {
  AppWindow(title: "Scribe - LETTER.WRI", menus: ["File", "Edit", "Search", "Character", "Paragraph"]) {
    VStack(alignment: .leading, spacing: 4) {
      Text("Dear Ms. Alvarez,")
      Text("Thank you for the samples of the new catalogue. The layouts print well on our laser printer.")
      Text("We will confirm the order by Friday.")
    }
    .padding(10)
    Spacer()
  }
  .frame(width: 390, height: 210)
  .callout(2, alignment: .topTrailing)
  }
  .padding(.leading, 210)
  .padding(.top, 150)

  IconArea {
    IconicWindow("Calculator", icon: "number").callout(5, alignment: .topLeading)
    IconicWindow("Clock", icon: "clock")
    IconicWindow("Notepad", icon: "doc")
    IconicWindow("Spooler", icon: "printer")
  }
}
```

## MS-DOS Executive

The file manager and program launcher of Windows 2, here with the **File** menu pulled down. Drive
icons sit along the top, the current path below them, and the file names fill the window in columns;
dimmed commands are `.disabled()` menu items.

```mockitdown chrome="window" title="MS-DOS Executive" appearance="both"
import MSDOSExecutive
import "win2/apps"

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
      MenuSeparator()
      MenuItem("Exit Windows...")
    }
    MenuBarItem("View")
    MenuBarItem("Special")
  }
  DriveBar {
    DriveIcon("A")
    DriveIcon("B")
    DriveIcon("C").selected()
  }
  PathLine("C: \\DOCS")
  HStack(alignment: .top, spacing: 28) {
    FileColumn(names: ["BUDGET.XLS", "CATALOG.WRI", "INVOICE.WRI", "LETTER.WRI"])
    FileColumn(names: ["LOGO.MSP", "MEMO.TXT", "ORDERS.TXT", "PRICES.TXT"], selected: "MEMO.TXT")
    FileColumn(names: ["REPORT.WRI", "SCHEDULE.CRD", "STAFF.CRD"])
  }
  .padding(.horizontal, 6)
  .padding(.top, 2)
  Spacer()
}
```

## Scribe — a word processor

An invented Write-style document editor: menu bar, ruler, the document text, a vertical scroll bar on
the right and a horizontal one with the page indicator at the bottom.

```mockitdown source="true" chrome="window" title="Scribe - CATALOG.WRI"
import Windows2

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
      Text("Spring Catalogue 1988").font(.title2).frame(maxWidth: .infinity, alignment: .center)
      Text("Northwind Garden Supply").font(.title3).frame(maxWidth: .infinity, alignment: .center)
      Text("Our spring range adds forty new seed varieties, a lighter wheelbarrow and the long-awaited copper watering can. Prices hold steady for the third year running.")
      Text("All orders placed before the 31st of March ship free of charge. Telephone orders are taken from 8 until 6, Monday to Saturday.")
      Text("**Seeds** — page 2   **Tools** — page 9   **Furniture** — page 15")
      Spacer()
    }
    .padding(.horizontal, 14)
    .padding(.top, 4)
    .frame(maxWidth: .infinity, maxHeight: .infinity)
    VScrollBar(value: 0)
  }
  .frame(maxHeight: .infinity)
  HStack(spacing: 0) {
    Text("Page 1").padding(.horizontal, 6).frame(width: 70)
    ScrollBar(value: 0.1).frame(maxWidth: .infinity)
    Color(.gray).frame(width: 16, height: 16)
  }
  .border(.black)
}
```

## A dialog with every control

`DialogBox` with the controls of a Windows 2 dialog template: `LText` labels, `EditText`, `GroupBox`es
of `RadioButton`s and `CheckBox`es, a `ListBox`, a `ScrollBar`, and `PushButton`s next to the heavier
`DefPushButton`. Modal dialog boxes have no caption, only the double frame.

```mockitdown source="true" chrome="window" title="Scribe - CATALOG.WRI" appearance="both"
import Windows2
import "win2/apps"

VStack(alignment: .stretch, spacing: 0) {
  MenuBar {
    MenuBarItem("File").selected()
    MenuBarItem("Edit")
    MenuBarItem("Search")
    MenuBarItem("Character")
  }
  Spacer()
}

DialogBox {
  HStack(alignment: .top, spacing: 16) {
    VStack(alignment: .stretch, spacing: 6) {
      EditRow(label: "Copies:", text: "2", focused: true)
      EditRow(label: "Pages from:", text: "1")
      EditRow(label: "to:", text: "12")
      GroupBox("Quality") {
        RadioButton("High", checked: true)
        RadioButton("Draft")
      }
      GroupBox("Options") {
        CheckBox("Collate copies", checked: true)
        CheckBox("Print to file")
        CheckBox("Wait for each page").disabled()
      }
    }
    .frame(width: 210)
    VStack(alignment: .stretch, spacing: 6) {
      LText("Printer:")
      ListBox {
        ListBoxItem("Epson FX-80 on LPT1:")
        ListBoxItem("HP LaserJet on LPT2:").selected()
        ListBoxItem("PostScript on COM1:")
        ListBoxItem("Generic / Text Only")
      }
      .frame(height: 76)
      LText("Margin (inches):")
      ScrollBar(value: 0.25)
      Spacer()
      HStack(spacing: 10) {
        Spacer()
        DefPushButton("OK")
        PushButton("Cancel")
      }
    }
    .frame(maxWidth: .infinity)
  }
}
.frame(width: 470)
```

## Message box

A `MessageBox` with the exclamation icon and three buttons, over the window that raised it.

```mockitdown source="true" chrome="window" title="Scribe - LETTER.WRI"
import Windows2

VStack(alignment: .stretch, spacing: 0) {
  MenuBar {
    MenuBarItem("File")
    MenuBarItem("Edit")
    MenuBarItem("Search")
  }
  Text("Dear Ms. Alvarez,").padding(10)
  Spacer()
}

MessageBox("Scribe", message: "Save changes to LETTER.WRI before closing?", icon: "exclamation",
           buttons: ["Yes", "No", "Cancel"], primary: "Yes")
```

## Sketch — a paint program

An invented Paint-style program: the `ToolPalette` of `PaletteTool`s on the left, the drawing on a
`Canvas`, and the `PatternPalette` along the bottom.

```mockitdown chrome="window" title="Sketch - LOGO.MSP"
import Windows2

VStack(alignment: .stretch, spacing: 0) {
  MenuBar {
    MenuBarItem("File")
    MenuBarItem("Edit")
    MenuBarItem("Font")
    MenuBarItem("Style")
    MenuBarItem("Size")
    MenuBarItem("Pick")
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
      Circle().fill(.blue).frame(width: 90, height: 90).position(x: 150, y: 110)
      Rectangle().fill(.red).frame(width: 120, height: 40).position(x: 260, y: 170)
      Text("NORTHWIND").font(.title).position(x: 200, y: 230)
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
