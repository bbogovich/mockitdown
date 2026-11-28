"""The role rule table shared/language/roles.json (R-PACK-016 TC-1, TC-2; R-REPO-002 TC-3).

Python reads the table nowhere (rendering never consults it, R-PACK-016.C10); these tests check the
table itself against the Python renderer's roles and the packs, and that the package carries a copy.
The TypeScript suite runs the same checks (typescript/tests/unit/roles.test.ts).
"""

import json
import unittest
from importlib import resources

from mockitdown.render.html import Renderer
from tests.helpers import ROOT

SHARED = ROOT.parent / "shared"
CATEGORIES = {"frame", "bar", "layout", "collection", "content", "overlay", "annotation"}
ATTACH = {"frame": "child", "bar": "child", "layout": "child", "collection": "child", "content": "child",
          "overlay": "presentation", "annotation": "modifier"}
#: The render roles of the Python variant: its r_<role> methods.
ROLES = {name[2:] for name in dir(Renderer) if name.startswith("r_")}


def table():
    return json.loads(resources.files("mockitdown").joinpath("roles.json").read_text(encoding="utf-8"))


def expand(rules, accepts):
    """The roles an accepts list names (`@category` expanded)."""
    out = set()
    for entry in accepts:
        if entry.startswith("@"):
            out |= {r for r, rule in rules.items() if rule["category"] == entry[1:]}
        else:
            out.add(entry)
    return out


def accepts(t, parent_role, child_role):
    rule = t["root"] if parent_role is None else t["roles"][parent_role]
    return child_role in expand(t["roles"], rule["accepts"])


class RoleTableTests(unittest.TestCase):
    """R-PACK-016 TC-1 (C1, C2, C3, C4, C9)."""

    def setUp(self):
        self.t = table()

    def test_every_render_role_has_exactly_one_rule(self):  # C1, C9
        self.assertEqual(sorted(ROLES - set(self.t["roles"])), [], "render roles without a rule")
        self.assertEqual(sorted(set(self.t["roles"]) - ROLES), [], "rules for roles the renderer does not have")
        self.assertEqual(set(self.t), {"root", "roles"})
        self.assertEqual(set(self.t["root"]), {"accepts"})

    def test_rules_name_known_roles_categories_and_attach_modes(self):  # C1, C2, C3, C9
        roles = self.t["roles"]
        for role, rule in [(None, self.t["root"]), *roles.items()]:
            with self.subTest(role=role):
                if role is not None:
                    self.assertEqual(set(rule), {"title", "category", "accepts", "attach"})
                    self.assertIn(rule["category"], CATEGORIES)
                    self.assertEqual(rule["attach"], ATTACH[rule["category"]])
                    self.assertTrue(rule["title"])
                self.assertEqual(len(rule["accepts"]), len(set(rule["accepts"])), "duplicate entries")
                for entry in rule["accepts"]:
                    if entry.startswith("@"):
                        self.assertIn(entry[1:], CATEGORIES, entry)
                    else:
                        self.assertIn(entry, roles, entry)

    def test_source_examples_hold(self):  # C4 (SRC-12#s6.3)
        t = self.t
        roles = t["roles"]
        cat = {r: rule["category"] for r, rule in roles.items()}
        for f in [r for r, c in cat.items() if c == "frame"]:
            self.assertTrue(accepts(t, None, f), f"a {f} is accepted at the root")
            for stack in ("vstack", "hstack", "zstack", "card", "list"):
                self.assertFalse(accepts(t, stack, f), f"a {f} is refused in a {stack}")
        self.assertTrue(accepts(t, "split", "navstack"), "a frame as a split-view column")
        self.assertTrue(accepts(t, "tab", "navstack"), "a frame as a tab's content")
        self.assertEqual(expand(roles, roles["grid"]["accepts"]), {"gridrow"}, "a Grid accepts only GridRow")
        self.assertEqual(expand(roles, roles["toolbar"]["accepts"]), {"toolbaritem", "button", "select", "textfield"})
        for bar in ("appbar", "toolbar", "sidebar"):
            self.assertTrue(accepts(t, None, bar) and accepts(t, "navstack", bar) and accepts(t, "vstack", bar), bar)
        self.assertEqual(expand(roles, roles["list"]["accepts"]), {"listitem", "section"})
        self.assertEqual(expand(roles, roles["tree"]["accepts"]), {"treeitem"})
        self.assertEqual(expand(roles, roles["board"]["accepts"]), {"boardcolumn"})
        self.assertEqual(expand(roles, roles["boardcolumn"]["accepts"]), {"kanbancard"})
        self.assertTrue(accepts(t, "vstack", "text") and accepts(t, "vstack", "hstack"), "a layout holds layouts and content")
        for role, c in cat.items():
            if c == "content" and role not in ("button", "link", "unknown"):
                self.assertEqual(roles[role]["accepts"], [], f"{role} is a leaf")
        self.assertTrue(accepts(t, "button", "text") and accepts(t, "link", "label"), "a button or link holds its label")
        for role, c in cat.items():
            if c in ("overlay", "annotation"):
                self.assertFalse(accepts(t, "vstack", role), f"a {role} is attached, not placed in a stack")

    def test_pack_rules_narrow_their_role(self):  # C5, C9
        roles = self.t["roles"]
        narrowed = 0
        for f in sorted((SHARED / "packs").glob("*/pack.json")):
            for name, el in json.loads(f.read_text(encoding="utf-8")).get("elements", {}).items():
                if "rules" not in el:
                    continue
                narrowed += 1
                with self.subTest(pack=f.parent.name, element=name):
                    self.assertEqual(set(el["rules"]), {"accepts"})
                    mine = expand(roles, el["rules"]["accepts"])
                    self.assertTrue(mine <= expand(roles, roles[el["role"]]["accepts"]),
                                    f"{name}'s rules widen its role {el['role']}'s")
        self.assertGreater(narrowed, 0)
        fiori = json.loads((SHARED / "packs/sapui5/pack.json").read_text(encoding="utf-8"))["elements"]
        self.assertEqual(expand(roles, fiori["ObjectPageLayout"]["rules"]["accepts"]), {"section"})


class PackagedTableTests(unittest.TestCase):
    """R-PACK-016 TC-2 (C10), R-REPO-002 TC-3 (C8): the package carries roles.json beside vocabulary.json."""

    def test_package_holds_the_table_beside_the_vocabulary(self):
        pkg = resources.files("mockitdown")
        self.assertTrue(pkg.joinpath("vocabulary.json").is_file())
        if SHARED.is_dir():
            self.assertEqual(pkg.joinpath("roles.json").read_bytes(), (SHARED / "language/roles.json").read_bytes())
        else:
            self.assertTrue(pkg.joinpath("roles.json").is_file())

    def test_rendering_reports_nothing_from_the_rules(self):  # C10
        from mockitdown import render
        out = render('import SAPUI5\nObjectPageLayout { Text("not a section") }')
        self.assertEqual([d.message for d in out.diagnostics], [])


if __name__ == "__main__":
    unittest.main()
