"""Typed parameters and modifiers (R-PACK-017 TC-1: C1, C2, C3, C5, C8; C7 for the Python variant).

The shared data: each rule of ``roles.json`` carries ``params`` (labelled argument → type), the table's
top-level ``params`` the labels every role understands, a pack element may carry ``types``, and
``vocabulary.json`` holds ``modifiers`` (group and argument types of every rendered modifier).
typescript/tests/unit/types.test.ts runs the same checks and the TypeScript lookups (TC-2). That every
label a role reads has a type (R-EVAL-004.C8) follows from the ``params`` keys being the labels it reads,
which test_unknown_labels.py holds against the Python renderer.
"""

import json
import unittest
from importlib import resources

from mockitdown import roles, vocabulary
from tests.helpers import ROOT

SHARED = ROOT.parent / "shared"
TYPES = ("text", "number", "bool", "color", "icon", "enum", "array")
GROUPS = ("layout", "typography", "colour", "presentation", "annotations", "other")


def type_errors(t: object, where: str) -> list[str]:
    """What is wrong with a type of C2: a name, or ``{"type", "values"|"items"|"min"|"max"}``."""
    if isinstance(t, str):
        return [] if t in TYPES else [f"{where}: unknown type {t!r}"]
    if not isinstance(t, dict) or t.get("type") not in TYPES:
        return [f"{where}: not a type: {t!r}"]
    kind = t["type"]
    allowed = {"type", "values"} if kind == "enum" else {"type", "items"} if kind == "array" else \
        {"type", "min", "max"} if kind == "number" else {"type"}
    errors = [f"{where}: {k!r} is not a key of a {kind} type" for k in sorted(set(t) - allowed)]
    if kind == "enum":
        v = t.get("values")
        if not (isinstance(v, list) and v and all(isinstance(x, str) for x in v) and len(set(v)) == len(v)):
            errors.append(f"{where}: an enum names its values")
    if kind == "array":
        errors += type_errors(t["items"], f"{where}[]") if "items" in t else [f"{where}: an array names its items"]
    for k in ("min", "max"):
        if k in t and (isinstance(t[k], bool) or not isinstance(t[k], (int, float))):
            errors.append(f"{where}: {k} is a number")
    return errors


def table_errors(table: dict) -> list[str]:
    """C1, C2, C8: every rule has ``params`` whose types are known; the common ones are not repeated."""
    errors = []
    common = table.get("params")
    if not isinstance(common, dict):
        return ["the table has no common params"]
    for label, t in common.items():
        errors += type_errors(t, f"params.{label}")
    for role, rule in table.get("roles", {}).items():
        params = rule.get("params")
        if not isinstance(params, dict):
            errors.append(f"{role}: no params")
            continue
        for label, t in params.items():
            errors += type_errors(t, f"{role}.{label}")
            if label in common:
                errors.append(f"{role}.{label}: repeats a common label")
    return errors


def modifier_errors(vocab: dict) -> list[str]:
    """C5, C8: every rendered modifier has a group and typed arguments, and only those have an entry."""
    mods = vocab.get("modifiers", {})
    errors = [f"{m}: rendered but has no entry in modifiers" for m in vocab["rendered"] if m not in mods]
    errors += [f"{m}: not a rendered modifier" for m in mods if m not in vocab["rendered"]]
    for m, spec in mods.items():
        if set(spec) != {"group", "args"} or spec.get("group") not in GROUPS:
            errors.append(f"{m}: needs a group of {GROUPS} and args")
            continue
        for i, arg in enumerate(spec["args"]):
            if set(arg) != {"label", "type"} or not (arg["label"] is None or isinstance(arg["label"], str)):
                errors.append(f"{m}.args[{i}]: needs a label (or null) and a type")
            else:
                errors += type_errors(arg["type"], f"{m}.{arg['label'] or i}")
    return errors


def pack_type_errors(pack_id: str, elements: dict) -> list[str]:
    """C3, C8: an element's ``types`` maps names to known types; ``params`` stays a list of names."""
    errors = []
    for name, el in elements.items():
        params = el.get("params", [])
        if not (isinstance(params, list) and all(isinstance(p, str) for p in params)):
            errors.append(f"{pack_id} {name}: params is a list of names")
        if "types" in el:
            if not isinstance(el["types"], dict):
                errors.append(f"{pack_id} {name}: types is an object")
                continue
            for label, t in el["types"].items():
                errors += type_errors(t, f"{pack_id} {name}.{label}")
    return errors


def load(rel: str) -> dict:
    return json.loads((SHARED / rel).read_text(encoding="utf-8"))


