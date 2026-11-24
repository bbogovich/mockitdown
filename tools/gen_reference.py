#!/usr/bin/env python3
"""Generate the Reference section of the example site: one gallery page per pack.

    python tools/gen_reference.py            # write examples/site/docs/reference/*.md
    python tools/gen_reference.py --check    # exit 1 if a page is missing or out of date

Every element a pack offers is shown rendered in that pack's style, with its role, positional
arguments, defaults, variants and doc line, taken from `pack.json`. The pack's own elements come
first, then the core vocabulary it inherits. Hidden (easter-egg) packs are left out.

Samples are built from the element's parameter names (`label`, `items`, `values`, …) and its role
(containers get two children); each sample is rendered once here and simplified until it renders
without a diagnostic, so the generated pages build cleanly under `strict: true`.
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "src"))

from mockitdown import RenderOptions, render  # noqa: E402
from mockitdown.packs import registry  # noqa: E402

OUT = ROOT / "examples" / "site" / "docs" / "reference"

# Framework packs in the order of the example site's menus; packs not listed follow alphabetically.
KITS = ["fluent", "gtk", "qt", "avalonia", "kde-plasma",
        "mui", "angular-material", "sapui5", "bootstrap", "shadcn", "antd", "tailwind", "carbon", "primer",
        "swiftui", "android"]
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
              "gridrow", "radiogroup", "tabs", "board", "boardcolumn", "tree", "timeline", "canvas",
              "appbar", "toolbaritem", "labeled", "tooltip"}
CHILDREN = {
    "list": 'Text("First item"); Text("Second item")',
    "section": 'Text("First item"); Text("Second item")',
    "form": 'TextField("Name"); Toggle("Notifications", isOn: true)',
    "menu": 'Button("Open"); Button("Save"); Divider(); Button("Close")',
    "toolbar": 'Button("Save"); Button("Share")',
    "radiogroup": 'Radio("First", selected: true); Radio("Second")',
    "board": 'BoardColumn("To do") { KanbanCard("Write copy") }',
    "boardcolumn": 'KanbanCard("Write copy"); KanbanCard("Review")',
    "tree": 'TreeItem("Folder") { TreeItem("File") }',
    "timeline": 'TimelineItem("Created"); TimelineItem("Shipped")',
    "tabs": 'Text("First tab").tabItem { Text("One") }; Text("Second tab").tabItem { Text("Two") }',
}
EXTRA = {  # named arguments that make data roles show something
    "table": 'columns: ["Name", "Status"], rows: [["Ana Lima", "Active"], ["Ben Okafor", "Away"]]',
    "spreadsheet": 'columns: ["A", "B"], rows: [[1, 2], [3, 4]]',
    "chart": "values: [3, 5, 2, 6, 4]",
    "gantt": 'tasks: [("Design", 0, 3), ("Build", 2, 5)]',
}
SIZED = {"shape", "color", "skeleton", "image", "map", "media", "placeholder", "canvas"}
WIDE = {"table", "spreadsheet", "chart", "gantt", "schedule", "calendar", "board", "split", "navstack",
        "map", "media", "appbar", "sidebar", "dialog", "tabs", "timeline", "code", "canvas", "datepicker"}


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


def _clean(src: str, pid: str) -> bool:
    try:
        res = render(src, RenderOptions(pack=pid, device="fit"))
    except Exception:  # noqa: BLE001 - a crash simply disqualifies the sample
        return False
    return not res.diagnostics


def sample(name: str, e, pid: str) -> str:
    """The richest variant of a sample call that renders without diagnostics."""
    args = _args(e)
    named = EXTRA.get(e.role)
    kids = e.role in CONTAINERS
    tries = [(args, named, kids), (args, None, kids), (args, named, False), (args, None, False),
             (args[:1], None, False), ([], None, kids), ([], None, False)]
    for a, n, k in tries:
        src = _call(name, e, a, n, k, None)
        if _clean(src, pid):
            return src
    return f"{name}()"


def variants_sample(name: str, e, pid: str, base: str) -> str | None:
    vs = [v for v in (e.variants or ()) if isinstance(v, str)][:8]
    if not vs:
        return None
    args = _args(e)
    kids = e.role in CONTAINERS and base.endswith("}")
    lines = []
    for v in vs:
        call = _call(name, e, args, EXTRA.get(e.role) if EXTRA.get(e.role) and EXTRA[e.role] in base else None,
                     kids, v)
        lines.append(f'  VStack(alignment: .leading, spacing: 4) {{ {call}; Text({_q(v)}).font(.caption).foregroundStyle(.secondary) }}')
    src = "HStack(alignment: .top, spacing: 16) {\n" + "\n".join(lines) + "\n}"
    return src if _clean(src, pid) else None


def _cell(x) -> str:
    return str(x).replace("|", "\\|").replace("\n", " ")


def element_block(name: str, e, pid: str, own: bool) -> str:
    base = sample(name, e, pid)
    var = variants_sample(name, e, pid, base) if own else None
    body = var or base
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


def page(pid: str) -> str:
    reg = registry()
    p = reg.get(pid)
    own = sorted(p.own_elements) if p.parent is not None else sorted(p.elements)
    core = sorted(n for n in p.elements if n not in set(own))
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
    out += _grid([element_block(n, p.elements[n], pid, True) for n in own])
    if core:
        out += ["## Core vocabulary in this style", ""]
        out += _grid([element_block(n, p.elements[n], pid, False) for n in core])
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
    rest = [i for i in ids if i not in retro and i != "base"]
    kits = [i for i in KITS if i in rest] + sorted(i for i in rest if i not in KITS)
    out = [("Core", ["base"])]
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


def files() -> dict[Path, str]:
    out = {MKDOCS: mkdocs_text(), OUT / "index.md": index()}
    for _, ids in groups():
        for i in ids:
            out[OUT / f"{i}.md"] = page(i)
    return out


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--check", action="store_true")
    ap.add_argument("--nav", action="store_true", help="print the nav block")
    a = ap.parse_args()
    if a.nav:
        print(nav_yaml())
        return 0
    want = files()
    if a.check:
        stale = [p for p, t in want.items() if not p.exists() or p.read_text(encoding="utf-8") != t]
        for p in stale:
            print(f"stale: {p.relative_to(ROOT)}")
        return 1 if stale else 0
    OUT.mkdir(parents=True, exist_ok=True)
    for old in OUT.glob("*.md"):
        if old not in want:  # a pack that was removed
            old.unlink()
    for p, t in want.items():
        p.write_text(t, encoding="utf-8")
    print(f"wrote {len(want) - 1} pages to {OUT.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
