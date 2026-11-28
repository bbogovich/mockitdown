---
id: R-DIAG-004
title: The error box
status: active
version: 0.12.8
rev: 1
page: DIAG.1
slot: reqs
order: 4
source: [SRC-3]
realizes: [F-12]
constrained_by: [A-API-1]
reverse_engineered: true
hash: fbacc57e7692
---

C1: When a rendering has errors, the library API MUST place before the figure a `div.mkd-error[role=alert]` holding `div.mkd-error__title` and a list with one item per shown diagnostic.
C2: The title MUST read `mockitdown: 1 error` or `mockitdown: N errors`, or `mockitdown: warnings` when only warnings are shown.
C3: The box MUST list the errors, and also the warnings when `show_warnings` is on.
C4: When there are no errors and warnings are not shown, the library API MUST NOT emit the box.
V1: A block with one unknown element and one unknown modifier shows a box titled `mockitdown: 1 error` with one item (two with `show_warnings`).
