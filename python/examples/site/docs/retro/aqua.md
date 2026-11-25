# Mac OS X Aqua (2001)

The **aqua** pack imitates the first **Aqua** interface of **Mac OS X 10.0 Cheetah to 10.2 Jaguar**
(2001–2002), as Cocoa and Carbon applications drew it. Everything is made of *gel*: the clear
lozenge push buttons with their bright upper highlight, the blue gel default button that slowly
pulses, blue gel check boxes, radio buttons and scroll thumbs, pop-up buttons with a blue cap holding
the double arrows, and the red, yellow and green gel window buttons at the left of every title bar.
Window bodies are fine horizontal pinstripes; some applications use **brushed metal** instead. Menus
are translucent white with a blue gel highlight, sheets slide down from a window's title bar instead
of floating free, drawers slide out of a window's side, tab views are gel segments centred on the top
edge of a sunken box, and progress bars are blue gel with moving barber stripes. Type is Lucida Grande
13 pt. The system menu is drawn as a neutral blue gel bead; every application, person and document is
invented.

Select it with `import Aqua` (also `MacOSX`, `Cheetah`, `Jaguar`) or `pack="aqua"` on the fence. The
default device is a 720 × 500 document window drawn by the `window` chrome; `device="screen"` (1024 ×
768) gives a whole `Desktop`. The main elements use the Cocoa names: `Window` / `MetalWindow` /
`Panel`, `Sheet`, `Drawer`, `Alert`, `Toolbar` and `ToolbarButton`, `Button` / `DefaultButton` /
`BevelButton` / `RoundButton` / `HelpButton`, `PopUpButton`, `PullDownButton`, `ComboBox`, `CheckBox`,
`RadioButton` / `Matrix`, `TextField`, `SecureTextField`, `SearchField`, `Stepper`, `Slider`,
`ProgressIndicator`, `Spinner`, `TabView` / `TabViewItem`, `SegmentedControl`, `Box`, `ScrollView`,
`TableView`, `OutlineView`, `Browser` / `BrowserColumn` / `BrowserCell`, the desktop's `MenuBar`,
`SystemMenu`, `AppMenu`, `MenuTitle`, `MenuExtra`, `FolderIcon` / `DiskIcon` / `DocumentIcon`,
`PreferenceIcon`, and the `Dock` with `DockItem` and `DockSeparator`. `.inactive()` greys a window's
buttons, `.running()` marks a Dock application.

Aqua had no dark mode, but it had a second appearance: **Graphite**, which turned every blue and the
three window buttons slate grey for people who found the colour distracting. `appearance: dark`
uses a deepened Graphite: the same gel, darker pinstripes and surfaces.

## The Finder in column view

The desktop of 10.2: the translucent menu bar, a Finder window in column view with the 10.1 toolbar
(Back, the three view segments and the standard places), the hard disk and a folder on the blue
desktop, and the Dock along the bottom edge. The menu bar, toolbar and Dock are the `AquaMenuBar`,
`FinderToolbar` and `StandardDock` components from `docs/mockups/aqua/components.mockitdown`.

