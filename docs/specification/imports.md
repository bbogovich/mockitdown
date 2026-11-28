---
title: "Component imports"
spec_version: 0.12.8
status: draft
updated: 2026-11-27
page_id: IMP.1
---

# Component imports

Loading custom components from component library files with `import "path"`. The component mechanism itself (structs) is specified in R-LANG-004 and R-EVAL-005.

### R-IMP-001 — File imports load components

A component file is a library: it declares and never renders, so importing it can never change a
mockup except by providing components.

**R-IMP-001.TC-1 — Component files**

Python unit tests `python/tests/test_imports.py` `FileImportTests`, with files beside the block's
`source_path`: a struct declared in the block uses `KPI` from `import "kpi"` with no diagnostic (C1). A
component file with `KPI` and two `Text` views makes `KPI` available, renders neither view and warns once
`kpi.mockitdown: top-level views in an imported file are ignored` with code `import` at the first view's
line in that file (C2, C3, V1); its `import Fluent` selects no pack (C2). Its `@Screen(device:,
appearance:)` and an unknown `@Foo` change nothing and report nothing (C4).

**Realizes.** F-4 · **Decisions.** ADR-10

| | Statement |
|---|---|
| C1 | When a block contains `import "path"`, the evaluator MUST load the struct declarations of the named component file before evaluating the block's own declarations and views. |
| C2 | A component file MUST be mockitdown source; only its imports and struct declarations take effect. |
| C3 | If a component file contains top-level statements, then the evaluator MUST ignore them and warn "<file>: top-level views in an imported file are ignored" with code `import`. |
| C4 | Directives in a component file MUST be ignored. |
| V1 | Importing a file that declares `KPI` and also contains `Text("demo")` makes `KPI` available and warns once about the ignored view. |

---

### R-IMP-002 — Resolving import paths

Resolution against the importing file first lets libraries import their neighbours with short
relative paths; the import map makes libraries available to every page under a namespace, the way
TypeScript's `paths` or a browser import map does:

```yaml
imports:
  "": docs/mockups                 # import "kpi"         → docs/mockups/kpi.mockitdown
  shared/: docs/mockups/shared/      # import "shared/kpi"  → docs/mockups/shared/kpi.mockitdown
  acme/: [vendor/acme/, "https://example.com/acme/"]   # local copy first, then the vendor's URL
```

The longest matching key wins and never falls back to a shorter one, so a namespace cannot be
shadowed by a file of the same name under the root.

**Known gap.** As for assets (R-ASSET-002), a fenced block in a Markdown page has no known file in
a site build, so a block's own bare imports are resolved through the import map only, and `./` imports report
that no importing file is known.

**R-IMP-002.TC-1 — Resolution through the import map**

In a temporary directory used as the working directory, with files `docs/mockups/shared/kpi.mockitdown` (importing `rows` and `./rows`), `docs/mockups/shared/rows.mockitdown`, `vendor/acme/cards.mockitdown`, `alt/one.mockitdown` and a local `http.server` on 127.0.0.1 serving `remote/acme/extra.mockitdown`, render through the API with `imports` = `{"shared/": "docs/mockups/shared/", "acme/": ["vendor/acme/", "http://127.0.0.1:<port>/remote/acme/"], "one": "alt/one.mockitdown", "": "docs"}` and check:

1. An absolute path loads as written (C1); `import "./x"` in a block with no source path reports C4, and with `source_path` set resolves beside it (C2).
2. `import "shared/kpi"` loads the library and its two nested imports, with `.mockitdown` appended (C3, C5, C6); `shared/` wins over `""` for that path (C7).
3. `import "acme/cards"` loads the vendor file; `import "acme/extra"` falls through to the HTTP candidate (C8, C9); a 404 for `acme/none` reports C4 listing the four candidates in order, and does not try `docs/acme/none` (C8); a server that is stopped produces `cannot read import` (C9).
4. `import "one"` loads `alt/one.mockitdown`; `import "one/x"` does not match the exact key (C7).
5. Without `imports`, the API and the CLI resolve `import "kpi"` only beside the source file (C10).

