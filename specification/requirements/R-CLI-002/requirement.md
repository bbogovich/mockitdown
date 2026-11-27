---
id: R-CLI-002
title: Rendering options on the command line
status: active
version: 0.12.0
rev: 3
page: CLI.1
slot: reqs
order: 2
source: [SRC-2]
realizes: [F-13]
constrained_by: [A-CLI-1, M-OPT-1]
reverse_engineered: true
hash: aa6eb931153c
refs: [R-IMP-002]
---

C1: `render` and `check` MUST accept `--pack`, `--default-pack` (default `base`), `--device`, `--appearance` (one of the four), `--width`, `--height`, `--chrome`, `--title`, `--windowed`, `--elements`, `-I/--import` (repeatable), `-A/--asset-path` (repeatable), `-P/--pack-path` (repeatable) and `--no-embed`, with the meaning of the corresponding render option.
C2: When the source is a file, the CLI MUST set the render option `source_path` to its resolved path, so relative imports and images resolve against the file's directory first.
C3: Each `-I/--import` value MUST be `KEY=TARGET`, adding the import-map entry `KEY` → `TARGET` (R-IMP-002.C7), or a bare `TARGET`, adding `TARGET` to the targets of the empty key; repeated values for one key MUST form its target list in order.
V1: `mockitdown render screens/a.mockitdown -I lib` resolves `import "kpi"` from `screens/` and then `lib/`.
V2: `mockitdown render a.mockitdown -I acme/=vendor/acme/ -I lib` resolves `import "acme/cards"` from `vendor/acme/` and `import "kpi"` from the file's directory, then `lib/`.
