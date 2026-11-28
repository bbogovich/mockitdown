# Vuetify

The **vuetify** pack imitates [Vuetify](https://vuetifyjs.com/) **3** — the Material component framework
for Vue 3 — in its **default light and dark themes**: Roboto, primary `#1867C0` (`#2196F3` in dark),
secondary `#48A9A6`, error `#B00020`, white surfaces (`#212121` in dark), 4px corners, the MD2 elevation
shadows 0–24, the dark `surface-variant` snackbars and tooltips, and Vuetify's own control metrics (36px
buttons, 56px filled fields, 48px list items, a 256px navigation drawer). Select it with

```swift
import Vuetify      // or: import Vue
```

Elements carry Vuetify's component names in PascalCase — `VApp`, `VAppBar`, `VNavigationDrawer`,
`VMain`, `VBtn`, `VCard` with `VCardTitle` / `VCardText` / `VCardActions`, `VList` / `VListItem`,
`VTextField`, `VSelect`, `VAutocomplete`, `VCombobox`, `VCheckbox`, `VRadioGroup`, `VSwitch`, `VSlider`,
`VChip`, `VAlert`, `VBanner`, `VSnackbar`, `VDialog`, `VMenu`, `VTooltip`, `VTabs`, `VDataTable`,
`VPagination`, `VStepper`, `VTimeline`, `VTreeview`, `VExpansionPanels`, `VDatePicker`,
`VBottomNavigation`, `VSparkline`, `VEmptyState` and more — and its props in camelCase:

- `variant` — `"elevated"` (the VBtn and VCard default), `"flat"`, `"tonal"` (the VChip default),
  `"outlined"`, `"text"`, `"plain"` on VBtn, VChip, VCard and VAlert; `"filled"` (default),
  `"outlined"`, `"underlined"`, `"solo"`, `"plain"` on fields;
- `color` — theme colours (`"primary"`, `"secondary"`, `"success"`, `"info"`, `"warning"`, `"error"`,
  `"surface-variant"`) and Material colours (`"pink"`, `"amber"`, `"deep-purple"` …);
- `density` — `"default"`, `"comfortable"`, `"compact"`; `size` — `"x-small"` … `"x-large"`;
- `rounded` — `0`, `"sm"`, `true`, `"lg"`, `"xl"`, `"pill"`, `"circle"`; `elevation` — `0` … `24`;
- `prependIcon` / `appendIcon` / `prependInnerIcon`, `modelValue`, `items`, `errorMessages`, `hint`,
  `active`, `block`, `inset`, `grow`.

