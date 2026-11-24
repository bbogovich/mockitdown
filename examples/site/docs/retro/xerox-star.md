# Xerox Star

The **xerox-star** pack imitates the **Xerox 8010 Information System — "Star"** (1981), the first
commercial computer sold with a graphical user interface. Its 1-bit, black-on-white bitmapped screen
shows a light grey stippled **desktop** with white **pictogram icons** (documents, folders, printers,
in- and out-baskets, file drawers) named in a box below each picture. Opened icons become **windows**
whose black header strip carries the name on the left and command buttons such as `Close` or
`Show Properties` on the right. There are no application menus: the system is document-centric, and
the **universal commands** — Move, Copy, Delete, Show Properties (PROPS), Again, Undo, Help — are keys
on the keyboard that act on whatever is selected. **Property sheets** are forms with boxed text fields
and rows of choice boxes in which the chosen value is shown in reverse video. Text uses the stack
`Helvetica`, Arial, sans-serif; document pages use a serif.

Select it with `import XeroxStar` (also `Star8010`, `Xerox`) or `pack="xerox-star"`. Elements:
`Desktop`, `IconRow`/`IconColumn`, `DesktopIcon` (pictograms named `"Document"`, `"Folder"`,
`"Printer"`, `"InBasket"`, `"OutBasket"`, `"FileDrawer"`, `"Directory"`, `"Calculator"`, …),
`StarWindow` with `WindowCommand`s, `PropertySheet`/`OptionSheet`, `PropertyField`, `FieldBox`,
`ChoiceButtons`, `ChoiceButton`, `OnOffBox`, `CommandKeys`, `MessageLine`, `DocumentPage`, `Heading`,
`Paragraph`, `Frame`, `FolderList`/`FolderEntry`, `ScrollBar`, `PopUpMenu` and `Confirmation`. The
dark appearance inverts the 1-bit screen (white on black). `CommandWindow`, `ChoiceProperty` and
`TextProperty` come from `mockups/xerox-star/star.mockitdown`.

## The desktop

