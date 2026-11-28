# PrimeVue · PrimeNG · PrimeReact

The **prime** pack imitates the PrimeTek component suites in **styled mode** with the **Aura** theme
preset — the design system shared by **PrimeVue 4**, **PrimeNG 18+** and **PrimeReact**, so one pack
covers all three. It follows the Aura design tokens at the 14 px root the showcase and the Sakai
template use: emerald primary (`primary.500` `#10b981`, `primary.400` in dark mode), form fields with
a 1 px `surface.300` border, `.5rem .75rem` padding and a primary border on focus, `borderRadius.md`
6 px (4 px for list options, 12 px for cards and dialogs), soft `color.100 / color.700` tags, tinted
messages and toasts, and the Inter → system font stack. Light mode uses the **slate** surface scale,
dark mode the **zinc** scale. Select it with

```swift
import PrimeVue      // or: import PrimeNG, import PrimeReact, import Prime
```

Elements use the PrimeVue component and prop names (PrimeNG's `p-` and PrimeReact's names are the
same words): `Button` (`severity: "secondary" | "success" | "info" | "warn" | "help" | "danger" |
"contrast"`, `variant: "outlined" | "text" | "link"`, `rounded:`, `raised:`, `size:`, `badge:`,
`loading:`), `SplitButton`, `SpeedDial`, `InputText`, `IconField`, `InputGroup`, `FloatLabel`,
`InputNumber`, `InputMask`, `InputOtp`, `Password` + `PasswordMeter`, `Textarea`, `Select` (and the
pre-v4 `Dropdown`), `MultiSelect`, `AutoComplete`, `CascadeSelect`, `TreeSelect`, `Listbox`,
`Checkbox`, `RadioButton`, `ToggleSwitch`, `ToggleButton`, `SelectButton`, `Slider`, `Rating`, `Knob`,
`DatePicker`, `ColorPicker`, `FileUpload`, `DataTable` / `Column` / `Row` / `Paginator`, `TreeTable`,
`DataView`, `Tree` / `TreeNode`, `OrderList`, `PickList`, `Timeline`, `Panel`, `Fieldset`, `Card`,
`Accordion` / `AccordionPanel`, `Tabs` / `Tab`, `Stepper`, `Toolbar`, `Splitter`, `Divider`,
`Dialog`, `ConfirmDialog`, `ConfirmPopup`, `Drawer`, `Popover`, `Tooltip`, `Menu`, `Menubar`,
`MegaMenu`, `TieredMenu`, `ContextMenu`, `PanelMenu`, `Breadcrumb`, `TabMenu`, `Steps`, `Dock`,
`Toast`, `Message`, `Tag`, `Chip`, `Badge`, `OverlayBadge`, `Avatar` / `AvatarGroup`, `Skeleton`,
`ProgressBar`, `ProgressSpinner`, `MeterGroup`, `Chart`, `Galleria`, `Image`, `Carousel`,
`ScrollTop` and `BlockUI`. Vue prop names work as labels (`header:`, `legend:`, `invalid:`,
`showClear:`, `toggleMask:`, `summary:` / `detail:` on `Toast`, `modelValue:`), and PrimeIcons are
accepted wherever an icon is: `"pi pi-check"`, `"pi-check"` or `"check"`.

The custom components on this page (`BrandMark`, `AppTopbar`, `KpiCard`, `RowActions`, `StockTag`,
`ProductRow`, `SettingRow`, `TransferControls`) live in `mockups/prime/blocks.mockitdown` and are
imported with `import "prime/blocks"`. All content is invented; the brand mark is a neutral glyph.

## Sign in

A centred sign-in card on the ground colour: `InputText`, `Password` with its eye toggle,
`Checkbox`, a primary `Button`, a labelled `Divider` and a secondary outlined button.

