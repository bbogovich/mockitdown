**Context.** SRC-18#gallery asks for release builds of the packaged TypeScript library on GitHub. The
repository already releases the Python package by tags `vX.Y.Z` that `.github/workflows/release.yml` checks
against `python/pyproject.toml` and publishes to PyPI.

**Decision.** The TypeScript package keeps its own version line and its own tag prefix, `ts-v`, and is
released by its own workflow as an archive on a GitHub release.

**Consequences.** Two independent release flows that cannot trigger each other; the gallery home page and
the TypeScript README point at the releases page; moving to the npm registry later is one more step in
the same workflow.


**Re-checked at specification 0.12.12.** Re-read after the clarification records of the items it cites (#81), which closed the suspect citations left by the test-case backfills (#54 to #60) and the SRC-19 import map (0.12.0). No obligation it rests on changed, and none of its clauses is altered.
