#!/usr/bin/env python3
"""Generate the Reference section of the example site: one gallery page per pack.

    python tools/gen_reference.py            # write examples/site/docs/reference/*.md and
                                             #   ../shared/reference/*.json
    python tools/gen_reference.py --check    # exit 1 if a page or JSON file is missing or out of date

Every element a pack offers is shown rendered in that pack's style, with its role, positional
arguments, defaults, variants and doc line, taken from `pack.json`. The pack's own elements come
first, then the core vocabulary it inherits. Hidden (easter-egg) packs are left out.

An element's sample is the `sample` its `pack.json` entry declares (R-PACK-013), used verbatim; a
declared sample that renders with a diagnostic stops the generator, naming the pack and the element.
Otherwise the sample is built from the element's parameter names (`label`, `items`, `values`, …) and
its role (containers get two children, pickers options and a selection, date pickers a date, a tab a
place in a `TabView`), rendered once here and simplified until it renders without a diagnostic, so the
generated pages build cleanly under `strict: true`. The variants sample shows the sample once per
variant (`.variant("…")`), side by side and captioned.

The same data is written as JSON for the TypeScript variant's pack gallery (R-REPO-003.C5,
R-WEB-004): `shared/reference/<pack>.json` per listed pack and `shared/reference/index.json` with the
menu groups. Shape of `<pack>.json`::

    {"id", "name", "framework", "version", "modules": [...], "device", "chrome", "group",
     "elements": [{"name", "role", "params": [...], "defaults": {...}, "variants": [...], "doc",
                   "own": bool, "sample": "<source>", "variants_sample": "<source>" | null}, ...]}

Elements are in page order: the pack's own elements first, then the inherited core vocabulary, each
sorted by name. `index.json` is `{"groups": [{"title", "packs": [id, ...]}, ...]}`.
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "src"))

from mockitdown import RenderOptions, render  # noqa: E402
from mockitdown.packs import registry  # noqa: E402

OUT = ROOT / "examples" / "site" / "docs" / "reference"
JSON_OUT = ROOT.parent / "shared" / "reference"

# Framework packs in the order of the example site's menus; packs not listed follow alphabetically.
KITS = ["fluent", "gtk", "qt", "avalonia", "kde-plasma",
        "mui", "angular-material", "sapui5", "bootstrap", "shadcn", "antd", "tailwind", "carbon", "primer",
        "vuetify", "prime",
        "swiftui", "android"]
WIREFRAME = ["sketch"]  # alternative wireframe looks of the core vocabulary, listed after Core
KIND_TITLES = {"desktop": "Desktop", "web": "Web", "mobile": "Mobile"}
# Retro packs in chronological order of the version they imitate (as in the example site's nav).
RETRO = ["nls", "xerox-star", "lisa", "mac-classic", "win1", "win2", "gsos", "nextstep", "win31",
         "win95", "macos9", "cde", "aqua", "winxp", "vista"]

STR = {"label": "Label", "title": "Title", "text": "Text", "content": "Content", "name": "Ana Lima",
       "message": "Message", "placeholder": "Placeholder", "header": "Header", "subtitle": "Subtitle",
       "summary": "Summary", "description": "Description", "primary": "Primary", "brand": "Brand",
       "status": "Status", "detail": "Detail", "footer": "Footer", "shortcut": "⌘S",
       "initials": "AL", "code": "let total = items.count", "icon": "star", "keySequence": "Ctrl+S",
       "image": "assets/images/photo-1.svg", "url": "assets/images/photo-1.svg",
       "src": "assets/images/photo-1.svg", "href": "#", "date": "2026-11-24", "time": "09:41"}
LISTS = {"items": '["One", "Two", "Three"]', "steps": '["Cart", "Shipping", "Payment"]',
         "values": "[3, 5, 2, 6, 4]", "columns": '["Name", "Status"]', "options": '["One", "Two"]',
         "keys": '["⌘", "K"]'}
NUMS = {"number": "1", "count": "3", "percent": "60", "level": "1"}
NUMERIC_VALUE_ROLES = {"progress", "slider", "rating", "stepper", "stat", "chart", "gauge"}

CONTAINERS = {"vstack", "hstack", "zstack", "group", "scroll", "section", "form", "card", "list",
              "navstack", "split", "sidebar", "toolbar", "menu", "dialog", "accordion", "grid",
              "gridrow", "tabs", "board", "boardcolumn", "tree", "timeline", "canvas",
              "appbar", "toolbaritem", "labeled", "tooltip", "tablerow"}
CHILDREN = {
    "list": 'Text("First item"); Text("Second item")',
    "section": 'Text("First item"); Text("Second item")',
    "form": 'TextField("Name"); Toggle("Notifications", isOn: true)',
    "menu": 'Button("Open"); Button("Save"); Divider(); Button("Close")',
    "toolbar": 'Button("Save"); Button("Share")',
    "board": 'BoardColumn("To do") { KanbanCard("Write copy") }',
    "boardcolumn": 'KanbanCard("Write copy"); KanbanCard("Review")',
    "tree": 'TreeItem("Folder") { TreeItem("File") }',
    "timeline": 'TimelineItem("Created"); TimelineItem("Shipped")',
    "tablerow": 'Text("Ana Lima"); Text("Active")',
    "tabs": 'Text("First tab").tabItem { Text("One") }; Text("Second tab").tabItem { Text("Two") }',
}
EXTRA = {  # named arguments that make data roles show something
    "table": 'columns: ["Name", "Status"], rows: [["Ana Lima", "Active"], ["Ben Okafor", "Away"]]',
    "spreadsheet": 'columns: ["A", "B"], rows: [[1, 2], [3, 4]]',
    "chart": "values: [3, 5, 2, 6, 4]",
    "gantt": 'tasks: [("Design", 0, 3), ("Build", 2, 5)]',
    "select": 'options: ["Small", "Medium", "Large"], selection: "Medium"',
    "radiogroup": 'options: ["Small", "Medium", "Large"], selection: "Medium"',
    "segmented": 'options: ["Day", "Week", "Month"], selection: "Week"',
    "datepicker": 'selection: "2026-11-23"',
}
#: Roles whose EXTRA names the options: left out when a positional argument already gave a list.
OPTION_ROLES = {"select", "radiogroup", "segmented"}
#: The two tabs a tab-role element is shown with, inside a `TabView` (R-PACK-013.C4).
TAB_LABELS = ("Inbox", "Archive")
SIZED = {"shape", "color", "skeleton", "image", "map", "media", "placeholder", "canvas"}
WIDE = {"table", "spreadsheet", "chart", "gantt", "schedule", "calendar", "board", "split", "navstack",
        "map", "media", "appbar", "sidebar", "dialog", "tabs", "timeline", "code", "canvas", "datepicker"}


class SampleError(Exception):
    """A declared sample that cannot be shown: the generator stops (R-PACK-013.C2)."""


def _q(s: str) -> str:
    return '"' + s.replace("\\", "\\\\").replace('"', '\\"') + '"'


def _args(e) -> list[str]:
    out = []
    has_default = {k for k, _ in (e.defaults or ())}
    for p in e.params or ():
        if p in has_default:
            break  # keep the element's own default (and everything after it, being positional)
        if e.role == "icon" and p in ("name", "icon", "systemName"):
            out.append(_q("star"))
        elif e.role in ("image", "media") and p in ("name", "url", "image", "src"):
            out.append(_q("assets/images/photo-1.svg"))
        elif p == "color":
            out.append(".blue")
        elif p == "kind" and e.role == "pointer":
            out.append(".arrow")
        elif p == "value":
            out.append("60" if e.role in NUMERIC_VALUE_ROLES else _q("Value"))
        elif p == "checked":
            out.append("true")
        elif p in STR:
            out.append(_q(STR[p]))
        elif p in LISTS:
            out.append(LISTS[p])
        elif p in NUMS:
            out.append(NUMS[p])
        else:
            break  # positional order: stop at the first parameter we cannot fill
    return out


def _call(name: str, e, args: list[str], named: str | None, children: bool, variant: str | None) -> str:
    parts = list(args) + ([named] if named else [])
    src = f"{name}({', '.join(parts)})"
    if children:
        src += " { " + CHILDREN.get(e.role, 'Text("Content"); Button("Action")') + " }"
    if variant is not None:
        src += f".variant({_q(variant)})"
    if e.role in SIZED:
        src += ".frame(width: 160, height: 96)"
    return src


def _diagnostics(src: str, pid: str) -> list[str] | None:
    """The diagnostics of `src` rendered at fit in pack `pid` (None when it crashes)."""
    try:
        res = render(src, RenderOptions(pack=pid, device="fit"))
    except Exception:  # noqa: BLE001 - a crash simply disqualifies the sample
        return None
    return [f"{d.code}: {d.message}" for d in res.diagnostics]


def _clean(src: str, pid: str) -> bool:
    return _diagnostics(src, pid) == []


def _declared(name: str, e, pid: str, src: str) -> str:
    """A declared sample, verbatim, or SampleError naming the pack and the element (R-PACK-013.C2)."""
    diags = _diagnostics(src, pid)
    if diags is None:
        raise SampleError(f"pack {pid!r}, element {name!r}: the declared sample does not render: {src}")
    if diags:
        raise SampleError(f"pack {pid!r}, element {name!r}: the declared sample renders with diagnostics "
                          f"({'; '.join(diags)}): {src}")
    return src


def _tab_sample(name: str, e, args: list[str]) -> str:
    """A tab-role element as two tabs of a `TabView` (a lone tab shows nothing of its job)."""
    if not args or not args[0].startswith('"'):
        return f"TabView {{ {name}() {{ Text(\"First tab\") }}; {name}() {{ Text(\"Second tab\") }} }}"
    one, two = TAB_LABELS
    rest = "".join(", " + a for a in args[1:])
    return (f"TabView {{ {name}({_q(one)}{rest}) {{ Text({_q(one + ' content')}) }}; "
            f"{name}({_q(two)}{rest}) {{ Text({_q(two + ' content')}) }} }}")


def _named(e, args: list[str]) -> str | None:
    named = EXTRA.get(e.role)
    if (e.role in OPTION_ROLES or e.role == "chart") and any(a.startswith("[") for a in args):
        return None  # a positional argument already gave the list
    return named


def sample(name: str, e, pid: str) -> str:
    """The declared sample, else the richest generic sample call that renders without diagnostics."""
    if getattr(e, "sample", ""):
        return _declared(name, e, pid, e.sample)
    args = _args(e)
    if e.role == "tab":
        for src in (_tab_sample(name, e, args), _tab_sample(name, e, [])):
            if _clean(src, pid):
                return src
    named = _named(e, args)
    kids = e.role in CONTAINERS
    tries = [(args, named, kids), (args, None, kids), (args, named, False), (args, None, False),
             (args[:1], None, False), ([], None, kids), ([], None, False)]
    for a, n, k in tries:
        src = _call(name, e, a, n, k, None)
        if _clean(src, pid):
            return src
    return f"{name}()"


def _variant_row(cells: list[tuple[str, str]]) -> str:
    """Variants side by side at their natural size, each captioned (R-PACK-013.C5)."""
    lines = []
    for v, call in cells:
        call = call.replace("\n", "\n    ")
        lines.append(f'  VStack(alignment: .leading, spacing: 4) {{ {call}; '
                     f'Text({_q(v)}).font(.caption).foregroundStyle(.secondary) }}')
    return "HStack(alignment: .top, spacing: 24) {\n" + "\n".join(lines) + "\n}"


def variants_sample(name: str, e, pid: str, base: str) -> str | None:
    vs = [v for v in (e.variants or ()) if isinstance(v, str)][:8]
    if not vs:
        return None
    if getattr(e, "sample", ""):
        # The declared sample with each variant (R-PACK-013.C2): it must be a call of the element itself.
        if not (base.startswith(name + "(") or base.startswith(name + " {") or base.startswith(name + "{")):
            raise SampleError(f"pack {pid!r}, element {name!r}: the element has variants, so its declared "
                              f"sample must be a call of {name}: {base}")
        return _declared(name, e, pid, _variant_row([(v, f"{base}.variant({_q(v)})") for v in vs]))
    args = _args(e)
    kids = e.role in CONTAINERS and base.endswith("}")
    named = _named(e, args)
    cells = [(v, _call(name, e, args, named if named and named in base else None, kids, v)) for v in vs]
    src = _variant_row(cells)
    return src if _clean(src, pid) else None


def _cell(x) -> str:
    return str(x).replace("|", "\\|").replace("\n", " ")


def element_data(name: str, e, pid: str, own: bool) -> dict:
    """One element of a pack, with its rendered-clean samples (the JSON entry and the page card)."""
    base = sample(name, e, pid)
    return {"name": name, "role": e.role, "params": list(e.params or ()),
            "defaults": {k: v for k, v in (e.defaults or ())}, "variants": list(e.variants or ()),
            "doc": e.doc or "", "own": own, "sample": base,
            "variants_sample": variants_sample(name, e, pid, base) if own else None}


def element_block(name: str, e, pid: str, own: bool, data: dict | None = None) -> str:
    d = data or element_data(name, e, pid, own)
    var = d["variants_sample"]
    body = var or d["sample"]
    wide = e.role in WIDE or var is not None
    props = [f"role `{e.role}`"]
    if e.params:
        props.append("arguments " + ", ".join(f"`{p}`" for p in e.params))
    if e.defaults:
        props.append("defaults " + ", ".join(f"`{k}: {v!r}`".replace("'", '"') for k, v in e.defaults))
    if e.variants:
        props.append("variants " + ", ".join(f"`{v}`" for v in e.variants))
    lines = [f'<div class="ref-card{" ref-card--wide" if wide else ""}" markdown>', "",
             f"### `{name}`", ""]
    if e.doc:
        lines += [_cell(e.doc), ""]
    lines += ['<p class="ref-props">' + _html(" · ".join(props)) + "</p>", ""]
    lines += [f'```mockitdown pack="{pid}" device="fit" source="true"', body, "```", "", "</div>", ""]
    return "\n".join(lines)


def _html(text: str) -> str:
    """Inline `code` spans to <code>, the rest escaped (the props line is raw HTML)."""
    import html as _h
    parts = text.split("`")
    return "".join(f"<code>{_h.escape(p)}</code>" if i % 2 else _h.escape(p) for i, p in enumerate(parts))


def _grid(blocks: list[str]) -> list[str]:
    return ['<div class="ref-grid" markdown>', "", *blocks, "</div>", ""]


def _split(p) -> tuple[list[str], list[str]]:
    """(own element names, inherited core names), each sorted."""
    own = sorted(p.own_elements) if p.parent is not None else sorted(p.elements)
    return own, sorted(n for n in p.elements if n not in set(own))


def pack_elements(pid: str) -> list[dict]:
    p = registry().get(pid)
    own, core = _split(p)
    return [element_data(n, p.elements[n], pid, True) for n in own] + \
           [element_data(n, p.elements[n], pid, False) for n in core]


def page(pid: str, elements: list[dict] | None = None) -> str:
    reg = registry()
    p = reg.get(pid)
    own, core = _split(p)
    data = {d["name"]: d for d in (elements or pack_elements(pid))}
    mods = ", ".join(f"`import {m}`" for m in p.modules) or "—"
    head = [f"# {p.name}", "",
            "<!-- GENERATED by tools/gen_reference.py from the pack's pack.json — do not edit. -->", "",
            f"**Imitates:** {p.framework} {p.version} · **Pack id:** `{p.id}` · **Selected by:** "
            f'`pack="{p.id}"`, {mods} · **Default device:** {p.device} ({p.chrome_for(p.device)} chrome)', "",
            f"{len(own)} {'own ' if p.parent is not None else ''}elements"
            + (f", plus {len(core)} core elements in this pack's style." if core else "."),
            "Each entry shows the element rendered with sample arguments (and, for the pack's own",
            "elements, each of its variants), the role it maps onto, its positional arguments, its",
            "defaults and variants.", ""]
    out = head + [f"## {'Pack elements' if p.parent is not None else 'Core vocabulary'}", ""]
    out += _grid([element_block(n, p.elements[n], pid, True, data[n]) for n in own])
    if core:
        out += ["## Core vocabulary in this style", ""]
        out += _grid([element_block(n, p.elements[n], pid, False, data[n]) for n in core])
    return "\n".join(out).rstrip() + "\n"


def kind(p) -> str:
    """desktop · web · mobile, from the pack's default device and its chrome."""
    if p.chrome_for(p.device) == "browser":
        return "web"
    return "mobile" if p.device in ("phone", "tablet") else "desktop"


