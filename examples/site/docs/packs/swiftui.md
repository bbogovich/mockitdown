# SwiftUI

The `swiftui` pack imitates **SwiftUI on iOS 26, iPadOS 26 and macOS 26** — the Liquid Glass
generation: the SF Pro type stack with the Dynamic Type sizes (Large Title 34 · Title 28 · Title 2 22 ·
Title 3 20 · Headline 17 semibold · Body 17 · Callout 16 · Subheadline 15 · Footnote 13 · Caption 12 ·
Caption 2 11), the system colours (`systemBlue` `#007AFF` / `#0A84FF`, `systemGroupedBackground`
`#F2F2F7` / black, label / secondaryLabel / tertiaryLabel, separators), inset-grouped lists with
rounded sections, a large-title navigation bar whose buttons sit in glass capsules, the floating glass
tab bar, 51 × 31 green switches, capsule segmented controls and sliders, the iOS alert and action
sheet, sheets with a grabber and glass context menus. Select it with `import SwiftUI`.

The mockup syntax is SwiftUI, so the element names are SwiftUI's own: `NavigationStack`,
`NavigationSplitView`, `TabView` / `Tab`, `List`, `Form`, `Section`, `NavigationLink`,
`LabeledContent`, `DisclosureGroup`, `OutlineGroup`, `GroupBox`, `ControlGroup`, `Table`, `Menu`,
`Picker` (`.menu`, `.segmented`, `.inline`, `.navigationLink`), `Toggle`, `Slider`, `Stepper`,
`DatePicker`, `MultiDatePicker`, `ColorPicker`, `TextField`, `SecureField`, `TextEditor`,
`ProgressView`, `Gauge` (`.accessoryCircular`, `.linearCapacity`, …), `Chart` with `BarMark`,
`LineMark`, `AreaMark` and `SectorMark` shorthands, `Map`, `VideoPlayer`, `ShareLink`, `EditButton`,
`PasteButton`, `PhotosPicker`, `SignInWithAppleButton`, `TipView`, `ContentUnavailableView` and
the iOS 26 additions `ToolbarSpacer`, `.buttonStyle(.glass)` and `.buttonStyle(.glassProminent)`.
Presentations use the real modifiers: `.alert`, `.confirmationDialog`, `.sheet`, `.popover`,
`.inspector`, `.searchable`, `.toolbar`. Rows take `iconColor:` to draw the tinted icon squares of
the Settings app.

The device decides the platform: `phone` (the default) renders iOS, `tablet` renders iPadOS with a
floating sidebar and a top tab bar, `desktop` renders macOS with 13 pt type, compact controls and a
glass sidebar. The custom components used below (`SettingsRow`, `SettingsToggle`, `TripRow`,
`MetricCard`, `MailRow`) live in `mockups/swiftui/components.mockitdown` and are imported with
`import "swiftui/components"`.

## Sign in

A single-screen sign-in with rounded-border fields, a large prominent button and the Sign in with
Apple button.

```mockitdown source="true" title="Sign in"
import SwiftUI

VStack(spacing: 14) {
  Spacer()
  Image(systemName: "bolt.fill")
    .font(.system(size: 40))
    .foregroundStyle(.white)
    .frame(width: 84, height: 84)
    .background(.indigo)
    .clipShape(.rect(cornerRadius: 20))
  Text("Welcome back").font(.largeTitle).bold()
  Text("Sign in to sync your notes across all your devices.")
    .foregroundStyle(.secondary)
    .multilineTextAlignment(.center)
  VStack(spacing: 10) {
    TextField("Email", text: "alex@example.com").textFieldStyle(.roundedBorder)
    SecureField("Password", text: "").textFieldStyle(.roundedBorder).state(.focused)
  }
  .padding(.top, 12)
  Button("Sign In")
    .buttonStyle(.borderedProminent)
    .controlSize(.large)
    .frame(maxWidth: .infinity)
  Text("or").font(.footnote).foregroundStyle(.secondary)
  SignInWithAppleButton().frame(maxWidth: .infinity)
  Spacer()
  Link("Forgot password?", destination: "https://example.com/reset")
}
.padding(.horizontal, 24)
.padding(.bottom, 16)
```

