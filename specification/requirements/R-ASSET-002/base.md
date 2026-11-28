---
id: R-ASSET-002
title: Finding local images
status: active
version: 0.2.0
rev: 0
page: ASSET.1
slot: reqs
order: 2
source: [SRC-2]
realizes: [F-5]
constrained_by: [A-ASSET-1]
decisions: [ADR-9]
reverse_engineered: true
hash: b95f75d5c911
---

C1: The asset resolver MUST search a local reference, with any `?query` or `#fragment` removed, relative to the directory of the file the block came from (when known), then relative to each configured asset directory (`asset_paths`) in order, and MUST use the first existing file.
C2: The asset resolver MUST only read a file whose resolved real path lies inside one of those search roots; a reference escaping them (`../../etc/passwd`, an absolute path elsewhere, a symbolic link out) MUST be treated as not found.
C3: If no file is found, then the asset resolver MUST warn "asset 'x' not found (searched …)" listing the search roots, with code `asset`.
C4: Relative asset directories MUST be resolved against the process's working directory — for a site build, the directory the build is run from.
V1: With `asset_paths: [docs]`, `Image("assets/images/logo.svg")` finds `docs/assets/images/logo.svg`; `Image("../secret.png")` is not found even if the file exists.
<!-- file: prose.md -->
The containment rule matters because documentation builds run on CI with access to the whole
repository: a mockup may only embed files the site deliberately exposes.

**Known gap.** A fenced block in a Markdown page has no known file (Python-Markdown does not tell
the fence which page it is rendering), so in a site build only the configured asset directories are
searched; resolution against the block's own directory applies to the command line and the library
API when a source path is given.
