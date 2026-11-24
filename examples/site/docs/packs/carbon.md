# Carbon

The **carbon** pack imitates IBM's [Carbon Design System](https://carbondesignsystem.com/) **v11**
as shipped in `@carbon/react`: the **White** theme in light mode and **g100** in dark mode, IBM Plex
Sans first in the font stack (with the system font as fallback — no web fonts are loaded), the
productive type scale, square corners, fields on `field-01` with a 1px bottom border, the 48px black UI
Shell header and the Carbon Charts categorical palette. Select it with

```swift
import Carbon          // or: import CarbonReact
```

Elements use Carbon's own component and prop names: the UI Shell (`Header`, `HeaderNavigation`,
`HeaderMenuItem`, `HeaderGlobalAction`, `SideNav`, `SideNavLink`, `SideNavMenu`, `Content`),
`Button(kind: "primary" | "secondary" | "tertiary" | "ghost" | "danger", size:, renderIcon:)`,
`IconButton`, `ButtonSet`, `TextInput(labelText:, helperText:, invalidText:)`, `PasswordInput`,
`TextArea`, `NumberInput`, `Search`, `Select` / `SelectItem`, `Dropdown`, `MultiSelect`, `Checkbox`,
`RadioButtonGroup`, `Toggle`, `Slider`, `DatePicker`, `FileUploader`, `DataTable` with `TableContainer`,
`TableToolbar`, `TableBatchActions` and `TableExpandRow`, `StructuredList`, `Tile` /
`ClickableTile` / `SelectableTile` / `ExpandableTile` / `RadioTile`, `Tag(type:)`, `InlineNotification`,
`ActionableNotification` and `ToastNotification` (high contrast by default, `lowContrast: true`),
`Tabs` (line or `.contained()`), `ContentSwitcher`, `ProgressIndicator`, `ProgressBar`, `Accordion`,
`OverflowMenu`, `Modal`, `Breadcrumb`, `Pagination` (Carbon's distinctive bar), `CodeSnippet`,
`Grid` / `Column(lg:)` on the 16-column grid, and the Carbon Charts (`GroupedBarChart`, `LineChart`,
`DonutChart`, …). Carbon icon names (`"Add"`, `"TrashCan"`, `"OverflowMenuVertical"`, `"Notification"`)
work wherever an icon is expected.

Two Carbon ideas carry over directly. **`Theme("g10" | "g90" | "g100" | "white")`** is a zoned theme:
its content renders in that theme whatever the page's appearance (the UI Shell `Header` is always a
g100 zone). **`Layer { … }`** raises its content one layer (`layer-02`, `field-02`), as Tiles and
Modals do automatically.

