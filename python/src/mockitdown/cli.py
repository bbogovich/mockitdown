"""``mockitdown`` command line.

    mockitdown render FILE [options] [--standalone] [-o OUT]   HTML fragment, or a full page
    mockitdown check FILE… [options]                            diagnostics; exit 1 on any error
    mockitdown css [--pack ID …] [-o OUT]                       the stylesheet (for css: none sites)
    mockitdown packs [--json]                                   the packs and their element names
    mockitdown elements PACK [--markdown]                       one pack's element catalogue

FILE may be ``-`` for stdin. Diagnostics go to stderr; ``check --json`` prints them as JSON.
Exit codes: 0 ok, 1 diagnostics with errors, 2 usage error.
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

from . import __version__
from .api import render, stylesheet
from .diagnostics import MockitdownError, Severity
from .options import APPEARANCES, RenderOptions
from .packs import registry
from .render.html import esc


def _read(path: str) -> tuple[str, Path | None]:
    if path == "-":
        return sys.stdin.read(), None
    p = Path(path)
    return p.read_text(encoding="utf-8"), p.resolve()


def _options(a: argparse.Namespace, source_path: Path | None) -> RenderOptions:
    return RenderOptions(
        pack=a.pack, default_pack=a.default_pack, device=a.device, appearance=a.appearance,
        width=a.width, height=a.height, chrome=a.chrome or "auto", title=a.title, windowed=a.windowed,
        menubar=a.menubar, app=a.app,
        elements=a.elements, import_paths=tuple(Path(p) for p in a.import_path),
        asset_paths=tuple(Path(p) for p in a.asset_path), pack_paths=tuple(Path(p) for p in a.pack_path),
        embed_assets=not a.no_embed, source_path=source_path,
    )


def _common(p: argparse.ArgumentParser) -> None:
    p.add_argument("--pack", help="pack id (overrides the source's import)")
    p.add_argument("--default-pack", default="base", help="pack when the source names none")
    p.add_argument("--device", help="phone | tablet | desktop | wide | fit | …")
    p.add_argument("--appearance", choices=APPEARANCES)
    p.add_argument("--width", type=int)
    p.add_argument("--height", type=int)
    p.add_argument("--chrome", help="auto | none | ios | ipados | macos | windows | android | browser")
    p.add_argument("--title")
    p.add_argument("--windowed", action="store_true", default=None,
                   help="draw the app as an iPadOS window over a wallpaper (ipados chrome)")
    p.add_argument("--menubar", nargs="?", const="true", metavar="MENU",
                   help="draw the macOS menu bar (macos chrome); MENU: the title of the menu drawn open")
    p.add_argument("--app", help="the application name in the macOS menu bar (default: the title)")
    p.add_argument("--elements", action="store_true", help="append the Elements table")
    p.add_argument("-I", "--import-path", action="append", default=[], help="directory for import \"…\"")
    p.add_argument("-A", "--asset-path", action="append", default=[], help="directory for Image(\"…\")")
    p.add_argument("-P", "--pack-path", action="append", default=[], help="directory of site packs")
    p.add_argument("--no-embed", action="store_true", help="link local images instead of inlining them")


def _print_diags(diags, file=None) -> None:
    for d in diags:
        print(str(d), file=file or sys.stderr)


def cmd_render(a: argparse.Namespace) -> int:
    src, path = _read(a.file)
    result = render(src, _options(a, path))
    _print_diags(result.diagnostics)
    out = result.html
    if a.standalone:
        css = stylesheet(result.packs or ["base"], pack_paths=tuple(Path(p) for p in a.pack_path))
        title = esc(a.title or (path.stem if path else "mockitdown"))
        out = (f'<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" '
               f'content="width=device-width,initial-scale=1"><title>{title}</title><style>body{{margin:0;'
               f'padding:24px;font-family:system-ui,sans-serif;background:#f3f4f6}}@media (prefers-color-scheme:'
               f'dark){{body{{background:#111;color:#eee}}}}</style><style>{css}</style></head><body>{out}</body></html>')
    if a.output:
        Path(a.output).write_text(out + "\n", encoding="utf-8")
    else:
        sys.stdout.write(out + "\n")
    return 1 if result.errors else 0


def cmd_check(a: argparse.Namespace) -> int:
    failed = False
    report = []
    for f in a.files:
        src, path = _read(f)
        result = render(src, _options(a, path))
        failed |= bool(result.errors)
        if a.json:
            report.append({"file": f, "ok": result.ok, "diagnostics": [
                {"severity": d.severity.value, "code": d.code, "message": d.message,
                 "line": d.location.line, "col": d.location.col, "source": d.location.source}
                for d in result.diagnostics]})
        else:
            _print_diags(result.diagnostics, sys.stdout)
            errors = len(result.errors)
            warnings = sum(1 for d in result.diagnostics if d.severity is Severity.WARNING)
            print(f"{f}: {'ok' if not errors else 'FAILED'} ({errors} errors, {warnings} warnings)")
    if a.json:
        print(json.dumps(report, indent=2))
    return 1 if failed else 0


def cmd_css(a: argparse.Namespace) -> int:
    css = stylesheet(a.pack or None, pack_paths=tuple(Path(p) for p in a.pack_path), minify=not a.pretty)
    if a.output:
        Path(a.output).parent.mkdir(parents=True, exist_ok=True)
        Path(a.output).write_text(css + "\n", encoding="utf-8")
    else:
        sys.stdout.write(css + "\n")
    return 0


def cmd_packs(a: argparse.Namespace) -> int:
    reg = registry(tuple(a.pack_path))
    rows = []
    for pid in reg.ids():
        p = reg.get(pid)
        if p.hidden and not a.all:
            continue
        rows.append({"id": p.id, "name": p.name, "framework": p.framework, "version": p.version,
                     "modules": list(p.modules), "device": p.device, "elements": len(p.elements),
                     "own_elements": list(p.own_elements)})
    if a.json:
        print(json.dumps(rows, indent=2))
    else:
        for r in rows:
            mods = ", ".join(r["modules"])
            print(f"{r['id']:<18} {r['name']:<22} {r['elements']:>4} elements  import {mods}")
    return 0


def cmd_elements(a: argparse.Namespace) -> int:
    pack = registry(tuple(a.pack_path)).get(a.pack)
    names = sorted(pack.own_elements if a.own else pack.elements)
    if a.markdown:
        print(f"| Element | Role | Arguments | Defaults | Notes |\n|---|---|---|---|---|")
        for n in names:
            e = pack.elements[n]
            defaults = ", ".join(f"{k}: {json.dumps(v)}" for k, v in e.defaults)
            own = "" if n in pack.own_elements or pack.parent is None else " *(core)*"
            print(f"| `{n}`{own} | {e.role} | {', '.join(e.params)} | {defaults} | {e.doc.replace('|', '/')} |")
    else:
        for n in names:
            e = pack.elements[n]
            print(f"{n:<28} {e.role:<12} {', '.join(e.params)}")
    return 0


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(prog="mockitdown", description="Render SwiftUI-syntax UI mockups to HTML.")
    ap.add_argument("--version", action="version", version=f"mockitdown {__version__}")
    sub = ap.add_subparsers(dest="cmd", required=True)
    p = sub.add_parser("render", help="render a mockup file to HTML")
    p.add_argument("file")
    _common(p)
    p.add_argument("--standalone", action="store_true", help="a full HTML page with the CSS inlined")
    p.add_argument("-o", "--output")
    p.set_defaults(func=cmd_render)
    p = sub.add_parser("check", help="report diagnostics for mockup files")
    p.add_argument("files", nargs="+")
    _common(p)
    p.add_argument("--json", action="store_true")
    p.set_defaults(func=cmd_check)
    p = sub.add_parser("css", help="write the stylesheet")
    p.add_argument("--pack", action="append", help="pack id (repeatable; default: all)")
    p.add_argument("-P", "--pack-path", action="append", default=[])
    p.add_argument("--pretty", action="store_true", help="do not minify")
    p.add_argument("-o", "--output")
    p.set_defaults(func=cmd_css)
    p = sub.add_parser("packs", help="list packs")
    p.add_argument("-P", "--pack-path", action="append", default=[])
    p.add_argument("--all", action="store_true", help=argparse.SUPPRESS)
    p.add_argument("--json", action="store_true")
    p.set_defaults(func=cmd_packs)
    p = sub.add_parser("elements", help="list a pack's elements")
    p.add_argument("pack")
    p.add_argument("-P", "--pack-path", action="append", default=[])
    p.add_argument("--markdown", action="store_true")
    p.add_argument("--own", action="store_true", help="only the pack's own elements, not inherited ones")
    p.set_defaults(func=cmd_elements)
    a = ap.parse_args(argv)
    try:
        return int(a.func(a))
    except (MockitdownError, OSError) as e:
        print(f"mockitdown: {e}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    sys.exit(main())
