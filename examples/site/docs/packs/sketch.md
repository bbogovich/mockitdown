# Sketch

The `sketch` pack draws the neutral core as a **hand-drawn wireframe** — the look of an early
concept on paper, before anyone argues about colours or pixels. Every box is a 2 px pencil
stroke with an irregular, slightly different border-radius per role, text uses a handwriting
stack (Comic Neue, Comic Sans MS, Chalkboard SE, Bradley Hand, Segoe Print, Marker Felt) a size
larger than usual, the palette is greyscale paper and pencil with **one blue highlighter** for
primary and selected things, images and photo avatars become boxes with a big pencil **X**,
`Skeleton` lines are squiggles, disabled controls and modal scrims are hatched, charts are
outlined in pencil greys, and sticky notes and callouts sit slightly askew. Device chrome is
sketched too: a pencil browser bar on the desktop and a double-outlined phone or tablet. Dark
appearance is a **chalkboard** — white chalk on green-black slate.

Select it with `import Sketch` (or `import HandDrawn`, `import Napkin`), or put `pack="sketch"` on a
fence: the pack adds almost no vocabulary of its own, so **any core mockup renders sketched
unchanged**. Several examples below are plain core code with only the fence attribute.

Its own helpers are few: `Scribble(lines:)` (squiggle lines for copy not yet written) and
`Squiggle`, `Lorem()` (filler copy), `CrossedImage("label")` (a crossed image box), `Highlight("…")`
(text swiped with the marker), `Annotation("…", variant: .left | .right | .up | .down)` (a
handwritten margin note with an arrow), `Note("…", title:)` (a taped paper note) and
`Arrow("label", variant: .right | .down …)` (a pencil arrow between steps of a flow).

The custom components used below (`SiteNav`, `FeatureCard`, `ThingRow`, `KpiBox`, `FlowStep`) live in
`mockups/sketch/blocks.mockitdown` and are imported with `import "sketch/blocks"`.

## Landing page

A first idea for a marketing page: navigation, a hero with a highlighted promise and a crossed
hero image, three `FeatureCard`s, and margin notes for the next discussion.

```mockitdown source="true" appearance="both" title="Landing page" url="https://napkin.example/" height="660"
import Sketch
import "sketch/blocks"

VStack(alignment: .stretch, spacing: 0) {
  SiteNav(brand: "Plantly")
  Divider()
  HStack(alignment: .center, spacing: 40) {
    VStack(alignment: .leading, spacing: 16) {
      Text("Never kill a houseplant again").font(.largeTitle)
      Highlight("Reminders that know your plants")
      Lorem("Snap a photo, get a care plan, and a nudge when it is time to water, feed or repot.")
      HStack(spacing: 12) {
        Button("Start free", systemImage: "arrow.right").buttonStyle(.borderedProminent).controlSize(.large)
        Button("Watch demo", systemImage: "play").controlSize(.large)
      }
      Annotation("one CTA only?", variant: .up).padding(.leading, 30)
    }
    .frame(maxWidth: .infinity)
    CrossedImage("hero: phone + plant photo").frame(width: 380, height: 260)
  }
  .padding(.horizontal, 40)
  .padding(.vertical, 28)
  HStack(spacing: 20) {
    FeatureCard(title: "Photo ID")
    FeatureCard(title: "Care calendar", lines: 2)
    FeatureCard(title: "Plant doctor")
  }
  .padding(.horizontal, 40)
  Spacer()
}
```

## Sign-up

The same form any pack draws — this fence has **no import**, only `pack="sketch"`. Text fields
with labels and a focused field, a password with an error, a checkbox, a full-width primary button
and an outlined alternative below a labelled divider.

