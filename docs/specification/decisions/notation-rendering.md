---
title: "Decisions: notation and rendering"
spec_version: 0.10.3
status: draft
updated: 2026-11-26
page_id: ADR.1
---

# Decisions: notation and rendering

The design decisions behind the notation, packs, rendering, appearance and scaling. Decisions ADR-1 – ADR-14 were taken when the prototype (SRC-3) was productized (SRC-2).

#### ADR-1 — HTML and CSS is the only renderer; the SVG renderer is retired

**Context.** The prototype built both renderers over one AST and compared them (SRC-3, ADR-001):
HTML won on fidelity, accessibility, scaled legibility and size; SVG was kept for static export.
Production widens the scope to seven framework packs with light and dark modes.

**Decision.** Only the HTML renderer survives. The SVG renderer's strength — a self-contained
static picture — is delivered by the HTML output itself: no scripts, embedded images, inline CSS
(ADR-5, ADR-8, ADR-9).

**Consequences.** One renderer to maintain; realism is a matter of CSS per pack. A mockup is
printed or exported by the browser like the rest of the page.

**Constrains.** R-REND-001, R-REND-007

| | Statement |
|---|---|
| D1 | mockitdown renders mockups only as HTML with CSS; the prototype's SVG renderer is not carried over. |
| D2 | This supersedes the prototype's ADR-001 decision to keep SVG as a secondary output. |
| O1 | rejected: keep SVG as a secondary renderer — SVG output is box-and-label geometry that cannot meet the "realistic, framework-matched" goal, and a second renderer per role multiplies maintenance across eight packs. |
| O2 | rejected: canvas or raster output — not text, not accessible, not themeable by CSS tokens (already ruled out by the prototype). |
| C1 | Every role, pack and appearance feature is implemented once, in markup and CSS. |
| C2 | Static image export (PDF, print) relies on the browser printing the HTML; there is no image output. |

---

#### ADR-2 — The notation is a declarative subset of Swift and SwiftUI

**Context.** SRC-2 asks for a block structure "similar to SwiftUI view structs" that "follows the
same syntax". The prototype's notation (SRC-3) was brace-delimited but bespoke.

**Decision.** Adopt Swift syntax wholesale for everything declarative, and nothing else: no
functions, initialisers, generics or mutation. Metadata and identifiers become Swift-shaped too
(`@Screen`, `.id()`, `.ref()`).

**Consequences.** The grammar is larger than the prototype's but familiar; the language reference
documents the exact subset, and unsupported Swift fails with a clear syntax error.

Checked at 0.10.1: R-EVAL-011 and R-MDX-004 changed after this decision only by clarifications that dropped known-deviation notes (0.2.1); the decision stands.

**Constrains.** R-LANG-001, R-LANG-003, R-LANG-004, R-EVAL-010, R-EVAL-011

| | Statement |
|---|---|
| D1 | The mockup notation is a declarative subset of Swift/SwiftUI: `import`, `struct` views with properties and `body`, element calls, modifier chains, trailing and labelled trailing closures, `ForEach` with closure parameters, `if`/`else`, `let`, the ternary operator, string interpolation `\(…)` and `#Preview`. |
| D2 | It replaces the prototype notation (`mockitout: 1`, `screen … kit: … form: …`, `component`, `@id`, `@ref`, `form <device>` overrides). |
| D3 | Element identifiers are written as the modifiers `.id()` and `.ref()`, which keep the Elements table; screen metadata is the directive `@Screen(title:id:device:appearance:…)`, which fence attributes override. |
| D4 | Per-device `form` overrides are retired; a mockup per device is written as one block per device. |
| O1 | rejected: keep the prototype's notation — its own dialect, with no editor support, and not what SRC-2 asks for ("follows the same syntax" as SwiftUI view structs). |
| O2 | rejected: YAML or JSON descriptions — verbose for nested layouts and unfamiliar as UI code. |
| O3 | rejected: full Swift — needs a Swift toolchain or an interpreter, and executes code at build time. |
| O4 | rejected: keep per-device `form` overrides — a second syntax for a rare need; separate blocks are clearer and can differ freely. |
| C1 | Developers read and paste mockups as ordinary SwiftUI; editors highlight blocks as Swift. |
| C2 | The evaluator must tolerate run-time-only Swift (property wrappers, bindings, behaviour modifiers) by ignoring it. |
| C3 | Non-SwiftUI frameworks are written in the same syntax with their own element names. |

---

#### ADR-3 — Integrate as a Python-Markdown extension and a superfences fence, without a MkDocs plugin

