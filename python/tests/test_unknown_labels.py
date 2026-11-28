"""Unknown labelled arguments are warned (R-EVAL-004 TC-1: C7-C10; F-12.C6, AC4, AC5).

The conformance case `diag-unknown-label` (hand-written expected `diag.json`) runs in both suites
through test_conformance.py and conformance.test.ts. These tests add the single-element examples, the
role table's `reads` (C8) against what the Python renderer actually reads, and the shipped content
(C10). typescript/tests/unit/unknown-labels.test.ts runs the same checks in the TypeScript core.
"""

import json
import unittest
from collections import defaultdict
from importlib import resources

import mockitdown.api as api
from mockitdown import roles
from mockitdown.model import ViewList
from tests.helpers import ROOT, RenderOptions, render

SHARED = ROOT.parent / "shared"
CONF = SHARED / "conformance"


def warnings(src: str, **kw) -> list[tuple[str, int, int]]:
    res = render(src, RenderOptions(**kw))
    return [(d.message, d.location.line, d.location.col) for d in res.diagnostics if d.code == "argument"]


class UnknownLabels(unittest.TestCase):
    def test_misspelt_label_warns_and_still_renders(self):  # C9, F-12.AC4
        res = render('Text("Hi", colour: .red)', RenderOptions())
        self.assertEqual([(d.severity.value, d.code, d.message, d.location.line, d.location.col) for d in res.diagnostics],
                         [("warning", "argument", "'colour' is not understood by Text in pack 'base'", 1, 12)])
        self.assertIn(">Hi<", res.html)

    def test_understood_labels_do_not_warn(self):  # C7
        cases = [
            'Toggle("Wi-Fi", isOn: true)',                       # a label the role reads
            'Rectangle(shape: "capsule")',                       # a default of the element
            'Link("Docs", destination: "https://x.example")',    # a positional param, labelled
            'Button("Go", action: { doIt() })',                  # a discarded action
            'Section("A", footer: { Text("f") }) { Text("x") }', # a closure: a slot
            'Card(cover: Image("photo.png"))',                   # a view list: a slot
            'let on = true\nToggle("Wi-Fi", unheard: $on)',     # a binding is exempt
        ]
        for src in cases:
            with self.subTest(src=src):
                self.assertEqual(warnings(src), [])

    def test_aliases_are_understood(self):  # C7 (R-PACK-011)
        self.assertEqual(warnings('Button("Save", type: "primary")', pack="antd"), [])      # element alias
        self.assertEqual(warnings('Input("Name", allowClear: true)', pack="antd"), [])      # pack alias

    def test_order_follows_the_arguments(self):  # C9
        self.assertEqual(warnings('VStack(spacng: 4) { Text("a", colr: .red, size: 3, wieght: 1) }'), [
            ("'spacng' is not understood by VStack in pack 'base'", 1, 8),
            ("'colr' is not understood by Text in pack 'base'", 1, 31),
            ("'wieght' is not understood by Text in pack 'base'", 1, 52),
        ])

    def test_struct_arguments_are_not_element_labels(self):  # C9 covers element calls only
        src = 'struct Card2: View { var title: String\n var body: some View { Text(title) } }\nCard2(title: "x")'
        self.assertEqual(warnings(src), [])


class RoleReads(unittest.TestCase):
    """C8: the table lists every label each role reads; both variants load the same shared file."""

    def test_every_rule_has_reads(self):
        data = json.loads(resources.files("mockitdown").joinpath("roles.json").read_text(encoding="utf-8"))
        self.assertEqual(data, json.loads((SHARED / "language/roles.json").read_text(encoding="utf-8")))
        self.assertTrue(data["reads"])
        for role, rule in data["roles"].items():
            self.assertIsInstance(rule["reads"], list, role)
            self.assertEqual(sorted(set(rule["reads"])), sorted(rule["reads"]), role)
            self.assertFalse(set(rule["reads"]) & set(data["reads"]), f"{role}: repeats a common label")
        self.assertEqual(roles.reads("toggle") >= {"isOn", "variant"}, True)

    def test_the_renderer_reads_nothing_the_table_omits(self):
        """Render the whole conformance corpus recording every attribute a role looks up: each must be listed."""
        seen: dict[str, set[str]] = defaultdict(set)

        class Recording(dict):
            role = ""

            def __getitem__(self, k):
                seen[self.role].add(k)
                return dict.__getitem__(self, k)

            def get(self, k, d=None):
                seen[self.role].add(k)
                return dict.get(self, k, d)

            def __contains__(self, k):
                seen[self.role].add(k)
                return dict.__contains__(self, k)

        def wrap(v, done):
            if id(v) in done:
                return
            done.add(id(v))
            rec = Recording(v.attrs)
            rec.role = v.role
            v.attrs = rec
            nested = list(v.children) + [c for vs in v.slots.values() for c in vs]
            nested += [c for val in v.attrs.values() if isinstance(val, ViewList) for c in val.views]
            for m in v.modifiers:
                nested += list(m.content or []) + [c for vs in m.slots.values() for c in vs]
                nested += [c for a in [*m.args, *m.kwargs.values()] if isinstance(a, ViewList) for c in a.views]
            for c in nested:
                wrap(c, done)

        original = api.render_screen

        def recording(screen, *a, **k):
            done: set[int] = set()
            for v in screen.views:
                wrap(v, done)
            return original(screen, *a, **k)

        api.render_screen = recording
        try:
            import os
            cwd = os.getcwd()
            os.chdir(CONF)
            try:
                from pathlib import Path
                for case in json.loads((CONF / "index.json").read_text(encoding="utf-8"))["cases"]:
                    n = case["name"]
                    options = json.loads((CONF / f"{n}.json").read_text(encoding="utf-8"))
                    render((CONF / f"{n}.mockitdown").read_text(encoding="utf-8"),
                           RenderOptions(**options, import_paths=(Path("."),)))
            finally:
                os.chdir(cwd)
        finally:
            api.render_screen = original
        missing = {role: sorted(names - roles.reads(role) - {""}) for role, names in seen.items()
                   if roles.reads(role) is not None and names - roles.reads(role) - {""}}
        self.assertEqual(missing, {})


class ShippedContent(unittest.TestCase):
    """C10, F-12.AC5: the reference samples render without the warning (the patterns and the example site
    are held to no diagnostics at all by test_patterns.py and test_examples.py)."""

    def test_reference_samples(self):
        found = []
        for f in sorted((SHARED / "reference").glob("*.json")):
            data = json.loads(f.read_text(encoding="utf-8"))
            for e in data.get("elements", []):
                for src in (e.get("sample"), e.get("variants_sample")):
                    if src:
                        found += [f"{data['id']} {e['name']}: {w[0]}" for w in warnings(src, pack=data["id"], device="fit")]
        self.assertEqual(found, [])


if __name__ == "__main__":
    unittest.main()
