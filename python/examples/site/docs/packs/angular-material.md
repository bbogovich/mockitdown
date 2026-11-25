# Angular Material

The `angular-material` pack imitates **Angular Material 20** with its default **Material 3**
theme (the azure palette: primary `#005cbb` light, `#abc7ff` dark), Roboto and the M3 type scale,
pill-shaped buttons, 12 px cards, 28 px dialogs, filled and outlined form fields and tonal surfaces.
Select it with `import AngularMaterial` (or `import Angular`).

Elements use the component names of the library with the `Mat` prefix in PascalCase:
`MatToolbar`, `MatSidenavContainer` / `MatSidenav`, `MatNavList`, `MatList` / `MatListItem`,
`MatCard`, `MatButton` (`variant: "text" | "filled" | "tonal" | "outlined" | "elevated"`, as
`matButton="…"`), `MatIconButton`, `MatFab` / `MatMiniFab` / `MatExtendedFab`,
`MatButtonToggleGroup`, `MatFormField` (`.appearance(.outline)`; `label`, `helper` = `mat-hint`,
`error` = `mat-error`), `MatSelect`, `MatAutocomplete`, `MatCheckbox`, `MatRadioGroup`,
`MatSlideToggle`, `MatSlider`, `MatChipSet` / `MatChipListbox` / `MatChipGrid` with `MatChip`,
`MatChipOption`, `MatChipRow`, `MatDatepicker`, `MatTimepicker`, `MatCalendar`, `MatTable`,
`MatSortHeader`, `MatPaginator`, `MatTabGroup` / `MatTab`, `MatTabNavBar`, `MatStepper` / `MatStep`,
`MatAccordion` / `MatExpansionPanel`, `MatMenu` / `MatMenuItem`, `MatDialog`, `MatBottomSheet`,
`MatSnackBar`, `MatTooltip`, `MatProgressBar`, `MatProgressSpinner`, `MatBadge`, `MatDivider`,
`MatIcon`, `MatTree`, `MatGridList`. Material Icons / Symbols names (`more_vert`, `receipt_long`,
`notifications`) work as icon names. The core SwiftUI vocabulary (`VStack`, `Text`, `Button`,
`NavigationStack`, …) keeps working and picks up the Material 3 look.

The custom components used below (`AdminShell`, `StatCard`, `ContactRow`, `ToggleRow`) live in
`mockups/angular-material/shell.mockitdown` and are imported with `import "angular-material/shell"`.

## Sign in

```mockitdown source="true" appearance="both" width="460" height="560" chrome="none" title="Sign in"
import AngularMaterial

VStack {
  Spacer()
  VStack {
    MatCard {
      VStack(alignment: .leading, spacing: 4) {
        Text("Sign in").font(.headlineSmall)
        Text("Use your Acme account").font(.bodyMedium).foregroundStyle(.secondary)
      }
      .padding(.bottom, 8)
      MatFormField("Email", text: "dana.ruiz@acme.io", systemImage: "mail").appearance(.outline)
      MatFormField("Password", text: "hunter2hunter2", kind: .password, trailingIcon: "visibility_off",
                   helper: "At least 12 characters").appearance(.outline)
      HStack {
        MatCheckbox("Keep me signed in", checked: true)
        Spacer()
        MatButton("Forgot password?")
      }
      MatButton("Sign in", variant: "filled").frame(maxWidth: .infinity)
      MatDivider(label: "or")
      MatButton("Continue with SSO", systemImage: "key", variant: "outlined").frame(maxWidth: .infinity)
    }
    .appearance(.outlined)
  }
  .frame(width: 380)
  Spacer()
}
.frame(maxWidth: .infinity, maxHeight: .infinity)
```

## Admin dashboard

The shell is a `MatToolbar` above a `MatSidenavContainer` whose `MatNavList` marks the active
route; the dashboard is a grid of raised `MatCard`s.

