"""Edit-mode rendering (R-EDIT-004): `data-mkd-node` and `data-mkd-derived` on role roots.

TC-1 (C3-C9): the edit-mode conformance cases (`edit-*`, `edit: true`) mark every element a view node
produced with its ordinal, and the elements a `ForEach`, an `if` or a struct body produced with the
innermost such construct; marks, the Elements table and the source disclosure carry neither attribute.
The expected marks below were written by hand from the case sources, before the renderer produced them.

TC-2 (C1, C2, C10): every case renders unchanged with `edit: false` added; the library API accepts
`edit`; the fence reports it as an unknown option and the command line has no such option.
"""

import contextlib
import importlib.util
import io
import json
import re
import sys
import unittest

from tests.helpers import ROOT, RenderOptions, parse, render

from mockitdown.syntax.nodes import view_nodes

gen = sys.modules.get("gen_conformance")
if gen is None:
    _spec = importlib.util.spec_from_file_location("gen_conformance", ROOT / "tools" / "gen_conformance.py")
    gen = importlib.util.module_from_spec(_spec)
    sys.modules["gen_conformance"] = gen
    _spec.loader.exec_module(gen)

CONF = gen.CONF

#: Every element carrying `data-el`, in document order: (element, data-mkd-node, data-mkd-derived).
#: Written by hand from each case's source (ordinals in source order of the first token, R-EDIT-001.C4).
EXPECTED: dict[str, list[tuple[str, str | None, str | None]]] = {
    "edit-nested-stacks": [
        ("VStack", "n1", None), ("HStack", "n2", None), ("Text", "n3", None), ("Spacer", "n4", None),
        ("Text", "n5", None), ("HStack", "n6", None), ("Image", "n7", None), ("Text", "n8", None),
        ("Divider", "n9", None),
    ],
    "edit-list-cards": [
        ("List", "n1", None), ("Card", "n2", None), ("Text", "n3", None), ("Button", "n4", None),
        ("Card", "n5", None), ("Text", "n6", None),
    ],
    "edit-modifier-chain": [
        ("VStack", "n1", None), ("Text", "n2", None), ("Button", "n3", None), ("Image", "n4", None),
        ("Badge", "n5", None),
    ],
    "edit-slots": [
        ("VStack", "n1", None), ("Label", "n2", None), ("Image", "n4", None), ("Text", "n3", None),
        ("Card", "n5", None), ("Badge", "n8", None), ("Text", "n6", None), ("Text", "n7", None),
    ],
    "edit-presentation": [
        ("VStack", "n1", None), ("Text", "n2", None), ("Button", "n3", None),
        # the alert (presented by the Button, collected first), then the sheet
        ("Text", "n6", None), ("Button", "n4", None), ("Button", "n5", None),
        ("VStack", "n7", None), ("Text", "n8", None), ("Button", "n9", None),
    ],
    "edit-foreach": [
        ("VStack", "n1", None), ("Text", "n3", "n2"), ("Text", "n3", "n2"),
        ("Text", "n6", "n5"), ("Badge", "n7", "n5"),
    ],
    "edit-if-else": [
        ("VStack", "n1", None), ("Button", "n4", "n2"), ("Text", "n5", "n2"), ("Label", "n9", "n8"),
    ],
    "edit-struct": [
        ("VStack", "n6", None),
        ("HStack", "n1", "n7"), ("Image", "n2", "n7"), ("Text", "n3", "n7"), ("Spacer", "n4", "n7"),
        ("Badge", "n8", None),
        ("HStack", "n1", "n9"), ("Image", "n2", "n9"), ("Text", "n3", "n9"), ("Spacer", "n4", "n9"),
        ("Text", "n10", None),
    ],
    "edit-literal": [
        ("VStack", "n1", None), ("Text", None, None), ("Text", "n2", None), ("Text", None, None),
        ("Text", None, None),
    ],
    "edit-import": [
        ("HStack", "n1", None), ("HStack", None, "n2"), ("Circle", None, "n2"), ("Text", None, "n2"),
    ],
    "edit-marks": [
        ("VStack", "n1", None), ("Text", "n2", None), ("Button", "n3", None),
    ],
}

