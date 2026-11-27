---
id: TC-1
title: A layout template with slots
verifies: [C1, C2, C3, C4, C5]
---

The struct `AppShell` of V1, with the body `HStack { sidebar; VStack { Text(title); toolbar; content } }`:

1. `AppShell(title: "Orders", toolbar: Button("New")) { Text("Table") }` renders Orders, Nav, the button and Table with no diagnostic (C3, C4).
2. `AppShell(sidebar: { Text("Mine") }) { Text("Table") }` — and the labelled trailing-closure form — render Mine instead of Nav (C4).
3. `AppShell { Text("Table") }` renders App, Nav and Table, no toolbar element and no diagnostic, both in a block and outside a preview (C1, C2).
4. A default `sidebar` that reads `title` shows the bound title (C1: struct scope).
5. The conformance corpus holds `template-slots` with the two calls of C5, run by both variants (C5).

Automated in `python/tests/test_render.py` and the conformance corpus.
