---
id: R-CLI-001
title: Commands
status: active
version: 0.2.0
rev: 0
page: CLI.1
slot: reqs
order: 1
source: [SRC-2, SRC-3]
realizes: [F-13]
constrained_by: [A-CLI-1]
reverse_engineered: true
hash: 0ec0d1efb95f
---

C1: The CLI MUST be installed as the command `mockitdown` and provide the subcommands `render`, `check`, `css`, `packs` and `elements`, and the option `--version` printing `mockitdown <version>`.
C2: A file argument MUST accept `-` for standard input.
C3: The CLI MUST exit 0 on success, 1 when a rendered or checked source has an error or when an error is raised (printed as `mockitdown: <message>` on standard error), and 2 on a usage error.
V1: `mockitdown --version` prints the version; `mockitdown render` without a file exits 2.
<!-- file: prose.md -->
The command line is a thin layer over the library API; everything a site can do per block, the
CLI can do per file.