## Settings

The iPhone Settings app: a searchable inset-grouped list, an account row, and rows with tinted
icon squares (`iconColor:`), values, chevrons and switches.

```mockitdown source="true" appearance="both" title="Settings"
import SwiftUI
import "swiftui/components"

NavigationStack {
  List {
    Section {
      NavigationLink("Alex Morgan", subtitle: "Apple Account, iCloud, and more",
                     image: "assets/images/avatar-2.svg")
    }
    Section {
      SettingsToggle(title: "Airplane Mode", icon: "airplane", color: .orange)
      SettingsRow(title: "Wi-Fi", icon: "wifi", color: .blue, value: "Home")
      SettingsRow(title: "Cellular", icon: "antenna.radiowaves.left.and.right", color: .green)
      SettingsRow(title: "Personal Hotspot", icon: "personalhotspot", color: .green, value: "Off")
      SettingsRow(title: "Battery", icon: "battery.100", color: .green)
    }
    Section {
      SettingsRow(title: "General", icon: "gear", color: .gray)
      SettingsRow(title: "Accessibility", icon: "accessibility", color: .blue)
      SettingsRow(title: "Camera", icon: "camera.fill", color: .gray)
      SettingsRow(title: "Search", icon: "magnifyingglass", color: .gray)
    }
    Section {
      SettingsRow(title: "Notifications", icon: "bell.badge.fill", color: .red)
      SettingsToggle(title: "Do Not Disturb", icon: "moon.fill", color: .indigo, isOn: true)
      SettingsRow(title: "Screen Time", icon: "hourglass", color: .indigo)
    }
  }
  .navigationTitle("Settings")
  .searchable(text: "", prompt: "Search")
}
```

## List → detail

An inset-grouped navigation list with thumbnails and an open sort `Menu`, then the detail screen
it pushes: an inline title, a glass back button, a `Map`, a segmented `Picker`, `LabeledContent`
rows — and the iOS alert raised by "Delete Trip".

```mockitdown title="Trips"
import SwiftUI
import "swiftui/components"

NavigationStack {
  List {
    Section("Upcoming") {
      TripRow(name: "Lisbon", dates: "Mar 12 – 18", photo: "assets/images/photo-1.svg", nights: 6)
      TripRow(name: "Kyoto", dates: "Apr 3 – 14", photo: "assets/images/photo-2.svg", nights: 11)
    }
    Section("Past") {
      TripRow(name: "Reykjavík", dates: "Oct 2 – 6, 2025", photo: "assets/images/photo-3.svg", nights: 4)
      TripRow(name: "Lake Como", dates: "Jul 20 – 27, 2025", photo: "assets/images/photo-4.svg", nights: 7)
      TripRow(name: "Marrakesh", dates: "Feb 9 – 13, 2025", photo: "assets/images/photo-5.svg", nights: 4)
    }
  }
  .navigationTitle("Trips")
  .toolbar {
    ToolbarItem(placement: .topBarLeading) { EditButton() }
    ToolbarItemGroup(placement: .topBarTrailing) {
      Menu(systemImage: "arrow.up.arrow.down", open: true) {
        Button("Date", systemImage: "calendar", checked: true)
        Button("Name", systemImage: "list.bullet", checked: false)
        Button("Length", systemImage: "clock", checked: false)
        Divider()
        Button("Show Past Trips", systemImage: "eye", checked: true)
      }
      Button(systemImage: "plus")
    }
  }
}
```

