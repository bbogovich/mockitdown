---
id: F-8
title: Realistic, framework-matched HTML rendering
status: active
version: 0.2.0
rev: 0
page: FEAT.2
slot: features
order: 1
family: rendering
source: [SRC-2, SRC-3]
hash: 4678f891170f
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
<!-- file: prose.md -->
**Problem.** The prototype rendered either SVG boxes or real SAPUI5 web components loaded from a
CDN (SRC-3); neither gives a faithful, offline, deterministic picture for seven frameworks.

**Change.** Every pack is a static CSS replica of its framework, applied to one shared HTML markup.
Nothing runs in the browser, so pages stay fast, cacheable and safe.
<!-- file: usecases/UC-1.md -->
---
id: UC-1
title: Review a screen in a pull request preview
---

**Actor:** reviewer.

1. The reviewer opens the preview build of a changed specification page.

**Outcome:** the mockup looks like the target framework, renders without network access and
does not change when the page is rebuilt without source changes.
