# Material UI

The **mui** pack imitates [Material UI](https://mui.com/material-ui/) **v9** (MUI Core for React, with
MUI X data grid, date pickers and charts) in its **default theme**: Roboto, primary `#1976d2`
(`#90caf9` in dark mode), secondary `#9c27b0`, 4px corners, the 24-step elevation shadows and, in dark
mode, the lighter Paper overlays that MUI paints on raised surfaces. Select it with

```swift
import MUI          // or: import MaterialUI
```

Elements use MUI's own component and prop names — `AppBar`, `Toolbar`, `Typography(variant: "h5")`,
`Button(variant: "contained", color: "secondary", startIcon:)`, `IconButton`, `Fab`, `TextField(variant:
"outlined" | "filled" | "standard", helperText:, error:)`, `Select`, `Autocomplete`, `Checkbox`,
`Switch`, `Slider`, `Rating`, `Chip(onDelete:)`, `Avatar`, `Badge`, `Card(title:, subheader:, avatar:,
image:)` with an `actions:` slot, `Paper(elevation:)`, `Accordion`, `Alert(severity:, variant:)`,
`Snackbar`, `Dialog`, `Drawer`, `List` / `ListItem(secondary:)` / `ListItemButton`, `Menu` /
`MenuItem`, `Tabs`, `BottomNavigation`, `Breadcrumbs`, `Pagination`, `TablePagination`, `Stepper`,
`Table`, `DataGrid`, `LinearProgress`, `CircularProgress`, `Skeleton`, `DatePicker`, `DateCalendar` and
the MUI X charts. Material icon names (`"inbox"`, `"more_vert"`, `"shopping_cart"`) work everywhere
an icon is accepted.

