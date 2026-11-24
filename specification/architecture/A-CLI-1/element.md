---
id: A-CLI-1
title: Command-line interface
status: active
version: 0.2.0
rev: 0
page: ARCH.2
slot: elements
order: 9
level: module
hash: ac7d153a7ac2
---

P1: provides: the `mockitdown` console script with `render`, `check`, `css`, `packs` and `elements` (`mockitdown.cli`)
U1: uses A-API-1 — render, check and stylesheet
U2: uses A-PACK-1 — list packs and elements
K1: The CLI MUST use only the Python standard library (`argparse`).
