---
title: Annotations and overlays
spec_version: 0.12.7
status: draft
updated: 2026-11-27
page_id: ANN.1
---

# Annotations and overlays

Numbered callouts, pointers, selections, highlights and taps drawn on a mockup to illustrate
workflows (F-15), and the `(#n)` references that tie prose to them. Example, in the base pack:

```mockitdown device="fit" title="Annotated toolbar"
HStack(spacing: 16) {
  Button("New", systemImage: "plus").callout(1)
  Button("Share", systemImage: "square.and.arrow.up").callout(2, "Sends a link", alignment: .topTrailing)
  Button("Delete", systemImage: "trash").pointer(.hand)
}
.padding(24)
```

Create an item (#1), then share it (#2).

### R-ANN-001 — Numbered callouts

Documentation often has to point at a part of a screen and then talk about it. A numbered circle on the element, matched by the same number in the prose (R-ANN-004), is the convention of manuals and design specs.

**Overlays keep their marks (F-15.C5).** A dialog, a toast or a floating action button with
`.callout(…)` draws the callout like any other element.

**R-ANN-001.TC-1 — Callouts on overlays**

Conformance cases `annotate-overlay-callouts` (a `Dialog`, a `Toast` and a floating action button each
with `.callout(n)`, one presented through `.overlay`) in both suites: each overlay's callout mark is in
the expected HTML. Browser test: each mark is visible and centred on its overlay's corner within 4 px.

**Realizes.** F-15

| | Statement |
|---|---|
| C1 | The modifier `.callout(n)` (alias `.annotation`) MUST draw a numbered circle on the corner of the modified view named by `alignment:` (default `.topLeading`), with an optional label (second argument or `text:`) drawn beside it. |
| C2 | A callout label MUST point away from the view (leftwards from a leading corner, rightwards from a trailing one) unless `labelSide: .leading&#124;.trailing` says otherwise; `inset: true` MUST draw the callout inside the corner. |
| C3 | `color:` MUST set the callout colour; the default is the pack token `--mkd-callout` on `--mkd-on-callout`. |
| C4 | A callout attached to a component that renders several views MUST be drawn once, on the first view. |
| C5 | The `Callout(n, "label")` element MUST draw the same mark as a free element, for placement with `.position(x:y:)`. |
| V1 | `Button("Send").callout(4)` renders the button and a mark containing `4`. |
| C6 | The renderer MUST draw the marks of a view whose role is an overlay (`dialog`, `toast`, `fab`) — callouts, pointers, selections, highlights and taps — as for any other view, including when the overlay is presented through a modifier. |

---

### R-ANN-002 — Pointers, selections, highlights and taps

Workflow illustrations show what the user does: where the pointer is, what is dragged across, what is tapped. These marks are part of the mockup so they stay attached when the layout changes.

**R-ANN-002.TC-1 — Pointer, selection, highlight and tap marks**

Python unit tests `python/tests/test_annotations.py` `PointerSelectionTests`:
`.pointer(.<kind>, alignment: .topTrailing)` for each of arrow, hand, ibeam, grab, crosshair and touch
draws `span.mkd-deco__pointer[data-align=topTrailing]` holding `span.mkd-pointer[data-kind=<kind>]`
with that kind's own drawing (six different drawings); `.pointer()` draws an arrow at `center`;
`.cursor` renders as `.pointer` (C1). `List { … }.dragSelect()` draws `span.mkd-deco__marquee` in the
anchored and the fallback layer; `.dragSelect(.green)` and `.marquee(.green)` set `--mkd-marquee`; the
base stylesheet gives the mark a negative inset, a border and a `color-mix` tint of `--mkd-marquee`
(C2, V1). `.highlight()` and `.highlight(.red)` draw `span.mkd-deco__highlight` (a solid ring);
`.tap()` and `.tap(alignment: .leading)` draw `span.mkd-deco__tap` at the alignment (C3). On a canvas,
`SelectionRect().frame(width: 60, height: 40).position(x: 50, y: 50)` and `Pointer(.hand).position(…)`
render `.mkd-marquee` and `.mkd-pointer` sized by the frame and centred at the position, with the same
drawing and stylesheet rule as the modifiers' marks (C4).
The conformance cases `annotate-pointer-*`, `annotate-cursor-alias`, `annotate-drag-select`,
`annotate-marquee-color`, `annotate-highlight`, `annotate-tap` and `annotate-free-elements` hold the
same output byte for byte in both variants (IT-8, IT-10).

**R-ANN-002.TC-2 — The selection rectangle surrounds the view**

Browser test (Chromium) `typescript/tests/browser/annotations.spec.mjs`: a `List` of two rows with
`.dragSelect()`, rendered with the package's Node entry and put on a blank page with its stylesheet.
The visible selection rectangle lies outside the list's box on all four sides, by more than 0 and less
than 16 px, with a border wider than 0 and a translucent background colour (V1).

**Realizes.** F-15

| | Statement |
|---|---|
| C1 | `.pointer(kind, alignment:)` (alias `.cursor`) MUST draw a mouse pointer of kind arrow (default), hand, ibeam, grab, crosshair or touch over the view at the named alignment. |
| C2 | `.dragSelect(colour?)` (alias `.marquee`) MUST draw a selection rectangle around the view: a border and a translucent tint of `--mkd-marquee` (or the given colour), extending slightly beyond the view. |
| C3 | `.highlight(colour?)` MUST draw a focus ring around the view; `.tap(alignment:)` MUST draw a touch indicator. |
| C4 | The elements `Pointer(kind)` and `SelectionRect()` MUST draw the same marks as free elements, sized with `.frame` and placed with `.position(x:y:)`. |
| V1 | `List { … }.dragSelect()` renders a selection rectangle over the list. |

---

### R-ANN-003 — Overlay placement and free positioning

Lists, cards and scroll areas clip their content, which would cut off a callout sitting on a corner. Anchor positioning draws the marks in an unclipped layer tied to the element; the inline copy keeps older browsers working.

The anchor prefix is derived from the pack and the source text alone, so every variant names anchors
alike (ADR-18) and two different figures on one page do not collide.

**Marks inside a dialog (F-15.C6).** A dialog is its own decoration context: the marks of its
contents are positioned against the dialog, so a callout on a dialog's button sits on that button rather
than at the screen's top-left corner.

**Re-checked at specification 0.10.6.** A-REND-1 and A-WEB-1 were revised as built by the behaviour-preserving renderer split (#48, #49), and the gallery test cases only renamed their files (#50); no obligation here changed.

**Re-checked at specification 0.10.7.** Its prerequisites were re-checked after the renderer split (#48, #49) and the gallery spec split (#50) without any change to an obligation; neither is this item changed.

**R-ANN-003.TC-1 — Marks inside a dialog**

Conformance case `annotate-dialog-contents` (a callout on a button inside a `Dialog`) in both suites.
Browser test (Chromium): the callout's centre lies within 4 px of the button's top-left corner, once
with anchor positioning and once with the fallback layer forced (anchor positioning disabled through
the stylesheet's `@supports` branch).

**Decisions.** ADR-15

| | Statement |
|---|---|
| C1 | The renderer MUST attach annotation marks (R-ANN-001, R-ANN-002) to the modified view's own root element — not a wrapper — so the view keeps its place in its parent's layout; only a void root element (an image) MAY be wrapped. |
| C2 | The renderer MUST name the decorated element as a CSS anchor (unique within the page) and draw its marks twice: in a screen-level layer positioned with CSS anchor positioning, and in a layer inside the element used only where anchor positioning is unsupported. |
| C3 | Marks created inside a modal dialog MUST be emitted after the dialog's layer, so their anchors precede them. |
| C4 | `.position(x:y:)` MUST place the view's centre at (x, y) points in its nearest positioned container (canvas, z-stack, screen); `.position` without coordinates MUST warn and be ignored; `.rotationEffect(.degrees(n))` MUST rotate the view; `.zIndex(n)` MUST order overlapping views; canvas, z-stack, card and presented containers MUST isolate the stacking of their children. |
| C5 | The anchor name MUST be `--mkd-<p>-<n>`, `<p>` being the first six hexadecimal digits of the SHA-1 of the pack id, a line feed and the block source (UTF-8), and `<n>` counting the figure's decorated elements from 1 in render order. |
| V1 | A callout on a row inside a clipped list is fully visible in a browser with anchor positioning. |
| C6 | A mark on a view inside a dialog MUST be drawn at that view, in browsers with and without CSS anchor positioning; the fallback layer of C2 MUST be positioned within the dialog, not within the screen. |

---

### R-ANN-004 — Callout references in prose

Prose and picture refer to each other with the same numbered circle, so a reader can follow steps without hunting for them.

**R-ANN-004.TC-1 — Callout references in prose**

Python unit tests `python/tests/test_annotations.py` `CalloutReferenceTests`, through Python-Markdown
with the `mockitdown` extension: `Enter the name (#1).` holds `<span class="mkd-ref">1</span>` (V1);
`(#12)` and `(#A)` become circles, while `(#123)`, `(#a)`, `(#AB)`, `(# 1)` and a bare `#1` do not;
with `callout_refs: false` nothing is converted (C1). `(#2 <colour>)` for each of the ten colours gives
`data-color="<colour>"`, which `page.css` styles, and `(#2 magenta)` is not converted (C2).
`Go to [the field](#1) and (#2).` keeps the link `<a href="#1">` and converts only `(#2)` (C3).

**Realizes.** F-15

| | Statement |
|---|---|
| C1 | With the extension option `callout_refs` (default true), the Markdown extension MUST render `(#n)` in prose — n a number of one or two digits or a capital letter — as an inline numbered circle (`span.mkd-ref`) matching a mockup's `.callout(n)`. |
| C2 | `(#n colour)` MUST colour the circle with one of red, orange, yellow, green, teal, blue, indigo, purple, pink or gray, matching a callout drawn with `color:`. |
| C3 | The pattern MUST NOT match inside a link destination such as `[text](#1)`. |
| V1 | `Enter the name (#1).` converts to text containing `<span class="mkd-ref">1</span>`. |

## Revision history

| Version | Date | Change |
|---|---|---|
| 0.12.7 | 2026-11-27 | test cases backfilled: every C clause verified by a TC naming its tests (#56) |
| 0.10.8 | 2026-11-27 | re-checked after the renderer split: unaffected (#53) |
| 0.10.7 | 2026-11-27 | re-checked after the renderer split and the gallery spec split: unaffected (#53) |
| 0.10.0 | 2026-11-26 | marks inside a dialog are placed at their views (F-15.C6): C6, TC-1 (ING-1); overlays keep their marks (F-15.C5): C6, TC-1 (ING-1) |
| 0.6.2 | 2026-11-25 | as built: portable anchor prefix from the pack id and block source, so every variant names anchors alike (#2) |
| 0.3.0 | 2026-11-24 | Page created |
| 0.10.8 | 2026-11-27 | re-checked after the renderer split: unaffected (#53) |
| 0.10.7 | 2026-11-27 | re-checked after the renderer split and the gallery spec split: unaffected (#53) |
| 0.10.0 | 2026-11-26 | marks inside a dialog are placed at their views (F-15.C6): C6, TC-1 (ING-1); overlays keep their marks (F-15.C5): C6, TC-1 (ING-1) |
| 0.6.2 | 2026-11-25 | as built: portable anchor prefix from the pack id and block source, so every variant names anchors alike (#2) |
| 0.3.0 | 2026-11-24 | Page created |