```mockitdown title="Trip detail"
import SwiftUI

NavigationStack(back: "Trips") {
  List {
    Section {
      Map("Lisbon").frame(height: 190)
    }
    Section {
      Picker("View", selection: "Itinerary") {
        Text("Itinerary"); Text("Stays"); Text("Notes")
      }
      .pickerStyle(.segmented)
      LabeledContent("Dates", value: "Mar 12 – 18")
      LabeledContent("Flight", value: "TP 1351 · 08:40")
      LabeledContent("Hotel", value: "Casa do Bairro")
      NavigationLink("Day plans", systemImage: "list.bullet", detail: "6")
    }
    Section {
      Toggle("Share with travel companions", isOn: true)
      DatePicker("Reminder", selection: "2026-03-10")
    } footer: {
      Text("Companions can see the itinerary and add notes.")
    }
    Section {
      Button("Delete Trip", role: .destructive)
    }
  }
  .navigationTitle("Lisbon")
  .navigationBarTitleDisplayMode(.inline)
  .toolbar {
    ToolbarItem(placement: .topBarTrailing) { ShareLink(item: "trip").labelStyle(.iconOnly) }
  }
  .alert("Delete Trip?", isPresented: true) {
    Button("Cancel", role: .cancel)
    Button("Delete", role: .destructive)
  } message: {
    Text("“Lisbon” and its day plans will be removed from all your devices.")
  }
}
```

## Tab app

A Music-style app: a `TabView` of `Tab`s with the floating Liquid Glass tab bar, horizontally
scrolling artwork and a list underneath.

```mockitdown appearance="both" title="Listen Now"
import SwiftUI

TabView {
  Tab("Home", systemImage: "house.fill") {
    NavigationStack {
      ScrollView {
        VStack(alignment: .leading, spacing: 10) {
          Text("Top Picks for You").font(.title2).bold()
          ScrollView(.horizontal) {
            HStack(spacing: 12) {
              ForEach([("Morning Mix", "photo-1"), ("Focus", "photo-2"), ("Road Trip", "photo-3")]) { name, pic in
                VStack(alignment: .leading, spacing: 6) {
                  Image("assets/images/\(pic).svg").resizable().scaledToFill()
                    .frame(width: 168, height: 168).cornerRadius(12)
                  Text(name).font(.subheadline)
                  Text("Apple Music").font(.footnote).foregroundStyle(.secondary)
                }
              }
            }
          }
          HStack {
            Text("Recently Played").font(.title2).bold()
            Spacer()
            Button("See All")
          }
          .padding(.top, 8)
          Row("Golden Hour", subtitle: "Album · Lumen", image: "assets/images/photo-4.svg") {
            Image(systemName: "ellipsis").foregroundStyle(.secondary)
          }
          Row("Night Drive", subtitle: "Playlist · 42 songs", image: "assets/images/photo-5.svg") {
            Image(systemName: "ellipsis").foregroundStyle(.secondary)
          }
        }
        .padding(.horizontal, 16)
      }
      .navigationTitle("Home")
      .toolbar { ToolbarItem(placement: .topBarTrailing) { Button(systemImage: "person.crop.circle") } }
    }
  }
  Tab("New", systemImage: "square.grid.2x2.fill") { Text("New") }
  Tab("Radio", systemImage: "dot.radiowaves.left.and.right") { Text("Radio") }
  Tab("Library", systemImage: "music.note.list") { Text("Library") }.badge(2)
  Tab("Search", systemImage: "magnifyingglass") { Text("Search") }
}
```

## Health dashboard

Summary tiles built from a reusable `MetricCard` (a `GroupBox`), with `Gauge`s, a `BarMark` chart, a
line chart and a linear-capacity gauge, on the grouped background.

