#!/usr/bin/env python3
"""Generate the conformance corpus in ``shared/conformance/`` (R-REPO-004).

    python tools/gen_conformance.py            # (re)write every case from the Python renderer
    python tools/gen_conformance.py --check    # exit 1 if any corpus file is missing, stale or stray
    python tools/gen_conformance.py --list     # print the case names, one per line

The corpus defines "the same rendering" for every variant (ADR-18): the TypeScript renderer must
produce, for each case, exactly the HTML the Python renderer produced here. Regenerate it on purpose
after a change to rendering, never to make a failing port test pass.

Layout of ``shared/conformance/``::

    index.json                 {"cases": [{"name", "area"}, ...]} in generation order
    <name>.mockitdown          the mockup source (its first line is a `//` comment saying what it tests)
    <name>.json                the render options (see OPTION_KEYS; absent keys take their defaults)
    <name>.html                the expected HTML: RenderResult.html followed by one line feed
    <name>.diag.json           the expected result: {"packs": [...], "diagnostics": [...]}
    components/*.mockitdown    component libraries the import-* cases import

How a case is rendered (the harness every variant reproduces): no source path and no asset or pack
paths; one import search path, ``.``, resolved against ``shared/conformance/``. So imports name files
relative to the corpus, a missing import reports ``(searched .)``, a local image reports ``(no asset
paths)``, and no output carries a machine path. Diagnostics located inside an imported file carry
that file's resolved path as their source, so the corpus has none (the generator refuses them). Each diagnostic is
``{"severity", "code", "message", "line", "col", "source"}`` (``source`` is "" for the block itself).

Areas (the name prefix): role-* (every base element, by render role), pack-* (every shipped pack,
plus its own elements in chunks), appearance-*, device-*, chrome-*, option-*, import-*,
annotate-*, overlay-*, chart-*, image-*, lang-*, diag-*.
"""

from __future__ import annotations

import argparse
import contextlib
import json
import os
import re
import sys
from dataclasses import dataclass, field
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "src"))

from mockitdown import RenderOptions, render  # noqa: E402
from mockitdown.options import DEVICES  # noqa: E402
from mockitdown.packs import registry  # noqa: E402
from mockitdown.render.chrome import CHROME_KINDS  # noqa: E402

SHARED = ROOT.parent / "shared"
CONF = SHARED / "conformance"
REFERENCE = SHARED / "reference"

#: The render options a case may set, with their JSON types (Python RenderOptions field names).
OPTION_KEYS: dict[str, type] = {
    "pack": str, "default_pack": str, "device": str, "default_device": str, "appearance": str,
    "default_appearance": str, "width": int, "height": int, "chrome": str, "title": str, "id": str,
    "caption": bool, "elements": bool, "source": bool, "window": str, "url": str, "show_warnings": bool,
}

#: Own elements per pack-<id>-own-<n> case.
CHUNK = 12

#: A 1×1-ish inline SVG, used wherever a case needs an image without a file.
SVG_URI = ("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0"
           "IDMiPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjMiIGZpbGw9IiM4OGIiLz48L3N2Zz4=")


@dataclass
class Case:
    name: str
    about: str
    body: str
    options: dict = field(default_factory=dict)
    #: The renderer must report at least one diagnostic (diag-* cases); otherwise none.
    diagnostics: bool = False

    @property
    def area(self) -> str:
        return self.name.split("-", 1)[0]

    @property
    def source(self) -> str:
        return f"// {self.about}\n{self.body.strip()}\n"


# --- component libraries for the import-* cases ---------------------------------------------------