def groups() -> list[tuple[str, list[str]]]:
    reg = registry()
    ids = [i for i in reg.ids() if not reg.get(i).hidden]
    retro = [i for i in RETRO if i in ids]
    wire = [i for i in WIREFRAME if i in ids]
    rest = [i for i in ids if i not in retro and i not in wire and i != "base"]
    kits = [i for i in KITS if i in rest] + sorted(i for i in rest if i not in KITS)
    out = [("Core", ["base"])] + ([("Wireframe", wire)] if wire else [])
    out += [(t, [i for i in kits if kind(reg.get(i)) == k]) for k, t in KIND_TITLES.items()]
    return out + [("Retro", retro)]


def index() -> str:
    reg = registry()
    out = ["# Reference", "",
           "<!-- GENERATED by tools/gen_reference.py — do not edit. -->", "",
           "One page per pack: every element it offers, rendered in its style, with the role it maps",
           "onto, its arguments, defaults and variants. **Core** is the vocabulary every pack inherits.", ""]
    for title, ids in groups():
        out += [f"## {title}", "", "| Pack | Imitates | Selected by | Elements |", "|---|---|---|---|"]
        for i in ids:
            p = reg.get(i)
            mods = ", ".join(f"`{m}`" for m in p.modules) or "—"
            out.append(f"| [{p.name}]({i}.md) | {p.framework} {p.version} | {mods} | {len(p.elements)} |")
        out.append("")
    return "\n".join(out)


