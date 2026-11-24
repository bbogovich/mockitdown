---
title: "Command line"
spec_version: 0.2.0
status: draft
updated: 2026-11-24
page_id: CLI.1
---

# Command line

The `mockitdown` command.

### R-CLI-001 — Commands

The command line is a thin layer over the library API; everything a site can do per block, the
CLI can do per file.

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

**Realizes.** F-13

| | Statement |
|---|---|
| C1 | `render` and `check` MUST accept `--pack`, `--default-pack` (default `base`), `--device`, `--appearance` (one of the four), `--width`, `--height`, `--chrome`, `--title`, `--elements`, `-I/--import-path` (repeatable), `-A/--asset-path` (repeatable), `-P/--pack-path` (repeatable) and `--no-embed`, with the meaning of the corresponding render option. |
| C2 | When the source is a file, the CLI MUST set the render option `source_path` to its resolved path, so relative imports and images resolve against the file's directory first. |
| V1 | `mockitdown render screens/a.mockitdown -I lib` resolves `import "kpi"` from `screens/` and then `lib/`. |

---

### R-CLI-003 — render

**Realizes.** F-13

| | Statement |
|---|---|
| C1 | `mockitdown render FILE` MUST write the HTML fragment to standard output, or to the file given by `-o/--output`, and print diagnostics to standard error. |
| C2 | With `--standalone`, the CLI MUST write a complete HTML document (UTF-8, responsive viewport, title from `--title` or the file name, a neutral page background with a dark-scheme variant) with the stylesheet for the used packs (or `base` when none) inlined. |
| C3 | `render` MUST exit 1 when the source has an error, after writing the output. |
| V1 | `mockitdown render a.mockitdown --standalone -o a.html` writes a page that opens offline and shows the mockup styled. |

---

### R-CLI-004 — check

**Realizes.** F-13, F-12

| | Statement |
|---|---|
| C1 | `mockitdown check FILE…` MUST render each file (so asset and icon problems are found) and print its diagnostics, then a summary line `<file>: ok (E errors, W warnings)` or `<file>: FAILED (…)`. |
| C2 | With `--json`, `check` MUST print instead a JSON array with one object per file: `file`, `ok`, and `diagnostics` as objects with `severity`, `code`, `message`, `line`, `col` and `source`. |
| C3 | `check` MUST exit 1 when any file has an error. |
| V1 | Checking one good and one bad file prints `ok` and `FAILED` lines and exits 1; `--json` output parses as JSON. |

---

### R-CLI-005 — css

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

**Realizes.** F-13, F-3

| | Statement |
|---|---|
| C1 | `mockitdown packs` MUST list every known pack, one line each with its id, name, element count and import modules; with `--json`, an array of objects with `id`, `name`, `framework`, `version`, `modules`, `device`, `elements` (count) and `own_elements` (names). |
| C2 | `mockitdown elements PACK` MUST list the pack's elements sorted by name with role and positional parameters. |
| C3 | With `--markdown`, `elements` MUST print a Markdown table with the columns Element, Role, Arguments, Defaults and Notes, marking inherited core elements `*(core)*` in packs other than `base` and replacing each vertical bar in notes with `/`. |
| C4 | Both commands MUST include site packs given with `-P/--pack-path`. |
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
| 0.2.0 | 2026-11-24 | Page created |
