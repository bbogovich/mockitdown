---
id: ADR-23
title: TypeScript releases under their own tags, as GitHub release assets
status: active
version: 0.11.0
rev: 0
page: ADR.3
slot: decisions
order: 3
source: [SRC-18]
constrains: [R-WEB-007]
hash: 4ab36f30a069
---

D1: The TypeScript package is released under its own tags `ts-vX.Y.Z`, with its own version line in `typescript/package.json`, by its own workflow, separate from the Python package's `vX.Y.Z` tags and PyPI workflow.
D2: A TypeScript release is published as the `npm pack` archive attached to a GitHub release; it is not published to the npm registry.
O1: rejected: one tag and one GitHub release for both variants — the Python package is at 0.4.0 and the TypeScript package at 0.1.0, the Python workflow requires the tag to equal its own version, and a shared tag would force the two version lines into lockstep and tie a PyPI failure to the TypeScript release.
O2: rejected: publishing to the npm registry now — it adds an account, a token or trusted-publisher setup and a public name to maintain, while the request asks only for release builds on GitHub; it can follow without changing D1.
C1: A TypeScript release needs a version bump in `typescript/package.json` and a `ts-v` tag; it never moves or reuses a pushed tag, and a failed release after the GitHub release exists is followed by the next patch version.
C2: Projects install a release by the archive's URL (`npm install <url>`), which pins the exact build.
<!-- file: prose.md -->
**Context.** SRC-18#gallery asks for release builds of the packaged TypeScript library on GitHub. The
repository already releases the Python package by tags `vX.Y.Z` that `.github/workflows/release.yml` checks
against `python/pyproject.toml` and publishes to PyPI.

**Decision.** The TypeScript package keeps its own version line and its own tag prefix, `ts-v`, and is
released by its own workflow as an archive on a GitHub release.

**Consequences.** Two independent release flows that cannot trigger each other; the gallery home page and
the TypeScript README point at the releases page; moving to the npm registry later is one more step in
the same workflow.
