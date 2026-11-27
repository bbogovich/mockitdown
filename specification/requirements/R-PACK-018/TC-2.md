---
id: TC-2
title: No duplicated stylesheet runs
verifies: [C9]
---

Python unit test `python/tests/test_packs.py::test_no_duplicated_css_runs`: normalise each line of
`shared/packs/*/pack.css` and `shared/packs/_partials/*.css` (trim, collapse white space, drop lines
shorter than four characters or without a word character), hash every run of six consecutive kept
lines, and fail listing file and line of every run that occurs twice (in two files or within one).
The same measure as the VibeItOut health report's duplicate blocks, so that after the migration the
report counts no duplicated block in a pack stylesheet.