```mockitdown pack="sketch" device="fit" appearance="both" source="true" title="Sign-up"
VStack(alignment: .stretch, spacing: 14) {
  Text("Create your account").font(.title2)
  Text("Free for 30 days. No card needed.").foregroundStyle(.secondary)
  TextField("Your name", text: "Ana Lima", label: "Name")
  TextField("you@example.com", label: "Email").state(.focused)
  SecureField("Password", text: "abc", label: "Password", helper: "At least 8 characters").state(.error)
  Checkbox("I agree to the terms", checked: true)
  Button("Create account").buttonStyle(.borderedProminent).frame(maxWidth: .infinity)
  Divider(label: "or")
  Button("Continue with email link", systemImage: "envelope").frame(maxWidth: .infinity)
  HStack {
    Text("Already have an account?").font(.footnote)
    Link("Log in")
  }
}
.padding(24)
.frame(width: 380)
```

## Mobile list → detail

Two phone screens of a shop app. The list uses the `ThingRow` component (crossed thumbnails), a
search field, chips and a bottom tab bar; the detail screen is plain core code under
`pack="sketch"`.

```mockitdown device="phone" title="List"
import Sketch
import "sketch/blocks"

TabView {
  NavigationStack {
    VStack(alignment: .stretch, spacing: 0) {
      HStack(spacing: 8) {
        Chip("All").selected()
        Chip("Indoor")
        Chip("Outdoor")
        Chip("Pots")
      }
      .padding(.horizontal, 16)
      .padding(.vertical, 8)
      List {
        ThingRow(title: "Monstera", price: "$24", photo: "assets/images/photo-1.svg")
        ThingRow(title: "Fiddle leaf fig", price: "$38", photo: "assets/images/photo-2.svg").selected()
        ThingRow(title: "Snake plant", price: "$18", photo: "assets/images/photo-3.svg")
        ThingRow(title: "Pothos", price: "$12", photo: "assets/images/photo-4.svg")
        ThingRow(title: "Terracotta pot", price: "$9", photo: "assets/images/photo-5.svg")
        ThingRow(title: "Watering can", price: "$15", photo: "assets/images/photo-6.svg")
      }
    }
    .navigationTitle("Shop")
    .searchable(text: "")
    .toolbar { ToolbarItem(placement: .topBarTrailing) { Button(systemImage: "cart").badge(2) } }
  }
  .tabItem { Label("Shop", systemImage: "house") }
  Text("Saved").tabItem { Label("Saved", systemImage: "heart") }
  Text("Orders").tabItem { Label("Orders", systemImage: "shippingbox") }
  Text("Me").tabItem { Label("Me", systemImage: "person") }
}
```

```mockitdown pack="sketch" device="phone" title="Detail" source="true"
NavigationStack {
  ScrollView {
    VStack(alignment: .leading, spacing: 14) {
      Image("assets/images/photo-2.svg").resizable().frame(maxWidth: .infinity).frame(height: 220)
      HStack {
        Text("Fiddle leaf fig").font(.title2)
        Spacer()
        Text("$38").font(.title2)
      }
      Rating(4, label: "128 reviews")
      Text("Lorem ipsum dolor sit amet, consectetur adipiscing elit. Bright, indirect light.")
        .foregroundStyle(.secondary)
      SegmentedControl(["Small", "Medium", "Large"], selection: 1)
      Stepper("Quantity", value: 1)
      HStack(spacing: 10) {
        Button("Add to cart", systemImage: "cart").buttonStyle(.borderedProminent).frame(maxWidth: .infinity)
        IconButton("heart")
      }
      .frame(maxWidth: .infinity)
      Skeleton(lines: 3, avatar: true)
    }
    .padding(16)
  }
  .navigationTitle("Details")
  .navigationBarTitleDisplayMode(.inline)
  .toolbar { ToolbarItem(placement: .topBarTrailing) { Button(systemImage: "square.and.arrow.up") } }
}
```

## Dashboard

An analytics concept: sidebar, four `KpiBox`es (`Stat` with sparklines), a pencil bar chart and a
dashed line chart, and a table with a selected row and pagination. Plain core code under
`pack="sketch"` except the imported component.