def nav_yaml() -> str:
    """The Reference block of the example site's nav (pasted by `--nav`)."""
    reg = registry()
    lines = ["  - Reference:", "      - Overview: reference/index.md"]
    for title, ids in groups():
        if title == "Core":
            lines.append(f"      - Core (base): reference/base.md")
            continue
        lines.append(f"      - {title}:")
        lines += [f"          - {reg.get(i).name}: reference/{i}.md" for i in ids]
    return "\n".join(lines)


MKDOCS = ROOT / "examples" / "site" / "mkdocs.yml"
BEGIN, END = "  # >>> reference nav (generated by tools/gen_reference.py)\n", "  # <<< reference nav\n"


def mkdocs_text() -> str:
    """mkdocs.yml with the Reference nav block between the markers regenerated."""
    s = MKDOCS.read_text(encoding="utf-8")
    i, j = s.index(BEGIN) + len(BEGIN), s.index(END)
    return s[:i] + nav_yaml() + "\n" + s[j:]


def _json(obj) -> str:
    return json.dumps(obj, ensure_ascii=False, indent=1) + "\n"


def pack_json(pid: str, group: str, elements: list[dict]) -> str:
    p = registry().get(pid)
    return _json({"id": p.id, "name": p.name, "framework": p.framework, "version": p.version,
                  "modules": list(p.modules), "device": p.device, "chrome": p.chrome_for(p.device),
                  "group": group, "elements": elements})


