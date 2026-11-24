---
id: F-9
title: Light and dark appearance
status: active
version: 0.2.0
rev: 0
page: FEAT.2
slot: features
order: 2
family: rendering
source: [SRC-2]
hash: 38d480f590a4
---

G1: Applications ship light and dark modes, and documentation sites have their own light/dark toggle; mockups must show both and fit the page.
C1: Every pack defines light and dark colours.
C2: A mockup renders light, dark, automatically following the documentation page's colour scheme, or both side by side.
C3: The automatic mode follows the Material/Zensical palette toggle and, on other sites, the browser's colour-scheme preference.
AC1: `appearance="both"` shows two frames labelled Light and Dark.
AC2: With `appearance="auto"`, switching a Zensical site to its dark palette switches the mockup to the pack's dark colours without a rebuild.
