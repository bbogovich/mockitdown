---
id: R-ASSET-001
title: Classifying image references
status: active
version: 0.2.0
rev: 0
page: ASSET.1
slot: reqs
order: 1
source: [SRC-2]
realizes: [F-5]
constrained_by: [A-ASSET-1]
decisions: [ADR-9]
reverse_engineered: true
hash: f6b2ecf714a7
---

C1: The asset resolver MUST pass through unchanged a reference starting with `http://`, `https://` or `//` (case-insensitive).
C2: The asset resolver MUST pass through unchanged a `data:image/<type>[;param…],…` URI, and MUST refuse any other `data:` URI with the warning "only data:image/… URIs are accepted" (code `asset`).
C3: If a reference starts with any other URI scheme (`javascript:`, `file:`, `ftp:`, …), then the asset resolver MUST refuse it with the warning "unsupported asset scheme in 'x'" (code `asset`).
C4: The asset resolver MUST treat every other non-empty reference as a local path, after trimming whitespace; an empty reference MUST resolve to nothing.
C5: When a reference is refused or not found, the renderer MUST draw the role's image placeholder (a photo icon, with the alt text or reference as label where the role has one).
V1: `Image("https://x/y.png")` keeps its URL; `Image("data:text/html,…")` and `Image("javascript:x")` warn and render placeholders.
<!-- file: prose.md -->
Only images, and only through schemes that cannot run code, reach the `src` attribute.
