#!/usr/bin/env python3
"""Copy the shared assets the Python package publishes from `shared/` into the package (R-REPO-002).

    python tools/sync_shared.py            # bring the package copy up to date
    python tools/sync_shared.py --check    # exit 1 and list what differs

`shared/` (beside `python/`) is the only place the packs, the page stylesheet, the icon table and
the modifier vocabulary are written; the repository's `LICENSE` is copied beside `pyproject.toml` the
same way. The package never reads `shared/` at run time: `setup.py` runs `sync()` at every build from
a repository checkout (wheel, sdist, editable install), and the copies travel in the sdist, so a
build from the sdist needs no `shared/`. The copies are ignored by git.

Files are copied byte for byte and only read as data (JSON, CSS); nothing in them is executed. The
one exception is a `pack.css` that includes stylesheet partials (`@import "../_partials/<name>.css";`
lines at its top, R-PACK-018): its copy has each import replaced by the partial's text, with the
partial's placeholder scope `.mkd-scope` at the start of every selector replaced by the including
pack's `.mkd-pack-<id>`. `typescript/scripts/copy-shared.mjs` resolves partials by the same steps, so
both packages hold byte-identical `pack.css` copies; the partials themselves are not copied.
"""

from __future__ import annotations

import argparse
import re
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


#: An include line of a built-in pack's pack.css (R-PACK-018.C2), and the paths it may name.
IMPORT_LINE = re.compile(r'^[ \t]*@import[ \t]+"([^"]*)"[ \t]*;[ \t]*$')
PARTIAL_PATH = re.compile(r"^\.\./_partials/([A-Za-z0-9_-]+)\.css$")
#: The placeholder scope every selector of a partial starts with (R-PACK-018.C3).
SCOPE = ".mkd-scope"
#: White space as CSS defines it (not str.isspace, so that both builds agree on every character).
WS = " \t\n\r\f"
#: Words a partial must not contain (R-PACK-018.C3).
FORBIDDEN = ("@import", "data-appearance", "prefers-color-scheme")


class PartialError(ValueError):
    """A pack.css include that cannot be resolved, or a partial that breaks R-PACK-018.C3 (C6)."""


def _skip_comment_or_string(css: str, i: int) -> int:
    """The index after the comment or string starting at i, or i when none starts there."""
    if css.startswith("/*", i):
        j = css.find("*/", i + 2)
        return len(css) if j < 0 else j + 2
    if css[i] in "\"'":
        q, j = css[i], i + 1
        while j < len(css) and css[j] != q:
            j += 2 if css[j] == "\\" else 1
        return min(j + 1, len(css))
    return i


def _strip_comments(text: str) -> str:
    return re.sub(r"/\*.*?(\*/|\Z)", "", text, flags=re.S)


def selector_starts(css: str) -> list[tuple[int, str]]:
    """(offset, text) of every selector in a stylesheet: each comma-separated part of a rule's
    prelude, at its first character that is neither white space nor a comment. At-rule preludes
    (`@media …`) are not selectors, and the frames of `@keyframes` are skipped."""
    out: list[tuple[int, str]] = []
    i, seg, depth, n = 0, 0, 0, len(css)
    while i < n:
        j = _skip_comment_or_string(css, i)
        if j != i:
            i = j
            continue
        c = css[i]
        if c == "(":
            depth += 1
        elif c == ")":
            depth = max(depth - 1, 0)
        elif c == "{":
            prelude = _strip_comments(css[seg:i]).strip(WS)
            if re.match(r"@(-[a-z]+-)?keyframes\b", prelude):
                level, i = 1, i + 1
                while i < n and level:
                    j = _skip_comment_or_string(css, i)
                    if j != i:
                        i = j
                        continue
                    level += {"{": 1, "}": -1}.get(css[i], 0)
                    i += 1
                seg, depth = i, 0
                continue
            if not prelude.startswith("@"):
                out += _parts(css, seg, i)
            seg, depth = i + 1, 0
        elif c == "}" or (c == ";" and depth == 0):
            seg, depth = i + 1, 0
        i += 1
    return out


def _parts(css: str, start: int, end: int) -> list[tuple[int, str]]:
    """The selectors of the prelude css[start:end], split at commas outside brackets."""
    bounds, i, depth, first = [], start, 0, start
    while i < end:
        j = _skip_comment_or_string(css, i)
        if j != i:
            i = j
            continue
        c = css[i]
        if c in "([":
            depth += 1
        elif c in ")]":
            depth -= 1
        elif c == "," and depth == 0:
            bounds.append((first, i))
            first = i + 1
        i += 1
    bounds.append((first, end))
    out = []
    for a, b in bounds:
        while a < b:
            j = _skip_comment_or_string(css, a) if css.startswith("/*", a) else a
            if j != a:
                a = j
            elif css[a] in WS:
                a += 1
            else:
                break
        out.append((a, _strip_comments(css[a:b]).strip(WS)))
    return out


