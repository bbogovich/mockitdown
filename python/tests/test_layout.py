"""Repository layout after the split into python/, typescript/ and shared/ (R-REPO-001, R-REPO-002)."""

import shutil
import subprocess
import unittest

from tests.helpers import ROOT

REPO = ROOT.parent
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

    def test_no_pack_outside_shared(self):  # R-REPO-002 TC-2
        stray = [f for f in _files()
                 if f.rsplit("/", 1)[-1] in ("pack.json", "pack.css") and not f.startswith("shared/packs/")]
        self.assertEqual(stray, [])

    def test_root_readme_links_the_python_variant(self):  # R-REPO-001.C5
        text = (REPO / "README.md").read_text(encoding="utf-8")
        self.assertIn("python/README.md", text)


if __name__ == "__main__":
    unittest.main()
