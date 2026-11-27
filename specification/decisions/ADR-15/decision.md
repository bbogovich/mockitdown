---
id: ADR-15
title: Annotation marks use CSS anchor positioning with an inline fallback
status: active
version: 0.10.2
rev: 1
page: ADR.1
slot: decisions
order: 999
source: [SRC-4]
constrains: [R-ANN-003]
hash: 98c91312fe07
---

D1: Annotation marks are drawn in a screen-level layer tied to the decorated element by CSS anchor positioning, with an inline copy inside the element as a fallback.
D2: The decorated element is the anchor itself; no wrapper is inserted.
O1: rejected: a wrapper element around the view — breaks the parent's flex and grid rules for the view.
O2: rejected: marks only inside the element — clipped by scrolling or rounded ancestors.
O3: rejected: JavaScript measuring element positions — mockitdown output is static.
C1: Browsers without anchor positioning show the inline copy, which may be clipped at container edges.
