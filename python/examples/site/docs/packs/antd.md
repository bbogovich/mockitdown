# Ant Design

The **antd** pack imitates [Ant Design](https://ant.design/) **v5** for React together with
**ProComponents** (`ProLayout`, `PageContainer`, `ProTable`, `ProForm`, `QueryFilter`, `ProCard`,
`StatisticCard`), in the default token theme: seed colour `colorPrimary #1677ff`, `borderRadius` 6
(4 small, 8 large), `controlHeight` 32 (24 / 40), 14 px system font with a 1.5715 line height, the
grey `colorBgLayout` page behind white containers and the AntV G2 categorical palette for charts.
Dark mode follows `theme.darkAlgorithm` (`#141414` containers on black, primary `#1668dc`). Select it with

```swift
import Antd        // or: import AntDesign, import ProComponents
```

Elements use the antd component and prop names. Where antd nests names (`Form.Item`, `Badge.Ribbon`,
`Input.Password`, `Upload.Dragger`, `Descriptions.Item`) the pack joins them: `FormItem`, `BadgeRibbon`,
`InputPassword`, `UploadDragger`, `DescriptionsItem`, `TabPane`, `CollapsePanel`, `RangePicker`. Props
keep their antd spelling: `Button(type: "primary" | "default" | "dashed" | "text" | "link")` (or the
v5.21 `color:` + `variant:` pair) with `.danger()`, `size: "small" | "large"`, `shape: "circle"`;
`Input(status: "error", addonAfter:, allowClear:)`; `Form(layout: "horizontal" | "vertical" |
"inline")`; `Select(mode: "multiple")`; `Radio.Group` as `RadioGroup(optionType: "button")`;
`Alert(message:, description:, type:, showIcon:)`; `Badge(count:)`, `Badge(status:, text:)`;
`Tag(color: "magenta" … "purple" | "success" | "processing" | "error" | "warning")`;
`Table(rowSelection:, bordered:, size: "middle" | "small")`; `Steps(items:, current:)`;
`TimelineItem(color:)`; `Result(status:, subTitle:)`; `Statistic(title:, value:)`; `Progress(percent:,
type: "circular")`. `Modal`, `Drawer`, `Message` (`message.success`), `Notification`, `Popconfirm`,
`Popover`, `Tooltip` and `Dropdown` render as open overlays. Ant icon names (`"UserOutlined"`,
`"SettingFilled"`, `"InboxOutlined"`) work wherever an icon is accepted.

The examples import a few Pro blocks from
[`mockups/antd/pro.mockitdown`](https://github.com/) (`import "antd/pro"`): `ChartCard` and `Trend` for
the analysis KPIs, `OrderStatus` for status badges, `RowActions` for a table's operation column and
`TransferBox` for a two-list `Transfer`.

## Sign in

The ProComponents login page: logo and slogan, `Tabs` for the sign-in method, large inputs with
prefix icons, "Auto sign-in", a block primary `Button` and the alternative sign-in row.

```mockitdown source="true" appearance="both" height="680" url="https://console.example.com/user/login"
import Antd
@Screen(title: "Sign in", id: "ANTD-1")

VStack(spacing: 32) {
  Spacer()
  VStack(spacing: 12) {
    HStack(spacing: 16) {
      Image("assets/images/logo.svg").frame(width: 44, height: 44)
      Title("Northwind Console", level: 2)
    }
    Text("The operations console for the Northwind delivery fleet", type: "secondary")
  }
  VStack(alignment: .stretch, spacing: 24) {
    Tabs(items: ["Account sign-in", "Phone sign-in"], selection: 0)
    Input("Username", value: "dispatch.admin", icon: "UserOutlined", size: "large")
    InputPassword("Password", icon: "LockOutlined", size: "large", status: "focused")
    HStack {
      Checkbox("Auto sign-in", checked: true)
      Spacer()
      Link("Forgot password")
    }
    Button("Sign in", type: "primary", size: "large").block()
    HStack(spacing: 8) {
      Text("Sign in with")
      Button(icon: "MobileOutlined", type: "text", shape: "circle", size: "small")
      Button(icon: "MailOutlined", type: "text", shape: "circle", size: "small")
      Button(icon: "SafetyCertificateOutlined", type: "text", shape: "circle", size: "small")
      Spacer()
      Link("Create an account")
    }
  }
  .frame(width: 328)
  Spacer()
  Text("Northwind Console · ©2026 Northwind Logistics", type: "secondary")
}
.padding(24)
.frame(maxWidth: .infinity, maxHeight: .infinity)
```

## Basic form

A horizontal `Form` inside a `Card`: right-aligned labels with colons and required marks, an `Input`
in the error state, a `RangePicker`, a counted `TextArea`, single and multiple `Select`, `Cascader`,
`InputNumber` with an addon, a button-style `RadioGroup`, `Switch`, `Slider`, and an `Upload` with its
file list. The actions sit in the control column.

```mockitdown source="true" height="1130" url="https://console.example.com/form/basic-form"
import Antd
@Screen(title: "New project", id: "ANTD-2")

VStack(alignment: .stretch, spacing: 16) {
  Breadcrumb(["Home", "Projects", "New project"])
  Card(title: "New project") {
    Form(layout: "horizontal") {
      Input("Give the project a name", label: "Project name", value: "Q1 route optimisation", required: true)
      RangePicker(label: "Start and end", value: "2026-12-01  →  2027-03-31", required: true)
      TextArea("Describe the goal", label: "Goal", value: "Cut empty kilometres on the northern routes by re-planning the depot hand-offs.", rows: 3, required: true, showCount: "86 / 200")
      Input("name@example.com", label: "Contact email", value: "lena.hart@northwind", status: "error", help: "Please enter a valid email address")
      Select("Choose an owner", label: "Owner", value: "Lena Hart")
      Select("Add reviewers", label: "Reviewers", mode: "multiple", value: ["Kai Moreno", "Ivy Chen", "Ola Berg"])
      Cascader("Select a region", label: "Region", value: "Europe / Germany / Hamburg")
      InputNumber(label: "Budget", value: "12,000", addonAfter: "EUR")
      FormItem("Visibility") {
        RadioGroup(options: ["Private", "Team", "Company"], value: "Team", optionType: "button")
      }
      FormItem("Weekly digest") { Switch(checked: true) }
      FormItem("Risk appetite") { Slider(value: 35).frame(maxWidth: .infinity) }
      FormItem("Attachments") {
        Upload {
          Button("Click to Upload", icon: "UploadOutlined")
          UploadFile("route-baseline.xlsx")
          UploadFile("depot-map.pdf", status: "uploading")
          UploadFile("old-plan.docx", status: "error")
        }
      }
    } actions: {
      Button("Submit", type: "primary")
      Button("Save draft")
    }
    .frame(maxWidth: 760)
  }
}
.padding(24)
.frame(maxHeight: .infinity, alignment: .top)
```

## Analysis dashboard

The Ant Design Pro "analysis" workspace in a `ProLayout`: a light `ProSider` with nested menus, the
global header, four KPI `ChartCard`s (a `Statistic` total, trend figures, a sparkline, a column chart, a
`Progress`), the sales `ProCard` with a `Segmented` range switch, a column chart in the G2 palette and a
ranking list, then a small `Table` and a donut chart.

```mockitdown appearance="both" device="wide" height="1090" url="https://console.example.com/dashboard/analysis"
import Antd
import "antd/pro"
@Screen(title: "Analysis", id: "ANTD-3")

ProLayout {
  ProSider("Northwind Pro") {
    SubMenu("Dashboard", icon: "DashboardOutlined") {
      MenuItem("Analysis").selected()
      MenuItem("Monitor")
      MenuItem("Workplace")
    }
    SubMenu("Forms", icon: "FormOutlined")
    SubMenu("Lists", icon: "TableOutlined")
    SubMenu("Profiles", icon: "ProfileOutlined")
    SubMenu("Results", icon: "CheckCircleOutlined")
    SubMenu("Exceptions", icon: "WarningOutlined")
    SubMenu("Account", icon: "UserOutlined")
  } header: {
    Image("assets/images/logo.svg").frame(width: 28, height: 28)
  }
  VStack(alignment: .stretch, spacing: 0) {
    ProHeader(avatar: "Mara Quinn") {
      Spacer()
      Button(icon: "SearchOutlined", type: "text")
      Button(icon: "QuestionCircleOutlined", type: "text")
      Badge(count: 11) { Button(icon: "BellOutlined", type: "text") }
      Text("Mara Quinn")
    }
    GridContent {
      Row(gutter: 24) {
        Col(span: 6) {
          ChartCard(title: "Total sales", total: "€ 126,560", footer: "Daily sales", footerValue: "€ 12,423") {
            Trend(label: "WoW", value: "12%")
            Trend(label: "DoD", value: "11%", up: false)
          }
        }
        Col(span: 6) {
          ChartCard(title: "Visits", total: "8,846", footer: "Daily visits", footerValue: "1,234") {
            Sparkline(values: [7, 5, 4, 2, 4, 7, 5, 6, 5, 9, 6, 3, 1, 5, 3, 6, 5]).frame(maxWidth: .infinity)
          }
        }
        Col(span: 6) {
          ChartCard(title: "Payments", total: "6,560", footer: "Conversion rate", footerValue: "60%") {
            BarChart(values: [7, 5, 4, 2, 4, 7, 5, 6, 5, 9, 6, 3, 1, 5, 3, 6, 5], grid: false, height: 46).frame(maxWidth: .infinity)
          }
        }
        Col(span: 6) {
          ChartCard(title: "Campaign effect", total: "78%", footer: "WoW 12% ▲", footerValue: "DoD 11% ▼") {
            Progress(percent: 78, showInfo: false).frame(maxWidth: .infinity)
          }
        }
      }
      ProCard(title: "Sales", headerBordered: true) {
        HStack(alignment: .top, spacing: 48) {
          BarChart(title: "Sales trend", values: [920, 1120, 760, 1030, 870, 1210, 1150, 980, 640, 1090, 1180, 1010],
                   labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"], height: 250)
            .frame(maxWidth: .infinity)
          VStack(alignment: .stretch, spacing: 14) {
            Text("Store sales ranking").bold()
            ForEach([(1, "Harbour Street No. 0", "323,234"), (2, "Harbour Street No. 1", "301,982"),
                     (3, "Harbour Street No. 2", "287,410"), (4, "Harbour Street No. 3", "254,170"),
                     (5, "Harbour Street No. 4", "239,066"), (6, "Harbour Street No. 5", "201,551"),
                     (7, "Harbour Street No. 6", "187,212")]) { rank, name, amount in
              HStack(spacing: 16) {
                Badge(count: "\(rank)", color: rank <= 3 ? "blue" : "default")
                Text(name)
                Spacer()
                Text(amount)
              }
            }
          }
          .frame(width: 360)
        }
      } extra: {
        Segmented(options: ["Today", "This week", "This month", "This year"], value: "This year")
        RangePicker(value: "2026-01-01  →  2026-12-31").frame(width: 256)
      }
      Row(gutter: 24) {
        Col(span: 12) {
          ProCard(title: "Online search") {
            HStack(spacing: 48) {
              Statistic(title: "Search users", value: "12,321", change: "17.1%")
              Statistic(title: "Searches per user", value: "2.7", change: "-26.2%")
            }
            Table(columns: ["Rank", "Keyword", "Users", Column("WoW", alignment: .trailing)], rows: [
              [1, Link("route planner"), 941, Text("16% ▲", type: "danger")],
              [2, Link("depot hours"), 778, Text("3% ▼", type: "success")],
              [3, Link("cold chain"), 512, Text("21% ▲", type: "danger")]
            ], size: "small")
          } extra: {
            Icon("EllipsisOutlined")
          }
        }
        Col(span: 12) {
          ProCard(title: "Sales by category") {
            DonutChart(values: [4544, 3321, 3113, 2341, 1231, 1231], labels: ["Parcels", "Pallets", "Cold chain", "Express", "Returns", "Other"],
                       unit: "€ 15,781", legend: true, height: 220)
          } extra: {
            Segmented(options: ["All", "Online", "Stores"], value: "All", size: "small")
          }
        }
      }
    }
    .padding(24)
  }
}
```

## Order list

A `ProTable` page: the `QueryFilter` search form (#1), the table toolbar with its primary action (#2),
row selection with a sorted amount column and an open row `Dropdown` (#3), and the `FooterToolbar` that
appears while rows are selected (#4). Status cells use the status `Badge`, tags use `Tag` presets.

```mockitdown source="true" device="wide" height="900" url="https://console.example.com/list/orders"
import Antd
import "antd/pro"
@Screen(title: "Orders", id: "ANTD-4")

ProLayout {
  ProSider("Northwind Pro", collapsed: true) {
    MenuItem("Dashboard", icon: "DashboardOutlined")
    MenuItem("Orders", icon: "ShoppingCartOutlined").selected()
    MenuItem("Customers", icon: "TeamOutlined")
    MenuItem("Fleet", icon: "CarOutlined")
    MenuItem("Settings", icon: "SettingOutlined")
  } header: {
    Image("assets/images/logo.svg").frame(width: 28, height: 28)
  }
  VStack(alignment: .stretch, spacing: 0) {
    PageContainer(title: "Order list") {
      QueryFilter {
        ProFormText("Order no.", placeholder: "Please enter")
        ProFormSelect("Status", value: "All")
        ProFormDateRangePicker("Created", placeholder: "Start date  →  End date")
      } actions: {
        Button("Reset")
        Button("Query", type: "primary")
        Link("Expand", icon: "DownOutlined")
      }
      .callout(1, "QueryFilter", alignment: .topTrailing, labelSide: .leading)
      ProTable(headerTitle: "Orders", columns: ["Order no.", "Customer", "Status", Column("Amount", alignment: .trailing), "Created", "Tags", "Actions"], rows: [
        [Link("NW-26-1048"), "Harbour Foods", OrderStatus(status: "Paid"), "€ 1,240.00", "2026-11-23 09:14", Tag("express", color: "blue"), RowActions()],
        [Link("NW-26-1047"), "Lindqvist & Co", OrderStatus(status: "Shipping"), "€ 880.50", "2026-11-23 08:02", Tag("cold chain", color: "cyan"), RowActions()],
        [Link("NW-26-1046"), "Pier 9 Market", OrderStatus(status: "Overdue"), "€ 2,315.00", "2026-11-22 17:41", Tag("priority", color: "volcano"), HStack(spacing: 16) {
          Link("View")
          Link("Edit")
          Dropdown(icon: "MoreOutlined", type: "text", size: "small", open: true) {
            DropdownItem("Duplicate", icon: "CopyOutlined")
            DropdownItem("Export PDF", icon: "FilePdfOutlined")
            MenuDivider()
            DropdownItem("Delete", icon: "DeleteOutlined", danger: true)
          }
        }],
        [Link("NW-26-1045"), "Ostrander Mills", OrderStatus(status: "Paid"), "€ 412.80", "2026-11-22 11:20", Tag("pallet", color: "geekblue"), RowActions()],
        [Link("NW-26-1044"), "Café Mirabel", OrderStatus(status: "Pending"), "€ 96.00", "2026-11-21 16:05", Tag("sample", color: "gold"), RowActions()],
        [Link("NW-26-1043"), "Brightwater Labs", OrderStatus(status: "Refunded"), "€ 1,075.30", "2026-11-21 10:48", Tag("returns", color: "purple"), RowActions()],
        [Link("NW-26-1042"), "Kestrel Outfitters", OrderStatus(status: "Shipping"), "€ 658.00", "2026-11-20 14:33", Tag("express", color: "blue"), RowActions()]
      ], rowSelection: true, selectedRows: [1, 2], sortColumn: 3) toolbar: {
        Spacer()
        Button("New order", type: "primary", icon: "PlusOutlined").callout(2, "Toolbar", alignment: .topLeading)
        Button(icon: "ReloadOutlined", type: "text")
        Button(icon: "ColumnHeightOutlined", type: "text")
        Button(icon: "SettingOutlined", type: "text")
      } footer: {
        Pagination(count: 9, current: 1, showTotal: "1-7 of 61 items")
      }
      .callout(3, "Row selection + sorter", alignment: .bottomTrailing, labelSide: .leading)
    }
    FooterToolbar {
      Text("Selected **2** items  ·  Total amount € 3,195.50")
      Spacer()
      Button("Batch delete")
      Button("Batch approve", type: "primary")
    }
    .callout(4, "FooterToolbar", alignment: .topLeading)
  }
}
```

The query form (#1) is a `QueryFilter` — a three-column horizontal form with Reset / Query / Expand.
The toolbar (#2) holds the page's primary action and the density, reload and column-settings icons.
The table (#3) has `rowSelection`, a sorted column (the blue caret) and a row's "more" `Dropdown`; while
rows are selected the `FooterToolbar` (#4) offers the batch actions.

## Order detail

The "advanced profile" page under a top-navigation layout: the dark `Header` with a horizontal dark
`Menu`, a `PageContainer` with breadcrumb, title, extra buttons and `Statistic`s, a progress `Steps`, a
bordered `Descriptions`, a line-item `Table` and an activity `Timeline`.

```mockitdown height="1180" device="wide" url="https://console.example.com/profile/advanced"
import Antd
import "antd/pro"
@Screen(title: "Order detail", id: "ANTD-5")

Layout {
  Header("Northwind Pro", logo: "assets/images/logo.svg", avatar: "Mara Quinn") {
    Tooltip("Help centre", placement: .bottom) { Button(icon: "QuestionCircleOutlined", type: "text") }
  } center: {
    Menu(mode: "horizontal", theme: "dark") {
      MenuItem("Dashboard")
      MenuItem("Orders").selected()
      MenuItem("Fleet")
      MenuItem("Customers")
      MenuItem("Reports")
    }
  }
  PageContainer(title: "Order NW-26-1046", subtitle: "Pier 9 Market") {
    HStack(alignment: .top, spacing: 48) {
      Descriptions(column: 2, size: "small") {
        DescriptionsItem("Created by", "Lena Hart")
        DescriptionsItem("Order type", "Wholesale")
        DescriptionsItem("Created", "2026-11-22 17:41")
        DescriptionsItem("Depot", "Hamburg North")
        DescriptionsItem("Note", "Deliver to loading bay 4 before 07:00, call ahead.", span: 2)
      }
      .frame(maxWidth: .infinity)
      Statistic(title: "Status", value: "Overdue")
      Statistic(title: "Order amount", value: "€ 2,315.00")
    }
    Tabs(items: ["Details", "Shipments", "Invoices"], selection: 0)
    ProCard(title: "Progress") {
      Steps(items: [["title": "Placed", "description": "Lena Hart · Nov 22 17:41"],
                    ["title": "Picking", "description": "Depot · in progress"],
                    ["title": "Dispatched"], ["title": "Delivered"]], current: 1)
    }
    Row(gutter: 24) {
      Col(span: 16) {
        ProCard(title: "Customer") {
          Descriptions(column: 2, bordered: true) {
            DescriptionsItem("Company", "Pier 9 Market")
            DescriptionsItem("Account") { Tag("key account", color: "gold") }
            DescriptionsItem("Contact", "Jonas Field")
            DescriptionsItem("Phone", "+49 40 5550 1937")
            DescriptionsItem("Payment") { Badge(status: "error", text: "Overdue 3 days") }
            DescriptionsItem("Terms", "Net 14")
            DescriptionsItem("Address", "Kaistraße 9, 20457 Hamburg, Germany", span: 2)
          }
        }
        ProCard(title: "Line items") {
          Table(columns: ["SKU", "Product", Column("Qty", alignment: .trailing), Column("Unit price", alignment: .trailing), Column("Total", alignment: .trailing)], rows: [
            ["P-2210", "Insulated crate, 60 l", "40", "€ 24.50", "€ 980.00"],
            ["P-1185", "Pallet wrap, 500 m", "12", "€ 18.75", "€ 225.00"],
            ["P-3302", "Temperature logger", "15", "€ 74.00", "€ 1,110.00"]
          ], size: "middle")
        }
      }
      Col(span: 8) {
        ProCard(title: "Activity") {
          Timeline {
            TimelineItem("Order placed", label: "Nov 22 17:41", description: "by Lena Hart", color: "green")
            TimelineItem("Payment reminder sent", label: "Nov 25 09:00", description: "Automatic, 1st reminder", color: "gray")
            TimelineItem("Picking started", label: "Nov 26 06:12", description: "Hamburg North, bay 4")
            TimelineItem("Payment overdue", label: "Nov 26 00:00", description: "Credit hold requested", color: "red")
            TimelineItem("Dispatch planned", label: "Nov 27", dot: "ClockCircleOutlined")
          }
        }
      }
    }
  } header: {
    Breadcrumb(["Home", "Orders", "NW-26-1046"])
  } extra: {
    Button("Print", icon: "PrinterOutlined")
    Button("Credit hold")
    Button("Approve", type: "primary")
  }
}
```

## Team members

A classic `Layout` with a dark `Sider`, a light `Header` and a `Card` holding a member `List` with
`CheckableTag` filters, role `Tag`s, status `Badge`s and an `Avatar.Group`. The invite `Modal` is open
with a vertical `Form`, a `message.success` toast confirms the last action, and a `FloatButton` sits in
the corner.

```mockitdown source="true" appearance="both" height="760" url="https://console.example.com/team/members"
import Antd
@Screen(title: "Members", id: "ANTD-6")

Layout(hasSider: true) {
  Sider("Northwind") {
    MenuItem("Overview", icon: "AppstoreOutlined")
    SubMenu("Team", icon: "TeamOutlined", expanded: true) {
      MenuItem("Members").selected()
      MenuItem("Roles")
      MenuItem("Invitations")
    }
    MenuItem("Billing", icon: "WalletOutlined")
    MenuItem("Settings", icon: "SettingOutlined")
  } header: {
    Image("assets/images/logo.svg").frame(width: 28, height: 28)
  }
  Layout {
    Header(theme: "light") {
      Badge(count: 3) { Button(icon: "BellOutlined", type: "text") }
      Avatar("Mara Quinn", size: "small")
    } center: {
      Breadcrumb(["Team", "Members"])
    }
    Content {
      Card(title: "Members") {
        HStack(spacing: 8) {
          Text("Roles:", type: "secondary")
          CheckableTag("All", checked: true)
          CheckableTag("Admins")
          CheckableTag("Dispatch")
          CheckableTag("Drivers")
          CheckableTag("Finance")
          Spacer()
          AvatarGroup {
            Avatar("Lena Hart")
            Avatar("Kai Moreno")
            Avatar("Ivy Chen")
            Avatar("+9", shape: "circle")
          }
        }
        List {
          ListItem("Lena Hart", description: "lena.hart@northwind.example", avatar: "Lena Hart") {
            Tag("admin", color: "magenta")
            Badge(status: "success", text: "Active").frame(width: 110)
            Link("Edit")
          }
          ListItem("Kai Moreno", description: "kai.moreno@northwind.example", avatar: "Kai Moreno") {
            Tag("dispatch", color: "geekblue")
            Badge(status: "success", text: "Active").frame(width: 110)
            Link("Edit")
          }
          ListItem("Ivy Chen", description: "ivy.chen@northwind.example", avatar: "Ivy Chen") {
            Tag("finance", color: "green")
            Badge(status: "warning", text: "Invited").frame(width: 110)
            Link("Edit")
          }
          ListItem("Ola Berg", description: "ola.berg@northwind.example", avatar: "Ola Berg") {
            Tag("driver", color: "orange")
            Badge(status: "default", text: "Suspended").frame(width: 110)
            Link("Edit")
          }
        }
        HStack {
          Spacer()
          Pagination(count: 3, current: 1, size: "small")
        }
      } extra: {
        InputSearch("Search members").frame(width: 220)
        Button("Invite member", type: "primary", icon: "UserAddOutlined")
      }
    }
  }
}
Modal(title: "Invite member") {
  Form(layout: "vertical") {
    Input("name@example.com", label: "Email addresses", value: "noor.sahin@northwind.example", required: true)
    Select("Select a role", label: "Role", value: "Dispatch", required: true)
    Checkbox("Send a welcome email with the getting-started guide", checked: true)
  }
} footer: {
  Button("Cancel")
  Button("Send invitation", type: "primary")
}
Message("Ola Berg was suspended", type: "success", icon: "CheckCircleFilled")
FloatButton(icon: "QuestionCircleOutlined")
```

## Import wizard

A step-by-step import (`Steps` with a finished, a current and two waiting steps): an info `Alert`, the
`Upload.Dragger` with its file, a `Transfer` that picks the columns to import, a circular `Progress`,
and a `notification` in the top-right corner.

```mockitdown height="730" url="https://console.example.com/import/shipments"
import Antd
import "antd/pro"
@Screen(title: "Import shipments", id: "ANTD-7")

VStack(alignment: .stretch, spacing: 16) {
  Title("Import shipments", level: 4)
  Card {
    Steps(items: [["title": "Upload file", "description": "CSV or XLSX"], ["title": "Map columns", "description": "Pick what to import"],
                  ["title": "Review"], ["title": "Done"]], current: 1)
    Alert(message: "shipments-nov.csv was parsed: 1,284 rows and 7 columns. Pick the columns to import.", type: "info", showIcon: true, closable: true)
    HStack(alignment: .top, spacing: 32) {
      VStack(alignment: .stretch, spacing: 8) {
        UploadDragger("Click or drag a file to this area to replace it", hint: "One CSV or XLSX file, up to 20 MB.")
        UploadFile("shipments-nov.csv")
        HStack(spacing: 24) {
          Progress(percent: 64, type: "circular", size: "small")
          VStack(alignment: .leading, spacing: 4) {
            Text("Validation").bold()
            Text("823 of 1,284 rows checked", type: "secondary")
            Text("3 rows with warnings", type: "warning")
          }
        }
        .padding(.top, 16)
      }
      .frame(width: 380)
      VStack(alignment: .leading, spacing: 8) {
        Text("Columns").bold()
        TransferBox(source: ["Tracking no.", "Sender", "Weight", "Pieces", "Notes"],
                    target: ["Recipient", "Postcode"], picked: ["Tracking no.", "Weight"])
      }
    }
    Divider()
    HStack(spacing: 8) {
      Button("Previous")
      Spacer()
      Button("Cancel", type: "text")
      Button("Next", type: "primary")
    }
  }
}
.padding(24)
.frame(maxHeight: .infinity, alignment: .top)

Notification(message: "Upload complete", description: "shipments-nov.csv (412 KB) is ready for mapping.", type: "success", icon: "CheckCircleFilled")
```

## Roles and permissions

A `Drawer` editing a role over the roles page: a checkable `Tree` of permissions, a `Collapse` of
advanced options with `Switch`es and a `ColorPicker`, and a footer. Behind it the page shows a loading
`Skeleton` card, an `Empty` state and a `Popconfirm` on a delete button.

```mockitdown appearance="both" height="790" url="https://console.example.com/team/roles"
import Antd
@Screen(title: "Roles", id: "ANTD-8")

VStack(alignment: .stretch, spacing: 16) {
  HStack(spacing: 16) {
    Title("Roles", level: 4)
    Popconfirm(title: "Delete the role", description: "Members with this role lose their access.", placement: .bottom) {
      Button("Delete role", icon: "DeleteOutlined").danger()
    } actions: {
      HStack(spacing: 8) {
        Button("No", size: "small")
        Button("Yes", type: "primary", size: "small")
      }
    }
    Spacer()
  }
  HStack(alignment: .top, spacing: 16) {
    Card(title: "Custom roles") {
      Empty("No custom roles yet") {
        Button("Create role", type: "primary")
      }
    }
    Card(title: "Dispatch") {
      Skeleton(avatar: true, lines: 3, active: true)
    }
  }
}
.padding(24)
.frame(maxHeight: .infinity, alignment: .top)

Drawer(title: "Edit role · Dispatch") {
  Form(layout: "vertical") {
    Input(label: "Role name", value: "Dispatch", required: true)
    FormItem("Permissions") {
      Tree {
        TreeNode("Orders", checked: "indeterminate", expanded: true) {
          TreeNode("View orders", checked: true)
          TreeNode("Edit orders", checked: true)
          TreeNode("Refund orders", checked: false)
        }
        TreeNode("Fleet", checked: true, expanded: true) {
          TreeNode("Assign vehicles", checked: true)
          TreeNode("Plan routes", checked: true).selected()
        }
        TreeNode("Billing", checked: false, hasChildren: true)
      }
    }
  }
  Collapse {
    CollapsePanel("Advanced", expanded: true) {
      Switch("Allow exports", checked: true)
      Switch("Require two-factor sign-in")
      ColorPicker(colors: ["#1677ff"], selection: 0, label: "#1677FF")
    }
    CollapsePanel("Audit")
  }
} footer: {
  Button("Cancel")
  Button("Save", type: "primary")
}
```

## Submission result

A `Result` page after a purchase: the success icon, title, sub-title and actions, the order summary in a
bordered `Descriptions`, a dotted `Steps` for what happens next, a `Rate` prompt and two plan cards, one
marked with a `Badge.Ribbon`.

```mockitdown height="900" url="https://console.example.com/result/success"
import Antd
@Screen(title: "Success", id: "ANTD-9")

VStack(alignment: .stretch, spacing: 24) {
  Card {
    Result(status: "success", title: "Fleet plan upgraded",
           subTitle: "Order NW-SUB-2026-0412 · the new plan is active for all 38 vehicles from today.") {
      Button("Go to console", type: "primary")
      Button("View invoice")
    }
    Descriptions(column: 3, bordered: true, size: "small") {
      DescriptionsItem("Plan", "Fleet Pro, yearly")
      DescriptionsItem("Vehicles", "38")
      DescriptionsItem("Amount") { Text("€ 4,560.00").bold() }
      DescriptionsItem("Billing contact", "Mara Quinn")
      DescriptionsItem("Payment", "SEPA direct debit")
      DescriptionsItem("Status") { Badge(status: "processing", text: "Collecting") }
    }
    Steps(items: [["title": "Paid", "description": "Today"], ["title": "Provisioning", "description": "~5 minutes"],
                  ["title": "Drivers notified"], ["title": "Ready"]], current: 1, progressDot: true)
      .padding(.top, 8)
    HStack(spacing: 12) {
      Text("How was the upgrade?", type: "secondary")
      Rate(value: 4)
    }
  }
  HStack(alignment: .top, spacing: 24) {
    BadgeRibbon(text: "Recommended") {
      Card(title: "Route optimiser add-on") {
        Text("Re-plan stops every night from live traffic and depot capacity.", type: "secondary")
        Button("Add to plan", type: "primary")
      }
    }
    BadgeRibbon(text: "New", color: "volcano") {
      Card(title: "Cold-chain monitoring") {
        Text("Temperature loggers stream to the console; alerts go to the driver.", type: "secondary")
        Button("Learn more")
      }
    }
  }
}
.padding(24)
.frame(maxHeight: .infinity, alignment: .top)
```