```mockitdown device="desktop" title="Dashboard" url="https://console.acme.io/dashboard"
import AngularMaterial
import "angular-material/shell"

AdminShell(active: "Dashboard") {
  VStack(alignment: .leading, spacing: 20) {
    HStack {
      VStack(alignment: .leading, spacing: 2) {
        Text("Good morning, Dana").font(.headlineSmall)
        Text("Here is what happened in your store this week.").foregroundStyle(.secondary)
      }
      Spacer()
      MatButtonToggleGroup(items: ["Day", "Week", "Month"], value: "Week")
      MatButton("Export", systemImage: "download", variant: "tonal")
    }
    Grid(columns: 4, spacing: 16) {
      StatCard(label: "Revenue", value: "$48,210", change: "+12%", icon: "payments", trend: [4, 6, 5, 8, 7, 9, 11])
      StatCard(label: "Orders", value: "1,284", change: "+4%", icon: "receipt_long", trend: [6, 5, 7, 6, 8, 7, 9])
      StatCard(label: "Customers", value: "312", change: "+9%", icon: "group", trend: [2, 3, 3, 5, 4, 6, 7])
      StatCard(label: "Refunds", value: "$1,020", change: "-3%", up: false, icon: "undo", trend: [5, 4, 6, 3, 4, 3, 2])
    }
    HStack(alignment: .top, spacing: 16) {
      MatCard(title: "Sales by channel", subtitle: "Last 7 days") {
        Chart(kind: .bar, series: [[12, 18, 15, 22, 19, 26, 24], [8, 9, 11, 10, 14, 12, 15]],
              labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], height: 200)
      } headerAction: {
        MatIconButton("more_vert")
      }
      .frame(maxWidth: .infinity)
      MatCard(title: "Recent orders") {
        MatList {
          MatListItem("#1042 · Ana Lima", subtitle: "2 items · Paid", detail: "$129", systemImage: "shopping_bag")
          MatListItem("#1041 · Ben Ode", subtitle: "1 item · Pending", detail: "$48", systemImage: "shopping_bag")
          MatListItem("#1040 · Chloe Wu", subtitle: "5 items · Shipped", detail: "$312", systemImage: "local_shipping")
        }
      } actions: {
        MatButton("View all orders")
      }
      .frame(width: 380)
    }
    .frame(maxWidth: .infinity)
  }
}
```

## Orders table

`MatTable` with row selection (a `SelectionModel` column), a `matSort` header, a filter field and
`MatChipListbox` filters above it and a `MatPaginator` below.

```mockitdown device="desktop" title="Orders" url="https://console.acme.io/orders" source="true"
import AngularMaterial
import "angular-material/shell"

AdminShell(active: "Orders") {
  VStack(alignment: .leading, spacing: 16) {
    HStack {
      Text("Orders").font(.headlineSmall)
      Spacer()
      MatButton("Import", systemImage: "file_upload", variant: "outlined")
      MatButton("New order", systemImage: "add", variant: "filled")
    }
    HStack(spacing: 16) {
      MatFormField("Filter", text: "lima", systemImage: "search", clearable: true).appearance(.outline).frame(width: 320)
      MatChipListbox {
        MatChipOption("Paid", selected: true)
        MatChipOption("Pending")
        MatChipOption("Shipped", selected: true)
        MatChipOption("Refunded")
      }
      Spacer()
      MatTooltip("Columns") { MatIconButton("view_column") }
    }
    MatTable(columns: ["Order", "Customer", "Date", "Status", MatSortHeader("Total")],
             rows: [
               ["#1042", "Ana Lima", "Nov 23, 2026", MatChip("Paid", systemImage: "check_circle"), "$129.00"],
               ["#1039", "Lima Foods Ltd.", "Nov 22, 2026", MatChip("Shipped", systemImage: "local_shipping"), "$2,480.00"],
               ["#1031", "Paulo Lima", "Nov 20, 2026", MatChip("Paid", systemImage: "check_circle"), "$64.50"],
               ["#1027", "Lima & Sons", "Nov 18, 2026", MatChip("Shipped", systemImage: "local_shipping"), "$910.00"],
               ["#1019", "Rita Lima", "Nov 15, 2026", MatChip("Paid", systemImage: "check_circle"), "$38.00"]
             ],
             selectable: true, selectedRows: [1, 3], sortColumn: "Total",
             footer: { MatPaginator("1 – 5 of 23") })
  }
}
```

