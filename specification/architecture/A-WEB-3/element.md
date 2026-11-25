---
id: A-WEB-3
title: Development server and test pages
status: active
version: 0.6.0
rev: 0
page: ARCH.3
slot: elements
order: 4
hash: 45e68f24a657
level: module
---

P1: provides: the development server `typescript/scripts/serve.mjs`, the test pages under `typescript/pages/` and the browser tests under `typescript/tests/browser/`
U1: uses A-WEB-2 — every mockup on a test page
U2: uses A-REPO-1 — reference samples and design patterns
K1: The development server MUST serve files only from the package, its build output and `shared/`, and MUST bind to the loopback interface.