COMPONENTS: dict[str, str] = {
    "components/pill.mockitdown": """\
// A status pill: a coloured dot and a short label.
struct StatusPill: View {
  var text: String
  var color: Color = .green
  var body: some View {
    HStack(spacing: 6) {
      Circle().fill(color).frame(width: 8, height: 8)
      Text(text).font(.footnote)
    }
    .padding(.horizontal, 10).padding(.vertical, 4)
    .background(.surface).border(.separator).cornerRadius(12)
  }
}
""",
    "components/person.mockitdown": """\
// A person row with trailing content; imports the pill library.
import "pill"

struct PersonRow: View {
  var name: String
  var role: String
  var status: String = "Online"
  @ViewBuilder var trailing: Content
  var body: some View {
    HStack(spacing: 12) {
      Avatar(name)
      VStack(alignment: .leading, spacing: 2) {
        Text(name).font(.headline)
        Text(role).font(.footnote).foregroundStyle(.secondary)
      }
      Spacer()
      StatusPill(text: status)
      trailing
    }
    .padding(.vertical, 6)
  }
}
""",
}


# --- case builders --------------------------------------------------------------------------------

def _kebab(name: str) -> str:
    return re.sub(r"(?<=[a-z0-9])(?=[A-Z])", "-", name).lower()


def _reference(pack_id: str) -> dict:
    return json.loads((REFERENCE / f"{pack_id}.json").read_text(encoding="utf-8"))


def role_cases() -> list[Case]:
    """One case per base element, named role-<role>-<element>: the Reference sample, unmodified."""
    out = []
    for el in sorted(_reference("base")["elements"], key=lambda e: (e["role"], e["name"])):
        out.append(Case(f"role-{el['role']}-{_kebab(el['name'])}",
                        f"base element {el['name']} (role {el['role']})", el["sample"], {"device": "fit"}))
    return out


PACK_SCREEN = """\
@Screen(title: "Settings")
VStack(alignment: .leading, spacing: 12) {
  Text("Account").font(.title2)
  TextField("Name", text: "Ana Lima")
  Toggle("Notifications", isOn: true)
  Checkbox("Weekly digest", checked: true)
  ProgressView("Sync", value: 0.6)
  HStack {
    Button("Cancel")
    Spacer()
    Button("Save", role: .primary)
  }
}
.padding()
"""


def pack_cases() -> list[Case]:
    """pack-<id> for every shipped pack (hidden ones included), then pack-<id>-own-<n> chunks."""
    reg = registry(())
    out = []
    for pid in sorted(reg.ids()):
        out.append(Case(f"pack-{pid}", f"a small settings screen in the {pid} pack", PACK_SCREEN,
                        {"pack": pid}))
    for pid in sorted(reg.ids()):
        ref = REFERENCE / f"{pid}.json"
        if pid == "base" or not ref.is_file():
            continue  # base is covered element by element; hidden packs have no Reference data
        own = [e for e in _reference(pid)["elements"] if e["own"]]
        for i in range(0, len(own), CHUNK):
            part = own[i:i + CHUNK]
            names = ", ".join(e["name"] for e in part)
            body = "VStack(alignment: .leading, spacing: 12) {\n" + "".join(
                f"  {e['sample']}\n" for e in part) + "}\n.padding()"
            out.append(Case(f"pack-{pid}-own-{i // CHUNK + 1}", f"{pid} own elements: {names}", body,
                            {"pack": pid, "device": "fit"}))
    return out


APPEARANCE_BODY = 'VStack(spacing: 8) { Text("Appearance").font(.headline); Button("Continue"); Toggle("On", isOn: true) }'


def appearance_cases() -> list[Case]:
    out = [Case(f"appearance-{a}", f"appearance option {a}", APPEARANCE_BODY, {"appearance": a, "device": "fit"})
           for a in ("light", "dark", "auto", "both")]
    out.append(Case("appearance-screen-dark", "appearance from @Screen(appearance: .dark)",
                    "@Screen(appearance: .dark)\n" + APPEARANCE_BODY, {"device": "fit"}))
    out.append(Case("appearance-option-overrides-screen", "the appearance option overrides @Screen",
                    "@Screen(appearance: .dark)\n" + APPEARANCE_BODY, {"appearance": "light", "device": "fit"}))
    out.append(Case("appearance-default-dark", "default_appearance applies when nothing names one",
                    APPEARANCE_BODY, {"default_appearance": "dark", "device": "fit"}))
    out.append(Case("appearance-both-swiftui", "both appearances side by side in a phone frame",
                    APPEARANCE_BODY, {"appearance": "both", "pack": "swiftui"}))
    return out