Automated in `python/tests/test_imports.py`; the TypeScript variant runs the same cases through R-WEB-001.TC-6.

**Realizes.** F-4 · **Decisions.** ADR-10

| | Statement |
|---|---|
| C1 | The evaluator MUST resolve an absolute import path as written. |
| C2 | The evaluator MUST resolve an import path beginning with `./` or `../` against the directory of the importing file only — the component file for nested imports, the block's source file when known; without a known importing file it MUST report the error of C4. |
| C3 | For each candidate, the evaluator MUST try the path as written and then with `.mockitdown` appended, and MUST use the first existing file. |
| C4 | If no candidate exists, then the evaluator MUST report the error "cannot find import 'x' (tried …)" listing every candidate tried, in order, with code `import`. |
| C5 | Relative paths in an import map MUST be resolved against the process's working directory — for a site build, the directory the build is run from; in the web components, against the import base URL (R-WEB-002.C3). |
| C6 | The evaluator MUST resolve any other relative path (a bare specifier such as `shared/kpi`) first against the directory of the importing file, when that file is known, and then through the import map. |
| C7 | An import map MUST be a mapping from keys to targets: a key ending in `/` matches every path that starts with it, the remainder of the path being joined to the target; any other non-empty key matches only the identical path, its target naming the file; the empty key `""` matches every path, the whole path being the remainder; when several keys match, the evaluator MUST use the longest. |
| C8 | A target MUST be a directory or file path, an `http:`, `https:` or `file:` URL, or a list of these; the evaluator MUST try the candidates of each list entry (C3) in list order, and MUST NOT fall back to a shorter key when the longest matching key yields no file. |
| C9 | The Python evaluator MUST read an `http:` or `https:` candidate with a GET request and a 10-second timeout, treating status 404 as a missing candidate and any other failure as an unreadable file (R-IMP-005.C1). |
| C10 | The render API and the command line MUST default to an empty import map; the Markdown extension's default is R-MDX-002.C1's. |
| V1 | With `imports: {"shared/": docs/mockups/shared/, "acme/": [vendor/acme/, "https://example.com/acme/"]}`, `import "shared/kpi"` loads `docs/mockups/shared/kpi.mockitdown`; inside it, `import "rows"` and `import "./rows"` load `docs/mockups/shared/rows.mockitdown`; `import "acme/cards"` loads `vendor/acme/cards.mockitdown` when it exists and otherwise `https://example.com/acme/cards.mockitdown`; `import "other/x"` reports C4 listing the candidates it tried. |

---

### R-IMP-003 — Nested imports and cycles

Cycles are harmless — libraries only declare — so they are ignored rather than reported.

**R-IMP-003.TC-1 — Nested imports and cycles**

Python unit tests `python/tests/test_imports.py` `NestedImportTests`: `lib/a` importing `b` resolves it
beside `a`; both files' structs are available, and for a struct both declare, `b`'s is taken first and
`a`'s replaces it with the R-IMP-004.C1 warning (C1). Files `a` and `b` importing each other both load,
with no diagnostic (C2, V1). A file imported by the block, by a nested import and again as
`kpi.mockitdown` and `./kpi.mockitdown` is loaded once (its ignored-view warning appears once), and
another mockup loads it again (C2).

**Realizes.** F-4 · **Decisions.** ADR-10

| | Statement |
|---|---|
| C1 | The evaluator MUST process a component file's own file imports, depth first, before taking its struct declarations. |
| C2 | The evaluator MUST load each resolved file at most once per mockup; an import of a file already loaded in that mockup, including an import cycle, MUST be skipped silently. |
| V1 | Files `a` importing `b` and `b` importing `a` both load once without a diagnostic. |

---

### R-IMP-004 — Definition precedence

The nearest definition wins, so a page can adjust a shared component locally, and a site can
replace a pack element with its own component.

**R-IMP-004.TC-1 — Precedence within and across libraries**

