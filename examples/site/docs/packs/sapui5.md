# SAPUI5 (Fiori Horizon)

The **sapui5** pack imitates **SAPUI5 / OpenUI5 1.136** in the **SAP Fiori Horizon** theme
(`sap_horizon` for light, `sap_horizon_dark` for dark), "cozy" content density, the "72" typeface
(falling back to Arial/Helvetica) and the Horizon colours, radii and shadows. Select it with
`import SAPUI5` (also `OpenUI5`, `UI5`, `Fiori`, `sap.m`, `sap.f`, `sap.uxap` or `sap.tnt`).

The pack speaks the control names of `sap.m`, `sap.f`, `sap.uxap` and `sap.tnt`: **ShellBar**,
**Page**, **DynamicPage**, **ObjectPageLayout**, **FlexibleColumnLayout**, **ToolPage** /
**SideNavigation**, **Table** / **Column** / **ColumnListItem**, **List** with
**StandardListItem**, **ObjectListItem**, **NotificationListItem** and **FeedListItem**,
**ObjectIdentifier**, **ObjectNumber**, **ObjectStatus**, **GenericTile** + **NumericContent**,
**Card**, **IconTabBar**, **Wizard**, **SimpleForm**, **MessageStrip**, **MessageBox**,
**MessageToast**, **IllustratedMessage** and all the input controls. SAP icon names
(`"sap-icon://add"`) work wherever an icon is expected.

A few SAPUI5 properties are spelled through modifiers: `.type(.Emphasized)` sets a button type,
`.valueState(.Error)` an input's value state, `.inverted()` an inverted ObjectStatus,
`.indicator(.Up)` a NumericContent trend, `.count(12)` an IconTabFilter counter,
`.layout(.TwoColumnsMidExpanded)` the FlexibleColumnLayout, `.displayShape(.Square)` /
`.displaySize(.L)` an Avatar, and `.contentDensity(.compact)` switches a subtree to compact.
`state:` (Success, Warning, Error, Information) colours ObjectStatus, ObjectNumber,
ProgressIndicator, list highlights and Dialog headers.

The examples below import a small component library, `mockups/sapui5/fiori.mockitdown`, that
defines `KpiTile`, `LaunchTile`, `ProductRow`, `HeaderFact` and `OrderItem` from SAPUI5 controls.

## Launchpad home

The Fiori launchpad: ShellBar with search, notifications and the user avatar, the space tabs, KPI
tiles (`GenericTile` + `NumericContent`) and app launch tiles.

```mockitdown source="true" title="Fiori launchpad" id="FLP-01" url="https://s4.example.com/ui#Shell-home"
import SAPUI5
import "sapui5/fiori"

VBox(alignment: .stretch, spacing: 0) {
  ShellBar("My Home", logo: "assets/images/logo.svg", search: "Search in: Apps",
           notifications: 4, avatar: "Ana Lima") {
    Button(icon: "sap-icon://sys-help")
    Button(icon: "sap-icon://product-switch")
  }
  IconTabBar(selection: "My Home") {
    IconTabFilter("My Home")
    IconTabFilter("Sales")
    IconTabFilter("Procurement")
    IconTabFilter("Finance")
    IconTabFilter("Analytics")
  }
  VBox(alignment: .leading, spacing: 16) {
    Title("Sales Performance", level: .H4)
    HBox(spacing: 16) {
      KpiTile(header: "Revenue", subheader: "Current quarter", value: "12.8", scale: "M",
              footer: "EUR, vs. 11.4 M", color: "Good", trend: "Up")
      KpiTile(header: "Open Sales Orders", subheader: "Due this week", value: "347",
              footer: "Orders", color: "Critical", trend: "Up")
      KpiTile(header: "Overdue Invoices", value: "28", scale: "K",
              footer: "EUR", color: "Error", trend: "Down")
      KpiTile(header: "Customer Satisfaction", subheader: "Survey 2026", value: "4.6",
              footer: "of 5")
    }
    Title("Apps", level: .H4).padding(.top, 8)
    HBox(spacing: 16, wrap: true) {
      LaunchTile(header: "Manage Sales Orders", icon: "sap-icon://sales-order")
      LaunchTile(header: "Create Purchase Order", subheader: "Procurement", icon: "sap-icon://add-document")
      LaunchTile(header: "My Inbox", subheader: "Approvals", icon: "sap-icon://inbox", info: "9 open")
      LaunchTile(header: "Manage Products", icon: "sap-icon://product")
      LaunchTile(header: "Track Shipments", icon: "sap-icon://shipping-status")
      LaunchTile(header: "Travel Expenses", icon: "sap-icon://travel-expense", info: "2 drafts")
    }
  }
  .padding(.horizontal, 32).padding(.vertical, 24)
}
.frame(maxHeight: .infinity)
```