DEVICE_BODY = 'VStack { Text("Device"); Spacer(); Button("OK") }'


def device_cases() -> list[Case]:
    out = [Case(f"device-{d}", f"device {d} ({w}×{h})", DEVICE_BODY, {"device": d})
           for d, (w, h) in DEVICES.items()]
    out += [
        Case("device-fit", "device fit: no fixed size (data-fit)", DEVICE_BODY, {"device": "fit"}),
        Case("device-screen", "device from @Screen(device: .tablet)", "@Screen(device: .tablet)\n" + DEVICE_BODY),
        Case("device-default", "default_device applies when nothing names one", DEVICE_BODY,
             {"default_device": "phone"}),
        Case("device-pack-default", "the pack's default device (swiftui: phone)", DEVICE_BODY, {"pack": "swiftui"}),
        Case("device-size", "width and height override the device size", DEVICE_BODY,
             {"device": "phone", "width": 320, "height": 480}),
        Case("device-width-only", "width alone keeps the device height", DEVICE_BODY,
             {"device": "desktop", "width": 900}),
    ]
    return out


def chrome_cases() -> list[Case]:
    body = 'VStack { Text("Window content"); Button("OK") }'
    out = [Case(f"chrome-{k}", f"chrome {k}", body, {"chrome": k, "device": "desktop", "title": "Chrome"})
           for k in CHROME_KINDS]
    out += [
        Case("chrome-auto-pack", "chrome auto takes the pack's chrome for the device (fluent: windows)", body,
             {"pack": "fluent", "title": "Auto"}),
        Case("chrome-browser-url", "browser chrome shows the url option", body,
             {"chrome": "browser", "url": "https://example.com/inbox", "title": "Inbox"}),
        Case("chrome-screen", "chrome from @Screen(chrome:)", '@Screen(chrome: "macos", title: "From source")\n' + body),
        Case("chrome-window-dialog", "window option emitted as data-window", body,
             {"pack": "win95", "window": "dialog", "title": "Dialog"}),
    ]
    return out


def option_cases() -> list[Case]:
    body = 'VStack(spacing: 8) { Text("Inbox").id("title"); Button("Compose").id("compose").ref("R-MAIL-001") }'
    return [
        Case("option-title", "title option: frame title and caption", body, {"device": "fit", "title": "Inbox"}),
        Case("option-id", "id option: caption shows the id", body, {"device": "fit", "id": "SCR-1"}),
        Case("option-id-title", "caption is 'id · title'", body, {"device": "fit", "id": "SCR-1", "title": "Inbox"}),
        Case("option-caption-off", "caption false hides the caption", body,
             {"device": "fit", "id": "SCR-1", "title": "Inbox", "caption": False}),
        Case("option-screen-meta", "title and id from @Screen", '@Screen(title: "Mail", id: "SCR-2")\n' + body,
             {"device": "fit"}),
        Case("option-elements", "elements true appends the Elements table", body,
             {"device": "fit", "elements": True}),
        Case("option-source", "source true appends the block source", body, {"device": "fit", "source": True}),
        Case("option-pack-overrides-import", "the pack option overrides `import <Module>`",
             "import SwiftUI\n" + body, {"device": "fit", "pack": "mui"}),
        Case("option-default-pack", "default_pack applies when nothing names a pack", body,
             {"device": "fit", "default_pack": "bootstrap"}),
    ]


