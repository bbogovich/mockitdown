# Beyond the framework kits

Real applications are full of components no UI kit ships: spreadsheets, boards, editors, chat
threads, schedules. mockitdown has them in its core vocabulary, so they work in every pack and take
that pack's colours, type and corner radii.

## Spreadsheet

`selection:` draws the selected range, `active:` the active cell, `formula:` the formula bar,
`highlight:` cell fills and `sheets:` the sheet tabs.

```mockitdown device="fit" title="Quarterly budget" source="true"
Spreadsheet(
  columns: ["Category", "Q1", "Q2", "Q3", "Q4", "Total"],
  rows: [["Salaries", 82000, 84500, 86000, 88000, "340,500"],
         ["Rent", 12000, 12000, 12000, 12000, "48,000"],
         ["Equipment", 4800, 2300, 9100, 1500, "17,700"],
         ["Travel", 3100, 4200, 2900, 6100, "16,300"],
         ["Total", "101,900", "103,000", "110,000", "107,600", "422,500"]],
  selection: "B3:E5", active: "F3", formula: "=SUM(B3:E3)",
  highlight: ["F6": .yellow], sheets: ["Budget", "Headcount", "Notes"], rowCount: 9)
.frame(width: 640, height: 330)
```

## Sticky notes and kanban boards

```mockitdown device="fit" title="Sprint board" source="true" pack="shadcn"
Board {
  BoardColumn("To do", color: .gray) {
    KanbanCard("Offline sync for call sheets", tags: ["Mobile", "Sync"], assignees: ["Ana Lima"], due: "Nov 28", priority: "high")
    KanbanCard("Weather alerts", description: "Push when rain is forecast for a shoot day", tags: ["Feature"], comments: 3)
  }
  BoardColumn("In progress", color: .blue) {
    KanbanCard("Location map export", image: "assets/images/map.svg", tags: ["Web"], assignees: ["Ben Okafor", "Chen Wu"], attachments: 2)
  }
  BoardColumn("Done", color: .green) {
    KanbanCard("Crew contact import", tags: ["Data"], assignees: ["Dana Kim"])
    StickyNote("Demo on Friday!", color: .yellow, rotation: -2)
  }
}
.frame(width: 860, height: 420)
```

## Code editors and terminals

```mockitdown device="fit" title="Editor and terminal" source="true"
VStack(spacing: 12) {
  CodeEditor("""
  import SwiftUI

  struct CallSheetView: View {
    // The day's schedule, newest first
    let scenes: [Scene]
    var body: some View {
      List(scenes) { scene in Text(scene.title) }
    }
  }
  """, language: "swift", highlight: [6], tabs: ["CallSheetView.swift", "Scene.swift"])
  Terminal("""
  $ swift build
  Building for debugging...
  [12/12] Linking CallSheet
  Build complete! (4.21s)
  $ swift test --filter SyncTests
  """)
}
.frame(width: 560)
```

## Chat and comments

```mockitdown pack="swiftui" device="phone" title="Messages" source="true"
NavigationStack {
  VStack(spacing: 10) {
    MessageBubble("Are we still shooting the market scene tomorrow?", from: .them, time: "9:38")
    MessageBubble("Yes — call time 6:30, weather looks clear 🌤", from: .me, time: "9:40", status: "Read")
    MessageBubble("Here's the location", from: .them, image: "assets/images/photo-6.svg", reactions: ["👍 2"])
    MessageBubble("Perfect, see you there", from: .me)
    Spacer()
    TextField("iMessage", text: "").textFieldStyle(.roundedBorder)
  }
  .padding()
  .navigationTitle("Chen Wu")
  .navigationBarTitleDisplayMode(.inline)
}
```

## Trees, timelines, Gantt charts and schedules

```mockitdown device="fit" title="Project overview" source="true"
HStack(alignment: .top, spacing: 16) {
  Tree {
    TreeItem("CallSheet", folder: true) {
      TreeItem("Sources", folder: true) {
        TreeItem("App.swift", systemImage: "doc")
        TreeItem("SyncEngine.swift", systemImage: "doc").selected()
      }
      TreeItem("Tests", folder: true, expanded: false, hasChildren: true)
      TreeItem("README.md", systemImage: "doc", detail: "2 KB")
    }
  }
  .frame(width: 220)
  Timeline {
    TimelineItem("Order placed", time: "Nov 20, 09:12", status: .done, systemImage: "checkmark")
    TimelineItem("Packed", time: "Nov 21, 14:30", status: .done, systemImage: "cube")
    TimelineItem("In transit", time: "Nov 22", description: "Arrives Thursday", systemImage: "truck")
    TimelineItem("Delivered", status: .pending)
  }
  .frame(width: 260)
}
.padding()
```

```mockitdown device="fit" title="Release plan" source="true"
Gantt(scale: ["W45", "W46", "W47", "W48", "W49", "W50", "W51", "W52"],
      tasks: [("Research", 0, 2, 1.0), ("Design", 1, 3, 0.8), ("Build sync engine", 2, 4, 0.4),
              ("Beta", 5, 2, 0), ("Launch", 7, 0)], today: 3.4)
.frame(width: 680)
```

```mockitdown device="fit" title="Shooting schedule" source="true"
Schedule(days: ["Mon 23", "Tue 24", "Wed 25", "Thu 26", "Fri 27"], startHour: 6, endHour: 15, today: "Tue 24",
         events: [("Market scene", "Mon 23", 6.5, 10, .orange), ("Lunch", "Mon 23", 12, 13, .gray),
                  ("Rooftop", "Tue 24", 7, 11.5, .blue), ("Interviews", "Wed 25", 9, 12, .purple),
                  ("Night prep", "Thu 26", 13, 15, .teal), ("Pickups", "Fri 27", 8, 10, .green)],
         now: 9.25)
.frame(width: 680, height: 380)
```

## Media, maps, stats and placeholders

```mockitdown device="fit" title="Dashboard odds and ends" source="true"
VStack(spacing: 14) {
  HStack(spacing: 12) {
    Stat("Crew on set", "42", change: "+6", trend: [30, 32, 35, 33, 38, 40, 42], systemImage: "person.2")
    Stat("Budget used", "68%", change: "-3%", caption: "vs. plan", systemImage: "chart.pie")
    Stat("Shoot days left", "9", systemImage: "calendar")
  }
  HStack(spacing: 12) {
    VideoPlayer(image: "assets/images/photo-1.svg", progress: 0.35, time: "1:12", duration: "3:28")
    Map(pins: [(30, 40, "Base camp"), (68, 62, "Market")], route: true, showsUserLocation: true, userX: 45, userY: 50)
  }
  HStack(spacing: 16) {
    Kbd(["⌘", "K"]); Kbd("Esc"); Kbd(["Ctrl", "Shift", "P"])
    ColorSwatches(colors: [.red, .orange, .yellow, .green, .blue, .purple], selection: 4)
    Skeleton(lines: 2, avatar: true).frame(width: 220)
  }
  EmptyState("No call sheets yet", systemImage: "doc", description: "Create one from a shooting schedule.") {
    Button("New call sheet").buttonStyle(.borderedProminent)
  }
}
.padding()
.frame(width: 760)
```