## Create form

A `Page` with a back button, a footer toolbar and two `Panel`s holding `SimpleForm`s. On desktop
the labels sit at the start of each row; the form uses most input controls.

```mockitdown title="Create purchase order" id="PO-NEW" appearance="both" height="1060" url="https://s4.example.com/ui#PurchaseOrder-create"
import SAPUI5

Page("New Purchase Order", back: true) {
  ScrollView {
    VBox(alignment: .stretch, spacing: 16) {
      MessageStrip("Draft saved at 10:42 by Ana Lima.", type: .Information, closable: true)
      Panel("General Information") {
        SimpleForm {
          Label("Supplier")
          MultiInput(selection: ["Acme Office Supplies"])
          Label("Purchasing Group")
          Select(selection: "Office Supplies") { Item("Office Supplies"); Item("IT Hardware") }
          Label("Requested Delivery")
          HBox(spacing: 8) {
            DateRangeSelection(value: "Dec 1 – Dec 12, 2026")
            TimePicker(value: "09:00 AM")
          }
          Label("Cost Center")
          Input(value: "CC-1000X", error: "Cost center CC-1000X does not exist").valueState(.Error)
          Label("Delivery Terms")
          RadioButtonGroup(options: ["Standard", "Express", "Pickup"], selection: 1, orientation: .horizontal)
          Label("Notes")
          TextArea("Deliver to the side entrance, building 4.", rows: 2)
        }
      }
      Panel("Item 10 · Ergonomic Desk Chair") {
        SimpleForm {
          Label("Material")
          ComboBox(selection: "CH-200 Ergonomic Chair")
          Label("Quantity")
          StepInput(value: 12)
          Label("Tags")
          MultiComboBox(selection: ["Furniture", "Facilities"])
          Label("Budget Use")
          ProgressIndicator(value: 64, state: .Warning)
          Label("Priority")
          SegmentedButton(items: ["Low", "Normal", "High"], selection: "Normal")
          Label("Recurring")
          Switch(isOn: true)
          Label("Notify Requester")
          CheckBox("Send e-mail when delivered", selected: true)
        }
      }
    }
    .padding(16)
  }
  .toolbar {
    ToolbarItem(placement: .bottomBar) {
      Button("Order").type(.Emphasized)
      Button("Save as Draft")
      Button("Cancel").type(.Transparent)
    }
  }
}
```

## List report

The list report floorplan: a `DynamicPage` whose title holds the variant management, a header
with the filter bar, and a `Table` with a header toolbar, selection and `ObjectIdentifier` /
`ObjectNumber` / `ObjectStatus` cells (from the `ProductRow` component).

```mockitdown source="true" title="Manage products" id="LR-01" appearance="both" url="https://s4.example.com/ui#Product-manage"
import SAPUI5
import "sapui5/fiori"

VBox(alignment: .stretch, spacing: 0) {
  ShellBar("Manage Products", logo: "assets/images/logo.svg", notifications: 2, avatar: "Ana Lima")
  DynamicPage {
    DynamicPageTitle(header: { VariantManagement("Standard") }, actions: {
      Button(icon: "sap-icon://share").type(.Transparent)
    })
    DynamicPageHeader {
      FilterBar {
        SearchField("Search").frame(width: 220)
        Input(label: "Product", placeholder: "Name or ID")
        Select(label: "Category", selection: "Notebooks") { Item("All"); Item("Notebooks") }
        MultiComboBox(label: "Supplier", selection: ["Titanium", "Very Best"])
        ToolbarSpacer()
        Button("Go").type(.Emphasized)
        Button("Adapt Filters (2)").type(.Transparent)
      }
    }
    Table(selectable: true, header: {
      OverflowToolbar {
        Title("Products (24)")
        ToolbarSpacer()
        Button("Create").type(.Emphasized)
        Button("Delete")
        MenuButton("Export")
        OverflowToolbarButton("sap-icon://action-settings")
      }
    }, footer: {
      VBox(spacing: 2) { Text("**More**"); Text("[ 5 / 24 ]").font(.footnote).foregroundStyle(.secondary) }
    }) {
      Column("Product")
      Column("Supplier")
      Column("Price", alignment: .End)
      Column("Availability")
      ProductRow(name: "Notebook Basic 15", id: "HT-1000", supplier: "Very Best Screens",
                 price: "956.00", stock: "In Stock")
      ProductRow(name: "Notebook Professional 17", id: "HT-1011", supplier: "Titanium",
                 price: "2,299.00", stock: "Low Stock", state: "Warning", selected: true)
      ProductRow(name: "ITelO Vault", id: "HT-1007", supplier: "Technocom",
                 price: "299.00", stock: "Out of Stock", state: "Error")
      ProductRow(name: "Ergo Screen E-I", id: "HT-1030", supplier: "Very Best Screens",
                 price: "230.00", stock: "In Stock")
      ProductRow(name: "Comfort Easy", id: "HT-1040", supplier: "Titanium",
                 price: "1,679.00", stock: "In Stock")
    }
  }
}
.frame(maxHeight: .infinity)
```