def files() -> dict[Path, str]:
    out = {MKDOCS: mkdocs_text(), OUT / "index.md": index(),
           JSON_OUT / "index.json": _json({"groups": [{"title": t, "packs": ids} for t, ids in groups()]})}
    for title, ids in groups():
        for i in ids:
            elements = pack_elements(i)
            out[OUT / f"{i}.md"] = page(i, elements)
            out[JSON_OUT / f"{i}.json"] = pack_json(i, title, elements)
    return out


def _rel(p: Path) -> Path:
    return p.relative_to(ROOT.parent)


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--check", action="store_true")
    ap.add_argument("--nav", action="store_true", help="print the nav block")
    a = ap.parse_args()
    if a.nav:
        print(nav_yaml())
        return 0
    try:
        want = files()
    except SampleError as e:
        print(f"error: {e}", file=sys.stderr)
        return 1
    if a.check:
        stale = [p for p, t in want.items() if not p.exists() or p.read_text(encoding="utf-8") != t]
        for p in stale:
            print(f"stale: {_rel(p)}")
        return 1 if stale else 0
    OUT.mkdir(parents=True, exist_ok=True)
    JSON_OUT.mkdir(parents=True, exist_ok=True)
    for old in [*OUT.glob("*.md"), *JSON_OUT.glob("*.json")]:
        if old not in want:  # a pack that was removed
            old.unlink()
    for p, t in want.items():
        p.write_text(t, encoding="utf-8")
    pages = sum(1 for p in want if p.suffix == ".md")
    print(f"wrote {pages} pages to {_rel(OUT)} and {len(want) - pages - 1} files to {_rel(JSON_OUT)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