Icons are [Material Design Icons](https://pictogrammers.com/library/mdi/) names — `"mdi-home"`,
`"mdi-account"`, `"mdi-magnify"`, `"mdi-dots-vertical"` — and Vuetify's aliases such as `"$close"` and
`"$next"`.

The custom components below — `StatCard`, `AdminDrawer`, `SettingSwitch`, `ThreadItem` and
`SummaryLine` — are ordinary structs in
[`mockups/vuetify/components.mockitdown`](https://github.com/), imported with `import "vuetify/components"`.

## Sign in

A centred `VCard` with filled `VTextField`s (inner icons, a password eye), a `VCheckbox`, a block
primary `VBtn` and outlined secondary buttons.

```mockitdown source="true" appearance="both" height="640" url="https://app.northwind.example/login"
import Vuetify
@Screen(title: "Sign in", id: "VUE-1")

VApp {
  VSheet(color: "grey-lighten-4") {
    VStack {
      Spacer()
      VCard(elevation: 8, rounded: "lg") {
        VStack(alignment: .leading, spacing: 4) {
          VStack(spacing: 8) {
            VAvatar(icon: "mdi-lock", color: "primary", size: "large")
            Text("Sign in to Northwind").font(.h5)
            Text("Use your work account").font(.body2).foregroundStyle(.secondary)
          }
          .frame(maxWidth: .infinity)
          .padding(.bottom, 16)
          VTextField("Email", modelValue: "ana.lima@northwind.example", prependInnerIcon: "mdi-email-outline")
          VTextField("Password", type: "password", modelValue: "hunter22", prependInnerIcon: "mdi-lock-outline",
                     appendInnerIcon: "mdi-eye-off", state: "focused", hint: "At least 8 characters")
          HStack {
            VCheckbox("Remember me", modelValue: true, color: "primary", density: "compact")
            Spacer()
            Link("Forgot password?").font(.body2)
          }
          VBtn("Sign in", color: "primary", size: "large", block: true).frame(maxWidth: .infinity)
          VStack { VDivider(label: "or") }.frame(maxWidth: .infinity).padding(.vertical, 12)
          HStack(spacing: 12) {
            VBtn("Single sign-on", variant: "outlined", prependIcon: "mdi-shield-account").frame(maxWidth: .infinity)
            VBtn("Magic link", variant: "outlined", prependIcon: "mdi-link-variant").frame(maxWidth: .infinity)
          }
        }
        .padding(24)
      }
      .frame(width: 420)
      Text("No account? **Request access**").font(.body2).foregroundStyle(.secondary).padding(.top, 16)
      Spacer()
    }
    .frame(maxWidth: .infinity, maxHeight: .infinity)
  }
  .frame(maxWidth: .infinity, maxHeight: .infinity)
}
```

## Admin dashboard

The classic Vuetify admin layout: `VNavigationDrawer` (the imported `AdminDrawer`) beside a `VMain`
under a `VAppBar`, four `StatCard`s with `VSparkline`s, a sales `BarChart`, a goal
`VProgressCircular`, an activity `VTimeline` and a compact `VTable`.

```mockitdown source="true" appearance="both" device="wide" height="960" url="https://admin.northwind.example/"
import Vuetify
import "vuetify/components"
@Screen(title: "Dashboard", id: "VUE-2")

VLayout {
  AdminDrawer(selected: "Dashboard")
  VMain {
    VAppBar(title: "Dashboard", elevation: 1) {
      VTextField(placeholder: "Search", variant: "solo-filled", density: "compact", prependInnerIcon: "mdi-magnify", hideDetails: true).frame(width: 260)
      VBtn(icon: "mdi-theme-light-dark")
      VBadge(content: 3, color: "error") { VBtn(icon: "mdi-bell-outline") }
      VAvatar("Ana Lima", color: "primary", size: "small").padding(.horizontal, 12)
    }
    VContainer {
      VStack(alignment: .leading, spacing: 24) {
        VRow {
          VCol(3) { StatCard(title: "Revenue", value: "$48,210", delta: "+12.4%", icon: "mdi-currency-usd", trend: [3, 4, 3.5, 5, 6, 5.5, 7]) }
          VCol(3) { StatCard(title: "Orders", value: "1,204", delta: "+4.1%", icon: "mdi-cart", color: "secondary", trend: [5, 5.5, 5, 6, 6.2, 6, 6.8]) }
          VCol(3) { StatCard(title: "New customers", value: "312", delta: "+8.0%", icon: "mdi-account-plus", color: "info", trend: [2, 3, 2.5, 3, 4, 3.8, 4.4]) }
          VCol(3) { StatCard(title: "Refunds", value: "38", delta: "-2.3%", up: false, icon: "mdi-undo", color: "warning", trend: [6, 5, 5.5, 4, 4.2, 3.5, 3]) }
        }
        VRow {
          VCol(8) {
            VCard(title: "Sales", subtitle: "Last 9 months") {
              BarChart(series: [[42, 51, 48, 62, 70, 66, 81, 77, 90], [30, 35, 41, 44, 52, 49, 58, 61, 64]],
                       labels: ["Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov"],
                       seriesNames: ["2026", "2025"], height: 190)
            } headerAction: {
              VBtnToggle(variant: "outlined", density: "compact", divided: true, color: "primary") {
                VBtn("Month").selected()
                VBtn("Year")
              }
            }
          }
          VCol(4) {
            VCard(title: "Monthly goal") {
              HStack(spacing: 20) {
                VProgressCircular(modelValue: 72, color: "primary", size: "x-large", showValue: true)
                VStack(alignment: .leading, spacing: 4) {
                  Text("$36,000 of $50,000").font(.subtitle2)
                  Text("12 days left").font(.caption).foregroundStyle(.secondary)
                  VChip("On track", color: "success", size: "small", prependIcon: "mdi-check")
                }
              }
              VDivider()
              VTimeline(density: "compact") {
                VTimelineItem("Order #10423 paid", time: "9:41", dotColor: "success")
                VTimelineItem("New customer: Dana Wu", time: "9:12", dotColor: "primary")
                VTimelineItem("Refund requested", time: "8:30", dotColor: "warning")
              }
            }
          }
        }
        VCard(title: "Recent orders") {
          VTable(columns: ["Order", "Customer", "Date", "Status", "Total"],
                 rows: [["#10423", "Ana Lima", "Nov 23, 2026", "Paid", "$248.00"],
                        ["#10422", "Ben Okafor", "Nov 22, 2026", "Pending", "$89.50"],
                        ["#10421", "Chloé Martin", "Nov 22, 2026", "Paid", "$1,024.00"]],
                 density: "compact")
        } headerAction: {
          VBtn("View all", variant: "text", color: "primary", appendIcon: "mdi-chevron-right")
        }
      }
    }
  }
}
```

## Data table

A `VDataTable` with a toolbar search field, a sorted column, row selection, tonal status chips, row
actions and the data-table footer — under `VBreadcrumbs` and a page title with actions.

```mockitdown source="true" height="820" url="https://admin.northwind.example/orders"
import Vuetify
@Screen(title: "Orders", id: "VUE-3")

VContainer {
  VStack(alignment: .leading, spacing: 8) {
    VBreadcrumbs(items: ["Dashboard", "Sales", "Orders"])
    HStack(spacing: 8) {
      Text("Orders").font(.h4)
      Spacer()
      VBtn("Export", variant: "text", prependIcon: "mdi-download")
      VBtn("New order", color: "primary", prependIcon: "mdi-plus")
    }
    VCard(variant: "outlined") {
      HStack(spacing: 12) {
        VTextField(placeholder: "Search orders", variant: "outlined", density: "compact", prependInnerIcon: "mdi-magnify", hideDetails: true).frame(width: 320)
        VChipGroup {
          VChip("Pending", color: "primary", variant: "outlined", closable: true)
          VChip("Last 30 days", closable: true)
        }
        Spacer()
        VBtn(icon: "mdi-filter-variant", variant: "text")
        VBtn(icon: "mdi-dots-vertical", variant: "text")
      }
      .padding(.horizontal, 16)
      .padding(.vertical, 12)
      VDivider()
      VDataTable(headers: ["Order", "Customer", "Date", "Status", "Total", ""], showSelect: true, selectedRows: [1, 3], sortBy: 2,
                 footer: "Items per page:   10 ▾          1-10 of 42") {
        Tr { Td("#10423"); Td("Ana Lima"); Td("Nov 23, 2026"); VChip("Paid", color: "success", size: "small"); Td("$248.00"); VBtn(icon: "mdi-pencil", variant: "text", size: "small") }
        Tr { Td("#10422"); Td("Ben Okafor"); Td("Nov 22, 2026"); VChip("Pending", color: "warning", size: "small"); Td("$89.50"); VBtn(icon: "mdi-pencil", variant: "text", size: "small") }
        Tr { Td("#10421"); Td("Chloé Martin"); Td("Nov 22, 2026"); VChip("Paid", color: "success", size: "small"); Td("$1,024.00"); VBtn(icon: "mdi-pencil", variant: "text", size: "small") }
        Tr { Td("#10420"); Td("Dana Wu"); Td("Nov 21, 2026"); VChip("Refunded", size: "small"); Td("$56.20"); VBtn(icon: "mdi-pencil", variant: "text", size: "small") }
        Tr { Td("#10419"); Td("Eli Novak"); Td("Nov 20, 2026"); VChip("Failed", color: "error", size: "small"); Td("$310.00"); VBtn(icon: "mdi-pencil", variant: "text", size: "small") }
        Tr { Td("#10418"); Td("Farah Haddad"); Td("Nov 20, 2026"); VChip("Paid", color: "success", size: "small"); Td("$74.90"); VBtn(icon: "mdi-pencil", variant: "text", size: "small") }
      }
    }
    HStack { Spacer(); VPagination(length: 5, modelValue: 1, activeColor: "primary", density: "comfortable"); Spacer() }
  }
}
```

## Form with validation errors

A `VForm` after a failed submit: an error `VAlert`, fields with `errorMessages`, a `VSelect`, an
`VAutocomplete` with chips, a `VCombobox`, a `VTextarea` with a counter, a `VFileInput`, a
`VRadioGroup` and a `VCheckbox` that still needs ticking.

```mockitdown height="940" url="https://app.northwind.example/suppliers/new"
import Vuetify
@Screen(title: "New supplier", id: "VUE-4")

VContainer {
  VCard(title: "New supplier", subtitle: "All fields marked * are required", variant: "elevated") {
    VForm {
      VAlert("Please fix the 3 highlighted fields before saving.", type: "error", variant: "tonal", density: "compact", closable: true)
        .padding(.bottom, 8)
      HStack(alignment: .top, spacing: 16) {
        VTextField("Company name", modelValue: "Lumen Supply Co.", required: true)
        VTextField("VAT number", modelValue: "FR12 3456", required: true, errorMessages: "VAT numbers have 11 characters after FR")
      }
      HStack(alignment: .top, spacing: 16) {
        VTextField("Contact email", modelValue: "orders@lumen", required: true, prependInnerIcon: "mdi-email-outline", errorMessages: "Enter a valid email address")
        VTextField("Phone", modelValue: "", placeholder: "+33 1 23 45 67 89", prependInnerIcon: "mdi-phone", hint: "Include the country code")
      }
      HStack(alignment: .top, spacing: 16) {
        VSelect("Country", items: ["France", "Germany", "Portugal"], modelValue: "France")
        VAutocomplete("Categories", items: ["Lighting", "Cables", "Fixtures"], modelValue: ["Lighting", "Cables"])
        VCombobox("Tags", items: ["preferred", "eu"], modelValue: "", required: true, errorMessages: "Add at least one tag")
      }
      VTextarea("Notes", modelValue: "Ships twice a week from Lyon. Minimum order 40 units.", rows: 3, counter: "52 / 200")
      VFileInput("Signed contract", modelValue: "contract-lumen-2026.pdf", hint: "PDF, up to 10 MB")
      VRadioGroup("Payment terms", items: ["Net 30", "Net 60", "Prepaid"], modelValue: "Net 30", inline: true, color: "primary")
      VCheckbox("I confirm the supplier passed the compliance review", modelValue: false, error: true)
    }
  } actions: {
    VBtn("Reset", variant: "text")
    Spacer()
    VBtn("Cancel", variant: "text")
    VBtn("Save supplier", color: "primary", variant: "flat")
  }
}
```

## Settings

Account settings in a `VCard` with icon `VTabs`, `SettingSwitch` rows (a `VList` with trailing
`VSwitch`es), a `VSlider`, a `VRangeSlider`, a `VBtnToggle` and `VExpansionPanels`.

```mockitdown height="900" url="https://app.northwind.example/settings/notifications"
import Vuetify
import "vuetify/components"
@Screen(title: "Settings", id: "VUE-5")

VApp {
  VAppBar(title: "Settings", color: "primary", density: "comfortable") {
    VBtn(icon: "mdi-help-circle-outline")
  } leading: {
    VAppBarNavIcon()
  }
  VContainer {
    VCard {
      VTabs(color: "primary", grow: true) {
        VTab("Profile", prependIcon: "mdi-account")
        VTab("Notifications", prependIcon: "mdi-bell").selected()
        VTab("Security", prependIcon: "mdi-lock")
        VTab("Billing", prependIcon: "mdi-credit-card")
      }
      VDivider()
      HStack(alignment: .top, spacing: 24) {
        VList {
          VListSubheader("Notify me about")
          SettingSwitch(title: "Mentions", subtitle: "When someone @mentions you", icon: "mdi-at", on: true)
          SettingSwitch(title: "Comments", subtitle: "Replies to your threads", icon: "mdi-comment-outline", on: true)
          SettingSwitch(title: "New followers", subtitle: "A daily digest", icon: "mdi-account-plus")
          SettingSwitch(title: "Product updates", subtitle: "Monthly newsletter", icon: "mdi-email-outline")
          VDivider()
          SettingSwitch(title: "Do not disturb", subtitle: "Mute everything until tomorrow", icon: "mdi-weather-night")
        }
        .frame(maxWidth: .infinity)
        VStack(alignment: .leading, spacing: 8) {
          VSelect("Email frequency", items: ["Instantly", "Hourly", "Daily digest"], modelValue: "Daily digest", variant: "outlined", hint: "Applies to all email notifications")
          Text("Delivery window").font(.subtitle2)
          VRangeSlider(modelValue: [8, 18], min: 0, max: 24, color: "primary")
          Text("Notification volume").font(.subtitle2)
          VSlider(modelValue: 60, color: "primary")
          Text("Show on").font(.subtitle2)
          VBtnToggle(variant: "outlined", divided: true, color: "primary") {
            VBtn("Phone", prependIcon: "mdi-cellphone").selected()
            VBtn("Desktop").selected()
            VBtn("Watch")
          }
          VExpansionPanels(variant: "accordion") {
            VExpansionPanel(title: "Advanced", expanded: true) {
              Text("Webhooks, digest timezone and per-project overrides.").foregroundStyle(.secondary)
              VSwitch("Send webhook on new order", modelValue: true, color: "primary", inset: true)
            }
            VExpansionPanel(title: "Connected devices")
          }
          .padding(.top, 8)
        }
        .frame(width: 380)
        .padding(16)
      }
    } actions: {
      Spacer()
      VBtn("Discard", variant: "text")
      VBtn("Save changes", color: "primary", variant: "flat")
    }
  }
}
```

## Checkout stepper

A `VStepper` checkout on step 2: an alt-label header, a `VRadioGroup` of delivery options, an address
form with a `VDatePicker` for the delivery date, and an order summary built from `SummaryLine`s.

```mockitdown height="930" url="https://shop.northwind.example/checkout"
import Vuetify
import "vuetify/components"
@Screen(title: "Checkout", id: "VUE-6")

VApp {
  VAppBar(title: "Northwind Shop", elevation: 0) {
    VBtn("Continue shopping", variant: "text", prependIcon: "mdi-arrow-left")
  }
  VContainer {
    HStack(alignment: .top, spacing: 24) {
      VCard {
        VStepper(items: ["Cart", "Delivery", "Payment", "Review"], modelValue: 1, altLabels: true, color: "primary")
        VStack(alignment: .leading, spacing: 8) {
          Text("Delivery options").font(.h6)
          VRadioGroup(items: ["Standard · 3–5 days · free", "Express · next day · $9.90", "Pick up in store"],
                      modelValue: "Express · next day · $9.90", color: "primary")
          HStack(alignment: .top, spacing: 24) {
            VStack(alignment: .leading, spacing: 4) {
              VTextField("Full name", modelValue: "Ana Lima")
              VTextField("Street address", modelValue: "14 Rue des Lilas")
              HStack(alignment: .top, spacing: 12) {
                VTextField("Postcode", modelValue: "69003").frame(width: 140)
                VTextField("City", modelValue: "Lyon")
              }
              .frame(maxWidth: .infinity)
              VCheckbox("Save this address", modelValue: true, color: "primary", density: "compact")
            }
            .frame(maxWidth: .infinity)
            VDatePicker(title: "Delivery date", modelValue: "2026-11-26", color: "primary")
          }
        }
        .padding(24)
        VStepperActions {
          VBtn("Previous", variant: "text", prependIcon: "mdi-chevron-left")
          VBtn("Next", color: "primary", variant: "flat", appendIcon: "mdi-chevron-right")
        }
      }
      .frame(maxWidth: .infinity)
      VCard(title: "Order summary", variant: "outlined") {
        VList {
          SummaryLine(name: "Linen lamp shade", detail: "Qty 1", price: "$89.00", image: "assets/images/photo-1.svg")
          SummaryLine(name: "Brass wall hook", detail: "Qty 4", price: "$48.00", image: "assets/images/photo-2.svg")
          SummaryLine(name: "Cotton throw", detail: "Qty 1", price: "$64.00", image: "assets/images/photo-3.svg")
        }
        VDivider()
        HStack { Text("Express delivery").font(.body2); Spacer(); Text("$9.90").font(.body2) }
        HStack { Text("Total").font(.subtitle1).bold(); Spacer(); Text("$210.90").font(.h6) }
        VAlert("Order before 18:00 for next-day delivery.", type: "info", variant: "tonal", density: "compact")
      }
      .frame(width: 340)
    }
  }
}
```

## Mobile inbox

A phone layout: a primary `VAppBar` with `VTabs`, a `VBanner`, a two-line `VList` of `ThreadItem`s, a
`VFab` and a `VBottomNavigation` with a badge.

```mockitdown source="true" appearance="both" device="phone"
import Vuetify
import "vuetify/components"
@Screen(title: "Messages", id: "VUE-7")

VApp {
  VAppBar(title: "Messages", color: "primary") {
    VBtn(icon: "mdi-magnify")
    VBtn(icon: "mdi-dots-vertical")
  } leading: {
    VAppBarNavIcon()
  }
  VTabs(color: "primary", grow: true) {
    VTab("Chats").selected()
    VTab("Groups")
    VTab("Calls")
  }
  VBanner("You are offline. Messages will send when you reconnect.", icon: "mdi-wifi") actions: {
    VBtn("Retry", variant: "text")
  }
  VList {
    ThreadItem(name: "Ana Lima", message: "The mockups look great, ship it!", time: "9:41", photo: "assets/images/avatar-1.svg", unread: 2)
    ThreadItem(name: "Ben Okafor", message: "Can we move stand-up to 10?", time: "9:12", photo: "assets/images/avatar-2.svg", unread: 1)
    ThreadItem(name: "Chloé Martin", message: "Photos from the offsite", time: "Yesterday", photo: "assets/images/avatar-3.svg")
    VDivider(variant: "inset")
    ThreadItem(name: "Design team", message: "Dana: new icons are up", time: "Mon")
    ThreadItem(name: "Eli Novak", message: "Thanks, talk soon", time: "Sun", photo: "assets/images/avatar-4.svg")
  }
  Spacer()
  VFab(icon: "mdi-pencil", color: "primary")
  VBottomNavigation(value: 0, color: "primary", items: [
    ["title": "Chats", "icon": "mdi-message-text", "badge": 3],
    ["title": "Contacts", "icon": "mdi-account-group"],
    ["title": "Saved", "icon": "mdi-bookmark-outline"],
    ["title": "Settings", "icon": "mdi-cog"]
  ])
}
```

## Menu, dialog and snackbar

Transient UI over a file browser, annotated: a `VToolbar` icon button opens a `VMenu` (#1); its Delete
item (#2) acts on the folder selected in the `VTreeview` (#3) and asks for confirmation in a `VDialog`
over the scrim, while a `VSnackbar` reports the previous action with Undo. Behind them: a `VTooltip`, a
`VSkeletonLoader` still loading and a `VEmptyState`.

```mockitdown source="true" height="700" url="https://drive.northwind.example/projects"
import Vuetify
@Screen(title: "Files", id: "VUE-8")

VApp {
  VToolbar(title: "Projects", density: "comfortable") {
    Spacer()
    VBtn(icon: "mdi-upload")
    VBtn(icon: "mdi-view-grid")
    VMenu(icon: "mdi-dots-vertical", open: true) {
      VListItem(title: "Rename", prependIcon: "mdi-pencil")
      VListItem(title: "Duplicate", prependIcon: "mdi-content-copy", active: true)
      VListItem(title: "Move to…", prependIcon: "mdi-folder-open")
      VDivider()
      VListItem(title: "Delete", prependIcon: "mdi-delete").callout(2, alignment: .leading)
    }
    .callout(1, alignment: .bottomLeading)
  }
  HStack(alignment: .top, spacing: 0) {
    VSheet(border: true) {
      VTreeview {
        VTreeviewItem("Website relaunch", icon: "mdi-folder-open", expanded: true) {
          VTreeviewItem("Brief.pdf", icon: "mdi-file-document")
          VTreeviewItem("Wireframes", icon: "mdi-folder", selected: true).callout(3, alignment: .trailing)
          VTreeviewItem("Copy deck.docx", icon: "mdi-file-document")
        }
        VTreeviewItem("Brand assets", icon: "mdi-folder")
        VTreeviewItem("Archive", icon: "mdi-archive")
      }
      .padding(.vertical, 8)
    }
    .frame(width: 260, maxHeight: .infinity)
    VStack(alignment: .leading, spacing: 12) {
      VSkeletonLoader(avatar: true, lines: 2)
      VSkeletonLoader(avatar: true, lines: 2)
      VEmptyState(headline: "No wireframes yet", text: "Drop files here or upload them from your computer.", icon: "mdi-image-outline") {
        VTooltip("PDF, images or Office files", open: true, location: .top) {
          VBtn("Upload", color: "primary", prependIcon: "mdi-upload")
        }
      }
    }
    .padding(16)
    .frame(maxWidth: .infinity)
  }
  VDialog(title: "Delete “Wireframes”?") {
    Text("The folder and its 14 files move to the archive for 30 days, then are deleted for good.")
  } actions: {
    VBtn("Cancel", variant: "text")
    VBtn("Delete", color: "error", variant: "text")
  }
  VSnackbar("“Brief.pdf” duplicated", action: "Undo")
}
```
