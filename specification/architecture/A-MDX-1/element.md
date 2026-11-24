---
id: A-MDX-1
title: Markdown extension
status: active
version: 0.2.0
rev: 0
page: ARCH.2
slot: elements
order: 7
level: module
hash: 669070104c9a
---

P1: provides: `MockitdownExtension` (site options, per-Markdown session, CSS postprocessor) (`mockitdown.extension`)
U1: uses A-OPT-1 — build the site's render options
U2: uses A-STYLE-1 — the per-page stylesheet
K1: The Markdown extension MUST NOT render blocks itself; rendering happens in the fence.
