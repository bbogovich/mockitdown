---
id: R-MDX-006
title: Compatibility with instant navigation
status: active
version: 0.2.0
rev: 0
page: MDX.1
slot: reqs
order: 6
source: [SRC-3]
realizes: [F-11]
constrained_by: [A-MDX-1, A-REND-1]
decisions: [ADR-5]
reverse_engineered: true
hash: d6d13e9cddb0
---

C1: Mockups MUST render correctly when a theme replaces page content by script (Material's and Zensical's `navigation.instant`), because they need no initialisation script and carry their CSS with the page.
C2: mockitdown MUST NOT warn about or disable `navigation.instant`.
V1: With `navigation.instant` on, navigating from a page without mockups to one with mockups shows them styled.