```mockitdown source="true" appearance="both" height="640" title="Sign in" url="https://app.example.com/auth/login"
import PrimeVue
import "prime/blocks"

VStack {
  Spacer()
  HStack {
    Spacer()
    Card {
      VStack(spacing: 7) {
        BrandMark(name: "Northwind")
        Text("Welcome back").font(.title2).padding(.top, 14)
        Text("Sign in to continue").foregroundStyle(.secondary)
      }
      VStack(alignment: .stretch, spacing: 21) {
        InputText("Email address", value: "amy.elsner@example.com", label: "Email")
        Password("Password", value: "correct-horse", label: "Password", toggleMask: true).state(.focused)
        HStack {
          Checkbox("Remember me", checked: true)
          Spacer()
          Link("Forgot password?")
        }
        Button("Sign In").frame(maxWidth: .infinity)
        Divider(label: "OR")
        Button("Sign in with SSO", icon: "pi pi-key", severity: "secondary", variant: "outlined").frame(maxWidth: .infinity)
      }
      .padding(.top, 14)
    }
    .frame(width: 420)
    Spacer()
  }
  Spacer()
}
.frame(maxWidth: .infinity, maxHeight: .infinity)
```

## Products — CRUD data table

The PrimeVue CRUD demo: a `Toolbar` with the New / Delete / Export actions, a `DataTable` with a
header slot (title and `IconField` search), a filter row, multiple selection, a sorted column,
`Rating` and status `Tag` cells, rounded outlined row actions and a `Paginator` footer — with the
"Product Details" `Dialog` open over it.

```mockitdown source="true" title="Products" url="https://app.example.com/inventory/products" height="740"
import PrimeVue
import "prime/blocks"

VStack(alignment: .stretch, spacing: 14) {
  Toolbar {
    Button("New", icon: "pi pi-plus")
    Button("Delete", icon: "pi pi-trash", severity: "danger", variant: "outlined")
    Spacer()
    Button("Export", icon: "pi pi-upload", severity: "secondary")
  }
  DataTable(columns: ["Code", "Name", "Price", "Category", "Reviews", "Status", ""],
            selectionMode: "multiple", sortField: 1) {
    Row(status: "filter") {
      InputText("Search by code", size: "small")
      InputText("Search by name", size: "small")
      InputNumber("Min price", size: "small")
      Select("Any category", size: "small")
      Text("")
      Select("Any status", size: "small")
      Text("")
    }
    ProductRow(code: "f230fh0g3", name: "Bamboo Watch", price: "$65.00", category: "Accessories", rating: 5, status: "INSTOCK")
    ProductRow(code: "nvklal433", name: "Black Watch", price: "$72.00", category: "Accessories", rating: 4, status: "INSTOCK", selected: true)
    ProductRow(code: "zz21cz3c1", name: "Blue Band", price: "$79.00", category: "Fitness", rating: 3, status: "LOWSTOCK", selected: true)
    ProductRow(code: "244wgerg2", name: "Blue T-Shirt", price: "$29.00", category: "Clothing", rating: 5, status: "INSTOCK")
    ProductRow(code: "h456wer53", name: "Bracelet", price: "$15.00", category: "Accessories", rating: 4, status: "INSTOCK")
    ProductRow(code: "av2231fwg", name: "Brown Purse", price: "$120.00", category: "Accessories", rating: 4, status: "OUTOFSTOCK")
  } header: {
    Text("Manage Products").font(.title3)
    Spacer()
    IconField("Search…").frame(width: 240)
  } footer: {
    Paginator(count: 6, page: 1, summary: "Showing 1 to 6 of 30 products")
  }
}
.padding(28)

Dialog(header: "Product Details") {
  VStack(alignment: .stretch, spacing: 17) {
    InputText("Name", value: "Blue Band", label: "Name", required: true)
    Textarea("Description", value: "Lightweight silicone band in ocean blue.", label: "Description", rows: 2)
    VStack(alignment: .leading, spacing: 10) {
      Text("Category").fontWeight(.medium)
      Grid(columns: 2, spacing: 10) {
        RadioButton("Accessories")
        RadioButton("Clothing")
        RadioButton("Electronics")
        RadioButton("Fitness", checked: true)
      }
    }
    HStack(alignment: .top, spacing: 14) {
      InputNumber("Price", value: "79.00", label: "Price", prefix: "$")
      InputNumber("Quantity", value: 12, label: "Quantity", invalid: true, helper: "Quantity must be at least 20 for low stock.")
    }
  }
} footer: {
  Button("Cancel", icon: "pi pi-times", variant: "text")
  Button("Save", icon: "pi pi-check")
}
```

## Dashboard

