"""Dotted element names (R-EVAL-003.C9, C10; F-2.C7, AC4): `Badge.Ribbon(…)` calls the pack's joined name.

TC-2 (C9, C10) of R-EVAL-003. The expected fragments are written by hand from the clauses and the antd
pack's `BadgeRibbon` (role badge, variant ribbon), not taken from a rendering.
"""

import unittest

from tests.helpers import ROOT  # noqa: F401  (puts src/ on sys.path)
from mockitdown import render

RIBBON = ('<span class="mkd-badge" data-el="Badge.Ribbon" data-variant="ribbon">'
          '<span class="mkd-badge__label">New</span></span>')


def diags(r):
    return [(d.severity.value, d.code, d.message) for d in r.diagnostics]


class DottedNameTests(unittest.TestCase):
    def test_dotted_call_renders_the_joined_element(self):  # TC-2 (C9, C10), F-2.AC4
        dotted = render('Badge.Ribbon("New")', pack="antd")
        joined = render('BadgeRibbon("New")', pack="antd")
        self.assertIn(RIBBON, dotted.html)
        self.assertEqual(diags(dotted), [])
        self.assertEqual(dotted.html.replace('data-el="Badge.Ribbon"', 'data-el="BadgeRibbon"'), joined.html)

    def test_dotted_call_with_modifiers_and_as_a_value(self):  # TC-2 (C9)
        r = render('let r = Badge.Ribbon("New")\nVStack { r\n  Badge.Ribbon("New").padding() }', pack="antd")
        self.assertEqual(r.html.count('data-el="Badge.Ribbon"'), 2)
        self.assertEqual(diags(r), [])

    def test_color_member_is_still_a_colour(self):  # TC-2 (C9)
        r = render('Color.red', pack="antd")
        self.assertIn('data-el="Color" data-color="red"', r.html)
        self.assertEqual(diags(r), [])

    def test_unresolved_dotted_call_is_unknown_with_the_dotted_name(self):  # TC-2 (C10)
        r = render('Nope.Thing { Text("in") }', pack="antd")
        self.assertEqual(diags(r), [("error", "unknown", "'Nope.Thing' is not an element of pack 'antd' and no "
                                     "struct of that name is declared or imported")])
        self.assertIn('<div class="mkd-unknown" data-el="Nope.Thing"><span class="mkd-unknown__name">Nope.Thing'
                      '</span>', r.html)
        self.assertIn('data-el="Text"', r.html)

    def test_variable_base_is_a_member_access(self):  # TC-2 (C9)
        r = render('let Badge = "x"\nBadge.Ribbon("New")', pack="antd")
        self.assertNotIn("Badge.Ribbon", r.html)
        self.assertIn('data-el="Text"', r.html)
        self.assertEqual(diags(r), [("warning", "modifier", "unknown modifier .Ribbon() is ignored")])

    def test_dotted_call_resolves_a_struct(self):  # TC-2 (C9): C1's order for the joined name
        r = render('struct CardMeta: View {\n  var body: some View { Text("meta") }\n}\nCard.Meta()')
        self.assertIn('>meta<', r.html)
        self.assertEqual(diags(r), [])

    def test_three_part_name(self):  # TC-2 (C9)
        r = render('A.B.C()', pack="antd")
        self.assertEqual(diags(r)[0][2].split(" is ")[0], "'A.B.C'")

    def test_edit_mode_marks_the_dotted_node(self):  # TC-2 (C10), R-EDIT-004
        r = render('Badge.Ribbon("New")', pack="antd", edit=True)
        self.assertIn('data-el="Badge.Ribbon" data-mkd-node="n1"', r.html)
