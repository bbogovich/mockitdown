---
title: "Rendering: markup"
spec_version: 0.7.0
status: draft
updated: 2026-11-25
page_id: REND.1
---

# Rendering: markup

The HTML a mockup renders to: the figure, role markup, attributes, modifier styles, text, safety, determinism, placeholders, presentations and the Elements table. Each role's parts and attributes are in the [Role catalogue](roles.md); what pack authors may rely on is summarised in the [Markup and CSS contract](css-contract.md).

### R-REND-001 — Figure structure

The figure is the stable outer contract: documentation themes, tests and pack CSS rely on these
classes. The markup is described in full, with an annotated example, on the [Markup](markup.md)
page and in the [Markup and CSS contract](css-contract.md).

**Realizes.** F-8, F-9, F-10 · **Decisions.** ADR-1

| | Statement |
|---|---|
| C1 | The figure assembler MUST render a mockup as one `div.mkd-figure.mkd-pack-<id>` with `role="figure"`, an `aria-label` (the title, else the id, else "<pack name> mockup"), and `data-pack`, `data-device` and `data-appearance` attributes. |
| C2 | The figure MUST contain one `div.mkd-stage` with `data-count` equal to its number of cells, and one `div.mkd-cell` per rendered appearance (one, or two for `both`). |
| C3 | Each cell MUST contain one `div.mkd-frame` with `data-appearance` (`light`, `dark` or `auto`), `data-device` and `data-chrome`, and either `style="--mkd-w:<width>;--mkd-h:<height>"` in logical points or `data-fit="true"`. |
| C4 | Each frame MUST contain, in order, the top chrome (if any), one `div.mkd-screen` holding the rendered views followed by the presentation layers, and the bottom chrome (if any). |
| C5 | When the appearance is `both`, each cell MUST end with a `div.mkd-cell__label` reading `Light` or `Dark`. |
| C6 | When captions are enabled and the mockup has an id or a title, the figure MUST contain `div.mkd-caption` reading `<id> · <title>` (or whichever of the two exists). |
| C7 | The title MUST come from the `title` option, else `@Screen`'s title; the id from the `id` option, else `@Screen(id:)`. |
| V1 | Rendering `Text("x")` with `appearance="both" title="T" id="S"` yields a figure with two cells, two frames with `data-appearance` light and dark, two cell labels and the caption `S · T`. |

---

### R-REND-002 — Role markup

One markup for all packs is what makes packs data: a pack never generates HTML, it only restyles
the roles. The [Role catalogue](roles.md) lists each role with the attributes it reads.

**Realizes.** F-3, F-8 · **Decisions.** ADR-4

| | Statement |
|---|---|
| C1 | The renderer MUST render every view through its element's render role, and every role MUST produce a root element with the class `mkd-<role>`. |
| C2 | The renderer MUST give each role's root element `data-el` set to the element name as written (`Button`, `InfoBar`), and `data-component` set to the component name when the view is the root of a struct's body. |
| C3 | The renderer MUST name a role's inner parts with BEM classes `mkd-<role>__<part>` (and, where a part has a variant, `mkd-<role>--<modifier>`), and these class names MUST be the same for every pack. |
| C4 | The renderer MUST append the classes given by `.class(…)` to the root element. |
| C5 | The set of roles and the parts and attributes each role emits MUST be as listed in the role catalogue; adding a role or a part is a change to this specification. |
| V1 | `Button("Save")` renders `<span class="mkd-button" data-el="Button" role="button">` with a `mkd-button__label` part in every pack. |

---

### R-REND-003 — Attributes on the markup

Pack CSS keys on these attributes — `.mkd-pack-fluent .mkd-button[data-variant="accent"]` — which
is how one element takes on a framework's variants, sizes and states. The allow-list pattern keeps
arbitrary text out of attribute selectors.

**Realizes.** F-3, F-6, F-8

