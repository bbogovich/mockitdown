---
id: R-ANN-004
title: Callout references in prose
status: active
version: 0.3.0
rev: 0
page: ANN.1
slot: reqs
order: 999
source: [SRC-4]
realizes: [F-15]
reverse_engineered: true
hash: 0ea118cfccaf
---

C1: With the extension option `callout_refs` (default true), the Markdown extension MUST render `(#n)` in prose — n a number of one or two digits or a capital letter — as an inline numbered circle (`span.mkd-ref`) matching a mockup's `.callout(n)`.
C2: `(#n colour)` MUST colour the circle with one of red, orange, yellow, green, teal, blue, indigo, purple, pink or gray, matching a callout drawn with `color:`.
C3: The pattern MUST NOT match inside a link destination such as `[text](#1)`.
V1: `Enter the name (#1).` converts to text containing `<span class="mkd-ref">1</span>`.
<!-- file: prose.md -->
Prose and picture refer to each other with the same numbered circle, so a reader can follow steps without hunting for them.
