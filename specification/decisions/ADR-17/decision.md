---
id: ADR-17
title: One repository for both variants, with shared assets
status: active
version: 0.6.0
rev: 0
page: ADR.2
slot: decisions
order: 999
hash: 63c70c92fef2
source: [SRC-8]
constrains: [R-REPO-001, R-REPO-002, R-REPO-003]
---

D1: The Python and TypeScript variants live in one repository, in `python/` and `typescript/`, with the assets both publish in `shared/`.
D2: `shared/` is the only place a pack definition, pack stylesheet, page stylesheet, icon glyph, modifier vocabulary, reference sample, design pattern or conformance case is written; each variant's build copies what it publishes.
D3: The Python package keeps its name, version line, public API and command line; only its location in the repository changes.
O1: rejected: two repositories with a shared Git submodule or a published asset package — two release lines and a third artefact for one set of files.
O2: rejected: symbolic links from the Python package into `shared/` — they break on Windows checkouts and in sdists.
C1: A pack change is one commit that both test suites verify.
C2: Release workflows, Pages workflows and documentation paths move with the code.
