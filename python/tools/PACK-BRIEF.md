# Pack author brief — mockitdown

## The product
mockitdown renders UI mockups written in a fenced ```` ```mockitdown ```` Markdown block, in SwiftUI
syntax, as static HTML+CSS that looks like a real UI framework's components. A *pack* = one framework.
Repository: this repository (Python ≥3.11, venv at
`.venv`, package in `python/src/mockitdown`, packs in `shared/packs`). The core is done and committed; you are writing ONE pack.

Read these first (they are the contract):
- `python/src/mockitdown/packs/__init__.py` — pack.json format (docstring at top).
- `shared/packs/base/pack.json` — the core vocabulary every pack inherits, the token names, the
  attribute-setting modifier map. Your pack `extends` base automatically.
- `shared/packs/base/pack.css` — structural CSS for every render role. You restyle these.
- `python/src/mockitdown/render/html.py` — the markup each role emits (class `mkd-<role>`, parts
  `mkd-<role>__<part>`, `data-el`, `data-variant`, `data-size`, `data-color`, `data-state`,
  `data-selected`, …) and which attributes each role reads (`v.attr("…")`). Roles: vstack hstack
  zstack grid gridrow scroll group spacer divider shape color text label image(+symbol) icon avatar
  badge chip link progress rating placeholder chart button fab toggle checkbox radio radiogroup
  segmented textfield select slider stepper datepicker calendar dropzone navstack split tabs tab
  appbar sidebar navitem breadcrumb pagination steps card section list form listitem labeled table
  tablerow tablecolumn toolbar toolbaritem accordion dialog menu menuitem tooltip toast alert.
- `python/src/mockitdown/render/__init__.py` (frame/figure structure), `render/chrome.py` (device chrome),
  `python/src/mockitdown/styles.py` (px scaling, token CSS), `shared/icons/icons.json` (icon names/aliases).
- `python/examples/site/docs/index.md`, `python/tests/test_render.py` for syntax examples.

## What you write (only these paths — nothing else)
1. `shared/packs/<id>/pack.json` — id, name, framework, version, modules (names for
   `import <Module>`), device (default form), chrome (device→chrome kind), sizes (optional), tokens
   (COMPLETE light AND dark sets overriding every base token whose value should differ: colours,
   fonts, font sizes/weights `fs-*`/`fw-*`, radii, control height, shadows, chart colours, named
   colours `color-*`, icon stroke), fonts (aliases of the framework's type-scale names onto the
   canonical styles in `render/style.py` FONT_STYLES), icons (pack-specific icon name meanings),
   modifiers (extra attribute-setting modifiers), and **elements**: the framework's own component
   names, as comprehensive as you can make them, each mapped to a role with `params` (positional
   argument names), `defaults` (e.g. `{"variant": "contained"}`), `variants` (the framework's own
   variant names) and a one-line `doc`. Use the framework's real names and real variant/prop names
   (e.g. MUI `variant: "outlined"`, `color: "secondary"`).
2. `shared/packs/<id>/pack.css` — styling. Rules:
   - EVERY selector starts with `.mkd-pack-<id> ` (tests will enforce this; `@keyframes` excepted).
     Base rules are `.mkd-frame .mkd-x` (specificity 0,2,0) and load first; yours load later, so equal
     specificity wins. Match or exceed base specificity when overriding `:where()`-qualified rules.
   - Write plain `px`; values >1px are converted to the frame unit automatically. Don't use rem/em
     for layout sizes (em is fine for icon sizing relative to text).
   - Never branch on appearance (no `[data-appearance]`, no `prefers-color-scheme`): put every colour
     that differs between light and dark in a token (add your own tokens freely, e.g. `nav-bg`,
     referenced as `var(--mkd-nav-bg)`). Light and dark must BOTH look right.
   - Style pack-native elements via `[data-el="InfoBar"]` etc. when a role's generic look is not
     enough; style variants via `[data-variant="…"]`, colours via `[data-color="…"]`.
   - No external resources (no web fonts, no CDN, no images). Use system font stacks that match the
     framework (e.g. "Segoe UI Variable", "SF Pro", Roboto, "72").
   - Aim for fidelity: sizes, radii, paddings, elevation, focus/selected states, typography of the
     framework's current version. Device chrome is drawn by base; restyle chrome via its classes if
     needed (`.mkd-pack-<id> .mkd-chrome--titlebar` …).
3. `python/examples/site/docs/packs/<id>.md` — the demo page (replace the placeholder): a short intro
   (framework + version, the `import` line, the main element names), then **6–9 mockups of
   increasing complexity following common UI patterns for that platform** — e.g. sign-in form,
   settings, list → detail, inbox/master-detail, dashboard (cards, KPIs, chart, table), data table
   with toolbar/filters/pagination, checkout or multi-step wizard, profile, a screen with an open
   dialog / menu / toast. Cover as many of the pack's elements as possible across the page. Use
   `source="true"` on some fences so readers see the code; use `appearance="both"` on at least two;
   leave the rest default (auto follows the site's light/dark). Fence attributes available: pack,
   device, appearance, width, height, chrome, title, id, caption, elements, url, source.
   Images: `Image("assets/images/photo-1.svg")` (avatar-1..6.svg, photo-1..6.svg, logo.svg, map.svg,
   banner.png exist under `python/examples/site/docs/assets/images/`).
4. `python/examples/site/docs/mockups/<id>/*.mockitdown` — at least one file of reusable custom components
   (`struct X: View { … }`) imported by your page with `import "<id>/<file>"` (import root is
   `docs/mockups`). Show the extension mechanism off: a custom row, card or toolbar used several times.

Do NOT edit anything else: not the core (`python/src/mockitdown/*.py`, `render/`, `syntax/`, base pack,
page.css), not tests, not mkdocs.yml, not other packs. Other agents work in the same tree right now.
If the core blocks you (a role lacks an attribute, a bug, a missing role), work around it in your
pack/CSS if reasonable and **report it** precisely in your final message (file, function, repro
snippet, proposed fix) — the lead will fix the core.

## Language cheat-sheet
```
import SwiftUI                       // `import <Module>` selects the pack (your modules list)
import "mypack/rows"                 // custom components (.mockitdown appended if missing)
@Screen(title: "Inbox", id: "SCR-1", device: .phone)   // optional metadata

struct MailRow: View {               // custom component
  var sender: String
  var unread: Bool = false
  @ViewBuilder var trailing: Content // trailing closure goes to the first view-typed property
  var body: some View { Row(sender, subtitle: "…", detail: "9:41").badge(unread ? 2 : nil) }
}

NavigationStack {
  List {
    ForEach([("Ana", true), ("Ben", false)]) { name, flag in MailRow(sender: name, unread: flag) }
    if showMore { Text("**More**") }
  }
  .navigationTitle("Inbox")
  .toolbar { ToolbarItem(placement: .topBarTrailing) { Button("Edit") } }
}
```
Values: strings with `\(x)`, numbers, true/false, `.enumCase`, arrays, dicts, tuples, ranges
`0..<3`. Modifiers: layout (`.padding`, `.frame(maxWidth: .infinity)`), text (`.font(.title)`,
`.bold()`), colour (`.foregroundStyle(.secondary)`, `.background(.blue)`, `.tint`), shape
(`.cornerRadius`, `.clipShape(Circle())`), semantics (`.id("x")`, `.ref("UC-1")`, `.class("x")`,
`.badge(3)`, `.disabled()`, `.selected()`, `.variant(.outlined)`, `.size(.small)`, `.color(.secondary)`,
`.state(.focused)`), presentation (`.alert(…)`, `.sheet(isPresented:)`, `.navigationTitle`, `.toolbar`,
`.tabItem`, `.searchable`). Unknown modifiers warn. Element arguments map positional args via
`params`, labelled args by name; common attribute names per role are in html.py.

## Verify (all must pass before you finish)
```
cd <repo root>/python
../.venv/bin/python tools/sync_shared.py                        # copy shared/ into the package (or reinstall)
../.venv/bin/python -m unittest discover -s tests -t .          # your page: zero errors, zero warnings
../.venv/bin/mockitdown check <file>.mockitdown                  # quick diagnostics
../.venv/bin/python tools/snapshot.py examples/site/docs/packs/<id>.md --block N -o /tmp/…/x.png --appearance both
../.venv/bin/python tools/snapshot.py examples/site/docs/packs/<id>.md --all -o …png --width 1300
```
Then LOOK at the PNGs with the Read tool, compare against your knowledge of the real framework, and
iterate on pack.css until the mockups are convincing in light AND dark. Do this for every mockup,
not just the first. Use your scratchpad for PNGs (not the repo). Don't run `zensical build` (the
lead does) and don't commit (the lead commits).

## Final message
Report: elements added (count + notable ones), tokens/fonts approach, which mockups the page has,
known fidelity gaps, and the exact core issues you hit (with repro). Keep it under 400 words.

## Round 2 additions (read these too)
The core now also has (see `python/examples/site/docs/widgets.md`, `annotations.md`, `charts.md` for usage, and
`render/html.py` / `render/charts.py` / base `pack.css` for markup):
- **Non-standard component roles**: spreadsheet, stickynote, board/boardcolumn/kanbancard, code (editor and
  terminal), message (chat bubble, comment), tree/treeitem, timeline/timelineitem, gantt, schedule, kbd,
  skeleton, swatches, canvas, media (video player), emptystate, stat, map. Restyle them for your pack where
  the framework has an equivalent look (e.g. a native tree view, the platform's code font, chat bubbles).
- **Charts**: `Chart(kind:)` and BarChart/LineChart/PieChart/… render inline SVG using `--mkd-chart-1…6`,
  `--mkd-grid-line`, `--mkd-fg-2`. Set chart colours that match the framework's data-viz palette.
- **Annotations/overlays**: `.callout(n, "label", alignment:, labelSide:)`, `.pointer(.hand)`,
  `.dragSelect()`, `.highlight()`, `.tap()`, `.position(x:y:)`, elements `Callout`, `Pointer`,
  `SelectionRect`. `(#n)` in page prose renders the matching circle. Tokens: `callout`, `on-callout`,
  `marquee`. You normally keep the defaults (they must read on every pack).
- **Chrome kinds** now: none, ios, ipados, macos, windows, android, browser, gnome (no titlebar — the app's
  HeaderBar draws it), kde (Breeze titlebar), win31. Restyle `.mkd-chrome…[data-chrome="…"]` in your CSS.
- Your demo page must also use several of these new components where they fit the platform, and at least one
  mockup with numbered callouts referenced as `(#1)`, `(#2)` in the page text.
- The page sits under `python/examples/site/docs/packs/<id>.md` unless your brief says otherwise.

## Round 3: retro packs
- Chrome kind **`window`** (generic): `.mkd-chrome--window` title bar with `.mkd-chrome__lead` (i[data-btn=close|menu]),
  `.mkd-chrome__title > .mkd-chrome__title-text`, `.mkd-chrome__trail` (i[data-btn=help|min|max|zoom|collapse|close]),
  and a bottom `.mkd-chrome--statusbar` holding i[data-btn=grow]. Every button is `display:none` by default — show and
  draw the ones your system had (with CSS only: borders, gradients, pseudo-elements). Use `chrome: {"desktop": "window"…}`.
  Scope those rules like `.mkd-pack-<id> .mkd-chrome--window …`.
- Retro packs have no historical dark mode: make the dark token set a plausible variant (a dark/high-contrast scheme the
  system offered, or an inverted CRT look) so `appearance: dark|auto` still works. Light is the canonical look.
- No recreations of specific games; invented app content and names only; no reproduction of trademarked logos
  (draw a neutral glyph where an Apple/Windows/Sun logo would be).
- Pages go in `python/examples/site/docs/retro/<id>.md`. The lead adds them to the nav.
- Several agents work at once: write only your own pack dirs, pages and `docs/mockups/<id>/` folders.
