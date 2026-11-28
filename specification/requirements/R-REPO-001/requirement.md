---
id: R-REPO-001
title: Repository layout
status: active
version: 0.12.11
rev: 3
page: REPO.1
slot: reqs
order: 1
hash: 79e1aad474c6
source: [SRC-8]
realizes: [F-16]
constrained_by: [ADR-17]
refs: [A-REPO-1]
---

C1: The repository MUST have the top-level folders `python/` (the Python variant), `typescript/` (the TypeScript variant) and `shared/` (A-REPO-1).
C2: `python/` MUST hold the Python package's `pyproject.toml`, `src/mockitdown/`, `tests/`, `tools/` and the example site `examples/site/`.
C3: `typescript/` MUST hold the NPM package's `package.json`, `tsconfig.json`, `src/`, `tests/`, `pages/` and `scripts/`.
C4: The repository root MUST keep only cross-variant files: `README.md`, `LICENSE`, `CLAUDE.md`, `HANDOFF.md`, `.github/`, `.specitout/`, `.claude/` and `.gitignore`.
C5: The root `README.md` MUST describe both variants and link to each variant's own `README.md`.
C6: `CLAUDE.md` MUST give the build and test commands of both variants, and its release procedure MUST use the new paths.
V1: A test lists the repository root and fails on any entry not named in C4 or C1.
