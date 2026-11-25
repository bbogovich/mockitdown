"""The gallery's design patterns in the Python variant (R-WEB-004.C3, C4).

`shared/patterns/` holds the design patterns the TypeScript pack gallery shows (`pages/packs.html`).
They are written in the core vocabulary, so both variants must render each of them in every shipped
pack without an error; `typescript/tests/unit/patterns.test.ts` checks the same in the TypeScript core.
"""

import json
import unittest

from tests.helpers import ROOT, render  # noqa: F401  (puts src on sys.path)
from mockitdown import RenderOptions
from mockitdown.packs import PackRegistry

PATTERNS = ROOT.parent / "shared" / "patterns"
REQUIRED = ("sign-in", "list-detail", "settings", "dashboard", "data-table", "wizard")


@unittest.skipUnless(PATTERNS.is_dir(), "no shared/ beside python/ (not a repository checkout)")
class PatternTests(unittest.TestCase):
    def setUp(self):
        index = json.loads((PATTERNS / "index.json").read_text(encoding="utf-8"))
        self.patterns = [(p["id"], (PATTERNS / p["file"]).read_text(encoding="utf-8")) for p in index["patterns"]]

    def test_required_patterns_are_listed(self):
        ids = [pid for pid, _ in self.patterns]
        for pid in REQUIRED:
            self.assertIn(pid, ids)

    def test_patterns_render_in_every_pack(self):
        packs = PackRegistry().ids()
        self.assertGreater(len(packs), 30)
        failures = []
        for pid, src in self.patterns:
            for pack in packs:
                result = render(src, RenderOptions(pack=pack))
                failures += [f"{pid} in {pack}: {d}" for d in result.errors]
                if "mkd-figure" not in result.html:
                    failures.append(f"{pid} in {pack}: no figure")
        self.assertEqual(failures, [])


if __name__ == "__main__":
    unittest.main()
