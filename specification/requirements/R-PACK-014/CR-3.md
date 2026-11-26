---
id: R-PACK-014.CR-3
target: R-PACK-014
kind: revision
version: 0.8.6
date: 2026-11-25
issue: 11
summary: "as built: ControlGroup menu label and icon, field time, gauge labels when given; date components and wheel columns, tagged picker options, List selection, columns labels for text fields (C9-C13)"
from: 2cbf54d1522b
to: eb7aa90e53d3
---

## Clauses

@ C1 edit
~ `ControlGroup` in the `swiftui` pack MUST render `.automatic` as a joined Liquid Glass capsule of its buttons, `.navigation` as a joined capsule of icon-only buttons, `.palette` as a row of borderless icon buttons, and `.compactMenu` and `.menu` as one button (the group's label {+and `systemImage:`, +}or an ellipsis glyph; `.menu` with a trailing chevron) that stands for a menu.
@ C2 edit
~ `DatePicker` MUST show a selection even without `selection:` (fixed default 23 Nov 2026, 9:41 AM, for deterministic output); `.automatic`/`.compact` MUST render the label and grey capsules holding the date (`Nov 23, 2026`) and, unless `displayedComponents: .date`, the time; `.graphical` a month calendar (month title with chevrons, weekday initials, a 7-column day grid, the selected day in a filled accent circle) whose width fits its frame; `.wheel` wheel columns with a selection band; `.field` (macOS) a text field [-`11/23/2026`;-]{+`11/23/2026` (followed by `, 9:41 AM` unless `displayedComponents: .date`);+} `.stepperField` that field with a stepper.
@ C4 edit
~ `Gauge` MUST default to `.automatic` (a linear track with the value filled and its current value, minimum and maximum [-labels),-]{+labels, each label shown when the gauge gives it),+} render `.accessoryCircular` as an open 240° ring with the current value in its centre, `.accessoryCircularCapacity` as a closed ring filled to the value with the value in its centre, `.accessoryLinear` as a thin track with a dot marker at the value, `.accessoryLinearCapacity` as a thicker capsule filled to the value, and `.linearCapacity` as a full-width capsule filled to the value with the label above.
@ C9 insert after C8
+ `displayedComponents: .date` MUST hide a `DatePicker`'s time and `.hourAndMinute` its date; a `selection:` MAY carry a time (`2026-11-23T14:05`), shown in place of 9:41 AM.
@ C10 insert after C9
+ `DatePicker` `.wheel` MUST show one column per part — weekday with month and day, hour, minute and AM/PM for a date and time; month, day and year for a date alone; hour, minute and AM/PM for a time alone — each with up to two neighbours either side of the selection.
@ C11 insert after C10
+ A `Picker` option MAY be any child with `.tag(…)`; a `selection:` matching a tag MUST select that option and show its content.
@ C12 insert after C11
+ `List(selection:)` MUST mark the row whose text or tag equals the selection, and `.sidebar` and `.bordered` MUST draw that row as selected.
@ C13 insert after C12
+ In `Form` `.columns`, a filled `TextField` MUST be labelled by its title (the placeholder argument) in the labels column.

## Files

```diff
--- a/TC-1.md
+++ b/TC-1.md
@@ -3,5 +3,5 @@
 title: SwiftUI control variants
-verifies: [C1, C2, C3, C4, C5, C6, C7, C8]
+verifies: [C1, C2, C3, C4, C5, C6, C7, C8, C9, C10, C11, C12, C13]
 ---
 
-Python and TypeScript render tests (conformance cases) per element and variant asserting the listed parts (e.g. graphical DatePicker has 7 weekday cells and one selected day; Picker .segmented has one segment per option; Gauge default is a linear track).
+Python and TypeScript render tests (conformance cases) per element and variant asserting the listed parts (e.g. graphical DatePicker has 7 weekday cells and one selected day; Picker .segmented has one segment per option; Gauge default is a linear track). Implemented as IT-19 (`python/tests/test_swiftui_controls.py` and the `control-*` conformance cases).
--- a/prose.md
+++ b/prose.md
@@ -3 +3,10 @@
 follow Apple's iOS 26 and macOS 26 design resources.
+
+As built (#11): the styles are CSS in the `swiftui` pack over role markup that both renderers emit.
+Where a style needs parts the generic markup lacks, the renderers draw them for the SwiftUI style names
+only: one menu button for a `.compactMenu`/`.menu` control group, the date and time capsules, the
+`.wheel` columns and the field stepper of a date picker, the open arc of an `.accessoryCircular` gauge,
+the dot of an `.accessoryLinear` gauge and the bounds of any gauge, and the wheel of a picker. A wheel
+shows the selection with two neighbours on each side, the way the iOS wheel shows five rows. A text
+field keeps its title as its accessible name when its text replaces the placeholder, which is what the
+macOS columns form shows as the row's label.
```
