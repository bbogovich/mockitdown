# GS/OS (Apple IIgs)

The **gsos** pack imitates the **Apple IIgs Finder under GS/OS System 6** (1988–1993) in the super
hi-res 640 mode: a 640 × 200 screen whose pixels are twice as tall as they are wide, drawn here as
640 × 400 points — so horizontal rules are two points thick and vertical rules one. The look is the
IIgs desktop: a white menu bar with a colour glyph at the left where the Apple menu was (a neutral
striped shape, not the logo), a dithered blue desktop pattern, white windows with black frames and
lined title bars, the close box at the left and the zoom box at the right, the Finder's info bar,
scroll bars with dithered tracks and arrow boxes at each end, rounded push buttons with the bold
outline round the default button, check boxes with an X, pop-up menus with a drop shadow, modal
dialogs and alerts with the double frame, selection shown by inverting, and the Control Panel desk
accessory. Type imitates Shaston, the IIgs system font, falling back to Chicago and Geneva.

Select it with `import GSOS` (also `AppleIIgs`, `IIgs`) or `pack="gsos"` on the fence. The default
device is a 640 × 400 window drawn by the `window` chrome; `device="screen"` gives the whole screen for
a `Desktop` holding a `MenuBar`, windows and icons placed with `.position(x:y:)`. The main elements
are `MenuBar`, `AppleMenu`, `MenuTitle`, `MenuItem`, `Window` / `FinderWindow` / `NDAWindow`,
`InfoBar`, `Folder` / `Disk` / `HardDisk` / `DocumentIcon` / `ApplicationIcon` / `TrashIcon`,
`Button` / `DefaultButton`, `CheckBox`, `RadioButton`, `RadioGroup`, `PopupMenu`, `LineEdit`,
`TextEdit`, `ListControl`, `ScrollArea`, `ProgressBar`, `Frame`, `ModalDialog`, `Dialog`,
`Alert` (`severity: .stop | .note | .caution`) and `ControlPanel`.

The IIgs had no dark mode, but the Finder could put windows on a black desktop; `appearance: dark`
inverts the screen — white ink on black, a near-black desktop — in that spirit.

## The Finder

The desktop with the File menu pulled down over two Finder windows: the startup disk in icon view and
a folder in list view, with the disk icons and the Trash along the right edge.

```mockitdown pack="gsos" device="screen" title="Finder"
import "gsos/components"

Desktop {
  FinderMenuBar {
    MenuTitle("File", open: true) {
      MenuItem("New Folder", shortcut: "⌘N")
      MenuItem("Open", shortcut: "⌘O").highlighted()
      MenuItem("Print").disabled()
      MenuItem("Close", shortcut: "⌘W")
      Divider()
      MenuItem("Icon Info", shortcut: "⌘I")
      MenuItem("Duplicate", shortcut: "⌘D")
      MenuItem("Put Away").disabled()
      Divider()
      MenuItem("Shut Down")
    }
    MenuTitle("Edit")
    MenuTitle("View")
    MenuTitle("Special")
    MenuTitle("Color")
  }

  FinderWindow("Letters") {
    InfoBar("4 items", "1,218K available")
    ScrollArea {
      FinderList(columns: ["Name", "Size", "Kind"], sortColumn: 0) {
        TableRow { Label("Harbour.Office", systemImage: "doc"); Text("4K"); Text("AppleWorks GS") }
        TableRow { Label("Lamp.Order", systemImage: "doc"); Text("2K"); Text("AppleWorks GS") }
        TableRow { Label("Readings.Oct", systemImage: "doc"); Text("9K"); Text("Teach text") }
        TableRow { Label("Old.Letters", systemImage: "folder"); Text("—"); Text("Folder") }
      }
    }
  }
  .inactive()
  .frame(width: 330, height: 150)
  .position(x: 360, y: 312)

  FinderWindow("System.Disk") {
    InfoBar("6 items", "1,218K available")
    ScrollArea {
      Grid(columns: 4, spacing: 8) {
        Folder("System")
        Folder("Letters").selected()
        Folder("Icons")
        ApplicationIcon("Finder")
        ApplicationIcon("Scribe.GS")
        DocumentIcon("ReadMe")
      }
    }
  }
  .frame(width: 380, height: 190)
  .position(x: 230, y: 140)

  HardDisk("System.Disk").position(x: 590, y: 50)
  Disk("Utilities").position(x: 590, y: 115)
  TrashIcon().position(x: 590, y: 360)
}
```

## A document window

An invented word processor in one window drawn by the `window` chrome: the lined title bar comes from
the fence title, and `ScrollArea` draws the IIgs scroll bars with the grow box. Shown in both schemes.

```mockitdown pack="gsos" title="Lamp.Order" appearance="both" source="true"
VStack(spacing: 0) {
  HStack(spacing: 10) {
    PopupMenu(items: ["Shaston", "Courier", "Helvetica"], selection: "Courier")
    PopupMenu(items: ["8", "10", "12"], selection: "12")
    Spacer()
    Text("Page 1 of 2")
  }
  .padding(.horizontal, 8)
  .padding(.vertical, 4)
  Divider()
  ScrollArea {
    VStack(alignment: .leading, spacing: 10) {
      Text("**To:** Harbour Supply Co., Pier 4")
      Text("Please send four (4) brass lamp gaskets, part 22-B, and one tin of gallery-deck enamel, grey. Charge to the North Jetty account.")
      Text("The October lamp readings follow on the next page. The fog signal was tested on the 12th and the 26th and ran to time.")
      Text("— J. Keeper")
    }
    .padding(8)
  }
}
.frame(maxWidth: .infinity, maxHeight: .infinity)
```