The examples import a small component library,
[`mockups/carbon/components.mockitdown`](https://github.com/), with `AppHeader`, `StatusTag`,
`KpiTile`, `DeploymentRow`, `ExpandRow`, `PageHeader` and `PlanTile` built from Carbon elements.

## Log in

Carbon's log-in pattern: a left-aligned form on the White background, a `TextInput`, a full-width
primary button with its icon at the trailing edge, a `Checkbox` and a tertiary alternative.

```mockitdown source="true" appearance="both" width="900" height="720" url="https://console.northwind.example/login"
import Carbon
@Screen(title: "Log in", id: "CDS-1")

HStack(spacing: 0) {
  VStack(alignment: .stretch, spacing: 32) {
    VStack(alignment: .leading, spacing: 8) {
      Heading("Log in to Northwind", font: "heading-05")
      HStack(spacing: 4) {
        Text("Don't have an account?")
        Link("Create one")
      }
    }
    Divider()
    TextInput("Email address", value: "dana.reyes@northwind.example", helperText: "We'll send a one-time code if you use SSO")
    VStack(alignment: .stretch, spacing: 16) {
      Button("Continue", renderIcon: "ArrowRight")
      Checkbox("Remember ID", checked: true)
    }
    Divider()
    VStack(alignment: .stretch, spacing: 16) {
      Text("Alternative logins").font("label-01").foregroundStyle(.secondary)
      Button("Log in with a passkey", kind: "tertiary", renderIcon: "Password")
    }
    Spacer()
    HStack(spacing: 4) {
      Text("Need help?")
      Link("Contact support")
    }
  }
  .padding(.horizontal, 32).padding(.vertical, 48)
  .frame(width: 420, maxHeight: .infinity)
  Theme("g100") {
    VStack(alignment: .leading, spacing: 16) {
      Spacer()
      Text("Build, run and observe").font("heading-04").fontWeight(.light)
      Text("One console for every workload you deploy on Northwind.").foregroundStyle(.secondary)
    }
    .padding(32)
  }
  .frame(maxWidth: .infinity, maxHeight: .infinity)
}
.frame(maxWidth: .infinity, maxHeight: .infinity)
```

## Settings form

A `Form` inside a `Tile`: text inputs with helper and invalid text, `Select`, an open `Dropdown`,
`NumberInput`, `Toggle`, a horizontal `RadioButtonGroup`, `Slider`, `DatePicker`, a low-contrast
`InlineNotification` and a `ButtonSet` footer. The right column holds a `FileUploader`.

```mockitdown height="1180" url="https://console.northwind.example/projects/atlas/settings"
import Carbon
import "carbon/components"
@Screen(title: "Project settings", id: "CDS-2")

VStack(alignment: .stretch, spacing: 0) {
  AppHeader(current: "Resources")
  Content {
    PageHeader(trail: ["Projects", "Atlas"], title: "Project settings") {
      Button("View audit log", kind: "ghost", renderIcon: "Launch")
    }
    InlineNotification(title: "Unsaved changes", subtitle: "Save to apply the new scaling policy.", kind: "warning", lowContrast: true)
    HStack(alignment: .top, spacing: 32) {
      Tile {
        Form {
          TextInput("Project name", value: "Atlas", helperText: "Shown in the console and in invoices")
          TextInput("Billing contact", value: "billing@northwind", invalidText: "Enter a complete email address")
          HStack(alignment: .top, spacing: 16) {
            NumberInput("Minimum replicas", value: 2)
            DatePicker("Maintenance window starts", value: "2026-12-07")
          }
          HStack(alignment: .top, spacing: 16) {
            Select("Region", value: "US South (Dallas)") {
              SelectItem("US South (Dallas)")
              SelectItem("EU Central (Frankfurt)")
            }
            Dropdown("Plan", items: ["Lite", "Standard", "Enterprise"], selectedItem: "Standard", open: true)
          }
          RadioButtonGroup(legendText: "Scaling policy", options: ["Manual", "CPU based", "Schedule"], valueSelected: "CPU based")
          Slider(labelText: "Target CPU utilization (%)", value: 65, min: 0, max: 100, minLabel: "0", maxLabel: "100")
          Toggle("Send alerts to Slack", toggled: true)
          TextArea("Notes", value: "Scale down on weekends; keep one replica in EU for latency tests.", rows: 2)
        }
        ButtonSet {
          Button("Cancel", kind: "secondary")
          Button("Save changes")
        }
        .padding(.top, 16)
      }
      .frame(maxWidth: .infinity)
      VStack(alignment: .stretch, spacing: 16) {
        FileUploader(labelTitle: "Upload TLS certificates", labelDescription: "Max file size is 500 kB. Supported types are .pem and .crt.") {
          FileUploaderButton("Add files")
          FileUploaderItem("atlas-prod.pem", status: "complete")
          FileUploaderItem("atlas-staging.crt", status: "uploading")
          FileUploaderItem("old-root.crt")
        }
        FileUploaderDropContainer("Drag and drop files here or click to upload")
        CodeSnippet("nw projects update atlas --replicas 2", type: "single")
      }
      .frame(width: 340)
    }
  }
}
.frame(maxHeight: .infinity)
```

## Dashboard

The UI Shell with a `SideNav` and `Tile`s on the 16-column
`Grid`: KPI tiles from the imported `KpiTile`, Carbon Charts in the categorical palette and a
`ContentSwitcher`.

```mockitdown source="true" appearance="both" height="980" url="https://console.northwind.example/dashboard"
import Carbon
import "carbon/components"
@Screen(title: "Dashboard", id: "CDS-3")

VStack(alignment: .stretch, spacing: 0) {
  AppHeader(current: "Dashboard")
  HStack(alignment: .top, spacing: 0) {
    SideNav {
      SideNavLink("Overview", renderIcon: "Dashboard").selected()
      SideNavMenu("Workloads", renderIcon: "Application", expanded: true) {
        SideNavMenuItem("Deployments")
        SideNavMenuItem("Jobs")
        SideNavMenuItem("Functions")
      }
      SideNavLink("Storage", renderIcon: "DataBase")
      SideNavLink("Networking", renderIcon: "Globe")
      SideNavLink("Observability", renderIcon: "ChartLine")
      SideNavDivider()
      SideNavLink("Access (IAM)", renderIcon: "Security")
      SideNavLink("Settings", renderIcon: "Settings")
    }
    .frame(maxHeight: .infinity)
    Content {
      HStack(spacing: 0) {
        Heading("Overview", font: "heading-04")
        Spacer()
        ContentSwitcher(selectedIndex: 1, size: "md") {
          Switch("24 hours")
          Switch("30 days")
          Switch("Quarter")
        }
        .frame(width: 330)
      }
      Grid {
        Column(lg: 4) { KpiTile(label: "Monthly spend", value: "$48,210", delta: "+4.2%", up: false, trend: [31, 34, 33, 38, 41, 40, 44, 48]) }
        Column(lg: 4) { KpiTile(label: "Running workloads", value: "126", delta: "+12", trend: [96, 101, 104, 110, 108, 117, 121, 126]) }
        Column(lg: 4) { KpiTile(label: "Availability", value: "99.98%", delta: "+0.02", trend: [99.9, 99.95, 99.97, 99.96, 99.98, 99.99, 99.98, 99.98]) }
        Column(lg: 4) { KpiTile(label: "Open incidents", value: "3", delta: "−2", trend: [7, 6, 6, 5, 5, 4, 5, 3]) }
        Column(lg: 10) {
          Tile {
            GroupedBarChart(title: "Spend by service", series: [[12, 14, 13, 16, 17, 18], [8, 9, 11, 10, 12, 13], [5, 6, 6, 7, 7, 9]],
                            seriesNames: ["Compute", "Storage", "Networking"], labels: ["Jun", "Jul", "Aug", "Sep", "Oct", "Nov"], chartWidth: 560, height: 260)
          }
        }
        Column(lg: 6) {
          Tile {
            DonutChart(title: "Workloads by region", values: [48, 37, 26, 15], labels: ["US South", "EU Central", "AP Tokyo", "US East"],
                       unit: "126", height: 260)
          }
        }
        Column(lg: 16) {
          Tile {
            LineChart(title: "Requests per second", series: [[820, 940, 910, 1180, 1320, 1240, 1410, 1530], [400, 420, 510, 560, 590, 640, 700, 760]],
                      seriesNames: ["api-gateway", "checkout"], labels: ["00:00", "03:00", "06:00", "09:00", "12:00", "15:00", "18:00", "21:00"], chartWidth: 900, height: 200)
          }
        }
      }
    }
    .frame(maxWidth: .infinity, maxHeight: .infinity)
  }
  .frame(maxHeight: .infinity)
}
.frame(maxHeight: .infinity)
```

## Data table with batch actions

A `TableContainer` holding the blue `TableBatchActions` bar (two rows are selected), a selectable
`DataTable` sorted by name, `StatusTag` cells, an open `OverflowMenu` on a row and Carbon's
`Pagination` bar underneath.

```mockitdown source="true" height="700" url="https://console.northwind.example/deployments"
import Carbon
import "carbon/components"
@Screen(title: "Deployments", id: "CDS-4")

VStack(alignment: .stretch, spacing: 0) {
  AppHeader(current: "Resources")
  Content {
    TableContainer(title: "Deployments", description: "Applications running in the Atlas project") {
      TableBatchActions("2 items selected") {
        TableBatchAction("Restart", renderIcon: "Restart")
        TableBatchAction("Scale", renderIcon: "SettingsAdjust")
        TableBatchAction("Delete", renderIcon: "TrashCan")
        Button("Cancel")
      }
      DataTable(selectable: true, selectedRows: [0, 2], sortColumn: 0) {
        TableHeader("Name")
        TableHeader("Region")
        TableHeader("Version")
        TableHeader("Status")
        TableHeader("Updated")
        TableHeader("")
        DeploymentRow(name: "api-gateway", region: "US South", version: "4.12.0", status: "Running", updated: "2 min ago", selected: true)
        DeploymentRow(name: "billing-worker", region: "EU Central", version: "2.3.1", status: "Deploying", updated: "6 min ago")
        DeploymentRow(name: "checkout", region: "US South", version: "7.0.4", status: "Failed", updated: "18 min ago", selected: true)
        TableRow {
          Text("image-resizer")
          Text("AP Tokyo")
          Text("1.9.0")
          StatusTag(status: "Degraded")
          Text("1 hr ago")
          OverflowMenu(size: "sm", open: true) {
            OverflowMenuItem("View logs")
            OverflowMenuItem("Edit configuration")
            OverflowMenuItem("Roll back")
            OverflowMenuItem("Delete", isDelete: true)
          }
        }
        DeploymentRow(name: "search-indexer", region: "US East", version: "3.4.2", status: "Running", updated: "3 hr ago")
        DeploymentRow(name: "notifications", region: "EU Central", version: "5.1.0", status: "Stopped", updated: "Yesterday")
      }
      Pagination("1–6 of 43 items", page: 1, count: 8, pageSize: 10)
    }
  }
}
.frame(maxHeight: .infinity)
```

## Toolbar, search and expandable rows

The same table in its resting state: a `TableToolbar` with the persistent search, icon actions, an
open settings `TableToolbarMenu` and the primary button; `ExpandRow`s with one row expanded
(`TableExpandedRow`) and a zebra-free `md` density.

```mockitdown appearance="both" height="500" url="https://console.northwind.example/clusters"
import Carbon
import "carbon/components"
@Screen(title: "Clusters", id: "CDS-5")

Content {
  TableContainer(title: "Clusters", description: "Kubernetes clusters across all regions") {
    TableToolbar {
      TableToolbarContent {
        TableToolbarSearch("Filter clusters")
        IconButton("Filter", kind: "ghost")
        IconButton("Download", kind: "ghost")
        TableToolbarMenu(open: true) {
          TableToolbarAction("Show node counts")
          TableToolbarAction("Compact rows")
          TableToolbarAction("Export CSV")
        }
        Button("Create cluster", renderIcon: "Add")
      }
    }
    DataTable(size: "md") {
      TableHeader("Cluster")
      TableHeader("Region")
      TableHeader("Status")
      TableHeader("Monthly cost")
      ExpandRow(name: "prod-dal-01", region: "US South", status: "Running", cost: "$12,400")
      TableExpandedRow {
        HStack(alignment: .top, spacing: 48) {
          VStack(alignment: .leading, spacing: 4) {
            Text("Worker pools").font("heading-compact-01")
            Text("3 pools · 24 nodes · bx2.16x64")
          }
          VStack(alignment: .leading, spacing: 4) {
            Text("Kubernetes version").font("heading-compact-01")
            Text("1.31.4 (update available)")
          }
          ProgressBar("Node CPU", value: 72, showValue: true).frame(width: 220)
        }
      }
      ExpandRow(name: "prod-fra-02", region: "EU Central", status: "Running", cost: "$9,870")
      ExpandRow(name: "staging-tok", region: "AP Tokyo", status: "Degraded", cost: "$3,120")
      ExpandRow(name: "dev-wdc", region: "US East", status: "Stopped", cost: "$640")
    }
  }
}
```

## Create workload wizard

A multi-step flow: `ProgressIndicator` with complete, current and upcoming steps, `PlanTile` radio
tiles, a `SelectableTile`, `MultiSelect` with tags, an `ActionableNotification`, and the buttons of a
wizard footer.

```mockitdown height="880" url="https://console.northwind.example/workloads/new"
import Carbon
import "carbon/components"
@Screen(title: "Create workload", id: "CDS-6")

VStack(alignment: .stretch, spacing: 0) {
  AppHeader(current: "Catalog")
  Content {
    PageHeader(trail: ["Catalog", "Containers"], title: "Create a workload") {
      Button("Cancel", kind: "ghost")
    }
    ProgressIndicator(currentIndex: 2) {
      ProgressStep("Source", secondaryLabel: "Image")
      ProgressStep("Runtime")
      ProgressStep("Plan")
      ProgressStep("Networking")
      ProgressStep("Review")
    }
    VStack(alignment: .stretch, spacing: 16) {
      Heading("Choose a plan")
      HStack(spacing: 16) {
        PlanTile(name: "Lite", price: "Free", detail: "256 MB · scales to zero · community support")
        PlanTile(name: "Standard", price: "$0.034 / vCPU-hr", detail: "Up to 64 vCPU · 99.9% SLA", selected: true)
        PlanTile(name: "Dedicated", price: "$2,400 / mo", detail: "Isolated hosts · 99.99% SLA")
      }
      SelectableTile("Reserve capacity for 12 months", selected: true) {
        Text("Save 28% on Standard compute in exchange for a one-year commitment.").foregroundStyle(.secondary)
      }
      MultiSelect("Availability zones", selectedItems: ["dal10", "dal12"], helperText: "Pick at least two zones for high availability")
        .frame(width: 420)
      ActionableNotification(title: "Quota almost reached", subtitle: "This workload will use 92% of your vCPU quota.", kind: "info",
                             lowContrast: true, actions: { Button("Request more", kind: "tertiary", size: "sm") })
    }
    Spacer()
    HStack(spacing: 0) {
      Button("Back", kind: "secondary")
      Spacer()
      Button("Save draft", kind: "ghost")
      Button("Next: Networking", renderIcon: "ArrowRight")
    }
  }
}
.frame(maxHeight: .infinity)
```

## Resource details

A detail page with numbered callouts: the `Breadcrumb` and status `Tag`s (#1), line `Tabs` (#2), a
`StructuredList` of properties, an `Accordion` of events and a `CodeSnippet` (#3); a high-contrast
`ToastNotification` has just arrived at the top right (#4).

```mockitdown source="true" height="700" url="https://console.northwind.example/buckets/atlas-media"
import Carbon
import "carbon/components"
@Screen(title: "Bucket details", id: "CDS-7")

VStack(alignment: .stretch, spacing: 0) {
  AppHeader(current: "Resources")
  ZStack(alignment: .topTrailing) {
    Content {
      VStack(alignment: .leading, spacing: 8) {
        Breadcrumb(["Resources", "Object storage", "atlas-media"])
        HStack(spacing: 8) {
          Heading("atlas-media", font: "heading-05")
          Tag("Public", type: "purple")
          Tag("Versioning on", type: "teal")
          Tag("Smart tier", type: "cool-gray")
        }
        .callout(1, alignment: .topTrailing)
      }
      Tabs(selectedIndex: 0) {
        Tab("Overview") {
          HStack(alignment: .top, spacing: 32) {
            StructuredList(columns: ["Property", "Value"]) {
              StructuredListRow { StructuredListCell("Location"); StructuredListCell("eu-de (Frankfurt), cross-region") }
              StructuredListRow { StructuredListCell("Created"); StructuredListCell("March 3, 2026 by dana.reyes") }
              StructuredListRow { StructuredListCell("Objects"); StructuredListCell("1,284,902 · 4.7 TB") }
              StructuredListRow { StructuredListCell("Endpoint"); StructuredListCell("s3.eu-de.northwind.example") }
            }
            .frame(maxWidth: .infinity)
            VStack(alignment: .stretch, spacing: 16) {
              Text("Recent events").font("heading-compact-02")
              Accordion {
                AccordionItem("Lifecycle rule applied", open: true) {
                  Text("1,204 objects moved to the archive tier after 90 days.").foregroundStyle(.secondary)
                }
                AccordionItem("Public access enabled")
                AccordionItem("Replication target added")
              }
              CodeSnippet("nw cos objects --bucket atlas-media --prefix 2026/", type: "single")
                .callout(3, alignment: .bottomTrailing)
            }
            .frame(width: 420)
          }
        }
        Tab("Objects")
        Tab("Permissions")
        Tab("Configuration")
        Tab("Metrics")
      }
      .callout(2, alignment: .topLeading)
    }
    .frame(maxWidth: .infinity, maxHeight: .infinity)
    ToastNotification(title: "Replication complete", subtitle: "412 GB copied to us-south.", kind: "success", inline: true) {
      Text("Time stamp [10:42:07 UTC]")
    }
    .callout(4, alignment: .leading)
  }
  .frame(maxHeight: .infinity)
}
.frame(maxHeight: .infinity)
```

The tags beside the title (#1) are Carbon `Tag`s with `type:` colours; the line tabs (#2) mark the
selected tab with a 2px interactive underline; the single-line `CodeSnippet` (#3) carries a copy
button; the toast (#4) keeps Carbon's 3px status bar on its leading edge.

## Danger modal

A destructive `Modal` over the deployments list: the modal label above the heading, a confirmation
`TextInput` on `field-02`, and the full-bleed 64px footer buttons with the danger primary action. The
page behind uses a `Theme("g90")` zone, so it is dark in both appearances.

```mockitdown height="580" url="https://console.northwind.example/projects"
import Carbon
import "carbon/components"
@Screen(title: "Delete project", id: "CDS-8")

Theme("g90") {
  VStack(alignment: .stretch, spacing: 0) {
    AppHeader(current: "Resources")
    Content {
      Heading("Projects", font: "heading-04")
      Grid {
        Column(lg: 5) { ClickableTile("Atlas") { Text("14 workloads · US South").foregroundStyle(.secondary) } }
        Column(lg: 5) { ClickableTile("Borealis") { Text("6 workloads · EU Central").foregroundStyle(.secondary) } }
        Column(lg: 6) { ExpandableTile("Sandbox") { Text("2 workloads · created 3 days ago").foregroundStyle(.secondary) } }
      }
    }
  }
  Modal("Delete project Atlas?", modalLabel: "Project settings", buttons: ["Cancel", "Delete project"], destructive: "Delete project", closable: true) {
    Text("Deleting **Atlas** removes its 14 workloads, 3 buckets and all access policies. This can't be undone.")
    TextInput("Type the project name to confirm", value: "Atlas", state: "focused")
  }
}
.frame(maxHeight: .infinity)
```
