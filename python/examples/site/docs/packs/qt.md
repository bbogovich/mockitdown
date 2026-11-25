# Qt Widgets (Fusion)

The **qt** pack imitates desktop applications built with **Qt 6 Widgets** (C++, PySide6 or PyQt6)
in Qt's cross-platform **Fusion** style with its default palette: Window `#efefef`, Base `#ffffff`,
AlternateBase `#f7f7f7`, Highlight `#308cc6`, and in dark mode (Qt 6.5+ colour scheme) Window
`#323232`, Base `#242424`, Text `#f0f0f0`. Controls have Fusion's faint vertical gradient, a 1 px
outline and 2 px corners; item views are square framed panels with Highlight selection; the type is
the desktop's 9 pt UI font ("Segoe UI", "Noto Sans", "DejaVu Sans" …, 12 px).

Select it with `import QtWidgets` (also `Qt`, `Qt6`, `PySide`, `PyQt`) or `pack="qt"`. Elements
use the Qt class names without the `Q`: `MainWindow`, `MenuBar` / `Menu` / `Action` / `Separator`,
`ToolBar` / `ToolButton`, `StatusBar`, `DockWidget`, `GroupBox`, `TabWidget`, `Splitter`,
`PushButton`, `CheckBox`, `RadioButton`, `ComboBox`, `LineEdit`, `TextEdit`, `SpinBox`, `DateEdit`,
`CalendarWidget`, `Slider`, `Dial`, `ProgressBar`, `LCDNumber`, `ListWidget`, `TreeWidget` +
`HeaderView`, `TableView`, `MessageBox`, `FileDialog`, `DialogButtonBox`, `FormLayout` + `FormRow`,
`ToolBox`, `Wizard` / `WizardPage`, `ChartView` and more — `mockitdown elements qt` lists them all.
Arguments follow the Qt properties (`placeholderText:`, `currentText:`, `echoMode: .password`,
`checkState:`, `toolButtonStyle:`, `alternatingRowColors:`, `calendarPopup:` …), and icons accept
freedesktop theme names (`"document-save"`, `"edit-copy"`) and `QStyle` standard pixmaps
(`"SP_DialogOkButton"`). The reusable pieces below come from
[`mockups/qt/widgets.mockitdown`](#custom-components).

## Widgets gallery

Qt's own *Widgets Gallery* example in Fusion: radio buttons and a tri-state check box, the push
button variants (default, toggle, flat), a tool button with a menu, a command link, a tab widget with
a table, a checkable group of simple input widgets, and a progress bar.

```mockitdown source="true" appearance="both" width="900" height="520" title="Widgets Gallery"
import QtWidgets

VBoxLayout(spacing: 8) {
  HBoxLayout(spacing: 8) {
    Label("Style:")
    ComboBox(items: ["Fusion", "Windows"], currentText: "Fusion").frame(width: 120)
    Label("Color scheme:")
    ComboBox(items: ["Auto", "Light", "Dark"], currentText: "Auto").frame(width: 100)
    Spacer()
    CheckBox("Use style's standard palette", checked: true)
    CheckBox("Disable widgets")
  }
  GridLayout(columns: 2, spacing: 8) {
    GroupBox("Group 1") {
      RadioButton("Radio button 1", checked: true)
      RadioButton("Radio button 2")
      RadioButton("Radio button 3")
      CheckBox("Tri-state check box", checked: .indeterminate)
    }
    GroupBox("Group 2") {
      PushButton("Default Push Button", default: true)
      PushButton("Toggle Push Button", checked: true)
      PushButton("Flat Push Button").flat()
      HBoxLayout { ToolButton("Tool Button", popupMode: .menuButtonPopup); Spacer() }
      CommandLinkButton("Command Link Button")
    }
    TabWidget(selection: "Table") {
      Tab("Table") {
        TableWidget(columns: ["Name", "Qty", "Price"],
                    rows: [["Apples", 12, "1.20"], ["Pears", 4, "0.95"], ["Plums", 30, "0.40"], ["Figs", 7, "2.10"], ["Kiwis", 18, "0.55"]],
                    selection: [1])
      }
      Tab("Text Edit") { TextEdit("Twinkle, twinkle, little star") }
      Tab("Tree View") { TreeWidget { TreeWidgetItem("Item") } }
    }
    GroupBox("Group 3", checkable: true, checked: true) {
      LineEdit("s3cRe7", echoMode: .password).state(.focused)
      SpinBox(value: 50)
      DateTimeEdit(dateTime: "2026-11-24 09:41")
      HBoxLayout(spacing: 12) {
        VBoxLayout(spacing: 10) {
          Slider(value: 40, maximum: 100)
          ScrollBar(value: 60, maximum: 100)
        }
        .frame(maxWidth: .infinity)
        Dial(value: 30, maximum: 100, notchesVisible: true)
      }
    }
  }
  ProgressBar(value: 64)
}
.padding(9)
```

## Document editor

A classic `MainWindow`: a menu bar with the **Edit** menu open (icons, shortcuts, a disabled
action, a checkable action and a submenu), a tool bar of `ToolButton`s with a font combo box, a
document-mode `TabWidget` with closable tabs around the central `TextEdit`, two stacked
`DockWidget`s and a
`StatusBar` with permanent widgets on the right.

```mockitdown appearance="both" width="1100" height="640" title="release-notes.md — Text Editor"
import QtWidgets
import "qt/widgets"

MainWindow {
  MenuBar {
    Menu("File")
    Menu("Edit", open: true) {
      Action("Undo", icon: "edit-undo", shortcut: "Ctrl+Z")
      Action("Redo", icon: "edit-redo", shortcut: "Ctrl+Y").disabled()
      Separator()
      Action("Cut", icon: "edit-cut", shortcut: "Ctrl+X")
      Action("Copy", icon: "edit-copy", shortcut: "Ctrl+C").state(.hover)
      Action("Paste", icon: "edit-paste", shortcut: "Ctrl+V")
      Separator()
      Action("Find…", icon: "edit-find", shortcut: "Ctrl+F")
      Action("Replace…", shortcut: "Ctrl+H")
      Action("Insert") { Action("Date and Time") }
      Separator()
      Action("Word Wrap", checked: true)
    }
    Menu("View")
    Menu("Format")
    Menu("Tools")
    Menu("Help")
  }
  ToolBar {
    ToolAction(icon: "document-new", text: "New")
    ToolAction(icon: "document-open", text: "Open")
    ToolAction(icon: "document-save", text: "Save")
    Separator()
    ToolAction(icon: "edit-undo", text: "Undo")
    ToolAction(icon: "edit-redo", text: "Redo")
    Separator()
    FontComboBox(currentText: "Noto Sans").frame(width: 130)
    SpinBox(value: 11, suffix: " pt").frame(width: 64)
    Separator()
    ToolAction(icon: "edit-find", text: "Find", checked: true)
  }
  HBoxLayout(spacing: 4) {
    CentralWidget {
      TabWidget(selection: "release-notes.md", tabsClosable: true) {
        Tab("release-notes.md", icon: "text-x-generic") {
          TextEdit("""
# Text Editor 4.2

## New features

### Dark colour scheme
The editor now follows the system colour scheme (Qt 6.5 or later). Choose
View ▸ Appearance to force light or dark.

### Tabbed documents
Open several files in one window; drag a tab out to make a new window.
""")
          .frame(maxHeight: .infinity)
        }
        Tab("CHANGELOG", icon: "text-x-generic") { TextEdit("") }
        Tab("untitled 1", icon: "text-x-generic") { TextEdit("") }
      }
      .variant(.documentMode)
      .frame(maxHeight: .infinity)
    }
    .frame(maxWidth: .infinity, maxHeight: .infinity)
    VBoxLayout(spacing: 4) {
      DockWidget("Document") {
        FormLayout {
          FormRow("Encoding:") { ComboBox(items: ["UTF-8"], currentText: "UTF-8") }
          FormRow("Line endings:") { ComboBox(items: ["LF", "CRLF"], currentText: "LF") }
          FormRow("Tab width:") { SpinBox(value: 4) }
          FormRow("") { CheckBox("Insert spaces", checked: true) }
          FormRow("") { CheckBox("Show whitespace") }
        }
        .padding(8)
      }
      DockWidget("Outline") {
        TreeWidget {
          TreeWidgetItem("Release 4.2", expanded: true) {
            TreeWidgetItem("Highlights")
            TreeWidgetItem("New features", expanded: true) {
              TreeWidgetItem("Dark colour scheme").selected()
              TreeWidgetItem("Tabbed documents")
              TreeWidgetItem("Spell checking")
            }
            TreeWidgetItem("Fixed issues", hasChildren: true)
            TreeWidgetItem("Known issues")
          }
        }
      }
      .frame(maxHeight: .infinity)
    }
    .frame(width: 230)
  }
  StatusBar {
    Label("Saved 2 minutes ago")
    Spacer()
    Label("Ln 7, Col 41")
    Separator()
    Label("UTF-8")
    Separator()
    Label("Markdown")
  }
}
```

## Preferences

A preferences window: a `TabWidget` whose pages hold `GroupBox`es, right-aligned `FormLayout`
labels, a checkable group box, a `KeySequenceEdit` and the `DialogButtonBox` with the default
**OK** button.

```mockitdown source="true" width="640" height="560" title="Preferences"
import QtWidgets

VBoxLayout(spacing: 9) {
  TabWidget(selection: "Editor") {
    Tab("General") { Label("") }
    Tab("Editor") {
      GroupBox("Font") {
        FormLayout {
          FormRow("Family:") { FontComboBox(currentText: "DejaVu Sans Mono") }
          FormRow("Size:") { SpinBox(value: 11, suffix: " pt").frame(width: 90) }
          FormRow("Line spacing:") { DoubleSpinBox(value: 1.25).frame(width: 90) }
        }
      }
      GroupBox("Behavior") {
        FormLayout {
          FormRow("Tab policy:") { ComboBox(items: ["Spaces only", "Tabs only"], currentText: "Spaces only") }
          FormRow("Tab size:") { SpinBox(value: 4).frame(width: 90) }
          FormRow("Auto-save every:") { SpinBox(value: 5, suffix: " min").frame(width: 90) }
          FormRow("Complete shortcut:") { KeySequenceEdit(keySequence: "Ctrl+Space") }
          FormRow("") { CheckBox("Highlight current line", checked: true) }
          FormRow("") { CheckBox("Wrap long lines") }
        }
      }
      GroupBox("Spell checking", checkable: true, checked: false) {
        FormLayout {
          FormRow("Language:") { ComboBox(items: ["English (US)"], currentText: "English (US)") }
        }
      }
    }
    Tab("Appearance") { Label("") }
    Tab("Shortcuts") { Label("") }
  }
  .frame(maxHeight: .infinity)
  DialogButtonBox {
    PushButton("Restore Defaults")
    Spacer()
    PushButton("OK", default: true)
    PushButton("Cancel")
    PushButton("Apply").disabled()
  }
}
.padding(9)
```

## Data entry

An appointment form: a `CalendarWidget` (weekends in red, Highlight navigation bar) beside a
`FormLayout` with an editable `ComboBox`, `TimeEdit`, `SpinBox` with a suffix, a `DateEdit` with a
calendar popup, radio buttons in a horizontal layout and a `PlainTextEdit`.

```mockitdown width="760" height="420" title="New Appointment"
import QtWidgets

VBoxLayout(spacing: 9) {
  HBoxLayout(alignment: .top, spacing: 12) {
    VBoxLayout(spacing: 6) {
      CalendarWidget(selectedDate: "2026-11-26")
      CheckBox("Show week numbers")
    }
    .frame(width: 250)
    FormLayout {
      FormRow("Patient:") { LineEdit("Okafor, Chidi", clearButtonEnabled: true) }
      FormRow("Type:") { ComboBox(items: ["Check-up", "Follow-up"], currentText: "Follow-up", editable: true) }
      FormRow("Start:") {
        TimeEdit(time: "10:30").frame(width: 90)
        Label("Duration:")
        SpinBox(value: 45, suffix: " min").frame(width: 90)
      }
      FormRow("Remind on:") { DateEdit(date: "2026-11-25", calendarPopup: true).frame(width: 140) }
      FormRow("Room:") {
        RadioButton("A-101", checked: true)
        RadioButton("A-102")
        RadioButton("Telehealth")
      }
      FormRow("Notes:") { PlainTextEdit(plainText: "Review blood work from 11/12.", rows: 4) }
      FormRow("") { CheckBox("Send confirmation e-mail", checked: true) }
    }
    .frame(maxWidth: .infinity)
  }
  .frame(maxHeight: .infinity)
  Frame(frameShape: .hLine)
  DialogButtonBox {
    PushButton("Save", default: true)
    PushButton("Cancel")
  }
}
.padding(11)
```

## Data browser

A database browser: a filter `LineEdit`, a column `ComboBox` and a checked tool button showing its
`ToolTip` in the tool bar, a `Splitter`
with a connection `TreeWidget` (with its `HeaderView`) on the left and a sorted `TableView` with
alternating rows, row numbers and a selected row on the right.

```mockitdown width="1100" height="600" title="Chinook.sqlite — DB Browser"
import QtWidgets
import "qt/widgets"

MainWindow {
  MenuBar {
    Menu("File"); Menu("Edit"); Menu("View"); Menu("Tools"); Menu("Help")
  }
  ToolBar {
    ToolButton("Open Database", icon: "document-open", toolButtonStyle: .textBesideIcon)
    ToolButton("Write Changes", icon: "document-save", toolButtonStyle: .textBesideIcon)
    ToolButton("Revert", icon: "document-revert", toolButtonStyle: .textBesideIcon).disabled()
    Separator()
    Label("Filter:")
    LineEdit("rock", clearButtonEnabled: true).frame(width: 200)
    ComboBox(items: ["All columns", "Name", "Composer"], currentText: "Genre").frame(width: 120)
    ToolTip("Filter as you type (Ctrl+Shift+F)", placement: .bottom) {
      ToolAction(icon: "view-filter", text: "Filter", checked: true).state(.hover)
    }
  }
  Splitter {
    TreeWidget {
      HeaderView(["Name"])
      TreeWidgetItem("main", icon: "drive-harddisk", expanded: true) {
        TreeWidgetItem("Tables (11)", icon: "folder", expanded: true) {
          TreeWidgetItem("albums", icon: "x-office-spreadsheet")
          TreeWidgetItem("artists", icon: "x-office-spreadsheet")
          TreeWidgetItem("customers", icon: "x-office-spreadsheet")
          TreeWidgetItem("genres", icon: "x-office-spreadsheet")
          TreeWidgetItem("invoices", icon: "x-office-spreadsheet")
          TreeWidgetItem("tracks", icon: "x-office-spreadsheet").selected()
        }
        TreeWidgetItem("Indices (10)", icon: "folder", hasChildren: true)
        TreeWidgetItem("Views (2)", icon: "folder", hasChildren: true)
        TreeWidgetItem("Triggers (0)", icon: "folder")
      }
    }
    .frame(width: 230)
    TableView(columns: ["TrackId", "Name", "Album", "Composer", "Genre", "Milliseconds", "UnitPrice"],
              rows: [[1, "For Those About To Rock", "For Those About To Rock", "Angus Young, Malcolm Young", "Rock", 343719, "0.99"],
                     [6, "Put The Finger On You", "For Those About To Rock", "Angus Young, Malcolm Young", "Rock", 205662, "0.99"],
                     [7, "Let's Get It Up", "For Those About To Rock", "Angus Young, Malcolm Young", "Rock", 233926, "0.99"],
                     [15, "Go Down", "Let There Be Rock", "AC/DC", "Rock", 331180, "0.99"],
                     [16, "Dog Eat Dog", "Let There Be Rock", "AC/DC", "Rock", 215196, "0.99"],
                     [17, "Let There Be Rock", "Let There Be Rock", "AC/DC", "Rock", 366654, "0.99"],
                     [18, "Bad Boy Boogie", "Let There Be Rock", "AC/DC", "Rock", 267728, "0.99"],
                     [19, "Problem Child", "Let There Be Rock", "AC/DC", "Rock", 325041, "0.99"],
                     [20, "Overdose", "Let There Be Rock", "AC/DC", "Rock", 369319, "0.99"],
                     [21, "Hell Ain't A Bad Place To Be", "Let There Be Rock", "AC/DC", "Rock", 254380, "0.99"],
                     [22, "Whole Lotta Rosie", "Let There Be Rock", "AC/DC", "Rock", 323761, "0.99"],
                     [23, "Walk On Water", "Big Ones", "Steven Tyler, Joe Perry", "Rock", 295680, "0.99"],
                     [24, "Love In An Elevator", "Big Ones", "Steven Tyler, Joe Perry", "Rock", 321828, "0.99"],
                     [25, "Rag Doll", "Big Ones", "Steven Tyler, Joe Perry", "Rock", 264698, "0.99"],
                     [26, "What It Takes", "Big Ones", "Steven Tyler, Joe Perry", "Rock", 310622, "0.99"],
                     [27, "Dude (Looks Like A Lady)", "Big Ones", "Steven Tyler, Joe Perry", "Rock", 264855, "0.99"]],
              selection: [4], sortColumn: 0, alternatingRowColors: true)
      .frame(maxWidth: .infinity)
  }
  .padding(4)
  StatusBar {
    Label("1,297 of 3,503 rows match “rock”")
    Spacer()
    ProgressBar(value: 100).frame(width: 140)
    Label("SQLite 3.46")
  }
}
```

## Unsaved changes

A `MessageBox` with the standard **warning** icon, its text, the informative text and the
Save / Discard / Cancel buttons (Save is the default button). Qt dialogs are separate windows: they
do not dim their parent.

```mockitdown source="true" width="760" height="400" title="notes.txt — Text Editor"
import QtWidgets

MainWindow {
  MenuBar { Menu("File"); Menu("Edit"); Menu("View"); Menu("Help") }
  CentralWidget {
    PlainTextEdit(plainText: "Groceries\n- oat milk\n- lemons\n- basil").frame(maxHeight: .infinity)
  }
  StatusBar { Label("Modified") }
}

MessageBox("Text Editor", text: "The document has been modified.", icon: .warning,
           buttons: ["Save", "Discard", "Cancel"], primary: "Save") {
  Label("Do you want to save your changes?")
}
```

## Qt Designer

A Designer-like layout: the **Widget Box** as a `ToolBox` of categories with a filter, the form
being edited on Designer's dotted grid with a `RubberBand` selection, the **Object Inspector**
(`TreeWidget` with Object / Class columns) and the **Property Editor** — a property grid built from
the custom `PropertyClass` and `Property` components, with Designer's tinted class bands and bold
modified properties.

```mockitdown width="1200" height="700" title="Qt Widgets Designer — logindialog.ui"
import QtWidgets
import "qt/widgets"

MainWindow {
  MenuBar { Menu("File"); Menu("Edit"); Menu("Form"); Menu("View"); Menu("Settings"); Menu("Window"); Menu("Help") }
  ToolBar {
    ToolAction(icon: "document-new"); ToolAction(icon: "document-open"); ToolAction(icon: "document-save")
    Separator()
    ToolButton("Edit Widgets", icon: "pencil", toolButtonStyle: .iconOnly, checked: true)
    ToolAction(icon: "link"); ToolAction(icon: "arrow.up.arrow.down"); ToolAction(icon: "tag")
    Separator()
    ToolAction(icon: "slider.horizontal.3"); ToolAction(icon: "square.grid.2x2"); ToolAction(icon: "square.grid.3x3")
    ToolAction(icon: "list.bullet"); ToolAction(icon: "xmark.circle")
  }
  HBoxLayout(spacing: 4) {
    DockWidget("Widget Box") {
      VBoxLayout(spacing: 4) {
        LineEdit(placeholderText: "Filter", clearButtonEnabled: true)
        ToolBox {
          ToolBoxItem("Layouts", systemImage: "square.grid.2x2")
          ToolBoxItem("Buttons", systemImage: "square", expanded: true) {
            Label("Push Button", icon: "square")
            Label("Tool Button", icon: "wrench")
            Label("Radio Button", icon: "circle")
            Label("Check Box", icon: "checkmark")
            Label("Command Link Button", icon: "arrow.right")
            Label("Dialog Button Box", icon: "ellipsis")
          }
          ToolBoxItem("Item Views", systemImage: "list.bullet")
          ToolBoxItem("Containers", systemImage: "folder")
          ToolBoxItem("Input Widgets", systemImage: "pencil")
          ToolBoxItem("Display Widgets", systemImage: "eye")
        }
        Spacer()
      }
      .padding(4)
    }
    .frame(width: 210)
    CentralWidget {
      MdiArea {
        MdiSubWindow("logindialog.ui*") {
          Whiteboard(height: 300) {
            Label("**Sign in to Chinook**").position(x: 84, y: 26)
            Label("User name:").position(x: 56, y: 70)
            LineEdit("ana").frame(width: 220).position(x: 220, y: 70)
            Label("Password:").position(x: 52, y: 106)
            LineEdit("secret", echoMode: .password).frame(width: 220).position(x: 220, y: 106)
            CheckBox("Remember me", checked: true).position(x: 162, y: 140)
            PushButton("Cancel").position(x: 222, y: 262)
            PushButton("Sign In", default: true).position(x: 306, y: 262)
            RubberBand().frame(width: 180, height: 36).position(x: 264, y: 262)
          }
        }
        .frame(width: 380)
        .position(x: 222, y: 196)
      }
      .frame(maxHeight: .infinity)
    }
    .frame(maxWidth: .infinity, maxHeight: .infinity)
    VBoxLayout(spacing: 4) {
      DockWidget("Object Inspector") {
        TreeWidget {
          HeaderView(["Object", "Class"])
          TreeWidgetItem("LoginDialog") {
            Text("QDialog")
            TreeWidgetItem("buttonBox") { Text("QDialogButtonBox") }
            TreeWidgetItem("passwordEdit") { Text("QLineEdit") }
            TreeWidgetItem("rememberCheck") { Text("QCheckBox") }
            TreeWidgetItem("userEdit") { Text("QLineEdit") }
            TreeWidgetItem("signInButton") { Text("QPushButton") }.selected()
          }
        }
        .class("qt-twocol")
      }
      .frame(height: 210)
      DockWidget("Property Editor") {
        VBoxLayout(spacing: 0) {
          HBoxLayout(spacing: 4) {
            LineEdit(placeholderText: "Filter").frame(maxWidth: .infinity)
            ToolAction(icon: "plus")
            ToolAction(icon: "slider.horizontal.3")
          }
          .padding(4)
          Label("signInButton : QPushButton").padding(.horizontal, 6).padding(.bottom, 4)
          TreeWidget {
            HeaderView(["Property", "Value"])
            PropertyClass(name: "QObject", band: 1) {
              Property(name: "objectName", value: "signInButton", changed: true)
            }
            PropertyClass(name: "QWidget", band: 2) {
              Property(name: "enabled") { CheckBox(checked: true) }
              Property(name: "geometry", value: "[(258, 236), 90 x 24]", changed: true)
              Property(name: "sizePolicy", value: "[Minimum, Fixed, 0, 0]")
              Property(name: "font", value: "A  [Segoe UI, 9]")
            }
            PropertyClass(name: "QAbstractButton", band: 3) {
              Property(name: "text", value: "Sign In", changed: true)
              Property(name: "checkable") { CheckBox() }
            }
            PropertyClass(name: "QPushButton", band: 1) {
              Property(name: "default") { CheckBox(checked: true) }
              Property(name: "flat") { CheckBox() }
            }
          }
          .class("qt-twocol")
          .frame(maxHeight: .infinity)
        }
      }
      .frame(maxHeight: .infinity)
    }
    .frame(width: 300)
  }
  StatusBar { Label("") }
}
```

## Bench monitor

An instrument panel: `LCDNumber` read-outs (the custom `Readout` component, used four times),
`Dial`s with notches, a Qt Charts `ChartView` line chart and bar chart in the Qt Charts light /
dark themes, `Slider`s with tick marks and `DoubleSpinBox`es for the set points.

```mockitdown width="1100" height="720" title="Bench Monitor — PSU-3"
import QtWidgets
import "qt/widgets"

MainWindow {
  MenuBar { Menu("File"); Menu("Device"); Menu("Logging"); Menu("Help") }
  VBoxLayout(spacing: 8) {
    HBoxLayout(spacing: 8) {
      Readout(title: "Output voltage", value: "12.04", unit: "V", level: 0.6)
      Readout(title: "Output current", value: "1.872", unit: "A", level: 0.37)
      Readout(title: "Power", value: "22.54", unit: "W", level: 0.45)
      Readout(title: "Heat sink", value: "41.7", unit: "°C", level: 0.42, segmentStyle: "outline")
    }
    HBoxLayout(alignment: .top, spacing: 8) {
      ChartView(kind: .line, title: "Voltage and current (last 60 s)",
                series: [("Voltage (V)", [11.8, 12.1, 12.0, 12.2, 11.9, 12.0, 12.1, 12.04, 12.0, 12.1]),
                         ("Current ×10 (A)", [17.5, 18.2, 18.9, 18.4, 19.6, 18.8, 18.1, 18.7, 19.2, 18.72])],
                labels: ["-60", "-54", "-48", "-42", "-36", "-30", "-24", "-18", "-12", "-6"],
                chartWidth: 700, chartHeight: 210)
        .frame(maxWidth: .infinity)
      GroupBox("Set points") {
        HBoxLayout(spacing: 16) {
          VBoxLayout(spacing: 2) { Dial(value: 60, maximum: 100, notchesVisible: true); Label("Voltage") }
          VBoxLayout(spacing: 2) { Dial(value: 37, maximum: 100, notchesVisible: true); Label("Current limit") }
        }
        FormLayout {
          FormRow("Voltage:") { DoubleSpinBox(value: "12.00", suffix: " V") }
          FormRow("Current limit:") { DoubleSpinBox(value: "2.000", suffix: " A") }
          FormRow("Ramp:") { Slider(value: 30, maximum: 100, tickPosition: .ticksBelow, tickInterval: 10) }
        }
        HBoxLayout {
          PushButton("Output On", checked: true)
          PushButton("Apply", default: true)
        }
      }
      .frame(width: 300)
    }
    HBoxLayout(alignment: .top, spacing: 8) {
      ChartView(kind: .bar, title: "Energy per channel (Wh, today)",
                series: [("CH1", [4.2, 5.1, 3.8, 6.0]), ("CH2", [2.1, 2.8, 3.3, 2.5])],
                labels: ["06:00", "10:00", "14:00", "18:00"], chartWidth: 900, chartHeight: 150)
        .frame(maxWidth: .infinity)
      GroupBox("Protection") {
        CheckBox("Over-voltage (OVP) at 13.2 V", checked: true)
        CheckBox("Over-current (OCP)", checked: true)
        CheckBox("Over-temperature (OTP)", checked: .indeterminate)
        ProgressBar(value: 42)
        Label("Fan duty")
      }
      .frame(width: 300)
    }
  }
  .padding(8)
  .frame(maxHeight: .infinity)
  StatusBar {
    Label("Connected to PSU-3 on COM4 (115200 8N1)")
    Spacer()
    Label("Logging: bench-2026-11-24.csv")
  }
}
```

## Walkthrough: exporting a table

Qt's own (non-native) `FileDialog`, shown here as its own window. Pick the folder in the
**Look in** combo box (#1) or the places side bar (#2), select an existing file in the detail view
(#3) to reuse its name, type the **File name** (#4) and choose the format in **Files of type** (#5).
**Save** (#6) is the default button, so Enter confirms.

```mockitdown source="true" width="760" height="420" chrome="none" title="QFileDialog"
import QtWidgets
import "qt/widgets"

FileDialog("Export Table as CSV", inline: true) {
  HBoxLayout(spacing: 4) {
    Label("Look in:")
    ComboBox(items: ["/home/brian/Documents/exports"], currentText: "/home/brian/Documents/exports")
      .frame(maxWidth: .infinity)
      .callout(1, alignment: .top)
    ToolAction(icon: "go-previous"); ToolAction(icon: "go-next"); ToolAction(icon: "go-up")
    ToolAction(icon: "folder-new"); ToolAction(icon: "view-list-icons")
    ToolAction(icon: "view-list-details", checked: true)
  }
  Splitter {
    FileDialogSidebar(selection: "Documents")
      .frame(width: 130)
      .callout(2, alignment: .bottomLeading)
    TreeWidget {
      HeaderView(["Name", "Size", "Type", "Date Modified"])
      TreeWidgetItem("archive", icon: "folder") { Text(""); Text("Folder"); Text("11/02/26") }
      TreeWidgetItem("albums.csv", icon: "text-x-generic") { Text("21 KB"); Text("csv File"); Text("11/20/26") }
      TreeWidgetItem("tracks.csv", icon: "text-x-generic") { Text("312 KB"); Text("csv File"); Text("11/23/26") }
        .selected()
      TreeWidgetItem("invoices.csv", icon: "text-x-generic") { Text("88 KB"); Text("csv File"); Text("11/24/26") }
    }
    .frame(maxWidth: .infinity)
    .callout(3, "Detail view", alignment: .center)
  }
  .frame(maxHeight: .infinity)
  GridLayout(columns: [GridItem(.fixed(84)), GridItem(.flexible()), GridItem(.fixed(84))], spacing: 6) {
    Label("File name:")
    LineEdit("tracks.csv").state(.focused).callout(4, alignment: .trailing)
    PushButton("Save", default: true).callout(6, alignment: .topTrailing)
    Label("Files of type:")
    ComboBox(items: ["CSV (*.csv *.tsv)"], currentText: "CSV (*.csv *.tsv)").callout(5, alignment: .trailing)
    PushButton("Cancel")
  }
}
```

## Custom components

The page imports `qt/widgets` from `docs/mockups/qt/widgets.mockitdown`. It defines `ToolAction`
(an icon-only tool-bar button), `Property` and `PropertyClass` (Designer's property grid),
`Readout` (an LCD instrument) and `FileDialogSidebar` (the places list of `QFileDialog`):

```swift
struct Readout: View {
  var title: String
  var value: String
  var unit: String
  var level: Double = 0.5
  var segmentStyle: String = "filled"

  var body: some View {
    GroupBox(title) {
      HBoxLayout(spacing: 6) {
        LCDNumber(value, segmentStyle: segmentStyle).frame(maxWidth: .infinity)
        Label(unit).frame(width: 34)
      }
      ProgressBar(value: level * 100, textVisible: false)
    }
  }
}
```
