"""The role catalogue fixture is generated from REF.2 (tools/gen_role_catalogue.py, #83).

tests/fixtures/role-catalogue.json is what test_markup.py checks the renderer against (R-REND-002); it must
equal what the generator makes of REF.2. Skipped when REF.2 is in neither the docs worktree nor git (a
checkout without the docs branch).
"""

import importlib.util
import unittest

from tests.helpers import ROOT

_spec = importlib.util.spec_from_file_location("gen_role_catalogue", ROOT / "tools" / "gen_role_catalogue.py")
gen = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(gen)


def page():
    try:
        return gen.read_page()
    except gen.SourceMissing as e:
        raise unittest.SkipTest(str(e))


class RoleCatalogueFixtureTests(unittest.TestCase):

    def test_fixture_is_current(self):
        self.assertEqual(gen.generate(page()), gen.FIXTURE.read_text(encoding="utf-8"),
                         "tests/fixtures/role-catalogue.json is stale: run python tools/gen_role_catalogue.py")

    def test_check_detects_a_change(self):
        text = page()
        changed = text.replace("| `board` | `Board` | — | — | — |", "| `board` | `Board` | — | `lane` | — |")
        self.assertNotEqual(changed, text)
        self.assertNotEqual(gen.generate(changed), gen.generate(text))

    def test_unparseable_table_is_refused(self):
        with self.assertRaises(ValueError):
            gen.generate(page().replace("## Roles\n", "## Role list\n"))