## Object page

The object page floorplan: breadcrumbs, title, avatar and actions, key facts in the header, the
anchor bar, a `SimpleForm` section in display mode and an items `Table`.

```mockitdown title="Product object page" id="OP-01" height="960" url="https://s4.example.com/ui#Product-display&/HT-1000"
import SAPUI5
import "sapui5/fiori"

VBox(alignment: .stretch, spacing: 0) {
  ShellBar("Manage Products", logo: "assets/images/logo.svg", notifications: 2, avatar: "Ana Lima")
  ObjectPageLayout {
    ObjectPageHeader(avatar: "Notebook Basic", header: {
      VBox(alignment: .leading, spacing: 4) {
        Breadcrumbs(items: ["Manage Products", "Notebooks", "HT-1000"])
        Title("Notebook Basic 15", level: .H3)
        Text("HT-1000 · Notebooks").foregroundStyle(.secondary)
      }
    }, actions: {
      Button("Edit").type(.Emphasized)
      Button("Delete").type(.Transparent)
      Button("Copy").type(.Transparent)
      OverflowToolbarButton("sap-icon://overflow")
    }) {
      HeaderFact(label: "Availability") { ObjectStatus("In Stock", state: .Success).inverted() }
      HeaderFact(label: "Price") { ObjectNumber("956.00", "EUR").font(.title2) }
      HeaderFact(label: "Rating") { RatingIndicator(4, label: "(128)") }
      HeaderFact(label: "Stock Level") { ProgressIndicator(72, state: .Success).frame(width: 200) }
      HeaderFact(label: "Supplier") { Link("Very Best Screens") }
    }
    AnchorBar(items: ["General Information", "Items", "Sales", "Reviews"], selection: 0)
    ObjectPageSection("General Information") {
      SimpleForm {
        Title("Product")
        Label("Name"); Text("Notebook Basic 15")
        Label("Category"); Text("Notebooks")
        Label("Dimensions"); Text("30 × 18 × 3 cm · 4.2 KG")
        Label("Status"); ObjectStatus("Released", state: .Information, icon: "sap-icon://status-positive")
        Label("Description"); Text("Notebook Basic 15 with 2.80 GHz quad core, 15\" LCD, 8 GB DDR3 RAM, 500 GB hard disc.")
      }
    }
    ObjectPageSection("Items") {
      Table {
        Column("Component")
        Column("Quantity", alignment: .End)
        Column("Status")
        ColumnListItem {
          ObjectIdentifier("Power Adapter", "PA-65W")
          ObjectNumber("1", "PC")
          ObjectStatus("Available", state: .Success)
        }
        ColumnListItem {
          ObjectIdentifier("Battery Pack", "BP-6C")
          ObjectNumber("2", "PC")
          ObjectStatus("On Order", state: .Warning)
        }
      }
    }
  }
}
.frame(maxHeight: .infinity)
```

## Master–detail with the flexible column layout

A three-column `FlexibleColumnLayout`: a master list of `ObjectListItem`s (the `OrderItem`
component), an `ObjectHeader` with an `IconTabBar` (counts) in the middle, and an
`IllustratedMessage` empty state in the end column.