def import_cases() -> list[Case]:
    return [
        Case("import-module", "`import <Module>` selects the pack (Fluent → fluent)",
             'import FluentUI\nVStack { Text("Fluent by import"); Button("OK") }', {"device": "fit"}),
        Case("import-module-alias", "a second module name of the same pack (MUI)",
             'import MaterialUI\nButton("Material")', {"device": "fit"}),
        Case("import-component", "a struct imported from a component file",
             'import "components/pill"\nHStack(spacing: 8) { StatusPill(text: "Online"); '
             'StatusPill(text: "Offline", color: .red) }', {"device": "fit"}),
        Case("import-component-extension", "the .mockitdown extension may be written",
             'import "components/pill.mockitdown"\nStatusPill(text: "Online")', {"device": "fit"}),
        Case("import-nested", "a component file importing another, with trailing content",
             'import "components/person"\nVStack { PersonRow(name: "Ana Lima", role: "Design lead") '
             '{ Button("Message") } }.frame(width: 420)', {"device": "fit"}),
        Case("import-component-in-pack", "an imported component rendered in another pack",
             'import Bootstrap\nimport "components/pill"\nStatusPill(text: "Degraded", color: .orange)',
             {"device": "fit"}),
        Case("import-inline-struct", "a struct declared in the block",
             'struct Hello: View {\n  var who: String = "World"\n  var body: some View { Text("Hello, \\(who)!") }\n}\n'
             'VStack { Hello(); Hello(who: "Ana") }', {"device": "fit"}),
        Case("import-inline-overrides", "a struct in the block replaces an imported one",
             'import "components/pill"\nstruct StatusPill: View {\n  var text: String\n  var color: Color = .blue\n'
             '  var body: some View { Badge(text) }\n}\nStatusPill(text: "Local")', {"device": "fit"}),
    ]


ANN_FORM = """VStack(alignment: .leading, spacing: 12) {
  TextField("To", text: "ana@example.com")%s
  Button("Send")%s
}
.padding()
.frame(width: 360)"""


def annotate_cases() -> list[Case]:
    def form(a: str, b: str = "") -> str:
        return ANN_FORM % (a, b)

    out = [
        Case("annotate-callout", "a numbered callout on the default corner", form(".callout(1)")),
        Case("annotate-callout-label", "a callout with a label", form('.callout(1, "Recipient")')),
        Case("annotate-callout-two", "two callouts in one figure (anchors 1 and 2)",
             form(".callout(1)", ".callout(2, alignment: .topTrailing)")),
        Case("annotate-callout-color", "a callout colour", form(".callout(1, color: .blue)")),
        Case("annotate-callout-label-side", "labelSide overrides the label direction",
             form('.callout(1, "Left", alignment: .bottomTrailing, labelSide: .leading)')),
        Case("annotate-annotation-alias", "`.annotation` is an alias of `.callout`", form(".annotation(3)")),
        Case("annotate-pointer-hand", "a hand pointer", form("", ".pointer(.hand)")),
        Case("annotate-cursor-alias", "`.cursor` is an alias of `.pointer`", form("", ".cursor(.ibeam)")),
        Case("annotate-drag-select", "a selection rectangle", form(".dragSelect()")),
        Case("annotate-marquee-color", "`.marquee` with a colour", form(".marquee(.green)")),
        Case("annotate-highlight", "a focus ring", form("", ".highlight()")),
        Case("annotate-tap", "a touch indicator", form("", ".tap(alignment: .center)")),
        Case("annotate-stacked", "callout, pointer and highlight on one view",
             form("", '.highlight().pointer(.hand).callout(2, "Send")')),
        Case("annotate-free-elements", "Callout, Pointer and SelectionRect placed on a canvas",
             'Canvas(height: 200) {\n  StickyNote("Idea", color: .yellow).position(x: 100, y: 90)\n'
             '  SelectionRect().frame(width: 160, height: 120).position(x: 100, y: 90)\n'
             '  Pointer(.arrow).position(x: 190, y: 150)\n  Callout(1, "Selected").position(x: 260, y: 40)\n}\n'
             '.frame(width: 360)'),
        Case("annotate-position-zstack", "`.position(x:y:)` inside a ZStack",
             'ZStack { Color(.gray).frame(width: 200, height: 120); Text("Here").position(x: 40, y: 30) }'),
        Case("annotate-in-dialog", "a callout inside a dialog is emitted after the dialog's layer",
             'VStack { Text("Behind") }\n.alert("Delete?", isPresented: true) {\n  Button("Cancel")\n'
             '  Button("Delete", role: .destructive).callout(1)\n}'),
    ]
    for kind in ("arrow", "ibeam", "grab", "crosshair", "touch"):
        out.append(Case(f"annotate-pointer-{kind}", f"pointer kind {kind}", form("", f".pointer(.{kind})")))
    for c in out:
        c.options.setdefault("device", "fit")
    return out


