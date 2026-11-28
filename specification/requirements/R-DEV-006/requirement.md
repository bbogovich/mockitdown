---
id: R-DEV-006
title: Isolation from the host page
status: active
version: 0.12.9
rev: 1
page: REND.2
slot: reqs
order: 9
source: [SRC-2]
realizes: [F-8]
constrained_by: [A-STYLE-1]
reverse_engineered: true
hash: a3a543c4c367
---

C1: The page stylesheet MUST reset, inside frames, the host typography and box model that documentation themes apply (for example Material's and Zensical's `.md-typeset` margins, list styles, table and code styling), so that a mockup renders the same on any site.
C2: Every frame MUST establish its own stacking context and clip its content (`isolation: isolate`, `overflow: hidden`), so presentations and overlays stay inside the screen.
C3: All mockitdown CSS MUST be scoped to mockitdown classes, so it never restyles the host page.
V1: A mockup inside a Zensical page and the same mockup in `mockitdown render --standalone` output look the same.
