"""The Python package's copies of the shared assets (R-REPO-002, R-REPO-003)."""

import importlib.util
import shutil
import subprocess
import sys
import tempfile
import unittest
import zipfile

from tests.helpers import ROOT

SHARED = ROOT.parent / "shared"
TOOL = ROOT / "tools" / "sync_shared.py"


def _sync_tool():
    spec = importlib.util.spec_from_file_location("sync_shared", TOOL)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


@unittest.skipUnless(SHARED.is_dir(), "no shared/ beside python/ (not a repository checkout)")
class PackageCopyTests(unittest.TestCase):
    def test_package_copy_matches_shared(self):  # R-REPO-002 TC-1
        tool = _sync_tool()
        pairs = tool.pairs()
        self.assertTrue(any(s.name == "icons.json" for s, _ in pairs))
        self.assertEqual(len([s for s, _ in pairs if s.name == "pack.json"]),
                         len(list((SHARED / "packs").glob("*/pack.json"))))
        self.assertEqual(tool.stale(), [], "the package copy differs from shared/: rebuild "
                         "(pip install -e python) or run python tools/sync_shared.py")

    def test_stale_copy_is_detected(self):  # R-REPO-002.C6: the check itself works
        tool = _sync_tool()
        _, dst = next(p for p in tool.pairs() if p[0].name == "vocabulary.json")
        original = dst.read_bytes()
        try:
            dst.write_bytes(original + b" ")
            self.assertIn(dst, [p for p, _ in tool.stale()])
        finally:
            dst.write_bytes(original)

    def test_wheel_contains_the_shared_assets(self):  # R-REPO-003 TC-1
        try:
            import setuptools  # noqa: F401
            isolation = ["--no-build-isolation"]
        except ImportError:
            isolation = []  # pip fetches the build backend
        with tempfile.TemporaryDirectory() as out:
            proc = subprocess.run([sys.executable, "-m", "pip", "wheel", "--no-deps", "-q", *isolation,
                                   "-w", out, str(ROOT)], capture_output=True, text=True, timeout=600)
            self.assertEqual(proc.returncode, 0, proc.stdout + proc.stderr)
            shutil.rmtree(ROOT / "build", ignore_errors=True)
            from pathlib import Path
            wheel = next(Path(out).glob("mockitdown-*.whl"))
            names = set(zipfile.ZipFile(wheel).namelist())
        want = {"mockitdown/page.css", "mockitdown/icons.json", "mockitdown/vocabulary.json"}
        self.assertTrue(any(n.endswith(".dist-info/licenses/LICENSE") for n in names), "LICENSE")
        for pack in (SHARED / "packs").iterdir():
            if (pack / "pack.json").is_file():
                want |= {f"mockitdown/packs/{pack.name}/pack.json", f"mockitdown/packs/{pack.name}/pack.css"}
        self.assertEqual(sorted(want - names), [])


@unittest.skipUnless(SHARED.is_dir(), "no shared/ beside python/ (not a repository checkout)")
class ReferenceJsonTests(unittest.TestCase):
    """gen_reference.py writes shared/reference/<pack>.json (R-REPO-003.C5); --check covers its freshness."""

    def test_every_listed_pack_has_a_reference_file(self):
        import json
        index = json.loads((SHARED / "reference" / "index.json").read_text(encoding="utf-8"))
        ids = [i for g in index["groups"] for i in g["packs"]]
        self.assertIn("base", ids)
        for pid in ids:
            data = json.loads((SHARED / "reference" / f"{pid}.json").read_text(encoding="utf-8"))
            self.assertEqual(data["id"], pid)
            self.assertTrue(data["elements"])
            e = data["elements"][0]
            self.assertEqual(set(e), {"name", "role", "params", "defaults", "variants", "doc", "own",
                                      "sample", "variants_sample"})


if __name__ == "__main__":
    unittest.main()
