---
title: Packs
impl_version: 0.1.0
status: draft
updated: 2026-11-24
page_id: IMPL.PACKS
---

# Packs

Realizes **A-PACK-1** (registry) and **A-PACK-2** (built-in packs); requirements R-PACK-001 –
R-PACK-009.

## `PackRegistry` — `packs/__init__.py`

- `PackRegistry(extra_dirs)` searches `extra_dirs` then `BUILTIN_DIR` (the `packs/` package
  directory). `registry(extra_dirs)` is an `lru_cache`d factory so the fence, the extension and the
  CLI share one registry per set of directories.
- `get(id)` loads `pack.json`, loads the parent first (default `base`), merges `elements`,
  `modifiers`, `chrome`, `sizes`, `icons` and per-mode `tokens` over the parent's, records
  `own_elements`, and caches the `Pack` (M-PACK-1). `_element` builds each `ElementDef` (M-PACK-2)
  and rejects a missing `role`.
- `ids()` lists pack directories; `for_module(name)` builds a lower-cased module index on first use.
- `Pack.lineage()` (root first), `Pack.font(name)` (alias lookup up the lineage),
  `Pack.chrome_for(device)`, `Pack.css_text()`.

## Built-in packs — `packs/<id>/`

| Directory | Contents |
|---|---|
| `base/` | the core vocabulary (90 elements), base tokens, generic modifier maps, the structural CSS of every role (`pack.css`, ~650 lines) |
| `swiftui/`, `fluent/`, `mui/`, `angular-material/`, `sapui5/`, `bootstrap/`, `shadcn/` | framework packs (R-PACK-008), each `extends` base |

Packs are package data (`pyproject.toml` `[tool.setuptools.package-data]`:
`packs/*/pack.json`, `packs/*/pack.css`).

## The contract tests — `tests/test_packs.py`

| Test | Checks |
|---|---|
| `test_packs_load_and_roles_exist` | every pack loads; every element's role is an `r_<role>` method; every pack declares modules |
| `test_css_is_scoped` | every selector of a non-base `pack.css` starts with `.mkd-pack-<id>` |
| `test_css_has_no_appearance_branching` | no `data-appearance` / `prefers-color-scheme` in non-base CSS |
| `test_tokens_have_light_and_dark` | light tokens ⊇ base light tokens; dark tokens non-empty |
| `test_module_names_are_unique` | no module name claimed by two packs |
| `test_every_element_renders` | `Name()` renders without errors (except `argument`) for every element of every pack |
| `test_stylesheet_builds_for_all` | the all-packs stylesheet assembles |

Writing a pack is described in the [Pack authoring guide](../pack-authoring.md).


## Revision history

| Version | Date | Change |
|---|---|---|
| 0.1.0 | 2026-11-24 | Page written |
