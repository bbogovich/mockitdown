#!/usr/bin/env python3
"""Render a mockup (or every ```mockitdown block of a Markdown page) and screenshot it with
headless Chrome — for checking a pack's look by eye.

    python tools/snapshot.py FILE.mockitdown [--pack P] [--appearance both] -o out.png
    python tools/snapshot.py page.md --block 2 -o out.png      # the third block of a page
    python tools/snapshot.py page.md --all -o out.png           # every block, stacked

Needs Google Chrome (or Chromium; set CHROME=/path/to/binary). Not part of the package.
"""

from __future__ import annotations

import argparse
import os
import re
import shutil
import subprocess
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "src"))

from mockitdown import RenderOptions, render, stylesheet  # noqa: E402
from mockitdown.options import coerce_fence_options  # noqa: E402

FENCE = re.compile(r"^(?P<indent>[ \t]*)```mockitdown(?P<attrs>[^\n]*)\n(?P<body>.*?)^(?P=indent)```", re.M | re.S)
ATTR = re.compile(r'(\w+)="([^"]*)"|(\w+)=(\S+)')


def chrome_binary() -> str:
    for cand in (os.environ.get("CHROME"), "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
                 shutil.which("google-chrome"), shutil.which("chromium"), shutil.which("chromium-browser")):
        if cand and Path(cand).exists():
            return cand
    sys.exit("snapshot: Chrome not found; set CHROME")


def blocks(md: str) -> list[tuple[dict, str]]:
    out = []
    for m in FENCE.finditer(md):
        attrs = {(a or c): (b or d) for a, b, c, d in ATTR.findall(m.group("attrs"))}
        body = "\n".join(line[len(m.group("indent")):] for line in m.group("body").splitlines())
        out.append((attrs, body))
    return out


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("file")
    ap.add_argument("--block", type=int)
    ap.add_argument("--all", action="store_true")
    ap.add_argument("--pack")
    ap.add_argument("--appearance")
    ap.add_argument("--device")
    ap.add_argument("--width", type=int, default=1100, help="viewport width (CSS px)")
    ap.add_argument("--height", type=int, help="viewport height (CSS px)")
    ap.add_argument("-I", "--import-path", action="append", default=[])
    ap.add_argument("-o", "--output", required=True)
    a = ap.parse_args()
    path = Path(a.file).resolve()
    text = path.read_text(encoding="utf-8")
    items = blocks(text) if path.suffix == ".md" else [({}, text)]
    if path.suffix == ".md" and not a.all:
        items = [items[a.block or 0]]
    docs_root = next((p for p in path.parents if p.name == "docs"), path.parent)
    imports = tuple(Path(p) for p in a.import_path) or ((docs_root / "mockups", path.parent)
                                                        if (docs_root / "mockups").is_dir() else (path.parent,))
    base = RenderOptions(source_path=path, import_paths=imports, asset_paths=(docs_root,))
    html_parts, packs = [], []
    for attrs, body in items:
        typed, problems = coerce_fence_options(attrs)
        for p in problems:
            print("fence:", p, file=sys.stderr)
        opts = base.with_overrides(**typed).with_overrides(pack=a.pack, appearance=a.appearance, device=a.device)
        r = render(body, opts)
        for d in r.diagnostics:
            print(d, file=sys.stderr)
        html_parts.append(r.html)
        packs += [p for p in r.packs if p not in packs]
    css = stylesheet(packs or ["base"])
    page = (f"<!doctype html><html><head><meta charset='utf-8'><style>body{{margin:0;padding:24px;"
            f"background:#eef0f3;font-family:system-ui}}</style><style>{css}</style></head><body>"
            + "".join(html_parts) + "</body></html>")
    out = Path(a.output).resolve()
    f = out.with_suffix(".html")  # kept beside the PNG: Chrome cannot always read the system temp dir
    f.write_text(page, encoding="utf-8")
    height = a.height or (1300 * max(1, len(html_parts)) if a.all else 1300)
    subprocess.run([chrome_binary(), "--headless=new", "--disable-gpu", "--hide-scrollbars",
                    f"--window-size={a.width},{height}", f"--screenshot={out}", f.as_uri()],
                   check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    print(a.output)
    return 0


if __name__ == "__main__":
    sys.exit(main())