## Registration stepper

A horizontal `MatStepper`: completed steps show a check, the current step's content follows the
header. Fields mix the `fill` (default) and `outline` appearances.

```mockitdown device="desktop" title="Create account" url="https://acme.io/signup" appearance="both" width="1000" height="640"
import AngularMaterial

VStack {
  Spacer()
  VStack {
    MatCard {
      MatStepper(selection: 1) {
        MatStep("Account") { Text("Done") }
        MatStep("Profile") {
          VStack(alignment: .leading, spacing: 20) {
            Text("Tell us about yourself").font(.titleMedium)
            HStack(spacing: 16) {
              MatFormField("First name", text: "Dana")
              MatFormField("Last name", text: "Ruiz")
            }
            .frame(maxWidth: .infinity)
            HStack(spacing: 16) {
              MatSelect("Country", options: ["Portugal", "Spain", "France"], value: "Portugal")
              MatDatepicker("Date of birth", selection: "1991-04-17")
            }
            .frame(maxWidth: .infinity)
            MatFormField("Phone", text: "+351 912", helper: "Include the country code", error: "Enter a complete phone number")
              .appearance(.outline)
            MatFormField("Company (optional)", placeholder: "Acme Inc.").appearance(.outline).state(.focused)
            HStack {
              MatButton("Back")
              Spacer()
              MatButton("Next", variant: "filled")
            }
          }
        }
        MatStep("Plan") { Text("Choose a plan") }
        MatStep("Confirm") { Text("Review") }
      }
    }
  }
  .frame(width: 820)
  Spacer()
}
.frame(maxWidth: .infinity, maxHeight: .infinity)
```

## Settings

Slide toggles, a `MatSelect`, a `MatButtonToggleGroup`, a `MatSlider`, radio buttons and checkboxes
inside `MatTabNavBar` sections.

```mockitdown device="desktop" title="Settings" url="https://console.acme.io/settings" appearance="both" source="true"
import AngularMaterial
import "angular-material/shell"

AdminShell(active: "Settings") {
  VStack(alignment: .leading, spacing: 16) {
    Text("Settings").font(.headlineSmall)
    MatTabNavBar(items: ["General", "Notifications", "Billing", "Security"], selection: 0).variant(.start)
    HStack(alignment: .top, spacing: 16) {
      MatCard(title: "Preferences") {
        ToggleRow(title: "Dark theme", detail: "Use the dark palette across the console", on: true)
        ToggleRow(title: "Compact density", detail: "Show more rows in tables")
        ToggleRow(title: "Weekly digest", detail: "Email a summary every Monday", on: true)
        MatDivider()
        MatSelect("Language", options: ["English (US)", "Português", "Deutsch"], value: "English (US)")
          .appearance(.outline)
        MatSelect("Time zone", value: "Europe/Lisbon (GMT+0)", helper: "Used for reports and schedules")
          .appearance(.outline)
      }
      .appearance(.outlined)
      .frame(maxWidth: .infinity)
      MatCard(title: "Display") {
        Text("Start page").font(.titleSmall)
        MatButtonToggleGroup(items: ["Dashboard", "Orders", "Reports"], value: "Orders")
        Text("Text size").font(.titleSmall)
        MatSlider(value: 60, in: 0...100, ticks: 5, minLabel: "A", maxLabel: "A")
        MatRadioGroup("Currency format", options: ["$1,234.56", "1.234,56 $", "1 234,56 $"], value: "$1,234.56")
        MatCheckbox("Show prices with tax", checked: true)
        MatCheckbox("Round to whole numbers")
      } actions: {
        MatButton("Reset")
        MatButton("Save changes", variant: "filled")
      }
      .appearance(.outlined)
      .frame(maxWidth: .infinity)
    }
    .frame(maxWidth: .infinity)
  }
}
```

## Mobile: contacts

