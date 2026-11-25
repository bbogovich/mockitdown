# CDE (Solaris)

The **cde** pack imitates the **Common Desktop Environment 1.x** as Sun shipped it on **Solaris 2.6
to 9** (late 1990s): Motif widgets with thick two-pixel bevels (light top-left, dark bottom-right
shadows), the **dtwm** window frame — a resize border with grooves marking the corner handles, the
window-menu button on the left of the raised title bar and the minimise and maximise buttons on the
right — and the **Front Panel** along the bottom of the screen, with the clock, calendar, File Manager,
Text Editor and mail controls on the left, the four workspace buttons (One, Two, Three, Four) in the
middle and printer, Style Manager, Application Manager, Help and Trash on the right.

Colours follow the Solaris default palette: a slate blue-grey `#AEB2C3` for window backgrounds with
`#E2E4EC` / `#626578` bevel shadows, `#9397A5` as the select colour (armed buttons, set toggles,
selected list items, scale troughs), a lighter `#C6CAD6` behind text and lists, the maroon `#B24D7A`
frame of the active window and a teal backdrop. The dark appearance switches to CDE's **Charcoal**
palette with its teal `#87B4B0` active frame. Text uses `Helvetica`, `"Lucida Sans"`, Arial.

Select it with `import CDE` (also `Motif`, `Solaris`) or `pack="cde"`. Elements use the Motif class
names — `XmMainWindow`, `XmMenuBar`, `XmCascadeButton`, `XmPulldownMenu`, `XmPushButton`
(`.showAsDefault()`), `XmToggleButton` (square), `XmRadioButton` / `XmRadioBox` (diamond),
`XmTextField`, `XmScrolledText`, `XmScale`, `XmScrollBar`, `XmList` / `XmScrolledList`, `XmOptionMenu`,
`XmComboBox`, `XmFrame`, `XmSeparator`, `XmErrorDialog`, `XmWarningDialog`, `XmQuestionDialog` — and
CDE's own `DtWindow`, `Workspace`, `FrontPanel`, `FrontPanelControl`, `WorkspaceSwitch`,
`WorkspaceButton`, `DtIcon`, `DtIconGrid`, `DtIconButton`, `DtSpinBox`, `DtComboBox` and `DtTerm`. Icons
accept CDE action names such as `"Dtfile"`, `"Dtpad"`, `"Dtmail"`, `"Dtcm"` and `"Dtprint"`. The
`StandardFrontPanel`, `MainWindow` and `SettingRow` components live in `mockups/cde/desktop.mockitdown`.

## The desktop

