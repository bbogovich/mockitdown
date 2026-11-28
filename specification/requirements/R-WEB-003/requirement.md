---
id: R-WEB-003
title: Development server
status: active
version: 0.12.11
rev: 6
page: WEB.2
slot: reqs
order: 1
hash: a9fc884bed6e
source: [SRC-8]
realizes: [F-18]
requires: [R-WEB-001]
constrained_by: [ADR-20]
---

C1: `npm run serve` MUST build the package and start a static file server built on `node:http`, serving `pages/`, `dist/` and `shared/` on `http://127.0.0.1:8173/` (port overridable by `PORT`).
C2: The server MUST serve correct content types for HTML, JavaScript modules, CSS, JSON, SVG, PNG and `.mockitdown` files.
C3: The server MUST refuse any path that resolves outside the served folders with status 404.
C4: The server's root MUST be an index page linking every test page.
C5: The server MUST map the URL paths `/pages/`, `/dist/` and `/shared/` to `typescript/pages/`, `typescript/dist/` and the repository's `shared/`, so that a test page reaches the package and the shared files by the relative paths `../dist/` and `../shared/`.
C6: The server MUST generate the index from the `.html` files in `pages/`, each linked with the text of its `<title>`.
C7: The server MUST serve `.mockitdown` files as `text/plain; charset=utf-8`.
C8: The server MUST answer a method other than `GET` and `HEAD` with status 405.
V1: A unit test starts the server on a free port, fetches the index, a module and a pack stylesheet, and checks that `/../package.json` is refused.
