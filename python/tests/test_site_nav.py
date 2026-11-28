"""R-PACK-012 TC-1: the example site's header tabs — six top-level sections, Gallery next to Demo,
sticky tabs; R-PACK-008 TC-1 step 6: the order of the Retro and Mobile groups. The built pages of both sites are checked again by the Pages workflow (R-WEB-004 TC-9)."""

import re
import unittest

from tests.helpers import ROOT

MKDOCS = ROOT / "examples" / "site" / "mkdocs.yml"
GALLERY = "https://bbogovich.github.io/mockitdown/gallery/"
#: R-PACK-008.C9: the Retro group by the year each system first appeared, and the Mobile group.
RETRO_ORDER = ["nls", "xerox-star", "lisa", "mac-classic", "gem", "win1", "geos", "win2", "amiga", "gsos", "nextstep",
               "riscos", "win31", "win95", "beos", "macos9", "cde", "aqua", "winxp", "vista"]
MOBILE_ORDER = ["swiftui", "android", "newton", "palm", "wince", "blackberry"]
TABS = ["Demo", "Gallery", "Definition", "Specification", "Implementation", "Reference"]


def top_level_nav(text: str) -> list[tuple[str, str]]:
    """The top-level entries of `nav:` as (title, value); value is '' for a section."""
    lines = text.split("\n")
    start = lines.index("nav:")
    entries = []
    for line in lines[start + 1:]:
        if line and not line.startswith((" ", "#")):
            break  # the next top-level key
        m = re.match(r"^  - ([^:]+):\s*(.*)$", line)
        if m:
            entries.append((m.group(1).strip().strip('"'), m.group(2).strip()))
    return entries


class TestSiteNav(unittest.TestCase):
    def setUp(self):
        self.text = MKDOCS.read_text(encoding="utf-8")

    def test_six_header_tabs_in_order(self):
        self.assertEqual([t for t, _ in top_level_nav(self.text)], TABS)

    def test_gallery_tab_links_the_published_gallery(self):
        nav = dict(top_level_nav(self.text))
        self.assertEqual(nav["Gallery"], GALLERY)

    def test_group_order(self):
        """R-PACK-008 TC-1 step 6 (C9): the Retro and Mobile groups in order, packs not yet built left out."""
        import json
        from mockitdown.packs import PackRegistry
        built = set(PackRegistry().ids())
        index = json.loads((ROOT.parent / "shared" / "reference" / "index.json").read_text(encoding="utf-8"))
        groups = {g["title"]: g["packs"] for g in index["groups"]}
        ref = self.text.split("  - Reference:\n", 1)[1]
        for title, order in (("Retro", RETRO_ORDER), ("Mobile", MOBILE_ORDER)):
            with self.subTest(group=title):
                expected = [p for p in order if p in built]
                self.assertEqual(groups[title], expected)
                section = ref.split(f"      - {title}:\n", 1)[1]
                section = section[:re.search(r"^      - |^  #|\Z", section, re.M).start()]
                pages = re.findall(r"reference/([\w-]+)\.md", section)
                self.assertEqual(pages, expected)

    def test_tabs_are_enabled_and_sticky(self):
        features = re.findall(r"^    - (\S+)$", self.text.split("palette:")[0], re.M)
        self.assertIn("navigation.tabs", features)
        self.assertIn("navigation.tabs.sticky", features)


if __name__ == "__main__":
    unittest.main()
