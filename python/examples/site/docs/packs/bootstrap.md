# Bootstrap

The **bootstrap** pack imitates **Bootstrap 5.3** with its default theme, used directly or through
React-Bootstrap or ng-bootstrap: the system-ui font stack at 16 px / 1.5, primary `#0d6efd`, 38 px
controls with 6 px corners, the `.25rem` blue focus ring, cards with header and footer bands, and the
`data-bs-theme="dark"` colour mode (body `#212529`, text `#dee2e6`, borders `#495057`). Select it with

```swift
import Bootstrap        // or: import ReactBootstrap
```

Elements use the React-Bootstrap component names without the dot: `Navbar`, `NavbarBrand`, `Nav` /
`NavLink` (`variant: "tabs" | "pills" | "underline"`), `NavDropdown`, `Container` / `Row` / `Col`,
`Stack`, `Card` (title, subtitle, image, `header:` and `footer:` bands), `Button` (`variant:
"primary" … "dark"`, `"link"`, `"outline-*"`, `size: "sm" | "lg"`), `ButtonGroup`, `ToggleButton`,
`DropdownButton` / `SplitButton` / `DropdownItem`, `Form`, `FormGroup`, `FormLabel`, `FormControl`,
`FormSelect`, `FormCheck`, `FormSwitch`, `FormRadio`, `FormRange`, `FloatingLabel`, `InputGroup` /
`InputGroupText`, `Alert`, `Badge`, `Breadcrumb`, `ListGroup` / `ListGroupItem`, `Table`,
`Pagination`, `ProgressBar`, `Spinner`, `Placeholder`, `Accordion` / `AccordionItem`, `Carousel`,
`Modal`, `Offcanvas`, `Toast` / `ToastContainer`, `Tooltip` and `Popover` — `mockitdown elements
bootstrap` lists them all. Boolean props are modifiers: `.active()`, `.pill()`, `.bg(.success)`,
`.striped()`, `.hover()`, `.bordered()`, `.flush()`, `.isInvalid()`, `.md(6)`. Bootstrap utility
classes work through `.class("…")` (`text-body-secondary`, `fw-bold`, `display-5`, `lead`,
`me-auto`, `border-bottom`, `bg-body-tertiary`, `shadow-sm`, …), and Bootstrap Icons names
(`"speedometer2"`, `"three-dots"`, `"person-circle"`) are understood.

The custom components used below (`FeatureCard`, `StatCard`, `CartLine`, `TableToolbar`,
`OrderStatus`) live in `mockups/bootstrap/components.mockitdown` and are imported with
`import "bootstrap/components"`.

## Buttons, badges and alerts

The building blocks in both colour modes: solid and outline buttons, sizes, a button group with an
active button, a split button, spinners, badges, alerts, a tooltip and a popover.

```mockitdown source="true" appearance="both" width="720" height="640" chrome="none" title="Components"
import Bootstrap

VStack(alignment: .leading, spacing: 16) {
  HStack(spacing: 8, wrap: true) {
    Button("Primary")
    Button("Secondary", variant: "secondary")
    Button("Success", variant: "success")
    Button("Danger", variant: "danger")
    Button("Warning", variant: "warning")
    Button("Info", variant: "info")
    Button("Light", variant: "light")
    Button("Dark", variant: "dark")
    Button("Link", variant: "link")
  }
  HStack(spacing: 8, wrap: true) {
    Button("Outline", variant: "outline-primary")
    Button("Secondary", variant: "outline-secondary")
    Button("Small", size: "sm")
    Button("Large", variant: "success", size: "lg")
    ButtonGroup {
      Button("Left", variant: "outline-primary")
      Button("Middle", variant: "outline-primary").active()
      Button("Right", variant: "outline-primary")
    }
    SplitButton("Action", variant: "secondary")
    Spinner(variant: "primary")
    Spinner(variant: "success").animation(.grow)
  }
  HStack(spacing: 8, wrap: true) {
    Badge("Primary")
    Badge("Secondary").bg(.secondary)
    Badge("Success").bg(.success)
    Badge("Danger").bg(.danger)
    Badge("Warning").bg(.warning)
    Badge("Info").bg(.info)
    Badge("99+").bg(.danger).pill()
    Badge("Subtle").bg(.success).variant(.subtle)
  }
  Alert("A simple primary alert — check it out!")
  Alert("Your changes have been saved.", variant: "success", dismissible: true)
  HStack(alignment: .top, spacing: 16) {
    Alert(variant: "warning", title: "Heads up!") {
      Text("Your trial ends in 3 days. Add a payment method to keep your projects online.")
      AlertLink("Add a card")
    }
    .frame(width: 270)
    VStack(alignment: .leading, spacing: 56) {
      Tooltip("Tooltip on top") { Button("Hover me", variant: "secondary") }
      Popover("Popover title", "And here's some amazing content.") {
        Button("Popover", variant: "danger")
      }
    }
    .padding(.top, 40)
  }
}
.padding(24)
```

