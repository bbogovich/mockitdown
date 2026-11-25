# Starship console

Still here? Then you are the kind of developer who reads the changelog, the footnotes and the
licence file — and that deserves a second reward.

**lcars** is the other pack that no listing mentions: an original homage to the look of *a famous
starship computer interface*. Black ground, thick colour bars that bend with a large radius into a
side bar, pill buttons with right-aligned labels and numeric codes, solid pastel blocks, condensed
uppercase type and big numeric readouts. Nothing here reproduces a real screen; every label,
number and name is invented. Select it with `import LCARS` (also `Console`, `StarshipConsole`) or
`pack="lcars"` on the fence. The dark appearance is the canonical one; the light appearance is the
same console on a warm grey day-shift ground.

The elbows *are* the chrome. `ConsoleFrame` (alias `Frame`) is the elbow container: its title sits
in the top bar, `code:` adds a numbered block beside it, `bars:` adds coloured segments to the top
bar, `sidebar:` holds a column of `SidebarButton`s and `footer:` fills the bottom bar. The other
elements are console idioms mapped onto the core roles: `Panel`, `Elbow`, `Bar`, `Pill` /
`ConsoleButton` / `Button` (variants `.pill`, `.leading`, `.trailing`, `.block`), `Readout`,
`DataGrid` / `SensorTable`, `Meter` / `SegmentedBar` / `Gauge`, `Alert`, `RedAlert`, `StatusLight`,
`SensorSweep` / `SensorGrid`, `ConsoleLog`, `ConsoleTabs`, `Header`, `Caption` and `Cascade`. Every
coloured element takes `.color(…)` with the palette names `.orange`, `.peach`, `.lavender`,
`.periwinkle`, `.tan`, `.gold`, `.blue` and `.red`.

The reusable pieces below (`ConsoleSidebar`, `SystemRow`, `DeckPanel`, `ConsoleFooter`) live in
`mockups/lcars/console.mockitdown` and are imported with `import "lcars/console"`.

## Main operations console

The primary console: the elbow frame with its numbered side bar, three readouts, meters, a block of
running numbers and a row of pill buttons.

```mockitdown pack="lcars" appearance="both" height="560" title="Operations" source="true"
import "lcars/console"

ConsoleFrame("OPERATIONS", subtitle: "MAIN CONSOLE", code: "07-3341", sidebar: {
  ConsoleSidebar(lit: "POWER")
}, bars: {
  Bar().color(.tan).frame(width: 90)
  Bar().color(.lavender).frame(width: 36)
}) {
  HStack(spacing: 18) {
    Readout("CORE TEMP", value: "2417", change: "+0.4", unit: "KELVIN")
    Readout("BUS LOAD", value: "81.6", change: "-1.2", unit: "PERCENT").color(.periwinkle)
    Readout("FLOW RATE", value: "0392").color(.tan)
    Readout("CYCLE", value: "14:07").color(.peach)
  }
  HStack(alignment: .top, spacing: 24) {
    VStack(alignment: .stretch, spacing: 12) {
      Meter("FIELD HARMONICS", value: 0.72, showValue: true)
      Meter("COOLANT RESERVE", value: 0.46, showValue: true).color(.orange)
      Meter("BUFFER INTEGRITY", value: 0.93, showValue: true).color(.tan)
      HStack(spacing: 6) {
        Pill("ENGAGE", code: "22").color(.orange)
        Pill("HOLD", code: "23")
        Pill("RESET", code: "24", variant: .trailing).color(.lavender)
        Spacer()
        Toggle("DAMPERS", isOn: true)
      }
    }
    .frame(maxWidth: .infinity)
    VStack(alignment: .leading, spacing: 8) {
      Caption("SUBSYSTEM 4417 · RELAY MATRIX")
      Cascade("0815 2291 30 4417 562\n7730 0042 19 8851 004\n3318 6620 77 1209 935\n9902 4471 05 6634 210\n1186 3009 52 7740 618")
      HStack(spacing: 6) {
        StatusLight("NOMINAL").color(.blue)
        StatusLight("SYNC").color(.lavender)
        StatusLight("AUX OFF").color(.dim)
      }
    }
    .frame(width: 300)
  }
} footer: {
  ConsoleFooter(code: "DECK 07 · SECTION 22")
}
```

