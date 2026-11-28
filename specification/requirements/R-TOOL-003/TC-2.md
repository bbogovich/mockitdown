---
id: TC-2
title: Layout, slots and modes
verifies: [C2, C3, C4, C8, C9, C10, C12, C15]
---

Browser test (`typescript/tests/browser/designer.spec.mjs`, "TC-2") on `pages/designer.html`: the left
column and the right panel measure 240 and 260 px, with the toolbar above, the outline above the gallery,
the view between them and the status bar below; dragging the left edge 60 px makes it 300 px and
`layout` says so; setting `layout = {right: {collapsed: true}}` hides the right panel and the toolbar
toggle shows it again; the toolbar holds Design, Preview and Code and shows `base` and `fit`; the status
bar shows `0 diagnostics`, the breadcrumb `VStack › List › Card › Button` after a click on the button,
and activating `List` selects the list; code with an unknown modifier shows `1 diagnostic`; a custom
element in the `inspector` slot replaces the properties panel inside the right column and is given the
session, and a `mockitdown-outline` in the `outline` slot joins it; an unknown `mode` reads as `design`;
Preview hides the side panels and the view, lists `Sign in` and `Inbox`, and renders `mockitdown-mockup`
elements with each mockup's fence options whose shadow HTML equals that of a `mockitdown-mockup` alone
with the same attributes and code; the Dark toggle sets `appearance="dark"` on every preview; Code mode
shows the active mockup's code in `mockitdown-code` with the left column visible (and `code.spec.mjs` checks that
it is editable and coloured, with a line number per line), and Design brings the view back.
