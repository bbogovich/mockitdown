---
id: TC-1
title: Collection and tuple literals
verifies: [C1, C2, C3]
---

Python unit tests `python/tests/test_expressions.py` `CollectionLiteralTests`: an array of two tuples, a
dictionary, entries across line feeds with a trailing comma, `[]`, `[:]` as an empty dictionary and nested
literals (C1, V1); `[1, "a": 2]` and `["a": 2, 1]` raise "a collection literal mixes array and dictionary
entries" (C2, V1); two or more expressions or any labelled ones form a tuple, across line feeds too,
while `(1 + 2)` and `((1))` are the expression itself (C3).
