The order goes from the most specific to the most general: the page author's fence attribute,
then what the code itself says, then site policy. `import SwiftUI` is what a pasted Swift file
already contains, so SwiftUI code selects the SwiftUI pack with no extra attribute.

**Re-checked at specification 0.10.7.** Its prerequisites were re-checked after the renderer split (#48, #49) and the gallery spec split (#50) without any change to an obligation; neither is this item changed.
