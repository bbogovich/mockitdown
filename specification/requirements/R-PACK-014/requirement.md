---
id: R-PACK-014
title: SwiftUI control styles
status: active
version: 0.8.5
rev: 2
page: PACK.1
slot: reqs
order: 999
source: [SRC-9]
realizes: [F-3]
constrained_by: [A-PACK-2]
requires: [R-REND-013, R-PACK-013]
hash: 2cbf54d1522b
refs: [R-PACK-013, R-REND-013]
---

C1: `ControlGroup` in the `swiftui` pack MUST render `.automatic` as a joined Liquid Glass capsule of its buttons, `.navigation` as a joined capsule of icon-only buttons, `.palette` as a row of borderless icon buttons, and `.compactMenu` and `.menu` as one button (the group's label or an ellipsis glyph; `.menu` with a trailing chevron) that stands for a menu.
C2: `DatePicker` MUST show a selection even without `selection:` (fixed default 23 Nov 2026, 9:41 AM, for deterministic output); `.automatic`/`.compact` MUST render the label and grey capsules holding the date (`Nov 23, 2026`) and, unless `displayedComponents: .date`, the time; `.graphical` a month calendar (month title with chevrons, weekday initials, a 7-column day grid, the selected day in a filled accent circle) whose width fits its frame; `.wheel` wheel columns with a selection band; `.field` (macOS) a text field `11/23/2026`; `.stepperField` that field with a stepper.
C3: `Form` MUST render `.automatic` and `.grouped` as inset rounded sections on the grouped background with each row's label leading and control trailing, and `.columns` (macOS) as two columns — trailing-aligned labels, leading-aligned controls — without section backgrounds.
C4: `Gauge` MUST default to `.automatic` (a linear track with the value filled and its current value, minimum and maximum labels), render `.accessoryCircular` as an open 240° ring with the current value in its centre, `.accessoryCircularCapacity` as a closed ring filled to the value with the value in its centre, `.accessoryLinear` as a thin track with a dot marker at the value, `.accessoryLinearCapacity` as a thicker capsule filled to the value, and `.linearCapacity` as a full-width capsule filled to the value with the label above.
C5: `List` MUST render `.insetGrouped` as rounded sections inset 16 points on the grouped background, `.grouped` as full-width sections on the grouped background, `.inset` as rounded inset rows on the plain background, `.plain` as full-width rows with separators inset 16 points, `.sidebar` as a source list (section headers, rows with icons, the selected row an accent-tinted rounded highlight; translucent on macOS), and `.bordered` (macOS) as a bordered box with alternating row backgrounds.
C6: `Picker` MUST render its options from its children (`Text`, or any view with `.tag`) and mark the `selection:` (default: the first); `.menu`/`.automatic` as the label leading and the selected option with an up-down chevron in the accent colour trailing; `.segmented` as a segmented control of the options; `.inline` as rows with a checkmark on the selected; `.radioGroup` (macOS) as radio buttons; `.wheel` as a wheel with the selection band; `.navigationLink` as a row with the label, the selected option in secondary colour and a chevron; `.palette` as a row of the options with the selected one highlighted. A picker with no options MUST show its label and an empty value, never an empty box.
C7: `Toggle` MUST render `.automatic`/`.switch` as the label leading and a 51 × 31 switch trailing (green when on), `.button` as a capsule button tinted when on, and `.checkbox` (macOS) as a checkbox followed by the label.
C8: `Button` variants MUST each keep their natural width (R-REND-013; the joined capsules of C1 are a deliberate overlap under R-REND-013.C5); `.glass` and `.glassProminent` MUST render as Liquid Glass capsules (translucent, light edge, soft shadow; prominent tinted with the accent).
V1: Each variant of each element above, built from its declared sample (R-PACK-013.C4), renders at `fit` with its listed parts present (checked by markup assertions) and, in the gallery, without overlapping boxes.
