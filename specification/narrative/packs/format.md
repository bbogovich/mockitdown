---
title: "Pack format"
spec_version: 0.1.0
status: draft
updated: 2026-11-24
page_id: PACK.1
---

# Pack format

What a design pack is, how packs are found, inherited and selected, and the rules their tokens and CSS follow. The reference for every `pack.json` key follows the requirements.

<!-- slot: reqs -->

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
| 0.2.0 | 2026-11-24 | Page created |
