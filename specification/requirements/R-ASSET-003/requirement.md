---
id: R-ASSET-003
title: Embedding local images
status: active
version: 0.2.0
rev: 0
page: ASSET.1
slot: reqs
order: 3
source: [SRC-2]
realizes: [F-5]
constrained_by: [A-ASSET-1]
decisions: [ADR-9]
reverse_engineered: true
hash: 96e48adcb3b6
---

C1: While embedding is on (`embed_assets`, default on), the asset resolver MUST return a found local image as a `data:<mime>;base64,…` URI.
C2: The asset resolver MUST determine the MIME type from the extension (`.png`, `.jpg`/`.jpeg`, `.gif`, `.webp`, `.svg`, `.avif`, `.ico`, `.bmp`), else from the platform's MIME table; if the type is not `image/*`, then it MUST warn "asset 'x' is not a recognised image type" (code `asset`) and resolve to nothing.
C3: If a found file is larger than `max_embed_bytes` (default 2,000,000), then the asset resolver MUST return the reference as written (a link) and warn that it is linked instead (code `asset`).
C4: While embedding is off, the asset resolver MUST return a local reference as written, without checking that the file exists.
C5: The asset resolver MUST read and encode each file at most once per rendering.
V1: A 3 KB SVG embeds as `data:image/svg+xml;base64,…`; a 3 MB PNG is linked with a warning; with `--no-embed` the reference is emitted unchanged.
