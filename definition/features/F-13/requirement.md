---
id: F-13
title: Command-line tool
status: active
version: 0.2.0
rev: 0
page: FEAT.2
slot: features
order: 6
family: rendering
source: [SRC-2, SRC-3]
hash: 189259373456
---

G1: Mockups must be renderable and checkable outside a documentation build — in editors, scripts and continuous integration.
C1: A command renders a mockup file to an HTML fragment or a standalone HTML page.
C2: A command checks mockup files and reports diagnostics, as text or JSON, with an exit status that fails on errors.
C3: A command writes the stylesheet for chosen packs, for sites that link the CSS themselves.
C4: Commands list the available packs and one pack's element catalogue (also as a Markdown table for documentation).
C5: The command line accepts the same rendering options as the fence.
AC1: `mockitdown check screen.mockitdown` exits 1 when the file has an error and 0 otherwise.
AC2: `mockitdown render screen.mockitdown --standalone -o screen.html` produces a page that opens offline.