```mockitdown pack="sketch" title="Dashboard" url="https://napkin.example/admin" height="840"
import "sketch/blocks"

HStack(alignment: .top, spacing: 0) {
  Sidebar("Plantly admin") {
    NavItem("Overview", systemImage: "square.grid.2x2").selected()
    NavItem("Orders", systemImage: "shippingbox").badge(12)
    NavItem("Customers", systemImage: "person.2")
    NavItem("Products", systemImage: "tag")
    NavItem("Settings", systemImage: "gear")
  }
  VStack(alignment: .stretch, spacing: 18) {
    HStack {
      Text("Overview").font(.title)
      Spacer()
      SegmentedControl(["7 days", "30 days", "Year"], selection: 1)
      Menu("Export", systemImage: "square.and.arrow.up", open: true) {
        Button("CSV", systemImage: "doc")
        Button("PDF report", systemImage: "doc.richtext")
        Divider()
        Button("Schedule…", systemImage: "calendar").disabled()
      }
    }
    HStack(spacing: 14) {
      KpiBox(label: "Revenue", value: "$48k", change: "+12%")
      KpiBox(label: "Orders", value: "1,284", change: "+4%", trend: [5, 4, 6, 5, 7, 8, 7])
      KpiBox(label: "New customers", value: "312", change: "+18%", trend: [2, 3, 3, 4, 3, 5, 6])
      KpiBox(label: "Refunds", value: "21", change: "-3%", trend: [6, 5, 5, 4, 4, 3, 3])
    }
    HStack(alignment: .top, spacing: 14) {
      Card("Sales by month") {
        BarChart(values: [12, 18, 15, 22, 28, 25, 31], labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"], height: 170)
      }
      Card("Visitors vs. buyers") {
        LineChart(series: [[30, 34, 32, 40, 44, 41, 48], [10, 12, 11, 15, 17, 16, 20]], seriesNames: ["Visitors", "Buyers"], labels: ["M", "T", "W", "T", "F", "S", "S"], height: 170)
      }
    }
    Table(columns: ["Order", "Customer", "Items", "Total", "Status"],
          rows: [["#1042", "Ana Lima", "3", "$64", "Shipped"],
                 ["#1041", "Ben Okafor", "1", "$24", "Packing"],
                 ["#1040", "Chen Wu", "2", "$47", "Shipped"],
                 ["#1039", "Dana Petrov", "5", "$112", "Refunded"]],
          selection: [1], pagination: "1–4 of 1,284", title: "Latest orders")
  }
  .padding(24)
}
```

## Settings

A tablet settings screen with a split view: plain core code under `pack="sketch"`. Toggles on and
off, a picker, a slider, a stepper, a disabled field (hatched) and a destructive button.

```mockitdown pack="sketch" device="tablet" appearance="both" title="Settings"
NavigationSplitView {
  NavigationStack {
    List {
      Row("Account", systemImage: "person.crop.circle")
      Row("Notifications", systemImage: "bell").selected()
      Row("Privacy", systemImage: "lock")
      Row("Display", systemImage: "sun.max")
      Row("Help", systemImage: "questionmark.circle")
    }
    .navigationTitle("Settings")
  }
} detail: {
  NavigationStack {
    Form {
      Section("Reminders") {
        Toggle("Watering reminders", isOn: true)
        Toggle("Feeding reminders", isOn: false)
        Picker("Remind me at", selection: "Morning") { Text("Morning"); Text("Noon"); Text("Evening") }
        Stepper("Snooze (minutes)", value: 15)
      }
      Section("Sound") {
        Slider(value: 0.6, label: "Volume")
        RadioGroup("Tone", selection: "Chirp") { RadioButton("Chirp"); RadioButton("Bell"); RadioButton("Silent") }
      }
      Section("Account") {
        TextField("Email", text: "ana@example.com", label: "Email").disabled()
        Button("Delete account", role: .destructive)
      }
    }
    .navigationTitle("Notifications")
    .navigationBarTitleDisplayMode(.inline)
  }
}
```

## Onboarding flow with notes