## Environmental systems

A status grid in a lavender frame: six deck panels built from the `DeckPanel` component (each a
`Panel` of three `SystemRow`s), and the atmospheric mix ledger as a spreadsheet.

```mockitdown pack="lcars" height="760" title="Environmental"
import "lcars/console"

ConsoleFrame("ENVIRONMENTAL", code: "04-2210", sidebar: {
  ConsoleSidebar(lit: "ENVIRON")
}) {
  Grid(columns: 3, spacing: 14) {
    DeckPanel(deck: "DECK 03", code: "OK", o2: 94, temp: 61, power: 78)
    DeckPanel(deck: "DECK 04", code: "OK", o2: 92, temp: 58, power: 81, tint: "periwinkle")
    DeckPanel(deck: "DECK 05", code: "OK", o2: 95, temp: 63, power: 74)
    DeckPanel(deck: "DECK 06", code: "OK", o2: 91, temp: 60, power: 69, tint: "periwinkle")
    DeckPanel(deck: "DECK 07", code: "VENT", o2: 38, temp: 88, power: 41, tint: "red")
    DeckPanel(deck: "DECK 08", code: "OK", o2: 93, temp: 59, power: 77)
  }
  Spreadsheet(columns: ["DECK", "N2", "O2", "AR", "CO2", "TOTAL"], rows: [
    ["03", 78.1, 20.9, 0.93, 0.04, "=SUM(B2:E2)"],
    ["04", 78.0, 20.8, 0.93, 0.05, "=SUM(B3:E3)"],
    ["05", 78.1, 20.9, 0.92, 0.04, "=SUM(B4:E4)"],
    ["07", 79.9, 18.2, 0.95, 0.31, "=SUM(B5:E5)"]
  ], selection: "C2:C5", active: "C5", formula: "=AVERAGE(C2:C4)-C5", sheets: ["MIX", "FILTERS", "SCRUBBERS"])
} footer: {
  ConsoleFooter(code: "LIFE SUPPORT · LOOP B")
}
.color(.lavender)
```

## Sensor sweep

The sensor display: a `SensorSweep` with three contacts, two charts in the palette's solid blocks,
range readouts and a contact timeline.

```mockitdown pack="lcars" appearance="both" height="700" title="Sensor grid"
import "lcars/console"

ConsoleFrame("SENSOR GRID", code: "03-1182", sidebar: {
  ConsoleSidebar(lit: "SENSORS")
}, bars: {
  Bar().color(.periwinkle).frame(width: 60)
}) {
  HStack(alignment: .top, spacing: 20) {
    VStack(alignment: .stretch, spacing: 10) {
      SensorSweep(pins: [(28, 38, "CONTACT 1"), (70, 26, "CONTACT 2"), (58, 72, "BEACON 9")], route: true)
        .frame(height: 330)
      HStack(spacing: 14) {
        Readout("RANGE", value: "41.07", unit: "KM").color(.orange)
        Readout("BEARING", value: "117").color(.periwinkle)
        Readout("CLOSURE", value: "-0.8").color(.peach)
      }
    }
    .frame(maxWidth: .infinity)
    VStack(alignment: .stretch, spacing: 12) {
      BarChart(values: [42, 71, 55, 90, 63, 34, 48], labels: ["S1", "S2", "S3", "S4", "S5", "S6", "S7"],
               title: "RETURN STRENGTH")
      LineChart(series: [[3, 5, 4, 7, 6, 8, 7], [2, 3, 5, 4, 6, 5, 6]], labels: ["-6", "-5", "-4", "-3", "-2", "-1", "0"],
                seriesNames: ["CONTACT 1", "CONTACT 2"], title: "SIGNAL HISTORY")
      Timeline {
        TimelineItem("CONTACT 2 ACQUIRED", time: "14:02:16", status: .warning)
        TimelineItem("BEACON 9 HANDSHAKE", time: "13:58:40", status: .done)
        TimelineItem("SWEEP CYCLE 0218", time: "13:55:00")
      }
    }
    .frame(width: 380)
  }
} footer: {
  ConsoleFooter(code: "LONG RANGE · ARRAY 2")
}
```

