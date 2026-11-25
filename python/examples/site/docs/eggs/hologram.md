# Holographic HUD

Still scrolling? Then you are the kind of developer who reads the source of the docs site too. The
last hidden console is for you, and it floats.

**hologram** is a hidden pack: an original homage to *the translucent cyan heads-up displays of
modern science-fiction films*. Thin 1px line-work on a deep navy ground, chamfered panels with
corner brackets, radial gauges and segmented rings, hexagon accents, tiny spaced capitals and a soft
glow on everything; amber warns, red is critical. Every label, number and place below is invented.
Select it with `import Hologram` (also `HUD`, `HoloHUD`) or `pack="hologram"` on the fence. The dark
appearance is the canonical projection; the light appearance is a *daylight AR* variant — dark cyan
line-work on a pale, translucent ground, for when the visor is pointed at the sky.

`HUDFrame` (alias `Panel`) is the chamfered panel: cut corners, drawn edges, corner brackets, a
hexagon bullet before the title, `code:` in an outlined tag and a `footer:` strip;
`.variant(.alert)` turns it amber. `DataPanel` is its small sibling with a filled title strip. The
rest: `Reticle` and `TargetLock`, `RadialGauge`, `Ring`, `SegmentBar`, `Scanner` (a radar sweep),
`Alert` (amber by default; `severity: .error` is critical red), `Critical` (the full-width banner),
`Readout`, `HexBadge`, `Telemetry`, `Waveform`, `DataTable` (bracketed rows), `HUDButton`
(chamfered outline; `.solid`, `.ghost`), `Header`, `Caption` and `Rule`. Charts, tables, buttons,
toggles and sliders from the core are restyled to match.

The reusable pieces (`HUDFooter`, `SystemMeter`, `SystemPanel`) live in
`mockups/hologram/hud.mockitdown` and are imported with `import "hologram/hud"`.

## Flight display

The main display: a targeting reticle between two radial gauges, readouts along the bottom and the
mode buttons.

```mockitdown pack="hologram" appearance="both" height="560" title="Flight display" source="true"
import "hologram/hud"

HUDFrame("FLIGHT", subtitle: "VECTOR ASSIST", code: "MK-07") {
  HStack(alignment: .center, spacing: 28) {
    VStack(spacing: 18) {
      RadialGauge("THRUST", value: 0.72)
      Ring(0.45, label: "SHIELD", showValue: true)
    }
    .frame(width: 160)
    ZStack {
      Reticle().frame(width: 220, height: 220)
    }
    .frame(maxWidth: .infinity)
    VStack(spacing: 18) {
      RadialGauge("ENERGY", value: 0.38)
      Ring(0.86, label: "COOLANT", showValue: true)
    }
    .frame(width: 160)
  }
  HStack(spacing: 14) {
    Readout("ALTITUDE", value: "12 480", change: "+120", unit: "M")
    Readout("AIRSPEED", value: "0.84", unit: "MACH")
    Readout("HEADING", value: "117°", change: "-2")
    Readout("RANGE", value: "41.0", unit: "KM").color(.orange)
  }
  HStack(spacing: 10) {
    HUDButton("ASSIST", variant: .solid)
    HUDButton("HOVER")
    HUDButton("CRUISE")
    Spacer()
    Toggle("STABILISER", isOn: true)
    Toggle("NIGHT", isOn: false)
  }
} footer: {
  HUDFooter()
}
```

## Systems diagnostic

A grid of `SystemPanel`s, a telemetry trace and a bar chart, and the module table with bracketed
rows (one in warning).

```mockitdown pack="hologram" height="700" title="Diagnostic"
import "hologram/hud"

HUDFrame("SYSTEMS", subtitle: "DIAGNOSTIC SWEEP 3", code: "DX-3") {
  Grid(columns: 3, spacing: 14) {
    SystemPanel(title: "POWER CELL", code: "P-1", a: 0.82, b: 0.41, c: 0.66)
    SystemPanel(title: "ARMATURE", code: "A-4", a: 0.58, b: 0.73, c: 0.30, tint: "orange")
    SystemPanel(title: "OPTICS", code: "O-2", a: 0.91, b: 0.22, c: 0.88)
  }
  HStack(alignment: .top, spacing: 14) {
    Telemetry(series: [[42, 48, 45, 61, 58, 66, 71, 69, 74], [30, 31, 35, 33, 40, 38, 44, 47, 45]],
              labels: ["-8", "-7", "-6", "-5", "-4", "-3", "-2", "-1", "0"], seriesNames: ["CORE", "SKIN"],
              title: "THERMAL TELEMETRY", chartWidth: 520, chartHeight: 170)
      .frame(maxWidth: .infinity)
    BarChart(values: [72, 58, 91, 44, 63, 80], labels: ["J1", "J2", "J3", "J4", "J5", "J6"],
             title: "JOINT TORQUE", chartWidth: 520, chartHeight: 170)
      .frame(maxWidth: .infinity)
  }
  DataTable(columns: ["MODULE", "STATE", "LOAD", "TEMP", "UPTIME"]) {
    TableRow { Text("PWR-01"); Text("ONLINE"); Text("82%"); Text("41°"); Text("212:04") }
    TableRow(status: .warning) { Text("ARM-04"); Text("STRAIN"); Text("97%"); Text("88°"); Text("011:52") }
    TableRow { Text("OPT-02"); Text("ONLINE"); Text("35%"); Text("29°"); Text("212:04") }
  }
} footer: {
  HUDFooter(mode: "DIAG")
}
```

