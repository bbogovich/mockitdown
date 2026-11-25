---
id: F-3
title: Framework design packs
status: active
version: 0.6.0
rev: 2
page: FEAT.1
slot: features
order: 3
family: authoring
source: [SRC-2, SRC-3, SRC-9]
hash: f600a5fc06bb
---

G1: A mockup must look like the framework the final application is built with, so reviewers judge a realistic screen rather than a generic wireframe.
C1: A design pack provides the element vocabulary, design tokens, device chrome and stylesheet of one UI framework.
C2: Packs are shipped for a neutral wireframe, SwiftUI, Windows with Fluent design (WinUI 3), Material UI (current major version), Angular Material, SAPUI5 (Fiori), Bootstrap and shadcn/ui.
C3: Each framework pack offers the framework's native component names (for example Fluent's `InfoBar`) in addition to the portable core vocabulary shared by all packs.
C4: Each framework pack covers as many of the framework's components as practical, so most screens of a real application can be expressed.
C5: The pack is chosen per mockup by a fence attribute, by an `import <Module>` line in the block, by the `@Screen(pack:)` directive, or by the site's default.
C6: Further frameworks can be added as packs without changing the notation; the example site's roadmap page lists the recommended next ones.
AC1: The same block written with core elements renders in every shipped pack, each time in that framework's visual style.
AC2: Every element a pack lists renders without an error.
AC3: `import SwiftUI` at the top of a block selects the SwiftUI pack.
N1: "Packs" were called "kits" in the prototype (base, swift, fiori).
C7: The SwiftUI pack follows Apple's current platform design (iOS 26, iPadOS 26, macOS 26) for each style it offers, so that each `.…Style(…)` variant looks like the native style rather than a relabelled default.
AC4: Every variant of the SwiftUI pack's ControlGroup, DatePicker, Form, Gauge, List, Picker, TabView and Toggle, and its Alert, ConfirmationDialog, NavigationSplitView, Popover, Sheet and Tab, renders recognisably as the native SwiftUI style it names.
