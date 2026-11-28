---
title: Evaluation
impl_version: 0.3.38
status: draft
updated: 2026-11-28
page_id: IMPL.EVAL
---

# Evaluation

Realizes **A-EVAL-1**; requirements R-EVAL-001 – R-EVAL-011, R-PACK-005, R-IMP-001 – R-IMP-006.

## `Evaluator` — `evaluate.py`

`Evaluator(registry, diagnostics, default_pack=, pack_override=, imports=ImportContext(...))`
evaluates one `Module` into a `Screen` (M-VIEW-3):

1. `_directives` reads `@Screen` arguments into `meta` (R-EVAL-010).
2. `_select_pack` applies the order fence/option `pack` → first `import <Module>` known to
   `PackRegistry.for_module` → `meta["pack"]` → `default_pack` (R-PACK-005).
3. `_load_imports` resolves `import "path"` (`_resolve_import`: absolute, then the base directory,
   then `search_paths`; each as written and with `.mockitdown`), recursing into the imported file's
   imports with a `seen` set; files are parsed through the module-level `ImportCache` keyed by path
   and mtime (R-IMP). The `seen` set is made per mockup, so a file is loaded once per mockup, cycles
   included (R-IMP-003.C2); a component file's directives, module imports and top-level views take no
   effect, the views with one `import` warning (R-IMP-001). Tests: IT-34.
4. The block's own structs are registered last, replacing imported ones (R-IMP-004).
5. `block(statements, Env())` evaluates statements to views.

**Scopes** are `Env` objects chained by `parent`. `block` creates a child scope per block;
`_instantiate` creates a fresh `Env()` for a struct body (caller variables invisible, R-EVAL-005.C6).

## Views versus values

Two mutually recursive entry points:

- `views(expr, env)` — where a view is expected: calls go to `_call_view` (ForEach → struct →
  variable → pack element → unknown) or `_apply_modifier` for member calls; literals become `Text`.
- `value(expr, env)` — where a value is expected: literals, collections, enum values, members
  (`_member_value`), calls (`_call_value`: `.constant(x)`, view calls → `ViewList`, unknown callees
  → `CallValue`), operators (`_binary`), ranges and subscripts. `format_value` writes floats with
  `%g` (six significant digits) — the TypeScript `formatG` matches it — and a range with a float
  bound is the list of its two bounds (R-EVAL-008.C2, C7).

Closures are captured as `Thunk(closure, env)` and run only where views are expected
(`run_thunk`, which also binds closure parameters and destructures tuples for `ForEach`).

## Elements, structs, modifiers

- `_element_view` builds a `View` (M-VIEW-1) from the element's `default_attrs`, labelled
  arguments, positional `params`, trailing closures (children and slots) and closure/view-valued
  arguments (slots); action closures are dropped (R-EVAL-004). Labels and the parameter name of a
  positional argument go through the same `attrs` maps, element first, then pack (R-PACK-011.C1,
  C3; `labelFor` in `evaluate.ts`).
- `_instantiate` first asks `_cycle(name)` whether the struct reaches itself (R-EVAL-005.C10): an
  iterative depth-first search over the struct-use graph, whose edges `_struct_uses(decl)` collects
  from the body, computed properties and property defaults (every branch, closures included; a bare
  name that is one of the struct's own properties is not an edge). The answer is memoized per
  evaluator, so per screen; a cyclic struct reports "struct S uses itself (S → T → S)" once
  (`_cycles_reported`) at its first use and yields no views, without binding its arguments. Then it
  guards depth with `MAX_DEPTH = 48` ("struct S nests too deeply", C11, now only reachable by a chain
  of distinct structs), binds struct arguments as in R-EVAL-005, and tags root views with
  `component`. TypeScript: `cycle`, `structUses` and `cyclesReported` in `evaluate.ts`.
- `_for_each` normalises the data (count, list, dict items, string), truncates at
  `MAX_ITERATIONS = 500`.
- `_apply_modifier` resolves the modifier against the pack's `modifiers` map, then
  `vocabulary.RENDERED`, then `vocabulary.IGNORED` (R-EVAL-009). Mapped modifiers write
  `view.attrs[attr]`; rendered ones append a `Modifier` (M-VIEW-2).

## Vocabulary — `vocabulary.py`

`RENDERED` (modifiers the renderer interprets), `IGNORED` (behaviour-only SwiftUI modifiers) and
`NEUTRAL_MODULES` (imports that select no pack), frozensets loaded from the packaged
`vocabulary.json` (`rendered`, `ignored`, `neutral_modules`), a copy of
`shared/language/vocabulary.json` (R-REPO-002.C4). Adding a rendered modifier requires a style
builder or renderer handler and a specification change (R-EVAL-009.C4).

## Known debt

None open; the deviations #1 and #2 recorded on the [overview](index.md#known-debt-and-deviations)
were fixed in 0.1.1.

Tests: `tests/test_render.py` (`EvaluateRenderTests`).


## Revision history

| Version | Date | Change |
|---|---|---|
| 0.1.0 | 2026-11-24 | Page written |
| 0.1.1 | 2026-11-24 | Debt #1, #2 fixed |
| 0.3.2 | 2026-11-25 | Vocabulary loaded from shared/language/vocabulary.json (#1) |
| 0.3.9 | 2026-11-25 | Positional arguments take their parameter's `attrs` alias (R-PACK-011.C3, #8) |
| 0.3.26 | 2026-11-27 | Import loading per mockup described; the unreachable `unsupported statement` error carries code `view` (R-DIAG-001.C1); IT-34 (#57) |
| 0.3.27 | 2026-11-27 | Float formatting and continuous ranges described (R-EVAL-008 as built); IT-36 (#58) |
| 0.3.38 | 2026-11-28 | Self-embedding structs rejected by cycle detection before expansion; the depth limit kept as a backstop (R-EVAL-005.C10, C11); IT-50 (#84) |