## Sign-in form

The Bootstrap "sign-in" example: floating labels, a checkbox and a full-width large button.

```mockitdown source="true" appearance="both" width="400" height="520" chrome="none" title="Sign in"
import Bootstrap

Form {
  Image("assets/images/logo.svg").frame(width: 57, height: 57)
  Text("Please sign in").font(.h3).fontWeight(.regular)
  FloatingLabel("Email address", text: "name@example.com").state(.focused)
  FloatingLabel("Password", text: "hunter22", type: "password")
  FormCheck("Remember me", checked: true)
  Button("Sign in", size: "lg").frame(maxWidth: .infinity)
  Text("© 2017–2026").class("text-body-secondary")
}
.padding(32)
```

## Landing page

A marketing page: navbar with brand, nav links and actions, a hero with a carousel slide, three
feature columns built from a custom `FeatureCard`, and a footer.

```mockitdown source="true" title="Landing page" url="https://lumen.example.com"
import Bootstrap
import "bootstrap/components"

VStack(spacing: 0) {
  Navbar(brand: "Lumen", logo: "assets/images/logo.svg") {
    Nav {
      NavLink("Features").active()
      NavLink("Pricing")
      NavLink("Customers")
      NavLink("Docs")
    }
    Button("Log in", variant: "outline-primary")
    Button("Sign up")
  }
  .class("border-bottom")
  Container(spacing: 48) {
    Row {
      Col(6) {
        Text("Build dashboards your team will actually use").class("display-5 fw-bold")
        Text("Lumen turns your data warehouse into fast, beautiful reports. Connect a source, drop in a chart and share a link — no SQL required.")
          .class("lead text-body-secondary")
        HStack(spacing: 8) {
          Button("Start free trial", size: "lg")
          Button("Book a demo", variant: "outline-secondary", size: "lg")
        }
        .padding(.top, 8)
      }
      .frame(alignment: .leading)
      Col(6) {
        Carousel("Real-time KPIs", subtitle: "Every chart refreshes as your data changes.",
                 image: "assets/images/photo-3.svg", mediaHeight: 300)
          .class("rounded-3 shadow")
      }
    }
    Row {
      Col { FeatureCard(icon: "speedometer2", title: "Fast by default", text: "Queries are cached at the edge, so dashboards load in well under a second.") }
      Col { FeatureCard(icon: "people", title: "Built for teams", text: "Comments, mentions and shared folders keep everyone looking at the same numbers.") }
      Col { FeatureCard(icon: "shield-lock", title: "Secure", text: "SSO, row-level permissions and audit logs come with every plan.", link: "Read the whitepaper") }
    }
  }
  .padding(.vertical, 48)
  Spacer()
  HStack {
    Text("© 2026 Lumen, Inc.").class("text-body-secondary")
    Spacer()
    HStack(spacing: 16) {
      Text("Privacy").class("text-body-secondary")
      Text("Terms").class("text-body-secondary")
      Text("Contact").class("text-body-secondary")
    }
  }
  .padding(.horizontal, 24)
  .padding(.vertical, 16)
  .class("border-top")
}
```

