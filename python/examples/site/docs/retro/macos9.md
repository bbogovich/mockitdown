# Mac OS 9 (Platinum)

The **macos9** pack imitates **Mac OS 8 and 9 with the Platinum appearance** (1997–2001), the look the
Appearance Manager gave the classic Mac OS from Mac OS 8.0 to 9.2.2. Everything is built from a few
light greys with bevelled white and grey edges and a black outline: the pinstriped title bar with the
close box at the left and the zoom and WindowShade boxes at the right, the grey window frame, the
rounded push buttons with the thick ring around the default button, popup menus with their double
arrow, square check boxes with a check mark, the Appearance control panel's tabs, disclosure
triangles, lavender scroll-bar thumbs with both arrows together at the bottom, the blue barber-pole
progress bar, yellow Balloon Help, the Finder's icon and list views and the Control Strip. Type uses
Charcoal (falling back to Chicago and Geneva) for the system font and Geneva for small text. The menu
bar shows a neutral six-colour glyph where the Apple menu was; all applications and documents are
invented.

Select it with `import MacOS9` (also `Platinum`, `MacOS8`) or `pack="macos9"` on the fence. The default
device is a 640 × 480 document window drawn by the `window` chrome; `device="screen"` (800 × 600) or
`device="screen-large"` (1024 × 768) gives the whole screen for a `Desktop` holding a `MenuBar`,
windows and icons placed with `.position(x:y:)`. The main elements are `MenuBar`, `AppleMenu`,
`MenuTitle`, `ApplicationMenu`, `Window` (`.document`, `.movableModal`, `.dialog`, `.utility`),
`Finder`, `InfoBar`, `FinderList`, `Folder` / `Disk` / `DocumentIcon` / `ApplicationIcon` /
`TrashIcon`, `Button` / `DefaultButton` / `BevelButton`, `PopupMenu`, `CheckBox`, `RadioButton`,
`TextField`, `LittleArrows`, `Slider`, `ProgressBar`, `Tabs`, `DisclosureTriangle`, `GroupBox`,
`ScrollArea`, `ListView`, `Alert` (`severity: .stop | .note | .caution`), `ControlPanel`,
`ControlStrip` and `Balloon`. `.inactive()` greys a window's title bar; there are no sheets in Mac OS 9,
so dialogs are application-modal and nothing is dimmed behind them.

Platinum had no dark mode. `appearance: dark` switches to a *dark platinum* scheme in the spirit of the
third-party Appearance themes of the time: charcoal surfaces, the same bevels and a deeper lavender.

## The Finder

The desktop with the File menu pulled down: the active *Macintosh HD* window in icon view, an
inactive *Documents* window in list view sorted by name, the disk and Trash icons along the right edge
and the Control Strip collapsed at the bottom left. The menu bar is the `MacMenuBar` component from
`docs/mockups/macos9/components.mockitdown`.

