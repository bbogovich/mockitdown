Frameworks spell the same idea differently (`PlaceholderText`, `placeholder`, `hint`); aliases let each pack accept its own framework's names.

**As built (issue #8).** A pack's `params` name a framework's own argument (`Dialog(header:)` in
PrimeVue, `Toast(summary:)`), and its `attrs` map that name onto the attribute the render role reads.
Until 0.8.1 the map was applied to labelled arguments only, so `Dialog("Edit")` in `prime` lost its
title; 26 elements in eight packs were affected.