Two files imported `as UI` both declaring `Card`: one warning of C1, the later `Card` is used; `acme/cards` and `contoso/cards` both declaring `Card` load with no diagnostic (C4); a block-local `Card` replaces the imported ones silently (C2); a struct `Text` replaces the pack's `Text` (C3). Automated in `python/tests/test_imports.py` and mirrored in the TypeScript unit tests.

**Realizes.** F-4 · **Decisions.** ADR-10

| | Statement |
|---|---|
| C1 | When several loaded files of the same library (R-IMP-007.C1) declare a struct of the same name, the later declaration in load order MUST replace the earlier one, and the evaluator MUST warn "struct S from <file> replaces an earlier definition" with code `import`. |
| C2 | A struct declared in the block MUST replace an imported struct of the same name without a diagnostic. |
| C3 | A struct (declared or imported) MUST take precedence over a pack element of the same name (R-EVAL-003.C1). |
| C4 | Structs of the same name in different libraries MUST NOT replace one another, and loading them MUST NOT produce a diagnostic; each stays reachable by its qualified name (R-IMP-007.C4). |
| V1 | A block importing a library with `KPI` and declaring its own `KPI` uses its own. |
| V2 | Importing `acme/cards` and `contoso/cards`, both declaring `Card`, loads both silently; two files imported `as UI` that both declare `Card` warn once, and the later one is `UI.Card`. |

---

### R-IMP-005 — Import errors and caching

Caching matters for sites where many pages import the same library: each file is parsed once per
build unless it changes, which also keeps `zensical serve` reloads correct.

**R-IMP-005.TC-1 — Imports and assets**

Automated by `tests/test_render.py::EvaluateRenderTests::test_imports_and_assets`.

**Realizes.** F-4, F-12

| | Statement |
|---|---|
| C1 | If a component file cannot be read, then the evaluator MUST report "cannot read import 'x': <reason>" with code `import` and continue. |
| C2 | If a component file has a syntax error, then the evaluator MUST report that syntax error, located in that file, and continue without its declarations. |
| C3 | The evaluator MAY cache parsed component files across mockups in one process, keyed by resolved path and modification time; a changed file MUST be re-parsed. |
| V1 | A library with a syntax error on its line 4 produces `error [syntax] at <path>:4:…` and the block still renders its other content. |

---

### R-IMP-006 — Module imports are not file imports

The two forms mirror Swift: `import SwiftUI` names a framework, `import "shared/kpi"` names a file.

**R-IMP-006.TC-1 — Module imports load no file**

Python unit tests `python/tests/test_imports.py` `ModuleImportTests`, with `Charts.mockitdown`,
`Kpi.mockitdown` and `Fluent.mockitdown` beside the block: `import Charts` neither loads the file nor
warns; `import Kpi` warns `import Kpi names no known pack` (code `pack`) and does not load the file, so
its struct is unknown; `import Fluent` selects the Fluent pack (C1, V1). `import "Kpi"` loads the file
(C2).

**Realizes.** F-3, F-4

| | Statement |
|---|---|
| C1 | An `import` of an unquoted module name MUST only select a pack (R-PACK-005) or be accepted as neutral (R-EVAL-011.C3); it MUST NOT load a file. |
| C2 | A component library MUST be imported with a quoted path. |
| V1 | `import Charts` neither loads a file nor warns; `import Kpi` warns that it names no known pack. |

---

### R-IMP-007 — Library names and qualified references

**Requires:** R-IMP-002

**Requirement.** Each import belongs to a library named by its first path segment (or an `as` alias),
and components are referred to as `Library.Name` when two libraries both declare `Name`, as Swift
qualifies a type by its module:

```swift
import "acme/cards"
import "contoso/cards" as Co

acme.Card(title: "Vendor")
Co.Card(title: "Ours")
Row()                 // only acme declares Row: no prefix needed
```

**Rationale.** Libraries from different sources are written independently; a later file silently
replacing an earlier one's `Card` (the rule before ADR-24) would make a mockup depend on import order.
An unqualified name stays the convenient default and becomes an error only when it is truly
ambiguous. Inside a library's own structs, its own components win, so a library keeps working when
another library with overlapping names is imported beside it.

**Verification.** TC-1, in both variants.

