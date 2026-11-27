---
id: R-PACK-010
title: Hidden packs
status: active
version: 0.11.0
rev: 1
page: PACK.1
slot: reqs
order: 999
source: [SRC-4, SRC-5, SRC-18]
reverse_engineered: true
hash: 94da3f8dd651
---

C1: A pack MAY declare `"hidden": true`; a hidden pack MUST work wherever it is named (fence `pack=`, `import`) and MUST be left out of `mockitdown packs` (unless `--all`) and of the generated catalogue.
C2: `tools/gen_reference.py` MUST also write `shared/reference/<id>.json` for every hidden pack and list the hidden packs, sorted by id, under the key `hidden` of `shared/reference/index.json` (`{"groups": […], "hidden": [id, …]}`), outside every group; it MUST NOT write a Reference page or a navigation entry for a hidden pack.
C3: The shipped hidden packs MUST be `lcars`, `phosphor` and `hologram`, each with a hidden page of the example site under `eggs/` that the site's navigation does not list.
V1: `mockitdown packs` does not list `lcars`; `pack="lcars"` renders.
