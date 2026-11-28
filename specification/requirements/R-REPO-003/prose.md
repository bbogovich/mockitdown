The Python variant behaves exactly as before; only paths change. A wheel built after the move holds the same files as the 0.3.0 wheel, plus `icons.json` and `vocabulary.json`, which `icons.py` and `vocabulary.py` now load.

The reference JSON carries the same data as the Reference page of a pack, so the TypeScript pack gallery (R-WEB-004) and the example site show the same samples. `index.json` gives the gallery its side-panel groups (Core, Wireframe, Desktop, Web, Mobile, Retro). The repository's `LICENSE` stays at the root (R-REPO-001.C4) and is copied beside `pyproject.toml` at build time.

Checked at 0.10.1 after R-REPO-002.C8 (`shared/language/roles.json`): the file is a shared asset the wheel and sdist carry through C2, copied by the same build step as `vocabulary.json`; the other clauses are unaffected.

Re-checked at 0.10.3 together with the items it cites or is cited by (specification audit, #51): the citations are still accurate and no obligation changed.

**Re-checked at 0.11.0.** Its cited items ADR-17, R-REPO-002 changed with SRC-18 (all packs recorded, stylesheet partials, gallery home page and easter eggs, TypeScript release builds, new packs); no obligation of this item changed.

Re-checked after R-REPO-002 was recorded as built (#54, partials resolved into the package copies, TC-4 tests named): no obligation of this requirement changed.


**Re-checked at specification 0.12.12.** Re-read after the clarification records of the items it cites (#81), which closed the suspect citations left by the test-case backfills (#54 to #60) and the SRC-19 import map (0.12.0). No obligation it rests on changed, and none of its clauses is altered.