_TAG = re.compile(r'<[a-zA-Z][\w-]*\s[^>]*?data-el="([^"]*)"((?: data-mkd-node="[^"]*")?)((?: data-mkd-derived="[^"]*")?)')


def _value(attr: str) -> str | None:
    return attr.split('"')[1] if attr else None


def marks(html: str) -> list[tuple[str, str | None, str | None]]:
    """Every element carrying `data-el` in document order, with the two edit attributes that follow it."""
    return [(m.group(1), _value(m.group(2)), _value(m.group(3))) for m in _TAG.finditer(html)]


def _edit_cases() -> list[str]:
    cases = json.loads((CONF / "index.json").read_text(encoding="utf-8"))["cases"]
    return [c["name"] for c in cases if c["name"].startswith("edit-")]


def _case(name: str) -> tuple[str, dict]:
    source = (CONF / f"{name}.mockitdown").read_text(encoding="utf-8")
    return source, json.loads((CONF / f"{name}.json").read_text(encoding="utf-8"))


class EditModeCases(unittest.TestCase):
    """TC-1."""

    def test_cases_exist_and_set_edit(self):
        """C9: the corpus holds the edit-mode cases, each with `edit: true`."""
        self.assertEqual(sorted(_edit_cases()), sorted(EXPECTED))
        for name in EXPECTED:
            self.assertIs(_case(name)[1].get("edit"), True, name)

    def test_marks_match_the_hand_written_expectation(self):
        """C4, C5, C7: every element a view node produced names it; derived ones name their construct."""
        for name, want in EXPECTED.items():
            source, options = _case(name)
            html = gen.render_case(source, options).html
            with self.subTest(case=name):
                self.assertEqual(marks(html), want)

    def test_attributes_follow_data_el(self):
        """C6: `data-mkd-node`, then `data-mkd-derived`, directly after `data-el` — nowhere else."""
        for name in EXPECTED:
            source, options = _case(name)
            html = gen.render_case(source, options).html
            placed = marks(html)
            with self.subTest(case=name):
                self.assertEqual(html.count(" data-mkd-node="), sum(1 for _, n, _ in placed if n))
                self.assertEqual(html.count(" data-mkd-derived="), sum(1 for _, _, d in placed if d))

    def test_ordinals_name_view_nodes_and_derived_names_a_construct(self):
        """C3, C5: each ordinal is a view node of the source; a derived one is a ForEach, an if or a struct call."""
        for name in EXPECTED:
            source, options = _case(name)
            module = parse(source)
            nodes = {n.ordinal: n for n in view_nodes(module)}
            structs = {s.name for s in module.structs} | {"StatusPill"}  # StatusPill: imported (edit-import)
            html = gen.render_case(source, options).html
            for el, node, derived in marks(html):
                with self.subTest(case=name, element=el, node=node, derived=derived):
                    if node:
                        self.assertIn(node, nodes)
                        self.assertEqual(nodes[node].name, el)
                    if derived:
                        construct = nodes[derived]
                        self.assertTrue(construct.kind == "if" or construct.name == "ForEach"
                                        or construct.name in structs, construct.name)

    def test_marks_tables_and_source_carry_neither(self):
        """C8: annotation marks, the Elements table and the source disclosure carry no edit attribute."""
        source, options = _case("edit-marks")
        self.assertTrue(options.get("elements") and options.get("source"))
        html = gen.render_case(source, options).html
        parts = [re.search(r'<table class="mkd-elements">.*?</table>', html, re.S),
                 re.search(r'<details class="mkd-source">.*?</details>', html, re.S),
                 re.search(r'<div class="mkd-anchored".*?</div>', html, re.S),
                 re.search(r'<div class="mkd-deco__layer">.*?</div>', html, re.S)]
        for part in parts:
            self.assertIsNotNone(part)
            self.assertNotIn("data-mkd-node", part.group(0))
            self.assertNotIn("data-mkd-derived", part.group(0))


