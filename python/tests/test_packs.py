"""Every pack must load, map its elements to real render roles, scope its CSS and define tokens."""

import hashlib
import re
import unittest
from pathlib import Path

from tests.helpers import render  # noqa: F401  (puts src on sys.path)
from mockitdown.packs import BUILTIN_DIR, PackRegistry
from mockitdown.render.html import Renderer
from mockitdown import stylesheet

SHARED_PACKS = Path(__file__).resolve().parents[2] / "shared" / "packs"
#: R-PACK-018.C9: the length of a duplicated run of stylesheet lines.
RUN = 6


def duplicated_runs(files: dict[str, str], window: int = RUN) -> list[str]:
    """Every run of `window` consecutive kept lines that occurs twice, as "file:line" of each copy.

    The VibeItOut health report's measure of duplicated blocks: each line trimmed and its white space
    collapsed; lines shorter than four characters or without a word character are dropped."""
    kept: dict[str, list[tuple[int, str]]] = {}
    for name, text in files.items():
        lines = [(i, re.sub(r"\s+", " ", ln.strip())) for i, ln in enumerate(text.splitlines(), 1)]
        kept[name] = [(i, s) for i, s in lines if len(s) >= 4 and re.search(r"\w", s)]
    where: dict[str, list[str]] = {}
    for name, keep in kept.items():
        for k in range(len(keep) - window + 1):
            h = hashlib.sha1("\n".join(s for _, s in keep[k:k + window]).encode()).hexdigest()
            where.setdefault(h, []).append(f"{name}:{keep[k][0]}")
    return sorted(" = ".join(locs) for locs in where.values() if len(locs) > 1)


ROLES = {name[2:].replace("_", "-") for name in dir(Renderer) if name.startswith("r_")}


def split_top(sel: str):
    """Split a selector list at commas outside parentheses, brackets and quotes."""
    parts, buf, depth, quote = [], "", 0, ""
    for c in sel:
        if quote:
            buf += c
            if c == quote:
                quote = ""
            continue
        if c in "\"'":
            quote = c
        elif c in "([":
            depth += 1
        elif c in ")]":
            depth -= 1
        elif c == "," and depth == 0:
            parts.append(buf)
            buf = ""
            continue
        buf += c
    parts.append(buf)
    return parts


def selectors(css: str):
    css = re.sub(r"/\*.*?\*/", "", css, flags=re.S)
    depth, buf, out, i = 0, "", [], 0
    while i < len(css):
        c = css[i]
        if c == "{":
            sel = buf.strip()
            if sel.startswith("@keyframes"):
                # skip the whole keyframes block
                level, j = 1, i + 1
                while j < len(css) and level:
                    level += {"{": 1, "}": -1}.get(css[j], 0)
                    j += 1
                i, buf = j, ""
                continue
            if not sel.startswith("@"):
                out.append(sel)
            buf = ""
        elif c == "}":
            buf = ""
        elif c == ";" and buf.count("(") == buf.count(")") and buf.count('"') % 2 == 0:
            buf = ""
        else:
            buf += c
        i += 1
    return out


class PackTests(unittest.TestCase):
    def setUp(self):
        self.reg = PackRegistry()

    def test_packs_load_and_roles_exist(self):
        for pid in self.reg.ids():
            with self.subTest(pack=pid):
                pack = self.reg.get(pid)
                for name, el in pack.elements.items():
                    self.assertIn(el.role, ROLES, f"{pid}:{name} has unknown role {el.role}")
                self.assertTrue(pack.modules, f"{pid} declares no import modules")

    def test_css_is_scoped(self):
        for pid in self.reg.ids():
            if pid == "base":
                continue
            css_file = BUILTIN_DIR / pid / "pack.css"
            if not css_file.exists():
                continue
            with self.subTest(pack=pid):
                for sel in selectors(css_file.read_text(encoding="utf-8")):
                    for part in split_top(sel):
                        part = part.strip()
                        if not part or re.fullmatch(r"(from|to|\d+%)", part):
                            continue
                        self.assertTrue(part.startswith(f".mkd-pack-{pid} ") or part == f".mkd-pack-{pid}",
                                        f"{pid}: selector not scoped: {part!r}")

    def test_css_has_no_appearance_branching(self):
        for pid in self.reg.ids():
            css_file = BUILTIN_DIR / pid / "pack.css"
            if pid == "base" or not css_file.exists():
                continue
            text = css_file.read_text(encoding="utf-8")
            with self.subTest(pack=pid):
                self.assertNotIn("data-appearance", text)
                self.assertNotIn("prefers-color-scheme", text)

    def test_tokens_have_light_and_dark(self):
        base = self.reg.get("base")
        for pid in self.reg.ids():
            pack = self.reg.get(pid)
            with self.subTest(pack=pid):
                self.assertTrue(set(base.tokens["light"]) <= set(pack.tokens["light"]))
                self.assertTrue(pack.tokens["dark"], f"{pid} has no dark tokens")

    def test_module_names_are_unique(self):
        seen = {}
        for pid in self.reg.ids():
            for m in self.reg.get(pid).modules:
                self.assertNotIn(m.lower(), seen, f"import {m} claimed by {seen.get(m.lower())} and {pid}")
                seen[m.lower()] = pid

    def test_every_element_renders(self):
        from mockitdown import RenderOptions, render as r
        for pid in self.reg.ids():
            pack = self.reg.get(pid)
            for name in sorted(pack.elements):
                with self.subTest(pack=pid, element=name):
                    res = r(f"{name}()", RenderOptions(pack=pid))
                    self.assertFalse([d for d in res.errors if d.code != "argument"], [str(d) for d in res.errors])

    def test_no_duplicated_css_runs(self):
        """R-PACK-018 TC-2 (C9): no run of six stylesheet lines in two pack stylesheets or partials, or twice in one."""
        paths = sorted(SHARED_PACKS.glob("*/pack.css")) + sorted(SHARED_PACKS.glob("_partials/*.css"))
        self.assertGreater(len(paths), 30)
        files = {str(p.relative_to(SHARED_PACKS)): p.read_text(encoding="utf-8") for p in paths}
        dups = duplicated_runs(files)
        self.assertEqual(dups, [], f"{len(dups)} duplicated runs of {RUN} lines:\n" + "\n".join(dups[:40]))

    def test_duplicated_runs_measure(self):
        """R-PACK-018.V1: the check fails on a copied six-line run, within a file or across two."""
        block = "".join(f".x .y{i} {{ width: {i}px; }}\n" for i in range(6))
        self.assertEqual(len(duplicated_runs({"a.css": block, "b.css": "/* b */\n" + block})), 1)
        self.assertEqual(len(duplicated_runs({"a.css": block + "\n}\n" + block})), 1)
        self.assertEqual(duplicated_runs({"a.css": block, "b.css": block.replace("5px", "7px")}), [])

    def test_stylesheet_builds_for_all(self):
        css = stylesheet(None)
        self.assertGreater(len(css), 1000)


if __name__ == "__main__":
    unittest.main()
