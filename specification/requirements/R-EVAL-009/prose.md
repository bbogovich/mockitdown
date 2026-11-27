Modifiers come in three kinds. Pack-mapped modifiers set attributes the pack's CSS keys on — the
same `.buttonStyle(.bordered)` becomes `data-variant="bordered"` in every pack. Rendered modifiers
are interpreted by the renderer (layout, typography, colour, navigation, presentation). Behaviour
modifiers have no visual effect and are accepted so that real SwiftUI code can be pasted.

**Re-checked at specification 0.10.7.** Its prerequisites were re-checked after the renderer split (#48, #49) and the gallery spec split (#50) without any change to an obligation; neither is this item changed.
