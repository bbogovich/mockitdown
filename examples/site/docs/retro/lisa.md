# Lisa Office System

The **lisa** pack imitates the **Apple Lisa** and its **Office System** (1983 – 1985), the desktop the
Macintosh was distilled from. Like the Mac it is drawn in one bit on a 720 × 364 screen, but it looks
its own way: a lighter system font in the menus and dialogs, tall white window title bars with the title
centred and no stripes or close box, solid scroll arrows and a white "elevator", dialog and alert boxes
with a single thick border, heavy rounded buttons, check boxes that fill in black, typing fields drawn as
an underline, and the document-centred desktop where you tear a new document off a **stationery pad**
instead of launching an application. The fonts fall back the same way as the Macintosh pack (`ChicagoFLF`,
`Chicago`, `Charcoal`, `Geneva`, then a sans-serif); nothing is downloaded.

Select it with `import Lisa` (also `LisaOffice`) or `pack="lisa"` on the fence. The default device is
the 720 × 364 screen; `device="window"` makes the frame one document window and `device="dialog"` a
dialog box. Elements: `MenuBar`, `Menu`, `MenuItem`, `MenuSeparator`, `Desktop`, `Window`
(`.document`, `.tool`, `.folder`, `.dialog`), `DocumentWindow`, `FolderWindow`, `ToolWindow`,
`DialogBox`, `Dialog`, `Alert` / `NoteAlert` / `CautionAlert` / `StopAlert`, `Button`, `DefaultButton`,
`CheckBox`, `RadioButton`, `RadioGroup`, `TextField`, `StaticText`, `ListBox` with `FileItem`,
`ScrollBar`, `DesktopIcon` (`kind: .profile`, `.clipboard`, `.preferences`, `.trash`, `.folder`,
`.document`, `.stationery`, `.calculator`, `.printer`), `StationeryPad`, `Folder`, `ProgressBar`,
`Worksheet` (a spreadsheet with the formula panel), `Ruler`, `DrawPalette`, `ToolPalette`, `Tool`,
`PatternPalette` and `DrawCanvas`. The Lisa had no dark mode; `appearance: dark` shows the screen
inverted. The tools and documents below are invented; they only follow the patterns of the Office
System's word processor, worksheet and drawing tools.

## The Office System desktop

The desktop manager with *File/Print* pulled down. The Profile hard disk is open (its icon greyed) in a
folder window that holds stationery pads and folders; Clipboard, Preferences and the Wastebasket stand
along the right edge.

```mockitdown pack="lisa" title="Desktop" source="true"
import "lisa/office"

MenuBar {
  Menu("File/Print", open: true) {
    MenuItem("Tear Off Stationery")
    MenuItem("Open")
    MenuItem("Close All Except Desktop")
    MenuSeparator()
    MenuItem("Save & Put Away").disabled()
    MenuItem("Set Aside")
    MenuSeparator()
    MenuItem("Print As Is…")
    MenuItem("Format for Printer…")
  }
  Menu("Edit")
  Menu("Housekeeping")
}
Desktop {
  FolderWindow("Profile", subtitle: "8 documents      2,312 blocks free") {
    VStack(alignment: .leading, spacing: 6) {
      PadRow(names: ["Letter Paper", "Budget Sheet", "Drawing Paper"])
      HStack(alignment: .top, spacing: 0) {
        Folder("Club").selected()
        Folder("Archive")
        DesktopIcon("Minutes", kind: .document)
        DesktopIcon("Calculator", kind: .calculator)
      }
    }
  }
  .frame(width: 380, height: 240)
  .offset(x: 150, y: 30)
  StationeryPad("Memo Pad").offset(x: 20, y: 250)
  DeskIcons(profileOpen: true)
}
```

## A word-processing document

A document torn off the *Letter Paper* pad, in the manner of the Office System's word processor: the tab
ruler across the top of the window, the text below it, the scroll bar with its elevator box, and an
inactive folder window behind.

```mockitdown pack="lisa" title="Letter"
import "lisa/office"

MenuBar {
  Menu("File/Print")
  Menu("Edit")
  Menu("Type Style")
  Menu("Page Layout")
  Menu("Search")
}
Desktop {
  FolderWindow("Club", subtitle: "3 documents") {
    PadRow(names: ["Letter Paper"])
  }
  .state(.inactive)
  .frame(width: 260, height: 150)
  .offset(x: 20, y: 16)
  DocumentWindow("Letter to the Club", position: .quarter) {
    Ruler()
    VStack(alignment: .leading, spacing: 8) {
      Text("12 March 1984").font(.callout)
      Text("Dear members,").font(.callout)
      Text("The spring regatta will be held on the first Saturday of June. Boats must be registered with the secretary by the end of May; the registration form is enclosed.").font(.callout)
      Text("The boat house roof is finished and the doors will be painted next week.").font(.callout)
    }
    .padding(.horizontal, 10)
  }
  .frame(width: 470, height: 290)
  .offset(x: 150, y: 40)
  DeskIcons()
}
```

## A dialog box with every control

*Format for Printer* as a Lisa dialog box with its single heavy border: radio buttons, check boxes that
fill in, underlined typing fields (the insertion point in *Copies*), a list of printers, a progress bar
for the spooler, a dimmed button and the default button that Return activates.

