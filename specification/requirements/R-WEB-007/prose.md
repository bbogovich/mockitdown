**Requirement.** The TypeScript library is released by tagging `ts-vX.Y.Z`: a workflow checks the tag,
tests, packs the package with `npm pack` and attaches the archive to a GitHub release.

**Rationale.** SRC-18#gallery asks for release builds of the packaged TypeScript library on GitHub so
projects can use it; F-17.C7. Why its own tags and no npm registry: ADR-23.

**Verification.** TC-1 (the workflow, checked on a real tag), TC-2 (the archive's content, in `npm test`).


**Re-checked at specification 0.12.10.** Re-read against R-WEB-001 (changed at 0.12.0: SRC-19 import map (0.12.0), which changes how imports are found and nothing this item obliges). No obligation this item rests on changed, and none of its clauses is altered (#81).
