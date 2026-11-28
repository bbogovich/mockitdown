---
id: R-CLI-005
title: css
status: active
version: 0.12.8
rev: 1
page: CLI.1
slot: reqs
order: 5
source: [SRC-2]
realizes: [F-13, F-11]
constrained_by: [A-CLI-1, A-STYLE-1]
decisions: [ADR-8]
reverse_engineered: true
hash: 25e9fa5516eb
---

C1: `mockitdown css` MUST write the stylesheet for the packs given by repeatable `--pack` options, or for every known pack when none is given, including site packs from `-P/--pack-path`.
C2: The stylesheet MUST be minified unless `--pretty` is given.
C3: With `-o/--output`, the CLI MUST create the output file's parent directories as needed.
V1: `mockitdown css --pack fluent -o docs/assets/mockitdown.css` writes base and Fluent CSS for a `css: none` site.