## Personnel roster

The crew roster as a `DataGrid` of coloured number rows (the selected row lit gold), the duty
schedule beside it, and pill tabs for the shifts. Every name is invented.

```mockitdown pack="lcars" height="520" title="Personnel"
import "lcars/console"

ConsoleFrame("PERSONNEL", code: "06-7720", sidebar: {
  ConsoleSidebar(lit: "PERSONNEL")
}) {
  ConsoleTabs(["ALPHA SHIFT", "BETA SHIFT", "GAMMA SHIFT"], selection: "BETA SHIFT")
  HStack(alignment: .top, spacing: 20) {
    DataGrid(columns: ["NAME", "RANK", "SECTION", "DECK", "ID"], rows: [
      ["HOLLIS ARDEN", "CMDR", "OPERATIONS", "01", "1022-77"],
      ["PRIYA OKONKWO", "LT", "ENVIRONMENTAL", "04", "3381-09"],
      ["DACE MOREAU", "LT", "SENSORS", "03", "4417-12"],
      ["ILSE TAVRIN", "ENS", "POWER", "07", "5520-41"],
      ["JUNO ACHTERBERG", "CPO", "LIFE SUPPORT", "05", "6603-58"],
      ["SEFA LINDQVIST", "ENS", "SENSORS", "03", "7194-26"],
      ["RAMIL OSEI", "LT", "LOGISTICS", "08", "8240-63"]
    ], selectedRows: [2], title: "ROSTER")
    .frame(maxWidth: .infinity)
    Schedule(days: ["ALPHA", "BETA", "GAMMA"], startHour: 6, endHour: 14, today: "BETA", now: 9.5, events: [
      ("SENSOR CAL", "ALPHA", 6, 9), ("DRILL", "ALPHA", 10, 12),
      ("BRIEFING", "BETA", 7, 8.5), ("REFIT DECK 7", "BETA", 9, 13),
      ("SCRUBBERS", "GAMMA", 6.5, 10), ("ARRAY TEST", "GAMMA", 11, 13.5)
    ])
    .frame(width: 320)
  }
} footer: {
  ConsoleFooter(code: "ROSTER REV 0219")
}
```

## Red alert

The same console in its alarm state: the frame turns red, the striped banner takes the top of the
content area and the alert banners list what tripped it.

```mockitdown pack="lcars" appearance="both" height="480" title="Red alert"
import "lcars/console"

ConsoleFrame("ALERT STATUS", code: "00-0001", sidebar: {
  SidebarButton("ACKNOWL", code: "01-0001").color(.red).selected()
  SidebarButton("SEAL DECK", code: "01-0002").color(.red)
  SidebarButton("VENT", code: "01-0003").color(.red)
  SidebarButton("SILENCE", code: "01-0004").color(.red)
}) {
  RedAlert("CONDITION RED", message: "ALL DECKS · ALL SECTIONS")
  HStack(alignment: .top, spacing: 20) {
    VStack(alignment: .stretch, spacing: 10) {
      Alert("HULL STRESS", message: "FRAME 112 EXCEEDS TOLERANCE BY 14 PERCENT")
      Alert("PRESSURE LOSS", message: "DECK 07 SECTION 22 SEALED AUTOMATICALLY")
      Alert("POWER REROUTED", message: "AUX BUS CARRYING 92 PERCENT LOAD", severity: .warning)
    }
    .frame(maxWidth: .infinity)
    VStack(alignment: .stretch, spacing: 10) {
      Readout("TIME TO SEAL", value: "00:41").color(.red)
      Meter("BULKHEAD 22-C", value: 0.31, showValue: true).color(.red)
      HStack(spacing: 6) {
        Pill("ALL CLEAR", code: "90", variant: .leading).color(.dim)
        Pill("EVACUATE", code: "91", variant: .trailing).color(.red)
      }
    }
    .frame(width: 320)
  }
} footer: {
  Bar().color(.red).frame(width: 70)
  Text("ALARM 2207 · LATCHED")
  Bar().color(.red)
}
.color(.red)
```

