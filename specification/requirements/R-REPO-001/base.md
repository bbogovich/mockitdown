---
id: R-REPO-001
title: Repository layout
status: active
version: 0.6.0
rev: 0
page: REPO.1
slot: reqs
order: 1
hash: b28311b24246
source: [SRC-8]
realizes: [F-16]
constrained_by: [ADR-17]
---

C1: The repository MUST have the top-level folders `python/` (the Python variant), `typescript/` (the TypeScript variant) and `shared/` (A-REPO-1).
C2: `python/` MUST hold the Python package's `pyproject.toml`, `src/mockitdown/`, `tests/`, `tools/` and the example site `examples/site/`.
C3: `typescript/` MUST hold the NPM package's `package.json`, `tsconfig.json`, `src/`, `tests/`, `pages/` and `scripts/`.
C4: The repository root MUST keep only cross-variant files: `README.md`, `LICENSE`, `CLAUDE.md`, `HANDOFF.md`, `.github/`, `.specitout/`, `.claude/` and `.gitignore`.
C5: The root `README.md` MUST describe both variants and link to each variant's own `README.md`.
C6: `CLAUDE.md` MUST give the build and test commands of both variants, and its release procedure MUST use the new paths.
V1: A test lists the repository root and fails on any entry not named in C4 or C1.
<!-- file: TC-1.md -->
---
id: TC-1
title: Root holds only the variant folders and cross-variant files
verifies: [C1]
---

Automated by `python/tests/test_layout.py`: the root contains exactly the entries of C1 and C4 (plus ignored files).
<!-- file: prose.md -->
The layout shown on this page. Moving files keeps their history (`git mv`).