## A dialog with every control

A modal dialog drawn in place with the double frame: pop-up menus with their titles and drop shadows,
a LineEdit with the insertion point, radio buttons, check boxes (checked ones show an X), a list,
the thermometer and the button row with the default button's bold outline.

```mockitdown pack="gsos" device="fit" title="Print dialog" appearance="both" source="true"
ModalDialog {
  Text("**ImageWriter II**")
  HStack(alignment: .top, spacing: 24) {
    VStack(alignment: .leading, spacing: 8) {
      PopupMenu("Quality:", items: ["Draft", "Better", "Best"], selection: "Better")
      LineEdit(label: "Copies:", text: "2").state(.focused).frame(width: 130)
      RadioGroup("Pages:", items: ["All", "From 1 to 2"], selection: "All")
    }
    VStack(alignment: .leading, spacing: 6) {
      CheckBox("Color ribbon", checked: true)
      CheckBox("Fast mode")
      CheckBox("Tall adjusted", checked: true)
      CheckBox("Envelopes").disabled()
    }
  }
  Frame("Paper") {
    ListControl {
      ListItem("US Letter")
      ListItem("US Legal").selected()
      ListItem("Computer Paper")
    }
    .frame(height: 70)
  }
  ProgressBar("Spooling page 1…", value: 0.4)
  HStack(spacing: 12) {
    Spacer()
    Button("Cancel")
    DefaultButton("Print")
  }
}
.frame(width: 440)
```

## An alert

Ejecting a disk with an open document: the Caution alert with the double frame, *Don't Save* apart at
the left and *Save* as the default.

```mockitdown pack="gsos" device="screen" title="Save alert"
import "gsos/components"

Desktop {
  FinderMenuBar {
    MenuTitle("File")
    MenuTitle("Edit")
    MenuTitle("Font")
    MenuTitle("Style")
  }
  Window("Lamp.Order") {
    ScrollArea {
      Text("Please send four (4) brass lamp gaskets, part 22-B, and one tin of gallery-deck enamel.").padding(8)
    }
  }
  .inactive()
  .frame(width: 460, height: 260)
  .position(x: 270, y: 180)
  HardDisk("System.Disk").position(x: 590, y: 50)
  TrashIcon().position(x: 590, y: 360)
}

Alert("Save changes to “Lamp.Order” before ejecting the disk?",
      buttons: ["Don't Save", "Cancel", "Save"], primary: "Save")
```

## The Control Panel

The Control Panel new desk accessory: the list of control panel devices (CDevs) at the left built
from the `CDevRow` component, the selected *General* CDev at the right with `CDevChoice` rows, and a
stop alert about to be dismissed.

```mockitdown pack="gsos" device="screen" title="Control Panel"
import "gsos/components"

Desktop {
  FinderMenuBar {
    MenuTitle("File")
    MenuTitle("Edit")
    MenuTitle("View")
    MenuTitle("Special")
  }
  ControlPanel {
    HStack(alignment: .top, spacing: 12) {
      ListControl {
        CDevRow(name: "General", icon: "gear", selected: true)
        CDevRow(name: "Sound", icon: "speaker")
        CDevRow(name: "Time", icon: "clock")
        CDevRow(name: "Mouse", icon: "app")
        CDevRow(name: "Keyboard", icon: "app")
        CDevRow(name: "Printer", icon: "printer")
        CDevRow(name: "RAM", icon: "cube")
        CDevRow(name: "Slots", icon: "square.grid.2x2")
      }
      .frame(width: 140, height: 200)
      VStack(alignment: .leading, spacing: 8) {
        Text("**General**")
        CDevChoice(label: "Display:", items: ["Color", "Monochrome"], selection: "Color")
        CDevChoice(label: "Text size:", items: ["40 columns", "80 columns"], selection: "80 columns")
        CDevChoice(label: "System speed:", items: ["Normal", "Fast"], selection: "Fast")
        Slider("Repeat speed:", value: 0.6)
        CheckBox("Beep on error", checked: true)
        CheckBox("Show clock in menu bar")
      }
      .frame(width: 250)
    }
  }
  .frame(width: 440, height: 270)
  .position(x: 300, y: 190)
}
```

## Anatomy of a GS/OS window

A Finder window, annotated: the close box (#1), the lined title bar with the window name (#2), the zoom
box (#3), the info bar (#4), a selected icon shown inverted (#5), the dithered scroll-bar track with an
arrow box at each end (#6) and the grow box (#7).

```mockitdown pack="gsos" device="fit" title="Annotated Finder window"
FinderWindow("System.Disk") {
  InfoBar("5 items", "1,218K available").callout(4, alignment: .leading)
  ScrollArea {
    HStack(spacing: 8, alignment: .top) {
      Folder("System")
      Folder("Letters").selected().callout(5, alignment: .topTrailing)
      Folder("Icons")
      ApplicationIcon("Finder")
      DocumentIcon("ReadMe")
    }
  }
  .callout(6, alignment: .trailing)
  .callout(7, alignment: .bottomTrailing)
}
.frame(width: 500, height: 220)
.callout(1, alignment: .topLeading)
.callout(2, alignment: .top)
.callout(3, alignment: .topTrailing)
```
