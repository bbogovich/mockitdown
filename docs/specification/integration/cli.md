---
title: "Command line"
spec_version: 0.12.8
status: draft
updated: 2026-11-27
page_id: CLI.1
---

# Command line

The `mockitdown` command.

### R-CLI-001 — Commands

The command line is a thin layer over the library API; everything a site can do per block, the
CLI can do per file.

**R-CLI-001.TC-1 — Commands, standard input and exit codes**

Python unit tests `python/tests/test_cli.py` `CommandTests`, through `cli.main` with captured streams:
`--version` prints `mockitdown <version>` and exits 0, `--help` names the five subcommands, an unknown
subcommand exits 2; the installed console script beside the interpreter (skipped when the package is not
installed) prints the version and exits 2 for `render` without a file (C1, V1). `render -` and `check -`
read standard input (C2). A good file exits 0, a file with an error exits 1 for `render` and `check`, a
missing file and an unknown pack for `elements` exit 1 with `mockitdown: <message>` on standard error,
and a missing file argument, a non-integer `--width` and `check` without files exit 2 (C3, V1).

**Realizes.** F-13

| | Statement |
|---|---|
| C1 | The CLI MUST be installed as the command `mockitdown` and provide the subcommands `render`, `check`, `css`, `packs` and `elements`, and the option `--version` printing `mockitdown <version>`. |
| C2 | A file argument MUST accept `-` for standard input. |
| C3 | The CLI MUST exit 0 on success, 1 when a rendered or checked source has an error or when an error is raised (printed as `mockitdown: <message>` on standard error), and 2 on a usage error. |
| V1 | `mockitdown --version` prints the version; `mockitdown render` without a file exits 2. |

---

### R-CLI-002 — Rendering options on the command line

Unlike a fenced block, a file has a known location, so relative imports and images work exactly as
in a component library.

Checked at 0.10.1 after M-OPT-1.F22 (`edit`): the command line offers no option for it (the model prose says so), so the list of C1 stands.

