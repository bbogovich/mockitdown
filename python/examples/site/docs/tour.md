# Language tour

A mockup is a fenced block whose language is `mockitdown`. The code inside is a declarative subset
of Swift and SwiftUI. Every example below uses the neutral **Wireframe** pack (`base`). A pack page
shows the same notation in a real framework's style.

## Anatomy of a block

The fence line carries options — for example `mockitdown title="Inbox" device="phone"` after the
three backticks — and the block body reads:

```swift
import SwiftUI                     // selects the pack (optional: fence `pack=` or the site default)
import "shared/kpi"                // custom components from docs/mockups/shared/kpi.mockitdown
@Screen(id: "SCR-1")               // optional metadata; fence attributes override it

NavigationStack { /* … */ }        // the views that make up the screen
```

Fence attributes: `pack`, `device` (`phone`, `phone-landscape`, `tablet`, `tablet-portrait`,
`desktop`, `wide`, `fit`), `appearance` (`light`, `dark`, `auto` — follows this site's toggle —,
`both`), `width`, `height`, `chrome`, `title`, `id`, `caption`, `elements`, `url`, `source`.

## Elements, arguments and modifiers

Elements take positional and labelled arguments, as in SwiftUI. Modifiers chain with a leading dot,
on the same line or on the next.

```mockitdown source="true" device="fit" title="Elements and modifiers"
VStack(alignment: .leading, spacing: 10) {
  Text("Release notes").font(.title2)
  Text("Version **2.4** adds *offline mode* and `sync` fixes.")
    .foregroundStyle(.secondary)
  HStack {
    Label("Download", systemImage: "arrow.down.to.line")
    Spacer()
    Button("Install").buttonStyle(.borderedProminent)
    Button("Later")
  }
  ProgressView("Downloading", value: 0.62)
}
.padding()
.frame(width: 420)
```

## Layout

`VStack`, `HStack`, `ZStack`, `Grid`/`LazyVGrid`, `ScrollView`, `Spacer` and `Divider` behave like
their SwiftUI namesakes: a stack containing a `Spacer` takes all the room its parent offers.

```mockitdown source="true" device="fit" title="Stacks and grids"
VStack(spacing: 12) {
  HStack {
    Text("Projects").font(.headline)
    Spacer()
    Button("New", systemImage: "plus").buttonStyle(.borderedProminent)
  }
  LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible()), GridItem(.flexible())], spacing: 12) {
    ForEach(["Atlas", "Borealis", "Cirrus", "Delta", "Echo", "Fjord"]) { name in
      Card(name, subtitle: "Updated today", systemImage: "folder")
    }
  }
}
.padding()
.frame(width: 640)
```

## Data: `let`, `ForEach`, `if` and interpolation

```mockitdown source="true" device="fit" title="ForEach with tuples"
let team = [("Ana Lima", "Design", true), ("Ben Okafor", "Engineering", false),
            ("Chen Wu", "Research", true)]

List {
  ForEach(team) { name, dept, online in
    Row(name, subtitle: dept, detail: online ? "Online" : "Away", avatar: name)
  }
  if team.count > 2 {
    Text("\(team.count) people").font(.footnote).foregroundStyle(.secondary)
  }
}
.frame(width: 420)
```

## Lists, forms and controls

```mockitdown source="true" device="fit" title="A settings form"
Form {
  Section("Account") {
    TextField("Name", text: "Ana Lima")
    SecureField("Password", text: "secret")
    Picker("Language", selection: "English") { Text("English"); Text("Deutsch"); Text("Français") }
  }
  Section("Preferences") {
    Toggle("Email notifications", isOn: true)
    Toggle("Weekly digest", isOn: false)
    Slider(value: 0.4)
    Stepper("Reminders", value: 3)
    DatePicker("Start date", selection: "2026-11-30")
  }
}
.frame(width: 460)
```

## Navigation and presentation

`NavigationStack` builds its bar from the content's `.navigationTitle` and `.toolbar`;
`.alert`, `.sheet` and `.confirmationDialog` draw the presented state over the screen.

```mockitdown source="true" device="phone" appearance="both" title="Navigation and an alert"
NavigationStack {
  List {
    Row("Wi-Fi", detail: "Home", systemImage: "wifi", chevron: true)
    Row("Bluetooth", detail: "On", systemImage: "bolt", chevron: true)
    Row("Notifications", systemImage: "bell", chevron: true).badge(2)
  }
  .navigationTitle("Settings")
  .toolbar { ToolbarItem(placement: .topBarTrailing) { Button("Edit") } }
  .alert("Sign out?", isPresented: true) {
    Button("Cancel")
    Button("Sign Out", role: .destructive)
  } message: {
    Text("You will need your password to sign in again.")
  }
}
```

## Images and icons

`Image(systemName:)` draws a built-in icon; SF Symbols, Material, Fluent and SAP icon names are all
understood. `Image("path")` embeds a local file at build time (searched in the extension's
`asset_paths`), so the page needs no extra asset handling; `http(s)` URLs are linked.

```mockitdown source="true" device="fit" title="Images and icons"
HStack(spacing: 16) {
  Image("assets/images/photo-2.svg").resizable().aspectRatio(contentMode: .fill)
    .frame(width: 180, height: 120).cornerRadius(12)
  VStack(alignment: .leading, spacing: 8) {
    Text("Dune Trail").font(.title3)
    HStack(spacing: 10) {
      Image(systemName: "mappin")
      Image(systemName: "star.fill").foregroundStyle(.yellow)
      Image(systemName: "favorite")
      Image(systemName: "sap-icon://shipping-status")
    }
    Rating(value: 4.5)
  }
}
.padding()
```

## Appearance and devices

Packs define light and dark colours. `appearance="auto"` (this site's default) follows the page;
`both` draws the two side by side. Devices set the frame size; `fit` shrink-wraps the content.

```mockitdown source="true" appearance="both" device="fit" title="Light and dark"
HStack(spacing: 12) {
  Banner("Backup complete", message: "1,204 files, 3.2 GB", severity: .success)
  Banner("Storage almost full", severity: .warning)
}
.padding()
.frame(width: 560)
```

## Traceability: the Elements table

`.id("…")` and `.ref("…")` tag elements; `elements="true"` lists them under the figure — the
structural contract a specification can cite.

```mockitdown source="true" elements="true" device="fit" title="Checkout summary" id="SCR-CHK-2"
VStack(alignment: .leading, spacing: 10) {
  LabeledContent("Subtotal", value: "$118.00")
  LabeledContent("Shipping", value: "$6.50")
  Divider()
  LabeledContent("Total", value: "$124.50").bold().id("total")
  Button("Place order").buttonStyle(.borderedProminent).frame(maxWidth: .infinity)
    .id("place-order").ref("UC-CHK-3")
}
.padding()
.frame(width: 340)
```
