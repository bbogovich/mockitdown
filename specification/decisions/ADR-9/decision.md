---
id: ADR-9
title: Local images are embedded as data URIs at build time
status: active
version: 0.2.0
rev: 0
page: ADR.2
slot: decisions
order: 2
source: [SRC-2]
constrains: [R-ASSET-001, R-ASSET-002, R-ASSET-003]
hash: 5280bee28861
---

D1: Local image references are searched in the block's directory (when known) and the configured asset directories, must resolve inside a search root, and are embedded as `data:` URIs; files over a size cap are linked instead.
D2: Remote `http(s)` and `data:image` references pass through; every other scheme is refused.
O1: rejected: rewrite relative URLs to the page — the fence does not know the page URL (ADR-3), and fragments would break when reused.
O2: rejected: copy images into the site — needs a plugin and an output-path convention.
O3: rejected: allow any file path — a build could embed secrets from the repository.
C1: Figures are self-contained and work at any URL and offline.
C2: Large images inflate pages; the cap (2 MB by default) bounds that.