class ViewNodeOrdinals(unittest.TestCase):
    """C3: the Python parser numbers view nodes as R-EDIT-001.C3 and C4 define."""

    def test_kinds_and_order(self):
        src = ('struct Pill: View {\n  var body: some View { Text("p") }\n}\n'
               'VStack {\n  Divider\n  Spacer.frame(height: 8)\n  if true { Badge.Ribbon("New") }\n'
               '  Text("a").font(.title).overlay { Image(systemName: "x") }\n'
               '  Label(title: Text("t"), icon: "x")\n  let x = Text("v")\n  "lit"\n}\n')
        got = [(n.ordinal, n.kind, n.name) for n in view_nodes(parse(src))]
        self.assertEqual(got, [
            ("n1", "call", "Text"), ("n2", "call", "VStack"), ("n3", "ident", "Divider"),
            ("n4", "ident", "Spacer"), ("n5", "if", "if"), ("n6", "call", "Badge.Ribbon"),
            ("n7", "call", "Text"), ("n8", "call", "Image"), ("n9", "call", "Label"), ("n10", "call", "Text"),
            ("n11", "call", "Text"),
        ])


class EditPreview(unittest.TestCase):
    """C14: a declarations-only block renders its last struct with no derived mark from the implicit call."""

    def test_preview_views_are_not_derived(self):
        src = 'struct Card2: View {\n  var body: some View { VStack { Text("a") } }\n}\n'
        self.assertEqual(marks(render(src, edit=True).html), [("VStack", "n1", None), ("Text", "n2", None)])


class EditOff(unittest.TestCase):
    """TC-2."""

    def test_default_is_false(self):
        self.assertIs(RenderOptions().edit, False)

    def test_every_case_unchanged_with_edit_false(self):
        """C2: `edit: false` renders every non-edit case byte-identically to its expected HTML."""
        failures = []
        for c in json.loads((CONF / "index.json").read_text(encoding="utf-8"))["cases"]:
            name = c["name"]
            source, options = _case(name)
            if options.get("edit"):  # an edit-mode case: `edit: false` is the same as leaving `edit` out
                off = gen.render_case(source, {**options, "edit": False}).html
                rest = {k: v for k, v in options.items() if k != "edit"}
                if off != gen.render_case(source, rest).html or "data-mkd-node" in off or "data-mkd-derived" in off:
                    failures.append(name)
                continue
            result = gen.render_case(source, {**options, "edit": False})
            if result.html + "\n" != (CONF / f"{name}.html").read_text(encoding="utf-8"):
                failures.append(name)
        self.assertEqual(failures, [])

    def test_api_accepts_edit(self):
        """C10: the library API takes `edit`, as an option field and as a keyword override."""
        src = 'VStack { Text("a") }'
        self.assertNotIn("data-mkd-node", render(src).html)
        self.assertIn('data-el="VStack" data-mkd-node="n1"', render(src, RenderOptions(edit=True)).html)
        self.assertIn('data-el="Text" data-mkd-node="n2"', render(src, edit=True).html)

    def test_fence_rejects_edit(self):
        """C10: the Markdown fence does not offer `edit`; it is an unknown fence option."""
        from mockitdown.options import coerce_fence_options
        values, problems = coerce_fence_options({"edit": "true"})
        self.assertEqual(values, {})
        self.assertEqual(len(problems), 1)
        self.assertIn("unknown fence option 'edit'", problems[0])

    def test_cli_has_no_edit_option(self):
        """C10: the command line has no `--edit`."""
        from mockitdown import cli
        with contextlib.redirect_stderr(io.StringIO()), self.assertRaises(SystemExit) as cm:
            cli.main(["render", "-", "--edit"])
        self.assertEqual(cm.exception.code, 2)


if __name__ == "__main__":
    unittest.main()
