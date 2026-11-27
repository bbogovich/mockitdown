---
id: R-PACK-001
title: Pack directory layout and lookup
status: active
version: 0.10.8
rev: 1
page: PACK.1
slot: reqs
order: 1
source: [SRC-2, SRC-3]
realizes: [F-3, F-7]
constrained_by: [A-PACK-1]
decisions: [ADR-4]
reverse_engineered: true
hash: 97a7862fb5f3
---

C1: A pack MUST be a directory named by its identifier holding `pack.json` (UTF-8 JSON) and, optionally, `pack.css`.
C2: The pack registry MUST look a pack identifier up in each configured pack directory (`pack_paths`) in order, then in the built-in pack directory, and MUST use the first directory that contains `<id>/pack.json`.
C3: The pack registry MUST list the known packs as the subdirectories holding a `pack.json`, from the configured directories first and then the built-in directory, sorted by name within each directory and without duplicates.
C4: If no directory holds the requested identifier, then the pack registry MUST raise an error "unknown pack 'x'; known packs: …".
C5: The pack registry MUST load each pack at most once per registry and reuse it.
V1: With `pack_paths: [site/packs]` and `site/packs/fluent/pack.json` present, `pack="fluent"` uses the site's pack, not the built-in one; `pack="nope"` reports the known packs.