The custom components used below — `StatCard`, `ProductCard`, `SettingRow`, `ContactRow` and
`TableToolbar` — are ordinary structs in
[`mockups/mui/components.mockitdown`](https://github.com/), imported with `import "mui/components"`.

## Sign in

A centered `Paper` card with an icon `Avatar`, outlined text fields, a checkbox and full-width buttons.

```mockitdown source="true" appearance="both" height="700" url="https://acme.example.com/sign-in"
import MUI
@Screen(title: "Sign in", id: "MUI-1")

VStack(spacing: 24) {
  Spacer()
  Paper(elevation: 3) {
    VStack(alignment: .leading, spacing: 16) {
      VStack(spacing: 8) {
        Avatar(icon: "lock", color: "secondary")
        Typography("Sign in", variant: "h5")
      }
      .frame(maxWidth: .infinity)
      TextField("Email Address", value: "ana.lima@acme.com", required: true)
      TextField("Password", type: "password", value: "correct horse", required: true, state: "focused")
      Checkbox("Remember me", checked: true)
      Button("Sign in", variant: "contained", size: "large").frame(maxWidth: .infinity)
      HStack {
        Link("Forgot password?").font(.body2)
        Spacer()
        Link("Don't have an account? Sign up").font(.body2)
      }
      Divider(label: "or")
      Button("Sign in with Google", variant: "outlined", startIcon: "globe").frame(maxWidth: .infinity)
    }
    .padding(32)
  }
  .frame(width: 420)
  Typography("Copyright © Acme 2026.", variant: "body2", color: "text.secondary")
  Spacer()
}
.frame(maxWidth: .infinity, maxHeight: .infinity)
```

## Mobile inbox

An Android phone: a primary `AppBar`, a `List` of conversations (the imported `ContactRow`), a
floating `Fab` and a `BottomNavigation` with a badge.

```mockitdown source="true" appearance="both" device="phone"
import MUI
import "mui/components"

VStack(spacing: 0) {
  AppBar(title: "Messages", menu: true) {
    IconButton("search")
    IconButton("more_vert")
  }
  Tabs(["Chats", "Groups", "Calls"], value: 0, variant: "fullWidth")
  List {
    ContactRow(name: "Ana Lima", message: "The mockups look great — ship it!", time: "9:41", photo: "assets/images/avatar-1.svg", unread: 2)
    ContactRow(name: "Ben Okafor", message: "Can we move stand-up to 10?", time: "9:12", photo: "assets/images/avatar-2.svg", unread: 1)
    ContactRow(name: "Chloé Martin", message: "Photos from the offsite 📸", time: "Yesterday", photo: "assets/images/avatar-3.svg")
    Divider(variant: "inset")
    ContactRow(name: "Design team", message: "Dana: new icons are in Figma", time: "Mon")
    ContactRow(name: "Eli Novak", message: "Thanks, talk soon", time: "Sun", photo: "assets/images/avatar-4.svg")
    ContactRow(name: "Farah Haddad", message: "Invoice attached", time: "Fri")
  }
  Spacer()
  Fab("edit", color: "primary")
  BottomNavigation(value: 0) {
    BottomNavigationAction("Chats", icon: "chat").badge(3)
    BottomNavigationAction("Contacts", icon: "people")
    BottomNavigationAction("Favorites", icon: "favorite")
    BottomNavigationAction("Settings", icon: "settings")
  }
}
```

## Settings with tabs

`Tabs` with icons, `SettingRow` switches in a `Paper`, `Select`, `RadioGroup`, a `Slider` and a
`ToggleButtonGroup`.

```mockitdown height="760" url="https://acme.example.com/account/settings"
import MUI
import "mui/components"
@Screen(title: "Account settings", id: "MUI-3")

VStack(spacing: 0) {
  AppBar(title: "Acme", logo: "layers", avatar: "Ana Lima") {
    IconButton("help_outline")
  }
  Container {
    VStack(alignment: .leading, spacing: 20) {
      Breadcrumbs(["Home", "Account", "Settings"])
      Typography("Settings", variant: "h4")
      Tabs(value: 1) {
        Tab("Profile", icon: "person")
        Tab("Notifications", icon: "notifications")
        Tab("Security", icon: "lock")
        Tab("Billing", icon: "credit_card")
      }
      HStack(alignment: .top, spacing: 24) {
        Paper {
          List(header: "Notify me about") {
            SettingRow(title: "Mentions", detail: "When someone @mentions you", icon: "alternate_email", on: true)
            SettingRow(title: "Comments", detail: "Replies to your threads", icon: "comment", on: true)
            SettingRow(title: "New followers", detail: "Daily digest", icon: "person_add")
            Divider()
            SettingRow(title: "Product updates", detail: "Monthly newsletter", icon: "mail")
          }
        }
        .frame(maxWidth: .infinity)
        VStack(alignment: .leading, spacing: 20) {
          Select("Email frequency", options: ["Instantly", "Hourly", "Daily digest"], value: "Daily digest", helperText: "Applies to all email notifications")
          RadioGroup("Quiet hours", options: ["Off", "Nights", "Weekends"], value: "Nights", orientation: "horizontal")
          Slider(value: 60, label: "Notification volume")
          ToggleButtonGroup([["icon": "phone_iphone"], ["icon": "laptop"], ["icon": "watch"]], value: 1)
          HStack(spacing: 8) {
            Button("Cancel", variant: "text")
            Button("Save changes", variant: "contained")
          }
        }
        .frame(width: 380)
      }
    }
    .padding(.vertical, 24)
  }
}
```

## Product grid

`ProductCard` tiles in a 12-column `Grid` — `CardMedia` images, `Rating`, chips and card actions —
with filter chips and `Pagination`.

```mockitdown height="1000" url="https://shop.example.com/catalog/bags"
import MUI
import "mui/components"
@Screen(title: "Catalog", id: "MUI-4")

VStack(spacing: 0) {
  AppBar(title: "Acme Shop", menu: true, search: "Search products…") {
    IconButton("favorite_border")
    IconButton("shopping_cart").badge(2)
  }
  Container {
    VStack(alignment: .leading, spacing: 16) {
      HStack {
        Typography("Bags & backpacks", variant: "h5")
        Spacer()
        Select("Sort by", options: ["Featured", "Price: low to high"], value: "Featured", size: "small").frame(width: 200)
      }
      HStack(spacing: 8) {
        Chip("All", color: "primary")
        Chip("Backpacks", variant: "outlined")
        Chip("Totes", variant: "outlined")
        Chip("Under $100", variant: "outlined", onDelete: true)
        Chip("In stock", icon: "check", variant: "outlined")
      }
      Grid(spacing: 16) {
        Grid(size: 4) { ProductCard(name: "Trail pack 24L", price: "$89.00", image: "assets/images/photo-1.svg", rating: 4.5, reviews: 128, tag: "New") }
        Grid(size: 4) { ProductCard(name: "City tote", price: "$64.00", image: "assets/images/photo-2.svg", rating: 4, reviews: 54) }
        Grid(size: 4) { ProductCard(name: "Weekender", price: "$139.00", image: "assets/images/photo-3.svg", rating: 5, reviews: 212, tag: "Best") }
        Grid(size: 4) { ProductCard(name: "Sling bag", price: "$45.00", image: "assets/images/photo-4.svg", rating: 3.5, reviews: 31) }
        Grid(size: 4) { ProductCard(name: "Laptop sleeve", price: "$39.00", image: "assets/images/photo-5.svg", rating: 4, reviews: 77) }
        Grid(size: 4) { ProductCard(name: "Camera bag", price: "$119.00", image: "assets/images/photo-6.svg", rating: 4.5, reviews: 19) }
      }
      HStack { Spacer(); Pagination(count: 8, page: 2, color: "primary"); Spacer() }
    }
    .padding(.vertical, 24)
  }
}
```

## Data table

The MUI "sorting & selecting" table: the imported `TableToolbar` in its selected state, filter chips,
checkbox selection, status chips and `TablePagination`.

```mockitdown source="true" height="640" url="https://acme.example.com/orders"
import MUI
import "mui/components"
@Screen(title: "Orders", id: "MUI-5")

VStack(alignment: .leading, spacing: 16) {
  HStack(spacing: 8) {
    TextField("Search orders", icon: "search", size: "small").frame(width: 280)
    Chip("Status: Pending", onDelete: true)
    Chip("Last 30 days", onDelete: true)
    Button("Add filter", startIcon: "filter_list", size: "small")
    Spacer()
    Button("Export", variant: "outlined", startIcon: "file_download")
    Button("New order", variant: "contained", startIcon: "add")
  }
  Paper {
    TableToolbar(title: "Orders", selected: 2)
    Table(columns: ["Order", "Customer", "Date", "Status", "Total"],
          checkboxSelection: true, selectedRows: [1, 3], sortColumn: 2) {
      TableRow { TableCell("#10423"); TableCell("Ana Lima"); TableCell("Nov 23, 2026"); Chip("Paid", color: "success", size: "small"); TableCell("$248.00") }
      TableRow { TableCell("#10422"); TableCell("Ben Okafor"); TableCell("Nov 22, 2026"); Chip("Pending", color: "warning", size: "small"); TableCell("$89.50") }
      TableRow { TableCell("#10421"); TableCell("Chloé Martin"); TableCell("Nov 22, 2026"); Chip("Paid", color: "success", size: "small"); TableCell("$1,024.00") }
      TableRow { TableCell("#10420"); TableCell("Dana Wu"); TableCell("Nov 21, 2026"); Chip("Refunded", variant: "outlined", size: "small"); TableCell("$56.20") }
      TableRow { TableCell("#10419"); TableCell("Eli Novak"); TableCell("Nov 20, 2026"); Chip("Failed", color: "error", size: "small"); TableCell("$310.00") }
    }
    TablePagination("Rows per page:   5 ▾        1–5 of 42")
  }
}
.padding(24)
```

## Checkout

A multi-step `Stepper` form: filled and outlined fields with adornments, a `DatePicker`, radio
choices, an `Alert` and an order summary `Card`.

```mockitdown height="800" url="https://shop.example.com/checkout"
import MUI
@Screen(title: "Checkout", id: "MUI-6")

VStack(spacing: 0) {
  AppBar(title: "Acme Shop", color: "default", elevation: 0, variant: "outlined")
  HStack(alignment: .top, spacing: 32) {
    VStack(alignment: .leading, spacing: 20) {
      Typography("Checkout", variant: "h4")
      Stepper(["Shipping address", "Payment details", "Review your order"], activeStep: 1)
      Alert("Your shipping address was verified.", severity: "success", closable: true)
      Typography("Payment method", variant: "h6")
      RadioGroup(options: ["Credit card", "PayPal", "Bank transfer"], value: "Credit card", orientation: "horizontal")
      HStack(spacing: 16) {
        TextField("Name on card", value: "Ana Lima", required: true)
        TextField("Card number", value: "4242 4242 4242 4242", icon: "credit_card", required: true)
      }
      .frame(maxWidth: .infinity)
      HStack(alignment: .top, spacing: 16) {
        DatePicker("Expiry date", value: "2028-09-30", helperText: "MM/DD/YYYY")
        TextField("CVV", value: "", required: true, error: "Enter the 3 digits on the back")
        TextField("Tip", value: "5.00", prefix: "$", variant: "filled")
      }
      .frame(maxWidth: .infinity)
      Checkbox("Remember credit card details for next time")
      HStack {
        Button("Back", startIcon: "arrow_back")
        Spacer()
        Button("Next", variant: "contained", endIcon: "arrow_forward")
      }
      .frame(maxWidth: .infinity)
    }
    .frame(maxWidth: .infinity)
    Card(title: "Order summary", variant: "outlined") {
      List {
        ListItem("Trail pack 24L", secondary: "Qty 1", detail: "$89.00")
        ListItem("City tote", secondary: "Qty 2", detail: "$128.00")
        ListItem("Shipping", detail: "Free")
      }
      Divider()
      HStack { Typography("Total", variant: "subtitle1"); Spacer(); Typography("$217.00", variant: "h6") }
      LinearProgress(value: 0.66, label: "Step 2 of 3")
    }
    .frame(width: 340)
  }
  .padding(32)
  .frame(maxWidth: .infinity)
}
```

## Admin dashboard

A permanent `Drawer` beside an `AppBar`, four imported `StatCard`s, an MUI X `BarChart` and
`PieChart`, and a `DataGrid` with checkbox selection.

```mockitdown source="true" appearance="both" device="wide" height="960" url="https://admin.acme.com/dashboard"
import MUI
import "mui/components"
@Screen(title: "Dashboard", id: "MUI-7")

HStack(spacing: 0) {
  Drawer(title: "Acme Admin") {
    NavItem("Dashboard", systemImage: "dashboard").selected()
    NavItem("Orders", systemImage: "shopping_cart").badge(4)
    NavItem("Customers", systemImage: "people")
    NavItem("Reports", systemImage: "bar_chart")
    NavItem("Integrations", systemImage: "layers")
    Divider()
    Section("Saved reports") {
      NavItem("Current month", systemImage: "assignment")
      NavItem("Year-end sale", systemImage: "assignment")
    }
  }
  VStack(spacing: 0) {
    AppBar(title: "Dashboard", search: "Search…", notifications: 4, avatar: "Ana Lima")
    VStack(alignment: .leading, spacing: 24) {
      Grid(spacing: 24) {
        Grid(size: 3) { StatCard(title: "Revenue", value: "$48,210", delta: "+12.4%", icon: "attach_money", trend: [3, 4, 3.5, 5, 6, 5.5, 7]) }
        Grid(size: 3) { StatCard(title: "Orders", value: "1,204", delta: "+4.1%", icon: "shopping_cart", trend: [5, 5.5, 5, 6, 6.2, 6, 6.8]) }
        Grid(size: 3) { StatCard(title: "New customers", value: "312", delta: "+8.0%", icon: "person_add", trend: [2, 3, 2.5, 3, 4, 3.8, 4.4]) }
        Grid(size: 3) { StatCard(title: "Refunds", value: "38", delta: "-2.3%", up: false, icon: "undo", trend: [6, 5, 5.5, 4, 4.2, 3.5, 3]) }
        Grid(size: 8) {
          Card(title: "Sales") {
            BarChart(series: [[42, 51, 48, 62, 70, 66, 81, 77, 90], [30, 35, 41, 44, 52, 49, 58, 61, 64]],
                     labels: ["Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov"], height: 170)
          } headerAction: {
            IconButton("more_vert")
          }
        }
        Grid(size: 4) {
          Card(title: "Traffic") {
            PieChart(values: [46, 28, 16, 10], labels: ["Search", "Direct", "Social", "Email"], height: 170)
          }
        }
      }
      DataGrid(columns: ["ID", "Customer", "Email", "Plan", "Status", "Spent"],
               rows: [["1042", "Ana Lima", "ana@acme.com", "Pro", "Active", "$1,248"],
                      ["1041", "Ben Okafor", "ben@okafor.io", "Team", "Active", "$3,920"],
                      ["1040", "Chloé Martin", "chloe@martin.fr", "Free", "Trial", "$0"],
                      ["1039", "Dana Wu", "dana@wu.dev", "Pro", "Past due", "$420"]],
               checkboxSelection: true, selectedRows: [1], sortColumn: 5,
               pagination: "Rows per page:  25 ▾        1–4 of 4")
    }
    .padding(24)
  }
}
```

## Dialog, menu and snackbar

Transient UI: an open `Menu` from an icon button, a form `Dialog` over a scrim, and a `Snackbar` with
an action. Behind them: a `Toolbar`, an `Accordion` group, `Skeleton` loading rows and a `Tooltip`.

```mockitdown source="true" height="680" url="https://acme.example.com/projects"
import MUI
@Screen(title: "Projects", id: "MUI-8")

VStack(spacing: 0) {
  AppBar(title: "Projects", menu: true, notifications: 2, avatar: "Ana Lima")
  VStack(alignment: .leading, spacing: 16) {
    Toolbar {
      Typography("Website relaunch", variant: "h6")
      Spacer()
      ButtonGroup(variant: "outlined") { Button("Week"); Button("Month"); Button("Year") }
      Tooltip("Share project") { IconButton("share") }
      Button("Invite", variant: "contained", startIcon: "person_add")
      Menu(icon: "more_vert", open: true) {
        MenuItem("Rename", icon: "edit", shortcut: "⌘R")
        MenuItem("Duplicate", icon: "content_copy").selected()
        MenuItem("Archive", icon: "archive")
        Divider()
        MenuItem("Delete", icon: "delete", destructive: true)
      }
    }
    Accordion("Milestones", subtitle: "3 of 5 complete", expanded: true) {
      LinearProgress(value: 0.6)
      HStack(spacing: 8) {
        Chip("Design", color: "success", icon: "check")
        Chip("Build", color: "primary")
        Chip("Launch", variant: "outlined")
      }
    }
    Accordion("Team", subtitle: "6 people")
    Accordion("Files", subtitle: "Loading…")
    HStack(spacing: 16) {
      Skeleton(variant: "circular")
      VStack(alignment: .leading, spacing: 4) {
        Skeleton().frame(width: 260)
        Skeleton().frame(width: 180)
      }
    }
  }
  .padding(24)
  .frame(maxWidth: .infinity)
  Dialog(title: "Invite people") {
    DialogContentText("Invitees get an email with a link to this project.")
    TextField("Email address", value: "dana@wu.dev", variant: "standard", state: "focused")
    Select("Role", options: ["Viewer", "Editor", "Admin"], value: "Editor")
    FormControlLabel("Send me a copy", checked: true)
  } actions: {
    Button("Cancel")
    Button("Send invite")
  }
  Snackbar("Project duplicated", action: "Undo", closable: true)
}
```