Two windows on the workspace backdrop and the Front Panel below them. The callouts mark the dtwm
window-menu button (#1), the minimise and maximise buttons (#2), a corner resize handle (#3), the
workspace switch with the current workspace pressed in (#4) and a subpanel arrow above a Front Panel
control (#5).

```mockitdown source="true" chrome="none" title="CDE desktop" width="1152" height="820"
import CDE
import "cde/desktop"

Workspace {
  VStack {
    DtWindow("File Manager - /export/home/dana") {
      MainWindow(menus: ["File", "Selected", "View", "Help"], status: "9 Items 2 Hidden") {
        XmLabel("/export/home/dana").padding(6)
        DtIconGrid {
          DtIcon("..", icon: "folder")
          DtIcon("Mail", icon: "folder")
          DtIcon("projects", icon: "folder")
          DtIcon("budget.txt", icon: "doc").selected()
          DtIcon("notes.txt", icon: "doc")
          DtIcon("report.ps", icon: "printer")
          DtIcon("build.sh", icon: "app")
          DtIcon("plan.cal", icon: "calendar")
        }
        .frame(maxHeight: .infinity)
      }
    }
    .variant(.inactive)
    .frame(width: 520, height: 400)
  }
  .padding(.leading, 40)
  .padding(.top, 30)

  VStack {
    DtWindow("Terminal") {
      MainWindow(menus: ["Window", "Edit", "Options", "Help"]) {
        DtTerm("""
        $ uname -a
        SunOS kestrel 5.8 Generic_108528-13 sun4u sparc SUNW,Ultra-5_10
        $ cd projects/survey
        $ ls
        Makefile   README     data/      survey.c   survey.h
        $ make
        cc -O -c survey.c
        cc -o survey survey.o -lm
        $
        """)
        .frame(maxHeight: .infinity)
      }
    }
    .frame(width: 560, height: 330)
    .callout(1, alignment: .topLeading)
    .callout(2, alignment: .topTrailing)
    .callout(3, alignment: .bottomTrailing)
  }
  .padding(.leading, 500)
  .padding(.top, 200)

  StandardFrontPanel(workspace: "One")
    .callout(4, alignment: .top)
    .callout(5, alignment: .topTrailing)
}
```

## Text Editor

`dtpad` with its **Edit** menu pulled down: armed items get a raised bevel, mnemonics are underlined and
accelerators sit on the right. The work area is an `XmScrolledText`; the status line shows the
cursor position.

```mockitdown source="true" chrome="window" title="Text Editor - notes.txt" width="820" height="560" appearance="both"
import CDE

XmMainWindow {
  XmMenuBar {
    XmCascadeButton("File")
    XmPulldownMenu("Edit", open: true) {
      XmMenuItem("Undo", shortcut: "Ctrl+Z")
      XmSeparator()
      XmMenuItem("Cut", shortcut: "Ctrl+X")
      XmMenuItem("Copy", shortcut: "Ctrl+C").selected()
      XmMenuItem("Paste", shortcut: "Ctrl+V")
      XmMenuItem("Clear").disabled()
      XmMenuItem("Delete")
      XmSeparator()
      XmMenuItem("Select All", shortcut: "Ctrl+/")
      XmMenuItem("Find/Change...", shortcut: "Ctrl+F")
      XmMenuItem("Check Spelling...")
    }
    XmCascadeButton("Format")
    XmCascadeButton("Options")
    Spacer()
    XmCascadeButton("Help")
  }
  XmScrolledText(text: "Survey follow-up, week 47\n\n- Re-run the regional summaries on kestrel\n- Mail the plots to the field office before Friday\n- Ask facilities about the second Ultra 10\n- Back up /export/home before the patch window\n\nOpen questions:\n  Do we keep the old SPARCstation for printing?", rows: 14)
    .padding(6)
    .frame(maxHeight: .infinity)
  StatusLine {
    XmLabel("Line: 3")
    XmLabel("Total: 9").padding(.leading, 16)
    Spacer()
    XmLabel("INS")
  }
}
```

## A settings dialog with every control

An invented Style Manager-like dialog: `XmFrame` groups holding an `XmRadioBox` (diamonds),
`XmToggleButton`s (squares), `XmScale`s with their values, an `XmOptionMenu` with its small raised bar
indicator, a `DtComboBox`, a `DtSpinBox`, an `XmTextField` with keyboard focus, an `XmScrolledList`, a
colour palette and the dialog's push buttons with the default ring around **OK**.

```mockitdown source="true" chrome="window" title="Style Manager - Mouse and Screen" width="900" height="660"
import CDE
import "cde/desktop"

XmForm {
  HStack(spacing: 8) {
    DtIconButton("Color", icon: "Dtcolor")
    DtIconButton("Font", icon: "Dtfont")
    DtIconButton("Backdrop", icon: "Dtbackdrop")
    DtIconButton("Keyboard", icon: "Dtkeyboard")
    DtIconButton("Mouse", icon: "Dtmouse").selected()
    DtIconButton("Beep", icon: "Dtbeep")
    DtIconButton("Screen", icon: "Dtscreen")
    DtIconButton("Window", icon: "Dtwindow")
    DtIconButton("Startup", icon: "Dtstartup")
  }
  HStack(alignment: .top, spacing: 14) {
    VStack(alignment: .stretch, spacing: 10) {
      XmFrame("Mouse") {
        XmRadioBox("Handedness", items: ["Right-handed", "Left-handed"], selection: "Right-handed", orientation: .horizontal)
        XmToggleButton("Button 2 for: Adjust", checked: true)
        XmToggleButton("Button 2 for: Transfer")
        XmScale("Double-click (sec)", value: 0.5, in: 0...1)
        XmScale("Acceleration", value: 4, in: 1...10)
      }
      XmFrame("Screen saver") {
        SettingRow(label: "Saver:") {
          XmOptionMenu(items: ["Blank screen", "Swarm", "Pyro", "Flame"], selection: "Swarm").frame(width: 170)
        }
        SettingRow(label: "Start after:") {
          DtSpinBox(value: "10 min")
        }
        SettingRow(label: "Lock message:") {
          XmTextField(text: "Back at 3pm").state(.focused).frame(width: 170)
        }
      }
    }
    .frame(maxWidth: .infinity)
    VStack(alignment: .stretch, spacing: 10) {
      XmFrame("Palette") {
        XmScrolledList {
          XmListItem("Alpine")
          XmListItem("Charcoal")
          XmListItem("Crimson")
          XmListItem("Default").selected()
          XmListItem("Desert")
          XmListItem("Lilac")
          XmListItem("SouthWest")
        }
        .frame(height: 150)
        ColorSwatches(colors: ["#b24d7a", "#aeb2c3", "#9397a5", "#c6cad6", "#4992a7", "#c6b2a8", "#7e95b8", "#b7878d"], selection: 0)
      }
      XmFrame("Window focus") {
        DtComboBox(items: ["Click In Window", "Point In Window"], selection: "Click In Window")
        XmToggleButton("Raise window when made active", checked: true)
        XmToggleButton("Allow primary windows on top").disabled()
      }
    }
    .frame(width: 330)
  }
  Spacer()
  XmSeparator()
  HStack(spacing: 18) {
    Spacer()
    XmPushButton("OK").showAsDefault()
    XmPushButton("Apply")
    XmPushButton("Cancel")
    XmPushButton("Help")
    Spacer()
  }
}
.padding(12)
```

## Error dialog

An `XmErrorDialog` raised by the File Manager: the dialog has its own dtwm frame (window menu and
title only), the error symbol beside the message, a separator and the action area below.

```mockitdown source="true" chrome="window" title="File Manager - /export/home/dana" width="760" height="460" appearance="both"
import CDE
import "cde/desktop"

MainWindow(menus: ["File", "Selected", "View", "Help"], status: "Copying 1 item") {
  DtIconGrid {
    DtIcon("..", icon: "folder")
    DtIcon("Mail", icon: "folder")
    DtIcon("report.ps", icon: "printer").selected()
    DtIcon("notes.txt", icon: "doc")
  }
  .frame(maxHeight: .infinity)
}

XmErrorDialog("File Manager - Copy Error",
              message: "Unable to copy \"report.ps\" to /net/fileserv/shared:\nPermission denied.",
              buttons: ["OK", "Help"], primary: "OK")
```
