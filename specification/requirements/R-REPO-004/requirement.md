---
id: R-REPO-004
title: Conformance corpus
status: active
version: pending
rev: 8
page: REPO.1
slot: reqs
order: 4
hash: 1830783b2936
source: [SRC-8, SRC-12]
realizes: [F-16]
requires: [R-REPO-003]
constrained_by: [ADR-18, ADR-22]
refs: [R-EDIT-002]
---

C1: `shared/conformance/` MUST hold conformance cases, each a mockitdown source `<name>.mockitdown` with its render options in `<name>.json` and its expected HTML in `<name>.html`.
C2: The corpus MUST cover every render role of the base pack, every shipped pack at least once, light and dark appearance, each device form, imports of components, annotations and overlays, charts, images and diagnostics.
C3: The expected HTML MUST be produced by the Python renderer, by `python/tools/gen_conformance.py`.
C4: `gen_conformance.py --check` MUST fail when an expected file differs from what the Python renderer now produces.
C5: Each variant's test suite MUST render every case and fail on any difference from the expected HTML.
C6: Each `<name>.json` MUST be a JSON object holding only render options — `pack`, `default_pack`, `device`, `default_device`, `appearance`, `default_appearance`, `chrome`, `title`, `id`, `window`, `url` (strings), `width`, `height` (integers), `caption`, `elements`, `source`, `show_warnings`, `windowed`, `edit` (booleans) — with every absent key taking its default.
C7: Each case MUST have `<name>.diag.json`, an object `{"packs": [id, …], "diagnostics": [{"severity", "code", "message", "line", "col", "source"}, …]}` holding the render's pack lineage and its diagnostics in order, and each variant's test suite MUST fail when its result differs from it.
C8: `<name>.html` MUST be the rendered HTML followed by one line feed.
C9: A case MUST be rendered with no source path, no asset or pack search paths and the single import search path `.` resolved against `shared/conformance/`; component files the cases import MUST lie under `shared/conformance/components/`.
C10: An expected file MUST NOT contain a path of the machine that generated it; `gen_conformance.py` MUST refuse a case whose output does.
C11: `shared/conformance/index.json` MUST list every case in generation order as `{"cases": [{"name", "area"}, …]}`, the area being the case name up to its first hyphen.
C12: Each case source MUST begin with a `//` comment line saying what the case exercises.
C13: Every case outside the `diag` area MUST render without a diagnostic, and every `diag` case MUST report at least one; `gen_conformance.py` MUST refuse a case that breaks this.
C14: `gen_conformance.py --check` MUST also fail when a corpus file is missing or a file in `shared/conformance/` belongs to no case.
V1: Changing one expected file makes both test suites fail.
C15: `shared/conformance/edit/` holds the edit corpus (R-EDIT-002.C15), which is not a set of render cases: `gen_conformance.py` MUST ignore it, and C11 and C14 MUST NOT apply to its files.
