---
id: R-REND-004
title: Modifier rendering
status: active
version: 0.2.0
rev: 0
page: REND.1
slot: reqs
order: 4
source: [SRC-2]
realizes: [F-2, F-8]
constrained_by: [A-REND-3]
decisions: [ADR-7]
reverse_engineered: true
hash: e9398d2a09fc
---

C1: The style builder MUST translate the rendered layout modifiers into inline styles: `padding` (default 16 points, with edge sets such as `.horizontal`), `frame` (width, height, min/max sizes, `.infinity`, alignment), `offset` and `zIndex`.
C2: The style builder MUST express every length it emits as `calc(N * var(--u))` with N rounded to two decimals (`0` for zero), so inline lengths scale with the frame (R-DEV-004).
C3: The style builder MUST translate typography modifiers: `font` to `data-font` set to a canonical font style (`display`, `largeTitle`, `title`, `title2`, `title3`, `headline`, `subheadline`, `body`, `callout`, `footnote`, `caption`, `caption2`, `overline`) or to an explicit size and weight for `.system(size:weight:)`; `fontWeight`, `bold`, `italic`, `underline`, `strikethrough`, `monospaced`, `fontDesign`, `multilineTextAlignment`, `textCase` and `lineLimit` to the corresponding CSS.
C4: The style builder MUST resolve a font style name through the pack's `fonts` aliases, then the built-in aliases (for example `h4` → `title2`, `body2` → `callout`, `titleMedium` → `headline`).
C5: The style builder MUST translate `foregroundStyle`, `foregroundColor`, `background`, `tint`, `accentColor`, `fill` and `stroke` to colours, `opacity`, `cornerRadius`, `clipShape`, `shadow` and `border` to the corresponding CSS, and `hidden` to `visibility: hidden`.
C6: The style builder MUST accept as colours only: the named colours (`red`, `orange`, `yellow`, `green`, `mint`, `teal`, `cyan`, `blue`, `indigo`, `purple`, `pink`, `brown`, `gray`/`grey`) as their tokens; the semantic colours (`primary`, `secondary`, `tertiary`, `accentColor`, `tint`, `background`, `surface`, `danger`, `error`, `destructive`, `success`, `warning`, `info`, `separator`, `white`, `black`, `clear`, …) as their tokens or values; materials (`ultraThinMaterial` … `bar`); hex colours of 3, 4, 6 or 8 digits; `rgb()`/`rgba()`/`hsl()`/`hsla()` with numeric arguments; and `Color(red:green:blue:)`, `Color(hex:)` or `Color("<accepted colour>")`, each optionally with an opacity.
C7: If a colour value is not accepted, then the style builder MUST emit no style for it.
C8: The style builder MUST validate each `.class(…)` name against `[A-Za-z_][A-Za-z0-9_-]*` and warn "invalid class name" with code `modifier` for any other.
C9: The renderer MUST wrap a view with `.overlay(alignment:) { … }` content in `div.mkd-overlay-host` with the view in `__base` and the content in `__layer[data-align]`, and with `.background { … }` content in `__under` beneath `__base`.
V1: `.padding().frame(width: 200).foregroundStyle(.red)` yields `padding: calc(16 * var(--u))` on four sides, `width: calc(200 * var(--u))` and a colour referencing `--mkd-color-red`; `.foregroundStyle("url(x)")` yields no colour.