| | Statement |
|---|---|
| C1 | The renderer MUST copy the view attributes `variant`, `size`, `color`, `shape`, `density`, `elevation`, `placement`, `orientation`, `emphasis`, `design`, `severity`, `kind`, `labelStyle`, `position`, `appearance` and `level` to `data-<name>` on the root element when the value is a string, number, boolean or enum value whose text matches `^[A-Za-z0-9_. -]{1,40}$`; booleans MUST be written `true`/`false` and enum values by name. |
| C2 | The renderer MUST set `data-state` to the `state` attribute's name; when `disabled` is truthy it MUST set `data-state="disabled"`, and otherwise when `error` is set and not false or empty and no state was given, `data-state="error"`. |
| C3 | When `selected` is truthy, the renderer MUST set `data-selected="true"`. |
| C4 | The renderer MUST set `data-mkd-id` from `.id(x)`, `data-ref` from `.ref(a, b, …)` (space-separated) and `title` from `.help(x)`. |
| C5 | A role MAY add role-specific `data-*` attributes; each MUST be listed in the role catalogue. |
| V1 | `Button("Delete").buttonStyle(.bordered).disabled(true).id("del")` renders `data-variant="bordered" data-state="disabled" data-mkd-id="del"`. |

---

### R-REND-004 — Modifier rendering

Modifiers are how SwiftUI code says "16 points of padding, title font, secondary colour". The style
builder turns them into inline CSS that uses the same frame unit and tokens as the packs, so the
result stays in proportion and follows light and dark mode.

**R-REND-004.TC-1 — Modifiers become style and data**

Automated by `tests/test_render.py::EvaluateRenderTests::test_modifiers_become_style_and_data`.

**Realizes.** F-2, F-8 · **Decisions.** ADR-7

| | Statement |
|---|---|
| C1 | The style builder MUST translate the rendered layout modifiers into inline styles: `padding` (default 16 points, with edge sets such as `.horizontal`), `frame` (width, height, min/max sizes, `.infinity`, alignment), `offset` and `zIndex`. |
| C2 | The style builder MUST express every length it emits as `calc(N * var(--u))` with N rounded to two decimals (`0` for zero), so inline lengths scale with the frame (R-DEV-004). |
| C3 | The style builder MUST translate typography modifiers: `font` to `data-font` set to a canonical font style (`display`, `largeTitle`, `title`, `title2`, `title3`, `headline`, `subheadline`, `body`, `callout`, `footnote`, `caption`, `caption2`, `overline`) or to an explicit size and weight for `.system(size:weight:)`; `fontWeight`, `bold`, `italic`, `underline`, `strikethrough`, `monospaced`, `fontDesign`, `multilineTextAlignment`, `textCase` and `lineLimit` to the corresponding CSS. |
| C4 | The style builder MUST resolve a font style name through the pack's `fonts` aliases, then the built-in aliases (for example `h4` → `title2`, `body2` → `callout`, `titleMedium` → `headline`). |
| C5 | The style builder MUST translate `foregroundStyle`, `foregroundColor`, `background`, `tint`, `accentColor`, `fill` and `stroke` to colours, `opacity`, `cornerRadius`, `clipShape`, `shadow` and `border` to the corresponding CSS, and `hidden` to `visibility: hidden`. |
| C6 | The style builder MUST accept as colours only: the named colours (`red`, `orange`, `yellow`, `green`, `mint`, `teal`, `cyan`, `blue`, `indigo`, `purple`, `pink`, `brown`, `gray`/`grey`) as their tokens; the semantic colours (`primary`, `secondary`, `tertiary`, `accentColor`, `tint`, `background`, `surface`, `danger`, `error`, `destructive`, `success`, `warning`, `info`, `separator`, `white`, `black`, `clear`, …) as their tokens or values; materials (`ultraThinMaterial` … `bar`); hex colours of 3, 4, 6 or 8 digits; `rgb()`/`rgba()`/`hsl()`/`hsla()` with numeric arguments; and `Color(red:green:blue:)`, `Color(hex:)` or `Color("<accepted colour>")`, each optionally with an opacity. |
| C7 | If a colour value is not accepted, then the style builder MUST emit no style for it. |
| C8 | The style builder MUST validate each `.class(…)` name against `[A-Za-z_][A-Za-z0-9_-]*` and warn "invalid class name" with code `modifier` for any other. |
| C9 | The renderer MUST wrap a view with `.overlay(alignment:) { … }` content in `div.mkd-overlay-host` with the view in `__base` and the content in `__layer[data-align]`, and with `.background { … }` content in `__under` beneath `__base`. |
| V1 | `.padding().frame(width: 200).foregroundStyle(.red)` yields `padding: calc(16 * var(--u))` on four sides, `width: calc(200 * var(--u))` and a colour referencing `--mkd-color-red`; `.foregroundStyle("url(x)")` yields no colour. |

---

### R-REND-005 — Text content and inline Markdown

