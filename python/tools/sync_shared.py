#!/usr/bin/env python3
"""Copy the shared assets the Python package publishes from `shared/` into the package (R-REPO-002).

    python tools/sync_shared.py            # bring the package copy up to date
    python tools/sync_shared.py --check    # exit 1 and list what differs

`shared/` (beside `python/`) is the only place the packs, the page stylesheet, the icon table and
the modifier vocabulary are written; the repository's `LICENSE` is copied beside `pyproject.toml` the
same way. The package never reads `shared/` at run time: `setup.py` runs `sync()` at every build from
a repository checkout (wheel, sdist, editable install), and the copies travel in the sdist, so a
build from the sdist needs no `shared/`. The copies are ignored by git.

Files are copied byte for byte and only read as data (JSON, CSS); nothing in them is executed.
"""

from __future__ import annotations

import argparse
import shutil
import sys
from pathlib import Path

PYTHON = Path(__file__).resolve().parents[1]
SHARED = PYTHON.parent / "shared"
PKG = PYTHON / "src" / "mockitdown"

#: shared/ file → its place in the package (packs keep their directory layout).
FIXED = {
    "css/page.css": "page.css",
    "icons/icons.json": "icons.json",
    "language/vocabulary.json": "vocabulary.json",
}
PACK_FILES = ("pack.json", "pack.css")
#: The repository's LICENSE goes beside pyproject.toml, where setuptools puts it into the dist-info.
LICENSE = (PYTHON.parent / "LICENSE", PYTHON / "LICENSE")


def pairs() -> list[tuple[Path, Path]]:
    """(source file, package copy) for every file the package publishes."""
    out = [LICENSE] + [(SHARED / s, PKG / d) for s, d in FIXED.items()]
    for pack in sorted((SHARED / "packs").iterdir()):
        for name in PACK_FILES:
            if (pack / name).is_file():
                out.append((pack / name, PKG / "packs" / pack.name / name))
    return out


def _extra_packs() -> list[Path]:
    """Pack directories in the package with no counterpart in shared/ (a removed pack)."""
    shared = {p.name for p in (SHARED / "packs").iterdir() if p.is_dir()}
    return [d for d in sorted((PKG / "packs").iterdir())
            if d.is_dir() and d.name not in shared and any((d / n).exists() for n in PACK_FILES)]


def stale() -> list[tuple[Path, str]]:
    """(package path, reason) for every copy that is missing, differs, or has no source."""
    out = []
    for src, dst in pairs():
        if not dst.is_file():
            out.append((dst, "missing"))
        elif dst.read_bytes() != src.read_bytes():
            out.append((dst, "differs"))
    out += [(d, "not in shared/") for d in _extra_packs()]
    return out


def sync() -> int:
    """Bring the package copy up to date; the number of paths written or removed."""
    if not SHARED.is_dir():
        return 0
    n = 0
    for src, dst in pairs():
        if not dst.is_file() or dst.read_bytes() != src.read_bytes():
            dst.parent.mkdir(parents=True, exist_ok=True)
            shutil.copyfile(src, dst)
            n += 1
    for d in _extra_packs():
        if not any(p.suffix == ".py" for p in d.rglob("*")):
            shutil.rmtree(d)
            n += 1
    return n


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    ap.add_argument("--check", action="store_true", help="report differences, change nothing")
    a = ap.parse_args()
    if not SHARED.is_dir():
        print(f"no shared/ at {SHARED}", file=sys.stderr)
        return 2
    if a.check:
        bad = stale()
        for p, why in bad:
            print(f"{why}: {p.relative_to(PYTHON)}")
        return 1 if bad else 0
    print(f"synced {sync()} path(s) from {SHARED.name}/ into {PKG.relative_to(PYTHON)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
