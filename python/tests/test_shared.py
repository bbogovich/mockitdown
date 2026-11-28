"""The Python package's copies of the shared assets (R-REPO-002, R-REPO-003, R-PACK-018)."""

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
#: R-PACK-018 TC-1: the fixture both suites read (packs/ with _partials/, and expected/ resolved copies).
FIXTURE = ROOT / "tests" / "fixtures" / "partials"


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

    def test_partials_are_not_copied_and_copies_hold_no_import(self):  # R-PACK-018 TC-1 step 4 (C7)
        packs = ROOT / "src" / "mockitdown" / "packs"
        for f in packs.rglob("*.css"):
            rel = f.relative_to(packs)
            with self.subTest(file=str(rel)):
                self.assertEqual((len(rel.parts), rel.name), (2, "pack.css"))
                self.assertTrue((f.parent / "pack.json").is_file())
                self.assertNotIn("@import", f.read_text(encoding="utf-8"))

    def test_copy_of_a_pack_css_is_its_resolved_text(self):  # R-REPO-002.C6 with R-PACK-018.C4
        tool = _sync_tool()
        for src, dst in tool.pairs():
            if src.name == "pack.css":
                self.assertEqual(dst.read_bytes(), tool.copy_bytes(src), str(dst))

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
        want = {"mockitdown/page.css", "mockitdown/icons.json", "mockitdown/vocabulary.json", "mockitdown/roles.json"}
        self.assertTrue(any(n.endswith(".dist-info/licenses/LICENSE") for n in names), "LICENSE")
        for pack in (SHARED / "packs").iterdir():
            if (pack / "pack.json").is_file():
                want |= {f"mockitdown/packs/{pack.name}/pack.json", f"mockitdown/packs/{pack.name}/pack.css"}
        self.assertEqual(sorted(want - names), [])


