---
id: R-CLI-004
title: check
status: active
version: 0.2.0
rev: 0
page: CLI.1
slot: reqs
order: 4
source: [SRC-3]
realizes: [F-13, F-12]
constrained_by: [A-CLI-1, A-API-1]
reverse_engineered: true
hash: d2bf74a8594c
---

C1: `mockitdown check FILE…` MUST render each file (so asset and icon problems are found) and print its diagnostics, then a summary line `<file>: ok (E errors, W warnings)` or `<file>: FAILED (…)`.
C2: With `--json`, `check` MUST print instead a JSON array with one object per file: `file`, `ok`, and `diagnostics` as objects with `severity`, `code`, `message`, `line`, `col` and `source`.
C3: `check` MUST exit 1 when any file has an error.
V1: Checking one good and one bad file prints `ok` and `FAILED` lines and exits 1; `--json` output parses as JSON.
