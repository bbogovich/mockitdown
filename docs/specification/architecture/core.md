---
title: "Architecture: core modules"
spec_version: 0.11.0
status: draft
updated: 2026-11-27
page_id: ARCH.1
---

# Architecture: core modules

The modules that read, evaluate and describe a mockup, and the data they share. The diagram is generated from the elements' `uses` clauses; the data flow of one block is on the [System overview](../overview.md).

```mermaid
flowchart LR
  A_API_1["Library API<br/><small>A-API-1 · module</small>"]
  A_ASSET_1["Asset resolver<br/><small>A-ASSET-1 · module</small>"]
  A_ASSET_2["Icon set<br/><small>A-ASSET-2 · module</small>"]
  A_CLI_1["Command-line interface<br/><small>A-CLI-1 · module</small>"]
  A_DIAG_1["Diagnostics<br/><small>A-DIAG-1 · module</small>"]
  A_EVAL_1["Evaluator<br/><small>A-EVAL-1 · module</small>"]
  A_MDX_1["Markdown extension<br/><small>A-MDX-1 · module</small>"]
  A_MDX_2["Superfences fence<br/><small>A-MDX-2 · module</small>"]
  A_OPT_1["Render options<br/><small>A-OPT-1 · module</small>"]
  A_PACK_1["Pack registry<br/><small>A-PACK-1 · module</small>"]
  A_PACK_2["Built-in packs<br/><small>A-PACK-2 · data</small>"]
  A_REND_1["HTML renderer<br/><small>A-REND-1 · module</small>"]
  A_REND_2["Figure assembly and chrome<br/><small>A-REND-2 · module</small>"]
  A_REND_3["Style builder<br/><small>A-REND-3 · module</small>"]
  A_REPO_1["Shared asset tree<br/><small>A-REPO-1 · module</small>"]
  A_STYLE_1["Stylesheet assembly<br/><small>A-STYLE-1 · module</small>"]
  A_SYN_1["Lexer<br/><small>A-SYN-1 · module</small>"]
  A_SYN_2["Parser and syntax tree<br/><small>A-SYN-2 · module</small>"]
  A_WEB_1["TypeScript core<br/><small>A-WEB-1 · module</small>"]
  A_WEB_2["Mockup element<br/><small>A-WEB-2 · module</small>"]
  A_WEB_3["Development server and test pages<br/><small>A-WEB-3 · module</small>"]
  A_WEB_4["Design document and session module<br/><small>A-WEB-4 · module</small>"]
  A_WEB_5["Design-tool components<br/><small>A-WEB-5 · module</small>"]
  A_API_1 -->|"parse the source"| A_SYN_2
  A_API_1 -->|"evaluate the module into a screen"| A_EVAL_1
  A_API_1 -->|"assemble the figure"| A_REND_2
  A_API_1 -->|"resolve images during rendering"| A_ASSET_1
  A_API_1 -->|"build stylesheets"| A_STYLE_1
  A_API_1 -->|"look up packs"| A_PACK_1
  A_ASSET_1 -->|"report refused, missing and oversized as"| A_DIAG_1
  A_CLI_1 -->|"render, check and stylesheet"| A_API_1
  A_CLI_1 -->|"list packs and elements"| A_PACK_1
  A_EVAL_1 -->|"select the pack and look up elements and"| A_PACK_1
  A_EVAL_1 -->|"parse imported component files"| A_SYN_2
  A_EVAL_1 -->|"report semantic problems"| A_DIAG_1
  A_MDX_1 -->|"build the site's render options"| A_OPT_1
  A_MDX_1 -->|"the per-page stylesheet"| A_STYLE_1
  A_MDX_2 -->|"render each block"| A_API_1
  A_MDX_2 -->|"the session's options and used-pack list"| A_MDX_1
  A_MDX_2 -->|"coerce fence attributes"| A_OPT_1
  A_PACK_1 -->|"the built-in pack directory"| A_PACK_2
  A_PACK_1 -->|"raise pack loading errors"| A_DIAG_1
  A_REND_1 -->|"inline styles, data attributes and class"| A_REND_3
  A_REND_1 -->|"image sources"| A_ASSET_1
  A_REND_1 -->|"icon SVG"| A_ASSET_2
  A_REND_1 -->|"report role, icon and asset problems"| A_DIAG_1
  A_REND_2 -->|"render the screen's views and layers"| A_REND_1
  A_REND_2 -->|"device sizes and options"| A_OPT_1
  A_REND_3 -->|"report invalid class names"| A_DIAG_1
  A_STYLE_1 -->|"pack lineage, CSS files and tokens"| A_PACK_1
  A_SYN_1 -->|"raise located syntax errors"| A_DIAG_1
  A_SYN_2 -->|"tokens, and re-lexing of interpolations"| A_SYN_1
  A_SYN_2 -->|"raise located syntax errors"| A_DIAG_1
  A_WEB_1 -->|"the packs, icons, vocabulary and page st"| A_REPO_1
  A_WEB_2 -->|"render the code and build the stylesheet"| A_WEB_1
  A_WEB_3 -->|"every mockup on a test page"| A_WEB_2
  A_WEB_3 -->|"reference samples and design patterns"| A_REPO_1
  A_WEB_4 -->|"parse, re-parse, edit and render the moc"| A_WEB_1
  A_WEB_5 -->|"the session, the document, the history a"| A_WEB_4
  A_WEB_5 -->|"previews, Preview mode and inactive mock"| A_WEB_2
  A_WEB_5 -->|"edit-mode rendering, the lexer, role rul"| A_WEB_1
```

#### A-API-1 — Library API

The façade over the pipeline: parse → evaluate → render, with one diagnostics collector per call.
Realizes R-API-001 to R-API-003 and R-DIAG-004/005.

