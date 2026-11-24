---
title: Markup and CSS contract
spec_version: 0.2.0
status: draft
updated: 2026-11-24
page_id: REF.3
---

# Markup and CSS contract

What a pack author (and a documentation theme) may rely on, and what pack CSS must and must not do.
It summarises R-REND-001 – R-REND-003, R-PACK-006, R-PACK-007, R-APP-002 and R-DEV-003 – R-DEV-004;
the [pack authoring guide](../../implementation/pack-authoring.md) shows how to work with it.

## What is stable

1. **The figure skeleton** — `mkd-figure`, `mkd-pack-<id>`, `mkd-stage`, `mkd-cell`, `mkd-frame`,
   `mkd-screen`, `mkd-layer`, `mkd-chrome`, `mkd-caption`, `mkd-elements`, `mkd-error` and their
   `data-*` attributes (R-REND-001).
2. **Role classes and parts** — `mkd-<role>` and `mkd-<role>__<part>` exactly as in the
   [Role catalogue](roles.md); the same in every pack.
3. **Data attributes** — `data-el`, `data-component`, the pass-through attributes (`data-variant`,
   `data-size`, …), `data-state`, `data-selected`, and the role-specific ones in the catalogue.
4. **Tokens** — every `--mkd-<name>` of the base token set exists on every frame, in light and dark
   values.

Anything else (the order of parts inside a role, inline styles, wrapper elements added for layout)
may change between versions.

## Selecting markup

```css
/* the pack scope is mandatory (R-PACK-007.C1) */
.mkd-pack-fluent .mkd-button { min-height: 32px; border-radius: var(--mkd-radius-s); }

/* a framework variant mapped by pack.json ("buttonStyle" → variant) */
.mkd-pack-fluent .mkd-button[data-variant="accent"],
.mkd-pack-fluent .mkd-button[data-variant="borderedProminent"] {
  background: var(--mkd-accent); color: var(--mkd-on-accent);
}

/* a framework-native element restyling a shared role */
.mkd-pack-fluent .mkd-alert[data-el="InfoBar"] { border-left: 0; }

/* states */
.mkd-pack-fluent .mkd-button[data-state="disabled"] { opacity: .4; }
.mkd-pack-fluent .mkd-listitem[data-selected="true"] { background: var(--mkd-accent-soft); }
```

## Rules for pack CSS

| Rule | Requirement |
|---|---|
| Every selector starts with `.mkd-pack-<id>` | R-PACK-007.C1 |
| No `data-appearance`, no `prefers-color-scheme` — use tokens | R-PACK-007.C2, R-APP-002 |
| Select only role classes, part classes and documented `data-*` attributes | R-PACK-007.C3 |
| Write lengths in `px`; they are scaled to the frame unit; ≤ 1px stays a hairline | R-PACK-007.C4, R-DEV-004 |
| No `@import`, `url()` to the network, `@font-face` web fonts or scripts | R-PACK-007.C5, ADR-5 |
| Colours, radii, shadows and type through `var(--mkd-…)` tokens | R-PACK-006.C4 |

## Tokens and appearance

A pack's tokens are emitted as four rule sets (R-APP-002):

```css
.mkd-pack-p .mkd-frame { color-scheme: light; --mkd-bg: …; /* light tokens */ }
.mkd-pack-p .mkd-frame[data-appearance="dark"] { color-scheme: dark; /* light ⊕ dark tokens */ }
[data-md-color-scheme="slate"] .mkd-pack-p .mkd-frame[data-appearance="auto"] { /* dark */ }
@media (prefers-color-scheme: dark) {
  body:not([data-md-color-scheme]) .mkd-pack-p .mkd-frame[data-appearance="auto"] { /* dark */ }
}
```

So `background: var(--mkd-surface)` in pack CSS is light or dark automatically.

## Stylesheet order

`page.css` (not scaled), then for each pack in the lineage, root first: the pack's `pack.css`
(scaled) and its token rules (R-MDX-004.C2). A child pack therefore overrides its parent at equal
specificity simply by coming later.

## For documentation themes

A theme may style `.mkd-figure` margins and `.mkd-caption`; it should not style inside
`.mkd-frame`, which the page stylesheet isolates from host typography (R-DEV-006).

## Revision history

| Version | Date | Change |
|---|---|---|
| 0.2.0 | 2026-11-24 | Page created |
