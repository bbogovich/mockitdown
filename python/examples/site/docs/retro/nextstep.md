# NeXTSTEP

The **nextstep** pack imitates **NeXTSTEP 3.x** (1992–1995), the classic look of the Application Kit
and the Workspace Manager that NeXT shipped from NeXTSTEP 1.0 (1989) through 3.3 and OPENSTEP 4.x.
Everything is drawn in the **two-bit greyscale** of the original MegaPixel display — black, dark grey
`#555`, light grey `#AAA` and white: windows have a one-pixel black frame, a **black title bar when
key** (dark grey when main, light grey otherwise) with the **miniaturize button at the left** and the
**close button at the right**, and a **resize bar** along the bottom. Applications have no menu bar:
the main menu is a **vertical column of cells** at the top-left of the screen, submenus open beside it
(cells with an arrow) and can be **torn off** to stay on screen with their own close button; keyboard
equivalents appear at the right of the cells. Push buttons are bevelled cells, the default one shows
the **return glyph**; highlighted cells turn white. **Scrollers sit on the left** with both arrows at
the bottom. The Workspace Manager's File Viewer has the **shelf**, the icon path and the multi-column
**browser**; the **Dock** of 64-pixel tiles stands at the right edge of the screen. Type is Helvetica
12 (`Helvetica`, `"Helvetica Neue"`, Arial) with Helvetica Bold for titles.

Select it with `import NeXTSTEP` (also `AppKitNeXT`, `OpenStep`) or `pack="nextstep"`. The default
device is a 640 × 480 window drawn by the `window` chrome (`window="main"` or `window="inactive"` on
the fence greys its title bar); `device="screen"` gives the 1120 × 832 MegaPixel screen for a
`Workspace` holding windows, menus and the Dock placed with `.position(x:y:)`. Elements use the
Application Kit class names — `Window` (`.variant(.key | .main | .inactive)`), `Panel`, `Menu`,
`TornOffMenu`, `MenuItem`, `SubmenuItem`, `Button`, `ReturnButton`, `ImageButton`, `Switch`,
`RadioButton`, `RadioMatrix`, `TextField`, `SecureTextField`, `Form` / `FormCell`, `TextView`,
`PopUpList`, `PullDownList`, `Slider`, `ColorWell`, `ScrollView`, `Box`, `SplitView`, `NXBrowser` /
`BrowserColumn` / `BrowserCell` / `BrowserLeaf`, `TableView`, `Ruler` and `AlertPanel` (OPENSTEP
`NS…` names are accepted too) — plus the Workspace's `Shelf`, `PathView`, `FileIcon`, `Dock`,
`DockTile` (`.variant(.idle)` for a docked application that is not running) and `MiniWindow`. NeXT
had no dark mode: `appearance: dark` switches to a *NeXTSTEP Color on darker greys* variant with a
slate-blue selection. The NeXT logo is never drawn; the Workspace tile shows a neutral glyph, and
every application, document and person is invented.

## The Workspace