```mockitdown source="true" title="Summary"
import SwiftUI
import "swiftui/components"

NavigationStack {
  ScrollView {
    VStack(spacing: 14) {
      MetricCard(title: "Activity", icon: "flame.fill", color: .red, value: "412",
                 unit: "/ 600 kcal", caption: "9:41") {
        HStack(spacing: 20) {
          Gauge(value: 0.69, label: { Text("Move") }, currentValueLabel: { Text("69%") }).tint(.red)
          Gauge(value: 0.83, label: { Text("Exercise") }, currentValueLabel: { Text("25") }).tint(.green)
          Gauge(value: 0.5, label: { Text("Stand") }, currentValueLabel: { Text("6") }).tint(.cyan)
        }
        .frame(maxWidth: .infinity)
      }
      MetricCard(title: "Steps", icon: "figure.walk", color: .orange, value: "8,214",
                 unit: "steps", caption: "Today") {
        BarMark(values: [4.2, 6.8, 5.1, 9.4, 7.7, 3.2, 8.2],
                labels: ["M", "T", "W", "T", "F", "S", "S"], height: 120).tint(.orange)
      }
      MetricCard(title: "Heart Rate", icon: "heart.fill", color: .pink, value: "64",
                 unit: "BPM", caption: "2 min ago") {
        LineMark(values: [72, 68, 75, 64, 70, 66, 62, 64], height: 70).tint(.pink)
      }
      MetricCard(title: "Sleep", icon: "bed.double.fill", color: .mint, value: "7 h 22 min",
                 caption: "Last night") {
        Gauge(value: 0.92, label: { Text("Goal 8 h") }).gaugeStyle(.linearCapacity).tint(.mint)
      }
    }
    .padding(.horizontal, 16)
  }
  .navigationTitle("Summary")
  .toolbar { ToolbarItem(placement: .topBarTrailing) { Button(systemImage: "person.crop.circle") } }
}
```

## Sheet

A calendar screen with the graphical `DatePicker`, presenting a "New Event" sheet whose `Form`
uses a text field, switches, compact date pickers, a navigation-link `Picker`, a `ColorPicker`
and a `Stepper`.

```mockitdown title="New Event"
import SwiftUI

NavigationStack {
  VStack(alignment: .leading, spacing: 16) {
    DatePicker("Date", selection: "2026-11-24", events: ["2026-11-27", "2026-11-30"])
      .datePickerStyle(.graphical)
    Text("Tuesday, November 24").font(.headline)
    Row("Design review", subtitle: "10:00 – 11:00 · Room 4", systemImage: "circle.fill")
  }
  .padding(.horizontal, 16)
  .navigationTitle("November")
  .sheet(isPresented: true) {
    NavigationStack {
      Form {
        Section {
          TextField("Title", text: "Team offsite")
          TextField("Location or Video Call", text: "")
        }
        Section {
          Toggle("All-day", isOn: false)
          DatePicker("Starts", selection: "2026-11-27 09:00")
          DatePicker("Ends", selection: "2026-11-27 17:00")
          Picker("Repeat", selection: "Never") { Text("Never"); Text("Weekly") }
            .pickerStyle(.navigationLink)
        }
        Section {
          ColorPicker("Calendar Color", selection: .blue)
          Stepper("Guests", value: 12)
        }
      }
      .navigationTitle("New Event")
      .navigationBarTitleDisplayMode(.inline)
      .toolbar {
        ToolbarItem(placement: .cancellationAction) { Button(systemImage: "xmark") }
        ToolbarItem(placement: .confirmationAction) {
          Button(systemImage: "checkmark").buttonStyle(.borderedProminent)
        }
      }
    }
  }
}
```

## Empty state and action sheet

A `ContentUnavailableView` for an empty folder, a `TipView`, glass bottom-bar items, and a
`.confirmationDialog` presented as the iOS action sheet.

