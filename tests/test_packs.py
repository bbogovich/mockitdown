"""Every pack must load, map its elements to real render roles, scope its CSS and define tokens."""

import re
import unittest

from tests.helpers import render  # noqa: F401  (puts src on sys.path)
from mockitdown.packs import BUILTIN_DIR, PackRegistry
from mockitdown.render.html import Renderer
from mockitdown import stylesheet

ROLES = {name[2:].replace("_", "-") for name in dir(Renderer) if name.startswith("r_")}


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
        elif c == ";" :
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
                    for part in sel.split(","):
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

    def test_stylesheet_builds_for_all(self):
        css = stylesheet(None)
        self.assertGreater(len(css), 1000)


if __name__ == "__main__":
    unittest.main()