The whole MegaPixel screen: the Workspace menu at the top-left, the key **File Viewer** with its shelf,
icon path and browser, an inactive Edit window behind it, a miniaturized Terminal window and the Dock
along the right edge. The callouts mark the miniaturize button (#1), the close button (#2), the
resize bar (#3), a browser column's scroller on the left (#4) and the ellipsis on the tile of a
docked application that is not running (#5). The Dock is the `StandardDock` component from
`docs/mockups/nextstep/workspace.mockitdown`.

```mockitdown pack="nextstep" device="screen" chrome="none" title="Workspace Manager"
import "nextstep/workspace"

Workspace {
  Menu("Workspace") {
    SubmenuItem("Info")
    SubmenuItem("File").selected()
    SubmenuItem("Edit")
    SubmenuItem("Disk")
    SubmenuItem("View")
    SubmenuItem("Tools")
    SubmenuItem("Windows")
    SubmenuItem("Services")
    MenuItem("Hide", shortcut: "h")
    MenuItem("Log Out", shortcut: "q")
  }
  .position(x: 60, y: 140)

  Menu("File") {
    MenuItem("Open", shortcut: "o")
    MenuItem("Open as Folder")
    MenuItem("New Folder", shortcut: "n")
    MenuItem("Duplicate", shortcut: "d")
    MenuItem("Compress")
    MenuItem("Destroy")
    MenuItem("Empty Recycler").disabled()
  }
  .position(x: 172, y: 107)

  Window("Edit — ~/Documents/plans.rtf") {
    TextView(text: "Harbour survey, spring term\n\nWalk the north quay with Ines on Monday.", rows: 8)
      .frame(maxHeight: .infinity)
  }
  .variant(.inactive)
  .frame(width: 430, height: 260)
  .position(x: 640, y: 210)

  Window("File Viewer — /Users/rowan") {
    Shelf {
      FileIcon("rowan", icon: "home")
      FileIcon("Apps", icon: "folder")
      FileIcon("Survey", icon: "folder")
      FileIcon("Terminal", icon: "Terminal")
      FileIcon("Recycler", icon: "Recycler")
    }
    Divider()
    PathView {
      FileIcon("/", icon: "archivebox")
      FileIcon("Users", icon: "folder")
      FileIcon("rowan", icon: "home")
      FileIcon("Survey", icon: "folder").selected()
    }
    NXBrowser {
      BrowserColumn {
        BrowserCell("Apps")
        BrowserCell("Library")
        BrowserCell("Mailboxes")
        BrowserCell("Survey").selected()
        BrowserCell("Projects")
      }
      .callout(4, alignment: .leading)
      BrowserColumn {
        BrowserCell("Charts")
        BrowserCell("Photos")
        BrowserLeaf("north-quay.rtf").selected()
        BrowserLeaf("notes.rtf")
        BrowserLeaf("tides.data")
      }
      BrowserColumn {
        BrowserLeaf("")
      }
    }
    .padding(6)
    .frame(maxHeight: .infinity)
  }
  .frame(width: 560, height: 470)
  .position(x: 520, y: 470)
  .callout(1, alignment: .topLeading)
  .callout(2, alignment: .topTrailing)
  .callout(3, alignment: .bottom)

  MiniWindow("Terminal", icon: "Terminal").position(x: 40, y: 796)

  StandardDock()
    .frame(height: 832)
    .position(x: 1088, y: 416)
    .callout(5, alignment: .leading)
}
```

## Menus: the main menu, an attached submenu and a torn-off one

An application's main menu is a column of cells. **Edit** is open beside it, its cell highlighted;
the **Format** submenu was torn off earlier and keeps its own title bar with a close button. Keyboard
equivalents are the Command-key letters at the right of the cells.

```mockitdown pack="nextstep" chrome="none" width="560" height="360" title="Menus" source="true" appearance="both"
Workspace {
  Menu("Scribe") {
    SubmenuItem("Info")
    SubmenuItem("Document")
    SubmenuItem("Edit").selected()
    SubmenuItem("Format")
    SubmenuItem("Utilities")
    SubmenuItem("Windows")
    MenuItem("Print...", shortcut: "p")
    SubmenuItem("Services")
    MenuItem("Hide", shortcut: "h")
    MenuItem("Quit", shortcut: "q")
  }
  .position(x: 64, y: 140)

  Menu("Edit") {
    MenuItem("Cut", shortcut: "x")
    MenuItem("Copy", shortcut: "c").selected()
    MenuItem("Paste", shortcut: "v")
    MenuItem("Paste Font").disabled()
    MenuItem("Delete")
    MenuItem("Select All", shortcut: "a")
    SubmenuItem("Find")
    SubmenuItem("Spelling")
  }
  .position(x: 176, y: 118)

  TornOffMenu("Format") {
    SubmenuItem("Font")
    SubmenuItem("Text")
    MenuItem("Page Layout...", shortcut: "P")
    MenuItem("Show Ruler")
    MenuItem("Copy Ruler")
    MenuItem("Paste Ruler")
  }
  .position(x: 440, y: 110)
}
```

## Preferences

An invented Preferences application: the row of section buttons at the top (Mouse pressed), then
`Box`es holding `Slider`s, a `RadioMatrix`, `Switch`es, a `PopUpList`, a `ColorWell` and a `Form`.
The `SettingRow` component lines titles up on the right.

```mockitdown pack="nextstep" title="Preferences" width="560" height="470" appearance="both" source="true"
import "nextstep/workspace"

VStack(alignment: .stretch, spacing: 0) {
  ButtonRow {
    ImageButton("Localization", icon: "Localization")
    ImageButton("Time", icon: "Time")
    ImageButton("Password", icon: "Password")
    ImageButton("Display", icon: "Display")
    ImageButton("Keyboard", icon: "Keyboard")
    ImageButton("Mouse", icon: "Mouse").selected()
    ImageButton("Sound", icon: "Sound")
    ImageButton("Menu", icon: "Menu")
  }
  HStack(alignment: .top, spacing: 12) {
    VStack(alignment: .stretch, spacing: 12) {
      Box("Mouse") {
        Slider("Double-click delay", value: 0.4, ticks: 6)
        Slider("Acceleration", value: 0.7, ticks: 6)
        RadioMatrix("Handedness", items: ["Right-handed", "Left-handed"], selection: "Right-handed")
      }
      Box("Options") {
        Switch("Highlight on mouse-down", checked: true)
        Switch("Hide the Dock when inactive")
        Switch("Auto-launch Mail", checked: true)
      }
    }
    .frame(maxWidth: .infinity)
    VStack(alignment: .stretch, spacing: 12) {
      Box("Appearance") {
        SettingRow(label: "Window title:") {
          PopUpList(items: ["Helvetica 12", "Helvetica 14", "Times 12"], selection: "Helvetica 12")
        }
        SettingRow(label: "Selection:") {
          ColorWell(.white)
        }
      }
      Box("Owner") {
        Form {
          FormCell("Name:", text: "Rowan Castell")
          FormCell("Host:", text: "harbour")
          FormCell("Mail:", text: "rowan@harbour").state(.focused)
        }
      }
    }
    .frame(width: 240)
  }
  .padding(12)
  Spacer()
  HStack(spacing: 8) {
    Spacer()
    Button("Revert")
    ReturnButton("Set")
  }
  .padding(10)
}
```

## Edit: a text window with the ruler

The `Ruler` above a `TextView`: font and alignment controls over the tick-marked strip, and the text
page with its scroller on the left. The window is main but not key (`window="main"`), so its title bar
is dark grey.

```mockitdown pack="nextstep" title="north-quay.rtf — ~/Survey" width="640" height="440" window="main" appearance="both"
VStack(alignment: .stretch, spacing: 0) {
  Ruler {
    PopUpList(items: ["Helvetica"], selection: "Helvetica").frame(width: 110)
    PopUpList(items: ["12"], selection: "12").frame(width: 50)
    Divider()
    Button(icon: "line.3.horizontal").selected()
    Button(icon: "list.bullet")
    Button(icon: "line.3.horizontal.decrease")
    Divider()
    Text("Spacing")
    Button("1")
    Button("1½")
    Spacer()
  }
  TextView(text: "North quay, survey notes\n\nThe east bollards were repainted in March; three of them have already lost their caps. The tide gauge reads 4 cm high against the benchmark on the harbour office wall.\n\nTo do before the spring meeting:\n  •  photograph the slipway at low water\n  •  ask Ines for the 1987 drawings\n  •  measure the crane rail gauge again", rows: 14)
    .frame(maxHeight: .infinity)
}
```

## Mail

A Mail-like viewer: the button row (Compose, Reply, Forward, Deliver, Delete), the message list as a
`TableView` built from the `MailRow` component, the dimpled `SplitView` divider and the selected
message below.

```mockitdown pack="nextstep" title="Mailbox — ~/Mailboxes/Active.mbox" width="700" height="520" source="true"
import "nextstep/workspace"

VStack(alignment: .stretch, spacing: 0) {
  ButtonRow {
    ImageButton("Compose", icon: "Compose")
    ImageButton("Reply", icon: "Reply")
    ImageButton("Forward", icon: "Forward")
    ImageButton("Deliver", icon: "Deliver")
    ImageButton("Delete", icon: "Delete")
    Spacer()
    VStack(spacing: 2) {
      Text("24 messages, 3 unread").font(.caption)
      HStack(spacing: 2) {
        IconButton(icon: "Previous")
        IconButton(icon: "Next")
      }
    }
  }
  SplitView {
    TableView(columns: ["", "From", "Subject", "Date", "Size"]) {
      MailRow(from: "Ines Valdour", subject: "1987 harbour drawings", date: "Nov 24", size: "48K", unread: true, selected: true)
      MailRow(from: "Tomas Brecht", subject: "Re: crane rail gauge", date: "Nov 24", unread: true)
      MailRow(from: "Harbour Office", subject: "Spring meeting agenda", date: "Nov 23", size: "6K", unread: true)
      MailRow(from: "Ada Pellworm", subject: "Tide table corrections", date: "Nov 21", size: "3K")
      MailRow(from: "Rowan Castell", subject: "Slipway photographs", date: "Nov 20", size: "212K")
      MailRow(from: "Library", subject: "Overdue: Coastal Structures", date: "Nov 18", size: "1K")
    }
    .frame(height: 150)
    Divider()
    TextView(text: "From: Ines Valdour\nTo: Rowan Castell\nSubject: 1987 harbour drawings\n\nRowan,\n\nI found the folder with the 1987 drawings of the north quay in the basement archive. They show the old crane rail at 1.43 m, so your measurement fits. I scanned the two sheets and attached them.\n\nSee you Monday at the quay.\nInes", rows: 12)
      .frame(maxHeight: .infinity)
  }
  .frame(maxHeight: .infinity)
}
```

## Interface Builder: palette and inspector

An Interface-Builder-like session on the screen: the window being designed, the **Palettes** panel
with sample controls in `PaletteCell` components, and the **Inspector** with its `PullDownList` of
sections, a `Form`, `Switch`es and a `RadioMatrix`.

```mockitdown pack="nextstep" chrome="none" width="1000" height="700" title="Interface Builder"
import "nextstep/workspace"

Workspace {
  Menu("Builder") {
    SubmenuItem("Info")
    SubmenuItem("Document")
    SubmenuItem("Edit")
    SubmenuItem("Format")
    SubmenuItem("Layout")
    SubmenuItem("Tools").selected()
    SubmenuItem("Windows")
    MenuItem("Hide", shortcut: "h")
    MenuItem("Quit", shortcut: "q")
  }
  .position(x: 60, y: 120)

  Window("Tide Calculator") {
    VStack(alignment: .stretch, spacing: 10) {
      Form {
        FormCell("Harbour:", text: "North quay")
        FormCell("Date:", text: "Nov 24")
      }
      Slider("Datum offset", value: 0.3)
      HStack {
        Spacer()
        Button("Clear")
        ReturnButton("Compute")
      }
    }
    .padding(12)
  }
  .variant(.main)
  .frame(width: 300, height: 190)
  .position(x: 290, y: 480)

  Panel("Palettes") {
    VStack(alignment: .stretch, spacing: 0) {
      ButtonRow {
        IconButton(icon: "square.grid.2x2").selected()
        IconButton(icon: "doc")
        IconButton(icon: "list.bullet")
        IconButton(icon: "photo")
      }
      Grid(columns: 2, spacing: 12) {
        PaletteCell(caption: "Button") { Button("Button") }
        PaletteCell(caption: "Switch") { Switch("Switch", checked: true) }
        PaletteCell(caption: "Radio") { RadioButton("Radio", checked: true) }
        PaletteCell(caption: "Slider") { Slider(value: 0.5).frame(width: 80) }
        PaletteCell(caption: "TextField") { TextField(text: "Text").frame(width: 80) }
        PaletteCell(caption: "ColorWell") { ColorWell(.gray) }
      }
      .padding(10)
    }
  }
  .frame(width: 230, height: 300)
  .position(x: 590, y: 200)

  Panel("Inspector") {
    VStack(alignment: .stretch, spacing: 10) {
      PullDownList(items: ["Attributes", "Connections", "Size", "Help"], selection: "Attributes")
      Box("Button") {
        Form {
          FormCell("Title:", text: "Compute")
          FormCell("Alt. Title:")
          FormCell("Key:", text: "↵")
        }
        RadioMatrix(items: ["Momentary Push", "Toggle", "Momentary Light"], selection: "Momentary Push")
      }
      Box("Options") {
        Switch("Bordered", checked: true)
        Switch("Enabled", checked: true)
        Switch("Transparent")
      }
      HStack {
        Spacer()
        Button("Revert")
        ReturnButton("OK")
      }
    }
    .padding(8)
  }
  .variant(.panelInactive)
  .frame(width: 250, height: 400)
  .position(x: 850, y: 420)
}
```

## An alert panel

Closing an edited document asks for confirmation in an `AlertPanel`: the application icon, the bold
title, the message, and the buttons with the default one at the right showing the return glyph.

```mockitdown pack="nextstep" title="north-quay.rtf — ~/Survey" width="560" height="340" window="inactive" source="true" appearance="both"
VStack(alignment: .stretch, spacing: 0) {
  TextView(text: "North quay, survey notes\n\nThe east bollards were repainted in March.", rows: 10)
    .frame(maxHeight: .infinity)
}

AlertPanel("Close", icon: "Edit",
           message: "Save changes to north-quay.rtf?",
           buttons: ["Don't Save", "Cancel", "Save"], primary: "Save")
```

## The Dock and miniwindows

A closer look at the Dock beside a Terminal window: running applications show their plain tile,
docked ones that are not running carry the ellipsis, and miniaturized windows lie on the Workspace
background as tiles with a title strip.

```mockitdown pack="nextstep" chrome="none" width="720" height="700" title="Dock" appearance="both"
import "nextstep/workspace"

Workspace {
  Window("Terminal — /Users/rowan") {
    Terminal("""
    harbour> cd Survey
    harbour> ls
    Charts/          north-quay.rtf   tides.data
    Photos/          notes.rtf
    harbour> wc -l tides.data
         365 tides.data
    harbour>
    """)
    .frame(maxHeight: .infinity)
  }
  .frame(width: 470, height: 300)
  .position(x: 290, y: 200)

  MiniWindow("notes.rtf", icon: "Edit").position(x: 50, y: 660)
  MiniWindow("Active", icon: "Mail").position(x: 120, y: 660)
  MiniWindow("Inspector", icon: "InterfaceBuilder").position(x: 190, y: 660)

  StandardDock()
    .frame(height: 700)
    .position(x: 688, y: 350)
}
```
