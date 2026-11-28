---
id: TC-1
title: Build log, strict mode and shown warnings
verifies: [C1, C2, C3, C4]
---

Python unit tests `python/tests/test_markdown_ext.py` `BuildLogTests`: a block with an unknown element and an unknown modifier logs one ERROR and one
WARNING to `mkdocs.extensions.mockitdown`, each "mockitdown block '<first line>': <diagnostic>"; the label is the
first non-empty line cut to 48 characters, or the fence title, quoted (C1); with `strict: true` an unknown element and
an unknown fence attribute each raise `SuperFencesException` with the message of C2, while a warning alone does not
(C2, V1); without strict, a block with errors renders its error box and the page goes on to the next block (C3); a
warning appears in the page's diagnostic box only with `show_warnings: true`, and in the log either way (C4).
