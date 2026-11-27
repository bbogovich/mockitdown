**Requirement.** Shared rules are written once, in `base` or in a partial under `shared/packs/_partials/`, and a
pack includes a partial with a CSS `@import` line at the top of its `pack.css`. Both builds resolve the
import when they copy the pack, writing the partial's rules into the package copy with the partial's
placeholder scope `.mkd-scope` replaced by the pack's own figure class.

**Rationale.** SRC-18#health: duplicated blocks across pack stylesheets (102 of the 116 the health report
counted at 0.10.8 are shared by `lisa` and `mac-classic`) must be defined once, with CSS imports. An
`@import` cannot reach the browser: a pack's CSS is inlined in a `<style>` element, concatenated with other
packs' CSS by `stylesheet()`, or adopted as a constructed stylesheet in the web component's shadow root,
and in each case an `@import` is either invalid (after other rules), resolved against the wrong base, or
ignored (`CSSStyleSheet.replaceSync`). Resolving at build time keeps every delivery path — the example
site, the Python API's inline or linked CSS, `dist/shared/` fetched by `loadAssetsFromUrl`, the published
gallery — unchanged, and keeps R-PACK-007.C1 true of every published `pack.css`. The placeholder scope
lets one partial serve any number of packs without naming them, so a new pack reuses a partial by adding
one line.

**Example.** `shared/packs/_partials/mac-1bit.css` holds
`.mkd-scope .mkd-frame { --mc-dither: …; }`; `shared/packs/lisa/pack.css` starts with
`@import "../_partials/mac-1bit.css";`; the package copy `packs/lisa/pack.css` starts with
`.mkd-pack-lisa .mkd-frame { --mc-dither: …; }` followed by Lisa's own rules.

**Verification.** TC-1 (resolution in both builds), TC-2 (the duplicate check), TC-3 (rendering unchanged).

**As built (#54).** The build also fails on an include that shares its line with other text (C6), and only an `@import` outside a comment is refused at run time (C8). Re-checked against ADR-17 as re-checked in the same release: no obligation changed.