```mockitdown source="true" title="Purchase orders" id="FCL-01" device="wide" url="https://s4.example.com/ui#PurchaseOrder-manage"
import SAPUI5
import "sapui5/fiori"

VBox(alignment: .stretch, spacing: 0) {
  ShellBar("Purchase Orders", logo: "assets/images/logo.svg", avatar: "Ben Okafor")
  FlexibleColumnLayout {
    Page("Purchase Orders (128)") {
      VBox(alignment: .stretch, spacing: 0) {
        Toolbar { SearchField("Search").frame(maxWidth: .infinity); OverflowToolbarButton("sap-icon://sort") }
        List {
          OrderItem(title: "4500017683", amount: "12,480.00 EUR", supplier: "Acme Office Supplies",
                    date: "Nov 21, 2026", status: "Approved", state: "Success", selected: true)
          OrderItem(title: "4500017691", amount: "980.50 EUR", supplier: "Titanium",
                    date: "Nov 20, 2026", status: "Pending", state: "Warning")
          OrderItem(title: "4500017702", amount: "3,215.00 EUR", supplier: "Technocom",
                    date: "Nov 18, 2026", status: "Rejected", state: "Error")
          OrderItem(title: "4500017710", amount: "455.00 EUR", supplier: "Very Best Screens",
                    date: "Nov 17, 2026", status: "Draft")
        }
      }
    }
    Page("4500017683") {
      VBox(alignment: .stretch, spacing: 0) {
        ObjectHeader("Acme Office Supplies", "12,480.00 EUR") {
          ObjectAttribute("Created by", "Ana Lima")
          ObjectStatus("Approved", state: .Success)
          ObjectAttribute("Delivery", "Dec 12, 2026")
          ObjectStatus("Partially delivered", state: .Information)
        }
        IconTabBar(selection: "Items") {
          IconTabFilter("Information") { Text("General data") }
          IconTabFilter("Items") {
            List {
              StandardListItem("Ergonomic Desk Chair", description: "CH-200 · 12 PC", info: "4,680.00 EUR")
                .type(.Navigation)
              StandardListItem("Standing Desk", description: "DK-140 · 6 PC", info: "7,200.00 EUR")
                .type(.Navigation)
              StandardListItem("Monitor Arm", description: "MA-2 · 6 PC", info: "600.00 EUR",
                               status: .Warning).type(.Navigation)
            }
          }.count(3)
          IconTabFilter("Notes") { Text("") }.count(2)
          IconTabFilter("Attachments") { Text("") }.count(0)
        }
        List(header: "Activity") {
          FeedListItem("Ana Lima", "Approved the order. Please deliver before the office move.",
                       avatar: "Ana Lima", detail: "2 hours ago")
        }
      }
      .toolbar { ToolbarItem(placement: .topBarTrailing) { Button("Edit").type(.Emphasized); OverflowToolbarButton("sap-icon://full-screen") } }
    }
    Page("Attachments") {
      IllustratedMessage("No Attachments Yet", description: "Drop files here or upload the delivery note.",
                         icon: "sap-icon://attachment") {
        Button("Upload").type(.Emphasized)
      }
      .toolbar { ToolbarItem(placement: .topBarTrailing) { OverflowToolbarButton("sap-icon://decline") } }
    }
  }
  .layout(.ThreeColumnsMidExpanded)
  .frame(maxHeight: .infinity)
}
.frame(maxHeight: .infinity)
```

## Tool page dashboard

A `ToolPage` with a `ToolHeader`, the `SideNavigation` and a dashboard of `Card`s — charts, a
notification list and a busy card — with the `ProductSwitch` open in a `Popover`.