def overlay_cases() -> list[Case]:
    base = 'VStack(spacing: 8) { Text("Screen content"); Button("Open") }'
    out = [
        Case("overlay-alert", "`.alert` with actions and a message",
             base + '\n.alert("Sign out?", isPresented: true) {\n  Button("Cancel")\n'
             '  Button("Sign Out", role: .destructive)\n} message: {\n  Text("You will need your password.")\n}'),
        Case("overlay-sheet", "`.sheet` presented over the screen",
             base + '\n.sheet(isPresented: true) { VStack { Text("Sheet"); Button("Done") } }'),
        Case("overlay-confirmation-dialog", "`.confirmationDialog`",
             base + '\n.confirmationDialog("Delete photo?", isPresented: true) {\n  Button("Delete", role: .destructive)\n'
             '  Button("Cancel")\n}'),
        Case("overlay-overlay", "`.overlay` with alignment",
             'Color(.blue).frame(width: 200, height: 100).overlay(alignment: .topTrailing) { Badge("New") }'),
        Case("overlay-badge", "`.badge(n)` on a row", 'List { Row("Inbox", systemImage: "tray").badge(3) }'),
        Case("overlay-toast", "a toast element", 'VStack { Text("Saved list"); Toast("Saved") }'),
        Case("overlay-dialog-element", "a Dialog element", 'Dialog("Rename") { TextField("Name"); Button("OK") }'),
        Case("overlay-fab", "a floating action button", 'VStack { Text("List"); FloatingActionButton("plus") }'),
        Case("overlay-navigation", "NavigationStack with title and toolbar",
             'NavigationStack {\n  List { Row("Wi-Fi", detail: "Home", chevron: true) }\n'
             '  .navigationTitle("Settings")\n'
             '  .toolbar { ToolbarItem(placement: .topBarTrailing) { Button("Edit") } }\n}'),
    ]
    for c in out:
        c.options.setdefault("device", "phone")
        c.options.setdefault("pack", "swiftui")
    return out