@unittest.skipUnless(SHARED.is_dir(), "no shared/ beside python/ (not a repository checkout)")
class PartialTests(unittest.TestCase):
    """R-PACK-018 TC-1: stylesheet partials resolved by the build (steps 1 to 3 and 5; 4 in PackageCopyTests)."""

    def setUp(self):
        self.tool = _sync_tool()

    def _tree(self) -> "Path":
        from pathlib import Path
        tmp = Path(tempfile.mkdtemp(prefix="mkd-partials-"))
        self.addCleanup(shutil.rmtree, tmp, True)
        shutil.copytree(FIXTURE / "packs", tmp / "packs")
        return tmp / "packs"

    def _fails(self, packs, pid, *needles):
        with self.assertRaises(self.tool.PartialError) as cm:
            self.tool.resolve_pack_css(packs, pid)
        for n in needles:
            self.assertIn(n, str(cm.exception))
        return str(cm.exception)

    def test_resolved_copies_are_byte_exact(self):  # C4, C5: the same expected bytes as the TypeScript suite
        for pid in ("one", "two"):
            with self.subTest(pack=pid):
                want = (FIXTURE / "expected" / f"{pid}.pack.css").read_bytes()
                self.assertEqual(self.tool.resolve_pack_css(FIXTURE / "packs", pid).encode("utf-8"), want)
                self.assertEqual(self.tool.copy_bytes(FIXTURE / "packs" / pid / "pack.css"), want)

    def test_a_css_without_import_is_copied_unchanged(self):
        css = SHARED / "packs" / "base" / "pack.css"
        self.assertEqual(self.tool.copy_bytes(css), css.read_bytes())

    def test_partials_directory_is_not_a_pack(self):  # C1
        from mockitdown.packs import PackRegistry
        ids = PackRegistry((str(FIXTURE / "packs"),)).ids()
        self.assertIn("one", ids)
        self.assertIn("two", ids)
        self.assertNotIn("_partials", ids)
        self.assertFalse((FIXTURE / "packs" / "_partials" / "pack.json").exists())

    def test_import_after_the_first_rule_fails(self):  # C2, C6
        packs = self._tree()
        css = packs / "one" / "pack.css"
        css.write_text(css.read_text(encoding="utf-8") + '@import "../_partials/demo.css";\n', encoding="utf-8")
        self._fails(packs, "one", "'one'", "../_partials/demo.css", "after the first rule")

    def test_import_of_a_missing_partial_fails(self):  # C6
        packs = self._tree()
        (packs / "one" / "pack.css").write_text('@import "../_partials/missing.css";\n', encoding="utf-8")
        self._fails(packs, "one", "'one'", "../_partials/missing.css", "no such partial")

    def test_import_outside_partials_fails(self):  # C6
        packs = self._tree()
        (packs / "one" / "pack.css").write_text('@import "../two/pack.css";\n', encoding="utf-8")
        self._fails(packs, "one", "'one'", "../two/pack.css", "outside ../_partials/")

    def test_unscoped_partial_fails(self):  # C3, C6
        packs = self._tree()
        (packs / "_partials" / "demo.css").write_text(".mkd-button { color: red; }\n", encoding="utf-8")
        self._fails(packs, "one", "'one'", "../_partials/demo.css", ".mkd-button")

    def test_partial_with_appearance_branching_fails(self):  # C3, C6
        packs = self._tree()
        (packs / "_partials" / "demo.css").write_text(
            "@media (prefers-color-scheme: dark) { .mkd-scope .mkd-button { color: red; } }\n", encoding="utf-8")
        self._fails(packs, "one", "'one'", "../_partials/demo.css", "prefers-color-scheme")

    def test_scope_is_replaced_in_every_selector_only(self):  # C4: selector lists, @media, keyframes, comments
        packs = self._tree()
        (packs / "_partials" / "demo.css").write_text(
            "/* .mkd-scope in a comment stays */\n"
            ".mkd-scope .a, .mkd-scope .b:not(.c) { content: \".mkd-scope {\"; }\n"
            "@media (max-width: 400px) { .mkd-scope { gap: 2px; } }\n"
            "@keyframes mkd-demo { from { opacity: 0; } to { opacity: 1; } }\n", encoding="utf-8")
        (packs / "one" / "pack.css").write_text('@import "../_partials/demo.css";\n', encoding="utf-8")
        self.assertEqual(self.tool.resolve_pack_css(packs, "one"),
                         "/* .mkd-scope in a comment stays */\n"
                         ".mkd-pack-one .a, .mkd-pack-one .b:not(.c) { content: \".mkd-scope {\"; }\n"
                         "@media (max-width: 400px) { .mkd-pack-one { gap: 2px; } }\n"
                         "@keyframes mkd-demo { from { opacity: 0; } to { opacity: 1; } }\n")

    def test_site_pack_with_import_is_refused(self):  # C8
        from pathlib import Path
        from mockitdown.diagnostics import MockitdownError
        from mockitdown.packs import PackRegistry
        with tempfile.TemporaryDirectory() as tmp:
            (Path(tmp) / "acme").mkdir()
            (Path(tmp) / "acme" / "pack.json").write_text('{"id": "acme", "modules": ["Acme"]}', encoding="utf-8")
            (Path(tmp) / "acme" / "pack.css").write_text('@import "../_partials/x.css";\n', encoding="utf-8")
            with self.assertRaises(MockitdownError) as cm:
                PackRegistry((tmp,)).get("acme")
        self.assertEqual(cm.exception.diagnostic.message, "pack 'acme': @import is resolved only in built-in packs")

    def test_site_pack_with_import_in_a_comment_loads(self):  # C8: only an @import outside comments
        from pathlib import Path
        from mockitdown.packs import PackRegistry
        with tempfile.TemporaryDirectory() as tmp:
            (Path(tmp) / "acme").mkdir()
            (Path(tmp) / "acme" / "pack.json").write_text('{"id": "acme", "modules": ["Acme"]}', encoding="utf-8")
            (Path(tmp) / "acme" / "pack.css").write_text('/* no @import here */\n.mkd-pack-acme .mkd-button { color: red; }\n',
                                                         encoding="utf-8")
            self.assertEqual(PackRegistry((tmp,)).get("acme").id, "acme")

    def test_import_sharing_its_line_fails(self):  # C2, C6
        packs = self._tree()
        (packs / "one" / "pack.css").write_text('@import "../_partials/demo.css"; /* demo */\n', encoding="utf-8")
        self._fails(packs, "one", "'one'", "not on a line of its own")


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


    def test_hidden_packs_have_reference_data(self):  # R-PACK-010 TC-1 step 2 (C2)
        import json
        from mockitdown.packs import registry
        index = json.loads((SHARED / "reference" / "index.json").read_text(encoding="utf-8"))
        self.assertEqual(index["hidden"], ["hologram", "lcars", "phosphor"])
        listed = {i for g in index["groups"] for i in g["packs"]}
        self.assertFalse(listed & set(index["hidden"]))
        for pid in index["hidden"]:
            data = json.loads((SHARED / "reference" / f"{pid}.json").read_text(encoding="utf-8"))
            self.assertEqual(data["id"], pid)
            self.assertIsNone(data["group"])
            self.assertEqual({e["name"] for e in data["elements"]}, set(registry().get(pid).elements))
        res = subprocess.run([sys.executable, str(ROOT / "tools" / "gen_reference.py"), "--check"],
                             capture_output=True, text=True)
        self.assertEqual(res.returncode, 0, res.stdout + res.stderr)

if __name__ == "__main__":
    unittest.main()
