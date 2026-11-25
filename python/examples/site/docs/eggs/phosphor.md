# Phosphor terminal

READY. You scrolled past the last heading anyone else reads, which makes you exactly the
operator this console was waiting for.

**phosphor** is a hidden pack: an original homage to *the green-screen ship and mainframe computers
of 1970s–80s science fiction*. One colour of light on a black tube, monospaced uppercase type with a
soft glow, scanlines and a dark vignette over the whole screen, boxed frames drawn with single and
double rules, numbered menus with dotted leaders, block-character bars, vector outlines for charts
and maps, and priority banners that stay perfectly steady — nothing on this screen blinks at you.
Every label, number and order below is invented. Select it with `import Phosphor` (also `Mainframe`,
`CRT`) or `pack="phosphor"` on the fence. The dark appearance is the canonical green tube; the light
appearance swaps in an amber tube, because someone in procurement got a deal.

`Console` (alias `Screen`) is the full-screen frame: a double rule with the title in inverse video,
`code:` in brackets at the right and the `footer:` slot for a `StatusLine`. `Panel` (alias `Box`)
is a single-rule box with its title set into the top rule. The rest: `Prompt` / `CommandLine` (a
command line with a block cursor), `Cursor`, `MenuList` with `MenuOption` (numbered automatically;
`key:` overrides the number, `.selected()` lights it), `StatusLine`, `Readout`, `Banner` (steady
priority banner; `.variant(.notice)` is the outlined form), `Priority` (the inverse-video alarm),
`Wireframe` (vector map), `VectorPlot` / `Plot`, `LoadBar`, `Log`, `DataTable`, `Ledger`, `Header`,
`Caption` and `Rule`. The core `ProgressView`, charts, `Table`, `Spreadsheet` and `Terminal` are
restyled to match.

The reusable pieces (`ShipStatus`, `DirectoryMenu`, `SubsystemPanel`) live in
`mockups/phosphor/mainframe.mockitdown` and are imported with `import "phosphor/mainframe"`.

## Main directory

The top-level screen: the numbered directory, four readouts and the command line waiting for input.

```mockitdown pack="phosphor" appearance="both" height="520" title="Main directory" source="true"
import "phosphor/mainframe"

Console("MAIN DIRECTORY", subtitle: "INTERFACE 2037", code: "SYS 04") {
  HStack(alignment: .top, spacing: 28) {
    VStack(alignment: .stretch, spacing: 8) {
      Caption("SELECT FUNCTION")
      DirectoryMenu(lit: 3)
    }
    .frame(maxWidth: .infinity)
    VStack(alignment: .stretch, spacing: 10) {
      HStack(spacing: 10) {
        Readout("HULL TEMP", value: "0412", change: "+3", unit: "KELVIN")
        Readout("O2 RESERVE", value: "96.1", unit: "PERCENT")
      }
      HStack(spacing: 10) {
        Readout("HEADING", value: "117.4", change: "-0.2")
        Readout("DIST", value: "3.06", unit: "LIGHT-HR")
      }
      LoadBar("REACTOR", value: 0.64)
      LoadBar("COOLANT", value: 0.82)
    }
    .frame(width: 330)
  }
  Spacer()
  Rule("COMMAND")
  Prompt("RUN DIAGNOSTIC 7")
} footer: {
  ShipStatus()
}
```

## Systems diagnostic

A status grid of three `SubsystemPanel`s, two vector charts and the fuel ledger as a fixed-width
spreadsheet.

```mockitdown pack="phosphor" height="720" title="Diagnostic"
import "phosphor/mainframe"

Console("SYSTEMS DIAGNOSTIC", subtitle: "LEVEL 3 SWEEP", code: "DIAG 7") {
  Grid(columns: 3, spacing: 16) {
    SubsystemPanel(name: "REACTOR", code: "R-2", load: 0.64, heat: 0.71, flow: 0.58)
    SubsystemPanel(name: "LIFE SUPPORT", code: "L-1", load: 0.42, heat: 0.33, flow: 0.88)
    SubsystemPanel(name: "DRIVE", code: "D-4", load: 0.15, heat: 0.22, flow: 0.09)
  }
  HStack(alignment: .top, spacing: 16) {
    VectorPlot(series: [[42, 48, 45, 61, 58, 66, 71, 69], [30, 31, 35, 33, 40, 38, 44, 47]],
               labels: ["-7", "-6", "-5", "-4", "-3", "-2", "-1", "0"], seriesNames: ["CORE", "SHELL"],
               title: "THERMAL TRACE", chartWidth: 540, chartHeight: 190)
      .frame(maxWidth: .infinity)
    BarChart(values: [72, 58, 91, 44, 63, 80], labels: ["P1", "P2", "P3", "P4", "P5", "P6"], title: "PUMP OUTPUT", chartWidth: 540, chartHeight: 190)
      .frame(maxWidth: .infinity)
  }
  Ledger(rows: [
    ["TANK", "CAP", "LEVEL", "DRAW", "HOURS"],
    ["FORE 1", 4800, 3920, 12.5, "=C2/D2"],
    ["FORE 2", 4800, 4105, 12.5, "=C3/D3"],
    ["AFT 1", 6200, 2210, 18.0, "=C4/D4"],
    ["AFT 2", 6200, 5980, 18.0, "=C5/D5"]
  ], selection: "E2:E5", active: "E4", formula: "=C4/D4", sheets: ["FUEL", "WATER", "AIR"])
} footer: {
  ShipStatus(mode: "DIAGNOSTIC")
}
```