def chart_cases() -> list[Case]:
    specs = [
        ("bar-series", 'BarChart(title: "Revenue", series: [[42, 51, 48, 63], [35, 39, 44, 52]], '
                       'seriesNames: ["2026", "2025"], labels: ["Q1", "Q2", "Q3", "Q4"])'),
        ("bar-horizontal", 'BarChart(title: "Tickets", values: [42, 31, 18, 12], labels: ["A", "B", "C", "D"], '
                           'horizontal: true, showValues: true)'),
        ("bar-stacked", 'BarChart(series: [[5, 6, 7], [3, 3, 4]], seriesNames: ["Crew", "Gear"], '
                        'labels: ["W1", "W2", "W3"], stacked: true)'),
        ("line", 'LineChart(title: "Users", subtitle: "Weekly", series: [[12, 14, 13, 17], [8, 9, 9, 11]], '
                 'seriesNames: ["Web", "iOS"], labels: ["W1", "W2", "W3", "W4"])'),
        ("line-decimals", 'LineChart(values: [0.5, 1.25, 0.75, 2.125, 1.5])'),
        ("line-negative", 'LineChart(values: [-3, 2, -1, 4, 0])'),
        ("area-stacked", 'AreaChart(series: [[2, 3, 4], [1, 1, 2]], seriesNames: ["A", "B"], '
                         'labels: ["Jun", "Jul", "Aug"], stacked: true)'),
        ("combo", 'ComboChart(series: [[120, 150, 170], [80, 95, 110]], seriesNames: ["Visits", "Orders"], '
                  'labels: ["Jun", "Jul", "Aug"])'),
        ("pie", 'PieChart(title: "Traffic", values: [48, 27, 15, 10], labels: ["Search", "Direct", "Social", "Email"])'),
        ("donut", 'DonutChart(title: "Budget", values: [68, 32], labels: ["Spent", "Left"], unit: "68%")'),
        ("gauge", 'GaugeChart(title: "Uptime", value: 99.2, min: 95, max: 100, unit: "%")'),
        ("scatter", 'ScatterChart(points: [[12, 3.9], [18, 4.2], [25, 4.4], [9, 3.1]])'),
        ("bubble", 'BubbleChart(points: [[10, 40, 30], [25, 60, 80], [40, 35, 20]])'),
        ("radar", 'RadarChart(series: [[4, 3, 5, 2, 4], [3, 4, 3, 4, 3]], seriesNames: ["Ana", "Ben"], '
                  'labels: ["Design", "Code", "Research", "Ops", "Writing"])'),
        ("heatmap", 'Heatmap(matrix: [[1, 3, 5], [2, 6, 8], [0, 4, 9]], labels: ["8", "10", "12"], '
                    'yLabels: ["Mon", "Tue", "Wed"])'),
        ("funnel", 'FunnelChart(values: [1200, 640, 310, 140], labels: ["Visited", "Started", "Verified", "Paid"])'),
        ("treemap", 'Treemap(values: [42, 23, 15, 9], labels: ["Video", "Photos", "Apps", "Docs"])'),
        ("candlestick", 'CandlestickChart(points: [[100, 108, 98, 106], [106, 110, 101, 103], [103, 104, 95, 97]], '
                        'labels: ["Mon", "Tue", "Wed"])'),
        ("sparkline", 'Sparkline([3, 5, 2, 6, 4])'),
        ("kind", 'Chart(kind: .line, values: [3, 5, 2, 6, 4])'),
        ("marks", 'Chart {\n  BarMark(x: .value("Day", "Mon"), y: .value("Steps", 6200))\n'
                  '  BarMark(x: .value("Day", "Tue"), y: .value("Steps", 8400))\n'
                  '  BarMark(x: .value("Day", "Wed"), y: .value("Steps", 7100))\n}'),
    ]
    out = [Case(f"chart-{n}", f"chart: {n}", src, {"device": "fit", "pack": "swiftui"} if n == "marks" else {"device": "fit"})
           for n, src in specs]
    out.append(Case("chart-dark-mui", "chart colours in a pack, dark", specs[0][1],
                    {"device": "fit", "pack": "mui", "appearance": "dark"}))
    return out


def image_cases() -> list[Case]:
    return [
        Case("image-data-uri", "Image with a data: URI passes through",
             f'Image("{SVG_URI}").frame(width: 120, height: 90)'),
        Case("image-remote", "Image with an https URL is linked",
             'Image("https://example.com/photo.jpg").frame(width: 120, height: 90)'),
        Case("image-protocol-relative", "a protocol-relative URL is linked",
             'Image("//cdn.example.com/a.png").frame(width: 120, height: 90)'),
        Case("image-placeholder", "Image without a source draws a placeholder", 'Image().frame(width: 120, height: 90)'),
        Case("image-system-name", "Image(systemName:) draws a built-in icon",
             'HStack { Image(systemName: "star.fill"); Image(systemName: "trash"); Image(systemName: "bell") }'),
        Case("image-icon-names", "icon names of other families",
             'HStack { Icon("Add"); Icon("delete"); Icon("sap-icon://home") }'),
        Case("image-async", "AsyncImage with a URL", 'AsyncImage(url: "https://example.com/a.png").frame(width: 120, height: 90)'),
        Case("image-avatar", "Avatar with an image and with initials",
             f'HStack {{ Avatar("Ana Lima", image: "{SVG_URI}"); Avatar("Ben Okafor") }}'),
        Case("image-resizable", "image modifiers", f'Image("{SVG_URI}").resizable().aspectRatio(contentMode: .fill)'
             '.frame(width: 160, height: 90).clipShape(Circle())'),
    ]