```mockitdown pack="macos9" device="screen" title="Finder"
import "macos9/components"

Desktop {
  MacMenuBar {
    MenuTitle("File", open: true) {
      MenuItem("New Folder", shortcut: "⌘N")
      MenuItem("Open", shortcut: "⌘O")
      MenuItem("Print", shortcut: "⌘P").disabled()
      MenuItem("Move To Trash", shortcut: "⌘⌫")
      MenuItem("Close Window", shortcut: "⌘W")
      Divider()
      MenuItem("Get Info", shortcut: "⌘I").highlighted()
      MenuItem("Label") { MenuItem("None") }
      MenuItem("Sharing…").disabled()
      MenuItem("Duplicate", shortcut: "⌘D")
      MenuItem("Make Alias", shortcut: "⌘M")
      MenuItem("Show Original", shortcut: "⌘R").disabled()
      MenuItem("Add To Favorites")
      Divider()
      MenuItem("Find…", shortcut: "⌘F")
      MenuItem("Search Internet…", shortcut: "⌘H")
      Divider()
      MenuItem("Page Setup…").disabled()
      MenuItem("Print Window…").disabled()
    }
    MenuTitle("Edit")
    MenuTitle("View")
    MenuTitle("Special")
    MenuTitle("Help")
  }

  Finder("Documents") {
    InfoBar("5 items", "1.2 GB available")
    ScrollArea {
      FinderList(columns: ["Name", "Date Modified", "Size", "Kind"], sortColumn: 0) {
        FinderRow(name: "Field Notes", date: "Today, 9:12 AM", size: "12K", kind: "Scribe document", icon: "doc")
        FinderRow(name: "Invoices", date: "Mon, Nov 23, 2026", kind: "folder")
        FinderRow(name: "Lighthouse.pict", date: "Fri, Nov 20, 2026", size: "184K", kind: "PICT file", icon: "photo")
        FinderRow(name: "Recipes", date: "Sat, Oct 3, 2026", kind: "folder")
        FinderRow(name: "Tide Tables 2027", date: "Wed, Sep 9, 2026", size: "36K", kind: "Ledger spreadsheet", icon: "doc")
      }
    }
  }
  .inactive()
  .frame(width: 460, height: 200)
  .position(x: 400, y: 468)

  Finder("Macintosh HD") {
    InfoBar("7 items", "1.2 GB available")
    ScrollArea {
      Grid(columns: 4, spacing: 14) {
        Folder("Applications")
        Folder("Documents").selected()
        Folder("System Folder")
        Folder("Internet")
        DocumentIcon("Read Me")
        ApplicationIcon("Scribe 2.1")
        Folder("Utilities")
      }
      .padding(8)
    }
  }
  .frame(width: 420, height: 260)
  .position(x: 380, y: 212)

  Disk("Macintosh HD").position(x: 750, y: 52)
  Disk("Backup Zip").position(x: 750, y: 120)
  TrashIcon().position(x: 750, y: 548)
  StandardControlStrip().position(x: 82, y: 584)
}
```

## A document window

A single application window drawn by the `window` chrome (the default device): the pinstriped title
bar comes from the fence title, the toolbar is made of `BevelButton`s and `PopupMenu`s, and
`ScrollArea` draws the Platinum scroll bars with the grow box between them. Shown in both schemes.

```mockitdown pack="macos9" title="Field Notes" appearance="both" source="true"
VStack(spacing: 0) {
  Toolbar {
    BevelButton(icon: "doc")
    BevelButton(icon: "folder")
    BevelButton(icon: "arrow.down.to.line")
    BevelButton(icon: "printer")
    Divider()
    PopupMenu(items: ["Geneva", "Charcoal", "Palatino"], selection: "Palatino").frame(width: 110)
    PopupMenu(items: ["10", "12", "14"], selection: "12").frame(width: 60)
    BevelButton("B").selected()
    BevelButton("I")
    BevelButton("U")
    Spacer()
    BevelButton(icon: "magnifyingglass")
  }
  ScrollArea {
    VStack(alignment: .leading, spacing: 10) {
      Text("**Field Notes — North Jetty**").font(.title3)
      Text("Tuesday, 6:40 AM. Fog lifting by seven. The keeper's log says the lamp was relit twice in the night after the fuse panel tripped again; the spare fuses are in the second drawer of the chart table.")
      Text("High tide 7:12 AM (5.8 ft), low 1:30 PM. Wind NNW 12 knots, backing west by afternoon. Two fishing boats out past the bar at first light, one returned with a fouled prop.")
      Text("To do: order lamp gaskets, re-paint the handrail on the gallery deck, send the October readings to the harbour office before Friday.")
    }
    .padding(12)
  }
}
.frame(maxWidth: .infinity, maxHeight: .infinity)
```

## A dialog with every control

A movable modal dialog drawn in place: popup menus with their labels, an edit-text field with the
focus ring, little arrows, radio buttons, check boxes (including the mixed state), a slider with tick
marks, an open disclosure triangle, the barber pole and the button row with the default button.

