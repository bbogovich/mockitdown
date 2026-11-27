The Python variant behaves exactly as before; only paths change. A wheel built after the move holds the same files as the 0.3.0 wheel, plus `icons.json` and `vocabulary.json`, which `icons.py` and `vocabulary.py` now load.

The reference JSON carries the same data as the Reference page of a pack, so the TypeScript pack gallery (R-WEB-004) and the example site show the same samples. `index.json` gives the gallery its side-panel groups (Core, Wireframe, Desktop, Web, Mobile, Retro). The repository's `LICENSE` stays at the root (R-REPO-001.C4) and is copied beside `pyproject.toml` at build time.

Checked at 0.10.1 after R-REPO-002.C8 (`shared/language/roles.json`): the file is a shared asset the wheel and sdist carry through C2, copied by the same build step as `vocabulary.json`; the other clauses are unaffected.

Re-checked at 0.10.3 together with the items it cites or is cited by (specification audit, #51): the citations are still accurate and no obligation changed.
