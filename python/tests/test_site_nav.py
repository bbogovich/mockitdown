"""R-PACK-012 TC-1: the example site's header tabs — six top-level sections, Gallery next to Demo,
sticky tabs. The built pages of both sites are checked again by the Pages workflow (R-WEB-004 TC-9)."""

import re
import unittest

from tests.helpers import ROOT

MKDOCS = ROOT / "examples" / "site" / "mkdocs.yml"
GALLERY = "https://bbogovich.github.io/mockitdown/gallery/"
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

    def test_tabs_are_enabled_and_sticky(self):
        features = re.findall(r"^    - (\S+)$", self.text.split("palette:")[0], re.M)
        self.assertIn("navigation.tabs", features)
        self.assertIn("navigation.tabs.sticky", features)


if __name__ == "__main__":
    unittest.main()
