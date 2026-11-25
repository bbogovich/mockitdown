"""Build hook: copy the shared assets into the package before setuptools collects it (R-REPO-002.C5).

Everything else is declared in pyproject.toml. In a repository checkout `shared/` sits beside
`python/`; in an sdist it does not, and the copies the sdist already carries are used.
"""

import runpy
from pathlib import Path

from setuptools import setup

_HERE = Path(__file__).resolve().parent
_TOOL = _HERE / "tools" / "sync_shared.py"
if _TOOL.is_file() and (_HERE.parent / "shared").is_dir():
    runpy.run_path(str(_TOOL))["sync"]()

setup()
