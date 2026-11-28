---
id: R-CLI-003
title: render
status: active
version: 0.2.0
rev: 0
page: CLI.1
slot: reqs
order: 3
source: [SRC-3]
realizes: [F-13]
constrained_by: [A-CLI-1, A-API-1]
reverse_engineered: true
hash: 84a4fcbe17fc
---

C1: `mockitdown render FILE` MUST write the HTML fragment to standard output, or to the file given by `-o/--output`, and print diagnostics to standard error.
C2: With `--standalone`, the CLI MUST write a complete HTML document (UTF-8, responsive viewport, title from `--title` or the file name, a neutral page background with a dark-scheme variant) with the stylesheet for the used packs (or `base` when none) inlined.
C3: `render` MUST exit 1 when the source has an error, after writing the output.
V1: `mockitdown render a.mockitdown --standalone -o a.html` writes a page that opens offline and shows the mockup styled.
<!-- file: prose.md -->

<!-- no newline -->