SwiftUI's `Text` supports a small Markdown subset; mockitdown supports the same everywhere text is
shown. Links never navigate — the mockup is a picture.

**R-REND-005.TC-1 — Text is escaped**

Automated by `tests/test_render.py::EvaluateRenderTests::test_text_is_escaped`.

**Realizes.** F-8

| | Statement |
|---|---|
| C1 | The renderer MUST HTML-escape all text content before applying inline formatting. |
| C2 | The renderer MUST render, in `Text` and every other text attribute shown as text, `**x**` as `<strong>`, `*x*` as `<em>`, `` `x` `` as `<code class="mkd-code">`, `~~x~~` as `<s>`, and `[label](url)` as `<span class="mkd-link" role="link">label</span>` without the URL. |
| C3 | The renderer MUST render line feeds in text as `<br>`. |
| C4 | An attribute that may hold text or views (for example a `label:` given as `Label(…)`) MUST render the views when it holds views and the formatted text otherwise. |
| V1 | `Text("Version **2.4** adds *offline* `sync` [docs](https://x)")` renders strong, em, code and a non-navigating link span; `Text("a <b>")` renders `a &lt;b&gt;`. |

---

### R-REND-006 — Output safety

Documentation sites render untrusted contributions in pull-request previews; a mockup must not be
a way to inject script or style. Every path from source text to HTML goes through escaping or an
allow-list.

**Realizes.** F-8 · **Decisions.** ADR-5

| | Statement |
|---|---|
| C1 | The renderer MUST HTML-escape (including quotes) every value it writes into an attribute or text node. |
| C2 | The renderer MUST NOT emit `<script>`, event-handler attributes, `<iframe>`, `<object>`, `<form>` or navigating links (`<a href>`) in mockup markup. |
| C3 | The renderer MUST NOT write a source value into a `style` attribute unless it is a number converted to a length, an accepted colour (R-REND-004.C6) or a value from a fixed keyword table. |
| C4 | The renderer MUST emit image `src` values only as resolved by the asset resolver (R-ASSET-001). |
| C5 | The figure assembler MUST NOT emit markup from a fence attribute except escaped text (title, id, address) and validated tokens. |
| V1 | A block whose strings contain `<script>`, `"` and `javascript:` renders them as inert text, and an `Image("javascript:alert(1)")` renders a placeholder. |

---

### R-REND-007 — Static, deterministic output

Determinism keeps documentation diffs and caches stable; static markup keeps pages light and lets
them work with instant navigation, where a script-initialised widget would not re-initialise.

**Realizes.** F-8, F-11 · **Decisions.** ADR-5

| | Statement |
|---|---|
| C1 | Rendered mockups MUST be static: controls MUST be non-interactive elements carrying ARIA roles (`button`, `switch`, `checkbox`, `radio`, `textbox`, `link`, …) and MUST NOT require JavaScript. |
| C2 | Rendering the same source with the same options and files MUST produce byte-identical HTML. |
| C3 | The renderer MUST derive any generated value (avatar hue, chart identifiers) from the source content or its order in the mockup, never from time, randomness or memory addresses. |
| C4 | Decorative icons MUST be inline SVG with `aria-hidden="true"` and `focusable="false"`. |
| V1 | Two renderings of every example page are identical; the output contains no `<script>`. |

---

### R-REND-008 — Unknown elements and roles

A placeholder in place shows the author exactly which element is wrong while keeping the rest of
the screen readable.

**Realizes.** F-12

| | Statement |
|---|---|
| C1 | The renderer MUST render an `unknown` view as `div.mkd-unknown[data-el=<name>]` containing `span.mkd-unknown__name` with the name, followed by the view's children. |
| C2 | If an element's role has no renderer, then the renderer MUST report the error of R-PACK-004.C4 and render the view as an unknown view. |
| C3 | The base pack's CSS MUST style unknown views as visibly labelled placeholders that keep the surrounding layout intact. |
| V1 | `HStack { Text("a"); Foo { Text("b") }; Text("c") }` renders three children, the middle one an `mkd-unknown` labelled `Foo` holding `b`. |

---

### R-REND-009 — Presentations and navigation composition

SwiftUI attaches navigation chrome and presentations to the content, not to the container; the
renderer reassembles them the way SwiftUI would draw them, so idiomatic code yields the expected
screen.

**R-REND-009.TC-1 — Navigation, tabs and alerts**