**Context.** The prototype's plugin copied kit CSS into the site, warned about instant navigation
and failed strict builds. Zensical reads `mkdocs.yml` and runs Python-Markdown extensions and
superfences fences, but not MkDocs plugins.

**Decision.** Move every responsibility into the Markdown layer that both tools share.

**Consequences.** One integration for every Python-Markdown host. The cost is C3: Python-Markdown
does not tell an extension which file it is converting.

Checked at 0.10.1: R-MDX-004 changed after this decision only by a clarification that dropped a known-deviation note (0.2.1); the decision stands.

**Constrains.** R-MDX-001, R-MDX-004, R-MDX-005

| | Statement |
|---|---|
| D1 | mockitdown integrates with documentation sites as a Python-Markdown extension (configuration, per-page CSS) plus a `pymdownx.superfences` custom fence (rendering, logging, strict failure), and ships no MkDocs plugin. |
| O1 | rejected: keep the prototype's MkDocs plugin — Zensical does not run MkDocs plugins (verified with zensical 0.1.3 on 2026-11-23), and the project's documentation moves to Zensical (SRC-2). |
| O2 | rejected: a Zensical-specific plugin — Zensical's plugin API is not stable before 1.0 and would split the integration in two. |
| C1 | The same configuration works in MkDocs, Zensical and any Python-Markdown pipeline. |
| C2 | Everything the plugin did moves to the Markdown layer: CSS by a postprocessor, strict mode by raising `SuperFencesException`, asset handling by embedding (ADR-9). |
| C3 | The fence cannot know the page's file path, so block-relative imports and assets resolve through the configured directories only. |

---

#### ADR-4 — Packs are data mapped onto a fixed set of render roles

**Context.** SRC-2 asks for comprehensive component coverage in several frameworks and for site
extensibility. The prototype's kits were Python catalogues mapping names to tags.

**Decision.** Separate *what an element is* (a role, shared) from *what it is called and how it
looks* (a pack, data).

**Consequences.** The role set must be broad enough for all frameworks; the role catalogue is
therefore normative.

