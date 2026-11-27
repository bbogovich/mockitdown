---
id: R-IMP-002
title: Resolving import paths
status: active
version: 0.12.0
rev: 1
page: IMP.1
slot: reqs
order: 2
source: [SRC-2]
realizes: [F-4]
constrained_by: [A-EVAL-1]
decisions: [ADR-10]
reverse_engineered: true
hash: 5f9a4b7053a1
refs: [R-IMP-005, R-MDX-002, R-WEB-002]
---

C1: The evaluator MUST resolve an absolute import path as written.
C2: The evaluator MUST resolve an import path beginning with `./` or `../` against the directory of the importing file only — the component file for nested imports, the block's source file when known; without a known importing file it MUST report the error of C4.
C3: For each candidate, the evaluator MUST try the path as written and then with `.mockitdown` appended, and MUST use the first existing file.
C4: If no candidate exists, then the evaluator MUST report the error "cannot find import 'x' (tried …)" listing every candidate tried, in order, with code `import`.
C5: Relative paths in an import map MUST be resolved against the process's working directory — for a site build, the directory the build is run from; in the web components, against the import base URL (R-WEB-002.C3).
C6: The evaluator MUST resolve any other relative path (a bare specifier such as `shared/kpi`) first against the directory of the importing file, when that file is known, and then through the import map.
C7: An import map MUST be a mapping from keys to targets: a key ending in `/` matches every path that starts with it, the remainder of the path being joined to the target; any other non-empty key matches only the identical path, its target naming the file; the empty key `""` matches every path, the whole path being the remainder; when several keys match, the evaluator MUST use the longest.
C8: A target MUST be a directory or file path, an `http:`, `https:` or `file:` URL, or a list of these; the evaluator MUST try the candidates of each list entry (C3) in list order, and MUST NOT fall back to a shorter key when the longest matching key yields no file.
C9: The Python evaluator MUST read an `http:` or `https:` candidate with a GET request and a 10-second timeout, treating status 404 as a missing candidate and any other failure as an unreadable file (R-IMP-005.C1).
C10: The render API and the command line MUST default to an empty import map; the Markdown extension's default is R-MDX-002.C1's.
V1: With `imports: {"shared/": docs/mockups/shared/, "acme/": [vendor/acme/, "https://example.com/acme/"]}`, `import "shared/kpi"` loads `docs/mockups/shared/kpi.mockitdown`; inside it, `import "rows"` and `import "./rows"` load `docs/mockups/shared/rows.mockitdown`; `import "acme/cards"` loads `vendor/acme/cards.mockitdown` when it exists and otherwise `https://example.com/acme/cards.mockitdown`; `import "other/x"` reports C4 listing the candidates it tried.