## Checkout

The "checkout" example: a 12-column `Row` / `Col` grid, input groups, selects, radio buttons, and a
cart summary `ListGroup` with badges, built from a custom `CartLine` row.

```mockitdown title="Checkout" height="1340" url="https://shop.example.com/checkout"
import Bootstrap
import "bootstrap/components"

Container(spacing: 24) {
  VStack(spacing: 8) {
    Image("assets/images/logo.svg").frame(width: 72, height: 57)
    Text("Checkout form").font(.h2)
    Text("Enter your billing address and payment details. Every field marked as required must be filled in before you continue.")
      .class("lead text-body-secondary text-center")
      .frame(width: 720)
  }
  .padding(.top, 32)
  Row {
    Col(7, spacing: 16) {
      Text("Billing address").font(.h4)
      Row {
        Col(6) { FormControl(label: "First name", text: "Ana") }
        Col(6) { FormControl(label: "Last name", text: "Lima") }
      }
      .gap(3)
      FormGroup {
        FormLabel("Username")
        InputGroup {
          InputGroupText("@")
          FormControl("Username", text: "analima")
        }
      }
      FormControl("you@example.com", label: "Email (Optional)")
      FormControl("1234 Main St", label: "Address", error: "Please enter your shipping address.").isInvalid()
      Row {
        Col(5) { FormSelect("Portugal", label: "Country") { Text("Choose…"); Text("Portugal"); Text("Spain") } }
        Col(4) { FormSelect("Lisbon", label: "State") { Text("Lisbon"); Text("Porto") } }
        Col(3) { FormControl(label: "Zip", text: "1100-148") }
      }
      .gap(3)
      Divider()
      FormCheck("Shipping address is the same as my billing address", checked: true)
      FormCheck("Save this information for next time")
      Divider()
      Text("Payment").font(.h4)
      VStack(alignment: .leading, spacing: 8) {
        FormRadio("Credit card", checked: true)
        FormRadio("Debit card")
        FormRadio("PayPal")
      }
      Row {
        Col(6) { FormControl(label: "Name on card", text: "Ana M. Lima", helper: "Full name as displayed on card") }
        Col(6) { FormControl(label: "Credit card number", text: "4242 4242 4242 4242") }
        Col(3) { FormControl(label: "Expiration", text: "08/28") }
        Col(3) { FormControl(label: "CVV", text: "123").state(.focused) }
      }
      .gap(3)
      Divider()
      Button("Continue to checkout", size: "lg").frame(maxWidth: .infinity)
    }
    Col(5, spacing: 16) {
      HStack {
        Text("Your cart").font(.h4).class("text-primary")
        Spacer()
        Badge("3").pill()
      }
      ListGroup {
        CartLine(name: "Product name", note: "Brief description", price: "$12")
        CartLine(name: "Second product", note: "Brief description", price: "$8")
        CartLine(name: "Third item", note: "Brief description", price: "$5")
        ListGroupItem("Promo code", subtitle: "EXAMPLECODE", detail: "−$5", variant: "success")
        ListGroupItem("Total (USD)", detail: "**$20**").bold()
      }
      InputGroup {
        FormControl("Promo code")
        Button("Redeem", variant: "secondary")
      }
    }
  }
}
```

## Admin dashboard

The "dashboard" example: a dark navbar with a search field, a `bg-body-tertiary` sidebar of nav
pills, a button toolbar, four `StatCard`s, a line chart and a striped, small table.

