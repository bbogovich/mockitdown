A real screen never paints siblings over each other (SRC-9): when a row runs out of room SwiftUI
wraps or truncates its text, and the controls keep their size.

**As built.** In an `HStack`, toolbar or labelled row every child but text, spacers and fillers
(`maxWidth: .infinity`) keeps `min-width: min-content`; text is `overflow-wrap: break-word`, so it wraps
at word boundaries first and breaks a long word only when it must. At `fit` a `MessageBubble` takes a
conversation's width (300 points) so that its 75 % bubble holds a short text on one line and wraps a
long one. Segments of a control group that share a border, and avatar stacks, overlap by a negative
margin on purpose; the geometry test leaves those pairs out.
