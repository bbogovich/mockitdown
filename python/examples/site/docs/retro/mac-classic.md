# Macintosh (System 6)

The **mac-classic** pack imitates the original black-and-white **Macintosh**, from System 1 on the
128K Mac (1984) to System 6 on the Plus, SE and Classic (1991). Everything is drawn in one bit: black on
white, with greys made of dither patterns — the 50 % checkerboard of the desktop and the scroll bars, the
dotted menu separators, the grey of a disabled menu item. It reproduces the menu bar with its
pull-down menus, document windows with the striped title bar, close box, zoom box, scroll bars and grow
box, the double-bordered modal dialog, push buttons with their round corners and the thick outline of
the default button, check boxes crossed with an X, round radio buttons, the stop, note and caution
alerts, Finder icons and the tool palette of a paint program. The system font is Chicago 12 and the
application font Geneva (the pack names `ChicagoFLF`, `Chicago`, `Charcoal` and `Geneva` and falls back
to a bold sans-serif where they are missing; no fonts are downloaded).

Select it with `import MacClassic` (also `System6`, `Macintosh`) or `pack="mac-classic"` on the fence.
The default device is the 512 × 342 screen of the compact Macs; `device="tablet"` is the 640 × 480 Mac II
screen, `device="window"` makes the frame itself one document window (striped title bar, scroll bars,
grow box) and `device="dialog"` makes it a modal dialog box. Elements use the Toolbox vocabulary:
`MenuBar`, `AppleMenu`, `Menu`, `MenuItem`, `MenuSeparator`, `Desktop`, `Window` (`.document`,
`.noGrow`, `.dBox`, `.plainDBox`, `.altDBox`, `.rDoc`, `.finder`), `FinderWindow`, `DeskAccessory`,
`DesktopIcon` / `FinderIcon` (`kind: .disk`, `.floppy`, `.folder`, `.system`, `.application`,
`.document`, `.trash` …), `Button`, `DefaultButton`, `CheckBox`, `RadioButton`, `EditText`,
`StaticText`, `PopUpMenu`, `ListBox` with `FileItem`, `ScrollBar`, `GrowBox`, `ProgressBar`,
`StopAlert`, `NoteAlert`, `CautionAlert`, `Dialog`, `ToolPalette` with `Tool`, `PatternPalette`,
`LineWidths`, `PaintCanvas` and `CalcKey`. `.state(.inactive)` draws a window as it looks behind the
front one; `.state(.open)` greys the icon of an opened disk or folder. `appearance: dark` inverts the
screen to white on black, as the Mac's own *Invert* utilities did. All application names and documents
are invented.

## The Finder

The desktop as the Finder draws it: the menu bar with *File* pulled down, the start-up disk opened in an
icon-view window (its icon on the desktop is greyed because it is open), a floppy and the Trash.

```mockitdown pack="mac-classic" title="Finder" source="true"
import "mac-classic/desk"

SystemMenuBar {
  Menu("File", open: true) {
    MenuItem("New Folder", shortcut: "⌘N")
    MenuItem("Open", shortcut: "⌘O")
    MenuItem("Print").disabled()
    MenuItem("Close", shortcut: "⌘W")
    MenuSeparator()
    MenuItem("Get Info", shortcut: "⌘I")
    MenuItem("Duplicate", shortcut: "⌘D")
    MenuItem("Put Away").disabled()
    MenuSeparator()
    MenuItem("Page Setup…")
    MenuItem("Print Directory…")
    MenuSeparator()
    MenuItem("Eject", shortcut: "⌘E")
  }
  Menu("Edit")
  Menu("View")
  Menu("Special")
}
Desktop {
  FinderFolder(title: "Hard Disk", info: "5 items       1,204K in disk       376K available") {
    FinderIcon("System Folder", kind: .system)
    FinderIcon("Letters", kind: .folder).selected()
    FinderIcon("PaintBox", kind: .application)
    FinderIcon("Budget 91", kind: .document)
  }
  .frame(width: 330, height: 170)
  .offset(x: 70, y: 36)
  FinderFolder(title: "Letters", info: "3 items       1,204K in disk       376K available") {
    FinderIcon("To Ana", kind: .document)
    FinderIcon("Rent", kind: .document)
    FinderIcon("Club news", kind: .document)
  }
  .state(.inactive)
  .frame(width: 260, height: 120)
  .offset(x: 150, y: 190)
  DesktopVolumes(floppy: "Untitled", diskOpen: true)
}
```