```mockitdown source="true" title="Dashboard" height="900" url="https://admin.example.com"
import Bootstrap
import "bootstrap/components"

VStack(spacing: 0) {
  Navbar(brand: "Company name") {
    FormControl("Search", type: "search").frame(width: 420)
    Spacer()
    NavbarText("Ana Lima")
    Button("Sign out", variant: "outline-light", size: "sm")
  }
  .bg(.dark)
  HStack(alignment: .top, spacing: 0) {
    VStack(alignment: .stretch, spacing: 4) {
      Nav(variant: "pills", selection: "Dashboard") {
        NavLink("Dashboard", systemImage: "house")
        NavLink("Orders", systemImage: "file-earmark").badge(12)
        NavLink("Products", systemImage: "cart")
        NavLink("Customers", systemImage: "people")
        NavLink("Reports", systemImage: "graph-up")
        NavLink("Integrations", systemImage: "puzzle")
      }
      .class("flex-column")
      Text("Saved reports").class("text-body-secondary small text-uppercase fw-semibold").padding(.top, 16).padding(.horizontal, 16)
      Nav {
        NavLink("Current month", systemImage: "file-earmark-text")
        NavLink("Last quarter", systemImage: "file-earmark-text")
        NavLink("Year-end sale", systemImage: "file-earmark-text")
      }
      .class("flex-column")
      Spacer()
      Divider()
      Nav {
        NavLink("Settings", systemImage: "gear")
        NavLink("Sign out", systemImage: "door-open")
      }
      .class("flex-column")
    }
    .padding(12)
    .frame(width: 240, maxHeight: .infinity)
    .class("bg-body-tertiary border-end")
    VStack(alignment: .stretch, spacing: 16) {
      HStack {
        Text("Dashboard").font(.h2)
        Spacer()
        ButtonGroup {
          Button("Share", variant: "outline-secondary", size: "sm")
          Button("Export", variant: "outline-secondary", size: "sm")
        }
        DropdownButton("This week", variant: "outline-secondary", size: "sm", systemImage: "calendar3")
      }
      .padding(.bottom, 8)
      .class("border-bottom")
      Row {
        Col { StatCard(label: "Revenue", value: "$48,210", delta: "+12.4%", icon: "currency-dollar") }
        Col { StatCard(label: "Orders", value: "1,284", delta: "+3.1%", icon: "bag") }
        Col { StatCard(label: "Customers", value: "9,412", delta: "+0.8%", icon: "people") }
        Col { StatCard(label: "Refunds", value: "37", delta: "−4.0%", icon: "arrow-repeat", up: false) }
      }
      .gap(3)
      Card {
        Chart(kind: .line, values: [15339, 21345, 18483, 24003, 23489, 24092, 12034],
              labels: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"], height: 190)
      } header: {
        Text("Weekly sales")
      }
      Text("Recent orders").font(.h4)
      Table(columns: ["#", "Customer", "Product", "Status", "Amount"],
            rows: [["1,001", "Ana Lima", "Pro plan · annual", OrderStatus(status: "Paid"), "$1,188.00"],
                   ["1,002", "Ben Okafor", "Team seats × 5", OrderStatus(status: "Pending"), "$245.00"],
                   ["1,003", "Chen Wu", "Starter plan", OrderStatus(status: "Paid"), "$19.00"],
                   ["1,004", "Dana Kim", "Data add-on", OrderStatus(status: "Refunded"), "$49.00"]])
        .striped()
        .size(.sm)
    }
    .padding(24)
    .frame(maxWidth: .infinity)
  }
  .frame(maxWidth: .infinity, maxHeight: .infinity)
}
```

## Orders table

A data table page: breadcrumb, a custom `TableToolbar` (search input group, filter dropdowns, a
button group), an open status filter, selectable rows with status badges and row menus, pagination,
and a toast confirming an export.