```mockitdown title="Service desk" id="TP-01" url="https://servicedesk.example.com/#/overview"
import SAPUI5

ToolPage {
  ToolHeader("Service Desk", menu: true, logo: "assets/images/logo.svg", search: "Search tickets",
             notifications: 5, avatar: "Ben Okafor") {
    Button(icon: "sap-icon://product-switch")
  }
  HBox(alignment: .top, spacing: 0) {
    SideNavigation(selection: "Overview") {
      NavigationListItem("Overview", icon: "sap-icon://home")
      NavigationListItem("Tickets", icon: "sap-icon://activity-items", expanded: true) {
        NavigationListItem("Open", badge: 18)
        NavigationListItem("Escalated", badge: 3)
        NavigationListItem("Resolved")
      }
      NavigationListItem("Customers", icon: "sap-icon://customer")
      NavigationListItem("Knowledge Base", icon: "sap-icon://course-book")
      NavigationListItem("Reports", icon: "sap-icon://bar-chart")
    } footer: {
      NavigationListItem("Settings", icon: "sap-icon://action-settings")
    }
    VBox(alignment: .stretch, spacing: 16) {
      Breadcrumbs(items: ["Service Desk", "Overview"])
      HBox {
        Title("Overview", level: .H3)
        Spacer()
        SegmentedButton(items: ["Today", "Week", "Month"], selection: "Week")
      }
      HBox(alignment: .top, spacing: 16) {
        Card("Tickets per Day", subtitle: "Last 7 days", icon: "sap-icon://bar-chart", status: "Week 47") {
          Chart(kind: .bar, series: [[42, 51, 38, 60, 47, 22, 18], [30, 35, 33, 41, 39, 12, 9]],
                labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], height: 170)
        }
        Card("Notifications", subtitle: "3 unread", icon: "sap-icon://bell") {
          List {
            NotificationListItem("Ticket #4711 escalated by the customer", description: "Contoso · Priority High",
                                 avatar: "Contoso", detail: "5 min", status: .Error)
            NotificationListItem("SLA breach expected for 2 tickets", description: "Queue: Hardware",
                                 avatar: "System", detail: "1 h", status: .Warning)
            NotificationListItem("Knowledge article approved", description: "Reset a locked account",
                                 avatar: "Ana Lima", detail: "3 h", status: .Success)
          }
        }
      }
      HBox(alignment: .top, spacing: 16) {
        Card("Resolution Rate", subtitle: "Target 90 %", icon: "sap-icon://kpi-corporate-performance") {
          NumericContent("87", "%", color: .Critical).indicator(.Up)
          ProgressIndicator(87, state: .Warning)
        }
        Card("Satisfaction", subtitle: "1,204 ratings", icon: "sap-icon://heart") {
          RatingIndicator(4.5, label: "4.5 of 5")
          HBox(spacing: 8) { InfoLabel("NPS 62", color: 8); InfoLabel("Top Agent: Ana", color: 6) }
        }
        Card("Team Load", subtitle: "Refreshing…", icon: "sap-icon://group") {
          BusyIndicator("Loading data").padding(.vertical, 12)
        }
      }
    }
    .padding(24)
    .frame(maxWidth: .infinity)
  }
  .frame(maxHeight: .infinity)
  Popover("Products") {
    ProductSwitch {
      ProductSwitchItem("Service Desk", icon: "sap-icon://headset", selected: true)
      ProductSwitchItem("Sales Cloud", icon: "sap-icon://sales-order")
      ProductSwitchItem("Analytics", icon: "sap-icon://line-chart")
      ProductSwitchItem("Procurement", icon: "sap-icon://cart")
      ProductSwitchItem("Field Service", icon: "sap-icon://wrench")
      ProductSwitchItem("Learning", icon: "sap-icon://course-book")
    }
  }
}
.frame(maxHeight: .infinity)
```

## Wizard

A guided `Wizard` on step 2 of 4: the numbered progress navigator, a step with a form, and the
"next step" button.

```mockitdown source="true" title="Request equipment" id="WZ-01" url="https://s4.example.com/ui#Equipment-request"
import SAPUI5

VBox(alignment: .stretch, spacing: 0) {
  ShellBar("Request Equipment", logo: "assets/images/logo.svg", avatar: "Ana Lima")
  Wizard(selection: 1) {
    WizardStep("Product Type")
    WizardStep("Product Information") {
      Title("2. Product Information", level: .H4)
      MessageStrip("Equipment over 1,000 EUR needs your manager's approval.", type: .Warning,
                   icon: "sap-icon://message-warning")
      SimpleForm {
        Label("Name"); Input(value: "Ergonomic Desk Chair")
        Label("Weight (kg)"); StepInput(value: 12)
        Label("Manufacturer"); ComboBox(selection: "Herman & Co.")
        Label("Colour"); SegmentedButton(items: ["Black", "Grey", "Blue"], selection: "Grey")
        Label("Comfort Level"); Slider(value: 70, in: 0...100)
        Label("Price Range"); RangeSlider(value: [300, 900], in: 0...1500, showValue: false)
        Label("Description"); TextArea("Adjustable lumbar support, 4D armrests.", rows: 2)
        Label("Accessories")
        Tokenizer { Token("Headrest"); Token("Wheels (hard floor)"); Token("Footrest") }
      }
      HBox { Button("Step 3").type(.Emphasized) }
    }
    WizardStep("Optional Information")
    WizardStep("Pricing")
  }
  .frame(maxHeight: .infinity)
  Bar {
    ToolbarSpacer()
    Button("Review").type(.Emphasized).disabled()
    Button("Cancel").type(.Transparent)
  }
}
.frame(maxHeight: .infinity)
```

