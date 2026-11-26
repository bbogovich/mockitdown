"""The gallery's design patterns in the Python variant (R-WEB-004.C3, C4, C8, C14).

`shared/patterns/` holds the design patterns the TypeScript pack gallery shows (`pages/packs.html`).
Core patterns (no `packs` in `index.json`) are written in the core vocabulary, so both variants must
render each of them in every shipped pack without an error. A pack-specific pattern (`packs`, C14) is
shown only for its packs and may import their module; it must render in each of them with the
entry's `device`, `chrome`, `menubar`, `app` and `windowed`. `typescript/tests/unit/patterns.test.ts`
checks the same in the TypeScript core.
"""

import dataclasses
import json
import re
import unittest

from tests.helpers import ROOT, render  # noqa: F401  (puts src on sys.path)
from mockitdown import RenderOptions
from mockitdown.packs import PackRegistry

PATTERNS = ROOT.parent / "shared" / "patterns"
REQUIRED = ("sign-in", "list-detail", "settings", "dashboard", "data-table", "wizard")
#: The keys an index entry may carry (C8, C14).
KEYS = {"id", "title", "file", "packs", "device", "chrome", "menubar", "app", "windowed"}


def options(entry: dict, pack: str) -> RenderOptions:
    """The render options the gallery passes to the mockup element for `entry` in `pack`."""
    kw = {k: entry[k] for k in ("device", "chrome", "app") if k in entry}
    if "menubar" in entry:
        kw["menubar"] = entry["menubar"]
    if "windowed" in entry:
        kw["windowed"] = bool(entry["windowed"])
    return RenderOptions(pack=pack, **kw)


@unittest.skipUnless(PATTERNS.is_dir(), "no shared/ beside python/ (not a repository checkout)")
class PatternTests(unittest.TestCase):
    def setUp(self):
        index = json.loads((PATTERNS / "index.json").read_text(encoding="utf-8"))
        self.entries = index["patterns"]
        self.sources = {p["id"]: (PATTERNS / p["file"]).read_text(encoding="utf-8") for p in self.entries}
        self.core = [p for p in self.entries if "packs" not in p]
        self.specific = [p for p in self.entries if "packs" in p]

    def test_required_patterns_are_listed(self):
        ids = [p["id"] for p in self.core]
        for pid in REQUIRED:
            self.assertIn(pid, ids)
        self.assertEqual(len({p["id"] for p in self.entries}), len(self.entries))
        for p in self.entries:
            self.assertLessEqual(set(p), KEYS, p["id"])

    def test_core_patterns_import_nothing(self):
        for p in self.core:
            self.assertIsNone(re.search(r"^\s*import\b", self.sources[p["id"]], re.M), p["id"])

    def test_patterns_render_in_every_pack(self):
        packs = PackRegistry().ids()
        self.assertGreater(len(packs), 30)
        failures = []
        for p in self.core:
            for pack in packs:
                result = render(self.sources[p["id"]], RenderOptions(pack=pack))
                failures += [f"{p['id']} in {pack}: {d}" for d in result.errors]
                if "mkd-figure" not in result.html:
                    failures.append(f"{p['id']} in {pack}: no figure")
        self.assertEqual(failures, [])

    def test_tc5_pack_specific_patterns_render_in_their_packs(self):
        """TC-5 (C14): each pack-specific pattern renders in each of its packs with its options."""
        packs = PackRegistry().ids()
        failures = []
        for p in self.specific:
            self.assertTrue(p["packs"], p["id"])
            for pack in p["packs"]:
                self.assertIn(pack, packs, p["id"])
                for appearance in ("light", "dark"):
                    opts = dataclasses.replace(options(p, pack), appearance=appearance)
                    result = render(self.sources[p["id"]], opts)
                    failures += [f"{p['id']} in {pack} ({appearance}): {d}" for d in result.diagnostics]
                    if "mkd-figure" not in result.html:
                        failures.append(f"{p['id']} in {pack}: no figure")
        self.assertEqual(failures, [])

    def test_tc5_swiftui_has_phone_tablet_and_mac_apps(self):
        """TC-5 (C14): for swiftui an iPhone app, an iPad app and a Mac app with an open menu."""
        swift = [p for p in self.specific if "swiftui" in p["packs"]]
        devices = {p.get("device") for p in swift}
        self.assertLessEqual({"phone", "tablet", "desktop"}, devices)
        phone = next(p for p in swift if p.get("device") == "phone")
        self.assertRegex(self.sources[phone["id"]], r"TabView")
        self.assertRegex(self.sources[phone["id"]], r"NavigationStack")
        tablet = next(p for p in swift if p.get("device") == "tablet")
        self.assertRegex(self.sources[tablet["id"]], r"NavigationSplitView")
        self.assertRegex(self.sources[tablet["id"]], r"\bcontent:")
        mac = next(p for p in swift if p.get("device") == "desktop" and p.get("menubar"))
        src = self.sources[mac["id"]]
        for needle in ("NavigationSplitView", ".toolbar", ".commands", "CommandMenu", "CommandGroup"):
            self.assertIn(needle, src)
        html = render(src, options(mac, "swiftui")).html
        self.assertIn("mkd-menubar", html)
        self.assertIn("mkd-menubar__dropdown", html)


if __name__ == "__main__":
    unittest.main()
