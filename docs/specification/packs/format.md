---
title: "Pack format"
spec_version: 0.4.1
status: draft
updated: 2026-11-24
page_id: PACK.1
---

# Pack format

What a design pack is, how packs are found, inherited and selected, and the rules their tokens and CSS follow. The reference for every `pack.json` key follows the requirements.

### R-PACK-001 — Pack directory layout and lookup

Packs are plain files so that a site can add or replace one without code (ADR-4). Because the
site's directories are searched first, a site can also override a shipped pack by reusing its
identifier.

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
| C1 | mockitdown MUST ship these packs: `base` (neutral wireframe, the core vocabulary), `swiftui` (SwiftUI on iOS, iPadOS and macOS), `fluent` (Fluent 2 · WinUI 3), `mui` (Material UI v9, React), `angular-material` (Angular Material), `sapui5` (SAPUI5 with the Fiori Horizon theme), `bootstrap` (Bootstrap 5.3), `shadcn` (shadcn/ui), `antd` (Ant Design 5, React), `tailwind` (Tailwind Catalyst, Tailwind Plus), `carbon` (IBM Carbon 11), `primer` (GitHub Primer), `android` (Jetpack Compose Material 3), `gtk` (GTK 4 with libadwaita), `qt` (Qt 6 Widgets, Fusion), `avalonia` (Avalonia UI 11, Fluent theme) and `kde-plasma` (KDE Plasma 6, Breeze). |
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

| | Statement |
|---|---|
| C1 | A pack MAY map argument labels onto attribute names with `attrs` (pack-wide) and an element MAY do so with its own `attrs`; the evaluator MUST apply the element map, then the pack map, to labelled arguments and to labelled trailing closures. |
| C2 | A colour value naming no known colour MUST resolve to the pack token of the same name in kebab case (`.primaryContainer` → `var(--mkd-primary-container)`). |
| V1 | In a pack mapping `placeholderText` to `placeholder`, `TextBox(placeholderText: "x")` shows the placeholder x. |

---

### R-PACK-012 — Pack reference gallery and site sections

The demo pages show packs at work in realistic screens; the Reference pages answer the narrower question
"what can I write in this pack, and what does it look like?". They are generated, never hand-written, so
they cannot drift from `pack.json`: the test suite regenerates them in memory and compares.

The documentation (docs branch) and the example site (main branch) remain two Zensical builds published
side by side (`/` and `/demos/`); identical header tabs make them read as one site. The Reference section
lives in the example site because it is generated from code and needs every pack's CSS.

**Realizes.** F-14

| | Statement |
|---|---|
| C1 | The example site MUST have a Reference section with an overview page and one page per shipped, non-hidden pack, generated by `tools/gen_reference.py` from the pack definitions; `base` is listed as Core. |
| C2 | Each Reference page MUST list every element the pack offers — its own elements first, then the inherited core vocabulary — each with its role, positional arguments, defaults, variants and `doc` line, and a mockup rendering it in the pack's style with its source. |
| C3 | The sample of an element MUST render without any diagnostic; the generator MUST simplify a sample (fewer arguments, no children) until it does, falling back to the bare call. |
| C4 | A pack's own elements that declare variants SHOULD be shown once per variant (at most eight) in one mockup. |
| C5 | The generator MUST also maintain the Reference block of the example site's navigation, between the `>>> reference nav` and `<<< reference nav` markers of `mkdocs.yml`, grouping packs as Core, Desktop, Web, Mobile and Retro — a framework pack is Web when its default device uses browser chrome, Mobile when its default device is a phone or tablet, Desktop otherwise — the retro packs in chronological order; the Demo menu of the example site MUST use the same groups. |
| C8 | Both sites MUST keep the header tabs visible at every window width and while scrolling (`navigation.tabs.sticky`, and a stylesheet overriding the theme's narrow-screen rule that moves the tabs into the drawer). |
| C6 | Both published sites (documentation and example site) MUST enable header tabs and list the same five top-level sections in the order Demo, Definition, Specification, Implementation, Reference; a section built by the other site is a link to its published URL. |
| C7 | The site root MUST redirect to the Demo section. |
| V1 | `python tools/gen_reference.py --check` fails, and with it the test suite, when a Reference page or the nav block differs from what the pack definitions generate. |

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
| 0.4.1 | 2026-11-24 | Reference and Demo menus group framework packs as Desktop, Web, Mobile; header tabs stay visible at every width and while scrolling |
| 0.4.0 | 2026-11-24 | Ships the antd, tailwind, carbon and primer packs and the nls, win1, nextstep, win95 and aqua retro packs; retro pages in chronological order; Ships the avalonia pack (Avalonia UI 11, Fluent theme) |
| 0.3.0 | 2026-11-24 | Ships the Android, GTK, Qt and KDE Plasma packs, ten retro packs and three hidden easter-egg packs; New R-PACK-010: Hidden packs; New R-PACK-011: Argument aliases |
| 0.2.0 | 2026-11-24 | Page created |
| 0.4.0 | 2026-11-24 | Ships the antd, tailwind, carbon and primer packs and the nls, win1, nextstep, win95 and aqua retro packs; retro pages in chronological order; Ships the avalonia pack (Avalonia UI 11, Fluent theme) |
| 0.3.0 | 2026-11-24 | Ships the Android, GTK, Qt and KDE Plasma packs, ten retro packs and three hidden easter-egg packs; New R-PACK-010: Hidden packs; New R-PACK-011: Argument aliases |
| 0.2.0 | 2026-11-24 | Page created |
