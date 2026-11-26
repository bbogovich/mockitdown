---
title: Conformance corpus
impl_version: 0.3.12
status: draft
updated: 2026-11-25
page_id: IMPL.CONF
---

# Conformance corpus

Implements R-REPO-004 under ADR-18, and R-ANN-003.C5 (the portable anchor prefix the corpus needs).
`shared/conformance/` defines what "the same rendering" means: for every case, every variant must
produce the expected HTML and result byte for byte. The Python renderer produces them.

## Layout

```text
shared/conformance/
  index.json                  {"cases": [{"name": "role-badge-badge", "area": "role"}, …]}
  components/pill.mockitdown  component libraries the import-* cases import
  components/person.mockitdown
  <name>.mockitdown           the source; line 1 is "// <what the case exercises>"
  <name>.json                 render options, e.g. {"device": "fit", "pack": "mui"}
  <name>.html                 RenderResult.html + "\n"
  <name>.diag.json            {"packs": ["mui", "base"], "diagnostics": [{"severity": "warning",
                                "code": "pack", "message": "…", "line": 2, "col": 1, "source": ""}]}
```

**Options** (`<name>.json`) use the Python `RenderOptions` field names; absent keys take their
defaults: `pack`, `default_pack`, `device`, `default_device`, `appearance`, `default_appearance`,
`chrome`, `title`, `id`, `window`, `url` (strings); `width`, `height` (integers); `caption`,
`elements`, `source`, `show_warnings` (booleans). `gen_conformance.OPTION_KEYS` is the list.

**The harness** every variant reproduces: no source path, no asset or pack paths, one import
search path `.` resolved against `shared/conformance/`. Hence block diagnostics read `line L:C`,
a missing import says `(searched .)`, a local image says `(no asset paths)`, and images in the
corpus are `data:` or remote URLs. Diagnostics inside an imported file carry that file's resolved
(absolute) path, so the corpus has none; the generator refuses any output containing the
repository path.

## Areas

| Area | Cases | What |
|---|---|---|
| `role-<role>-<element>` | 134 | every base element (all 89 roles), its Reference sample, device `fit` |
| `pack-<id>` | 38 | a small settings screen in every shipped pack, hidden ones included |
| `pack-<id>-own-<n>` | 260 | each listed pack's own elements, twelve per case, device `fit` |
| `appearance-` | 8 | light, dark, auto, both; from `@Screen`; option over `@Screen`; default |
| `device-` | 12 | the six sizes, `fit`, from `@Screen`, default, pack default, width/height |
| `chrome-` | 15 | every chrome kind, auto per pack, browser url, `@Screen`, window |
| `option-` | 9 | title, id, caption, elements table, source, pack and default pack |
| `import-` | 8 | `import <Module>`, component files, nested imports, inline structs |
| `annotate-` | 21 | callouts, pointers, marquee, highlight, tap, free marks, position, in dialog |
| `overlay-` | 9 | alert, sheet, confirmation dialog, overlay, badge, toast, dialog, FAB, navigation |
| `chart-` | 30 | every chart kind and data form, `Chart {}` marks, a dark pack, candlesticks from values, bubble and heatmap from `series:`, charts without data (with the `chart` warning) |
| `shape-` | 5 | circle, ellipse and capsule in a 160 × 96 frame; a stroked, shadowed circle; a background in an ellipse |
| `control-` | 48 | every variant of the SwiftUI ControlGroup, DatePicker, Form, Gauge, List, Picker and Toggle from its declared sample; glass buttons; a labelled menu group; date picker defaults, components and wheels; first and tagged picker options; pickers without options; a macOS columns form; a bordered list selection |
| `image-` | 9 | data URI, remote, protocol-relative, placeholder, icons, avatar, modifiers |
| `lang-` | 10 | let/if, ForEach, inline Markdown, fonts, layout modifiers, colours, escaping |
| `diag-` | 17 | syntax errors, unknown element/module/pack/device/chrome/appearance/icon, imports, images, shown warnings |

## Regenerating

```sh
cd python
../.venv/bin/python tools/gen_conformance.py           # write the corpus
../.venv/bin/python tools/gen_conformance.py --check   # missing, stale or stray files → exit 1
../.venv/bin/python tools/gen_conformance.py --list    # case names
```

The cases are defined in the generator (`build_cases()`); `role-*` and `pack-*-own-*` follow
`shared/reference/*.json`, so run `tools/gen_reference.py` first after a pack change. The generator
writes the inputs too, so `--check` also catches a hand-edited source or options file. Regenerate
on purpose after a rendering change — never to make a port's test pass (R-REPO-004 prose).

Key symbols: `build_cases`, `render_case(source, options)` (the harness), `result_json(result)`,
`expected_files(cases)`.

## Debugging

- `<case>: expected no diagnostics, got …` — a non-`diag` case now warns: fix the source or the
  renderer; a `diag` case that stopped reporting fails the same way.
- `output contains a machine path` — the case reaches a code path that prints a file system path
  (an imported file's diagnostic, an asset search root); change the case.
- The same output differs between runs: something hashes a Python object or iterates a set; run
  `--check` under two `PYTHONHASHSEED` values to find it (the 0.3.3 corpus passes under 0, 1 and 12345).

## Revision history

| Version | Date | Change |
|---|---|---|
| 0.3.3 | 2026-11-25 | Page written (#2) |
| 0.3.10 | 2026-11-25 | `shape-` area; chart cases from values and without data (#9) |
| 0.3.12 | 2026-11-25 | `control-` area (#11) |