**R-IMP-007.TC-1 — Library names, qualified and ambiguous references**

With registered or temporary files `acme/cards` (`Card`, `Row`, and `Panel` whose body calls `Card()`), `contoso/cards` (`Card`), `@vendor/kit` (`Chip`), `my-lib/x` (`Tag`) and `acme/more` (`Badge`, importing `contoso/cards`):

1. `acme.Card()` and `contoso.Card()` render their own bodies; `vendor.Chip()` works (C1, C4); `import "contoso/cards" as Co` makes `Co.Card()` work and `contoso.Card()` an `unknown` error of C4 (C1).
2. `Card()` alone reports the C6 message naming `acme, contoso` in load order; `Row()` resolves to acme's (C5); `acme.Panel()` uses acme's `Card` inside its body (C5).
3. `acme.Nope()` reports C4's error; `import "my-lib/x"` warns as C2 says and `Tag()` still works.
4. Importing `acme/more` makes contoso's `Card` belong to `contoso`, not `acme` (C3); `acme/cards` and `acme/more` form one library `acme` (C7).
5. The screen's used components list `acme.Card` for the qualified call (C8).

Automated in the Python tests and the TypeScript unit tests with the same sources; one conformance case covers 1 and 2.

**Realizes.** F-4 · **Decisions.** ADR-24

| | Statement |
|---|---|
| C1 | Every file import MUST belong to a library, named by the first rule that applies: the alias given with `as` (R-LANG-003.C8); for `import "#name"`, `name` (R-IMP-008); for a path beginning with `./` or `../`, the library of the importing component file, or for a block the importing file's base name without extension; otherwise the first segment of the path as written, without a leading `@` (`acme/cards` and `@acme/cards` → `acme`, `kpi` → `kpi`). |
| C2 | If the name C1 gives is not an identifier, then the evaluator MUST warn "library name of 'x' is not an identifier; import it with `as`" with code `import`, and the import's structs MUST be reachable only unqualified. |
| C3 | Structs that a component file loads through its own imports MUST belong to the libraries of those imports, not to the importing file's library. |
| C4 | When `L.Name` is called, or named bare, where views are expected and `L` names a library loaded in the mockup, the evaluator MUST instantiate the struct `Name` of library `L`, even when the pack has an element or the language an enum namespace written `L.Name`; if library `L` has no struct `Name`, then it MUST report the error "library 'L' has no component 'Name'" with code `unknown` and produce an `unknown` view. |
| C5 | The evaluator MUST resolve an unqualified struct name `Name` to, in order: a struct declared in the block; inside the body of a struct of library `L`, `L`'s struct `Name`; the struct `Name` of the one loaded library that declares it. |
| C6 | If several loaded libraries declare `Name` and C5 does not settle it, then the evaluator MUST report the error "'Name' is ambiguous: declared by libraries a, b; write a.Name or b.Name" (the libraries in load order) with code `import` and produce an `unknown` view. |
| C7 | Imports giving the same library name to different files MUST form one library holding the structs of all of them (R-IMP-004.C1). |
| C8 | The screen's list of used components (R-EVAL-005.C9) MUST record a qualified call by its qualified name `L.Name`. |
| V1 | With `acme/cards` and `contoso/cards` imported, both declaring `Card`, `acme.Card()` and `contoso.Card()` render their own bodies, `Card()` is an `import` error naming `acme` and `contoso`, and `import "contoso/cards" as Co` makes the second `Co.Card()`; a `Row` declared only by `acme` is reachable as `Row()`. |

---

### R-IMP-008 — Library blocks on a page

**Requires:** R-IMP-007, R-MDX-003

**Requirement.** A block marked `library="name"` declares components for the rest of its page;
later blocks write `import "#name"`:

````markdown
```mockitdown library="cards" source="true"
struct Pill: View {
  var text: String
  var body: some View { Text(text).padding(4).border(.separator) }
}
```

```mockitdown
import "#cards"
HStack { Pill(text: "On"); Pill(text: "Off") }
```
````

The web components use `<mockitdown-library name="cards">` the same way.