As built (#57): `--menubar` and `--app` (M-OPT-1.F27, F28; R-DEV-009) were added to the command line with the
macOS menu bar and are now in C1; TC-2 checks every flag of C1 except the import map's (TC-1).

**R-CLI-002.TC-1 — Import map flags**

`mockitdown render screens/a.mockitdown -I acme/=vendor/acme/ -I lib` in a temporary tree resolves `import "acme/cards"` from `vendor/acme/` and `import "kpi"` from `screens/` then `lib/` (C1, C2, C3); `-I acme/=x -I acme/=y` tries `x` then `y`; the old long option `--import-path` is rejected by argparse. Automated in `python/tests/test_cli.py`.

**R-CLI-002.TC-2 — Rendering flags and the source path**

Python unit tests `python/tests/test_cli.py` `RenderingOptionTests`, with `cli.render` wrapped to record
the options it is given: `render` and `check` with every flag of C1 except `-I` (TC-1) build equal
options carrying each value; without flags the options are the render defaults (`default_pack` `base`,
`chrome` `auto`, embedding on); a bare `--menubar` gives `"true"`; an appearance outside the four is a
usage error; repeated `-A/--asset-path` and `-P/--pack-path` keep their order (C1). A file given through
a path with `..` sets `source_path` to its resolved path, so `import "kpi"` and `Image("logo.png")` beside
it resolve with no diagnostic; standard input sets none (C2). R-API-003.TC-1 checks the same flags
against the render options.

**Realizes.** F-13

| | Statement |
|---|---|
| C1 | `render` and `check` MUST accept `--pack`, `--default-pack` (default `base`), `--device`, `--appearance` (one of the four), `--width`, `--height`, `--chrome`, `--title`, `--windowed`, `--menubar [MENU]` (the bare flag drawing the bar with no menu open), `--app`, `--elements`, `-I/--import` (repeatable), `-A/--asset-path` (repeatable), `-P/--pack-path` (repeatable) and `--no-embed`, with the meaning of the corresponding render option. |
| C2 | When the source is a file, the CLI MUST set the render option `source_path` to its resolved path, so relative imports and images resolve against the file's directory first. |
| C3 | Each `-I/--import` value MUST be `KEY=TARGET`, adding the import-map entry `KEY` → `TARGET` (R-IMP-002.C7), or a bare `TARGET`, adding `TARGET` to the targets of the empty key; repeated values for one key MUST form its target list in order. |
| V1 | `mockitdown render screens/a.mockitdown -I lib` resolves `import "kpi"` from `screens/` and then `lib/`. |
| V2 | `mockitdown render a.mockitdown -I acme/=vendor/acme/ -I lib` resolves `import "acme/cards"` from `vendor/acme/` and `import "kpi"` from the file's directory, then `lib/`. |

---

### R-CLI-003 — render

**R-CLI-003.TC-1 — render to a fragment or a standalone page**

Python unit tests `python/tests/test_cli.py` `RenderCommandTests`: a file with an unknown icon writes
the fragment (`div.mkd-figure`, no `<html>`) to standard output, or to `-o` with nothing on standard
output, and its `warning [icon]` line to standard error only (C1). `--standalone -o a.html` for a Fluent
source writes a page starting `<!doctype html>` with the UTF-8 charset, the responsive viewport, the title
`a` (from the file name; `--title` escaped when given; `mockitdown` for standard input), the neutral
background with its `prefers-color-scheme: dark` variant, the Fluent and base rules inlined, no other
pack and no `<link>` (C2, V1); a syntax error, which uses no pack, inlines `base` (C2). A file with an
error writes its output, error box included, and exits 1 (C3).

**Realizes.** F-13

| | Statement |
|---|---|
| C1 | `mockitdown render FILE` MUST write the HTML fragment to standard output, or to the file given by `-o/--output`, and print diagnostics to standard error. |
| C2 | With `--standalone`, the CLI MUST write a complete HTML document (UTF-8, responsive viewport, title from `--title` or the file name, a neutral page background with a dark-scheme variant) with the stylesheet for the used packs (or `base` when none) inlined. |
| C3 | `render` MUST exit 1 when the source has an error, after writing the output. |
| V1 | `mockitdown render a.mockitdown --standalone -o a.html` writes a page that opens offline and shows the mockup styled. |

---

### R-CLI-004 — check

**R-CLI-004.TC-1 — check summaries and the JSON report**

Python unit tests `python/tests/test_cli.py` `CheckCommandTests`: checking a good file, a file with an
unknown element and a file with an unknown icon prints the error line, `<file>: ok (0 errors, 0
warnings)`, `<file>: FAILED (1 errors, 0 warnings)` and `<file>: ok (0 errors, 1 warnings)` (the icon is
found while rendering) and exits 1; without the bad file it exits 0 (C1, C3, V1). `--json` prints a
parsable array with `file` and `ok` per file and each diagnostic as exactly `severity`, `code`,
`message`, `line`, `col` and `source`, and exits 1 (C2, C3, V1).

**Realizes.** F-13, F-12

| | Statement |
|---|---|
| C1 | `mockitdown check FILE…` MUST render each file (so asset and icon problems are found) and print its diagnostics, then a summary line `<file>: ok (E errors, W warnings)` or `<file>: FAILED (…)`. |
| C2 | With `--json`, `check` MUST print instead a JSON array with one object per file: `file`, `ok`, and `diagnostics` as objects with `severity`, `code`, `message`, `line`, `col` and `source`. |
| C3 | `check` MUST exit 1 when any file has an error. |
| V1 | Checking one good and one bad file prints `ok` and `FAILED` lines and exits 1; `--json` output parses as JSON. |

---

### R-CLI-005 — css

**R-CLI-005.TC-1 — The stylesheet command**

Python unit tests `python/tests/test_cli.py` `CssCommandTests`: `css --pack fluent` holds the Fluent and
base rules and no MUI rule, a second `--pack mui` adds MUI, `css` alone holds every registered pack, and
`-P` adds a site pack's rules (C1, V1). The default output is shorter than `--pretty`'s and keeps no
comment (C2). `-o docs/assets/mockitdown.css` in an empty directory creates `docs/assets/` and writes the
file, with nothing on standard output (C3, V1).

**Realizes.** F-13, F-11 · **Decisions.** ADR-8

| | Statement |
|---|---|
| C1 | `mockitdown css` MUST write the stylesheet for the packs given by repeatable `--pack` options, or for every known pack when none is given, including site packs from `-P/--pack-path`. |
| C2 | The stylesheet MUST be minified unless `--pretty` is given. |
| C3 | With `-o/--output`, the CLI MUST create the output file's parent directories as needed. |
| V1 | `mockitdown css --pack fluent -o docs/assets/mockitdown.css` writes base and Fluent CSS for a `css: none` site. |

---

### R-CLI-006 — packs and elements

`elements --markdown` generates the per-pack element catalogues of this specification's
[Pack catalogue](../packs/catalogue.md), so the documentation cannot drift from the pack data.

As built (#57): `packs` leaves the hidden packs out unless given the undocumented `--all` (R-PACK-010.C1),
and `elements --own` lists a pack's own elements only (C5).

**R-CLI-006.TC-1 — packs and elements**

Python unit tests `python/tests/test_cli.py` `PacksAndElementsTests`: `packs` prints one line per pack
that is not hidden, in registry order, the Fluent line holding its name, element count and
`import <modules>`; `--json` has the same packs with exactly the eight keys of C1 and Fluent's counts,
modules and own elements; the hidden packs appear only with `--all` (C1). `elements fluent` lists every
element sorted by name with its role and parameters, and `--own` only the pack's own (C2, C5).
`--markdown` prints the five-column header, `InfoBar` with role `alert` and `VStack` marked `*(core)*`;
`base` marks nothing core (C3, V1). A site pack from `-P` is listed by `packs --json` and by `elements`,
its notes' `|` printed as `/` (C3, C4).

**Realizes.** F-13, F-3

| | Statement |
|---|---|
| C1 | `mockitdown packs` MUST list every known pack except the hidden ones (R-PACK-010.C1), one line each with its id, name, element count and import modules; with `--json`, an array of objects with `id`, `name`, `framework`, `version`, `modules`, `device`, `elements` (count) and `own_elements` (names). |
| C2 | `mockitdown elements PACK` MUST list the pack's elements sorted by name with role and positional parameters. |
| C3 | With `--markdown`, `elements` MUST print a Markdown table with the columns Element, Role, Arguments, Defaults and Notes, marking inherited core elements `*(core)*` in packs other than `base` and replacing each vertical bar in notes with `/`. |
| C4 | Both commands MUST include site packs given with `-P/--pack-path`. |
| C5 | With `--own`, `elements` MUST list only the pack's own elements, leaving out those it inherits. |
| V1 | `mockitdown elements fluent --markdown` prints a table whose `InfoBar` row has role `alert` and whose `VStack` row is marked core. |

## Synopsis

```text
mockitdown render FILE [options] [--standalone] [-o OUT]   HTML fragment, or a full page
mockitdown check FILE… [options] [--json]                   diagnostics; exit 1 on any error
mockitdown css [--pack ID …] [-P DIR …] [--pretty] [-o OUT] the stylesheet (for css: none sites)
mockitdown packs [-P DIR …] [--json]                        the packs and their element counts
mockitdown elements PACK [-P DIR …] [--markdown]            one pack's element catalogue

options: --pack ID  --default-pack ID  --device NAME  --appearance light|dark|auto|both
         --width N  --height N  --chrome KIND  --title TEXT  --elements
         -I/--import-path DIR  -A/--asset-path DIR  -P/--pack-path DIR  --no-embed
```

Examples:

```sh
mockitdown render screens/checkout.mockitdown --device phone --appearance both --standalone -o checkout.html
mockitdown check docs/mockups/**/*.mockitdown -I docs/mockups --json
mockitdown css --pack swiftui --pack fluent -o docs/assets/mockitdown.css
mockitdown elements sapui5 --markdown > sapui5-elements.md
```

## Revision history

| Version | Date | Change |
|---|---|---|
| 0.12.8 | 2026-11-27 | as built: packs leaves hidden packs out (R-PACK-010.C1), C5 elements --own; TC-1 verifies C1-C5 (#57); test cases backfilled: every C clause verified by a TC naming its tests (#57); as built: C1 names --menubar [MENU] and --app; TC-2 verifies the rendering flags and source_path (#57) |
| 0.12.0 | 2026-11-27 | SRC-19: import map replaces import_paths; library names and qualified references; page library blocks; templates with slots; User guide |
| 0.10.2 | 2026-11-26 | checked against the changed item it cites; no obligation changes (audit #51) |
| 0.8.9 | 2026-11-25 | as built: --windowed (R-DEV-010.C4) (#13) |
| 0.2.0 | 2026-11-24 | Page created |
| 0.12.0 | 2026-11-27 | SRC-19: import map replaces import_paths; library names and qualified references; page library blocks; templates with slots; User guide |
| 0.10.2 | 2026-11-26 | checked against the changed item it cites; no obligation changes (audit #51) |
| 0.8.9 | 2026-11-25 | as built: --windowed (R-DEV-010.C4) (#13) |
| 0.2.0 | 2026-11-24 | Page created |