```mockitdown title="Orders" url="https://admin.example.com/orders"
import Bootstrap
import "bootstrap/components"

let orders = [("#3210", "Ana Lima", "Nov 23, 2026", "Paid", "$1,188.00"),
              ("#3209", "Ben Okafor", "Nov 23, 2026", "Pending", "$245.00"),
              ("#3208", "Chen Wu", "Nov 22, 2026", "Paid", "$19.00"),
              ("#3207", "Dana Kim", "Nov 22, 2026", "Refunded", "$49.00"),
              ("#3206", "Eli Novak", "Nov 21, 2026", "Failed", "$310.00"),
              ("#3205", "Farah Haddad", "Nov 21, 2026", "Paid", "$96.00"),
              ("#3204", "Gus Moreau", "Nov 20, 2026", "Paid", "$540.00")]

Container(spacing: 16) {
  Breadcrumb(["Home", "Sales", "Orders"]).padding(.top, 24)
  HStack {
    Text("Orders").font(.h2)
    Badge("248").bg(.secondary).pill()
  }
  ZStack(alignment: .topLeading) {
    VStack(alignment: .stretch, spacing: 16) {
      TableToolbar(status: "Status: Pending")
      Table(columns: ["Order", "Customer", "Date", "Status", TableColumn("Total", alignment: .trailing), " "],
            selectable: true, selectedRows: [1, 3]) {
        ForEach(orders) { id, name, date, status, total in
          TableRow {
            Text(id).bold()
            Label(name, systemImage: "person-circle")
            Text(date)
            OrderStatus(status: status)
            Text(total).frame(maxWidth: .infinity, alignment: .trailing)
            Image(systemName: "three-dots").foregroundStyle(.secondary)
          }
        }
      }
      .hover()
      HStack {
        Text("Showing 1 to 7 of 248 orders").class("text-body-secondary")
        Spacer()
        Pagination(count: 36, page: 2)
      }
    }
    .frame(maxWidth: .infinity)
    DropdownMenu {
      DropdownHeader("Status")
      DropdownItem("All statuses")
      DropdownItem("Paid")
      DropdownItem("Pending").active()
      DropdownItem("Refunded")
      DropdownItem("Failed").disabled()
      DropdownDivider()
      DropdownItem("Clear filter", systemImage: "x-lg")
    }
    .offset(x: 316, y: 42)
  }
  .frame(maxWidth: .infinity)
  ToastContainer(position: "bottom-end") {
    Toast("Export ready", status: "just now", systemImage: "download") {
      Text("248 orders were exported to **orders-2026-11.csv**.")
    }
  }
}
```

## Mobile navigation

On a phone the navbar collapses behind a toggler; here the offcanvas menu is open at the end edge.

```mockitdown source="true" device="phone" appearance="both" title="Offcanvas menu"
import Bootstrap

VStack(alignment: .stretch, spacing: 0) {
  Navbar(brand: "Lumen", logo: "assets/images/logo.svg") {
    Spacer()
    NavbarToggle()
  }
  .class("border-bottom")
  VStack(alignment: .leading, spacing: 12) {
    Text("Weekly report").font(.h3)
    Placeholder(7).size("lg")
    Placeholder(10)
    Placeholder(9)
    Placeholder(6).animation(.glow)
  }
  .padding(16)
  Offcanvas("Lumen", placement: "end") {
    Nav(variant: "pills", selection: "Dashboard") {
      NavLink("Dashboard", systemImage: "speedometer2")
      NavLink("Reports", systemImage: "bar-chart")
      NavLink("Team", systemImage: "people")
      NavLink("Settings", systemImage: "gear")
    }
    .class("flex-column")
    Divider()
    FormControl("Search", type: "search")
    Button("Sign out", variant: "outline-secondary").frame(maxWidth: .infinity)
  }
  .frame(width: 290)
}
```

## Modal dialog

An open modal over a team page: header with close button, a form with an open select, and a footer
with secondary and primary actions.

