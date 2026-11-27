---
id: R-ASSET-004
title: Image-bearing attributes
status: active
version: 0.10.7
rev: 1
page: ASSET.1
slot: reqs
order: 4
source: [SRC-2]
realizes: [F-5]
constrained_by: [A-REND-1, A-ASSET-1]
reverse_engineered: true
hash: 6df0f5018888
refs: [R-ASSET-005]
---

C1: The renderer MUST resolve as asset references: the `image` role's `name`, `url`, `src` or `source` attribute (first present); the `avatar` role's `image`, `src` or `url`; and the `image` or `thumbnail` attribute that roles use for a leading visual.
C2: Other roles that show media (cards with `cover`, `media` or `image`) MUST resolve their image attributes the same way.
C3: An `Image` with `systemName`, `icon` or `symbol` MUST render an icon (R-ASSET-005), not an asset.
C4: The `image` role MUST render a resolved image as `<img class="mkd-image" src alt>` with `alt` from `alt`, `label` or `accessibilityLabel` (empty otherwise).
V1: `Image("assets/a.png", alt: "Team")` renders an `img` with `alt="Team"`; `Avatar("Ana Lima", image: "assets/ana.jpg")` renders the photo; `Avatar("Ana Lima")` renders the initials `AL`.