def scope_partial(css: str, pack_id: str, where: str) -> str:
    """The partial's text with every selector's leading `.mkd-scope` replaced by `.mkd-pack-<id>`;
    PartialError when the partial breaks R-PACK-018.C3."""
    for word in FORBIDDEN:
        if word in css:
            raise PartialError(f"{where}: a partial must not contain {word}")
    starts = selector_starts(css)
    for _, sel in starts:
        if not (sel == SCOPE or (sel.startswith(SCOPE) and sel[len(SCOPE)] in WS)):
            raise PartialError(f'{where}: selector "{sel}" does not start with {SCOPE}')
    for off, _ in reversed(starts):
        css = css[:off] + f".mkd-pack-{pack_id}" + css[off + len(SCOPE):]
    return css


def resolve_css(css: str, pack_id: str, partials: Path) -> str:
    """A built-in pack's stylesheet with its partials included (R-PACK-018.C4); unchanged when it
    includes none. PartialError names the pack and the path when an include cannot be resolved."""
    if "@import" not in css:
        return css
    out: list[str] = []
    in_comment, prelude = False, True
    for no, line in enumerate(re.findall(r"[^\n]*\n|[^\n]+\Z", css), 1):
        starts_in_comment = in_comment
        code, k = "", 0
        while k < len(line):
            if in_comment:
                j = line.find("*/", k)
                if j < 0:
                    k = len(line)
                else:
                    in_comment, k = False, j + 2
            elif line.startswith("/*", k):
                in_comment, k = True, k + 2
            else:
                code += line[k]
                k += 1
        m = None if starts_in_comment else IMPORT_LINE.match(line.rstrip("\r\n"))
        if m is None:
            if "@import" in code:
                where = "after the first rule" if not prelude else "not on a line of its own"
                raise PartialError(f"pack '{pack_id}': line {no}: @import {where}: {line.strip(WS)}")
            if code.strip(WS):
                prelude = False
            out.append(line)
            continue
        path = m.group(1)
        if not prelude:
            raise PartialError(f'pack \'{pack_id}\': line {no}: @import "{path}" after the first rule')
        pm = PARTIAL_PATH.match(path)
        if pm is None:
            raise PartialError(f'pack \'{pack_id}\': line {no}: @import "{path}" names a path outside ../_partials/')
        f = partials / f"{pm.group(1)}.css"
        if not f.is_file():
            raise PartialError(f'pack \'{pack_id}\': line {no}: @import "{path}": no such partial')
        body = scope_partial(f.read_text(encoding="utf-8"), pack_id, f'pack \'{pack_id}\': partial "{path}"')
        ending = line[len(line.rstrip("\r\n")):]
        if ending and not body.endswith(("\n", "\r")):
            body += ending
        out.append(body)
    return "".join(out)


def resolve_pack_css(packs: Path, pack_id: str) -> str:
    """The package copy of `<packs>/<pack_id>/pack.css`, partials resolved from `<packs>/_partials/`."""
    css = (Path(packs) / pack_id / "pack.css").read_text(encoding="utf-8")
    return resolve_css(css, pack_id, Path(packs) / "_partials")


def copy_bytes(src: Path) -> bytes:
    """What the package copy of a shared file holds: its bytes, or for a pack.css its resolved text."""
    src = Path(src)
    if src.name == "pack.css":
        raw = src.read_bytes()
        if b"@import" in raw:
            return resolve_pack_css(src.parent.parent, src.parent.name).encode("utf-8")
        return raw
    return src.read_bytes()


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
        elif dst.read_bytes() != copy_bytes(src):
            out.append((dst, "differs"))
    out += [(d, "not in shared/") for d in _extra_packs()]
    return out


def sync() -> int:
    """Bring the package copy up to date; the number of paths written or removed."""
    if not SHARED.is_dir():
        return 0
    n = 0
    for src, dst in pairs():
        data = copy_bytes(src)
        if not dst.is_file() or dst.read_bytes() != data:
            dst.parent.mkdir(parents=True, exist_ok=True)
            dst.write_bytes(data)
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
        try:
            bad = stale()
        except PartialError as e:
            print(f"error: {e}", file=sys.stderr)
            return 1
        for p, why in bad:
            print(f"{why}: {p.relative_to(PYTHON)}")
        return 1 if bad else 0
    try:
        n = sync()
    except PartialError as e:
        print(f"error: {e}", file=sys.stderr)
        return 1
    print(f"synced {n} path(s) from {SHARED.name}/ into {PKG.relative_to(PYTHON)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