A phone layout with a `MatToolbar`, a filter `MatChipSet`, a two-line `MatList` with subheaders and
an extended `MatFab`.

```mockitdown device="phone" title="Contacts" source="true"
import AngularMaterial
import "angular-material/shell"

VStack(alignment: .stretch, spacing: 0) {
  MatToolbar("Contacts", menu: true) {
    MatIconButton("search")
    MatIconButton("more_vert")
  }
  ScrollView(.horizontal) {
    MatChipSet {
      MatChipOption("All", selected: true)
      MatChipOption("Favorites")
      MatChipOption("Work")
      MatChipOption("Family")
    }
  }
  .padding(.horizontal, 16)
  .padding(.bottom, 8)
  MatList {
    MatListSubheader("Favorites")
    ContactRow(name: "Ana Lima", line: "Product designer · Lisbon", meta: "9:41")
    ContactRow(name: "Ben Ode", line: "On a call until 11:00", meta: "Mon")
    MatDivider()
    MatListSubheader("All contacts")
    ContactRow(name: "Chloe Wu", line: "Sent you the Q4 report")
    ContactRow(name: "Diego Marín", line: "Engineering · Madrid")
    ContactRow(name: "Eva Novak", line: "Customer success")
    ContactRow(name: "Farid Haddad", line: "Sales · Dubai")
    ContactRow(name: "Grace Park", line: "Marketing")
  }
  .frame(maxHeight: .infinity)
  MatExtendedFab("New contact", icon: "person_add")
}
.frame(maxHeight: .infinity)
```

## Row menu, tooltip and snack bar

An open `MatMenu` on a card's overflow button, a `MatTooltip`, a `MatProgressBar` and a
`MatSnackBar` confirming an action. The file tree on the left is a `MatTree`.

```mockitdown device="desktop" title="Files" url="https://drive.acme.io/projects"
import AngularMaterial

VStack(alignment: .stretch, spacing: 0) {
  MatToolbar("Acme Drive", logo: "folder", search: "Search in Drive") {
    MatIconButton("settings")
    Avatar("Dana Ruiz", image: "assets/images/avatar-2.svg")
  }
  HStack(alignment: .top, spacing: 0) {
    VStack(alignment: .stretch, spacing: 8) {
      HStack {
        MatExtendedFab("New", icon: "add", inline: true, color: "surface")
        Spacer()
      }
      .padding(.bottom, 8)
      MatTree {
        MatTreeNode("My files", systemImage: "folder", expanded: true) {
          MatTreeNode("Projects", systemImage: "folder", expanded: true) {
            MatTreeNode("Redesign", systemImage: "folder").selected()
            MatTreeNode("Q4 campaign", systemImage: "folder")
          }
          MatTreeNode("Invoices", systemImage: "folder") { MatTreeNode("2026", systemImage: "folder") }
          MatTreeNode("notes.md", systemImage: "description")
        }
        MatTreeNode("Shared with me", systemImage: "group") { MatTreeNode("Legal", systemImage: "folder") }
        MatTreeNode("Trash", systemImage: "delete")
      }
      Spacer()
      MatProgressBar(label: "Storage", value: 0.62, currentValueLabel: "6.2 GB of 10 GB used")
    }
    .frame(width: 280, maxHeight: .infinity)
    .padding(16)
    VStack(alignment: .leading, spacing: 16) {
      HStack {
        Text("Website redesign").font(.headlineSmall)
        Spacer()
        MatTooltip("Grid view", placement: .bottom) { MatIconButton("grid_view") }
        MatIconButton("info")
      }
      Grid(columns: 3, spacing: 16) {
        MatCard(title: "Wireframes.fig", subtitle: "Edited 2 h ago", image: "assets/images/photo-1.svg", mediaHeight: 120) {
        } headerAction: { MatIconButton("more_vert") }
        MatCard(title: "Moodboard", subtitle: "Edited yesterday", image: "assets/images/photo-2.svg", mediaHeight: 120) {
        } headerAction: {
          MatMenu(systemImage: "more_vert", open: true) {
            MatMenuItem("Open", systemImage: "open_in_new")
            MatMenuItem("Share", systemImage: "share")
            MatMenuItem("Rename", systemImage: "edit")
            MatMenuItem("Make a copy", systemImage: "content_copy")
            MatDivider()
            MatMenuItem("Move to trash", systemImage: "delete")
          }
        }
        MatCard(title: "Copy deck", subtitle: "Edited Nov 18", image: "assets/images/photo-3.svg", mediaHeight: 120) {
        } headerAction: { MatIconButton("more_vert") }
      }
      .frame(maxWidth: .infinity)
    }
    .frame(maxWidth: .infinity)
    .padding(24)
  }
  .frame(maxHeight: .infinity)
  MatSnackBar("“Q4 campaign” moved to Trash", action: "Undo")
}
```

