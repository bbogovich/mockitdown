---
id: R-CLI-002
title: Rendering options on the command line
status: active
version: 0.2.0
rev: 0
page: CLI.1
slot: reqs
order: 2
source: [SRC-2]
realizes: [F-13]
constrained_by: [A-CLI-1, M-OPT-1]
reverse_engineered: true
hash: 4678a1b46fa2
---

C1: `render` and `check` MUST accept `--pack`, `--default-pack` (default `base`), `--device`, `--appearance` (one of the four), `--width`, `--height`, `--chrome`, `--title`, `--elements`, `-I/--import-path` (repeatable), `-A/--asset-path` (repeatable), `-P/--pack-path` (repeatable) and `--no-embed`, with the meaning of the corresponding render option.
C2: When the source is a file, the CLI MUST set the render option `source_path` to its resolved path, so relative imports and images resolve against the file's directory first.
V1: `mockitdown render screens/a.mockitdown -I lib` resolves `import "kpi"` from `screens/` and then `lib/`.
