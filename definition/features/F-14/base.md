---
id: F-14
title: Example site as demo and end-to-end test
status: active
version: 0.2.0
rev: 0
page: FEAT.2
slot: features
order: 7
family: rendering
source: [SRC-2]
hash: 1891ad6a92f5
---

G1: Users need a working demonstration of every supported framework, and the project needs an end-to-end test that exercises the real documentation toolchain.
C1: The repository contains an example documentation site, built with Zensical, with one page per shipped framework pack.
C2: Each pack page shows user interfaces of varied complexity, from single controls to complete screens, following common UI design patterns of that framework.
C3: The site also demonstrates the language, custom components and imported libraries, images, appearance modes and the Elements table.
C4: Every mockup on the example site renders without errors or warnings, and the site builds; automated tests verify both.
AC1: The test suite converts every example page and fails on any mockitdown error or warning.
AC2: The test suite builds the example site with Zensical when it is installed.
AC3: Each shipped pack has its own page on the example site.
<!-- file: prose.md -->
**Problem.** A renderer for seven frameworks regresses easily; users need to see what each pack
can do before adopting it.

**Change.** `examples/site` is both the demo and the end-to-end fixture: one page per pack, a
language tour and a custom-components page, all checked by the test suite.
<!-- file: usecases/UC-1.md -->
---
id: UC-1
title: Evaluate whether a framework is supported well enough
---

**Actor:** developer choosing a tool.

1. The developer opens the example site's page for the framework the application uses.

**Outcome:** the developer sees simple controls, forms, lists, navigation and complete screens in
that framework's style, each with its source.