**Rationale.** A page often needs one component for several of its mockups without a site-wide
library file. The `#` keeps page libraries apart from the import map's namespaces, and "earlier on
the page" matches how Python-Markdown converts a page, top to bottom, and how a reader reads it.

**Verification.** TC-1 (site pages), TC-2 (web components).

**R-IMP-008.TC-1 — Library blocks in a site page**

Converting Markdown pages with `markdown.Markdown(extensions=["mockitdown", "pymdownx.superfences"], …)`:

1. Page A: a block `library="cards"` declaring `Pill`, then a block `import "#cards"` / `Pill(text: "On")`: the output holds exactly one mockup figure and no listing (C1, C2, C3); with `source="true"` on the library block a code listing of its source appears and still no figure for it (C2).
2. Page A again with the importing block first: C4's error (C4).
3. Two library blocks named `cards`: the warning of C5, and the block after the second uses the second's `Pill` (C5).
4. Page B converted after a reset of the same `Markdown` instance: `import "#cards"` reports C4 (C6).
5. A syntax error in the library block, with `strict: true`, fails with a `SuperFencesException` naming the library block (C7).
6. `render(source, libraries={"cards": "struct Pill: View {…}"})` resolves `import "#cards"` (C9).

Automated in `python/tests/`.

**R-IMP-008.TC-2 — The mockitdown-library element**

Browser test (Chromium): a page with `<mockitdown-library name="cards">` holding a `<script type="text/mockitdown">` that declares `Pill`, followed by a `mockitdown-mockup` importing `#cards`, renders the pill; the library element renders nothing, and with the attribute `source` renders a code listing; a mockup element placed before the library element reports the C4 error of R-IMP-008. A unit test calls the TypeScript `render` with `libraries` (C9).

**Realizes.** F-4, F-11 · **Decisions.** ADR-24

| | Statement |
|---|---|
| C1 | When a fence has the attribute `library="<name>"`, the fence MUST treat the block as a library block: parse its source as a component file (R-IMP-001.C2 to C4) and register it for its page under the name `name`. |
| C2 | A library block MUST NOT render a mockup; while its `source` attribute is true it MUST render its source as a code listing, and otherwise it MUST render nothing. |
| C3 | An `import "#name"` MUST resolve to the library block `name` registered earlier on the same page, and never through the import map or the file system. |
| C4 | If no library block `name` precedes the importing block on its page, then the evaluator MUST report the error "no library block '#name' earlier on this page" with code `import`. |
| C5 | When a later library block on a page has the name of an earlier one, the fence MUST register it in place of the earlier one for the blocks after it and warn "library block '#name' redefined" with code `import`. |
| C6 | The Markdown extension MUST forget the page's library blocks when Python-Markdown is reset between pages. |
| C7 | A library block's diagnostics MUST be the block's own: logged and, under `strict`, failing the build as for any block (R-MDX-005), and located in the block. |
| C8 | Loading the package entry of the web components MUST define the element `mockitdown-library`, which takes its source as the mockup element does (R-WEB-002.C2) and its name from its `name` attribute, registers it as C1 says for the mockup elements after it in document order, and renders nothing unless it has the attribute `source`, in which case it renders its source as a code listing. |
| C9 | The render API MUST accept the render option `libraries`, a mapping from library name to source, as the library blocks that `import "#name"` resolves against; the fence and the web components MUST pass the library blocks preceding a block through it. |
| V1 | A page whose first block is ```` ```mockitdown library="cards" ```` declaring `Pill`, followed by a block with `import "#cards"` and `Pill(text: "On")`, renders one mockup and no listing; on the next page `import "#cards"` is the C4 error; with `source="true"` the library block shows its code. |

---

### R-IMP-009 — Components as templates with content slots

**Requires:** R-EVAL-005, R-LANG-004

**Requirement.** A component is a template: its value properties are overridable defaults and its
`@ViewBuilder` properties are content slots. The trailing closure fills `content`; labelled closures
or labelled view arguments fill the other slots; an unfilled slot shows its default or, when its
type is optional, nothing.

```swift
struct AppShell: View {
  var title = "App"
  @ViewBuilder var sidebar: some View = Text("Navigation")
  @ViewBuilder var toolbar: (some View)?
  @ViewBuilder var content: some View
  var body: some View {
    HStack { sidebar; VStack { HStack { Text(title).font(.title); Spacer(); toolbar }; content } }
  }
}