def lang_cases() -> list[Case]:
    out = [
        Case("lang-let-if", "let bindings and if/else", 'let n = 3\nVStack {\n  if n > 2 { Text("many") } else { Text("few") }\n'
             '  Text("n = \\(n)")\n}'),
        Case("lang-foreach", "ForEach over a list", 'List { ForEach(["Ana", "Ben", "Cy"]) { name in Text(name) } }'),
        Case("lang-text-markdown", "inline Markdown in Text", 'Text("**Bold**, *italic*, `code` and [link](#x)")'),
        Case("lang-fonts", "font styles", 'VStack(alignment: .leading) { Text("Title").font(.title); '
             'Text("Headline").font(.headline); Text("Caption").font(.caption).foregroundStyle(.secondary) }'),
        Case("lang-modifiers-layout", "padding, frame, background, border, corner radius",
             'Text("Box").padding(12).frame(width: 160, height: 60).background(.surface).border(.separator)'
             '.cornerRadius(8)'),
        Case("lang-colors", "colour values", 'HStack { Color(.red); Color(.blue); Color("#336699"); '
             'Color(red: 0.2, green: 0.6, blue: 0.4) }.frame(height: 40)'),
        Case("lang-escape", "HTML is escaped", 'Text("<b>not bold</b> & \\"quoted\\"")'),
        Case("lang-unicode", "non-ASCII text", 'Text("Grüße · 東京 · ⌘K · 🚀")'),
        Case("lang-ids-refs", "`.id()` and `.ref()` attributes",
             'VStack { Button("Save").id("save").ref("R-X-001") }'),
        Case("lang-stacks-spacing", "stack spacing and alignment",
             'HStack(alignment: .top, spacing: 24) { VStack(alignment: .trailing, spacing: 4) { Text("a"); Text("bb") }; '
             'Spacer(); Text("c") }.frame(width: 300)'),
    ]
    for c in out:
        c.options.setdefault("device", "fit")
    return out


def diag_cases() -> list[Case]:
    out = [
        Case("diag-syntax-error", "a syntax error stops rendering", 'VStack { Text("open"'),
        Case("diag-syntax-unterminated-string", "an unterminated string", 'Text("never closed)'),
        Case("diag-unknown-element", "an unknown element is reported", 'VStack { Text("ok"); Frobnicate("x") }'),
        Case("diag-unknown-module", "an import naming no known pack", 'import NoSuchKit\nText("x")'),
        Case("diag-module-conflict", "a second pack import is ignored", 'import SwiftUI\nimport FluentUI\nText("x")'),
        Case("diag-import-missing", "a missing component file", 'import "components/nope"\nText("x")'),
        Case("diag-image-missing", "a local image with no asset paths", 'Image("photo.png").frame(width: 80, height: 60)'),
        Case("diag-image-scheme", "an unsupported image scheme", 'Image("javascript:alert(1)")'),
        Case("diag-image-data-not-image", "a data: URI that is not an image", 'Image("data:text/html,hi")'),
        Case("diag-unknown-icon", "an unknown icon name", 'Icon("unknown-glyph-name")'),
        Case("diag-unknown-appearance", "an unknown appearance from @Screen",
             '@Screen(appearance: .sepia)\nText("x")'),
        Case("diag-unknown-chrome", "an unknown chrome", 'Text("x")', {"chrome": "spaceship"}),
        Case("diag-unknown-device", "an unknown device", 'Text("x")', {"device": "toaster"}),
        Case("diag-unknown-pack-option", "an unknown pack option", 'Text("x")', {"pack": "no-such-pack"}),
        Case("diag-warnings-hidden", "warnings are reported but not shown by default",
             'import NoSuchKit\nText("x")'),
        Case("diag-warnings-shown", "show_warnings puts warnings above the figure",
             'import NoSuchKit\nText("x")', {"show_warnings": True}),
        Case("diag-errors-shown", "errors are shown above the figure with the rest rendered",
             'VStack { Text("kept"); Frobnicate() }', {"show_warnings": True}),
    ]
    for c in out:
        c.diagnostics = True
        c.options.setdefault("device", "fit")
    return out




def build_cases() -> list[Case]:
    cases = (role_cases() + pack_cases() + appearance_cases() + device_cases() + chrome_cases()
             + option_cases() + import_cases() + annotate_cases() + overlay_cases() + chart_cases()
             + image_cases() + lang_cases() + diag_cases())
    names = [c.name for c in cases]
    dupes = {n for n in names if names.count(n) > 1}
    if dupes:
        raise SystemExit(f"duplicate case names: {sorted(dupes)}")
    for c in cases:
        bad = set(c.options) - set(OPTION_KEYS)
        if bad:
            raise SystemExit(f"{c.name}: unknown option keys {sorted(bad)}")
    return cases


