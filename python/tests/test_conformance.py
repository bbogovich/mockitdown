"""The conformance corpus (R-REPO-004): the Python renderer matches every case, and the corpus is current.

TC-1 (C5): every case in shared/conformance/ renders to exactly its expected HTML and result.
TC-2 (C4): tools/gen_conformance.py --check passes, and fails when an expected file is changed (V1).
"""

import contextlib
import io
import json
import shutil
import tempfile
import unittest
from pathlib import Path
from unittest import mock

from tests.helpers import ROOT  # noqa: F401 - puts src/ on the path

import importlib.util
import sys

_spec = importlib.util.spec_from_file_location("gen_conformance", ROOT / "tools" / "gen_conformance.py")
gen = importlib.util.module_from_spec(_spec)
sys.modules["gen_conformance"] = gen
_spec.loader.exec_module(gen)

CONF = gen.CONF


def _cases() -> list[str]:
    return [c["name"] for c in json.loads((CONF / "index.json").read_text(encoding="utf-8"))["cases"]]


class ConformanceCorpus(unittest.TestCase):
    def test_layout(self):
        names = _cases()
        self.assertGreater(len(names), 300)
        for n in names:
            for ext in (".mockitdown", ".json", ".html", ".diag.json"):
                self.assertTrue((CONF / f"{n}{ext}").is_file(), f"{n}{ext}")
        areas = {n.split("-", 1)[0] for n in names}
        for area in ("role", "pack", "appearance", "device", "chrome", "import", "annotate", "overlay",
                     "chart", "image", "diag"):
            self.assertIn(area, areas)

    def test_coverage(self):
        """C2: every base role, every shipped pack, light and dark, every device form."""
        names = set(_cases())
        base = json.loads((gen.REFERENCE / "base.json").read_text(encoding="utf-8"))
        for role in {e["role"] for e in base["elements"]}:
            self.assertTrue(any(n.startswith(f"role-{role}-") for n in names), role)
        for pid in gen.registry(()).ids():
            self.assertIn(f"pack-{pid}", names)
        for a in ("light", "dark"):
            self.assertIn(f"appearance-{a}", names)
        for d in list(gen.DEVICES) + ["fit"]:
            self.assertIn(f"device-{d}", names)

    def test_every_case_matches(self):
        """TC-1: the Python renderer reproduces every expected file byte for byte."""
        failures = []
        for name in _cases():
            source = (CONF / f"{name}.mockitdown").read_text(encoding="utf-8")
            options = json.loads((CONF / f"{name}.json").read_text(encoding="utf-8"))
            result = gen.render_case(source, options)
            if result.html + "\n" != (CONF / f"{name}.html").read_text(encoding="utf-8"):
                failures.append(f"{name}.html")
            expected = json.loads((CONF / f"{name}.diag.json").read_text(encoding="utf-8"))
            if gen.result_json(result) != expected:
                failures.append(f"{name}.diag.json")
        self.assertEqual(failures, [])

    def test_check_passes(self):
        """TC-2: the corpus is what the generator now produces."""
        with contextlib.redirect_stdout(io.StringIO()):
            self.assertEqual(gen.main(["--check"]), 0)

    def test_check_fails_on_changed_file(self):
        """V1: changing one expected file makes the check (and test_every_case_matches) fail."""
        with tempfile.TemporaryDirectory() as tmp:
            copy = Path(tmp) / "conformance"
            shutil.copytree(CONF, copy)
            target = copy / f"{_cases()[0]}.html"
            target.write_text(target.read_text(encoding="utf-8").replace("mkd-", "mkx-", 1), encoding="utf-8")
            with mock.patch.object(gen, "CONF", copy), contextlib.redirect_stderr(io.StringIO()) as err:
                self.assertEqual(gen.main(["--check"]), 1)
            self.assertIn("stale", err.getvalue())

    def test_options_are_known(self):
        for name in _cases():
            options = json.loads((CONF / f"{name}.json").read_text(encoding="utf-8"))
            for key, value in options.items():
                self.assertIn(key, gen.OPTION_KEYS, name)
                self.assertIsInstance(value, gen.OPTION_KEYS[key], f"{name}: {key}")


if __name__ == "__main__":
    unittest.main()
