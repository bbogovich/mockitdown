# mockitdown Specification — agent primer

Read this first. Then load only what the task needs; never read `docs/` for facts (it is generated).

**What it governs.** The behaviour of mockitdown: the SwiftUI-subset mockup language (R-LANG, R-EVAL), design packs
(R-PACK), HTML/CSS rendering (R-REND), appearance and devices (R-APP, R-DEV), images and icons (R-ASSET), component
imports (R-IMP), the Python-Markdown integration (R-MDX), the CLI (R-CLI), the library API (R-API) and diagnostics
(R-DIAG); plus architecture elements A-*, model entities M-* and decisions ADR-1..14. Version: `specification/VERSION`.

**Where things are**

| Path | Holds | Normative? |
|---|---|---|
| `specification/requirements/R-<AREA>-<n>/requirement.md` | the requirement as numbered clauses | yes |
| `…/prose.md` | the same requirement written for readers, with its rationale | no — explains |
| `…/base.md`, `…/CR-<n>.md` | first released state, then each change as clause operations | history |
| `…/TC-<n>.md`, `…/TC-M<n>.md` | automated and manual test cases | yes |
| `specification/architecture/A-*`, `specification/model/M-*`, `specification/decisions/ADR-*` | elements, entities, decisions (same layout) | yes |
| `specification/requirements/R-*/model/M-*` (or `architecture/`) | an entity or element scoped to that one requirement | yes |
| `specification/narrative/` | reader pages; `<!-- slot: x -->` marks where items are inserted | no |
| `specification/changes/<version>.md` | one change set per version | history |
| `primer/map.md` | one line per item: id, kind, status, version, page, title (generated) | index |

**How to read cheaply**

1. Find: `primer/map.md`, or `grep` it for a word in titles.
2. Read one item: `sio-docs show <ID>` (clauses only). Add `--prose` only when the reason matters,
   `--tests` for its test cases, `--history` for its change list.
3. What changed: `sio-docs changes <from> <to>` — net clause operations per item.
   `[-old-]{+new+}` marks an edit inside a clause.
4. Cite a clause as `R-WS-001.C3`. Labels are permanent: C3 always means the same clause, even after edits.

**Areas** — LANG syntax · EVAL semantics · PACK packs · REND markup · APP appearance · DEV devices/scaling/chrome ·
ASSET images/icons · IMP imports · MDX Markdown integration · CLI · API · DIAG. Known deviations of the code are
recorded in the prose of R-DEV-002, R-EVAL-011, R-LANG-006 and R-MDX-004.

Conventions for writing: `primer/conventions.md`.
