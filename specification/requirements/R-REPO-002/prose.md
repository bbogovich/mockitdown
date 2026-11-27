What moved to `shared/`: the 38 packs, `page.css`, the icon table formerly written in `icons.py`, and the modifier lists and neutral import names formerly written in `vocabulary.py`. Their content did not change; the Python modules now load the JSON copies packaged beside them.

The Python build copies the files with `python/tools/sync_shared.py`, run by `python/setup.py` at every build from a checkout; the copies are ignored by git and travel in the sdist.

The role rule table joins the vocabulary as shared language data (R-PACK-016). Both packages carry it,
and the copy tests of C6 cover it; only the TypeScript design tools read it for now.

Re-checked at 0.10.3 together with the items it cites or is cited by (specification audit, #51): the citations are still accurate and no obligation changed.
**Stylesheet partials (SRC-18#health).** A pack stylesheet may include shared partials
(R-PACK-018); the partials live in `shared/packs/_partials/` and reach the packages only inside the
resolved `pack.css` copies, so the copy check compares a copy with its resolution rather than with the
file in `shared/`.
