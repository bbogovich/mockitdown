#!/usr/bin/env python3
"""Regenerate tests/fixtures/role-catalogue.json from the specification's role catalogue (REF.2).

    python tools/gen_role_catalogue.py            # from python/: write the fixture
    python tools/gen_role_catalogue.py --check    # exit 1 when the committed fixture is stale
    python tools/gen_role_catalogue.py --page PATH/roles.md

REF.2 is `specification/narrative/rendering/roles.md` on the `docs` branch. It is read from `--page`, else
from the docs worktree named in `.specitout/sdd.json` (`../mockitdown.docs`), else from git
(`docs:` or `origin/docs:`, as CI fetches it). The fixture keeps three facts per role from the "Roles"
table (core elements, parts, data attributes) and the `data-*` names of the "Common to every role" table.
"""

import argparse
import json
import re
import subprocess
import sys
from pathlib import Path

PYTHON = Path(__file__).resolve().parents[1]
REPO = PYTHON.parent
FIXTURE = PYTHON / "tests" / "fixtures" / "role-catalogue.json"
PAGE = "specification/narrative/rendering/roles.md"
SOURCE = "specification REF.2 (narrative/rendering/roles.md), the role catalogue; change both together"


class SourceMissing(Exception):
    """REF.2 is in neither the docs worktree nor git."""


def worktree() -> Path:
    try:
        sdd = json.loads((REPO / ".specitout" / "sdd.json").read_text(encoding="utf-8"))
        return (REPO / sdd["docs"]["worktree"]).resolve()
    except (OSError, KeyError, ValueError):
        return (REPO.parent / f"{REPO.name}.docs").resolve()


def read_page(page: str | None = None) -> str:
    if page:
        return Path(page).read_text(encoding="utf-8")
    local = worktree() / PAGE
    if local.is_file():
        return local.read_text(encoding="utf-8")
    for ref in ("docs", "origin/docs"):
        r = subprocess.run(["git", "-C", str(REPO), "show", f"{ref}:{PAGE}"], capture_output=True, text=True)
        if r.returncode == 0:
            return r.stdout
    raise SourceMissing(f"REF.2 not found: no {local} and no {PAGE} on docs or origin/docs")


def section(text: str, heading: str) -> list[str]:
    m = re.search(rf"^## {re.escape(heading)}\n(.*?)(?=^## |\Z)", text, flags=re.M | re.S)
    if not m:
        raise ValueError(f"REF.2 has no section '## {heading}'")
    return [line for line in m.group(1).splitlines() if line.startswith("|")]


def cells(line: str) -> list[str]:
    return [c.strip() for c in line.strip().strip("|").split("|")]


def names(cell: str) -> list[str]:
    """The backticked names of a cell; '—' is none."""
    return sorted(re.findall(r"`([^`]+)`", cell))


def common_data(text: str) -> list[str]:
    found = set()
    for line in section(text, "Common to every role")[2:]:
        found.update(re.findall(r"`data-([A-Za-z][\w-]*)", cells(line)[0]))
    if not found:
        raise ValueError("REF.2 'Common to every role' lists no data attributes")
    return sorted(found)


def roles(text: str) -> dict:
    rows = section(text, "Roles")
    head = cells(rows[0])
    if len(head) != 5 or head[0] != "Role":
        raise ValueError(f"REF.2 'Roles' table has an unexpected header: {head}")
    out = {}
    for line in rows[2:]:
        row = cells(line)
        if len(row) != 5:
            raise ValueError(f"REF.2 'Roles' row with {len(row)} cells: {line[:80]}")
        role, elements, _reads, parts, data = row
        name = re.fullmatch(r"`([a-z]+)`", role)
        if not name:
            raise ValueError(f"REF.2 'Roles' row without a role name: {line[:80]}")
        out[name.group(1)] = {"elements": names(elements), "parts": names(parts), "data": names(data)}
    return dict(sorted(out.items()))


def generate(text: str) -> str:
    doc = {"source": SOURCE, "common_data": common_data(text), "roles": roles(text)}
    return json.dumps(doc, indent=1, ensure_ascii=False) + "\n"


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("--check", action="store_true", help="fail when the committed fixture differs")
    ap.add_argument("--page", help="path of REF.2 (roles.md)")
    args = ap.parse_args(argv)
    try:
        out = generate(read_page(args.page))
    except (SourceMissing, ValueError) as e:
        print(f"gen_role_catalogue: {e}", file=sys.stderr)
        return 2
    current = FIXTURE.read_text(encoding="utf-8") if FIXTURE.is_file() else ""
    if args.check:
        if out != current:
            print(f"gen_role_catalogue: {FIXTURE.relative_to(REPO)} is stale; run python/tools/gen_role_catalogue.py",
                  file=sys.stderr)
            return 1
        return 0
    if out != current:
        FIXTURE.write_text(out, encoding="utf-8")
        print(f"wrote {FIXTURE.relative_to(REPO)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