```mockitdown pack="aqua" device="screen" title="Finder"
import "aqua/components"

Desktop {
  AquaMenuBar {
    MenuTitle("File")
    MenuTitle("Edit")
    MenuTitle("View", open: true) {
      MenuItem("as Icons", shortcut: "⌘1")
      MenuItem("as List", shortcut: "⌘2")
      MenuItem("as Columns", shortcut: "⌘3", checked: true).highlighted()
      Divider()
      MenuItem("Clean Up").disabled()
      MenuItem("Arrange by Name").disabled()
      Divider()
      MenuItem("Hide Toolbar", shortcut: "⌥⌘T")
      MenuItem("Customize Toolbar…")
      MenuItem("Show Status Bar")
      Divider()
      MenuItem("Show View Options", shortcut: "⌘J")
    }
    MenuTitle("Go")
    MenuTitle("Window")
    MenuTitle("Help")
  }

  Window("Projects") {
    FinderToolbar(view: 2, place: "Home")
    InfoBar("4 items", "2.4 GB available")
    ScrollView(variant: .both) {
      Browser {
        BrowserColumn {
          BrowserCell("Desktop")
          BrowserCell("Documents").selected()
          BrowserCell("Library")
          BrowserCell("Movies")
          BrowserCell("Music")
          BrowserCell("Pictures")
          BrowserCell("Public")
          BrowserCell("Sites")
        }
        BrowserColumn {
          BrowserCell("Correspondence")
          BrowserCell("Lighthouse Survey").selected()
          BrowserCell("Recipes")
          FileCell("Packing list.rtf")
        }
        BrowserColumn {
          FileCell("Gallery deck.tiff")
          FileCell("Lamp readings.txt").selected()
          FileCell("Survey notes.rtf")
          BrowserCell("Photos")
        }
      }
    }
  }
  .frame(width: 640, height: 400)
  .position(x: 420, y: 300)

  DiskIcon("Macintosh HD").position(x: 960, y: 70)
  DiskIcon("Backup").position(x: 960, y: 160)
  FolderIcon("Field Work").selected().position(x: 960, y: 250)
  DocumentIcon("Read Me").position(x: 960, y: 340)

  StandardDock().position(x: 512, y: 735)
}
```

## A document window with a sheet

Saving a new document: the sheet slides down from under the title bar of the window it belongs to,
so it is modal for that document only, and nothing is dimmed. The *Save* button is the pulsing blue
default button. Shown in both appearances (Aqua Blue and the deepened Graphite).

```mockitdown pack="aqua" title="Untitled" appearance="both" source="true"
ScrollView {
  VStack(alignment: .leading, spacing: 10) {
    Text("**North Jetty — survey notes**").font(.title3)
    Text("Fog lifted at seven. The lamp was relit twice in the night after the fuse panel tripped again; the spare fuses are in the second drawer of the chart table.")
    Text("High tide 7:12 AM (5.8 ft), low 1:30 PM. Wind NNW 12 knots, backing west by afternoon.")
    Text("To do: order lamp gaskets, repaint the gallery handrail, send the October readings to the harbour office.")
  }
  .padding(16)
}
.frame(maxWidth: .infinity, maxHeight: .infinity)

Sheet(buttons: ["Cancel", "Save"], primary: "Save") {
  VStack(alignment: .leading, spacing: 12) {
    HStack(spacing: 8) {
      Text("Save as:")
      TextField(text: "Survey notes").state(.focused).frame(width: 240)
    }
    HStack(spacing: 8) {
      Text("Where:")
      PopUpButton(items: ["Documents", "Desktop", "Home"], selection: "Documents").frame(width: 200)
      HelpButton()
    }
    CheckBox("Hide extension")
  }
  .padding(.leading, 30)
}
```

## System Preferences

An invented *Appearance* pane under the toolbar of favourite panes. The pane uses a `TabView` (gel
segments straddling the sunken box), pop-up buttons, a radio matrix, check boxes and a slider with
tick marks; the *Show All* view would list `PreferenceIcon`s in `PrefRow`s.

