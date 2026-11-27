---
id: R-PACK-018
title: Stylesheet partials
status: active
version: 0.12.4
rev: 2
page: PACK.4
slot: reqs
order: 1
source: [SRC-18]
realizes: [F-3, F-16]
constrained_by: [A-REPO-1, ADR-17]
requires: [R-PACK-007, R-REPO-002]
hash: 06ba8496c1ad
refs: [R-PACK-007, R-REPO-004]
---

C1: A stylesheet partial MUST be a file `shared/packs/_partials/<name>.css`; the directory `_partials` MUST hold no `pack.json`, so the pack registry never lists it as a pack.
C2: A built-in pack's `pack.css` MAY include partials with lines `@import "../_partials/<name>.css";`, each on a line of its own, before the first rule of the file (only comments and blank lines may precede them).
C3: Every selector of a partial MUST start with the scope class `.mkd-scope`, alone or followed by a space, and a partial MUST NOT contain `@import`, `data-appearance` or `prefers-color-scheme`; R-PACK-007.C3 to C5 apply to partials as to pack stylesheets.
C4: When the Python build (`python/tools/sync_shared.py`) or the TypeScript build (`typescript/scripts/copy-shared.mjs`) copies a pack whose `pack.css` includes partials, it MUST write the package copy with each `@import` line replaced by the text of the named partial in which every selector's leading `.mkd-scope` is replaced by `.mkd-pack-<id>` of the including pack; the copy MUST contain no `@import`.
C5: The resolution of C4 MUST be textual and deterministic, so that both builds write byte-identical copies of every `pack.css`.
C6: A build MUST fail, naming the pack and the partial, when an `@import` names a partial that does not exist, appears after the first rule, shares its line with anything but white space, or names a path outside `../_partials/`, and when a partial breaks C3.
C7: The partials themselves MUST NOT be copied into either package; only the resolved `pack.css` copies are published.
C8: A pack stylesheet loaded at run time — a site pack found through `pack_paths`, or an application pack given to `registerPack` — that contains `@import` outside a comment MUST be refused with the error "pack 'x': @import is resolved only in built-in packs".
C9: A rule that holds for every pack MUST be written once, in the `base` pack's stylesheet; a rule that two or more packs share MUST be written once, in a partial those packs include; no run of six consecutive non-blank lines MAY appear in two of the files `shared/packs/*/pack.css` and `shared/packs/_partials/*.css`, nor twice in one of them.
C10: Moving rules into `base` or into a partial MUST NOT change the rendering of any pack: the conformance corpus (R-REPO-004) MUST stay unchanged, and every pack whose stylesheet changed MUST look the same in the gallery as before, in light and dark appearance.
V1: A partial imported by two packs reaches both packages resolved and scoped to each; an import of a missing partial fails both builds; the duplicate check fails on a copied six-line run.