## Confirmation: MessageBox and MessageToast

Deleting from a table: a warning `MessageStrip` on the page, the `MessageBox` asking for
confirmation and a `MessageToast` from the previous action.

```mockitdown title="Delete products" id="MB-01" appearance="both" device="tablet" url="https://s4.example.com/ui#Product-manage"
import SAPUI5
import "sapui5/fiori"

Page("Manage Products") {
  VBox(alignment: .stretch, spacing: 16) {
    MessageStrip("3 products are below their safety stock.", type: .Warning, icon: "sap-icon://message-warning",
                 closable: true)
    Table(selectable: true, header: {
      OverflowToolbar { Title("Products (24)"); ToolbarSpacer(); Button("Create"); Button("Delete").type(.Emphasized) }
    }) {
      Column("Product")
      Column("Supplier")
      Column("Price", alignment: .End)
      Column("Availability")
      ProductRow(name: "Notebook Basic 15", id: "HT-1000", supplier: "Very Best Screens", price: "956.00",
                 stock: "In Stock", selected: true)
      ProductRow(name: "ITelO Vault", id: "HT-1007", supplier: "Technocom", price: "299.00",
                 stock: "Out of Stock", state: "Error", selected: true)
      ProductRow(name: "Comfort Easy", id: "HT-1040", supplier: "Titanium", price: "1,679.00",
                 stock: "Low Stock", state: "Warning", selected: true)
      ProductRow(name: "Ergo Screen E-I", id: "HT-1030", supplier: "Very Best Screens", price: "230.00",
                 stock: "In Stock")
    }
  }
  .padding(16)
  MessageBox("Delete Products", message: "Delete the 3 selected products? This cannot be undone.",
             state: .Warning, icon: "sap-icon://message-warning", buttons: ["Delete", "Cancel"], primary: "Delete")
  MessageToast("2 products were archived")
}
```

## Phone

On a phone the same controls stack: a `Page` with a search toolbar, a grouped `List` with
highlights, avatars and navigation items, and an `Accept` / `Reject` footer.

```mockitdown source="true" title="My Inbox" id="INB-PH" device="phone"
import SAPUI5

Page("My Inbox (6)") {
  VBox(alignment: .stretch, spacing: 0) {
    Toolbar { SearchField("Search").frame(maxWidth: .infinity) }
    Toolbar { SegmentedButton(items: ["All", "Approvals", "Tasks"], selection: "All").frame(maxWidth: .infinity) }
    List {
      GroupHeaderListItem("Today")
      StandardListItem("Leave Request", description: "Ana Lima · Dec 22 – Jan 2", avatar: "Ana Lima",
                       info: "High", status: .Error).type(.Navigation)
      StandardListItem("Purchase Order 4500017691", description: "Titanium · 980.50 EUR",
                       icon: "sap-icon://sales-order", info: "Medium", status: .Warning).type(.Navigation)
      StandardListItem("Travel Expense", description: "Ben Okafor · 412.00 EUR",
                       icon: "sap-icon://travel-expense", info: "Low").type(.Navigation)
      GroupHeaderListItem("Yesterday")
      StandardListItem("Timesheet Week 47", description: "Chen Wu · 41.5 h", avatar: "Chen Wu",
                       info: "Low").type(.Navigation)
      StandardListItem("Contract Renewal", description: "Contoso · 3 years",
                       icon: "sap-icon://document", info: "Medium", status: .Warning).type(.Navigation)
      InputListItem("Show completed") { Switch(isOn: false) }
    }
  }
  .toolbar {
    ToolbarItem(placement: .bottomBar) {
      Button("Approve").type(.Accept)
      Button("Reject").type(.Reject)
      OverflowToolbarButton("sap-icon://overflow")
    }
  }
}
```