```mockitdown pack="aqua" title="Appearance" appearance="both" width="660" height="520"
import "aqua/components"

VStack(spacing: 0) {
  Toolbar {
    PreferenceIcon("Show All", icon: "square.grid.3x3", color: .gray)
    Separator()
    PreferenceIcon("Displays", icon: "app", color: .blue)
    PreferenceIcon("Sound", icon: "speaker", color: .indigo)
    PreferenceIcon("Network", icon: "globe", color: .teal)
    PreferenceIcon("Startup Disk", icon: "archivebox", color: .gray)
    Spacer()
  }
  VStack(alignment: .leading, spacing: 12) {
    TabView(selection: "Look") {
      TabViewItem("Look") {
        HStack(spacing: 8) {
          PopUpButton("Appearance:", items: ["Blue", "Graphite"], selection: "Blue").frame(width: 260)
        }
        Text("For the overall look of buttons, menus and windows").font(.footnote).foregroundStyle(.secondary)
        HStack(spacing: 8) {
          PopUpButton("Highlight Color:", items: ["Blue", "Gold", "Graphite", "Green", "Purple"], selection: "Blue").frame(width: 260)
        }
        Separator()
        Matrix("Place scroll arrows:", items: ["Together", "At top and bottom"], selection: "Together")
        Separator()
        CheckBox("Use smooth scrolling", checked: true)
        CheckBox("Minimize when double clicking a window title bar")
        Slider("Number of recent items:", value: 0.4, ticks: 4, minLabel: "None", maxLabel: "50").frame(width: 300)
      }
      TabViewItem("Fonts")
      TabViewItem("Text Smoothing")
    }
    .frame(maxWidth: .infinity)
    HStack {
      HelpButton()
      Spacer()
      Button("Revert")
      DefaultButton("Apply")
    }
  }
  .padding(16)
}
.frame(maxWidth: .infinity, maxHeight: .infinity)
```

## A brushed-metal jukebox

Brushed metal was the look of the digital-media applications: no pinstripes, the window texture
runs right into the title bar, the transport buttons are round metal gel, and the status of the
current track sits in the rounded LCD display. The track list uses `TrackRow`, a custom component;
its table alternates white and pale blue rows.

```mockitdown pack="aqua" device="fit" title="Jukebox"
import "aqua/components"

MetalWindow("Jukebox") {
  HStack(spacing: 10) {
    RoundButton(icon: "backward")
    RoundButton(icon: "pause").size(.large)
    RoundButton(icon: "forward")
    Slider(value: 0.6).frame(width: 90)
    Spacer()
    StatusDisplay("Harbour Lights", subtitle: "The Breakwater Quartet") {
      ProgressIndicator(value: 0.42)
      HStack { Text("1:58"); Spacer(); Text("-2:41") }
    }
    .frame(width: 260)
    Spacer()
    SearchField("Search").frame(width: 130)
  }
  HStack(alignment: .top, spacing: 10) {
    ListView {
      ListItem("Library", icon: "music.note")
      ListItem("Radio Tuner", icon: "globe")
      ListItem("Audio CD", icon: "circle")
      ListItem("Evening Watch", icon: "list.bullet").selected()
      ListItem("Long Drive", icon: "list.bullet")
      ListItem("Sea Shanties", icon: "list.bullet")
    }
    .frame(width: 150, maxHeight: .infinity)
    TableView(columns: ["Song", "Time", "Artist", "Album"], sortColumn: 2, variant: .alternating) {
      TrackRow(title: "Low Tide Waltz", time: "3:12", artist: "The Breakwater Quartet", album: "Night Ferry")
      TrackRow(title: "Harbour Lights", time: "4:39", artist: "The Breakwater Quartet", album: "Night Ferry", playing: true)
      TrackRow(title: "Foghorn Blues", time: "5:02", artist: "Mira Castellan", album: "Grey Morning")
      TrackRow(title: "Salt on the Window", time: "3:47", artist: "Mira Castellan", album: "Grey Morning")
      TrackRow(title: "The Keeper's Daughter", time: "4:15", artist: "Ollie Stroud", album: "Coastline")
      TrackRow(title: "North Jetty", time: "2:58", artist: "Ollie Stroud", album: "Coastline")
      TrackRow(title: "Signal Fires", time: "6:20", artist: "Wren & Tamsin", album: "Lantern Songs")
      TrackRow(title: "Last Boat Home", time: "3:33", artist: "Wren & Tamsin", album: "Lantern Songs")
    }
    .frame(maxWidth: .infinity, maxHeight: .infinity)
  }
  .frame(maxHeight: .infinity)
  HStack(spacing: 8) {
    Button(icon: "plus").variant(.round)
    Button(icon: "arrow.clockwise").variant(.round)
    Spacer()
    Text("8 songs, 33.6 minutes, 42.1 MB").font(.footnote)
    Spacer()
    Button(icon: "square.and.arrow.up").variant(.round)
  }
}
.frame(width: 760, height: 400)
```

