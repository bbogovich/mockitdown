---
id: TC-1
title: render to a fragment or a standalone page
verifies: [C1, C2, C3]
---

Python unit tests `python/tests/test_cli.py` `RenderCommandTests`: a file with an unknown icon writes
the fragment (`div.mkd-figure`, no `<html>`) to standard output, or to `-o` with nothing on standard
output, and its `warning [icon]` line to standard error only (C1). `--standalone -o a.html` for a Fluent
source writes a page starting `<!doctype html>` with the UTF-8 charset, the responsive viewport, the title
`a` (from the file name; `--title` escaped when given; `mockitdown` for standard input), the neutral
background with its `prefers-color-scheme: dark` variant, the Fluent and base rules inlined, no other
pack and no `<link>` (C2, V1); a syntax error, which uses no pack, inlines `base` (C2). A file with an
error writes its output, error box included, and exits 1 (C3).