## Dialog with calendar and time picker

An open `MatDialog` (28 px corners, headline, actions on the end) over a page; it holds outlined
fields, a `MatCalendar` and a `MatTimepicker`.

```mockitdown device="desktop" title="Schedule" url="https://console.acme.io/customers/ana-lima" appearance="both" width="1100" height="720"
import AngularMaterial
import "angular-material/shell"

AdminShell(active: "Customers") {
  VStack(alignment: .leading, spacing: 16) {
    Text("Ana Lima").font(.headlineSmall)
    MatCard(title: "Upcoming") { Text("No meetings scheduled.") }.appearance(.outlined)
  }
  MatDialog("Schedule a call") {
    MatFormField("Subject", text: "Quarterly review").appearance(.outline)
    HStack(alignment: .top, spacing: 16) {
      MatCalendar(selection: "2026-11-26", showToday: true).frame(width: 300)
      VStack(alignment: .stretch, spacing: 16) {
        MatTimepicker("Start", selection: "10:30 AM").appearance(.outline)
        MatSelect("Duration", value: "45 minutes").appearance(.outline)
        MatChipGrid {
          MatChipRow("Ana Lima", avatar: "Ana Lima")
          MatChipRow("Ben Ode", avatar: "Ben Ode")
        }
        MatCheckbox("Send calendar invite", checked: true)
      }
      .frame(maxWidth: .infinity)
    }
  } actions: {
    MatButton("Cancel")
    MatButton("Schedule", variant: "filled")
  }
}
```

## Help center: tabs and expansion panels

```mockitdown device="desktop" title="Help" url="https://acme.io/help" source="true"
import AngularMaterial

VStack(alignment: .stretch, spacing: 0) {
  MatToolbar("Help center", color: "primary", navigationIcon: "arrow_back") {
    MatIconButton("search")
  }
  MatTabGroup(selection: 1) {
    MatTab("Getting started", systemImage: "rocket_launch") { Text("…") }
    MatTab("Billing", systemImage: "credit_card") {
      HStack(alignment: .top, spacing: 24) {
        MatAccordion {
          MatExpansionPanel("How do I change my plan?", description: "Plans and upgrades")
          MatExpansionPanel("When am I charged?", description: "Billing cycle", expanded: true) {
            Text("You are charged on the first day of each billing period. Annual plans are charged once a year on the day you subscribed.")
            HStack {
              Spacer()
              MatButton("Contact billing")
              MatButton("View invoices", variant: "tonal")
            }
          }
          MatExpansionPanel("Can I get a refund?", description: "Within 30 days")
          MatExpansionPanel("Which payment methods are accepted?", description: "Cards, SEPA, PayPal")
        }
        .frame(maxWidth: .infinity)
        MatCard(title: "Still need help?", subtitle: "We reply within a day") {
          MatProgressSpinner(value: 0.7)
          Text("Current wait time: about 4 minutes.")
        } actions: {
          MatButton("Start a chat", systemImage: "chat", variant: "filled")
        }
        .appearance(.filled)
        .frame(width: 300)
      }
      .padding(24)
    }
    MatTab("Account", systemImage: "person") { Text("…") }
    MatTab("Developers", systemImage: "code") { Text("…") }
  }
  .frame(maxHeight: .infinity)
}
.frame(maxHeight: .infinity)
```
