---
id: F-7
title: Site-defined design packs
status: active
version: 0.11.1
rev: 1
page: FEAT.1
slot: features
order: 7
family: authoring
source: [SRC-2]
hash: 0e889aad5b9f
requires: [F-3]
---

G1: An organisation with its own design system must be able to mock up screens in that system without changing mockitdown.
C1: A documentation site can supply its own packs from directories it configures, in the same format as the shipped packs.
C2: A site pack can extend any shipped pack and override or add elements, tokens, chrome and styles.
C3: A site pack with the same identifier as a shipped pack replaces it for that site.
AC1: A pack directory `<dir>/acme/pack.json` with `pack_paths: [<dir>]` is selectable with `pack="acme"`.
AC2: A site pack that extends `fluent` inherits every Fluent element.
