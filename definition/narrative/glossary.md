---
title: Glossary
def_version: 0.1.0
status: draft
updated: 2026-11-24
page_id: GLOSS
---

# Glossary

| Term | Meaning |
|---|---|
| **Appearance** | The colour mode a mockup renders in: `light`, `dark`, `auto` (follows the host page) or `both` (side by side). |
| **Block** | One fenced code block tagged `mockitdown` — the source of one mockup. |
| **Chrome** | The device or window decoration drawn around a screen: status bar, title bar, browser bar, home indicator. |
| **Component** | A user-declared `struct … : View`, used like an element; also called a custom control. |
| **Component library** | A `.mockitdown` file holding component declarations, loaded with `import "path"`. |
| **Core vocabulary** | The element names defined by the `base` pack and inherited by every pack (stacks, text, buttons, lists, …). |
| **Device** | A named frame size in logical points (`phone`, `tablet`, `desktop`, …) or `fit`. |
| **Diagnostic** | A located error or warning produced while parsing, evaluating or rendering. |
| **Directive** | A top-level `@Screen(…)` attribute carrying the mockup's metadata. |
| **Easter-egg pack** | A pack named only in a fence or by its gallery address; every pack list leaves it out (F-3.C9). |
| **Element** | A name a pack defines (`Button`, `InfoBar`), mapped to a render role with default attributes. |
| **Elements table** | The optional table under a figure listing every element tagged with `.id()`, with its `.ref()` citations. |
| **Fence attributes** | `key="value"` options on the fence line that override one mockup's rendering. |
| **Gallery** | The pack gallery: the published web page showing every pack's elements and design examples, rendered by the TypeScript variant (F-18). |
| **Figure** | The rendered HTML of one mockup: frame(s), caption and optional Elements table. |
| **Frame** | The box of the device size in which the screen is drawn and scaled. |
| **Frame unit** | `--u`, one logical point inside a frame: `min(1px, column width / device width)`. |
| **Import map** | The site's or page's mapping of namespaces (path prefixes) to directories or URLs, used to resolve `import "path"` (F-4.C4). |
| **Modifier** | A `.name(…)` call chained on a view, as in SwiftUI. |
| **Pack** | A design pack: the element vocabulary, tokens, chrome and stylesheet of one UI framework (`pack.json` + `pack.css`). |
| **Render role** | One of the fixed markup shapes (`button`, `list`, `navstack`, …) every element renders through; packs restyle roles. |
| **Site pack** | A pack supplied by a documentation site from its own directory. |
| **Strict mode** | Site option under which any mockitdown error fails the build. |
| **Token** | A named design value (colour, radius, font size) with light and dark values, emitted as a `--mkd-*` CSS custom property. |

## Revision history

| Version | Date | Change |
|---|---|---|
| 0.2.0 | 2026-11-24 | Page created |
| 0.2.1 | 2026-11-27 | Terms added: easter-egg pack, gallery, import map (definition audit, #80) |