```mockitdown pack="macos9" device="fit" title="Print dialog" appearance="both" source="true"
MovableModalDialog("Print") {
  HStack(spacing: 16) {
    PopupMenu("Printer:", items: ["LaserBeam 600", "Inkwell Color"], selection: "LaserBeam 600")
    Spacer()
    Text("8.6.1").font(.footnote)
  }
  Separator()
  HStack(alignment: .top, spacing: 24) {
    VStack(alignment: .leading, spacing: 10) {
      HStack(spacing: 6) {
        TextField(label: "Copies:", text: "2").state(.focused).frame(width: 110)
        LittleArrows()
      }
      RadioGroup("Pages:", items: ["All", "From 3 to 7"], selection: "From 3 to 7")
      PopupMenu("Paper Source:", items: ["Auto Select", "Manual Feed"], selection: "Auto Select")
    }
    VStack(alignment: .leading, spacing: 6) {
      CheckBox("Collate copies", checked: true)
      CheckBox("Print in reverse order")
      CheckBox("Fractional widths", checked: .mixed)
      CheckBox("Cover page").disabled()
      Slider("Darkness:", value: 0.6, ticks: 4).frame(width: 180)
    }
  }
  DisclosureTriangle("Advanced options", expanded: true) {
    HStack(spacing: 16) {
      PopupMenu("Resolution:", items: ["300 dpi", "600 dpi"], selection: "600 dpi")
      CheckBox("Smooth graphics", checked: true)
    }
  }
  ProgressBar("Preparing fonts…")
  HStack(spacing: 12) {
    Button("Save Settings")
    Spacer()
    Button("Cancel")
    DefaultButton("Print")
  }
}
.frame(width: 470)
```

## An alert

Closing a document with unsaved changes. The alert is application-modal and centred, with the
Caution icon, the bold message and the smaller explanation; *Don't Save* sits apart at the left and
*Save* is the default button. Nothing is dimmed behind it.

```mockitdown pack="macos9" device="screen" title="Save changes alert"
import "macos9/components"

Desktop {
  MacMenuBar(app: "Scribe") {
    MenuTitle("File")
    MenuTitle("Edit")
    MenuTitle("Font")
    MenuTitle("Size")
    MenuTitle("Style")
    MenuTitle("Window")
  }
  Window("Field Notes") {
    ScrollArea {
      VStack(alignment: .leading, spacing: 10) {
        Text("**Field Notes — North Jetty**").font(.title3)
        Text("Tuesday, 6:40 AM. Fog lifting by seven. The keeper's log says the lamp was relit twice in the night after the fuse panel tripped again.")
        Text("High tide 7:12 AM (5.8 ft), low 1:30 PM. Wind NNW 12 knots.")
      }
      .padding(12)
    }
  }
  .inactive()
  .frame(width: 560, height: 420)
  .position(x: 330, y: 270)
  Disk("Macintosh HD").position(x: 750, y: 52)
  TrashIcon().position(x: 750, y: 548)
  StandardControlStrip().position(x: 82, y: 584)
}

Alert("Save changes to the document “Field Notes” before closing?",
      message: "If you don't save, your changes will be lost.",
      buttons: ["Don't Save", "Cancel", "Save"], primary: "Save")
```

## Control panels

Two invented control panels in the Platinum manner: *Desktop Look* with the tabs of the Appearance
control panel, and *Memory Settings* built from three `MemorySetting` components (a `GroupBox` with
On/Off radio buttons and little arrows). A floating *Color* palette and a Balloon Help balloon sit on
top.

