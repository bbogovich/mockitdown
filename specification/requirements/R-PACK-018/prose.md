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

**As built (#55).** Four partials hold rules two packs share: `mac-1bit.css` (lisa and mac-classic: the
whole common stylesheet), `material3.css` (android and angular-material: the text button and its state
layer), `win-button.css` (winxp and vista: the push button) and `crt.css` (nls and phosphor: the layer
the tube's scan lines are painted on). No rule was common to every pack, so `base` is unchanged.
Where the two packs of `mac-1bit.css` name the same window or icon differently (`finder` and `folder`,
`noGrow` and `tool`, `dBox` and `dialog`), the partial's selectors list both names; a pack only emits its
own. Where they draw a part differently, the partial reads a custom property the pack sets (mac-classic's
hollow scroll arrows: `--mc-arrow-up`, `-down`, `-left`, `-right` on its frame). Runs repeated inside one
stylesheet (win95, hologram) became one rule with both selectors, or custom properties (`--ho-clip`,
`--ho-cuts`). TC-3 captured the ten changed packs (hologram and phosphor, which the gallery does not list,
as its step 3 says); every capture was identical.


**Re-checked at specification 0.12.12.** Re-read after the clarification records of the items it cites (#81), which closed the suspect citations left by the test-case backfills (#54 to #60) and the SRC-19 import map (0.12.0). No obligation it rests on changed, and none of its clauses is altered.
