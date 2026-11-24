# mockitdown Specification — agent primer

Read this first. Then load only what the task needs; never read `docs/` for facts (it is generated).

**What it governs.** TODO: one paragraph — what this specification governs. Version: `spec/VERSION`.

**Where things are**

| Path | Holds | Normative? |
|---|---|---|
| `spec/requirements/R-<AREA>-<n>/requirement.md` | the requirement as numbered clauses | yes |
| `…/prose.md` | the same requirement written for readers, with its rationale | no — explains |
| `…/base.md`, `…/CR-<n>.md` | first released state, then each change as clause operations | history |
| `…/TC-<n>.md`, `…/TC-M<n>.md` | automated and manual test cases | yes |
| `spec/architecture/A-*`, `spec/model/M-*`, `spec/decisions/ADR-*` | elements, entities, decisions (same layout) | yes |
| `spec/requirements/R-*/model/M-*` (or `architecture/`) | an entity or element scoped to that one requirement | yes |
| `spec/narrative/` | reader pages; `<!-- slot: x -->` marks where items are inserted | no |
| `spec/changes/<version>.md` | one change set per version | history |
| `primer/map.md` | one line per item: id, kind, status, version, page, title (generated) | index |

**How to read cheaply**

1. Find: `primer/map.md`, or `grep` it for a word in titles.
2. Read one item: `python3 tools/sio_docs.py show <ID>` (clauses only). Add `--prose` only when the reason matters,
   `--tests` for its test cases, `--history` for its change list.
3. What changed: `python3 tools/sio_docs.py changes <from> <to>` — net clause operations per item.
   `[-old-]{+new+}` marks an edit inside a clause.
4. Cite a clause as `R-WS-001.C3`. Labels are permanent: C3 always means the same clause, even after edits.

**Areas** — listed in `primer/map.md` once items exist.

Conventions for writing: `primer/conventions.md`.
