#!/usr/bin/env python3
"""Regenerate the pack table and per-pack element catalogues on the specification's catalogue page.

    python tools/gen_catalogue.py ../mockitdown.docs/specification/narrative/packs/catalogue.md

Replaces the text between `<!-- packs-table -->` … `<!-- end packs-table -->` and between each
`<!-- catalogue: <id> … -->` … `<!-- end catalogue: <id> -->` (an end marker is added when missing).
"""

import io
import re
import sys
from contextlib import redirect_stdout
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "src"))

from mockitdown import cli  # noqa: E402
from mockitdown.packs import registry  # noqa: E402


def table() -> str:
    reg = registry()
    rows = ["| Pack id | Imitates | Version followed | Default device · chrome | Selected by | Own elements |",
            "|---|---|---|---|---|---|"]
    for pid in reg.ids():
        p = reg.get(pid)
        if p.hidden:
            continue
        mods = ", ".join(f"`import {m}`" for m in p.modules)
        rows.append(f"| `{p.id}` | {p.framework} | {p.version} | {p.device} · {p.chrome_for(p.device)} | "
                    f"`pack=\"{p.id}\"`, {mods} | {len(p.own_elements)} |")
    return "\n".join(rows)


def catalogue(pid: str) -> str:
    buf = io.StringIO()
    with redirect_stdout(buf):
        cli.main(["elements", pid, "--markdown", "--own"])
    return buf.getvalue().strip()


def main() -> int:
    page = Path(sys.argv[1])
    text = page.read_text(encoding="utf-8")
    text = re.sub(r"(<!-- packs-table -->\n).*?(\n<!-- end packs-table -->)",
                  lambda m: m.group(1) + table() + m.group(2), text, flags=re.S)
    for pid in registry().ids():
        if pid == "base" or registry().get(pid).hidden:
            continue
        start = re.search(rf"<!-- catalogue: {re.escape(pid)}\b[^>]*-->\n", text)
        if not start:
            continue
        end_marker = f"<!-- end catalogue: {pid} -->"
        end = text.find(end_marker, start.end())
        if end < 0:
            nxt = text.find("\n## ", start.end())
            end = nxt if nxt >= 0 else len(text)
            text = text[:end] + f"\n{end_marker}\n" + text[end:]
            end = text.find(end_marker, start.end())
        text = text[:start.end()] + "\n" + catalogue(pid) + "\n\n" + text[end:]
    page.write_text(text, encoding="utf-8")
    print(page)
    return 0


if __name__ == "__main__":
    sys.exit(main())
