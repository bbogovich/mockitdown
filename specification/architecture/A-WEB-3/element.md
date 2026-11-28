---
id: A-WEB-3
title: Development server and test pages
status: active
version: 0.14.1
rev: 1
page: ARCH.3
slot: elements
order: 4
hash: 1991c87a9d67
level: module
refs: [A-REPO-1, A-WEB-2]
---

P1: provides: the development server `typescript/scripts/serve.mjs`, the test pages under `typescript/pages/` (the gallery home page and the pack gallery share the page chrome stylesheet `typescript/pages/chrome.css`: colour tokens, light and dark, and the top bar) and the browser tests under `typescript/tests/browser/`
U1: uses A-WEB-2 — every mockup on a test page
U2: uses A-REPO-1 — reference samples and design patterns
K1: The development server MUST serve files only from the package, its build output and `shared/`, and MUST bind to the loopback interface.