```mockitdown pack="macos9" device="screen" title="Control panels"
import "macos9/components"

Desktop {
  MacMenuBar(app: "Desktop Look") {
    MenuTitle("File")
    MenuTitle("Edit")
    MenuTitle("Help")
  }
  ControlPanel("Memory Settings") {
    MemorySetting(title: "Disk Cache", on: true, label: "Cache Size:", value: "4096", note: "Default setting")
    MemorySetting(title: "Virtual Memory", on: false, label: "Hard disk:", value: "129", unit: "M", note: "Available on disk: 1.2 GB")
    MemorySetting(title: "RAM Disk", on: false, label: "Size:", value: "0", unit: "K")
    HStack {
      Text("v9.1").font(.footnote)
      Spacer()
      Button("Use Defaults")
    }
  }
  .inactive()
  .frame(width: 330, height: 330)
  .position(x: 610, y: 250)

  ControlPanel("Desktop Look") {
    Tabs(selection: "Appearance") {
      Tab("Themes")
      Tab("Appearance") {
        HStack(spacing: 10) {
          PopupMenu("Appearance:", items: ["Platinum", "Graphite"], selection: "Platinum")
        }
        GroupBox("Highlight Color") {
          HStack(spacing: 12) {
            PopupMenu(items: ["Lavender", "Gold", "Bondi", "Graphite"], selection: "Lavender")
            ListView { ListItem("Selected text").selected() }.frame(width: 120)
          }
        }
        GroupBox("Variation Color") {
          PopupMenu(items: ["Blue", "Purple", "Graphite"], selection: "Blue")
          ProgressBar(value: 0.55)
        }
      }
      Tab("Fonts")
      Tab("Desktop")
      Tab("Sound")
    }
    HStack(spacing: 10) {
      Spacer()
      Button("Revert")
      DefaultButton("Apply")
    }
  }
  .frame(width: 430, height: 380)
  .position(x: 245, y: 290)

  Balloon("Click Apply to use the selected appearance in the Finder and in every application.")
    .position(x: 388, y: 447)

  FloatingWindow("Color") {
    ColorSwatches(colors: [.red, .orange, .yellow, .green, .blue, .purple, .pink, .gray], selection: 4)
  }
  .frame(width: 100)
  .position(x: 560, y: 520)
}
```

## Anatomy of a Platinum window

An invented *Seeker* search window in the Sherlock mould, annotated: the search field (#1), the
channel bevel buttons (#2), the barber pole while searching (#3), the column header the results are
sorted by — the darker one — (#4), the lavender scroll thumb with both arrows together (#5) and the WindowShade box (#6),
which collapses the window to its title bar.

```mockitdown pack="macos9" device="fit" title="Seeker"
Window("Seeker") {
  VStack(alignment: .leading, spacing: 8) {
    HStack(spacing: 4) {
      BevelButton(icon: "globe").selected()
      BevelButton(icon: "archivebox")
      BevelButton(icon: "doc")
      BevelButton(icon: "person.2")
      BevelButton(icon: "cart")
    }
    .callout(2, "Channels", alignment: .trailing, labelSide: .trailing)
    HStack(spacing: 8) {
      SearchField(text: "lighthouse lamp gaskets").state(.focused).frame(width: 300).callout(1, alignment: .topLeading)
      DefaultButton(icon: "magnifyingglass")
    }
    ProgressBar("Searching 6 sites…").callout(3, alignment: .trailing)
  }
  .padding(10)
  .background(.background)
  ScrollArea(variant: .vertical) {
    FinderList(columns: ["Name", "Relevance", "Site"], sortColumn: 0, selectedRows: [1]) {
      TableRow { Label("Lamp gaskets, brass, 4-pack", systemImage: "doc"); Text("●●●●●"); Text("harbour-supply.example") }
      TableRow { Label("Fresnel lens care guide", systemImage: "doc"); Text("●●●●○"); Text("keepers.example") }
      TableRow { Label("Gallery deck handrail paint", systemImage: "doc"); Text("●●●○○"); Text("marine-coatings.example") }
      TableRow { Label("Fog signal timing tables", systemImage: "doc"); Text("●●○○○"); Text("tides.example") }
      TableRow { Label("Lamp room ventilation", systemImage: "doc"); Text("●○○○○"); Text("keepers.example") }
    }
    .callout(4, alignment: .topLeading)
  }
  .callout(5, alignment: .trailing)
}
.frame(width: 520, height: 330)
.callout(6, alignment: .topTrailing)
```
