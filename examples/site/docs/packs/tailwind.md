# Tailwind Catalyst

The `tailwind` pack imitates **Catalyst**, the application UI kit of **Tailwind Plus**: React
components built on Headless UI and styled with **Tailwind CSS v4**. It follows the kit's own
classes at the `sm:` breakpoint — `text-sm/6` (14/24 px) in Inter with a system fallback, **zinc**
neutrals, 36 px controls with `rounded-lg` corners, hairline **rings** (`zinc-950/10`, `white/10` in
dark mode) instead of borders, `rounded-xl` menus with the **blue-500** active item, `rounded-2xl`
dialogs, and the inset white panel on a `zinc-100` (`zinc-950` in dark mode) application shell. A few
**Tailwind Plus marketing sections** (hero, feature grid, pricing) come with it. Select it with
`import Tailwind` (or `import TailwindPlus`, `import TailwindCatalyst`).

Elements use the Catalyst component names: the shells `SidebarLayout`, `StackedLayout`,
`AuthLayout`; `Navbar` (`NavbarSection`, `NavbarItem`, `NavbarSpacer`, `NavbarDivider`) and
`Sidebar` (`SidebarHeader`, `SidebarBody`, `SidebarFooter`, `SidebarSection`, `SidebarHeading`,
`SidebarItem`, `SidebarLabel`, `SidebarSpacer`) with `current: true`; `Heading`, `Subheading`,
`Text`, `Strong`, `Code`, `TextLink`; `Fieldset`, `Legend`, `FieldGroup`, `Field`, `Label`,
`Description`, `ErrorMessage`; `Input`, `InputGroup`, `Textarea`, `Select`, `Listbox` /
`ListboxOption`, `Combobox` / `ComboboxOption`, `Checkbox`, `CheckboxField`, `Radio`, `RadioGroup`,
`Switch`, `SwitchField`; `Button` (`variant: .solid | .outline | .plain`, or `.outline()` /
`.plain()`), `Badge`, `Avatar`, `Divider`; `Table` (`variant: .striped | .grid | .bleed`,
`dense: true`), `TableHeader`, `TableRow`, `TableCell`; `DescriptionList` / `DescriptionTerm` /
`DescriptionDetails`; `Pagination`; `Dialog` (`DialogBody`, `DialogActions`), `Alert` (Catalyst's
small confirmation modal) and `Dropdown` (`DropdownMenu`, `DropdownItem`, `DropdownHeading`,
`DropdownDivider`, `DropdownShortcut`). Buttons, badges, switches, checkboxes, radios and avatars
take **any Tailwind colour** — `color: .indigo`, `.emerald`, `.rose`, `.zinc`, … all seventeen hues
plus `zinc`, `slate`, `gray`, `neutral`, `stone` — and buttons also take Catalyst's `.light`,
`.dark`, `.white`, `.darkWhite` and the default `.darkZinc`. From Tailwind Plus come `Hero`,
`HeroHeading`, `Eyebrow`, `Lead`, `SectionHeading`, `FeatureGrid` / `Feature`, `PricingGrid` /
`PricingTier`, `InlineAlert`, `Notification`, underline `Tabs` and `EmptyState`. Heroicons names
(`home`, `cog-6-tooth`, `magnifying-glass`, `chevron-up-down`, `ellipsis-horizontal`, …) map onto
the built-in icon set.

The custom components below — `AppSidebar`, `UserChip`, `StatBlock`, `SettingsRow` and `Tier` —
live in `mockups/tailwind/catalyst.mockitdown` and are imported with `import "tailwind/catalyst"`.

## Sign in

The `AuthLayout` puts a narrow form on the inset panel: a `Heading`, two `Field`s with `Label` and
`Input` (the password field focused, with the blue ring), a `Checkbox`, a full-width solid `Button`
and a `TextLink`.