## Console log

The log terminal: a `ConsoleLog` holding a diagnostic session, the event timeline beside it and the
keyboard shortcuts of the console as `Kbd` keys.

```mockitdown pack="lcars" height="480" title="Logs"
import "lcars/console"

ConsoleFrame("LOGS", code: "07-3302", sidebar: {
  ConsoleSidebar(lit: "LOGS")
}) {
  ConsoleTabs(["SYSTEM", "OPERATOR", "ALARMS"], selection: "SYSTEM")
  HStack(alignment: .top, spacing: 20) {
    ConsoleLog("$ diag --subsystem 4417 --level 3\n> RELAY MATRIX ............ NOMINAL\n> BUFFER 2 ................ 93 PERCENT\n> COOLANT LOOP B .......... RESERVE LOW\n> EMITTER S4 .............. RECALIBRATED\n$ sweep --array 2 --cycle 0218\n> 3 CONTACTS · 1 UNRESOLVED\n$ _", title: "LOG 4417-B")
      .frame(maxWidth: .infinity)
    VStack(alignment: .stretch, spacing: 12) {
      Timeline {
        TimelineItem("DIAGNOSTIC COMPLETE", time: "14:06:51", status: .done)
        TimelineItem("COOLANT RESERVE LOW", time: "14:04:12", status: .warning)
        TimelineItem("ARRAY 2 SWEEP", time: "13:55:00")
        TimelineItem("SHIFT CHANGE", time: "13:00:00", status: .pending)
      }
      HStack(spacing: 8) { Kbd(["CMD", "L"]); Caption("CLEAR LOG") }
      HStack(spacing: 8) { Kbd(["CMD", "F"]); Caption("FILTER") }
    }
    .frame(width: 300)
  }
} footer: {
  ConsoleFooter(code: "RETENTION 30 CYCLES")
}
```

## Anatomy of a console

The parts of a console frame, numbered. The top elbow (#1) carries the title and its code block
(#2); the side bar (#3) is a column of `SidebarButton`s whose codes sit at the left and labels at the
right; readouts (#4) put the label on a coloured block above a big number; meters (#5) are segmented
bars; pills (#6) are the buttons; and the bottom elbow (#7) closes the frame with the footer bars.

```mockitdown pack="lcars" height="440" title="Anatomy"
import LCARS

ConsoleFrame("SUBSYSTEM 4417", code: "44-17", sidebar: {
  SidebarButton("PRIMARY", code: "01-0441").callout(1, alignment: .topLeading)
  SidebarButton("BACKUP", code: "01-0442").color(.peach).callout(3, alignment: .trailing)
}) {
  HStack(spacing: 18) {
    Readout("OUTPUT", value: "0442").callout(4, alignment: .topLeading)
    Readout("DRAW", value: "17.9").color(.periwinkle)
    Readout("RESERVE", value: "88").color(.tan)
  }
  Meter("CHARGE", value: 0.64, showValue: true).callout(5, alignment: .bottomTrailing)
  HStack(spacing: 6) {
    Pill("ENGAGE", code: "22").color(.orange).callout(6, alignment: .topTrailing)
    Pill("HOLD", code: "23")
  }
} footer: {
  Bar().color(.tan).frame(width: 70)
  Text("FRAME 4417")
  Bar().color(.periwinkle).callout(7, alignment: .top)
}
.callout(2, alignment: .topTrailing)
```

---

There are more hidden packs on this ship. Try the [phosphor](phosphor.md) deck, or step into the
[hologram](hologram.md) suite.
