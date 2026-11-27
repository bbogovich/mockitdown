---
title: "Pack format"
spec_version: 0.10.8
status: draft
updated: 2026-11-27
page_id: PACK.1
---

# Pack format

What a design pack is, how packs are found, inherited and selected, and the rules their tokens and CSS follow. The reference for every `pack.json` key follows the requirements.

### R-PACK-001 — Pack directory layout and lookup

Packs are plain files so that a site can add or replace one without code (ADR-4). Because the
site's directories are searched first, a site can also override a shipped pack by reusing its
identifier.

**Re-checked at specification 0.10.7.** Its prerequisites were re-checked after the renderer split (#48, #49) and the gallery spec split (#50) without any change to an obligation; neither is this item changed.

**Realizes.** F-3, F-7 · **Decisions.** ADR-4

| | Statement |
|---|---|
| C1 | A pack MUST be a directory named by its identifier holding `pack.json` (UTF-8 JSON) and, optionally, `pack.css`. |
| C2 | The pack registry MUST look a pack identifier up in each configured pack directory (`pack_paths`) in order, then in the built-in pack directory, and MUST use the first directory that contains `<id>/pack.json`. |
| C3 | The pack registry MUST list the known packs as the subdirectories holding a `pack.json`, from the configured directories first and then the built-in directory, sorted by name within each directory and without duplicates. |
| C4 | If no directory holds the requested identifier, then the pack registry MUST raise an error "unknown pack 'x'; known packs: …". |
| C5 | The pack registry MUST load each pack at most once per registry and reuse it. |
| V1 | With `pack_paths: [site/packs]` and `site/packs/fluent/pack.json` present, `pack="fluent"` uses the site's pack, not the built-in one; `pack="nope"` reports the known packs. |

---

### R-PACK-002 — pack.json keys

`pack.json` is the whole vocabulary of a framework as data. The specification's
[Pack format](format.md) page documents every key with an example; the built-in `base` pack is the
reference instance.

**Re-checked at specification 0.10.7.** Its prerequisites were re-checked after the renderer split (#48, #49) and the gallery spec split (#50) without any change to an obligation; neither is this item changed.

**Realizes.** F-3 · **Decisions.** ADR-4

| | Statement |
|---|---|
| C1 | The pack registry MUST read these `pack.json` keys, all optional except as stated: `id` (default: the directory name), `name` (default: the id), `framework`, `version`, `extends`, `modules`, `device`, `chrome`, `tokens`, `elements`, `modifiers`, `fonts`, `sizes`, `icons`; other keys MUST be ignored. |
| C2 | `modules` MUST be a list of module names that `import <Module>` accepts to select the pack. |
| C3 | `device` MUST be the pack's default device form (default: the parent's, and `desktop` for a root pack). |
| C4 | `chrome` MUST map device forms to chrome kinds (R-DEV-006); a form not listed MUST mean `none`. |
| C5 | `tokens` MUST hold `light` and `dark` objects mapping token names to CSS values. |
| C6 | `elements` MUST map element names to element definitions (R-PACK-004). |
| C7 | `modifiers` MUST map modifier names to `{ "attr": <attribute>, "value": <optional fixed value> }` (R-EVAL-009.C2). |
| C8 | `fonts` MUST map font style names written in the source (`.font(.h4)`) to canonical font styles. |
| C9 | `sizes` MUST map device forms to `[width, height]` in logical points, overriding the default device sizes. |
| C10 | `icons` MUST map icon names to built-in glyph names, consulted before the global icon aliases. |
| V1 | A minimal `{"id": "acme", "extends": "mui"}` loads with the Material UI pack's elements, tokens, modifiers, chrome and sizes. |

---

### R-PACK-003 — Pack inheritance

Inheritance is what keeps the core vocabulary portable: `VStack`, `Text`, `Button` and the other
`base` elements exist in every pack, styled by each pack's CSS, and a framework pack only adds what
is specific to it.

**Re-checked at specification 0.10.7.** Its prerequisites were re-checked after the renderer split (#48, #49) and the gallery spec split (#50) without any change to an obligation; neither is this item changed.

**Realizes.** F-3, F-7 · **Decisions.** ADR-4

| | Statement |
|---|---|
| C1 | A pack MUST extend the pack named by `extends`; when `extends` is absent, every pack other than `base` MUST extend `base`, and `base` MUST extend nothing. |
| C2 | If a pack extends itself, then the pack registry MUST raise "a pack cannot extend itself". |
| C3 | The pack registry MUST merge `elements`, `modifiers`, `chrome`, `sizes` and `icons` over the parent's, the child's entries replacing the parent's entries of the same name. |
| C4 | The pack registry MUST merge `tokens` per mode over the parent's tokens of that mode. |
| C5 | Font aliases MUST be resolved from the pack itself up through its ancestors, the nearest definition winning; an unmapped name MUST resolve to itself. |
| C6 | The pack registry MUST record which element names the pack defines itself, as distinct from inherited ones. |
| C7 | The pack's lineage MUST be the chain from the root pack to the pack, and the stylesheet for a pack MUST include every pack in its lineage, root first. |
| V1 | A pack extending `fluent` that redefines `Button` and adds one token keeps every other Fluent element and token, and its stylesheet contains base, then fluent, then its own CSS. |

---

### R-PACK-004 — Element definitions

The element definition is the whole mapping from a framework's component to mockitdown's markup:
`"InfoBar": {"role": "alert", "params": ["title"], "defaults": {"variant": "infobar"}}` makes
Fluent's `InfoBar("Saved")` render through the shared `alert` role, restyled by the Fluent CSS.

Checked at 0.10.1 after M-PACK-2.F7 and F8 (`rules`, `types`; R-PACK-016.C5, R-PACK-017.C3): both are optional and read only by the design tools, so C1 to C5 and the contract test are unchanged; C2 lists the keys that rendering uses.

**Re-checked at specification 0.10.7.** Its prerequisites were re-checked after the renderer split (#48, #49) and the gallery spec split (#50) without any change to an obligation; neither is this item changed.

**R-PACK-004.TC-1 — Pack contract — roles and rendering**

Automated by `tests/test_packs.py::PackTests::test_packs_load_and_roles_exist` and
`test_every_element_renders`.

**Realizes.** F-3 · **Decisions.** ADR-4

| | Statement |
|---|---|
| C1 | An element definition MUST name its render `role`; if `role` is missing, then the pack registry MUST raise "element 'X' has no 'role'". |
| C2 | An element definition MAY give `params` (the attribute names of positional arguments, in order), `defaults` (attribute values applied before the call's arguments), `variants` (the documented values of its `variant` attribute) and `doc` (one line of usage). |
| C3 | Every element's role MUST be one of the renderer's roles (the role catalogue). |
| C4 | If an element's role is not a renderer role, then the renderer MUST report "pack 'p': element 'X' has unknown role 'r'" with code `role` and render the view as an unknown element. |
| C5 | Every element a pack lists MUST render without errors (other than missing struct arguments) when called with no arguments. |
| V1 | The contract test loads every pack, checks every element's role against the renderer, and renders `Name()` for every element of every pack without errors. |

---

### R-PACK-005 — Pack selection

The order goes from the most specific to the most general: the page author's fence attribute,
then what the code itself says, then site policy. `import SwiftUI` is what a pasted Swift file
already contains, so SwiftUI code selects the SwiftUI pack with no extra attribute.

**Re-checked at specification 0.10.7.** Its prerequisites were re-checked after the renderer split (#48, #49) and the gallery spec split (#50) without any change to an obligation; neither is this item changed.

**R-PACK-005.TC-1 — Unique module names**

Automated by `tests/test_packs.py::PackTests::test_module_names_are_unique`.

**Realizes.** F-3 · **Decisions.** ADR-4

| | Statement |
|---|---|
| C1 | The evaluator MUST select a mockup's pack by the first of: the `pack` fence attribute or render option; the first `import <Module>` whose module name a pack declares (compared case-insensitively); the `pack` argument of `@Screen`; the configured default pack (`default_pack`, default `base`). |
| C2 | If a later `import <Module>` selects a different pack than an earlier one, then the evaluator MUST warn "import M selects pack 'b', but 'a' is already selected; the first import wins" with code `pack`. |
| C3 | If `import <Module>` names no pack's module and is not a neutral module (R-EVAL-011.C3), then the evaluator MUST warn "import M names no known pack" with code `pack`. |
| C4 | If the selected pack cannot be loaded, then the evaluator MUST report the registry's error with code `pack` and use the `base` pack. |
| C5 | When several packs declare the same module name, the first pack in registry order MUST win; shipped packs MUST NOT share a module name. |
| V1 | A block with `import SwiftUI` and fence `pack="fluent"` renders with Fluent; without the fence attribute it renders with SwiftUI; `@Screen(pack: "mui")` applies only when no import selects a pack. |

---

### R-PACK-006 — Design tokens

Tokens are the bridge between a pack's data and its CSS and the mechanism of light and dark mode:
pack CSS says `background: var(--mkd-surface)`, and the frame's appearance decides which value
that is. The complete base token list, with values, is on the [Pack format](format.md) page.

**Re-checked at specification 0.10.7.** Its prerequisites were re-checked after the renderer split (#48, #49) and the gallery spec split (#50) without any change to an obligation; neither is this item changed.

**R-PACK-006.TC-1 — Tokens for light and dark**

Automated by `tests/test_packs.py::PackTests::test_tokens_have_light_and_dark`.

**Realizes.** F-3, F-9 · **Decisions.** ADR-6

| | Statement |
|---|---|
| C1 | Every pack MUST define light tokens for at least every light token name of `base`, and MUST define at least one dark token. |
| C2 | The stylesheet assembler MUST emit each token as the CSS custom property `--mkd-<name>`; it MUST skip a token whose name is not made of letters, digits, `_` and `-`, or whose value contains `{`, `}`, `;`, `<` or `>`. |
| C3 | The base token set MUST include surface and text colours (`bg`, `surface`, `surface-2`, `surface-3`, `fg`, `fg-2`, `fg-3`, `border`, `divider`), the accent (`accent`, `on-accent`, `accent-soft`), status colours (`danger`, `warning`, `success`, `info`), field colours, `scrim`, three shadows, five radii, the fonts, base font size and line height, icon stroke and size, control height, gap and padding, chrome colours, a size and weight for each canonical font style, thirteen named colours and six chart colours. |
| C4 | Pack CSS MUST take colours, radii, shadows and typography from tokens rather than literal values wherever a token exists, so that appearance switching (R-APP-002) restyles it. |
| V1 | The contract test checks that every pack's light tokens include all of `base`'s and that its dark tokens are non-empty. |

---

### R-PACK-007 — Pack stylesheet rules

Scoping lets several packs share one page — a Fluent and a Material mockup side by side — and
keeps mockitdown's CSS from leaking into the documentation theme. Writing plain `px` keeps pack
CSS ordinary; scaling is applied when the stylesheet is assembled.

**Re-checked at specification 0.10.7.** Its prerequisites were re-checked after the renderer split (#48, #49) and the gallery spec split (#50) without any change to an obligation; neither is this item changed.

**R-PACK-007.TC-1 — Scoped, appearance-neutral pack CSS**

Automated by `tests/test_packs.py::PackTests::test_css_is_scoped` and
`test_css_has_no_appearance_branching`.

**Realizes.** F-3, F-8 · **Decisions.** ADR-5, ADR-6, ADR-7

| | Statement |
|---|---|
| C1 | Every selector in a non-base pack's `pack.css` MUST start with `.mkd-pack-<id>` (the pack's figure class), so a pack's rules never apply outside its own figures. |
| C2 | A pack's `pack.css` other than `base` MUST NOT contain `data-appearance` or `prefers-color-scheme`; appearance MUST be expressed through tokens only. |
| C3 | Pack CSS MUST select markup only through the markup contract: role classes `mkd-<role>`, part classes `mkd-<role>__<part>`, and the `data-*` attributes the renderer emits (R-REND-002, R-REND-003). |
| C4 | Pack CSS MUST write lengths in `px`; it MUST NOT depend on the frame unit being 1px (R-DEV-005). |
| C5 | Pack CSS MUST NOT import fonts, images or other resources from the network, and MUST NOT require JavaScript. |
| C6 | The `base` pack's CSS MUST define the structure of every render role (layout, parts, states) so that a pack without CSS still renders a usable wireframe. |
| V1 | The contract test parses every pack's CSS and fails on an unscoped selector or on appearance branching. |

---

### R-PACK-008 — Shipped packs

The selection answers SRC-2: SwiftUI, Windows with Fluent, the most popular web frameworks — React
through Material UI (its current major version) and Angular through Angular Material — and SAPUI5;
Bootstrap and shadcn/ui are the proposed additions, covering the most common non-Material web
styles. Ant Design, Tailwind Catalyst, IBM Carbon and GitHub Primer followed (ADR-13). The element catalogue of each pack is on the
[Pack catalogue](catalogue.md) page.

The platform packs added in 0.3 widen coverage to Android and the Linux desktops (SRC-4); the retro packs serve enthusiasts and historical documentation (SRC-5); the easter eggs reward readers who reach the end of the documentation.

Release 0.4 adds four web kits from the recommended-next list (Ant Design, Tailwind Catalyst, IBM Carbon, GitHub Primer), the cross-platform .NET toolkit Avalonia UI and five retro systems (NLS, Windows 1.0, NeXTSTEP, Windows 95, Mac OS X Aqua); the retro pages are ordered by year so the section reads as a history of the GUI.

**Realizes.** F-3 · **Decisions.** ADR-13

| | Statement |
|---|---|
| C1 | mockitdown MUST ship these packs: `base` (neutral wireframe, the core vocabulary), `swiftui` (SwiftUI on iOS, iPadOS and macOS), `fluent` (Fluent 2 · WinUI 3), `mui` (Material UI v9, React), `angular-material` (Angular Material), `sapui5` (SAPUI5 with the Fiori Horizon theme), `bootstrap` (Bootstrap 5.3), `shadcn` (shadcn/ui), `antd` (Ant Design 5, React), `tailwind` (Tailwind Catalyst, Tailwind Plus), `carbon` (IBM Carbon 11), `primer` (GitHub Primer), `vuetify` (Vuetify 3, Vue), `prime` (PrimeVue 4 / PrimeNG with the Aura theme), `sketch` (hand-drawn wireframe), `android` (Jetpack Compose Material 3), `gtk` (GTK 4 with libadwaita), `qt` (Qt 6 Widgets, Fusion), `avalonia` (Avalonia UI 11, Fluent theme) and `kde-plasma` (KDE Plasma 6, Breeze). |
| C7 | mockitdown MUST ship the retro packs `nls` (Engelbart's NLS, 1968), `xerox-star` (Xerox Star), `lisa` (Lisa Office System), `mac-classic` (Macintosh System 1–6), `win1` (Windows 1.0), `win2` (Windows 2.x), `gsos` (Apple IIgs GS/OS), `nextstep` (NeXTSTEP), `win31` (Windows 3.1.1), `win95` (Windows 95), `macos9` (Mac OS 9, Platinum), `cde` (Solaris CDE), `aqua` (Mac OS X Aqua), `winxp` (Windows XP, Luna) and `vista` (Windows Vista, Aero), and the hidden easter-egg packs `lcars`, `phosphor` and `hologram` (R-PACK-010, ADR-16). |
| C2 | Every shipped pack other than `base` MUST extend `base` directly or indirectly, declare at least one import module, define light and dark tokens, and choose a default device and per-device chrome that match its platform. |
| C3 | The `swiftui` pack MUST be selected by `import SwiftUI`. |
| C4 | Each framework pack SHOULD define elements for as many of its framework's components as practical, under the framework's own names, with `doc` lines and documented `variants`. |
| C5 | Each framework pack MUST map the framework's style modifiers or properties onto attributes its CSS styles (for example a button style onto `variant`), so that the same core elements take on the framework's variants. |
| C6 | The pack's `framework` and `version` keys MUST name the imitated framework and the version whose design it follows. |
| V1 | `mockitdown packs` lists the framework and retro identifiers but not the hidden ones; the example site has one page per framework and retro pack, the retro pages listed in chronological order, and one hidden page per easter egg (F-14). |

---

### R-PACK-009 — The core vocabulary

The core vocabulary is SwiftUI's own names plus the cross-framework components SwiftUI lacks
(`Card`, `Chip`, `Breadcrumb`, `Table`, `Toast` …). A block written with it renders in every pack —
which is what makes imported component libraries portable (F-4.C6).

**Re-checked at specification 0.10.7.** Its prerequisites were re-checked after the renderer split (#48, #49) and the gallery spec split (#50) without any change to an obligation; neither is this item changed.

**Realizes.** F-3 · **Decisions.** ADR-4

| | Statement |
|---|---|
| C1 | The `base` pack MUST define the core vocabulary inherited by every pack: layout (`VStack`, `HStack`, `ZStack`, `LazyVStack`, `LazyHStack`, `Grid`, `GridRow`, `LazyVGrid`, `LazyHGrid`, `ScrollView`, `Group`, `Spacer`, `Divider`), shapes and colour (`Rectangle`, `RoundedRectangle`, `Circle`, `Capsule`, `Ellipse`, `Color`), content (`Text`, `Label`, `Image`, `AsyncImage`, `Icon`, `Avatar`, `Badge`, `Chip`, `Tag`, `Link`, `ProgressView`, `Gauge`, `Rating`, `Placeholder`, `Chart`), controls (`Button`, `IconButton`, `FloatingActionButton`, `Toggle`, `Checkbox`, `RadioButton`, `RadioGroup`, `TextField`, `SecureField`, `TextEditor`, `SearchField`, `Picker`, `SegmentedControl`, `Slider`, `Stepper`, `DatePicker`, `Calendar`, `Dropzone`), navigation (`NavigationStack`, `NavigationView`, `NavigationSplitView`, `TabView`, `Tab`, `Tabs`, `AppBar`, `Sidebar`, `NavItem`, `Breadcrumb`, `Pagination`, `Steps`), containers (`Card`, `GroupBox`, `Section`, `List`, `Row`, `ListItem`, `NavigationLink`, `LabeledContent`, `Form`, `Table`, `TableRow`, `TableColumn`, `Toolbar`, `ToolbarItem`, `ToolbarItemGroup`, `ControlGroup`, `DisclosureGroup`, `Accordion`) and overlays (`Dialog`, `Alert`, `Sheet`, `Menu`, `MenuItem`, `Tooltip`, `Toast`, `Banner`). |
| C2 | The `base` pack MUST map the SwiftUI style modifiers `buttonStyle`, `listStyle`, `pickerStyle`, `toggleStyle`, `textFieldStyle`, `datePickerStyle`, `tabViewStyle`, `progressViewStyle`, `gaugeStyle`, `menuStyle`, `formStyle`, `groupBoxStyle` and `navigationSplitViewStyle` to the `variant` attribute, `controlSize` to `size`, `buttonBorderShape` to `shape`, `labelStyle` to `labelStyle`, and the generic modifiers `variant`, `size`, `severity`, `state`, `selected`, `disabled`, `badge`, `elevation`, `density`, `expanded`, `open` and `color` to the attribute of the same name. |
| C3 | The `base` pack MUST declare the modules `Wireframe` and `Mockitdown`, default to the `desktop` device and draw no chrome. |
| V1 | `mockitdown elements base` lists exactly the 90 core elements. |

---

### R-PACK-010 — Hidden packs

Easter-egg packs reward readers of the documentation without cluttering the lists of real frameworks.

| | Statement |
|---|---|
| C1 | A pack MAY declare `"hidden": true`; a hidden pack MUST work wherever it is named (fence `pack=`, `import`) and MUST be left out of `mockitdown packs` (unless `--all`) and of the generated catalogue. |
| V1 | `mockitdown packs` does not list `lcars`; `pack="lcars"` renders. |

---

### R-PACK-011 — Argument aliases

Frameworks spell the same idea differently (`PlaceholderText`, `placeholder`, `hint`); aliases let each pack accept its own framework's names.

**As built (issue #8).** A pack's `params` name a framework's own argument (`Dialog(header:)` in
PrimeVue, `Toast(summary:)`), and its `attrs` map that name onto the attribute the render role reads.
Until 0.8.1 the map was applied to labelled arguments only, so `Dialog("Edit")` in `prime` lost its
title; 26 elements in eight packs were affected.

**R-PACK-011.TC-1 — Positional arguments take the parameter's alias**

Python (`test_fit.py`) and TypeScript (`render.test.ts`): in `prime`, whose `Dialog` has the parameter `header` mapped to `title`, `Dialog("Edit")` and `Dialog(header: "Edit")` render the same HTML, a dialog titled Edit.

| | Statement |
|---|---|
| C1 | A pack MAY map argument labels onto attribute names with `attrs` (pack-wide) and an element MAY do so with its own `attrs`; the evaluator MUST apply the element map, then the pack map, to labelled arguments and to labelled trailing closures. |
| C2 | A colour value naming no known colour MUST resolve to the pack token of the same name in kebab case (`.primaryContainer` → `var(--mkd-primary-container)`). |
| V1 | In a pack mapping `placeholderText` to `placeholder`, `TextBox(placeholderText: "x")` shows the placeholder x. |
| C3 | The evaluator MUST apply the same maps to the parameter name that receives a positional argument, so that a positional argument and the same argument labelled with its parameter's name set the same attribute. |

---

### R-PACK-012 — Pack reference gallery and site sections

The demo pages show packs at work in realistic screens; the Reference pages answer the narrower question
"what can I write in this pack, and what does it look like?". They are generated, never hand-written, so
they cannot drift from `pack.json`: the test suite regenerates them in memory and compares.

The documentation (docs branch) and the example site (main branch) remain two Zensical builds published
side by side (`/` and `/demos/`); identical header tabs make them read as one site. The Reference section
lives in the example site because it is generated from code and needs every pack's CSS.

The pack gallery of the web components (R-WEB-004) is published beside them at `/gallery/` and has its
own header tab, Gallery, next to Demo on both sites (SRC-17).

**R-PACK-012.TC-1 — Header tabs of both sites**

Python test (`test_site_nav.py`): the top-level `nav` entries of `python/examples/site/mkdocs.yml` are
Demo, Gallery, Definition, Specification, Implementation and Reference in that order, Gallery being the
absolute URL `https://bbogovich.github.io/mockitdown/gallery/`, with `navigation.tabs` and
`navigation.tabs.sticky` enabled. The published-site test of the Pages workflow (R-WEB-004.TC-9, step 5)
checks the same six tabs, in order, in the built pages of both sites.

**Realizes.** F-14

| | Statement |
|---|---|
| C1 | The example site MUST have a Reference section with an overview page and one page per shipped, non-hidden pack, generated by `tools/gen_reference.py` from the pack definitions; `base` is listed as Core. |
| C2 | Each Reference page MUST list every element the pack offers — its own elements first, then the inherited core vocabulary — each with its role, positional arguments, defaults, variants and `doc` line, and a mockup rendering it in the pack's style with its source. |
| C3 | The sample of an element MUST render without any diagnostic; unless the element declares a sample (R-PACK-013.C2), the generator MUST simplify a sample (fewer arguments, no children) until it does, falling back to the bare call. |
| C4 | A pack's own elements that declare variants SHOULD be shown once per variant (at most eight) in one mockup. |
| C5 | The generator MUST also maintain the Reference block of the example site's navigation, between the `>>> reference nav` and `<<< reference nav` markers of `mkdocs.yml`, grouping packs as Core, Wireframe (alternative looks of the core vocabulary, such as `sketch`), Desktop, Web, Mobile and Retro — a framework pack is Web when its default device uses browser chrome, Mobile when its default device is a phone or tablet, Desktop otherwise — the retro packs in chronological order; the Demo menu of the example site MUST use the same groups. |
| C8 | Both sites MUST keep the header tabs visible at every window width and while scrolling (`navigation.tabs.sticky`, and a stylesheet overriding the theme's narrow-screen rule that moves the tabs into the drawer). |
| C6 | Both published sites (documentation and example site) MUST enable header tabs and list the same six top-level sections in the order Demo, Gallery, Definition, Specification, Implementation, Reference; a section built elsewhere (by the other site, or the pack gallery at `/gallery/`, R-WEB-004.C27) is a link to its published URL. |
| C7 | The site root MUST redirect to the Demo section. |
| V1 | `python tools/gen_reference.py --check` fails, and with it the test suite, when a Reference page or the nav block differs from what the pack definitions generate. |

---

### R-PACK-013 — Element samples

**Requires:** R-PACK-012

Generated samples (`Picker("Label")`, a lone `Tab`, charts with one-dimensional `values:`) said
nothing about the element (SRC-9). Packs now name a sample where the generic one is empty.

A sample is mockitdown source, written in the pack's own vocabulary, for example the `base` picker:

```
Picker("Size", selection: "Medium") { Text("Small"); Text("Medium"); Text("Large") }
```

The generator takes a declared sample verbatim, so a mistake in it is reported (pack, element and the
diagnostics) rather than quietly simplified away. An element with variants is shown once per variant by
appending `.variant("…")` to its sample, which is why such a sample must be a call of the element itself;
a `Tab`, which has none, may instead be shown inside a `TabView`.

Samples declared by `base` travel with the core vocabulary into every pack, so they are checked in every
pack's style. For the many framework elements that declare none, the generic sample gives the content
their role needs — options and a selection for pickers, a date for date pickers, a `TabView` around a
tab — so that only elements whose job the generic sample cannot show need a declaration.

Checked at 0.10.1 after R-PACK-012.CR-4 (six header tabs, C6): that change concerns the site sections, not samples, so C1 to C8 are unchanged.

**R-PACK-013.TC-1 — Declared samples**

Python unit test of `gen_reference`: a declared sample is used verbatim; a declared sample with a diagnostic fails naming pack and element; `--check` passes on the shipped packs.

Also: a declared sample of an element with variants that is not a call of the element fails; the variants sample is the declared sample with `.variant("…")`; every pack's reference JSON shows pickers, radio groups, segmented controls, tabs, date pickers and charts with content (IT-18, `python/tests/test_samples.py`).

**R-PACK-013.TC-2 — Base samples carry content**

Python test over `shared/reference/base.json`: the listed elements' samples contain the required arguments; browser gallery test asserts each chart sample draws at least one mark.

IT-18: `python/tests/test_samples.py` (`BaseSampleTests`, every chart sample rendered with at least one mark) and `typescript/tests/browser/gallery-render.spec.mjs` ("R-PACK-013 TC-2").

**Realizes.** F-18, F-14

| | Statement |
|---|---|
| C1 | An element definition in `pack.json` MAY declare `sample`: mockitdown source of one call in the pack's vocabulary, showing the element doing its job. |
| C2 | `tools/gen_reference.py` MUST use a declared `sample` as the element's sample and build its variants sample from it; it MUST fail, naming the pack and element, when a declared sample renders with a diagnostic, instead of simplifying it. |
| C3 | The `base` pack MUST declare samples that give: charts data suited to their kind (`points:` for scatter, bubble and candlestick, `matrix:` with labels for heatmaps, `labels:` for categorical kinds); presentations (Alert, Dialog, Sheet, Popover, ConfirmationDialog, Toast) a title, a message or content and actions; `Picker` three options and a selection; `Tab` a place inside a `TabView`; `NavigationSplitView` a sidebar list and a detail; `Tooltip` an anchor button; `MessageBubble` a sentence of at least 15 words; `DatePicker` a selection. |
| C4 | Every framework pack MUST declare samples for its own elements whose generic sample would be empty or meaningless (no options, no data, no content); the `swiftui` pack MUST do so for every element of R-PACK-014 and R-PACK-015. |
| C5 | The variants sample MUST keep its variants side by side at their natural size (`HStack(alignment: .top, spacing: 24)`), each captioned; showing them whole relies on R-DEV-008.C1. |
| C6 | When an element with variants declares a `sample`, the sample MUST be a call of that element, and `tools/gen_reference.py` MUST build the variants sample by applying `.variant("…")` to it; otherwise it MUST fail, naming the pack and element. |
| C7 | A declared `sample` MUST be inherited with its element by every pack that extends the declaring pack, and `tools/gen_reference.py` MUST check it in each of those packs as in C2. |
| C8 | Where an element declares no `sample`, the generic sample of `tools/gen_reference.py` MUST give pickers, radio groups and segmented controls three options and a selection (unless a positional argument already gives a list), date pickers a selection, charts values, table rows two cells, and an element of role `tab` a place as one of two tabs inside a `TabView`. |
| V1 | `gen_reference.py --check` passes; a pack whose declared sample emits a diagnostic makes it fail with the pack and element named; the reference JSON of `swiftui` shows `Picker` with three options. |

---

### R-PACK-014 — SwiftUI control styles

**Requires:** R-REND-013, R-PACK-013

Each style must look like the native style it names (SRC-9, F-3.C7). The clauses list the visible
parts that make each style recognisable; colours, sizes and radii come from the pack's tokens, which
follow Apple's iOS 26 and macOS 26 design resources.

As built (#11): the styles are CSS in the `swiftui` pack over role markup that both renderers emit.
Where a style needs parts the generic markup lacks, the renderers draw them for the SwiftUI style names
only: one menu button for a `.compactMenu`/`.menu` control group, the date and time capsules, the
`.wheel` columns and the field stepper of a date picker, the open arc of an `.accessoryCircular` gauge,
the dot of an `.accessoryLinear` gauge and the bounds of any gauge, and the wheel of a picker. A wheel
shows the selection with two neighbours on each side, the way the iOS wheel shows five rows. A text
field keeps its title as its accessible name when its text replaces the placeholder, which is what the
macOS columns form shows as the row's label.

A selected table row wins over the Mac's alternating row stripes: the gallery's Mac example (#15) selects the second, striped row, which used to keep its stripe under white text.

Re-checked at 0.10.3 together with the items it cites or is cited by (specification audit, #51): the citations are still accurate and no obligation changed.

**Re-checked at specification 0.10.6.** A-REND-1 and A-WEB-1 were revised as built by the behaviour-preserving renderer split (#48, #49), and the gallery test cases only renamed their files (#50); no obligation here changed.

**R-PACK-014.TC-1 — SwiftUI control variants**

Python and TypeScript render tests (conformance cases) per element and variant asserting the listed parts (e.g. graphical DatePicker has 7 weekday cells and one selected day; Picker .segmented has one segment per option; Gauge default is a linear track). Implemented as IT-19 (`python/tests/test_swiftui_controls.py` and the `control-*` conformance cases).

**R-PACK-014.TC-M1 — Visual comparison with SwiftUI**

TC-M: open the gallery at `#pack=swiftui`, compare each card with the same control in Xcode previews or Apple's HIG screenshots.

**Realizes.** F-3

| | Statement |
|---|---|
| C1 | `ControlGroup` in the `swiftui` pack MUST render `.automatic` as a joined Liquid Glass capsule of its buttons, `.navigation` as a joined capsule of icon-only buttons, `.palette` as a row of borderless icon buttons, and `.compactMenu` and `.menu` as one button (the group's label and `systemImage:`, or an ellipsis glyph; `.menu` with a trailing chevron) that stands for a menu. |
| C2 | `DatePicker` MUST show a selection even without `selection:` (fixed default 23 Nov 2026, 9:41 AM, for deterministic output); `.automatic`/`.compact` MUST render the label and grey capsules holding the date (`Nov 23, 2026`) and, unless `displayedComponents: .date`, the time; `.graphical` a month calendar (month title with chevrons, weekday initials, a 7-column day grid, the selected day in a filled accent circle) whose width fits its frame; `.wheel` wheel columns with a selection band; `.field` (macOS) a text field `11/23/2026` (followed by `, 9:41 AM` unless `displayedComponents: .date`); `.stepperField` that field with a stepper. |
| C3 | `Form` MUST render `.grouped` — and `.automatic`, its default, on `phone` and `tablet` forms and at `fit` — as inset rounded sections on the grouped background with each row's label leading and control trailing, and `.columns` — and `.automatic` on `desktop` and `wide` forms (R-DEV-010.C5) — as two columns — trailing-aligned labels, leading-aligned controls — without section backgrounds. |
| C4 | `Gauge` MUST default to `.automatic` (a linear track with the value filled and its current value, minimum and maximum labels, each label shown when the gauge gives it), render `.accessoryCircular` as an open 240° ring with the current value in its centre, `.accessoryCircularCapacity` as a closed ring filled to the value with the value in its centre, `.accessoryLinear` as a thin track with a dot marker at the value, `.accessoryLinearCapacity` as a thicker capsule filled to the value, and `.linearCapacity` as a full-width capsule filled to the value with the label above. |
| C5 | `List` MUST render `.insetGrouped` as rounded sections inset 16 points on the grouped background, `.grouped` as full-width sections on the grouped background, `.inset` as rounded inset rows on the plain background, `.plain` as full-width rows with separators inset 16 points, `.sidebar` as a source list (section headers, rows with icons, the selected row an accent-tinted rounded highlight; translucent on macOS), and `.bordered` (macOS) as a bordered box with alternating row backgrounds. |
| C6 | `Picker` MUST render its options from its children (`Text`, or any view with `.tag`) and mark the `selection:` (default: the first); `.menu`/`.automatic` as the label leading and the selected option with an up-down chevron in the accent colour trailing; `.segmented` as a segmented control of the options; `.inline` as rows with a checkmark on the selected; `.radioGroup` (macOS) as radio buttons; `.wheel` as a wheel with the selection band; `.navigationLink` as a row with the label, the selected option in secondary colour and a chevron; `.palette` as a row of the options with the selected one highlighted. A picker with no options MUST show its label and an empty value, never an empty box. |
| C7 | `Toggle` MUST render `.automatic`/`.switch` as the label leading and a 51 × 31 switch trailing (green when on), `.button` as a capsule button tinted when on, and `.checkbox` (macOS) as a checkbox followed by the label. |
| C8 | `Button` variants MUST each keep their natural width (R-REND-013; the joined capsules of C1 are a deliberate overlap under R-REND-013.C5); `.glass` and `.glassProminent` MUST render as Liquid Glass capsules (translucent, light edge, soft shadow; prominent tinted with the accent). |
| C9 | `displayedComponents: .date` MUST hide a `DatePicker`'s time and `.hourAndMinute` its date; a `selection:` MAY carry a time (`2026-11-23T14:05`), shown in place of 9:41 AM. |
| C10 | `DatePicker` `.wheel` MUST show one column per part — weekday with month and day, hour, minute and AM/PM for a date and time; month, day and year for a date alone; hour, minute and AM/PM for a time alone — each with up to two neighbours either side of the selection. |
| C11 | A `Picker` option MAY be any child with `.tag(…)`; a `selection:` matching a tag MUST select that option and show its content. |
| C12 | `List(selection:)` MUST mark the row whose text or tag equals the selection, and `.sidebar` and `.bordered` MUST draw that row as selected. |
| C13 | In `Form` `.columns`, a filled `TextField` MUST be labelled by its title (the placeholder argument) in the labels column. |
| C14 | A `Table` row marked `.selected()` MUST be drawn with the accent background and white text on every form, also where it falls on an alternating (striped) row of a `desktop` or `wide` form. |
| V1 | Each variant of each element above, built from its declared sample (R-PACK-013.C4), renders at `fit` with its listed parts present (checked by markup assertions) and, in the gallery, without overlapping boxes. |

---

### R-PACK-015 — SwiftUI presentations and navigation

**Requires:** R-DEV-008, R-PACK-013

Presentations and navigation containers are where SwiftUI's look is most distinctive (SRC-9). The
clauses fix the visible structure of each; at `fit` they are drawn whole (R-DEV-008).

SwiftUI writes an alert's and a confirmation dialog's buttons in the closure
(`.alert("Delete?", isPresented: $p) { Button("Delete", role: .destructive) }`), so the `Alert` and
`ConfirmationDialog` elements take their `Button` children as actions (C9); `actions:` still works and
wins when given. Because the dialog role is shared, this holds in every pack whose alert is a dialog, as
do the popover's placeholder anchor (C10) and the one-item tab bar of a lone `Tab` (C11).

As built (#12): the column titles of a split view come from each column's `.navigationTitle`, drawn as a
large title on the sidebar and content columns and inline on the detail; on a desktop the sidebar title
is small and secondary until the macOS floating sidebar of R-DEV-010.C3 replaces it. `.balanced` keeps
the columns side by side as `.automatic` does; `.prominentDetail` floats the sidebar as a glass panel
over the full-width detail. On iPadOS and macOS chrome, a confirmation dialog takes the alert's card.

Re-checked at 0.10.3 together with the items it cites or is cited by (specification audit, #51): the citations are still accurate and no obligation changed.

**Re-checked at specification 0.10.6.** A-REND-1 and A-WEB-1 were revised as built by the behaviour-preserving renderer split (#48, #49), and the gallery test cases only renamed their files (#50); no obligation here changed.

**R-PACK-015.TC-1 — SwiftUI presentations**

Python and TypeScript render tests per element asserting the parts (alert title, message, capsule actions; action-sheet rows and separate cancel; popover arrow; sheet grabber; tab item); browser box checks at `fit`. Button children become actions (C9); a popover alone has its anchor (C10); a lone `Tab` is a one-item bar (C11). Built as IT-20.

**R-PACK-015.TC-2 — SwiftUI navigation containers**

Render tests: TabView variants (content box above the bar box; page dots for `.page`); V1 split view columns and widths; `.prominentDetail` detail spans the frame. Built as IT-20.

**R-PACK-015.TC-M1 — Visual comparison with SwiftUI**

TC-M: compare the gallery cards with Apple's iOS 26 and macOS 26 HIG screenshots.

**Realizes.** F-3

| | Statement |
|---|---|
| C1 | An `Alert` in the `swiftui` pack MUST render as the iOS 26 alert: a centred Liquid Glass card about 300 points wide with large corner radius (`--mkd-radius-alert`, 34 points), bold centred title, centred message, and its actions as capsule buttons — side by side for two, stacked for more — a `.cancel` role in the neutral style and a `.destructive` role in red. |
| C2 | A `ConfirmationDialog` MUST render on a phone as an action sheet at the bottom — a Liquid Glass panel with the title in secondary small type, one row per action, the `.cancel` action set apart below — and with `macos` or `ipados` chrome as an alert-style dialog. |
| C3 | A `Popover` MUST render as a rounded Liquid Glass bubble with an arrow pointing at its anchor; alone, the arrow points up at a placeholder anchor above it. |
| C4 | A `Sheet` MUST render from the bottom with rounded top corners, a grabber, its content and the dimmed screen above it (R-DEV-008.C4, C9). |
| C5 | A `Tab` alone MUST render as one item of a tab bar (icon over label, selected tint) inside the tab bar capsule; inside a `TabView` it is one of its tabs. |
| C6 | A `TabView` MUST render its selected tab's content above a floating Liquid Glass capsule tab bar with icon-over-label items and a highlight pill on the selected item, and the content MUST NOT extend under the bar at `fit`; `.page` MUST render the content with page indicator dots below it and no tab bar; `.sidebarAdaptable` MUST render as `.automatic` on a phone and as a sidebar list of the tabs on tablet and desktop; `.tabBarOnly` as `.automatic`. |
| C7 | A `NavigationSplitView` MUST take its columns from `sidebar:`/`content:`/`detail:` closures (or, unlabelled, the first child as sidebar and the last as detail, a middle child as content) and render two or three columns: the sidebar (a `.sidebar` list with its own navigation title, 320 points on a tablet and at `fit`, 220 on a desktop), the optional content column, and the detail with its title, separated by hairlines at `fit` and with `ios` chrome; a column's title is the `.navigationTitle` of its content unless the column is a `NavigationStack`, which draws its own bar; `.balanced` MUST share the width between the columns side by side (as `.automatic`) and `.prominentDetail` MUST keep the detail at full width with the sidebar floating over it; with `macos` or `ipados` chrome it MUST follow R-DEV-010.C3 and C6, and on a `phone` form R-DEV-010.C5 (the split view collapsed to its sidebar). |
| C8 | At `fit` with no device, `NavigationSplitView` MUST render at least 640 × 360 points so that its columns are visible. |
| C9 | In every pack, a dialog whose variant is `alert` or `action-sheet` and that has no `actions:` MUST render its `Button` children as its actions, in order and with their roles, and its other children in its body. |
| C10 | In every pack, a dialog of variant `popover` written on its own MUST render a placeholder anchor button above its surface; a pack other than `swiftui` MAY omit the arrow. |
| C11 | In every pack, a `Tab` written outside a `TabView` MUST render as a tab bar with that one tab selected, placed as the pack's `TabView` places its bar. |
| V1 | Each element above renders from its declared sample (R-PACK-013.C4); `NavigationSplitView { List { Label("Inbox", systemImage: "tray") } .navigationTitle("Mail") } detail: { Text("Select a message") }` renders a sidebar column with the title Mail and an Inbox row beside a detail column. |

## Reference: `pack.json`

A complete, minimal site pack that extends Material UI:

```json
{
  "id": "acme",
  "name": "Acme Design System",
  "framework": "Acme DS (Material UI based)",
  "version": "3.2",
  "extends": "mui",
  "modules": ["AcmeUI"],
  "device": "desktop",
  "chrome": {"desktop": "browser", "phone": "android"},
  "tokens": {
    "light": {"accent": "#0b6e4f", "on-accent": "#ffffff", "radius-m": "10px"},
    "dark":  {"accent": "#4fd1a5", "on-accent": "#002116"}
  },
  "elements": {
    "AcmeKpi":   {"role": "card", "params": ["title", "value"], "defaults": {"variant": "kpi"},
                  "doc": "AcmeKpi(\"Revenue\", \"$48k\", status: .success)"},
    "AcmeButton": {"role": "button", "params": ["label"], "variants": ["primary", "ghost"]}
  },
  "modifiers": {"acmeTone": {"attr": "variant"}, "compact": {"attr": "density", "value": "compact"}},
  "fonts": {"display1": "display"},
  "sizes": {"desktop": [1366, 768]},
  "icons": {"acme.logo": "sparkles"}
}
```

| Key | Type | Inherited | Meaning |
|---|---|---|---|
| `id` | string | — | Identifier used by `pack="…"`, `@Screen(pack:)` and the CSS scope `.mkd-pack-<id>`; defaults to the directory name. |
| `name` | string | — | Display name (figure `aria-label`, `mockitdown packs`). |
| `framework`, `version` | string | — | The imitated framework and the design version followed. |
| `extends` | string | — | Parent pack id; default `base` (none for `base`). |
| `modules` | list of strings | no | Names that `import <Module>` accepts (case-insensitive) to select this pack; unique across packs. |
| `device` | string | yes | Default device form when neither fence nor `@Screen` nor site names one. |
| `chrome` | object | merged | Device form → chrome kind (`none`, `ios`, `ipados`, `macos`, `windows`, `android`, `browser`). |
| `tokens` | `{light: {}, dark: {}}` | merged per mode | Token name → CSS value; becomes `--mkd-<name>`. Dark values fall back to light ones. |
| `elements` | object | merged | Element name → `{role, params, defaults, variants, doc}`. |
| `modifiers` | object | merged | Modifier name → `{attr, value?}`: the attribute the modifier sets, and an optional fixed value. |
| `fonts` | object | looked up through the lineage | Font style alias → canonical font style. |
| `sizes` | object | merged | Device form → `[width, height]` in points. |
| `icons` | object | merged | Icon name → built-in glyph name. |

**Element definition keys**: `role` (required; a [render role](../rendering/roles.md)), `params`
(names for positional arguments), `defaults` (attributes applied first), `variants` (documented
`variant` values, shown in the catalogue), `doc` (one usage line).

## Reference: base tokens

Every pack defines at least these token names (R-PACK-006). Values shown are the `base` pack's;
lengths are scaled to the frame unit when the stylesheet is assembled. Canonical font styles each
have `fs-<style>` (size) and `fw-<style>` (weight) tokens.

| Custom property | Light | Dark |
|---|---|---|
| `--mkd-bg` | `#ffffff` | `#16181d` |
| `--mkd-surface` | `#ffffff` | `#1e2128` |
| `--mkd-surface-2` | `#f4f5f7` | `#252932` |
| `--mkd-surface-3` | `#e9ebef` | `#2e333d` |
| `--mkd-fg` | `#1d2129` | `#eceef2` |
| `--mkd-fg-2` | `#5b6270` | `#a7adb9` |
| `--mkd-fg-3` | `#8d93a0` | `#757c8a` |
| `--mkd-border` | `#d5d9e0` | `#3a404c` |
| `--mkd-divider` | `#e4e7ec` | `#2f343e` |
| `--mkd-accent` | `#3b6fd8` | `#6d9bf2` |
| `--mkd-on-accent` | `#ffffff` | `#0b1220` |
| `--mkd-accent-soft` | `#e6eefc` | `#243552` |
| `--mkd-danger` | `#d0342c` | `#f2665f` |
| `--mkd-warning` | `#c77700` | `#f0a43a` |
| `--mkd-success` | `#2e8540` | `#4cc26e` |
| `--mkd-info` | `#2f6fdc` | `#6d9bf2` |
| `--mkd-field-bg` | `#ffffff` | `#1b1e24` |
| `--mkd-field-border` | `#c4c9d2` | `#464c59` |
| `--mkd-scrim` | `rgb(15 18 24 / 0.36)` | `rgb(0 0 0 / 0.55)` |
| `--mkd-shadow-1` | `0 1px 2px rgb(0 0 0 / 0.08)` | `0 1px 2px rgb(0 0 0 / 0.5)` |
| `--mkd-shadow-2` | `0 4px 12px rgb(0 0 0 / 0.12)` | `0 4px 12px rgb(0 0 0 / 0.5)` |
| `--mkd-shadow-3` | `0 12px 32px rgb(0 0 0 / 0.18)` | `0 12px 32px rgb(0 0 0 / 0.6)` |
| `--mkd-radius-s` | `4px` | (light value) |
| `--mkd-radius-m` | `6px` | (light value) |
| `--mkd-radius-l` | `10px` | (light value) |
| `--mkd-radius-xl` | `16px` | (light value) |
| `--mkd-radius-pill` | `999px` | (light value) |
| `--mkd-font` | `system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif` | (light value) |
| `--mkd-font-mono` | `ui-monospace, "SF Mono", Menlo, Consolas, monospace` | (light value) |
| `--mkd-font-size` | `14px` | (light value) |
| `--mkd-line-height` | `1.4` | (light value) |
| `--mkd-icon-stroke` | `1.75` | (light value) |
| `--mkd-icon-size` | `18px` | (light value) |
| `--mkd-control-h` | `34px` | (light value) |
| `--mkd-gap` | `8px` | (light value) |
| `--mkd-pad` | `12px` | (light value) |
| `--mkd-chrome-bg` | `#eceef1` | `#23262d` |
| `--mkd-chrome-fg` | `#1d2129` | `#eceef2` |
| `--mkd-fs-display` | `40px` | (light value) |
| `--mkd-fw-display` | `700` | (light value) |
| `--mkd-fs-largeTitle` | `32px` | (light value) |
| `--mkd-fw-largeTitle` | `700` | (light value) |
| `--mkd-fs-title` | `26px` | (light value) |
| `--mkd-fw-title` | `700` | (light value) |
| `--mkd-fs-title2` | `22px` | (light value) |
| `--mkd-fw-title2` | `700` | (light value) |
| `--mkd-fs-title3` | `19px` | (light value) |
| `--mkd-fw-title3` | `600` | (light value) |
| `--mkd-fs-headline` | `15px` | (light value) |
| `--mkd-fw-headline` | `600` | (light value) |
| `--mkd-fs-subheadline` | `14px` | (light value) |
| `--mkd-fw-subheadline` | `400` | (light value) |
| `--mkd-fs-body` | `14px` | (light value) |
| `--mkd-fw-body` | `400` | (light value) |
| `--mkd-fs-callout` | `14px` | (light value) |
| `--mkd-fw-callout` | `400` | (light value) |
| `--mkd-fs-footnote` | `12px` | (light value) |
| `--mkd-fw-footnote` | `400` | (light value) |
| `--mkd-fs-caption` | `11px` | (light value) |
| `--mkd-fw-caption` | `400` | (light value) |
| `--mkd-fs-caption2` | `10px` | (light value) |
| `--mkd-fw-caption2` | `400` | (light value) |
| `--mkd-fs-overline` | `11px` | (light value) |
| `--mkd-fw-overline` | `600` | (light value) |
| `--mkd-color-red` | `#e5484d` | (light value) |
| `--mkd-color-orange` | `#f76b15` | (light value) |
| `--mkd-color-yellow` | `#f5c400` | (light value) |
| `--mkd-color-green` | `#30a46c` | (light value) |
| `--mkd-color-mint` | `#3dd6b5` | (light value) |
| `--mkd-color-teal` | `#12a594` | (light value) |
| `--mkd-color-cyan` | `#05a2c2` | (light value) |
| `--mkd-color-blue` | `#0090ff` | (light value) |
| `--mkd-color-indigo` | `#3e63dd` | (light value) |
| `--mkd-color-purple` | `#8e4ec6` | (light value) |
| `--mkd-color-pink` | `#d6409f` | (light value) |
| `--mkd-color-brown` | `#ad7f58` | (light value) |
| `--mkd-color-gray` | `#8b8d98` | (light value) |
| `--mkd-chart-1` | `#3b6fd8` | (light value) |
| `--mkd-chart-2` | `#30a46c` | (light value) |
| `--mkd-chart-3` | `#f76b15` | (light value) |
| `--mkd-chart-4` | `#8e4ec6` | (light value) |
| `--mkd-chart-5` | `#e5484d` | (light value) |
| `--mkd-chart-6` | `#12a594` | (light value) |

## Revision history

| Version | Date | Change |
|---|---|---|
| 0.10.8 | 2026-11-27 | re-checked after the renderer split: unaffected (#53) |
| 0.10.7 | 2026-11-27 | re-checked after the renderer split and the gallery spec split: unaffected (#53) |
| 0.10.6 | 2026-11-27 | test cases name the split gallery specs (#50) (#53) |
| 0.10.3 | 2026-11-26 | re-stamped with the items it cites after the audit's prose clarifications; no obligation changes (audit #51) |
| 0.10.2 | 2026-11-26 | checked against the changed item it cites; no obligation changes (audit #51) |
| 0.10.0 | 2026-11-26 | six header tabs with Gallery next to Demo (SRC-17): C6, TC-1 (ING-1) |
| 0.8.13 | 2026-11-25 | as built: a selected Table row is accent with white text also on a striped desktop row (C14, #15) |
| 0.8.9 | 2026-11-25 | as built: Form .automatic is grouped on phone, tablet and fit and columns on desktop and wide, per R-DEV-010.C5 (#13); as built: on a phone the split view follows R-DEV-010.C5 (collapsed to its sidebar) (#13) |
| 0.8.8 | 2026-11-25 | C7: hairline columns only at fit/iOS; iPadOS and macOS use the floating sidebar (R-DEV-010.C3, C6) — review of #12 |
| 0.8.7 | 2026-11-25 | as built (#12): Button children of alert and action-sheet dialogs are their actions in every pack (C9), a lone popover has a placeholder anchor (C10), a lone Tab is a one-item tab bar (C11); C7 column titles from .navigationTitle, 320 points at fit, .balanced side by side, .prominentDetail floating sidebar |
| 0.8.6 | 2026-11-25 | as built: ControlGroup menu label and icon, field time, gauge labels when given; date components and wheel columns, tagged picker options, List selection, columns labels for text fields (C9-C13) |
| 0.8.5 | 2026-11-25 | re-based on R-PACK-013@0.8.4: variants built from declared samples; C3 defers to R-PACK-013.C2 for declared samples (#10); re-based on R-PACK-013@0.8.4: elements rendered from declared samples |
| 0.8.4 | 2026-11-25 | as built: a declared sample of an element with variants is a call of it, varied with .variant (C6); declared samples are inherited and checked in every extending pack (C7); generic samples give pickers, radio groups and segmented controls options and a selection, date pickers a date, charts values, table rows cells and tabs a TabView (C8) (#10) |
| 0.8.2 | 2026-11-25 | re-based on R-REND-013@0.8.1: joined capsules are a deliberate overlap (C5); re-based on R-DEV-008@0.8.1: sheet geometry also per C9 |
| 0.8.1 | 2026-11-25 | as built (#8): the attrs maps also apply to the parameter receiving a positional argument (C3), so Dialog("Edit") in prime keeps its title |
| 0.5.0 | 2026-11-24 | Wireframe group (sketch) between Core and Desktop; Ships the vuetify, prime and sketch packs |
| 0.4.1 | 2026-11-24 | Reference and Demo menus group framework packs as Desktop, Web, Mobile; header tabs stay visible at every width and while scrolling |
| 0.4.0 | 2026-11-24 | Ships the antd, tailwind, carbon and primer packs and the nls, win1, nextstep, win95 and aqua retro packs; retro pages in chronological order; Ships the avalonia pack (Avalonia UI 11, Fluent theme) |
| 0.3.0 | 2026-11-24 | Ships the Android, GTK, Qt and KDE Plasma packs, ten retro packs and three hidden easter-egg packs; New R-PACK-010: Hidden packs |
| 0.2.0 | 2026-11-24 | Page created |
| 0.10.7 | 2026-11-27 | re-checked after the renderer split and the gallery spec split: unaffected (#53) |
| 0.10.6 | 2026-11-27 | test cases name the split gallery specs (#50) (#53) |
| 0.10.3 | 2026-11-26 | re-stamped with the items it cites after the audit's prose clarifications; no obligation changes (audit #51) |
| 0.10.2 | 2026-11-26 | checked against the changed item it cites; no obligation changes (audit #51) |
| 0.10.0 | 2026-11-26 | six header tabs with Gallery next to Demo (SRC-17): C6, TC-1 (ING-1) |
| 0.8.13 | 2026-11-25 | as built: a selected Table row is accent with white text also on a striped desktop row (C14, #15) |
| 0.8.9 | 2026-11-25 | as built: Form .automatic is grouped on phone, tablet and fit and columns on desktop and wide, per R-DEV-010.C5 (#13); as built: on a phone the split view follows R-DEV-010.C5 (collapsed to its sidebar) (#13) |
| 0.8.8 | 2026-11-25 | C7: hairline columns only at fit/iOS; iPadOS and macOS use the floating sidebar (R-DEV-010.C3, C6) — review of #12 |
| 0.8.7 | 2026-11-25 | as built (#12): Button children of alert and action-sheet dialogs are their actions in every pack (C9), a lone popover has a placeholder anchor (C10), a lone Tab is a one-item tab bar (C11); C7 column titles from .navigationTitle, 320 points at fit, .balanced side by side, .prominentDetail floating sidebar |
| 0.8.6 | 2026-11-25 | as built: ControlGroup menu label and icon, field time, gauge labels when given; date components and wheel columns, tagged picker options, List selection, columns labels for text fields (C9-C13) |
| 0.8.5 | 2026-11-25 | re-based on R-PACK-013@0.8.4: variants built from declared samples; C3 defers to R-PACK-013.C2 for declared samples (#10); re-based on R-PACK-013@0.8.4: elements rendered from declared samples |
| 0.8.4 | 2026-11-25 | as built: a declared sample of an element with variants is a call of it, varied with .variant (C6); declared samples are inherited and checked in every extending pack (C7); generic samples give pickers, radio groups and segmented controls options and a selection, date pickers a date, charts values, table rows cells and tabs a TabView (C8) (#10) |
| 0.8.2 | 2026-11-25 | re-based on R-REND-013@0.8.1: joined capsules are a deliberate overlap (C5); re-based on R-DEV-008@0.8.1: sheet geometry also per C9 |
| 0.8.1 | 2026-11-25 | as built (#8): the attrs maps also apply to the parameter receiving a positional argument (C3), so Dialog("Edit") in prime keeps its title |
| 0.5.0 | 2026-11-24 | Wireframe group (sketch) between Core and Desktop; Ships the vuetify, prime and sketch packs |
| 0.4.1 | 2026-11-24 | Reference and Demo menus group framework packs as Desktop, Web, Mobile; header tabs stay visible at every width and while scrolling |
| 0.4.0 | 2026-11-24 | Ships the antd, tailwind, carbon and primer packs and the nls, win1, nextstep, win95 and aqua retro packs; retro pages in chronological order; Ships the avalonia pack (Avalonia UI 11, Fluent theme) |
| 0.3.0 | 2026-11-24 | Ships the Android, GTK, Qt and KDE Plasma packs, ten retro packs and three hidden easter-egg packs; New R-PACK-010: Hidden packs |
| 0.2.0 | 2026-11-24 | Page created |