class SharedTypes(unittest.TestCase):
    """TC-1: the shared data is complete and every type is known."""

    def test_every_rule_has_typed_params(self):  # C1, C2
        table = load("language/roles.json")
        self.assertEqual(sorted(table), ["params", "roles", "root"])
        self.assertTrue(table["params"])
        for role, rule in table["roles"].items():
            self.assertEqual(sorted(rule), ["accepts", "attach", "category", "params", "title"], role)
        self.assertEqual(table_errors(table), [])
        self.assertEqual(table["roles"]["toggle"]["params"]["isOn"], "bool")
        self.assertEqual(table["roles"]["button"]["params"]["role"], {"type": "enum", "values": ["cancel", "destructive"]})

    def test_every_rendered_modifier_is_typed(self):  # C5
        vocab = load("language/vocabulary.json")
        self.assertEqual(modifier_errors(vocab), [])
        self.assertEqual(vocab["modifiers"]["padding"]["group"], "layout")
        self.assertEqual(vocab["modifiers"]["font"]["group"], "typography")
        self.assertEqual(vocab["modifiers"]["foregroundStyle"], {"group": "colour", "args": [{"label": None, "type": "color"}]})
        self.assertEqual(vocab["modifiers"]["sheet"], {"group": "presentation", "args": [{"label": "isPresented", "type": "bool"}]})
        self.assertEqual(vocab["modifiers"]["callout"]["group"], "annotations")

    def test_pack_types_are_known(self):  # C3
        errors = []
        for f in sorted((SHARED / "packs").glob("*/pack.json")):
            errors += pack_type_errors(f.parent.name, json.loads(f.read_text(encoding="utf-8")).get("elements", {}))
        self.assertEqual(errors, [])

    def test_the_checks_fail_on_bad_data(self):  # C8: each check has teeth
        table = {"params": {"variant": "text"}, "roles": {
            "button": {"params": {"label": "txt"}}, "text": {}, "toggle": {"params": {"isOn": {"type": "enum"}}},
            "slider": {"params": {"range": {"type": "array"}, "variant": "text", "value": {"type": "number", "min": "0"}}}}}
        self.assertEqual(table_errors(table), [
            "button.label: unknown type 'txt'", "text: no params", "toggle.isOn: an enum names its values",
            "slider.range: an array names its items", "slider.variant: repeats a common label", "slider.value: min is a number"])
        vocab = {"rendered": ["padding", "font"], "modifiers": {
            "padding": {"group": "spacing", "args": []}, "tint": {"group": "colour", "args": [{"label": None, "type": "hue"}]}}}
        self.assertEqual(modifier_errors(vocab), [
            "font: rendered but has no entry in modifiers", "tint: not a rendered modifier",
            "padding: needs a group of ('layout', 'typography', 'colour', 'presentation', 'annotations', 'other') and args",
            "tint.0: unknown type 'hue'"])
        self.assertEqual(pack_type_errors("acme", {"X": {"role": "button", "params": "label", "types": {"icon": "glyph"}}}),
                         ["acme X: params is a list of names", "acme X.icon: unknown type 'glyph'"])


class PythonVariant(unittest.TestCase):
    """C7: the Python package carries the typed data and takes the labels it understands from ``params``."""

    def test_package_holds_the_shared_files(self):
        pkg = resources.files("mockitdown")
        for name in ("roles.json", "vocabulary.json"):
            self.assertEqual(pkg.joinpath(name).read_bytes(), (SHARED / "language" / name).read_bytes(), name)

    def test_reads_are_the_params_keys(self):  # R-EVAL-004.C8
        table = load("language/roles.json")
        for role, rule in table["roles"].items():
            self.assertEqual(roles.reads(role), frozenset(table["params"]) | frozenset(rule["params"]), role)
        self.assertEqual(vocabulary.MODIFIERS["padding"]["group"], "layout")

    def test_a_typed_label_is_understood(self):  # C3 with R-EVAL-004.C7; as types.test.ts in TypeScript
        import tempfile
        from pathlib import Path

        from tests.helpers import RenderOptions, render
        with tempfile.TemporaryDirectory() as d:
            (Path(d) / "typed").mkdir()
            (Path(d) / "typed/pack.json").write_text(json.dumps({
                "id": "typed", "name": "Typed", "extends": "base", "modules": ["TypedUI"],
                "elements": {"Dial": {"role": "slider", "params": ["value"], "variants": ["round", "flat"],
                                      "types": {"value": {"type": "number", "min": 0, "max": 10}, "notch": "bool"}}}}),
                encoding="utf-8")
            r = render("import TypedUI\nDial(value: 3, notch: true, nub: 1)", RenderOptions(pack_paths=(Path(d),)))
        self.assertEqual([d.message for d in r.diagnostics], ["'nub' is not understood by Dial in pack 'typed'"])


if __name__ == "__main__":
    unittest.main()
