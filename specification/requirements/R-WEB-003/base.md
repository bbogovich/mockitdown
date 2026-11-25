---
id: R-WEB-003
title: Development server
status: active
version: 0.6.0
rev: 0
page: WEB.2
slot: reqs
order: 1
hash: ee3f6b8a739a
source: [SRC-8]
realizes: [F-18]
requires: [R-WEB-001]
constrained_by: [ADR-20]
---

C1: `npm run serve` MUST build the package and start a static file server built on `node:http`, serving `pages/`, `dist/` and `shared/` on `http://127.0.0.1:8173/` (port overridable by `PORT`).
C2: The server MUST serve correct content types for HTML, JavaScript modules, CSS, JSON, SVG, PNG and `.mockitdown` files.
C3: The server MUST refuse any path that resolves outside the served folders with status 404.
C4: The server's root MUST be an index page linking every test page.
V1: A unit test starts the server on a free port, fetches the index, a module and a pack stylesheet, and checks that `/../package.json` is refused.
<!-- file: TC-1.md -->
---
id: TC-1
title: Static server
verifies: [C3]
---

Automated by `typescript/tests/unit/serve.test.ts`.
<!-- file: prose.md -->
Development only; the package itself has no server part (F-17.C6).