```mockitdown source="true" title="Invite modal" url="https://app.example.com/team"
import Bootstrap

VStack(spacing: 0) {
  Navbar(brand: "Lumen", logo: "assets/images/logo.svg") {
    Nav {
      NavLink("Dashboards")
      NavLink("Team").active()
      NavLink("Billing")
    }
    Avatar("Ana Lima", image: "assets/images/avatar-1.svg").size(.small)
  }
  .class("border-bottom")
  Container(spacing: 16) {
    HStack {
      Text("Team").font(.h2)
      Spacer()
      Button("Invite people", systemImage: "person-plus")
    }
    ListGroup {
      ListGroupItem("Ana Lima", subtitle: "ana@lumen.example", detail: "Owner", avatar: "Ana Lima")
      ListGroupItem("Ben Okafor", subtitle: "ben@lumen.example", detail: "Admin", avatar: "Ben Okafor")
      ListGroupItem("Chen Wu", subtitle: "chen@lumen.example", detail: "Editor", avatar: "Chen Wu")
    }
  }
  .padding(.top, 24)
  Modal("Invite teammates") {
    FormControl(label: "Email addresses", text: "dana@lumen.example, eli@lumen.example")
      .state(.focused)
    FormSelect("Editor", label: "Role", open: true) {
      Text("Viewer")
      Text("Editor")
      Text("Admin")
    }
    FormControl("Add a personal note (optional)", label: "Message", type: "textarea")
    FormSwitch("Send a copy to me", checked: true)
  } footer: {
    Button("Cancel", variant: "secondary")
    Button("Send invites")
  }
}
```

## Profile and settings

A settings page with nav tabs, an alert, switches, progress bars, an accordion and a list group.

```mockitdown source="true" appearance="both" title="Settings" height="900" url="https://app.example.com/settings"
import Bootstrap

Container(spacing: 24) {
  HStack(spacing: 16) {
    Image("assets/images/avatar-2.svg").frame(width: 64, height: 64).roundedCircle()
    VStack(alignment: .leading, spacing: 0) {
      Text("Chen Wu").font(.h3)
      Text("chen@lumen.example · Member since 2023").class("text-body-secondary")
    }
    Spacer()
    Button("View public profile", variant: "outline-secondary", systemImage: "box-arrow-up-right")
  }
  .padding(.top, 24)
  Tabs(selection: "Notifications") {
    Tab("Profile") { Text("Profile") }
    Tab("Account") { Text("Account") }
    Tab("Notifications") {
      Row {
        Col(7, spacing: 16) {
          Alert(variant: "info", dismissible: true) {
            Text("**New:** weekly digests now include your team's most-viewed dashboards.")
          }
          Card("Email notifications", subtitle: "Choose what we email you about.") {
            FormSwitch("Comments and mentions", checked: true)
            FormSwitch("Dashboard shared with me", checked: true)
            FormSwitch("Weekly digest", checked: false)
            FormSwitch("Product updates", checked: false)
            FormRange("Digest frequency (days)", value: 7, in: 1...14)
          } footer: {
            Button("Save changes")
            Button("Reset", variant: "link")
          }
          Accordion {
            AccordionItem("Why am I receiving emails?", expanded: true) {
              Text("You are a member of the **Lumen Analytics** workspace. Workspace owners can require some notifications.")
            }
            AccordionItem("How do I unsubscribe from everything?")
          }
        }
        Col(5, spacing: 16) {
          Card {
            ProgressBar(68, label: "68%")
            Text("6.8 GB of 10 GB used").class("text-body-secondary small")
            ProgressBar(92, label: "92%", variant: "danger").striped()
            Text("API calls this month: 92,000 of 100,000").class("text-body-secondary small")
          } header: {
            Text("Usage")
          }
          ListGroup {
            ListGroupItem("Email", detail: "Verified").badge("✓")
            ListGroupItem("Two-factor authentication").active()
            ListGroupItem("Connected apps").badge(3)
            ListGroupItem("Delete account", variant: "danger")
          }
        }
      }
    }
    Tab("Billing") { Text("Billing") }
  }
}
```