## Mail with the mailboxes drawer

A three-pane mail reader in the manner of the first Mail: the toolbar, the message list (blue dots
for unread messages, the sorted *Date Received* column header in blue gel), the message below, and
the *Mailboxes* drawer slid out of the window's right side. The message rows are `MessageRow`
components.

```mockitdown pack="aqua" device="fit" title="Mail" source="true"
import "aqua/components"

HStack(spacing: 0) {
  Window("In (2 messages unread)") {
    Toolbar {
      ToolbarButton("Delete", icon: "trash")
      ToolbarButton("Reply", icon: "arrowshape.turn.up.left")
      ToolbarButton("Forward", icon: "forward")
      ToolbarButton("Compose", icon: "square.and.pencil")
      ToolbarButton("Mailbox", icon: "tray").selected()
      Spacer()
      SearchField("Search").frame(width: 140)
    }
    TableView(columns: ["●", "From", "Subject", "Date Received"], sortColumn: 3, variant: .alternating) {
      MessageRow(from: "Harbour Office", subject: "October readings — due Friday", date: "Today 8:02 AM", unread: true)
      MessageRow(from: "Mira Castellan", subject: "Lamp gaskets are on the way", date: "Today 7:41 AM", unread: true, selected: true)
      MessageRow(from: "Ollie Stroud", subject: "Re: gallery handrail paint", date: "Yesterday", unread: false)
      MessageRow(from: "Tide Tables Weekly", subject: "Spring tides next week", date: "Mon 11/16/26", unread: false)
      MessageRow(from: "Wren Tamsin", subject: "Photos from the survey", date: "Sun 11/15/26", unread: false)
    }
    .frame(height: 140)
    ScrollView {
      VStack(alignment: .leading, spacing: 6) {
        Text("**From:** Mira Castellan").font(.footnote)
        Text("**Subject:** Lamp gaskets are on the way").font(.footnote)
        Text("**Date:** Tue, 24 Nov 2026 07:41").font(.footnote)
        Separator()
        Text("Hi Ollie — the brass gaskets shipped this morning, four in the pack. They should reach the jetty by Thursday's boat. I put the spare fuses in the same box.")
        Text("Mira")
      }
      .padding(12)
    }
    .frame(maxHeight: .infinity)
  }
  .frame(width: 600, height: 440)

  Drawer("Mailboxes") {
    OutlineView {
      OutlineItem("In", icon: "tray", badge: 2).selected()
      OutlineItem("Out", icon: "paperplane")
      OutlineItem("Drafts", icon: "doc")
      OutlineItem("Sent", icon: "paperplane")
      OutlineItem("Trash", icon: "trash")
      OutlineItem("Survey", icon: "folder", expanded: true) {
        OutlineItem("Readings", icon: "folder")
        OutlineItem("Suppliers", icon: "folder")
      }
    }
  }
  .frame(width: 170)
}
```

## Every control

A movable *Print* panel showing the Aqua controls together: pop-up and pull-down buttons, a combo
box, a text field with the focus ring, the stepper, radio buttons and check boxes (with the mixed
state), the segmented control, the barber-pole progress bar and the spinner, the round help button and
the pulsing default button.

```mockitdown pack="aqua" title="Print" appearance="both" source="true" width="600" height="440"
VStack(alignment: .leading, spacing: 12) {
  HStack(spacing: 10) {
    PopUpButton("Printer:", items: ["Lighthouse LaserWriter", "Inkjet 480"], selection: "Lighthouse LaserWriter").frame(width: 300)
    Spacer()
    PullDownButton("Presets")
  }
  Separator()
  HStack(alignment: .top, spacing: 24) {
    Box("Copies & Pages") {
      HStack(spacing: 6) {
        TextField(label: "Copies:", text: "2").state(.focused).frame(width: 110)
        Stepper()
      }
      Matrix("Pages:", items: ["All", "From 3 to 7"], selection: "All")
      ComboBox("Paper:", items: ["US Letter", "A4"], selection: "US Letter").frame(width: 190)
    }
    Box("Options") {
      CheckBox("Collated", checked: true)
      CheckBox("Reverse page order")
      CheckBox("Fractional widths", checked: .mixed)
      CheckBox("Cover page").disabled()
      SegmentedControl("Layout:", items: ["1-up", "2-up", "4-up"], selection: 0)
    }
  }
  ProgressIndicator("Preparing pages…", value: 0.55)
  HStack(spacing: 8) {
    ProgressIndicator().frame(width: 220)
    Spinner()
  }
  Spacer()
  HStack(spacing: 12) {
    HelpButton()
    Button("Preview")
    Button("Save As PDF…")
    Spacer()
    Button("Cancel")
    DefaultButton("Print")
  }
}
.padding(18)
.frame(maxWidth: .infinity, maxHeight: .infinity)
```

