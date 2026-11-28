---
id: TC-4
title: The edit corpus is no set of render cases
verifies: [C15]
---

Automated by `test_edit_corpus_is_ignored` in `python/tests/test_conformance.py`: `shared/conformance/edit/`
exists, none of its files is counted as a corpus file, and in a copy of the corpus with an extra file
under `edit/`, `gen_conformance.py --check` passes and the file is still there afterwards.
