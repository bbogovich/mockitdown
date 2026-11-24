---
id: F-3
title: Framework design packs
status: active
version: 0.2.0
rev: 0
page: FEAT.1
slot: features
order: 3
family: authoring
source: [SRC-2, SRC-3]
hash: 58f6a095adb2
---

G1: A mockup must look like the framework the final application is built with, so reviewers judge a realistic screen rather than a generic wireframe.
C1: A design pack provides the element vocabulary, design tokens, device chrome and stylesheet of one UI framework.
C2: Packs are shipped for a neutral wireframe, SwiftUI, Windows with Fluent design (WinUI 3), Material UI (current major version), Angular Material, SAPUI5 (Fiori), Bootstrap and shadcn/ui.
C3: Each framework pack offers the framework's native component names (for example Fluent's `InfoBar`) in addition to the portable core vocabulary shared by all packs.
C4: Each framework pack covers as many of the framework's components as practical, so most screens of a real application can be expressed.
C5: The pack is chosen per mockup by a fence attribute, by an `import <Module>` line in the block, by the `@Screen(pack:)` directive, or by the site's default.
C6: Further frameworks can be added as packs without changing the notation; Ant Design is the proposed next pack.
AC1: The same block written with core elements renders in every shipped pack, each time in that framework's visual style.
AC2: Every element a pack lists renders without an error.
AC3: `import SwiftUI` at the top of a block selects the SwiftUI pack.
N1: "Packs" were called "kits" in the prototype (base, swift, fiori).
<!-- file: prose.md -->
**Problem.** A wireframe does not show what the user will see; one hand-made style per project
does not scale to the frameworks teams actually use.

**Change.** A *pack* captures one framework: its component names, its colours and typography for
light and dark mode, its window or device chrome and its stylesheet. mockitdown ships packs for
SwiftUI, Fluent (WinUI 3), Material UI, Angular Material, SAPUI5 (Fiori), Bootstrap and shadcn/ui,
on top of a neutral wireframe pack every other pack extends.
<!-- file: usecases/UC-1.md -->
---
id: UC-1
title: Show the same screen in the target framework
---

**Actor:** designer.

1. The designer writes a settings form with `Form`, `Section`, `Toggle` and `Picker`.
2. The designer renders it with `pack="fluent"`, then with `pack="mui"`.

**Outcome:** the two figures show the same structure styled as a WinUI 3 settings page and as a
Material UI form respectively.
<!-- file: usecases/UC-2.md -->
---
id: UC-2
title: Use a framework-native component
---

**Actor:** developer of an SAPUI5 application.

1. The developer selects the SAPUI5 pack (an `import` of one of its module names, or
   `pack="sapui5"`) and uses the framework's own component names, such as an object page header.

**Outcome:** the mockup uses the Fiori Horizon look for those components; core elements in the same
block are styled to match.