Automated by `tests/test_render.py::EvaluateRenderTests::test_navigation_title_and_toolbar`,
`test_tabview_with_tabitems` and `test_alert_modifier_becomes_overlay`.

**Realizes.** F-2, F-8

| | Statement |
|---|---|
| C1 | When a view carries `.alert`, `.confirmationDialog`, `.sheet`, `.fullScreenCover`, `.popover` or `.inspector` and its `isPresented:` (or `item:`) argument is absent or truthy, the renderer MUST draw the presentation as a `div.mkd-layer[data-kind]` appended to the screen after the views. |
| C2 | An alert MUST render as a `div.mkd-dialog[role=alertdialog]` with the title, the `message:` slot as body and the closure's views as actions, defaulting to one primary `OK` button; a confirmation dialog MUST render the same way with kind `action-sheet`. |
| C3 | A sheet MUST render a scrim, a grabber and the content; a full-screen cover, popover or inspector MUST render the content in `div.mkd-presented` of its kind. |
| C4 | A `NavigationStack` MUST build its navigation bar from its content: the title from the first `.navigationTitle`, the subtitle from `.navigationSubtitle`, the title display mode from `.navigationBarTitleDisplayMode` (default large; inline when there is no title), toolbar items from `.toolbar` grouped by placement, and a search field from `.searchable`. |
| C5 | A `TabView` MUST build its tab bar from its children's `.tabItem { … }` labels or from `Tab(…)` children, and show the selected tab's content. |
| V1 | `NavigationStack { List { … }.navigationTitle("Settings").toolbar { ToolbarItem(placement: .topBarTrailing) { Button("Edit") } } }` renders a bar with a large title and a trailing Edit button; `.alert("Sign out?", isPresented: true) { … } message: { … }` adds an alert layer. |

---

### R-REND-010 — Elements table and source disclosure

The Elements table carries the prototype's traceability idea forward: the ids form a structural
contract that requirement text and tests can cite. The source disclosure is for tutorials and
references, such as the language reference in this specification.

**R-REND-010.TC-1 — Elements table**

Automated by `tests/test_render.py::EvaluateRenderTests::test_elements_table`.

**Realizes.** F-6, F-1

| | Statement |
|---|---|
| C1 | When the `elements` option is on, the figure assembler MUST append `table.mkd-elements` with the columns ID, Element, Component and Refs, one row per view carrying `.id(…)`, in depth-first source order including slot, modifier and presentation content. |
| C2 | When no view carries `.id(…)`, the figure assembler MUST NOT emit the table. |
| C3 | When the `source` option is on, the library API MUST append `details.mkd-source` with the summary `Source` and the block's source, trimmed and escaped, in `pre > code.language-swift`. |
| V1 | A block with `.id("total")` and `.id("place-order").ref("UC-CHK-3")` and `elements="true"` renders a two-row table; the second row's Refs cell is `UC-CHK-3`. |

---

### R-DEV-007 — Additional chrome kinds

Retro systems each drew their own window frame; a generic frame whose parts a pack switches on avoids a chrome kind per system.

**Realizes.** F-10

| | Statement |
|---|---|
| C1 | The chrome kinds MUST include, besides those of R-DEV-004, `gnome` (no title bar: a GNOME app draws its own header bar), `kde` (Breeze title bar), `win31` (Windows 3.1 caption with control-menu box and arrow buttons) and `window`. |
| C2 | The `window` chrome MUST render a generic title bar with a leading group (close, menu buttons), the title, a trailing group (help, minimise, maximise, zoom, collapse, close buttons) and a bottom status strip (grow box), all controls hidden by default, so a pack can show and draw the controls its system had. |
| V1 | A pack whose desktop chrome is `window` renders `.mkd-chrome--window` with its title. |

---

### R-REND-013 — Rows without overlap

A real screen never paints siblings over each other (SRC-9): when a row runs out of room SwiftUI
wraps or truncates its text, and the controls keep their size.

**R-REND-013.TC-1 — No overlapping siblings**

Browser test over every pack's element samples and variants (gallery `renderAll`): for each row container, child bounding boxes pairwise do not intersect (1-pixel tolerance); repeated inside a `device=phone` frame.

**R-REND-013.TC-2 — Message bubble wraps**

Render `MessageBubble` with a long text in every pack: the text's box is inside the bubble's box and the bubble is at most 75% of the container's width.

**Realizes.** F-8

