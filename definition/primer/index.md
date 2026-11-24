# mockitdown Definition — agent primer

Read this first. Then load only what the task needs; never read `docs/` for facts (it is generated).

**What it defines.** What mockitdown is for, who it serves and its features — the input to the
specification. Version: `definition/VERSION` (0.x until the definition is stable at 1.0.0, P62).

**Where things are**

| Path | Holds | Normative? |
|---|---|---|
| `definition/features/F-<n>/requirement.md` | the feature as clauses: `G` problem/goal · `C` capability · `AC` acceptance criterion · `A` affects · `N` note | yes |
| `…/prose.md` | the feature written for readers | no — explains |
| `…/usecases/UC-<n>.md` | the feature's use cases, cited `F-<n>.UC-<n>` | yes |
| `…/design/UX-<n>/` | a design object serving only this feature | yes |
| `definition/design/UX-<n>/` | a design object shared by several features | yes |
| `…/base.md`, `…/CR-<n>.md` | first released state, then each change request | history |
| `definition/narrative/` | reader pages; `<!-- slot: x -->` marks where items are inserted | no |
| `primer/glossary.md` | every term in one line | reference |
| `primer/map.md` | one line per item (generated) | index |

**IDs.** `F-<n>` feature. `UX-<n>` design object, `UC-<n>` use case (local to its feature). A change request is the
feature's `CR-<n>` — `F-12.CR-1`, as in P13.

**Design objects** (`design.md`): `E` element (`name: kind — what`) · `S` state (`state x: condition →
shown`) · `I` interaction (`event → effect`) · `A` accessibility · `T` design token. The layout is
`layout.md` (ASCII, or a MockItOut block).

**Reading and changing:** as in the specification — `tools/sio_docs.py show | changes | draft | record |
release | build | check`; conventions in `primer/conventions.md` of the specification apply unchanged.