## Survey grid

The navigation screen: a `Wireframe` map of the survey area with the planned route, range readouts
and the transmission log as a `Log` terminal.

```mockitdown pack="phosphor" appearance="both" height="600" title="Survey grid"
import "phosphor/mainframe"

Console("SURVEY GRID", subtitle: "SECTOR 9 · QUADRANT C", code: "NAV 2") {
  HStack(alignment: .top, spacing: 18) {
    VStack(alignment: .stretch, spacing: 10) {
      Wireframe(pins: [(18, 30, "BEACON 4"), (52, 48, "SITE K"), (78, 22, "RELAY 9")], route: true)
        .frame(height: 300)
      HStack(spacing: 10) {
        Readout("RANGE", value: "41.07", unit: "KM")
        Readout("BEARING", value: "117")
        Readout("ETA", value: "02:14")
      }
    }
    .frame(maxWidth: .infinity)
    VStack(alignment: .stretch, spacing: 10) {
      Log("$ PLOT COURSE SITE-K\n> ROUTE 3 LEGS · 41.07 KM\n> TERRAIN CLEARANCE 120 M\n$ PING RELAY-9\n> NO RESPONSE (3 OF 3)\n$ PING BEACON-4\n> ACK 0.41 S\n$ HOLD", title: "TRANSMISSION LOG")
      DataTable(columns: ["WAYPOINT", "KM", "ALT"], rows: [
        ["BEACON 4", "0.00", "220"],
        ["SITE K", "18.40", "340"],
        ["RELAY 9", "41.07", "515"]
      ], selectedRows: [1])
    }
    .frame(width: 330)
  }
} footer: {
  ShipStatus(mode: "NAVIGATION")
}
```

## Priority alarm

The same console when something has gone wrong: the steady inverse-video `Priority` banner across
the top, `Banner`s listing what tripped it and the command line asking for confirmation.

```mockitdown pack="phosphor" appearance="both" height="500" title="Priority alarm"
import "phosphor/mainframe"

Console("ALARM", subtitle: "AUTOMATIC OVERRIDE", code: "PRI 1") {
  Priority("PRIORITY ONE", message: "")
  HStack(alignment: .top, spacing: 18) {
    VStack(alignment: .stretch, spacing: 10) {
      Banner("PRESSURE", message: "CARGO BAY 2 BELOW 0.62 ATM AND FALLING")
      Banner("COOLANT", message: "LOOP B FLOW INTERRUPTED AT VALVE 14")
      Banner("ADVISORY", message: "REACTOR WILL SCRAM IN 00:41 WITHOUT INPUT", variant: .notice)
    }
    .frame(maxWidth: .infinity)
    VStack(alignment: .stretch, spacing: 10) {
      Readout("TIME TO SCRAM", value: "00:41")
      LoadBar("BAY 2 PRESS", value: 0.31)
      LoadBar("LOOP B FLOW", value: 0.08)
    }
    .frame(width: 300)
  }
  Spacer()
  Cursor("OVERRIDE REQUIRES TWO OPERATORS")
  Prompt("CONFIRM SEAL BAY 2 (Y/N)", symbol: "?")
} footer: {
  ShipStatus(mode: "PRIORITY ONE", clock: "T+04:13:51")
}
```

## Anatomy of a screen

The parts of a screen, numbered. The double rule with its inverse title (#1) is the `Console`; its
code (#2) sits in brackets at the right. The numbered menu (#3) is a `MenuList` of `MenuOption`s
with dotted leaders to their values; a `Readout` (#4) is a dashed box around a big number; a
`LoadBar` (#5) is drawn in block characters; the command line (#6) ends in a steady block cursor;
and the inverse-video `StatusLine` (#7) closes the screen.

```mockitdown pack="phosphor" height="430" title="Anatomy"
import Phosphor

Console("REACTOR CONTROL", code: "SYS 04") {
  HStack(alignment: .top, spacing: 28) {
    MenuList {
      MenuOption("STATUS", value: "NOMINAL")
      MenuOption("THROTTLE", value: "64 PCT", selected: true)
      MenuOption("COOLANT", value: "LOOP A")
    }
    .frame(maxWidth: .infinity)
    .callout(3, alignment: .topTrailing)
    VStack(alignment: .stretch, spacing: 10) {
      Readout("CORE TEMP", value: "0412", unit: "KELVIN").callout(4, alignment: .topTrailing)
      LoadBar("OUTPUT", value: 0.64).callout(5, alignment: .bottomTrailing)
    }
    .frame(width: 300)
  }
  Spacer()
  Prompt("SET THROTTLE 70").callout(6, alignment: .trailing)
} footer: {
  StatusLine("ONLINE") { Spacer(); Text("T+04:12:09") }.callout(7, alignment: .trailing)
}
.callout(1, alignment: .topLeading)
.callout(2, alignment: .topTrailing)
```

---

Two more hidden consoles share this drawer: [the starship console](lcars.md), the
[holographic HUD](hologram.md), and this one, [the phosphor terminal](phosphor.md). For the
rest of computing history, see the [Retro](../retro/win31.md) packs.
