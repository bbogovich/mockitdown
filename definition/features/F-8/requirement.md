---
id: F-8
title: Realistic, framework-matched HTML rendering
status: active
version: 0.6.0
rev: 1
page: FEAT.2
slot: features
order: 1
family: rendering
source: [SRC-2, SRC-3, SRC-9]
hash: 59235272ab8d
---

G1: A rendered mockup must be a convincing picture of the screen in the chosen framework, not a box diagram.
C1: Each mockup renders as styled HTML and CSS whose components imitate the chosen framework's components, typography, spacing, colours and states.
C2: Rendering needs no framework runtime, JavaScript, web fonts or network access; the result is static and identical on every build.
C3: Controls show the state the author describes (on/off, selected, disabled, error, progress values, presented alerts and sheets) without being interactive.
C4: Text in a mockup supports SwiftUI's inline Markdown (bold, italic, code, strike-through, links).
C5: A mockup never affects the host page's styling, and the host page's styling does not distort the mockup.
C6: Rendered mockups are accessible to assistive technology as figures with a label, with roles on controls.
AC1: Building the same page twice produces byte-identical mockup HTML.
AC2: A mockup renders correctly with the browser offline.
AC3: A rendered page contains no `<script>` produced by mockitdown.
C7: A mockup never paints one element over another unless the author layers them: siblings in a row keep their natural size, and text that does not fit is truncated or wrapped as the framework would.
C8: An element shown on its own, shrink-wrapped to its content (never narrower than that content; a narrower host scrolls), is drawn whole, including a presented surface (alert, dialog, sheet, popover, toast, tooltip) with the area it covers.
C9: Shapes and charts follow the framework's geometry: a circle in a wider frame is a circle centred in it, and every chart kind draws its marks from the data it is given.
AC4: In the pack gallery, no element sample of any pack shows two controls or labels overlapping.
AC5: An alert, confirmation dialog, dialog, sheet, popover, toast or tooltip rendered alone at `device="fit"` shows its whole surface, with its title, content and actions.
AC6: `Circle().frame(width: 160, height: 96)` renders a 96-point circle; scatter, bubble, heatmap and candlestick charts given only `values:` draw marks.