## An alert on the desktop

An application-modal alert: the application's icon at the left, the bold message, the smaller
informative text, and the buttons at the right with the pulsing default button; *Don't Save* stands
apart at the left. Around it, an inactive Terminal (black on white, as it shipped), a Stickies note and
an inactive document window with greyed window buttons.

```mockitdown pack="aqua" device="screen" title="Alert"
import "aqua/components"

Desktop {
  AquaMenuBar(app: "Scribe") {
    MenuTitle("File")
    MenuTitle("Edit")
    MenuTitle("Format")
    MenuTitle("Window")
    MenuTitle("Help")
  }
  Window("Survey notes.rtf") {
    ScrollView {
      VStack(alignment: .leading, spacing: 10) {
        Text("**North Jetty — survey notes**").font(.title3)
        Text("Fog lifted at seven. The lamp was relit twice in the night after the fuse panel tripped again.")
        Text("High tide 7:12 AM (5.8 ft), low 1:30 PM. Wind NNW 12 knots.")
      }
      .padding(16)
    }
  }
  .inactive()
  .frame(width: 560, height: 420)
  .position(x: 380, y: 300)

  Terminal(code: "Last login: Tue Nov 24 08:02:17 on ttyp1\nWelcome to Darwin!\n[harbour:~] keeper% ls Documents\nCorrespondence      Lighthouse Survey   Recipes\n[harbour:~] keeper% ", title: "Terminal — tcsh (ttyp1)")
    .frame(width: 380, height: 150)
    .position(x: 800, y: 560)

  StickyNote("Call the harbour office before Friday about the October readings.").frame(width: 170).position(x: 900, y: 150)

  DiskIcon("Macintosh HD").position(x: 970, y: 300)

  Alert("Do you want to save changes to this document before closing?",
        message: "If you don't save, your changes will be lost.",
        icon: "doc",
        buttons: ["Don't Save", "Cancel", "Save"], primary: "Save")
}
```

## Anatomy of the Dock

The Dock close up, with the pointer over *Mail*: its name appears above it (#1); running applications such as *Finder* and *Jukebox* carry the small black triangle (#2); the separator (#3) divides applications from
documents, folders and the Trash (#4). The icons are `DockItem`s coloured with `color:`.

```mockitdown pack="aqua" device="fit" title="Dock"
import "aqua/components"

Desktop {
  Dock {
    DockApp(name: "Finder", icon: "app", color: .blue, running: true).callout(2, alignment: .bottomLeading)
    DockApp(name: "Mail", icon: "envelope", color: .cyan, hover: true).callout(1, alignment: .topLeading)
    DockApp(name: "Web Browser", icon: "globe", color: .teal)
    DockApp(name: "Jukebox", icon: "music.note", color: .purple, running: true)
    DockApp(name: "Photo Album", icon: "photo", color: .orange)
    DockApp(name: "System Preferences", icon: "gear", color: .gray)
    DockSeparator().callout(3, alignment: .top)
    DockApp(name: "Documents", icon: "folder", color: .indigo)
    DockApp(name: "Trash", icon: "trash", color: .gray).callout(4, alignment: .top)
  }
  .position(x: 340, y: 150)
}
.frame(width: 680, height: 190)
```
