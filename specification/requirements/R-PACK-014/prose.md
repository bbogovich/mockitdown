Each style must look like the native style it names (SRC-9, F-3.C7). The clauses list the visible
parts that make each style recognisable; colours, sizes and radii come from the pack's tokens, which
follow Apple's iOS 26 and macOS 26 design resources.

As built (#11): the styles are CSS in the `swiftui` pack over role markup that both renderers emit.
Where a style needs parts the generic markup lacks, the renderers draw them for the SwiftUI style names
only: one menu button for a `.compactMenu`/`.menu` control group, the date and time capsules, the
`.wheel` columns and the field stepper of a date picker, the open arc of an `.accessoryCircular` gauge,
the dot of an `.accessoryLinear` gauge and the bounds of any gauge, and the wheel of a picker. A wheel
shows the selection with two neighbours on each side, the way the iOS wheel shows five rows. A text
field keeps its title as its accessible name when its text replaces the placeholder, which is what the
macOS columns form shows as the row's label.

A selected table row wins over the Mac's alternating row stripes: the gallery's Mac example (#15) selects the second, striped row, which used to keep its stripe under white text.

Re-checked at 0.10.3 together with the items it cites or is cited by (specification audit, #51): the citations are still accurate and no obligation changed.