```mockitdown pack="lisa" device="dialog" width="500" height="170" appearance="both" title="Format for Printer" source="true"
import Lisa

HStack(alignment: .top, spacing: 18) {
  VStack(alignment: .leading, spacing: 8) {
    StaticText("Format “Letter to the Club” for printing").bold()
    HStack(spacing: 12) {
      StaticText("Quality:")
      RadioButton("High", checked: true)
      RadioButton("Standard")
      RadioButton("Draft")
    }
    HStack(spacing: 8) {
      StaticText("Copies:")
      TextField("1").state(.focused).frame(width: 40)
      StaticText("Pages:")
      TextField("1").frame(width: 30)
      StaticText("to")
      TextField("3").frame(width: 30)
    }
    HStack(spacing: 14) {
      CheckBox("Pause between pages", checked: true)
      CheckBox("Wide paper")
    }
    StaticText("Printer spooler: 2 documents waiting")
    ProgressBar(value: 0.6).frame(width: 260)
  }
  VStack(alignment: .leading, spacing: 8) {
    ListBox {
      FileItem("Dot Matrix", kind: .document).selected()
      FileItem("Daisy Wheel", kind: .document)
      FileItem("Plotter", kind: .document).disabled()
    }
    .frame(width: 140, height: 64)
    HStack(spacing: 8) {
      Button("Cancel")
      DefaultButton("OK")
    }
    Button("Set Up…").disabled()
  }
}
```

## Alerts

Alert boxes put a symbol in a framed square at the left: *note* for information, *caution* before an
action that cannot be undone, and *stop* when the action cannot be done at all.

```mockitdown pack="lisa" device="fit" appearance="both" title="Alerts"
import Lisa

VStack(alignment: .leading, spacing: 14) {
  NoteAlert("The document “Minutes” has been put away in the folder “Club”.", inline: true,
            actions: { DefaultButton("OK") })
  CautionAlert("Discard the changes made to “Budget Sheet” since it was last saved?", inline: true, actions: {
    Button("Cancel")
    DefaultButton("Discard")
  })
  StopAlert("There is not enough room on the Profile to save “Drawing 4”.", inline: true,
            actions: { DefaultButton("OK") })
}
```

## A worksheet

A budget torn off the *Budget Sheet* pad, in the manner of the Office System's worksheet tool. The
status panel at the top shows the active cell (#1) and its formula (#2); the column letters and row
numbers frame the grid; the selected range is shaded and the active cell boxed (#3); the scroll bars and
the size control (#4) work as in every other Lisa window.

```mockitdown pack="lisa" title="Worksheet"
import "lisa/office"

MenuBar {
  Menu("File/Print")
  Menu("Edit")
  Menu("Type Style")
  Menu("Format")
  Menu("Page Layout")
  Menu("Arithmetic")
}
Desktop {
  DocumentWindow("Club Budget 1984", position: .top) {
    Worksheet(rows: [
      ["Item", "Jan", "Feb", "Mar", "Total"],
      ["Rent", 120, 120, 120, 360],
      ["Paint", 0, 45, 0, 45],
      ["Regatta", 0, 0, 80, 80],
      ["Insurance", 30, 30, 30, 90],
      ["Total", 150, 195, 230, 575]
    ], headerRow: true, rowCount: 10, selection: "B6:E6", active: "E6", formula: "SUM(B6:D6)",
       columnWidths: [120, 70, 70, 70, 80])
    .callout(1, alignment: .topLeading)
    .callout(2, alignment: .top)
    .callout(3, alignment: .bottom)
  }
  .frame(width: 540, height: 300)
  .offset(x: 40, y: 16)
  .callout(4, alignment: .bottomTrailing)
  DeskIcons()
}
```

## A drawing

A drawing in the manner of the Office System's drawing tool: the vertical tool palette at the left, the
dotted grid in the window, shapes selected with handles, and the *Edit* menu
pulled down.

```mockitdown pack="lisa" title="Drawing" source="true"
import "lisa/office"

MenuBar {
  Menu("File/Print")
  Menu("Edit", open: true) {
    MenuItem("Undo Last Change")
    MenuSeparator()
    MenuItem("Cut")
    MenuItem("Copy")
    MenuItem("Paste").disabled()
    MenuSeparator()
    MenuItem("Duplicate", shortcut: "⌘D")
    MenuItem("Select All of Drawing")
  }
  Menu("Type Style")
  Menu("Arrange")
  Menu("Fill")
  Menu("Lines")
}
Desktop {
  DocumentWindow("Boat House Plan") {
    HStack(alignment: .top, spacing: 0) {
      DrawPalette {
        Tool(.select).selected()
        Tool(.text)
        Tool(.line)
        Tool(.rect)
        Tool(.roundRect)
        Tool(.oval)
        Tool(.arc)
        Tool(.freehand)
        Tool(.polygon)
      }
      DrawCanvas(grid: .dots) {
        Rectangle().stroke(.primary, lineWidth: 2).fill(.background).frame(width: 160, height: 90)
          .position(x: 150, y: 110)
        Rectangle().stroke(.primary, lineWidth: 1).frame(width: 30, height: 50).position(x: 150, y: 130)
        RoundedRectangle(cornerRadius: 8).stroke(.primary, lineWidth: 1).fill(.background)
          .frame(width: 120, height: 28).position(x: 340, y: 150).dragSelect()
        Text("Boat house — north side").position(x: 150, y: 40)
      }
    }
    .frame(maxHeight: .infinity)
  }
  .frame(width: 500, height: 300)
  .offset(x: 120, y: 14)
  DeskIcons()
}
```
