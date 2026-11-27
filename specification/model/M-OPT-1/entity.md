---
id: M-OPT-1
title: RenderOptions
status: active
version: 0.12.0
rev: 2
page: MODEL.1
slot: entities
order: 8
level: entity
hash: 34498b699462
refs: [R-EDIT-004, R-IMP-002, R-IMP-008]
---

F1: pack: str · optional — forced pack (fence `pack`)
F2: default_pack: str — pack when nothing selects one (default `base`)
F3: device: str · optional — device form (fence `device`)
F4: appearance: str · optional — light | dark | auto | both (fence `appearance`)
F5: default_appearance: str — default `light`
F6: width: int · optional — frame width in points
F7: height: int · optional — frame height in points
F8: chrome: str — chrome kind, `auto` (default) or `none`
F9: title: str · optional — caption title
F10: id: str · optional — caption id
F11: caption: bool — show the caption (default true)
F12: elements: bool — append the Elements table (default false)
F13: source: bool — append the source disclosure (default false)
F14: url: str · optional — browser chrome address
F15: imports: map — import map, key → path, URL or list of them (R-IMP-002.C7, C8)
F16: asset_paths: list — asset directories
F17: pack_paths: list — site pack directories
F18: embed_assets: bool — inline local images (default true)
F19: max_embed_bytes: int — embed size cap (default 2000000)
F20: source_path: path · optional — file the source came from
F21: show_warnings: bool — show warnings in the page (default false)
F22: edit: bool — edit-mode rendering, `data-mkd-node` and `data-mkd-derived` on role roots (default false; R-EDIT-004)
F23: libraries: map — the page's library blocks, name → source (R-IMP-008.C9)
I1: Render options MUST be immutable; overrides produce a new value.