## Scanner

The sweep: a `Scanner` with three contacts and the planned track, a `TargetLock` on the nearest
contact, the contact list and a waveform of the return signal.

```mockitdown pack="hologram" appearance="both" height="620" title="Scanner"
import "hologram/hud"

HUDFrame("SCAN", subtitle: "PASSIVE ARRAY", code: "SC-1") {
  HStack(alignment: .top, spacing: 22) {
    Scanner(pins: [(50, 50, "SELF"), (32, 30, "CONTACT 1"), (68, 62, "CONTACT 2"), (74, 28, "BEACON")], route: true)
      .frame(width: 380, height: 380)
    VStack(alignment: .stretch, spacing: 14) {
      HStack(spacing: 18) {
        TargetLock().frame(width: 84, height: 84)
        VStack(alignment: .leading, spacing: 4) {
          Caption("NEAREST CONTACT")
          Header("CONTACT 1")
          HStack(spacing: 6) { HexBadge("C1"); HexBadge("LOCK").color(.orange) }
        }
      }
      DataTable(columns: ["ID", "BRG", "RNG", "CLOSURE"], rows: [
        ["CONTACT 1", "312°", "2.4 KM", "-0.8"],
        ["CONTACT 2", "128°", "5.1 KM", "+0.2"],
        ["BEACON", "041°", "7.9 KM", "0.0"]
      ], selectedRows: [0])
      Waveform(values: [3, 5, 4, 8, 6, 9, 5, 7, 4, 6, 3, 5], title: "RETURN SIGNAL", chartWidth: 760, chartHeight: 120)
      Slider(value: 0.6, label: "GAIN", showValue: true)
    }
    .frame(maxWidth: .infinity)
  }
} footer: {
  HUDFooter(mode: "SCAN")
}
```

## Proximity warning

The alarm state: a red `Critical` banner, the frame in its amber `.alert` variant, warnings and a
critical `Alert`, and the abort controls.

```mockitdown pack="hologram" appearance="both" height="500" title="Proximity warning"
import "hologram/hud"

HUDFrame("COLLISION", subtitle: "AUTOMATIC EVASION", code: "AL-1", variant: .alert) {
  Critical("PROXIMITY CRITICAL")
  HStack(alignment: .top, spacing: 22) {
    VStack(alignment: .stretch, spacing: 10) {
      Alert("OBSTACLE", message: "TERRAIN AT 140 M · CLOSING 32 M/S")
      Alert("HULL STRESS", message: "FRAME 4 AT 112% OF RATING", severity: .error)
      Alert("EVASION", message: "AUTOPILOT WILL TAKE CONTROL IN 4 S")
    }
    .frame(maxWidth: .infinity)
    VStack(spacing: 12) {
      RadialGauge("IMPACT", value: 0.88).color(.red)
      Readout("TIME TO CONTACT", value: "00:04.3").color(.red)
    }
    .frame(width: 240)
  }
  HStack(spacing: 10) {
    HUDButton("EVADE", variant: .solid).color(.orange)
    HUDButton("ABORT").color(.red)
    HUDButton("SILENCE", variant: .ghost)
  }
} footer: {
  HUDFooter(mode: "ALERT", clock: "21:47:11")
}
```

## Anatomy of a display

The parts of a HUD panel, numbered. The chamfered frame (#1) has its edges drawn along the cut
corners and brackets on the square ones; the hexagon before the title (#2) is the panel's bullet,
and the code tag (#3) sits at the right. A `RadialGauge` (#4) puts its value inside a tick ring; a
`Ring` (#5) is segmented; a `Readout` (#6) is a bracketed number; `HUDButton`s (#7) are chamfered
outlines; and the footer (#8) carries a `HexBadge` and the clock.

```mockitdown pack="hologram" height="440" title="Anatomy"
import Hologram

HUDFrame("POWER CELL", code: "P-1") {
  HStack(spacing: 30) {
    RadialGauge("OUTPUT", value: 0.64).callout(4, alignment: .topTrailing)
    Ring(0.4, label: "RESERVE", showValue: true).callout(5, alignment: .topTrailing)
    Readout("DRAW", value: "17.9", unit: "KW").frame(width: 200).callout(6, alignment: .topTrailing)
    Spacer()
  }
  HStack(spacing: 10) {
    HUDButton("BOOST", variant: .solid).callout(7, alignment: .trailing)
    HUDButton("ISOLATE")
  }
} footer: {
  HexBadge("NOMINAL").callout(8, alignment: .trailing)
  Spacer()
  Text("21:47:06")
}
.callout(1, alignment: .bottomLeading)
.callout(2, alignment: .topLeading)
.callout(3, alignment: .topTrailing)
```

---

The other hidden consoles: [the starship console](lcars.md), [the phosphor terminal](phosphor.md)
and this one, [the holographic HUD](hologram.md). And from before anything
floated, the [Retro](../retro/win31.md) packs.
