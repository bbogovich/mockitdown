---
id: TC-1
title: Library blocks in a site page
verifies: [C1, C2, C3, C4, C5, C6, C7, C9]
---

Converting Markdown pages with `markdown.Markdown(extensions=["mockitdown", "pymdownx.superfences"], …)`:

1. Page A: a block `library="cards"` declaring `Pill`, then a block `import "#cards"` / `Pill(text: "On")`: the output holds exactly one mockup figure and no listing (C1, C2, C3); with `source="true"` on the library block a code listing of its source appears and still no figure for it (C2).
2. Page A again with the importing block first: C4's error (C4).
3. Two library blocks named `cards`: the warning of C5, and the block after the second uses the second's `Pill` (C5).
4. Page B converted after a reset of the same `Markdown` instance: `import "#cards"` reports C4 (C6).
5. A syntax error in the library block, with `strict: true`, fails with a `SuperFencesException` naming the library block (C7).
6. `render(source, libraries={"cards": "struct Pill: View {…}"})` resolves `import "#cards"` (C9).

Automated in `python/tests/`.