| | Statement |
|---|---|
| C1 | In an `HStack`, toolbar, control group or form row, a child that is not text MUST NOT be laid out narrower than its min-content width. |
| C2 | Text that lacks room in a row MUST wrap within its own box, or truncate with an ellipsis when it has `.lineLimit(1)`; it MUST NOT paint over a sibling. |
| C3 | A labelled control (toggle, picker, stepper, slider, date picker, gauge with label) MUST keep its label and its control in separate, non-overlapping boxes at any width the frame allows. |
| C4 | A message bubble MUST wrap its text inside the bubble, the bubble no wider than 75% of its container and no wider than its text needs. |
| V1 | In every shipped pack, the browser test finds no two intersecting boxes among a row's children for each element sample and variant (at the natural `fit` width and inside a 320-point phone frame), and `MessageBubble` with a 40-word text keeps every line inside the bubble. |

---

### R-REND-014 — Shape framing

SwiftUI fits a circle into its frame and draws an ellipse as an ellipse; neither is ever a capsule (SRC-9, SRC-9#ellipse). The base stylesheet gave circle, ellipse and capsule the same 9999-pixel radius, so every pack drew both as capsules.

**R-REND-014.TC-1 — Circle in a wide frame**

Python and TypeScript render tests plus a browser box check: V1 in every shipped pack (computed `border-radius` of the ellipse is 50%, the circle's box square), and the ellipse, capsule and rounded rectangle cases.

**Realizes.** F-8

| | Statement |
|---|---|
| C1 | A `Circle` given a frame of w × h MUST be drawn as a circle of diameter min(w, h) centred in that frame; the frame MUST keep w × h for layout. |
| C2 | An `Ellipse` MUST fill its frame as a true ellipse (radii half its width and half its height, `border-radius: 50%`), never a capsule, in every pack; a `Capsule` MUST have corner radius half its shorter side; a `RoundedRectangle` MUST use its `cornerRadius`. |
| C3 | A `Circle` without a frame MUST fill the shorter side of the space offered, as a circle. |
| C4 | Packs MUST NOT override the geometry of C1–C3; a pack MAY restyle only fill, stroke and shadow. |
| V1 | In every shipped pack, `Circle().frame(width: 160, height: 96)` renders a 96 × 96 circle centred in a 160 × 96 box, and `Ellipse().frame(width: 160, height: 96)` has border radii of 80 × 48 points (no straight edge). |

## Annotated example

The block

```swift
Button("Save", systemImage: "tray").buttonStyle(.bordered).id("save")
```

rendered with `device="fit" title="Save" id="SCR-1"` produces (indented for reading; icon path
shortened):

```html
<div class="mkd-figure mkd-pack-base" role="figure" aria-label="Save"
     data-pack="base" data-device="fit" data-appearance="light">      <!-- R-REND-001.C1 -->
  <div class="mkd-stage" data-count="1">
    <div class="mkd-cell">
      <div class="mkd-frame" data-appearance="light" data-device="fit"
           data-chrome="none" data-fit="true">                         <!-- R-REND-001.C3 -->
        <div class="mkd-screen">
          <span class="mkd-button" data-el="Button" data-variant="bordered"
                data-mkd-id="save" role="button">                      <!-- R-REND-002, -003 -->
            <span class="mkd-button__icon"><svg class="mkd-icon" viewBox="0 0 24 24"
                  aria-hidden="true" focusable="false">…</svg></span>
            <span class="mkd-button__label">Save</span>
          </span>
        </div>
      </div>
    </div>
  </div>
  <div class="mkd-caption">SCR-1 · Save</div>                         <!-- R-REND-001.C6 -->
</div>
```

`.buttonStyle(.bordered)` became `data-variant="bordered"` through the base pack's modifier map
(R-EVAL-009.C2); the same block in the Fluent pack differs only in `mkd-pack-fluent` and
`data-pack="fluent"` — the Fluent CSS does the rest.

## Revision history

| Version | Date | Change |
|---|---|---|
| 0.7.0 | 2026-11-25 | New R-REND-013: Rows without overlap; New R-REND-014: Shape framing |
| 0.3.0 | 2026-11-24 | New R-DEV-007: Additional chrome kinds |
| 0.2.0 | 2026-11-24 | Page created |
| 0.3.0 | 2026-11-24 | New R-DEV-007: Additional chrome kinds |
| 0.2.0 | 2026-11-24 | Page created |
