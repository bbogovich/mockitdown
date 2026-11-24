---
id: R-IMP-002
title: Resolving import paths
status: active
version: 0.2.0
rev: 0
page: IMP.1
slot: reqs
order: 2
source: [SRC-2]
realizes: [F-4]
constrained_by: [A-EVAL-1]
decisions: [ADR-10]
reverse_engineered: true
hash: 5f36b20ab9bc
---

C1: The evaluator MUST resolve an absolute import path as written.
C2: The evaluator MUST resolve a relative import path against the directory of the importing file — the component file for nested imports, the block's source file when known — and then against each configured import directory (`import_paths`) in order.
C3: For each candidate, the evaluator MUST try the path as written and then with `.mockitdown` appended, and MUST use the first existing file.
C4: If no candidate exists, then the evaluator MUST report the error "cannot find import 'x' (searched …)" listing the import directories, with code `import`.
C5: Relative import directories MUST be resolved against the process's working directory — for a site build, the directory the build is run from.
V1: With `import_paths: [docs/mockups]`, `import "shared/kpi"` loads `docs/mockups/shared/kpi.mockitdown`; inside it, `import "rows"` loads `docs/mockups/shared/rows.mockitdown`.
