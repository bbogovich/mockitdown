---
id: F-7
title: Site-defined design packs
status: active
version: 0.2.0
rev: 0
page: FEAT.1
slot: features
order: 7
family: authoring
source: [SRC-2]
hash: 69b42e91a31b
---

G1: An organisation with its own design system must be able to mock up screens in that system without changing mockitdown.
C1: A documentation site can supply its own packs from directories it configures, in the same format as the shipped packs.
C2: A site pack can extend any shipped pack and override or add elements, tokens, chrome and styles.
C3: A site pack with the same identifier as a shipped pack replaces it for that site.
AC1: A pack directory `<dir>/acme/pack.json` with `pack_paths: [<dir>]` is selectable with `pack="acme"`.
AC2: A site pack that extends `fluent` inherits every Fluent element.
<!-- file: prose.md -->
**Problem.** Many applications use a corporate design system derived from a public framework.

**Change.** Packs are data, so a site adds its own the same way mockitdown ships them: a directory
with `pack.json` and `pack.css`, listed in the extension's `pack_paths`.
<!-- file: usecases/UC-1.md -->
---
id: UC-1
title: Mock up screens in a corporate design system
---

**Actor:** documentation-site maintainer.

1. The maintainer creates `packs/acme/pack.json` extending `mui` with the corporate colours and a
   few corporate components, and `packs/acme/pack.css`.
2. The maintainer adds `pack_paths: [packs]` to the extension configuration.

**Outcome:** blocks with `pack="acme"` render in the corporate style, including the Material UI
elements the pack inherits.