AppShell(title: "Orders", toolbar: Button("New order")) {
  Table { … }
}
```

**Rationale.** This is SwiftUI's own mechanism (the request's "@ContentBuilder" is `@ViewBuilder`),
so the same code stays valid Swift (ADR-10.C1). Before this requirement the trailing closure went to
the first view property even when that one had a default, which made a defaulted slot declared
before `content` unusable.

**Verification.** TC-1 and the conformance case `template-slots`.

**R-IMP-009.TC-1 — A layout template with slots**

The struct `AppShell` of V1, with the body `HStack { sidebar; VStack { Text(title); toolbar; content } }`:

1. `AppShell(title: "Orders", toolbar: Button("New")) { Text("Table") }` renders Orders, Nav, the button and Table with no diagnostic (C3, C4).
2. `AppShell(sidebar: { Text("Mine") }) { Text("Table") }` — and the labelled trailing-closure form — render Mine instead of Nav (C4).
3. `AppShell { Text("Table") }` renders App, Nav and Table, no toolbar element and no diagnostic, both in a block and outside a preview (C1, C2).
4. A default `sidebar` that reads `title` shows the bound title (C1: struct scope).
5. The conformance corpus holds `template-slots` with the two calls of C5, run by both variants (C5).

Automated in `python/tests/test_render.py` and the conformance corpus.

**Realizes.** F-4 · **Decisions.** ADR-24

| | Statement |
|---|---|
| C1 | When no argument binds a view-typed stored property that has a default, the evaluator MUST evaluate the default in the struct's own scope and place its views wherever the body names the property. |
| C2 | When no argument binds an optional view-typed property (R-LANG-004.C6) without a default, the evaluator MUST produce no views where the body names it, without a diagnostic and also outside a preview. |
| C3 | When a labelled argument (not a closure) binds a view-typed property, the evaluator MUST evaluate its value as a view expression in the caller's scope and bind the resulting views, as a labelled trailing closure holding that expression would. |
| C4 | A caller MUST be able to fill any combination of a struct's view-typed properties in one call: the unlabelled trailing closure (R-EVAL-005.C2), labelled trailing closures and labelled arguments, while its other properties take arguments or their defaults (R-EVAL-005.C1, C4). |
| C5 | The conformance corpus (R-REPO-004) MUST hold a template case with a struct that has a `content` slot, a slot with a default, an optional slot and a defaulted value property, called once filling all of them and once filling only `content`. |
| V1 | `struct AppShell: View { var title = "App"; @ViewBuilder var sidebar: some View = Text("Nav"); @ViewBuilder var toolbar: (some View)?; @ViewBuilder var content: some View; var body: some View { … } }` called as `AppShell(title: "Orders", toolbar: Button("New")) { Text("Table") }` renders "Orders", "Nav", the button and "Table"; `AppShell { Text("Table") }` renders "App", "Nav" and "Table", no toolbar and no diagnostic. |

## Revision history

| Version | Date | Change |
|---|---|---|
| 0.12.8 | 2026-11-27 | test cases backfilled: every C clause verified by a TC naming its tests (#57) |
| 0.12.0 | 2026-11-27 | New R-IMP-008: Library blocks on a page; New R-IMP-009: Components as templates with content slots; New R-IMP-007: Library names and qualified references; SRC-19: import map replaces import_paths; library names and qualified references; page library blocks; templates with slots; User guide |
| 0.2.0 | 2026-11-24 | Page created |
| 0.12.0 | 2026-11-27 | New R-IMP-008: Library blocks on a page; New R-IMP-009: Components as templates with content slots; New R-IMP-007: Library names and qualified references; SRC-19: import map replaces import_paths; library names and qualified references; page library blocks; templates with slots; User guide |
| 0.2.0 | 2026-11-24 | Page created |
