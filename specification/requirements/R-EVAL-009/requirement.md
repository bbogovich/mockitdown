---
id: R-EVAL-009
title: Modifiers
status: active
version: 0.2.0
rev: 0
page: LANG.2
slot: reqs
order: 9
source: [SRC-2, SRC-3]
realizes: [F-2, F-3]
constrained_by: [A-EVAL-1, A-PACK-1, M-VIEW-2]
decisions: [ADR-4]
reverse_engineered: true
hash: 1cf7e4fd01d5
---

C1: When a modifier call `.name(…)` is applied to views, the evaluator MUST evaluate the base expression first and apply the modifier to every view the base produced.
C2: When the selected pack's modifier map has an entry for the modifier, the evaluator MUST set the view attribute the entry names (`attr`, default the modifier's name) to the entry's fixed `value` if it has one, else to the first positional argument, else to the first labelled argument's value, else to `true`; an enum value MUST be stored as its name.
C3: When the modifier is not in the pack's map but is a rendered modifier, the evaluator MUST record it on the view with its positional arguments, labelled arguments, unlabelled trailing-closure content and labelled closure slots.
C4: The rendered modifiers MUST be: `padding` `frame` `offset` `zIndex` `font` `fontWeight` `bold` `italic` `underline` `strikethrough` `monospaced` `fontDesign` `foregroundStyle` `foregroundColor` `background` `tint` `accentColor` `opacity` `cornerRadius` `clipShape` `shadow` `border` `fill` `stroke` `multilineTextAlignment` `textCase` `imageScale` `resizable` `aspectRatio` `scaledToFit` `scaledToFill` `hidden` `lineLimit` `id` `ref` `class` `badge` `help` `overlay` `navigationTitle` `navigationSubtitle` `navigationBarTitleDisplayMode` `toolbar` `tabItem` `searchable` `alert` `sheet` `confirmationDialog` `popover` `fullScreenCover` `inspector` `labelsHidden`.
C5: When the modifier is neither in the pack's map nor rendered but is one of the behaviour-only modifiers listed in the language reference, the evaluator MUST ignore it silently.
C6: If the modifier is unknown, then the evaluator MUST warn "unknown modifier .name() is ignored" with code `modifier` and leave the views unchanged.
C7: For a recorded modifier, a closure-valued labelled argument MUST become a slot of that label (except `action` and `perform`, which are discarded), and when there is no trailing closure, the first view-list positional argument or a view-list `content:` argument MUST become its content.
V1: In a pack whose map has `buttonStyle → {attr: variant}`, `.buttonStyle(.borderedProminent)` sets `variant="borderedProminent"`; `.onTapGesture { }` is silent; `.wobble()` warns; `.padding(8)` is recorded and rendered as padding.