The Star desktop with its icons, one icon selected, and two opened windows. The callouts mark a
pictogram icon (#1), the selection shown in reverse video (#2), a window header with its name (#3) and
its commands (#4), and the message line where Star prompts the user (#5).

```mockitdown source="true" chrome="none" title="Star desktop"
import XeroxStar
import "xerox-star/star"

VStack(alignment: .stretch, spacing: 0) {
  MessageLine {
    Text("Select destination for MOVE, or press STOP.")
  }
  .callout(5, alignment: .trailing, inset: true)
  Desktop {
    VStack(alignment: .leading, spacing: 0) {
      IconRow {
        DesktopIcon("In", icon: "InBasket").callout(1, alignment: .topLeading)
        DesktopIcon("Out", icon: "OutBasket")
        DesktopIcon("Printer 2", icon: "Printer")
        DesktopIcon("Sales Files", icon: "FileDrawer")
        DesktopIcon("Directory", icon: "Directory")
      }
      IconRow {
        DesktopIcon("Q3 Report", icon: "Document").selected().callout(2, alignment: .bottomTrailing)
        DesktopIcon("Memos", icon: "Folder")
        DesktopIcon("Price List", icon: "Record")
        DesktopIcon("Calculator", icon: "Calculator")
      }
      .padding(.top, 18)
    }
    .padding(18)

    VStack {
      CommandWindow(title: "Memos", commands: ["Show Properties", "Close"]) {
        FolderList {
          FolderEntry("Budget meeting", icon: "Document", detail: "12-Mar-81")
          FolderEntry("Travel policy", icon: "Document", detail: "2-Mar-81").selected()
          FolderEntry("Office move", icon: "Document", detail: "18-Feb-81")
          FolderEntry("Old memos", icon: "Folder", detail: "4 items")
        }
        Spacer()
      }
      .frame(width: 340, height: 190)
      .callout(3, alignment: .topLeading)
    }
    .padding(.leading, 560)
    .padding(.top, 60)

    VStack {
      CommandWindow(title: "Q3 Report", commands: ["Show Properties", "Close"]) {
        HStack(alignment: .top, spacing: 0) {
          DocumentPage {
            Heading("Third Quarter Report")
            Paragraph("Orders rose eleven per cent over the second quarter. The western region led for the first time.")
          }
          .frame(maxWidth: .infinity)
          ScrollBar(value: 0)
        }
        .frame(maxHeight: .infinity)
      }
      .frame(width: 520, height: 250)
      .callout(4, alignment: .topTrailing)
    }
    .padding(.leading, 300)
    .padding(.top, 300)
  }
}
```

## A document window

Documents are what-you-see-is-what-you-get pages. This window holds a heading, paragraphs, a table and
a bar chart in an anchored `Frame`, with the scroll bar's arrow and page boxes on the right. Below the
window is the strip of universal-command keys (`CommandKeys`) that replace application menus.

```mockitdown source="true" chrome="window" title="Q3 Report" width="900" height="700" appearance="both"
import XeroxStar

VStack(alignment: .stretch, spacing: 0) {
  HStack(alignment: .top, spacing: 0) {
    DocumentPage {
      Heading("Third Quarter Report")
      Paragraph("Orders rose eleven per cent over the second quarter, and for the first time the western region led the company in new accounts. The figures below are in thousands of dollars.")
      Table(columns: ["Region", "Q1", "Q2", "Q3"], rows: [
        ["East", "412", "398", "431"],
        ["Central", "305", "322", "340"],
        ["West", "288", "351", "462"]
      ])
      Frame("Graphics frame: Orders by region") {
        BarChart(values: [[412, 305, 288], [398, 322, 351], [431, 340, 462]],
                 labels: ["East", "Central", "West"], seriesNames: ["Q1", "Q2", "Q3"], height: 170)
      }
      Paragraph("Copies of this report are in the Sales Files drawer.")
    }
    .frame(maxWidth: .infinity)
    ScrollBar(value: 0)
  }
  .frame(maxHeight: .infinity)
  HStack {
    Spacer()
    CommandKeys()
    Spacer()
  }
  .padding(8)
  .border(.black)
}
```

## A property sheet

Selecting a paragraph and pressing PROPS opens its property sheet. `ChoiceButtons` show every value
with the chosen one reversed; `FieldBox` holds typed values; `OnOffBox` is a boolean property; the
header carries the sheet's `Done`, `Cancel` and `Defaults` commands.

```mockitdown source="true" chrome="none" title="Paragraph properties" width="900" height="560"
import XeroxStar
import "xerox-star/star"

Desktop {
  VStack {
    PropertySheet("Paragraph Properties") {
      ChoiceProperty(label: "Alignment", items: ["Flush Left", "Centered", "Flush Right", "Justified"], selection: "Justified")
      ChoiceProperty(label: "Line height", items: ["Single", "1 1/2", "Double", "Triple"], selection: "Single")
      TextProperty(label: "Space before", value: "6", unit: "points")
      TextProperty(label: "Space after", value: "12", unit: "points")
      TextProperty(label: "Left margin", value: "1.0", unit: "inches")
      PropertyField("Keep") {
        OnOffBox("With next paragraph", checked: true)
        OnOffBox("On same page")
      }
      PropertyField("Tab stops") {
        FieldBox("1.5, 3.0, 4.5").state(.focused).frame(width: 200)
      }
      ChoiceProperty(label: "Language", items: ["English", "French", "German"], selection: "English")
    } headerAction: {
      WindowCommand("Done")
      WindowCommand("Cancel")
      WindowCommand("Defaults")
    }
    .frame(width: 620)
  }
  .padding(.leading, 130)
  .padding(.top, 60)
}
```

## Folder contents and a pop-up menu

An opened folder lists its contents with their pictograms and dates. Some icons offer a few extra
commands from a pop-up menu in the window header.

```mockitdown chrome="window" title="Sales Files" width="760" height="420"
import XeroxStar

HStack(alignment: .top, spacing: 0) {
  VStack(alignment: .stretch, spacing: 0) {
    HStack {
      Text("Drawer \"Sales Files\" — 6 objects").font(.headline)
      Spacer()
      PopUpMenu("Drawer", open: true) {
        MenuCommand("Show References")
        MenuCommand("Sort by Date").selected()
        MenuCommand("Sort by Name")
        MenuCommand("Expunge").disabled()
      }
    }
    .padding(8)
    FolderList {
      FolderEntry("1981 Forecast", icon: "Document", detail: "Jones · 3-Jan-81")
      FolderEntry("Customer List", icon: "Record", detail: "Lee · 9-Feb-81")
      FolderEntry("Q1 Report", icon: "Document", detail: "Jones · 4-Apr-81")
      FolderEntry("Q2 Report", icon: "Document", detail: "Jones · 6-Jul-81").selected()
      FolderEntry("Regional Charts", icon: "Graphics", detail: "Ortiz · 7-Jul-81")
      FolderEntry("Archive", icon: "Folder", detail: "24 objects")
    }
    Spacer()
  }
  .frame(maxWidth: .infinity, maxHeight: .infinity)
  ScrollBar(value: 0)
}
.frame(maxHeight: .infinity)
```

## A confirmation

Star asks before an irreversible command. The `Confirmation` box appears over the window, and the
message line repeats the prompt.

```mockitdown source="true" chrome="none" title="Confirm delete" width="760" height="420" appearance="both"
import XeroxStar
import "xerox-star/star"

VStack(alignment: .stretch, spacing: 0) {
  MessageLine {
    Text("DELETE: 3 objects selected. Confirm or press STOP.")
  }
  Desktop {
    VStack(alignment: .leading, spacing: 12) {
      IconRow {
        DesktopIcon("Q1 Report", icon: "Document").selected()
        DesktopIcon("Q2 Report", icon: "Document").selected()
        DesktopIcon("Old memos", icon: "Folder").selected()
        DesktopIcon("Printer 2", icon: "Printer")
      }
    }
    .padding(20)
  }
}

Confirmation("Delete", message: "Delete the 3 selected objects? Deleted objects cannot be retrieved.",
             icon: "exclamationmark.triangle", buttons: ["Cancel", "Confirm"], primary: "Confirm")
```