# --- rendering ------------------------------------------------------------------------------------

@contextlib.contextmanager
def _in_corpus(directory: Path):
    old = Path.cwd()
    os.chdir(directory)
    try:
        yield
    finally:
        os.chdir(old)


def render_case(source: str, options: dict, directory: Path = CONF):
    """Render one case the way every variant must: import search path `.` = the corpus directory."""
    with _in_corpus(directory):
        return render(source, RenderOptions(**options, import_paths=(Path("."),)))


def result_json(result) -> dict:
    return {
        "packs": list(result.packs),
        "diagnostics": [{"severity": d.severity.value, "code": d.code, "message": d.message,
                         "line": d.location.line, "col": d.location.col, "source": d.location.source}
                        for d in result.diagnostics],
    }


def _dump(obj) -> str:
    return json.dumps(obj, indent=2, ensure_ascii=False) + "\n"


def expected_files(cases: list[Case]) -> dict[str, str]:
    """Every corpus file (relative path → content)."""
    files: dict[str, str] = dict(COMPONENTS)
    machine = str(ROOT.parent)
    problems = []
    for c in cases:
        result = render_case(c.source, c.options)
        if bool(result.diagnostics) != c.diagnostics:
            got = "; ".join(str(d) for d in result.diagnostics) or "none"
            problems.append(f"{c.name}: expected {'diagnostics' if c.diagnostics else 'no diagnostics'}, got {got}")
        html = result.html + "\n"
        res = _dump(result_json(result))
        if machine in html or machine in res:
            problems.append(f"{c.name}: output contains a machine path ({machine})")
        files[f"{c.name}.mockitdown"] = c.source
        files[f"{c.name}.json"] = _dump(c.options)
        files[f"{c.name}.html"] = html
        files[f"{c.name}.diag.json"] = res
    if problems:
        raise SystemExit("\n".join(problems))
    files["index.json"] = _dump({"cases": [{"name": c.name, "area": c.area} for c in cases]})
    return files


def _existing() -> set[str]:
    if not CONF.is_dir():
        return set()
    return {p.relative_to(CONF).as_posix() for p in CONF.rglob("*") if p.is_file()}


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    ap.add_argument("--check", action="store_true", help="fail when a corpus file is missing, stale or stray")
    ap.add_argument("--list", action="store_true", help="print the case names")
    args = ap.parse_args(argv)
    cases = build_cases()
    if args.list:
        print("\n".join(c.name for c in cases))
        return 0
    CONF.mkdir(parents=True, exist_ok=True)
    for rel, text in COMPONENTS.items():  # imports must exist before the cases render
        path = CONF / rel
        if not args.check and (not path.is_file() or path.read_text(encoding="utf-8") != text):
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text(text, encoding="utf-8")
    files = expected_files(cases)
    existing = _existing()
    stray = sorted(existing - set(files))
    if args.check:
        problems = [f"missing: {r}" for r in sorted(set(files) - existing)]
        problems += [f"stale: {r}" for r in sorted(set(files) & existing)
                     if (CONF / r).read_text(encoding="utf-8") != files[r]]
        problems += [f"stray: {r}" for r in stray]
        if problems:
            print("conformance corpus out of date (run python tools/gen_conformance.py):", file=sys.stderr)
            for p in problems[:50]:
                print("  " + p, file=sys.stderr)
            if len(problems) > 50:
                print(f"  … and {len(problems) - 50} more", file=sys.stderr)
            return 1
        print(f"conformance corpus current: {len(cases)} cases")
        return 0
    written = 0
    for rel, text in files.items():
        path = CONF / rel
        if not path.is_file() or path.read_text(encoding="utf-8") != text:
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text(text, encoding="utf-8")
            written += 1
    for rel in stray:
        (CONF / rel).unlink()
    print(f"{len(cases)} cases; {written} files written, {len(stray)} stray removed in {CONF}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