Re-checked at 0.10.3 together with the items it cites or is cited by (specification audit, #51): the citations are still accurate and no obligation changed.

**Constrains.** R-PACK-001, R-PACK-002, R-PACK-003, R-PACK-004, R-REND-002

| | Statement |
|---|---|
| D1 | A pack is data — `pack.json` (vocabulary, tokens, chrome, modifier maps, sizes, icons) and `pack.css` — that inherits from `base`. |
| D2 | Elements map framework-native names onto a fixed set of render roles with positional parameters and default attributes; every pack shares one markup contract. |
| D3 | Sites can add or replace packs from their own directories (`pack_paths`). |
| O1 | rejected: packs as Python modules with their own renderers — code per framework, markup divergence, and site packs would execute code at build time. |
| O2 | rejected: the prototype's kit catalogues in Python (`ElementSpec` with `html_tag`) — couples vocabulary to code and to per-framework tags. |
| O3 | rejected: one renderer per framework — eight implementations of every role. |
| C1 | Adding a framework or a site design system needs no code; a pack author writes JSON and CSS. |
| C2 | A framework component that no role can express needs a new role — a specification change. |
| C3 | Every pack is tested by the same contract tests. |

---

#### ADR-5 — Static CSS replicas, no framework runtime, no scripts, no network

**Context.** The prototype's `fiori` kit emitted real `ui5-*` tags that "come alive" under the UI5
runtime (SRC-3). With seven frameworks, three of them React/Angular libraries, real runtimes are
impractical in a documentation page.

**Decision.** Replicate each design language in CSS.

**Consequences.** mockitdown owns the fidelity of every pack; the example site is the visual
regression reference.

**Constrains.** R-REND-006, R-REND-007, R-MDX-006, R-PACK-007

| | Statement |
|---|---|
| D1 | Each pack imitates its framework with static CSS over mockitdown's own markup; mockups use no framework runtime, no web components, no JavaScript, no CDN and no web fonts. |
| D2 | The prototype's `ui5-*` SAPUI5 web components and declarative shadow DOM are dropped. |
| O1 | rejected: load the real frameworks (UI5 web components, Material UI, Fluent web components) — needs JavaScript and network access, is non-deterministic, breaks with `navigation.instant`, and React/Angular components cannot run in a static page without a build. |
| O2 | rejected: web fonts for framework typography (SF Pro, Segoe UI Variable, Roboto, 72) — licensing (SF Pro) and network dependence; system font stacks are close enough. |
| C1 | Output is deterministic, offline-capable and safe in untrusted previews. |
| C2 | Fidelity is an approximation maintained by CSS; complex framework behaviours appear only as the static state the author describes. |
| C3 | Pages stay compatible with instant navigation. |

---

#### ADR-6 — Token-driven appearance

**Context.** SRC-2: "Ideally light and dark modes per type should be supportable."

**Decision.** Appearance is a property of the frame (`data-appearance`) resolved entirely by
generated token rules.

**Consequences.** A frame can be light inside a dark page and vice versa; `auto` tracks the
documentation theme live, without scripts.

**Constrains.** R-APP-001, R-APP-002, R-PACK-006, R-PACK-007

| | Statement |
|---|---|
| D1 | Each pack defines light and dark token sets; pack CSS uses only tokens for appearance-dependent values and never branches on appearance. |
| D2 | `auto` follows the host page: Material/Zensical `data-md-color-scheme="slate"` means dark; on pages without that attribute, `prefers-color-scheme` decides. |
| D3 | `both` renders the light and dark frames side by side. |
| O1 | rejected: separate light and dark stylesheets per pack — doubles CSS and drifts. |
| O2 | rejected: follow only `prefers-color-scheme` — ignores the reader's choice in the documentation theme's toggle. |
| O3 | rejected: a script that watches the theme toggle — violates ADR-5. |
| C1 | Dark mode for a pack costs only a dark token set. |
| C2 | A pack's CSS must route every colour through tokens to be correct in dark mode. |

---

#### ADR-7 — Frame-unit scaling with px rewriting

**Context.** The prototype introduced container-query `--u` scaling (SRC-3). Production keeps it
and removes its cost for pack authors.

**Decision.** Scale by unit, not by transform, and apply the unit mechanically.

**Consequences.** Requires container queries (all current browsers). The 1px cap means mockups never
enlarge beyond their logical size.

**Constrains.** R-DEV-003, R-DEV-004, R-REND-004

| | Statement |
|---|---|
| D1 | Device sizes are logical points; inside a frame one point is `--u = min(1px, 100cqw / width)`. |
| D2 | Pack px lengths above 1px are rewritten to `calc(N * var(--u))` when the stylesheet is assembled; lengths of 1px or less are kept; inline lengths from modifiers use the same unit. |
| O1 | rejected: CSS `transform: scale()` on the frame — blurry text at fractional scales, and layout still occupies the unscaled size. |
| O2 | rejected: `zoom` — non-standard behaviour across browsers until recently and interacts badly with container queries. |
| O3 | rejected: pack authors write `calc(… * var(--u))` themselves — error-prone and unreadable. |
| C1 | A mockup scales as one picture and stays crisp; hairlines stay one pixel. |
| C2 | Pack authors write plain px; anything not written in px (em, %) does not scale with the frame. |

---

#### ADR-15 — Annotation marks use CSS anchor positioning with an inline fallback

**Context.** Callouts sit on element corners, half outside; lists and cards clip overflow.

**Decision.** Anchor positioning (Chromium 125+, Safari 26) with an inline fallback.

**Consequences.** One extra layer per decorated element; unique anchor names per figure.

Checked at 0.10.1 after R-ANN-003.C6 (marks inside a dialog): the screen-level layer and its inline fallback are kept, only positioned within the dialog; D1, D2 and C1 stand.

**Constrains.** R-ANN-003

| | Statement |
|---|---|
| D1 | Annotation marks are drawn in a screen-level layer tied to the decorated element by CSS anchor positioning, with an inline copy inside the element as a fallback. |
| D2 | The decorated element is the anchor itself; no wrapper is inserted. |
| O1 | rejected: a wrapper element around the view — breaks the parent's flex and grid rules for the view. |
| O2 | rejected: marks only inside the element — clipped by scrolling or rounded ancestors. |
| O3 | rejected: JavaScript measuring element positions — mockitdown output is static. |
| C1 | Browsers without anchor positioning show the inline copy, which may be clipped at container edges. |

## Revision history

| Version | Date | Change |
|---|---|---|
| 0.10.3 | 2026-11-26 | re-stamped with the items it cites after the audit's prose clarifications; no obligation changes (audit #51) |
| 0.10.2 | 2026-11-26 | checked against the changed item it cites; no obligation changes (audit #51) |
| 0.2.0 | 2026-11-24 | Page created |
| 0.10.2 | 2026-11-26 | checked against the changed item it cites; no obligation changes (audit #51) |
| 0.2.0 | 2026-11-24 | Page created |
