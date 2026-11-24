---
id: M-VIEW-3
title: Screen
status: active
version: 0.2.0
rev: 0
page: MODEL.1
slot: entities
order: 4
level: entity
hash: a6b63997ba40
---

F1: views: list — the top-level views
F2: pack: Pack — the selected pack
F3: meta: dict — `@Screen` metadata (title, id, device, appearance, chrome, url, pack, …)
F4: components: list — names of the structs instantiated, in first-use order
R1: views: → M-VIEW-1 (0..*) — top-level views
R2: pack: → M-PACK-1 (1) — the selected pack