**Level.** module · **Realizes.** F-13, F-11

| | Statement |
|---|---|
| P1 | provides: `render`, `check`, `evaluate`, `stylesheet`, `RenderResult` and the error box (`mockitdown`, `mockitdown.api`) |
| P2 | provides: the `makeExtension` entry point that Python-Markdown loads for `markdown_extensions: [mockitdown]` |
| U1 | uses A-SYN-2 — parse the source |
| U2 | uses A-EVAL-1 — evaluate the module into a screen |
| U3 | uses A-REND-2 — assemble the figure |
| U4 | uses A-ASSET-1 — resolve images during rendering |
| U5 | uses A-STYLE-1 — build stylesheets |
| U6 | uses A-PACK-1 — look up packs |
| K1 | The library API MUST be the only entry point the fence, the CLI and external callers use to render. |
| K2 | The library API MUST NOT import Python-Markdown or pymdown-extensions. |

---

#### A-OPT-1 — Render options

The single description of everything that can be set for one mockup (M-OPT-1). Realizes R-MDX-003,
R-API-003 and R-DEV-001.

**Level.** module

| | Statement |
|---|---|
| P1 | provides: `RenderOptions` (immutable), the device size table `DEVICES`, the appearance list, the fence attribute table `FENCE_OPTIONS` and fence-attribute coercion (`mockitdown.options`) |
| K1 | Render options MUST be plain data with no behaviour beyond copying with overrides and coercing fence attributes. |

---

#### A-DIAG-1 — Diagnostics

Located errors and warnings (M-DIAG-1). Realizes R-DIAG-001 to R-DIAG-003.

**Level.** module

| | Statement |
|---|---|
| P1 | provides: `Severity`, `Location`, `Diagnostic`, the `Diagnostics` collector and the exceptions `MockitdownError` and `MockitdownSyntaxError` (`mockitdown.diagnostics`) |
| K1 | Diagnostics MUST be the only channel through which stages report problems. |

---

#### A-SYN-1 — Lexer

Swift's lexical layer, reduced. Realizes R-LANG-001 and R-LANG-002.

**Level.** module

| | Statement |
|---|---|
| P1 | provides: `tokenize(src, source)` → tokens with kinds, values and locations (`mockitdown.syntax.lexer`) |
| U1 | uses A-DIAG-1 — raise located syntax errors |
| K1 | The lexer MUST keep string interpolations as unparsed source with their locations. |

---

#### A-SYN-2 — Parser and syntax tree

Builds the module from tokens; the grammar is on the [Language reference](../language/reference.md).
Realizes R-LANG-002 to R-LANG-009.

**Level.** module

| | Statement |
|---|---|
| P1 | provides: `parse(src, source)` → `Module` (imports, directives, structs, statements) and the syntax-tree node types (`mockitdown.syntax.parser`, `mockitdown.syntax.ast`) |
| U1 | uses A-SYN-1 — tokens, and re-lexing of interpolations |
| U2 | uses A-DIAG-1 — raise located syntax errors |
| K1 | The parser MUST be recursive descent with no external parser generator. |
| K2 | The syntax tree MUST NOT decide whether an expression is a view or a value; that is the evaluator's job. |

---

#### A-EVAL-1 — Evaluator

Turns syntax into the resolved view tree (M-VIEW-1 … M-VIEW-3). Realizes R-EVAL-001 to R-EVAL-011,
R-PACK-005 and R-IMP-001 to R-IMP-006.

**Level.** module

| | Statement |
|---|---|
| P1 | provides: `Evaluator.evaluate(module)` → `Screen`; the modifier vocabulary (`RENDERED`, `IGNORED`, `NEUTRAL_MODULES`); the import cache (`mockitdown.evaluate`, `mockitdown.vocabulary`) |
| U1 | uses A-PACK-1 — select the pack and look up elements and modifier maps |
| U2 | uses A-SYN-2 — parse imported component files |
| U3 | uses A-DIAG-1 — report semantic problems |
| K1 | The evaluator MUST always complete and MUST NOT produce HTML. |
| K2 | The evaluator MUST NOT know any framework; framework knowledge lives in packs. |

---

#### A-PACK-1 — Pack registry

Loads and merges packs (M-PACK-1, M-PACK-2). Realizes R-PACK-001 to R-PACK-004.

**Level.** module

| | Statement |
|---|---|
| P1 | provides: `PackRegistry` (lookup by id, listing, module index), `Pack`, `ElementDef` and the cached `registry(extra_dirs)` (`mockitdown.packs`) |
| U1 | uses A-PACK-2 — the built-in pack directory |
| U2 | uses A-DIAG-1 — raise pack loading errors |
| K1 | The pack registry MUST read packs as data only; it MUST NOT execute code from a pack directory. |

---

#### A-PACK-2 — Built-in packs

The framework knowledge of mockitdown, as data. Realizes R-PACK-008 and R-PACK-009.

**At 0.11.0 (SRC-18#answers, question 1).** P1 no longer lists the first eight packs only: it provides every shipped pack.

**Level.** data

| | Statement |
|---|---|
| P1 | provides: one directory per shipped pack (R-PACK-008, R-PACK-019 to R-PACK-029), each with `pack.json` and `pack.css` (`mockitdown/packs/<id>/`), the `pack.css` copies resolved from the stylesheet partials they include (R-PACK-018) |
| K1 | Built-in packs MUST satisfy the pack contract tests (R-PACK-004, R-PACK-006, R-PACK-007). |

## Revision history

| Version | Date | Change |
|---|---|---|
| 0.11.0 | 2026-11-27 | SRC-18: provides every shipped pack, not the first eight; pack.css copies resolved from partials |
| 0.2.0 | 2026-11-24 | Page created |
| 0.2.0 | 2026-11-24 | Page created |
