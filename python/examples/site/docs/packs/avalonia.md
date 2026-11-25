# Avalonia UI

The **avalonia** pack imitates cross-platform .NET desktop apps built with **Avalonia UI 11** and its
default **FluentTheme** (`Avalonia.Themes.Fluent`). Avalonia's Fluent theme is its own port of the
UWP-era Fluent resources rather than WinUI 3: windows are plain `SystemAltHigh` (white, or black in the
Dark theme variant), buttons are flat grey `SystemBaseLow` fills without a stroke, inputs are 1 px
outlines with 3 px corners (`ControlCornerRadius`), popups use 8 px (`OverlayCornerRadius`), list
selection is the 60 % accent brush, toggle switches are outlined pills with *On* / *Off* text, the
slider thumb is an accent disc and `TabItem` headers are 24 px SemiLight with an accent pipe. Text is
**Inter** at 14 px, the font the Avalonia templates register with `WithInterFont()`; the accent is the
default `SystemAccentColor` `#0078D7`. Light and dark follow the app's `RequestedThemeVariant`.

Select it with `import Avalonia` (also `AvaloniaUI`, `Avalonia.Controls`, `Avalonia.Themes.Fluent`) or
`pack="avalonia"`. Elements use the XAML control names: `Window`, `StackPanel`, `DockPanel`, `Grid`,
`WrapPanel`, `Canvas`, `Border`, `ScrollViewer`, `SplitView`, `TabControl` / `TabItem`, `Expander`,
`Button` (`classes: "accent"`), `RepeatButton`, `ToggleButton`, `SplitButton`, `DropDownButton`,
`HyperlinkButton`, `CheckBox`, `RadioButton`, `ToggleSwitch`, `Slider`, `ProgressBar`, `TextBox`,
`MaskedTextBox`, `NumericUpDown`, `AutoCompleteBox`, `ComboBox`, `ListBox`, `TreeView`, `DataGrid`,
`Calendar`, `CalendarDatePicker`, `DatePicker`, `TimePicker`, `Menu` / `MenuItem`, `ContextMenu`,
`MenuFlyout`, `Flyout`, `ToolTip`, `NotificationCard` + `WindowNotificationManager`, `TextBlock`,
`SelectableTextBlock`, `Label`, `PathIcon`, `ColorView` / `ColorPicker`, plus AvaloniaEdit's
`TextEditor` and LiveCharts2's `CartesianChart` / `PieChart` — `mockitdown elements avalonia` lists
them all. Arguments follow the XAML properties: `content:`, `header:`, `text:`, `watermark:`,
`isChecked:`, `value:`, `minimum:` / `maximum:`, `selectedItem:`, `isDropDownOpen:`, `isExpanded:`,
`onContent:` / `offContent:`, `inputGesture:` and `classes:`. `TextBlock(classes: "h2")` uses the
`h1`…`h6` type ramp. Avalonia apps run on Windows, macOS and Linux, so the default chrome is the Windows
11 title bar and any fence can say `chrome="macos"` or `chrome="kde"`. The reusable pieces below come
from [`mockups/avalonia/controls.mockitdown`](#custom-components).

## Controls

The basic controls of the Fluent theme in their rest, checked and focused states.

```mockitdown source="true" device="fit" appearance="both" title="Controls"
import Avalonia

StackPanel(spacing: 18) {
  StackPanel(spacing: 8, orientation: .horizontal) {
    Button("Accent", classes: "accent")
    Button("Button")
    RepeatButton("Repeat")
    ToggleButton("Toggle", isChecked: true)
    DropDownButton("Sort by")
    SplitButton("Paste")
    HyperlinkButton("Visit website")
    Button("Disabled").disabled()
  }
  StackPanel(spacing: 32, orientation: .horizontal) {
    StackPanel(spacing: 0) {
      CheckBox("Remember me", isChecked: true)
      CheckBox("Select all", isChecked: .indeterminate)
      CheckBox("Unchecked")
    }
    StackPanel(spacing: 0) {
      RadioButton("Small", isChecked: true)
      RadioButton("Medium")
      RadioButton("Large")
    }
    ToggleSwitch("Notifications", isChecked: true)
    ToggleSwitch("Auto-update")
  }
  StackPanel(spacing: 12, orientation: .horizontal) {
    TextBox("ana.lima", label: "User name").state(.focused).frame(width: 190)
    TextBox(label: "Search", watermark: "Type to search…").frame(width: 170)
    NumericUpDown(value: 3, label: "Copies").frame(width: 120)
    ComboBox(label: "Size", items: ["Small", "Medium", "Large"], selectedItem: "Medium").frame(width: 140)
  }
  StackPanel(spacing: 24, orientation: .horizontal) {
    Slider(value: 40, maximum: 100).frame(width: 200)
    ProgressBar(value: 64).frame(width: 160)
    ProgressBar().frame(width: 120)
    CalendarDatePicker(selectedDate: "2026-11-23").frame(width: 170)
  }
}
.padding(20)
```

## Sign-in

A small `Window` with a `Grid`-centred form: `TextBox` with a watermark, a masked password
(`.passwordChar("•")`), a `CheckBox`, an accent `Button` and a `HyperlinkButton`, with the error state of
`DataValidationErrors` on the password.

```mockitdown source="true" width="760" height="520" title="Ledgerly — Sign in"
import Avalonia

Window {
  HStack(spacing: 0) {
    Border {
      StackPanel(spacing: 14) {
        PathIcon("DataBar", size: 28).foregroundStyle(.white).frame(maxWidth: .infinity, alignment: .leading)
        TextBlock("Ledgerly", classes: "h2").foregroundStyle(.white)
        TextBlock("Bookkeeping for small studios, on every desktop.").foregroundStyle(.white)
        Spacer()
        TextBlock("Version 3.4 · Windows · macOS · Linux").font(.caption).foregroundStyle(.white)
      }
      .padding(28)
    }
    .frame(width: 260, maxHeight: .infinity)
    .background(.blue)

    StackPanel(spacing: 14) {
      TextBlock("Sign in", classes: "h3")
      TextBlock("Use your Ledgerly account.").foregroundStyle(.secondary)
      TextBox("mara.ilic@northbeam.studio", label: "Email")
      TextBox("hunter2", label: "Password", error: "The password is incorrect.").passwordChar("•")
      HStack {
        CheckBox("Keep me signed in", isChecked: true)
        Spacer()
        HyperlinkButton("Forgot password?")
      }
      Button("Sign in", classes: "accent").frame(maxWidth: .infinity)
      HStack(spacing: 4) {
        TextBlock("No account?").foregroundStyle(.secondary)
        HyperlinkButton("Create one")
      }
    }
    .padding(36)
    .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .top)
  }
  .frame(maxHeight: .infinity)
}
```

## Settings

A `SplitView` with a `ListBox` pane and a scrolling settings page built from the custom `SettingRow`
component (#1): `ToggleSwitch`es, `ComboBox`es, a `Slider` and a `RadioButton` group, an `Expander` for
the advanced options (#2) and an accent **Apply** button (#3).

```mockitdown source="true" appearance="both" width="1040" height="860" title="Ledgerly — Settings"
import Avalonia
import "avalonia/controls"

SplitView(displayMode: .inline) {
  StackPanel(spacing: 0) {
    TextBlock("Settings", classes: "h4").padding(.horizontal, 16).padding(.vertical, 14)
    ListBox {
      ListBoxItem("General", icon: "Settings").selected()
      ListBoxItem("Appearance", icon: "WeatherMoon")
      ListBoxItem("Accounts", icon: "Person")
      ListBoxItem("Sync", icon: "Cloud")
      ListBoxItem("Notifications", icon: "Alert")
      ListBoxItem("Privacy", icon: "Shield")
      ListBoxItem("About", icon: "Info")
    }
  }
} content: {
  ScrollViewer {
    StackPanel(spacing: 8) {
      TextBlock("General", classes: "h2").padding(.bottom, 8)
      SettingRow(title: "Start with the system", description: "Open Ledgerly when you sign in", icon: "Power") {
        ToggleSwitch(isChecked: true)
      }
      .callout(1, alignment: .leading)
      SettingRow(title: "Language", description: "Restart to apply", icon: "Globe") {
        ComboBox(items: ["English (UK)", "Deutsch", "Português"], selectedItem: "English (UK)").frame(width: 180)
      }
      SettingRow(title: "Currency", icon: "Tag") {
        ComboBox(items: ["EUR €", "USD $", "GBP £"], selectedItem: "EUR €").frame(width: 180)
      }
      SettingRow(title: "Auto-save interval", description: "Minutes between background saves", icon: "Save") {
        Slider(value: 5, minimum: 1, maximum: 30).frame(width: 180)
      }
      SettingRow(title: "Send anonymous usage data", icon: "Shield") {
        ToggleSwitch(isChecked: false)
      }
      TextBlock("Theme", classes: "h5").padding(.top, 12)
      StackPanel(spacing: 0) {
        RadioButton("Light")
        RadioButton("Dark")
        RadioButton("Use system setting", isChecked: true)
      }
      Expander("Advanced", isExpanded: true) {
        CheckBox("Enable hardware acceleration", isChecked: true)
        CheckBox("Write diagnostic log files")
        HStack(spacing: 12) {
          TextBox("~/Ledgerly/Backups", label: "Backup folder").frame(maxWidth: .infinity)
          NumericUpDown(value: 14, label: "Keep (days)").frame(width: 130)
        }
      }
      .callout(2, alignment: .trailing)
      HStack {
        Spacer()
        Button("Reset")
        Button("Apply", classes: "accent").callout(3, alignment: .leading)
      }
      .padding(.top, 8)
    }
    .padding(24)
  }
}
```

## Master–detail

A contacts list and an invoice `DataGrid`: the `ListBox` uses the custom `ContactItem` template, the
detail side has a `TabStrip`, an `AutoCompleteBox` filter, a `DataGrid` with a sorted column and a
selected row, and a `ToolTip`.

```mockitdown source="true" width="1120" height="580" title="Ledgerly — Clients"
import Avalonia
import "avalonia/controls"

DockPanel {
  Border {
    HStack(spacing: 8) {
      Button("New client", icon: "Add", classes: "accent")
      Button(icon: "Edit")
      ToolTip("Delete client (Del)", placement: .bottom) { Button(icon: "Delete") }
      Spacer()
      AutoCompleteBox(watermark: "Filter clients").frame(width: 240)
    }
  }
  .padding(10)
  HStack(spacing: 0) {
    ListBox {
      ContactItem(name: "Amsel & Co.", detail: "Berlin · 12 invoices", trailing: "€8,420")
      ContactItem(name: "Brightwater Press", detail: "Leeds · 7 invoices", trailing: "€3,105", selected: true)
      ContactItem(name: "Cobalt Yard", detail: "Porto · 4 invoices", trailing: "€1,980")
      ContactItem(name: "Driftwood Films", detail: "Ghent · 9 invoices", trailing: "€6,240")
      ContactItem(name: "Elm Street Studio", detail: "Utrecht · 3 invoices", trailing: "€940")
      ContactItem(name: "Fennel Kitchen", detail: "Lyon · 15 invoices", trailing: "€11,870")
      ContactItem(name: "Glasshouse Audio", detail: "Malmö · 6 invoices", trailing: "€2,310")
    }
    .frame(width: 330, maxHeight: .infinity)
    Separator()
    StackPanel(spacing: 12) {
      HStack(spacing: 14) {
        Avatar("Brightwater Press", size: .large)
        StackPanel(spacing: 2) {
          TextBlock("Brightwater Press", classes: "h3")
          SelectableTextBlock("accounts@brightwater.example · +44 113 496 0712").foregroundStyle(.secondary)
        }
        Spacer()
        Button("Send statement", icon: "Send")
      }
      TabStrip(items: ["Invoices", "Payments", "Notes"], selectedIndex: 0).size(.small)
      DataGrid(columns: ["Invoice", "Issued", "Due", "Status", "Amount"],
               rows: [["INV-2041", "2026-11-02", "2026-12-02", "Open", "€1,240.00"],
                      ["INV-2033", "2026-10-14", "2026-11-13", "Overdue", "€860.00"],
                      ["INV-2019", "2026-09-30", "2026-10-30", "Paid", "€455.00"],
                      ["INV-2007", "2026-09-01", "2026-10-01", "Paid", "€300.00"],
                      ["INV-1988", "2026-08-11", "2026-09-10", "Paid", "€250.00"]],
               selected: [1], sortColumn: 1)
      HStack {
        TextBlock("Outstanding: **€2,100.00**")
        Spacer()
        ProgressBar(value: 68).frame(width: 160)
        TextBlock("68 % collected").font(.caption).foregroundStyle(.secondary)
      }
    }
    .padding(16)
    .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .top)
  }
  .frame(maxHeight: .infinity)
}
```

## Document editor

A code-and-notes editor: a `Menu` with the **Edit** submenu open (icons, input gestures, a disabled
item, a checked item and a submenu), the custom `EditorToolBar`, a `TreeView` of the project and a
`TabControl` holding AvaloniaEdit `TextEditor`s, with a status line at the bottom.

```mockitdown source="true" appearance="both" width="1160" height="700" title="Scribe — invoice-template.axaml"
import Avalonia
import "avalonia/controls"

DockPanel {
  Menu {
    MenuItem("File")
    MenuBarItem("Edit", isSubMenuOpen: true) {
      MenuItem("Undo", icon: "Undo", inputGesture: "Ctrl+Z")
      MenuItem("Redo", icon: "Redo", inputGesture: "Ctrl+Y").disabled()
      Separator()
      MenuItem("Cut", icon: "Cut", inputGesture: "Ctrl+X")
      MenuItem("Copy", icon: "Copy", inputGesture: "Ctrl+C").state(.hover)
      MenuItem("Paste", icon: "Paste", inputGesture: "Ctrl+V")
      Separator()
      MenuItem("Find…", icon: "Search", inputGesture: "Ctrl+F")
      MenuItem("Format") { MenuItem("Indent") }
      MenuItem("Word wrap", isChecked: true)
    }
    MenuItem("View")
    MenuItem("Build")
    MenuItem("Help")
  }
  EditorToolBar()
  Separator()
  HStack(spacing: 0) {
    StackPanel(spacing: 0) {
      TextBlock("Explorer").font(.caption).foregroundStyle(.secondary).padding(.horizontal, 12).padding(.vertical, 8)
      TreeView {
        TreeViewItem("Ledgerly.Desktop", icon: "folder", isExpanded: true) {
          TreeViewItem("Assets", icon: "folder")
          TreeViewItem("ViewModels", icon: "folder", isExpanded: true) {
            TreeViewItem("InvoiceViewModel.cs", icon: "doc")
            TreeViewItem("MainViewModel.cs", icon: "doc")
          }
          TreeViewItem("Views", icon: "folder", isExpanded: true) {
            TreeViewItem("invoice-template.axaml", icon: "doc", isSelected: true)
            TreeViewItem("MainWindow.axaml", icon: "doc")
          }
          TreeViewItem("App.axaml", icon: "doc")
          TreeViewItem("Program.cs", icon: "doc")
        }
      }
    }
    .frame(width: 250, maxHeight: .infinity)
    .background(.chromeLow)
    TabControl(selectedIndex: 0) {
      TabItem("invoice-template.axaml") {
        TextEditor("""
<UserControl xmlns="https://github.com/avaloniaui"
             x:Class="Ledgerly.Views.InvoiceTemplate">
  <StackPanel Spacing="8" Margin="24">
    <TextBlock Classes="h2" Text="{Binding Number}" />
    <TextBlock Text="{Binding Client.Name}" />
    <DataGrid ItemsSource="{Binding Lines}"
              IsReadOnly="True" />
    <Button Classes="accent" Content="Send"
            Command="{Binding SendCommand}" />
  </StackPanel>
</UserControl>
""", language: "xml", highlight: [7])
        .frame(maxHeight: .infinity)
      }
      TabItem("MainWindow.axaml") { TextEditor("") }
      TabItem("notes.md") { TextEditor("") }
    }
    .size(.small)
    .frame(maxWidth: .infinity, maxHeight: .infinity)
  }
  .frame(maxHeight: .infinity)
  Border {
    HStack(spacing: 16) {
      TextBlock("Ready").font(.caption)
      Spacer()
      TextBlock("Ln 7, Col 32").font(.caption)
      TextBlock("UTF-8").font(.caption)
      TextBlock("XAML").font(.caption)
    }
  }
  .padding(.horizontal, 12)
  .padding(.vertical, 4)
  .background(.systemAccent)
  .foregroundStyle(.white)
}
```

## Dashboard

A reporting page: the custom `KpiTile` component (a `Stat` with a sparkline), LiveCharts2
`CartesianChart` and `PieChart`, a `Calendar`, a `DatePicker` range, a `DataGrid` and a `ToggleButton`
group to switch the period.

```mockitdown source="true" width="1180" height="780" title="Ledgerly — Overview"
import Avalonia
import "avalonia/controls"

ScrollViewer {
  StackPanel(spacing: 16) {
    HStack(spacing: 8) {
      TextBlock("Overview", classes: "h2")
      Spacer()
      ToggleButton("Week")
      ToggleButton("Month", isChecked: true)
      ToggleButton("Quarter")
      DatePicker(selectedDate: "2026-11-23").frame(width: 260)
      DropDownButton("Export", icon: "Share")
    }
    HStack(spacing: 12) {
      KpiTile(title: "Revenue", value: "€48,210", change: "+12.4 %", trend: [30, 34, 31, 40, 44, 42, 48])
      KpiTile(title: "Outstanding", value: "€9,860", change: "−3.1 %", trend: [14, 13, 15, 12, 11, 10, 9.8])
      KpiTile(title: "Invoices sent", value: "137", change: "+18", trend: [90, 98, 104, 110, 121, 130, 137])
      KpiTile(title: "Avg. days to pay", value: "17.2", change: "−1.6", trend: [22, 21, 20, 19, 19, 18, 17])
    }
    HStack(alignment: .top, spacing: 12) {
      Border {
        StackPanel(spacing: 8) {
          TextBlock("Revenue vs. expenses").bold()
          CartesianChart(kind: .bar, series: [[32, 36, 34, 41, 45, 48], [21, 24, 22, 27, 26, 29]],
                         seriesNames: ["Revenue", "Expenses"],
                         labels: ["Jun", "Jul", "Aug", "Sep", "Oct", "Nov"], legend: true, height: 210)
        }
      }
      .padding(16)
      .background(.chromeMediumLow)
      .cornerRadius(8)
      .frame(maxWidth: .infinity)
      Border {
        StackPanel(spacing: 8) {
          TextBlock("Revenue by client type").bold()
          PieChart(values: [46, 28, 16, 10], labels: ["Agencies", "Publishers", "Retail", "Other"], legend: true, height: 210)
        }
      }
      .padding(16)
      .background(.chromeMediumLow)
      .cornerRadius(8)
      .frame(width: 300)
      Calendar(selectedDate: "2026-11-18", events: ["2026-11-27", "2026-11-30"]).frame(width: 300)
    }
    DataGrid(columns: ["Client", "Invoice", "Due", "Status", "Amount"],
             rows: [["Fennel Kitchen", "INV-2044", "Nov 28", "Open", "€2,400.00"],
                    ["Amsel & Co.", "INV-2043", "Nov 30", "Open", "€1,180.00"],
                    ["Brightwater Press", "INV-2033", "Nov 13", "Overdue", "€860.00"],
                    ["Driftwood Films", "INV-2040", "Dec 4", "Draft", "€3,050.00"]])
  }
  .padding(24)
}
```

## Flyouts and notifications

The light-dismiss overlays: an `AutoCompleteBox` with its drop-down, a `MenuFlyout` opened from the
**Sort** button, a `ContextMenu` on the selected row, a `Flyout` with a confirmation, a `ToolTip`, and
a `WindowNotificationManager` stacking `NotificationCard`s in the bottom-right corner.

```mockitdown source="true" appearance="both" width="1100" height="600" title="Ledgerly — Invoices"
import Avalonia

ZStack(alignment: .topLeading) {
  StackPanel(spacing: 12) {
    HStack(spacing: 8) {
      TextBlock("Invoices", classes: "h3").padding(.trailing, 24)
      AutoCompleteBox(text: "Bri", items: ["Brightwater Press", "Bristol Bindery", "Brick Lane Bakes"],
                      selectedIndex: 0, isDropDownOpen: true).frame(width: 240)
      ToolTip("Archive paid invoices (Ctrl+E)", placement: .trailing) { Button(icon: "Archive") }
      Spacer()
      MenuFlyout("Sort", isOpen: true) {
        MenuItem("Due date", isChecked: true)
        MenuItem("Amount", isChecked: false)
        MenuItem("Client", isChecked: false)
        Separator()
        MenuItem("Descending", isChecked: true)
      }
    }
    HStack(alignment: .top, spacing: 16) {
      StackPanel(spacing: 0) {
        ListBox {
          ListBoxItem("INV-2044 · Fennel Kitchen", subtitle: "€2,400.00 · due Nov 28")
          ListBoxItem("INV-2043 · Amsel & Co.", subtitle: "€1,180.00 · due Nov 30").selected()
          ListBoxItem("INV-2040 · Driftwood Films", subtitle: "€3,050.00 · draft")
          ListBoxItem("INV-2039 · Cobalt Yard", subtitle: "€640.00 · paid")
        }
        ContextMenu {
          MenuItem("Open", icon: "Open")
          MenuItem("Duplicate", icon: "Copy", inputGesture: "Ctrl+D").state(.hover)
          MenuItem("Mark as paid", icon: "Checkmark")
          MenuItem("Send reminder", icon: "Send") { MenuItem("By email") }
          Separator()
          MenuItem("Delete", icon: "Delete", inputGesture: "Del")
        }
        .padding(.leading, 180)
      }
      .frame(width: 460)
      StackPanel(spacing: 6) {
        HStack { Button("Void invoice…"); Spacer() }
        Flyout {
          TextBlock("Void INV-2043? The client keeps a credit note.")
          HStack {
            Spacer()
            Button("Void", classes: "accent")
          }
        }
      }
      .frame(maxWidth: .infinity)
    }
  }
  .padding(20)
  .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)

  WindowNotificationManager(position: .bottomRight) {
    NotificationCard("Invoice sent", message: "INV-2043 was emailed to Amsel & Co.", type: .success)
    NotificationCard("Sync paused", message: "You are offline. Changes are kept locally.", type: .warning)
    NotificationCard("Backup complete", message: "142 records saved to ~/Ledgerly/Backups.")
  }
}
```

## Modal dialog

A dialog is a child `Window` shown with `ShowDialog`; the owner is not dimmed, only disabled. The
content is a `Grid` of inputs with `Label`s, a `MaskedTextBox` for the IBAN, a `ColorPicker` for the
category colour and a right-aligned button row.

```mockitdown source="true" width="960" height="560" title="Ledgerly — Payments"
import Avalonia

StackPanel(spacing: 12) {
  TextBlock("Payments", classes: "h3")
  DataGrid(columns: ["Date", "Client", "Method", "Amount"],
           rows: [["2026-11-21", "Fennel Kitchen", "Bank transfer", "€2,400.00"],
                  ["2026-11-19", "Cobalt Yard", "Card", "€640.00"],
                  ["2026-11-14", "Glasshouse Audio", "Bank transfer", "€1,150.00"]])
}
.padding(20)

Dialog("Record payment") {
  TextBlock("INV-2043 · Amsel & Co. — **€1,180.00** open")
  Grid(columns: 2, spacing: 12) {
    NumericUpDown(value: "1,180.00", label: "Amount (€)")
    CalendarDatePicker(selectedDate: "2026-11-23", label: "Received on")
    ComboBox(label: "Method", items: ["Bank transfer", "Card", "Cash"], selectedItem: "Bank transfer")
    TimePicker(selectedTime: "10 : 45", label: "Time")
  }
  MaskedTextBox(label: "Payer IBAN", mask: "DE00 0000 0000 0000 0000 00")
  HStack(spacing: 12) {
    Label("Category colour")
    ColorPicker(colors: ["#0078d7", "#00b7c3", "#e3008c"], selection: 0)
  }
  CheckBox("Send a receipt to the client", isChecked: true)
} actions: {
  Button("Cancel")
  Button("Record", classes: "accent")
}
```

## Cross-platform

The same Avalonia view runs unchanged on every desktop: the Fluent theme draws every control itself,
so only the window decorations come from the system. Here the same quick-entry window is shown on macOS
and on KDE Plasma; on Windows it gets the title bar of the mockups above.

```mockitdown source="true" width="520" height="340" chrome="macos" title="Quick entry"
import Avalonia

StackPanel(spacing: 12) {
  TextBlock("New expense", classes: "h4")
  TextBox("Train to Utrecht", label: "Description")
  HStack(spacing: 12) {
    NumericUpDown(value: "24.80", label: "Amount (€)").frame(maxWidth: .infinity)
    ComboBox(label: "Category", items: ["Travel", "Meals"], selectedItem: "Travel").frame(maxWidth: .infinity)
  }
  ToggleSwitch("Billable to client", isChecked: true)
  HStack {
    Spacer()
    Button("Cancel")
    Button("Add", classes: "accent")
  }
}
.padding(20)
```

```mockitdown width="520" height="340" chrome="kde" appearance="dark" title="Quick entry — Ledgerly"
import Avalonia

StackPanel(spacing: 12) {
  TextBlock("New expense", classes: "h4")
  TextBox("Train to Utrecht", label: "Description")
  HStack(spacing: 12) {
    NumericUpDown(value: "24.80", label: "Amount (€)").frame(maxWidth: .infinity)
    ComboBox(label: "Category", items: ["Travel", "Meals"], selectedItem: "Travel").frame(maxWidth: .infinity)
  }
  ToggleSwitch("Billable to client", isChecked: true)
  HStack {
    Spacer()
    Button("Cancel")
    Button("Add", classes: "accent")
  }
}
.padding(20)
```

## Custom components

`mockups/avalonia/controls.mockitdown` defines the reusable pieces used above — `SettingRow`,
`ContactItem`, `KpiTile` and `EditorToolBar` — as `struct … : View` declarations, the mockitdown
counterpart of an Avalonia `UserControl` or `DataTemplate`. Import them with `import "avalonia/controls"`.