## A document window

A word processor with two documents open. The front window is active: its title bar is striped and holds
the close box (#1) and the zoom box (#3) on either side of the title (#2); the scroll bars (#4) show grey
tracks with a white thumb, and the grow box (#5) sits where they meet. The window behind is inactive: plain
title bar, empty scroll bars, no boxes.

```mockitdown pack="mac-classic" title="Document window"
import "mac-classic/desk"

SystemMenuBar {
  Menu("File")
  Menu("Edit")
  Menu("Search")
  Menu("Format")
  Menu("Font")
  Menu("Style")
}
Desktop {
  DocumentWindow("Club news") {
    Text("Spring meeting").font(.callout)
  }
  .state(.inactive)
  .frame(width: 300, height: 150)
  .offset(x: 20, y: 14)
  DocumentWindow("To Ana", position: .middle) {
    VStack(alignment: .leading, spacing: 8) {
      Text("Dear Ana,").font(.callout)
      Text("Thank you for the drawings of the boat house. The new roof looks splendid, and the club has agreed to paint the doors before the regatta in June.").font(.callout)
      Text("I have enclosed the minutes of the last meeting and a copy of the budget. Could you bring the plans on Saturday?").font(.callout)
      Text("Yours, Ben").font(.callout)
    }
    .padding(.horizontal, 6)
  }
  .frame(width: 330, height: 236)
  .offset(x: 110, y: 52)
  .callout(1, alignment: .topLeading)
  .callout(2, alignment: .top)
  .callout(3, alignment: .topTrailing)
  .callout(4, alignment: .trailing)
  .callout(5, alignment: .bottomTrailing)
}
```

## A dialog with every control

*Print* for an imagined dot-matrix printer, as a modal dialog box: the double border, static text, radio
buttons, edit-text fields (the insertion point blinking in *Copies*), check boxes, a pop-up menu, a
dimmed button and the default button with its heavy outline, which Return activates.

```mockitdown pack="mac-classic" device="dialog" width="440" height="168" appearance="both" title="Print" source="true"
import MacClassic

HStack(alignment: .top, spacing: 16) {
  VStack(alignment: .leading, spacing: 8) {
    StaticText("DotWriter II")
    HStack(spacing: 12) {
      StaticText("Quality:")
      RadioButton("Best")
      RadioButton("Faster", checked: true)
      RadioButton("Draft")
    }
    HStack(spacing: 6) {
      StaticText("Page Range:")
      RadioButton("All", checked: true)
      RadioButton("From:")
      EditText("").frame(width: 30)
      StaticText("To:")
      EditText("").frame(width: 30)
    }
    HStack(spacing: 6) {
      StaticText("Copies:")
      EditText("2").state(.focused).frame(width: 34)
      Spacer().frame(width: 10)
      CheckBox("Collate", checked: true)
      CheckBox("Print backwards")
    }
    HStack(spacing: 6) {
      StaticText("Paper Feed:")
      PopUpMenu(selection: "Continuous").frame(width: 120)
      Button("Options…").disabled()
    }
  }
  VStack(spacing: 10) {
    DefaultButton("OK")
    Button("Cancel")
  }
}
```

## Alerts

The three alert icons of the Toolbox, each in an alert box with the default button outlined: *stop* for
something that cannot be done, *note* for information, *caution* before something that cannot be
undone. A modeless progress box (an `altDBox` window) shows a copy in progress.

```mockitdown pack="mac-classic" device="fit" appearance="both" title="Alerts"
import MacClassic

VStack(alignment: .leading, spacing: 14) {
  HStack(alignment: .top, spacing: 14) {
    StopAlert("The disk “Untitled” is full. Remove some items and try again.", inline: true,
              actions: { DefaultButton("OK") })
    NoteAlert("PaintBox 1.2 — an invented paint program for the documentation of mockitdown.", inline: true,
              actions: { DefaultButton("OK") })
  }
  HStack(alignment: .top, spacing: 14) {
    CautionAlert("Save changes to “Budget 91” before closing?", inline: true, actions: {
      Button("Cancel")
      Button("No")
      DefaultButton("Yes")
    })
    DialogWindow {
      StaticText("Items remaining to be copied: 12")
      StaticText("Copying “Club news”").font(.footnote)
      ProgressBar(value: 0.4)
      HStack { Spacer(); Button("Stop") }
    }
    .variant(.altDBox)
    .frame(width: 260)
  }
}
```

## Saving a document

*Save As* in the Standard File dialog over a window drawn by `device="window"`: the folder pop-up above the
list of files (folders first, documents dimmed because only folders can be opened here), the name field,
and the Eject, Drive, Save and Cancel buttons.

```mockitdown pack="mac-classic" device="window" width="512" height="320" title="Budget 91"
import MacClassic

Spreadsheet(rows: [
  ["Item", "Spring", "Summer", "Total"],
  ["Rent", 120, 120, 240],
  ["Paint", 45, 0, 45],
  ["Regatta", 0, 80, 80],
  ["Total", 165, 200, 365]
], headerRow: true, rowCount: 14, columnWidths: [110, 80, 80, 80])
Dialog {
  HStack(alignment: .top, spacing: 14) {
    VStack(alignment: .leading, spacing: 6) {
      PopUpMenu(selection: "Letters").frame(width: 170)
      ListBox {
        FileItem("Archive", kind: .folder)
        FileItem("Club", kind: .folder).selected()
        FileItem("Club news", kind: .document).disabled()
        FileItem("Rent", kind: .document).disabled()
        FileItem("To Ana", kind: .document).disabled()
      }
      .frame(width: 190, height: 96)
      StaticText("Save current document as:")
      EditText("Budget 91").state(.focused).frame(width: 190)
    }
    VStack(spacing: 8) {
      Label("Hard Disk", systemImage: "archivebox")
      Button("Eject").disabled()
      Button("Drive")
      Divider().frame(width: 70)
      DefaultButton("Save")
      Button("Cancel")
    }
  }
}
```

## A paint program and desk accessories

An invented paint program, *PaintBox*, in the manner of the first Mac drawing applications, on the
640 × 480 screen of a Mac II (`device="tablet"`): the tool palette and line widths at the left, the
patterns along the bottom, the drawing in a window in the middle. Three desk accessories from the Apple
menu — Calculator, Note Pad and Alarm Clock, reusable components from `mac-classic/desk` — float above
the document.

```mockitdown pack="mac-classic" device="tablet" title="PaintBox" source="true"
import "mac-classic/desk"

SystemMenuBar {
  Menu("File")
  Menu("Edit")
  Menu("Goodies")
  Menu("Font")
  Menu("FontSize")
  Menu("Style")
}
Desktop {
  HStack(alignment: .top, spacing: 8) {
    VStack(spacing: 8) {
      ToolPalette {
        Tool(.select)
        Tool(.lasso)
        Tool(.hand)
        Tool(.text)
        Tool(.bucket)
        Tool(.spray)
        Tool(.brush)
        Tool(.pencil).selected()
        Tool(.line)
        Tool(.eraser)
        Tool(.rect)
        Tool(.filledRect)
        Tool(.roundRect)
        Tool(.filledRoundRect)
        Tool(.oval)
        Tool(.filledOval)
      }
      LineWidths()
    }
    VStack(alignment: .leading, spacing: 8) {
      NoGrowWindow("Boat house") {
        PaintCanvas {
          Text("Boat house").font(.title).position(x: 100, y: 36)
          Circle().fill(.primary).frame(width: 34, height: 34).position(x: 330, y: 44)
          Rectangle().stroke(.primary, lineWidth: 2).fill(.background).frame(width: 64, height: 64)
            .rotationEffect(.degrees(45)).position(x: 240, y: 122)
          Rectangle().stroke(.primary, lineWidth: 2).fill(.background).frame(width: 110, height: 70).position(x: 240, y: 170)
          Rectangle().stroke(.primary, lineWidth: 2).frame(width: 26, height: 44).position(x: 240, y: 183)
          Rectangle().fill(.primary).frame(width: 2, height: 56).position(x: 90, y: 146)
          Capsule().stroke(.primary, lineWidth: 2).fill(.background).frame(width: 100, height: 24).position(x: 90, y: 186)
        }
      }
      .frame(width: 400, height: 260)
      PatternPalette(selection: 2)
    }
  }
  .padding(8)
  Calculator(display: "365").offset(x: 500, y: 16)
  NotePad(page: 3, text: "Buy paint for the doors. Ask Ana about the roof.").offset(x: 300, y: 300)
  AlarmClock(time: "10:24:07 AM").offset(x: 474, y: 214)
}
```
