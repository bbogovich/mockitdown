What moved to `shared/`: the 38 packs, `page.css`, the icon table formerly written in `icons.py`, and the modifier lists and neutral import names formerly written in `vocabulary.py`. Their content did not change; the Python modules now load the JSON copies packaged beside them.

The Python build copies the files with `python/tools/sync_shared.py`, run by `python/setup.py` at every build from a checkout; the copies are ignored by git and travel in the sdist.