A whole flow on one page of paper: three `FlowStep` cards joined by `Arrow`s, a taped `Note`, an
`Annotation` and numbered callouts. The welcome screen (#1) explains the value, the permission
step (#2) asks for notifications only after that, and the last step (#3) drops the user into an
empty garden — the open question on the note is whether to skip it.

```mockitdown source="true" device="fit" title="Onboarding flow"
import Sketch
import "sketch/blocks"

VStack(alignment: .leading, spacing: 22) {
  HStack(alignment: .center, spacing: 0) {
    FlowStep(title: "Welcome", action: "Get started").callout(1, alignment: .topLeading)
    Arrow("tap")
    FlowStep(title: "Allow reminders", action: "Allow", lines: 3).callout(2, "ask late", alignment: .topTrailing)
    Arrow("allow")
    FlowStep(title: "Your garden", action: "Add a plant", lines: 1).callout(3, alignment: .topTrailing)
  }
  HStack(alignment: .top, spacing: 40) {
    Note("Do we need step 3 at all? Maybe open the camera right away.", title: "Open question", author: "— Ana, Tue")
    Annotation("skip goes straight to step 3", variant: .up)
    Spacer()
    StickyNote("Test with 5 people", rotation: 3)
  }
}
.padding(28)
```

## Delete confirmation

A dialog over a list and a toast — the scrim is hatched, the dialog and toast
are pencil boxes with an offset shadow.

```mockitdown device="phone" title="Delete plant" appearance="both"
import Sketch

NavigationStack {
  List {
    Row("Monstera", subtitle: "Water in 2 days", avatar: "Monstera")
    Row("Fiddle leaf fig", subtitle: "Water today", avatar: "Fiddle Fig").selected()
    Row("Snake plant", subtitle: "Water in 9 days", avatar: "Snake Plant")
    Row("Pothos", subtitle: "Feed this week", avatar: "Pothos")
  }
  .navigationTitle("My plants")
  .toolbar {
    ToolbarItem(placement: .topBarTrailing) {
      Menu(systemImage: "ellipsis.circle") {
        Button("Edit", systemImage: "pencil")
        Button("Share", systemImage: "square.and.arrow.up")
        Divider()
        Button("Delete", systemImage: "trash", role: .destructive)
      }
    }
  }
  .alert("Delete Fiddle leaf fig?", isPresented: true) {
    Button("Cancel")
    Button("Delete", role: .destructive)
  } message: {
    Text("Its care history will be lost.")
  }
}
Toast("Reminder snoozed", action: "Undo")
```

## Planning board

The team's concept board: a `Board` of `KanbanCard`s with tags and assignees, a `Timeline` and a
`Canvas` with sticky notes, all in pencil.

```mockitdown pack="sketch" title="Concept board" url="https://napkin.example/board" height="560"
HStack(alignment: .top, spacing: 20) {
  Board {
    BoardColumn("Ideas", count: 3) {
      KanbanCard("Photo plant ID", tags: ["research"], assignees: ["Ana Lima"])
      KanbanCard("Care calendar", description: "Weekly view first?", tags: ["ux"], comments: 4)
      KanbanCard("Plant doctor chat", tags: ["maybe"])
    }
    BoardColumn("Sketching", count: 2) {
      KanbanCard("Onboarding flow", tags: ["ux", "flow"], assignees: ["Ben Okafor", "Chen Wu"], priority: .high)
      KanbanCard("Shop list + detail", tags: ["ux"], due: "Fri")
    }
    BoardColumn("Testing", count: 1) {
      KanbanCard("Landing page", tags: ["test"], assignees: ["Dana Petrov"], comments: 7, priority: .medium)
    }
  }
  VStack(alignment: .stretch, spacing: 14) {
    Text("This week").font(.title3)
    Timeline {
      TimelineItem("Kick-off", time: "Mon", status: .done)
      TimelineItem("Paper sketches", time: "Tue", status: .done)
      TimelineItem("Clickable wireframe", time: "Thu", status: .current)
      TimelineItem("5 user tests", time: "Fri", status: .todo)
    }
    Canvas(grid: .dots, height: 200) {
      StickyNote("Fewer steps!", rotation: -3).frame(width: 120).position(x: 80, y: 90)
      StickyNote("Bigger photos", rotation: 2).frame(width: 120).position(x: 220, y: 110)
    }
  }
  .frame(width: 300)
}
.padding(20)
```
