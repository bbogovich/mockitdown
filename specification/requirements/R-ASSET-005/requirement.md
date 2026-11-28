---
id: R-ASSET-005
title: Built-in icons
status: active
version: 0.12.7
rev: 1
page: ASSET.1
slot: reqs
order: 5
source: [SRC-2]
realizes: [F-5, F-8]
constrained_by: [A-ASSET-2]
decisions: [ADR-11]
reverse_engineered: true
hash: 8ed6b18ce7b7
---

C1: mockitdown MUST ship its own icon set of original 24 × 24 line glyphs, drawn with `currentColor` strokes, and MUST NOT bundle or download a third-party icon font.
C2: The icon resolver MUST resolve a name by: the pack's `icons` map; an exact glyph name; an exact alias; then the normalised name and that name without `.fill`, `.circle` or `.fill.circle`, each as a glyph name then as an alias; then the first dot-separated segment as a glyph name then as an alias.
C3: Normalisation MUST strip a `sap-icon://` prefix, split camelCase and letter-digit boundaries with dots, split on `.`, `_`, `-`, `/` and spaces, lower-case, and drop the tokens `16`, `20`, `24`, `28`, `32`, `48`, `regular`, `filled`, `outline`, `outlined`, `rounded`, `sharp`, `ic`, `fluent`, `symbol`, `symbols`, `light` and `color`.
C4: The aliases MUST cover common SF Symbols, Material Symbols, Fluent UI System Icons and SAP icon names.
C5: If no glyph matches, then the icon resolver MUST render a neutral question-mark glyph and the renderer MUST warn "unknown icon 'x'" with code `icon`.
C6: The renderer MUST emit icons as inline `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">` whose stroke width packs control through the `icon-stroke` token.
V1: `star.fill`, `Star24Regular`, `sap-icon://favorite` and `favorite` resolve to glyphs; `xyzzy` renders the placeholder glyph with a warning.
