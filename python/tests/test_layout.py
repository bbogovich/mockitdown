"""Repository layout after the split into python/, typescript/ and shared/ (R-REPO-001, R-REPO-002)."""

import ast
import json
import re
import shutil
import subprocess
import unittest

from tests.helpers import ROOT

REPO = ROOT.parent
#: The R-PACK-018 TC-1 fixture: two packs and a partial that only the tests read.
FIXTURES = "python/tests/fixtures/"
#: R-REPO-001.C1 (variant folders) and C4 (cross-variant files).
ALLOWED = {"python", "typescript", "shared",
           "README.md", "LICENSE", "CLAUDE.md", "HANDOFF.md", ".github", ".specitout", ".claude", ".gitignore"}


def _files() -> list[str]:
    """Tracked files plus untracked ones that are not ignored, relative to the repository root."""
    res = subprocess.run(["git", "ls-files", "--cached", "--others", "--exclude-standard"],
                         cwd=REPO, capture_output=True, text=True, check=True)
    return [f for f in res.stdout.splitlines() if f]


@unittest.skipUnless(shutil.which("git") and (REPO / ".git").exists() and (REPO / "shared").is_dir(),
                     "not a git checkout of the repository")
class LayoutTests(unittest.TestCase):
    def test_root_holds_only_variants_and_cross_variant_files(self):  # R-REPO-001 TC-1
        top = {f.split("/", 1)[0] for f in _files()}
        self.assertEqual(sorted(top - ALLOWED), [], "unexpected entries at the repository root")
        self.assertTrue({"python", "shared"} <= top)

    def test_no_pack_outside_shared(self):  # R-REPO-002 TC-2, TC-4 step 1 (C1 to C4)
        # The build outputs are ignored by git; the R-PACK-018 test fixture is not a built-in pack.
        names = ("pack.json", "pack.css", "page.css", "icons.json", "vocabulary.json", "roles.json")
        stray = [f for f in _files() if f.rsplit("/", 1)[-1] in names
                 and not f.startswith(("shared/", FIXTURES))]
        self.assertEqual(stray, [])

    def test_icon_and_vocabulary_files_hold_their_tables(self):  # R-REPO-002 TC-4 step 1 (C3, C4)
        icons = json.loads((REPO / "shared/icons/icons.json").read_text(encoding="utf-8"))
        self.assertIsInstance(icons["glyphs"], dict)
        self.assertIsInstance(icons["aliases"], dict)
        vocab = json.loads((REPO / "shared/language/vocabulary.json").read_text(encoding="utf-8"))
        for key in ("rendered", "ignored", "neutral_modules"):
            self.assertIsInstance(vocab[key], list, key)

    def test_shared_css_is_a_pack_stylesheet_or_a_partial(self):  # R-REPO-002 TC-4 step 5 (C1)
        for f in _files():
            if f.startswith("shared/packs/") and f.endswith(".css"):
                parts = f.split("/")[2:]
                with self.subTest(file=f):
                    if parts[0] == "_partials":
                        self.assertEqual(len(parts), 2)
                        self.assertRegex(parts[1], r"^[A-Za-z0-9_-]+\.css$")
                    else:
                        self.assertEqual((len(parts), parts[-1]), (2, "pack.css"))
                        self.assertTrue((REPO / "shared/packs" / parts[0] / "pack.json").is_file())

    def test_no_run_time_access_to_shared(self):  # R-REPO-002 TC-4 step 2 (C5)
        bad = []
        for f in sorted((REPO / "python/src/mockitdown").rglob("*.py")):
            tree = ast.parse(f.read_text(encoding="utf-8"))
            docs = {id(n.body[0].value) for n in ast.walk(tree)
                    if isinstance(n, (ast.Module, ast.ClassDef, ast.FunctionDef, ast.AsyncFunctionDef))
                    and n.body and isinstance(n.body[0], ast.Expr) and isinstance(n.body[0].value, ast.Constant)}
            for n in ast.walk(tree):
                if (isinstance(n, ast.Constant) and isinstance(n.value, str) and id(n) not in docs
                        and "shared" in n.value):
                    bad.append(f"{f.relative_to(REPO)}:{n.lineno}")
        src = REPO / "typescript/src"
        for f in sorted(src.rglob("*.ts")):
            code = re.sub(r"/\*.*?\*/", "", f.read_text(encoding="utf-8"), flags=re.S)
            for no, line in enumerate(code.splitlines(), 1):
                line = re.sub(r"(^|\s)//.*", "", line)
                if "shared/" not in line:
                    continue
                # The only run-time path: dist/shared/ beside the compiled module, e.g. new URL("./shared/", import.meta.url).
                m = re.search(r'new URL\("([^"]*shared/)", import\.meta\.url\)', line)
                compiled = (REPO / "typescript/dist" / f.relative_to(src)).parent
                if not m or (compiled / m.group(1)).resolve() != (REPO / "typescript/dist/shared").resolve():
                    bad.append(f"{f.relative_to(REPO)}: {line.strip()}")
        self.assertEqual(bad, [])

    def test_builds_and_loaders_execute_nothing_shared(self):  # R-REPO-002 TC-4 step 3 (C7)
        files = ["python/tools/sync_shared.py", "typescript/scripts/copy-shared.mjs",
                 "python/src/mockitdown/packs/__init__.py", "python/src/mockitdown/icons.py",
                 "python/src/mockitdown/vocabulary.py", "python/src/mockitdown/styles.py",
                 "typescript/src/core/assets.ts", "typescript/src/core/packs/registry.ts",
                 "typescript/src/core/icons.ts", "typescript/src/core/vocabulary.ts",
                 "typescript/src/elements/assets.ts", "typescript/src/node.ts"]
        pattern = re.compile(r"(?<![\w.])(eval|exec|Function|import|__import__|run_path|import_module)\s*\(")
        hits = [f"{f}: {m.group(0)}" for f in files
                for m in pattern.finditer((REPO / f).read_text(encoding="utf-8"))]
        self.assertEqual(hits, [])

    def test_root_readme_links_the_python_variant(self):  # R-REPO-001.C5
        text = (REPO / "README.md").read_text(encoding="utf-8")
        self.assertIn("python/README.md", text)


if __name__ == "__main__":
    unittest.main()
