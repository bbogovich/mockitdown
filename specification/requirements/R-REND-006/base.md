---
id: R-REND-006
title: Output safety
status: active
version: 0.2.0
rev: 0
page: REND.1
slot: reqs
order: 6
source: [SRC-2]
realizes: [F-8]
constrained_by: [A-REND-1, A-REND-3, A-ASSET-1]
decisions: [ADR-5]
reverse_engineered: true
hash: 30b7a53ed551
---

C1: The renderer MUST HTML-escape (including quotes) every value it writes into an attribute or text node.
C2: The renderer MUST NOT emit `<script>`, event-handler attributes, `<iframe>`, `<object>`, `<form>` or navigating links (`<a href>`) in mockup markup.
C3: The renderer MUST NOT write a source value into a `style` attribute unless it is a number converted to a length, an accepted colour (R-REND-004.C6) or a value from a fixed keyword table.
C4: The renderer MUST emit image `src` values only as resolved by the asset resolver (R-ASSET-001).
C5: The figure assembler MUST NOT emit markup from a fence attribute except escaped text (title, id, address) and validated tokens.
V1: A block whose strings contain `<script>`, `"` and `javascript:` renders them as inert text, and an `Image("javascript:alert(1)")` renders a placeholder.
<!-- file: prose.md -->
Documentation sites render untrusted contributions in pull-request previews; a mockup must not be
a way to inject script or style. Every path from source text to HTML goes through escaping or an
allow-list.
