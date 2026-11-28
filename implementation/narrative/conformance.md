---
title: Conformance corpus
impl_version: 0.3.36
status: draft
updated: 2026-11-27
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
| `chrome-` | 35 | every chrome kind, auto per pack, browser url, `@Screen`, window; SwiftUI split view at phone, tablet and desktop, `windowed` (option, `@Screen`, ignored on a Mac with its warning), the macOS title bar modes (stack, plain root with toolbar, sidebar-adaptable tabs, plain, base pack), a split column toolbar, Form automatic on a Mac; the menu bar (`chrome-menubar-*`: R-DEV-009 V1, `true` with the title as app name, `@Screen(app:, menubar:)`, `.commands` with every row kind in dark, the base pack's Edit menu, ignored on a phone, an unknown title and placement) |
| `option-` | 9 | title, id, caption, elements table, source, pack and default pack |
| `import-` | 8 | `import <Module>`, component files, nested imports, inline structs |
| `annotate-` | 21 | callouts, pointers, marquee, highlight, tap, free marks, position, in dialog |
| `overlay-` | 9 | alert, sheet, confirmation dialog, overlay, badge, toast, dialog, FAB, navigation |
| `chart-` | 30 | every chart kind and data form, `Chart {}` marks, a dark pack, candlesticks from values, bubble and heatmap from `series:`, charts without data (with the `chart` warning) |
| `shape-` | 5 | circle, ellipse and capsule in a 160 × 96 frame; a stroked, shadowed circle; a background in an ellipse |
| `control-` | 48 | every variant of the SwiftUI ControlGroup, DatePicker, Form, Gauge, List, Picker and Toggle from its declared sample; glass buttons; a labelled menu group; date picker defaults, components and wheels; first and tagged picker options; pickers without options; a macOS columns form; a bordered list selection |
| `present-` | 22 | the SwiftUI Alert, ConfirmationDialog, Popover, Sheet, Tab, TabView and NavigationSplitView from their declared samples and every TabView and NavigationSplitView variant; Button children as alert and confirmation actions; a confirmation dialog on a tablet; a lone Tab; unlabelled two- and three-column split views; a content closure on a tablet; the `.popover` arrow |
| `image-` | 9 | data URI, remote, protocol-relative, placeholder, icons, avatar, modifiers |
| `lang-` | 11 | let/if, ForEach, inline Markdown, fonts, layout modifiers, colours, escaping; operators, a ternary over three lines and the text of values (`lang-expressions`, R-LANG-006, R-EVAL-008) |
| `diag-` | 17 | syntax errors, unknown element/module/pack/device/chrome/appearance/icon, imports, images, shown warnings |

## Regenerating

```sh
cd python
../.venv/bin/python tools/gen_conformance.py           # write the corpus
../.venv/bin/python tools/gen_conformance.py --check   # missing, stale or stray files → exit 1
../.venv/bin/python tools/gen_conformance.py --list    # case names
```

`shared/conformance/edit/` is the edit corpus (R-EDIT-002, [Editing core](architecture/editing.md#the-edit-corpus)), written by hand:
the generator skips that folder (`EDIT_CORPUS`), so `--check` never calls its files stray and a
regeneration never removes them (R-REPO-004.C15).

The cases are defined in the generator (`build_cases()`); `role-*` and `pack-*-own-*` follow
`shared/reference/*.json`, so run `tools/gen_reference.py` first after a pack change. The hidden packs
have reference data too, so their own elements have `pack-<id>-own-<n>` cases (R-PACK-010.C5). The generator
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
| 0.3.13 | 2026-11-25 | `present-` area (#12) |
| 0.3.14 | 2026-11-25 | SwiftUI platform `chrome-` cases, the `windowed` option key (#13) |
| 0.3.15 | 2026-11-25 | `chrome-menubar-*` cases, the `menubar` and `app` option keys (#14) |
| 0.3.27 | 2026-11-27 | `lang-expressions` (#58) |
| 0.3.28 | 2026-11-27 | Every text field's root gains `role="textbox"`: 182 cases regenerated, both variants (#59) |
| 0.3.32 | 2026-11-27 | `pack-hologram-own-*`, `pack-lcars-own-*`, `pack-phosphor-own-*`: the hidden packs' own elements (683 cases) (#61) |
| 0.3.36 | 2026-11-27 | `gen_conformance.py` skips `edit/`, the edit corpus (#21) |