A Sakai-style dashboard: the `AppTopbar` block, a `PanelMenu` sidebar, four `KpiCard`s (#1), a
stacked bar `Chart` (#2), a `MeterGroup` with a `Knob` (#3) and a compact `DataTable` of recent sales
with a `Timeline` beside it (#4).

```mockitdown appearance="both" device="wide" height="1000" title="Dashboard" url="https://app.example.com/"
import PrimeVue
import "prime/blocks"

VStack(alignment: .stretch, spacing: 0) {
  AppTopbar(title: "Northwind", notifications: 3)
  Divider()
  HStack(alignment: .top, spacing: 28) {
    PanelMenu {
      PanelMenuPanel("Home", icon: "pi pi-home", expanded: true) {
        MenuItem("Dashboard", icon: "pi pi-th-large").selected()
        MenuItem("Analytics", icon: "pi pi-chart-bar")
      }
      PanelMenuPanel("Sales", icon: "pi pi-shopping-cart", expanded: true) {
        MenuItem("Orders", icon: "pi pi-list")
        MenuItem("Products", icon: "pi pi-box")
        MenuItem("Customers", icon: "pi pi-users")
      }
      PanelMenuPanel("Reports", icon: "pi pi-file")
      PanelMenuPanel("Settings", icon: "pi pi-cog")
    }
    .frame(width: 240)
    VStack(alignment: .stretch, spacing: 28) {
      Grid(columns: 4, spacing: 28) {
        KpiCard(title: "Orders", value: "152", icon: "pi pi-shopping-cart", tint: "blue", delta: "24 new", note: "since last visit")
        KpiCard(title: "Revenue", value: "$2,100", icon: "pi pi-dollar", tint: "orange", delta: "%52+", note: "since last week")
        KpiCard(title: "Customers", value: "28,441", icon: "pi pi-users", tint: "cyan", delta: "520", note: "newly registered")
        KpiCard(title: "Comments", value: "152 Unread", icon: "pi pi-comment", tint: "purple", delta: "85", note: "responded")
      }
      .callout(1, "KpiCard", alignment: .topLeading)
      HStack(alignment: .top, spacing: 28) {
        Card(title: "Revenue Stream") {
          Chart(type: "bar", stacked: true,
                series: [[4000, 8000, 11000, 4000], [2100, 6400, 2400, 7500], [4100, 5200, 3400, 7400]],
                labels: ["Q1", "Q2", "Q3", "Q4"], seriesNames: ["Subscriptions", "Advertising", "Affiliate"], height: 260)
        }
        .callout(2, "Chart", alignment: .topTrailing, labelSide: .leading)
        Card(title: "Storage") {
          MeterGroup(series: [[16], [8], [24], [10]], seriesNames: ["Apps (16%)", "Messages (8%)", "Media (24%)", "System (10%)"])
          Divider()
          HStack(spacing: 21) {
            Knob(value: 58)
            VStack(alignment: .leading, spacing: 4) {
              Text("58 GB of 100 GB used").fontWeight(.medium)
              Text("Upgrade to keep your media in the cloud.").foregroundStyle(.secondary)
              Button("Upgrade plan", size: "small", variant: "outlined").padding(.top, 7)
            }
          }
        }
        .frame(width: 420)
        .callout(3, "MeterGroup + Knob", alignment: .topTrailing, labelSide: .leading)
      }
      HStack(alignment: .top, spacing: 28) {
        Card(title: "Recent Sales") {
          DataTable(columns: ["Product", "Price", "Status", ""],
                    rows: [["Bamboo Watch", "$65.00", Tag("Delivered", severity: "success"), Button(icon: "pi pi-search", variant: "text", rounded: true)],
                           ["Black Watch", "$72.00", Tag("Pending", severity: "warn"), Button(icon: "pi pi-search", variant: "text", rounded: true)],
                           ["Blue Band", "$79.00", Tag("Delivered", severity: "success"), Button(icon: "pi pi-search", variant: "text", rounded: true)],
                           ["Brown Purse", "$120.00", Tag("Cancelled", severity: "danger"), Button(icon: "pi pi-search", variant: "text", rounded: true)]],
                    size: "small")
        }
        .callout(4, "DataTable", alignment: .topTrailing, labelSide: .leading)
        Card(title: "Order #1042") {
          Timeline {
            TimelineEvent("Ordered", time: "Nov 18, 10:30")
            TimelineEvent("Processing", time: "Nov 18, 14:00")
            TimelineEvent("Shipped", time: "Nov 19, 16:15")
            TimelineEvent("Delivered", time: "Expected Nov 21", status: "pending")
          }
        }
        .frame(width: 420)
      }
    }
    .frame(maxWidth: .infinity)
  }
  .padding(28)
}
```

The KPI row (#1) repeats one custom component four times; the icon tile is an `Avatar` whose
`color:` picks the tint. The chart (#2) is `Chart(type: "bar", stacked: true)` with the Chart.js
legend on top. Storage (#3) combines a `MeterGroup` — values in percent, labels as `seriesNames` —
with a `Knob`. The sales table (#4) is a `DataTable(size: "small")` inside a `Card`.

## Registration with validation

A multi-step form: a `Stepper` on step 2, an error `Message`, invalid fields with `variant:
"simple"` messages under them, a `MultiSelect` with chips, an open `AutoComplete`, a `DatePicker`,
`InputMask`, `InputNumber`, `Password` with its strength meter, a `RadioButtonGroup` and a required
`Checkbox`.

```mockitdown source="true" title="Create account" url="https://app.example.com/register" height="940"
import PrimeVue

VStack(alignment: .stretch, spacing: 21) {
  Stepper(items: ["Account", "Profile", "Plan", "Confirm"], current: 1)
  Message("Please correct the 2 highlighted fields.", severity: "error", icon: "pi pi-times-circle", showIcon: true)
  Card(title: "Profile", subtitle: "Tell us a little about yourself.") {
    Grid(columns: 2, spacing: 21) {
      VStack(alignment: .stretch, spacing: 6) {
        InputText("First name", value: "", label: "First name", invalid: true)
        Message("First name is required.", severity: "error", variant: "simple", size: "small")
      }
      InputText("Last name", value: "Elsner", label: "Last name")
      VStack(alignment: .stretch, spacing: 6) {
        InputMask("(999) 999-9999", value: "(555) 01", label: "Phone", invalid: true)
        Message("Enter a 10-digit phone number.", severity: "error", variant: "simple", size: "small")
      }
      DatePicker("Birthday", selection: "1994-05-14", label: "Birthday")
      MultiSelect("Select interests", selection: ["Design", "Analytics", "Travel"], label: "Interests")
      VStack(alignment: .stretch, spacing: 7) {
        Password("Password", value: "spring2026", label: "Password", toggleMask: true)
        PasswordMeter(value: 66, label: "Medium", color: "medium")
      }
      InputNumber("Team size", value: 12, label: "Team size", suffix: " people")
      AutoComplete("Country", value: "Neth", label: "Country", options: ["Netherlands", "Netherlands Antilles", "New Caledonia"], open: true).state(.focused)
    }
    RadioButtonGroup("Account type", options: ["Personal", "Business", "Non-profit"], selection: "Business")
    Checkbox("I accept the terms and conditions", invalid: true)
  } footer: {
    Button("Back", icon: "pi pi-arrow-left", severity: "secondary")
    Spacer()
    Button("Next", icon: "pi pi-arrow-right", iconPos: "right")
  }
}
.padding(28)
```

## Settings

`Tabs` with icons, an `Avatar` with a basic `FileUpload` button, `InputGroup`, `Textarea`, a
`Fieldset` of `SettingRow`s (`ToggleSwitch`), `SelectButton`, `ColorPicker`, `Slider`, `ToggleButton`,
`InputOtp` and a `ConfirmPopup` asking before the account is deleted.

```mockitdown appearance="both" title="Settings" url="https://app.example.com/settings" height="1000"
import PrimeVue
import "prime/blocks"

VStack(alignment: .stretch, spacing: 21) {
  Text("Settings").font(.title2)
  Tabs(selection: "Account") {
    Tab("Account", icon: "pi pi-user") {
      HStack(alignment: .top, spacing: 28) {
        VStack(alignment: .stretch, spacing: 17) {
          HStack(spacing: 17) {
            Avatar(image: "assets/images/avatar-2.svg", shape: "circle", size: "xlarge")
            VStack(alignment: .leading, spacing: 7) {
              Text("Profile photo").fontWeight(.medium)
              HStack(spacing: 7) {
                Button("Upload", icon: "pi pi-upload", size: "small")
                Button("Remove", severity: "secondary", variant: "text", size: "small")
              }
            }
          }
          InputText("Full name", value: "Amy Elsner", label: "Full name")
          InputGroup("username", value: "amy", label: "Profile URL", prefix: "northwind.app/")
          Textarea("Bio", value: "Head of operations. Coffee first, tickets second.", label: "Bio", rows: 3)
          Fieldset(legend: "Two-factor authentication") {
            Text("Enter the 6-digit code from your authenticator app.").foregroundStyle(.secondary)
            InputOtp(items: ["4", "8", "1", "", "", ""], selection: 3)
          }
        }
        .frame(width: 460)
        VStack(alignment: .stretch, spacing: 17) {
          Fieldset(legend: "Notifications") {
            SettingRow(title: "Order updates", description: "Email me when an order changes status.", on: true)
            SettingRow(title: "Weekly digest", description: "A Monday summary of last week's sales.")
            SettingRow(title: "Product news", description: "Occasional announcements and tips.", on: true)
          }
          Panel(header: "Appearance") {
            SelectButton(label: "Theme", options: ["Light", "Dark", "System"], selection: "System")
            HStack(spacing: 14) {
              Text("Accent colour").fontWeight(.medium)
              ColorPicker(colors: ["#10b981", "#06b6d4", "#8b5cf6", "#f97316", "#ec4899"], selection: 0)
            }
            Slider(value: 14, min: 12, max: 20, label: "Font size", showValue: true)
            HStack(spacing: 14) {
              Text("Compact tables").fontWeight(.medium)
              ToggleButton("On", checked: true)
            }
          }
          HStack {
            Spacer()
            ConfirmPopup(message: "Delete your account and all of its data?", placement: .bottom) {
              Button("Delete account", icon: "pi pi-trash", severity: "danger", variant: "outlined")
            } actions: {
              HStack(spacing: 7) {
                Spacer()
                Button("Cancel", severity: "secondary", variant: "outlined", size: "small")
                Button("Delete", severity: "danger", size: "small")
              }
            }
          }
        }
        .frame(maxWidth: .infinity)
      }
    }
    Tab("Notifications", icon: "pi pi-bell", badge: 3)
    Tab("Billing", icon: "pi pi-credit-card")
    Tab("Security", icon: "pi pi-shield")
  }
}
.padding(28)
```

## Team assignment — PickList and OrderList

`PickList` moves people between two `Listbox`es through the `TransferControls` column; `OrderList`
reorders the on-call rotation with the up / top / down / bottom buttons.

```mockitdown source="true" title="Teams" url="https://app.example.com/teams/support" height="760"
import PrimeVue
import "prime/blocks"

VStack(alignment: .stretch, spacing: 21) {
  Breadcrumb(items: ["Teams", "Support", "Members"])
  Card(title: "Support team", subtitle: "Pick the people who answer customer tickets this quarter.") {
    PickList {
      Listbox(label: "Available", options: ["Bernardo Dominic", "Elwin Sharvill", "Ioni Bowcher", "Onyama Limba", "Xuxue Feng"], selection: "Ioni Bowcher")
      TransferControls()
      Listbox(label: "Support", options: ["Amy Elsner", "Anna Fali", "Asiya Javayant", "Stephen Shaw"], selection: -1)
    }
  }
  Card(title: "On-call rotation") {
    OrderList {
      TransferControls(vertical: true)
      Listbox(label: "Week order", options: ["1 · Amy Elsner", "2 · Stephen Shaw", "3 · Anna Fali", "4 · Asiya Javayant"], selection: "2 · Stephen Shaw")
    }
  }
}
.padding(28)
```

## File manager — Menubar with an open TieredMenu

A `Menubar` with its "File" submenu open and the "Export" level beside it (a `TieredMenu` placed
with `.offset`), a `Breadcrumb`, a `Splitter` holding a `Tree` and a `TreeTable`, an open
`ContextMenu` on a row and a `Tooltip`.

```mockitdown title="Files" url="https://app.example.com/files/projects" height="660"
import PrimeVue
import "prime/blocks"

VStack(alignment: .stretch, spacing: 14) {
  Menubar {
    BrandMark(name: "Files", icon: "pi pi-folder")
    MenubarItem("File", icon: "pi pi-file", open: true) {
      MenuItem("New", icon: "pi pi-plus", shortcut: "⌘N")
      MenuItem("Open", icon: "pi pi-folder-open", shortcut: "⌘O")
      MenuSeparator()
      MenuItem("Export", icon: "pi pi-upload") {
        MenuItem("PDF")
      }
      .state(.hover)
      MenuItem("Print", icon: "pi pi-print", shortcut: "⌘P")
    }
    MenubarItem("Edit", icon: "pi pi-pencil")
    MenubarItem("View", icon: "pi pi-eye")
    MenubarItem("Share", icon: "pi pi-share-alt", caret: false)
    Spacer()
    IconField("Search files").frame(width: 220)
    Avatar(label: "AE", shape: "circle")
  }
  .zIndex(5)
  TieredMenu {
    MenuItem("PDF", icon: "pi pi-file-pdf").state(.hover)
    MenuItem("Spreadsheet", icon: "pi pi-file-excel")
    MenuItem("Archive (.zip)", icon: "pi pi-box")
  }
  .offset(x: 260, y: 70)
  .frame(height: 0)
  .zIndex(6)
  Breadcrumb(items: ["Home", "Projects", "Harbor redesign"])
  Splitter {
    SplitterPanel {
      Tree {
        TreeNode("Projects", icon: "pi pi-folder", expanded: true) {
          TreeNode("Harbor redesign", icon: "pi pi-folder").selected()
          TreeNode("Q4 campaign", icon: "pi pi-folder")
          TreeNode("Archive", icon: "pi pi-folder", hasChildren: true)
        }
        TreeNode("Shared with me", icon: "pi pi-users", hasChildren: true)
        TreeNode("Trash", icon: "pi pi-trash")
      }
    }
    .frame(width: 260)
    SplitterPanel {
      TreeTable(columns: ["Name", "Size", "Modified", ""],
                rows: [[TreeTableToggle("Design", icon: "pi pi-chevron-right", expanded: true), "18 MB", "Nov 20", ""],
                       [TreeTableToggle("Wireframes.fig", icon: "pi pi-file", level: 1), "6.2 MB", "Nov 20", ""],
                       [TreeTableToggle("Moodboard.pdf", icon: "pi pi-file-pdf", level: 1), "11 MB", "Nov 18", Tooltip("Shared with 4 people", placement: .left) { Icon("pi pi-users") }],
                       [TreeTableToggle("Research", icon: "pi pi-chevron-right"), "4 MB", "Nov 12", ""],
                       [TreeTableToggle("Budget.xlsx", icon: "pi pi-file-excel"), "320 KB", "Nov 02", ""]],
                selectedRows: [2])
      ContextMenu {
        MenuItem("Open", icon: "pi pi-external-link")
        MenuItem("Rename", icon: "pi pi-pencil").state(.hover)
        MenuItem("Download", icon: "pi pi-download")
        MenuSeparator()
        MenuItem("Delete", icon: "pi pi-trash", destructive: true)
      }
      .offset(x: 200, y: -110)
      .frame(height: 0)
    }
  }
  .frame(height: 340)
}
.padding(28)
```

## Order follow-up — Toasts and a ConfirmDialog

The overlay states around an order: two stacked `Toast`s, a `ConfirmDialog` before cancelling, a warn
`Message`, a `Timeline` with icon markers, a `ProgressBar`, `Tag`s, a `Chip`, an `AvatarGroup`, a
`Badge` and a `SplitButton`.

```mockitdown source="true" appearance="both" title="Order #1042" url="https://app.example.com/orders/1042" height="680"
import PrimeVue

VStack(alignment: .stretch, spacing: 21) {
  HStack(spacing: 10) {
    Text("Order #1042").font(.title2)
    Tag("Processing", severity: "info", icon: "pi pi-sync")
    Spacer()
    AvatarGroup {
      Avatar(image: "assets/images/avatar-1.svg", shape: "circle")
      Avatar(image: "assets/images/avatar-3.svg", shape: "circle")
      Avatar(label: "+2", shape: "circle")
    }
    SplitButton("Actions", icon: "pi pi-cog", severity: "secondary")
  }
  Message("The carrier reported a delay — delivery may slip by one day.", severity: "warn", icon: "pi pi-exclamation-triangle", showIcon: true)
  HStack(alignment: .top, spacing: 21) {
    Card(title: "Shipment") {
      Timeline {
        TimelineEvent("Ordered", time: "Nov 18, 10:30", icon: "pi pi-shopping-cart", color: "purple")
        TimelineEvent("Processing", time: "Nov 18, 14:00", icon: "pi pi-cog", color: "orange")
        TimelineEvent("Shipped", time: "Nov 19, 16:15", icon: "pi pi-truck", color: "green")
        TimelineEvent("Delivered", time: "Expected Nov 21", icon: "pi pi-check", color: "gray")
      }
    }
    Card(title: "Packing") {
      ProgressBar(value: 75)
      HStack(spacing: 7) {
        Chip("Fragile", icon: "pi pi-exclamation-circle")
        Chip("Gift wrap", icon: "pi pi-gift")
      }
      HStack {
        Text("Items")
        Badge(value: 3, severity: "secondary")
        Spacer()
        Text("$216.00").fontWeight(.semibold)
      }
    } footer: {
      Button("Cancel order", severity: "danger", variant: "outlined")
      Button("Notify customer", icon: "pi pi-send")
    }
    .frame(width: 360)
  }
}
.padding(28)

ConfirmDialog(header: "Cancel order", message: "Cancel order #1042 and refund $216.00 to the customer?",
              buttons: ["Keep order", "Cancel order"], destructive: "Cancel order")

Toast(summary: "Label printed", detail: "Shipping label sent to the warehouse printer.", severity: "success", icon: "pi pi-check", position: "bottom-right")
  .offset(y: -84)
Toast(summary: "Customer notified", detail: "Amy Elsner received the delay notice.", icon: "pi pi-info-circle", position: "bottom-right")
```

Each `Toast` is its own overlay; the first is lifted with `.offset(y:)` so the two stack like PrimeVue's toast container.


## Product page on a phone

`Galleria` with thumbnails, `Rating`, `SelectButton`, `InputNumber`, `Accordion`, a `Carousel` with
indicators, `Skeleton`s for a loading card and a `ScrollTop`.

```mockitdown device="phone" appearance="both" title="Product"
import PrimeVue

ScrollView {
  VStack(alignment: .stretch, spacing: 14) {
    Galleria(image: "assets/images/photo-2.svg", mediaHeight: 240) {
      HStack(spacing: 7) {
        Image("assets/images/photo-2.svg")
        Image("assets/images/photo-3.svg")
        Image("assets/images/photo-4.svg")
        Image("assets/images/photo-5.svg")
      }
    }
    VStack(alignment: .stretch, spacing: 10) {
      HStack {
        Tag("New", severity: "success")
        Spacer()
        Rating(value: 4)
        Text("(128)").foregroundStyle(.secondary)
      }
      Text("Harbor Linen Shirt").font(.title2)
      Text("$58.00").font(.title3).foregroundStyle(.mint)
      SelectButton(label: "Size", options: ["S", "M", "L", "XL"], selection: "M")
      HStack(alignment: .bottom, spacing: 10) {
        InputNumber(value: 1, label: "Qty").frame(width: 90)
        Button("Add to cart", icon: "pi pi-shopping-cart").frame(maxWidth: .infinity)
      }
      Accordion {
        AccordionPanel("Details", expanded: true) {
          Text("Breathable washed linen, relaxed fit, mother-of-pearl buttons.")
        }
        AccordionPanel("Shipping & returns")
      }
      Text("You may also like").font(.headline)
      Carousel {
        CarouselItem("Dune Chinos", image: "assets/images/photo-3.svg") { Text("$64.00").foregroundStyle(.secondary) }
        Card {
          Skeleton().frame(height: 96)
          Skeleton().frame(width: 100, height: 14)
          Skeleton().frame(width: 60, height: 14)
        }
      }
      CarouselIndicators(items: ["", "", ""], selection: 0)
    }
    .padding(.horizontal, 14)
  }
}

ScrollTop()
```