```mockitdown source="true" appearance="both" width="760" height="640" url="https://app.northwind.example/login"
import Tailwind

AuthLayout {
  VStack {
    VStack(alignment: .stretch, spacing: 32) {
      Avatar("Northwind", initials: "NL", square: true, color: .indigo).size(.large)
      Heading("Sign in to your account")
      Field {
        Label("Email")
        Input("you@example.com", text: "ines@northwind.example")
      }
      Field {
        Label("Password")
        Input("Password", type: .password, text: "correct-horse").state(.focused)
      }
      HStack {
        Checkbox("Remember me", checked: true)
        Spacer()
        TextLink("Forgot password?").fontWeight(.semibold)
      }
      Button("Login").frame(maxWidth: .infinity)
      Text("Don’t have an account? **Sign up**")
    }
    .frame(width: 384)
  }
}
```

## Dashboard

The Catalyst demo's home page in a `SidebarLayout`: the `AppSidebar` component (#1) with the
current item marked by its left bar, a greeting `Heading` with a `Select` for the period, four
`Stat`s whose change badges are lime when up and pink when down (#2), and a `Table` of recent
orders with avatars (#3).

```mockitdown title="Dashboard" url="https://app.northwind.example/" height="900" width="1280"
import Tailwind
import "tailwind/catalyst"

SidebarLayout {
  AppSidebar(current: "Home")
    .callout(1, "Sidebar", alignment: .trailing)
  VStack(alignment: .stretch, spacing: 0) {
    Heading("Good afternoon, Ines")
    HStack {
      Subheading("Overview")
      Spacer()
      Select(selection: "Last week").frame(width: 160)
    }
    .padding(.top, 32)
    HStack(alignment: .top, spacing: 32) {
      StatBlock(title: "Total revenue", value: "$2.6M", change: "+4.5%")
        .callout(2, "Change badge", alignment: .topTrailing)
      StatBlock(title: "Average order value", value: "$455", change: "-0.5%")
      StatBlock(title: "Tickets sold", value: "5,888", change: "+4.5%")
      StatBlock(title: "Pageviews", value: "823,067", change: "+21.2%")
    }
    .padding(.top, 16)
    Subheading("Recent orders").padding(.top, 56)
    Table(columns: ["Order number", "Purchase date", "Customer", "Event", TableColumn("Amount", alignment: .trailing)]) {
      ForEach([("3000", "May 9, 2026", "Leon Weber", "Harbour Lights Festival", "US$80.00"),
               ("3001", "May 5, 2026", "Amara Okafor", "Synth Night at the Depot", "US$299.00"),
               ("3002", "Apr 28, 2026", "Tomás Ruiz", "Autumn Folk Weekender", "US$150.00"),
               ("3003", "Apr 23, 2026", "Hana Sato", "Harbour Lights Festival", "US$80.00")]) { id, date, who, event, amount in
        TableRow {
          TableCell(id)
          TableCell(date).foregroundStyle(.secondary)
          HStack(spacing: 8) {
            Avatar(who, image: "assets/images/avatar-\(id == "3000" ? 1 : (id == "3001" ? 3 : (id == "3002" ? 4 : 5))).svg")
            Text(who).foregroundStyle(.primary)
          }
          TableCell(event)
          TableCell(amount)
        }
      }
    }
    .padding(.top, 16)
    .callout(3, "Table", alignment: .topTrailing)
  }
}
```

## Orders

A `StackedLayout`: a `Navbar` with a current item (underline bar), a `NavbarDivider` and an
`AvatarButton`, then a toolbar of `InputGroup` and `Select`, an open `Dropdown` with headings,
icons, shortcuts and the blue active item, a `dense` striped `Table` with colour `Badge`s and
`Pagination`.

```mockitdown title="Orders" url="https://app.northwind.example/orders" height="800" width="1200"
import Tailwind

StackedLayout {
  Navbar {
    NavbarItem {
      Avatar("Northwind", initials: "NL", square: true, color: .indigo).size(.small)
      NavbarLabel("Northwind Labs")
    }
    NavbarDivider()
    NavbarSection {
      NavbarItem("Home")
      NavbarItem("Events")
      NavbarItem("Orders", current: true)
      NavbarItem("Broadcasts")
    }
    NavbarSpacer()
    NavbarSection {
      NavbarItem(systemImage: "magnifying-glass")
      NavbarItem(systemImage: "inbox")
      AvatarButton("Ines Moreau", image: "assets/images/avatar-2.svg", square: true)
    }
  }
  VStack(alignment: .stretch, spacing: 24) {
    HStack(alignment: .bottom) {
      VStack(alignment: .leading, spacing: 16) {
        Heading("Orders")
        HStack(spacing: 16) {
          InputGroup("Search orders…", systemImage: "magnifying-glass").frame(width: 280)
          Select(selection: "Sort by date").frame(width: 170)
        }
      }
      Spacer()
      Dropdown("Export", open: true) {
        DropdownHeading("Format")
        DropdownItem("CSV spreadsheet", systemImage: "document-text", shortcut: "⌘E").state(.focused)
        DropdownItem("PDF summary", systemImage: "printer", shortcut: "⌘P")
        DropdownDivider()
        DropdownHeading("Share")
        DropdownItem("Copy link", systemImage: "link", shortcut: "⌘L")
        DropdownItem("Email to team", systemImage: "envelope")
      }
      Button("Create order")
    }
    Table(columns: ["Order", "Date", "Customer", "Event", "Status", TableColumn("Amount", alignment: .trailing)], variant: .striped, dense: true) {
      ForEach([("3010", "May 12", "Leon Weber", "Harbour Lights Festival", "Paid", "lime", "US$80.00"),
               ("3009", "May 11", "Amara Okafor", "Synth Night at the Depot", "Refunded", "zinc", "US$299.00"),
               ("3008", "May 11", "Tomás Ruiz", "Autumn Folk Weekender", "Pending", "amber", "US$150.00"),
               ("3007", "May 10", "Hana Sato", "Harbour Lights Festival", "Paid", "lime", "US$160.00"),
               ("3006", "May 9", "Priya Natarajan", "Synth Night at the Depot", "Failed", "red", "US$299.00"),
               ("3005", "May 9", "Jonas Berg", "Autumn Folk Weekender", "Paid", "lime", "US$75.00"),
               ("3004", "May 8", "Chloé Martin", "Harbour Lights Festival", "Disputed", "purple", "US$80.00")]) { id, date, who, event, status, tone, amount in
        TableRow {
          TableCell(id)
          TableCell(date).foregroundStyle(.secondary)
          TableCell(who)
          TableCell(event).foregroundStyle(.secondary)
          Badge(status, color: tone)
          TableCell(amount)
        }
      }
    }
    Pagination(count: 12, page: 2)
  }
}
```

## Order detail

A detail page: a back `Link`, `Heading` with a `Badge`, outline and solid `Button`s, a
`DescriptionList` for the summary, and Catalyst's `Alert` — the small confirmation modal — asking
before a refund.

```mockitdown source="true" title="Order #3008" url="https://app.northwind.example/orders/3008" height="720" width="1100"
import Tailwind

SidebarLayout {
  Sidebar {
    SidebarBody {
      SidebarSection {
        SidebarItem("Home", systemImage: "home")
        SidebarItem("Orders", systemImage: "ticket", current: true)
        SidebarItem("Settings", systemImage: "cog-6-tooth")
      }
    }
  }
  VStack(alignment: .stretch, spacing: 0) {
    Label("Orders", systemImage: "chevron-left").foregroundStyle(.secondary)
    HStack(spacing: 16) {
      Heading("Order #3008")
      Badge("Pending", color: .amber)
      Spacer()
      Button("Resend invoice", variant: .outline)
      Button("Refund")
    }
    .padding(.top, 16)
    HStack(spacing: 24) {
      Label("US$150.00", systemImage: "banknotes")
      Label("Mastercard ending 1254", systemImage: "credit-card")
      Label("May 11, 2026", systemImage: "calendar")
    }
    .padding(.top, 8)
    VStack(alignment: .stretch, spacing: 16) {
      Subheading("Summary")
      Divider()
    }
    .padding(.top, 48)
    DescriptionList {
      DescriptionTerm("Customer")
      DescriptionDetails("Tomás Ruiz")
      DescriptionTerm("Event")
      DescriptionDetails("Autumn Folk Weekender")
      DescriptionTerm("Amount")
      DescriptionDetails("US$150.00")
      DescriptionTerm("Amount after exchange rate")
      DescriptionDetails("US$150.00 → CA$205.21")
      DescriptionTerm("Fee")
      DescriptionDetails("US$4.65")
    }
  }
  Alert("Are you sure you want to refund this payment?", description: "The refund will be reflected in the customer’s bank account 2 to 3 business days after processing.") {
  } actions: {
    Button("Cancel", variant: .plain)
    Button("Refund")
  }
}
```

## Settings

The Catalyst settings page: rows of `SettingsRow` (a custom component — `Subheading` and `Text` on
the left, the control on the right, a soft `Divider` below) holding `Input`, `Textarea`, an open
`Listbox` with its check mark and blue active option, a `CheckboxField` and `SwitchField`s in
Tailwind colours, plus a `Fieldset` with a `RadioGroup`.

```mockitdown source="true" appearance="both" title="Settings" url="https://app.northwind.example/settings" height="1080" width="1000"
import Tailwind
import "tailwind/catalyst"

VStack(alignment: .stretch, spacing: 32) {
  Heading("Settings")
  Divider()
  SettingsRow(title: "Organization Name", help: "This will be displayed on your public profile.") {
    Input("Name", text: "Northwind Labs")
  }
  SettingsRow(title: "Organization Bio", help: "This will be displayed on your public profile. Maximum 240 characters.") {
    Textarea("Bio", rows: 3)
  }
  SettingsRow(title: "Notifications", help: "Choose what reaches your inbox.") {
    SwitchGroup {
      SwitchField("Order receipts", isOn: true, description: "A copy of every receipt sent to a customer.", color: .emerald)
      SwitchField("Weekly digest", isOn: false, description: "Revenue and ticket sales every Monday.")
    }
  }
  HStack(alignment: .top, spacing: 32) {
    Fieldset {
      Legend("Payout schedule")
      Text("Payouts land in your bank account on the chosen cadence.")
      RadioGroup(selection: "Weekly") {
        Radio("Daily")
        Radio("Weekly")
        Radio("Monthly")
      }
    }
    .frame(maxWidth: .infinity)
    CheckboxField("Allow embedding", description: "Allow others to embed your event details on their own site.", checked: true)
      .frame(maxWidth: .infinity)
  }
  Divider(soft: true)
  SettingsRow(title: "Currency", help: "The currency that your organization will be collecting.") {
    Listbox(selection: "CAD - Canadian Dollar", open: true) {
      ListboxOption("USD - United States Dollar")
      ListboxOption("CAD - Canadian Dollar")
      ListboxOption("EUR - Euro")
    }
  }
  HStack(spacing: 16) {
    Spacer()
    Button("Reset", variant: .plain)
    Button("Save changes")
  }
  .padding(.top, 48)
}
.padding(40)
```

## Colours and variants

Catalyst's colour props on one page: solid `Button`s in the special colours and a few hues, the
outline and plain variants, a `Badge` in every Tailwind colour, `Switch`es and `Checkbox`es with
`color:`, and square and round `Avatar`s.

```mockitdown source="true" title="Components" height="440" width="1000"
import Tailwind

VStack(alignment: .leading, spacing: 28) {
  HStack(spacing: 12) {
    Button("Dark/zinc")
    Button("Light", color: .light)
    Button("Dark/white", color: .darkWhite)
    Button("Indigo", color: .indigo)
    Button("Cyan", color: .cyan)
    Button("Rose", color: .rose)
    Button("Outline", systemImage: "arrow-down-tray", variant: .outline)
    Button("Plain", systemImage: "plus").plain()
  }
  HStack(spacing: 8, wrap: true) {
    ForEach(["zinc", "red", "orange", "amber", "yellow", "lime", "green", "emerald", "teal", "cyan", "sky"]) { c in
      Badge(c, color: c)
    }
  }
  HStack(spacing: 8, wrap: true) {
    ForEach(["blue", "indigo", "violet", "purple", "fuchsia", "pink", "rose", "slate", "gray", "neutral", "stone"]) { c in
      Badge(c, color: c)
    }
  }
  HStack(spacing: 24) {
    Switch(isOn: true)
    Switch(isOn: true, color: .indigo)
    Switch(isOn: true, color: .emerald)
    Switch(isOn: true, color: .amber)
    Switch(isOn: true, color: .rose)
    Switch(isOn: false)
    Divider()
    Checkbox(checked: true)
    Checkbox(checked: true, color: .indigo)
    Checkbox(checked: .indeterminate, color: .sky)
    Checkbox(checked: false)
  }
  HStack(spacing: 16) {
    Avatar("Ines Moreau", image: "assets/images/avatar-2.svg")
    Avatar("Leon Weber", image: "assets/images/avatar-1.svg").size(.large)
    Avatar("TW", initials: "TW")
    Avatar("Amara Okafor", color: .violet).size(.large)
    Avatar("Northwind", initials: "NL", square: true, color: .indigo).size(.large)
    Code("color=\"indigo\"")
    TextLink("Read the docs")
  }
}
.padding(40)
```

## Event overview

The `AppSidebar` again with another current item, a `Heading` with `Badge` and `Kbd` hint, an
`AreaChart` of ticket sales in the Tailwind data colours, a Tailwind Plus activity feed
(`Timeline` with icon circles) and an `EmptyState` for a section that has nothing yet.

```mockitdown title="Event overview" url="https://app.northwind.example/events/harbour-lights" height="900" width="1280"
import Tailwind
import "tailwind/catalyst"

SidebarLayout {
  AppSidebar(current: "Events")
  VStack(alignment: .stretch, spacing: 32) {
    HStack(spacing: 16) {
      Avatar("Harbour Lights", image: "assets/images/photo-3.svg", square: true).size(.xlarge)
      VStack(alignment: .leading, spacing: 4) {
        HStack(spacing: 12) {
          Heading("Harbour Lights Festival")
          Badge("On sale", color: .lime)
        }
        Text("Aug 14–16, 2026 at Pier 21, Halifax · 6,412 / 8,000 tickets sold")
      }
      Spacer()
      Kbd(keys: ["⌘", "K"])
      Button("Edit", variant: .outline)
      Button("View", systemImage: "eye")
    }
    HStack(alignment: .top, spacing: 48) {
      VStack(alignment: .stretch, spacing: 16) {
        Subheading("Ticket sales")
        Divider()
        AreaChart(series: [[120, 180, 260, 240, 420, 610, 580, 760], [40, 60, 90, 110, 150, 220, 260, 300]],
                  labels: ["Jun 1", "Jun 8", "Jun 15", "Jun 22", "Jun 29", "Jul 6", "Jul 13", "Jul 20"],
                  seriesNames: ["General admission", "VIP"])
          .frame(height: 240)
        Subheading("Broadcasts").padding(.top, 16)
        EmptyState("No broadcasts yet", systemImage: "megaphone", description: "Send ticket holders set times, maps and last-minute changes.") {
          Button("New broadcast", systemImage: "plus")
        }
      }
      .frame(maxWidth: .infinity)
      VStack(alignment: .stretch, spacing: 16) {
        Subheading("Activity")
        Divider()
        Timeline {
          TimelineItem("Payout of US$48,210 sent", time: "Jul 21", status: .done, systemImage: "check")
          TimelineItem("Lineup announced to 6,102 ticket holders", time: "Jul 18", status: .info, systemImage: "megaphone")
          TimelineItem("VIP tier sold out", time: "Jul 12", status: .done, systemImage: "ticket")
          TimelineItem("Ines Moreau changed the venue map", time: "Jul 9", systemImage: "user")
          TimelineItem("Sales opened", time: "Jun 1", systemImage: "bolt")
        }
      }
      .frame(width: 340)
    }
  }
}
```

## Edit dialog with a notification

A `Dialog` with `description:`, a `Field` grid, a `Combobox` open on its matches and an
`ErrorMessage`; behind it a Tailwind Plus `Notification` and an `InlineAlert` on the page.

```mockitdown title="Edit event" url="https://app.northwind.example/events/harbour-lights" height="760" width="1100"
import Tailwind

VStack(alignment: .stretch, spacing: 24) {
  HStack {
    Heading("Harbour Lights Festival")
    Spacer()
    Button("Edit", variant: .outline)
  }
  InlineAlert("Ticket sales close in 3 days", message: "Extend the sale window or publish a waitlist before Friday.", severity: .warning)
  Tabs(selection: "Details") {
    Tab("Details") { Text("…") }
    Tab("Tickets") { Text("…") }
    Tab("Attendees") { Text("…") }
    Tab("Payouts") { Text("…") }
  }
  Dialog("Edit event", description: "Changes are visible to ticket holders as soon as you save.") {
    Field {
      Label("Event name")
      Input("Name", text: "Harbour Lights Festival")
    }
    HStack(alignment: .top, spacing: 16) {
      Field {
        Label("Venue city")
        Combobox("Search cities…", selection: "Halifax, NS", open: true) {
          ComboboxOption("Halifax, NS")
          ComboboxOption("Halmstad, SE")
          ComboboxOption("Halle (Saale), DE")
        }
      }
      Field {
        Label("Capacity")
        Input("0", text: "120000").state(.error)
        ErrorMessage("Capacity cannot exceed the venue limit of 8,000.")
      }
    }
  } actions: {
    Button("Cancel", variant: .plain)
    Button("Save changes")
  }
  Notification("Event saved", description: "Harbour Lights Festival is live on your public page.", systemImage: "check-circle")
}
.padding(40)
```

## Landing page

Tailwind Plus marketing sections: a centred `Hero` with a pill `Eyebrow`, `HeroHeading`, `Lead` and
two buttons; a `FeatureGrid` of `Feature`s with indigo icon tiles; and a `PricingGrid` of the `Tier`
component, the featured tier ringed in indigo.

```mockitdown title="Landing" url="https://northwind.example/" height="1860" width="1200"
import TailwindPlus
import "tailwind/catalyst"

VStack(alignment: .stretch, spacing: 0) {
  HStack(spacing: 40) {
    Avatar("Northwind", initials: "NL", square: true, color: .indigo)
    Text("Product").fontWeight(.semibold)
    Text("Features").fontWeight(.semibold)
    Text("Pricing").fontWeight(.semibold)
    Text("Company").fontWeight(.semibold)
    Spacer()
    Text("Log in →").fontWeight(.semibold)
  }
  .padding(24)
  Hero {
    Eyebrow("Announcing our next round of funding. **Read more →**", variant: .pill)
    HeroHeading("Sell out every show you put on")
    Lead("Ticketing, payouts and attendee messaging in one calm dashboard, built for independent venues and festival teams.")
    HStack(spacing: 24) {
      Button("Get started", color: .indigo)
      Text("Learn more →").fontWeight(.semibold)
    }
    .padding(.top, 16)
  }
  VStack(spacing: 64) {
    VStack(spacing: 16) {
      Eyebrow("Sell faster")
      SectionHeading("Everything you need to run the door")
      Lead("From the first presale to the last scan at the gate, every step lives in one place.")
    }
    FeatureGrid(columns: 2) {
      Feature("Instant checkout", description: "Wallet payments and saved cards turn a click into a ticket in seconds.", systemImage: "bolt")
      Feature("Fraud-proof scanning", description: "Rotating QR codes make screenshots useless and resale impossible.", systemImage: "shield-check")
      Feature("Payouts every week", description: "Revenue lands in your bank account each Monday, fees itemised.", systemImage: "banknotes")
      Feature("Attendee messaging", description: "Reach every ticket holder with schedule changes and set times.", systemImage: "envelope")
    }
    .frame(maxWidth: 860)
  }
  .padding(64)
  VStack(spacing: 48) {
    VStack(spacing: 16) {
      Eyebrow("Pricing")
      SectionHeading("Pricing that grows with you")
    }
    PricingGrid {
      Tier(name: "Club", price: "$19", blurb: "For a single room running a few shows a month.", features: ["Up to 5 events a month", "Weekly payouts", "Email support"])
      Tier(name: "Venue", price: "$49", blurb: "For busy venues with a full calendar.", features: ["Unlimited events", "Reserved seating", "Box office app", "Priority support"], featured: true)
      Tier(name: "Festival", price: "$149", blurb: "For multi-stage, multi-day events.", features: ["Everything in Venue", "Wristband scanning", "Dedicated manager"])
    }
  }
  .padding(.horizontal, 64)
  .padding(.bottom, 80)
}
```