```mockitdown appearance="both" title="Empty folder"
import SwiftUI

NavigationStack(back: "Folders") {
  VStack {
    TipView("Pin your favourite notes", message: "Swipe right on a note to keep it at the top.")
    ContentUnavailableView("No Notes", systemImage: "note.text",
                           description: Text("Notes you add to this folder appear here.")) {
      Button("New Note").buttonStyle(.bordered)
    }
  }
  .padding(.horizontal, 16)
  .navigationTitle("Recipes")
  .toolbar {
    ToolbarItem(placement: .topBarTrailing) { Button(systemImage: "ellipsis") }
    ToolbarItem(placement: .bottomBar) { Text("0 Notes") }
    ToolbarItem(placement: .bottomBar) { Button(systemImage: "square.and.pencil") }
  }
  .confirmationDialog("Delete “Recipes”?", isPresented: true) {
    Button("Delete Folder", role: .destructive)
    Button("Move Notes to “Notes”")
    Button("Cancel", role: .cancel)
  } message: {
    Text("The folder will be moved to Recently Deleted.")
  }
}
```

## Mac mail

A three-column `NavigationSplitView` on macOS (`device="desktop"`): the glass sidebar with
mailboxes and unread counts, the message list built from `MailRow`, and the message with a
toolbar, a `ControlGroup` and the search field in the title bar.

```mockitdown device="desktop" appearance="both" title="Inbox — 3 unread"
import SwiftUI
import "swiftui/components"

NavigationSplitView {
  List {
    Section("Favorites") {
      NavigationLink("Inbox", systemImage: "tray").badge(3).selected()
      Label("Flagged", systemImage: "flag")
      Label("Drafts", systemImage: "doc")
      Label("Sent", systemImage: "paperplane")
    }
    Section("iCloud") {
      Label("Archive", systemImage: "archivebox")
      Label("Junk", systemImage: "xmark.bin")
      Label("Trash", systemImage: "trash")
    }
  }
  .listStyle(.sidebar)
} content: {
  NavigationStack {
    List {
      MailRow(sender: "Maya Chen", subject: "Offsite agenda", time: "9:41",
              preview: "Here is the draft agenda for Thursday. Let me know if the timing works.",
              unread: true).selected()
      MailRow(sender: "GitHub", subject: "[mockitdown] PR #42 merged", time: "8:15",
              preview: "Merged swiftui pack: Liquid Glass tab bar, sheets and alerts.", unread: true)
      MailRow(sender: "Jonas Weber", subject: "Re: Invoice 2026-118", time: "Yesterday",
              preview: "Thanks, received. Payment goes out on Friday.")
      MailRow(sender: "Apple Developer", subject: "WWDC session videos", time: "Monday",
              preview: "Catch up on the latest sessions about Liquid Glass and SwiftUI.", unread: true)
    }
    .listStyle(.plain)
    .navigationTitle("Inbox")
    .navigationSubtitle("3 unread")
  }
} detail: {
  NavigationStack {
    ScrollView {
      VStack(alignment: .leading, spacing: 12) {
        HStack(spacing: 10) {
          Avatar("Maya Chen")
          VStack(alignment: .leading, spacing: 2) {
            Text("Maya Chen").font(.headline)
            Text("To: Team").font(.subheadline).foregroundStyle(.secondary)
          }
          Spacer()
          Text("Today, 9:41").font(.subheadline).foregroundStyle(.secondary)
        }
        Text("Offsite agenda").font(.title2).bold()
        Divider()
        Text("Hi all,")
        Text("Here is the draft agenda for Thursday. We start at **9:00** with a review of the Q4 roadmap, then split into groups after lunch.")
        Text("Let me know if the timing works for you.")
        Text("— Maya").foregroundStyle(.secondary)
      }
      .padding(20)
    }
    .navigationTitle("Offsite agenda")
    .searchable(text: "", prompt: "Search")
    .toolbar {
      ControlGroup {
        Button(systemImage: "arrowshape.turn.up.left")
        Button(systemImage: "arrowshape.turn.up.right")
      }
      Button(systemImage: "archivebox")
      Button(systemImage: "trash")
      Button(systemImage: "flag")
    }
  }
}
```
