# Handoff — next session: Ant Design, Tailwind Catalyst, IBM Carbon, GitHub Primer packs

State on 2026-11-24: `main` and `docs` are pushed to `github.com/bbogovich/mockitdown`. GitHub Pages
(source: Actions, workflow `.github/workflows/pages.yml`, present on **both** branches) publishes the
documentation (docs branch) at <https://bbogovich.github.io/mockitdown/> and the example site at
<https://bbogovich.github.io/mockitdown/demos/>. A push to either branch rebuilds both. The
`github-pages` environment allows deployments from `main` and `docs`.

25 packs (22 listed, 3 hidden easter eggs), 90 render roles, 37 tests green. Spec 0.3.1, definition
0.3.0, implementation 0.2.0.

## Goal

Add four web packs from the "Recommended next packs" page (`examples/site/docs/roadmap.md`):

| Pack id | Imitates | Version to follow | Modules (`import …`) | Notes |
|---|---|---|---|---|
| `antd` | Ant Design (React) | v5 (token-based design, `colorPrimary #1677ff`, radius 6, control height 32) | `Antd`, `AntDesign`, `ProComponents` | Dense enterprise admin: `Table` with filters/sorters/row selection, `Form` with labels left/top, `ProLayout` sider + header, `Descriptions`, `Statistic`, `Result`, `Transfer`, `Cascader`, `TreeSelect`, `Upload` dragger, `Tag` presets, `Badge.Ribbon`, `Steps`, `Timeline`, `notification`/`message`. Dark = official dark algorithm. Data viz: AntV G2 palette. |
| `catalyst` | Tailwind Catalyst (Tailwind Plus UI kit) | current Catalyst (Tailwind v4, zinc neutrals, Inter) | `Catalyst`, `Tailwind`, `TailwindPlus` | Application shells (`SidebarLayout`, `StackedLayout`, `Navbar`, `Sidebar`), `Fieldset`/`Field`/`Label`/`Description`, `Listbox`, `Combobox`, `Switch` with colours, `Badge` colours (the 20-colour Tailwind set), `Table` (striped/dense/grid), `DescriptionList`, `Dialog`, `Alert`, `Dropdown`, `Pagination`, `Avatar`, `Heading`/`Subheading`/`Text`/`Strong`/`Code`. Complements `shadcn` (do not duplicate its look; Catalyst is crisper, zinc, ring borders). Add a few Tailwind Plus marketing sections (hero, feature grid, pricing) as elements. |
| `carbon` | IBM Carbon Design System | v11 (themes White/g10 light, g90/g100 dark; IBM Plex Sans, fallback system) | `Carbon`, `CarbonReact` | Square corners, 2px bottom-border inputs on `field-01`, `UI Shell` header (48px, black), `SideNav`, `DataTable` with toolbar/batch actions/expandable rows, `Tile` (clickable/selectable/expandable), `Notification` (inline/toast/actionable, high/low contrast), `Tag` colours, `ContentSwitcher`, `ProgressIndicator`, `StructuredList`, `OverflowMenu`, `NumberInput`, `FileUploader`, `Breadcrumb`, `Pagination` (Carbon's distinctive bar). Data viz: Carbon Charts categorical palette. |
| `primer` | GitHub Primer (Primer React + CSS) | current Primer primitives (light/dark default themes) | `Primer`, `PrimerReact`, `GitHub` | Developer-tool UIs: `PageHeader`, `UnderlineNav`, `SegmentedControl`, `Button` variants (default/primary/danger/invisible) with `Counter`, `Label` and `StateLabel` (open/closed/merged/draft), `Timeline`, `ActionList`/`ActionMenu`, `NavList`, `TreeView`, `Avatar`/`AvatarStack`, `Flash`, `Banner`, `Blankslate`, `BranchName`, `RelativeTime`, `Token`, `Autocomplete`, `TextInput`, `Pagination`, diff and code views (reuse the `code` role). Mockups: issue list, PR conversation, file browser, repo settings. Invented repos/users only, **no GitHub Octocat or logo** (neutral glyph). |

Brand rule (ADR-16 homage rules apply in spirit): no trademarked logos, invented app content.

## How a pack is built

Read **`tools/PACK-BRIEF.md`** — the full brief used for every pack so far (contract files, CSS
rules, demo page requirements, verification loop, round 2 additions). Per pack, write only:

1. `src/mockitdown/packs/<id>/pack.json` + `pack.css` (every selector prefixed `.mkd-pack-<id>`, tokens
   for every light/dark difference, plain px).
2. `examples/site/docs/packs/<id>.md` — 6–9 mockups of increasing complexity, `source="true"` on some,
   `appearance="both"` on two or more, at least one with numbered callouts referenced as `(#1)` in
   prose, several non-standard components and a chart.
3. `examples/site/docs/mockups/<id>/*.mockitdown` — reusable custom components imported by the page.

Good templates: `packs/mui` and `packs/shadcn` (web kits, browser chrome, ~120–150 elements),
`packs/sapui5` (dense enterprise, closest to Carbon/antd).

The four packs are independent, so they can be built in parallel by four agents (each given the
brief, its row above, and told not to touch the core/tests/mkdocs.yml/other packs). Core issues
the agents report are fixed by the lead, then the agents re-verify.

## Integration checklist (lead)

- [ ] Add the four pages to `examples/site/mkdocs.yml` nav under **Packs** (web packs after shadcn/ui).
- [ ] Update `examples/site/docs/roadmap.md`: remove the four from "Recommended next packs"; keep the
      easter-egg footer last. Update `README.md` intro and `examples/site/docs/index.md` pack list.
- [ ] Tests: `.venv/bin/python -m unittest discover -s tests -t .` (and with
      `ZENSICAL=$PWD/.venv/bin/zensical` to include the real build). Pack tests enforce selector
      scoping, no appearance branching, token completeness, unique modules, every element renders.
- [ ] Visual check with `tools/snapshot.py … --all --appearance both`, light and dark.
- [ ] Docs branch (`../mockitdown.docs`, worktree): revise **R-PACK-008** with a `CR-2` adding
      `antd`, `catalyst`, `carbon`, `primer` (sio-docs: `--tier specification`); update ADR-13 prose
      (Ant Design is no longer "proposed next"); regenerate the catalogue:
      `python tools/gen_catalogue.py ../mockitdown.docs/specification/narrative/packs/catalogue.md`;
      bump spec to 0.4.0; definition change note if F-3 scope wording changes; `sio-docs check`;
      `zensical build`. sio-docs binary: `~/Documents/Projects/Dev/DevTools/SpecItOut2/SpecItOut-Plugins/VibeItOut/bin/sio-docs`
      (the `~/.local/bin` symlinks are broken).
- [ ] Commit docs first, then code; push both; watch the `pages` workflow (`gh run watch`).

## Known caveats

- The VibeItOut plugin is enabled in `.claude/settings.json` but not installed; the work so far was
  done directly (not through `vibe-change`/queue). Install it or keep working directly.
- sio-docs duplicates revision rows on pages whose revision table is empty — check the diff.
- Icons are mockitdown's own line glyphs (aliases for SF/Material/Fluent/SAP names); add aliases for
  Ant/Carbon/Octicons names in each pack's `icons` map rather than drawing new glyphs where possible.
- Zensical nested `convert()` calls: CSS is emitted only in the conversion containing figures —
  don't change `_StylePostprocessor` without rerunning `ZensicalBuildTests`.
- Local dev server: `cd examples/site && rm -rf .cache && ../../.venv/bin/zensical serve`.
